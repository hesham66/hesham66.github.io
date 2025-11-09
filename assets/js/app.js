/* =========================
   Hesham Site - app.js (EN/AR + RTL + Theme + Public JSON)
   ========================= */

/* ---- Config ---- */
const PUBLIC_JSON_PATH = 'assets/data/projects.json';
const LS_KEYS = { prefs: 'prefs_v1' };

/* ---- i18n (Formal Arabic) ---- */
const I18N = {
  en: {
    subtitle: "Network Engineer — Cybersecurity — IT Specialist",
    hero_title: "Hi, I'm Hesham",
    hero_lead:
      "IT student specializing in Network Engineering and Cybersecurity. NTI-accredited CCNA holder (MCIT).",
    contact_me: "Contact me",
    img_hint:
      "This photo can be pulled from public JSON or overridden from Admin.",
    skills: "Skills",
    projects: "Projects",
    projects_help:
      "Projects are loaded from a public JSON (everyone sees them). You can update them from Admin.",
    loading: "Loading projects...",
    no_projects: "No projects added yet.",
    contact: "Contact",
    email_btn: "Email",
  },
  ar: {
    subtitle: "مهندس شبكات — أمن المعلومات — مختص تقنية معلومات",
    hero_title: "مرحبًا، أنا هشام",
    hero_lead:
      "طالب تقنية معلومات متخصص في هندسة الشبكات والأمن السيبراني. حاصل على CCNA معتمدة من NTI (وزارة الاتصالات).",
    contact_me: "تواصل معي",
    img_hint:
      "يمكن جلب هذه الصورة من JSON العام أو تغييرها من لوحة الإدارة.",
    skills: "المهارات",
    projects: "المشاريع",
    projects_help:
      "يتم تحميل المشاريع من ملف JSON عام لكي تظهر للجميع. يمكنك تحديثها من لوحة الإدارة.",
    loading: "جاري تحميل المشاريع...",
    no_projects: "لا توجد مشاريع مضافة بعد.",
    contact: "التواصل",
    email_btn: "البريد الإلكتروني",
  },
};

/* ---- Prefs (theme/lang) ---- */
function loadPrefs() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEYS.prefs) || "{}");
  } catch {
    return {};
  }
}
function savePrefs(partial) {
  const cur = loadPrefs();
  localStorage.setItem(LS_KEYS.prefs, JSON.stringify({ ...cur, ...partial }));
}

/* ---- Language & Direction ---- */
function applyLang(lang) {
  const dict = I18N[lang] || I18N.en;

  // lang & dir
  document.documentElement.setAttribute("lang", lang);
  document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");

  // translate all data-i18n
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (dict[key]) el.textContent = dict[key];
  });

  // toggle button label
  const btn = document.getElementById("langToggle");
  if (btn) btn.textContent = lang === "ar" ? "EN" : "AR";

  savePrefs({ lang });
}

function initLang() {
  const saved = loadPrefs().lang || "en";
  applyLang(saved);

  const btn = document.getElementById("langToggle");
  if (btn) {
    btn.addEventListener("click", () => {
      const current = loadPrefs().lang || "en";
      const next = current === "en" ? "ar" : "en";
      applyLang(next);
      // rerender projects to update "no projects" text etc.
      renderFromPublic();
    });
  }
}

/* ---- Theme ---- */
function applyTheme(theme) {
  if (theme === "light") document.body.classList.add("light");
  else document.body.classList.remove("light");
  savePrefs({ theme });
}
function initTheme() {
  const saved = loadPrefs().theme || "dark";
  applyTheme(saved);

  const btn = document.getElementById("themeToggle");
  if (btn) {
    btn.addEventListener("click", () => {
      const isLight = document.body.classList.contains("light");
      applyTheme(isLight ? "dark" : "light");
    });
  }
}

/* ---- Public JSON ---- */
async function fetchPublicData() {
  try {
    const res = await fetch(PUBLIC_JSON_PATH + `?t=${Date.now()}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("fetch error");
    return await res.json();
  } catch {
    return { profileImage: "assets/img/profile.png", projects: [] };
  }
}

async function renderFromPublic() {
  const data = await fetchPublicData();
  const lang = loadPrefs().lang || "en";
  const dict = I18N[lang] || I18N.en;

  // profile image
  const img = document.getElementById("profileImage");
  if (img) img.src = data.profileImage || "assets/img/profile.png";

  // projects
  const grid = document.getElementById("projectsGrid");
  if (!grid) return;

  grid.innerHTML = "";
  if (!data.projects || !data.projects.length) {
    const p = document.createElement("div");
    p.className = "placeholder";
    p.textContent = dict.no_projects;
    grid.appendChild(p);
    return;
  }

  data.projects.forEach((pj) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      ${pj.image ? `<img src="${pj.image}" alt="Project" style="width:100%;border-radius:8px;margin-bottom:8px">` : ""}
      <strong>${pj.title || "Untitled Project"}</strong>
      <div class="muted" style="font-size:13px;margin:6px 0">${pj.description || ""}</div>
      ${
        pj.tags
          ? `<div style="display:flex;flex-wrap:wrap;gap:6px;margin:6px 0">
               ${pj.tags
                 .split(",")
                 .map(
                   (t) =>
                     `<span class='btn' style='padding:4px 8px;font-size:12px;border-radius:999px'>${t.trim()}</span>`
                 )
                 .join("")}
             </div>`
          : ""
      }
      ${
        pj.link
          ? `<a class="btn primary" href="${pj.link}" target="_blank" rel="noopener">View Details</a>`
          : `<button class="btn" disabled>View Details</button>`
      }
    `;
    grid.appendChild(card);
  });
}

/* ---- Helper: not using hash-admin routing here ---- */
function isAdminRoute() {
  return location.pathname.endsWith("/admin") || location.pathname.endsWith("/admin/");
}

/* ---- Boot ---- */
document.addEventListener("DOMContentLoaded", () => {
  // footer year
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  initTheme();
  initLang();

  // only render public data on main site (not /admin)
  if (!isAdminRoute()) {
    // set loading text based on language
    const lang = loadPrefs().lang || "en";
    const dict = I18N[lang] || I18N.en;
    const ph = document.querySelector("#projectsGrid .placeholder");
    if (ph) ph.textContent = dict.loading;

    renderFromPublic();
  }
});
