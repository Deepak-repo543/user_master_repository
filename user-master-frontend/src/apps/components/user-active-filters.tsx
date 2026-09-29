
import { Box, Card, CardContent, Chip, Typography } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import type {
  UserFilters,
  FilterKey,
} from "@/pages/store/slices/user-filter-slice";

interface FilterOption {
  label: string;
  value: string;
}

interface UserActiveFiltersProps {
  appliedFilters: UserFilters;
  onRemoveFilter: (key: FilterKey) => void;

  departmentOptions?: FilterOption[];
  designationOptions?: FilterOption[];
  branchOptions?: FilterOption[];
  roleOptions?: FilterOption[];
}

const fieldMap: Record<FilterKey, string> = {
  globalSearch: "Search",
  createdDateFrom: "From",
  createdDateTo: "To",
  status: "Status",
  department: "Department",
  designation: "Designation",
  branch: "Branch",
  role: "Role",
  employeeName: "Employee Name",
};

const filterOrder: FilterKey[] = [
  "createdDateFrom",
  "createdDateTo",
  "globalSearch",
  "status",
  "department",
  "designation",
  "branch",
  "role",
  "employeeName",
];

const formatDateDDMMYY = (dateStr: string): string => {
  const [year, month, day] = dateStr.split("-");

  return `${day}-${month}-${year.slice(2)}`;
};

const getOptionName = (
  value: string,
  options: FilterOption[],
): string => {
  const option = options.find(
    (item) => String(item.value) === String(value),
  );

  return option?.label ?? value;
};

const UserActiveFilters = ({
  appliedFilters,
  onRemoveFilter,
  departmentOptions = [],
  designationOptions = [],
  branchOptions = [],
  roleOptions = [],
}: UserActiveFiltersProps) => {
  const activeFilterLabels = (
    Object.entries(appliedFilters) as [FilterKey, string][]
  )
    .filter(([, value]) => !!value)
    .sort(
      ([keyA], [keyB]) =>
        filterOrder.indexOf(keyA) - filterOrder.indexOf(keyB),
    )
    .map(([key, value]) => ({
      key,
      label: fieldMap[key],
      value:
        key === "status"
          ? value === "false"
            ? "Active"
            : "Inactive"
          : key === "createdDateFrom" || key === "createdDateTo"
            ? formatDateDDMMYY(value)
            : key === "department"
              ? getOptionName(value, departmentOptions)
              : key === "designation"
                ? getOptionName(value, designationOptions)
                : key === "branch"
                  ? getOptionName(value, branchOptions)
                  : key === "role"
                    ? getOptionName(value, roleOptions)
                    : value,
    }));

  if (activeFilterLabels.length === 0) {
    return null;
  }

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 2.5,
        border: "1px solid #E2E8F0",
        background: "#FFFFFF",
        boxShadow: "0 2px 8px rgba(15,23,42,0.025)",
      }}
    >
      <CardContent
        sx={{
          p: { xs: 1.2, sm: 1.5 },
          "&:last-child": {
            pb: { xs: 1.2, sm: 1.5 },
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 0.5,
          }}
        >
          <Typography
            sx={{
              fontSize: "0.6rem",
              fontWeight: 600,
              color: "#64748B",
              mr: 0.5,
            }}
          >
            Filtered by:
          </Typography>

          {/* Date Filter */}
          {(() => {
            const fromDate = activeFilterLabels.find(
              (item) => item.key === "createdDateFrom",
            );

            const toDate = activeFilterLabels.find(
              (item) => item.key === "createdDateTo",
            );

            if (!fromDate && !toDate) {
              return null;
            }

            return (
              <Chip
                label={`Date: ${fromDate?.value ?? ""}${fromDate && toDate ? " to " : ""
                  }${toDate?.value ?? ""}`}
                size="small"
                sx={{
                  height: 22,
                  fontSize: "0.6rem",
                  fontWeight: 600,
                  bgcolor: "#EEF2FF",
                  color: "#4F46E5",
                  border: "1px solid #C7D2FE",
                }}
              />
            );
          })()}

          {/* Other Filters */}
          {activeFilterLabels
            .filter(
              (item) =>
                item.key !== "createdDateFrom" &&
                item.key !== "createdDateTo",
            )
            .map((item) => (
              <Chip
                key={item.key}
                label={`${item.label}: ${item.value}`}
                size="small"
                onDelete={
                  item.key === "status"
                    ? undefined
                    : () => onRemoveFilter(item.key)
                }
                deleteIcon={
                  item.key === "status" ? undefined : (
                    <CloseRoundedIcon
                      sx={{
                        fontSize: "10px !important",
                      }}
                    />
                  )
                }
                sx={{
                  height: 22,
                  fontSize: "0.6rem",
                  fontWeight: 600,
                  bgcolor: "#EEF2FF",
                  color: "#4F46E5",
                  border: "1px solid #C7D2FE",

                  "& .MuiChip-deleteIcon": {
                    color: "#6366F1",

                    "&:hover": {
                      color: "#DC2626",
                    },
                  },
                }}
              />
            ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default UserActiveFilters;
