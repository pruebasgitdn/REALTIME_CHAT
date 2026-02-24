# RealtimeChat
Aplicación de mensajería en tiempo real desarrollada con arquitectura cliente-servidor.
Incluye autenticación basada en JWT almacenando en las cookies y comunicación bidireccional vía WebSockets.

- imgs
- [Ver Demo - Link YouTube](https://www.youtube.com/watch?v=UiC4Uom4cRw&t=9s)


## Demo
### Frontend: desplegado en Vercel
### Backend: desplegado en Render
### Base de datos: MongoDB Atlas
### WebSocket: Socket.io

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

Variables necesarias:
```
VITE_REACT_APP_BASE_DEV_URI=http://localhost:4000
VITE_REACT_APP_BACKEND_PROD_URI=https://realtime-chat-neon-xi.vercel.app
```

- **Credenciales de prueba**
    - **Usuario**: '....'
    - **Password**: '....'


## POSIBLES Mejoras Futuras 
- Eliminación de mensajes
- Indicador de "Escribiendo..."
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
1. Usuario inicia sesión. **POST** `/api/auth/login`
- En **LoginPage.tsx** se dispara el `dispatch(loginThunk(formData))` , que ejecuta el thunk de inicio de sesion que apunta a la ruta `/api/auth/login`

2. Se implementa la funcion de generar JWT desde el modelo, desde el esquema el cual vemos que lo firma.
- **users.model.js**
```
userSchema.methods.generateJWT = function () {
  //Firma el token con el _id
  return jwt.sign(
    {
      id: this._id,
      fullName: this.fullName,
      email: this.email,
      profilePic: this.profilePic,
      createdAt: this.createdAt,
    },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: process.env.JWT_EXPIRES,
    }
  );
};
```
Dicha funcion se invoca en la generacion del token, ejecutado en  el controlador del login una vez validado el inicio de sesion éxitoso.
```
export const generateToken = (user, message, statusCode, res) => {
  const token = user.generateJWT(); //del modelo
  const cookieName = "userToken";
  const cookieOptions = {
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  };
  res.status(statusCode).cookie(cookieName, token, cookieOptions).json({
    succes: true,
    message,
    user,
    token,
  });
};

```
3. El token se almacena en cookie segura.

4. El middleware verifyUserToken valida el token en cada petición.
```
export const verifyUserToken = (req, res, next) => {
  const token = req.cookies.userToken;

  if (!token) {
    return next(
      new ErrorResponse(
        "No se proporciona el token, autorización denegada.",
        401,
        null,
        false
      )
    );
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    console.log(error);
    return next(new ErrorResponse("Token inválido", 401, null, false));
  }
};
```
5. Si el token no se haya el token o es invalido, se limpian los estados globales (en el cliente):
- En **App.tsx** se valida la autenticacion mediante un UseEffect , el cual si falla en esa validacion se limpian los estados
```
setLogout()
cleanChatSlice()
cleanGroupSlice()
```
Esto nos asegura la consistencia o el enlance entre frontend y backend.

## Comunicación en Tiempo Real
### Flujo de Comunicación en Tiempo Real
1. La conexión inicia en el **LoginPage.jsx** con ` dispatch(connecSocketThunk())`, conecta el socket del cliente y servidor.
2. Que ejecuta la siguiente conexion pasando como query el id del usuario autenticado en ese momento (socket del cliente al backend)
```
   socket = io(REALBASE_URL, {
      query: {
        userId: userId,
      },
```
Pasando a estar ahora en la lista de usuarios online , cuando se hace una conexion como se acabo de hacer.
```
const userSocketMap = {};
io.on("connection", (socket) => {
const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  //servidor emitiendo a los clientes connectados
  io.emit("getOnlineUsers", Object.keys(userSocketMap));
}
```
Esto retorna el socket de los usuarios en linea (socket del backend al cliente).

3. Los mensajes son emitidos desde el controlador del backend una vez guardado el mensaje en la DB, lo que nos permite tener el almacenamiento de nuestras conversaciones e imagenes de la misma.
```
await newMessage.save();

//funcionalidad en tiempo real
const receiverSocketId = getReceiverSocketId(receiverId);
if (receiverSocketId) {
    io.to(receiverSocketId).emit("newMessage", newMessage);
}
```
Y en el cliente se esta suscrito a esa accion en especifico para que actualize el estado y envie las notificaciones pertinentes según sea el caso
```
export const subscribeSocketNewMessageEvent = (dispatch, selectedUser) => {

socket.on("newMessage", (message) => {
   dispatch(addMessage(message)); 
}}
```
Esto actualiza el estado global de mensajes de ese usuario que esta suscrito a dicho evento.

4. Con todo esto ya estamos en linea y podremos ejecutar acciones como:
- Enviar Mensajes privados
- Enviar Mensajes a Grupos
- Crear salas y unirse a las mismas, ser añadido o añadir
- Administrar salas
- ...

### Socket del Servidor
- Manejo de conexiones activas
- Mapa de usuarios conectados
- Rooms dinámicas para chats grupales
- Eventos personalizados:
  - `joinRoom`  agrega usuario a la sala.
  - `sendRoomMessage`  recibe mensaje y lo emite a la sala.
  - `newGroupMessage`  sincroniza mensajes de grupos.
  - Otros: `removedFromGroup`, `addedToGroup`, `groupDeleted`.
  - ...

### Socket del Cliente
- Conexión con el socket del servidor pasando userId como query 
- Suscripción a eventos después del login
- Despacho automático de acciones Redux al recibir eventos
- Sincronización inmediata del estado global
- A la escucha de lo que se emita y viceversa


## Estados globales
La aplicación utiliza **Redux Toolkit** para manejar los estados de usuario, mensajes y grupos:
- **themeSlice**: gestiona el cambio de tema (colores) de la aplicacion
- **authSlice**: maneja el estado del usuario
- **chatSlice**: encargado de gestionar el estado de mensajes global, salas y privado
- **groupSlice**: gestion de grupos o salas

### Flujo de actualización
- Todos los slices se combinan en un único **store** , accesible para toda la aplicación a traves de `useSelector` y `useDispatch`.
- Los **slices** se actualizan mediante **acciones y dispatch**.  
  - **Ejemplo**, cuando el servidor envía un nuevo mensaje vía Socket.io, el cliente despacha `addMessage` en `chatSlice` para actualizar el estado global.

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
