// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      maxFileSize: 5 * 1024 * 1024, // 1MB
      flag: process.env.A1CTF_FLAG || 'flag{test_flag_here}'
    }
  },
  app: {
    head: {
      title: 'Codeforkk',
      link: [
        { rel: 'icon', type: 'image/jpeg', href: 'favicon.png' }
      ]
    },
  },
})
