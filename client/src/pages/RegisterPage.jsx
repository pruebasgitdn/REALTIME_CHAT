import { TiMail, TiKey, TiEye, TiEyeOutline } from "react-icons/ti";
import { AiOutlineUser } from "react-icons/ai";
import { useState } from "react";
import RegisterAside from "../components/RegisterAside.jsx";
import { useDispatch } from "react-redux";
import { connecSocketThunk, registerUserThunk } from "../store/authSlice.js";
import { toast } from "sonner";
import { VscHubot } from "react-icons/vsc";
import {
  subscribeSocketAddedToNewGroup,
  subscribeSocketMemberAddedToGroupEvent,
  subscribeSocketMemberDeletedGroup,
  subscribeSocketMemberRemovedFromGroupEvent,
  subscribeSocketNotifyChangeGroupEdited,
  subscribeSocketNotifyChangeGroupNameEdited,
  subscribeSocketUserCreated,
} from "../lib/socket.js";

const RegisterPage = () => {
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    profilePic: {
      public_id: "",
      url: "",
    },
  });

  const validate = () => {
    const newErrors = {};
    if (!formData.email.includes("@")) {
      toast(`Email Invalido`, {
        style: {
          background: "red",
          color: "white",
        },
      });
      return;
    }
    if (!formData.email.trim()) {
      toast(`Email vacio`, {
        style: {
          background: "red",
          color: "white",
        },
      });
      return;
    }
    if (formData.password.length < 8 || formData.password.length > 10) {
      toast(`La contraseña debe contener entre 8 y 10 caracteres`, {
        style: {
          background: "red",
          color: "white",
        },
      });
      return;
    }
    if (!formData.password.trim()) {
      toast(`Contraseña vacia, ingrese contraseña`, {
        style: {
          background: "red",
          color: "white",
        },
      });
      return;
    }

    if (formData.fullName.length < 3 || formData.fullName.length > 30) {
      toast(`El nombre completo debe contener entre 3 y 30 caracteres`, {
        style: {
          background: "red",
          color: "white",
        },
      });
      return;
    }
    if (!formData.fullName.trim()) {
      toast(`Nombre vacio, ingrese nombre`, {
        style: {
          background: "red",
          color: "white",
        },
      });
      return;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("submiutde");
    const isValid = validate();
    if (isValid) {
      dispatch(registerUserThunk(formData))
        .unwrap()
        .then((data) => {
          console.log(data);
          // REGISTRADO CON EXITO
          toast("Usuario registrado con exito", {
            style: {
              background: "green",
              color: "white",
            },
          });

          //
          dispatch(connecSocketThunk())
            .unwrap()
            .then((data) => {
              console.log(data);
              subscribeSocketMemberAddedToGroupEvent(dispatch);
              subscribeSocketMemberRemovedFromGroupEvent(dispatch);
              subscribeSocketAddedToNewGroup(dispatch);
              subscribeSocketMemberDeletedGroup(dispatch);
              subscribeSocketNotifyChangeGroupEdited(dispatch);
              subscribeSocketNotifyChangeGroupNameEdited(dispatch);
              subscribeSocketUserCreated(dispatch);
            })
            .catch((error) => {
              console.log(error);
              toast(`${error.message}` || "No se pudo conectar el socket", {
                style: {
                  background: "red",
                  color: "white",
                },
              });
            });

          //
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

      console.log(formData);
    } else {
      console.log("No se pudo obtener el form, errores: ", errors);
    }
  };

  return (
    <div className="relative flex h-screen text-primary">
      <div className="w-full bg-none md:w-1/2 flex flex-col z-10 items-center justify-center">
        <form
          onSubmit={handleSubmit}
          action=""
          name="registerform"
          className="text-center rounded-sm space-y-4 border-0 bg-base-300 hover:cursor-pointer p-3 md:p-1.5"
        >
          <VscHubot
            size={38}
            className="bg-secondary-content hover:text-primary/70 animate-pulse text-secondary h-auto w-auto p-5 rounded-full mx-auto"
          />
          <h3 className="font-bold">Crear cuenta</h3>
          <p className="text-sm text-accent">
            Empieza creando tu cuenta gratis!
          </p>
          <div className="flex flex-col space-y-2">
            <label
              className="text-primary text-sm font-bold mb-2 text-start"
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
                className="border-1 border-primary/50 rounded-sm text-sm w-96 p-1 focus:border-primary/70 focus:outline-none  pl-11  py-2
                "
                type="text"
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

            <label
              className="text-primary text-sm font-bold mb-2 text-start"
              htmlFor="email"
            >
              Email
            </label>

            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <TiMail color="#fffffff" size={26} />
              </span>

              <input
                placeholder="Ejm: tony@gmail.com"
                className="border-1 border-primary/50 rounded-sm text-sm w-96 p-1 focus:outline-none focus:border-primary/70   pl-11  py-2"
                type="email"
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

            <label
              className="text-primary text-sm font-bold mb-2 text-start"
              htmlFor="password"
            >
              Contraseña
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <TiKey color="#fffffff" size={26} />
              </span>

              <button
                type="button"
                className="absolute inset-y-0 right-3  flex items-center hover:cursor-pointer hover:text-gray-300 focus:outline-none"
                onClick={() => {
                  setShowPassword(!showPassword);
                }}
              >
                {showPassword ? (
                  <TiEyeOutline
                    title="Mostrar / Ocultar contraseña"
                    color="#fffffff"
                    size={26}
                  />
                ) : (
                  <TiEye
                    title="Mostrar / Ocultar contraseña"
                    color="#fffffff"
                    size={26}
                  />
                )}
              </button>

              <input
                className="border-1 border-primary/50 rounded-sm text-sm w-96 p-1 focus:border-primary/70 focus:outline-none  pl-11  py-2 "
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    password: e.target.value,
                  });
                }}
              />
            </div>
          </div>

          <div className="flex flex-col space-y-1.5">
            <button
              type="submit"
              className="uppercase  w-96 mx-auto p-1.5 rounded-sm  hover:cursor-pointer active:scale-95 focus:outline-none duration-300 bg-neutral hover:text-neutral font-bold hover:bg-primary"
            >
              registrar cuenta
            </button>
            <div className="flex flex-row text-xs mx-auto space-x-1.5 mb-3 text-accent">
              <p>¿Ya tienes cuenta?</p>
              <a href="/login" className="underline">
                Inicia sesion
              </a>
            </div>
          </div>
        </form>
      </div>

      <div
        className="hidden w-screen h-screen md:block md:w-1/2 bg-cover bg-center rounded-sm
      "
      >
        <RegisterAside />
      </div>
    </div>
  );
};

export default RegisterPage;
