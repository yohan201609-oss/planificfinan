# 💰 PlanificFinan - Gestión de Finanzas Personales

PlanificFinan es una aplicación web moderna y elegante construida con React para planificar y gestionar tus finanzas personales con un hermoso diseño en tonos azules.

## 🌟 Características

- **⚡ Aplicación React Moderna**: Construida con React 18, Vite y componentes funcionales
- **🎨 Interfaz Elegante**: Diseño moderno con esquema de colores azules profesional
- **💰 Gestión Completa**: Agrega, visualiza y elimina transacciones fácilmente
- **📊 Balance en Tiempo Real**: Ve tu balance total, ingresos y gastos actualizados automáticamente
- **🏷️ Categorización Inteligente**: Organiza tus transacciones con iconos de Lucide React
- **🔍 Búsqueda y Filtros**: Busca por descripción y filtra por tipo de transacción y categoría
- **💾 Persistencia Local**: Tus datos se guardan automáticamente en localStorage
- **📱 Diseño Responsive**: Funciona perfectamente en móviles, tablets y escritorio
- **🌍 Soporte Multidivisa**: 11 monedas diferentes con formateo automático
- **📤📥 Exportar/Importar**: Guarda y restaura tus datos en formato JSON
- **⌨️ Atajos de Teclado**: Navegación rápida con shortcuts
- **♿ Accesibilidad**: Diseñado siguiendo las mejores prácticas de accesibilidad

## 🚀 Tecnologías Utilizadas

- **React 18**: Framework principal con hooks y context API
- **Vite**: Build tool ultrarrápido para desarrollo
- **Lucide React**: Iconos modernos y escalables
- **CSS Modules**: Estilos modulares y mantenibles
- **Context API**: Gestión de estado global sin librerías externas
- **LocalStorage**: Persistencia de datos del lado del cliente

## 🛠️ Instalación y Desarrollo

### Prerrequisitos
- Node.js 18+ 
- npm o yarn

### Configuración

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/planificfinan.git
cd planificfinan

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
# O usar el script de Windows
start.bat

# Construir para producción
npm run build

# Vista previa de producción
npm run preview

# Desplegar en Netlify
deploy.bat
```

## 🎯 Cómo Usar

### 1. Gestionar Moneda
- Selecciona tu moneda preferida en el header
- Soporta 11 monedas con formateo automático

### 2. Agregar Transacciones
1. Completa el formulario "Agregar Transacción"
2. Describe la transacción (máximo 100 caracteres)
3. Especifica la cantidad (solo números positivos)
4. Selecciona categoría y tipo (ingreso/gasto)
5. Elige la fecha
6. Presiona "Agregar" o usa Ctrl+Enter

### 3. Buscar y Filtrar
- **Búsqueda**: Busca por descripción o categoría
- **Filtros**: Por tipo (ingresos/gastos) y categoría específica
- **Limpiar**: Usa "Limpiar Filtros" o presiona Escape

### 4. Gestionar Datos
- **Exportar**: Descarga tus datos en formato JSON
- **Importar**: Sube un archivo JSON para restaurar datos
- **Eliminar**: Borra transacciones individuales o todas

## 💱 Monedas Soportadas

| Moneda | Código | Región |
|--------|--------|---------|
| Euro | EUR | Europa |
| Dólar Estadounidense | USD | Estados Unidos |
| Peso Dominicano | DOP | República Dominicana |
| Peso Mexicano | MXN | México |
| Peso Argentino | ARS | Argentina |
| Peso Colombiano | COP | Colombia |
| Peso Chileno | CLP | Chile |
| Sol Peruano | PEN | Perú |
| Libra Esterlina | GBP | Reino Unido |
| Dólar Canadiense | CAD | Canadá |
| Yen Japonés | JPY | Japón |

## 📱 Categorías Disponibles

### 💰 Ingresos
- **Salario**: Trabajo principal
- **Freelance**: Trabajo independiente  
- **Inversión**: Rendimientos de inversiones

### 💸 Gastos
- **Comida**: Alimentación y restaurantes
- **Transporte**: Movilidad y combustible
- **Entretenimiento**: Ocio y diversión
- **Servicios**: Utilidades y servicios
- **Salud**: Médicos y medicamentos
- **Compras**: Productos y artículos
- **Otros**: Gastos varios

## ⌨️ Atajos de Teclado

| Atajo | Acción |
|-------|--------|
| `Ctrl + Enter` | Enviar formulario de transacción |
| `Escape` | Limpiar filtros |

## 🎨 Personalización

### Tema de Colores
```css
:root {
  --primary-blue: #2563eb;
  --secondary-blue: #60a5fa;
  --success-color: #10b981;
  --danger-color: #ef4444;
}
```

### Agregar Nuevas Categorías
1. Edita `src/utils/categories.js`
2. Agrega la nueva categoría con su icono de Lucide React
3. La categoría aparecerá automáticamente en formularios y filtros

## 📊 Estructura del Proyecto

```
src/
├── components/          # Componentes React
│   ├── Alert.jsx       # Sistema de notificaciones
│   ├── BalanceCard.jsx # Tarjeta de balance
│   ├── Header.jsx      # Cabecera con selector de moneda
│   ├── TransactionForm.jsx    # Formulario de transacciones
│   ├── TransactionFilters.jsx # Filtros y búsqueda
│   ├── TransactionList.jsx    # Lista de transacciones
│   └── TransactionItem.jsx    # Item individual
├── context/            # Context API
│   └── FinanceContext.jsx    # Estado global
├── utils/              # Utilidades
│   ├── categories.js   # Configuración de categorías
│   ├── currency.js     # Formateo de monedas
│   ├── helpers.js      # Funciones auxiliares
│   └── storage.js      # Gestión de localStorage
├── App.jsx            # Componente principal
├── main.jsx           # Punto de entrada
└── index.css          # Estilos globales
```

## 🔧 Scripts Disponibles

```bash
npm run dev           # Servidor de desarrollo
npm run build         # Construir para producción
npm run preview       # Vista previa de producción
npm run lint          # Ejecutar ESLint
npm run start         # Alias para dev
npm run deploy        # Desplegar en Netlify (producción)
npm run deploy:preview # Desplegar preview en Netlify
```

### Scripts de Windows
- `start.bat` - Iniciar aplicación (equivalente a npm run dev)
- `deploy.bat` - Desplegar en Netlify (equivalente a npm run build + deploy)

## 🌐 Compatibilidad

- **Navegadores**: Chrome 88+, Firefox 85+, Safari 14+, Edge 88+
- **Dispositivos**: Desktop, tablet, móvil
- **Resoluciones**: Responsive desde 320px hasta 1920px+

## 📝 Características Técnicas

### Gestión de Estado
- Context API para estado global
- Reducers para lógica compleja
- Persistencia automática en localStorage

### Validaciones
- Validación en tiempo real de formularios
- Restricciones de longitud y formato
- Mensajes de error contextuales

### Rendimiento
- Componentes optimizados con React.memo
- Lazy loading de componentes pesados
- Minimización automática con Vite

### Accesibilidad
- Soporte completo para lectores de pantalla
- Navegación por teclado
- Contraste alto y tamaños legibles

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Para contribuir:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🙏 Agradecimientos

- [React](https://reactjs.org/) - Framework de JavaScript
- [Vite](https://vitejs.dev/) - Build tool
- [Lucide React](https://lucide.dev/) - Biblioteca de iconos
- [MDN Web Docs](https://developer.mozilla.org/) - Documentación web

---

**¡Disfruta gestionando tus finanzas de manera moderna y elegante! 💙**

*Construido con ❤️ y React*

