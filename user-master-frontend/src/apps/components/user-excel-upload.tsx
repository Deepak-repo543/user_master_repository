import { useMemo, useRef, useState } from "react";
import { Alert, Box, Button, Chip, CircularProgress, Typography, Dialog, DialogTitle, DialogContent, DialogActions, IconButton,} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ReactMaterialTable from "@/components/react-material-table";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import type { MRT_ColumnDef } from "material-react-table";
import userService, {ExcelPreviewResponse,ExcelUploadResponse,StatusFilter,ExcelRowResult,} from "@/pages/user/api";

interface UserExcelUploadProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (result: ExcelUploadResponse) => void;
  onError?: (error: any) => void;
}

const STATUS_META: Record<StatusFilter, { bg: string; text: string; border: string; icon: React.ReactElement }> = {
  VALID: {
    bg: "#ECFDF5",
    text: "#059669",
    border: "#A7F3D0",
    icon: <CheckCircleRoundedIcon sx={{ fontSize: 14 }} />,
  },
  INVALID: {
    bg: "#FFFBEB",
    text: "#D97706",
    border: "#FDE68A",
    icon: <WarningRoundedIcon sx={{ fontSize: 14 }} />,
  },
  INCORRECT: {
    bg: "#FFFBEB",
    text: "#D97706",
    border: "#FDE68A",
    icon: <WarningRoundedIcon sx={{ fontSize: 14 }} />,
  },
  DUPLICATE: {
    bg: "#FFF7ED",
    text: "#EA580C",
    border: "#FED7AA",
    icon: <ContentCopyRoundedIcon sx={{ fontSize: 14 }} />,
  },
  ALL: {
    bg: "#EEF2FF",
    text: "#4F46E5",
    border: "#C7D2FE",
    icon: <CheckCircleRoundedIcon sx={{ fontSize: 14 }} />,
  },
};

