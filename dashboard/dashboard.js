// Dashboard de experiencia: pinta las cifras de datos.js (generado desde el Excel)
const D = window.DATOS;
const fmt = (n, dec = 0) => n.toLocaleString("es-CO", { minimumFractionDigits: dec, maximumFractionDigits: dec });
const el = (tag, cls, html) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
};

// ===== Tooltip compartido =====
const tip = document.getElementById("tip");
function conTooltip(nodo, html) {
  const mover = (e) => {
    const x = Math.min(e.clientX + 14, innerWidth - tip.offsetWidth - 8);
    const y = Math.max(e.clientY - tip.offsetHeight - 12, 8);
    tip.style.left = x + "px";
    tip.style.top = y + "px";
  };
  nodo.addEventListener("pointerenter", (e) => { tip.innerHTML = html; tip.hidden = false; mover(e); });
  nodo.addEventListener("pointermove", mover);
  nodo.addEventListener("pointerleave", () => { tip.hidden = true; });
}

// ===== Animación al entrar en pantalla =====
const alVer = (nodo, fn) => {
  if (!("IntersectionObserver" in window)) return fn();
  const io = new IntersectionObserver((entradas) => {
    if (entradas.some((x) => x.isIntersecting)) { io.disconnect(); fn(); }
  }, { threshold: 0.25 });
  io.observe(nodo);
};
const sinMovimiento = matchMedia("(prefers-reduced-motion: reduce)").matches;

