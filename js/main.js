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
