// Builds personalGym from the openGym exercise library and the upstream media dataset.
//
//   node tools/build-catalog.js [path/to/dataset-checkout]
//
// Reads  data/exercises-data.js   (copied from openGym/frontend/src/lib/exercises-data.js)
// Writes data/exercises.json       clean JSON of the same 1,324 entries
//        media/images/<body-part>/<id>-<hash>.jpg   (only when a dataset checkout is given)
//        media/gifs/<body-part>/<id>-<hash>.gif
//        catalog/exercise-catalog.html   standalone browser, references ../media/… locally
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const datasetDir = process.argv[2] ? path.resolve(process.argv[2]) : null

const src = fs.readFileSync(path.join(ROOT, 'data', 'exercises-data.js'), 'utf8')
const data = JSON.parse(src.slice(src.indexOf('[')).replace(/;?\s*$/, ''))
fs.writeFileSync(path.join(ROOT, 'data', 'exercises.json'), JSON.stringify(data, null, 1))

const slug = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-')

// Copy media into one folder per body part so the tree reads the way the catalog does.
if (datasetDir) {
  let copied = 0, missing = 0
  for (const e of data) {
    const folder = slug(e.bp)
    for (const [kind, srcDir, file] of [['images', 'images', e.img], ['gifs', 'videos', e.gif]]) {
      if (!file) continue
      const from = path.join(datasetDir, srcDir, file)
      const toDir = path.join(ROOT, 'media', kind, folder)
      fs.mkdirSync(toDir, { recursive: true })
      const to = path.join(toDir, file)
      if (!fs.existsSync(from)) { missing++; continue }
      if (!fs.existsSync(to)) fs.copyFileSync(from, to)
      copied++
    }
  }
  console.log('media: ' + copied + ' files in place, ' + missing + ' missing from dataset')
}

// The catalog entries carry their local relative paths so the page needs no base-URL logic.
const entries = data.map(e => ({ ...e, img: 'images/' + slug(e.bp) + '/' + e.img, gif: 'gifs/' + slug(e.bp) + '/' + e.gif }))

