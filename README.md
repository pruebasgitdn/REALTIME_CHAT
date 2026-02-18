f# RealtimeChat
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
El proyecto utiliza Socket.io tanto en cliente como en servidor.

### Servidor
- Manejo de conexiones activas
- Mapa de usuarios conectados
- Rooms dinámicas para chats grupales
- Eventos personalizados:
  - `joinRoom`  agrega usuario a la sala.
  - `sendRoomMessage`  recibe mensaje y lo emite a la sala.
  - `newGroupMessage`  sincroniza mensajes de grupos.
  - Otros: `removedFromGroup`, `addedToGroup`, `groupDeleted`.
  - ...

### Cliente
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
