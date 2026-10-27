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

- Todas las imágenes y PDF están en `img/` y `docs/` (ya no depende de Wix).
- `politica-de-datos.html`: política de datos (Ley 1581 de 2012). Conviene que la revise un abogado.
- Faltan para el pie de página: número de inscripción en el RUP y matrícula de Cámara de Comercio.
- La foto de Jhon Jairo es de muy baja resolución (74 px): conviene reemplazar `img/equipo-jhon-jairo-vargas.jpg`.
- `img/compartir.jpg` es la imagen que aparece al compartir el link (1200x630).

## Dashboard de experiencia (`dashboard/`)

Página con las cifras de experiencia: https://codesiacta.github.io/dashboard/ (el QR para imprimir está en `../QR DASHBOARD/`).

Para actualizar las cifras después de cambiar el Excel `EXPERIENCIA CODESIA CTA 2026.xlsx`:

```bash
python herramientas/actualizar_dashboard.py
git add dashboard/datos.js
git commit -m "Actualizar cifras del dashboard"
git push
```

Las cifras del certificado RUP (contratos, SMMLV, liquidez, endeudamiento) se cambian a mano en `RUP` dentro del script. Los proyectos insignia se editan en `dashboard/index.html`.
