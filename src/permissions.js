export const moduleLabels={orders:'Ordens de Serviço',operational:'Operacional',lines:'Consumo M2M','operational-analysis':'Parque e Manutenção'};
export const moduleKeys=Object.keys(moduleLabels);
export function normalizeEmail(value){return typeof value==='string'?value.trim().toLowerCase():'';}
export function validEmail(value){return typeof value==='string'&&value.length<=254&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);}
export function allowsPage(user,page){if(!user?.active)return false;if(user.role==='admin')return true;if(page==='users')return false;if(page==='imports')return user.canImport&&user.pages?.length>0;return moduleKeys.includes(page)&&user.pages?.includes(page);}
export function allowsAction(user,action){return Boolean(user?.active&&(user.role==='admin'||(action==='import'?user.canImport:action==='export'?user.canExport:false)));}
export function allowsSource(user,type){if(!allowsAction(user,'import'))return false;return user.role==='admin'||(type==='consumption'?allowsPage(user,'lines'):type==='orders'?allowsPage(user,'orders')||allowsPage(user,'operational-analysis'):type==='operational'?allowsPage(user,'operational')||allowsPage(user,'operational-analysis'):false);}
export function validateUser(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw Error('Cadastro inválido.');
 const fields=['email','role','active','pages','canImport','canExport','version'];if(Object.keys(input).some(key=>!fields.includes(key)))throw Error('Campo não permitido.');
 const email=normalizeEmail(input.email);if(!validEmail(email))throw Error('Informe um e-mail válido.');
 if(!['admin','user'].includes(input.role)||typeof input.active!=='boolean'||typeof input.canImport!=='boolean'||typeof input.canExport!=='boolean')throw Error('Permissões inválidas.');
 if(!Array.isArray(input.pages)||input.pages.some(page=>!moduleKeys.includes(page))||new Set(input.pages).size!==input.pages.length)throw Error('Páginas inválidas.');
 if(!Number.isInteger(input.version)||input.version<0)throw Error('Versão inválida.');
 return {email,role:input.role,active:input.active,pages:input.role==='admin'?[...moduleKeys]:input.pages,canImport:input.role==='admin'||input.canImport,canExport:input.role==='admin'||input.canExport,version:input.version};
}
