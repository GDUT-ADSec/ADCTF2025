<template>
  <div class="chat-container">
    <div class="chat-window">
      <div class="messages" ref="messagesContainer">
        <div v-for="(message, index) in displayMessages" :key="message.id" :class="['message-group', message.role]">
          <div v-if="message.role === 'user'" :class="['user-messages', 'message', 'user']">
            <!-- 用户消息组 -->
            <div class="avatar">
              你
            </div>
            <div class="content">
              {{ message.content }}
            </div>
          </div>

          <div v-else class="assistant-messages">
            <!-- 助手消息组 -->
            <div v-for="(part, partIndex) in message.parts" :key="partIndex"
              :class="['message', 'assistant', part.type]">
              <div :style="{
                visibility: partIndex == message.parts.length - 1 ? 'inherit' : 'hidden',
                alignSelf: 'end',
                marginBottom: '6px',
              }" class="avatar">
                <!-- RKK -->
                <img src="/favicon.jpg" alt="RKK" class="avatar-image" />
              </div>
              <div class="content">
                <template v-if="part.type === 'text'">
                  <span class="text-content">
                    {{ part.content }}
                    <span
                      v-if="index === displayMessages.length - 1 && partIndex === message.parts.length - 1 && loading"
                      class="cursor">|</span>
                  </span>
                </template>
                <template v-else-if="part.type === 'emotion'">
                  <div class="emotion-container">
                    <img class="emotion-image" :src="part.url" :alt="part.description" @error="handleImageError" />
                  </div>
                </template>
                <template v-else-if="part.type === 'error'">
                  <div class="error-message">
                    filtered.
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="input-area">
        <div class="input-actions">
          <div style="margin-right: auto;"></div>
          <button @click="resetChat" class="cancel-button" :disabled="loading">
            重置对话
          </button>
          <button v-if="loading" @click="cancelStream" class="cancel-button">
            停止响应
          </button>
        </div>
        <form @submit.prevent="sendMessage()" class="input-form">
          <div class="textarea-container">
            <textarea ref="textareaRef" v-model="inputMessage" placeholder="向 RKK 提问..." :disabled="loading"
              @keydown="handleKeydown" @input="autoResize" class="message-textarea" rows="1" />
            <button type="submit" :disabled="loading || !inputMessage.trim()" class="send-button">
              <span v-if="!loading">↵</span>
              <div v-else class="loading-spinner"></div>
            </button>
          </div>
          <div class="input-hint">
            按 Enter 换行，Shift + Enter 发送
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ChatMessage, Emotion, StreamChunk } from '~~/types/chat'
import { emotions, parseStreamContent } from '~~/types/chat'

interface DisplayMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  parts: Array<AnyMessage>;
}

type AnyMessage =
  | TextMessage
  | EmotionMessage
  | ErrorMessage
  ;

interface TextMessage {
  type: 'text';
  content: string;
}

interface EmotionMessage {
  type: 'emotion';
  description: string,
  url: string;
}

interface ErrorMessage {
  type: 'error';
}

const displayMessages = ref<DisplayMessage[]>([])

const inputMessage = ref('')
const loading = ref(false)
const messagesContainer = ref<HTMLElement>()
const textareaRef = ref<HTMLTextAreaElement>()
const abortController = ref<AbortController | null>(null)
const currentMessageId = ref<string>('')
const currentMessageBuffer = ref<string>('')

let messageIdCounter = 2

const generateMessageId = () => `msg_${messageIdCounter++}`

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const autoResize = () => {
  nextTick(() => {
    const textarea = textareaRef.value
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
    }
  })
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    if (event.shiftKey) {
      event.preventDefault()
      sendMessage()
    } else {
      return
    }
  }
}

const getEmotion = (emotionId: number) => {
  let emotion = emotions[emotionId];
  if (emotion == undefined) {
    throw new Error('不存在表情包');
  }
  return emotion
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}

