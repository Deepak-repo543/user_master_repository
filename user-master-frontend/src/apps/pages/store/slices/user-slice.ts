import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import axiosInstance from "@/pages/services/base-url";
import type { UserRequest } from "@/pages/services/user-type";
export interface User {
  id: number;
  userId?: string;
  employeeId?: number;
  employeeCode?: string;
  fullName?: string;
  name?: string;
  email?: string;
  mobileNumber?: string;
  phoneNumber?: string;
  departmentId?: number;
  departmentName?: string;
  designationId?: number;
  designationName?: string;
  branchIds?: number[];
  branches?: string[];
  roleId?: number;
  roleName?: string;
  reportingManager?: number;
  profileImageOriginalName?: string;
  digitalSignatureOriginalName?: string;
  dashboard?: string;
  accessibleModules?: number[];
  language?: string;
  timeZone?: string;
  loginType?: string;
  passwordExpiry?: number;
  twoFactorAuthentication?: boolean;
  profileImage?: string;
  digitalSignature?: string;
  remarks?: string;
  status?: boolean;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
  error?: any;
}

export interface UserPage {
  content: User[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

interface UserStatusCount {
  activeCount: number;
  inactiveCount: number;
  totalCount: number;
}

export interface GetUsersParams {
  search?: string;
  status?: boolean | null;
  departmentId?: number | null;
  designationId?: number | null;
  roleId?: number | null;
  branch?: string | null;
  employeeName?: string | null;
  fromDate?: string;
  toDate?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: "asc" | "desc";
}

interface UserState {
  users: User[];
  singleUser: User | null;
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalElements: number;
  totalUsers: number;
  pageSize: number;
  statusCount: {
    activeCount: number;
    inactiveCount: number;
    totalCount: number;
  };
}

const initialState: UserState = {
  users: [],
  singleUser: null,
  loading: false,
  error: null,
  currentPage: 0,
  totalPages: 0,
  totalElements: 0,
  totalUsers: 0,
  pageSize: 10,
  statusCount: {
    activeCount: 0,
    inactiveCount: 0,
    totalCount: 0,
  },
};

export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (params: GetUsersParams = {}, { rejectWithValue, requestId }) => {
    try {
      console.log("LIST THUNK START:", requestId, params);

      const {
        search = "",
        status = null,
        departmentId = null,
        designationId = null,
        roleId = null,
        page = 0,
        size = 10,
        sortBy = "id",
        direction = "asc",
        fromDate = null,
        toDate = null,
      } = params;

      const response = await axiosInstance.get<ApiResponse<UserPage>>(
        "/user/list",
        {
          params: {
            search: search || undefined,
            status: status ?? undefined,
            departmentId: departmentId ?? undefined,
            designationId: designationId ?? undefined,
            roleId: roleId ?? undefined,
            page,
            size,
            sortBy,
            direction,
            fromDate: fromDate ?? undefined,
            toDate: toDate ?? undefined,
          },
        },
      );

      console.log("LIST THUNK SUCCESS:", requestId);

      return response.data.data;
    } catch (error: any) {
      console.log("LIST THUNK ERROR:", requestId, error);

      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch users",
      );
    }
  },
);

export const searchUsers = createAsyncThunk(
  "users/searchUsers",
  async (params: GetUsersParams = {}, { rejectWithValue, requestId }) => {
    try {
      console.log("SEARCH THUNK START:", requestId, params);

      const {
        search = "",
        status = null,
        departmentId = null,
        designationId = null,
        roleId = null,
        branch = null,
        employeeName = null,
        fromDate = "",
        toDate = "",
        page = 0,
        size = 10,
        sortBy = "id",
        direction = "asc",
      } = params;

      const response = await axiosInstance.post<ApiResponse<UserPage>>(
        "/user/search",
        {
          search: search.trim() || null,
          status,
          departmentId,
          designationId,
          roleId,
          branch: branch?.trim() || null,
          employeeName: employeeName?.trim() || null,
          fromDate: fromDate || null,
          toDate: toDate || null,
          page,
          size,
          sortBy,
          direction,
        },
      );

      console.log("SEARCH THUNK SUCCESS:", requestId);

      return response.data.data;
    } catch (error: any) {
      console.log("SEARCH THUNK ERROR:", requestId, error);

      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to search users",
      );
    }
  },
);

export const fetchUserById = createAsyncThunk(
  "users/fetchUserById",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<ApiResponse<User>>(
        `/user/${id}`,
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch user",
      );
    }
  },
);

export const createUser = createAsyncThunk(
  "users/createUser",
  async (userData: UserRequest[], { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post<ApiResponse<User[]>>(
        "/user/save-or-update",
        userData,
      );

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to save users",
      );
    }
  },
);

export const updateUser = createAsyncThunk(
  "users/updateUser",
  async (userData: UserRequest, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post<ApiResponse<User[]>>(
        "/user/save-or-update",
        [userData],
      );

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update user",
      );
    }
  },
);

