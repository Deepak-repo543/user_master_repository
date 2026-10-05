import { Button, Stack, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import DescriptionIcon from "@mui/icons-material/Description";
import { useState } from "react";
import userService, { UserFilters as ApiUserFilters } from "../pages/user/api";
import type { UserFilters } from "../pages/store/slices/user-filter-slice";

interface UserExcelDownloadProps {
  filters?: UserFilters;
  onUnauthorized?: (message: string) => void;
  onError?: (message: string) => void;
  onSuccess?: (message: string) => void;
}

export const mapToApiFilters = (f?: UserFilters): ApiUserFilters => {
  if (!f) return {};

  return {
    search: f.globalSearch || undefined,
    status: f.status === "" || f.status === undefined ? undefined : f.status === "true",
    employeeName: f.employeeName || undefined,
    departmentId: f.department ? Number(f.department) : undefined,
    designationId: f.designation ? Number(f.designation) : undefined,
    branchId: f.branch ? Number(f.branch) : undefined,
    roleId: f.role ? Number(f.role) : undefined,
    fromDate: f.createdDateFrom || undefined,
    toDate: f.createdDateTo || undefined,
  };
};

const isUnauthorized = (err: any) => [401, 403].includes(err?.response?.status);
const triggerDownload = (blob: Blob, filename: string) => {
  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
};

const UserExcelDownload = ({
  filters,
  onUnauthorized,
  onError,
  onSuccess,
}: UserExcelDownloadProps) => {
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  const handleTemplateDownload = async () => {
    try {
      const blob = await userService.downloadTemplate();
      triggerDownload(blob, "user_master_template.xlsx");
    } catch (error: any) {
      console.error("Template download failed:", error);

      if (isUnauthorized(error)) {
        onUnauthorized?.("You are not authorized to download the template.");
        return;
      }

      onError?.("Template download failed.");
    }
  };

  const handleDownload = async () => {
    try {
      const apiFilters = mapToApiFilters(filters);
      const response = await userService.downloadExcel(apiFilters);
      const contentType = String(response.headers["content-type"] || "",).toLowerCase();
      if (contentType.includes("application/json")) {
        const text = new TextDecoder().decode(response.data);
        const data = JSON.parse(text);

        if (data?.data === true) {
          setEmailDialogOpen(true);
          return;
        }
        onError?.(data?.message || "Download failed.");
        return;
      }

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      if (blob.size === 0) {
        onError?.("Excel file is empty.");
        return;
      }

      triggerDownload(blob, "user_master_export.xlsx");
    } catch (err: any) {
      console.error("Download failed:", err);

      if (isUnauthorized(err)) {
        onUnauthorized?.("You are not authorized to download Excel.");
        return;
      }
      onError?.("Download failed.");
    }
  };

  const handleEmailExport = async () => {
    try {
      setEmailLoading(true);
      const apiFilters = mapToApiFilters(filters);
      const response = await userService.sendExcelByEmail(apiFilters);
      setEmailDialogOpen(false);
      onSuccess?.(response?.message || "Excel has been sent to your email.");
    } catch (err: any) {
      console.error("Email export failed", err);

      if (isUnauthorized(err)) {
        setEmailDialogOpen(false);
        onUnauthorized?.("You are not authorized to export Excel.");
        return;
      }

      onError?.("Failed to send Excel by email.");
    } finally {
      setEmailLoading(false);
    }
  };

  const handleCancelEmail = () => {
    if (!emailLoading) {
      setEmailDialogOpen(false);
    }
  };

  return (
    <>
      <Stack direction="row" spacing={1}>
        <Button
          variant="outlined"
          startIcon={<DescriptionIcon />}
          onClick={handleTemplateDownload}
        >
          Download Template
        </Button>

        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleDownload}
        >
          Download Excel
        </Button>
      </Stack>

      <Dialog
        open={emailDialogOpen}
        onClose={handleCancelEmail}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Email Excel Export</DialogTitle>

        <DialogContent>
          <Typography>
            The selected date range is more than 7 days.
            <br />
            Would you like to receive the Excel file by email?
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCancelEmail} disabled={emailLoading}>
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleEmailExport}
            disabled={emailLoading}
          >
            {emailLoading ? "Sending..." : "Email"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UserExcelDownload;