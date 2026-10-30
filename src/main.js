import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Quasar, Notify, Dialog, Loading } from 'quasar'
import es from 'quasar/lang/es'
import '@quasar/extras/material-icons/material-icons.css'
import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-600.css'
import '@fontsource/inter/latin-700.css'
import 'quasar/dist/quasar.css'
import './styles.css'
import App from './App.vue'
import router from './router'
createApp(App).use(createPinia()).use(Quasar, {
  plugins: { Notify, Dialog, Loading }, lang: es,
  config: { brand: { primary: '#173B63', secondary: '#2869A6', positive: '#25845B', negative: '#B42318', warning: '#B7791F' } },
}).use(router).mount('#app')
