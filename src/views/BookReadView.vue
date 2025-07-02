<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getBookById } from '../lib/store'
// import { Icon } from '@iconify/vue'

const route = useRoute()
const router = useRouter()
const book = ref(null)
const currentPageIndex = ref(0)
const isPlaying = ref(false)

// 滑动相关状态
const touchStartX = ref(0)
const touchStartY = ref(0)
const touchEndX = ref(0)
const touchEndY = ref(0)
const minSwipeDistance = 50 // 最小滑动距离

const bookId = Number(route.params.id)

const currentPage = computed(() => {
  return book.value ? book.value.pages[currentPageIndex.value] : null
})

async function loadBook() {
  book.value = await getBookById(bookId)
}

function nextPage() {
  if (currentPageIndex.value < book.value.pages.length - 1) {
    currentPageIndex.value++
  }
}

function prevPage() {
  if (currentPageIndex.value > 0) {
    currentPageIndex.value--
  }
}

function goToPage(index) {
  currentPageIndex.value = index
}

// 触摸事件处理
function handleTouchStart(event) {
  touchStartX.value = event.touches[0].clientX
  touchStartY.value = event.touches[0].clientY
}

function handleTouchEnd(event) {
  touchEndX.value = event.changedTouches[0].clientX
  touchEndY.value = event.changedTouches[0].clientY
  handleSwipe()
}

function handleSwipe() {
  const deltaX = touchEndX.value - touchStartX.value
  const deltaY = touchEndY.value - touchStartY.value

  // 确保水平滑动距离大于垂直滑动距离（避免误触）
  if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
    if (deltaX > 0) {
      // 向右滑动 - 上一页
      prevPage()
    } else {
      // 向左滑动 - 下一页
      nextPage()
    }
  }
}

function handlePageClick() {
  // 点击图片播放音频（如果有的话）
  if (currentPage.value && currentPage.value.audio) {
    playAudio()
  }
}

function playAudio() {
  if (currentPage.value && currentPage.value.audio && !isPlaying.value) {
    const audioUrl = URL.createObjectURL(currentPage.value.audio)
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
}

function getPageImageUrl(page) {
  if (page && page.image instanceof File) {
    return URL.createObjectURL(page.image)
  }
  return ''
}

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
      <div
        class="page-container"
        @touchstart="handleTouchStart"
        @touchend="handleTouchEnd"
        @click="handlePageClick"
      >
        <div class="page-wrapper">
          <van-image
            v-if="currentPage && currentPage.image"
            fit="contain"
            :src="getPageImageUrl(currentPage)"
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
          <div v-if="currentPage && currentPage.audio" class="audio-indicator">
            <div class="audio-icon" :class="{ playing: isPlaying }">
              {{ isPlaying ? '🔊' : '' }}
            </div>
            <div class="audio-tip">点击图片播放声音</div>
          </div>
        </div>
      </div>

      <!-- 页面指示器 -->
      <div v-if="false" class="page-navigation">
        <div class="page-dots">
          <span
            v-for="(page, index) in book.pages"
            :key="index"
            :class="['page-dot', { active: index === currentPageIndex }]"
            @click="goToPage(index)"
          ></span>
        </div>
        <div class="swipe-hint">
          <span class="hint-text">👈 滑动翻页 👉</span>
        </div>
      </div>
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

.page-container {
  flex: 1;
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

.page-container:active .page-wrapper {
  transform: scale(0.98);
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
}

.swipe-hint {
  opacity: 0.6;
  animation: fadeInOut 3s ease-in-out infinite;
}

.hint-text {
  font-size: 14px;
  color: var(--color-text);
  font-weight: 500;
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

@keyframes fadeInOut {
  0%,
  100% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.8;
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
