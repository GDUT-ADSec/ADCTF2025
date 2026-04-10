; declare i8 @long_to_bytes(i1024, ptr, i8)
; declare i1024 @bytes_to_long(ptr, i8)
; declare i1024 @rsa_encrypt(i1024, i1024, i1024)
; declare i1024 @rsa_decrypt(i1024, i1024, i1024)

declare i1024 @mod(i1024, i1024)
declare i1024 @mul_mod(i1024, i1024, i1024)
declare i1024 @pow_mod(i1024, i1024, i1024)

define i8 @long_to_bytes(i1024 %arg, ptr %out, i8 %len) {
start:
  %flag = icmp eq i1024 %arg, 0
  br i1 %flag, label %end, label %then
then:
  %rest = udiv i1024 %arg, 256
  %written = call i8 @long_to_bytes(i1024 %rest, ptr %out, i8 %len)

  %writtable = icmp ult i8 %written, %len
  br i1 %writtable, label %write, label %end
write:
  %byte = urem i1024 %arg, 256
  %byte_i8 = trunc i1024 %byte to i8
  
  %write_to = getelementptr i8, ptr %out, i8 %written
  store i8 %byte_i8, ptr %write_to
  %total_written = add i8 %written, 1

  br label %end
end:
  %ret = phi i8 [0, %start], [%written, %then], [%total_written, %write]
  ret i8 %ret
}

define i1024 @bytes_to_long(ptr %data, i8 %len) {
entry:
  %result = alloca i1024, align 16
  store i1024 0, ptr %result, align 16
  
  %actual_len = call i8 @llvm.umin.i8(i8 %len, i8 128)
  
  br label %loop_cond

loop_cond:
  %i = phi i8 [ 0, %entry ], [ %i_next, %loop ]
  %cond = icmp ult i8 %i, %actual_len
  br i1 %cond, label %loop, label %end

loop:
  %byte_ptr = getelementptr i8, ptr %data, i8 %i
  %byte = load i8, ptr %byte_ptr, align 1
  
  %current = load i1024, ptr %result, align 16
  %moved = mul i1024 %current, 256
  %low8bit = zext i8 %byte to i1024
  %new = add i1024 %moved, %low8bit
  store i1024 %new, ptr %result, align 16
  
  %i_next = add i8 %i, 1
  br label %loop_cond

end:
  %ret = load i1024, ptr %result, align 16
  ret i1024 %ret
}

define i1024 @rsa_encrypt(i1024 %m, i1024 %e, i1024 %n) {
entry:
  %c = call i1024 @pow_mod(i1024 %m, i1024 %e, i1024 %n)
  ret i1024 %c
}

define i1024 @rsa_decrypt(i1024 %c, i1024 %d, i1024 %n) {
entry:
  %m = call i1024 @pow_mod(i1024 %c, i1024 %d, i1024 %n)
  ret i1024 %m
}
