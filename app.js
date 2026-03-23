document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTOS DEL DOM ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const tasksContainer = document.getElementById('tasks-container');
    const completedContainer = document.getElementById('completed-container');

    // Elementos de Navegación
    const btnPending = document.getElementById('btn-show-pending');
    const btnCompleted = document.getElementById('btn-show-completed');
    const viewPending = document.getElementById('view-pending');
    const viewCompleted = document.getElementById('view-completed');

    // --- 1. LÓGICA MODO OSCURO ---
    if (localStorage.getItem('theme') === 'dark') {
        document.documentElement.classList.add('dark');
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.documentElement.classList.toggle('dark');
            const isDark = document.documentElement.classList.contains('dark');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        });
    }

    // --- 2. LÓGICA DE NAVEGACIÓN (ASIDE) ---
    function activarFiltro(botonActivo, botonInactivo, vistaMostrar, vistaOcultar) {
        botonActivo.classList.add('font-bold', 'text-indigo-600', 'bg-indigo-50', 'dark:bg-indigo-900/30');
        botonActivo.classList.remove('text-slate-500', 'dark:text-slate-400');
        
        botonInactivo.classList.remove('font-bold', 'text-indigo-600', 'bg-indigo-50', 'dark:bg-indigo-900/30');
        botonInactivo.classList.add('text-slate-500', 'dark:text-slate-400');

        vistaMostrar.classList.remove('hidden');
        vistaOcultar.classList.add('hidden');
    }

    btnPending.addEventListener('click', () => activarFiltro(btnPending, btnCompleted, viewPending, viewCompleted));
    btnCompleted.addEventListener('click', () => activarFiltro(btnCompleted, btnPending, viewCompleted, viewPending));

    // --- 3. LÓGICA DE TAREAS ---
    if (taskForm) {
        taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const texto = taskInput.value.trim();
            if (texto !== "") {
                agregarTarea(texto);
                actualizarContadores(); // <--- AÑADIR AQUÍ (Sube el contador de pendientes)
                taskInput.value = ""; // Limpiar input
            }
        });
    }

    // --- 4. LÓGICA DEL BUSCADOR ---
const searchInput = document.getElementById('search-input');

if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const filtro = e.target.value.toLowerCase(); // Pasamos a minúsculas para que no importe A o a
        
        // Buscamos todas las tareas que existan en ambos contenedores
        const todasLasTareas = document.querySelectorAll('#tasks-container > div, #completed-container > div');

        todasLasTareas.forEach(tarea => {
            const textoTarea = tarea.querySelector('span').textContent.toLowerCase();
            
            // Si el texto de la tarea incluye lo que escribimos, la mostramos; si no, la ocultamos
            if (textoTarea.includes(filtro)) {
                tarea.style.display = "flex"; // Usamos flex porque es su clase original de Tailwind
            } else {
                tarea.style.display = "none";
            }
        });
    });
}

searchInput.addEventListener('input', (e) => {
    const filtro = e.target.value.toLowerCase();
    const viewPending = document.getElementById('view-pending');
    const viewCompleted = document.getElementById('view-completed');

    // Si hay texto en el buscador, mostramos ambas secciones para ver resultados
    if (filtro.length > 0) {
        viewPending.classList.remove('hidden');
        viewCompleted.classList.remove('hidden');
    }

    const todasLasTareas = document.querySelectorAll('#tasks-container > div, #completed-container > div');
    // ... resto del forEach anterior ...
});

    function agregarTarea(texto) {
        const nuevoDiv = document.createElement('div');
        
        // Clases de Tailwind para el contenedor de la tarea
        nuevoDiv.className = "flex justify-between items-center p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-all duration-200 group";

        nuevoDiv.innerHTML = `
            <div class="flex items-center gap-3">
                <input type="checkbox" class="task-checkbox w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer">
                <span class="text-slate-700 dark:text-slate-200 transition-all">${texto}</span>
            </div>
            <button class="delete-btn text-slate-400 hover:text-red-500 transition-colors font-medium">Eliminar</button>
        `;

        // Lógica del Checkbox (Mover entre listas)
        const checkbox = nuevoDiv.querySelector('.task-checkbox');
        const span = nuevoDiv.querySelector('span');

        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                span.classList.add('line-through', 'opacity-50');
                completedContainer.appendChild(nuevoDiv);
                completedContainer.classList.remove('hidden'); // Mostrar sección de completadas
            } else {
                span.classList.remove('line-through', 'opacity-50');
                tasksContainer.appendChild(nuevoDiv);
                // Ocultar sección si no quedan completadas
                if (completedContainer.children.length <= 1) { // 1 por el h3
                    completedContainer.classList.add('hidden');
                }
            }
                actualizarContadores(); // <--- AÑADIR AQUÍ (Actualizar contadores al mover tareas)
        });

        // Lógica del Botón Eliminar
        const btnEliminar = nuevoDiv.querySelector('.delete-btn');
        btnEliminar.addEventListener('click', () => {
            nuevoDiv.remove();
            actualizarContadores(); // <--- AÑADIR AQUÍ (Resta del contador correspondiente)
            if (completedContainer.children.length <= 1) {
                completedContainer.classList.add('hidden');
            }
        });

        tasksContainer.appendChild(nuevoDiv);
    }

    // --- 5. LÓGICA DE ESTADÍSTICAS ---
function actualizarContadores() {
    const totalPendientes = document.getElementById('tasks-container').children.length;
    // Para las completadas, restamos 1 si tienes el <h3> dentro del contenedor
    const totalCompletadas = document.getElementById('completed-container').querySelectorAll('.group').length;

    document.getElementById('count-pending').textContent = totalPendientes;
    document.getElementById('count-completed').textContent = totalCompletadas;
}

    
});



