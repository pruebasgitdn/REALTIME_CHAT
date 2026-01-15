import React from "react";

const LoginAside = () => {
  return (
    <div
      className="bg-[url(../assets/aa.jpg)]
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
        <h1 className="text-3xl font-bold text-white animate-fade-in-up">
          Bienvenido
        </h1>
        <p
          className="text-sm text-emerald-400 font-bold
         hover:cursor-pointer
        transition-transform 
        hover:scale-125
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
