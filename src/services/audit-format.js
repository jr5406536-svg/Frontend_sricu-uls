const labels = {
  usuario: 'Usuario', recurso: 'Recurso', autor: 'Autor', categoria: 'Categoría',
  coleccion: 'Colección', palabra_clave: 'Palabra clave', licencia: 'Licencia', archivo: 'Archivo',
  User: 'Usuario', Resource: 'Recurso', Author: 'Autor', Category: 'Categoría',
  Collection: 'Colección', Keyword: 'Palabra clave', License: 'Licencia', ResourceFile: 'Archivo',
  roles: 'Roles asignados', fields: 'Campos modificados', before: 'Valores anteriores',
  name: 'Nombre', title: 'Título', email: 'Correo electrónico', is_active: 'Cuenta activa',
  description: 'Descripción', type: 'Tipo', status: 'Estado', access_level: 'Nivel de acceso',
  resource_date: 'Fecha del recurso', language: 'Idioma', license_id: 'Licencia',
  category_id: 'Categoría', collection_id: 'Colección', author_ids: 'Autores', keyword_ids: 'Palabras clave',
  provenance: 'Procedencia', external_url: 'Enlace externo', technical_description: 'Descripción técnica',
  technologies: 'Tecnologías', reason: 'Motivo', observations: 'Observaciones', decision: 'Decisión',
  file: 'Archivo', original_name: 'Nombre del archivo', size: 'Tamaño', filename: 'Nombre del archivo',
  administrador: 'Administrador', gestor: 'Gestor', revisor: 'Revisor', depositante: 'Depositante',
  publico: 'Acceso abierto', autenticado: 'Requiere sesión', restringido: 'Restringido',
  borrador: 'Borrador', revision: 'En revisión', observado: 'Observado', aprobado: 'Aprobado',
  publicado: 'Publicado', retirado: 'Retirado', devuelto: 'Devuelto', documento: 'Documento', proyecto: 'Proyecto',
}
const verbs = {
  creado: 'creado', creada: 'creada', actualizado: 'actualizado', actualizada: 'actualizada',
  eliminado: 'eliminado', eliminada: 'eliminada', desactivado: 'desactivado',
  publicado: 'publicado', retirado: 'retirado', enviado_a_revision: 'enviado a revisión',
  revisado: 'revisado', aprobado: 'aprobado', devuelto: 'devuelto', subido: 'subido', descargado: 'descargado',
}
function readable(value) { return labels[value] || String(value).replace(/[_.]/g, ' ') }
export function auditObject(row) {
  const model = row.auditable_type?.split('\\').pop()
  return model ? `${readable(model)}${row.auditable_id != null ? ` #${row.auditable_id}` : ''}` : 'Sin objeto asociado'
}
export function auditAction(action) {
  if (!action) return 'Acción no indicada'
  const [entity, ...parts] = action.split('.')
  const verb = parts.join('.')
  return `${readable(entity)}${verb ? ` ${verbs[verb] || readable(verb)}` : ''}`
}
function displayValue(value, key) {
  if (value == null || value === '') return 'Sin valor'
  if (typeof value === 'boolean') return value ? 'Sí' : 'No'
  if (Array.isArray(value)) return value.length ? value.map(v => key === 'fields' ? readable(v) : displayValue(v, key)).join(', ') : 'Ninguno'
  if (typeof value === 'object') return Object.entries(value).map(([k,v]) => `${readable(k)}: ${displayValue(v,k)}`).join('; ') || 'Sin cambios'
  return labels[value] || String(value)
}
export function auditDetails(metadata) {
  if (!metadata || typeof metadata !== 'object') return []
  return Object.entries(metadata).map(([key,value]) => ({ label: readable(key), value: displayValue(value,key) }))
}
