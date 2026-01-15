import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IoMdCamera, IoMdClose, IoMdTrash } from "react-icons/io";
import { setMessages, setSelectedUser } from "../store/chatSlice.js";
import {
  editGroupImageThunk,
  editGroupNameThunk,
  leaveGroupThunk,
  setGroupMessages,
  setSelectedGroup,
} from "../store/groupSlice.js";
import { ImExit } from "react-icons/im";
import AddNewMemberForm from "./AddNewMemberForm.jsx";
import SetCreatorGroupForm from "./SetCreatorGroupForm.jsx";
import { toast } from "sonner";
import { leaveRoom } from "../lib/socket.js";
import DeleteGroupForm from "./DeleteGroupForm.jsx";
import { PiPencil } from "react-icons/pi";
import { FaSpinner } from "react-icons/fa6";

const ChatHeader = () => {
  const selectedUser = useSelector((state) => state.chat.selectedUser);
  const selectedGroup = useSelector((state) => state.groups.selectedGroup);
  const onlineUsers = useSelector((state) => state.user.onlineUsers);
  const loading = useSelector((state) => state.groups.loading);
  const userMe = useSelector((state) => state.user.user);
  const dispatch = useDispatch();

  const user_me_x = userMe._id || userMe.id;

  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [newGroupName, setNewGroupName] = useState(null);

  const itsMeCreator =
    selectedGroup?.createdBy == userMe?._id ||
    selectedGroup?.createdBy == userMe?.id;

  const imgmodalchange = useRef(null);
  const modalgroupnamechange = useRef(null);
  const fileInputRef = useRef(null);

  const handleSubmit = (e) => {
    const formData = new FormData();
    try {
      e.preventDefault();

      if (file == null) {
        toast("Seleccione la imagen", {
          style: { background: "red", color: "white" },
        });
        return false;
      }
      formData.append("groupImage", file);
      dispatch(
        editGroupImageThunk({
          group_id: selectedGroup?._id,
          groupImage: formData,
        })
      )
        .unwrap()
        .then(() => {
          toast("Imagen actualizada con exito", {
            style: { background: "green", color: "white" },
          });
          return false;
        })
        .catch((error) => {
          console.log(error);
          console.log(error?.message);
          toast(`${error?.message} || ERROR interno, accion invalida`, {
            style: { background: "green", color: "white" },
          });
          return false;
        });
    } catch (error) {
      console.log(error);
    } finally {
      imgmodalchange.current.close();
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleLeaveForm = async (e) => {
    try {
      e.preventDefault();
      dispatch(
        leaveGroupThunk({
          idRemove: String(selectedGroup._id),
        })
      )
        .unwrap()
        .then(() => {
          leaveRoom(selectedGroup._id, user_me_x, userMe?.fullName);

          toast(`Has abandonado el grupo ${selectedGroup.groupName}`, {
            style: {
              background: "blue",
              color: "white",
            },
          });
        })
        .catch((error) => {
          console.log(error);
          console.log(error.message);
        });
    } catch (error) {
      console.log(error);
    } finally {
      document.getElementById("leaveGroupModal").close();
      dispatch(setSelectedGroup(null));
    }
  };

  const handleGroupNameChange = async (e) => {
    const formData = new FormData();
    try {
      e.preventDefault();
      if (!newGroupName || newGroupName == null) {
        toast("Ingrese el nombre del grupo", {
          style: { background: "red", color: "white" },
        });
        return;
      }

      formData.append("groupName", newGroupName);

      dispatch(
        editGroupNameThunk({
          group_id: selectedGroup?._id,
          groupName: formData,
        })
      )
        .unwrap()
        .then(() => {
          toast("Nombre actualizado con exito", {
            style: { background: "green", color: "white" },
          });
          return false;
        })
        .catch((error) => {
          console.log(error);
          console.log(error?.message);
          toast(`${error?.message} || ERROR interno, accion invalida`, {
            style: { background: "green", color: "white" },
          });
          return false;
        });
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="w-full border-b-1 flex justify-between items-center p-3">
      {selectedUser && selectedUser._id ? (
        <>
          <div className="flex items-center">
            <img
              className="w-10 h-10 rounded-full mx-1.5 md:h-14 md:w-14"
              onError={(e) => {
                e.currentTarget.src = "/assets/avatar_default.png";
              }}
              src={selectedUser.profilePic?.url || "/assets/avatar_default.png"}
              alt=""
            />
            <div className="flex flex-col">
              <div className="font-medium truncate">
                {selectedUser.fullName}
              </div>
              <div className="text-sm text-zinc-400">
                {onlineUsers.includes(selectedUser._id)
                  ? "En linea"
                  : "Desconectado"}
              </div>
            </div>
          </div>
          <button
            className="flex hover:cursor-pointer duration-300 hover:text-base/70"
            onClick={() => {
              dispatch(setSelectedUser(null));
              dispatch(setMessages([]));
            }}
          >
            <IoMdClose className="size-8" />
          </button>
        </>
      ) : null}

      {selectedGroup ? (
        <>
          <div
            className="flex items-center
             w-10/12"
          >
            <button
              onClick={() => {
                console.log(itsMeCreator);
              }}
              className="p-1.5 relative "
            >
              <img
                className={`w-10 h-10 rounded-full mx-1.5
                  md:h-14 md:w-14 `}
                src={
                  selectedGroup.groupImage?.url || "/assets/group_default.png"
                }
                onError={(e) => {
                  e.currentTarget.src = "/assets/group_default.png";
                }}
                alt=""
              />
              {itsMeCreator && (
                <button
                  onClick={() => {
                    imgmodalchange.current.showModal();
                  }}
                  className="absolute top-0 left-0 hover:cursor-pointer"
                >
                  <IoMdCamera
                    size={23}
                    className="bg-white p-2 h-8 w-8 rounded-full text-red-500 "
                  />
                </button>
              )}
            </button>

            <div className="flex flex-col">
              <div className="font-medium flex flex-row  gap-1.5 items-center truncate">
                {selectedGroup.groupName}

                {itsMeCreator && (
                  <button
                    className="border-b-2 border-0 rounded-sm hover:cursor-pointer hover:bg-base-300/50 duration-300"
                    onClick={() => {
                      modalgroupnamechange.current.showModal();
                    }}
                  >
                    <PiPencil
                      size={30}
                      className=" p-2 
                      rounded-full text-base"
                    />
                  </button>
                )}
              </div>
              <div
                className="text-sm text-primary
                hover:cursor-pointer
                hover:underline"
              >
                <a
                  onClick={() => {
                    document.getElementById("my_modal").showModal();
                  }}
                >
                  {selectedGroup.members.length} Miembros
                </a>

                <dialog
                  id="my_modal"
                  className="modal
                  hover:cursor-auto
                  "
                >
                  <div className="modal-box">
                    <AddNewMemberForm />
                    <div
                      className="modal-action 
                      "
                    >
                      <button
                        className="btn"
                        onClick={() => {
                          document.getElementById("my_modal").close();
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </dialog>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            {itsMeCreator ? (
              <div className="">
                <div className="flex flex-col">
                  <button
                    onClick={() => {
                      document.getElementById("adminDeleteGroup").showModal();
                    }}
                    className=" flex flex-col
                    justify-center items-center
                    hover:cursor-pointer
                    duration-300
                    hover:text-base/70"
                  >
                    <IoMdTrash className="size-8" />
                    <p className="text-xs">Eliminar</p>
                  </button>
                </div>
              </div>
            ) : (
              <></>
            )}
            <button
              className=" flex flex-col
              justify-center items-center
              hover:cursor-pointer
              duration-300
              hover:text-base/70"
              onClick={() => {
                const creatorId =
                  typeof selectedGroup.createdBy === "string"
                    ? selectedGroup.createdBy
                    : selectedGroup.createdBy?._id;

                if (String(userMe._id) === String(creatorId)) {
                  document.getElementById("setCreatorModal").showModal();
                } else {
                  document.getElementById("leaveGroupModal").showModal();
                }
                // leaveGroupModal
              }}
            >
              <ImExit className="size-8" />
              <p className="text-xs">Abandonar</p>
            </button>

            {/* MODAL  NEW ADMIN */}
            <dialog id="setCreatorModal" className="modal ">
              <div className="modal-box">
                <SetCreatorGroupForm />
              </div>
            </dialog>

            {/*MODAL ADMIN ELIMINAR GRUPO*/}
            <dialog id="adminDeleteGroup" className="modal ">
              <div className="modal-box">
                <DeleteGroupForm />
              </div>
            </dialog>

            {/*MODAL CAMBIAR NOMBRE GRUPO*/}
            <dialog
              id="groupNameEdit"
              ref={modalgroupnamechange}
              className="modal"
            >
              <form onSubmit={handleGroupNameChange}>
                <div
                  className="modal-box flex flex-col gap-5
                min-w-[350px]
                "
                >
                  <div className="mx-auto flex items-center">
                    <h3 className="text-lg text-center">
                      Editar el nombre del grupo
                    </h3>
                    <PiPencil
                      size={35}
                      className=" p-2 
                      rounded-full text-base"
                    />
                  </div>

                  <input
                    type="text"
                    name=""
                    className="w-full rounded-sm focus:outline-none border-0 border-b-2 border-primary text-base-content p-2 focus:border-secondary-content text-sm"
                    placeholder="Ingresa el nombre del grupo"
                    id=""
                    onChange={(e) => {
                      setNewGroupName(e.target.value);
                    }}
                  />

                  <div className="modal-actions w-full flex justify-around items-center">
                    <button
                      className="btn"
                      type="button"
                      onClick={() => {
                        modalgroupnamechange.current.close();
                      }}
                    >
                      ✕
                    </button>
                    <button
                      type="submit"
                      className="btn rounded-md bg-primary uppercase text-base-300"
                    >
                      {loading ? (
                        <FaSpinner
                          className="animate-spin flex mx-auto"
                          size={19}
                        />
                      ) : (
                        <> Confirmar</>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </dialog>

            {/* MODAL LEAVE */}
            <dialog id="leaveGroupModal" className="modal ">
              <form action="" onSubmit={handleLeaveForm}>
                <div className="modal-box">
                  <div className="flex flex-col">
                    <p>¿Estas seguro que quieres salir abandonar el grupo?</p>
                  </div>
                  <div className="modal-actions w-full flex justify-around items-center">
                    <button
                      className="btn"
                      type="button"
                      onClick={() => {
                        document.getElementById("leaveGroupModal").close();
                      }}
                    >
                      ✕
                    </button>
                    <button
                      type="submit"
                      className="btn rounded-md bg-primary uppercase text-base-300  hover:cursor-pointer"
                    >
                      {loading ? (
                        <FaSpinner
                          className="animate-spin flex mx-auto"
                          size={19}
                        />
                      ) : (
                        <>Confirmar</>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </dialog>

            {/*MODAL EDITAR IMAGEN*/}
            <dialog id="imageGroupEdit" ref={imgmodalchange} className="modal">
              <div className="modal-box">
                <form action="" onSubmit={handleSubmit}>
                  <h3 className="text-lg text-center text-primary">
                    Editar imagen del grupo
                  </h3>
                  <button
                    className="btn mx-auto p-4 rounded-md text-center flex items-center gap-1.5"
                    type="button"
                    onClick={handleImageClick}
                  >
                    <p>Selecciona la imagen</p>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      ref={fileInputRef}
                      className="hidden"
                      name="image"
                      accept="image/*"
                    />
                    <span>+</span>
                  </button>
                  {preview && (
                    <div className="flex-col flex justify-center items-center space-y-2.5">
                      <img
                        src={preview}
                        className="mx-auto rounded-full bg-cover bg-center bg-no-repeat w-28 h-28"
                        alt="preview"
                      />

                      <div className="bg-red-500  rounded-full w-10 h-10 mx-auto flex items-center justify-center hover:bg-red-700 hover:cursor-pointer">
                        <button
                          className="hover:cursor-pointer"
                          onClick={() => {
                            setPreview(null);
                            setFile(null);
                          }}
                        >
                          <IoMdTrash size={18} className="text-white" />
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="modal-actions flex gap-0 items-center justify-around mt-4 mb-1.5">
                    <button
                      className="btn"
                      type="button"
                      onClick={() => {
                        document.getElementById("imageGroupEdit").close();
                      }}
                    >
                      ✕
                    </button>
                    <button
                      type="submit"
                      className="btn rounded-md bg-primary uppercase text-base-300"
                    >
                      {loading ? (
                        <FaSpinner
                          className="animate-spin flex mx-auto"
                          size={19}
                        />
                      ) : (
                        <> Guardar cambios</>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </dialog>

            <button
              className=" flex flex-col
              justify-center items-center
              hover:cursor-pointer
              duration-300
              hover:text-base/70"
              onClick={() => {
                dispatch(setSelectedGroup(null));
                dispatch(setGroupMessages({}));
              }}
            >
              <IoMdClose className="size-8" />
              <p className="text-xs">Cerrar</p>
            </button>
          </div>
        </>
      ) : (
        <></>
      )}
    </div>
  );
};

export default ChatHeader;
