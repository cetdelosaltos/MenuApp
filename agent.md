Quiero una app en android pero posiblemente ios y iPad para los miembros de la casa. En esta app se planificará la comida semanal y las compras necesarias para eso. Debe tener vista de toda la semana. Solo se planifican el Desayuno, Almuerzo con dos campos (Proteína y Contornos) y la Cena. No son obligatorios. La comida se planifica actualmente en un excel con columnas para cada día de la semana como aparece en la captura de pantalla.

La vista inicial debe ser la de la semana en curso y debe permitir imprimir en una vista que quepa en una sola hoja carta. con una tabla que tenga como título la fecha del domingo.

Para cada proteína o contorno de la semana, al hacerle click, se debe desplegar una lista de proteínas o contornos disponibles de otras semanas, con la posibilidad de agregar una nueva. Si se agrega una nueva, se pueden agregar ingredientes, a escoger entre los que ya existen en la base de datos o agregar nuevo. Si se agrega una proteína o contorno viejos, algunos pueden repetirse semana tras semana, sería ideal que desplegara automáticamente todos los ingredientes ya guardados en la base de datos y que permitiera agregar nuevas o eliminar viejos. La eliminación de un ingrediente puede ser: Parcial: Se desasocia de esta proteína o contorno pero queda disponible para selección en otras recetas. Definitiva: Se elimina por completo de toda la base de datos.
Cada proteína o contorno puede tener un link a alguna web o red social con la receta.
Cada ingrediente debe tener categorías, por ej: Charcutería, Carnicería, Verduras y Vegetales, Mercado Seco, Pescadería, Perfumería, Farmacia, etc. debe ser configurable pero puede incluir algunas predeterminadas como la lista que proporcioné actualmente.

Vistas:
La lista de compras
El Menú semanal
Historial de Semanas de Menús
Lista de ingredientes.

La Lista de compras
Debe ser checkbox y tener los items con cada ingrediente de los platos del menú de la semana. Debe permitir hacer hacer click en los items que a lo mejor ya están en casa y no necesitan comprarse esta semana y no tienen que aparecer en la lista de compra actual pueden ser dos botones: Hay en Casa y Comprado.
Si se hace click en Comprado, registra la fecha del click como fecha de compra. Para hacer seguimiento de la última vez que se compró. si hay compra previa, en la lista de items de compra debe aparecer la fecha de la última compra.
Si se hace click en Hay en Casa, solo se borra de la lista de compras actual. No se elimina definitivamente de la base de datos de ingredientes.
Para cada item, aparte de los botones, hace falta un campo de Cantidad. Ese campo es de edición rápida es decir: Hago click, se activa la edición y aparecen los botones Ok y Cancel (Con íconos). Deben ser dos campos, uno numérico y uno de texto (Ej: 1 Kilo, 2 paq). Admiten valor Vacío.

Debe permitir agregar items que no estén relacionados con el menú semanal y que deben también poder ser asociados a las categorías.

## Plataformas:

Android, possibly iOS and iPad, Web, Desktop.

## Tecnologías:

Angular 21+ for Web, Electron for Desktop, Capacitor para angular para Android, iOS, and iPad.

## Base de Datos:

La base de datos debe estar en la nube, preferiblemente en mi VPS con CWP7 con servidor mysql y php 8.3. Pero quisiera sugerencias de cuales serían los mejores approachs. Cual sería la solución ideal usando el VPS para manejar el backend. Adicionalmente, debe permitir el funcionamiento sin conexión a internet. Si hay conexión a internet se actualizan todas las listas en tiempo real. Si no hay conexión a internet, se puede seguir usando la app pero no se actualizan las listas ni se pueden compartir con otros usuarios. Cuando hay conexión a internet, se actualizan todas las listas en tiempo real.

## Arquitectura:

Client-Server architecture with a focus on offline-first capabilities using Angular's service workers for PWA and Capacitor for native apps.

## Interfaz de Usuario:

Responsive web design for all screen sizes (Mobile, Tablet, Desktop) and native UI for Android, iOS, and iPad. La interfaz debe ser en español de Venezuela.

Desayuno y Cena se manejan como un solo campo de plato. Los almuerzos tienen dos campos, uno para la Proteína y otro para los Contornos. Solo se planifican para el almuerzo, los contornos. Adicionalmente, debe permitir hacer click en los platos para editar ingredientes, cantidades etc.

La semana comienza en Domingo.

LA autenticación dene ser con un único acceso/código de hogar compartido para todos los dispositivos de la casa.
