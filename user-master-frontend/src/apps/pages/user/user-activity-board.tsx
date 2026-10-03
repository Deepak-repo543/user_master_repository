import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/pages/store/store";
import { Box, Chip, Drawer, Snackbar, Fab, Grid, IconButton, Tooltip, Typography, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Alert, } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import dayjs from "dayjs";
import HowToRegRoundedIcon from "@mui/icons-material/HowToRegRounded";
import PersonOffRoundedIcon from "@mui/icons-material/PersonOffRounded";
import UserDownloadExcel from "@mui/icons-material/DownloadingTwoTone";
import UserTemplateButton from "@mui/icons-material/DescriptionTwoTone";
import type { MRT_ColumnDef } from "material-react-table";
import { mapToApiFilters } from "@/components/user-excel-download";
import userService, { Employee } from "@/pages/user/api";
import { useUser } from "@/pages/hooks/useUser";
import ReactMaterialTable from "@/components/react-material-table";
import AddUserForm from "@/pages/user/add-form";
import UpdateUserForm from "@/pages/user/update-form";
import { type User } from "@/pages/store/slices/user-slice";
import UserActiveFilters from "@/components/user-active-filters";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import UserHistoryDialog from "@/components/UserHistoryDialog";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";

import {
  setUserFilters,
  applyUserFilters,
  applyUserFiltersWithStatus,
  clearUserFilters,
  getDefaultDateRange,
} from "../store/slices/user-filter-slice";
import UserSearchFilters, { type FilterConfig, type FilterKey, } from "@/pages/user/user-search-filters";
import UserOverviewStats, { type StatConfig, } from "@/components/user-overview";
import UserExcelUpload from "@/components/user-excel-upload";

interface Branch {
  id: number;
  branchName: string;
}

interface Module {
  id: number;
  moduleName: string;
}

