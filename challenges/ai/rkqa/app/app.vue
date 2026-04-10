<template>
  <div id="app">
    <header class="header">
      <h1>RKK 问答</h1>
      <p>与 RKK 对话，探索 TA 的世界</p>
    </header>
    <main class="main">
      <Chat />
    </main>
    <footer class="footer">
      <p>CTF Challenge - RKK 问答 - By 時雨てる</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  color: #333;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 1rem 2rem;
  text-align: center;
  color: white;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
}

.header h1 {
  font-size: 2rem;
  margin-bottom: 0.25rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.header p {
  font-size: 1rem;
  opacity: 0.9;
}

.main {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  overflow: hidden;
}

.footer {
  background: rgba(0, 0, 0, 0.2);
  color: white;
  text-align: center;
  padding: 0.5rem;
  font-size: 0.8rem;
  flex-shrink: 0;
}
</style>