// ===== KPIs de portada =====
const valores = {
  "rup.smmlv": D.rup.smmlv,
  "rup.contratos": D.rup.contratos,
  "detalle.departamentos": D.detalle.departamentos,
  anios: new Date().getFullYear() - D.rup.fundacion,
};
document.querySelectorAll("[data-count]").forEach((nodo) => {
  const fin = valores[nodo.dataset.count];
  nodo.textContent = fmt(fin);
  if (sinMovimiento) return;
  alVer(nodo, () => {
    const t0 = performance.now(), dur = 1400;
    const paso = (t) => {
      const p = Math.min((t - t0) / dur, 1);
      nodo.textContent = fmt(Math.round(fin * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(paso);
    };
    requestAnimationFrame(paso);
  });
});

// ===== Capacidad =====
document.getElementById("capLiquidez").textContent = fmt(D.rup.liquidez, 2);
document.getElementById("capEndeuda").textContent = fmt(D.rup.endeudamiento * 100) + " %";
document.getElementById("capProponente").textContent = D.rup.proponente;
const pctLiq = Math.floor((100 * D.detalle.liquidados) / D.detalle.contratos);
document.getElementById("capLiquidados").textContent = pctLiq + " %";
document.getElementById("capLiquidadosNota").textContent = `${D.detalle.liquidados} de ${D.detalle.contratos} con detalle`;

// ===== Barras horizontales =====
function barras(lista, items, { nombre, sub, valor, nota, tooltip }) {
  const max = Math.max(...items.map(valor));
  items.forEach((it) => {
    const li = el("li", "bar");
    li.append(
      el("div", "bar__name", `${nombre(it)}${sub ? `<small>${sub(it)}</small>` : ""}`),
      el("div", "bar__track", '<div class="bar__fill"></div>'),
      el("div", "bar__value", `${fmt(valor(it))}${nota ? `<small>${nota(it)}</small>` : ""}`)
    );
    li.dataset.pct = (100 * valor(it)) / max;
    conTooltip(li, tooltip(it));
    lista.append(li);
  });
  alVer(lista, () => lista.querySelectorAll(".bar").forEach((b) => {
    b.querySelector(".bar__fill").style.width = b.dataset.pct + "%";
  }));
}

const lineas = D.lineas;
document.getElementById("tituloLineas").textContent =
  `El ${fmt(lineas[0].participacion)} % de nuestra experiencia está en ${lineas[0].nombre.toLowerCase()}`;
barras(document.getElementById("barsLineas"), lineas, {
  nombre: (l) => l.nombre,
  sub: (l) => `${l.contratos} contratos`,
  valor: (l) => l.smmlv,
  nota: (l) => `${fmt(l.participacion, 1)} %`,
  tooltip: (l) => `<b>${l.nombre}</b>${fmt(l.smmlv)} SMMLV · ${fmt(l.participacion, 1)} %<br>${l.contratos} contratos`,
});

barras(document.getElementById("barsClientes"), D.clientes.slice(0, 6), {
  nombre: (c) => c.nombre,
  valor: (c) => c.smmlv,
  tooltip: (c) => `<b>${c.nombre}</b>${fmt(c.smmlv)} SMMLV<br>${c.contratos} contratos`,
});

// ===== Tipo de cliente (barra apilada) =====
const coloresTipo = { publico: "#1b3f94", solidario: "#2e9e3e", privado: "#9aa8c4" };
const split = document.getElementById("splitTipos");
const franja = el("div", "split__bar");
const leyenda = el("ul", "split__legend");
D.tipos_cliente.forEach((t) => {
  const seg = el("div", "split__seg");
  seg.style.flex = t.participacion;
  seg.style.background = coloresTipo[t.clave];
  conTooltip(seg, `<b>${t.nombre}</b>${fmt(t.participacion, 1)} % de la experiencia<br>${t.contratos} contratos`);
  franja.append(seg);
  leyenda.append(el("li", null, `<i style="background:${coloresTipo[t.clave]}"></i>${t.nombre} <b>${fmt(t.participacion)} %</b>`));
});
split.append(franja, leyenda);

// ===== Trayectoria (columnas) =====
const cols = document.getElementById("colsTrayectoria");
const maxT = Math.max(...D.trayectoria.map((t) => t.smmlv));
const etiquetas = el("div", "cols__labels");
D.trayectoria.forEach((t) => {
  const col = el("div", "col" + (t.smmlv === maxT ? " is-peak" : ""));
  col.append(el("span", "col__value", fmt(t.smmlv)), el("div", "col__fill"));
  col.dataset.h = (100 * t.smmlv) / maxT;
  conTooltip(col, `<b>${t.periodo}</b>${fmt(t.smmlv)} SMMLV<br>${t.contratos} contratos`);
  cols.append(col);
  etiquetas.append(el("span", null, t.periodo.replace(/^(\d{4})–(\d{2})(\d{2})$/, "$1–$3")));
});
cols.after(etiquetas);
alVer(cols, () => cols.querySelectorAll(".col").forEach((c) => {
  // la altura disponible descuenta la etiqueta del valor
  c.querySelector(".col__fill").style.height = `calc((100% - 26px) * ${c.dataset.h / 100})`;
}));

// ===== Presencia =====
const presencia = new Map(D.presencia.map((p) => [p.nombre, p.contratos]));
document.getElementById("numDptos").textContent = presencia.size;
const nombreD = document.getElementById("dptoNombre");
const infoD = document.getElementById("dptoInfo");
const listaD = document.getElementById("listaDptos");
const caminos = [...document.querySelectorAll(".presence__map path[data-name]")];
const botones = [];
const maxD = Math.max(...presencia.values());

function elegir(nombre) {
  const n = presencia.get(nombre);
  nombreD.textContent = nombre;
  infoD.textContent = `${n} ${n === 1 ? "contrato" : "contratos"}${nombre === "Huila" ? " · sede principal en Neiva" : ""}`;
  caminos.forEach((p) => p.classList.toggle("is-active", p.dataset.name === nombre));
  botones.forEach((b) => b.classList.toggle("is-active", b.dataset.name === nombre));
}

caminos.forEach((p) => {
  const n = presencia.get(p.dataset.name);
  if (!n) return;
  p.classList.add("on");
  p.setAttribute("tabindex", "0");
  // intensidad: verde más claro para más contratos (escala logarítmica, Huila domina)
  const t = Math.log(n + 1) / Math.log(maxD + 1);
  p.style.fill = `color-mix(in oklab, #47c35a ${Math.round(45 + 55 * t)}%, #1d3778)`;
  ["pointerenter", "focus", "click"].forEach((ev) => p.addEventListener(ev, () => elegir(p.dataset.name)));
});

D.presencia.forEach((d) => {
  const b = el("button", null, `<span>${d.nombre}</span><b>${d.contratos}</b>`);
  b.type = "button";
  b.dataset.name = d.nombre;
  b.addEventListener("click", () => elegir(d.nombre));
  b.addEventListener("pointerenter", () => elegir(d.nombre));
  botones.push(b);
  const li = el("li");
  li.append(b);
  listaD.append(li);
});
elegir(D.presencia[0].nombre);

// ===== Nota de fuente =====
document.getElementById("notaFuente").textContent =
  `Totales: certificado RUP (proponente No. ${D.rup.proponente}, renovado el ${D.rup.renovado}). ` +
  `Distribuciones calculadas sobre ${D.detalle.contratos} contratos con detalle documentado (${fmt(D.detalle.smmlv)} SMMLV). ` +
  `Indicadores financieros con corte al ${D.rup.corte_financiero}.`;

// ===== Compartir =====
document.getElementById("btnCompartir").addEventListener("click", async (e) => {
  const datos = { title: "CODESIA C.T.A. · Experiencia en cifras", url: location.href };
  if (navigator.share) {
    try { await navigator.share(datos); } catch { /* cancelado */ }
    return;
  }
  try {
    await navigator.clipboard.writeText(location.href);
    e.target.textContent = "Enlace copiado";
    setTimeout(() => { e.target.textContent = "Compartir"; }, 2000);
  } catch { /* sin portapapeles */ }
});
