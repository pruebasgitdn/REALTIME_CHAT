import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { MdAccountCircle, MdHome, MdMessage, MdSettings } from "react-icons/md";
import { RxExit } from "react-icons/rx";
import { logouThunk } from "../store/authSlice";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { disconnectSocket } from "../lib/socket.js";
const NavBar = () => {
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return (
    <header className="flex w-full items-center justify-between border-primary text-base-content p-1.5 border-b-2  text-xs">
      <div className=" flex items-center gap-1">
        <div className="lg:min-w-max h-10 w-30 text-base bg-[url(../assets/logo.png)] bg-center bg-no-repeat bg-contain rounded-md hover:p-1"></div>

        <h3 className="font-bold text-lg">REALTIME CHAT</h3>
      </div>

      <div className="flex flex-wrap justify-end gap-0.5 mt-4 md:mt-0 md:gap-3">
        <button
          className="
          hover:border-b-1 hover:border-base/100  
          hover:cursor-pointer rounded-md text-center flex flex-row items-center gap-1.5 p-3"
          onClick={() => navigate("/settings")}
        >
          <p>Configuracion</p>
          <MdSettings size={19} />
        </button>
        {user !== null ? (
          <>
            <button
              className=" hover:border-b-1 
              hover:border-base/100  hover:cursor-pointer rounded-md  text-center flex flex-row items-center gap-1.5 p-3"
              onClick={() => {
                navigate("/");
              }}
            >
              <p>Inicio</p>
              <MdHome size={19} />
            </button>
            <button
              className=" hover:border-b-1 
              hover:border-base/100  hover:cursor-pointer rounded-md  text-center flex flex-row items-center gap-1.5 p-3"
              onClick={() => {
                navigate("/profile");
              }}
            >
              <p>Perfil</p>
              <MdAccountCircle size={19} />
            </button>
            <button
              className="hover:border-b-1    hover:border-base/100  hover:cursor-pointer rounded-md  text-center flex flex-row items-center gap-1.5 p-3"
              onClick={() => {
                dispatch(logouThunk())
                  .unwrap()
                  .then((data) => {
                    console.log(data);
                    toast("Has cerrado la sesion.", {
                      style: {
                        background: "#275EF5",
                        color: "white",
                        position: "top-center",
                      },
                    });
                    disconnectSocket();
                  })
                  .catch((error) => {
                    console.log(error);
                    console.log(error.message);
                    toast(`${error.message}`, {
                      style: {
                        background: "red",
                        color: "white",
                        position: "top-center",
                      },
                    });
                  });
              }}
            >
              <p>Salir</p>
              <RxExit size={19} className=" " />
            </button>
          </>
        ) : (
          <></>
        )}
      </div>
    </header>
  );
};

export default NavBar;
