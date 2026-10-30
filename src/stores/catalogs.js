import { defineStore } from 'pinia'
import { api, unwrap } from '../services/api'
export const useCatalogs = defineStore('catalogs', {
  state: () => ({ authors: [], categories: [], collections: [], keywords: [], licenses: [], loaded: false }),
  actions: { async load(force = false) {
    if (this.loaded && !force) return
    const keys = ['authors','categories','collections','keywords','licenses']
    const responses = await Promise.all(keys.map(k => api.get(`/${k}`)))
    keys.forEach((k,i) => { this[k] = unwrap(responses[i].data) }); this.loaded = true
  } },
})