const UserExcelUpload = ({ open, onClose, onSuccess, onError }: UserExcelUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<ExcelPreviewResponse | null>(null);
  const [activeFilter, setActiveFilter] = useState<StatusFilter>("ALL");
  const [isDragOver, setIsDragOver] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const openFilePicker = () => {
    if (previewLoading || saving) return;
    fileInputRef.current?.click();
  };

  const resetState = () => {
    setFile(null);
    setPreview(null);
    setActiveFilter("ALL");
    setPage(0);
  };

  const handleCloseAll = () => {
    if (saving) return;
    resetState();
    onClose();
  };

  const processSelectedFile = async (selected: File | null) => {
    if (!selected) return;

    if (!selected.name.match(/\.(xlsx|xls)$/i)) {
      alert("Please select a valid Excel file (.xlsx or .xls)");
      return;
    }

    setFile(selected);
    setPreview(null);
    setActiveFilter("ALL");
    setPage(0);
    setPreviewLoading(true);

    try {
      const res = await userService.previewExcel(selected);
      setPreview(res.data);
    } catch (err: any) {
      setFile(null);
      setPreview(null);
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        onError?.(err);
        return;
      }
      alert(err?.response?.data?.message || "Failed to read file");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    await processSelectedFile(selected);
    e.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (previewLoading || saving) return;
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (previewLoading || saving) return;
    const droppedFile = e.dataTransfer.files?.[0] ?? null;
    await processSelectedFile(droppedFile);
  };

  const canSave =
    preview !== null &&
    (activeFilter === "ALL" || activeFilter === "VALID") &&
    preview.validCount > 0;

  const handleConfirmSave = async () => {
    if (!file || !preview) return;
    if (preview.validCount === 0) {
      alert("No valid rows available to save.");
      return;
    }
    setSaving(true);
    try {
      const res = await userService.uploadExcel(file);
      window.dispatchEvent(new Event("notification-updated"));
      onSuccess?.(res.data);
      resetState();
      onClose();
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        resetState();
        onError?.(err);
        return;
      }
      alert(err?.response?.data?.message || "Upload failed");
    } finally {
      setSaving(false);
    }
  };

  const filteredRows = useMemo(() => {
    if (!preview) return [];
    if (activeFilter === "ALL") return preview.rows;
    if (activeFilter === "INVALID") {
      return preview.rows.filter(
        (row) =>
          row.validationStatus === "INVALID" ||
          row.validationStatus === "INCORRECT"
      );
    }
    return preview.rows.filter((row) => row.validationStatus === activeFilter);
  }, [preview, activeFilter]);

  const paginatedRows = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredRows.slice(start, end);
  }, [filteredRows, page, rowsPerPage]);

  const columns = useMemo<MRT_ColumnDef<ExcelRowResult>[]>(
    () => [
      { accessorKey: "rowNumber", header: "Row", size: 90, minSize: 80 },
      {
        accessorKey: "userId",
        header: "User ID",
        size: 100,
        minSize: 105,
        Cell: ({ cell }) => cell.getValue<string>() || "N/A",
      },
      {
        accessorKey: "employeeId",
        header: "Employee ID",
        size: 140,
        minSize: 100,
        Cell: ({ cell }) => cell.getValue<number | null>() ?? "N/A",
      },
      {
        accessorKey: "employeeCode",
        header: "Employee Code",
        size: 160,
        minSize: 120,
        Cell: ({ cell }) => cell.getValue<string>() || "N/A",
      },
      {
        accessorKey: "fullName",
        header: "Full Name",
        size: 150,
        minSize: 130,
        Cell: ({ cell }) => cell.getValue<string>() || "N/A",
      },
      {
        accessorKey: "email",
        header: "Email",
        size: 200,
        minSize: 160,
        Cell: ({ cell }) => cell.getValue<string>() || "N/A",
      },
      {
        accessorKey: "mobileNumber",
        header: "Mobile Number",
        size: 180,
        minSize: 110,
        Cell: ({ cell }) => cell.getValue<string>() || "N/A",
      },
      {
        accessorKey: "departmentName",
        header: "Department",
        size: 180,
        minSize: 150,
        Cell: ({ cell }) => cell.getValue<string>() || "N/A",
      },
      {
        accessorKey: "designationName",
        header: "Designation",
        size: 180,
        minSize: 150,
        Cell: ({ cell }) => cell.getValue<string>() || "N/A",
      },
            {
        accessorKey: "branchIds",
        header: "Branch",
        size: 220,
        minSize: 180,
        maxSize: 220,
        Cell: ({ cell }) => {
          const value = cell.getValue<string>();
          if (!value) return "N/A";
          return (
            <Typography
              title={value}
              sx={{
                fontSize: "0.75rem",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: 200,
              }}
            >
              {value}
            </Typography>
          );
        },
      },
      {
        accessorKey: "roleName",
        header: "Role",
        size: 130,
        minSize: 110,
        Cell: ({ cell }) => cell.getValue<string>() || "N/A",
      },
      {
        accessorKey: "reportingManager",
        header: "Reporting Manager",
        size: 200,
        minSize: 140,
        Cell: ({ cell }) => cell.getValue<number | null>() ?? "N/A",
      },
      {
        accessorKey: "language",
        header: "Language",
        size: 150,
        minSize: 100,
        Cell: ({ cell }) => cell.getValue<string>() || "N/A",
      },
      {
        accessorKey: "timeZone",
        header: "Time Zone",
        size: 150,
        minSize: 120,
        Cell: ({ cell }) => cell.getValue<string>() || "N/A",
      },
      {
        accessorKey: "loginType",
        header: "Login Type",
        size: 130,
        minSize: 110,
        Cell: ({ cell }) => cell.getValue<string>() || "N/A",
      },
      {
        accessorKey: "passwordExpiry",
        header: "Password Expiry",
        size: 180,
        minSize: 130,
        Cell: ({ cell }) => cell.getValue<number | null>() ?? "N/A",
      },
      {
        accessorKey: "twoFactorAuthentication",
        header: "Two Factor Auth",
        size: 180,
        minSize: 130,
        Cell: ({ cell }) => {
          const value = cell.getValue<boolean | null>();
          if (value === null || value === undefined) return "N/A";
          return value ? "Yes" : "No";
        },
      },
      {
        accessorKey: "remarks",
        header: "Remarks",
        size: 110,
        minSize: 120,
        Cell: ({ cell }) => (
          <Typography sx={{ fontSize: "0.75rem", whiteSpace: "normal", wordBreak: "break-word" }}>
            {cell.getValue<string>() || "N/A"}
          </Typography>
        ),
      },
      {
        accessorKey: "dashboard",
        header: "Dashboard",
        size: 140,
        minSize: 110,
        Cell: ({ cell }) => cell.getValue<string>() || "N/A",
      },
      {
        accessorKey: "accessibleModules",
        header: "Modules",
        size: 160,
        minSize: 110,
        Cell: ({ cell }) => (
          <Typography sx={{ fontSize: "0.75rem", whiteSpace: "normal", wordBreak: "break-word" }}>
            {cell.getValue<string>() || "N/A"}
          </Typography>
        ),
      },
      {
        accessorKey: "message",
        header: "Message",
        size: 300,
        minSize: 180,
        Cell: ({ row }) => {
          const status = row.original.validationStatus;
          const meta = STATUS_META[status as StatusFilter] || STATUS_META.ALL;
          return (
            <Typography
              sx={{
                fontSize: "0.74rem",
                color: status === "VALID" ? "#059669" : meta.text,
                fontWeight: 600,
                whiteSpace: "normal",
                wordBreak: "break-word",
                lineHeight: 1.4,
                py: 0.5,
              }}
            >
              {row.original.message || "N/A"}
            </Typography>
          );
        },
      },
    ],
    []
  );

  const statusTabs = preview
    ? [
      { key: "ALL" as StatusFilter, label: "All Rows", count: preview.totalRows },
      { key: "VALID" as StatusFilter, label: "Valid", count: preview.validCount },
      { key: "INVALID" as StatusFilter, label: "Invalid", count: preview.invalidCount },
      { key: "DUPLICATE" as StatusFilter, label: "Duplicate", count: preview.duplicateCount },
    ]
    : [];

  const showUploadDialog = open && !preview;
  const showPreviewDialog = open && !!preview;

  return (
    <>
      {/* Upload dialog: small, only the drag & drop box */}
      <Dialog
        open={showUploadDialog}
        onClose={handleCloseAll}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
        >
          Upload Excel File
          <IconButton onClick={handleCloseAll} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          {!previewLoading && (
            <Box
              onClick={openFilePicker}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              sx={{
                width: "100%",
                minHeight: 240,
                mx: "auto",
                border: `2px dashed ${isDragOver ? "#6366F1" : "#CBD5E1"}`,
                borderRadius: 3,
                bgcolor: isDragOver ? "#F5F3FF" : "#F8FAFC",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.2s ease",
                px: 3,
                py: 3,
                "&:hover": { borderColor: "#818CF8", bgcolor: "#F8FAFF" },
              }}
            >
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <Box
                  sx={{
                    width: 68,
                    height: 68,
                    borderRadius: "50%",
                    bgcolor: "#EEF2FF",
                    color: "#6366F1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2,
                  }}
                >
                  <CloudUploadRoundedIcon sx={{ fontSize: 34 }} />
                </Box>
                <Typography sx={{ fontSize: "0.98rem", fontWeight: 700, color: "#1E293B" }}>
                  Drag and drop your Excel file here
                </Typography>
                <Typography sx={{ mt: 1, mb: 1.5, fontSize: "0.78rem", color: "#94A3B8" }}>
                  or
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<UploadFileIcon sx={{ fontSize: 18 }} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    openFilePicker();
                  }}
                  sx={{
                    textTransform: "none",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    borderRadius: 2,
                    px: 2.4,
                    py: 1,
                    boxShadow: "none",
                    bgcolor: "#6366F1",
                    "&:hover": { bgcolor: "#4F46E5", boxShadow: "none" },
                  }}
                >
                  Choose File
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  hidden
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                />
              </Box>
            </Box>
          )}

          {previewLoading && (
            <Box
              sx={{
                minHeight: 240,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 1.5,
              }}
            >
              <CircularProgress size={30} thickness={4} />
              <Typography sx={{ fontSize: "0.82rem", color: "#64748B", fontWeight: 600 }}>
                Validating Excel file...
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Preview dialog: large, only the file-info bar + tabs + table + save actions */}
      <Dialog
        open={showPreviewDialog}
        onClose={handleCloseAll}
        maxWidth="xl"
        fullWidth
        slotProps={{
          paper: {
            sx: { height: "85vh", display: "flex", flexDirection: "column" },
          },
        }}
      >
        <DialogTitle
          sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
        >
          Excel Preview
          <IconButton onClick={handleCloseAll} size="small" disabled={saving}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent
          dividers
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            minWidth: 0,
            p: 2,
          }}
        >
          {file && (
            <Box
              sx={{
                mb: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                flexWrap: "wrap",
                px: 1.5,
                py: 1,
                borderRadius: 2,
                bgcolor: "#F8FAFC",
                border: "1px solid #E2E8F0",
                flexShrink: 0,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                <DescriptionRoundedIcon sx={{ fontSize: 18, color: "#6366F1" }} />
                <Typography
                  sx={{
                    fontSize: "0.75rem",
                    color: "#475569",
                    fontWeight: 600,
                    wordBreak: "break-word",
                  }}
                >
                  {file.name}
                </Typography>
              </Box>
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  resetState();
                  openFilePicker();
                }}
                disabled={saving}
                sx={{
                  textTransform: "none",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  borderRadius: 1.5,
                  borderColor: "#CBD5E1",
                  color: "#475569",
                  "&:hover": { borderColor: "#6366F1", color: "#4F46E5", bgcolor: "#F8FAFF" },
                }}
              >
                Choose Another File
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                hidden
                accept=".xlsx,.xls"
                onChange={handleFileChange}
              />
            </Box>
          )}

          <Box sx={{ display: "flex", gap: 0.8, mb: 2, flexWrap: "wrap", flexShrink: 0 }}>
            {statusTabs.map((tab) => {
              const meta = STATUS_META[tab.key];
              const isActive = activeFilter === tab.key;
              return (
                <Box
                  key={tab.key}
                  onClick={() => {
                    setActiveFilter(tab.key);
                    setPage(0);
                  }}
                  sx={{
                    px: 1.4,
                    py: 0.7,
                    borderRadius: 1.75,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 0.6,
                    bgcolor: isActive ? meta.bg : "#F8FAFC",
                    border: `1px solid ${isActive ? meta.border : "#E2E8F0"}`,
                    transition: "all 0.15s ease",
                    "&:hover": { bgcolor: meta.bg, borderColor: meta.border },
                  }}
                >
                  <Box sx={{ color: isActive ? meta.text : "#94A3B8", display: "flex" }}>
                    {meta.icon}
                  </Box>
                  <Typography
                    sx={{
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      color: isActive ? meta.text : "#64748B",
                    }}
                  >
                    {tab.label}
                  </Typography>
                  <Chip
                    label={tab.count}
                    size="small"
                    sx={{ height: 18, fontSize: "0.65rem", fontWeight: 800 }}
                  />
                </Box>
              );
            })}
          </Box>

          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              minWidth: 0,
              width: "100%",
              display: "flex",
              flexDirection: "column",
              borderRadius: 2,
              overflow: "hidden",

              "& > *": {
                flex: 1,
                minHeight: 0,
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              },

              "& .MuiTableContainer-root": {
                flex: 1,
                minHeight: 0,
                overflowX: "auto",
                overflowY: "auto",
                maxHeight: "none",
              },

              "& table": {
                width: "max-content",
                minWidth: "100%",
                tableLayout: "auto",
              },

              "& thead th": {
                position: "sticky",
                top: 0,
                zIndex: 3,
                backgroundColor: "#1E1B4B",
                color: "#FFFFFF",
                whiteSpace: "nowrap",
              },

              "& tbody td": {
                whiteSpace: "nowrap",
              },
            }}
          >
            {preview && (
              <ReactMaterialTable
                fillHeight
                data={paginatedRows}
                columns={columns}
                page={page}
                rowsPerPage={rowsPerPage}
                totalElements={filteredRows.length}
                onPageChange={(newPage, newRowsPerPage) => {
                  setPage(newPage);
                  setRowsPerPage(newRowsPerPage);
                }}
                onRowsPerPageChange={(value) => {
                  setRowsPerPage(value);
                  setPage(0);
                }}
              />
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 2.5, py: 1.5, flexShrink: 0 }}>
          {preview && preview.validCount === 0 ? (
            <Alert severity="error" sx={{ borderRadius: 2, flex: 1, fontSize: "0.78rem" }}>
              No valid rows available to save.
            </Alert>
          ) : (
            preview && (
              <Typography sx={{ fontSize: "0.78rem", color: "#64748B", flex: 1 }}>
                <b style={{ color: "#059669" }}>{preview.validCount}</b> of {preview.totalRows} rows
                are valid and ready to save.
                {preview.totalRows - preview.validCount > 0 &&
                  ` ${preview.totalRows - preview.validCount} invalid/duplicate rows will be skipped.`}
              </Typography>
            )
          )}
          <Button
            variant="contained"
            onClick={handleConfirmSave}
            disabled={saving || !canSave}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              fontSize: "0.78rem",
              borderRadius: 2,
              px: 2.5,
              minWidth: 150,
              background: "linear-gradient(135deg,#6366F1,#4F46E5)",
              boxShadow: "none",
              "&:hover": {
                background: "linear-gradient(135deg,#5558E8,#4338CA)",
                boxShadow: "none",
              },
            }}
          >
            {saving ? <CircularProgress size={18} sx={{ color: "#FFF" }} /> : "Confirm & Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UserExcelUpload;