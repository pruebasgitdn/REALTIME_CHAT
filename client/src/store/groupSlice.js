import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosInstance } from "../lib/axios";
import { getSocket } from "../lib/socket";

const initialState = {
  groups: [],
  selectedGroup: null,
  groupMessages: [],
  loading: false,
  error: null,
};

export const getGroupMessagesThunk = createAsyncThunk(
  "groups/getGroupMessagesThunk",
  async (groupId, { rejectWithValue, dispatch }) => {
    try {
      const res = await axiosInstance.get(`/groups/get_messages/${groupId}`);
      dispatch(setGroupMessages(res.data.data));
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

export const sendRoomMessageThunk = createAsyncThunk(
  "groups/sendRoomMessageThunk",
  async (data, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(
        `/groups/send_message/${data?.groupId}`,
        data?.body
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

export const createGroupThunk = createAsyncThunk(
  "groups/createGroup",
  async (data, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/groups/create", data);

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

export const getMyGroupsThunk = createAsyncThunk(
  "groups/getMyGroups",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/groups/group_member");

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

export const leaveGroupThunk = createAsyncThunk(
  "groups/leaveGroupThunk",
  async ({ idRemove }, { rejectWithValue, dispatch }) => {
    try {
      const res = await axiosInstance.put(`/groups/leave_group/${idRemove}`);

      dispatch(removeExitGroup({ idRemove }));

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

export const unSubscribeToGroupMessages = createAsyncThunk(
  "groups/unSubscribeToMessages",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const selectedGroup = state.group.selectedGroup;

      if (!selectedGroup) return;

      const socket = getSocket();
      socket.off("newGroupMessage");
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: "Error desconocido",
        }
      );
    }
  }
);

export const setNewAdminThink = createAsyncThunk(
  "groups/newAdminThunk",
  async ({ group_id, body }, { rejectWithValue, dispatch }) => {
    try {
      const res = await axiosInstance.put(
        `/groups/new_admin_group/${group_id}`,
        body
      );

      dispatch(setSelectedGroup(res.data.data));

      return res.data;
    } catch (error) {
      console.log(error);
      return rejectWithValue(
        error.response?.data || {
          message: "Error desconocido",
        }
      );
    }
  }
);

export const editGroupImageThunk = createAsyncThunk(
  "groups/editGroupImageThunk",
  async ({ group_id, groupImage }, { rejectWithValue, dispatch }) => {
    try {
      const res = await axiosInstance.put(
        `/groups/edit_image/${group_id}`,
        groupImage
      );

      dispatch(updatedGroup(res.data.data));

      return res.data;
    } catch (error) {
      console.log(error);
      return rejectWithValue(
        error.response?.data || {
          message: "Error desconocido",
        }
      );
    }
  }
);

export const editGroupNameThunk = createAsyncThunk(
  "groups/editGroupNameThunk",
  async ({ group_id, groupName }, { rejectWithValue, dispatch }) => {
    try {
      const res = await axiosInstance.put(
        `/groups/edit_name/${group_id}`,
        groupName
      );

      dispatch(updatedGroup(res.data.data));

      return res.data;
    } catch (error) {
      console.log(error);
      return rejectWithValue(
        error.response?.data || {
          message: "Error desconocido",
        }
      );
    }
  }
);

export const deleteGroupThunk = createAsyncThunk(
  "groups/deleteGroupThunk",
  async ({ idRemove }, { rejectWithValue, dispatch }) => {
    try {
      const res = await axiosInstance.delete(
        `/groups/delete_group/${idRemove}`
      );

      dispatch(removeExitGroup({ idRemove }));

      return res.data;
    } catch (error) {
      console.log(error);
      return rejectWithValue(
        error.response?.data || {
          message: "Error desconocido",
        }
      );
    }
  }
);

export const setNewMembers = createAsyncThunk(
  "groups/setNewMembers",
  async ({ group_id, body }, { rejectWithValue, dispatch }) => {
    try {
      const res = await axiosInstance.put(
        `/groups/edit_members/${group_id}`,
        body
      );

      dispatch(setSelectedGroup(res.data.data));

      return res.data;
    } catch (error) {
      console.log(error);
      return rejectWithValue(
        error.response?.data || {
          message: "Error desconocido",
        }
      );
    }
  }
);

const groupSlice = createSlice({
  name: "groups",
  initialState: initialState,
  reducers: {
    //Despachado al iniciar sesion
    setGroups: (state, action) => {
      state.groups = action.payload;
    },

    setGroupMessages: (state, action) => {
      state.groupMessages = action.payload;
    },
    setSelectedGroup: (state, action) => {
      state.selectedGroup = action.payload;
    },
    addGroupMessage: (state, action) => {
      // state.groupMessages.push(action.payload);

      state.groupMessages = [...state.groupMessages, action.payload];
    },
    removeExitGroup: (state, action) => {
      const { idRemove } = action.payload;
      state.groups = state.groups.filter((g) => g._id != idRemove);

      if (
        state.selectedGroup &&
        String(state.selectedGroup?._id) == String(idRemove)
      ) {
        state.selectedGroup = null;
        state.groupMessages = [];
      }
    },
    addedtoGroup: (state, action) => {
      const group = action.payload;
      const exists = state.groups.some(
        (g) => String(g._id) === String(group._id)
      );
      if (!exists) {
        state.groups = [...state.groups, group];
      }
    },
    removedFromGroup: (state, action) => {
      const group = action.payload;
      const exists = state.groups.some(
        (g) => String(g._id) === String(group?._id)
      );
      if (exists) {
        state.groups = state.groups.filter(
          (g) => String(g._id) != String(group?._id)
        );

        //si lo tiene selected
        if (
          state.selectedGroup &&
          String(state.selectedGroup?._id) == String(group?._id)
        ) {
          state.selectedGroup = null;
          state.groupMessages = [];
        }
      }
    },
    updateMembers: (state, action) => {
      const { room_id, user_id } = action.payload;
      const group = state.groups.find((g) => g._id === room_id);
      if (group) {
        group.members = group.members.filter((id) => id !== user_id);
      }

      if (state.selectedGroup?._id === room_id) {
        state.selectedGroup = {
          ...state.selectedGroup,
          members: state.selectedGroup.members.filter((id) => id !== user_id),
        };
      }
    },
    updatedGroup: (state, action) => {
      const updatedGroup = action.payload;

      state.groups = state.groups.map((mp) =>
        mp._id === updatedGroup._id ? updatedGroup : mp
      );

      if (state.selectedGroup && state.selectedGroup._id == updatedGroup._id) {
        state.selectedGroup = updatedGroup;
      }
    },
    cleanGroupSlice: (state) => {
      state.groups = [];
      state.selectedGroup = null;
      state.groupMessages = [];
      state.loading = false;
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      .addCase(createGroupThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(createGroupThunk.rejected, (state) => {
        state.loading = false;
      })
      .addCase(createGroupThunk.fulfilled, (state, action) => {
        //setea al que lo crea en el form ya que al ser creador tambien es miembro por eso ahi se setea en los grupos
        // const { data } = action.payload;
        state.loading = false;
        // state.groups = [...state.groups, data];
      })
      .addCase(getGroupMessagesThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(getGroupMessagesThunk.rejected, (state) => {
        state.loading = false;
        state.groupMessages = [];
      })
      .addCase(getGroupMessagesThunk.fulfilled, (state) => {
        state.loading = false;
      })

      .addCase(getMyGroupsThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMyGroupsThunk.rejected, (state) => {
        state.loading = false;
      })
      .addCase(getMyGroupsThunk.fulfilled, (state, action) => {
        const { data } = action.payload;
        state.groups = data;
        state.loading = false;
      })
      .addCase(deleteGroupThunk.rejected, (state) => {
        state.loading = false;
      })
      .addCase(deleteGroupThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteGroupThunk.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(editGroupNameThunk.rejected, (state) => {
        state.loading = false;
      })
      .addCase(editGroupNameThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(editGroupNameThunk.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(setNewAdminThink.rejected, (state) => {
        state.loading = false;
      })
      .addCase(setNewAdminThink.pending, (state) => {
        state.loading = true;
      })
      .addCase(setNewAdminThink.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(editGroupImageThunk.rejected, (state) => {
        state.loading = false;
      })
      .addCase(editGroupImageThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(editGroupImageThunk.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(setNewMembers.rejected, (state) => {
        state.loading = false;
      })
      .addCase(setNewMembers.pending, (state) => {
        state.loading = true;
      })
      .addCase(setNewMembers.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(leaveGroupThunk.rejected, (state) => {
        state.loading = false;
      })
      .addCase(leaveGroupThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(leaveGroupThunk.fulfilled, (state) => {
        state.loading = false;
      });
  },
});

export const {
  setGroupMessages,
  addGroupMessage,
  setGroups,
  addGroup,
  setSelectedGroup,
  removeExitGroup,
  updateMembers,
  addedtoGroup,
  removedFromGroup,
  updatedGroup,
  cleanGroupSlice,
} = groupSlice.actions;

export default groupSlice.reducer;
