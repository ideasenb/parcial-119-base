# Línea 119 · Bomberos Cali

Prototipo web de un canal digital para reportar emergencias a la línea 119 de Bomberos Cali. Tiene tres pantallas: una landing, el reporte del ciudadano y el tablero del radio operador con un mapa real de Cali.

**Sitio desplegado:** https://parcial-119-base-five.vercel.app/

## Integrantes

Carlos Fernando Cortés - 30000129546
Antonia Rúa - 30000133780

## Cómo correrlo

```bash
npm install
npm run dev
```

Abre `http://localhost:5173/`. Para probar el flujo completo, entra a `/reportar`, envía un reporte y después ve a `/operador` con el enlace «Acceso radio operador» que está al final de la landing. Todo ocurre en la misma pestaña porque el estado se guarda en `localStorage`. No hay backend.


Estados de un reporte: Recibido, Validado, Unidad despachada y Cerrado (o Descartado).



## Respuestas a las 5 preguntas de Bomberos

### 1. ¿Puede llegarle al radio operador un mapa con la ubicación exacta a partir de las coordenadas del ciudadano?

**Qué hicimos:** el operador ve un mapa real de Cali con un pin de color por reporte. La ubicación sale de las coordenadas del barrio que elige el ciudadano, con un pequeño desplazamiento para que dos reportes del mismo barrio no queden uno encima del otro. Desde el detalle puede abrir el punto en Google Maps.

**Qué faltaría para producción:** hoy la ubicación es aproximada. Habría que tomar la posición real del celular con la API de geolocalización, o dejar que la persona marque el punto en un mini mapa, y guardar esas coordenadas exactas.

### 2. ¿Puede el ciudadano recibir una respuesta automática para saber que su reporte fue recibido?

**Qué hicimos:** al enviar el reporte aparece una pantalla con el número de radicado, la hora y el estado. Cuando el operador valida, despacha o cierra el caso, esa pantalla cambia sola porque lee el mismo estado global.

**Qué faltaría para producción:** avisar fuera de la página, por SMS, WhatsApp o notificación, y que el estado viva en un servidor y no en el navegador de cada persona.

### 3. ¿Qué pasa si hay una emergencia de gran magnitud y llegan reportes masivos?

**Qué hicimos:** la lista y el mapa muestran todos los reportes, la leyenda cuenta cuántos hay por grupo y los pines nuevos pulsan para que se distingan de los ya atendidos. No hicimos filtros ni agrupación de reportes cercanos.

**Qué faltaría para producción:** filtros por grupo y estado, agrupar pines cercanos, detectar reportes duplicados, ordenar por prioridad y un backend que aguante muchas solicitudes a la vez.

### 4. ¿Puede el radio operador, si lo decide, hacer una videollamada al ciudadano?

**Qué hicimos:** no la implementamos, porque estaba fuera del alcance del parcial. Como contacto inmediato, el detalle del reporte tiene el botón «Llamar» con un enlace `tel:` al teléfono del ciudadano.

**Qué faltaría para producción:** un servicio de videollamada (por ejemplo WebRTC con un servidor de señalización), que el operador genere el enlace, pedir el consentimiento de la persona y revisar el consumo de datos móviles.

### 5. ¿Se pueden enviar varias fotos o videos, con recomendaciones de cómo tomarlos?

**Qué hicimos:** el formulario permite hasta 3 fotos con miniaturas y un botón para quitarlas, y el operador las ve en el detalle del reporte. Incluimos una nota que recuerda tomar una foto o video claro del lugar.

**Qué faltaría para producción:** subir los archivos a un servidor de almacenamiento, comprimir las imágenes, aceptar videos con un límite de peso y mostrar recomendaciones claras antes de grabar (mantener distancia segura, grabar en horizontal, mostrar el entorno).

## Pregunta de diseño: ¿qué preguntas del protocolo se pueden omitir si el reporte trae foto o video?

1. **«¿Qué ve?»:** una foto o un video muestra qué está pasando, por ejemplo si hay llamas, humo o un accidente con heridos. El operador puede clasificar el grupo mirando la imagen, sin pedir una descripción larga.
2. **Punto de referencia y nombre del edificio:** una foto de la fachada o del entorno, junto con las coordenadas en el mapa, ubica el sitio sin tener que preguntar por referencias.

