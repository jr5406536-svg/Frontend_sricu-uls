<script setup>
import { ref, reactive, onMounted } from 'vue'
import { api, errorMessage } from '../services/api'
import { formatDate } from '../domain'
import PageHeading from '../components/PageHeading.vue'
import AsyncState from '../components/AsyncState.vue'
const loading=ref(true), error=ref(''), items=ref([]), page=ref(1), last=ref(1), filters=reactive({action:'',from:'',to:''})
const columns=[{name:'date',label:'Fecha',field:r=>formatDate(r.created_at),align:'left'},{name:'user',label:'Actor',field:r=>r.user||'Sistema',align:'left'},{name:'action',label:'Acción',field:'action',align:'left'},{name:'object',label:'Objeto',field:r=>`${r.auditable_type||''} ${r.auditable_id||''}`,align:'left'},{name:'metadata',label:'Detalle',field:r=>JSON.stringify(r.metadata||{}),align:'left'}]
async function load(){loading.value=true;error.value='';try{const {data}=await api.get('/audit-logs',{params:{...Object.fromEntries(Object.entries(filters).filter(([,v])=>v)),page:page.value}});items.value=data.data;last.value=data.meta.last_page}catch(e){error.value=errorMessage(e)}finally{loading.value=false}}
onMounted(load)
</script>
<template><PageHeading title="Auditoría y trazabilidad" subtitle="Consulte los eventos, cambios y decisiones registrados por el servidor." /><q-form class="toolbar" @submit="page=1;load()"><q-input v-model="filters.action" outlined dense label="Acción exacta" placeholder="recurso.publicado" maxlength="100" /><q-input v-model="filters.from" type="date" outlined dense stack-label label="Desde" /><q-input v-model="filters.to" type="date" outlined dense stack-label label="Hasta" :min="filters.from" /><q-btn color="primary" label="Aplicar filtros" type="submit" /></q-form><AsyncState :loading="loading" :error="error" :empty="!items.length" @retry="load"><q-table flat bordered :rows="items" :columns="columns" row-key="id" hide-pagination :pagination="{rowsPerPage:0}" /></AsyncState><div v-if="last>1" class="pagination"><q-pagination v-model="page" :max="last" :max-pages="5" direction-links @update:model-value="load" /></div></template>
