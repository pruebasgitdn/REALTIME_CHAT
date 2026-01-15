import { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { connecSocketThunk, loginThunk } from "../store/authSlice.js";
import LoginAside from "../components/LoginAside.jsx";
import { TiEye, TiEyeOutline, TiKey, TiMail, TiUser } from "react-icons/ti";
import { getMyGroupsThunk } from "../store/groupSlice.js";
import {
  subscribeSocketAddedToNewGroup,
  subscribeSocketMemberAddedToGroupEvent,
  subscribeSocketMemberDeletedGroup,
  subscribeSocketMemberRemovedFromGroupEvent,
  subscribeSocketNotifyChangeGroupEdited,
  subscribeSocketNotifyChangeGroupNameEdited,
  subscribeSocketUserCreated,
} from "../lib/socket.js";

const LoginPage = () => {
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    email: "",
    password: "",
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = validate();
    if (isValid) {
      dispatch(loginThunk(formData))
        .unwrap()
        .then(() => {
          toast("Inicio de sesion exitoso", {
            style: {
              background: "green",
              color: "white",
            },
          });

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

          dispatch(getMyGroupsThunk())
            .unwrap()
            .then((data) => {
              console.log(data);
            })
            .catch((error) => {
              console.log(error);
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
          className="text-center rounded-sm space-y-4 border-0 p-3 bg-base-300 md:p-1.5 hover:cursor-pointer md:border-primary"
        >
          <TiUser
            size={38}
            className="bg-secondary-content h-auto w-auto p-5 text-secondary rounded-full hover:text-primary/70 mx-auto animate-pulse hover:cursor-pointer"
          />

          <h3 className="font-bold">Bienvenido de vuelta</h3>
          <p className="text-sm text-accent">Inicia sesion en tu cuenta!</p>
          <div className="flex flex-col space-y-2">
            <label
              className="text-sm font-bold mb-2 text-start"
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
                className="border-1 w-96 border-primary/50 rounded-sm text-sm p-1 focus:border-1  focus:border-primary/70 focus:outline-none pl-11 py-2 "
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
              className="text-sm font-bold mb-2 text-start"
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
                className="border-1 border-primary/50 rounded-sm text-sm w-96 p-1 focus:border-1 focus:border-primary/70 focus:outline-none pl-11 py-2"
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
              className="uppercase primary w-96 mx-auto p-1.5 rounded-sm  hover:cursor-pointer active:scale-95  duration-300 bg-neutral hover:text-neutral font-bold hover:bg-primary focus:outline-none"
            >
              iniciar sesion
            </button>
            <div className="flex flex-row text-xs mx-auto space-x-1.5 mb-3 text-accent">
              <p>¿No tienes cuenta?</p>
              <a href="/register" className="underline">
                Registrarse gratis
              </a>
            </div>
          </div>
        </form>
      </div>

      <div className="hidden w-screen h-screen md:block md:w-1/2 bg-cover bg-center rounded-sm">
        <LoginAside />
      </div>
    </div>
  );
};

export default LoginPage;
