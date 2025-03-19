import { createApp } from 'vue'
import App from './App.vue'
// import router from './router'
// import 'bootstrap/dist/css/bootstrap.min.css'
import './assets/css/styles.css'

const app = createApp(App)
// app.use(router)
// app.config.compilerOptions.isCustomElement = (tag) => tag === 'webview'
app.mount('#app')

