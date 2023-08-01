import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import 'virtual:uno.css'
import './style.scss'

const pinia = createPinia()

const app = createApp(App)
app.use(router)
app.use(pinia)
app.mount('#app')
