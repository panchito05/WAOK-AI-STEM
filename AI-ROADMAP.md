# 🗺️ AI-ROADMAP - Hoja de Ruta de Desarrollo

en los laberintos quiero hacer clic una sola vez con el mouse y que se quede selecionando eso evitar tener que mantener puldo el clic dunranto to el juego


Prompt para Módulo de Laberintos Educativos

  Basándome en el éxito del módulo Sudoku puede usarlo como referencia analizar su codigo primero para que ejecutes correctamente el siguente prompt ultra think de solution and planificacion tedes considerar que se usara en computadoras con mouse, pero tambien en table y smarphone toush eso es importante para la usabilidad en esos dispositivos por los tanto debe poder adatarse a esas pantallas atutomaticamente pero tanbien funcionar con el touch y todo lo que involucra usar esos dispositivos recuerda usar los subagentes que sean necesario para completar esta tarea:

  ---
  Quiero crear un módulo de "Laberinto Clásico" completamente aislado del         
  sistema de IA, siguiendo exactamente la misma arquitectura que el módulo        
  Sudoku. Este módulo debe:

  Características del Juego:

  1. TAMAÑOS DE LABERINTO:
  - Pequeño (10x10): Para principiantes y práctica rápida
  - Mediano (15x15): Desafío estándar
  - Grande (20x20): Para jugadores experimentados

  2. NIVELES DE DIFICULTAD:
  - Fácil:
    - Pocas paredes y caminos amplios
    - Pocos callejones sin salida
    - Vista completa del laberinto
  - Intermedio:
    - Más paredes y bifurcaciones
    - Varios callejones sin salida
    - Vista completa pero sin rastro automático
  - Difícil:
    - Laberinto complejo con muchos callejones
    - Vista limitada (solo 5x5 celdas alrededor del jugador)
    - Sin indicadores de dirección

  3. MECÁNICAS DE JUEGO:
  - Controles:
    - Flechas del teclado para movimiento
    - Botones direccionales en pantalla (arriba, abajo, izquierda, derecha)       
    - Click/tap en celdas adyacentes para moverse
  - Características:
    - Jugador representado con un círculo azul
    - Meta representada con una estrella dorada
    - Rastro opcional que marca las celdas visitadas
    - Contador de movimientos en tiempo real
    - Cronómetro desde el inicio

  4. FUNCIONALIDADES:
  - Pistas (3 disponibles por partida):
    - Ilumina brevemente el camino más corto a la meta
    - Cada uso suma 10 segundos de penalización al tiempo
  - Ver Solución:
    - Muestra el camino completo a la meta
    - Desactiva el guardado de estadísticas para esa partida
  - Reiniciar:
    - Vuelve al punto de inicio manteniendo el mismo laberinto
    - Reinicia contador de movimientos y tiempo
  - Nuevo Laberinto:
    - Genera un laberinto completamente nuevo

  5. SISTEMA DE PUNTUACIÓN:
  - Basado en:
    - Tiempo de resolución (menor tiempo = más puntos)
    - Eficiencia de movimientos (menos movimientos = más puntos)
    - Pistas usadas (menos pistas = más puntos)
  - Récords personales por tamaño y dificultad

  6. INTERFAZ:
  - Vista principal del laberinto con grid claro
  - Panel superior con:
    - Tiempo: ⏱️ 00:00
    - Movimientos: 👣 0
    - Pistas restantes: 💡 3
  - Botones de acción:
    - Reiniciar
    - Nueva Partida
    - Usar Pista
    - Ver Solución
    - Pausar

  7. PERSISTENCIA:
  - Guardado automático del laberinto actual
  - Estadísticas por perfil:
    - Laberintos completados
    - Mejor tiempo por configuración
    - Menos movimientos por configuración
    - Racha de victorias sin pistas

  REQUISITOS TÉCNICOS:
  - Algoritmo de generación: Recursive Backtracking o similar
  - Garantizar siempre solución única
  - Algoritmo de pathfinding (A* o BFS) para pistas y solución
  - Animaciones suaves al moverse
  - Efecto de celebración al llegar a la meta

  INTEGRACIÓN:
  - Debe aparecer como tarjeta tipo 'module' junto al Sudoku
  - Nombre: "Laberinto Clásico"
  - Descripción: "Encuentra la salida en el menor tiempo posible"
  - Icono: Maze o Route
  - Estructura de archivos:
    - /lib/maze/types.ts
    - /lib/maze/generator.ts
    - /lib/maze/storage.ts
    - /components/maze/MazeBoard.tsx
    - /components/maze/MazeControls.tsx
    - /components/maze/MazeScreen.tsx

  IMPORTANTE:
  - NO usar inteligencia artificial
  - Seguir exactamente los mismos patrones del módulo Sudoku
  - Mantener la estética visual consistente con el resto de la aplicación
  - Todo el código debe ser determinista y basado en algoritmos clásicos

  ---
  Este prompt se enfoca únicamente en el laberinto clásico, simplificando la      
  implementación mientras mantiene elementos de gamificación y progresión que     
   lo hacen interesante para los niños