import React from "react";
import { THEMES } from "../constants/constants";
import { useDispatch } from "react-redux";
import { setTheme } from "../store/themeSlice";
import { MdSend } from "react-icons/md";

const SettingsPage = () => {
  const MESSAGES = {
    msg_1: {
      text: "Hey, que estas haciendo?",
      date: "14:05",
      isSent: false,
    },
    msg_3: {
      text: "Oe, nada estoy trabando",
      date: "14:07",
      isSent: true,
    },
  };

  const dispatch = useDispatch();
  return (
    <div className="min-h-screen mx-auto px-5 max-w-screen-sm sm:max-w-xl md:max-w-5xl">
      <div
        className="flex flex-col
        space-y-3
        
      "
      >
        <h2 className="text-lg">Tema</h2>
        <p className="text-sm">
          Escoge una onfiguracion del tema para la interfaz
        </p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1">
        {THEMES.map((theme) => {
          return (
            <div
              className="flex flex-col
              hover:cursor-pointer
            hover:bg-neutral hover:rounded-md
            p-2.5 my-1.5
            "
              key={theme}
              onClick={() => {
                dispatch(setTheme(theme));
                localStorage.setItem("theme", theme);
              }}
            >
              <button
                key={theme}
                className={`
            group flex flex-row items-center rounded-md

          `}
              >
                <div
                  data-theme={theme}
                  className="h-auto  w-full p-1.5 rounded-lg transition-colors hover:bg-base-200/50"
                >
                  <div
                    className="grid grid-cols-4 gap-1
                items-center justify-center
                "
                  >
                    <div className="rounded-sm bg-primary h-6 w-6 mx-auto"></div>
                    <div className="rounded-sm bg-secondary h-6 w-6 mx-auto"></div>
                    <div className="rounded-sm bg-accent h-6 w-6 mx-auto"></div>
                    <div className="rounded-sm bg-neutral h-6 w-6 mx-auto"></div>
                  </div>
                </div>
              </button>
              <p className="text-base">
                {theme.charAt(0).toUpperCase() + theme.slice(1)}
              </p>
            </div>
          );
        })}
      </div>

      <h3>Previsualización</h3>
      <div className="bg-neutral w-full rounded-md p-4">
        <div className="bg-secondary-content w-1/2 mx-auto py-3 flex flex-col rounded-sm">
          <div className="flex items-center justify-start gap-3 ml-3.5">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-neutral text-center text-primary">
              <p>C</p>
            </div>
            <div>
              <h3 className="text-start text-primary text-lg">
                Carlos Antonio Velez
              </h3>
              <p className="text-primary/60">En línea</p>
            </div>
          </div>
          <hr className="my-3.5 text-base-300" />
          {Object.values(MESSAGES).map((m) => (
            <div
              key={m.date}
              className={`flex ${
                m.isSent ? "justify-end" : "justify-start"
              } my-2`}
            >
              <div
                className={`rounded-md p-3 w-auto max-w-sm text-xs gap-0.5 mx-3
                  ${
                    m.isSent
                      ? "bg-primary text-neutral"
                      : "bg-neutral text-primary"
                  }
                  `}
              >
                <p>{m.text}</p>
                <p className="text-accent-content/70">{m.date}</p>
              </div>
            </div>
          ))}
          <div className="w-full px-3">
            <div className="flex mx-auto items-center justify-center max-w-3xl gap-1">
              <input
                type="text"
                placeholder="Esto es un preview . . ."
                className="flex-grow bg-neutral text-primary border border-primary rounded-md p-2 text-sm"
              />

              <button className="p-2 rounded-md text-primary border border-primary hover:bg-primary hover:text-neutral transition">
                <MdSend size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

//
export default SettingsPage;
