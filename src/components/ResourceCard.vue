<script setup>
import { accesses, formatDate } from '../domain'
defineProps({ resource: Object, compact: Boolean })
</script>
<template><article :class="['resource-card', { compact }]">
  <h3><router-link :to="`/recursos/${resource.id}`">{{ resource.title }}</router-link></h3>
  <p>{{ formatDate(resource.resource_date) }}<template v-if="resource.collection"> · {{ resource.collection.name }}</template></p>
  <template v-if="!compact"><p>{{ resource.authors?.map(a => a.name).join(', ') || 'Autoría no indicada' }}</p><p class="description">{{ resource.description }}</p><span class="tag">{{ accesses[resource.access_level] || resource.access_level }}</span><span class="type-label">{{ resource.type === 'proyecto' ? 'Proyecto de software' : 'Documento académico' }}</span></template>
</article></template>
