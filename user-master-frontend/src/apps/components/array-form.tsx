import React from "react";
import { useFieldArray, Controller, type Control, type FieldErrors, type UseFormRegister, type UseFormReset, type UseFormSetValue, type UseFormGetValues, type UseFormSetError, type UseFormClearErrors, } from "react-hook-form";
import { Box, Button, Grid, MenuItem, TextField, Typography, FormControlLabel, Autocomplete, Radio, RadioGroup, FormLabel, Select, InputLabel, FormControl, Checkbox, ListItemText, } from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import { type UserFormData, emptyUserEntry } from "@/pages/validations/user-validation";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import type { Department, Designation, Employee, Role, Branch, Module } from "@/pages/user/api";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseIcon from "@mui/icons-material/Close";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import IconButton from "@mui/material/IconButton";

type UniqueFieldName = "userId" | "employeeId" | "employeeCode" | "mobileNumber" | "fullName";

const UNIQUE_FIELD_LABELS: Record<UniqueFieldName, string> = {
  userId: "User ID",
  employeeId: "Employee",
  employeeCode: "Employee Code",
  mobileNumber: "Mobile Number",
  fullName: "Full Name",
};

const FIELD_ORDER = [
  "userId",
  "employeeId",
  "employeeCode",
  "fullName",
  "email",
  "mobileNumber",
  "departmentId",
  "designationId",
  "roleId",
  "branchIds",
  "reportingManager",
  "dashboard",
  "status",
  "accessibleModules",
  "language",
  "timeZone",
  "loginType",
  "passwordExpiry",
  "twoFactorAuthentication",
  "profileImage",
  "digitalSignature",
  "remarks",
] as const;

interface ArrayFormProps {
  control: Control<UserFormData>;
  register: UseFormRegister<UserFormData>;
  errors: FieldErrors<UserFormData>;
  isSubmitting: boolean;
  departments: Department[];
  designations: Designation[];
  roles: Role[];
  branches: Branch[];
  modules: Module[];
  employees: Employee[];
  setValue: UseFormSetValue<UserFormData>;
  getValues: UseFormGetValues<UserFormData>;
  setError: UseFormSetError<UserFormData>;
  clearErrors: UseFormClearErrors<UserFormData>;
  reset: UseFormReset<UserFormData>;
  onCancel?: () => void;
  showStatus?: boolean;
  allowMultiple?: boolean;
  showActions?: boolean;
  checkUniqueness?: (
    field: UniqueFieldName,
    value: string,
    currentIndex: number
  ) => Promise<boolean>;
}

const fieldSx = {
  "& .MuiInputBase-root": {
    fontSize: "0.82rem",
  },
  "& .MuiInputBase-input::placeholder": {
    opacity: 1,
    color: "#94A3B8",
  },
  "& .MuiFormHelperText-root": {
    fontSize: "0.68rem",
    marginLeft: 0,
    marginTop: "2px",
  },
};

const selectWithClearSx = {
  ...fieldSx,
  "& .MuiSelect-icon": {
    right: 34,
  },
};

const FieldLabel: React.FC<{ children: React.ReactNode; required?: boolean }> = ({
  children,
  required,
}) => (
  <Typography
    component="label"
    sx={{
      display: "block",
      fontSize: "0.72rem",
      fontWeight: 600,
      color: "#475569",
      mb: 0.5,
    }}
  >
    {children}
    {required && <span style={{ color: "#d32f2f" }}> *</span>}
  </Typography>
);

const FieldError: React.FC<{ message?: string }> = ({ message }) =>
  message ? (
    <Typography sx={{ color: "#d32f2f", fontSize: "0.68rem", mt: 0.5 }}>{message}</Typography>
  ) : null;

interface FieldSlotProps {
  name: string;
  highlighted: boolean;
  registerRef: (name: string, el: HTMLDivElement | null) => void;
  children: React.ReactNode;
}

const FieldSlot: React.FC<FieldSlotProps> = ({ name, highlighted, registerRef, children }) => (
  <Box
    ref={(el: HTMLDivElement | null) => registerRef(name, el)}
    sx={{
      borderRadius: 1.5,
      transition: "box-shadow 0.25s ease, background-color 0.25s ease",
      scrollMarginTop: "96px",
      ...(highlighted && {
        boxShadow: "0 0 0 2px #DC2626",
        backgroundColor: "#FEF2F2",
        p: 0.75,
        m: -0.75,
      }),
    }}
  >
    {children}
  </Box>
);

interface SelectOption {
  id: number | string;
  label: string;
}

interface ClearableSelectProps {
  label: string;
  required?: boolean;
  placeholder: string;
  value: number | string | null | undefined;
  onChange: (value: number | null) => void;
  options: SelectOption[];
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
}

