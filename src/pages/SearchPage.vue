<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCatalogs } from '../stores/catalogs'
import { api, errorMessage, unwrap } from '../services/api'
import { types } from '../domain'
import PageHeading from '../components/PageHeading.vue'
import AsyncState from '../components/AsyncState.vue'
import ResourceCard from '../components/ResourceCard.vue'
const route = useRoute(), router = useRouter(), catalog = useCatalogs()
const filters = reactive({ q:route.query.q || '', type:route.query.type || null, category_id:route.query.category_id ? Number(route.query.category_id):null, collection_id:route.params.id?Number(route.params.id):route.query.collection_id?Number(route.query.collection_id):null, author_id:route.query.author_id?Number(route.query.author_id):null, keyword_id:route.query.keyword_id?Number(route.query.keyword_id):null, date_from:route.query.date_from||'', date_to:route.query.date_to||'', sort:route.query.sort||'published_at', direction:route.query.direction||'desc' })
const items=ref([]), meta=ref({current_page:1,last_page:1,total:0}), loading=ref(true), error=ref(''), collection=ref(null), semantic=ref(''), semanticBusy=ref(false)
async function load(page=Number(route.query.page)||1) {
  loading.value=true; error.value=''
  try {
    const params={...filters,page,per_page:10,status:'publicado'}
    Object.keys(params).forEach(k=>{if(params[k]===null||params[k]==='')delete params[k]})
    const {data}=await api.get('/resources',{params}); items.value=data.data; meta.value=data.meta
  } catch(e) { error.value=errorMessage(e) } finally { loading.value=false }
}
function apply(page=1) { const query = Object.fromEntries(Object.entries({...filters,page}).filter(([,v])=>v!==null&&v!=='')); router.push({path:route.path,query}) }
function clear() { router.push({path:route.path,query:{}}) }
async function semanticSearch() { semanticBusy.value=true; try { const {data}=await api.get('/resources/semantic',{params:{q:filters.q}}); semantic.value=data.message || 'No hay recursos relacionados.' } catch(e) { semantic.value=errorMessage(e) } finally { semanticBusy.value=false } }
onMounted(async()=>{ await load(); try { await catalog.load(); if(route.params.id) collection.value=unwrap((await api.get(`/collections/${route.params.id}`)).data) } catch(e) { error.value=errorMessage(e) } })
</script>
<template>
  <PageHeading :title="collection?.name || (route.path==='/novedades'?'Novedades del repositorio':filters.q?`Resultados para «${filters.q}»`:'Explorar el repositorio')" :subtitle="collection?.description || 'Busque recursos publicados y combine los filtros para acotar los resultados.'" />
  <form class="search-panel" @submit.prevent="apply()"><label for="results-search">Buscar en el repositorio</label><div class="search-row"><q-input id="results-search" v-model="filters.q" dense outlined maxlength="255" placeholder="Título o contenido del recurso" /><q-btn color="primary" unelevated type="submit" label="Buscar" /></div></form>
  <div class="filters-layout"><form class="surface filter-panel" @submit.prevent="apply()"><h2>Filtros</h2><div class="filter-fields"><q-input v-model="filters.date_from" type="date" outlined dense stack-label label="Desde" /><q-input v-model="filters.date_to" type="date" outlined dense stack-label label="Hasta" :min="filters.date_from" /><q-select v-model="filters.author_id" :options="catalog.authors" option-label="name" option-value="id" emit-value map-options clearable outlined dense label="Autoría" /><q-select v-model="filters.keyword_id" :options="catalog.keywords" option-label="name" option-value="id" emit-value map-options clearable outlined dense label="Materia / palabra clave" /><q-select v-model="filters.type" :options="types" emit-value map-options clearable outlined dense label="Tipo de recurso" /><q-select v-model="filters.category_id" :options="catalog.categories" option-label="name" option-value="id" emit-value map-options clearable outlined dense label="Categoría" /><q-select v-if="!route.params.id" v-model="filters.collection_id" :options="catalog.collections" option-label="name" option-value="id" emit-value map-options clearable outlined dense label="Colección" /></div><q-btn color="primary" unelevated label="Aplicar filtros" type="submit" class="full-width q-mb-sm" /><q-btn outline color="primary" label="Limpiar filtros" class="full-width" @click="clear" /></form>
  <section><div class="toolbar"><span aria-live="polite">{{ meta.total }} recursos encontrados</span><div class="view-options"><q-select v-model="filters.sort" :options="[{label:'Más recientes',value:'published_at'},{label:'Título',value:'title'},{label:'Fecha del recurso',value:'resource_date'}]" emit-value map-options label="Ordenar por" outlined dense @update:model-value="apply()" /><q-btn flat round :icon="filters.direction==='asc'?'arrow_upward':'arrow_downward'" aria-label="Cambiar dirección del orden" @click="filters.direction=filters.direction==='asc'?'desc':'asc';apply()" /></div></div>
  <AsyncState :loading="loading" :error="error" :empty="!items.length" @retry="load()"><div class="results-list"><ResourceCard v-for="r in items" :key="r.id" :resource="r" /></div><div class="pagination"><q-pagination :model-value="meta.current_page" :max="meta.last_page" :max-pages="5" direction-links color="primary" @update:model-value="apply" /></div></AsyncState>
  <div v-if="filters.q" class="q-mt-lg"><q-btn flat color="secondary" icon="auto_awesome" label="Consultar búsqueda semántica opcional" :loading="semanticBusy" @click="semanticSearch" /><p v-if="semantic" class="notice" role="status">{{ semantic }}</p></div></section></div>
</template>
