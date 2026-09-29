import axiosInstance from "@/pages/services/base-url";

export interface UserRequestData {
  id?: number;
  userId: string;
  employeeId: number;
  employeeCode: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  departmentId: number;
  designationId: number;
  branchIds: number[];
  roleId: number;
  accessibleModules?: number[];
  reportingManager?: number | null;
  dashboard?: string;
  language: string;
  timeZone?: string;
  loginType: string;
  passwordExpiry?: number | null;
  twoFactorAuthentication?: boolean;
  remarks?: string;
  status: boolean;
}

export interface UserFilters {
  search?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: string;
  status?: boolean;
  departmentId?: number;
  designationId?: number;
  branchId?: number;
  roleId?: number;
  employeeName?: string;
  fromDate?: string;
  toDate?: string;
}

export interface EmailExportPrompt {
  title: string;
  message: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface ExcelPreviewResponse {
  totalRows: number;
  validCount: number;
  invalidCount: number;
  duplicateCount: number;
  rows: ExcelRowResult[];
}

export interface ExcelRowResult {
  rowNumber: number;
  userId: string;
  employeeId: number | null;
  employeeCode: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  departmentName: string;
  designationName: string;
  branchIds: string;
  roleName: string;
  reportingManager: number | null;
  language: string;
  timeZone: string;
  loginType: string;
  passwordExpiry: number | null;
  twoFactorAuthentication: boolean | null;
  remarks: string;
  dashboard: string;
  accessibleModules: string;
  validationStatus: string;
  result: string;
  message: string;
}

export interface ExcelUploadResponse {
  totalRows: number;
  successCount: number;
  failureCount: number;
  errors: string[];
  successfulEmployeeCodes: string[];
}

export interface ExcelFailedRow {
  rowNumber: number;
  values: string[];
  failureReason: string;
}

export type StatusFilter =
  | "ALL"
  | "VALID"
  | "INCORRECT"
  | "INVALID"
  | "DUPLICATE";

export interface LoginResponse {
  token: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  role: string;
}

export interface UserInfo {
  username: string;
  roles: string[];
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  referenceId: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface UserHistory {
  id: number;
  action: string;
  employeeCode: string;
  userId: number;
  oldData: string | null;
  newData: string | null;
  performedAt: string;
  performedBy: string | null;
  performedByRole: string | null;
}

export interface Department {
  id: number;
  departmentName: string;
}

export interface Designation {
  id: number;
  designationName: string;
}

export interface Role {
  id: number;
  roleName: string;
}

export interface Branch {
  id: number;
  branchName: string;
}

export interface Module {
  id: number;
  moduleName: string;
}

export interface Employee {
  id: number;
  employeeCode: string;
  fullName: string;
}

const userHistoryCache = new Map<string, UserHistory[]>();

const userService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await axiosInstance.post("/auth/login", data);

    localStorage.setItem("token", response.data.token);

    return response.data;
  },

  register: async (data: RegisterRequest) => {
    const response = await axiosInstance.post("/auth/register", data);

    return response.data;
  },

  logout: () => {
    localStorage.removeItem("token");
  },

  downloadExportFile: async (id: string) => {
    const response = await axiosInstance.get(`/user/export/${id}/download`, {
      responseType: "blob",
    });
    return response.data;
  },

  getUserHistory: async (employeeCode: string, page: number, size: number) => {
    const response = await axiosInstance.get(
      `/user/history/${encodeURIComponent(employeeCode)}`,
      {
        params: {
          page,
          size,
        },
      },
    );

    return response.data;
  },
  invalidateUserHistory: (employeeCode: string) => {
    console.log("Invalidating history cache:", employeeCode);
    userHistoryCache.delete(employeeCode);
  },

  saveOrUpdateUsers: async (users: UserRequestData[]) => {
    const response = await axiosInstance.post("/user/save", users);
    users.forEach((user) => {
      if (user.employeeCode) {
        userHistoryCache.delete(user.employeeCode);
      }
    });
    return response.data;
  },

  getUserById: async (id: number) => {
    const response = await axiosInstance.get(`/user/${id}`);
    return response.data;
  },

