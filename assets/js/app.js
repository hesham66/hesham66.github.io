/* =========================
   Hesham Site - app.js (EN/AR + RTL + Theme + Public JSON + Grid+Badges)
   ========================= */

const PUBLIC_JSON_PATH = 'assets/data/projects.json';
const LS_KEYS = { prefs: 'prefs_v1' };

/* i18n */
const I18N = {
  en: {
    subtitle: "Network Engineer — Cybersecurity — IT Specialist",
    hero_title: "Hi, I'm Hesham",
    hero_lead: "IT student specializing in Network Engineering and Cybersecurity. NTI-accredited CCNA holder (MCIT).",
    contact_me: "Contact me",
    skills: "Skills",
    projects: "Projects",
    projects_help: "Projects are loaded from a public JSON (everyone sees them). You can update them from Admin.",
    loading: "Loading projects...",
    no_projects: "No projects added yet.",
    contact: "Contact",
    email_btn: "Email"
  },
  ar: {
    subtitle: "مهندس شبكات — أمن المعلومات — مختص تقنية معلومات",
    hero_title: "مرحبًا، أنا هشام",
    hero_lead: "طالب تقنية معلومات متخصص في هندسة الشبكات والأمن السيبراني. حاصل على CCNA معتمدة من NTI (وزارة الاتصالات).",
    contact_me: "تواصل معي",
    skills: "المهارات",
    projects: "المشاريع",
    projects_help: "يتم تحميل المشاريع من ملف JSON عام لكي تظهر للجميع. يمكنك تحديثها من لوحة الإدارة.",
    loading: "جاري تحميل المشاريع...",
    no_projects: "لا توجد مشاريع مضافة بعد.",
    contact: "التواصل",
    email_btn: "البريد الإلكتروني"
  }
};

/* Prefs */
function loadPrefs(){ try{ return JSON.parse(localStorage.getItem(LS_KEYS.prefs)||'{}'); }catch{ return {}; } }
function savePrefs(p){ const c=loadPrefs(); localStorage.setItem(LS_KEYS.prefs, JSON.stringify({...c,...p})); }

/* Lang & Dir */
function applyLang(lang){
  const dict = I18N[lang] || I18N.en;
  document.documentElement.setAttribute('lang', lang);
  document.documentElement.setAttribute('dir', lang==='ar' ? 'rtl' : 'ltr');
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const key = el.getAttribute('data-i18n');
    if(dict[key]) el.textContent = dict[key];
  });
  const btn = document.getElementById('langToggle');
  if(btn) btn.textContent = (lang==='ar' ? 'EN' : 'AR');
  savePrefs({ lang });
}
function initLang(){
  const saved = loadPrefs().lang || 'en';
  applyLang(saved);
  document.getElementById('langToggle')?.addEventListener('click', ()=>{
    const cur = loadPrefs().lang || 'en';
    applyLang(cur==='en' ? 'ar' : 'en');
    renderFromPublic(); // لتحديث رسالة "لا توجد مشاريع" حسب اللغة
  });
}

/* Theme */
function applyTheme(theme){
  if(theme==='light') document.body.classList.add('light');
  else document.body.classList.remove('light');
  const btn = document.getElementById('themeToggle');
  if(btn) btn.textContent = theme==='light' ? 'Dark Mode' : 'Light Mode';
  savePrefs({ theme });
}
function initTheme(){
  const saved = loadPrefs().theme || 'dark';
  applyTheme(saved);
  document.getElementById('themeToggle')?.addEventListener('click', ()=>{
    const isLight = document.body.classList.contains('light');
    applyTheme(isLight ? 'dark' : 'light');
  });
}

/* Public JSON */
async function fetchPublicData(){
  try{
    const res = await fetch(PUBLIC_JSON_PATH + `?t=${Date.now()}`, { cache:'no-store' });
    if(!res.ok) throw 0;
    return await res.json();
  }catch{
    return { profileImage:'assets/img/profile.png', projects:[] };
  }
}

async function renderFromPublic(){
  const data = await fetchPublicData();
  const lang = loadPrefs().lang || 'en';
  const dict = I18N[lang] || I18N.en;

  // profile
  const img = document.getElementById('profileImage');
  if(img) img.src = data.profileImage || 'assets/img/profile.png';

  // projects
  const grid = document.getElementById('projectsGrid');
  if(!grid) return;
  grid.innerHTML = '';

  if(!data.projects || !data.projects.length){
    const p = document.createElement('div');
    p.className = 'placeholder';
    p.textContent = dict.no_projects;
    grid.appendChild(p);
    return;
  }

  data.projects.forEach(pj=>{
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      ${pj.image ? `<img src="${pj.image}" alt="Project" style="width:100%;border-radius:8px;margin-bottom:8px">` : ''}
      <strong>${pj.title || 'Untitled Project'}</strong>
      <div class="muted" style="font-size:13px;margin:6px 0">${pj.description || ''}</div>
      ${
        pj.tags
          ? `<div class="tag-badges">
                ${pj.tags.split(',').map(t=>`<span class="tag-badge">${t.trim()}</span>`).join('')}
             </div>`
          : ''
      }
      ${
        pj.link
          ? `<a class="btn primary" href="${pj.link}">View Details</a>`
          : `<button class="btn" disabled>View Details</button>`
      }
    `;
    grid.appendChild(card);
  });
}

/* Route helper */
function isAdminRoute(){ return location.pathname.endsWith('/admin') || location.pathname.endsWith('/admin/'); }

/* Boot */
document.addEventListener('DOMContentLoaded', ()=>{
  document.getElementById('year')?.append(new Date().getFullYear());
  initTheme();
  initLang();
  if(!isAdminRoute()){
    const ph = document.querySelector('#projectsGrid .placeholder');
    const dict = I18N[loadPrefs().lang || 'en'] || I18N.en;
    if(ph) ph.textContent = dict.loading;
    renderFromPublic();
  }
});
