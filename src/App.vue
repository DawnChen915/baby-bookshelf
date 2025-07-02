<script setup>
import { RouterView } from 'vue-router'
import { ref, onMounted, watch } from 'vue'
// 主题状态管理
const isDark = ref(true)

// 初始化主题
onMounted(() => {
  // 检查系统主题偏好
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  isDark.value = mediaQuery.matches

  mediaQuery.addEventListener('change', (e) => {
    isDark.value = e.matches
  })
})

// 监听主题变化并应用到文档
watch(
  isDark,
  (newValue) => {
    document.documentElement.setAttribute('data-theme', newValue ? 'dark' : 'light')
  },
  { immediate: true },
)
</script>

<template>
  <van-config-provider :theme="isDark ? 'dark' : 'light'">
    <RouterView />
    <van-tabbar route safe-area-inset-bottom>
      <van-tabbar-item replace to="/" icon="home-o">
        <span>宝宝书架</span>
        <template #icon>
          <div class="custom-icon">📚</div>
        </template>
      </van-tabbar-item>
      <van-tabbar-item replace to="/admin" icon="setting-o">
        <span>图书管理</span>
        <template #icon>
          <div class="custom-icon">⚙️</div>
        </template>
      </van-tabbar-item>
      <van-tabbar-item replace to="/about" icon="info-o">
        <span>关于</span>
        <template #icon>
          <div class="custom-icon">ℹ️</div>
        </template>
      </van-tabbar-item>
    </van-tabbar>
  </van-config-provider>
</template>

<style>
/* Global styles can go here */
.custom-icon {
  font-size: 24px;
  line-height: 1;
}

/* 自定义 Vant 主题色 */
:root {
  --van-primary-color: var(--color-primary);
  --van-success-color: var(--color-secondary);
  --van-warning-color: var(--color-accent);
  --van-danger-color: #ff6b6b;
  --van-info-color: #74c0fc;

  /* 导航栏样式 */
  --van-tabbar-background: rgba(255, 255, 255, 0.95);
  --van-tabbar-item-text-color: #8e8e93;
  --van-tabbar-item-active-color: var(--color-primary);
  --van-tabbar-item-active-background: rgba(255, 139, 148, 0.1);
}

/* 为页面添加底部间距，避免被底部导航遮挡 */
.van-tabbar + * {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
