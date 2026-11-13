import { test, expect } from '@playwright/test'

const user={id:1,name:'Administrador de prueba',is_active:true,roles:['administrador']}
const records=Array.from({length:23},(_,i)=>({id:i+1,name:`Registro ${String(i+1).padStart(2,'0')}`,title:`Recurso ${String(i+1).padStart(2,'0')}`,email:`user${i+1}@example.test`,roles:['depositante'],is_active:true,owner_id:1,status:'borrador',type:'documento',created_at:'2026-11-01',updated_at:'2026-11-01',user:'Administrador',action:'usuario.creado',auditable_type:'App\\Models\\User',auditable_id:i+1,metadata:{roles:['depositante']}}))
async function setup(page){
  await page.addInitScript(()=>sessionStorage.setItem('sricu-token','test-token'))
  await page.route('**/api/**',route=>{
    const url=new URL(route.request().url()),endpoint=url.pathname.split('/api/')[1]
    if(endpoint==='me')return route.fulfill({json:{data:user}})
    if(['resources','users','audit-logs'].includes(endpoint)){
      const size=endpoint==='users'?20:Number(url.searchParams.get('per_page')||15)
      const current=Number(url.searchParams.get('page')||1)
      return route.fulfill({json:{data:records.slice((current-1)*size,current*size),meta:{current_page:current,per_page:size,total:records.length,last_page:Math.ceil(records.length/size)}}})
    }
    return route.fulfill({json:{data:records}})
  })
}
for(const path of ['/depositos','/revision','/publicacion','/auditoria']){
  test(`tabla ${path} muestra diez registros y navega hasta la última página`,async({page})=>{
    await setup(page);await page.goto(`/#${path}`)
    await expect(page.locator('tbody tr')).toHaveCount(10)
    await page.getByRole('button',{name:'2',exact:true}).click()
    await expect(page.locator('tbody tr')).toHaveCount(10)
    await expect(page.locator('tbody tr').first()).toContainText(path==='/auditoria'?'Usuario #11':'Recurso 11')
    await page.getByRole('button',{name:'3',exact:true}).click()
    await expect(page.locator('tbody tr')).toHaveCount(3)
    await expect(page.locator('tbody tr').first()).toContainText(path==='/auditoria'?'Usuario #21':'Recurso 21')
  })
}
test('todos los catálogos y usuarios paginan de diez y reinician al cambiar pestaña',async({page})=>{
  await setup(page);await page.goto('/#/administracion')
  for(const tab of ['Colecciones','Categorías','Autores','Palabras clave','Licencias','Usuarios y roles']){
    await page.getByRole('tab',{name:tab,exact:true}).click()
    await expect(page.locator('tbody tr')).toHaveCount(10)
    await expect(page.locator('tbody tr').first()).toContainText('Registro 01')
    await page.getByRole('button',{name:'2',exact:true}).click()
    await expect(page.locator('tbody tr').first()).toContainText('Registro 11')
    await page.getByRole('button',{name:'3',exact:true}).click()
    await expect(page.locator('tbody tr')).toHaveCount(3)
    await expect(page.locator('tbody tr').first()).toContainText('Registro 21')
  }
})
