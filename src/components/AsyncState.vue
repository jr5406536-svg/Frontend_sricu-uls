<script setup>
defineProps({ loading: Boolean, error: String, empty: Boolean })
defineEmits(['retry'])
</script>
<template>
  <div v-if="loading" class="state-panel" role="status"><q-spinner color="primary" size="32px" /><p>Cargando información…</p></div>
  <div v-else-if="error" class="state-panel" role="alert"><q-icon name="cloud_off" size="32px" color="negative" /><p>{{ error }}</p><q-btn outline color="primary" label="Reintentar" @click="$emit('retry')" /></div>
  <div v-else-if="empty" class="state-panel"><q-icon name="search_off" size="36px" color="secondary" /><h3>No hay registros para mostrar</h3><p>Pruebe otros criterios o vuelva más tarde.</p></div>
  <slot v-else />
</template>
