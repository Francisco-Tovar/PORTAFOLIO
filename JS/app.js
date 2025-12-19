"use strict";

// ------------------------------
// State
// ------------------------------

const STORAGE = {
  lang: "portfolio.lang",
  theme: "portfolio.theme",
};

function getStored(key, fallback) {
  const value = window.localStorage.getItem(key);
  return value === null ? fallback : value;
}

function setStored(key, value) {
  window.localStorage.setItem(key, value);
}

// ------------------------------
// Language toggle (EN/ES)
// ------------------------------

const langToggle = document.getElementById("langToggle");

function setLanguage(lang) {
  document.querySelectorAll(".en").forEach((el) => {
    el.classList.toggle("hidden", lang !== "en");
  });
  document.querySelectorAll(".es").forEach((el) => {
    el.classList.toggle("hidden", lang !== "es");
  });

  if (langToggle) {
    langToggle.textContent = lang.toUpperCase();
  }

  setStored(STORAGE.lang, lang);
}

if (langToggle) {
  langToggle.addEventListener("click", () => {
    const current = getStored(STORAGE.lang, "en");
    setLanguage(current === "en" ? "es" : "en");
  });
}

// ------------------------------
// Theme toggle (light / dark)
// Uses [data-theme="dark"] so the dark mode is truly dark.
// ------------------------------

const themeToggle = document.getElementById("themeToggle");

function applyThemeToDom(theme) {
  if (theme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }

  if (themeToggle) {
    // Simple, font-safe glyphs.
    themeToggle.textContent = theme === "dark" ? "☾" : "◐";
  }
}

function setTheme(theme) {
  const next = theme === "dark" ? "dark" : "light";
  applyThemeToDom(next);
  setStored(STORAGE.theme, next);
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const current = getStored(STORAGE.theme, "light");
    setTheme(current === "dark" ? "light" : "dark");
  });
}

// ------------------------------
// Back-to-top
// ------------------------------

const backToTopButton = document.getElementById("btn-back-to-top");

function onScroll() {
  if (!backToTopButton) {
    return;
  }
  const show = document.documentElement.scrollTop > 500;
  backToTopButton.style.display = show ? "block" : "none";
}

window.addEventListener("scroll", onScroll);

if (backToTopButton) {
  backToTopButton.addEventListener("click", () => {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  });
}

// ------------------------------
// Projects: search + sort
// ------------------------------

const grid = document.getElementById("projectGrid");
const search = document.getElementById("search");
const sort = document.getElementById("sort");

function getProjects() {
  if (!grid) {
    return [];
  }
  return Array.from(grid.querySelectorAll(".project"));
}

function matchesSearch(project, query) {
  if (query.length === 0) {
    return true;
  }
  const title = (project.getAttribute("data-title") || "").toLowerCase();
  const text = (project.textContent || "").toLowerCase();
  return title.includes(query) || text.includes(query);
}

function applyFilterAndSort() {
  const query = (search && search.value ? search.value : "")
    .trim()
    .toLowerCase();
  const mode = sort && sort.value ? sort.value : "newest";

  const projects = getProjects();
  const visible = projects.filter((p) => matchesSearch(p, query));

  const sorted = visible.sort((a, b) => {
    const aTitle = (a.getAttribute("data-title") || "").toLowerCase();
    const bTitle = (b.getAttribute("data-title") || "").toLowerCase();

    const aFeatured = Number(a.getAttribute("data-featured") || "0");
    const bFeatured = Number(b.getAttribute("data-featured") || "0");

    const aDate = new Date(
      a.getAttribute("data-date") || "1970-01-01"
    ).getTime();
    const bDate = new Date(
      b.getAttribute("data-date") || "1970-01-01"
    ).getTime();

    if (mode === "featured") {
      if (aFeatured !== bFeatured) {
        return bFeatured - aFeatured;
      }
      return bDate - aDate;
    }

    if (mode === "az") {
      return aTitle.localeCompare(bTitle);
    }

    // newest
    return bDate - aDate;
  });

  // Show/hide based on filter
  projects.forEach((p) => {
    p.style.display = visible.includes(p) ? "" : "none";
  });

  // Re-append in sorted order
  if (grid) {
    sorted.forEach((p) => grid.appendChild(p));
  }
}

if (search) {
  search.addEventListener("input", applyFilterAndSort);
}

if (sort) {
  sort.addEventListener("change", applyFilterAndSort);
}

// ------------------------------
// Details modal
// ------------------------------

const modalEl = document.getElementById("detailsModal");
const modalTitle = document.getElementById("modalTitle");
const modalMeta = document.getElementById("modalMeta");
const modalBody = document.getElementById("modalBody");

function getDetailsText(title) {
  const lang = getStored(STORAGE.lang, "en");

  const map = {
    "Word Rush": {
      en: "Game prototype built with React Native, focused on quick word puzzles and mobile-friendly design. Uses AI to generate unique challenges.",
      es: "Prototipo de juego construido con React Native, enfocado en acertijos rápidos de palabras y diseño amigable para móviles. Utiliza Inteligencia Artificial para generar desafíos únicos.",
    },
    "Reinos Cenfotecos": {
      en: "Strategy RPG web game built with Javascript and Java, featuring turn-based combat using programing patterns.",
      es: "Juego web de estrategia RPG construido con Javascript y Java, con combate por turnos usando patrones de programación.",
    },
    NewtonRoids: {
      en: "An arcade experience with physics-forward gameplay. Clean UI, quick sessions, instant fun.",
      es: "Arcade con enfoque en física. UI limpia, partidas rápidas y diversión inmediata.",
    },
    "Blaster Faster": {
      en: "Space shooter action with punchy visuals and a focus on tight controls.",
      es: "Space shooter con acción intensa, visuales llamativos y controles precisos.",
    },
    "Bus Watcher": {
      en: "A C#/.NET project for real-time school bus route monitoring and operational visibility.",
      es: "Proyecto en C#/.NET para monitorear rutas de autobuses escolares en tiempo real.",
    },
    Mishka: {
      en: "MERN web-commerce booking platform for public/private events.",
      es: "Plataforma MERN de reservas y web-commerce para eventos públicos/privados.",
    },
    "Thovarisk Web Games": {
      en: "Web Single Page Application hosting multiple casual games built with HTML5 and JavaScript.",
      es: "Pagina web de aplicación única que alberga múltiples juegos casuales construidos con HTML5 y JavaScript.",
    },
  };

  const entry = map[title];
  if (!entry) {
    return lang === "es"
      ? "Detalles no disponibles."
      : "Details not available.";
  }
  return lang === "es" ? entry.es : entry.en;
}

function openDetails(projectEl) {
  const title =
    projectEl.querySelector(".project-title")?.textContent?.trim() || "Project";
  const meta =
    projectEl
      .querySelector(".project-meta:not(.hidden)")
      ?.textContent?.trim() || "";
  const body = getDetailsText(title);

  if (modalTitle) {
    modalTitle.textContent = title;
  }
  if (modalMeta) {
    modalMeta.textContent = meta;
  }
  if (modalBody) {
    modalBody.textContent = body;
  }

  if (modalEl && window.bootstrap) {
    const modal = window.bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
  }
}

document.addEventListener("click", (e) => {
  const target = e.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }
  if (target.matches("[data-details]")) {
    const card = target.closest(".project");
    if (card) {
      openDetails(card);
    }
  }
});

// ------------------------------
// Init
// ------------------------------

const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = String(new Date().getFullYear());
}

setLanguage(getStored(STORAGE.lang, "en"));
setTheme(getStored(STORAGE.theme, "light"));
applyFilterAndSort();
