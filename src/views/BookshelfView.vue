<script setup>
import { ref, onMounted } from 'vue'
import { getBooks } from '../lib/store'

const books = ref([])

async function fetchBooks() {
  books.value = await getBooks()
}

onMounted(fetchBooks)

function getBookCoverUrl(book) {
  if (Array.isArray(book.pages) && book.pages.length > 0 && book.pages[0].image instanceof File) {
    return URL.createObjectURL(book.pages[0].image)
  }
  return ''
}
</script>

<template>
  <div class="bookshelf-container">
    <van-nav-bar title="🌟 宝宝的小书架 🌟" class="cute-nav" />

    <div class="bookshelf-view">
      <div v-if="books.length === 0" class="empty-state">
        <div class="empty-illustration">📚✨</div>
        <van-empty description="小书架还是空的呢～去图书管理添加第一本书吧！" class="cute-empty" />
      </div>

      <div v-else class="books-container">
        <div class="shelf-header">
          <h2 class="shelf-title">我的书本们 📖</h2>
          <p class="book-count">共 {{ books.length }} 本书</p>
        </div>

        <div class="books-grid">
          <div
            v-for="book in books"
            :key="book.id"
            class="book-item"
            @click="$router.push(`/book/${book.id}`)"
          >
            <div class="book-cover">
              <van-image
                width="100%"
                height="180"
                :src="getBookCoverUrl(book)"
                fit="cover"
                class="book-image"
                loading-icon="photo"
              >
                <template #error>
                  <div class="book-placeholder">📖</div>
                </template>
              </van-image>
              <div class="book-shine"></div>
            </div>
            <div class="book-info">
              <div class="book-title">{{ book.title }}</div>
              <div class="book-pages">{{ book.pages.length }} 页</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bookshelf-container {
  min-height: 100vh;
  background: var(--color-background);
}

.cute-nav {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-soft) 100%);
  color: white;
  box-shadow: 0 2px 20px rgba(255, 139, 148, 0.3);
}

.cute-nav :deep(.van-nav-bar__title) {
  color: white;
  font-weight: bold;
  font-size: 18px;
}

.bookshelf-view {
  padding: 20px 16px 100px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-illustration {
  font-size: 80px;
  margin-bottom: 20px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.cute-empty :deep(.van-empty__description) {
  color: var(--color-text);
  font-size: 16px;
  line-height: 1.6;
}

.shelf-header {
  text-align: center;
  margin-bottom: 24px;
}

.shelf-title {
  color: var(--color-primary);
  font-size: 24px;
  font-weight: bold;
  margin: 0 0 8px 0;
  text-shadow: 2px 2px 4px rgba(255, 139, 148, 0.2);
}

.book-count {
  color: var(--color-text);
  font-size: 14px;
  margin: 0;
  opacity: 0.8;
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 20px;
  justify-items: center;
}

.book-item {
  cursor: pointer;
  transition: all 0.3s ease;
  max-width: 160px;
}

.book-item:hover {
  transform: translateY(-8px);
}

.book-item:active {
  transform: translateY(-4px) scale(0.98);
}

.book-cover {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  box-shadow:
    0 8px 25px rgba(0, 0, 0, 0.15),
    0 4px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 12px;
  background: linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%);
}

.book-image {
  border-radius: 12px;
  transition: transform 0.3s ease;
}

.book-item:hover .book-image {
  transform: scale(1.05);
}

.book-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 180px;
  font-size: 48px;
  background: linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-soft) 100%);
  color: white;
}

.book-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: left 0.6s ease;
}

.book-item:hover .book-shine {
  left: 100%;
}

.book-info {
  text-align: center;
}

.book-title {
  font-size: 14px;
  font-weight: bold;
  color: var(--color-heading);
  margin-bottom: 4px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.book-pages {
  font-size: 12px;
  color: var(--color-text);
  opacity: 0.7;
}

/* 响应式设计 */
@media (min-width: 640px) {
  .books-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 24px;
  }

  .book-item {
    max-width: 180px;
  }
}

@media (max-width: 480px) {
  .bookshelf-view {
    padding: 16px 12px 100px;
  }

  .books-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 16px;
  }

  .book-item {
    max-width: 140px;
  }

  .book-cover {
    margin-bottom: 8px;
  }

  .shelf-title {
    font-size: 20px;
  }
}
</style>
