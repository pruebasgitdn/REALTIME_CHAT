import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import NoChatSelected from "../components/NoChatSelected.jsx";
import ChatContainer from "../components/ChatContainer.jsx";
import SideBar from "../components/SideBar.jsx";
import {
  subscribeSocketAddedToNewGroup,
  subscribeSocketMemberAddedToGroupEvent,
  subscribeSocketMemberDeletedGroup,
  subscribeSocketMemberLeftEvent,
  subscribeSocketMemberRemovedFromGroupEvent,
  subscribeSocketNotifyChangeGroupEdited,
  subscribeSocketNotifyChangeGroupNameEdited,
} from "../lib/socket.js";

const HomePage = () => {
  const selectedUser = useSelector((state) => state.chat.selectedUser);
  const selectedGroup = useSelector((state) => state.groups.selectedGroup);
  const dispatch = useDispatch();
  console.log(selectedUser);
  console.log(selectedGroup?._id);

  useEffect(() => {
    subscribeSocketAddedToNewGroup(dispatch);
    subscribeSocketMemberAddedToGroupEvent(dispatch);
    subscribeSocketMemberRemovedFromGroupEvent(dispatch);
    subscribeSocketMemberDeletedGroup(dispatch);
    subscribeSocketNotifyChangeGroupEdited(dispatch);
    subscribeSocketNotifyChangeGroupNameEdited(dispatch);
  }, [dispatch]);

  useEffect(() => {
    if (selectedGroup) {
      subscribeSocketMemberLeftEvent(dispatch, selectedGroup._id);
    }
  }, [selectedGroup, dispatch]);

  return (
    <div className="h-screen bg-base-300">
      <div className="flex items-center justify-center pt-20   px-4">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            <SideBar />
            {selectedUser || selectedGroup ? (
              <ChatContainer />
            ) : (
              <NoChatSelected />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
