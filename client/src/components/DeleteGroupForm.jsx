import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteGroupThunk } from "../store/groupSlice";
import { toast } from "sonner";
import { FaSpinner } from "react-icons/fa6";

const DeleteGroupForm = () => {
  const selectedGroup = useSelector((state) => state.groups.selectedGroup);
  const loading = useSelector((state) => state.groups.loading);
  const dispatch = useDispatch();
  // const userMe = useSelector((state) => state.user.user);

  const handleSubmit = (e) => {
    try {
      e.preventDefault();
      const group_id = selectedGroup?._id;

      dispatch(
        deleteGroupThunk({
          idRemove: String(selectedGroup._id),
        })
      )
        .unwrap()
        .then((data) => {
          console.log(data);
          toast(`Grupo ${selectedGroup.groupName} fue eliminado con exito`, {
            style: {
              background: "blue",
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

      console.log(
        "id a eliminar " + group_id + " grupo " + selectedGroup.groupName
      );
    } catch (error) {
      console.log(error);
    } finally {
      document.getElementById("adminDeleteGroup").close();
    }
  };

  return (
    <div className="w-full text-center flex flex-col gap-5">
      <h3 className="text-xl text-center text-primary">¿Eliminar grupo?</h3>
      <p className="text-sm">
        Si haces esto no habrá vuelta atras, o respaldo y todos los mensajes y
        miembros seran eliminados
      </p>

      <div className="flex items-center justify-around  gap-4">
        <form action="" onSubmit={handleSubmit}>
          <button
            type="submit"
            className="uppercase
            bg-primary text-base-300 rounded-md p-1.5 font-semibold   hover:cursor-pointer duration-300 hover:text-base-300/60 items-center"
          >
            {loading ? (
              <FaSpinner className="animate-spin flex mx-auto" size={19} />
            ) : (
              <>Confirmar</>
            )}
          </button>
        </form>

        <button
          className="btn"
          type="button"
          onClick={() => {
            document.getElementById("adminDeleteGroup").close();
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default DeleteGroupForm;
