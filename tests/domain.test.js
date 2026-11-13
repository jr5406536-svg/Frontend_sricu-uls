import { test } from 'node:test'
import assert from 'node:assert/strict'
import { canEdit, canSubmit, validateFile, safeUrl } from '../src/domain.js'
import { auditObject, auditAction, auditDetails } from '../src/services/audit-format.js'
import { fetchTablePage, paginateRows } from '../src/services/pagination.js'
test('listas completas se paginan de diez y reajustan una página eliminada',()=>{
  const rows=Array.from({length:23},(_,i)=>i+1)
  assert.deepEqual(paginateRows(rows,2).items,[11,12,13,14,15,16,17,18,19,20])
  assert.deepEqual(paginateRows(rows,9),{items:[21,22,23],page:3,last:3,total:23})
  assert.deepEqual(paginateRows([],2),{items:[],page:1,last:1,total:0})
})
test('paginación adapta un servidor fijo de veinte sin saltar usuarios',async()=>{
  const rows=Array.from({length:43},(_,i)=>i+1)
  const fetchPage=async page=>({data:rows.slice((page-1)*20,page*20),meta:{current_page:page,per_page:20,total:43}})
  const visible=[]
  for(let page=1;page<=5;page++){
    const result=await fetchTablePage(fetchPage,page)
    assert.ok(result.items.length<=10)
    visible.push(...result.items)
  }
  assert.deepEqual(visible,rows)
})
test('paginación conserva diez filas aunque cruce páginas del servidor',async()=>{
  const rows=Array.from({length:30},(_,i)=>i)
  const result=await fetchTablePage(async page=>({data:rows.slice((page-1)*7,page*7),meta:{current_page:page,per_page:7,total:30}}),2)
  assert.deepEqual(result.items,rows.slice(10,20))
})
const depositor={id:1,is_active:true,roles:['depositante']}
test('auditoría presenta roles y objetos sin JSON ni nombres internos',()=>{
  assert.equal(auditObject({auditable_type:'App\\Models\\User',auditable_id:8}),'Usuario #8')
  assert.equal(auditAction('usuario.creado'),'Usuario creado')
  assert.deepEqual(auditDetails({roles:['gestor']}),[{label:'Roles asignados',value:'Gestor'}])
  assert.deepEqual(auditDetails({fields:['name','is_active'],before:{name:'Alexis',is_active:false}}),[
    {label:'Campos modificados',value:'Nombre, Cuenta activa'},
    {label:'Valores anteriores',value:'Nombre: Alexis; Cuenta activa: No'},
  ])
  assert.deepEqual(auditDetails({}),[])
  assert.equal(auditAction('recurso.enviado_a_revision'),'Recurso enviado a revisión')
})
test('un depositante solo edita sus borradores u observados',()=>{
  assert.equal(canEdit(depositor,{owner_id:1,status:'borrador'}),true)
  assert.equal(canEdit(depositor,{owner_id:2,status:'borrador'}),false)
  assert.equal(canEdit(depositor,{owner_id:1,status:'publicado'}),false)
  assert.equal(canEdit({...depositor,is_active:false},{owner_id:1,status:'observado'}),false)
})
test('un gestor edita otros recursos pero no retirados',()=>{
  const manager={id:2,is_active:true,roles:['gestor']}
  assert.equal(canEdit(manager,{owner_id:1,status:'aprobado'}),true)
  assert.equal(canEdit(manager,{owner_id:1,status:'retirado'}),false)
})
test('el envío exige propietario, rol y estado editable',()=>{
  assert.equal(canSubmit(depositor,{owner_id:1,status:'observado'}),true)
  assert.equal(canSubmit(depositor,{owner_id:1,status:'revision'}),false)
  assert.equal(canSubmit(depositor,{owner_id:2,status:'borrador'}),false)
  assert.equal(canSubmit({...depositor,roles:['revisor']},{owner_id:1,status:'borrador'}),false)
})
test('se rechazan archivos ejecutables y excesivos',()=>{
  assert.ok(validateFile({name:'archivo.exe',size:100}))
  assert.ok(validateFile({name:'archivo.pdf',size:21*1024*1024},20))
  assert.equal(validateFile({name:'TESIS.PDF',size:20*1024*1024},20),'')
  assert.ok(validateFile(null))
})
test('solo se abren enlaces HTTP y HTTPS',()=>{
  assert.equal(safeUrl('javascript:alert(1)'),null)
  assert.equal(safeUrl('data:text/html,test'),null)
  assert.equal(safeUrl('https://github.com/uls'),'https://github.com/uls')
  assert.equal(safeUrl(''),null)
})
