import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosInstance } from "../lib/axios";
import { connectSocket } from "../lib/socket";
import { cleanChatSlice } from "./chatSlice";
import { cleanGroupSlice } from "./groupSlice";

const initialState = {
  user: null,
  signedSession: false,
  token: null,
  loading: false,
  error: null,
  socketConnected: false,
  onlineUsers: [],
};

export const connecSocketThunk = createAsyncThunk(
  "auht/connectSocket",
  async (_, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState();
      const user = state.user.user;
      const socketConnected = state.user.socketConnected;
      //const signedSession = state.user.signedSession;

      if (!user) {
        return rejectWithValue({
          message: "Usuario no logueado",
        });
      } else if (socketConnected === true) {
        return rejectWithValue({
          message: "Ya tienes una sesion activa",
        });
      }

      //connection handshake
      const socket = connectSocket(user._id);
      console.log(socket);

      socket.on("getOnlineUsers", (userIds) => {
        dispatch(setOnlineUsers(userIds));
      });

      return true;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: "Error desconocido",
        }
      );
    }
  }
);

export const checkAuthThunk = createAsyncThunk(
  "auth/checkAuth",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/auth/check");

      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: "Error desconocido",
        }
      );
    }
  }
);

export const registerUserThunk = createAsyncThunk(
  "auth/register",
  async (postData, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/auth/register", postData);

      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: "Error desconocido",
        }
      );
    }
  }
);

export const logouThunk = createAsyncThunk(
  "auht/logout",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      dispatch(cleanChatSlice());
      dispatch(cleanGroupSlice());
      const res = await axiosInstance.get("/auth/logout");

      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: "Error desconocido",
        }
      );
    }
  }
);

export const editProfileThunk = createAsyncThunk(
  "auth/editProfile",
  async (putData, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put("/auth/edit_profile", putData);

      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: "Error desconocido",
        }
      );
    }
  }
);

export const loginThunk = createAsyncThunk(
  "auht/login",
  async (postData, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/auth/login", postData);

      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: "Error desconocido",
        }
      );
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setLogin: (state, action) => {
      state.user = action.payload;
      state.token = action.payload;
      state.signedSession = true;
    },
    setLogout: (state) => {
      state.user = null;
      state.token = null;
      state.signedSession = false;
      state.socketConnected = false;
    },
    updateUser: (state, action) => {
      state.user = {
        ...state.user,
        ...action.payload,
      };
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkAuthThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuthThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(checkAuthThunk.fulfilled, (state, action) => {
        const data = action.payload.data;

        state.user = data;
        state.loading = false;
        state.error = null;
        state.signedSession = true;
      })
      .addCase(registerUserThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(registerUserThunk.fulfilled, (state, action) => {
        const { user, token } = action.payload;
        state.user = user;
        state.loading = false;
        state.error = null;
        state.token = token;
        state.signedSession = true;
      })
      .addCase(logouThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logouThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(logouThunk.fulfilled, (state) => {
        state.user = null;
        state.loading = false;
        state.error = null;
        state.token = null;
        state.signedSession = false;
        state.socketConnected = false;
      })
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        const { user, token } = action.payload;
        state.user = user;
        state.loading = false;
        state.error = null;
        state.token = token;
        state.signedSession = true;
      })
      .addCase(editProfileThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editProfileThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(editProfileThunk.fulfilled, (state, action) => {
        const { data } = action.payload;
        state.user = data;
        state.loading = false;
        state.error = null;
      })
      .addCase(connecSocketThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(connecSocketThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(connecSocketThunk.fulfilled, (state) => {
        state.socketConnected = true;
      });
  },
});

export const { setLogin, setLogout, updateUser, setOnlineUsers } =
  userSlice.actions;

export default userSlice.reducer;
