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

// Formulario de contacto: abre el correo del visitante con el mensaje listo
document.getElementById("contactForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const datos = new FormData(e.target);
  const asunto = datos.get("asunto") || "Contacto desde la página web";
  const cuerpo =
    `Nombre: ${datos.get("nombre")}\n` +
    `Email: ${datos.get("email")}\n\n` +
    `${datos.get("mensaje")}`;
  window.location.href =
    `mailto:codesiacta@gmail.com?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
});
