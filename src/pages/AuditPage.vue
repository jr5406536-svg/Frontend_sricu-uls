<script setup>
import { ref, reactive, onMounted } from 'vue'
import { api, errorMessage } from '../services/api'
import { formatDate } from '../domain'
import { auditObject, auditAction, auditDetails } from '../services/audit-format'
import { fetchTablePage } from '../services/pagination'
import PageHeading from '../components/PageHeading.vue'
import AsyncState from '../components/AsyncState.vue'
const loading=ref(true), error=ref(''), items=ref([]), page=ref(1), last=ref(1), filters=reactive({action:'',from:'',to:''})
const columns=[{name:'date',label:'Fecha',field:r=>formatDate(r.created_at),align:'left'},{name:'user',label:'Actor',field:r=>r.user||'Sistema',align:'left'},{name:'action',label:'Acción',field:r=>auditAction(r.action),align:'left'},{name:'object',label:'Objeto',field:auditObject,align:'left'},{name:'metadata',label:'Detalle',field:'metadata',align:'left'}]
async function load(){loading.value=true;error.value='';try{const result=await fetchTablePage(async(p,size)=>(await api.get('/audit-logs',{params:{...Object.fromEntries(Object.entries(filters).filter(([,v])=>v)),page:p,per_page:size}})).data,page.value);items.value=result.items;page.value=result.page;last.value=result.last}catch(e){error.value=errorMessage(e)}finally{loading.value=false}}
onMounted(load)
</script>
<template><PageHeading title="Auditoría y trazabilidad" subtitle="Consulte los eventos, cambios y decisiones registrados por el servidor." /><q-form class="toolbar" @submit="page=1;load()"><q-input v-model="filters.action" outlined dense label="Acción exacta" placeholder="recurso.publicado" maxlength="100" /><q-input v-model="filters.from" type="date" outlined dense stack-label label="Desde" /><q-input v-model="filters.to" type="date" outlined dense stack-label label="Hasta" :min="filters.from" /><q-btn color="primary" label="Aplicar filtros" type="submit" /></q-form><AsyncState :loading="loading" :error="error" :empty="!items.length" @retry="load"><q-table flat bordered :rows="items" :columns="columns" row-key="id" hide-pagination :pagination="{rowsPerPage:0}"><template #body-cell-metadata="props"><q-td :props="props"><dl v-if="auditDetails(props.row.metadata).length" class="audit-details"><div v-for="(detail,index) in auditDetails(props.row.metadata)" :key="index"><dt>{{ detail.label }}:</dt><dd>{{ detail.value }}</dd></div></dl><span v-else class="muted">Sin detalles adicionales</span></q-td></template></q-table></AsyncState><div v-if="!error" class="pagination"><span class="muted q-mr-md">10 registros por página</span><q-pagination v-model="page" :max="last" :max-pages="5" direction-links :disable="loading" aria-label="Paginación de registros" @update:model-value="load" /></div></template>

<style scoped>
.audit-details{margin:0;max-width:420px}.audit-details>div{margin:4px 0;line-height:1.5;overflow-wrap:anywhere}.audit-details dt{display:inline;font-weight:600;color:#173b63}.audit-details dd{display:inline;margin-left:6px}
</style>
