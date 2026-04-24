let tasks = [];
let nextId = 1;

const buildError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const validateTitle = (title) => {
  if (!title || typeof title !== "string" || !title.trim()) {
    throw buildError("El campo 'title' es obligatorio.", 400);
  }
};

export const getTasks = (req, res) => {
  res.status(200).json({
    success: true,
    data: tasks,
  });
};

export const getTaskById = (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const task = tasks.find((item) => item.id === id);

    if (!task) {
      throw buildError("Tarea no encontrada.", 404);
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

export const createTask = (req, res, next) => {
  try {
    const { title, completed = false } = req.body;
    validateTitle(title);

    if (typeof completed !== "boolean") {
      throw buildError("El campo 'completed' debe ser booleano.", 400);
    }

    const newTask = {
      id: nextId++,
      title: title.trim(),
      completed,
    };

    tasks.push(newTask);

    res.status(201).json({
      success: true,
      data: newTask,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTask = (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const taskIndex = tasks.findIndex((item) => item.id === id);

    if (taskIndex === -1) {
      throw buildError("Tarea no encontrada.", 404);
    }

    const { title, completed } = req.body;

    if (title !== undefined) {
      validateTitle(title);
      tasks[taskIndex].title = title.trim();
    }

    if (completed !== undefined) {
      if (typeof completed !== "boolean") {
        throw buildError("El campo 'completed' debe ser booleano.", 400);
      }
      tasks[taskIndex].completed = completed;
    }

    res.status(200).json({
      success: true,
      data: tasks[taskIndex],
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const taskIndex = tasks.findIndex((item) => item.id === id);

    if (taskIndex === -1) {
      throw buildError("Tarea no encontrada.", 404);
    }

    tasks.splice(taskIndex, 1);

    res.status(200).json({
      success: true,
      message: "Tarea eliminada correctamente.",
    });
  } catch (error) {
    next(error);
  }
};
