// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['nuxt-monaco-editor'],
  monacoEditor: {
    locale: 'zh-hans',
    componentName: {
      codeEditor: 'MonacoEditor',
      diffEditor: 'MonacoDiffEditor',
    }
  },
  app: {
    head: {
      title: 'RickyOJ - RickyLang 唯一指定 OJ',
      link: [
        {rel:'icon', type:'image/jpeg', href: 'favicon.jpg'}
      ]
    }
  }
})
