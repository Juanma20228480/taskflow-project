document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTOS DEL DOM ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const tasksContainer = document.getElementById('tasks-container');
    const completedContainer = document.getElementById('completed-container');
    const searchInput = document.getElementById('search-input');

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

    // --- 3. LÓGICA DE TAREAS (SUBMIT) ---
    if (taskForm) {
        taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const texto = taskInput.value.trim();
            if (texto !== "") {
                agregarTarea(texto);
                actualizarContadores();
                taskInput.value = "";
            }
        });
    }

    // --- 4. LÓGICA DEL BUSCADOR (UNIFICADA) ---
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const filtro = e.target.value.toLowerCase();
            
            // Mostrar ambas vistas si hay búsqueda
            if (filtro.length > 0) {
                viewPending.classList.remove('hidden');
                viewCompleted.classList.remove('hidden');
            }

            const todasLasTareas = document.querySelectorAll('#tasks-container > div, #completed-container > div');

            todasLasTareas.forEach(tarea => {
                const span = tarea.querySelector('span');
                if (span) {
                    const textoTarea = span.textContent.toLowerCase();
                    tarea.style.display = textoTarea.includes(filtro) ? "flex" : "none";
                }
            });
        });
    }

    // --- 5. FUNCIÓN AGREGAR TAREA ---
    function agregarTarea(texto) {
        const nuevoDiv = document.createElement('div');
        nuevoDiv.className = "flex justify-between items-center p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-all duration-200 group";

        nuevoDiv.innerHTML = `
            <div class="flex items-center gap-3">
                <input type="checkbox" class="task-checkbox w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer">
                <span class="text-slate-700 dark:text-slate-200 transition-all">${texto}</span>
            </div>
            <button class="delete-btn text-slate-400 hover:text-red-500 transition-colors font-medium">Eliminar</button>
        `;

        const checkbox = nuevoDiv.querySelector('.task-checkbox');
        const span = nuevoDiv.querySelector('span');

        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                span.classList.add('line-through', 'opacity-50');
                completedContainer.appendChild(nuevoDiv);
            } else {
                span.classList.remove('line-through', 'opacity-50');
                tasksContainer.appendChild(nuevoDiv);
            }
            actualizarContadores();
        });

        const btnEliminar = nuevoDiv.querySelector('.delete-btn');
        btnEliminar.addEventListener('click', () => {
            nuevoDiv.remove();
            actualizarContadores();
        });

        tasksContainer.appendChild(nuevoDiv);
    }

    // --- 6. LÓGICA DE ESTADÍSTICAS ---
    function actualizarContadores() {
        const totalPendientes = tasksContainer.children.length;
        const totalCompletadas = completedContainer.querySelectorAll('.group').length;

        document.getElementById('count-pending').textContent = totalPendientes;
        document.getElementById('count-completed').textContent = totalCompletadas;
        
        const countTotal = document.getElementById('count-total');
        if (countTotal) {
            countTotal.textContent = totalPendientes + totalCompletadas;
        }
    }

}); // CIERRE FINAL DEL DOMContentLoaded