const head = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>personalGym Exercise Catalog</title>
<style>
/* Layout: left rail of body parts, main column of target-muscle sections with card grids. */
:root{
  --bg:#f6f5f2; --panel:#ffffff; --fg:#1d1c1a; --muted:#6b675f; --line:#e2dfd8;
  --accent:#c2410c; --accent-soft:#fdebe1; --chip:#efece6;
  --font:ui-sans-serif,system-ui,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
}
@media (prefers-color-scheme: dark){:root{
  --bg:#17171a; --panel:#202024; --fg:#ecebe7; --muted:#a19d95; --line:#33333a;
  --accent:#f0853f; --accent-soft:#3a2416; --chip:#2b2b31; color-scheme:dark;
}}
*{box-sizing:border-box}
html,body{margin:0;background:var(--bg);color:var(--fg);font:14px/1.45 var(--font)}
header{position:sticky;top:0;z-index:5;background:var(--panel);border-bottom:1px solid var(--line);padding:10px 16px;display:flex;gap:12px;align-items:center;flex-wrap:wrap}
header h1{font-size:16px;margin:0 8px 0 0;font-weight:600}
header input,header select{font:inherit;padding:6px 10px;border:1px solid var(--line);border-radius:6px;background:var(--bg);color:var(--fg)}
header input{min-width:220px;flex:1;max-width:360px}
#count{color:var(--muted);font-variant-numeric:tabular-nums}
label.tog{display:flex;gap:6px;align-items:center;color:var(--muted);cursor:pointer;user-select:none}
.wrap{display:flex;min-height:calc(100vh - 54px)}
nav{width:200px;flex:none;border-right:1px solid var(--line);padding:12px 8px;position:sticky;top:54px;align-self:flex-start;max-height:calc(100vh - 54px);overflow:auto}
nav button{display:flex;justify-content:space-between;width:100%;text-align:left;padding:7px 10px;border:0;background:none;color:var(--fg);font:inherit;border-radius:6px;cursor:pointer;text-transform:capitalize}
nav button:hover{background:var(--chip)}
nav button.on{background:var(--accent-soft);color:var(--accent);font-weight:600}
nav button span{color:var(--muted);font-variant-numeric:tabular-nums;font-weight:400}
main{flex:1;min-width:0;padding:16px}
h2{font-size:22px;margin:4px 0 2px;text-transform:capitalize}
h2 small{color:var(--muted);font-size:14px;font-weight:400;margin-left:8px}
h3{font-size:15px;margin:22px 0 10px;padding:4px 0 6px;border-bottom:1px solid var(--line);text-transform:capitalize;position:sticky;top:54px;background:var(--bg);z-index:1}
h3 small{color:var(--muted);font-weight:400;margin-left:8px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:12px}
.card{background:var(--panel);border:1px solid var(--line);border-radius:8px;overflow:hidden;display:flex;flex-direction:column}
.card .pic{aspect-ratio:1/1;background:#fff;position:relative;cursor:pointer}
.card img{width:100%;height:100%;object-fit:contain;display:block}
.card .pic::after{content:"GIF";position:absolute;right:6px;bottom:6px;font-size:10px;padding:2px 5px;border-radius:4px;background:rgba(0,0,0,.55);color:#fff;letter-spacing:.05em}
.card .pic.anim::after{content:"STILL"}
.card .body{padding:8px 10px 10px;display:flex;flex-direction:column;gap:5px}
.card .name{font-weight:600;text-transform:capitalize;line-height:1.3}
.card .id{color:var(--muted);font-size:11px;font-variant-numeric:tabular-nums}
.chips{display:flex;flex-wrap:wrap;gap:4px}
.chip{font-size:11px;padding:2px 7px;border-radius:999px;background:var(--chip);color:var(--muted);text-transform:capitalize}
.chip.eq{background:var(--accent-soft);color:var(--accent)}
details{font-size:12px;color:var(--muted)}
details summary{cursor:pointer;color:var(--accent)}
details ol{margin:6px 0 0;padding-left:18px}
details li{margin-bottom:3px}
.empty{color:var(--muted);padding:40px;text-align:center}
@media (max-width:700px){.wrap{flex-direction:column}nav{width:auto;position:static;max-height:none;display:flex;flex-wrap:wrap;gap:4px;border-right:0;border-bottom:1px solid var(--line)}nav button{width:auto}}
</style>
</head>
<body>
<header>
  <h1>personalGym Exercise Catalog</h1>
  <input id="q" type="search" placeholder="Search name, muscle, equipment…" autocomplete="off">
  <select id="eq"><option value="">All equipment</option></select>
  <label class="tog"><input type="checkbox" id="autogif"> Animate all</label>
  <span id="count"></span>
</header>
<div class="wrap">
  <nav id="nav"></nav>
  <main id="main"></main>
</div>
<script>
`

const script = String.raw`
const BP_ORDER=['chest','back','shoulders','upper arms','lower arms','upper legs','lower legs','waist','neck','cardio'];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const nav=document.getElementById('nav'),main=document.getElementById('main'),q=document.getElementById('q'),eqSel=document.getElementById('eq'),countEl=document.getElementById('count'),autogif=document.getElementById('autogif');
let bp='chest';
const bpCounts={};for(const e of DATA)bpCounts[e.bp]=(bpCounts[e.bp]||0)+1;
const eqs=[...new Set(DATA.map(e=>e.eq))].sort();
for(const x of eqs){const o=document.createElement('option');o.value=x;o.textContent=x;eqSel.appendChild(o)}
function renderNav(){nav.innerHTML=['',...BP_ORDER].map(b=>'<button data-bp="'+b+'" class="'+(b===bp?'on':'')+'">'+(b||'All body parts')+' <span>'+(b?bpCounts[b]:DATA.length)+'</span></button>').join('')}
nav.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;bp=b.dataset.bp;renderNav();render();window.scrollTo(0,0)});
function matches(e,qq,eq){
  if(bp&&e.bp!==bp)return false;
  if(eq&&e.eq!==eq)return false;
  if(!qq)return true;
  const hay=[e.n,e.bp,e.eq,e.tg,e.mg,...(e.sm||[])].join(' ').toLowerCase();
  return qq.split(/\s+/).every(w=>hay.includes(w));
}
function card(e){
  const anim=autogif.checked;
  return '<div class="card"><div class="pic'+(anim?' anim':'')+'" data-img="'+e.img+'" data-gif="'+e.gif+'"><img loading="lazy" src="'+MEDIA+(anim?e.gif:e.img)+'" alt="'+esc(e.n)+'"></div>'+
  '<div class="body"><div class="name">'+esc(e.n)+'</div><div class="id">#'+e.id+'</div>'+
  '<div class="chips"><span class="chip eq">'+esc(e.eq)+'</span><span class="chip">'+esc(e.tg)+'</span>'+(e.sm||[]).filter(s=>s!==e.tg).map(s=>'<span class="chip">'+esc(s)+'</span>').join('')+'</div>'+
  (e.st&&e.st.length?'<details><summary>Instructions</summary><ol>'+e.st.map(s=>'<li>'+esc(s)+'</li>').join('')+'</ol></details>':'')+
  '</div></div>';
}
function render(){
  const qq=q.value.trim().toLowerCase(),eq=eqSel.value;
  const list=DATA.filter(e=>matches(e,qq,eq));
  countEl.textContent=list.length+' of '+DATA.length;
  if(!list.length){main.innerHTML='<div class="empty">No exercises match.</div>';return}
  const groups={};for(const e of list)(groups[e.bp+'|'+e.tg]||=[]).push(e);
  const keys=Object.keys(groups).sort((a,b)=>{const[ab,at]=a.split('|'),[bb,bt]=b.split('|');return BP_ORDER.indexOf(ab)-BP_ORDER.indexOf(bb)||at.localeCompare(bt)});
  let html='<h2>'+(bp||'All body parts')+'<small>'+list.length+' exercises</small></h2>';
  for(const k of keys){const[b,t]=k.split('|');html+='<h3>'+(bp?'':b+' · ')+t+'<small>'+groups[k].length+'</small></h3><div class="grid">'+groups[k].map(card).join('')+'</div>'}
  main.innerHTML=html;
}
main.addEventListener('click',e=>{
  const p=e.target.closest('.pic');if(!p)return;
  const img=p.querySelector('img');const on=p.classList.toggle('anim');
  img.src=MEDIA+(on?p.dataset.gif:p.dataset.img);
});
q.addEventListener('input',render);eqSel.addEventListener('change',render);autogif.addEventListener('change',render);
renderNav();render();
</script>
</body>
</html>
`

fs.mkdirSync(path.join(ROOT, 'catalog'), { recursive: true })
const html = head + 'const MEDIA="../media/";\nconst DATA=' + JSON.stringify(entries) + ';\n' + script
fs.writeFileSync(path.join(ROOT, 'catalog', 'exercise-catalog.html'), html)
console.log('catalog: ' + data.length + ' exercises, ' + (html.length / 1024 | 0) + ' KB')