  deleteUser: async (id: number) => {
    const response = await axiosInstance.delete(`/user/delete/${id}`);
    return response.data;
  },

  uploadAttachments: async (formData: FormData) => {
    const response = await axiosInstance.post("/user/attachments", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  getUsers: async (
    page: number = 0,
    size: number = 10,
    sortBy: string = "id",
    direction: string = "asc",
    search: string = "",
    status?: boolean,
    departmentId?: number,
    designationId?: number,
    roleId?: number,
    fromDate?: string,
    toDate?: string,
  ) => {
    const params: Record<string, unknown> = {
      page,
      size,
      sortBy,
      direction,
    };

    if (search.trim()) {
      params.search = search.trim();
    }

    if (status !== undefined) {
      params.status = status;
    }

    if (departmentId !== undefined) {
      params.departmentId = departmentId;
    }

    if (designationId !== undefined) {
      params.designationId = designationId;
    }

    if (roleId !== undefined) {
      params.roleId = roleId;
    }

    if (fromDate) {
      params.fromDate = fromDate;
    }

    if (toDate) {
      params.toDate = toDate;
    }

    const response = await axiosInstance.get("/user/list", { params });
    return response.data;
  },

  searchUsers: async (filter: UserFilters) => {
    const response = await axiosInstance.post("/user/search", filter);
    return response.data;
  },

  getUserStatusCount: async (param?: {
    fromDate?: string;
    toDate?: string;
  }) => {
    const response = await axiosInstance.get("/user/status-count", {
      params: param,
    });

    return response.data;
  },

  getUserDepartmentCount: async (param?: {
    dateFrom?: string;
    dateTo?: string;
  }) => {
    const response = await axiosInstance.get("/user/department-count");
    return response.data;
  },

  getDepartments: async () => {
    const response = await axiosInstance.get("/department/dropdown");
    return response.data.data;
  },

  getDesignations: async () => {
    const response = await axiosInstance.get("/designation/dropdown");
    return response.data.data;
  },

  getBranches: async () => {
    const response = await axiosInstance.get("/branch/dropdown");
    return response.data.data;
  },

  getRoles: async () => {
    const response = await axiosInstance.get("/role/dropdown");
    return response.data.data;
  },

  getModules: async () => {
    const response = await axiosInstance.get("/module/dropdown");
    return response.data.data;
  },

  getEmployees: async () => {
    const response = await axiosInstance.get("/employee/list");
    return response.data.data;
  },

  getNotifications: async (page: number = 0, size: number = 10) => {
    const response = await axiosInstance.get("/notification", {
      params: { page, size },
    });
    const data = response.data;
    return {
      ...data,
      content: (data?.content ?? []).map((notification: any) => ({
        ...notification,
        isRead: notification.read,
      })),
    };
  },

  getUnreadNotificationCount: async () => {
    const response = await axiosInstance.get("/notification/unread-count");
    return response.data ?? 0;
  },

  markNotificationAsRead: async (id: number) => {
    const response = await axiosInstance.put(`/notification/${id}/read`);
    return response.data;
  },

  uploadExcel: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosInstance.post("/user/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  previewExcel: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosInstance.post(
      "/user/preview-upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data;
  },

  downloadExcel: async (filter: UserFilters) => {
    const response = await axiosInstance.get("/user/download", {
      params: filter,
      responseType: "arraybuffer",
    });

    return response;
  },

  sendExcelByEmail: async (filter: UserFilters) => {
    const response = await axiosInstance.post("/user/download/email", {
      fromDate: filter.fromDate,
      toDate: filter.toDate,
      status: filter.status === undefined ? undefined : String(filter.status),
      department: filter.departmentId,
      designation: filter.designationId,
      branch: filter.branchId,
      role: filter.roleId,
      employeeName: filter.employeeName,
      globalSearch: filter.search,
    });

    return response.data;
  },

  downloadTemplate: async () => {
    const response = await axiosInstance.get("/user/download-template", {
      responseType: "blob",
    });

    return response.data;
  },
};

export default userService;
