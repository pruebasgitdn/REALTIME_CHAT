import React, { useEffect, useRef, useState } from "react";
import { AiOutlineUser } from "react-icons/ai";
import { TiMail } from "react-icons/ti";
import { useDispatch, useSelector } from "react-redux";
import { IoMdCamera, IoMdTrash } from "react-icons/io";
import { editProfileThunk } from "../store/authSlice";
import { toast } from "sonner";

const ProfilePage = () => {
  const user = useSelector((state) => state.user.user);
  const fileInputRef = useRef(null);
  const dispatch = useDispatch();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const [formData, setFormData] = useState({
    email: user?.email,
    fullName: user?.fullName,
  });

  useEffect(() => {
    setFormData({
      email: user.email,
      fullName: user.fullName,
      profilePic: {
        public_id: user.profilePic?.public_id,
        url: user.profilePic?.url,
      },
    });
  }, [user]);

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

  const validate = () => {
    if (!formData.email.trim()) {
      toast("Email vacío", { style: { background: "red", color: "white" } });
      return false;
    }

    if (!formData.email.includes("@")) {
      toast("Email inválido", { style: { background: "red", color: "white" } });
      return false;
    }

    if (!formData.fullName.trim()) {
      toast("Nombre vacío, ingrese nombre", {
        style: { background: "red", color: "white" },
      });
      return false;
    }

    if (formData.fullName.length < 3 || formData.fullName.length > 30) {
      toast("El nombre completo debe contener entre 3 y 30 caracteres", {
        style: { background: "red", color: "white" },
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const dataSend = new FormData();
    dataSend.append("email", formData.email);
    dataSend.append("fullName", formData.fullName);

    if (
      formData.email === user.email &&
      formData.fullName === user.fullName &&
      !file
    ) {
      toast("Ingrese datos actualizados", {
        style: { background: "blue", color: "white" },
      });
      return;
    }

    if (file) {
      dataSend.append("profilePic", file);
    }

    const isValid = validate();
    if (isValid) {
      dispatch(editProfileThunk(dataSend))
        .unwrap()
        .then((data) => {
          console.log(data);
          toast(`Informacion actualizada con exito!`, {
            style: {
              background: "green",
              color: "white",
            },
          });
        })
        .catch((error) => {
          console.log(error);
          console.log(error.message);
          toast(`${error.message}`, {
            style: {
              background: "red",
              color: "white",
            },
          });
        });
    }
    console.log(formData);
    setPreview(null);
  };

  return (
    <div className="flex items-center justify-center h-screen  text-primary bg-base-300/50">
      <div
        className="  bg-base-300
        duration-300
        rounded-sm flex flex-col
        justify-center text-center  p-3.5  "
      >
        <h3 className=" font-bold text-base-content  ">Perfil</h3>
        <p className=" text-base-content/70 ">Tu informacion de perfil</p>

        <form
          action=""
          name="editProfileForm"
          onSubmit={handleSubmit}
          className="text-start flex flex-col space-y-2"
        >
          {!user?.profilePic?.url || user.profilePic?.url === undefined ? (
            <div
              className="
                border-1 border-amber-50
                w-40 h-40  bg-cover bg-center
                mx-auto rounded-full z-20"
            >
              <img src="/assets/avatar_default.png" alt="" />
            </div>
          ) : (
            <div
              className="
                border-1 border-amber-50
                w-40 h-40 
                bg-cover bg-center
                mx-auto rounded-full z-20"
              style={{
                backgroundImage: `url(${user?.profilePic?.url})`,
              }}
            ></div>
          )}

          <div className="relative">
            <button
              className="w-10 h-10
                z-90
                bg-red-600
                hover:bg-red-800 duration-300 hover:cursor-pointer
                right-1/3 bottom-4.5 rounded-full absolute
                flex items-center"
              onClick={handleImageClick}
              type="button"
            >
              <input
                type="file"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="hidden"
                name="image"
                accept="image/*"
              />
              <IoMdCamera size={18} color="#ffffff" className="mx-auto" />
            </button>
          </div>

          <p
            className="text-xs text-center
            text-base-content
            "
          >
            Haz click en el icono de la camara para actualizar tu foto de perfil
          </p>

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

          <label
            className=" text-sm font-bold mb-2 text-start"
            htmlFor="fullName"
          >
            Nombre Completo
          </label>

          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <AiOutlineUser color="#fffffff" size={26} />
            </span>

            <input
              placeholder="Ejm: Carlos Antonio Velez"
              className="border-1 w-96 border-primary rounded-sm text-sm p-1  focus:outline-none  pl-11  py-2 "
              type="text"
              value={formData?.fullName}
              name="fullName"
              id="fullName"
              onChange={(e) => {
                setFormData({
                  ...formData,
                  fullName: e.target.value,
                });
              }}
            />
          </div>
          <label className=" text-sm font-bold mb-2 text-start" htmlFor="email">
            Email
          </label>

          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <TiMail color="#fffffff" size={26} />
            </span>

            <input
              placeholder="Ejm: tony@gmail.com"
              className="border-1 w-96 border-primary rounded-sm text-sm p-1 focus:outline-none  pl-11  py-2 "
              type="email"
              value={formData?.email}
              name="email"
              id="email"
              onChange={(e) => {
                setFormData({
                  ...formData,
                  email: e.target.value,
                });
              }}
            />
          </div>

          <hr />
          <button
            type="submit"
            className="rounded-md p-1.5 text-center uppercase bg-neutral w-full hover:text-neutral  font-bold hover:bg-primary  duration-200 hover:cursor-pointer text-sm
              active:scale-95 
          
          "
          >
            actualizar perfil
          </button>
        </form>

        <hr className="my-3" />

        <div className=" flex flex-col text-xs">
          <div
            className="flex flex-row items-center justify-between space-y-3
          text-base-content
          "
          >
            <p>Creado desde</p>
            {user?.createdAt ? (
              <span>{new Date(user?.createdAt).toLocaleDateString()}</span>
            ) : (
              <span>Fecha no disponible</span>
            )}
          </div>
          <div
            className="flex flex-row items-center justify-between
          text-base-content
          "
          >
            <p>Estado</p>
            <span className="bg-emerald-900 text-white p-1.5 rounded-md text-center hover:opacity-90">
              Activo
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
