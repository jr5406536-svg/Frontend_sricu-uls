<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api, errorMessage } from '../services/api'
import AsyncState from '../components/AsyncState.vue'
import ResourceCard from '../components/ResourceCard.vue'
const router = useRouter(), query = ref(''), recent = ref([]), loading = ref(true), error = ref('')
const communities = [
  { title:'Facultades y carreras', description:'Producción académica organizada por área.', label:'Explorar colecciones', path:'/comunidades' },
  { title:'Investigación', description:'Artículos, informes y producción científica.', label:'Consultar recursos', path:'/explorar?type=documento' },
  { title:'FESOL histórico', description:'Proyectos de software libre recuperados.', label:'Explorar proyectos', path:'/explorar?type=proyecto' },
]
async function load() { loading.value=true; error.value=''; try { recent.value=(await api.get('/resources', { params:{ per_page:3, sort:'published_at', direction:'desc', status:'publicado' } })).data.data } catch(e) { error.value=errorMessage(e) } finally { loading.value=false } }
function search() { router.push({path:'/explorar',query:query.value.trim()?{q:query.value.trim()}:{}}) }
onMounted(load)
</script>
<template>
  <section class="welcome-hero" aria-labelledby="welcome-title">
    <div class="welcome-copy">
      <img class="welcome-logo" src="/images/uls-logo.png" alt="Universidad Luterana Salvadoreña" width="1771" height="798" />
      <p class="welcome-eyebrow">BIENVENIDO A NUESTRO REPOSITORIO</p>
      <h1 id="welcome-title">Conocimiento de la ULS, <span>al alcance de todos</span></h1>
      <p class="welcome-description">Encuentre tesis, investigaciones, proyectos y recursos académicos. Un espacio para descubrir, aprender y compartir lo que construimos como comunidad.</p>
      <form class="welcome-search" @submit.prevent="search">
        <label for="home-search">¿Qué le gustaría descubrir hoy?</label>
        <div class="search-row"><q-input id="home-search" v-model="query" outlined dense placeholder="Título o tema de interés" maxlength="255" aria-label="Buscar en el repositorio"><template #prepend><q-icon name="search" color="secondary" /></template></q-input><q-btn unelevated color="primary" type="submit" label="Buscar" /></div>
      </form>
      <div class="welcome-note"><span class="welcome-note-line" />El conocimiento crece cuando lo compartimos.</div>
    </div>
    <figure class="welcome-visual">
      <img src="/images/biblioteca-bienvenida.jpg" alt="Estanterías con libros en una biblioteca" width="1920" height="1279" fetchpriority="high" />
      <figcaption><span>CONSTRUIMOS CONOCIMIENTO, JUNTOS</span><strong>Ideas que conectan.<br>Conocimiento que transforma.</strong></figcaption>
    </figure>
  </section>
  <section class="home-section"><h2>Explorar por comunidades</h2><div class="card-grid"><router-link v-for="item in communities" :key="item.title" :to="item.path" class="collection-card"><h3>{{ item.title }}</h3><p>{{ item.description }}</p><span class="tag">{{ item.label }}</span></router-link></div></section>
  <section class="home-section"><h2>Envíos recientes</h2><AsyncState :loading="loading" :error="error" :empty="!recent.length" @retry="load"><div class="card-grid"><ResourceCard v-for="r in recent" :key="r.id" :resource="r" compact /></div></AsyncState></section>
</template>

<style scoped>
.welcome-hero{display:grid;grid-template-columns:1.05fr 1fr;background:#fff;border:1px solid #dce4ed;border-radius:20px;overflow:hidden;margin:12px 0 42px;box-shadow:0 12px 40px rgba(23,59,99,.04)}
.welcome-copy{padding:34px 36px 32px;min-width:0;align-self:center}
.welcome-logo{width:204px;height:auto;display:block;margin-bottom:30px}
.welcome-eyebrow{font-size:11px;letter-spacing:1.7px;font-weight:700;color:#2869a6;margin-bottom:14px}
.welcome-copy h1{font-size:36px;line-height:1.2;letter-spacing:-1.1px;color:#173b63;margin-bottom:18px;max-width:540px}
.welcome-copy h1 span{color:#2869a6}
.welcome-description{font-size:14px;line-height:1.8;color:#63748a;margin-bottom:26px;max-width:490px}
.welcome-search label{display:block;font-size:12px;font-weight:600;color:#233244;margin-bottom:10px}
.welcome-search .search-row{gap:10px}
.welcome-search .q-btn{min-width:100px}
.welcome-note{display:flex;align-items:center;gap:10px;font-size:11px;color:#63748a;margin-top:25px}
.welcome-note-line{width:24px;height:3px;background:#ffb322;border-radius:2px;flex-shrink:0}
.welcome-visual{margin:0;position:relative;min-height:490px;background:#e6f0f8}
.welcome-visual>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:60% center}
.welcome-visual:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,transparent 48%,rgba(12,31,52,.82) 100%)}
.welcome-visual figcaption{position:absolute;bottom:30px;left:30px;right:24px;z-index:1;color:white}
.welcome-visual figcaption span{display:block;font-size:10px;font-weight:600;letter-spacing:1.6px;margin-bottom:10px;color:#ffcf76}
.welcome-visual figcaption strong{font-size:24px;line-height:1.35;font-weight:600;letter-spacing:-.3px}
.home-section h2{color:#173b63}
.home-section .collection-card{border-radius:12px;padding:22px;min-height:155px;border-top:3px solid #2869a6}
.home-section .collection-card:nth-child(2){border-top-color:#e3a32a}
.home-section .collection-card:nth-child(3){border-top-color:#6b8332}
@media(max-width:1050px){.welcome-copy{padding:28px}.welcome-copy h1{font-size:30px}.welcome-logo{width:180px;margin-bottom:24px}.welcome-search .search-row{flex-wrap:wrap}.welcome-search .q-field{min-width:100%}.welcome-search .q-btn{width:100%}}
@media(max-width:760px){.welcome-hero{grid-template-columns:1fr;margin-top:16px;margin-bottom:30px;border-radius:16px}.welcome-copy{padding:26px 22px}.welcome-logo{width:180px}.welcome-copy h1{font-size:30px;letter-spacing:-.7px}.welcome-eyebrow{font-size:10px;letter-spacing:1.2px}.welcome-description{font-size:14px}.welcome-visual{min-height:260px}.welcome-visual>img{object-position:center 43%}.welcome-visual figcaption{bottom:22px;left:22px}.welcome-visual figcaption strong{font-size:21px}.welcome-visual figcaption span{font-size:9px}.welcome-note{font-size:10px}.home-section .collection-card{min-height:145px}}
</style>