const UserActivityBoard = () => {
  const {
    users,
    error: reduxError,
    totalElements,
    statusCount,
    getUsers,
    searchUsers,
    deleteUser,
    getUserStatusCount,
    clearSingleUser,
  } = useUser();

  const dispatch = useDispatch<AppDispatch>();
  const filters = useSelector(
    (state: RootState) => state.userFilter.filters,
  );

  const appliedFilters = useSelector(
    (state: RootState) => state.userFilter.appliedFilters,
  );

  const userList = Array.isArray(users) ? users : [];
  const [openUserForm, setOpenUserForm] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | undefined>(undefined,);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [emailDialogTitle, setEmailDialogTitle] = useState("");
  const [historyEmployeeCode, setHistoryEmployeeCode] = useState<string | null>(null,);
  const [departments, setDepartments] = useState<{ id: number; departmentName: string }[]>([]);
  const [designations, setDesignations] = useState<{ id: number; designationName: string }[]>([]);
  const [roles, setRoles] = useState<{ id: number; roleName: string }[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [emailSuccessTitle, setEmailSuccessTitle] = useState("");
  const [errorDialogMessage, setErrorDialogMessage] = useState("");
  const [modules, setModules] = useState<Module[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [emailSuccessDialogOpen, setEmailSuccessDialogOpen] = useState(false);
  const [emailSuccessMessage, setEmailSuccessMessage] = useState("");
  const [cardClickKey, setCardClickKey] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openExcelUpload, setOpenExcelUpload] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [excelSuccessMessage, setExcelSuccessMessage] = useState("");
  const [emailDialogMessage, setEmailDialogMessage] = useState("");
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [sortBy, setSortBy] = useState("id");
  const [direction, setDirection] = useState<"asc" | "desc">("asc");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "error", });
  const [previewFile, setPreviewFile] = useState<{ url: string; name: string; type: "profile" | "signature"; } | null>(null);
  const [statsViewMode, setStatsViewMode] = useState<"asPerDate" | "sinceBeginning">("asPerDate");
  const [selectedStatCard, setSelectedStatCard] = useState<string | null>("false");
  const statsViewModeRef = useRef(statsViewMode);
  const [tableRefreshKey, setTableRefreshKey] = useState(0);
  const fetchModeRef = useRef<"list" | "search">("list");



  const openPreview = (
    value: string,
    originalName: string | undefined,
    type: "profile" | "signature"
  ) => {
    if (!value) return;
    setPreviewFile({
      url: `/uploads/${value}`,
      name:
        originalName ||
        value.split("/").pop() ||
        (type === "profile" ? "profile-image" : "digital-signature"),
      type,
    });
  };

  const handleDownload = async () => {
    if (!previewFile) return;
    try {
      const response = await fetch(previewFile.url);
      if (!response.ok) {
        throw new Error("Download failed");
      }
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = previewFile.name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const handleHardRefresh = () => {
    statsViewModeRef.current = "asPerDate";
    setStatsViewMode("asPerDate");
    setPage(0);
    setTableRefreshKey((prev) => prev + 1);
  };

  const handleHistoryOpen = (employeeCode: string) => {
    setHistoryEmployeeCode(employeeCode);
    setHistoryOpen(true);
  };

  const handleStatsViewModeChange = (
    mode: "asPerDate" | "sinceBeginning"
  ) => {
    statsViewModeRef.current = mode;
    setStatsViewMode(mode);

    if (mode === "sinceBeginning") {
      setSelectedStatCard(null);
      return;
    }

    setSelectedStatCard("false");
    dispatch(applyUserFiltersWithStatus("false"));
    fetchModeRef.current = "list";
    setPage(0);
    setTableRefreshKey((prev) => prev + 1);
  };

  const handleExcelDownload = async () => {
    try {
      const apiFilters = mapToApiFilters(appliedFilters);
      const response = await userService.downloadExcel(apiFilters);
      const contentType = String(
        response.headers["content-type"] || "",
      ).toLowerCase();
      if (contentType.includes("application/json")) {
        const text = new TextDecoder().decode(response.data);
        const data = JSON.parse(text);
        if (data?.data?.title && data?.data?.message) {
          setEmailDialogTitle(data.data.title);
          setEmailDialogMessage(data.data.message);
          setEmailDialogOpen(true);
          return;
        }
        setErrorDialogMessage(
          data?.message || "Download failed.",
        );
        setErrorDialogOpen(true);
        return;
      }
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      const now = new Date();
      const timestamp =
        `${now.getFullYear()}` +
        `${String(now.getMonth() + 1).padStart(2, "0")}` +
        `${String(now.getDate()).padStart(2, "0")}_` +
        `${String(now.getHours()).padStart(2, "0")}` +
        `${String(now.getMinutes()).padStart(2, "0")}` +
        `${String(now.getSeconds()).padStart(2, "0")}`;
      const fileName = `user_master_export_${timestamp}.xlsx`;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Excel download failed:", error);
      setErrorDialogMessage("Download failed.");
      setErrorDialogOpen(true);
    }
  };

  const handleEmailExport = async () => {
    try {
      setEmailLoading(true);
      const apiFilters = mapToApiFilters(appliedFilters);
      const response = await userService.sendExcelByEmail(apiFilters);

      setEmailDialogOpen(false);
      setEmailSuccessTitle(response?.data?.title || "Success");
      setEmailSuccessMessage(response?.data?.message || "Excel has been sent to your email.");
      setEmailSuccessDialogOpen(true);
      window.dispatchEvent(new Event("notification-updated"));
    } catch (error) {
      console.error("Email export failed:", error);
      alert("Failed to send Excel by email.");
    } finally {
      setEmailLoading(false);
    }
  };

  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const roleName = String(userData.role || userData.roleName || "").toUpperCase().replace("ROLE_", "");
  const canEditOrAdd = ["ADMIN", "MANAGEMENT", "HOD"].includes(roleName);
  const canDelete = roleName === "ADMIN";
  const canUpload = ["ADMIN", "HOD"].includes(roleName);
  const canExport = ["ADMIN", "MANAGEMENT", "HOD"].includes(roleName);
  const maxDate = dayjs().format("YYYY-MM-DD");
  const minDate = "";

  const showNotAuthorized = useCallback((message: string) => {
    setSnackbar({ open: true, message, severity: "error" });
  }, []);

  const handleOpenUserForm = useCallback(
    (userId?: number) => {
      if (!canEditOrAdd) {
        showNotAuthorized("You are not authorized to perform this action.");
        return;
      }
      if (userId === undefined) clearSingleUser();
      setSelectedUserId(userId);
      setOpenUserForm(true);
    },
    [clearSingleUser, canEditOrAdd, showNotAuthorized],
  );

  const handleDeleteClick = useCallback(
    (user: User) => {
      if (!canDelete) {
        showNotAuthorized("You are not authorized to delete users.");
        return;
      }
      setUserToDelete(user.id);
      setDeleteDialogOpen(true);
    },
    [canDelete, showNotAuthorized],
  );

  const handleCloseUserForm = useCallback(() => {
    setOpenUserForm(false);
    setSelectedUserId(undefined);
  }, []);

  const handleDeleteCancel = useCallback(() => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  }, []);

  const handlePageChange = useCallback(
    (newPage: number, newRowsPerPage: number) => {
      setPage(newPage);
      setRowsPerPage(newRowsPerPage);
    },
    [],
  );

  const handleOpenHistory = (employeeCode: string) => {
    if (!employeeCode) return;
    setHistoryEmployeeCode(employeeCode);
    setHistoryOpen(true);
  };

  const handleCloseHistory = () => {
    setHistoryOpen(false);
    setHistoryEmployeeCode(null);
  };

  const handleRowsPerPageChange = useCallback((value: number) => {
    setRowsPerPage(value);
    setPage(0);
  }, []);

  const handleSortChange = useCallback(
    (newSortBy: string, newDirection: "asc" | "desc") => {
      setSortBy(newSortBy);
      setDirection(newDirection);
      setPage(0);
    },
    [],
  );

  const employeeNameOptions = useMemo(
    () =>
      [
        ...new Set(
          userList
            .map((user: any) => user.fullName || user.name)
            .filter(Boolean),
        ),
      ].map((name) => ({
        label: String(name),
        value: String(name),
      })),
    [userList],
  );

  const selectedUser = useMemo(
    () => users.find((user) => user.id === selectedUserId) || null,
    [users, selectedUserId],
  );

  const departmentOptions = useMemo(
    () =>
      departments
        .filter((d) => d.departmentName)
        .map((d) => ({
          label: d.departmentName,
          value: String(d.id),
        })),
    [departments],
  );

  const designationOptions = useMemo(
    () =>
      designations
        .filter((d) => d.designationName)
        .map((d) => ({
          label: d.designationName,
          value: String(d.id),
        })),
    [designations],
  );

  const branchOptions = useMemo(
    () =>
      branches
        .filter((b) => b.branchName)
        .map((b) => ({
          label: b.branchName,
          value: String(b.id),
        })),
    [branches],
  );

  const roleOptions = useMemo(
    () =>
      roles
        .filter((r) => r.roleName)
        .map((r) => ({
          label: r.roleName,
          value: String(r.id),
        })),
    [roles],
  );

  const filterFields: FilterConfig[] = useMemo(
    () => [
      {
        label: "Employee Name",
        key: "employeeName",
        type: "autocomplete",
        options: employeeNameOptions,
        placeholder: "Search employee...",
      },
      {
        label: "Department",
        key: "department",
        type: "select",
        options: departmentOptions,
      },
      {
        label: "Designation",
        key: "designation",
        type: "select",
        options: designationOptions,
      },
      {
        label: "Branch",
        key: "branch",
        type: "select",
        options: branchOptions,
      },
      {
        label: "Role",
        key: "role",
        type: "select",
        options: roleOptions,
      },
      {
        label: "Status",
        key: "status",
        type: "select",
        options: [
          { label: "Active", value: "false" },
          { label: "Inactive", value: "true" },
        ],
      },
    ],
    [
      employeeNameOptions,
      departmentOptions,
      designationOptions,
      branchOptions,
      roleOptions,
    ],
  );

  const userColumns = useMemo<MRT_ColumnDef<User>[]>(
    () => [
      {
        id: "actions",
        header: "Actions",
        size: 100,
        enableSorting: false,
        enableColumnFilter: false,
        enableColumnActions: false,
        muiTableHeadCellProps: {
          align: "center",
          sx: {
            position: "sticky",
            left: 0,
            zIndex: 4,
            backgroundColor: "#191970",
            color: "#FFFFFF",
            textAlign: "center",
          },
        },

        muiTableBodyCellProps: {
          align: "center",
          sx: {
            position: "sticky",
            left: 0,
            zIndex: 3,
            backgroundColor: "#FFFFFF",
            textAlign: "center",
          },
        },
        Cell: ({ row }) => {
          const user = row.original;
          const isInactive = user.status === true;

          return (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 0.3,
              }}
            >
              <Tooltip title="Edit">
                <IconButton
                  size="small"
                  onClick={() => handleOpenUserForm(user.id)}
                  sx={{
                    width: 28,
                    height: 28,
                    color: "#2563EB",
                    "&:hover": {
                      bgcolor: "#EFF6FF",
                    },
                  }}
                >
                  <EditIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>

              <Tooltip title="Delete">
                <IconButton
                  size="small"
                  onClick={() => handleDeleteClick(user)}
                  disabled={isInactive}
                  sx={{
                    width: 28,
                    height: 28,
                    color: "#DC2626",
                    "&:hover": {
                      bgcolor: "#FEF2F2",
                    },
                  }}
                >
                  <DeleteIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </Box>
          );
        },
      },
      {
        accessorKey: "userId",
        header: "User ID",
        size: 130,
        Cell: ({ cell }) => (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
            }}
          >
            {cell.getValue<string>() || "N/A"}
          </Box>
        ),
      },
      {
        accessorKey: "employeeId",
        header: "Employee ID",
        size: 160,
        Cell: ({ cell }) => (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
            }}
          >
            {cell.getValue<number>() ?? "N/A"}
          </Box>
        ),
      },
      {
        accessorKey: "employeeCode",
        header: "Employee Code",
        size: 180,
        Cell: ({ cell }) => {
          const employeeCode = cell.getValue<string>();

          return (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
              }}
            >
              {employeeCode ? (
                <Button
                  variant="text"
                  size="small"
                  onClick={() => handleOpenHistory(employeeCode)}
                  sx={{
                    minWidth: "auto",
                    padding: "2px 6px",
                    textTransform: "none",
                    fontWeight: 600,
                    borderRadius: "6px",
                  }}
                >
                  {employeeCode}
                </Button>
              ) : (
                "N/A"
              )}
            </Box>
          );
        },
      },
      {
        accessorKey: "fullName",
        header: "Full Name",
        size: 140,
        Cell: ({ cell }) => {
          const value = cell.getValue<string>();

          return (
            <Tooltip title={value || ""}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                {value || "N/A"}
              </Box>
            </Tooltip>
          );
        },
      },
      {
        accessorKey: "email",
        header: "Email",
        size: 190,
        Cell: ({ cell }) => {
          const value = cell.getValue<string>();

          return (
            <Tooltip title={value || ""}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                {value || "N/A"}
              </Box>
            </Tooltip>
          );
        },
      },
      {
        accessorKey: "mobileNumber",
        header: "Mobile Number",
        size: 160,
        Cell: ({ cell }) => {
          const value = cell.getValue<string>();
          const row = cell.row.original;

          return (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
              }}
            >
              {value || row.phoneNumber || "N/A"}
            </Box>
          );
        },
      },
      {
        accessorKey: "departmentName",
        header: "Department",
        size: 170,
        Cell: ({ cell }) => (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
            }}
          >
            {cell.getValue<string>() || "N/A"}
          </Box>
        ),
      },
      {
        accessorKey: "designationName",
        header: "Designation",
        size: 190,
        Cell: ({ cell }) => (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
            }}
          >
            {cell.getValue<string>() || "N/A"}
          </Box>
        ),
      },
      {
        accessorKey: "roleName",
        header: "Role",
        size: 130,
        Cell: ({ cell }) => (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
            }}
          >
            {cell.getValue<string>() || "N/A"}
          </Box>
        ),
      },
      {
        accessorKey: "branchNames",
        header: "Branches",
        size: 166,
        enableSorting: false,
        Cell: ({ cell }) => {
          const branchNames = cell.getValue<string[]>() || [];
          const count = branchNames.length;
          const displayNames = branchNames.join(", ");

          return (
            <Tooltip title={displayNames || "No branches"}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                  flexDirection: "column",
                }}
              >
                <Chip
                  label={`${count} Branch${count > 1 ? "es" : ""}`}
                  size="small"
                  sx={{
                    height: 22,
                    minWidth: 70,
                    fontSize: "0.6rem",
                    fontWeight: 600,
                    bgcolor: count > 0 ? "#EFF6FF" : "#F3F4F6",
                    color: count > 0 ? "#2563EB" : "#6B7280",
                  }}
                />

                {displayNames && (
                  <Typography
                    sx={{
                      fontSize: "0.6rem",
                      color: "#64748B",
                      mt: 0.3,
                      maxWidth: 150,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      textAlign: "center",
                    }}
                  >
                    {displayNames}
                  </Typography>
                )}
              </Box>
            </Tooltip>
          );
        },
      },
      {
        accessorKey: "moduleNames",
        header: "Modules",
        size: 170,
        enableSorting: false,
        Cell: ({ cell }) => {
          const moduleNames = cell.getValue<string[]>() || [];
          const count = moduleNames.length;
          const displayNames = moduleNames.join(", ");

          return (
            <Tooltip title={displayNames || "No modules"}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                  flexDirection: "column",
                }}
              >
                <Chip
                  label={`${count} Module${count > 1 ? "s" : ""}`}
                  size="small"
                  sx={{
                    height: 22,
                    minWidth: 70,
                    fontSize: "0.6rem",
                    fontWeight: 600,
                    bgcolor: count > 0 ? "#F0FDF4" : "#F3F4F6",
                    color: count > 0 ? "#15803D" : "#6B7280",
                  }}
                />

                {displayNames && (
                  <Typography
                    sx={{
                      fontSize: "0.6rem",
                      color: "#64748B",
                      mt: 0.3,
                      maxWidth: 150,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      textAlign: "center",
                    }}
                  >
                    {displayNames}
                  </Typography>
                )}
              </Box>
            </Tooltip>
          );
        },
      },
      {
        accessorKey: "createdBy",
        header: "Created By",
        size: 150,
        Cell: ({ cell }) => (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
            }}
          >
            {cell.getValue<string>() || "N/A"}
          </Box>
        ),
      },
      {
        accessorKey: "updatedBy",
        header: "Updated By",
        size: 150,
        Cell: ({ cell }) => (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
            }}
          >
            {cell.getValue<string>() || "N/A"}
          </Box>
        ),
      },
      {
        accessorKey: "reportingManager",
        header: "Reporting Manager",
        size: 220,
        Cell: ({ cell }) => (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
            }}
          >
            {cell.getValue<number>()
              ? String(cell.getValue<number>())
              : "N/A"}
          </Box>
        ),
      },
      {
        accessorKey: "language",
        header: "Language",
        size: 130,
        Cell: ({ cell }) => (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
            }}
          >
            {cell.getValue<string>() || "English"}
          </Box>
        ),
      },
      {
        accessorKey: "timeZone",
        header: "Time Zone",
        size: 150,
        Cell: ({ cell }) => (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
            }}
          >
            {cell.getValue<string>() || "N/A"}
          </Box>
        ),
      },
      {
        accessorKey: "loginType",
        header: "Login Type",
        size: 160,
        Cell: ({ cell }) => {
          const value = cell.getValue<string>();

          return (
            <Chip
              label={value || "Password"}
              size="small"
              sx={{
                height: 22,
                minWidth: 70,
                fontSize: "0.6rem",
                fontWeight: 600,
                bgcolor: value === "SSO" ? "#DBEAFE" : "#F3F4F6",
                color: value === "SSO" ? "#1E40AF" : "#4B5563",
              }}
            />
          );
        },
      },
      {
        accessorKey: "passwordExpiry",
        header: "Password Expiry",
        size: 180,
        Cell: ({ cell }) => {
          const value = cell.getValue<number>();

          return (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
              }}
            >
              {value !== undefined && value !== null ? `${value}d` : "N/A"}
            </Box>
          );
        },
      },
      {
        accessorKey: "twoFactorAuthentication",
        header: "2FA",
        size: 130,
        Cell: ({ cell }) => {
          const value = cell.getValue<boolean>();

          return (
            <Chip
              label={value ? "Enabled" : "Disabled"}
              size="small"
              sx={{
                height: 22,
                minWidth: 70,
                fontSize: "0.55rem",
                fontWeight: 600,
                bgcolor: value ? "#DCFCE7" : "#FEE2E2",
                color: value ? "#15803D" : "#B91C1C",
              }}
            />
          );
        },
      },
      {
        accessorKey: "profileImage",
        header: "Profile Image",
        size: 150,
        muiTableBodyCellProps: {
          align: "center",
        },

        Cell: ({ cell, row }) => {
          const value = cell.getValue<string>();
          const originalName = row.original.profileImageOriginalName;

          if (!value) {
            return (
              <Chip
                label="N/A"
                size="small"
                sx={{
                  height: 22,
                  borderRadius: "4px",
                  fontSize: "0.65rem",
                  fontWeight: 600,
                  bgcolor: "#F3F4F6",
                  color: "#9CA3AF",
                }}
              />
            );
          }

          const imageUrl = `/uploads/${value}`;

          return (
            <Tooltip title="Click to preview" arrow>
              <Box
                onClick={() => openPreview(value, originalName, "profile")}
                sx={{
                  width: "40px !important",
                  minWidth: "40px !important",
                  maxWidth: "40px !important",
                  height: "40px !important",
                  display: "inline-flex !important",
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: "1.5px solid #E5E7EB",
                  bgcolor: "#F9FAFB",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  margin: "0 auto",
                  transition: "all 0.2s ease",

                  "&:hover": {
                    transform: "scale(1.1)",
                    borderColor: "#6D28D9",
                    boxShadow: "0 3px 10px rgba(109, 40, 217, 0.2)",
                  },

                  "& img": {
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  },
                }}
              >
                <img
                  src={imageUrl}
                  alt="Profile"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </Box>
            </Tooltip>
          );
        },
      },

      {
        accessorKey: "digitalSignature",
        header: "Digital Signature",
        size: 180,
        muiTableBodyCellProps: {
          align: "center",
        },

        Cell: ({ cell, row }) => {
          const value = cell.getValue<string>();
          const originalName = row.original.digitalSignatureOriginalName;

          if (!value) {
            return (
              <Chip
                label="N/A"
                size="small"
                sx={{
                  height: 22,
                  borderRadius: "4px",
                  fontSize: "0.65rem",
                  fontWeight: 600,
                  bgcolor: "#F3F4F6",
                  color: "#9CA3AF",
                }}
              />
            );
          }

          const imageUrl = `/uploads/${value}`;

          return (
            <Tooltip title="Click to preview" arrow>
              <Box
                onClick={() => openPreview(value, originalName, "signature")}
                sx={{
                  width: "110px !important",
                  minWidth: "90px !important",
                  maxWidth: "90px !important",
                  height: "34px !important",
                  display: "inline-flex !important",
                  borderRadius: "6px",
                  border: "1px solid #E2E8F0",
                  bgcolor: "#FFFFFF",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  padding: "2px 6px",
                  cursor: "pointer",
                  margin: "0 auto",
                  boxShadow: "0 1px 2px rgba(0, 0, 0, 0.03)",
                  transition: "all 0.2s ease",

                  "&:hover": {
                    transform: "translateY(-1px)",
                    borderColor: "#6D28D9",
                    boxShadow: "0 4px 10px rgba(109, 40, 217, 0.12)",
                  },

                  "& img": {
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                    transform: "scale(1.15)",
                  },
                }}
              >
                <img src={imageUrl} alt="Digital Signature" />
              </Box>
            </Tooltip>
          );
        },
      },
      {
        accessorKey: "remarks",
        header: "Remarks",
        size: 130,
        Cell: ({ cell }) => {
          const value = cell.getValue<string>();

          return (
            <Tooltip title={value || ""}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                {value || "N/A"}
              </Box>
            </Tooltip>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        size: 110,
        Cell: ({ cell }) => {
          const status = cell.getValue<boolean>();

          return (
            <Chip
              label={status ? "Inactive" : "Active"}
              size="small"
              sx={{
                height: 22,
                minWidth: 70,
                fontSize: "0.6rem",
                fontWeight: 700,
                bgcolor: status ? "#FEE2E2" : "#DCFCE7",
                color: status ? "#B91C1C" : "#15803D",
              }}
            />
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Created At",
        size: 160,
        Cell: ({ cell }) => {
          const value = cell.getValue<string>();

          if (!value) {
            return (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                N/A
              </Box>
            );
          }

          try {
            const date = new Date(value);
            const day = String(date.getDate()).padStart(2, "0");
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const year = String(date.getFullYear()).slice(-2);
            const hours = String(date.getHours()).padStart(2, "0");
            const minutes = String(date.getMinutes()).padStart(2, "0");

            return (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                {`${day}-${month}-${year} ${hours}:${minutes}`}
              </Box>
            );
          } catch {
            return (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                {value}
              </Box>
            );
          }
        },
      },
      {
        accessorKey: "updatedAt",
        header: "Updated At",
        size: 160,
        Cell: ({ cell }) => {
          const value = cell.getValue<string>();

          if (!value) {
            return (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                N/A
              </Box>
            );
          }

          try {
            const date = new Date(value);
            const day = String(date.getDate()).padStart(2, "0");
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const year = String(date.getFullYear()).slice(-2);
            const hours = String(date.getHours()).padStart(2, "0");
            const minutes = String(date.getMinutes()).padStart(2, "0");

            return (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                {`${day}-${month}-${year} ${hours}:${minutes}`}
              </Box>
            );
          } catch {
            return (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                {value}
              </Box>
            );
          }
        },
      },
    ],
    [handleOpenUserForm, handleDeleteClick],
  );
  useEffect(() => {
    const isSinceBeginning = statsViewModeRef.current === "sinceBeginning";

    // Since Beginning me jab tak card click nahi, table API mat chalao
    if (isSinceBeginning && selectedStatCard === null) return;

    const params = {
      page,
      size: rowsPerPage,
      sortBy,
      direction,
      search: appliedFilters.globalSearch.trim() || undefined,
      status:
        appliedFilters.status === "" ? null : appliedFilters.status === "true",
      departmentId: appliedFilters.department ? Number(appliedFilters.department) : null,
      designationId: appliedFilters.designation ? Number(appliedFilters.designation) : null,
      roleId: appliedFilters.role ? Number(appliedFilters.role) : null,
      branch: appliedFilters.branch || null,
      employeeName: appliedFilters.employeeName || null,
      fromDate: isSinceBeginning ? undefined : appliedFilters.createdDateFrom || undefined,
      toDate: isSinceBeginning ? undefined : appliedFilters.createdDateTo || undefined,
    };

    const useSearch =
      isSinceBeginning &&
      fetchModeRef.current === "search" &&
      appliedFilters.status !== "";

    if (useSearch) {
      searchUsers(params);
    } else {
      getUsers(params);
    }

    fetchModeRef.current = "list"; // agla trigger (sort/page) list se
  }, [
    appliedFilters.globalSearch,
    appliedFilters.status,
    appliedFilters.department,
    appliedFilters.designation,
    appliedFilters.branch,
    appliedFilters.role,
    appliedFilters.employeeName,
    appliedFilters.createdDateFrom,
    appliedFilters.createdDateTo,
    page,
    rowsPerPage,
    sortBy,
    direction,
    getUsers,
    searchUsers,
    tableRefreshKey,
    cardClickKey,
    selectedStatCard,
  ]);

  useEffect(() => {
    const fetchAllDropdownData = async () => {
      try {
        const [
          departmentsData,
          designationsData,
          rolesData,
          branchesData,
          modulesData,
          employeesData,
        ] = await Promise.all([
          userService.getDepartments(),
          userService.getDesignations(),
          userService.getRoles(),
          userService.getBranches(),
          userService.getModules(),
          userService.getEmployees(),
        ]);

        setDepartments(departmentsData);
        setDesignations(designationsData);
        setRoles(rolesData);
        setBranches(branchesData);
        setModules(modulesData);
        setEmployees(employeesData);
      } catch { }
    };

    fetchAllDropdownData();
  }, []);

  useEffect(() => {
    if (statsViewMode === "asPerDate") {
      getUserStatusCount({
        fromDate: appliedFilters.createdDateFrom || undefined,
        toDate: appliedFilters.createdDateTo || undefined,
      });
    } else {
      getUserStatusCount();
    }
  }, [
    statsViewMode,
    appliedFilters.createdDateFrom,
    appliedFilters.createdDateTo,
    getUserStatusCount,
    tableRefreshKey,
  ]);

  const handleFilterChange = (field: FilterKey, value: string) => {
    dispatch(setUserFilters({ [field]: value }));
  };

  const handleApplyFilters = () => {
    const search = filters.globalSearch.trim();
    if (search.length === 1) {
      return;
    }
    dispatch(applyUserFilters());
    setPage(0);
  };
  const handleClearFilters = () => {
    dispatch(clearUserFilters());
    setSelectedStatCard("false");
    statsViewModeRef.current = "asPerDate";
    setStatsViewMode("asPerDate");
    setPage(0);
    setTableRefreshKey((prev) => prev + 1);
  };

  const handleRemoveFilter = (key: FilterKey) => {
    dispatch(setUserFilters({ [key]: "" }));
  };

  const handleStatusCardClick = (status: string) => {
    const sameStatus = appliedFilters.status === status;
    setSelectedStatCard(status);
    dispatch(applyUserFiltersWithStatus(status));
    setPage(0);
    fetchModeRef.current = status !== "" ? "search" : "list";

    if (sameStatus) {
      setCardClickKey((prev) => prev + 1);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) {
      return;
    }

    try {
      const deletedUser = userList.find(
        (user) => user.id === userToDelete
      );

      await userService.deleteUser(userToDelete);

      if (deletedUser?.employeeCode) {
        userService.invalidateUserHistory(
          deletedUser.employeeCode
        );
      }

      setDeleteDialogOpen(false);
      setUserToDelete(null);
      setPage(0);

      // Hard refresh table + status cards
      setTableRefreshKey((prev) => prev + 1);

      setSnackbar({
        open: true,
        message: "User deleted successfully.",
        severity: "success",
      });
    } catch (error: any) {
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      setSnackbar({
        open: true,
        message:
          error?.response?.status === 403
            ? "You are not authorized to delete users."
            : error?.response?.data?.message || "Failed to delete user.",
        severity: "error",
      });
    }
  };

  const handleUserSuccess = () => {
    handleCloseUserForm();
    setPage(0);
    setTableRefreshKey((prev) => prev + 1);
  };

  const stats: StatConfig[] = [
    {
      key: "",
      label: "Total Users",
      count: statusCount?.totalCount ?? 0,
      icon: <BarChartRoundedIcon />,
      color: "#4F46E5",
      background: "linear-gradient(135deg,#EEF2FF,#E0E7FF)",
      border: "#C7D2FE",
      shadow: "rgba(79,70,229,.15)",
    },
    {
      key: "false",
      label: "Active Users",
      count: statusCount?.activeCount ?? 0,
      icon: <HowToRegRoundedIcon />,
      color: "#16A34A",
      background: "linear-gradient(135deg,#DCFCE7,#BBF7D0)",
      border: "#86EFAC",
      shadow: "rgba(22,163,74,.15)",
    },
    {
      key: "true",
      label: "Inactive Users",
      count: statusCount?.inactiveCount ?? 0,
      icon: <PersonOffRoundedIcon />,
      color: "#DC2626",
      background: "linear-gradient(135deg,#FEE2E2,#FECACA)",
      border: "#FCA5A5",
      shadow: "rgba(220,38,38,.15)",
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100%",
        width: "100%",
        maxWidth: "100vw",
        bgcolor: "#F1F5F9",
        px: { xs: 1.5, sm: 2, md: 3 },
        py: { xs: 2, md: 2.5 },
        boxSizing: "border-box",
      }}
    >
      <Box
        sx={{
          mb: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography
          sx={{
            fontSize: { xs: "1.1rem", sm: "1.45rem" },
            fontWeight: 800,
            color: "#172033",
          }}
        >
          Users Activity Board
        </Typography>

        <Tooltip title="Refresh / As Per Date">
          <IconButton
            onClick={handleHardRefresh}
            size="small"
            sx={{
              color: "#2563EB",
              border: "1px solid #CBD5E1",
              bgcolor: "#FFFFFF",
              "&:hover": {
                bgcolor: "#EFF6FF",
              },
            }}
          >
            <RefreshRoundedIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <Grid
        container
        spacing={{ xs: 1.5, md: 2 }}
        sx={{ alignItems: "flex-start" }}
      >
        <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }} sx={{ minWidth: 0 }}>
          <UserSearchFilters
            filters={filters}
            appliedFilters={appliedFilters}
            filterFields={filterFields}
            minDate={minDate}
            maxDate={maxDate}
            onFilterChange={handleFilterChange}
            onApply={handleApplyFilters}
            onClear={handleClearFilters}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }} sx={{ minWidth: 0 }}>
          <UserOverviewStats
            stats={stats}
            selectedStatus={selectedStatCard ?? "__none__"}
            onStatClick={handleStatusCardClick}
            viewMode={statsViewMode}
            onViewModeChange={handleStatsViewModeChange}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <UserActiveFilters
            appliedFilters={filters}
            onRemoveFilter={handleRemoveFilter}
            departmentOptions={departmentOptions}
            designationOptions={designationOptions}
            branchOptions={branchOptions}
            roleOptions={roleOptions}
          />
        </Grid>
      </Grid>

      <Box
        sx={{
          mt: 2,
          borderRadius: 2.5,
          bgcolor: "#FFFFFF",
          border: "1px solid #DCE4EE",
          overflowX: "auto",
          overflowY: "hidden",
          boxShadow: "0 2px 8px rgba(15,23,42,.025)",
        }}
      >
        <Box
          sx={{
            px: { xs: 1.5, sm: 2, md: 2.5 },
            py: 1.6,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #E2E8F0",
          }}
        />

        {reduxError && (
          <Box sx={{ p: 2, bgcolor: "#FEE2E2", color: "#DC2626" }}>
            {reduxError}
          </Box>
        )}

        {!reduxError && (
          <ReactMaterialTable
            data={userList}
            columns={userColumns}
            page={page}
            rowsPerPage={rowsPerPage}
            totalElements={totalElements}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            onSortChange={handleSortChange}
            entityLabel="Users"
          />
        )}

        {historyEmployeeCode && (
          <UserHistoryDialog
            open={historyOpen}
            employeeCode={historyEmployeeCode}
            onClose={() => {
              setHistoryOpen(false);
              setHistoryEmployeeCode(null);
            }}
            departments={departments}
            designations={designations}
            roles={roles}
            branches={branches}
            modules={modules}
          />
        )}
      </Box>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              p: 1,
            },
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                bgcolor: "#FEE2E2",
                color: "#DC2626",
              }}
            >
              <WarningAmberIcon />
            </Box>

            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: "1rem" }}>
                Delete User
              </Typography>

              <Typography sx={{ color: "#64748B", fontSize: "0.75rem" }}>
                This action cannot be undone
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent>
          <DialogContentText
            sx={{
              color: "#334155",
              fontSize: "0.9rem",
            }}
          >
            Are you sure you want to delete this user?
          </DialogContentText>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            onClick={handleDeleteCancel}
            variant="outlined"
            sx={{
              flex: 1,
              height: 40,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Cancel
          </Button>

          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            sx={{
              flex: 1,
              height: 40,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              background: "linear-gradient(135deg,#DC2626,#B91C1C)",
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(previewFile)}
        onClose={() => setPreviewFile(null)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: "14px",
              overflow: "hidden",
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            px: 2.5,
            py: 1.8,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "0.95rem",
            fontWeight: 700,
            color: "#111827",
            borderBottom: "1px solid #E5E7EB",
          }}
        >
          {previewFile?.type === "profile"
            ? "Profile Image"
            : "Digital Signature"}

          <IconButton
            size="small"
            onClick={() => setPreviewFile(null)}
            sx={{
              color: "#6B7280",
              "&:hover": {
                bgcolor: "#F3F4F6",
              },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{
            p: 3,
            minHeight: 320,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "#F8FAFC",
          }}
        >
          {previewFile && (
            <Box
              sx={{
                width: "100%",
                minHeight: 270,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "10px",
                bgcolor: "#FFFFFF",
                border: "1px solid #E5E7EB",
                p: 2,
              }}
            >
              <Box
                component="img"
                src={previewFile.url}
                alt={previewFile.name}
                sx={{
                  maxWidth: "100%",
                  maxHeight: 330,
                  objectFit: "contain",
                }}
              />
            </Box>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            px: 2.5,
            py: 1.5,
            borderTop: "1px solid #E5E7EB",
            gap: 1,
          }}
        >
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
            sx={{
              textTransform: "none",
              borderRadius: "8px",
              fontWeight: 600,
              borderColor: "#D1D5DB",
              color: "#374151",
            }}
          >
            Download
          </Button>

          <Button
            variant="contained"
            onClick={() => setPreviewFile(null)}
            sx={{
              textTransform: "none",
              borderRadius: "8px",
              fontWeight: 600,
              bgcolor: "#6D28D9",
              "&:hover": {
                bgcolor: "#5B21B6",
              },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <UserExcelUpload
        open={openExcelUpload}
        onClose={() => setOpenExcelUpload(false)}
        onSuccess={(result) => {
          setOpenExcelUpload(false);
          setPage(0);
          setTableRefreshKey((prev) => prev + 1);

          const successfulEmployeeCodes = result?.successfulEmployeeCodes ?? [];
          successfulEmployeeCodes.forEach((employeeCode) => {
            if (employeeCode) {
              userService.invalidateUserHistory(employeeCode);
            }
          });
          const successCount = result?.successCount ?? 0;
          const failureCount = result?.failureCount ?? 0;

          if (failureCount > 0) {
            setExcelSuccessMessage(
              `${successCount} user${successCount !== 1 ? "s" : ""} uploaded successfully and ${failureCount} row${failureCount !== 1 ? "s" : ""} failed.`,
            );
          } else {
            setExcelSuccessMessage(
              `${successCount} user${successCount !== 1 ? "s" : ""} uploaded successfully.`,
            );
          }

          window.dispatchEvent(new Event("notification-updated"));
        }}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() =>
          setSnackbar({
            ...snackbar,
            open: false,
          })
        }
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <Alert
          onClose={() =>
            setSnackbar({
              ...snackbar,
              open: false,
            })
          }
          severity={
            snackbar.severity as
            | "error"
            | "success"
            | "warning"
            | "info"
          }
          variant="filled"
          sx={{
            width: "100%",
            borderRadius: 2,
            fontWeight: 600,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Tooltip title="Download Template">
        <span>
          <Fab
            onClick={async () => {
              if (!canExport) {
                showNotAuthorized("You are not authorized to download the template.");
                return;
              }
              const blob = await userService.downloadTemplate();
              const blobUrl = window.URL.createObjectURL(blob);
              const link = document.createElement("a");

              link.href = blobUrl;
              link.setAttribute(
                "download",
                "user_master_template.xlsx",
              );

              document.body.appendChild(link);
              link.click();
              link.remove();

              window.URL.revokeObjectURL(blobUrl);
            }}
            sx={{
              position: "fixed",
              right: { xs: 18, md: 28 },
              bottom: { xs: 300, md: 236 },
              zIndex: 1200,
              width: 40,
              height: 40,
              color: "#FFF",
              background:
                "linear-gradient(135deg,#3B82F6,#2563EB)",
              boxShadow:
                "0 8px 20px rgba(37,99,235,.28)",
            }}
          >
            <UserTemplateButton />
          </Fab>
        </span>
      </Tooltip>

      <Tooltip title="Download Excel">
        <span>
          <Fab
            onClick={() => {
              if (!canExport) {
                showNotAuthorized("You are not authorized to download Excel.");
                return;
              }
              handleExcelDownload();
            }}
            sx={{
              position: "fixed",
              right: { xs: 18, md: 28 },
              bottom: { xs: 245, md: 190 },
              zIndex: 1200,
              width: 40,
              height: 40,
              color: "#FFF",
              background:
                "linear-gradient(135deg,#3B82F6,#2563EB)",
              boxShadow:
                "0 8px 20px rgba(37,99,235,.28)",
            }}
          >
            <UserDownloadExcel />
          </Fab>
        </span>
      </Tooltip>

      <Dialog
        open={emailDialogOpen}
        onClose={() => {
          if (!emailLoading) {
            setEmailDialogOpen(false);
          }
        }}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              p: 1,
            },
          },
        }}
      >
        {/* Confirmation dialog */}
        <DialogTitle sx={{ fontWeight: 700 }}>
          {emailDialogTitle}
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "#475569", fontSize: "0.9rem", lineHeight: 1.6 }}>
            {emailDialogMessage}
          </Typography>
        </DialogContent>

        <DialogActions
          sx={{
            px: 2,
            pb: 2,
            gap: 1,
          }}
        >
          <Button
            onClick={() => setEmailDialogOpen(false)}
            disabled={emailLoading}
            variant="outlined"
            sx={{
              minWidth: 100,
              borderRadius: 2,
              textTransform: "none",
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleEmailExport}
            disabled={emailLoading}
            sx={{
              minWidth: 100,
              borderRadius: 2,
              textTransform: "none",
            }}
          >
            {emailLoading ? "Sending..." : "Email"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={emailSuccessDialogOpen}
        onClose={() => setEmailSuccessDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: { sx: { borderRadius: 3, p: 1 } },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {emailSuccessTitle}
        </DialogTitle>

        <DialogContent>
          <Typography sx={{ color: "#475569", fontSize: "0.9rem", lineHeight: 1.6 }}>
            {emailSuccessMessage}
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button
            variant="contained"
            onClick={() => setEmailSuccessDialogOpen(false)}
            sx={{ minWidth: 100, borderRadius: 2, textTransform: "none" }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={errorDialogOpen}
        onClose={() => setErrorDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: { sx: { borderRadius: 3, p: 1 } },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: "#DC2626" }}>
          Error
        </DialogTitle>

        <DialogContent>
          <Typography sx={{ color: "#475569", fontSize: "0.9rem", lineHeight: 1.6 }}>
            {errorDialogMessage}
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button
            variant="contained"
            onClick={() => setErrorDialogOpen(false)}
            sx={{ minWidth: 100, borderRadius: 2, textTransform: "none" }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={emailSuccessDialogOpen}
        onClose={() => setEmailSuccessDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: { sx: { borderRadius: 3, p: 1 } },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Email Sent
        </DialogTitle>

        <DialogContent>
          <Typography sx={{ color: "#475569", fontSize: "0.9rem", lineHeight: 1.6 }}>
            {emailSuccessMessage}
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button
            variant="contained"
            onClick={() => setEmailSuccessDialogOpen(false)}
            sx={{ minWidth: 100, borderRadius: 2, textTransform: "none" }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>

      <Tooltip title="Upload File">
        <span>
          <Fab
            onClick={() => {
              if (!canUpload) {
                showNotAuthorized("You are not authorized to upload users.");
                return;
              }
              setOpenExcelUpload(true);
            }}
            sx={{
              position: "fixed",
              right: { xs: 18, md: 28 },
              bottom: { xs: 135, md: 145 },
              zIndex: 1200,
              width: 40,
              height: 40,
              color: "#FFF",
              background:
                "linear-gradient(135deg,#3B82F6,#2563EB)",
              boxShadow:
                "0 8px 20px rgba(37,99,235,.28)",
            }}
          >
            <FileUploadIcon />
          </Fab>
        </span>
      </Tooltip>

      <Tooltip title="Add User">
        <span>
          <Fab
            onClick={() => handleOpenUserForm()}
            sx={{
              position: "fixed",
              right: { xs: 18, md: 28 },
              bottom: { xs: 80, md: 100 },
              zIndex: 1200,
              width: 40,
              height: 40,
              color: "#FFF",
              background:
                "linear-gradient(135deg,#3B82F6,#2563EB)",
              boxShadow:
                "0 8px 20px rgba(37,99,235,.28)",
            }}
          >
            <AddRoundedIcon />
          </Fab>
        </span>
      </Tooltip>

      <Drawer
        anchor="right"
        open={openUserForm}
        onClose={(_, reason) => {
          if (
            reason === "backdropClick" ||
            reason === "escapeKeyDown"
          ) {
            return;
          }

          handleCloseUserForm();
        }}
        ModalProps={{ keepMounted: true }}
        slotProps={{
          paper: {
            sx: {
              width: {
                xs: "100%",
                sm: 680,
                md: 900,
                lg: 980,
                xl: 1050,
              },
              maxWidth: "100vw",
              height: "100vh",
              bgcolor: "#F8FAFC",
              overflow: "hidden",
            },
          },
        }}
      >
        {selectedUserId !== undefined ? (
          <UpdateUserForm
            id={selectedUserId}
            selectedUser={
              selectedUser
                ? {
                  id: selectedUser.id,
                  userId: selectedUser.userId ?? "",
                  employeeId: selectedUser.employeeId ?? null,
                  employeeCode:
                    selectedUser.employeeCode ?? "",
                  fullName: selectedUser.fullName ?? "",
                  email: selectedUser.email ?? "",
                  mobileNumber:
                    selectedUser.mobileNumber ?? "",
                  departmentId:
                    selectedUser.departmentId ?? null,
                  designationId:
                    selectedUser.designationId ?? null,
                  roleId: selectedUser.roleId ?? null,
                  branchIds:
                    selectedUser.branchIds ?? [],
                  reportingManager:
                    selectedUser.reportingManager ?? null,
                  dashboard:
                    selectedUser.dashboard ?? "",
                  accessibleModules:
                    selectedUser.accessibleModules ?? [],
                  language:
                    selectedUser.language ?? "",
                  timeZone:
                    selectedUser.timeZone ?? "",
                  loginType:
                    selectedUser.loginType ?? "",
                  passwordExpiry:
                    selectedUser.passwordExpiry ?? null,
                  twoFactorAuthentication:
                    selectedUser.twoFactorAuthentication ??
                    false,
                  profileImage: null,
                  digitalSignature: null,
                  remarks:
                    selectedUser.remarks ?? "",
                  status: Boolean(selectedUser.status),
                }
                : null
            }
            departments={departments}
            designations={designations}
            roles={roles}
            branches={branches}
            modules={modules}
            employees={employees}
            onSuccess={handleUserSuccess}
            onCancel={handleCloseUserForm}
          />
        ) : (
          <AddUserForm
            departments={departments}
            designations={designations}
            roles={roles}
            branches={branches}
            modules={modules}
            employees={employees}
            onSuccess={handleUserSuccess}
            onCancel={handleCloseUserForm}
          />
        )}
      </Drawer>
    </Box>
  );
};

export default UserActivityBoard;