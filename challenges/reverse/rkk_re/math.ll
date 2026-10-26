; declare i1024 @mod(i1024, i1024)
; declare i1024 @mul_mod(i1024, i1024, i1024)
; declare i1024 @pow_mod(i1024, i1024, i1024)

define i1024 @mod(i1024 %a, i1024 %b) {
entry:
  %result = urem i1024 %a, %b
  ret i1024 %result
}

define i1024 @mul_mod(i1024 %a, i1024 %b, i1024 %m) {
entry:
  %a_ext = zext i1024 %a to i2048
  %b_ext = zext i1024 %b to i2048
  %m_ext = zext i1024 %m to i2048
  
  %mul_ext = mul i2048 %a_ext, %b_ext
  
  %mod_ext = urem i2048 %mul_ext, %m_ext
  
  %result = trunc i2048 %mod_ext to i1024
  ret i1024 %result
}

define i1024 @pow_mod(i1024 %base, i1024 %exp, i1024 %modulus) {
entry:
  %result_ptr = alloca i1024
  %base_ptr = alloca i1024
  %exp_ptr = alloca i1024
  
  store i1024 1, i1024* %result_ptr
  %base_mod = urem i1024 %base, %modulus
  store i1024 %base_mod, i1024* %base_ptr
  store i1024 %exp, i1024* %exp_ptr
  
  br label %while_cond

while_cond:
  %exp_val = load i1024, i1024* %exp_ptr
  %cmp = icmp ugt i1024 %exp_val, 0
  br i1 %cmp, label %while_body, label %while_end

while_body:
  %exp_odd = and i1024 %exp_val, 1
  %is_odd = icmp eq i1024 %exp_odd, 1
  br i1 %is_odd, label %if_then, label %if_else

if_then:
  %result_val = load i1024, i1024* %result_ptr
  %base_val = load i1024, i1024* %base_ptr
  %new_result = call i1024 @mul_mod(i1024 %result_val, i1024 %base_val, i1024 %modulus)
  store i1024 %new_result, i1024* %result_ptr
  br label %if_end

if_else:
  br label %if_end

if_end:
  %base_val2 = load i1024, i1024* %base_ptr
  %new_base = call i1024 @mul_mod(i1024 %base_val2, i1024 %base_val2, i1024 %modulus)
  store i1024 %new_base, i1024* %base_ptr
  
  %new_exp = lshr i1024 %exp_val, 1
  store i1024 %new_exp, i1024* %exp_ptr
  
  br label %while_cond

while_end:
  %final_result = load i1024, i1024* %result_ptr
  ret i1024 %final_result
}
