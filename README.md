# 🐄 BOVISOFT - Sistema de Gestión Ganadera SaaS

![Vue.js](https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vue.js&logoColor=4FC08D)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)

**Bovisoft** es una aplicación web Full-Stack diseñada para digitalizar, organizar y optimizar la administración de fincas ganaderas. Construida bajo una arquitectura **Mobile-First**, permite a los propietarios gestionar su inventario, analizar métricas en tiempo real y registrar ventas directamente desde el campo a través de sus dispositivos móviles.

🔗 **[Visita la aplicación en vivo aquí](https://bovisoft-front.vercel.app/)**

---

## ✨ Características Principales

* 📱 **Diseño 100% Responsivo:** Interfaz adaptada para celulares mediante "Tarjetas" (Cards) dinámicas, menús interactivos y modales sobrepuestos con `<Teleport>` para una experiencia de usuario fluida sin importar el tamaño de la pantalla.
* 📊 **Dashboard Analítico:** Visualización en tiempo real de la biomasa total, peso promedio, distribución por razas y proporción de género utilizando **Chart.js**.
* 🐄 **Gestión de Inventario (CRUD):** Registro detallado de bovinos (arete visual, nombre, raza, género, peso).
* 💰 **Módulo de Ventas:** Registro de transacciones financieras con validación de inputs y formateo de moneda en tiempo real.
* 📄 **Exportación de Reportes:** Generación automática del historial comercial en formato Excel `.xlsx` mediante la librería **SheetJS**.
* 🔐 **Autenticación y Perfil:** Sistema de login seguro con JWT y panel de configuración de usuario para personalizar los datos de la hacienda.

---

## 🛠️ Stack Tecnológico

**Frontend:**
* **Framework:** Vue 3 (Composition API)
* **Lenguaje:** TypeScript
* **Estilos:** Tailwind CSS
* **Build Tool:** Vite
* **Gestor de Estado:** Pinia
* **Peticiones HTTP:** Axios
* **Librerías Extra:** Chart.js, vue-chartjs, xlsx (SheetJS)

**Backend / Infraestructura:**
* **API:** Node.js / Express (Repositorio Backend: 
* **Base de Datos:** PostgreSQL
* **Despliegue:** Vercel (Frontend)

---
