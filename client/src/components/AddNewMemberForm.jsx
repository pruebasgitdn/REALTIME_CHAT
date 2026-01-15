import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaCirclePlus, FaCircleMinus, FaSpinner } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";
import { HiMiniUsers } from "react-icons/hi2";
import { setNewMembers } from "../store/groupSlice";
import { toast } from "sonner";

const AddNewMemberForm = () => {
  const [showUsers, setShowUsers] = useState(false);
  const [collectedUsers, setCollectedUsers] = useState([]);

  const users = useSelector((state) => state.chat.users);

  const userMe = useSelector((state) => state.user.user);
  const selectedGroup = useSelector((state) => state.groups.selectedGroup);
  const loading = useSelector((state) => state.groups.loading);

  const dispatch = useDispatch();

  const handleAddNewMember = async (e) => {
    try {
      e.preventDefault();

      if (collectedUsers.length === 0) {
        toast(`No se han seleccionado usuarios`, {
          style: {
            background: "red",
            color: "white",
          },
        });

        return false;
      }

      dispatch(
        setNewMembers({
          group_id: selectedGroup._id,
          body: { membersId: collectedUsers.map((u) => u._id) },
        })
      )
        .unwrap()
        .then(() => {
          toast(`Miembro actualizado con exito`, {
            style: {
              background: "blue",
              color: "white",
            },
          });
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
      document.getElementById("my_modal").close();
      setCollectedUsers([]);
    }
  };

  return (
    <div className="relative">
      <form action="" onSubmit={handleAddNewMember}>
        <div className="flex gap-1 items-center justify-center">
          <h3 className="text-base-content text-lg text-center my-4">
            Miembros
          </h3>
          <HiMiniUsers size={19} />
        </div>

        <div className="flex flex-wrap items-center justify-center  mx-auto w-full  max-h-[100px] overflow-y-auto">
          {/* MIEMBROS */}
          {users
            .filter((user) => selectedGroup?.members.includes(user._id))
            .map((user) => (
              <div
                key={user._id}
                className="flex flex-col flex-wrap  items-center m-3"
              >
                <h4>{user.fullName}</h4>
                <div className="avatar">
                  <div className="w-10 rounded-full">
                    <img
                      alt="img"
                      src={user.profilePic?.url || "/assets/avatar_default.png"}
                      onError={(e) => {
                        e.currentTarget.src = "/assets/avatar_default.png";
                      }}
                    />
                  </div>
                </div>
                {user._id === selectedGroup.createdBy ? (
                  <span className="font-bold text-xs">(CREADOR)</span>
                ) : (
                  <></>
                )}
              </div>
            ))}

          {/* YO PERTENEZCO? */}
          {userMe &&
            selectedGroup?.members.includes(
              userMe._id.toString() || userMe.id.toString()
            ) && (
              <div
                key={userMe._id || userMe.id}
                className="flex flex-col justiy-center items-center"
              >
                {userMe.fullName}
                <div className="avatar">
                  <div className="w-10 rounded-full">
                    <img
                      alt="img"
                      src={
                        userMe?.profilePic?.url || "/assets/avatar_default.png"
                      }
                      onError={(e) => {
                        e.currentTarget.src = "/assets/avatar_default.png";
                      }}
                    />
                  </div>
                </div>
                <span className="font-bold text-xs">(YO)</span>

                {userMe._id === selectedGroup.createdBy ||
                userMe.id === selectedGroup.createdBy ? (
                  <span className="font-bold text-xs">(CREADOR)</span>
                ) : (
                  <></>
                )}
              </div>
            )}
        </div>
        {userMe._id === selectedGroup.createdBy ||
        userMe.id === selectedGroup.createdBy ? (
          <>
            <hr className="mt-1.5" />
            <div className="my-4 flex">
              <p className="text-base-content text-sm">
                Si quieres añadir un nuevo miembro,click en{" "}
                <span className="underline uppercase">EDITAR</span>
                {""} y luego {""}
                <span className="underline uppercase">CONFIRMAR</span>
                {""}
              </p>
              <button
                type="button"
                className="btn uppercase text-sm"
                onClick={() => {
                  setShowUsers(!showUsers);
                }}
              >
                <p>editar miembros</p>
                <FaEdit size={15} />
              </button>
              <br />
            </div>
            {showUsers && (
              <>
                <p className="text-base-content text-lg font-semibold">
                  Miembros totales
                </p>
                <div className="w-full flex py-2 justify-center flex-wrap gap-2">
                  <hr />

                  {users.map((u) => {
                    const isMember = selectedGroup?.members.includes(
                      u._id.toString()
                    );
                    return (
                      <button
                        className={`
                        w-max p-1.5 gap-0.5 flex flex-col items-center rounded-sm border-b border-base-content
                        hover:cursor-pointer    hover:bg-base-300
                        ${isMember ? "bg-base-300" : "text-base-content"}`}
                        key={u._id}
                        onClick={() => {
                          const isSelected = collectedUsers.some(
                            (user) => user._id === u._id
                          );
                          if (isSelected) {
                            setCollectedUsers(
                              collectedUsers.filter(
                                (user) => user._id !== u._id
                              )
                            );
                          } else {
                            // Agregar usuario completo
                            setCollectedUsers([...collectedUsers, u]);
                          }
                        }}
                        type="button"
                      >
                        <div className="flex items-center gap-1.5">
                          <h3>{u.fullName}</h3>
                          <div className="avatar">
                            <div className="w-10 rounded-full">
                              <img
                                alt="img"
                                src={
                                  u?.profilePic?.url ||
                                  "/assets/avatar_default.png"
                                }
                                onError={(e) => {
                                  e.currentTarget.src =
                                    "/assets/avatar_default.png";
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        {isMember && (
                          <div className="block">
                            <p className="text-xs">Miembro</p>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
            {collectedUsers && collectedUsers.length > 0 && (
              <>
                <hr className="my-2" />
                <p className="text-base-content text-lg font-semibold">
                  Miembros seleccionados
                </p>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {collectedUsers.map((c) => {
                    const isMember = selectedGroup?.members.some(
                      (id) => id.toString() === c._id.toString()
                    );

                    return (
                      <button
                        key={c._id}
                        className="
                        relative my-4
                        w-max border-b rounded-sm p-1 flex items-center gap-1.5 hover:cursor-pointer hover:bg-base-300"
                        onClick={() => {
                          setCollectedUsers(
                            collectedUsers.filter((u) => u._id !== c._id)
                          );
                        }}
                      >
                        <p>{c.fullName}</p>

                        <div className="avatar">
                          <div className="w-10 rounded-full">
                            <img
                              alt="img"
                              src={
                                c?.profilePic?.url ||
                                "/assets/avatar_default.png"
                              }
                              onError={(e) => {
                                e.currentTarget.src =
                                  "/assets/avatar_default.png";
                              }}
                            />
                          </div>
                        </div>
                        {isMember ? (
                          <div className="absolute top-0 left-0">
                            <FaCircleMinus size={15} />
                          </div>
                        ) : (
                          <div className="absolute top-0 left-0">
                            <FaCirclePlus size={15} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                <hr className="my-2" />
              </>
            )}

            <button
              type="submit"
              className="uppercase p-1.5 rounded-md bg-neutral text-base-content hover:cursor-pointer mx-auto flex"
              onClick={() => {
                console.log(collectedUsers);
                console.log(selectedGroup?.members);
              }}
            >
              {loading ? (
                <FaSpinner className="animate-spin flex mx-auto" size={19} />
              ) : (
                <>Confirmar</>
              )}
            </button>
          </>
        ) : (
          <></>
        )}
      </form>
    </div>
  );
};

export default AddNewMemberForm;
