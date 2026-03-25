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
                agregarTarea(texto, false);// Agregar tarea sin marcar como completada. False = sin completar
                guardarTareasEnLocalStorage();// Guardar tareas después de agregar una nueva
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
    function agregarTarea(texto, completada = false) {
        const nuevoDiv = document.createElement('div');
        nuevoDiv.className = "flex justify-between items-center p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-all duration-200 group";

        nuevoDiv.innerHTML = `
            <div class="flex items-center gap-3">
                <input type="checkbox" ${completada ? 'checked' : ''} class="task-checkbox w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer">
                <span class="text-slate-700 dark:text-slate-200 transition-all ${completada ? 'line-through opacity-50' : ''}">${texto}</span></span>
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
            guardarTareasEnLocalStorage(); // Guardar tareas después de cambiar su estado
            actualizarContadores();
        });

        const btnEliminar = nuevoDiv.querySelector('.delete-btn');
        btnEliminar.addEventListener('click', () => {
            nuevoDiv.remove();
            guardarTareasEnLocalStorage(); // Guardar tareas después de eliminar una tarea
            actualizarContadores();
        });
        if (completada) {
            completedContainer.appendChild(nuevoDiv);
        } else {
            tasksContainer.appendChild(nuevoDiv);
        }
        actualizarContadores();
    }

    //Función para guardar tareas en LocalStorage (para persistencia de datos)
    function guardarTareasEnLocalStorage() {
        const tareasPendientes = [];
        const tareasCompletadas = [];
    //Recorrer tareas pendientes
        tasksContainer.querySelectorAll('.group').forEach(tarea => {
            const texto = tarea.querySelector('span').textContent;
            tareasPendientes.push(texto);
        });
    //Recorrer tareas completadas
        completedContainer.querySelectorAll('.group').forEach(tarea => {
            const texto = tarea.querySelector('span').textContent;
            tareasCompletadas.push(texto);
        });
    //Convertir el array de tareas a JSON y guardarlo en LocalStorage
        localStorage.setItem('tareasPendientes', JSON.stringify(tareasPendientes));
        localStorage.setItem('tareasCompletadas', JSON.stringify(tareasCompletadas));
    }
    
    function cargarTareasDesdeLocalStorage() {
        const tareasPendientes = JSON.parse(localStorage.getItem('tareasPendientes')) || [];
        const tareasCompletadas = JSON.parse(localStorage.getItem('tareasCompletadas')) || [];

        tareasPendientes.forEach(texto => {
            agregarTarea(texto, false);
        });

        tareasCompletadas.forEach(texto => {
            agregarTarea(texto, true);
        });
    }
    // Cargar tareas al iniciar la aplicación
    cargarTareasDesdeLocalStorage();
    
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