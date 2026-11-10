# Sitio Web de Sanyi Lights Argentina 

Este es un sitio web de Sanyi Lights Argentina que muestra equipos de iluminación profesional, incluyendo cabezas móviles, luces de lavado, luces LED estroboscópicas, luces LED PAR, luces láser y luces de efectos.

## 🚀 Cómo Empezar

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build
```

## 🧪 Tests

El proyecto usa [Vitest](https://vitest.dev/) con React Testing Library y `jsdom`.

```bash
npm test           # corre toda la suite una vez
npm run test:watch # modo interactivo
npm run test:coverage
npm run typecheck  # tsc sobre src
```

Los tests viven junto al código (`src/**/*.test.ts|tsx`). Los helpers puros del catálogo, medios, configuración y presentación se prueban directamente; los componentes se montan con React Testing Library.

## 📁 Estructura del Proyecto

```
src/
├── data/products.ts     # Tipos de productos
├── assets/              # Logo, mapa e imágenes optimizadas
├── components/          # Componentes de React
├── hooks/               # Hooks de datos y UI
├── lib/                 # Catálogo, medios y Supabase
├── pages/               # Páginas del sitio
└── test/                # Setup de Vitest
```

### 📚 Recursos Adicionales

- **Documentación de React**: [react.dev](https://react.dev)
- **Manual de TypeScript**: [typescriptlang.org](https://www.typescriptlang.org/docs)
- **Tailwind CSS**: [tailwindcss.com](https://tailwindcss.com)

---

## 📄 Licencia

Este proyecto es software propietario. Todos los derechos reservados.


## Acceso al panel de administración

El formulario usa usuario y contraseña con Supabase Auth. El usuario `admin` conserva su contraseña original; el identificador interno de Auth es `admin@panel.sanyilights.invalid`. Ese identificador no recibe correo ni se muestra en el formulario. El proveedor de email/contraseña debe estar habilitado y el registro público deshabilitado.

Las cuentas se crean desde un entorno de confianza con la API de administración de Auth. Para una cuenta adicional se usa `<usuario>@panel.sanyilights.invalid`, email confirmado y `app_metadata: { role: "admin", username: "<usuario>" }`. El usuario debe contener solo letras minúsculas, números, guiones o guiones bajos. La recuperación de contraseña se hace manualmente con la API de administración, sin envío de correo. Las claves de servicio nunca deben agregarse al frontend.

El catálogo se puede leer públicamente. Los cambios del catálogo, las categorías, los archivos y la configuración requieren una sesión con rol de administrador, validada mediante RLS. La tabla de usuarios del login anterior queda cerrada a la API pública y su contraseña original fue retirada.

La migración aplicada está documentada en `scripts/enable-admin-auth.sql`. El frontend que usa Auth debe publicarse junto con este cambio: una versión anterior del panel no puede usar las escrituras protegidas con sesión.

La función `save_site_section`, la única vía de escritura de las secciones del sitio, tiene una sola definición: `scripts/save-site-section.sql`. Se puede volver a ejecutar sin riesgo y replica las reglas de `src/lib/site-settings.ts`; `src/lib/site-section-rules.test.ts` falla si se desalinean.

## Videos del admin

Los archivos MP4 se suben al bucket `product-videos` y se guarda su URL pública, con un nombre único y tipo `video/mp4`. Si una subida falla, el formulario conserva los archivos y no guarda un producto incompleto. Las pestañas Hero y Videos también permiten subir archivos MP4/WebM; la página de videos los reproduce directamente. Los límites de tamaño de Supabase siguen aplicando y sus errores se muestran al usuario.
