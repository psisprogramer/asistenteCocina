# Asistente de Cocina inteligente 🍽️


Asistente inteligente de cocina — MVP frontend para gestionar inventario, generar listas de compra automáticas y sugerir menús según lo que tienes disponible.



**Descripción**

Despensa es una aplicación web (MVP) pensada para ayudar a gestionar la cocina de un hogar: qué hay en la despensa, qué está por vencer, qué comprar y qué cocinar con lo disponible. Este MVP está construido enteramente en el frontend con datos simulados, como base para validar el flujo de producto antes de conectar backend e inteligencia artificial real.

**✨ Funcionalidades actuales**


Onboarding inicial (tamaño de hogar, alergias, presupuesto)
Dashboard con resumen de productos próximos a vencer, stock bajo y gasto estimado
Inventario con CRUD completo (agregar, editar, eliminar), vista de lista y de tarjetas, y ordenamiento por nombre / caducidad / cantidad / categoría
Lista de compra automática en 3 modos (Balance, Ahorro, Completo), calculada según próxima necesidad y stock bajo, con comparación contra el presupuesto
Menús sugeridos con % de disponibilidad de ingredientes según el inventario actual, e ingredientes faltantes
Historial de compras con filtros por producto y fecha
Ajustes editables (hogar, alergias, presupuesto)
Simulaciones de funciones avanzadas: OCR de recibo, reconocimiento por foto, comparación de precios (actualmente con datos fijos de ejemplo)


**🛠️ Stack tecnológico**


HTML5 + CSS3 (sin framework, diseño "glassmorphism")
JavaScript vanilla (sin build tool, scripts cargados directo en el HTML)
Datos en memoria (arrays JS), sin persistencia todavía


**📂 Estructura del proyecto**

despensa/
├── index.html
└── estaticos/
    ├── app.js       # Lógica de UI: eventos, render, navegación entre secciones
    ├── logica.js     # Lógica de datos: inventario, lista de compra, menús, simulaciones
    └── styles.css    # Estilos (glassmorphism, responsive)



**🚀 Cómo correrlo**

Al ser HTML/CSS/JS puro, no necesita build ni instalación de dependencias:

bash# Opción 1: abrir index.html directamente en el navegador
#Opción 2 (recomendado): usar Live Server (VS Code) — el proyecto ya trae settings.json configurado en el puerto 5501

**⚠️ Estado actual: MVP con datos simulados**

**Este proyecto está en una fase inicial de validación de flujo, no de producto funcional real:**


Todos los datos (inventario, historial, menús) están hardcodeados en logica.js y se reinician al recargar la página — no hay persistencia (ni localStorage, ni backend).
Las "simulaciones" (OCR, reconocimiento por foto, comparación de precios) devuelven datos fijos de ejemplo, no hay integración real con ningún servicio.
A pesar del nombre "Asistente Inteligente", toda la lógica actual es basada en reglas (if/else, filtros, umbrales) — todavía no hay un modelo de IA ni una API de lenguaje conectada.


**👩‍💻 Autoría**

Proyecto diseñado y desarrollado por Carolina.