const ClearableSelect: React.FC<ClearableSelectProps> = ({
  label,
  required,
  placeholder,
  value,
  onChange,
  options,
  disabled,
  error,
  helperText,
}) => {
  const hasValue = value !== null && value !== undefined && value !== ("" as never);

  return (
    <>
      <FieldLabel required={required}>{label}</FieldLabel>
      <FormControl fullWidth size="small" sx={selectWithClearSx} error={error} disabled={disabled}>
        <Select
          displayEmpty
          value={hasValue ? value : ""}
          onChange={(e) => {
            const raw = e.target.value;
            if (raw === "") {
              onChange(null);
              return;
            }
            const matched = options.find((o) => String(o.id) === String(raw));
            onChange((matched?.id ?? raw) as never);
          }}
          renderValue={(selected) => {
            if (selected === "" || selected === undefined || selected === null) {
              return <span style={{ color: "#94A3B8" }}>{placeholder}</span>;
            }
            const opt = options.find((o) => String(o.id) === String(selected));
            return opt?.label ?? String(selected);
          }}
          endAdornment={
            hasValue && !disabled ? (
              <IconButton
                size="small"
                sx={{ mr: 2.5 }}
                tabIndex={-1}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(null);
                }}
              >
                <CloseIcon sx={{ fontSize: 16 }} />
              </IconButton>
            ) : null
          }
        >
          {options.map((opt) => (
            <MenuItem key={opt.id} value={opt.id}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FieldError message={helperText} />
    </>
  );
};

const SELECT_ALL_VALUE = "__select_all__";

interface MultiSelectOption {
  id: number | string;
  label: string;
}

interface MultiSelectWithSelectAllProps {
  label: string;
  required?: boolean;
  placeholder: string;
  value: (number | string)[] | null | undefined;
  onChange: (ids: number[]) => void;
  options: MultiSelectOption[];
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
}

const MultiSelectWithSelectAll: React.FC<MultiSelectWithSelectAllProps> = ({
  label,
  required,
  placeholder,
  value,
  onChange,
  options,
  disabled,
  error,
  helperText,
}) => {
  const selectedIds = (Array.isArray(value) ? value : []).map(String);
  const allSelected = options.length > 0 && selectedIds.length === options.length;
  const someSelected = selectedIds.length > 0 && !allSelected;

  const handleChange = (e: SelectChangeEvent<string[]>) => {
    const raw = e.target.value;
    const values = typeof raw === "string" ? raw.split(",") : raw;

    if (values.includes(SELECT_ALL_VALUE)) {
      onChange(allSelected ? [] : options.map((o) => Number(o.id)));
      return;
    }
    onChange(values.filter(Boolean).map(Number));
  };

  return (
    <>
      <FieldLabel required={required}>{label}</FieldLabel>
      <FormControl fullWidth size="small" sx={selectWithClearSx} error={error} disabled={disabled}>
        <Select
          multiple
          displayEmpty
          value={selectedIds}
          onChange={handleChange}
          renderValue={(selected) => {
            const sel = selected as string[];
            if (sel.length === 0) {
              return <span style={{ color: "#94A3B8" }}>{placeholder}</span>;
            }
            if (allSelected) {
              return `All selected (${options.length})`;
            }
            return sel
              .map((id) => options.find((o) => String(o.id) === id)?.label ?? id)
              .join(", ");
          }}
          endAdornment={
            selectedIds.length > 0 && !disabled ? (
              <IconButton
                size="small"
                sx={{ mr: 2.5 }}
                tabIndex={-1}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange([]);
                }}
              >
                <CloseIcon sx={{ fontSize: 16 }} />
              </IconButton>
            ) : null
          }
        >
          <MenuItem value={SELECT_ALL_VALUE} disabled={options.length === 0}>
            <Checkbox
              size="small"
              checked={allSelected}
              indeterminate={someSelected}
              sx={{ p: 0.5, mr: 1 }}
            />
            <ListItemText
              primary={allSelected ? "Unselect All" : "Select All"}
              slotProps={{
                primary: {
                  sx: {
                    fontSize: "0.82rem",
                    fontWeight: 600,
                  },
                },
              }}
            />
          </MenuItem>

          {options.map((opt) => (
            <MenuItem key={opt.id} value={String(opt.id)}>
              <Checkbox
                size="small"
                checked={selectedIds.includes(String(opt.id))}
                sx={{ p: 0.5, mr: 1 }}
              />
              <ListItemText
                primary={opt.label}
                slotProps={{
                  primary: {
                    sx: {
                      fontSize: "0.82rem",
                    },
                  },
                }}
              />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FieldError message={helperText} />
    </>
  );
};

interface FileUploadFieldProps {
  label: string;
  value: File | null | undefined;
  onChange: (file: File | null) => void;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  accept?: string;
  maxSizeMb?: number;
}

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const FileUploadField: React.FC<FileUploadFieldProps> = ({
  label,
  value,
  onChange,
  disabled,
  error,
  helperText,
  accept = ".jpg,.jpeg,.png",
  maxSizeMb = 5,
}) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [sizeError, setSizeError] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (value instanceof File) {
      const url = URL.createObjectURL(value);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreview(null);
  }, [value]);

  const applyFile = (file: File | null) => {
    setSizeError(false);
    if (!file) {
      onChange(null);
      return;
    }
    if (file.size > maxSizeMb * 1024 * 1024) {
      setSizeError(true);
      onChange(null);
      return;
    }
    onChange(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0] ?? null;
    applyFile(file);
  };

  return (
    <>
      <FieldLabel>{label}</FieldLabel>
      <Box
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.2,
          border: "1px dashed",
          borderColor: error || sizeError ? "#d32f2f" : isDragging ? "#2563EB" : "#CBD5E1",
          backgroundColor: isDragging ? "#EFF6FF" : value instanceof File ? "#F8FAFC" : "#FFFFFF",
          borderRadius: 1.5,
          px: 1.5,
          py: 1,
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.6 : 1,
          transition: "border-color 0.15s, background-color 0.15s",
        }}
      >
        <input
          ref={inputRef}
          hidden
          type="file"
          accept={accept}
          disabled={disabled}
          onChange={(e) => {
            const file = e.target.files?.[0] ?? null;
            applyFile(file);
            e.target.value = "";
          }}
        />

        {value instanceof File && preview ? (
          <Box
            component="img"
            src={preview}
            alt={value.name}
            sx={{
              width: 36,
              height: 36,
              objectFit: "cover",
              borderRadius: 1,
              border: "1px solid #E2E8F0",
              flexShrink: 0,
            }}
          />
        ) : (
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1,
              backgroundColor: "#F1F5F9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {value instanceof File ? (
              <ImageRoundedIcon sx={{ fontSize: 18, color: "#64748B" }} />
            ) : (
              <UploadFileRoundedIcon sx={{ fontSize: 18, color: "#64748B" }} />
            )}
          </Box>
        )}

        <Box sx={{ minWidth: 0, flex: 1 }}>
          {value instanceof File ? (
            <>
              <Typography noWrap sx={{ fontSize: "0.78rem", fontWeight: 600, color: "#1E293B" }}>
                {value.name}
              </Typography>
              <Typography sx={{ fontSize: "0.68rem", color: "#64748B" }}>
                {formatBytes(value.size)}
              </Typography>
            </>
          ) : (
            <>
              <Typography sx={{ fontSize: "0.78rem", color: "#475569" }}>
                Click or drag a file here to upload
              </Typography>
              <Typography sx={{ fontSize: "0.68rem", color: "#94A3B8" }}>
                JPG, JPEG, PNG · Max {maxSizeMb} MB
              </Typography>
            </>
          )}
        </Box>

        {value instanceof File && (
          <IconButton
            size="small"
            color="error"
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation();
              applyFile(null);
            }}
            sx={{ flexShrink: 0 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
      <FieldError message={sizeError ? `File must be under ${maxSizeMb} MB` : helperText} />
    </>
  );
};

