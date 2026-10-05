# CODESIA C.T.A. — Sitio web

Sitio estático (HTML + CSS + JS) basado en el contenido de https://codesiacta.wixsite.com/codesiacta

## Estructura

```
codesia-web/
├── index.html      Página principal
├── css/styles.css  Estilos
├── js/main.js      Menú móvil y formulario de contacto
└── img/            Imágenes locales (opcional)
```

## Cómo trabajar

1. Abrir la carpeta en Visual Studio Code: `code .`
2. Instalar la extensión **Live Server** y hacer clic en "Go Live" para ver los cambios en vivo.
3. Guardar cambios con git:

```bash
git add .
git commit -m "Descripción del cambio"
git push
```

## Pendientes

- Las fotos de obras (`img/`) salen del Portafolio 2026 y los PDF del RTE están en `docs/`.
- El logo, las fotos del equipo y los logos de clientes todavía se cargan desde Wix. Conviene descargarlos a `img/` antes de cancelar Wix.
- Documentos RTE vigencia 2025 publicados.
- Las fotos del portafolio son de baja resolución (300–900 px). Si existen los originales, reemplazarlos en `img/` con el mismo nombre.
