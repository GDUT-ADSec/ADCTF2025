; declare i32 @getchar()
; declare i32 @putchar(i32)
; declare i1024 @read_int()
; declare void @put_int(i1024)
; declare void @put_str(ptr, i64)
; declare void @endl()

declare i32 @getchar()
declare i32 @putchar(i32)

define i1 @is_digit(i32 %arg) {
  %ge = icmp uge i32 %arg, 48
  %le = icmp ule i32 %arg, 57
  %ret = and i1 %ge, %le
  ret i1 %ret
}

define i1024 @read_int_impl(i1024 %arg) {
  %ch = call i32 @getchar()
  %flag = call i1 @is_digit(i32 %ch)
  br i1 %flag, label %tru, label %fls
tru:
  %val = zext i32 %ch to i1024
  %digit = sub i1024 %val, 48
  %moved = mul i1024 %arg, 10
  %new = add i1024 %digit, %moved
  %ret = call i1024 @read_int_impl(i1024 %new)
  ret i1024 %ret
fls:
  ret i1024 %arg
}

define i1024 @read_int() {
  %ret = call i1024 @read_int_impl(i1024 0)
  ret i1024 %ret
}

define void @put_int_impl(i1024 %arg) {
  %flag = icmp ult i1024 %arg, 1
  br i1 %flag, label %end, label %then
end:
  ret void
then:
  %rest = udiv i1024 %arg, 10
  call void @put_int_impl(i1024 %rest)
  %digit = urem i1024 %arg, 10
  %digit_i32 = trunc i1024 %digit to i32
  %ch = add i32 48, %digit_i32
  call i32 @putchar(i32 %ch)
  ret void
}

define void @put_int(i1024 %arg) {
  %flag = icmp ult i1024 %arg, 1
  br i1 %flag, label %zero, label %nonzero
zero:
  call void @putchar(i32 48)
  ret void
nonzero:
  call void @put_int_impl(i1024 %arg)
  ret void
}

define void @put_str(ptr %str, i64 %len) {
entry:
  br label %loop_cond

loop_cond:
  %i = phi i64 [ 0, %entry ], [ %i_next, %loop ]
  %cond = icmp ult i64 %i, %len
  br i1 %cond, label %loop, label %end

loop:
  %byte_ptr = getelementptr i8, ptr %str, i64 %i
  %byte = load i8, ptr %byte_ptr, align 1

  %ch = zext i8 %byte to i32
  call i32 @putchar(i32 %ch)
  
  %i_next = add i64 %i, 1
  br label %loop_cond

end:
  ret void
}

define void @endl() {
  call i32 @putchar(i32 10)
  ret void
}
