import { OpenAI } from 'openai'
import type { ChatMessage } from '~~/types/chat'
import { antiHackPrompt, parseStreamContent, prompt } from '~~/types/chat'

import stores from '../utils/stores'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { message } = body;

  const openai = new OpenAI({
    apiKey: useRuntimeConfig().deepseekApiKey,//apiKey,
    baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1'
  })

  // 设置响应头为流式传输
  setResponseHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  setResponseHeader(event, 'Cache-Control', 'no-cache')
  setResponseHeader(event, 'Connection', 'keep-alive')
  setResponseHeader(event, 'Transfer-Encoding', 'chunked')

  // 构建对话历史
  // const messages: ChatMessage[] = [
  //   {
  //     role: 'system',
  //     content: prompt,
  //   }
  // ]

  // 添加历史对话
  // if (history && Array.isArray(history)) {
  //   history.forEach((msg: ChatMessage) => {
  //     messages.push(msg)
  //   })
  // }

  // 添加当前消息
  if (message.length > 0) {
    stores.chatHistory.push({
      role: 'user',
      content: message
    })
    stores.chatHistory.push({
      role: 'system',
      content: antiHackPrompt,
    })
  }

  try {
    // const trueHistory = [
    //   ...stores.chatHistory,
    //   {
    //     role: 'user',
    //     content: `${message} ${antiHackPrompt}`
    //   }
    // ]
    const stream = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: stores.chatHistory,
      max_tokens: 1000,
      temperature: 1.5,
      stream: true
    })

    // 创建可读流
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          let fullContent = ''

          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content
            if (content) {
              fullContent += content

              // 实时发送内容，但保持标记完整性
              // 我们发送原始内容，由前端解析
              controller.enqueue(content)
            }
          }
          stores.chatHistory.push({
            role: 'assistant',
            content: fullContent,
          })

          controller.close()
        } catch (error) {
          console.error('Stream error:', error)
          controller.enqueue('[filtered]')
          controller.close()
        }
      }
    })


    return sendStream(event, readableStream)
  } catch (error: any) {
    console.error('DeepSeek API error:', error)
    // 返回错误标记
    const errorStream = new ReadableStream({
      start(controller) {
        controller.enqueue('[filtered]')
        controller.close()
      }
    })
    return sendStream(event, errorStream)
  }
})