export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (id: number, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/user/delete/${id}`);
      return { id };
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to delete user",
      );
    }
  },
);

export const uploadProfileImage = createAsyncThunk(
  "users/uploadProfileImage",
  async (
    { userId, file }: { userId: number; file: File },
    { rejectWithValue },
  ) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await axiosInstance.post(
        `/user/${userId}/profile-image`,
        formData,
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to upload profile image",
      );
    }
  },
);

export const uploadDigitalSignature = createAsyncThunk(
  "users/uploadDigitalSignature",
  async (
    { userId, file }: { userId: number; file: File },
    { rejectWithValue },
  ) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await axiosInstance.post(
        `/user/${userId}/digital-signature`,
        formData,
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to upload digital signature",
      );
    }
  },
);

export const fetchUserStatusCount = createAsyncThunk(
  "users/fetchUserStatusCount",
  async (
    params: { fromDate?: string; toDate?: string } | undefined,
    { rejectWithValue },
  ) => {
    try {
      const response =
        await axiosInstance.get<ApiResponse<UserStatusCount>>(
          "/user/status-count",
          { params },
        );
      const data = response.data.data;
      return {
        activeCount: Number(data?.activeCount ?? 0),
        inactiveCount: Number(data?.inactiveCount ?? 0),
        totalCount: Number(
          data?.totalCount ??
            Number(data?.activeCount ?? 0) + Number(data?.inactiveCount ?? 0),
        ),
      };
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch user status count",
      );
    }
  },
);

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },

    clearUsers: (state) => {
      state.users = [];
      state.currentPage = 0;
      state.totalPages = 0;
      state.totalElements = 0;
    },

    clearSingleUser: (state) => {
      state.singleUser = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchUsers.fulfilled,
        (state, action: PayloadAction<UserPage>) => {
          state.loading = false;

          const data = action.payload;

          console.log("FETCH USERS FULFILLED:", data);

          state.users = data?.content ?? [];
          state.currentPage = data?.number ?? 0;
          state.totalPages = data?.totalPages ?? 0;
          state.totalElements = data?.totalElements ?? 0;
          state.pageSize = data?.size ?? 10;
        },
      )
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;

        console.log("FETCH USERS REJECTED:", action.payload, action.error);

        state.error =
          (action.payload as string) ||
          action.error.message ||
          "Failed to fetch users";
      })
      .addCase(
        searchUsers.fulfilled,
        (state, action: PayloadAction<UserPage>) => {
          state.loading = false;

          const data = action.payload;

          console.log("SEARCH USERS FULFILLED:", data);

          state.users = data?.content ?? [];
          state.currentPage = data?.number ?? 0;
          state.totalPages = data?.totalPages ?? 0;
          state.totalElements = data?.totalElements ?? 0;
          state.pageSize = data?.size ?? 10;
        },
      )
      .addCase(searchUsers.rejected, (state, action) => {
        state.loading = false;

        console.log("SEARCH USERS REJECTED:", action.payload, action.error);

        state.error =
          (action.payload as string) ||
          action.error.message ||
          "Failed to search users";
      })

      // SEARCH USERS
      .addCase(searchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      });

    builder
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchUserById.fulfilled,
        (state, action: PayloadAction<User>) => {
          state.loading = false;
          state.singleUser = action.payload;
        },
      )
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.singleUser = null;
        state.error =
          (action.payload as string) ||
          action.error.message ||
          "Failed to fetch user";
      });

    builder
      .addCase(uploadProfileImage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadProfileImage.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(uploadProfileImage.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || "Failed to upload profile image";
      });

    builder
      .addCase(uploadDigitalSignature.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadDigitalSignature.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(uploadDigitalSignature.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || "Failed to upload digital signature";
      });

    builder
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })

      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ||
          action.error.message ||
          "Failed to create user";
      });

    builder
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(updateUser.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })

      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ||
          action.error.message ||
          "Failed to update user";
      });

    builder
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(deleteUser.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ||
          action.error.message ||
          "Failed to delete user";
      });

    builder
      .addCase(fetchUserStatusCount.fulfilled, (state, action) => {
        const active = Number(action.payload.activeCount ?? 0);
        const inactive = Number(action.payload.inactiveCount ?? 0);
        const total = Number(action.payload.totalCount ?? active + inactive);
        state.statusCount = {
          activeCount: active,
          inactiveCount: inactive,
          totalCount: total,
        };
        state.totalUsers = total;
        state.error = null;
      })

      .addCase(fetchUserStatusCount.rejected, (state, action) => {
        state.statusCount = {
          activeCount: 0,
          inactiveCount: 0,
          totalCount: 0,
        };

        state.error =
          (action.payload as string) ||
          action.error.message ||
          "Failed to fetch status count";
      });
  },
});

export const { clearError, clearUsers, clearSingleUser } = userSlice.actions;
export default userSlice.reducer;
