// 1. Seleccionamos los elementos del DOM. Utilizamos el DOM para hacer que el HTML se 
// comporte como un objeto, lo que nos permite manipularlo con JavaScript. 
// Para ello, utilizamos métodos como getElementById o querySelector para seleccionar
//  los elementos que queremos modificar o a los que queremos añadir eventos.
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const tasksContainer = document.getElementById('tasks-container');

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
    taskCard.classList.add('task-card'); // Usamos la clase CSS que ya creaste

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