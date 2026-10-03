import React, { useEffect, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Alert, Box, CircularProgress, Dialog, Snackbar, DialogContent, DialogActions, Button, Typography, IconButton, } from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import EditIcon from "@mui/icons-material/Edit";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ArrayForm from "@/components/array-form";
import { type UserFormData, type UserFormEntry, emptyUserEntry, userValidationSchema } from "@/pages/validations/user-validation";
import userService, { type Department, type Designation, type Role, type Branch, type Module, type Employee, type UserRequestData, } from "./api";

interface UpdateUserFormProps {
  id: number;
  selectedUser?: Partial<UserFormEntry> | null;
  departments: Department[];
  designations: Designation[];
  roles: Role[];
  branches: Branch[];
  modules: Module[];
  employees: Employee[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface UserResponse {
  id?: number | null;
  userId?: string | null;
  employeeId?: number | null;
  employeeCode?: string | null;
  fullName?: string | null;
  email?: string | null;
  mobileNumber?: string | null;
  departmentId?: number | null;
  designationId?: number | null;
  roleId?: number | null;
  branchIds?: number[] | null;
  reportingManager?: number | null;
  dashboard?: string | null;
  accessibleModules?: number[] | null;
  language?: string | null;
  timeZone?: string | null;
  loginType?: string | null;
  passwordExpiry?: number | null;
  twoFactorAuthentication?: boolean | null;
  remarks?: string | null;
  status?: boolean | null;
  profileImage?: string | null;
  digitalSignature?: string | null;
}

interface ApiResponse<T> {
  status?: string;
  message?: string;
  data?: T;
  error?: string;
}

const mapResponseToFormEntry = (user: UserResponse): UserFormEntry => {
  return {
    ...emptyUserEntry,
    id: user.id ?? null,
    userId: user.userId ?? "",
    employeeId: user.employeeId ?? null,
    employeeCode: user.employeeCode ?? "",
    fullName: user.fullName ?? "",
    email: user.email ?? "",
    mobileNumber: user.mobileNumber ?? "",
    departmentId: user.departmentId ?? null,
    designationId: user.designationId ?? null,
    roleId: user.roleId ?? null,
    branchIds: Array.isArray(user.branchIds) ? user.branchIds.map(Number) : [],
    reportingManager: user.reportingManager ?? null,
    dashboard: user.dashboard ?? "",
    accessibleModules: Array.isArray(user.accessibleModules) ? user.accessibleModules.map(Number) : [],
    language: user.language ?? "",
    timeZone: user.timeZone ?? "",
    loginType: user.loginType ?? "",
    passwordExpiry: user.passwordExpiry ?? null,
    twoFactorAuthentication: user.twoFactorAuthentication ?? false,
    profileImage: null,
    digitalSignature: null,
    remarks: user.remarks ?? "",
    status: Boolean(user.status),
  };
};

const mapFormEntryToRequest = (user: UserFormEntry): UserRequestData => {
  const request: UserRequestData = {
    id: user.id ?? undefined,
    userId: user.userId.trim(),
    employeeId: user.employeeId!,
    employeeCode: user.employeeCode.trim(),
    fullName: user.fullName.trim(),
    email: user.email.trim(),
    mobileNumber: user.mobileNumber,
    departmentId: user.departmentId!,
    designationId: user.designationId!,
    roleId: user.roleId!,
    branchIds: user.branchIds,
    language: user.language,
    loginType: user.loginType,
    status: Boolean(user.status),
    twoFactorAuthentication: user.twoFactorAuthentication,
  };

  if (user.reportingManager !== null && user.reportingManager !== undefined)
    request.reportingManager = user.reportingManager;
  if (user.dashboard.trim() !== "")
    request.dashboard = user.dashboard.trim();
  if (Array.isArray(user.accessibleModules))
    request.accessibleModules = user.accessibleModules;
  if (user.timeZone.trim() !== "")
    request.timeZone = user.timeZone.trim();
  if (user.passwordExpiry !== null && user.passwordExpiry !== undefined)
    request.passwordExpiry = user.passwordExpiry;
  if (user.remarks.trim() !== "")
    request.remarks = user.remarks.trim();
  return request;
};

const UpdateUserForm: React.FC<UpdateUserFormProps> = ({
  id,
  selectedUser = null,
  departments,
  designations,
  roles,
  branches,
  modules,
  employees,
  onSuccess,
  onCancel,
}) => {
  const [loadingUser, setLoadingUser] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<UserFormData>({
    defaultValues: {
      users: [
        {
          ...emptyUserEntry,
          status: false,
        },
      ],
    },
    resolver: yupResolver(userValidationSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  useEffect(() => {
    let mounted = true;
    const loadUser = async () => {
      try {
        setLoadingUser(true);
        if (selectedUser) {
          reset({
            users: [
              {
                ...emptyUserEntry,
                ...selectedUser,
              },
            ],
          });
          setLoadingUser(false);
          return;
        }
        const response = await userService.getUserById(id);
        const apiResponse = response as ApiResponse<UserResponse>;
        const userData = apiResponse?.data ?? (response as UserResponse);
        if (!userData) {
          throw new Error("User data not found.");
        }
        if (mounted) {
          reset({
            users: [mapResponseToFormEntry(userData)],
          });
        }
      } catch (error) {
        console.error("Failed to load user:", error);
        if (mounted) {
          setSnackbar({
            open: true,
            message: "Failed to load user details.",
            severity: "error",
          });
        }
      } finally {
        if (mounted) {
          setLoadingUser(false);
        }
      }
    };

    loadUser();
    return () => {
      mounted = false;
    };
  }, [id, selectedUser, reset]);

  const handleFormSubmit: SubmitHandler<UserFormData> = async (data) => {
    const user = data.users[0];

    if (!user) {
      return;
    }

    if (user.id == null) {
      setSnackbar({
        open: true,
        message: "User ID is missing. Cannot update user.",
        severity: "error",
      });
      return;
    }

    try {
      setSubmitting(true);
      const updatePayload = mapFormEntryToRequest(user);
      await userService.saveOrUpdateUsers([updatePayload]);
      const attachmentFormData = new FormData();
      if (user.profileImage instanceof File) {
        attachmentFormData.append(
          `profileImage_${user.userId}`,
          user.profileImage
        );
      }

      if (user.digitalSignature instanceof File) {
        attachmentFormData.append(
          `digitalSignature_${user.userId}`,
          user.digitalSignature
        );
      }

      if ([...attachmentFormData.keys()].length > 0) {
        await userService.uploadAttachments(attachmentFormData);
      }

      setSuccessDialogOpen(true);
    } catch (error: any) {
      console.error("Update user failed:", error);

      const message =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update user.";

      setSnackbar({
        open: true,
        message: String(message),
        severity: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (submitting) {
      return;
    }
    onCancel?.();
  };

  if (loadingUser) {
    return (
      <Box sx={{ width: "100%", height: "100%", minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden", bgcolor: "#F8FAFC" }}>
        <CircularProgress size={28} />
        <Typography
          sx={{
            fontSize: "0.82rem",
            color: "#64748B",
          }}
        >
          Loading user details...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", bgcolor: "#F8FAFC" }}>
      {/* Fixed Header */}
      <Box
        sx={{
          minHeight: 70,
          px: { xs: 2, sm: 3 },
          py: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "linear-gradient(135deg,#172033 0%,#263B63 100%)",
          color: "#FFF",
          flexShrink: 0,
          position: "sticky",
          top: 0,
          zIndex: 10,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              display: "grid",
              placeItems: "center",
              bgcolor: "rgba(255,255,255,.12)",
              border: "1px solid rgba(255,255,255,.15)",
            }}
          >
            <EditIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Typography
              sx={{
                fontSize: "1rem",
                fontWeight: 700,
                lineHeight: 1.2,
              }}
            >
              Edit User
            </Typography>
            <Typography
              sx={{
                fontSize: ".7rem",
                color: "#94A3B8",
                display: "flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              <Box
                component="span"
                sx={{
                  display: "inline-block",
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  bgcolor: "#FBBF24",
                  mr: 0.5,
                }}
              />
              Update user information
            </Typography>
          </Box>
        </Box>

        <IconButton
          onClick={handleCancel}
          sx={{
            width: 34,
            height: 34,
            color: "#94A3B8",
            border: "1px solid rgba(255,255,255,.1)",
            bgcolor: "rgba(255,255,255,.06)",
            "&:hover": {
              bgcolor: "rgba(255,255,255,.15)",
              color: "#FFF",
            },
          }}
        >
          <CloseRoundedIcon sx={{ fontSize: 17 }} />
        </IconButton>
      </Box>

      {/* Scrollable Content */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          px: { xs: 1.5, sm: 2.5, md: 3 },
          py: { xs: 1.5, sm: 2, md: 2.5 },
          pb: "calc(16px + env(safe-area-inset-bottom))",
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit(handleFormSubmit)}
          noValidate
        >
          <ArrayForm
            control={control}
            register={register}
            errors={errors}
            departments={departments}
            designations={designations}
            roles={roles}
            branches={branches}
            modules={modules}
            employees={employees}
            setValue={setValue}
            getValues={getValues}
            setError={setError}
            clearErrors={clearErrors}
            isSubmitting={submitting}
            onCancel={handleCancel}
            showStatus={true}
            allowMultiple={false}
            showActions={true}
            reset={reset}
          />
        </Box>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() =>
          setSnackbar((previous) => ({
            ...previous,
            open: false,
          }))
        }
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() =>
            setSnackbar((previous) => ({
              ...previous,
              open: false,
            }))
          }
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Success Dialog */}
      <Dialog
        open={successDialogOpen}
        onClose={() => {
          setSuccessDialogOpen(false);
          onSuccess?.();
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogContent sx={{ textAlign: "center", p: 3 }}>
          <CheckCircleRoundedIcon
            sx={{ fontSize: 60, color: "#16A34A", mb: 2 }}
          />
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: "#172033", mb: 1 }}
          >
            User Updated Successfully!
          </Typography>
          <Typography sx={{ color: "#64748B", fontSize: "0.85rem", mb: 3 }}>
            User details have been updated successfully.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 3, gap: 1 }}>
          <Button
            variant="contained"
            onClick={() => {
              setSuccessDialogOpen(false);
              onSuccess?.();
            }}
            sx={{ minWidth: 100 }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UpdateUserForm;