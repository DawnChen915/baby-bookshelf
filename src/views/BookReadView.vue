<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getBookById } from '../lib/store'
// import { Icon } from '@iconify/vue'

const route = useRoute()
const router = useRouter()
const book = ref(null)
const currentPageIndex = ref(0)
const isPlaying = ref(false)
const swipeRef = ref(null)

const bookId = Number(route.params.id)

async function loadBook() {
  book.value = await getBookById(bookId)
}

function handlePageClick(page) {
  // 点击图片播放音频（如果有的话）
  if (isPlaying.value == true) return

  if (page && page.audio) {
    playAudio(page.audio)
  }
}

function playAudio(pageaudio) {
  const audioUrl = URL.createObjectURL(pageaudio)
  const audio = new Audio(audioUrl)

  isPlaying.value = true
  audio.play()

  audio.onended = () => {
    isPlaying.value = false
    URL.revokeObjectURL(audioUrl)
  }

  audio.onerror = () => {
    isPlaying.value = false
    URL.revokeObjectURL(audioUrl)
  }
}

const imageUrlMap = new Map()

function getPageImageUrl(page) {
  if (!page) return ''
  if (page.image instanceof File) {
    if (!imageUrlMap.has(page)) {
      imageUrlMap.set(page, URL.createObjectURL(page.image))
    }
    return imageUrlMap.get(page)
  }
  return ''
}

// 页面卸载时释放所有blob url
onUnmounted(() => {
  for (const url of imageUrlMap.values()) {
    URL.revokeObjectURL(url)
  }
  imageUrlMap.clear()
})

onMounted(loadBook)
</script>

<template>
  <div v-if="book" class="book-read-container">
    <van-nav-bar :title="book.title" left-arrow @click-left="router.back()" class="read-nav">
      <template #right>
        <div class="page-indicator">{{ currentPageIndex + 1 }} / {{ book.pages.length }}</div>
      </template>
    </van-nav-bar>

    <div class="book-read-view">
      <van-swipe
        ref="swipeRef"
        class="page-swipe"
        :show-indicators="false"
        :loop="false"
        :touchable="true"
        :autoplay="0"
        lazy-render
        :height="'100%'"
      >
        <van-swipe-item v-for="(page, index) in book.pages" :key="index" class="page-swipe-item">
          <div class="page-container" @click="handlePageClick(page)">
            <div class="page-wrapper">
              <van-image
                v-if="page && page.image"
                fit="contain"
                :src="getPageImageUrl(page)"
                class="page-image"
                loading-icon="photo"
              >
                <template #loading>
                  <div class="image-loading">
                    <van-loading type="spinner" size="24px" />
                    <p>正在加载...</p>
                  </div>
                </template>
              </van-image>
              <van-empty v-else description="这一页没有图片呢～" class="page-empty">
                <div class="empty-icon">🖼️</div>
              </van-empty>

              <!-- 音频指示器 -->
              <div v-if="page && page.audio" class="audio-indicator">
                <div class="audio-tip">点击图片播放声音</div>
              </div>
            </div>
          </div>
        </van-swipe-item>
      </van-swipe>
    </div>
  </div>

  <div v-else class="loading-container">
    <div class="loading-content">
      <van-loading size="32px" type="spinner" />
      <p class="loading-text">正在打开书本...</p>
      <div class="loading-books">📚📖📔</div>
    </div>
  </div>
</template>

<style scoped>
.book-read-container {
  min-height: calc(100vh - 50px - env(safe-area-inset-bottom));
  background: var(--color-background);
  display: flex;
  flex-direction: column;
}
.read-nav {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  color: white;
  box-shadow: 0 2px 20px rgba(255, 139, 148, 0.3);
  flex-shrink: 0;
}

.read-nav :deep(.van-nav-bar__title) {
  color: white;
  font-weight: bold;
  font-size: 18px;
  max-width: 60%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.read-nav :deep(.van-nav-bar__left .van-icon) {
  color: white;
  font-size: 20px;
}

.page-indicator {
  color: white;
  font-size: 14px;
  font-weight: bold;
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 12px;
  border-radius: 16px;
  backdrop-filter: blur(10px);
}

.book-read-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.page-swipe {
  flex: 1;
  height: 100%;
}

:deep(.van-swipe__track) {
  height: calc(100vh - 50px - 45px - env(safe-area-inset-bottom));
}

.page-swipe-item {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-container {
  width: 100%;
  /* height: 100%; */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  cursor: pointer;
  user-select: none;
}

.page-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  background: white;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.2s ease;
  position: relative;
}

.page-image {
  width: 100%;
  height: 100%;
  border-radius: 16px;
}

.image-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: var(--color-text);
}

.page-empty {
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.page-dots {
  display: flex;
  gap: 8px;
  align-items: center;
  flex: 1;
  justify-content: center;
  max-width: 200px;
  overflow-x: auto;
  padding: 4px;
}

.page-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ddd;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.page-dot.active {
  background: var(--color-primary);
  transform: scale(1.5);
}

.page-dot:hover {
  background: var(--color-primary-soft);
  transform: scale(1.2);
}

.loading-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-background);
}

.loading-content {
  text-align: center;
}

.loading-text {
  margin: 16px 0;
  color: var(--color-text);
  font-size: 16px;
}

.loading-books {
  font-size: 32px;
  animation: bounce 1.5s ease-in-out infinite;
}

.audio-indicator {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px 12px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  backdrop-filter: blur(10px);
  animation: pulse 2s ease-in-out infinite;
}

.audio-icon {
  font-size: 16px;
  transition: transform 0.3s ease;
}

.audio-icon.playing {
  animation: audioPlaying 0.5s ease-in-out infinite alternate;
}

.audio-tip {
  font-size: 11px;
  opacity: 0.9;
}

.page-navigation {
  flex-shrink: 0;
  padding: 16px 20px 24px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.8;
  }
  50% {
    opacity: 1;
  }
}

@keyframes audioPlaying {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(1.2);
  }
}

/* 响应式设计 */
@media (max-width: 480px) {
  .page-navigation {
    padding: 12px 16px 20px;
  }

  .page-container {
    padding: 16px;
  }

  .audio-indicator {
    top: 12px;
    right: 12px;
    padding: 6px 10px;
    font-size: 11px;
  }

  .audio-icon {
    font-size: 14px;
  }

  .audio-tip {
    font-size: 10px;
  }

  .hint-text {
    font-size: 12px;
  }
}

@media (max-height: 600px) {
  .page-container {
    padding: 12px;
  }

  .page-navigation {
    padding: 12px 16px 16px;
  }

  .audio-indicator {
    top: 8px;
    right: 8px;
    padding: 4px 8px;
  }
}
</style>