const processStreamChunk = (chunk: string) => {
  currentMessageBuffer.value += chunk

  // 解析当前缓冲区的内容
  const chunks = parseStreamContent(currentMessageBuffer.value)

  // 更新或创建消息
  let currentMessage = displayMessages.value.find(msg => msg.id === currentMessageId.value)

  if (!currentMessage) {
    currentMessageId.value = generateMessageId()
    currentMessage = {
      id: currentMessageId.value,
      role: 'assistant',
      content: currentMessageBuffer.value,
      parts: []
    }
    displayMessages.value.push(currentMessage)
  }

  // 处理解析后的块
  const newParts: DisplayMessage['parts'] = []
  let hasPause = false

  for (const chunk of chunks) {
    switch (chunk.type) {
      case 'text':
        let content = chunk.content.trim();
        if (content.length > 0) {
          newParts.push({ type: 'text', content })
        }
        break
      case 'emotion':
        try {
          const emotion = getEmotion(chunk.emotionId);
          newParts.push({
            type: 'emotion',
            description: emotion.description,
            url: emotion.url,
          });
        } catch (e) {
          console.log(`Exception: ${e}`);
          newParts.push({ type: 'error' })
        }
        break
      case 'pause':
        hasPause = true
        break
      case 'error':
        console.log(`ErrorChunk`);
        newParts.push({ type: 'error' })
        break
    }
  }

  // 更新消息内容
  if (currentMessage) {
    currentMessage.content = currentMessageBuffer.value
    currentMessage.parts = newParts
  }

  scrollToBottom()
}

const sendMessage = async (msg?: string, hidden: boolean = false) => {
  if (msg == undefined) {
    if (!inputMessage.value.trim() || loading.value) return
    msg = inputMessage.value.trim();
    inputMessage.value = ''

    // 重置文本域高度
    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto'
    }
  }
  currentMessageBuffer.value = ''
  currentMessageId.value = ''

  if (!hidden) {
    const content = msg.trim();
    displayMessages.value.push({
      id: generateMessageId(),
      role: 'user',
      content,
      parts: [{ type: 'text', content }]
    });
  }

  const currentInput = msg || inputMessage.value
  loading.value = true

  scrollToBottom()

  try {
    abortController.value = new AbortController()

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: currentInput,
        // history: displayMessages.value
        //   .filter(msg => msg.role === 'user' || msg.role === 'assistant')
        //   .map(msg => ({
        //     role: msg.role,
        //     content: msg.content
        //   }))
      }),
      signal: abortController.value.signal
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('No reader available')
    }

    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()

      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      processStreamChunk(chunk)
    }

  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.log('Request aborted')
    } else {
      console.error('Error sending message:', error)
      // 添加错误消息
      displayMessages.value.push({
        id: generateMessageId(),
        role: 'assistant',
        content: 'filtered.',
        parts: [{ type: 'error' }]
      })
    }
  } finally {
    loading.value = false
    abortController.value = null
    scrollToBottom()
  }
}

const cancelStream = () => {
  if (abortController.value) {
    abortController.value.abort()
    loading.value = false
  }
}

const resetChat = async () => {
  try {
    await fetch('/api/reset')
    displayMessages.value = []
    // 重新开始对话
    sendMessage('', true)
  } catch (error) {
    console.error('重置聊天失败:', error)
  }
}

onUnmounted(() => {
  cancelStream()
})

onMounted(async () => {
  const response = await fetch('/api/history');
  const { history }: { history: ChatMessage[] } = await response.json();
  if (history.length > 0) {
    // const msgs = ref<DisplayMessage[]>([]);
    for (const msg of history) {
      if (typeof msg.content != 'string') {
        console.log(`Invalid Message: ${msg}`);
        return;
      }
      switch (msg.role) {
        case 'user':
          displayMessages.value.push({
            id: generateMessageId(),
            role: 'user',
            content: msg.content,
            parts: [{ type: 'text', content: msg.content }],
          })
          break;
        case 'assistant':
          currentMessageBuffer.value = ''
          currentMessageId.value = ''
          processStreamChunk(msg.content);
          break;
        case 'system':
        case 'developer':
          break;
        default:
          console.log(`Invalid Message: ${msg}`);
      }
    }
    scrollToBottom();
  } else {
    sendMessage('', true);
  }
})
</script>

