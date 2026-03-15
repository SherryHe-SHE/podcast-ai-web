<template>
  <div class="container">
    <h1>🎙️ 播客 AI 助手</h1>
    <p class="subtitle">上传音频，AI 告诉你核心信息</p>
    
    <div class="upload-area" @click="$refs.fileInput.click()">
      <input type="file" ref="fileInput" @change="handleFile" accept="audio/*" hidden>
      <p v-if="!audioFile">点击上传音频文件</p>
      <p v-else>已选择: {{ audioFile.name }}</p>
    </div>
    
    <input v-model="audioUrl" placeholder="或输入音频 URL" class="url-input">
    
    <button @click="submitTask" :disabled="loading" class="btn">
      {{ loading ? '处理中...' : '开始处理' }}
    </button>
    
    <div v-if="result" class="result">
     <h2>{{ result.summary?.title || '处理完成' }}</h2>
     <p>{{ result.summary?.text || result.summary?.one_sentence }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const API_BASE = 'https://web-production-88ecc.up.railway.app/api/v1'
const audioFile = ref(null)
const audioUrl = ref('')
const loading = ref(false)
const result = ref(null)

const handleFile = (e) => {
  audioFile.value = e.target.files[0]
}

const submitTask = async () => {
  if (!audioFile.value && !audioUrl.value) {
    alert('请上传文件或输入 URL')
    return
  }
  
  loading.value = true
  const formData = new FormData()
  if (audioFile.value) formData.append('audio', audioFile.value)
  if (audioUrl.value) formData.append('audio_url', audioUrl.value)
  
  try {
    const res = await fetch(`${API_BASE}/podcast/submit`, {
      method: 'POST',
      body: formData
    })
    const data = await res.json()
    
    const poll = async () => {
      const statusRes = await fetch(`${API_BASE}/podcast/status?task_id=${data.task_id}`)
      const status = await statusRes.json()
      
      if (status.status === 'done') {
        const resultRes = await fetch(`${API_BASE}/podcast/result?task_id=${data.task_id}`)
        result.value = await resultRes.json()
        loading.value = false
      } else if (status.status === 'failed') {
        alert('处理失败')
        loading.value = false
      } else {
        setTimeout(poll, 2000)
      }
    }
    poll()
  } catch (e) {
    alert('提交失败: ' + e.message)
    loading.value = false
  }
}
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, sans-serif; background: #f5f5f5; padding: 20px; }
.container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; }
h1 { font-size: 24px; margin-bottom: 8px; }
.subtitle { color: #666; margin-bottom: 24px; }
.upload-area { border: 2px dashed #ddd; padding: 40px; text-align: center; border-radius: 8px; cursor: pointer; margin-bottom: 16px; }
.upload-area:hover { border-color: #667eea; }
.url-input { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 16px; }
.btn { width: 100%; padding: 14px; background: #667eea; color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; }
.btn:disabled { background: #ccc; }
.result { margin-top: 24px; padding: 20px; background: #f0f9ff; border-radius: 8px; }
</style>
