import { defineStore } from 'pinia'
import { api, unwrap } from '../services/api'
export const useAuth = defineStore('auth', {
  state: () => ({ user: null, ready: false }),
  getters: {
    loggedIn: state => !!state.user,
    canDeposit: state => !!state.user?.is_active && state.user.roles.some(r => ['administrador','gestor','depositante'].includes(r)),
    canReview: state => !!state.user?.is_active && state.user.roles.some(r => ['administrador','revisor'].includes(r)),
    canManage: state => !!state.user?.is_active && state.user.roles.some(r => ['administrador','gestor'].includes(r)),
    isAdmin: state => !!state.user?.is_active && state.user.roles.includes('administrador'),
  },
  actions: {
    async restore() {
      if (this.ready) return
      if (sessionStorage.getItem('sricu-token')) {
        try { this.user = unwrap((await api.get('/me')).data) } catch (e) { if ([401,403].includes(e.response?.status)) sessionStorage.removeItem('sricu-token'); else throw e }
      }
      this.ready = true
    },
    async login(credentials) {
      const { data } = await api.post('/login', credentials)
      sessionStorage.setItem('sricu-token', data.access_token)
      this.user = unwrap(data.user); this.ready = true
    },
    async logout() { await api.post('/logout'); this.clear() },
    clear() { sessionStorage.removeItem('sricu-token'); this.user = null; this.ready = true },
  },
})
