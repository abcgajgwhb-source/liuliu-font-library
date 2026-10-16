(function(scope){
 const categories=['黑体','宋体','手写体','毛笔/书法','可爱体','圆体','标题体'];
 const views=['全部字体','常用字体','中文字体','英文字体','数字字体','多语言字体','UI 字体'];
 const normalize=v=>String(v||'').normalize('NFKC').toLowerCase().replace(/\s+/g,' ').trim();
 function validURL(v){try{return ['http:','https:'].includes(new URL(v).protocol)}catch{return false}}
 function filter(fonts,s){const words=normalize(s.query).split(' ').filter(Boolean);return fonts.filter(f=>{
 const language=f.language||'中文字体';
 if(s.view==='常用字体'&&!f.common)return false;
 if(!['全部字体','常用字体'].includes(s.view)&&s.view!==language&&!(s.view==='UI 字体'&&f.ui))return false;
 if(s.category&&(s.view==='全部字体'?language!==s.category:f.category!==s.category))return false;
 if(s.ready&&!f.figmaName)return false;
 const haystack=normalize([f.name,f.figmaName,f.category,...(f.tags||[])].join(' '));return words.every(w=>haystack.includes(w));})}
 function readState(search){const p=new URLSearchParams(search),view=views.includes(p.get('view'))?p.get('view'):'中文字体';return {view,category:p.get('category')||(!p.has('view')&&!p.has('q')?'黑体':null),query:p.get('q')||'',ready:p.get('ready')==='1'}}
 scope.FontCatalog={categories,views,normalize,validURL,filter,readState};if(typeof module!=='undefined')module.exports=scope.FontCatalog;
})(typeof window==='undefined'?globalThis:window);
