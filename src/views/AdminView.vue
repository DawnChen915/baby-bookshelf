<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { getBooks, deleteBook } from '../lib/store'
import { showConfirmDialog } from 'vant'

const books = ref([])

async function fetchBooks() {
  books.value = await getBooks()
}

async function removeBook(id) {
  showConfirmDialog({
    title: '🤔 确认删除',
    message: '确定要删除这本书吗？删除后无法恢复哦！',
    confirmButtonText: '确定删除',
    cancelButtonText: '我再想想',
    confirmButtonColor: '#ff6b6b',
  })
    .then(async () => {
      await deleteBook(id)
      await fetchBooks()
    })
    .catch(() => {
      // do nothing
    })
}

function formatDate(date) {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diff = now - d
  const diffSeconds = Math.floor(diff / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays > 7) {
    // 超过一周显示日期
    return d.toLocaleDateString()
  } else if (diffDays >= 1) {
    return `${diffDays}天前`
  } else if (diffHours >= 1) {
    return `${diffHours}小时前`
  } else if (diffMinutes >= 1) {
    return `${diffMinutes}分钟前`
  } else {
    return '刚刚'
  }
}

onMounted(fetchBooks)
</script>

<template>
  <div class="admin-container">
    <van-nav-bar title="📚 图书管理" class="admin-nav" />

    <div class="admin-view">
      <div v-if="books.length === 0" class="empty-admin">
        <div class="empty-illustration">📝✨</div>
        <van-empty description="还没有添加任何书籍，快来添加第一本书吧！" class="cute-empty" />
        <div class="quick-add">
          <RouterLink to="/admin/book/new">
            <van-button type="primary" size="large" round icon="plus"> 🌟 添加第一本书 </van-button>
          </RouterLink>
        </div>
      </div>

      <div v-else class="books-management">
        <div class="management-header">
          <h3 class="management-title">书籍列表</h3>
          <div class="books-stats">
            <span class="stats-item">📚 {{ books.length }} 本书</span>
            <!-- <span class="stats-item">📄 {{ totalPages }} 页</span> -->
          </div>
        </div>

        <van-list class="book-list">
          <van-cell-group class="book-group">
            <van-cell v-for="book in books" :title="book.title" :key="book.id" class="book-cell">
              <template #icon>
                <div class="book-icon">📖</div>
              </template>
              <template #label>
                <span class="book-meta"
                  >{{ book.pages.length }} 页 · 创建于{{ formatDate(book.createdAt) }}</span
                >
              </template>
              <template #right-icon>
                <div class="book-actions">
                  <RouterLink :to="`/admin/book/${book.id}/edit`">
                    <van-button type="primary" size="small" round>✏️ 编辑</van-button>
                  </RouterLink>
                  <van-button
                    type="danger"
                    size="small"
                    round
                    @click="removeBook(book.id)"
                    class="delete-btn"
                  >
                    🗑️ 删除
                  </van-button>
                </div>
              </template>
            </van-cell>
          </van-cell-group>
        </van-list>
      </div>

      <div v-if="books.length > 0" class="floating-add">
        <RouterLink to="/admin/book/new">
          <van-button type="primary" round icon="plus" size="large" class="add-button">
            添加新书
          </van-button>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-container {
  min-height: 100vh;
  background: var(--color-background);
}

.admin-nav {
  background: linear-gradient(135deg, #6c757d 0%, #868e96 100%);
  color: white;
  box-shadow: 0 2px 20px rgba(108, 117, 125, 0.3);
}

.admin-nav :deep(.van-nav-bar__title) {
  color: white;
  font-weight: bold;
  font-size: 18px;
}

.admin-view {
  padding: 20px 16px 100px;
}

.empty-admin {
  text-align: center;
  padding: 60px 20px;
}

.empty-illustration {
  font-size: 80px;
  margin-bottom: 20px;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

.quick-add {
  margin-top: 32px;
}

.books-management {
  padding-bottom: 80px;
}

.management-header {
  margin-bottom: 20px;
  text-align: center;
}

.management-title {
  color: var(--color-heading);
  font-size: 20px;
  font-weight: bold;
  margin: 0 0 12px 0;
}

.books-stats {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.stats-item {
  color: var(--color-text);
  font-size: 14px;
  /* background: rgba(255, 255, 255, 0.8); */
  padding: 6px 12px;
  border-radius: 16px;
  backdrop-filter: blur(10px);
}

.book-list {
  background: transparent;
}

.book-group {
  /* background: rgba(255, 255, 255, 0.9); */
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  background: transparent;
}

.book-cell {
  background: transparent;
  padding: 16px;
  /* border-bottom: 1px solid rgba(0, 0, 0, 0.05); */
}

.book-cell:last-child {
  border-bottom: none;
}

.book-icon {
  font-size: 24px;
  margin-right: 12px;
  display: flex;
  align-items: center;
}

.book-meta {
  color: var(--color-text);
  font-size: 12px;
  opacity: 0.7;
}

.book-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.delete-btn {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%);
  border: none;
  color: white;
}

.floating-add {
  position: fixed;
  bottom: 80px;
  right: 20px;
  z-index: 1000;
}

.add-button {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-soft) 100%);
  border: none;
  box-shadow: 0 8px 25px rgba(255, 139, 148, 0.4);
  color: white;
  font-weight: bold;
  padding: 12px 20px;
  font-size: 16px;
}

.add-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(255, 139, 148, 0.5);
}

.add-button:active {
  transform: translateY(0);
}

/* 响应式设计 */
@media (max-width: 480px) {
  .admin-view {
    padding: 16px 12px 100px;
  }

  .book-actions {
    flex-direction: column;
    gap: 6px;
  }

  .floating-add {
    right: 16px;
    bottom: 70px;
  }

  .books-stats {
    flex-direction: column;
    gap: 8px;
    align-items: center;
  }
}
</style>
