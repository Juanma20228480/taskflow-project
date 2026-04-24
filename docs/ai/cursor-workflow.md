# Flujo de Trabajo en Cursor
Aquí se documenta la experiencia de utilizar Cursor como IDE principal asistido por IA para el proyecto.

**Objetivo:** Analizar cómo herramientas como el `Composer`, el `@Codebase` indexing y la integración de terminal inteligente optimizan el tiempo de desarrollo y la navegación por el código de la aplicación.

Configuración del backend con arquitectura por capas
En el backend de TaskFlow hemos aplicado una arquitectura por capas para separar responsabilidades y mantener el código más limpio.
La capa de entrada/configuración está en app.js, donde se inicializa Express, se añaden middlewares (cors, express.json), se monta la ruta base /api/tasks y se centraliza el manejo de errores (404 y errores generales).
La capa de rutas está en routes/taskRoutes.js, donde solo se definen endpoints y métodos HTTP (GET, POST, PUT, DELETE) y se delega cada operación al controlador correspondiente.
La capa de controladores está en controllers/taskController.js, donde se implementa la lógica de negocio: validaciones, creación/actualización/eliminación de tareas, búsqueda por id y respuesta JSON.

Separar rutas de controladores nos ha aportado beneficios claros:

Mayor claridad: las rutas describen “qué endpoint existe” y los controladores “qué hace”.
Mejor mantenibilidad: cambiar lógica interna no obliga a tocar el enrutado.
Escalabilidad: es más fácil añadir nuevos módulos (por ejemplo, usuarios) replicando la misma estructura.
Reutilización y testeo: la lógica queda concentrada en funciones de controlador más fáciles de probar de forma aislada.
Menos acoplamiento: cada archivo tiene una única responsabilidad, reduciendo errores al evolucionar el proyecto.