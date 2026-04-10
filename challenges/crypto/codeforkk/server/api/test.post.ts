import { $ } from 'bun';
import type { H3Event } from 'h3'

const memory = '88553000371389235596512914559880747992791869457366984631056959613521220905648933679652874653395679357';

interface TestResult {
  status: 'success' | 'error' | 'tle'
  title: string
  time: number
  memory: string
  message?: string
  flag?: string
}

export default defineEventHandler(async (event: H3Event): Promise<TestResult> => {
  const config = useRuntimeConfig()
  const maxFileSize = config.public.maxFileSize
  const timeLimit = 2000
  const flag = config.public.flag

  try {
    const formData = await readFormData(event)
    const file = formData.get('file') as File

    if (!file) {
      throw createError({
        statusCode: 400,
        statusMessage: '没有上传文件'
      })
    }

    // 检查文件大小
    if (file.size > maxFileSize) {
      throw createError({
        statusCode: 400,
        statusMessage: `文件大小超过限制 (${maxFileSize / 1024 / 1024}MB)`
      })
    }

    // 读取文件内容
    const fileBuffer = await file.arrayBuffer()
    // const inputData = new TextDecoder().decode(fileBuffer)

    // 这里调用你的本地测试程序
    const result = await testWithVulnerableCode(fileBuffer)

    // 检查是否 TLE
    if (result > timeLimit) {
      return {
        status: 'tle',
        title: 'Time Limit Exceeded',
        time: result,
        memory,
        message: `程序运行时间超过限制 (${timeLimit}ms)`,
        flag: flag
      }
    }

    return {
      status: 'success',
      title: 'Accepted',
      time: result,
      memory,
      message: '程序正常运行完成'
    }

  } catch (error: any) {
    if (error instanceof $.ShellError) {
      return {
        status: 'error',
        title: 'Input Data Error',
        time: 0,
        memory,
        message: error.stderr.toString(),
      }
    }

    return {
      status: 'error',
      title: 'Runtime Error',
      time: 0,
      memory,
      message: error.message || '测试过程中发生未知错误'
    }
  }
})

// 这里调用你的本地被 hack 代码
async function testWithVulnerableCode(input: ArrayBuffer): Promise<number> {
  const file = Bun.file('./data.in');
  if (await file.exists()) {
    await file.delete()
  }
  Bun.write('./data.in', input);

  // 模拟测试过程 - 在实际环境中替换为实际调用
  const startTime = Date.now()

  // 模拟程序执行 - 这里应该是实际调用你的 C++ 程序
  // await new Promise(resolve => setTimeout(resolve, Math.random() * 1500 + 500))
  // console.log(file)
  await $`./victim`.quiet();

  const endTime = Date.now()
  const executionTime = endTime - startTime

  // return {
  //   time: executionTime,
  //   memory: Math.floor(Math.random() * 1000) + 100
  // }

  // console.log(new TextDecoder().decode(input))

  return executionTime;
}
