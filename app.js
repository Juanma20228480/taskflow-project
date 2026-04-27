document.addEventListener('DOMContentLoaded', () => {
    // --- 1. ELEMENTOS DEL DOM ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const tasksContainer = document.getElementById('tasks-container');
    const completedContainer = document.getElementById('completed-container');
    const searchInput = document.getElementById('search-input');
    const taskPriority = document.getElementById('task-priority');
    const sortFilter = document.getElementById('sort-filter');
    
    const btnPending = document.getElementById('btn-show-pending');
    const btnCompleted = document.getElementById('btn-show-completed');
    const btnShowAll = document.getElementById('btn-show-all');
    const viewPending = document.getElementById('view-pending');
    const viewCompleted = document.getElementById('view-completed');
    const viewAll = document.getElementById('view-all');
    const allContainer = document.getElementById('all-container');
    const btnCompleteAll = document.getElementById('btn-complete-all');
    const btnClear = document.getElementById('btn-clear-history');

    // --- 2. LÓGICA MODO OSCURO ---
    if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.documentElement.classList.toggle('dark');
            localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
        });
    }

    // --- 3. GESTIÓN DE TAREAS (CORE) ---
    function agregarTarea(texto, completada = false, prioridad = "media", id) {
        const nuevoDiv = document.createElement('div');
        const badgeColors = { alta: "bg-red-500", media: "bg-yellow-400", baja: "bg-green-500" };

        nuevoDiv.className = "group flex justify-between items-center p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-all duration-200";
        nuevoDiv.setAttribute('data-priority', prioridad);
        if (id != null) {
            nuevoDiv.setAttribute('data-id', String(id));
        }
        
        nuevoDiv.innerHTML = `
            <div class="flex items-center gap-3 flex-1">
                <input type="checkbox" ${completada ? 'checked' : ''} class="task-checkbox w-5 h-5 rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer">
                <div class="flex flex-col flex-1">
                    <span class="text-task text-slate-700 dark:text-slate-200 ${completada ? 'line-through opacity-50' : ''}">${texto}</span>
                    <input type="text" class="edit-input hidden p-1 rounded border border-indigo-400 bg-slate-50 dark:bg-slate-900 dark:text-white outline-none w-full" value="${texto}">
                    <span class="text-[10px] uppercase font-bold text-white px-2 py-0.5 rounded-full w-fit ${badgeColors[prioridad]} mt-1">${prioridad}</span>
                </div>
            </div>
            <div class="flex items-center gap-2">
                <button class="edit-btn text-slate-400 hover:text-indigo-500 transition-colors font-medium text-sm">Editar</button>
                <button class="delete-btn text-slate-400 hover:text-red-500 transition-colors font-medium text-sm">Eliminar</button>
            </div>
        `;

        const checkbox = nuevoDiv.querySelector('.task-checkbox');
        const btnEliminar = nuevoDiv.querySelector('.delete-btn');
        const btnEditar = nuevoDiv.querySelector('.edit-btn');
        const spanTexto = nuevoDiv.querySelector('.text-task');
        const inputEdit = nuevoDiv.querySelector('.edit-input');

        // Lógica de Edición
        btnEditar.addEventListener('click', async () => {
            const isEditing = !inputEdit.classList.contains('hidden');
            if (isEditing) {
                const nuevoValor = inputEdit.value.trim();
                if (nuevoValor) {
                    const taskId = nuevoDiv.getAttribute('data-id');
                    if (taskId) {
                        try {
                            await requestWithFallback(`/${taskId}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ title: nuevoValor }),
                            }, () => updateLocalTask(taskId, { title: nuevoValor }));
                        } catch (err) {
                            console.error(err);
                            return;
                        }
                    }
                    spanTexto.textContent = nuevoValor;
                }
                inputEdit.classList.add('hidden');
                spanTexto.classList.remove('hidden');
                btnEditar.textContent = "Editar";
                btnEditar.classList.remove('text-green-500');
            } else {
                inputEdit.classList.remove('hidden');
                spanTexto.classList.add('hidden');
                inputEdit.focus();
                btnEditar.textContent = "Guardar";
                btnEditar.classList.add('text-green-500');
            }
        });

        inputEdit.addEventListener('keypress', (e) => { if (e.key === 'Enter') btnEditar.click(); });

        // Checkbox (Completar/Descompletar)
        checkbox.addEventListener('change', async () => {
            const taskId = nuevoDiv.getAttribute('data-id');
            const willBeCompleted = checkbox.checked;
            if (taskId) {
                try {
                    await requestWithFallback(`/${taskId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ completed: willBeCompleted }),
                    }, () => updateLocalTask(taskId, { completed: willBeCompleted }));
                } catch (err) {
                    console.error(err);
                    checkbox.checked = !willBeCompleted;
                    return;
                }
            }
            if (checkbox.checked) {
                spanTexto.classList.add('line-through', 'opacity-50');
                completedContainer.appendChild(nuevoDiv);
            } else {
                spanTexto.classList.remove('line-through', 'opacity-50');
                tasksContainer.appendChild(nuevoDiv);
            }
            actualizarContadores();
        });

        btnEliminar.addEventListener('click', async () => {
            const taskId = nuevoDiv.getAttribute('data-id');
            if (taskId) {
                try {
                    await requestWithFallback(`/${taskId}`, {
                        method: 'DELETE',
                    }, () => {
                        deleteLocalTask(taskId);
                        return { success: true };
                    });
                } catch (err) {
                    console.error(err);
                    return;
                }
            }
            nuevoDiv.remove();
            actualizarContadores();
        });

        if (completada) completedContainer.appendChild(nuevoDiv);
        else tasksContainer.appendChild(nuevoDiv);
        
        actualizarContadores();
    }

    // --- 4. PERSISTENCIA Y NAVEGACIÓN ---
    const API_TASKS_URL = "http://localhost:3000/api/tasks";
    const LOCAL_STORAGE_TASKS_KEY = "tasks_local_fallback";
    let isApiAvailable = null;

    function getLocalTasks() {
        try {
            const raw = localStorage.getItem(LOCAL_STORAGE_TASKS_KEY);
            const parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (err) {
            console.error("No se pudieron leer tareas locales:", err);
            return [];
        }
    }

    function saveLocalTasks(tasks) {
        localStorage.setItem(LOCAL_STORAGE_TASKS_KEY, JSON.stringify(tasks));
    }

    function createLocalTask({ title, completed = false, priority = "media" }) {
        const tasks = getLocalTasks();
        const newTask = {
            id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            title,
            completed,
            priority,
        };
        tasks.push(newTask);
        saveLocalTasks(tasks);
        return newTask;
    }

    function updateLocalTask(taskId, changes) {
        const tasks = getLocalTasks();
        const index = tasks.findIndex((task) => String(task.id ?? task._id) === String(taskId));
        if (index === -1) return null;
        tasks[index] = { ...tasks[index], ...changes };
        saveLocalTasks(tasks);
        return tasks[index];
    }

    function deleteLocalTask(taskId) {
        const tasks = getLocalTasks();
        const nextTasks = tasks.filter((task) => String(task.id ?? task._id) !== String(taskId));
        saveLocalTasks(nextTasks);
    }

    async function requestWithFallback(path = "", options = {}, fallbackFn) {
        if (isApiAvailable !== false) {
            try {
                const res = await fetch(`${API_TASKS_URL}${path}`, options);
                const json = await res.json();
                if (!res.ok || !json.success) {
                    throw new Error(json.message || "Error en la API");
                }
                isApiAvailable = true;
                return json.data;
            } catch (err) {
                console.warn("API no disponible, usando localStorage:", err);
                isApiAvailable = false;
            }
        }
        return fallbackFn ? fallbackFn() : null;
    }

    async function cargarTareas() {
        try {
            const data = await requestWithFallback("", { method: "GET" }, () => getLocalTasks());
            (data || []).forEach((task) => {
                agregarTarea(task.title, task.completed, task.priority ?? "media", task._id ?? task.id);
            });
        } catch (err) {
            console.error(err);
        }
    }

    function actualizarContadores() {
        const p = tasksContainer.children.length;
        const c = completedContainer.children.length;
        if(document.getElementById('count-pending')) document.getElementById('count-pending').textContent = p;
        if(document.getElementById('count-completed')) document.getElementById('count-completed').textContent = c;
        if(document.getElementById('count-total')) document.getElementById('count-total').textContent = p + c;
    }

    // --- 5. EVENTOS GLOBALES ---
    if (taskForm) {
        taskForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const valor = taskInput.value.trim();
            if (!valor) return;
            try {
                const data = await requestWithFallback("", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ title: valor, completed: false, priority: taskPriority.value }),
                }, () => createLocalTask({ title: valor, completed: false, priority: taskPriority.value }));
                agregarTarea(data.title, data.completed, data.priority ?? taskPriority.value, data._id ?? data.id);
                taskInput.value = "";
            } catch (err) {
                console.error(err);
            }
        });
    }

    if (btnCompleteAll) {
        btnCompleteAll.addEventListener('click', () => {
            [...tasksContainer.children].forEach(tarea => {
                const check = tarea.querySelector('input[type="checkbox"]');
                if (check && !check.checked) {
                    check.checked = true;
                    check.dispatchEvent(new Event('change'));
                }
            });
        });
    }

    if (btnClear) {
        btnClear.addEventListener('click', async () => {
            if (!confirm("¿Limpiar historial?")) return;
            const items = [...completedContainer.children];
            for (const el of items) {
                const taskId = el.getAttribute('data-id');
                if (taskId) {
                    try {
                        await requestWithFallback(`/${taskId}`, {
                            method: 'DELETE',
                        }, () => {
                            deleteLocalTask(taskId);
                            return { success: true };
                        });
                    } catch (err) {
                        console.error(err);
                        continue;
                    }
                }
                el.remove();
            }
            actualizarContadores();
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const filtro = e.target.value.toLowerCase();
            document.querySelectorAll('#tasks-container > div, #completed-container > div').forEach(tarea => {
                const texto = tarea.querySelector('.text-task').textContent.toLowerCase();
                tarea.style.display = texto.includes(filtro) ? "flex" : "none";
            });
        });
    }

    // Filtros de navegación
    function activarFiltro(btnActivo, vistaMostrar) {
        [btnPending, btnCompleted, btnShowAll].forEach(btn => {
            btn?.classList.remove('font-bold', 'text-indigo-600', 'bg-indigo-50', 'dark:bg-indigo-900/30');
            btn?.classList.add('text-slate-500', 'dark:text-slate-400');
        });
        [viewPending, viewCompleted, viewAll].forEach(v => v?.classList.add('hidden'));

        btnActivo.classList.add('font-bold', 'text-indigo-600', 'bg-indigo-50', 'dark:bg-indigo-900/30');
        vistaMostrar.classList.remove('hidden');

        if (vistaMostrar === viewAll) {
            allContainer.innerHTML = '';
            [...tasksContainer.children, ...completedContainer.children].forEach(t => {
                const clon = t.cloneNode(true);
                clon.querySelector('.delete-btn')?.remove();
                clon.querySelector('.edit-btn')?.remove();
                const check = clon.querySelector('input');
                if (check) check.disabled = true;
                allContainer.appendChild(clon);
            });
        }
    }

    btnPending?.addEventListener('click', () => activarFiltro(btnPending, viewPending));
    btnCompleted?.addEventListener('click', () => activarFiltro(btnCompleted, viewCompleted));
    btnShowAll?.addEventListener('click', () => activarFiltro(btnShowAll, viewAll));

    // Ordenación
    if (sortFilter) {
        sortFilter.addEventListener('change', () => {
            const criterio = sortFilter.value;
            const ordenar = (contenedor) => {
                const tareas = [...contenedor.children];
                const prioMap = { alta: 3, media: 2, baja: 1 };
                tareas.sort((a, b) => {
                    if (criterio === 'prioridad') return prioMap[b.getAttribute('data-priority')] - prioMap[a.getAttribute('data-priority')];
                    if (criterio === 'alfabetico') return a.querySelector('.text-task').textContent.localeCompare(b.querySelector('.text-task').textContent);
                    return 0;
                });
                tareas.forEach(t => contenedor.appendChild(t));
            };
            ordenar(tasksContainer);
            ordenar(completedContainer);
        });
    }

    cargarTareas();
});