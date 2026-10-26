// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  runtimeConfig: {
    deepseekApiKey: process.env.DEEPSEEK_API_KEY,
    flag: process.env.A1CTF_FLAG,
    public: {
      appName: 'RKK 问答',
    },
  },
  app: {
    head: {
      title: 'RKK 问答',
      link: [
        {rel:'icon', type:'image/jpeg', href: 'favicon.jpg'}
      ]
    }
  }
})
