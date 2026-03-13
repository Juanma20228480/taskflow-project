// 1. PRIMERO: Configuración del Modo Oscuro (El código que tengo ya hecho, pero lo he puesto al final para que no interfiera con el resto del código)
document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtn = document.getElementById('theme-toggle');
    
    // Aplicar el tema guardado antes de que el usuario haga nada
    if (localStorage.getItem('theme') === 'dark') {
        document.documentElement.classList.add('dark');
    }

    if (themeToggleBtn) {
        console.log("Botón encontrado con éxito");
        themeToggleBtn.addEventListener('click', () => {
            document.documentElement.classList.toggle('dark');
            console.log("Clase dark cambiada");
            
            const isDark = document.documentElement.classList.contains('dark');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        });
    } else {
        console.error("Error: No se encontró el botón con ID 'theme-toggle'");
    }
});

// 2. DESPUÉS: Todo el task manager que sirve para añadir, eliminar, buscar tareas y guardar en LocalStorage (El código que tengo)


// 5. Función para cargar las tareas al iniciar (Punto 5)
function loadTasks() {
    // Saco el texto del cajón 'tasks'
    const savedTasks = localStorage.getItem('tasks');

    // Si el cajón no está vacío...
    if (savedTasks) {
        // Convierto el texto JSON de vuelta a un Array de JavaScript
        const tasksArray = JSON.parse(savedTasks);

        // Por cada tarea que encuentro, la dibujamos en la pantalla
        tasksArray.forEach(taskText => {
            addTask(taskText);
        });
    }
}

// ¡IMPORTANTE! Llamo a la función nada más cargar el script
loadTasks();


// 1. Seleccionamos los elementos del DOM. Utilizamos el DOM para hacer que el HTML se 
// comporte como un objeto, lo que nos permite manipularlo con JavaScript. 
// Para ello, utilizamos métodos como getElementById o querySelector para seleccionar
//  los elementos que queremos modificar o a los que queremos añadir eventos.
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const tasksContainer = document.getElementById('tasks-container');

function agregarTarea(texto) {
    const listaTareas = document.getElementById('tasks-container');
//  Creo el elemento nuevoDiv pero no lo uso, es solo para mostrar que puedo crear elementos con JavaScript.
    const nuevoDiv = document.createElement('div');
// 2. AQUÍ COLOCo LA LÍNEA (Justo después de crear el elemento y antes de añadirle el contenido)
    nuevoDiv.className = "flex justify-between items-center p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-all hover:shadow-md group";
// 3. Inserto el contenido (puedes adaptar esto a tu código)
    nuevoDiv.innerHTML = `
        <span class="text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 transition-colors">${texto}</span>
        <button class="text-slate-400 hover:text-red-500 transition-colors font-medium">Eliminar</button>
    `;
// 4. Lo añades a la lista
    listaTareas.appendChild(nuevoDiv);
}            

// 2. Escuchamos el evento "submit" del formulario
taskForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Evita que la página se recargue

    const taskText = taskInput.value; // Captura el texto
    
    if (taskText !== "") {
        addTask(taskText); // Llamamos a la función para añadir
        taskInput.value = ""; // Limpiamos el input
    }
});

// 3. Función para crear el HTML de la tarea (Punto 2)
function addTask(text) {
    const taskCard = document.createElement('div');
    taskCard.classList.add('task-card'); // Usamos la clase CSS que ya creé

    taskCard.innerHTML = `
        <span class="task-title">${text}</span>
        <button class="delete-btn">Eliminar</button>
    `;

    tasksContainer.appendChild(taskCard);
}

// 4. Escuchamos el evento "click" en el contenedor de tareas para eliminar tareas
// Modificamos la función addTask para que el botón funcione
function addTask(text) {
    const taskCard = document.createElement('div');
    taskCard.classList.add('task-card');

    taskCard.innerHTML = `
        <span class="task-title">${text}</span>
        <button class="delete-btn">Eliminar</button>
    `;

    // 3. Implementar el botón de eliminación (Punto 3)
    const deleteBtn = taskCard.querySelector('.delete-btn');
    
    deleteBtn.addEventListener('click', () => {
        // "remove" borra el nodo completo (la task-card) del DOM
        taskCard.remove();
        
        // Nota para el Punto 4: Aquí llamaremos a la función de guardar en LocalStorage
        console.log("Tarea eliminada correctamente");
    });

    tasksContainer.appendChild(taskCard);
}

// 4. Función para guardar las tareas en LocalStorage (Punto 4)
function saveTasks() {
    const tasks = [];
    // Buscamos todos los títulos de las tareas que hay en el DOM actualmente
    const allTaskTitles = document.querySelectorAll('.task-title');
    
    allTaskTitles.forEach(title => {
        tasks.push(title.innerText); // Metemos el texto en un array
    });

    // Guardamos el array convertido a String (JSON)
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Dentro del evento 'submit'
if (taskText !== "") {
    addTask(taskText);
    saveTasks(); // <--- Guardo las tareas cada vez que añado una nueva
    taskInput.value = "";
}

// Dentro de la función addTask, en el evento del botón borrar
deleteBtn.addEventListener('click', () => {
    taskCard.remove();
    saveTasks(); // <---Añado esto aquí también
});

// Selecciono el input de búsqueda
const searchInput = document.getElementById('search-input');

searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase(); // Lo que el usuario escribe en minúsculas
    const tasks = document.querySelectorAll('.task-card');

    tasks.forEach(task => {
        const title = task.querySelector('.task-title').innerText.toLowerCase();
        
        // Si el título incluye lo que buscamos, mostramos; si no, ocultamos
        if (title.includes(term)) {
            task.style.display = 'flex';
        } else {
            task.style.display = 'none';
        }
    });
});

// Seleccionamos el botón por su ID
const themeToggleBtn = document.getElementById('theme-toggle');

// Escuchamos el clic
themeToggleBtn.addEventListener('click', () => {
    // Alternamos la clase 'dark' en el elemento <html>
    document.documentElement.classList.toggle('dark');
    
    // Opcional: Guardar la preferencia en el navegador para que no se pierda al recargar
    if (document.documentElement.classList.contains('dark')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
});

// Al cargar la página, comprobar si el usuario ya tenía el modo oscuro activado
if (localStorage.getItem('theme') === 'dark') {
    document.documentElement.classList.add('dark');
}

