import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMessagesThunk, unSubscribeToMessages } from "../store/chatSlice";
import { FaHandshakeSimple } from "react-icons/fa6";
import { PiPersonSimpleSkiFill } from "react-icons/pi";

import ChatHeader from "./ChatHeader";
import InputMessage from "./InputMessage";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { toast } from "sonner";
import { formatMessageDateTime } from "../lib/utils";
import {
  subscribeSocketNewGroupMessageEvent,
  subscribeSocketNewMessageEvent,
} from "../lib/socket";
import {
  getGroupMessagesThunk,
  getMyGroupsThunk,
  unSubscribeToGroupMessages,
} from "../store/groupSlice";

const ChatContainer = () => {
  //CONSTANTES
  const dispatch = useDispatch();
  const messaegeEndRef = useRef(null);

  //ESTADOS REDX
  const userMe = useSelector((state) => state.user.user);
  const messagesLoading = useSelector((state) => state.chat.messagesLoading);
  const messages = useSelector((state) => state.chat.messages);
  const selectedUser = useSelector((state) => state.chat.selectedUser);
  const selectedGroup = useSelector((state) => state.groups.selectedGroup);
  const groupMessages = useSelector((state) => state.groups.groupMessages);
  const groupLoading = useSelector((state) => state.groups.loading);

  useEffect(() => {
    if (selectedUser && selectedUser?._id) {
      dispatch(getMessagesThunk(selectedUser?._id))
        .unwrap()
        .then((data) => {
          console.log(data);
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
    }
    //escuchar mensajes nuevos
    subscribeSocketNewMessageEvent(dispatch, selectedUser);

    return () => {
      dispatch(unSubscribeToMessages());
    };
  }, [dispatch, selectedUser]);

  useEffect(() => {
    if (!selectedGroup || !selectedGroup._id) return;
    if (selectedGroup?._id) {
      dispatch(getGroupMessagesThunk(selectedGroup?._id))
        .unwrap()
        .then((data) => {
          console.log(data);
        })
        .catch((error) => {
          console.log(error);
          console.log(error?.message);
          toast(`${error.message}`, {
            style: {
              background: "red",
              color: "white",
            },
          });
        });
    }
    subscribeSocketNewGroupMessageEvent(dispatch, selectedGroup);

    return () => {
      dispatch(unSubscribeToGroupMessages());
      dispatch(getMyGroupsThunk());
    };
  }, [selectedGroup, dispatch]);

  useEffect(() => {
    if (
      (messaegeEndRef.current && messages) ||
      (messaegeEndRef.current && groupMessages)
    ) {
      messaegeEndRef.current.scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [messaegeEndRef, messages, groupMessages]);

  if (messagesLoading || groupLoading) {
    return (
      <div className="flex flex-1 flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <InputMessage />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <ChatHeader />
      <div className="flex-1 overflow-y-auto p-4">
        {selectedUser && selectedUser._id && (
          <>
            {messages.map((m, idx) => (
              <div
                key={idx}
                ref={messaegeEndRef}
                className={`chat  ${
                  m.senderId === userMe.id || m.senderId === userMe._id
                    ? "chat-end"
                    : " chat-start"
                } `}
              >
                <div className="chat-image avatar">
                  <div
                    className="rounded-full
                      size-10"
                  >
                    <img
                      src={
                        m.senderId === userMe.id || m.senderId === userMe._id
                          ? userMe.profilePic?.url ||
                            "/assets/avatar_default.png"
                          : selectedUser.profilePic?.url ||
                            "/assets/avatar_default.png"
                      }
                      onError={(e) => {
                        e.currentTarget.src = "/assets/avatar_default.png";
                      }}
                      alt="img"
                    />
                  </div>
                </div>

                <div className="chat-header my-3">
                  <time className="text-xs opacity-50 ml-1">
                    {formatMessageDateTime(m.createdAt)}
                  </time>
                </div>

                <div className="chat-bubble flex flex-col">
                  {m.image && (
                    <img
                      src={m.image?.url}
                      alt="img"
                      className="sm:max-w-[200px] rounded-md mb-1.5"
                    />
                  )}

                  {m.text && <p>{m.text}</p>}
                </div>
              </div>
            ))}

            {messages.length === 0 && (
              <div
                className="flex-col flex
              items-center justify-center
              h-full gap-3.5
                "
              >
                <h3
                  className="font-semibold
                    text-lg
                    text-primary
                    "
                >
                  No se encontraron mensajes en común.
                </h3>
                <p className="text">Inicia una conversacion</p>
                <FaHandshakeSimple
                  className="text-base-content 
                    animate-pulse
                    w-10 h-10
                    md:w-19 md:h-19 "
                />
              </div>
            )}
          </>
        )}

        {selectedGroup && selectedGroup._id && (
          <>
            {groupMessages && groupMessages.length > 0 ? (
              groupMessages.map((p, idx) => (
                <div
                  key={idx}
                  ref={messaegeEndRef}
                  className={`chat  ${
                    p.senderId._id === userMe._id ||
                    p.senderId._id === userMe.id ||
                    p.senderId === userMe.id ||
                    p.senderId === userMe._id
                      ? "chat-end"
                      : " chat-start"
                  } `}
                >
                  <div className="chat-image avatar">
                    <div
                      className="rounded-full
                        size-10"
                    >
                      <img
                        src={
                          p.senderId._id === userMe._id ||
                          p.senderId._id === userMe.id ||
                          p.senderId === userMe.id ||
                          p.senderId === userMe._id
                            ? userMe.profilePic?.url ||
                              "/assets/avatar_default.png"
                            : p.senderId.profilePic?.url ||
                              "/assets/avatar_default.png"
                        }
                        onError={(e) => {
                          e.currentTarget.src = "/assets/avatar_default.png";
                        }}
                        alt="img"
                      />
                    </div>
                  </div>

                  <div className="chat-header my-3 flex gap-4">
                    <time className="text-xs opacity-50 ml-1">
                      {formatMessageDateTime(p.createdAt)}
                    </time>
                    <p> {p.senderId?.fullName} </p>
                  </div>

                  <div className="chat-bubble flex flex-col">
                    {p.image && (
                      <img
                        src={p.image?.url}
                        alt="img"
                        className="sm:max-w-[100px] rounded-md mb-1.5"
                      />
                    )}

                    {p.text && <p>{p.text}</p>}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex-col flex items-center justify-center h-full gap-3.5">
                <h3 className="font-semibold text-lg text-primary">
                  No se encontraron mensajes en el grupo.
                </h3>
                <p className="text">Inicia la conversacion</p>
                <PiPersonSimpleSkiFill className="text-base-content animate-pulse w-10 h-10 md:w-19 md:h-19" />
              </div>
            )}
          </>
        )}
      </div>
      <InputMessage />
    </div>
  );
};

export default ChatContainer;
