import { createApp } from 'vue'
import App from './App.vue'
import './assets/css/styles.css'

const app = createApp(App)
// app.use(router)
// app.config.compilerOptions.isCustomElement = (tag) => tag === 'webview'
app.mount('#app')

