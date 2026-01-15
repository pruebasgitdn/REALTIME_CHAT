import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUsersThunk, setMessages } from "../store/chatSlice.js";
import SidebarSkeleton from "./skeletons/SidebarSkeleton.jsx";
import { IoIosContacts, IoIosSearch, IoMdAdd } from "react-icons/io";
import { FaCircleUser } from "react-icons/fa6";
import { setSelectedUser } from "../store/chatSlice.js";
import CreateGroupForm from "./CreateGroupForm.jsx";
import { getMyGroupsThunk, setSelectedGroup } from "../store/groupSlice.js";
import {
  joinRoom,
  subscribeSocketAddedToNewGroup,
  subscribeSocketMemberDeletedGroup,
  subscribeSocketMemberRemovedFromGroupEvent,
  subscribeSocketNotifyChangeGroupEdited,
  subscribeSocketNotifyChangeGroupNameEdited,
} from "../lib/socket.js";

const SideBar = () => {
  const [showOnlineUsers, setShowOnlineUsers] = useState(false);

  //ESTDOS REDX
  const usersLoading = useSelector((state) => state.chat.usersLoading);
  const users = useSelector((state) => state.chat.users);

  const selectedUser = useSelector((state) => state.chat.selectedUser);
  const onlineUsers = useSelector((state) => state.user.onlineUsers);
  const user = useSelector((state) => state.user.user);
  const groups = useSelector((state) => state.groups.groups);
  const selectedGroup = useSelector((state) => state.groups.selectedGroup);

  const dispatch = useDispatch();
  const [searchGroups, setSearchGroups] = useState("");
  const [searchUsers, setSearchUsers] = useState("");

  useEffect(() => {
    dispatch(getUsersThunk())
      .unwrap()
      .then((data) => {
        console.log(data);
      })
      .catch((error) => {
        console.log(error);
        console.log(error.message);
      });
  }, [dispatch]);
  console.log(usersLoading);

  useEffect(() => {
    return () => {
      subscribeSocketAddedToNewGroup(dispatch);
      subscribeSocketMemberRemovedFromGroupEvent(dispatch);
      subscribeSocketMemberDeletedGroup(dispatch);
      subscribeSocketNotifyChangeGroupEdited(dispatch);
      subscribeSocketNotifyChangeGroupNameEdited(dispatch);
      dispatch(getMyGroupsThunk())
        .unwrap()
        .then((data) => {
          console.log(data);
        })
        .catch((error) => {
          console.log(error);
        });
    };
  }, [dispatch]);

  const filteredUsers = users
    .filter((user) =>
      showOnlineUsers ? onlineUsers.includes(user._id || user.id) : true
    )
    .filter((user) =>
      user.fullName.toLowerCase().includes(searchUsers.toLowerCase())
    );

  const filteredGroups = groups?.filter((group) =>
    group.groupName.toLowerCase().includes(searchGroups.toLowerCase())
  );

  if (usersLoading) return <SidebarSkeleton />;

  return (
    <div className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-300">
      <div className="border-base-300 w-full overflow-y-auto">
        <div className="flex flex-col justify-start flex-wrap items-start gap-2">
          {/* GRUPOS */}
          <div className=" relative w-full p-3.5 space-y-1.5 border-b border-base-300">
            <IoIosContacts className="size-8 md:size-10 mx-auto md:mx-0" />
            <span className="hidden font-medium lg:block">Grupos</span>

            <div className="flex flex-col lg:flex-row items-center gap-1.5 text-xs">
              <button
                className="w-fit p-1.5 text-xs rounded-sm bg-primary text-base-100 hover:bg-base-100 hover:cursor-pointer  hover:text-primary duration-500  active:scale-95 flex   items-center gap-2.5"
                onClick={() => {
                  document.getElementById("my_modal_1").showModal();
                }}
              >
                <p className="hidden lg:block">Crear grupo</p>
                <IoMdAdd className="size-4 lg:size-5 " />
              </button>
              {/* MODAL */}
              <dialog id="my_modal_1" className="modal">
                <div className="modal-box">
                  <CreateGroupForm />
                  <div className="modal-action">
                    <button
                      type="button"
                      className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                      onClick={() =>
                        document.getElementById("my_modal_1").close()
                      }
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </dialog>
            </div>
          </div>

          {/* MAPEO GRUPOS */}
          <div className="overflow-y-auto w-full py-3">
            {groups && groups.length > 0 ? (
              <div className="flex flex-col gap-4">
                <div className="relative">
                  <input
                    placeholder="Buscar grupos ..."
                    type="text"
                    onChange={(e) => {
                      setSearchGroups(e.target.value);
                    }}
                    className="w-11/12 mx-auto flex border-0 border-b-1 border-primary focus:outline-none focus:border-b-2"
                    id=""
                  />
                  <IoIosSearch className="absolute right-2 top-1" size={18} />
                </div>
                {filteredGroups.map((g) => {
                  return (
                    <button
                      className={`w-full p-3 flex items-center gap-2
                      hover:bg-base-300
                      hover:cursor-pointer
                      transition-colors
                      ${
                        selectedGroup?._id === g._id
                          ? "bg-base-300 ring-1 ring-base-300"
                          : ""
                      }`}
                      onClick={() => {
                        dispatch(setSelectedGroup(g));
                        joinRoom(g._id);
                        dispatch(setSelectedUser(null));
                        dispatch(setMessages([]));
                        console.log(g);
                      }}
                      key={g._id}
                    >
                      <div
                        className="mx-auto md:mx-0
                        relative flex flex-row items-center gap-4"
                      >
                        <img
                          src={g.groupImage?.url || "/assets/group_default.png"}
                          onError={(e) => {
                            e.currentTarget.src = "/assets/group_default.png";
                          }}
                          alt=""
                          className="w-8 h-8 md:h-12 md:w-12
                          rounded-full
                          "
                        />
                        <p className="hidden lg:block"> {g.groupName}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="">
                <p className="text-xs text-center  text-base-content/70 p-1">
                  De momento, no estas registrado en nigun grupo
                </p>
              </div>
            )}
          </div>

          {/* USUARIOS */}
          <div
            className="space-y-1.5 w-full p-3.5
            border-b border-t border-base-300"
          >
            <FaCircleUser className="size-8 md:size-10 mx-auto md:mx-0" />
            <span className="hidden font-medium lg:block">Contactos</span>
            <div
              className="flex flex-col lg:flex-row
              items-center gap-1.5 text-xs"
            >
              <p>Usuarios en linea</p>
              <input
                type="checkbox"
                name=""
                value={showOnlineUsers}
                onChange={() => setShowOnlineUsers(!showOnlineUsers)}
                className="checkbox checkbox-sm"
                id=""
              />
              <span> {onlineUsers.filter((p) => p !== user._id).length}</span>
            </div>
          </div>

          {/* MAPEO USUARIOS */}
          <div className="overflow-y-auto w-full py-3">
            {users && users.length > 0 ? (
              <div className="flex flex-col gap-4">
                <div className="relative">
                  <input
                    placeholder="Buscar usuarios ..."
                    type="text"
                    onChange={(e) => {
                      setSearchUsers(e.target.value);
                    }}
                    className="w-11/12 mx-auto flex border-0 border-b-1 border-primary focus:outline-none focus:border-b-2"
                    id=""
                  />
                  <IoIosSearch className="absolute right-2 top-1" size={18} />
                </div>
                {filteredUsers.map((user) => {
                  return (
                    <button
                      className={`
                      w-full p-3 flex items-center gap-2
                      hover:bg-base-300
                      hover:cursor-pointer
                      transition-colors
                      ${
                        selectedUser?._id === user._id
                          ? "bg-base-300 ring-1 ring-base-300"
                          : ""
                      }`}
                      onClick={() => {
                        dispatch(setSelectedUser(user));
                        dispatch(setSelectedGroup(null));
                      }}
                      key={user._id}
                    >
                      <div
                        className="mx-auto md:mx-0
                        relative"
                      >
                        <img
                          src={
                            user.profilePic?.url || "/assets/avatar_default.png"
                          }
                          onError={(e) => {
                            e.currentTarget.src = "/assets/avatar_default.png";
                          }}
                          alt=""
                          className="w-8 h-8 md:h-12 md:w-12 rounded-full"
                        />
                        {onlineUsers.includes(user._id) && (
                          <span className="bg-emerald-500 w-3 h-3 rounded-full p-1.5 ring-zinc-900 absolute top-0 right-0"></span>
                        )}
                      </div>

                      <div className="hidden flex-col justify-center lg:flex text-left min-w-0">
                        <div
                          className=" text-sm font-semibold
                          truncate"
                        >
                          {user.fullName}
                        </div>
                        <div className="text-sm text-zinc-400">
                          {onlineUsers.includes(user._id)
                            ? "En linea"
                            : "Desconectado"}
                        </div>
                      </div>
                    </button>
                  );
                })}

                {filteredUsers.length === 0 && (
                  <div className="text-sm p-3 text-center font-semibold text-base-content">
                    Por ahora no hay usuarios en linea
                  </div>
                )}
              </div>
            ) : (
              <div className="">
                <p className="text-xs text-center text-base-content/70 p-1">
                  De momento, no hay usuarios registrados
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
