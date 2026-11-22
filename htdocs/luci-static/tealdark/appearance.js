/* SPDX-License-Identifier: Apache-2.0 */
(function(){
 'use strict';
 var key='luci.tealdark.appearance',mode='auto',mq=window.matchMedia('(prefers-color-scheme: dark)');
 try{var saved=localStorage.getItem(key);if(['auto','light','dark'].indexOf(saved)>=0)mode=saved;}catch(e){}
 function paint(){var dark=mode==='dark'||(mode==='auto'&&mq.matches);document.documentElement.setAttribute('data-theme',dark?'dark':'light');document.documentElement.setAttribute('data-darkmode',String(dark));}
 paint();if(mq.addEventListener)mq.addEventListener('change',paint);else mq.addListener(paint);
 document.addEventListener('DOMContentLoaded',function(){
  var select=document.getElementById('td-appearance'),toggle=document.getElementById('td-menu-toggle'),backdrop=document.getElementById('td-menu-backdrop');
  if(select){select.value=mode;select.addEventListener('change',function(){mode=select.value;try{localStorage.setItem(key,mode);}catch(e){}paint();});}
  function open(value){document.body.classList.toggle('menu-open',value);if(toggle)toggle.setAttribute('aria-expanded',String(value));if(backdrop)backdrop.hidden=!value;}
  if(toggle)toggle.addEventListener('click',function(){open(!document.body.classList.contains('menu-open'));});
  if(backdrop)backdrop.addEventListener('click',function(){open(false);});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')open(false);});
  var nav=document.getElementById('topmenu');if(nav)nav.addEventListener('click',function(e){if(e.target.closest('a'))open(false);});
 });
})();
