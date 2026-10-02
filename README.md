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

- Las imágenes y PDFs todavía se cargan desde los servidores de Wix. Conviene descargarlas a `img/` y `docs/` antes de cancelar Wix.
- El botón "Certificado de cumplimiento" no tenía enlace en Wix: falta agregar el PDF.
- Agregar los cargos de cada integrante del equipo.
