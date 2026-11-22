const assert=require('node:assert/strict'),fs=require('node:fs');
function element(tag,attrs={},children=[]){return{tag,attrs,children:[...children],style:{},open:false,appendChild(n){this.children.push(n)}}}
const nodes={topmenu:element('nav'),tabmenu:element('div'),modemenu:element('ul')};
const menu={children:{admin:{name:'admin',title:'Administration',children:{status:{name:'status',title:'Status',children:{overview:{name:'overview',title:'Overview'}}},system:{name:'system',title:'System',children:{software:{name:'software',title:'Software'}}},network:{name:'network',title:'Network',children:{network:{name:'network',title:'Interfaces'},wireless:{name:'wireless',title:'Wireless'}}},custom:{name:'custom',title:'Installed application'}}}}};
const ui={menu:{getChildren:n=>Object.values(n.children||{})}};
const L={env:{dispatchpath:['admin','network','wireless']},url:(...p)=>'/cgi-bin/luci/'+p.join('/'),bind:(fn,ctx)=>fn.bind(ctx)};
const source=fs.readFileSync(process.argv[2]||'htdocs/luci-static/resources/menu-tealdark.js','utf8');
const code=new Function('baseclass','ui','L','E','document','_',source);
const instance=code({extend:x=>x},ui,L,element,{getElementById:id=>nodes[id]},x=>x);instance.render(menu);
const all=[];function walk(n){if(!n||typeof n!=='object')return;all.push(n);n.children?.forEach(walk)}Object.values(nodes).forEach(walk);
assert(all.some(n=>n.tag==='a'&&n.attrs.href==='/cgi-bin/luci/admin/custom'));
assert(all.some(n=>n.tag==='a'&&n.attrs.href==='/cgi-bin/luci/admin/network/wireless'&&n.attrs['aria-current']==='page'));
assert(all.some(n=>n.tag==='details'&&n.open));
assert(!all.some(n=>n.attrs.href?.includes('hg633')));
console.log('DYNAMIC_NATIVE_MENU_AND_ACTIVE_PATH_PASSED');
