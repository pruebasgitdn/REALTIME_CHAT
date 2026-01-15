import React, { useEffect } from "react";
import NavBar from "./components/NavBar";
import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import RegisterPage from "./pages/RegisterPage";
import {
  checkAuthThunk,
  connecSocketThunk,
  setLogout,
} from "./store/authSlice.js";
import { useDispatch, useSelector } from "react-redux";
import { cleanGroupSlice, getMyGroupsThunk } from "./store/groupSlice.js";
import {
  subscribeSocketAddedToNewGroup,
  subscribeSocketMemberAddedToGroupEvent,
  subscribeSocketMemberDeletedGroup,
  subscribeSocketMemberRemovedFromGroupEvent,
  subscribeSocketNotifyChangeGroupEdited,
  subscribeSocketNotifyChangeGroupNameEdited,
} from "./lib/socket.js";
import { cleanChatSlice } from "./store/chatSlice.js";

const App = () => {
  const dispatch = useDispatch();

  //ESTADOS
  const user = useSelector((state) => state.user.user);
  const userLoading = useSelector((state) => state.user.loading);
  const theme = useSelector((state) => state.theme.theme);
  const onlineUsers = useSelector((state) => state.user.onlineUsers);
  const selectedUser = useSelector((state) => state.chat.selectedUser);

  console.log(onlineUsers);

  useEffect(() => {
    dispatch(checkAuthThunk())
      .unwrap()
      .then((data) => {
        console.log(data);
        dispatch(connecSocketThunk())
          .unwrap()
          .then(() => {
            //ha sido añadido como NUEVO en el creategroupForm
            subscribeSocketAddedToNewGroup(dispatch);

            //miembro nuevo al grupo -> editar miembro +
            subscribeSocketMemberAddedToGroupEvent(dispatch);

            //miembro menos al grupo -> editar miembro -
            subscribeSocketMemberRemovedFromGroupEvent(dispatch);

            //grupo borrado
            subscribeSocketMemberDeletedGroup(dispatch);

            //grupo img actualizada
            subscribeSocketNotifyChangeGroupEdited(dispatch);

            //grupo nombre actualizo
            subscribeSocketNotifyChangeGroupNameEdited(dispatch);
          })
          .catch((error) => {
            console.log(error);
          });

        dispatch(getMyGroupsThunk())
          .unwrap()
          .then((data) => {
            console.log(data);
          })
          .catch((error) => {
            console.log(error);
          });
      })

      .catch((error) => {
        console.log(error);
        console.log(error.message);

        dispatch(setLogout());
        dispatch(cleanChatSlice());
        dispatch(cleanGroupSlice());
      });
  }, [dispatch, selectedUser]);

  if (userLoading && !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="loading loading-spinner loading-xl"></span>
      </div>
    );
  }

  return (
    <div data-theme={theme}>
      <NavBar />

      <Routes>
        <Route
          path="/"
          element={user ? <HomePage /> : <Navigate to={"/login"} />}
        />

        <Route
          path="/login"
          element={!user ? <LoginPage /> : <Navigate to={"/"} />}
        />

        <Route
          path="/register"
          element={!user ? <RegisterPage /> : <Navigate to={"/"} />}
        />

        <Route
          path="/profile"
          element={user ? <ProfilePage /> : <Navigate to={"/"} />}
        />

        <Route
          path="/settings"
          element={user ? <SettingsPage /> : <Navigate to={"/"} />}
        />
      </Routes>
    </div>
  );
};

export default App;
