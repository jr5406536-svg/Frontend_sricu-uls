<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCatalogs } from '../stores/catalogs'
import { errorMessage } from '../services/api'
import PageHeading from '../components/PageHeading.vue'
import AsyncState from '../components/AsyncState.vue'
const catalog = useCatalogs(), query = ref(''), loading = ref(true), error = ref('')
const items = computed(() => catalog.collections.filter(c => `${c.name} ${c.description || ''}`.toLowerCase().includes((query.value||'').toLowerCase())))
async function load() { loading.value=true; error.value=''; try { await catalog.load(true) } catch(e) { error.value=errorMessage(e) } finally { loading.value=false } }
onMounted(load)
</script>
<template><PageHeading title="Comunidades y colecciones" subtitle="Explore el conocimiento organizado en las colecciones del repositorio." /><q-input v-model="query" outlined dense clearable label="Buscar colección" class="q-mb-xl" @clear="query=''" style="max-width:670px"><template #prepend><q-icon name="search" /></template></q-input><AsyncState :loading="loading" :error="error" :empty="!items.length" @retry="load"><div class="card-grid"><router-link v-for="c in items" :key="c.id" :to="`/colecciones/${c.id}`" class="collection-card"><h3>{{ c.name }}</h3><p>{{ c.description || 'Colección de producción académica y tecnológica.' }}</p><span class="tag">{{ c.published_count ?? 0 }} recursos públicos</span></router-link></div></AsyncState></template>
