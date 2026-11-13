<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '../stores/auth'
import { api, errorMessage } from '../services/api'
import { statuses, statusOptions, formatDate } from '../domain'
import { TABLE_PAGE_SIZE, fetchTablePage, paginateRows } from '../services/pagination'
import PageHeading from '../components/PageHeading.vue'
import AsyncState from '../components/AsyncState.vue'
const route=useRoute(), auth=useAuth(), mode=computed(()=>route.path==='/revision'?'review':route.path==='/publicacion'?'publish':'deposits'), loading=ref(true), error=ref(''), items=ref([]), page=ref(1), last=ref(1), total=ref(0), status=ref(mode.value==='review'?'revision':mode.value==='publish'?'aprobado':null)
const columns=[{name:'title',label:'Título del recurso',field:'title',align:'left'},{name:'type',label:'Tipo',field:'type',align:'left'},{name:'status',label:'Estado',field:'status',align:'left'},{name:'date',label:'Actualizado',field:'updated_at',align:'left'},{name:'actions',label:'Acción',field:'id',align:'right'}]
async function load() {
  loading.value=true;error.value=''
  try {
    const params={page:1,per_page:TABLE_PAGE_SIZE,status:status.value||undefined,sort:'created_at',direction:'desc'}
    if(mode.value==='deposits') {
      const {data}=await api.get('/resources',{params})
      const own=data.data.filter(r=>r.owner_id===auth.user.id)
      // La API no admite owner_id: recorrer las páginas evita omitir depósitos propios.
      for(let p=2;p<=data.meta.last_page;p++) {
        const next=(await api.get('/resources',{params:{...params,page:p}})).data
        own.push(...next.data.filter(r=>r.owner_id===auth.user.id))
      }
      const result=paginateRows(own,page.value)
      total.value=result.total;last.value=result.last;page.value=result.page;items.value=result.items
    } else {
      const result=await fetchTablePage(async(p,size)=>(await api.get('/resources',{params:{...params,page:p,per_page:size}})).data,page.value)
      items.value=result.items;last.value=result.last;total.value=result.total;page.value=result.page
    }
  } catch(e){error.value=errorMessage(e)}finally{loading.value=false}
}
onMounted(load)
</script>
<template><PageHeading :title="route.meta.title" :subtitle="mode==='review'?'Verifique los depósitos recibidos y registre su decisión.':mode==='publish'?'Normalice los recursos aprobados y controle su publicación.':'Registre sus recursos, complete los archivos y consulte las observaciones.'" /><div class="toolbar"><q-select v-model="status" :options="statusOptions" emit-value map-options clearable outlined dense label="Filtrar por estado" style="min-width:230px" @update:model-value="page=1;load()" /><q-btn v-if="auth.canDeposit" color="primary" unelevated icon="add" label="Nuevo depósito" to="/depositos/nuevo" /></div><AsyncState :loading="loading" :error="error" :empty="!items.length" @retry="load"><q-table flat bordered :rows="items" :columns="columns" row-key="id" hide-pagination :pagination="{rowsPerPage:0}"><template #body-cell-title="props"><q-td :props="props"><router-link :to="`/recursos/${props.row.id}`" class="table-link">{{ props.row.title }}</router-link></q-td></template><template #body-cell-type="props"><q-td :props="props">{{ props.value==='proyecto'?'Proyecto':'Documento' }}</q-td></template><template #body-cell-status="props"><q-td :props="props"><span :class="['tag',`status-${props.value}`]">{{ statuses[props.value] }}</span></q-td></template><template #body-cell-date="props"><q-td :props="props">{{ formatDate(props.value) }}</q-td></template><template #body-cell-actions="props"><q-td :props="props"><q-btn flat color="primary" :label="mode==='review'?'Revisar':mode==='publish'?'Ver y publicar':'Abrir depósito'" :to="`/recursos/${props.row.id}`" /></q-td></template></q-table></AsyncState><div v-if="!error" class="pagination"><span class="muted q-mr-md">10 registros por página</span><q-pagination v-model="page" :max="last" :max-pages="5" direction-links :disable="loading" aria-label="Paginación de registros" @update:model-value="load" /></div><p class="muted q-mt-md">{{ total }} recursos visibles para su cuenta.</p></template>
