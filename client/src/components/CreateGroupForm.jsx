import React, { useEffect, useRef, useState } from "react";
import { IoMdCamera, IoMdClose, IoMdTrash } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { createGroupThunk } from "../store/groupSlice";
import { FaSpinner } from "react-icons/fa6";

const CreateGroupForm = () => {
  //
  const dispatch = useDispatch();

  //
  const [usersId, setUsersId] = useState([]);
  const [file, setFile] = useState(null);
  const [groupName, setGroupName] = useState("");
  const [searchUser, setSearchUser] = useState("");
  const [chatImagePreview, setChatImagePreview] = useState(null);
  const [previewUsersSelected, setPreviewUsersSelected] = useState([]);

  //RET INPUT
  const fileInputRef = useRef(null);

  //ESTADO RDX
  const users = useSelector((state) => state.chat.users);
  const loading = useSelector((state) => state.groups.loading);

  //FUNCIONES

  const handleUserIdSelection = (u) => {
    setUsersId((prevUsersId) => {
      if (!prevUsersId.includes(u._id)) {
        //si no esta
        return [...prevUsersId, u._id];
      } else if (prevUsersId.includes(u._id)) {
        //si esta
        return prevUsersId.filter((id) => id !== u._id);
      }
    });
  };

  const handleUserPreviewdSelection = (u) => {
    setPreviewUsersSelected((prevUsers) => {
      if (!prevUsers.some((user) => user._id === u._id)) {
        return [...prevUsers, u];
      } else {
        return prevUsers.filter((user) => user._id !== u._id);
      }
    });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      setFile(selectedFile);
      setChatImagePreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = (e) => {
    try {
      e.preventDefault();
      const formData = new FormData();

      //groupname,members ID,createdBy ID

      formData.append("groupName", groupName);
      if (usersId.length < 2) {
        toast(`Debes seleccionar al menos dos miembros del grupo`, {
          style: {
            background: "red",
            color: "white",
          },
        });
        return false;
      }
      usersId.forEach((id) => {
        formData.append("members", id);
      });

      const checkUsers = formData.get("members");
      console.log(checkUsers);

      //2
      if (checkUsers === null || checkUsers.trim() === "") {
        toast(`No se seleccionaron los miembros del grupo`, {
          style: {
            background: "red",
            color: "white",
          },
        });
        return false;
      }

      if (file) {
        formData.append("groupImage", file);
      }

      if (!groupName || groupName == "") {
        toast(`El nombre del grupo no puede estar vacio`, {
          style: {
            background: "red",
            color: "white",
          },
        });
        return;
      } else if (groupName.length < 3) {
        toast(`El nombre del grupo debe contener al menos 3 caracteres`, {
          style: {
            background: "red",
            color: "white",
          },
        });
        return;
      }

      dispatch(createGroupThunk(formData))
        .unwrap()
        .then(() => {
          toast(`Grupo creado con exito`, {
            style: {
              background: "green",
              color: "white",
            },
          });
        })
        .catch((error) => {
          console.log(error);
          console.log(error?.message);
          toast(
            `${error?.message}` || "Accion Invalida, intentalo mas tarde.",
            {
              style: {
                background: "red",
                color: "white",
              },
            }
          );
        });

      for (let [key, value] of formData) {
        console.log(`${key}: ${value}`);
      }
    } catch (error) {
      console.log(error);
    } finally {
      document.getElementById("my_modal_1").close();
    }
  };

  useEffect(() => {}, []);

  const filteredUsers = users.filter((user) =>
    user.fullName.toLowerCase().includes(searchUser.toLowerCase())
  );
  return (
    <div>
      <form
        action=""
        className="flex flex-col justify-center items-center
        space-y-5
      "
        onSubmit={handleSubmit}
      >
        <h3 className="text-base-content text-lg">
          Selecciona el nombre y los miembros del grupo.
        </h3>
        <div className="flex flex-col w-11/12  items-center">
          <h4>Grupo:</h4>

          <input
            type="text"
            placeholder="Escribe el nombre del grupo"
            name="groupName"
            className="w-10/12 border-b-2 focus:outline-none focus:border-primary"
            id=""
            onChange={(e) => {
              setGroupName(e.target.value);
            }}
          />
          {groupName.length < 3 && (
            <p className="">El nombre del grupo deber tener 3 caracteres</p>
          )}
        </div>

        {users && users.length > 0 ? (
          <div className="w-11/12">
            <div className="flex flex-col justify-center w-full items-center gap-2">
              <h4>Usuarios:</h4>
              <input
                type="text"
                placeholder="Buscar usuarios o seleccionar"
                name="groupName"
                className="w-10/12 border-b-2 focus:outline-none focus:border-primary"
                id=""
                onChange={(e) => {
                  setSearchUser(e.target.value);
                }}
              />
            </div>

            <div className="flex flex-wrap items-center w-full mx-auto overflow-y-auto">
              {filteredUsers.map((u) => (
                <button
                  type="button"
                  key={u._id}
                  className={`flex flex-row items-center gap-2.5 w-10/12 my-3.5 py-1.5 rounded-md border-b hover:cursor-pointer focus:outline-none mx-auto
                ${
                  usersId.includes(u._id) ? "bg-base-200" : "hover:bg-base-200"
                }`}
                  onClick={() => {
                    handleUserIdSelection(u);
                    handleUserPreviewdSelection(u);
                  }}
                >
                  <div className="avatar">
                    <div className="w-10 rounded-full">
                      <img
                        src={u.profilePic?.url || "/assets/avatar_default.png"}
                        alt="imgavatar"
                      />
                    </div>
                  </div>
                  <p className="text-xs">{u.fullName}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-base-content">
            {" "}
            No se encontraron usuarios en la aplicacion
          </p>
        )}
        {previewUsersSelected && previewUsersSelected.length > 0 ? (
          <div className="w-full font-bold text-lg">
            <hr className="w-full" />
            <p className="w-full text-center mb-0 font-semibold">
              Usuarios seleccionados:
            </p>
            <hr className="w-full" />
          </div>
        ) : (
          <></>
        )}
        {previewUsersSelected && previewUsersSelected.length > 0 ? (
          <div
            className="flex
            flex-wrap justify-center
            overflow-y-auto
            w-full "
          >
            {previewUsersSelected.map((id) => {
              return (
                <div
                  className="w-max items-center justify-center
                  flex flex-col relative mx-2 my-2
                "
                  key={id._id}
                >
                  <div className="avatar ">
                    <div className="w-16 rounded-full">
                      <img
                        src={id.profilePic?.url || "/assets/avatar_default.png"}
                        alt="img"
                      />
                    </div>
                  </div>
                  <p className="text-xs">{id?.fullName}</p>

                  <div className="absolute top-0 right-0.5 rounded-full h-min w-min p-1 bg-primary">
                    <IoMdClose
                      size={15}
                      className="hover:cursor-pointer text-base-300 font-bold"
                      onClick={() => {
                        handleUserIdSelection(id);
                        handleUserPreviewdSelection(id);
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <></>
        )}
        {chatImagePreview && chatImagePreview != null ? (
          <>
            <img
              src={chatImagePreview}
              className="mx-auto rounded-full bg-cover bg-center bg-no-repeat w-28 h-28"
              alt="preview"
            />

            <div>
              <hr className="w-full" />
              <p className="w-full text-center mb-0 font-semibold">
                Imagen seleccionada:
              </p>
              <hr className="w-full" />
            </div>

            <button
              className="bg-red-500  rounded-full w-10 h-10 mx-auto flex items-center justify-center hover:bg-red-700 hover:cursor-pointer"
              onClick={() => {
                setChatImagePreview(null);
              }}
            >
              <IoMdTrash size={18} className="text-white" />
            </button>
          </>
        ) : (
          <></>
        )}
        <button
          type="button"
          className="
          rounded-md
          w-max p-2 bg-secondary text-base-300
          flex gap-2 justify-center items-center  
            hover:cursor-pointer uppercase font-semibold
            disabled:bg-base-300
            "
          disabled={chatImagePreview !== null}
          onClick={handleImageClick}
        >
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            ref={fileInputRef}
          />
          <p>Imagen del grupo</p>
          <IoMdCamera
            size={18}
            className="mx-auto
          text-base-300
          "
          />
        </button>
        <button
          type="submit"
          className="w-4/12 p-1.5 text-xs rounded-sm bg-primary text-base-100 hover:bg-base-100 hover:cursor-pointer  hover:text-primary duration-500  active:scale-95 flex  items-center justify-center gap-2.5  uppercase font-semibold"
        >
          {loading ? (
            <FaSpinner className="animate-spin flex mx-auto" size={19} />
          ) : (
            <> Crear grupo</>
          )}
        </button>
      </form>
    </div>
  );
};

export default CreateGroupForm;
