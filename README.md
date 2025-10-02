Biko sistema de renta de bicicletas en Puebla.
Generacion de Sprint 1 para primera semana

 Objetivo del Sprint
Implementar el flujo de registro de usuarios en la aplicación del parque, 
permitiendo a los visitantes crear una cuenta con validaciones de seguridad, almacenamiento seguro en base de datos y confirmación por correo electrónico.

Tareas del Sprint
Formulario de registro (FrontEnd)
Crear interfaz con campos: nombre, correo electrónico, contraseña y teléfono.
Responsable: WMR | Estimado: 2 horas
Validaciones en el formulario (FrontEnd)
Validar campos obligatorios y formato de correo.
Responsable: WMR | Estimado: 1.5 horas
Validación de contraseña segura (FrontEnd)
Requisitos: mínimo 8 caracteres, al menos una mayúscula y un número.
Responsable: WMR | Estimado: 1.5 horas
Almacenamiento seguro del usuario (BackEnd)
Guardar los datos del usuario en la base de datos con cifrado adecuado (especialmente la contraseña).
Responsable: NARC | Estimado: 3 horas
Envío de correo de confirmación (BackEnd)
Enviar un correo automático al usuario tras el registro para verificar su dirección.
Responsable: NARC | Estimado: 2 horas
Pruebas del flujo completo (QA)
Verificar que todo el proceso de registro funcione correctamente y sin errores críticos.
Responsable: MAAR | Estimado: 2 horas

Equipo y Esfuerzo Total
FrontEnd (WMR): 5 horas
BackEnd (NARC): 5 horas
QA (MAAR): 2 horas
Total estimado del sprint: 12 horas

Fechas Clave
Inicio: 10 de septiembre de 2025
Fin: 19 de septiembre de 2025
Sprint Review: 19/09/25
Retrospectiva: 19/09/25

Criterios de Aceptación (Definition of Done)
El formulario de registro está funcional y accesible.
Todos los campos tienen validaciones front-end y back-end.
La contraseña cumple con políticas de seguridad.
Los datos del usuario se almacenan cifrados.
Se envía un correo de confirmación tras el registro.
El flujo ha sido probado por QA sin bugs críticos.
El código ha pasado revisión por pares.
La documentación técnica relevante ha sido actualizada.

Riesgos Identificados
Posibles retrasos en la integración FrontEnd ↔ BackEnd si los endpoints no están bien definidos.
Dependencia del servicio de envío de correos (puede fallar en entornos de prueba).
QA podría no tener acceso al entorno de pruebas hasta mitad del sprint.

El estado de las tareas debe actualizarse diariamente en el tablero del equipo.
