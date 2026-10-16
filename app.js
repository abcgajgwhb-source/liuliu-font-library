(()=>{
 const C=window.FontCatalog,fonts=window.FONT_DATA||[];
 let state={...C.readState(location.search),ready:false},toastTimer,searchMode=new URLSearchParams(location.search).get("screen")==="search",layout="cards",previewText="";
 const $=s=>document.querySelector(s),make=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e};
 const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 function toast(text){$('.toast').textContent=text;$('.toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('.toast').classList.remove('visible'),2400)}
 async function copy(text){try{await navigator.clipboard.writeText(text);toast('已复制：'+text)}catch{const d=$('#copy-dialog');d.querySelector('input').value=text;d.showModal();d.querySelector('input').select()}}
 function asset(path){return typeof path==='string'&&/^assets\/[\w\-./]+\.(png|jpg|jpeg|webp|svg|woff2?|ttf|otf)$/i.test(path)&&!path.includes('..')?path:null}
 function installFonts(){const style=make('style');style.textContent=fonts.filter(f=>asset(f.fontFile)).map(f=>'@font-face{font-family:"font-'+f.id.replace(/[^a-z0-9]/gi,'-')+'";src:url("'+f.fontFile+'");font-display:swap}').join('\n');document.head.append(style);const hero=window.SITE_CONFIG?.heroImage==='hero.png'?'hero.png':asset(window.SITE_CONFIG?.heroImage);if(hero)$('.hero').style.backgroundImage='url("'+hero+'")'}
 function saveURL(){const p=new URLSearchParams();p.set('view',state.view);if(searchMode)p.set('screen','search');if(state.category)p.set('category',state.category);if(state.query)p.set('q',state.query);if(state.ready)p.set('ready','1');try{history.replaceState(null,'','?'+p)}catch{/* file previews may deny history changes */}}
 function render(){
 if(state.category&&!options().includes(state.category))state.category=null;

 document.body.classList.toggle('search-mode',searchMode);$('.search-intro').hidden=!searchMode;$('#search-form').hidden=!searchMode;$('#count').hidden=true;$('.hero').hidden=searchMode;$('#results-heading').textContent=searchMode?'搜索结果':'字体列表';$('#grid').classList.toggle('list-layout',layout==='list');

 document.querySelectorAll('.nav-item').forEach(b=>{const active=b.dataset.view===state.view;b.classList.toggle('active',active);b.setAttribute('aria-pressed',active)});
 renderCategories();$('.categories').hidden=searchMode;
 $('#search').value=state.query;$('#clear-search').hidden=!state.query;
 const list=C.filter(fonts,state);$('#count').textContent=state.query?list.length+' 条结果 · “'+state.query+'”':list.length+' 条记录';$('#grid').hidden=!list.length;$('#empty').hidden=!!list.length;
 $('#empty h2').textContent=state.query?'没有找到匹配字体':'该栏目暂无字体';$('#empty p').textContent=state.query?'试试其他关键词，或清除筛选。':'补充对应字体资源后，这里会自动显示。';
 const frag=document.createDocumentFragment();
 for(const f of list){
 const card=make('article','card');card.dataset.fontId=f.id;
 const head=make('div','card-heading');head.append(make('h2','',f.name));card.append(head);
 const line=make('div','fontname');if(f.figmaName){line.append(make('span','','Figma 中名称：'));line.append(make('span','figma-name',f.figmaName))}else line.append(make('span','pending','Figma 名称待补充'));card.append(line);
 const stage=make('div','sample-stage'),sample=make('div','sample sample-default');
 const family=asset(f.fontFile)?'font-'+f.id.replace(/[^a-z0-9]/gi,'-'):(f.previewFamily||f.figmaName||'');stage.style.fontFamily='"'+family.replaceAll('"','')+'","PingFang SC","Microsoft YaHei",sans-serif';
 const fontStyle=f.previewStyle||'';stage.style.fontStyle=/italic|oblique/i.test(fontStyle)?'italic':'normal';const weights=[[/extra.?light/i,200],[/thin/i,100],[/light/i,300],[/extra.?bold/i,800],[/semi.?bold|demi/i,600],[/black|heavy/i,900],[/bold/i,700],[/medium/i,500]];stage.style.fontWeight=(weights.find(([r])=>r.test(fontStyle))||[null,400])[1];const preview=asset(f.previewImage);if(preview&&!previewText){const img=make('img','preview-image');img.src=preview;img.alt=f.name+'字体预览';img.loading='lazy';img.addEventListener('error',()=>{sample.replaceChildren(document.createTextNode(f.preview||f.name));sample.setAttribute('aria-label','预览素材暂不可用')},{once:true});sample.append(img)}else sample.textContent=previewText||f.preview||f.name;
 sample.dataset.defaultText=f.preview||f.name;
 const hover=make('div','sample sample-hover',previewText||f.preview||f.name);hover.dataset.defaultText=f.preview||f.name;hover.setAttribute('aria-hidden','true');stage.append(sample,hover);card.append(stage);
 
 const actions=make('div','card-actions');const copyButton=make('button','download copy-primary',f.figmaName?'复制当前字体 Figma 中的名称':'Figma 名称待补充');copyButton.type='button';copyButton.disabled=!f.figmaName;copyButton.setAttribute('aria-label',f.figmaName?'复制 '+f.figmaName:'Figma 名称待补充');if(f.figmaName)copyButton.addEventListener('click',()=>copy(f.figmaName));actions.append(copyButton);card.append(actions);frag.append(card);
 }
 $('#grid').replaceChildren(frag);saveURL();
 }
 function options(){return state.view==='全部字体'?['中文字体','英文字体','数字字体','多语言字体','UI 字体']:state.view==='中文字体'?C.categories:[...new Set(fonts.filter(f=>state.view==='常用字体'?f.common:f.language===state.view).map(f=>f.category))]}
 function renderCategories(){const box=$('.categories');box.replaceChildren();box.hidden=false;for(const c of ['全部',...options()]){const b=make('button','',c);b.type='button';b.dataset.category=c==='全部'?'':c;const active=(state.category||'')===b.dataset.category;b.classList.toggle('active',active);b.setAttribute('aria-pressed',active);b.addEventListener('click',()=>{state.category=b.dataset.category||null;render()});box.append(b)}}
 document.querySelectorAll('.nav-item').forEach(b=>b.addEventListener('click',()=>{searchMode=false;state.query='';$('#suggestions').hidden=true;state.view=b.dataset.view;state.category=state.view==='中文字体'?'黑体':null;render()}));
 function suggestions(){const q=$('#search').value;$('#clear-search').hidden=!q;const box=$('#suggestions');box.replaceChildren();if(!q.trim()){box.hidden=true;return}const hits=C.filter(fonts,{view:'全部字体',query:q}),seen=new Set();for(const f of hits){if(seen.has(f.figmaName||f.name))continue;seen.add(f.figmaName||f.name);const b=make('button','suggestion',f.name);b.type='button';b.addEventListener('click',()=>{$('#search').value=f.figmaName||f.name;submitSearch()});box.append(b);if(seen.size===6)break}box.hidden=!seen.size}
 function submitSearch(){state.query=$('#search').value.trim();state.view='全部字体';state.category=null;searchMode=true;$('#suggestions').hidden=true;render()}
 $('#search-form').addEventListener('submit',e=>{e.preventDefault();submitSearch()});
 $('#search').addEventListener('input',e=>{if(!e.isComposing)suggestions()});$('#search').addEventListener('compositionend',suggestions);
 $('#search').addEventListener('keydown',e=>{if(e.key==='Escape'){$('#suggestions').hidden=true;$('#search').blur()}});
 $('#clear-search').addEventListener('click',()=>{state.query='';$('#search').value='';$('#suggestions').hidden=true;render();$('#search').focus()});
 document.addEventListener('click',e=>{if(!$('#search-form').contains(e.target))$('#suggestions').hidden=true});
 $('#leave-search').addEventListener('click',()=>{searchMode=false;state.query='';state.view='常用字体';state.category=null;render()});
 document.querySelectorAll('[data-layout]').forEach(b=>b.addEventListener('click',()=>{layout=b.dataset.layout;document.querySelectorAll('[data-layout]').forEach(x=>x.setAttribute('aria-pressed',x===b));$('#grid').classList.toggle('list-layout',layout==='list')}));
 $('#reset').addEventListener('click',()=>{state={view:'全部字体',category:null,query:'',ready:false};render()});
 $('.search-toggle').addEventListener('click',()=>{searchMode=true;state.view='全部字体';state.category=null;render();$('#search').scrollIntoView({behavior:reduced()?'auto':'smooth',block:'center'});$('#search').focus({preventScroll:true})});
 $('.back-top').addEventListener('click',()=>window.scrollTo({top:0,behavior:reduced()?'auto':'smooth'}));
 $('#preview-text').addEventListener('input',e=>{previewText=e.target.value;$('#reset-preview').textContent=previewText?'取消':'搜索';$('#reset-preview').disabled=!previewText;document.querySelectorAll('.sample').forEach(el=>{el.textContent=previewText||el.dataset.defaultText})});$('#reset-preview').addEventListener('click',()=>{previewText='';$('#preview-text').value='';$('#reset-preview').textContent='搜索';$('#reset-preview').disabled=true;render()});
 window.addEventListener('popstate',()=>{state={...C.readState(location.search),ready:false};searchMode=new URLSearchParams(location.search).get('screen')==='search';render()});installFonts();render();
})();
