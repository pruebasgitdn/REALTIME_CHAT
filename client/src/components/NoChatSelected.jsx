import React from "react";

const NoChatSelected = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-10 bg-base-100/50">
      <div className="max-w-md text-center space-y-6">
        <div className=" mx-auto lg:min-w-max h-30 w-30 bg-[url(../assets/logo.png)] bg-center bg-no-repeat bg-contain rounded-md hover:p-1 animate-bounce"></div>

        <div className="text-2xl font-bold">
          <h2>Bienvenido a REALTIME CHAT ! </h2>

          <p className="text-sm text-base-content/60">
            Selecciona una conversacion de la barra lateral para empezar a
            mensajear
          </p>
        </div>
      </div>
    </div>
  );
};

export default NoChatSelected;
