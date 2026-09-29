import {
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import DescriptionIcon from "@mui/icons-material/Description";
import { useState } from "react";

import userService, {
  UserFilters as ApiUserFilters,
} from "../pages/user/api";

import type { UserFilters } from "../pages/store/slices/user-filter-slice";

interface UserExcelDownloadProps {
  filters?: UserFilters;
}

export const mapToApiFilters = (
  f?: UserFilters,
): ApiUserFilters => {
  if (!f) return {};

  return {
    search: f.globalSearch || undefined,

    status:
      f.status === "" || f.status === undefined
        ? undefined
        : f.status === "true",

    employeeName: f.employeeName || undefined,

    // UI currently contains master values as strings.
    // Send them only if your backend expects IDs.
    departmentId: f.department
      ? Number(f.department)
      : undefined,

    designationId: f.designation
      ? Number(f.designation)
      : undefined,

    branchId: f.branch
      ? Number(f.branch)
      : undefined,

    roleId: f.role
      ? Number(f.role)
      : undefined,

    fromDate: f.createdDateFrom || undefined,
    toDate: f.createdDateTo || undefined,
  };
};

const UserExcelDownload = ({
  filters,
}: UserExcelDownloadProps) => {
  const [emailDialogOpen, setEmailDialogOpen] =
    useState(false);

  const [emailLoading, setEmailLoading] =
    useState(false);

  const triggerDownload = (
    blob: Blob,
    filename: string,
  ) => {
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = blobUrl;
    link.setAttribute("download", filename);

    document.body.appendChild(link);

    link.click();

    link.remove();

    window.URL.revokeObjectURL(blobUrl);
  };

  const handleTemplateDownload = async () => {
    try {
      const blob = await userService.downloadTemplate();

      triggerDownload(
        blob,
        "user_master_template.xlsx",
      );
    } catch (err) {
      console.error(
        "Template download failed",
        err,
      );

      alert("Download failed");
    }
  };

  const handleDownload = async () => {
    try {
      const apiFilters = mapToApiFilters(filters);

      console.log("Download filters:", apiFilters);

      const response = await userService.downloadExcel(apiFilters);

      console.log("Download response:", response);
      console.log(
        "Content-Type:",
        response.headers["content-type"],
      );

      const contentType = String(
        response.headers["content-type"] || "",
      ).toLowerCase();

      if (contentType.includes("application/json")) {
        const text = new TextDecoder().decode(
          response.data,
        );

        const data = JSON.parse(text);

        console.log("JSON response:", data);

        if (data?.data === true) {
          setEmailDialogOpen(true);
          return;
        }

        alert(
          data?.message || "Download failed",
        );

        return;
      }
      const blob = new Blob(
        [response.data],
        {
          type:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      );

      console.log(
        "Excel blob size:",
        blob.size,
      );

      if (blob.size === 0) {
        alert("Excel file is empty.");
        return;
      }

      triggerDownload(
        blob,
        "user_master_export.xlsx",
      );
    } catch (err) {
      console.error(
        "Download failed:",
        err,
      );

      alert("Download failed");
    }
  };

  const handleEmailExport = async () => {
    try {
      setEmailLoading(true);

      const apiFilters =
        mapToApiFilters(filters);

      const response =
        await userService.sendExcelByEmail(
          apiFilters,
        );

      alert(
        response?.message ||
        "Excel has been sent to your email.",
      );

      setEmailDialogOpen(false);
    } catch (err) {
      console.error(
        "Email export failed",
        err,
      );

      alert(
        "Failed to send Excel by email.",
      );
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
      <Stack
        direction="row"
        spacing={1}
      >
        <Button
          variant="outlined"
          startIcon={
            <DescriptionIcon />
          }
          onClick={
            handleTemplateDownload
          }
        >
          Download Template
        </Button>

        <Button
          variant="outlined"
          startIcon={
            <DownloadIcon />
          }
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
        <DialogTitle>
          Email Excel Export
        </DialogTitle>

        <DialogContent>
          <Typography>
            The selected date range is
            more than 7 days.
            <br />
            Would you like to receive
            the Excel file by email?
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={
              handleCancelEmail
            }
            disabled={emailLoading}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={
              handleEmailExport
            }
            disabled={emailLoading}
          >
            {emailLoading
              ? "Sending..."
              : "Email"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UserExcelDownload;