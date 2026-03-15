const API_BASE = 'https://web-production-88ecc.up.railway.app/api/v1'
const history = ref([])

export const useTaskStore = defineStore('task', () => {
  const history = ref([])
  const tasks = ref(new Map())

  async function submitTask({ audioUrl, audioFile }) {
    const formData = new FormData()
    if (audioFile) {
      formData.append('audio', audioFile)
    } else if (audioUrl) {
      formData.append('audio_url', audioUrl)
    }

    const response = await fetch(`${API_BASE}/podcast/submit`, {
      method: 'POST',
      body: formData
    })

    const data = await response.json()
    return data.task_id
  }

  async function getStatus(taskId) {
    const response = await fetch(`${API_BASE}/podcast/status?task_id=${taskId}`)
    return await response.json()
  }

  async function getResult(taskId) {
    const response = await fetch(`${API_BASE}/podcast/result?task_id=${taskId}`)
    return await response.json()
  }
})
</script>
</body>
</html>
