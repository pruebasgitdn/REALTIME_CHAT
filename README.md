# RealtimeChat
Aplicación de mensajería en tiempo real desarrollada con arquitectura cliente-servidor.
Incluye autenticación basada en JWT almacenando en las cookies y comunicación bidireccional vía WebSockets.

- ( y un par de imagenes (?))

## Demo
- Frontend: desplegado en Vercel
- Backend: desplegado en Render
- Base de datos: MongoDB Atlas
(link , video demo)

## Características principales
- Registro e inicio de sesión con JWT en cookies HTTPOnly
- Persistencia de sesión e información del usuario
- Persistencia de mensajes en la BD
- Protección de rutas mediante middleware
- Chat privado 1 a 1 en tiempo real
- Chat grupal con creación de salas
- Gestión de miembros en grupos
- Usuarios conectados en tiempo real
- Subida de imágenes con Cloudinary
- Notificaciones


## Instalación Local
- **Backend**

```
cd server
npm install
npm run dev
```

Variables necesarias:
```
JWT_SECRET_KEY
MONGO_URI
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
CLOUDINARY_CLOUD_NAME
JWT_EXPIRES
COOKIE_EXPIRE
CLIENT_DEV_URI
CLIENT_PROD_URI
```

- **Frontend**

```
cd client
npm install
npm run dev
```



## POSIBLES Mejoras Futuras 
- Eliminación de mensajes
- Indicador de "typing..."
- Encriptación de mensajes
- Soporte para mensajes de voz 
- Arquitectura 

## Arquitectura
### Frontend

- React 19 + Vite
- Redux Toolkit
- React Router
- Socket.io-client
- TailwindCSS + DaisyUI
- Axios

### Backend
- Node.js + Express
- Socket.io
- MongoDB + Mongoose
- JWT
- Express Validator
- Express FileUpload
- Cloudinary

### Infraestructura
- Vercel (Frontend)
- Render (Backend)
- MongoDB Atlas (Base de datos)

## Autenticación y Seguridad
**El sistema utiliza JWT almacenado en cookies con las siguientes características**:
- httpOnly secure
- sameSite: none
- expiración de 7 días
### Flujo:
1. Usuario inicia sesión.
2. Se genera JWT desde el modelo.
3. El token se almacena en cookie segura.

4. El middleware verifyUserToken valida el token en cada petición.
Si el token no se haya el token o es invalido, se limpian los estados globales:

```
setLogout()
cleanChatSlice()
cleanGroupSlice()
```

Esto nos asegura la consistencia o el enlance entre frontend y backend.

## Comunicación en Tiempo Real
El proyecto utiliza Socket.io tanto en cliente como en servidor.

### Servidor
- Manejo de conexiones activas
- Mapa de usuarios conectados
- Rooms dinámicas para chats grupales
- Eventos personalizados:
- joinRoom
- sendRoomMessage
- newGroupMessage
- removedFromGroup
- addedToGroup
- notifyChangeGroupNameEdited,
- memberLeft
- groupDeleted
ETC..

### Cliente
- Conexión con el socket del servidor pasando userId como query 
- Suscripción a eventos después del login
- Despacho automático de acciones Redux al recibir eventos
- Sincronización inmediata del estado global
- A la escucha de lo que se emita y viceversa

## Decisiones Técnicas Importantes
- Uso de cookies HTTPOnly en lugar de localStorage para guardar la identificacion del usuario
- Separación de lógica de sockets del servidor HTTP.
- Manejo de entornos (development vs production) para resolver problemas de CORS y cookies.
- Persistencia de sesión y sus informacion asociada al cargar la aplicación.

## Retos Técnicos Enfrentados
1. **Cookies en Producción**
En desarrollo funcionaban correctamente, pero en producción fue necesario:
  - Configurar secure: true
  - Usar sameSite: none
  - Ajustar variables de entorno en Vercel y Render
  - Manejar detección automática de entorno
2. **Persistencia al hacer F5**
  - Se implementó verificación automática de sesión al montar la aplicación (App.jsx) atraves de un thunk que consulta el usuario basado en el token almacenado.
3. **Sincronización Redux + Socket**
  - Se planteo y se diseño una suscripción a los eventos después del login para garantizar que el estado global sea consistente en tiempo real y cumpla con la sincronizacion de escuchar los eventos a los que se suscribio previamente.
