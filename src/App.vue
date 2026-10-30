<script setup>
import { useAuth } from './stores/auth'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { onMounted, onUnmounted } from 'vue'
import { errorMessage } from './services/api'
const auth = useAuth(), router = useRouter(), $q = useQuasar()
async function logout() { try { await auth.logout(); router.push('/') } catch(e) { $q.notify({ type:'negative', message:errorMessage(e) }) } }
function expired() { auth.clear(); $q.notify({ type:'warning', message:'Su sesión expiró. Inicie sesión nuevamente.' }); if (router.currentRoute.value.meta.auth) router.push({ path:'/login', query:{ redirect:router.currentRoute.value.fullPath } }) }
onMounted(() => window.addEventListener('sricu-session-expired', expired))
onUnmounted(() => window.removeEventListener('sricu-session-expired', expired))
</script>
<template>
  <a class="skip-link" href="#contenido">Saltar al contenido</a>
  <div class="app-shell">
    <header class="institutional-header"><div class="header-inner"><router-link to="/" class="brand" aria-label="ULS SRICU - Inicio"><img class="header-logo" src="/images/uls-logo-blanco.png" alt="Universidad Luterana Salvadoreña" width="751" height="338" /><span class="brand-system">SRICU</span></router-link><span class="brand-description">Repositorio Inteligente de Conocimiento</span><div class="header-actions"><span lang="es">ES</span><router-link to="/ayuda">Ayuda</router-link><router-link v-if="!auth.loggedIn" to="/login">Iniciar sesión</router-link><q-btn v-else flat no-caps :label="auth.user.name" icon-right="expand_more"><q-menu><q-list><q-item><q-item-section><strong>{{ auth.user.name }}</strong><small>{{ auth.user.roles.join(' · ') }}</small></q-item-section></q-item><q-item clickable v-close-popup @click="logout"><q-item-section>Cerrar sesión</q-item-section></q-item></q-list></q-menu></q-btn></div></div></header>
    <nav class="main-nav" aria-label="Navegación principal"><div class="nav-inner"><router-link to="/" exact-active-class="active">Inicio</router-link><router-link to="/comunidades" active-class="active">Comunidades</router-link><router-link to="/explorar" active-class="active">Explorar</router-link><router-link to="/novedades" active-class="active">Novedades</router-link><router-link to="/estadisticas" active-class="active">Estadísticas</router-link></div></nav>
    <nav v-if="auth.loggedIn" class="workspace-nav" aria-label="Área de trabajo"><router-link v-if="auth.canDeposit" to="/depositos">Mis depósitos</router-link><router-link v-if="auth.canReview" to="/revision">Revisión</router-link><router-link v-if="auth.canManage" to="/publicacion">Publicación</router-link><router-link v-if="auth.canManage" to="/administracion">Administración</router-link><router-link v-if="auth.canManage" to="/auditoria">Auditoría</router-link></nav>
    <main id="contenido" class="page-container" tabindex="-1"><div class="audience"><span class="tag">{{ auth.user?.roles.join(' · ').toUpperCase() || 'PÚBLICO' }}</span></div><router-view :key="$route.fullPath" /></main>
    <footer class="site-footer"><span>Universidad Luterana Salvadoreña · SRICU ULS</span><router-link to="/ayuda#privacidad">Privacidad</router-link><span>·</span><router-link to="/ayuda#uso">Uso</router-link><span>·</span><router-link to="/ayuda#contacto">Contacto</router-link></footer>
  </div>
</template>

<style scoped>
.header-inner{gap:32px}.brand{display:flex;align-items:center;gap:14px}.brand:hover{text-decoration:none}.header-logo{display:block;width:124px;height:56px;object-fit:contain;background:transparent;padding:0;border-radius:0;flex-shrink:0}.brand .brand-system{padding:0 0 0 14px;border-left:1px solid rgba(255,255,255,.35);font-size:22px}
@media(max-width:760px){.header-inner{gap:12px}.brand{gap:10px}.header-logo{width:94px;height:44px;padding:0}.brand .brand-system{font-size:17px;padding-left:10px}.header-actions{gap:12px}}
</style>
