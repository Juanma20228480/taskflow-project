document.addEventListener('DOMContentLoaded', () => {
    // --- 1. ELEMENTOS DEL DOM ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const tasksContainer = document.getElementById('tasks-container');
    const completedContainer = document.getElementById('completed-container');
    const searchInput = document.getElementById('search-input');
    
    // Navegación
    const btnPending = document.getElementById('btn-show-pending');
    const btnCompleted = document.getElementById('btn-show-completed');
    const btnShowAll = document.getElementById('btn-show-all');
    const viewPending = document.getElementById('view-pending');
    const viewCompleted = document.getElementById('view-completed');
    const viewAll = document.getElementById('view-all');
    const allContainer = document.getElementById('all-container');

    // --- 2. LÓGICA MODO OSCURO ---
    if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.documentElement.classList.toggle('dark');
            const isDark = document.documentElement.classList.contains('dark');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        });
    }

    // --- 3. LÓGICA DE NAVEGACIÓN ---
    function activarFiltro(btnActivo, vistaMostrar) {
        // Reset de botones
        [btnPending, btnCompleted, btnShowAll].forEach(btn => {
            if(btn) {
                btn.classList.remove('font-bold', 'text-indigo-600', 'bg-indigo-50', 'dark:bg-indigo-900/30');
                btn.classList.add('text-slate-500', 'dark:text-slate-400');
            }
        });
        
        // Reset de vistas
        [viewPending, viewCompleted, viewAll].forEach(v => { if(v) v.classList.add('hidden') });

        // Activar seleccionados
        btnActivo.classList.remove('text-slate-500', 'dark:text-slate-400');
        btnActivo.classList.add('font-bold', 'text-indigo-600', 'bg-indigo-50', 'dark:bg-indigo-900/30');
        vistaMostrar.classList.remove('hidden');

        // Si entramos en "Todas", actualizamos ese contenedor específico
        if (vistaMostrar === viewAll) {
            actualizarVistaTodas();
        }
    }

    function actualizarVistaTodas() {
        if (!allContainer) return;
        allContainer.innerHTML = '';
        
        // Obtenemos las tareas de los contenedores activos
        const pendientes = [...tasksContainer.children];
        const completadas = [...completedContainer.children];

        if (pendientes.length === 0 && completadas.length === 0) {
            allContainer.innerHTML = '<p class="text-center text-slate-500 py-4 italic">No hay tareas para mostrar</p>';
            return;
        }

        [...pendientes, ...completadas].forEach(tarea => {
            const clon = tarea.cloneNode(true);
            // Quitamos botones e inputs para que en "Ver Todas" sea solo visual
            clon.querySelector('.delete-btn')?.remove();
            const check = clon.querySelector('input');
            if (check) check.disabled = true;
            allContainer.appendChild(clon);
        });
    }

    // Asignar eventos de navegación
    if(btnPending) btnPending.addEventListener('click', () => activarFiltro(btnPending, viewPending));
    if(btnCompleted) btnCompleted.addEventListener('click', () => activarFiltro(btnCompleted, viewCompleted));
    if(btnShowAll) btnShowAll.addEventListener('click', () => activarFiltro(btnShowAll, viewAll));

    // --- 4. LÓGICA DE TAREAS ---
    if (taskForm) {
        taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const texto = taskInput.value.trim();
            if (texto !== "") {
                agregarTarea(texto, false);
                guardarTareasEnLocalStorage();
                taskInput.value = "";
            }
        });
    }

    function agregarTarea(texto, completada = false) {
        const nuevoDiv = document.createElement('div');
        nuevoDiv.className = "group flex justify-between items-center p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-all duration-200";

        nuevoDiv.innerHTML = `
            <div class="flex items-center gap-3">
                <input type="checkbox" ${completada ? 'checked' : ''} class="task-checkbox w-5 h-5 rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer">
                <span class="text-slate-700 dark:text-slate-200 transition-all ${completada ? 'line-through opacity-50' : ''}">${texto}</span>
            </div>
            <button class="delete-btn text-slate-400 hover:text-red-500 transition-colors font-medium text-sm">Eliminar</button>
        `;

        const checkbox = nuevoDiv.querySelector('.task-checkbox');
        const btnEliminar = nuevoDiv.querySelector('.delete-btn');

        checkbox.addEventListener('change', () => {
            const span = nuevoDiv.querySelector('span');
            if (checkbox.checked) {
                span.classList.add('line-through', 'opacity-50');
                completedContainer.appendChild(nuevoDiv);
            } else {
                span.classList.remove('line-through', 'opacity-50');
                tasksContainer.appendChild(nuevoDiv);
            }
            guardarTareasEnLocalStorage();
            actualizarContadores();
        });

        btnEliminar.addEventListener('click', () => {
            nuevoDiv.remove();
            guardarTareasEnLocalStorage();
            actualizarContadores();
        });

        if (completada) {
            completedContainer.appendChild(nuevoDiv);
        } else {
            tasksContainer.appendChild(nuevoDiv);
        }
        actualizarContadores();
    }

    // --- 5. PERSISTENCIA Y CONTADORES ---
    function guardarTareasEnLocalStorage() {
        const p = [...tasksContainer.querySelectorAll('span')].map(s => s.textContent);
        const c = [...completedContainer.querySelectorAll('span')].map(s => s.textContent);
        localStorage.setItem('tareasPendientes', JSON.stringify(p));
        localStorage.setItem('tareasCompletadas', JSON.stringify(c));
    }

    function cargarTareas() {
        const p = JSON.parse(localStorage.getItem('tareasPendientes')) || [];
        const c = JSON.parse(localStorage.getItem('tareasCompletadas')) || [];
        p.forEach(t => agregarTarea(t, false));
        c.forEach(t => agregarTarea(t, true));
    }

    function actualizarContadores() {
        const p = tasksContainer.children.length;
        const c = completedContainer.children.length;
        if(document.getElementById('count-pending')) document.getElementById('count-pending').textContent = p;
        if(document.getElementById('count-completed')) document.getElementById('count-completed').textContent = c;
        if(document.getElementById('count-total')) document.getElementById('count-total').textContent = p + c;
    }

    const btnClear = document.getElementById('btn-clear-history');
    if (btnClear) {
        btnClear.addEventListener('click', () => {
            if (confirm("¿Limpiar historial?")) {
                completedContainer.innerHTML = '';
                guardarTareasEnLocalStorage();
                actualizarContadores();
            }
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const filtro = e.target.value.toLowerCase();
            document.querySelectorAll('#tasks-container > div, #completed-container > div').forEach(tarea => {
                const texto = tarea.querySelector('span').textContent.toLowerCase();
                tarea.style.display = texto.includes(filtro) ? "flex" : "none";
            });
        });
    }

    // Lanzar carga inicial
    cargarTareas();
});