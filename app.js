const categories=['黑体','宋体','手写体','毛笔/书法','可爱体','圆体','标题体'];
let fonts=[],category='黑体',view='中文字体',query='',toastTimer;
const $=selector=>document.querySelector(selector);
function make(tag,className,text){const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el;}
function toast(text){$('.toast').textContent=text;$('.toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('.toast').classList.remove('visible'),2400);}
async function copy(text){try{await navigator.clipboard.writeText(text);toast('已复制：'+text);}catch{const d=$('#copy-dialog');d.querySelector('input').value=text;d.showModal();d.querySelector('input').select();}}
function render(){
 document.querySelectorAll('.nav-item').forEach(b=>{b.classList.toggle('active',b.dataset.view===view);b.setAttribute('aria-pressed',b.dataset.view===view);});
 $('.categories').hidden=view!=='中文字体';
 document.querySelectorAll('.categories button').forEach(b=>{b.classList.toggle('active',b.textContent===category);b.setAttribute('aria-pressed',b.textContent===category);});
 const supported=view==='中文字体';
 const list=supported?fonts.filter(f=>f.category===category&&[f.name,f.figmaName].some(s=>s?.toLowerCase().includes(query))):[];
 $('#grid').replaceChildren();$('#grid').hidden=!list.length;$('#empty').hidden=!!list.length;$('#count').textContent=supported?list.length+' 款字体':'尚未收录';
 $('#empty h2').textContent=supported?'没有找到匹配字体':view+'即将收录';
 $('#empty p').textContent=supported?'试试其他关键词，或切换分类。':'当前提供中文字体，可先返回中文字体浏览。';
 const frag=document.createDocumentFragment();
 list.forEach(f=>{
  const card=make('article','card');card.dataset.fontId=f.id;card.append(make('h2','',f.name));
  const line=make('div','fontname');
  if(f.figmaName){line.append(make('span','','Figma 中名称：'));const b=make('button','copy',f.figmaName);b.type='button';b.setAttribute('aria-label','复制 '+f.figmaName);b.addEventListener('click',()=>copy(f.figmaName));line.append(b);}else line.append(make('span','pending','Figma 名称待补充'));
  card.append(line);
  const sample=make('div','sample',f.verified?f.preview:f.name);sample.style.fontFamily='"'+f.family.replaceAll('"','')+'","PingFang SC","Microsoft YaHei",sans-serif';card.append(sample);
  if(f.url&&/^https?:\/\//.test(f.url)){const a=make('a','download','前往官网下载字体');a.href=f.url;a.target='_blank';a.rel='noopener noreferrer';card.append(a);}
  else{const b=make('button','download','下载链接待补充');b.disabled=true;card.append(b);}
  frag.append(card);
 });$('#grid').append(frag);
 const params=new URLSearchParams();params.set('category',category);if(query)params.set('q',query);if(view!=='中文字体')params.set('view',view);history.replaceState(null,'','?'+params.toString());
}
categories.forEach(c=>{const b=make('button','',c);b.type='button';b.addEventListener('click',()=>{category=c;view='中文字体';render();});$('.categories').append(b);});
document.querySelectorAll('.nav-item').forEach(b=>b.addEventListener('click',()=>{view=b.dataset.view;render();}));
$('#search').addEventListener('input',e=>{query=e.target.value.trim().toLowerCase();render();});
$('.search-toggle').addEventListener('click',()=>{$('#search').scrollIntoView({behavior:'smooth',block:'center'});$('#search').focus({preventScroll:true});});
$('#reset').addEventListener('click',()=>{view='中文字体';category='黑体';query='';$('#search').value='';render();});
$('.back-top').addEventListener('click',()=>window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}));
fetch('fonts.json').then(r=>{if(!r.ok)throw new Error('加载失败');return r.json();}).then(data=>{fonts=data;const p=new URLSearchParams(location.search);category=categories.includes(p.get('category'))?p.get('category'):'黑体';query=(p.get('q')||'').toLowerCase();view=[...document.querySelectorAll('.nav-item')].some(b=>b.dataset.view===p.get('view'))?p.get('view'):'中文字体';$('#search').value=query;render();}).catch(()=>{$('#empty').hidden=false;$('#empty h2').textContent='字体列表加载失败';$('#empty p').textContent='请刷新页面后重试。';$('#reset').textContent='重新加载';$('#reset').onclick=()=>location.reload();});