<style scoped>
.chat-container {
  width: 100%;
  max-width: 900px;
  height: calc(100vh - 140px);
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.chat-window {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.messages {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
  background: #f8f9fa;
  min-height: 0;
}

.message-group {
  margin-bottom: 1rem;
}

.user-messages {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.assistant-messages {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
}

.message {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  max-width: 100%;
}

.message.user {
  flex-direction: row-reverse;
  align-self: flex-end;
}

.message.assistant {
  flex-direction: row;
  align-self: flex-start;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.75rem;
  flex-shrink: 0;
  margin-top: 0.25rem;
  background-image: url(/favicon.jpg);
}

.message.user .avatar {
  background: #667eea;
  color: white;
}

.avatar-image {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.content {
  max-width: 90%;
  padding: 0.875rem 1.25rem;
  border-radius: 18px;
  line-height: 1.5;
  word-wrap: break-word;
  white-space: pre-wrap;
  font-size: 0.95rem;
}

.message.user .content {
  background: #667eea;
  color: white;
  border-bottom-right-radius: 6px;
}

.message.assistant .content {
  background: white;
  color: #333;
  border: 1px solid #e1e5e9;
  border-bottom-left-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* 表情包样式 */
.message.emotion .content {
  padding: 0.5rem;
  background: transparent;
  border: none;
  box-shadow: none;
}

.emotion-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.emotion-image {
  max-width: 200px;
  max-height: 200px;
  border-radius: 12px;
  object-fit: contain;
}

/* 文本内容样式 */
.text-content {
  white-space: pre-wrap;
}

/* 错误消息样式 */
.error-message {
  color: #ff6b6b;
  font-style: italic;
}

.cursor {
  animation: blink 1s infinite;
  color: #764ba2;
  font-weight: bold;
}

@keyframes blink {

  0%,
  50% {
    opacity: 1;
  }

  51%,
  100% {
    opacity: 0;
  }
}

.input-area {
  padding: 1.25rem 1.5rem;
  padding-top: 0.5rem;
  background: white;
  border-top: 1px solid #e1e5e9;
  position: relative;
  flex-shrink: 0;
}

.input-form {
  width: 100%;
}

.textarea-container {
  display: flex;
  align-items: flex-end;
  gap: 0.75rem;
  width: 100%;
  margin-bottom: 0.5rem;
}

.message-textarea {
  flex: 1;
  padding: 0.875rem 1.25rem;
  border: 2px solid #e1e5e9;
  border-radius: 20px;
  font-size: 0.95rem;
  font-family: inherit;
  outline: none;
  transition: border-color 0.3s ease;
  resize: none;
  min-height: 48px;
  max-height: 120px;
  line-height: 1.5;
}

.message-textarea:focus {
  border-color: #667eea;
}

.message-textarea:disabled {
  background: #f8f9fa;
  opacity: 0.7;
}

.message-textarea::placeholder {
  color: #a0a0a0;
}

.send-button {
  padding: 0.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, opacity 0.2s ease;
  height: 48px;
  width: 48px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.send-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
}

.send-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.loading-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top: 2px solid white;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.cancel-button {
  /* position: absolute; */
  top: -35px;
  right: 1.5rem;
  padding: 0.4rem 0.8rem;
  margin: 0.25rem;
  background-color: #ff6b6b;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.cancel-button:hover {
  background-color: #ff5252;
}

.input-hint {
  font-size: 0.75rem;
  color: #a0a0a0;
  text-align: center;
  margin-top: 0.25rem;
}

/* 滚动条样式 */
.messages::-webkit-scrollbar {
  width: 6px;
}

.messages::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.messages::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.messages::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.message-textarea::-webkit-scrollbar {
  width: 6px;
}

.message-textarea::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 0 0 20px 0;
}

.message-textarea::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.message-textarea::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chat-container {
    height: calc(100vh - 120px);
    border-radius: 12px;
    max-width: 100%;
  }

  .messages {
    padding: 1rem;
  }

  .content {
    max-width: 85%;
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
  }

  .avatar {
    width: 32px;
    height: 32px;
    font-size: 0.7rem;
  }

  .emotion-image {
    max-width: 150px;
    max-height: 150px;
  }

  .input-area {
    padding: 1rem;
  }

  .textarea-container {
    gap: 0.5rem;
  }

  .send-button {
    padding: 0.65rem;
    height: 44px;
    width: 44px;
  }

  .message-textarea {
    padding: 0.75rem 1rem;
    min-height: 44px;
    font-size: 0.9rem;
  }

  .cancel-button {
    top: -30px;
    right: 1rem;
    padding: 0.3rem 0.7rem;
  }

  .input-hint {
    font-size: 0.7rem;
  }
}

@media (max-width: 480px) {
  .emotion-image {
    max-width: 120px;
    max-height: 120px;
  }

  .content {
    max-width: 90%;
  }
}

.input-actions {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}
</style>
