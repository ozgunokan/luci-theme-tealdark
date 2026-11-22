'use strict';
'require baseclass';
'require ui';

/* Derived from OpenWrt menu-bootstrap.js, Apache-2.0. Uses the ACL-filtered LuCI menu. */
return baseclass.extend({
 __init__:function(){ui.menu.load().then(L.bind(this.render,this));},
 render:function(tree){
  var roots=ui.menu.getChildren(tree),path=L.env.dispatchpath||[],name=path[0]||'admin';
  var root=roots.filter(function(n){return n.name===name;})[0]||roots[0];
  if(!root)return;
  var target=document.getElementById('topmenu');if(target)this.renderMainMenu(root,root.name,target,0);
  var node=tree,url='';
  for(var i=0;i<3&&node;i++){node=node.children&&node.children[path[i]];url+=(url?'/':'')+path[i];}
  if(node)this.renderTabMenu(node,url,0);
  var modes=document.getElementById('modemenu');if(modes&&roots.length>1){roots.forEach(function(n){modes.appendChild(E('li',{},[E('a',{href:L.url(n.name)},[_(n.title)])]));});modes.style.display='';}
 },
 renderMainMenu:function(tree,url,target,depth){
  var self=this,path=(L.env.dispatchpath||[]).join('/');
  ui.menu.getChildren(tree).forEach(function(child){
   var childUrl=url+'/'+child.name,children=ui.menu.getChildren(child),active=path===childUrl||path.indexOf(childUrl+'/')===0;
   if(children.length&&depth<8){
    var details=E('details',{'class':depth?'nav-subgroup':'nav-group'}),inside=E('div',{'class':'nav-children'});
    details.open=active;details.appendChild(E('summary',{},[_(child.title)]));details.appendChild(inside);target.appendChild(details);
    self.renderMainMenu(child,childUrl,inside,depth+1);
   }else{
    var attrs={'class':'nav-link'+(depth===0?' nav-top-link':'')+(active?' selected':''),href:L.url(childUrl)};
    if(active)attrs['aria-current']='page';target.appendChild(E('a',attrs,[_(child.title)]));
   }
  });
 },
 renderTabMenu:function(tree,url,level){
  var target=document.getElementById('tabmenu');if(!target)return;
  var children=ui.menu.getChildren(tree);if(!children.length)return;
  var ul=E('ul',{'class':'tabs'}),active=null,path=L.env.dispatchpath||[];
  children.forEach(function(child){var on=path[3+level]===child.name;ul.appendChild(E('li',{'class':'tabmenu-item-'+child.name+(on?' active':'')},[E('a',{href:L.url(url,child.name)},[_(child.title)])]));if(on)active=child;});
  target.appendChild(ul);target.style.display='';if(active)this.renderTabMenu(active,url+'/'+active.name,level+1);
 }
});
