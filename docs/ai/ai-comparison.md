# Comparativa de Modelos de IA
Este documento registra el análisis comparativo entre diferentes LLMs (Large Language Models) utilizados durante el desarrollo de TaskFlow.

**Objetivo:** Identificar las fortalezas y debilidades de cada modelo (Claude, ChatGPT, Gemini, etc.) en tareas específicas como la depuración de lógica, el diseño de interfaces con Tailwind y la generación de documentación.

**Comparación Claude vs ChatGPT** Queremos analizar el resultado que nos proporciona las distintas consultas que podemos hacer a IA como son Cluade y ChatGPT.
1º Preguntamos por Closures (JavaScript): 
    - Claude es más preciso y conciso a la hora de explicarlo con varios modos de dificultad desde un principio, mientras que ChatGPT es más escueto aunque se puede entender la explicación y aplicarla perfectamente. Curiosamente a la hora de hacer algún ejemplo, los dos asistentes ponen el mismo ejemplo básico de contadores
    function crearContador() {
  let cuenta = 0;

  return function () {
    cuenta++;
    console.log(cuenta);
  };
}

const contador = crearContador();
contador(); // 1
contador(); // 2
contador(); // 3

**2º Comparamos la explicación de event loop Claude vs ChatGPT** El resultado de GPT es más escueto y preciso y aunque se entienda bien, Claude es más preciso y la explicación es más profunda y detallada sin caer en dificultades. Por ejemplo, en Claude nos muestra un carrusel donde explica el proceso del Event loop paso a paso:
Call Stack
⇄
Web APIs Navegador
—
Cola de tareas
—
⇄
Event Loop
En espera...

En GPT: console.log("A");

setTimeout(() => console.log("B"), 0);

console.log("C");

**3º Explicación del DOM** Se vuelve a mostrar mucho más preciso, esquemático y claro Claude que GPT, dando una explicación más detallada y haciendo uso de esquemas para explicar el árbol DOM:
document
    html
        head
            body
                h1
                \"Hola mundo\"
            p
            button#btn
Leyenda:
            document
                    elemento HTML
                                texto
                                    con id/clase

**Le damos 3 bloque de código con errores y comparamos las dos soluciones** // BUG 1: El Closure Roto (Error de lógica y ámbito)
function crearContadores() {
    var funciones = [];
    for (var i = 0; i < 3; i++) {
        funciones.push(function() {
            return i; 
        });
    }
    return funciones;
}
// Expectativa: funciones[0]() debería dar 0, pero dará 3.

// BUG 2: El Event Loop Infinito (Error de ejecución)
function procesarDatos(datos) {
    console.log("Iniciando proceso...");
    setTimeout(() => {
        console.log("Datos procesados:", datos);
    }, 0);
    while(true) {
        // Un bucle pesado que bloquea el hilo principal
        if (Date.now() > 10000000000000) break; 
    }
}
// Expectativa: El setTimeout nunca se ejecutará si el hilo está bloqueado.

// BUG 3: El DOM inexistente (Error de contexto/referencia)
function actualizarTitulo(nuevoTexto) {
    const titulo = document.querySelector('#header-title');
    titulo.innerText = nuevoTexto;
}
// Expectativa: Si se llama antes de que el DOM cargue o el ID no existe, lanzará un TypeError.

GPT nos propone: 
function crearContadores() {
    const funciones = [];
    for (let i = 0; i < 3; i++) {
        funciones.push(function() {
            return i;
        });
    }
    return funciones;
}
Claude nos propone:
// ✅ Solución 1: usar let (scope de bloque)
function crearContadores() {
    const funciones = [];
    for (let i = 0; i < 3; i++) {   // let crea un nuevo i por iteración
        funciones.push(function() {
            return i;
        });
    }
    return funciones;
}

// ✅ Solución 2: IIFE para forzar un scope nuevo (patrón clásico pre-ES6)
function crearContadores() {
    const funciones = [];
    for (var i = 0; i < 3; i++) {
        funciones.push((function(j) {  // j es un parámetro nuevo en cada llamada
            return function() { return j; };
        })(i));
    }
    return funciones;
}


