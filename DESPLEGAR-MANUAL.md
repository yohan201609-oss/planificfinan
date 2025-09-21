# 🚀 Desplegar en Netlify - Guía Rápida

## ⚡ **Método Súper Fácil (5 minutos)**

### Paso 1: Preparar la aplicación
```bash
# En la terminal, en la carpeta del proyecto:
npm install
npm run build
```

### Paso 2: Ir a Netlify
1. **Abre** https://netlify.com en tu navegador
2. **Inicia sesión** o crea una cuenta gratuita
3. **Arrastra** la carpeta `dist` (que se creó en el paso 1) a la zona de "Deploy manually"

### Paso 3: ¡Listo!
- **URL automática**: `https://tu-app-aleatoria.netlify.app`
- **Personalizar nombre**: Ve a Site settings → Change site name

---

## 🎯 **Si el build falla, usa este método alternativo:**

### Opción A: Build manual
```bash
# Instalar Vite globalmente
npm install -g vite

# Ejecutar build
vite build
```

### Opción B: Usar el servidor de desarrollo
1. **Ejecuta**: `npm run dev`
2. **Abre**: http://localhost:3000
3. **Guarda la página** como HTML completo
4. **Sube** el archivo HTML a Netlify

---

## 📁 **Archivos que necesitas subir a Netlify:**

### Si usas el método de arrastrar y soltar:
- **Carpeta completa**: `dist/` (contiene todos los archivos)

### Si usas el método manual:
- **Archivo principal**: `index.html`
- **Carpeta de assets**: `assets/` (si existe)

---

## 🔧 **Configuración en Netlify:**

### Build settings (si usas GitHub):
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: 18

### Domain settings:
- **Site name**: `tu-finanzas-personales` (o el que prefieras)
- **Custom domain**: Opcional

---

## ✅ **Verificación:**

Después del deploy, verifica que:
- [ ] La aplicación carga correctamente
- [ ] El formulario funciona
- [ ] Las monedas cambian
- [ ] Los datos se guardan
- [ ] Funciona en móvil

---

## 🆘 **Si algo falla:**

### Error: "Build failed"
```bash
# Limpiar todo y reinstalar
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Error: "Page not found"
- Verifica que subiste la carpeta `dist` completa
- No solo el archivo `index.html`

### Error: "Assets not loading"
- Asegúrate de subir toda la carpeta `dist`
- Incluye la carpeta `assets` si existe

---

## 🎊 **¡Tu app estará online!**

Una vez desplegada, tendrás:
- ✅ **URL pública** para compartir
- ✅ **HTTPS automático**
- ✅ **CDN global** (carga rápida)
- ✅ **Acceso desde cualquier dispositivo**

**URL de ejemplo**: `https://tu-finanzas-personales.netlify.app`

---

## 💡 **Consejos:**

1. **Guarda la URL** de tu app desplegada
2. **Prueba en diferentes dispositivos**
3. **Comparte con amigos** para probar
4. **Considera un dominio personalizado** si planeas usarla mucho

---

**¡Es súper fácil! Solo arrastra la carpeta `dist` a Netlify y listo! 🚀**
