import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuth } from './stores/auth'
const router = createRouter({ history: createWebHashHistory(), scrollBehavior: to => to.hash ? { el: to.hash, top: 20 } : { top: 0 }, routes: [
  { path: '/', component: () => import('./pages/HomePage.vue'), meta: { title: 'Inicio' } },
  { path: '/explorar', component: () => import('./pages/SearchPage.vue'), meta: { title: 'Explorar' } },
  { path: '/novedades', component: () => import('./pages/SearchPage.vue'), meta: { title: 'Novedades' } },
  { path: '/comunidades', component: () => import('./pages/CollectionsPage.vue'), meta: { title: 'Comunidades y colecciones' } },
  { path: '/colecciones/:id', component: () => import('./pages/SearchPage.vue'), meta: { title: 'Colección' } },
  { path: '/recursos/:id', component: () => import('./pages/ResourcePage.vue'), meta: { title: 'Ficha del recurso' } },
  { path: '/login', component: () => import('./pages/LoginPage.vue'), meta: { title: 'Iniciar sesión' } },
  { path: '/depositos', component: () => import('./pages/WorkspacePage.vue'), meta: { title: 'Mis depósitos', auth: true, capability: 'canDeposit' } },
  { path: '/depositos/nuevo', component: () => import('./pages/DepositPage.vue'), meta: { title: 'Nuevo depósito', auth: true, capability: 'canDeposit' } },
  { path: '/depositos/:id/editar', component: () => import('./pages/DepositPage.vue'), meta: { title: 'Editar depósito', auth: true, capability: 'canDeposit' } },
  { path: '/revision', component: () => import('./pages/WorkspacePage.vue'), meta: { title: 'Bandeja de revisión', auth: true, capability: 'canReview' } },
  { path: '/publicacion', component: () => import('./pages/WorkspacePage.vue'), meta: { title: 'Publicación', auth: true, capability: 'canManage' } },
  { path: '/estadisticas', component: () => import('./pages/StatsPage.vue'), meta: { title: 'Estadísticas', auth: true, capability: 'canManage' } },
  { path: '/administracion', component: () => import('./pages/AdminPage.vue'), meta: { title: 'Administración', auth: true, capability: 'canManage' } },
  { path: '/auditoria', component: () => import('./pages/AuditPage.vue'), meta: { title: 'Auditoría', auth: true, capability: 'canManage' } },
  { path: '/ayuda', component: () => import('./pages/HelpPage.vue'), meta: { title: 'Ayuda' } },
  { path: '/acceso-denegado', component: () => import('./pages/MessagePage.vue'), meta: { title: 'Acceso restringido' } },
  { path: '/:pathMatch(.*)*', component: () => import('./pages/MessagePage.vue'), meta: { title: 'Página no encontrada' } },
] })
router.beforeEach(async to => {
  const auth = useAuth()
  try { await auth.restore() } catch { if (to.meta.auth) return { path: '/login', query: { redirect: to.fullPath, error: 'conexion' } } }
  if (to.meta.auth && !auth.loggedIn) return { path: '/login', query: { redirect: to.fullPath } }
  if (to.meta.capability && !auth[to.meta.capability]) return '/acceso-denegado'
  document.title = `${to.meta.title} · SRICU-ULS`
})
export default router
