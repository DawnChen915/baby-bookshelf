<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getBookById, saveBook } from '../lib/store'
import { showToast, showDialog } from 'vant'

const route = useRoute()
const router = useRouter()

const book = ref({
  title: '',
  pages: [],
})

const bookId = route.params.id
const mediaRecorders = ref(new Map()) // 存储每个页面的录音器
const isRecording = ref(new Map()) // 存储录音状态

async function loadBook() {
  if (bookId) {
    const loadedBook = await getBookById(Number(bookId))
    if (loadedBook) {
      book.value = loadedBook
    }
  }
}

function addPage() {
  book.value.pages.push({ image: null, audio: null })
}

function removePage(index) {
  book.value.pages.splice(index, 1)
  // 清理录音器和状态
  mediaRecorders.value.delete(index)
  isRecording.value.delete(index)
}

function afterRead(file, page, type) {
  page[type] = file.file
}

// 获取图片预览URL
function getImagePreviewUrl(page) {
  if (page.image instanceof File) {
    return URL.createObjectURL(page.image)
  }
  return ''
}

// 开始录音
async function startRecording(pageIndex) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mediaRecorder = new MediaRecorder(stream)
    const audioChunks = []

    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data)
    }

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
      const audioFile = new File([audioBlob], `recording-${Date.now()}.wav`, {
        type: 'audio/wav',
      })
      book.value.pages[pageIndex].audio = audioFile

      // 停止所有音轨
      stream.getTracks().forEach((track) => track.stop())
    }

    mediaRecorder.start()
    mediaRecorders.value.set(pageIndex, mediaRecorder)
    isRecording.value.set(pageIndex, true)

    showToast('开始录音...')
  } catch (error) {
    console.error('录音失败:', error)
    showDialog({
      title: '录音失败',
      message: '无法访问麦克风，请检查权限设置',
    })
  }
}

// 停止录音
function stopRecording(pageIndex) {
  const mediaRecorder = mediaRecorders.value.get(pageIndex)
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop()
    mediaRecorders.value.delete(pageIndex)
    isRecording.value.set(pageIndex, false)
    showToast('录音完成')
  }
}

// 删除录音
function removeAudio(pageIndex) {
  book.value.pages[pageIndex].audio = null
}

// 播放录音预览
function playAudioPreview(page) {
  if (page.audio instanceof File) {
    const audioUrl = URL.createObjectURL(page.audio)
    const audio = new Audio(audioUrl)
    audio.play()
    audio.onended = () => {
      URL.revokeObjectURL(audioUrl)
    }
  }
}

async function onSubmit() {
  await saveBook(book.value)
  showToast('保存成功')
  router.push('/admin')
}

onMounted(loadBook)
</script>

