<template>
  <div class="container">
    <header class="header">
      <h1>RickyOJ</h1>
      <p>转为 RickyLang 打造的 OJ</p>
    </header>

    <!-- 题目描述部分 -->
    <div class="problem-section">
      <h2>题目描述</h2>
      <div class="problem-content">
        <p>
          <strong>AutoLang</strong> 是<strong>時雨てる</strong>发明的通用编程语言。
          TA 为 AutoLang 实现了一个编译器，但是因为写得太💩了，目前已经在用 Rust 重写了。
          然而，旧版编译器被 RKK（Ricky） 偷走并公开了。
          TA 不想💩代码让自己丢脸，于是他声称旧版编译器是 RKK 写的，并说它其实是 RickyLang 编译器。
          为了报复 RKK，時雨てる搭建并公开了 RickyOJ，并把其中一块 RK 碎片放在里面。
        </p>
        <p>现在请你使用 RickyLang，实现下面的程序：</p>

        <div class="problem-statement">
          <p>打印杨辉三角。输入一行一个整数 n。输出杨辉三角的前 n 行。
            (<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML">
                  <semantics>
                    <mrow>
                      <mn>1</mn>
                      <mo>≤</mo>
                      <mi>n</mi>
                      <mo>≤</mo>
                      <mn>25</mn>
                    </mrow>
                    <annotation encoding="application/x-tex"> 1 \le n \le 25 </annotation>
                  </semantics>
                </math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut"
                    style="height:0.78041em;vertical-align:-0.13597em;"></span><span class="mord">1</span><span
                    class="mspace" style="margin-right:0.2777777777777778em;"></span><span class="mrel">≤</span><span
                    class="mspace" style="margin-right:0.2777777777777778em;"></span></span><span class="base"><span
                    class="strut" style="height:0.7719400000000001em;vertical-align:-0.13597em;"></span><span
                    class="mord mathdefault">n</span><span class="mspace"
                    style="margin-right:0.2777777777777778em;"></span><span class="mrel">≤</span><span class="mspace"
                    style="margin-right:0.2777777777777778em;"></span></span><span class="base"><span class="strut"
                    style="height:0.64444em;vertical-align:0em;"></span><span class="mord">2</span><span
                    class="mord">5</span></span></span></span>
            )
          </p>

          <div class="sample">
            <h4 style="margin-top: 2px;">样例输入：</h4>
            <pre>6</pre>
            <h4>样例输出：</h4>
            <pre>
1
1 1
1 2 1
1 3 3 1
1 4 6 4 1
1 5 10 10 5 1</pre>
          </div>

        </div>
        <p>
          隐秘故事：時雨てる为了出这题，翻出之前用 C++ 写的💩代码，加上了参数解析，顺便修好了十几个 bug（
        </p>
        <p class="problem-note">
          原题为 Luogu P5732
        </p>
      </div>
    </div>

    <!-- 代码编辑器部分 -->
    <div class="editor-section">
      <h2>代码编辑器</h2>
      <div class="editor-container">
        <ClientOnly>
          <MonacoEditor v-model="code" lang="rust" :options="editorOptions" class="editor">
            <div class="editor-loading">编辑器加载中...</div>
          </MonacoEditor>
        </ClientOnly>
      </div>

      <div class="editor-actions">
        <button @click="submitCode" :disabled="isSubmitting" class="submit-btn">
          {{ isSubmitting ? '提交中...' : '提交代码' }}
        </button>
        <button @click="resetCode" class="reset-btn">
          重置代码
        </button>
      </div>
    </div>

    <!-- 测评结果部分 -->
    <div class="result-section">
      <h2>运行结果</h2>
      <div class="result-container">
        <div v-if="result" class="result-output">
          <div :class="['result-status', result.status.toLowerCase()]">
            状态: {{ getStatusText(result.status) }}({{ result.status }})
          </div>
          <div v-if="result.message" class="result-message">
            {{ result.message }}
          </div>
          <pre v-if="result.output" class="output-text">{{ result.output }}</pre>
          <div v-if="result.time" class="execution-info">
            运行时间: {{ result.time }}ms
          </div>
        </div>
        <div v-else class="result-placeholder">
          提交代码后查看运行结果
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import '~~/node_modules/katex/dist/katex.css'
import type * as monaco from 'monaco-editor'

const logo = [
  '    ____  _      __         __                     ',
  '   / __ \\(_)____/ /____  __/ /   ____ _____  ____ _',
  '  / /_/ / / ___/ //_/ / / / /   / __ `/ __ \\/ __ `/',
  ' / _, _/ / /__/ ,< / /_/ / /___/ /_/ / / / / /_/ / ',
  '/_/ |_/_/\\___/_/|_|\\__, /_____/\\__,_/_/ /_/\\__, /  ',
  '                  /____/                  /____/   ',
];

