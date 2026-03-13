document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTOS DEL DOM ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const tasksContainer = document.getElementById('tasks-container');
    const completedContainer = document.getElementById('completed-container');

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

    // --- 2. LÓGICA DE TAREAS ---
    if (taskForm) {
        taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const texto = taskInput.value.trim();
            if (texto !== "") {
                agregarTarea(texto);
                taskInput.value = ""; // Limpiar input
            }
        });
    }

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
        });

        // Lógica del Botón Eliminar
        const btnEliminar = nuevoDiv.querySelector('.delete-btn');
        btnEliminar.addEventListener('click', () => {
            nuevoDiv.remove();
            if (completedContainer.children.length <= 1) {
                completedContainer.classList.add('hidden');
            }
        });

        tasksContainer.appendChild(nuevoDiv);
    }
});

