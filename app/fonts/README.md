# Tipografías de Viento Sur

Fraunces (normal e italic), Mulish y Caveat, en WOFF2 variable y subset Latin.
Son los mismos archivos Latin utilizados por el build anterior de `next/font/google`;
incluyen acentos y ñ. Los rangos de peso conservados son 100–900, 200–1000 y
600–700 respectivamente. No se modificaron los archivos de fuente.

`app/layout.tsx` usa `next/font/local` y conserva las variables CSS originales.
El build no consulta Google Fonts ni requiere una caché de fuentes preexistente.
Next.js incluye y sirve estos archivos en sus assets estáticos.

Cada familia se distribuye bajo SIL Open Font License 1.1. Las licencias y avisos
de copyright originales están en los archivos `*-OFL.txt` de esta carpeta.

Fuentes y licencias originales:

- https://github.com/google/fonts/tree/main/ofl/fraunces
- https://github.com/google/fonts/tree/main/ofl/mulish
- https://github.com/google/fonts/tree/main/ofl/caveat
