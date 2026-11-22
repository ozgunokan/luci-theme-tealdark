const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(process.argv[2]||'htdocs/luci-static/tealdark/appearance.js','utf8');
for(const settings of [{stored:null,system:false,expected:'light'},{stored:'dark',system:false,expected:'dark'},{stored:'auto',system:true,expected:'dark'},{blocked:true,system:false,expected:'light'}]){
 const attrs={},events={},select={value:'',addEventListener(k,fn){events['select:'+k]=fn}};
 const root={setAttribute(k,v){attrs[k]=v}};
 vm.runInNewContext(source,{window:{matchMedia(){return{matches:settings.system,addEventListener(){}}}},localStorage:{getItem(){if(settings.blocked)throw Error('blocked');return settings.stored},setItem(){}},document:{documentElement:root,addEventListener(k,fn){events[k]=fn},getElementById(id){return id==='td-appearance'?select:null}}});
 assert.equal(attrs['data-theme'],settings.expected);events.DOMContentLoaded();select.value='light';events['select:change']();assert.equal(attrs['data-theme'],'light');assert.equal(attrs['data-darkmode'],'false');
}
console.log('LIGHT_DARK_AUTO_AND_BLOCKED_STORAGE_PASSED');
