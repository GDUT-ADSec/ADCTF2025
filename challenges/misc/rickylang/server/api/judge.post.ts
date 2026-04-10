import { rm } from "node:fs/promises";
import { $ } from 'bun';

$.cwd('/tmp');

function processUserOutput(output: string): number[][] {
  const lines = output.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0); // 移除空行

  const result: number[][] = [];

  for (const line of lines) {
    // 分割数字，允许任意数量的空格
    const numbers = line.split(/\s+/)
      .map(num => num.trim())
      .filter(num => num.length > 0)
      .map(num => parseInt(num, 10));

    // 检查是否所有元素都是有效的数字
    if (numbers.some(isNaN)) {
      return []; // 包含非数字，直接返回空数组表示无效
    }

    result.push(numbers);
  }

  return result;
}

function compareLine(correctLine: number[], userLine: number[]): boolean {
  if (correctLine.length !== userLine.length) {
    return false;
  }

  for (let i = 0; i < correctLine.length; i++) {
    if (correctLine[i] !== userLine[i]) {
      return false;
    }
  }

  return true;
}

interface JudgeRequest {
  code: string
  language: string
}

interface JudgeResponse {
  status: 'AC' | 'WA' | 'TLE' | 'MLE' | 'RE' | 'CE' | 'ERROR'
  message?: string
  output?: string
  time?: number
  memory?: number
}

export default defineEventHandler(async (event) => {
  const body = await readBody<JudgeRequest>(event)

  // 验证请求数据
  if (!body.code || !body.language) {
    throw createError({
      statusCode: 400,
      statusMessage: '代码和语言类型不能为空'
    })
  }

  if (body.language !== 'ricky') {
    throw createError({
      statusCode: 400,
      statusMessage: '只支持 RickyLang'
    })
  }

  try {
    const judgeResult = await judgeCode(body.code)

    return judgeResult
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: `评测系统错误: ${error.message}`
    })
  }
})

const count = 25;

const answer = ((n: number) => {
  const triangle: number[][] = [];
  for (let i = 0; i < n; i++) {
    const row: number[] = [];
    for (let j = 0; j <= i; j++) {
      if (j === 0 || j === i) {
        row.push(1);
      } else {
        row.push(triangle[i - 1][j - 1] + triangle[i - 1][j]);
      }
    }
    triangle.push(row);
  }
  return triangle;
})(count);

function judge(n: number, lines: string[]): boolean {
  if (lines.length != n) return false;
  for (const [i, line] of lines.entries()) {
    const nums = line.trim().split(/\s+/);
    for (const [j, ans] of answer[i].entries()) {
      if (`${ans}` != nums[j].trim()) {
        return false;
      }
    }
  }
  return true;
}

// 模拟评测函数 - 这里由你来实现实际的评测逻辑
async function judgeCode(code: string): Promise<JudgeResponse> {
  // if (Bun.file('./runtime/code').ex)
  await rm('./rickylang', { recursive: true, force: true });

  await Bun.sleep(1000)

  await Bun.write('/tmp/rickylang/code.rl', code);

  // TODO: 调用你的 RickyLang 编译器
  try {
    await $`autofront rickylang/code.rl > rickylang/ir.ll`.quiet();
  } catch (e) {
    if (!(e instanceof $.ShellError)) throw e;
    const { stderr, exitCode } = e;
    return {
      status: 'CE',
      message: `AutoFront 编译失败。退出代码：${exitCode}。`,
      output: stderr.toString(),
    }
  }

  try {
    await $`clang -Wno-override-module rickylang/ir.ll -o rickylang/exe`.quiet();
  } catch (e) {
    if (!(e instanceof $.ShellError)) throw e;
    const { stderr, exitCode } = e;
    return {
      status: 'CE',
      message: `LLVM 编译失败。退出代码：${exitCode}。此失败为预期之外的错误，发生自 LLVM IR 编译阶段。可能系 RickyLang Bug 所致，也可能是由于其他原因。`,
      output: stderr.toString(),
    }
  }

  for (let n = 1; n <= count; ++n) {
    try {
      const input = new Response(`${n}`);
      const { stdout } = await $`./rickylang/exe < ${input}`.quiet();
      const output = stdout.toString();
      const lines = output.trim().split('\n');
      if (!judge(n, lines)) {
        return {
          status: 'WA',
          message: `别笑，你来你也过不了第 ${n} 关`,
          output,
        }
      }
    } catch (e) {
      if (!(e instanceof $.ShellError)) throw e;
      const { stderr, exitCode } = e;
      return {
        status: 'RE',
        message: `退出代码：${exitCode}。`,
        output: stderr.toString(),
      }
    }
  }

  return {
    status: 'AC',
    message: '编译通过',
    output: process.env.A1CTF_FLAG,
  };
}
