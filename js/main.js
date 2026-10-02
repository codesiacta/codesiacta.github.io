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

// Año actual en el pie de página
document.getElementById("year").textContent = new Date().getFullYear();

// Formulario de contacto (FormSubmit): después de enviar, vuelve a esta página con ?enviado=1
document.getElementById("formNext").value =
  location.origin + location.pathname + "?enviado=1#contacto";

if (new URLSearchParams(location.search).has("enviado")) {
  document.getElementById("formOk").hidden = false;
}
