// Menú móvil
const navToggle = document.getElementById("navToggle");
const nav = document.getElementById("nav");

navToggle.addEventListener("click", () => {
  const abierto = nav.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", abierto);
});

nav.querySelectorAll("a").forEach((link) =>
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  })
);

// Fotos de la portada: cambian cada 5 segundos con transición suave
const slides = document.querySelectorAll(".slides img");
const caption = document.querySelector(".slides__caption");
const reducirMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (slides.length > 1 && !reducirMovimiento) {
  let actual = 0;
  setInterval(() => {
    slides[actual].classList.remove("is-active");
    actual = (actual + 1) % slides.length;
    slides[actual].classList.add("is-active");
    caption.textContent = slides[actual].dataset.caption;
  }, 5000);
}

// Equipo: el panal hexagonal elige quién aparece en el panel destacado
const crew = document.querySelector(".crew");
if (crew) {
  const hexes = [...crew.querySelectorAll(".hex")];
  const spot = crew.querySelector(".crew__spotlight");
  const img = document.getElementById("crewImg");
  const bar = document.getElementById("crewBar");
  const campos = {
    name: document.getElementById("crewName"),
    role: document.getElementById("crewRole"),
    detail: document.getElementById("crewDetail"),
  };
  const mail = document.getElementById("crewMail");
  const numero = document.getElementById("crewIndex");
  const DURACION = 4500;
  let actual = 0;
  let inicio = performance.now();
  let pausado = false;

  const mostrar = (i) => {
    if (i === actual) return;
    actual = i;
    const h = hexes[i];
    hexes.forEach((x) => x.classList.toggle("is-active", x === h));
    spot.classList.add("is-changing");
    img.classList.add("is-changing");
    setTimeout(() => {
      img.src = h.querySelector("img").src;
      img.alt = h.dataset.name;
      campos.name.textContent = h.dataset.name;
      campos.role.textContent = h.dataset.role;
      campos.detail.textContent = h.dataset.detail;
      mail.hidden = !h.dataset.mail;
      mail.href = "mailto:" + h.dataset.mail;
      numero.textContent = String(i + 1).padStart(2, "0");
      spot.classList.remove("is-changing");
      img.classList.remove("is-changing");
    }, 300);
    inicio = performance.now();
  };

  hexes.forEach((h, i) => {
    h.addEventListener("mouseenter", () => mostrar(i));
    h.addEventListener("focus", () => mostrar(i));
    h.addEventListener("click", () => mostrar(i));
  });
  crew.addEventListener("mouseenter", () => (pausado = true));
  crew.addEventListener("mouseleave", () => { pausado = false; inicio = performance.now(); });

  if (!reducirMovimiento) {
    const avanzar = (t) => {
      if (pausado) {
        inicio = t;
      } else {
        const p = (t - inicio) / DURACION;
        bar.style.width = Math.min(p, 1) * 100 + "%";
        if (p >= 1) mostrar((actual + 1) % hexes.length);
      }
      requestAnimationFrame(avanzar);
    };
    requestAnimationFrame(avanzar);
  }
}

// Experiencia: filtrar contratos por línea de servicio
const tabs = document.querySelectorAll(".xp-tab");
const contratos = document.querySelectorAll(".xp");
tabs.forEach((tab) =>
  tab.addEventListener("click", () => {
    tabs.forEach((t) => {
      t.classList.toggle("is-active", t === tab);
      t.setAttribute("aria-selected", t === tab);
    });
    const filtro = tab.dataset.filter;
    contratos.forEach((c) => {
      c.hidden = filtro !== "todos" && c.dataset.cat !== filtro;
    });
  })
);

// Año actual en el pie de página
document.getElementById("year").textContent = new Date().getFullYear();

// Formulario de contacto (FormSubmit): después de enviar, vuelve a esta página con ?enviado=1
document.getElementById("formNext").value =
  location.origin + location.pathname + "?enviado=1#contacto";

if (new URLSearchParams(location.search).has("enviado")) {
  document.getElementById("formOk").hidden = false;
}
