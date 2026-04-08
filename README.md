# My Book Journal

## Descripción del proyecto

**My Book Journal** es una aplicación móvil diseñada para que los usuarios puedan registrar y organizar los libros que leen de una forma visual e inmersiva, dentro de una acogedora habitación virtual.

La aplicación permite guardar información detallada sobre cada libro, como:

- Portada del libro
- Título, autor y género
- Formato de lectura (físico, digital o audiolibro)
- Calificación con estrellas
- Fechas de inicio y finalización de lectura
- Sinopsis
- Personajes principales, favoritos y más odiados
- Nivel de *spicy* y lágrimas derramadas
- Escenas favoritas, frases favoritas y canción asociada

El objetivo es ofrecer una experiencia visual tipo **diario de lectura**, donde el usuario pueda recordar y registrar su experiencia con cada libro leído, todo dentro de un ambiente de habitación acogedora que cambia según las condiciones de luz del entorno.

---

## Tecnologías utilizadas

- **React Native** – Framework para desarrollo de aplicaciones móviles.
- **Expo** – Plataforma que facilita el desarrollo y ejecución de apps React Native.
- **TypeScript** – Superset de JavaScript para mejorar la tipificación del código.
- **Expo Router** – Sistema de navegación basado en rutas de archivo.
- **SQLite (expo-sqlite)** – Base de datos local para almacenar libros y usuarios.
- **AsyncStorage** – Almacenamiento clave-valor para sesión y preferencias del usuario.
- **expo-sensors** – Acceso al sensor de luz y acelerómetro del dispositivo.
- **expo-file-system** – Lectura y escritura de archivos para respaldo y exportación.
- **expo-sharing** – Compartir archivos generados (PDF, CSV) desde la app.
- **expo-print** – Generación de archivos PDF desde HTML.
- **expo-image-picker** – Selección de imágenes para portadas y foto de perfil.
- **React Hooks** – Manejo del estado y ciclo de vida de los componentes.

---

## Funcionalidades implementadas

- Registro e inicio de sesión de usuario con base de datos local
- Sesión persistente: la app recuerda al usuario aunque se cierre
- Cierre de sesión desde el perfil
- Eliminación de cuenta con borrado completo de datos
- Edición de perfil (nombre, biografía e imagen)
- Visualización de libros en un librero dentro de una habitación virtual
- Creación, edición y eliminación de libros
- Portadas personalizadas por libro (imagen de la galería)
- Paginación del librero (15 libros por página)
- Cambio de ambiente visual (día / tarde / noche) según el sensor de luz del dispositivo
- Imagen de ventana dinámica según el ambiente (día, tarde, noche)
- Efectos de iluminación superpuestos según el ambiente
- Activación y desactivación del sensor de luz desde ajustes
- Animación de libros al agitar el teléfono (caída caótica y regreso al orden)
- Exportación de biblioteca en formato PDF y CSV
- Respaldo automático en formato JSON al activarlo desde ajustes
- Estadísticas de lectura (total de libros, promedio de calificación, género favorito, libros terminados este mes)
- Pantalla de ajustes con: sensor de luz, respaldo, exportación, versión, soporte, políticas de privacidad, créditos y eliminación de cuenta

---

## Instrucciones para ejecutar la aplicación

### 1. Clonar el repositorio
```bash
git clone https://github.com/USUARIO/NOMBRE_DEL_REPOSITORIO.git
```

### 2. Entrar a la carpeta del proyecto
```bash
cd NOMBRE_DEL_REPOSITORIO
```

### 3. Instalar dependencias
```bash
npm install
```

### 4. Instalar dependencias de Expo
```bash
npx expo install expo-sqlite expo-sensors expo-file-system expo-sharing expo-print expo-image-picker @react-native-async-storage/async-storage @react-navigation/native
```

### 5. Ejecutar la aplicación
```bash
npx expo start
```

Esto abrirá el panel de Expo, donde podrás ejecutar la aplicación en:

- Un emulador de Android
- Un simulador de iOS
- Un dispositivo físico usando la app **Expo Go**

> **Nota:** El sensor de luz y el acelerómetro requieren un dispositivo físico. No funcionan en emuladores.

---

## Estructura del proyecto

## Autor

Proyecto desarrollado por **Rodrigo García**.