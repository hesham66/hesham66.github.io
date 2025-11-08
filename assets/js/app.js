
const ADMIN_PASSWORD='hesham2025';
const PUBLIC_JSON_PATH='assets/data/projects.json';
const DEFAULT_GH={owner:'hesham66',repo:'hesham66.github.io',path:'assets/data/projects.json',branch:'main'};
const LS={token:'gh_pat_token',prefs:'prefs_v1'};

function loadPrefs(){try{return JSON.parse(localStorage.getItem(LS.prefs)||'{}')}catch(e){return{}}}
function savePrefs(p){const c=loadPrefs();localStorage.setItem(LS.prefs,JSON.stringify({...c,...p}))}

async function fetchPublicData(){
  try{const r=await fetch(PUBLIC_JSON_PATH+'?t='+Date.now());if(!r.ok)throw 0;return await r.json()}catch(e){return {profileImage:'assets/img/profile.png',projects:[]}}}
async function renderFromPublic(){
  const data=await fetchPublicData();
  const img=document.getElementById('profileImage'); if(img) img.src=data.profileImage||'assets/img/profile.png';
  const grid=document.getElementById('projectsGrid'); grid.innerHTML='';
  if(!data.projects||!data.projects.length){ const p=document.createElement('div'); p.className='placeholder'; p.textContent='No projects yet.'; grid.appendChild(p); return;}
  data.projects.forEach(pj=>{const card=document.createElement('div'); card.className='card'; card.innerHTML=`${pj.image?`<img src="${pj.image}" style="width:100%;border-radius:8px;margin-bottom:8px">`:''}<strong>${pj.title||'Untitled Project'}</strong><div class='muted' style='font-size:13px;margin:6px 0'>${pj.description||''}</div>${pj.tags?`<div style='display:flex;flex-wrap:wrap;gap:6px;margin:6px 0'>${pj.tags.split(',').map(t=>`<span class='btn' style='padding:4px 8px;font-size:12px;border-radius:999px'>${t.trim()}</span>`).join('')}</div>`:''}${pj.link?`<a class='btn primary' target='_blank' href='${pj.link}'>View Details</a>`:`<button class='btn' disabled>View Details</button>`}`; grid.appendChild(card);});
}
function isAdminRoute(){return location.pathname.endsWith('/admin')||location.hash==='#admin'}
function ensureAuth(){if(sessionStorage.getItem('adminAuthed')==='1')return true; const p=prompt('Enter admin password:'); if(p===ADMIN_PASSWORD){sessionStorage.setItem('adminAuthed','1'); return true;} alert('Access denied'); history.replaceState({},'','/'); return false;}
async function ghGetCurrent(gh,token){const url=`https://api.github.com/repos/${gh.owner}/${gh.repo}/contents/${gh.path}?ref=${gh.branch}`; const r=await fetch(url,{headers:{Authorization:`Bearer ${token}`,Accept:'application/vnd.github+json'}}); if(r.status===404) return {sha:null,contentObj:null}; if(!r.ok) throw new Error('GitHub GET failed'); const j=await r.json(); const content=atob(j.content.replace(/\n/g,'')); return {sha:j.sha,contentObj:JSON.parse(content)}}
async function ghPutContent(gh,token,obj,sha=null,msg='Update projects.json'){const url=`https://api.github.com/repos/${gh.owner}/${gh.repo}/contents/${gh.path}`; const body={message:msg,content:btoa(unescape(encodeURIComponent(JSON.stringify(obj,null,2)))),branch:gh.branch}; if(sha) body.sha=sha; const r=await fetch(url,{method:'PUT',headers:{Authorization:`Bearer ${token}`,Accept:'application/vnd.github+json'},body:JSON.stringify(body)}); if(!r.ok){throw new Error('GitHub PUT failed: '+await r.text())} return await r.json()}
async function renderAdmin(){
  if(!ensureAuth()) return;
  const main=document.querySelector('main');
  const publicData=await fetchPublicData();
  main.innerHTML=`<section class='card'><h2>Admin (Public JSON Mode)</h2>
  <div style='display:flex;gap:8px;flex-wrap:wrap;margin:8px 0'>
    <input id='ghOwner' value='hesham66'><input id='ghRepo' value='hesham66.github.io'><input id='ghBranch' value='main'><input id='ghPath' value='assets/data/projects.json'>
  </div>
  <div style='display:flex;gap:8px;flex-wrap:wrap;margin:8px 0'>
    <input id='ghToken' placeholder='GitHub Token (saved locally)' style='flex:1;min-width:240px'>
    <button class='btn' id='saveToken'>Save Token</button>
    <button class='btn' id='publishBtn'>Publish to GitHub</button>
  </div>
  <div class='card'>
    <h3>Profile Image</h3>
    <input id='imgUrl' value='${publicData.profileImage||''}'>
    <button class='btn' id='applyImg'>Apply</button>
    <img id='imgPreview' src='${publicData.profileImage||'assets/img/profile.png'}' class='avatar' style='width:160px;height:160px'>
  </div>
  <div class='card'><h3>Add Project</h3>
    <input id='ptitle' placeholder='Title'>
    <input id='ptags' placeholder='Tags'>
    <input id='pimage' placeholder='Image URL'>
    <input id='plink' placeholder='Link'>
    <textarea id='pdesc' placeholder='Description'></textarea>
    <button class='btn primary' id='addBtn'>Add Project</button>
  </div>
  <div class='card'><h3>Current Projects</h3><div id='adminList'></div></div>
  </section>`;
  let working=publicData;
  const tk=localStorage.getItem(LS.token)||''; const tkInput=document.getElementById('ghToken'); tkInput.value=tk;
  document.getElementById('saveToken').onclick=()=>{const t=tkInput.value.trim(); if(!t) return alert('Enter token'); localStorage.setItem(LS.token,t); alert('Token saved locally')}
  document.getElementById('applyImg').onclick=()=>{const url=document.getElementById('imgUrl').value.trim(); if(!url) return; working.profileImage=url; document.getElementById('imgPreview').src=url; alert('Updated locally. Press Publish to push.')}
  function refresh(){const list=document.getElementById('adminList'); list.innerHTML=''; if(!working.projects.length){list.innerHTML='<div class="muted">No projects yet.</div>'; return;} working.projects.forEach((p,i)=>{const row=document.createElement('div'); row.className='card'; row.style.padding='8px'; row.innerHTML=`<div style='display:flex;justify-content:space-between;gap:8px'><div><b>${p.title||'Untitled'}</b><div class='muted' style='font-size:13px'>${p.description||''}</div></div><div><button class='btn' data-del='${i}'>Delete</button></div></div>`; list.appendChild(row);});}
  refresh();
  document.getElementById('addBtn').onclick=()=>{const item={title:document.getElementById('ptitle').value.trim(),tags:document.getElementById('ptags').value.trim(),image:document.getElementById('pimage').value.trim(),link:document.getElementById('plink').value.trim(),description:document.getElementById('pdesc').value.trim()}; if(!item.title) return alert('Title required'); working.projects.push(item); refresh(); alert('Added locally. Press Publish to push.')}
  document.getElementById('adminList').onclick=(e)=>{const i=e.target.getAttribute('data-del'); if(i!==null){working.projects.splice(Number(i),1); refresh();}}
  document.getElementById('publishBtn').onclick=async()=>{const token=(document.getElementById('ghToken').value||'').trim()||localStorage.getItem(LS.token); if(!token) return alert('Enter token'); const gh={owner:document.getElementById('ghOwner').value||'hesham66',repo:document.getElementById('ghRepo').value||'hesham66.github.io',path:document.getElementById('ghPath').value||'assets/data/projects.json',branch:document.getElementById('ghBranch').value||'main'}; try{const cur=await ghGetCurrent(gh,token); await ghPutContent(gh,token,working,cur.sha,'Update public projects.json via Admin'); alert('Published! Refresh the site to see updates.')}catch(err){alert('Publish failed: '+err.message);}}
}
document.addEventListener('DOMContentLoaded',()=>{document.getElementById('year').textContent=new Date().getFullYear(); if(isAdminRoute()) renderAdmin(); else renderFromPublic();});
