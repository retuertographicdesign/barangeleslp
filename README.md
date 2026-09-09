# Bar Los Ángeles — web

Sitio de una sola página para **Bar Los Ángeles** (C. Manuel Taño, 1 · 38750 El Paso · La Palma).
Mismo criterio de construcción que la web de El Capricho: HTML estático, sin framework,
partials inyectados por fetch y diccionario de idiomas en `assets/i18n.js`.

## Estructura

```
index.html            Página completa (hero, nosotros, especialidades, carta, galería, contacto)
menu-data.json        Datos de la carta en ES / EN / DE
assets/site.css       Estilos
assets/i18n.js        Diccionario de textos (es / en / de)
assets/site-common.js Idioma, header, menú móvil, modal legal, lightbox y render de la carta
partials/header.html  Cabecera compartida
partials/footer.html  Pie + modal legal
img/                  Logotipo, hero y fotos de galería
```

## Publicar en GitHub Pages

Settings → Pages → Source: `Deploy from a branch` → rama `main`, carpeta `/ (root)`.
Queda en `https://retuertographicdesign.github.io/barangeleslp/`.
Para dominio propio, añadir un fichero `CNAME` en la raíz con el dominio.

> La web usa `fetch()` para cargar los partials y `menu-data.json`, así que **no funciona
> abriendo el `index.html` a pelo desde el disco**. Para verla en local:
> `python3 -m http.server 8000` y abrir `http://localhost:8000`.

## Actualizar la carta

Todo vive en `menu-data.json`. Hay dos tipos de categoría:

**`type: "items"`** — lista de platos con precio:

```json
{
  "id": "tostadas",
  "type": "items",
  "name": { "es": "Tostadas", "en": "Toasts", "de": "Toasts" },
  "sub":  { "es": "Texto opcional bajo el título", "en": "…", "de": "…" },
  "note": { "es": "Aviso opcional al final", "en": "…", "de": "…" },
  "items": [
    {
      "name":  { "es": "…", "en": "…", "de": "…" },
      "desc":  { "es": "…", "en": "…", "de": "…" },
      "price": { "es": "6,50", "en": "6.50", "de": "6,50" }
    }
  ]
}
```

**`type: "grid"`** — rejilla de rellenos o variantes sin precio individual
(se usa en Bocadillos; los precios van en `sub`):

```json
{
  "id": "bocadillos",
  "type": "grid",
  "name": { "es": "Bocadillos", "en": "Baguettes", "de": "Belegte Brötchen" },
  "sub":  { "es": "Bocadillo 3,80 € · Pulga 2,80 € …", "en": "…", "de": "…" },
  "grid": [ { "es": "Pollo", "en": "Chicken", "de": "Hähnchen" } ]
}
```

Detalles:

- `id`: minúsculas, sin espacios ni tildes. Es lo que usa la pestaña.
- `desc`, `sub` y `note` son opcionales; si faltan, no se pintan.
- `price` va **sin** el símbolo del euro (lo añade el render desde `currency`).
  Se pone por idioma para respetar la coma en ES/DE y el punto en EN.
- El orden de `categories` es el orden de las pestañas.

## Pendiente

- [ ] Sustituir `[TITULAR]` y `[NIF]` en `assets/i18n.js` (aviso legal, los tres idiomas).
- [ ] Logotipo en vectorial. El actual viene de un PNG de 225 px escalado a 600.
- [ ] Confirmar redes sociales del bar para enlazarlas en el pie.
- [ ] Revisar dos traducciones heredadas de la carta en inglés:
      "Carne de ave" figura como *Chopped ham* y "Queso amarillo" como *Cheese*.
