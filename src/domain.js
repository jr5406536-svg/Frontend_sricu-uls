export const statuses = { borrador: 'Borrador', revision: 'En revisión', observado: 'Observado', aprobado: 'Aprobado', publicado: 'Publicado', retirado: 'Retirado' }
export const accesses = { publico: 'Acceso abierto', autenticado: 'Requiere sesión', restringido: 'Restringido' }
export const roles = ['administrador', 'gestor', 'revisor', 'depositante']
export const types = [{ label: 'Documento académico', value: 'documento' }, { label: 'Proyecto de software', value: 'proyecto' }]
export const accessOptions = Object.entries(accesses).map(([value,label]) => ({ value,label }))
export const statusOptions = Object.entries(statuses).map(([value,label]) => ({ value,label }))
export function canEdit(user, resource) {
  if (!user?.is_active) return false
  if (user.roles?.some(r => ['administrador','gestor'].includes(r))) return resource.status !== 'retirado'
  return user.id === resource.owner_id && ['borrador','observado'].includes(resource.status)
}
export function canSubmit(user, resource) {
  return !!user?.is_active && user.id === resource.owner_id && ['borrador','observado'].includes(resource.status) && user.roles?.some(r => ['administrador','gestor','depositante'].includes(r))
}
export function validateFile(file, maxMB = 20) {
  if (!file) return 'Seleccione un archivo.'
  if (!/\.(pdf|doc|docx|odt|ppt|pptx|zip|txt)$/i.test(file.name)) return 'Formato no permitido. Use PDF, DOC, DOCX, ODT, PPT, PPTX, ZIP o TXT.'
  if (file.size > maxMB * 1024 * 1024) return `El archivo supera el límite de ${maxMB} MB.`
  return ''
}
export function safeUrl(value) { try { const url = new URL(value); return ['https:','http:'].includes(url.protocol) ? url.href : null } catch { return null } }
export function formatDate(value) { return value ? new Intl.DateTimeFormat('es-SV', { dateStyle: 'medium', timeZone: 'America/El_Salvador' }).format(new Date(value.length === 10 ? `${value}T12:00:00Z` : value)) : 'Sin fecha' }
