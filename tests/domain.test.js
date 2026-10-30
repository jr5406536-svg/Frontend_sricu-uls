import { test } from 'node:test'
import assert from 'node:assert/strict'
import { canEdit, canSubmit, validateFile, safeUrl } from '../src/domain.js'
const depositor={id:1,is_active:true,roles:['depositante']}
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
