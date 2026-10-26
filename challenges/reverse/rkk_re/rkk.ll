declare i32 @getchar()
declare i32 @putchar(i32)
declare i1024 @read_int()
declare void @put_int(i1024)
declare void @put_str(ptr, i64)
declare void @endl()

declare i8 @long_to_bytes(i1024, ptr, i8)
declare i1024 @bytes_to_long(ptr, i8)
declare i1024 @rsa_encrypt(i1024, i1024, i1024)
declare i1024 @rsa_decrypt(i1024, i1024, i1024)

@prompt.1 = constant [60 x i8] c"想要救出 RKK 吗？请根据以下线索还原 RK 碎片"
@prompt.2 = constant [34 x i8] c"还原成功，RKK 给了你奖励"
@prompt.3 = constant [30 x i8] c"还原失败，你失去了 RK"

@env_name = constant [11 x i8] c"A1CTF_FLAG\00"
declare ptr @getenv(ptr)
declare i32 @puts(ptr)

; @flag = constant [37 x i8] c"flag{W0w!! You'really a LLVM expert!}"
; @flag = constant i1024 50937517511031233979094237899802760762850973352004014620420567882776114313498899411902845
; @rk = constant [42 x i8] c"flag{ZhbW\F4\EfA\E2\F9\DD,\AA\F6p\22\1Cr$\E59\E4\CC\FBc\97\A6G\88^\18\C4\BC7\DD!\D1\03"
; @rk = constant i1024 56006392793424056710164699062275263528674625147393631322516228556448592298240077643142809885083816195
@buf = global [128 x i8] zeroinitializer

define i32 @main() {
  call void @put_str(ptr @prompt.1, i64 60)
  call void @endl()

  %rk = add i1024 0, 50093593588819423331189071765202296536409271891672340451089785947482843111840165476204354521623134902831420684216557419881737996041911126435617638780798125209732712107020931421310836366112304637011341880498944406952778591038003645699711901777005617114902655266221060521323711511268200133064005354083864885063
  call void @put_int(i1024 %rk)
  call void @endl()

  call i32 @putchar(i32 62)
  call i32 @putchar(i32 32)
  call void @endl()

  %m = call i1024 @read_int()
  
  %c = call i1024 @rsa_decrypt(
    i1024 %m,
    i1024 65537,
    i1024 65205311769270045843821455551611958038892681780954069333592428054800936069675765975343881132391774744738967302356370420053834657734962834691573168614075011195517729936118612404864070598859932131077945243763097704091433317445234555993917463465115282944719407894097965379598428602341778083071176886766010058303
  )

  %cond = icmp eq i1024 %c, %rk
  br i1 %cond, label %right, label %wrong

right:
  call void @put_str(ptr @prompt.2, i64 34)
  call void @endl()

  %flag = call ptr @getenv(ptr @env_name)
  call i32 @puts(ptr %flag)

  ret i32 0

wrong:
  call void @put_str(ptr @prompt.3, i64 30)
  call void @endl()

  ret i32 1
}
