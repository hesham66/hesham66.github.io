/* =========================
   App JS — EN/AR + RTL + Theme + Projects Grid
========================= */

const PUBLIC_JSON_PATH = 'assets/data/projects.json';
const LS = { prefs:'prefs_v1' };

/* --- Contact links (عدّلهم لو حبيت) --- */
const CONTACT = {
  email: 'mailto:your.email@example.com',
  linkedin: 'https://www.linkedin.com/in/YOUR_LINKEDIN',
  whatsapp: 'https://wa.me/2010XXXXXXX' // بدون علامة +
};

/* --- i18n --- */
const I18N = {
  en: {
    subtitle: "Network Engineer — Cybersecurity — IT Specialist",
    hero_title: "Hi, I'm Hesham",
    hero_lead:
      "IT student specializing in Network Engineering and Cybersecurity. NTI-accredited CCNA holder (MCIT).",
    contact_me: "Contact me",
    skills: "Skills",
    projects: "Projects",
    projects_help:
      "Projects are loaded from a public JSON (everyone sees them). You can update them from Admin.",
    loading: "Loading projects...",
    no_projects: "No projects added yet.",
    contact: "Contact",
    email_btn: "Email"
  },
  ar: {
    subtitle: "مهندس شبكات — أمن المعلومات — مختص تقنية معلومات",
    hero_title: "مرحبًا، أنا هشام",
    hero_lead:
      "طالب تقنية معلومات متخصص في هندسة الشبكات والأمن السيبراني. حاصل على CCNA معتمدة من NTI (وزارة الاتصالات).",
    contact_me: "تواصل معي",
    skills: "المهارات",
    projects: "المشاريع",
    projects_help:
      "يتم تحميل المشاريع من ملف JSON عام لكي تظهر للجميع. يمكنك تحديثها من لوحة الإدارة.",
    loading: "جاري تحميل المشاريع...",
    no_projects: "لا توجد مشاريع مضافة بعد.",
    contact: "التواصل",
    email_btn: "البريد الإلكتروني"
  }
};

/* --- Prefs --- */
function loadPrefs(){ try{return JSON.parse(localStorage.getItem(LS.prefs)||'{}')}catch{return{}} }
function savePrefs(p){ const c=loadPrefs(); localStorage.setItem(LS.prefs, JSON.stringify({...c,...p})) }

/* --- Theme --- */
function applyTheme(theme){
  if(theme==='light') document.body.classList.add('light');
  else document.body.classList.remove('light');
  document.getElementById('themeToggle')?.setAttribute('aria-pressed', theme==='light');
  document.getElementById('themeToggle').textContent = theme==='light' ? 'Dark Mode' : 'Light Mode';
  savePrefs({theme});
}
function initTheme(){
  applyTheme(loadPrefs().theme || 'dark');
  document.getElementById('themeToggle')?.addEventListener('click',()=>{
    const next = document.body.classList.contains('light') ? 'dark' : 'light';
    applyTheme(next);
  });
}

/* --- Language & Direction --- */
function applyLang(lang){
  const dict = I18N[lang] || I18N.en;
  document.documentElement.setAttribute('lang', lang);
  document.documentElement.setAttribute('dir', lang==='ar' ? 'rtl' : 'ltr');
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const key = el.getAttribute('data-i18n');
    if(dict[key]) el.textContent = dict[key];
  });
  const langBtn = document.getElementById('langToggle');
  if(langBtn) langBtn.textContent = lang==='ar' ? 'EN' : 'AR';
  savePrefs({lang});
}
function initLang(){
  applyLang(loadPrefs().lang || 'en');
  document.getElementById('langToggle')?.addEventListener('click',()=>{
    const cur = loadPrefs().lang || 'en';
    applyLang(cur==='en' ? 'ar' : 'en');
    renderProjects(); // لتحديث النصوص داخل المشاريع عند عدم وجود عناصر
  });
}

/* --- Contact links --- */
function initContact(){
  const e=document.getElementById('emailBtn'), l=document.getElementById('linkedinBtn'), w=document.getElementById('waBtn');
  if(e) e.href = CONTACT.email;
  if(l) l.href = CONTACT.linkedin;
  if(w) w.href = CONTACT.whatsapp;
}

/* --- Public JSON --- */
async function getPublicData(){
  try{
    const r = await fetch(PUBLIC_JSON_PATH + `?t=${Date.now()}`, { cache:'no-store' });
    if(!r.ok) throw 0;
    return await r.json();
  }catch{
    return { profileImage:'assets/img/profile.png', projects:[] };
  }
}

async function renderProjects(){
  const data = await getPublicData();

  // hero image
  const img = document.getElementById('profileImage');
  if(img) img.src = data.profileImage || 'assets/img/profile.png';

  // grid
  const grid = document.getElementById('projectsGrid');
  if(!grid) return;
  const dict = I18N[loadPrefs().lang || 'en'] || I18N.en;

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
    card.className = 'project-card';
    card.innerHTML = `
      ${pj.image ? `<img src="${pj.image}" alt="Project">` : ``}
      <strong>${pj.title || 'Untitled Project'}</strong>
      <div class="muted" style="margin:6px 0">${pj.description || ''}</div>
      ${pj.tags ? `<div class="tag-badges">${pj.tags.split(',').map(t=>`<span class="tag-badge">${t.trim()}</span>`).join('')}</div>` : ``}
      ${pj.link ? `<a class="btn primary" href="${pj.link}">View Details</a>` : `<button class="btn" disabled>View Details</button>`}
    `;
    grid.appendChild(card);
  });
}

/* --- Boot --- */
document.addEventListener('DOMContentLoaded', ()=>{
  document.getElementById('year').textContent = new Date().getFullYear();
  initTheme();
  initLang();
  initContact();
  renderProjects();
});
