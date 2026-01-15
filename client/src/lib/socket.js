import { io } from "socket.io-client";
import { addMessage, addUser } from "../store/chatSlice.js";
import {
  addedtoGroup,
  addGroupMessage,
  removedFromGroup,
  removeExitGroup,
  updateMembers,
} from "../store/groupSlice.js";
import { toast } from "sonner";
import { API_BASE_URL } from "../../env.js";

const REALBASE_URL = API_BASE_URL;

console.log("URL del Socket:", REALBASE_URL); // Debug

let socket = null;

// CONEXION
export const connectSocket = (userId) => {
  console.log(userId);
  if (!socket) {
    socket = io(REALBASE_URL, {
      query: {
        userId: userId,
      },
    });

    console.log(socket);
  }

  return socket;
};

// OBTNER SOCKET CONECTADO
export const getSocket = () => {
  return socket;
};

// EVENTO ESCUHCAR MENSAGES 1 A 1
export const subscribeSocketNewMessageEvent = (dispatch, selectedUser) => {
  if (!socket) {
    console.log("No socket");
    return;
  }

  socket.off("newMessage");

  socket.on("newMessage", (message) => {
    console.log(
      "Enviado por: " +
        message.senderId +
        "---" +
        "User seleccionado: " +
        selectedUser._id +
        selectedUser.fullName
    );

    //Solo renderizar los del user seleccionado ahi mismo
    if (String(message.senderId) !== String(selectedUser._id)) {
      return;
    }
    console.log(message);
    dispatch(addMessage(message));
  });
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// EVENTO ESCUCHAR MENSAJES DE GRUPO
export const subscribeSocketNewGroupMessageEvent = (
  dispatch,
  selectedGroup
) => {
  if (!socket) {
    console.log("No socket");
    return;
  }

  socket.off("newGroupMessage");

  socket.on("newGroupMessage", (message) => {
    if (String(message.groupId) !== String(selectedGroup._id)) {
      return;
    }

    dispatch(addGroupMessage(message));
  });
};

// UNIRSE AL GRUPO
export const joinRoom = (roomId) => {
  if (!socket) {
    console.log("No socket");
    return;
  }

  socket.emit("joinRoom", roomId);
};

// DEJAR EL GRUPO VOLUNTARIA MENTE
export const leaveRoom = (groupId, userId, name) => {
  if (!socket) {
    console.log("No socket");
    return;
  }
  getSocket().emit("leaveRoom", groupId, userId, name);
};

// ESCUCHAR EVENTO CUANDO UN MIEMBRO ABANDONA del grupo (VOLUNTARIAMENTE)
export const subscribeSocketMemberLeftEvent = (dispatch, id) => {
  if (!socket) {
    console.log("No socket");
    return;
  }

  socket.off("memberLeft");

  socket.on("memberLeft", ({ room_id, user_id, name }) => {
    if (String(id) !== String(room_id)) return;

    console.log("Miembro:", user_id, "salio del grupo:", room_id);
    //  ${groupName}
    toast(`El miembro ${name} ha abandonado el grupo `, {
      style: {
        background: "blue",
        color: "white",
      },
    });

    dispatch(
      updateMembers({
        user_id: user_id,
        room_id: room_id,
      })
    );
  });
};

// ESCUCHAR ESVENTO UN USER SE AÑADE AL GRUPO
export const subscribeSocketMemberAddedToGroupEvent = (dispatch) => {
  if (!socket) {
    console.log("No socket");
    return;
  }

  socket.off("addedToGroup");

  socket.on("addedToGroup", (group) => {
    console.log(group);
    dispatch(addedtoGroup(group));
    toast(`Has sido agredado al grupo: ${group?.groupName}`, {
      style: {
        background: "blue",
        color: "white",
      },
    });
  });
};

// ESCUCHAR EVENTO UN USER SE REMUEVE DEL GRUPO
export const subscribeSocketMemberRemovedFromGroupEvent = (dispatch) => {
  if (!socket) {
    console.log("No socket");
    return;
  }

  socket.off("removedFromGroup");

  socket.on("removedFromGroup", (group) => {
    console.log(group);
    dispatch(removedFromGroup(group));
    toast(`Has sido eliminado del grupo: ${group?.groupName}`, {
      style: {
        background: "blue",
        color: "white",
      },
    });
  });
};

// cuando se añade pero NUEVO CON CREATEGROUP en create group
export const subscribeSocketAddedToNewGroup = (dispatch) => {
  if (!socket) {
    console.log("No socket");
    return;
  }

  socket.off("addedToNewGroup");

  socket.on("addedToNewGroup", (savedGroup) => {
    console.log(savedGroup);
    dispatch(
      // here addedgroup
      addedtoGroup(savedGroup)
    );
    toast(`Has sido AÑADIDO al grupo: ${savedGroup?.groupName}`, {
      style: {
        background: "green",
        color: "white",
      },
    });
  });
};

//cuando se elimina el grupo del que soy miembro
export const subscribeSocketMemberDeletedGroup = (dispatch) => {
  if (!socket) {
    console.log("No socket");
    return;
  }

  socket.off("groupDeleted");

  socket.on("groupDeleted", (group) => {
    console.log(group);
    dispatch(
      removeExitGroup({
        idRemove: group?._id,
      })
    );
    toast(`Se ha ELIMINADO por completo el grupo: ${group?.groupName}`, {
      style: {
        background: "blue",
        color: "white",
      },
    });
  });
};

//cuando se cambia la imagen
export const subscribeSocketNotifyChangeGroupEdited = (dispatch) => {
  if (!socket) {
    console.log("No socket");
    return;
  }

  socket.off("notifyChangeGroupEdited");

  socket.on("notifyChangeGroupEdited", (group) => {
    console.log(group);
    dispatch(
      removeExitGroup({
        idRemove: group?._id,
      })
    );
    toast(`Se ha actiualizado la imagen del grupo: ${group?.groupName}`, {
      style: {
        background: "blue",
        color: "white",
      },
    });
  });
};

//cuando se cambia el nombre del grupo
export const subscribeSocketNotifyChangeGroupNameEdited = (dispatch) => {
  if (!socket) {
    console.log("No socket");
    return;
  }

  socket.off("notifyChangeGroupNameEdited");

  socket.on("notifyChangeGroupNameEdited", (group) => {
    console.log(group);
    dispatch(
      removeExitGroup({
        idRemove: group?._id,
      })
    );
    toast(`Se ha actiualizado el nombre del grupo a: ${group?.groupName}`, {
      style: {
        background: "blue",
        color: "white",
      },
    });
  });
};

export const subscribeSocketUserCreated = (dispatch) => {
  socket.on("userCreated", (newUser) => {
    dispatch(addUser(newUser));
  });
};