const getFirstErrorFieldPath = (
  errors: FieldErrors<UserFormData>,
  fieldsLength: number
): string | null => {
  const usersErrors = (errors as any)?.users;
  if (!usersErrors) return null;

  for (let i = 0; i < fieldsLength; i++) {
    const userErr = usersErrors[i];
    if (!userErr) continue;
    for (const key of FIELD_ORDER) {
      if (userErr[key]?.message) {
        return `users.${i}.${key}`;
      }
    }
  }
  return null;
};

const buildErrorSignature = (
  errors: FieldErrors<UserFormData>,
  fieldsLength: number
): string => {
  const usersErrors = (errors as any)?.users;
  if (!usersErrors) return "";

  const parts: string[] = [];
  for (let i = 0; i < fieldsLength; i++) {
    const userErr = usersErrors[i];
    if (!userErr) continue;
    for (const key of FIELD_ORDER) {
      const message = userErr[key]?.message;
      if (message) parts.push(`${i}.${key}:${message}`);
    }
  }
  return parts.join("|");
};

const ArrayForm: React.FC<ArrayFormProps> = ({
  control,
  register,
  errors,
  departments = [],
  designations = [],
  roles = [],
  branches = [],
  modules = [],
  employees = [],
  setValue,
  getValues,
  setError,
  clearErrors,
  isSubmitting = false,
  onCancel,
  showStatus = false,
  allowMultiple = true,
  showActions = false,
  reset,
  checkUniqueness,
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "users",
  });

  const allBranchIds = React.useMemo(() => branches.map((b) => b.id), [branches]);
  const allModuleIds = React.useMemo(() => modules.map((m) => m.id), [modules]);

  const hasAutoSelectedRef = React.useRef(false);

  React.useEffect(() => {
    if (hasAutoSelectedRef.current) return;
    if (allBranchIds.length === 0 && allModuleIds.length === 0) return;
    if (typeof getValues !== "function" || typeof setValue !== "function") {
      console.warn(
        "[ArrayForm] `getValues` prop is missing — pass `getValues` from your parent's useForm() to enable auto-select of branches/modules."
      );
      return;
    }

    fields.forEach((_, idx) => {
      const currentBranchIds = getValues(`users.${idx}.branchIds`);
      const currentModules = getValues(`users.${idx}.accessibleModules`);

      if (!currentBranchIds || currentBranchIds.length === 0) {
        setValue(`users.${idx}.branchIds`, allBranchIds, { shouldValidate: false });
      }
      if (!currentModules || currentModules.length === 0) {
        setValue(`users.${idx}.accessibleModules`, allModuleIds, { shouldValidate: false });
      }
    });

    hasAutoSelectedRef.current = true;
  }, [allBranchIds, allModuleIds]);

  const handleAddUser = () => {
    append({
      ...emptyUserEntry,
      branchIds: allBranchIds,
      accessibleModules: allModuleIds,
      status: false,
    });
  };

  const handleRemoveUser = (index: number) => {
    if (fields.length <= 1) {
      return;
    }
    remove(index);
  };

  const fieldRefs = React.useRef<Record<string, HTMLDivElement | null>>({});
  const registerFieldRef = React.useCallback((name: string, el: HTMLDivElement | null) => {
    fieldRefs.current[name] = el;
  }, []);

  const [highlightedField, setHighlightedField] = React.useState<string | null>(null);
  const prevErrorSignatureRef = React.useRef<string>("");

  React.useEffect(() => {
    const signature = buildErrorSignature(errors, fields.length);
    if (signature === prevErrorSignatureRef.current) return;
    prevErrorSignatureRef.current = signature;

    const firstErrorPath = getFirstErrorFieldPath(errors, fields.length);
    if (!firstErrorPath) {
      setHighlightedField(null);
      return;
    }

    const el = fieldRefs.current[firstErrorPath];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      const focusable = el.querySelector(
        "input, textarea, [role='combobox'], [role='button']"
      ) as HTMLElement | null;
      focusable?.focus?.();
    }

    setHighlightedField(firstErrorPath);
    const timer = setTimeout(() => setHighlightedField(null), 3000);
    return () => clearTimeout(timer);
  }, [errors, fields.length]);

  const handleUniqueBlur = React.useCallback(
    async (
      index: number,
      fieldName: UniqueFieldName,
      rawValue: string | number | null | undefined
    ) => {
      if (typeof getValues !== "function" || typeof setError !== "function" || typeof clearErrors !== "function") {
        console.warn(
          "[ArrayForm] `getValues`/`setError`/`clearErrors` props are missing — pass them from your parent's useForm() to enable uniqueness validation."
        );
        return;
      }

      const value = rawValue === null || rawValue === undefined ? "" : String(rawValue).trim();
      const fieldPath = `users.${index}.${fieldName}` as const;

      if (!value) {
        clearErrors(fieldPath as never);
        return;
      }

      const allUsers = (getValues("users") ?? []) as any[];
      const duplicateIndex = allUsers.findIndex((u, i) => {
        if (i === index) return false;
        const otherValue = u?.[fieldName];
        return (
          otherValue !== null &&
          otherValue !== undefined &&
          String(otherValue).trim().toLowerCase() === value.toLowerCase()
        );
      });

      if (duplicateIndex !== -1) {
        setError(fieldPath as never, {
          type: "duplicate",
          message: `This ${UNIQUE_FIELD_LABELS[fieldName]} is already used in User ${duplicateIndex + 1} of this form`,
        });
        return;
      }

      clearErrors(fieldPath as never);

      if (checkUniqueness) {
        try {
          const isUnique = await checkUniqueness(fieldName, value, index);
          if (!isUnique) {
            setError(fieldPath as never, {
              type: "unique",
              message: `This ${UNIQUE_FIELD_LABELS[fieldName]} is already registered`,
            });
          }
        } catch {
        }
      }
    },
    [getValues, setError, clearErrors, checkUniqueness]
  );

  return (
    <Box sx={{ width: "100%" }}>
      {fields.map((item, index) => {
        const userErrors = errors.users?.[index];
        const userIdRegister = register(`users.${index}.userId`);

        return (
          <Box
            key={item.id}
            sx={{
              border: "1px solid #E2E8F0",
              borderRadius: 2,
              p: { xs: 1.5, sm: 2 },
              mb: 2,
              backgroundColor: "#FFFFFF",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1.5,
                pb: 1,
                borderBottom: "1px solid #F1F5F9",
              }}
            >
              <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#1E293B" }}>
                User {index + 1}
              </Typography>
              {allowMultiple && fields.length > 1 && (
                <Button
                  color="error"
                  size="small"
                  variant="outlined"
                  type="button"
                  startIcon={<DeleteOutlineRoundedIcon fontSize="small" />}
                  onClick={() => handleRemoveUser(index)}
                  disabled={isSubmitting}
                  sx={{ minWidth: 82, height: 32, textTransform: "none", fontSize: "0.75rem" }}
                >
                  Remove
                </Button>
              )}
            </Box>

            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <FieldSlot
                  name={`users.${index}.userId`}
                  highlighted={highlightedField === `users.${index}.userId`}
                  registerRef={registerFieldRef}
                >
                  <FieldLabel required>User ID</FieldLabel>
                  <TextField
                    {...userIdRegister}
                    fullWidth
                    size="small"
                    sx={fieldSx}
                    placeholder="Enter user ID"
                    disabled={isSubmitting}
                    error={!!userErrors?.userId}
                    onBlur={(e) => {
                      userIdRegister.onBlur(e);
                      handleUniqueBlur(index, "userId", e.target.value);
                    }}
                  />
                  <FieldError message={userErrors?.userId?.message} />
                </FieldSlot>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <FieldSlot
                  name={`users.${index}.employeeId`}
                  highlighted={highlightedField === `users.${index}.employeeId`}
                  registerRef={registerFieldRef}
                >
                  <FieldLabel required>Employee</FieldLabel>
                  <Controller
                    name={`users.${index}.employeeId`}
                    control={control}
                    render={({ field }) => {
                      const selectedEmployee =
                        employees.find((employee) => employee.id === field.value) ?? null;

                      return (
                        <Autocomplete
                          options={employees}
                          value={selectedEmployee}
                          disabled={isSubmitting}
                          getOptionLabel={(option) => `${option.fullName} - ${option.employeeCode}`}
                          isOptionEqualToValue={(option, value) => option.id === value.id}
                          onChange={(_, employee) => {
                            field.onChange(employee?.id ?? null);
                            setValue(`users.${index}.employeeCode`, employee?.employeeCode ?? "", {
                              shouldValidate: true,
                            });
                            setValue(`users.${index}.fullName`, employee?.fullName ?? "", {
                              shouldValidate: true,
                            });

                            if (employee) {
                              handleUniqueBlur(index, "employeeId", employee.id);
                              handleUniqueBlur(index, "employeeCode", employee.employeeCode);
                              handleUniqueBlur(index, "fullName", employee.fullName);
                            } else {
                              clearErrors([
                                `users.${index}.employeeId`,
                                `users.${index}.employeeCode`,
                                `users.${index}.fullName`,
                              ] as never);
                            }
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              fullWidth
                              size="small"
                              sx={fieldSx}
                              placeholder="Search employee"
                              error={!!userErrors?.employeeId}
                            />
                          )}
                        />
                      );
                    }}
                  />
                  <FieldError message={userErrors?.employeeId?.message} />
                </FieldSlot>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <FieldSlot
                  name={`users.${index}.employeeCode`}
                  highlighted={highlightedField === `users.${index}.employeeCode`}
                  registerRef={registerFieldRef}
                >
                  <FieldLabel required>Employee Code</FieldLabel>
                  <TextField
                    {...register(`users.${index}.employeeCode`)}
                    fullWidth
                    size="small"
                    sx={fieldSx}
                    placeholder="Auto-filled from employee"
                    disabled={isSubmitting}
                    slotProps={{ htmlInput: { readOnly: true } }}
                    error={!!userErrors?.employeeCode}
                  />
                  <FieldError message={userErrors?.employeeCode?.message} />
                </FieldSlot>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <FieldSlot
                  name={`users.${index}.fullName`}
                  highlighted={highlightedField === `users.${index}.fullName`}
                  registerRef={registerFieldRef}
                >
                  <FieldLabel required>Full Name</FieldLabel>
                  <TextField
                    {...register(`users.${index}.fullName`)}
                    fullWidth
                    size="small"
                    sx={fieldSx}
                    placeholder="Auto-filled from employee"
                    disabled={isSubmitting}
                    slotProps={{ htmlInput: { readOnly: true } }}
                    error={!!userErrors?.fullName}
                  />
                  <FieldError message={userErrors?.fullName?.message} />
                </FieldSlot>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <FieldSlot
                  name={`users.${index}.email`}
                  highlighted={highlightedField === `users.${index}.email`}
                  registerRef={registerFieldRef}
                >
                  <FieldLabel required>Email</FieldLabel>
                  <Controller
                    name={`users.${index}.email`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        size="small"
                        sx={fieldSx}
                        type="email"
                        placeholder="name@company.com"
                        disabled={isSubmitting}
                        error={!!userErrors?.email}
                      />
                    )}
                  />
                  <FieldError message={userErrors?.email?.message} />
                </FieldSlot>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <FieldSlot
                  name={`users.${index}.mobileNumber`}
                  highlighted={highlightedField === `users.${index}.mobileNumber`}
                  registerRef={registerFieldRef}
                >
                  <FieldLabel required>Mobile Number</FieldLabel>
                  <Controller
                    name={`users.${index}.mobileNumber`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        size="small"
                        sx={fieldSx}
                        placeholder="10-digit mobile number"
                        type="text"
                        disabled={isSubmitting}
                        slotProps={{ htmlInput: { maxLength: 10, inputMode: "numeric" } }}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                          field.onChange(value);
                        }}
                        onBlur={(e) => {
                          field.onBlur();
                          handleUniqueBlur(index, "mobileNumber", e.target.value);
                        }}
                        error={!!userErrors?.mobileNumber}
                      />
                    )}
                  />
                  <FieldError message={userErrors?.mobileNumber?.message} />
                </FieldSlot>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <FieldSlot
                  name={`users.${index}.departmentId`}
                  highlighted={highlightedField === `users.${index}.departmentId`}
                  registerRef={registerFieldRef}
                >
                  <Controller
                    name={`users.${index}.departmentId`}
                    control={control}
                    render={({ field }) => (
                      <ClearableSelect
                        label="Department"
                        required
                        placeholder="Select department"
                        value={field.value}
                        onChange={field.onChange}
                        options={departments.map((d) => ({ id: d.id, label: d.departmentName }))}
                        disabled={isSubmitting}
                        error={!!userErrors?.departmentId}
                        helperText={userErrors?.departmentId?.message}
                      />
                    )}
                  />
                </FieldSlot>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <FieldSlot
                  name={`users.${index}.designationId`}
                  highlighted={highlightedField === `users.${index}.designationId`}
                  registerRef={registerFieldRef}
                >
                  <Controller
                    name={`users.${index}.designationId`}
                    control={control}
                    render={({ field }) => (
                      <ClearableSelect
                        label="Designation"
                        required
                        placeholder="Select designation"
                        value={field.value}
                        onChange={field.onChange}
                        options={designations.map((d) => ({ id: d.id, label: d.designationName }))}
                        disabled={isSubmitting}
                        error={!!userErrors?.designationId}
                        helperText={userErrors?.designationId?.message}
                      />
                    )}
                  />
                </FieldSlot>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <FieldSlot
                  name={`users.${index}.roleId`}
                  highlighted={highlightedField === `users.${index}.roleId`}
                  registerRef={registerFieldRef}
                >
                  <Controller
                    name={`users.${index}.roleId`}
                    control={control}
                    render={({ field }) => (
                      <ClearableSelect
                        label="Role"
                        required
                        placeholder="Select role"
                        value={field.value}
                        onChange={field.onChange}
                        options={roles.map((r) => ({ id: r.id, label: r.roleName }))}
                        disabled={isSubmitting}
                        error={!!userErrors?.roleId}
                        helperText={userErrors?.roleId?.message}
                      />
                    )}
                  />
                </FieldSlot>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <FieldSlot
                  name={`users.${index}.branchIds`}
                  highlighted={highlightedField === `users.${index}.branchIds`}
                  registerRef={registerFieldRef}
                >
                  <Controller
                    name={`users.${index}.branchIds`}
                    control={control}
                    render={({ field }) => (
                      <MultiSelectWithSelectAll
                        label="Branch"
                        required
                        placeholder="Select branches"
                        value={field.value}
                        onChange={field.onChange}
                        options={branches.map((b) => ({ id: b.id, label: b.branchName }))}
                        disabled={isSubmitting}
                        error={!!userErrors?.branchIds}
                        helperText={userErrors?.branchIds?.message}
                      />
                    )}
                  />
                </FieldSlot>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <FieldSlot
                  name={`users.${index}.reportingManager`}
                  highlighted={highlightedField === `users.${index}.reportingManager`}
                  registerRef={registerFieldRef}
                >
                  <FieldLabel>Reporting Manager</FieldLabel>
                  <Controller
                    name={`users.${index}.reportingManager`}
                    control={control}
                    render={({ field }) => {
                      const selectedManager =
                        employees.find((employee) => employee.id === field.value) ?? null;

                      return (
                        <Autocomplete
                          options={employees}
                          value={selectedManager}
                          disabled={isSubmitting}
                          getOptionLabel={(option) => `${option.fullName} - ${option.employeeCode}`}
                          isOptionEqualToValue={(option, value) => option.id === value.id}
                          onChange={(_, employee) => field.onChange(employee?.id ?? null)}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              fullWidth
                              size="small"
                              sx={fieldSx}
                              placeholder="Search manager"
                              error={!!userErrors?.reportingManager}
                            />
                          )}
                        />
                      );
                    }}
                  />
                  <FieldError message={userErrors?.reportingManager?.message} />
                </FieldSlot>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <FieldSlot
                  name={`users.${index}.dashboard`}
                  highlighted={highlightedField === `users.${index}.dashboard`}
                  registerRef={registerFieldRef}
                >
                  <FieldLabel>Dashboard</FieldLabel>
                  <Controller
                    name={`users.${index}.dashboard`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        size="small"
                        sx={fieldSx}
                        placeholder="Enter dashboard"
                        disabled={isSubmitting}
                        error={!!userErrors?.dashboard}
                      />
                    )}
                  />
                  <FieldError message={userErrors?.dashboard?.message} />
                </FieldSlot>
              </Grid>

              {showStatus && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <FieldSlot
                    name={`users.${index}.status`}
                    highlighted={highlightedField === `users.${index}.status`}
                    registerRef={registerFieldRef}
                  >
                    <Controller
                      name={`users.${index}.status`}
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth disabled={isSubmitting}>
                          <FormLabel sx={{ mb: 0.75, fontSize: "0.72rem", fontWeight: 600, color: "#475569" }}>
                            Status
                          </FormLabel>
                          <RadioGroup
                            row
                            value={field.value === true ? "true" : "false"}
                            onChange={(event) => field.onChange(event.target.value === "true")}
                            sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}
                          >
                            <FormControlLabel
                              value="false"
                              control={
                                <Radio
                                  size="small"
                                  sx={{ color: "#16A34A", "&.Mui-checked": { color: "#16A34A" } }}
                                />
                              }
                              label={
                                <Box
                                  sx={{
                                    px: 1.2,
                                    py: 0.55,
                                    border: "1px solid #86EFAC",
                                    borderRadius: 1.5,
                                    backgroundColor: "#F0FDF4",
                                    color: "#15803D",
                                    fontSize: "0.78rem",
                                    fontWeight: 600,
                                  }}
                                >
                                  Active
                                </Box>
                              }
                              sx={{ m: 0 }}
                            />
                            <FormControlLabel
                              value="true"
                              control={
                                <Radio
                                  size="small"
                                  sx={{ color: "#DC2626", "&.Mui-checked": { color: "#DC2626" } }}
                                />
                              }
                              label={
                                <Box
                                  sx={{
                                    px: 1.2,
                                    py: 0.55,
                                    border: "1px solid #FCA5A5",
                                    borderRadius: 1.5,
                                    backgroundColor: "#FEF2F2",
                                    color: "#B91C1C",
                                    fontSize: "0.78rem",
                                    fontWeight: 600,
                                  }}
                                >
                                  Inactive
                                </Box>
                              }
                              sx={{ m: 0 }}
                            />
                          </RadioGroup>
                        </FormControl>
                      )}
                    />
                  </FieldSlot>
                </Grid>
              )}

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <FieldSlot
                  name={`users.${index}.accessibleModules`}
                  highlighted={highlightedField === `users.${index}.accessibleModules`}
                  registerRef={registerFieldRef}
                >
                  <Controller
                    name={`users.${index}.accessibleModules`}
                    control={control}
                    render={({ field }) => (
                      <MultiSelectWithSelectAll
                        label="Accessible Modules"
                        placeholder="Select modules"
                        value={field.value}
                        onChange={field.onChange}
                        options={modules.map((m) => ({ id: m.id, label: m.moduleName }))}
                        disabled={isSubmitting}
                        error={!!userErrors?.accessibleModules}
                        helperText={userErrors?.accessibleModules?.message}
                      />
                    )}
                  />
                </FieldSlot>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <FieldSlot
                  name={`users.${index}.language`}
                  highlighted={highlightedField === `users.${index}.language`}
                  registerRef={registerFieldRef}
                >
                  <Controller
                    name={`users.${index}.language`}
                    control={control}
                    render={({ field }) => (
                      <ClearableSelect
                        label="Language"
                        required
                        placeholder="Select language"
                        value={field.value}
                        onChange={(v) => field.onChange(v)}
                        options={[
                          { id: "English", label: "English" },
                          { id: "Hindi", label: "Hindi" },
                          { id: "Arabic", label: "Arabic" },
                        ]}
                        disabled={isSubmitting}
                        error={!!userErrors?.language}
                        helperText={userErrors?.language?.message}
                      />
                    )}
                  />
                </FieldSlot>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <FieldSlot
                  name={`users.${index}.timeZone`}
                  highlighted={highlightedField === `users.${index}.timeZone`}
                  registerRef={registerFieldRef}
                >
                  <Controller
                    name={`users.${index}.timeZone`}
                    control={control}
                    render={({ field }) => (
                      <ClearableSelect
                        label="Time Zone"
                        placeholder="Select time zone"
                        value={field.value}
                        onChange={(v) => field.onChange(v)}
                        options={[
                          { id: "Asia/Kolkata", label: "Asia/Kolkata (UTC+5:30)" },
                          { id: "Asia/Dubai", label: "Asia/Dubai (UTC+4)" },
                          { id: "UTC", label: "UTC" },
                          { id: "America/New_York", label: "America/New York" },
                        ]}
                        disabled={isSubmitting}
                        error={!!userErrors?.timeZone}
                        helperText={userErrors?.timeZone?.message}
                      />
                    )}
                  />
                </FieldSlot>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <FieldSlot
                  name={`users.${index}.loginType`}
                  highlighted={highlightedField === `users.${index}.loginType`}
                  registerRef={registerFieldRef}
                >
                  <Controller
                    name={`users.${index}.loginType`}
                    control={control}
                    render={({ field }) => (
                      <ClearableSelect
                        label="Login Type"
                        required
                        placeholder="Select login type"
                        value={field.value}
                        onChange={(v) => field.onChange(v)}
                        options={[
                          { id: "Password", label: "Password" },
                          { id: "SSO", label: "SSO" },
                          { id: "LDAP", label: "LDAP" },
                        ]}
                        disabled={isSubmitting}
                        error={!!userErrors?.loginType}
                        helperText={userErrors?.loginType?.message}
                      />
                    )}
                  />
                </FieldSlot>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <FieldSlot
                  name={`users.${index}.passwordExpiry`}
                  highlighted={highlightedField === `users.${index}.passwordExpiry`}
                  registerRef={registerFieldRef}
                >
                  <FieldLabel>Password Expiry (Days)</FieldLabel>
                  <Controller
                    name={`users.${index}.passwordExpiry`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        fullWidth
                        size="small"
                        sx={fieldSx}
                        type="number"
                        placeholder="e.g. 90"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(e.target.value === "" ? null : Number(e.target.value))
                        }
                        disabled={isSubmitting}
                        slotProps={{ htmlInput: { min: 0, max: 999 } }}
                        error={!!userErrors?.passwordExpiry}
                      />
                    )}
                  />
                  <FieldError message={userErrors?.passwordExpiry?.message} />
                </FieldSlot>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <FieldSlot
                  name={`users.${index}.twoFactorAuthentication`}
                  highlighted={highlightedField === `users.${index}.twoFactorAuthentication`}
                  registerRef={registerFieldRef}
                >
                  <Controller
                    name={`users.${index}.twoFactorAuthentication`}
                    control={control}
                    render={({ field }) => (
                      <FormControl size="small" disabled={isSubmitting}>
                        <FormLabel sx={{ fontSize: "0.72rem", fontWeight: 600, color: "#475569", mb: 0.5 }}>
                          Two Factor Authentication
                        </FormLabel>
                        <RadioGroup
                          row
                          value={field.value ? "yes" : "no"}
                          onChange={(e) => field.onChange(e.target.value === "yes")}
                        >
                          <FormControlLabel value="yes" control={<Radio size="small" />} label="Enabled" />
                          <FormControlLabel value="no" control={<Radio size="small" />} label="Disabled" />
                        </RadioGroup>
                      </FormControl>
                    )}
                  />
                </FieldSlot>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FieldSlot
                  name={`users.${index}.profileImage`}
                  highlighted={highlightedField === `users.${index}.profileImage`}
                  registerRef={registerFieldRef}
                >
                  <Controller
                    name={`users.${index}.profileImage`}
                    control={control}
                    render={({ field }) => (
                      <FileUploadField
                        label="Profile Image"
                        value={field.value as File | null}
                        onChange={field.onChange}
                        disabled={isSubmitting}
                        error={!!userErrors?.profileImage}
                        helperText={userErrors?.profileImage?.message as string | undefined}
                      />
                    )}
                  />
                </FieldSlot>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FieldSlot
                  name={`users.${index}.digitalSignature`}
                  highlighted={highlightedField === `users.${index}.digitalSignature`}
                  registerRef={registerFieldRef}
                >
                  <Controller
                    name={`users.${index}.digitalSignature`}
                    control={control}
                    render={({ field }) => (
                      <FileUploadField
                        label="Digital Signature"
                        value={field.value as File | null}
                        onChange={field.onChange}
                        disabled={isSubmitting}
                        error={!!userErrors?.digitalSignature}
                        helperText={userErrors?.digitalSignature?.message as string | undefined}
                      />
                    )}
                  />
                </FieldSlot>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <FieldSlot
                  name={`users.${index}.remarks`}
                  highlighted={highlightedField === `users.${index}.remarks`}
                  registerRef={registerFieldRef}
                >
                  <FieldLabel>Remarks</FieldLabel>
                  <Controller
                    name={`users.${index}.remarks`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        multiline
                        rows={2}
                        size="small"
                        sx={fieldSx}
                        placeholder="Any additional notes"
                        disabled={isSubmitting}
                        error={!!userErrors?.remarks}
                      />
                    )}
                  />
                  <FieldError message={userErrors?.remarks?.message} />
                </FieldSlot>
              </Grid>
            </Grid>
          </Box>
        );
      })}

      {showActions && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 1.2,
            mt: 1,
            mb: 1,
            flexWrap: "wrap",
          }}
        >
          {allowMultiple && (
            <Button
              type="button"
              variant="outlined"
              size="small"
              startIcon={<AddRoundedIcon fontSize="small" />}
              onClick={handleAddUser}
              disabled={isSubmitting}
              sx={{ textTransform: "none", minWidth: 110, height: 36, fontWeight: 600 }}
            >
              Add User
            </Button>
          )}

          <Button
            type="submit"
            variant="contained"
            size="small"
            disabled={isSubmitting}
            sx={{
              textTransform: "none",
              minWidth: 105,
              height: 36,
              fontWeight: 600,
              background: "#16A34A",
              boxShadow: "0 1px 3px rgba(22,163,74,0.35)",
              transition: "all 0.15s ease",
              "&:hover": {
                background: "#15803D",
                boxShadow: "0 3px 8px rgba(22,163,74,0.45)",
                transform: "translateY(-1px)",
              },
              "&:active": {
                transform: "translateY(0)",
                boxShadow: "0 1px 2px rgba(22,163,74,0.4)",
              },
              "&.Mui-disabled": {
                background: "#A7D8B8",
                color: "#F0FDF4",
              },
            }}
          >
            {isSubmitting ? "Saving..." : allowMultiple ? "Save All" : "Update"}
          </Button>

          <Button
            type="button"
            variant="contained"
            size="small"
            onClick={() => reset?.()}
            disabled={isSubmitting}
            sx={{
              textTransform: "none",
              minWidth: 85,
              height: 36,
              fontWeight: 600,
              background: "#EAB308",
              color: "#1E293B",
              boxShadow: "0 1px 3px rgba(234,179,8,0.35)",
              transition: "all 0.15s ease",
              "&:hover": {
                background: "#CA8A04",
                boxShadow: "0 3px 8px rgba(234,179,8,0.45)",
                transform: "translateY(-1px)",
              },
              "&:active": {
                transform: "translateY(0)",
                boxShadow: "0 1px 2px rgba(234,179,8,0.4)",
              },
              "&.Mui-disabled": {
                background: "#FDE68A",
                color: "#94A3B8",
              },
            }}
          >
            Reset
          </Button>

          {onCancel && (
            <Button
              type="button"
              variant="contained"
              size="small"
              onClick={onCancel}
              disabled={isSubmitting}
              sx={{
                textTransform: "none",
                minWidth: 85,
                height: 36,
                fontWeight: 600,
                background: "#DC2626",
                boxShadow: "0 1px 3px rgba(220,38,38,0.35)",
                transition: "all 0.15s ease",
                "&:hover": {
                  background: "#B91C1C",
                  boxShadow: "0 3px 8px rgba(220,38,38,0.45)",
                  transform: "translateY(-1px)",
                },
                "&:active": {
                  transform: "translateY(0)",
                  boxShadow: "0 1px 2px rgba(220,38,38,0.4)",
                },
                "&.Mui-disabled": {
                  background: "#FCA5A5",
                  color: "#FEF2F2",
                },
              }}
            >
              Cancel
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
};

export default ArrayForm;