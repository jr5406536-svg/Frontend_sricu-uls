<script setup>
import { useRoute } from 'vue-router'
import PageHeading from '../components/PageHeading.vue'
const route=useRoute()
</script>
<template><PageHeading :title="route.meta.title" :subtitle="route.path==='/acceso-denegado'?'Su rol no permite abrir esta sección.':'La dirección solicitada no corresponde a una página del repositorio.'" /><q-btn color="primary" unelevated to="/" label="Volver al inicio" /></template>
