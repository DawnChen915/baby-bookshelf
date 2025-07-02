<template>
  <div class="about-container">
    <van-nav-bar title="关于宝宝书架" left-arrow @click-left="$router.back()" class="about-nav" />

    <div class="about-content">
      <div class="app-info">
        <div class="app-icon">📚</div>
        <h1 class="app-title">宝宝书架</h1>
        <p class="app-version">版本 1.0.0</p>
      </div>

      <div class="features-section">
        <h2 class="section-title">✨ 特色功能</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">📖</div>
            <h3>电子绘本</h3>
            <p>支持图片和音频，让宝宝享受完整的阅读体验</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🎵</div>
            <h3>语音播放</h3>
            <p>每页都可以添加音频，妈妈的声音陪伴宝宝</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📱</div>
            <h3>简单操作</h3>
            <p>专为宝宝设计的大按钮和简单交互</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">💾</div>
            <h3>本地存储</h3>
            <p>所有数据存储在本地，安全可靠</p>
          </div>
        </div>
      </div>

      <div class="info-section">
        <h2 class="section-title">💡 使用说明</h2>
        <div class="info-cards">
          <div class="info-card">
            <div class="step-number">1</div>
            <div class="step-content">
              <h4>添加图书</h4>
              <p>在"图书管理"中点击"添加新书"，输入书名</p>
            </div>
          </div>
          <div class="info-card">
            <div class="step-number">2</div>
            <div class="step-content">
              <h4>上传内容</h4>
              <p>为每一页添加图片和音频文件</p>
            </div>
          </div>
          <div class="info-card">
            <div class="step-number">3</div>
            <div class="step-content">
              <h4>开始阅读</h4>
              <p>在"宝宝书架"中点击图书封面开始阅读</p>
            </div>
          </div>
        </div>
      </div>

      <div class="footer-section">
        <div class="love-message">
          <div class="heart-icon">💖</div>
          <p>用心为宝宝打造的专属阅读空间</p>
        </div>
        <div class="copyright">
          <p>© 2025 宝宝书架 · 让阅读更有趣</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup></script>

<style scoped>
.about-container {
  min-height: 100vh;
  background: var(--color-background);
}

.about-nav {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  color: white;
  box-shadow: 0 2px 20px rgba(255, 139, 148, 0.3);
}

.about-nav :deep(.van-nav-bar__title) {
  color: white;
  font-weight: bold;
  font-size: 18px;
}

.about-nav :deep(.van-nav-bar__left .van-icon) {
  color: white;
  font-size: 20px;
}

.about-content {
  padding: 30px 20px 100px;
  max-width: 600px;
  margin: 0 auto;
}

.app-info {
  text-align: center;
  margin-bottom: 40px;
}

.app-icon {
  font-size: 80px;
  margin-bottom: 16px;
  animation: float 3s ease-in-out infinite;
}

.app-title {
  font-size: 32px;
  font-weight: bold;
  color: var(--color-primary);
  margin: 0 0 8px 0;
  text-shadow: 2px 2px 4px rgba(255, 139, 148, 0.2);
}

.app-version {
  color: var(--color-text);
  font-size: 16px;
  opacity: 0.8;
  margin: 0;
}

.section-title {
  font-size: 24px;
  font-weight: bold;
  color: var(--color-heading);
  margin: 0 0 20px 0;
  text-align: center;
}

.theme-section {
  margin-bottom: 40px;
}

.theme-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.theme-info h4 {
  font-size: 18px;
  font-weight: bold;
  color: var(--color-heading);
  margin: 0 0 8px 0;
}

.theme-info p {
  color: var(--color-text);
  line-height: 1.6;
  margin: 0;
  font-size: 14px;
}

.features-section {
  margin-bottom: 40px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.feature-card {
  /* background: rgba(255, 255, 255, 0.9); */
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.feature-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.feature-card h3 {
  font-size: 18px;
  font-weight: bold;
  color: var(--color-heading);
  margin: 0 0 12px 0;
}

.feature-card p {
  color: var(--color-text);
  line-height: 1.6;
  margin: 0;
  font-size: 14px;
}

.info-section {
  margin-bottom: 40px;
}

.info-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-card {
  display: flex;
  align-items: center;
  /* background: rgba(255, 255, 255, 0.9); */
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-soft) 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
  margin-right: 20px;
  flex-shrink: 0;
}

.step-content h4 {
  font-size: 16px;
  font-weight: bold;
  color: var(--color-heading);
  margin: 0 0 8px 0;
}

.step-content p {
  color: var(--color-text);
  line-height: 1.6;
  margin: 0;
  font-size: 14px;
}

.footer-section {
  text-align: center;
  margin-top: 50px;
}

.love-message {
  margin-bottom: 24px;
}

.heart-icon {
  font-size: 32px;
  margin-bottom: 12px;
  animation: pulse 2s ease-in-out infinite;
}

.love-message p {
  color: var(--color-primary);
  font-size: 18px;
  font-weight: bold;
  margin: 0;
  text-shadow: 1px 1px 2px rgba(255, 139, 148, 0.2);
}

.copyright p {
  color: var(--color-text);
  font-size: 14px;
  opacity: 0.7;
  margin: 0;
}

.theme-section {
  margin-bottom: 40px;
}

.theme-card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.3s ease;
}

.theme-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
}

.theme-info h4 {
  font-size: 16px;
  font-weight: bold;
  color: var(--color-heading);
  margin: 0 0 8px 0;
}

.theme-info p {
  color: var(--color-text);
  line-height: 1.6;
  margin: 0;
  font-size: 14px;
}

/* 深色模式下的主题卡片 */
[data-theme='dark'] .theme-card {
  background: var(--color-background-soft);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .about-content {
    padding: 20px 16px 100px;
  }

  .features-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .feature-card {
    padding: 20px;
  }

  .app-title {
    font-size: 28px;
  }

  .section-title {
    font-size: 20px;
  }

  .info-card {
    padding: 16px;
  }

  .step-number {
    width: 32px;
    height: 32px;
    font-size: 16px;
    margin-right: 16px;
  }
}

@media (max-width: 480px) {
  .features-grid {
    gap: 12px;
  }

  .feature-card {
    padding: 16px;
  }

  .feature-icon {
    font-size: 40px;
  }

  .app-icon {
    font-size: 60px;
  }
}
</style>
