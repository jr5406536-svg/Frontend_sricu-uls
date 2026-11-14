import { test, expect } from '@playwright/test'
const user={id:1,name:'Docente de prueba',email:'docente@example.test',is_active:true,roles:['depositante']}
const resource={id:1,title:'Sistema de gestión bibliotecaria',description:'Proyecto de gestión del conocimiento académico.',type:'documento',status:'publicado',access_level:'publico',resource_date:'2026-10-01',language:'es',owner_id:1,download_allowed:true,license:{id:1,name:'CC BY 4.0'},category:{id:1,name:'Investigación'},collection:{id:1,name:'Trabajos de graduación'},authors:[{id:1,name:'Autora de prueba'}],keywords:[],files:[],reviews:[]}
function paged(data){return {data,meta:{current_page:1,last_page:1,total:data.length,per_page:15}}}
async function mock(page,{role='depositante',failed=false}={}){
  await page.route('**/api/**',async route=>{
    const url=new URL(route.request().url()),path=url.pathname.split('/api/')[1],method=route.request().method()
    if(failed&&path==='resources')return route.fulfill({status:503,json:{message:'Servicio no disponible'}})
    if(path==='login')return route.fulfill({json:{access_token:'test-token',user:{...user,roles:[role]}}})
    if(path==='me')return route.fulfill({json:{data:{...user,roles:[role]}}})
    if(path==='logout')return route.fulfill({json:{message:'Sesión cerrada'}})
    if(path==='resources'&&method==='POST')return route.fulfill({status:201,json:{data:{...resource,...route.request().postDataJSON(),status:'borrador'}}})
    if(path==='resources')return route.fulfill({json:paged([resource])})
    if(path==='resources/1/submit')return route.fulfill({json:{data:{...resource,status:'revision'}}})
    if(path==='resources/1')return route.fulfill({json:{data:{...resource,status:'borrador'}}})
    const catalogs={collections:[{id:1,name:'Trabajos de graduación',description:'Documentos autorizados.',published_count:1}],categories:[{id:1,name:'Investigación'}],authors:[{id:1,name:'Autora de prueba'}],keywords:[{id:1,name:'Educación'}],licenses:[{id:1,name:'CC BY 4.0',allows_download:true}]}
    if(catalogs[path])return route.fulfill({json:{data:catalogs[path]}})
    if(path==='stats')return route.fulfill({json:{from:'2026-10-01',to:'2026-10-31',resources_created:2,published:1,views:5,downloads:1,searches:3,by_status:{borrador:1,publicado:1},by_type:{documento:2}}})
    if(path==='audit-logs'||path==='users')return route.fulfill({json:paged([])})
    return route.fulfill({json:{data:resource}})
  })
}
test('inicio respeta estructura, búsqueda y ficha',async({page})=>{
  await mock(page);await page.goto('/');await expect(page.getByRole('heading',{name:'Conocimiento de la ULS, al alcance de todos'})).toBeVisible()
  await expect(page.getByRole('heading',{name:'Explorar por comunidades'})).toBeVisible()
  await page.getByRole('textbox',{name:'Buscar en el repositorio'}).fill('bibliotecaria');await page.getByRole('button',{name:'Buscar',exact:true}).click()
  await expect(page).toHaveURL(/q=bibliotecaria/);await page.getByRole('link',{name:resource.title}).click();await expect(page.getByRole('heading',{name:'Resumen',exact:true})).toBeVisible()
})
test('ruta privada solicita sesión y respeta el destino',async({page})=>{
  await mock(page);await page.goto('/#/depositos');await expect(page.getByRole('heading',{name:'Iniciar sesión',exact:true})).toBeVisible()
  await page.getByLabel('Correo electrónico *').fill(user.email);await page.getByLabel('Contraseña *',{exact:true}).fill('password-test');await page.getByRole('button',{name:'Iniciar sesión',exact:true}).click()
  await expect(page.getByRole('heading',{name:'Mis depósitos',exact:true})).toBeVisible()
  await page.goto('/#/administracion');await expect(page.getByRole('heading',{name:'Acceso restringido'})).toBeVisible()
})
test('muestra fallo de servidor y permite reintentar',async({page})=>{
  await mock(page,{failed:true});await page.goto('/');await expect(page.getByRole('alert')).toBeVisible();await expect(page.getByRole('button',{name:'Reintentar'})).toBeVisible()
})
test('móvil conserva navegación y no desborda',async({page})=>{
  await page.setViewportSize({width:390,height:844});await mock(page);await page.goto('/');await expect(page.getByRole('link',{name:resource.title})).toBeVisible()
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
  await page.screenshot({path:'test-results/inicio-mobile.png',fullPage:true})
})
test('gestor consulta estadísticas y administrador abre catálogos',async({page})=>{
  await mock(page,{role:'administrador'});await page.addInitScript(()=>sessionStorage.setItem('sricu-token','test-token'));await page.goto('/#/estadisticas')
  await expect(page.getByRole('heading',{name:'Estadísticas del repositorio'})).toBeVisible();await expect(page.getByRole('article').filter({hasText:'Recursos creados'})).toBeVisible()
  await page.goto('/#/administracion');await expect(page.getByRole('tab',{name:'Usuarios y roles'})).toBeVisible()
})
test('captura de inicio en escritorio',async({page})=>{
  await mock(page);await page.goto('/');await expect(page.getByRole('link',{name:resource.title})).toBeVisible();await page.screenshot({path:'test-results/inicio-desktop.png',fullPage:true})
})
test('depósito guarda metadatos y solicita confirmación del envío',async({page})=>{
  await mock(page);await page.addInitScript(()=>sessionStorage.setItem('sricu-token','test-token'));await page.goto('/#/depositos/nuevo')
  await page.getByLabel('Título *',{exact:true}).fill('Tesis de prueba')
  await page.getByLabel('Resumen o descripción *').fill('Resumen de un documento académico para comprobar el depósito.')
  for(const [label,option] of [['Autoría *','Autora de prueba'],['Categoría *','Investigación'],['Licencia *','CC BY 4.0']]){
    await page.getByLabel(label,{exact:true}).click();await page.getByRole('option',{name:option,exact:true}).click()
    await page.keyboard.press('Escape')
  }
  const save=page.waitForRequest(r=>r.url().endsWith('/api/resources')&&r.method()==='POST')
  await page.getByRole('button',{name:'Guardar y continuar'}).click();const request=await save
  expect(request.postDataJSON()).toMatchObject({title:'Tesis de prueba',type:'documento',author_ids:[1],category_id:1,license_id:1})
  await expect(page.getByRole('heading',{name:'Archivos del recurso'})).toBeVisible()
  await page.getByRole('button',{name:'Continuar',exact:true}).click()
  await expect(page.getByRole('button',{name:'Confirmar envío a revisión'})).toBeDisabled()
  await page.getByRole('checkbox').check()
  const submit=page.waitForRequest(r=>r.url().endsWith('/api/resources/1/submit'))
  await page.getByRole('button',{name:'Confirmar envío a revisión'}).click();await submit;await expect(page).toHaveURL(/recursos\/1/)
})
test('la API devuelve errores de campo sin perder el formulario',async({page})=>{
  await mock(page);await page.route('**/api/login',r=>r.fulfill({status:422,json:{message:'Las credenciales no son válidas.',errors:{email:['Las credenciales no son válidas.']}}}))
  await page.goto('/#/login');await page.getByLabel('Correo electrónico *').fill(user.email);await page.getByLabel('Contraseña *',{exact:true}).fill('incorrecta')
  await page.getByRole('button',{name:'Iniciar sesión',exact:true}).click();await expect(page.getByRole('alert').first()).toContainText('Las credenciales no son válidas.');await expect(page.getByLabel('Correo electrónico *')).toHaveValue(user.email)
})
test('revisor registra una devolución con observaciones',async({page})=>{
  await mock(page,{role:'revisor'});await page.route('**/api/resources/1',r=>r.fulfill({json:{data:{...resource,status:'revision'}}}))
  await page.addInitScript(()=>sessionStorage.setItem('sricu-token','test-token'));await page.goto('/#/recursos/1');await page.getByRole('button',{name:'Revisar depósito'}).click()
  await page.getByLabel('Decisión').click();await page.getByRole('option',{name:'Devolver con observaciones'}).click();await page.getByLabel('Observaciones').fill('Complete la procedencia del recurso.')
  const request=page.waitForRequest(r=>r.url().endsWith('/review'));await page.getByRole('button',{name:'Registrar decisión'}).click()
  expect((await request).postDataJSON()).toEqual({decision:'devuelto',observations:'Complete la procedencia del recurso.'})
})
test('gestor confirma el nivel de acceso al publicar',async({page})=>{
  await mock(page,{role:'gestor'});await page.route('**/api/resources/1',r=>r.fulfill({json:{data:{...resource,status:'aprobado'}}}))
  await page.addInitScript(()=>sessionStorage.setItem('sricu-token','test-token'));await page.goto('/#/recursos/1');await page.getByRole('button',{name:'Publicar recurso'}).click()
  const request=page.waitForRequest(r=>r.url().endsWith('/publish'));await page.getByRole('button',{name:'Confirmar publicación'}).click();expect((await request).postDataJSON()).toEqual({access_level:'publico'})
})
test('lectura pública real desde navegador',async({page})=>{
  test.skip(!process.env.RUN_LIVE_API_READS,'Requiere acceso al servidor Render')
  await page.goto('/');await expect(page.locator('.resource-card').first()).toBeVisible({timeout:65000})
  await page.getByRole('link',{name:'Comunidades',exact:true}).click();await expect(page.locator('.collection-card').first()).toBeVisible({timeout:65000})
})
