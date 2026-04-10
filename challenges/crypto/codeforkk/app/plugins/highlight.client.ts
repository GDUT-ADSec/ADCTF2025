import hljs from 'highlight.js/lib/core'
import cpp from 'highlight.js/lib/languages/cpp'
import 'highlight.js/styles/atom-one-light.css'

export default defineNuxtPlugin(() => {
  hljs.registerLanguage('cpp', cpp)
  
  return {
    provide: {
      hljs
    }
  }
})
