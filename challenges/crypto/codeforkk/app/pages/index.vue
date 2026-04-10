<template>
  <div class="container">
    <header class="header">
      <h1>Codeforkk</h1>
      <p>吹起反攻時雨てる的号角！</p>
      <p style="display: none;">
        b'\xa1\xf1\xa6\x17\x99\x1cHP\x1d\x9c\xd5\x88!\x87p\\m\x8f\xdb$\x18m\x15\xea\xca\xe0\xccM2x\x9b~\xc3\x7fn"Z\xf7\xcd\xddx}'
      </p>
    </header>

    <div class="content">
      <section class="description-section">
        <h2>Codeforkk 的由来和前情提要</h2>
        <div class="description-content">
          <p>
            RKK 为了报复時雨てる先前把 ta 做成 AI 还出进题目里，特地搭建了 Codeforkk 平台。
            時雨てる果然中招！安全意识薄弱的 ta 在 Codeforkk 上提交了一段有漏洞的代码！
            为了一雪前耻，请你帮助 RKK，对 ta 的代码发起攻击吧！
          </p>
        </div>
      </section>

      <section class="description-section">
        <h2>题目描述</h2>
        <div class="description-content">
          <p>
            RKK 有时幻想自己是复读机，而他事后表示此事从未发生过。
            为了证明这件事，時雨てる决定用录音笔记录下 RKK 说过的话。
          </p>
          <p>
            输入
            <KatexVue :expression="'1'" />
            行
            <KatexVue :expression="'1'" />
            个正整数
            <KatexVue :expression="String.raw`N (1 \le N \le 2 \times 10 ^ 4)`" />
            ，表示 RKK 要说多少句话。接下来
            <KatexVue :expression="'N'" />
            行，每行
            <KatexVue :expression="'1'" />
            个正整数
            <KatexVue :expression="String.raw`x (0 \le x < 2 ^ {64})`" />
            ，表示 RKK 说的话。接下来
            <KatexVue :expression="'1'" />
            行
            <KatexVue :expression="'1'" />
            个正整数
            <KatexVue :expression="String.raw`M (1 \le N \le 2 \times 10 ^ 4)`" />
            ，表示向 RKK 证明时，RKK 的询问次数。接下来
            <KatexVue :expression="'M'" />
            行，每行
            <KatexVue :expression="'1'" />
            个正整数
            <KatexVue :expression="String.raw`x (0 \le x < 2 ^ {64})`" />
            表示 RKK 询问这句话说过几次。
          </p>
          <p>
            输出
            <KatexVue :expression="'M'" />
            行，每行
            <KatexVue :expression="'1'" />
            个正整数，对应 RKK 那次询问的答案。
          </p>
        </div>
      </section>

      <section class="code-section">
        <h2>時雨てる的危险代码</h2>
        <div class="code-container">
          <pre><code class="language-cpp" ref="codeElement"><div style="padding: 1em;">{{ vulnerableCode }}</div></code></pre>
        </div>
        <div class="code-info">
          <p><strong>语言:</strong> C++23</p>
          <p><strong>编译器:</strong> GCC 15.2</p>
          <p><strong>编译选项:</strong> {{ compileOptions }}</p>
          <p><strong>时间限制:</strong> 5s </p>
          <p><strong>空间限制:</strong> 256MB </p>
        </div>
      </section>

      <section class="upload-section">
        <h2>上传 Payload</h2>
        <div class="upload-area" @click="triggerFileInput" @drop="handleDrop" @dragover.prevent>
          <div class="upload-content">
            <IconUpload class="upload-icon" />
            <p v-if="!selectedFile">点击或拖拽文件到这里</p>
            <p v-else class="file-name">{{ selectedFile.name }}</p>
            <p class="upload-hint">支持 .txt, .in 文件，最大 5MB</p>
          </div>
          <input ref="fileInput" type="file" accept=".txt,.in" @change="handleFileSelect" style="display: none" />
        </div>

        <button class="submit-btn" :disabled="!selectedFile || testing" @click="submitTest">
          <span v-if="testing">测试中...</span>
          <span v-else>开始测试</span>
        </button>
      </section>

      <!-- 测试结果 -->
      <section v-if="testResult" class="result-section">
        <h2>测试结果</h2>
        <div :class="['result-card', testResult.status]">
          <div class="result-header">
            <h3>{{ testResult.title }}</h3>
            <span class="result-badge">{{ testResult.status.toUpperCase() }}</span>
          </div>
          <div class="result-details">
            <p><strong>运行时间:</strong> {{ testResult.time }} ms</p>
            <p><strong>内存使用:</strong> {{ testResult.memory }} RK</p>
            <p v-if="testResult.message">
              <strong>
                {{ testResult.flag == undefined
                  ? '错误' : '反馈'
                }}信息:
              </strong>
              {{ testResult.message }}
            </p>
            <div v-if="testResult.flag" class="flag-container">
              <h4>🎉 恭喜！你成功完成了挑战！</h4>
              <code class="flag">{{ testResult.flag }}</code>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { KatexVue } from 'katex-vue';

const { $hljs } = useNuxtApp()

interface TestResult {
  status: 'success' | 'error' | 'tle';
  title: string;
  time: number;
  memory: string;
  message?: string;
  flag?: string;
}

