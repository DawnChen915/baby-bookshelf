import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Vant, { ConfigProvider } from 'vant'
import 'vant/lib/index.css'
import './assets/vant-theme.css'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Vant)

app.mount('#app')