<template>
  <div class="book-edit-container">
    <van-nav-bar
      :title="bookId ? '✏️ 编辑图书' : '➕ 添加新书'"
      left-arrow
      @click-left="$router.back()"
      class="edit-nav"
    />

    <div class="edit-content">
      <van-form @submit="onSubmit" class="book-form">
        <div class="form-section">
          <div class="section-header">
            <h3 class="section-title">📚 基本信息</h3>
          </div>

          <div class="title-field-container">
            <van-field
              v-model="book.title"
              name="书名"
              label="书名"
              placeholder="给这本书起个好听的名字吧～"
              :rules="[{ required: true, message: '请填写书名' }]"
              class="title-field"
            >
              <template #left-icon>
                <div class="field-icon">📖</div>
              </template>
            </van-field>
          </div>
        </div>

        <div class="pages-section">
          <div class="section-header">
            <h3 class="section-title">📄 书页内容</h3>
          </div>

          <div v-for="(page, index) in book.pages" :key="index" class="page-editor">
            <van-cell-group class="page-group">
              <van-cell class="page-header">
                <template #title>
                  <div class="page-title">
                    <span class="page-number">第 {{ index + 1 }} 页</span>
                    <div class="page-status">
                      <span v-if="page.image" class="status-badge has-image">🖼️ 有图片</span>
                      <span v-if="page.audio" class="status-badge has-audio">🔊 有音频</span>
                      <span v-if="!page.image && !page.audio" class="status-badge empty"
                        >空白页</span
                      >
                    </div>
                  </div>
                </template>
                <template #right-icon>
                  <van-button
                    type="danger"
                    size="small"
                    round
                    @click="removePage(index)"
                    class="delete-page-btn"
                  >
                    🗑️ 删除
                  </van-button>
                </template>
              </van-cell>

              <van-field name="uploader" label="📷 上传图片" class="upload-field">
                <template #input>
                  <div class="upload-area">
                    <!-- 图片预览 -->
                    <div v-if="page.image" class="image-preview-container">
                      <div class="image-preview">
                        <img :src="getImagePreviewUrl(page)" alt="图片预览" class="preview-image" />
                        <div class="preview-overlay">
                          <van-button
                            type="danger"
                            size="mini"
                            round
                            @click="page.image = null"
                            class="remove-image-btn"
                          >
                            🗑️ 删除
                          </van-button>
                        </div>
                      </div>
                      <div class="file-info success">✅ 图片已上传</div>
                    </div>

                    <!-- 上传按钮 -->
                    <div v-else>
                      <van-uploader
                        :after-read="(file) => afterRead(file, page, 'image')"
                        :accept="'image/*'"
                        :max-count="1"
                        class="image-uploader"
                      >
                        <div class="upload-placeholder">
                          <div class="upload-icon">📸</div>
                          <div class="upload-text">点击上传图片</div>
                        </div>
                      </van-uploader>
                    </div>
                  </div>
                </template>
              </van-field>

              <van-field name="recorder" label="录制音频" class="upload-field">
                <template #input>
                  <div class="audio-area">
                    <!-- 已有录音时显示 -->
                    <div v-if="page.audio" class="audio-preview-container">
                      <div class="audio-preview">
                        <div class="audio-info">
                          <span class="audio-icon">🔊</span>
                          <span class="audio-name">{{ page.audio.name || '录音文件' }}</span>
                        </div>
                        <div class="audio-controls">
                          <van-button
                            type="primary"
                            size="mini"
                            round
                            @click="playAudioPreview(page)"
                            class="play-btn"
                          >
                            ▶️ 播放
                          </van-button>
                          <van-button
                            type="warning"
                            size="mini"
                            round
                            @click="removeAudio(index)"
                            class="re-record-btn"
                          >
                            🎤 重录
                          </van-button>
                          <van-button
                            type="danger"
                            size="mini"
                            round
                            @click="removeAudio(index)"
                            class="remove-audio-btn"
                          >
                            🗑️ 删除
                          </van-button>
                        </div>
                      </div>
                      <div class="file-info success">✅ 音频已录制</div>
                    </div>

                    <!-- 录音控制 -->
                    <div v-else class="recording-controls">
                      <div v-if="isRecording.get(index)" class="recording-active">
                        <div class="recording-indicator">
                          <div class="recording-dot"></div>
                          <span>正在录音...</span>
                        </div>
                        <van-button
                          type="danger"
                          size="large"
                          round
                          @click="stopRecording(index)"
                          class="stop-record-btn"
                        >
                          ⏹️ 停止录音
                        </van-button>
                      </div>
                      <div v-else class="recording-ready">
                        <div class="record-placeholder">
                          <div class="record-icon"></div>
                          <div class="record-text">点击下方按钮开始录音</div>
                        </div>
                        <van-button
                          type="primary"
                          size="large"
                          round
                          @click="startRecording(index)"
                          class="start-record-btn"
                        >
                          🎤 开始录音
                        </van-button>
                      </div>
                    </div>
                  </div>
                </template>
              </van-field>
            </van-cell-group>
          </div>
          <div v-if="book.pages.length === 0" class="no-pages">
            <div class="no-pages-icon">📝</div>
            <p>还没有添加任何页面，点击下方按钮添加第一页吧！</p>
          </div>
          <div class="add-page-button">
            <van-button type="primary" size="small" round @click="addPage" class="add-page-btn">
              ➕ 添加一页
            </van-button>
          </div>
        </div>

        <div class="form-actions">
          <van-button round block type="primary" native-type="submit" size="large" class="save-btn">
            {{ bookId ? '💾 保存修改' : '✨ 创建新书' }}
          </van-button>
        </div>
      </van-form>
    </div>
  </div>
</template>

<style scoped>
.book-edit-container {
  min-height: calc(100vh - 50px - env(safe-area-inset-bottom));
  background: var(--color-background);
}
.title-field-container {
  margin-bottom: 16px;
}

.edit-content {
  padding: 20px 16px 100px;
}

.book-form {
  max-width: 600px;
  margin: 0 auto;
}

.form-section {
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  color: var(--color-heading);
  font-size: 18px;
  font-weight: bold;
  margin: 0;
}

.add-page-button {
  text-align: center;
  margin-top: 16px;
}

.add-page-btn {
  text-align: center;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-soft) 100%);
  border: none;
  color: white;
  font-weight: bold;
}

.title-field {
  background: transparent;
}

.field-icon {
  font-size: 18px;
  margin-right: 8px;
}

.pages-section {
  margin-bottom: 32px;
}

.no-pages {
  text-align: center;
  padding: 40px 20px;
  /* background: rgba(255, 255, 255, 0.6); */
  border-radius: 16px;
  margin-bottom: 20px;
}

.no-pages-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.no-pages p {
  color: var(--color-text);
  margin: 0;
  line-height: 1.6;
}

.page-editor {
  margin-bottom: 20px;
}

.page-group {
  /* background: rgba(255, 255, 255, 0.9); */
  background: var(--van-cell-group-background);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(10px);
}

