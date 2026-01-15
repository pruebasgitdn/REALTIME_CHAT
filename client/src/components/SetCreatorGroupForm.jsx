import React from "react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setNewAdminThink } from "../store/groupSlice";
import { toast } from "sonner";
import { FaSpinner } from "react-icons/fa6";

const SetCreatorGroupForm = () => {
  const [optionValue, setOptionValue] = useState("");
  const dispatch = useDispatch();

  //  RDX
  const selectedGroup = useSelector((state) => state.groups.selectedGroup);
  const loading = useSelector((state) => state.groups.loading);
  const users = useSelector((state) => state.chat.users);

  const adminSelected = users.find((u) => u._id == optionValue);

  const handleNewAdmin = async (e) => {
    e.preventDefault();
    console.log("Valor del form" + optionValue);
    console.log(adminSelected);

    try {
      if (optionValue == "") {
        toast(`Seleccione un usuario`, {
          style: {
            background: "red",
            color: "white",
          },
        });
        return;
      }
      dispatch(
        setNewAdminThink({
          group_id: selectedGroup?._id,
          body: { new_admin_id: optionValue },
        })
      )
        .unwrap()
        .then((data) => {
          console.log(data);
          toast(`Nuevo admin procesado`, {
            style: {
              background: "blue",
              color: "white",
            },
          });

          // navigate("/");
        })
        .catch((error) => {
          console.log(error);
          toast(`${error.message}`, {
            style: {
              background: "red",
              color: "white",
            },
          });
        });
    } catch (error) {
      console.log(error);
    } finally {
      document.getElementById("setCreatorModal").close();
    }
  };
  return (
    <div className="w-full text-sm flex flex-col space-y-4">
      <h3 className="text-lg text-primary">Nuevo admin del grupo</h3>{" "}
      <p>
        Si quieres abandonar el grupo y eres el creador deberás dejar a cargo un
        nuevo administrador o creador.
      </p>
      <form id="hh" onSubmit={handleNewAdmin}>
        <select
          name="sel"
          value={optionValue}
          className="select w-full outline-none
          focus:border-0"
          onChange={(e) => {
            setOptionValue(e.target.value);
            console.log(e.target.value);
          }}
        >
          <option value="" disabled>
            Selecciona el nuevo Admin
          </option>

          {users
            .filter((user) =>
              selectedGroup?.members.includes(user._id.toString())
            )
            .map((user) => (
              <option key={user._id} value={user._id}>
                {user.fullName}
              </option>
            ))}
        </select>
        {adminSelected && (
          <div className="w-full flex items-center my-3 gap-3">
            <p>
              <span className="font-bold">Usuario seleccionado: </span>

              {adminSelected.fullName}
            </p>
            <div className="avatar">
              <div className="w-15 rounded-full">
                <img
                  src={
                    adminSelected.profilePic?.url ||
                    "/assets/avatar_default.png"
                  }
                  alt="img"
                />
              </div>
            </div>
          </div>
        )}

        <button
          className="btn uppercase my-2 mx-auto flex"
          type="submit"
          form="hh"
        >
          {loading ? (
            <FaSpinner className="animate-spin flex mx-auto" size={19} />
          ) : (
            <> Confirmar cambios</>
          )}
        </button>
        <button
          className="btn"
          type="button"
          onClick={() => {
            document.getElementById("setCreatorModal").close();
          }}
        >
          ✕
        </button>
      </form>
    </div>
  );
};

export default SetCreatorGroupForm;
