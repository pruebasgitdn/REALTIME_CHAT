import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosInstance } from "../lib/axios.js";
import { getSocket } from "../lib/socket.js";

const initialState = {
  messages: [],
  users: [],
  selectedUser: null,
  usersLoading: false,
  messagesLoading: false,
};

export const getMessagesThunk = createAsyncThunk(
  "messages/getMessages",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/messages/${id} `);

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

export const getUsersThunk = createAsyncThunk(
  "messages/getUsers",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/messages/users`);

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

export const sendMessageThunk = createAsyncThunk(
  "messages/sendMessage",
  async (data, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(
        `/messages/send/${data?.receiverId}`,
        data?.data_body
      );

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

export const unSubscribeToMessages = createAsyncThunk(
  "messages/unSubscribeToMessages",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const selectedUser = state.messages.selectedUser;

      if (!selectedUser) return;

      const socket = getSocket();
      socket.off("newMessage");
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: "Error desconocido",
        }
      );
    }
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState: initialState,
  reducers: {
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    addMessage: (state, action) => {
      const msg = action.payload;
      state.messages.push({
        ...msg,
        senderId: msg.senderId?._id || msg.senderId,
      });
    },
    addUser: (state, action) => {
      state.users.push(action.payload);
    },
    setUsers: (state, action) => {
      state.users = action.payload;
    },

    cleanChatSlice: (state) => {
      state.messages = [];
      state.users = [];
      state.selectedUser = null;
      state.usersLoading = false;
      state.messagesLoading = false;
    },

    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUsersThunk.pending, (state) => {
        state.usersLoading = true;
      })
      .addCase(getUsersThunk.rejected, (state) => {
        state.usersLoading = false;
        state.users = [];
      })
      .addCase(getUsersThunk.fulfilled, (state, action) => {
        const { data } = action.payload;
        state.users = data;
        state.usersLoading = false;
      })
      .addCase(getMessagesThunk.pending, (state) => {
        state.messagesLoading = true;
      })
      .addCase(getMessagesThunk.rejected, (state) => {
        state.messagesLoading = false;
        state.messages = [];
      })
      .addCase(getMessagesThunk.fulfilled, (state, action) => {
        const { data } = action.payload;
        state.messages = data;
        state.messagesLoading = false;
      })

      // .addCase(sendMessageThunk.pending, (state) => {
      //   state.messagesLoading = true;
      // })
      // .addCase(sendMessageThunk.rejected, (state) => {
      //   state.messagesLoading = false;
      // })
      .addCase(sendMessageThunk.fulfilled, (state, action) => {
        const { data } = action.payload;
        state.messages.push(data);
        state.messagesLoading = false;
      });
  },
});

export const {
  setMessages,
  setUsers,
  setSelectedUser,
  addMessage,
  addUser,
  cleanChatSlice,
} = chatSlice.actions;

export default chatSlice.reducer;