// 响应式数据
const code = ref(
  `// 在这里输入 RickyLang 代码。
// RickyOJ 采用了和 VS Code 相同的编辑器组件，
// 因此推荐直接在 OJ 上写。（反正在哪都没高亮和补全）
// Powered By Monaco Editor
${logo.map(line => `// ${line}`).join('\n')}
`);

const isSubmitting = ref(false)
const result = ref<JudgeResult | null>(null)

// 编辑器配置
const editorOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
  automaticLayout: true,
  fontSize: 14,
  lineNumbers: 'on',
  minimap: { enabled: true },
  scrollBeyondLastLine: false,
  tabSize: 2,
  detectIndentation: false,
}

// 提交代码
const submitCode = async () => {
  if (!code.value.trim()) {
    alert('代码不能为空')
    return
  }

  isSubmitting.value = true
  result.value = null

  try {
    const response = await $fetch('/api/judge', {
      method: 'POST',
      body: {
        code: code.value,
        language: 'ricky'
      }
    })

    result.value = response
  } catch (error: any) {
    result.value = {
      status: 'ERROR',
      message: error.data?.message || '提交失败，请重试'
    }
  } finally {
    isSubmitting.value = false
  }
}

// 重置代码
const resetCode = () => {
  if (confirm('确定要重置代码吗？')) {
    code.value = `ZpwsIs9tjRqeFkSL5QrOcs1TPQw15jjw/pwNmDV+3Bi/kkbq+5I0wI5V`
    result.value = null
  }
}

// 获取状态文本
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'AC': '答案正确',
    'WA': '答案错误',
    'TLE': '时间超限',
    'MLE': '内存超限',
    'RE': '运行错误',
    'CE': '编译错误',
    'ERROR': '系统错误'
  }
  return statusMap[status] || status
}

// 类型定义
interface JudgeResult {
  status: 'AC' | 'WA' | 'TLE' | 'MLE' | 'RE' | 'CE' | 'ERROR'
  message?: string
  output?: string
  time?: number
  memory?: number
}
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.math {
  font-family: "Latin Modern Roman", "Times New Roman", serif;
  font-size: 1.1em;
  /* font-style: italic; */
  letter-spacing: 0.02em;
  padding: 2px 4px;
  background-color: #f8f8f8;
  border-radius: 3px;
}

.header {
  text-align: center;
  margin-bottom: 10px;
  border-bottom: 1px solid #eaeaea;
  padding-bottom: 20px;
}

.header h1 {
  color: #2c3e50;
  margin-bottom: 8px;
}

.header p {
  color: #7f8c8d;
  font-size: 16px;
}

.problem-section,
.editor-section,
.result-section {
  background: white;
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.problem-section h2,
.editor-section h2,
.result-section h2 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #2c3e50;
  font-size: 20px;
  border-bottom: 2px solid #3498db;
  padding-bottom: 10px;
}

.problem-content {
  line-height: 1.6;
  font-size: 15px;
}

.problem-statement {
  margin-top: 15px;
}

.problem-statement>p {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 15px;
}

.sample {
  margin: 25px 0;
  background: #f8f9fa;
  padding: 20px;
  border-radius: 6px;
  border-left: 4px solid #3498db;
}

.sample h4 {
  margin-bottom: 10px;
  color: #2c3e50;
  font-size: 15px;
}

.sample pre {
  background: #2c3e50;
  color: #ecf0f1;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.4;
  margin: 10px 0;
}

.problem-note {
  font-size: 14px;
  color: #7f8c8d;
  font-style: italic;
  text-align: center;
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px dashed #ddd;
}

.editor-container {
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 20px;
}

.editor {
  height: 90vh;
}

.editor-loading {
  padding: 20px;
  text-align: center;
  color: #7f8c8d;
  height: 450px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.editor-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.submit-btn,
.reset-btn {
  padding: 12px 30px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s;
  min-width: 120px;
}

.submit-btn {
  background: #3498db;
  color: white;
}

.submit-btn:hover:not(:disabled) {
  background: #2980b9;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(52, 152, 219, 0.3);
}

.submit-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.reset-btn {
  background: #e74c3c;
  color: white;
}

.reset-btn:hover {
  background: #c0392b;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(231, 76, 60, 0.3);
}

.result-container {
  min-height: 200px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  padding: 20px;
  background: #f8f9fa;
}

.result-placeholder {
  color: #7f8c8d;
  text-align: center;
  line-height: 160px;
  font-size: 16px;
}

.result-status {
  font-weight: bold;
  margin-bottom: 15px;
  padding: 8px 15px;
  border-radius: 6px;
  display: inline-block;
  font-size: 15px;
}

.result-status.ac {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.result-status.wa {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.result-status.ce {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.result-status.re,
.result-status.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.result-status.tle,
.result-status.mle {
  background: #e2e3e5;
  color: #383d41;
  border: 1px solid #d6d8db;
}

.result-message {
  margin-bottom: 15px;
  padding: 12px 15px;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 6px;
  color: #856404;
  font-size: 14px;
}

.output-text {
  background: #2c3e50;
  color: #ecf0f1;
  padding: 20px;
  border-radius: 6px;
  overflow-x: auto;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.5;
  margin: 15px 0;
  max-height: 300px;
  overflow-y: auto;
}

.execution-info {
  margin-top: 15px;
  font-size: 14px;
  color: #7f8c8d;
  text-align: right;
}

@media (max-width: 768px) {
  .container {
    padding: 15px;
    gap: 20px;
  }

  .problem-section,
  .editor-section,
  .result-section {
    padding: 20px;
  }

  .editor {
    height: 350px;
  }

  .editor-loading {
    height: 350px;
  }

  .editor-actions {
    flex-direction: column;
    gap: 10px;
  }

  .submit-btn,
  .reset-btn {
    width: 100%;
  }
}
</style>