const fileInput = ref<HTMLInputElement>()
const selectedFile = ref<File | null>(null)
const testing = ref(false)
const testResult = ref<TestResult | null>(null)
const codeElement = ref<HTMLElement>()

// 编译选项
const compileOptions = '-O2 -std=c++23'

// 这里替换为你的被 hack 代码
const vulnerableCode =
  `#include <ranges>
#include <iostream>
#include <unordered_map>

using i64 = std::int64_t;

auto solve() {
    auto num = std::unordered_map<i64, int>{};

    auto n = i64{};
    std::cin >> n;
    for (auto _ : std::views::iota(0, n)) {
        auto x = 0;
        std::cin >> x;
        num[x]++;
    }

    auto m = i64{};
    std::cin >> m;
    for (auto _ : std::views::iota(0, m)) {
        auto x = 0;
        std::cin >> x;
        std::cout << num[x] << "\\n";
    }
}

auto main() -> int {
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);
    std::cout.tie(nullptr);

    for (auto _ : std::views::iota(0, 1)) {
        solve();
    }
}
`

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0]
  }
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  if (event.dataTransfer?.files) {
    selectedFile.value = event.dataTransfer.files[0] ?? null
  }
}

const submitTest = async () => {
  if (!selectedFile.value) return

  testing.value = true
  testResult.value = null

  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)

    const response = await $fetch('/api/test', {
      method: 'POST',
      body: formData
    })

    testResult.value = response
  } catch (error) {
    testResult.value = {
      status: 'error',
      title: '测试失败',
      time: 0,
      memory: 'rk',
      message: '测试过程中发生错误'
    }
  } finally {
    testing.value = false
  }
}

// 代码高亮
onMounted(() => {
  if (codeElement.value && $hljs) {
    $hljs.highlightElement(codeElement.value)
  }
})
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  text-align: center;
  margin-bottom: 40px;
}

.header h1 {
  color: #2c3e50;
  margin-bottom: 8px;
  font-size: 2.5em;
}

.header p {
  color: #7f8c8d;
  font-size: 1.2em;
}

.description-section,
.code-section,
.upload-section,
.result-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.description-section h2,
.code-section h2,
.upload-section h2,
.result-section h2 {
  color: #2c3e50;
  margin-bottom: 16px;
  border-bottom: 2px solid #3498db;
  padding-bottom: 8px;
  font-size: 1.5em;
}

.description-content {
  line-height: 1.6;
  color: #555;
  font-size: 1.1em;
}

.description-content p {
  margin-bottom: 12px;
}

.code-container {
  background: #f8f9fa;
  /* 改为浅色背景 */
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
  position: relative;
  border: 1px solid #e1e4e8;
  /* 添加边框 */
}

.code-container pre {
  margin: 0;
  /* padding: 20px; */
  overflow-x: auto;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.5;
  background: transparent;
  /* 确保背景透明 */
}

.code-container code {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.code-info {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid #3498db;
  font-size: 0.9em;
}

.code-info p {
  margin: 4px 0;
}

.upload-area {
  border: 2px dashed #bdc3c7;
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 20px;
}

.upload-area:hover {
  border-color: #3498db;
  background: #f8f9fa;
}

.upload-content {
  color: #7f8c8d;
}

.upload-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 12px;
  color: #bdc3c7;
}

.file-name {
  color: #2c3e50;
  font-weight: 600;
  font-size: 1.1em;
}

.upload-hint {
  font-size: 0.9em;
  margin-top: 8px;
  color: #95a5a6;
}

.submit-btn {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 12px 32px;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-weight: 600;
}

.submit-btn:hover:not(:disabled) {
  background-color: #2980b9;
  transform: translateY(-1px);
}

.submit-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
  transform: none;
}

.result-card {
  border-radius: 8px;
  padding: 20px;
  border-left: 4px solid;
}

.result-card.success {
  background: #d4edda;
  border-left-color: #28a745;
}

.result-card.error {
  background: #f8d7da;
  border-left-color: #dc3545;
}

.result-card.tle {
  background: #fff3cd;
  border-left-color: #ffc107;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.result-header h3 {
  margin: 0;
  color: #2c3e50;
}

.result-badge {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
}

.success .result-badge {
  background: #28a745;
  color: white;
}

.error .result-badge {
  background: #dc3545;
  color: white;
}

.tle .result-badge {
  background: #ffc107;
  color: #856404;
}

.result-details {
  color: #555;
}

.result-details p {
  margin: 8px 0;
}

.flag-container {
  margin-top: 20px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  border: 2px solid #28a745;
  text-align: center;
}

.flag-container h4 {
  margin: 0 0 12px 0;
  color: #28a745;
  font-size: 1.2em;
}

.flag {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 6px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 18px;
  color: #28a745;
  display: block;
  font-weight: bold;
  letter-spacing: 1px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .container {
    padding: 10px;
  }

  .header h1 {
    font-size: 2em;
  }

  .description-section,
  .code-section,
  .upload-section,
  .result-section {
    padding: 16px;
    margin-bottom: 16px;
  }

  .code-container pre {
    padding: 12px;
    font-size: 12px;
  }

  .result-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
