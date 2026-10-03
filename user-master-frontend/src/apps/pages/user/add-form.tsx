import React from "react";
import { Box, CircularProgress, Typography, Dialog, DialogContent, DialogActions, Button, Alert, Snackbar, IconButton, } from "@mui/material";
import userService from "@/pages/user/api";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useForm, type SubmitHandler, type FieldErrors, } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import ArrayForm from "@/components/array-form";
import { useUser } from "@/pages/hooks/useUser";
import type { Department, Designation, Role, Branch, Module, Employee, UserRequestData, } from "./api";
import { userValidationSchema, emptyUserEntry, type UserFormData, } from "@/pages/validations/user-validation";

interface AddUserFormProps {
  departments: Department[];
  designations: Designation[];
  roles: Role[];
  branches: Branch[];
  modules: Module[];
  employees: Employee[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

const createEmptyUser = () => ({
  ...emptyUserEntry,
  branchIds: [],
  accessibleModules: [],
  status: false,
});

const AddUserForm: React.FC<AddUserFormProps> = ({
  departments,
  designations,
  roles,
  branches,
  employees,
  modules,
  onSuccess,
  onCancel,
}) => {
  const { loading } = useUser();
  const [successDialogOpen, setSuccessDialogOpen] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    defaultValues: {
      users: [createEmptyUser()],
    },
    resolver: yupResolver(userValidationSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  const onSubmit: SubmitHandler<UserFormData> = async (data) => {
    try {
      const usersPayload: UserRequestData[] = data.users.map((user) => {
        const {
          id: _id,
          status: _status,
          profileImage: _profileImage,
          digitalSignature: _digitalSignature,
          ...userData
        } = user;

        return {
          ...userData,
          ...(user.id ? { id: user.id } : {}),
          userId: user.userId.trim(),
          employeeId: user.employeeId!,
          employeeCode: user.employeeCode.trim(),
          fullName: user.fullName.trim(),
          email: user.email.trim(),
          departmentId: user.departmentId!,
          designationId: user.designationId!,
          roleId: user.roleId!,
          mobileNumber: user.mobileNumber,
          branchIds: user.branchIds?.length ? user.branchIds.map(Number) : [],
          language: user.language,
          loginType: user.loginType,
          reportingManager: user.reportingManager,
          dashboard: user.dashboard,
          accessibleModules: user.accessibleModules?.length ? user.accessibleModules.map(Number) : [],
          timeZone: user.timeZone,
          passwordExpiry: user.passwordExpiry,
          twoFactorAuthentication: user.twoFactorAuthentication,
          remarks: user.remarks,
          status: user.status,
        };
      });

      await userService.saveOrUpdateUsers(usersPayload);
      const attachmentFormData = new FormData();
      data.users.forEach((user) => {
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
      });

      if ([...attachmentFormData.keys()].length > 0) {
        await userService.uploadAttachments(attachmentFormData);
      }

      reset({
        users: [createEmptyUser()],
      });
      setSuccessDialogOpen(true);
    } catch (error: any) {
      console.error("Error creating users:", error);
      console.error("Status:", error?.response?.status);
      console.error("Backend response:", error?.response?.data);

      const message =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create users.";

      setSnackbar({
        open: true,
        message: String(message),
        severity: "error",
      });
    }
  };

  const onError = (formErrors: FieldErrors<UserFormData>) => {
    console.warn("Add user validation errors:", formErrors);
  };
  const submitting = isSubmitting || loading;

  return (
    <Box sx={{ width: "100%", flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden", bgcolor: "#F8FAFC" }}>
      {/* Header - Fixed at top */}
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
            <PersonAddIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Typography
              sx={{
                fontSize: "1rem",
                fontWeight: 700,
                lineHeight: 1.2,
              }}
            >
              Add New User
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
                  bgcolor: "#22C55E",
                  mr: 0.5,
                }}
              />
              Fill in the details below to create a new user account
            </Typography>
          </Box>
        </Box>

        <IconButton
          onClick={onCancel}
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
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit, onError)}
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
            getValues={getValues}
            setError={setError}
            clearErrors={clearErrors}
            modules={modules}
            employees={employees}
            setValue={setValue}
            isSubmitting={submitting}
            onCancel={onCancel}
            showStatus={false}
            allowMultiple={true}
            showActions={true}
            reset={reset}
          />
        </Box>

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
      </Box>

      {/* Snackbar and Dialog */}
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
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#172033", mb: 1 }}>
            User Added Successfully!
          </Typography>
          <Typography sx={{ color: "#64748B", fontSize: "0.85rem", mb: 3 }}>
            New user has been created successfully.
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

export default AddUserForm;