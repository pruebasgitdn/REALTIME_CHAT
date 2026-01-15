import React from "react";

const LoginAside = () => {
  return (
    <div
      className="bg-[url(../assets/ee.jpg)]
         bg-cover bg-center rounded-sm
      "
    >
      <div
        className="items-center flex flex-col justify-center
        space-y-6 h-screen"
      >
        <div
          className=" w-full h-39
        bg-[url(../assets/logo_white.png)]
        bg-center bg-no-repeat bg-contain
        animate-pulse
      "
        ></div>
        <h2
          className="text-white
        text-3xl
        hover:cursor-pointer
        transition-transform 
        hover:scale-110
        font-bold 
       bg-gradient-to-r from-rose-400 via-fuchsia-500 to-indigo-500 bg-[length:100%_4px] bg-no-repeat bg-bottom
        "
        >
          Haz parte de la comunidad
        </h2>
        <p
          className="text-sm text-amber-500 font-bold
         hover:cursor-pointer
        transition-transform 
        hover:scale-105
        hover:underline underline-offset-2
       
        "
        >
          Intercambia archivos y mensajes en tiempo real, ahora mismo...
        </p>
      </div>
    </div>
  );
};

export default LoginAside;
