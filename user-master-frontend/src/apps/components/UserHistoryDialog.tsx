import React, { useEffect, useMemo, useState } from "react";
import {
    Box,
    Chip,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {
    MaterialReactTable,
    MRT_ColumnDef,
    MRT_PaginationState,
} from "material-react-table";
import userService, {
    UserHistory,
    Department,
    Designation,
    Role,
    Branch,
    Module,
} from "@/pages/user/api";


interface UserHistoryDialogProps {
    open: boolean;
    employeeCode: string | null;
    onClose: () => void;
    departments?: Department[];
    designations?: Designation[];
    roles?: Role[];
    branches?: Branch[];
    modules?: Module[];
}

interface HistorySnapshot {
    [key: string]: any;
}

const UserHistoryDialog: React.FC<UserHistoryDialogProps> = ({
    open,
    employeeCode,
    onClose,
    departments = [],
    designations = [],
    roles = [],
    branches = [],
    modules = [],
}) => {
    const [history, setHistory] = useState<UserHistory[]>([]);
    const [loading, setLoading] = useState(false);
    const [historyPage, setHistoryPage] = useState(0);
    const [historyRowsPerPage, setHistoryRowsPerPage] = useState(10);
    const [isLoadingPrev, setIsLoadingPrev] = useState(true);
    const [historyTotal, setHistoryTotal] = useState(0);

    useEffect(() => {
        if (!open || !employeeCode) {
            setHistory([]);
            setIsLoadingPrev(false);
            return;
        }

        const fetchHistory = async () => {
            try {
                setIsLoadingPrev(true);
                const response = await userService.getUserHistory(
                    employeeCode,
                    historyPage,
                    historyRowsPerPage,
                );
                const pageData = response.data;
                setHistory(pageData?.content ?? []);
                setHistoryTotal(pageData?.totalElements ?? 0);
            } catch (error) {
                console.error("Failed to fetch user history:", error);
                setHistory([]);
                setHistoryTotal(0);
            } finally {
                setIsLoadingPrev(false);
            }
        };

        fetchHistory();
    }, [open, employeeCode, historyPage, historyRowsPerPage]);

    const getDepartmentName = (id: unknown) => {
        if (id === null || id === undefined || id === "") return "N/A";
        const department = departments.find(
            (item) => Number(item.id) === Number(id),
        );
        return department?.departmentName ?? String(id);
    };

    const getDesignationName = (id: unknown) => {
        if (id === null || id === undefined || id === "") return "N/A";
        const designation = designations.find(
            (item) => Number(item.id) === Number(id),
        );
        return designation?.designationName ?? String(id);
    };

    const getRoleName = (id: unknown) => {
        if (id === null || id === undefined || id === "") return "N/A";
        const role = roles.find((item) => Number(item.id) === Number(id));
        return role?.roleName ?? String(id);
    };

    const getBranchNames = (ids: unknown) => {
        if (ids === null || ids === undefined || ids === "") return "N/A";
        let branchIds: unknown[] = [];
        if (Array.isArray(ids)) {
            branchIds = ids;
        } else if (typeof ids === "string") {
            try {
                const parsed = JSON.parse(ids);
                if (Array.isArray(parsed)) {
                    branchIds = parsed;
                } else {
                    branchIds = ids.split(",").map((item) => item.trim());
                }
            } catch {
                branchIds = ids.split(",").map((item) => item.trim());
            }
        }
        if (branchIds.length === 0) return "N/A";
        return branchIds
            .map((id) => {
                const branch = branches.find(
                    (item) => Number(item.id) === Number(id),
                );
                return branch?.branchName ?? String(id);
            })
            .join(", ");
    };

    const getModuleNames = (ids: unknown) => {
        if (ids === null || ids === undefined || ids === "") return "N/A";
        let moduleIds: unknown[] = [];
        if (Array.isArray(ids)) {
            moduleIds = ids;
        } else if (typeof ids === "string") {
            try {
                const parsed = JSON.parse(ids);
                if (Array.isArray(parsed)) {
                    moduleIds = parsed;
                } else {
                    moduleIds = ids.split(",").map((item) => item.trim());
                }
            } catch {
                moduleIds = ids.split(",").map((item) => item.trim());
            }
        }
        if (moduleIds.length === 0) return "N/A";
        return moduleIds
            .map((id) => {
                const module = modules.find(
                    (item) => Number(item.id) === Number(id),
                );
                return module?.moduleName ?? String(id);
            })
            .join(", ");
    };

    const formatValue = (field: string, value: unknown): string => {
        if (value === null || value === undefined || value === "") return "N/A";
        switch (field) {
            case "departmentId":
                return getDepartmentName(value);
            case "designationId":
                return getDesignationName(value);
            case "roleId":
                return getRoleName(value);
            case "branchIds":
                return getBranchNames(value);
            case "accessibleModules":
                return getModuleNames(value);
            case "status":
                return value === true || value === "true" ? "Inactive" : "Active";
            case "twoFactorAuthentication":
                return value === true || value === "true" ? "Enabled" : "Disabled";
            default:
                if (Array.isArray(value)) {
                    return value.length ? value.join(", ") : "N/A";
                }
                return String(value);
        }
    };

    const fieldLabels: Record<string, string> = {
        id: "ID",
        userId: "User ID",
        employeeId: "Employee ID",
        employeeCode: "Employee Code",
        fullName: "Full Name",
        email: "Email",
        mobileNumber: "Mobile Number",
        departmentId: "Department",
        designationId: "Designation",
        branchIds: "Branch",
        roleId: "Role",
        reportingManager: "Reporting Manager",
        dashboard: "Dashboard",
        accessibleModules: "Accessible Modules",
        language: "Language",
        timeZone: "Time Zone",
        loginType: "Login Type",
        passwordExpiry: "Password Expiry",
        twoFactorAuthentication: "Two Factor Auth",
        profileImageOriginalName: "Profile Image",
        digitalSignatureOriginalName: "Digital Signature",
        remarks: "Remarks",
        status: "Status",
    };

    const ignoredFields = new Set([
        "createdAt",
        "updatedAt",
        "createdBy",
        "updatedBy",
        "password",
        "isDeleted",
        "deleted",
        "isLocked",
        "loginAttempts",
        "profileImage",
        "digitalSignature",
    ]);

    const parseSnapshot = (data: string | null): HistorySnapshot => {
        if (!data) return {};
        try {
            return JSON.parse(data);
        } catch (error) {
            console.error("Failed to parse history snapshot:", error);
            return {};
        }
    };

    const getFieldValue = (historyItem: UserHistory, field: string,): string => {
        const newData = parseSnapshot(historyItem.newData);
        return formatValue(field, newData[field]);
    };

    const isFieldChanged = (historyItem: UserHistory, historyIndex: number, field: string,): boolean => {
        if (historyItem.action === "ADD") {
            return false;
        }
        const currentData = parseSnapshot(historyItem.newData);
        const previousItem = history[historyIndex + 1];
        if (!previousItem) {
            return false;
        }
        const previousData = parseSnapshot(previousItem.newData);
        const currentValue = formatValue(
            field,
            currentData[field],
        );
        const previousValue = formatValue(
            field,
            previousData[field],
        );
        return currentValue !== previousValue;
    };

    const formatDateTime = (value: string) => {
        if (!value) return "N/A";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;
        return date.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    const getActionLabel = (action: string) => {
        switch (action) {
            case "ADD": return "Added";
            case "UPDATE": return "Updated";
            case "STATUS_CHANGE": return "Status Change";
            default: return action || "Action";
        }
    };

    const getActionColor = (action: string) => {
        switch (action) {
            case "ADD": return "success";
            case "UPDATE": return "warning";
            case "STATUS_CHANGE": return "error";
            default: return "default";
        }
    };

    const historyColumns = useMemo<MRT_ColumnDef<UserHistory>[]>(() => {
        const userFields = Object.keys(fieldLabels).filter(
            (field) => !ignoredFields.has(field),
        );

        const baseColumns: MRT_ColumnDef<UserHistory>[] = [
            {
                id: "performedAt",
                header: "Date & Time",
                size: 180,
                minSize: 180,
                Cell: ({ row }) => (
                    <Typography
                        variant="body2"
                        sx={{
                            fontSize: "0.775rem",
                            fontWeight: 500,
                            whiteSpace: "nowrap",
                            color: "#424242",
                        }}
                    >
                        {formatDateTime(row.original.performedAt)}
                    </Typography>
                ),
            },
            {
                id: "actionedBy",
                header: "Action By",
                size: 200,
                minSize: 200,
                Cell: ({ row }) => (
                    <Typography
                        variant="body2"
                        sx={{
                            fontSize: "0.775rem",
                            fontWeight: 600,
                            color:
                                row.original.action === "STATUS_CHANGE"
                                    ? "#3a3637"
                                    : "#424242",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {getActionLabel(row.original.action)} by{" "}
                        {row.original.performedBy || "Admin"}
                    </Typography>
                ),
            },
        ];

        const dynamicColumns = userFields.map(
            (field): MRT_ColumnDef<UserHistory> => ({
                id: field,
                accessorKey: field,
                header: fieldLabels[field],
                size:
                    field === "accessibleModules"
                        ? 280
                        : field === "branchIds"
                            ? 240
                            : field === "fullName"
                                ? 180
                                : field === "email"
                                    ? 220
                                    : field === "remarks"
                                        ? 220
                                        : field === "employeeCode"
                                            ? 150
                                            : 160,
                minSize: 100,
                maxSize: 400,
                Cell: ({ row }) => {
                    const value = getFieldValue(row.original, field);

                    const isChanged = isFieldChanged(
                        row.original,
                        row.index,
                        field,
                    );

                    return (
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-start",
                                minHeight: 40,
                                px: 1.2,
                                py: 0.8,
                                borderRadius: "8px",
                                transition: "all 0.2s ease",
                                backgroundColor: isChanged
                                    ? "linear-gradient(135deg, rgba(255, 152, 0, 0.08) 0%, rgba(255, 193, 7, 0.05) 100%)"
                                    : "transparent",
                                border: isChanged ? "1px solid rgba(255, 152, 0, 0.15)" : "none",
                                "&:hover": {
                                    backgroundColor: isChanged
                                        ? "linear-gradient(135deg, rgba(255, 152, 0, 0.12) 0%, rgba(255, 193, 7, 0.08) 100%)"
                                        : "rgba(0, 0, 0, 0.02)",
                                },
                            }}
                        >
                            <Typography
                                variant="body2"
                                sx={{
                                    fontSize: "0.775rem",
                                    fontWeight: isChanged ? 600 : 400,
                                    color: isChanged ? "#de6800" : "#424242",
                                    whiteSpace: "normal",
                                    wordBreak: "break-word",
                                    lineHeight: 1.4,
                                }}
                                title={value !== "—" ? value : undefined}
                            >
                                {value}
                            </Typography>
                        </Box>
                    );
                },
            }),
        );

        return [...baseColumns, ...dynamicColumns];
    }, [history, departments, designations, roles, branches, modules]);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="xl"
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: "12px",
                        overflow: "hidden",
                        height: "auto",
                        maxHeight: "85vh",
                        minHeight: "350px",
                        boxShadow: "0 12px 32px rgba(0, 0, 0, 0.12)",
                    },
                },
                backdrop: {
                    sx: {
                        backgroundColor: "rgba(0, 0, 0, 0.45)",
                    },
                },
            }}
        >
            <DialogTitle
                sx={{
                    px: 2.5,
                    py: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexShrink: 0,
                    backgroundColor: "#fafafa",
                }}
            >
                <Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 700,
                                fontSize: "1.15rem",
                                color: "text.primary",
                            }}
                        >
                            User History
                        </Typography>
                        <Chip
                            label={`${history.length} of ${historyTotal} ${historyTotal === 1 ? "Record" : "Records"}`}
                            size="small"
                            variant="outlined"
                            sx={{
                                height: 24,
                                fontSize: "0.7rem",
                                fontWeight: 600,
                            }}
                        />
                    </Box>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            fontSize: "0.8rem",
                            fontWeight: 500,
                        }}
                    >
                        Employee Code:{" "}
                        <Box
                            component="span"
                            sx={{
                                color: "primary.main",
                                fontWeight: 700,
                                fontSize: "0.85rem",
                            }}
                        >
                            {employeeCode || "N/A"}
                        </Box>
                    </Typography>
                </Box>
                <IconButton
                    onClick={onClose}
                    size="small"
                    sx={{
                        border: "1px solid",
                        borderColor: "divider",
                        backgroundColor: "background.paper",
                        "&:hover": {
                            backgroundColor: "#f0f0f0",
                        },
                    }}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>
            </DialogTitle>

            <Divider sx={{ flexShrink: 0 }} />

            <DialogContent
                sx={{
                    p: 0,
                    backgroundColor: "#fafafa",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    minHeight: 0,
                    minWidth: 0,
                    maxHeight: "calc(85vh - 130px)",
                }}
            >
                {history.length === 0 && !isLoadingPrev ? (
                    <Box
                        sx={{
                            minHeight: 200,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 1.5,
                            py: 3,
                        }}
                    >
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 600,
                                color: "text.primary",
                            }}
                        >
                            No History Found
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontSize: "0.9rem" }}
                        >
                            No activity has been recorded for this employee.
                        </Typography>
                    </Box>
                ) : (
                    <MaterialReactTable
                        columns={historyColumns}
                        data={history}
                        layoutMode="grid"
                        enableColumnVirtualization={false}
                        enableStickyHeader
                        state={{
                            pagination: {
                                pageIndex: historyPage,
                                pageSize: historyRowsPerPage,
                            },
                        }}
                        onPaginationChange={(updater) => {
                            const newPagination =
                                typeof updater === "function"
                                    ? updater({
                                        pageIndex: historyPage,
                                        pageSize: historyRowsPerPage,
                                    })
                                    : updater;

                            setHistoryPage(newPagination.pageIndex);
                            setHistoryRowsPerPage(newPagination.pageSize);
                        }}
                        manualPagination
                        rowCount={historyTotal}
                        enableColumnActions={false}
                        enableHiding={false}
                        enableDensityToggle={false}
                        enableFullScreenToggle={false}
                        enableRowSelection={false}
                        enableFilters={false}
                        enableGlobalFilter={false}

                        muiTablePaperProps={{
                            sx: {
                                boxShadow: "none",
                                backgroundColor: "transparent",
                                border: "none",
                                height: "100%",
                                display: "flex",
                                flexDirection: "column",
                                minHeight: 0,
                            },
                        }}

                        muiTableContainerProps={{
                            sx: {
                                flex: 1,
                                minHeight: 0,
                                minWidth: 0,
                                width: "100%",
                                maxWidth: "100%",
                                overflowX: "auto !important",
                                overflowY: "auto !important",
                                "&::-webkit-scrollbar": {
                                    width: 8,
                                    height: 8,
                                },

                                "&::-webkit-scrollbar-thumb": {
                                    background: "#cbd5e1",
                                    borderRadius: 8,
                                },

                                "&::-webkit-scrollbar-track": {
                                    background: "#f8fafc",
                                },
                            },
                        }}

                        muiTableProps={{
                            sx: {
                                width: "max-content",
                                minWidth: "100%",
                            },
                        }}
                        muiTableHeadCellProps={{
                            sx: {
                                backgroundColor: "#f5f5f5",
                                fontWeight: 700,
                                fontSize: "0.8rem",
                                color: "text.primary",
                                borderBottom: "2px solid #e0e0e0",
                                padding: "12px 8px",
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                            },
                        }}

                        muiTableBodyCellProps={{
                            sx: {
                                padding: "10px 8px",
                                borderBottom: "1px solid #efefef",
                                fontSize: "0.8rem",
                            },
                        }}

                        muiPaginationProps={{
                            rowsPerPageOptions: [5, 10, 25, 50],
                            showFirstButton: true,
                            showLastButton: true,
                        }}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
};

export default UserHistoryDialog;