.page-header {
  background: rgba(168, 230, 207, 0.1);
  border-bottom: 1px solid rgba(168, 230, 207, 0.2);
}

.page-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.page-number {
  font-weight: bold;
  color: var(--color-heading);
  font-size: 16px;
}

.page-status {
  display: flex;
  gap: 6px;
}

.status-badge {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 8px;
  font-weight: bold;
}

.status-badge.has-image {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
}

.status-badge.has-audio {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
}

.status-badge.empty {
  background: rgba(158, 158, 158, 0.2);
  color: #9e9e9e;
}

.delete-page-btn {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%);
  border: none;
  color: white;
  font-size: 12px;
}

.upload-field {
  background: transparent;
  padding: 16px;
}

.upload-area {
  width: 100%;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  border: 2px dashed #ddd;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.5);
  transition: all 0.3s ease;
  cursor: pointer;
}

.upload-placeholder:hover {
  border-color: var(--color-primary);
  background: rgba(255, 139, 148, 0.1);
}

.upload-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.upload-text {
  color: var(--color-text);
  font-size: 14px;
}

.file-info {
  margin-top: 8px;
  padding: 8px 12px;
  background: rgba(76, 175, 80, 0.1);
  border-radius: 8px;
  font-size: 12px;
  color: #4caf50;
}

.form-actions {
  margin-top: 32px;
}

.save-btn {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-soft) 100%);
  border: none;
  color: white;
  font-weight: bold;
  font-size: 16px;
  padding: 14px;
  box-shadow: 0 8px 25px rgba(255, 139, 148, 0.4);
  transition: all 0.3s ease;
}

.save-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(255, 139, 148, 0.5);
}

.save-btn:active {
  transform: translateY(0);
}

/* 自定义上传组件样式 */
.image-uploader :deep(.van-uploader__upload),
.audio-uploader :deep(.van-uploader__upload) {
  width: 100%;
  margin: 0;
}

.image-uploader :deep(.van-uploader__upload-icon),
.audio-uploader :deep(.van-uploader__upload-icon) {
  display: none;
}

/* 图片预览样式 */
.image-preview-container {
  width: 100%;
}

.image-preview {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.preview-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
}

.preview-overlay {
  position: absolute;
  top: 8px;
  right: 8px;
}

.remove-image-btn {
  background: rgba(255, 107, 107, 0.9);
  border: none;
  color: white;
  font-size: 12px;
  backdrop-filter: blur(10px);
}

/* 录音相关样式 */
.audio-area {
  width: 100%;
}

.audio-preview-container {
  width: 100%;
}

.audio-preview {
  background: rgba(76, 175, 80, 0.1);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}

.audio-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.audio-icon {
  font-size: 20px;
}

.audio-name {
  font-size: 14px;
  font-weight: bold;
  color: var(--color-heading);
}

.audio-controls {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.play-btn {
  background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
  border: none;
  color: white;
  font-size: 11px;
}

.re-record-btn {
  background: linear-gradient(135deg, #ff9800 0%, #ffb74d 100%);
  border: none;
  color: white;
  font-size: 11px;
}

.remove-audio-btn {
  background: linear-gradient(135deg, #f44336 0%, #ef5350 100%);
  border: none;
  color: white;
  font-size: 11px;
}

.recording-controls {
  width: 100%;
  text-align: center;
}

.recording-active {
  padding: 20px;
  background: rgba(255, 82, 82, 0.1);
  border-radius: 12px;
  margin-bottom: 12px;
}

.recording-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 16px;
  font-weight: bold;
  color: #f44336;
}

.recording-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #f44336;
  animation: recording-pulse 1s ease-in-out infinite;
}

@keyframes recording-pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.2);
  }
}

.recording-ready {
  padding: 20px;
}

.record-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  border: 2px dashed #ddd;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.5);
  margin-bottom: 16px;
}

.record-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.record-text {
  color: var(--color-text);
  font-size: 14px;
}

.start-record-btn {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-soft) 100%);
  border: none;
  color: white;
  font-weight: bold;
  font-size: 14px;
  padding: 12px 24px;
}

.stop-record-btn {
  background: linear-gradient(135deg, #f44336 0%, #ef5350 100%);
  border: none;
  color: white;
  font-weight: bold;
  font-size: 14px;
  padding: 12px 24px;
}

.file-info.success {
  background: rgba(76, 175, 80, 0.1);
  color: #4caf50;
  border: 1px solid rgba(76, 175, 80, 0.3);
}

/* 响应式设计 */
@media (max-width: 640px) {
  .edit-content {
    padding: 16px 12px 100px;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .page-title {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .page-status {
    align-self: flex-start;
  }

  .upload-placeholder {
    padding: 16px;
  }

  .upload-icon {
    font-size: 24px;
  }
}
</style>
