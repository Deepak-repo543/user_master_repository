import { useEffect, useState, useCallback, useMemo } from "react";
import { Box, Card, CardContent, Grid, Typography, Stack, TextField, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, } from "@mui/material";
import type { MRT_ColumnDef } from "material-react-table";
import { TrendingUp as TrendingUpIcon, TrendingDown as TrendingDownIcon, People as PeopleIcon, PersonAdd as PersonAddIcon, PersonRemove as PersonRemoveIcon, FilterAlt as FilterAltIcon, Close as CloseIcon, } from "@mui/icons-material";
import AmBarChart from "@/components/charts/amChart/bar-chart";
import AmStackedBarChart from "@/components/charts/amChart/stacked-bar-chart";
import AmGaugeChart from "@/components/charts/amChart/gauge-chart";
import ReactBarChart from "@/components/charts/reactChart/bar-chart";
import ReactStackedBarChart from "@/components/charts/reactChart/stackbar-chart";
import ReactGaugeChart from "@/components/charts/reactChart/gauge-chart";
import ChartTableCard from "@/components/charttable-card";
import ReactMaterialTable from "@/components/react-material-table";
import userService from "@/pages/user/api";

interface UserStatusCount {
  totalCount: number;
  activeCount: number;
  inactiveCount: number;
}

interface UserDepartmentCount {
  departmentId: number;
  departmentName: string;
  activeCount: number;
  inactiveCount: number;
}

interface DepartmentTableRow {
  departmentId: number;
  departmentName: string;
  total: number;
  activeCount: number;
  inactiveCount: number;
}

interface StatusTableRow {
  metric: string;
  value: number;
}

interface DepartmentUser {
  id?: number;
  userId?: number;
  employeeId?: number;
  employeeCode?: string;
  fullName?: string;
  email?: string;
  mobileNumber?: string;
  department?: string | { name?: string; departmentName?: string };
  departmentName?: string;
  designation?: string | { name?: string; designationName?: string };
  designationName?: string;
  role?: string | { name?: string; roleName?: string };
  roleName?: string;
  status?: boolean;
}

const departmentColumns: MRT_ColumnDef<DepartmentTableRow>[] = [
  {
    accessorKey: "departmentName",
    header: "Department",
    size: 150,
  },
  {
    accessorKey: "total",
    header: "Total",
    size: 120,
  },
  {
    accessorKey: "activeCount",
    header: "Active",
    size: 100,
  },
  {
    accessorKey: "inactiveCount",
    header: "Inactive",
    size: 110,
  },
];

const statusColumns: MRT_ColumnDef<StatusTableRow>[] = [
  {
    accessorKey: "metric",
    header: "Metric",
  },
  {
    accessorKey: "value",
    header: "Value",
  },
];

const getDefaultDates = () => {
  const today = new Date();
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(today.getDate() - 6);
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return {
    from: formatDate(oneWeekAgo),
    to: formatDate(today),
  };
};

const getDisplayValue = (
  value:
    | string
    | { name?: string; departmentName?: string; designationName?: string; roleName?: string }
    | undefined
) => {
  if (!value) {
    return "N/A";
  }

  if (typeof value === "string") {
    return value;
  }

  return (
    value.name ??
    value.departmentName ??
    value.designationName ??
    value.roleName ??
    "-"
  );
};

const Dashboard = () => {
  const defaultDates = useMemo(() => getDefaultDates(), []);
  const [showFilter, setShowFilter] = useState(false);
  const [departmentDialogOpen, setDepartmentDialogOpen] = useState(false);
  const [statusCount, setStatusCount] = useState<UserStatusCount>({ totalCount: 0, activeCount: 0, inactiveCount: 0, });
  const [departmentData, setDepartmentData] = useState<UserDepartmentCount[]>([]);
  const [dateFrom, setDateFrom] = useState(defaultDates.from);
  const [dateTo, setDateTo] = useState(defaultDates.to);
  const [appliedDateFrom, setAppliedDateFrom] = useState(defaultDates.from);
  const [appliedDateTo, setAppliedDateTo] = useState(defaultDates.to);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [departmentUsers, setDepartmentUsers] = useState<DepartmentUser[]>([]);
  const [departmentUsersLoading, setDepartmentUsersLoading] = useState(false);

  const loadDashboardData = useCallback(
    async (from: string, to: string) => {
      try {
        const params = {
          ...(from ? { fromDate: from } : {}),
          ...(to ? { toDate: to } : {}),
        };

        const [statusResponse, departmentResponse] = await Promise.all([
          userService.getUserStatusCount(params),
          userService.getUserDepartmentCount(params),
        ]);

        setStatusCount(
          statusResponse?.data ?? {
            totalCount: 0,
            activeCount: 0,
            inactiveCount: 0,
          }
        );

        const apiData = Array.isArray(departmentResponse?.data)
          ? departmentResponse.data
          : [];
        setDepartmentData(apiData);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
        setStatusCount({
          totalCount: 0,
          activeCount: 0,
          inactiveCount: 0,
        });
        setDepartmentData([]);
      }
    },
    []
  );

  useEffect(() => {
    loadDashboardData(appliedDateFrom, appliedDateTo);
  }, [loadDashboardData, appliedDateFrom, appliedDateTo]);

  const handleDepartmentClick = async (row: DepartmentTableRow) => {
    try {
      setDepartmentUsersLoading(true);
      const response = await userService.searchUsers({
        departmentId: row.departmentId,
        page: 0,
        size: 10,
      });
      const users =
        response?.data?.content ??
        response?.data ??
        [];
      setSelectedDepartment(row.departmentName);
      setDepartmentUsers(Array.isArray(users) ? users : []);
      setDepartmentDialogOpen(true);
    } catch (error) {
      console.error("Failed to load department users:", error);
      setDepartmentUsers([]);
    } finally {
      setDepartmentUsersLoading(false);
    }
  };

  const closeDepartmentDialog = () => {
    (document.activeElement as HTMLElement | null)?.blur();
    setDepartmentDialogOpen(false);
    setSelectedDepartment(null);
    setDepartmentUsers([]);
  };

  const departmentUserColumns = useMemo<MRT_ColumnDef<DepartmentUser>[]>(
    () => [
      {
        accessorKey: "employeeCode",
        header: "Employee Code",
        size: 160,
      },
      {
        accessorKey: "fullName",
        header: "Full Name",
        size: 130,
      },
      {
        accessorKey: "email",
        header: "Email",
        size: 170,
      },
      {
        accessorKey: "timeZone",
        header: "Time Zone",
        size: 150,
        Cell: ({ cell }) => {
          const value = cell.getValue<string>();
          return value || "N/A";
        },
      },
      {
        accessorKey: "mobileNumber",
        header: "Mobile",
        size: 140,
      },
      {
        id: "designation",
        header: "Designation",
        size: 180,
        accessorFn: (row) =>
          row.designationName ??
          getDisplayValue(row.designation),
      },
      {
        id: "role",
        header: "Role",
        size: 140,
        accessorFn: (row) =>
          row.roleName ??
          getDisplayValue(row.role),
      },
      {
        accessorKey: "status",
        header: "Status",
        size: 100,
        Cell: ({ cell }) => {
          const status = cell.getValue<boolean>();
          return status ? "Inactive" : "Active";
        },
      },
    ],
    []
  );

  const handleApplyDateFilter = () => {
    if (dateFrom && dateTo && dateFrom > dateTo) {
      return;
    }

    const today = new Date()
      .toISOString()
      .split("T")[0];

    if (dateTo && dateTo > today) {
      return;
    }
    setAppliedDateFrom(dateFrom);
    setAppliedDateTo(dateTo);
    setShowFilter(false);
  };

  const handleResetDateFilter = () => {
    const dates = getDefaultDates();
    setDateFrom(dates.from);
    setDateTo(dates.to);
    setAppliedDateFrom(dates.from);
    setAppliedDateTo(dates.to);
    setShowFilter(false);
  };

  const handleDateFromChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    if (value && dateTo && value > dateTo) {
      return;
    }
    setDateFrom(value);
  };
  const handleDateToChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;

    const today = new Date()
      .toISOString()
      .split("T")[0];
    if (value && value > today) {
      return;
    }
    if (value && dateFrom && value < dateFrom) {
      return;
    }
    setDateTo(value);
  };

  const departmentChartData = useMemo(
    () =>
      departmentData.map((item) => ({
        category: item.departmentName,
        value: item.activeCount + item.inactiveCount,
      })),
    [departmentData]
  );

  const stackedData = useMemo(
    () =>
      departmentData.map((item) => ({
        category: item.departmentName,
        active: item.activeCount,
        inactive: item.inactiveCount,
      })),
    [departmentData]
  );

  const departmentTableData: DepartmentTableRow[] = useMemo(
    () =>
      departmentData.map((item) => ({
        departmentId: item.departmentId,
        departmentName: item.departmentName,
        total: item.activeCount + item.inactiveCount,
        activeCount: item.activeCount,
        inactiveCount: item.inactiveCount,
      })),
    [departmentData]
  );

  const statusTableData: StatusTableRow[] = useMemo(
    () => [
      {
        metric: "Total Users",
        value: statusCount.totalCount,
      },
      {
        metric: "Active Users",
        value: statusCount.activeCount,
      },
      {
        metric: "Inactive Users",
        value: statusCount.inactiveCount,
      },
    ],
    [statusCount]
  );

  const totalUsers = statusCount.totalCount;
  const activePercentage =
    totalUsers > 0 ? Math.round((statusCount.activeCount / totalUsers) * 100) : 0;

  const statCards = [
    {
      title: "Total Users",
      value: statusCount.totalCount,
      color: "#4F46E5",
      background: "#EEF2FF",
      icon: <PeopleIcon sx={{ color: "#4F46E5" }} />,
      trend: "+12%",
      trendUp: true,
    },
    {
      title: "Active Users",
      value: statusCount.activeCount,
      color: "#16A34A",
      background: "#F0FDF4",
      icon: <PersonAddIcon sx={{ color: "#16A34A" }} />,
      trend: "+5%",
      trendUp: true,
    },
    {
      title: "Inactive Users",
      value: statusCount.inactiveCount,
      color: "#DC2626",
      background: "#FEF2F2",
      icon: <PersonRemoveIcon sx={{ color: "#DC2626" }} />,
      trend: "-3%",
      trendUp: false,
    },
  ];

  const cardSx = {
    height: "100%",
    borderRadius: 3,
    border: "1px solid #E2E8F0",
    backgroundColor: "#FFFFFF",
    boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
    overflow: "hidden",
    transition: "box-shadow 0.2s ease",
    "&:hover": {
      boxShadow: "0 4px 12px rgba(15, 23, 42, 0.08)",
    },
  } as const;

  const cardContentSx = {
    p: { xs: 2, sm: 2.5 },
    "&:last-child": {
      pb: { xs: 2, sm: 2.5 },
    },
  } as const;

  const today = new Date()
    .toISOString()
    .split("T")[0];

  return (
    <Box
      sx={{
        minHeight: "100%",
        backgroundColor: "#F8FAFC",
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 2.5, sm: 3, md: 4 },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
          mb: { xs: 3, md: 4 },
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: { xs: 24, sm: 28 },
              fontWeight: 700,
              color: "#172033",
              letterSpacing: "-0.5px",
              mb: 0.5,
            }}
          >
            Dashboard
          </Typography>

          {(appliedDateFrom || appliedDateTo) && (
            <Box
              sx={{
                display: "flex",
                gap: 0.5,
                mt: 0.5,
                flexWrap: "wrap",
              }}
            >
              {appliedDateFrom && (
                <Typography
                  sx={{
                    fontSize: 11,
                    color: "#6366F1",
                    bgcolor: "#EEF2FF",
                    px: 1,
                    py: 0.25,
                    borderRadius: 1,
                    fontWeight: 500,
                  }}
                >
                  From:{" "}
                  {appliedDateFrom
                    .split("-")
                    .reverse()
                    .join("-")}
                </Typography>
              )}

              {appliedDateTo && (
                <Typography
                  sx={{
                    fontSize: 11,
                    color: "#6366F1",
                    bgcolor: "#EEF2FF",
                    px: 1,
                    py: 0.25,
                    borderRadius: 1,
                    fontWeight: 500,
                  }}
                >
                  To:{" "}
                  {appliedDateTo
                    .split("-")
                    .reverse()
                    .join("-")}
                </Typography>
              )}
            </Box>
          )}
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Button
            variant="outlined"
            startIcon={<FilterAltIcon />}
            onClick={() => setShowFilter(!showFilter)}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontSize: 13,
              fontWeight: 600,
              color: "#475569",
              borderColor: "#E2E8F0",
              px: 2,
              py: 0.75,
              "&:hover": {
                borderColor: "#6366F1",
                color: "#6366F1",
                backgroundColor: "#EEF2FF",
              },
            }}
          >
            Filter

            {(appliedDateFrom || appliedDateTo) && (
              <Box
                sx={{
                  ml: 0.5,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: "#6366F1",
                }}
              />
            )}
          </Button>
        </Box>
      </Box>

      {showFilter && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 2.5,
            p: 1.5,
            borderRadius: 2,
            bgcolor: "#FFFFFF",
            border: "1px solid #E2E8F0",
            flexWrap: "wrap",
          }}
        >
          <TextField
            type="date"
            label="From Date"
            value={dateFrom}
            onChange={handleDateFromChange}
            size="small"
            slotProps={{
              htmlInput: {
                max: dateTo || today,
              },
              inputLabel: {
                shrink: true,
              },
            }}
            sx={{
              width: 160,
              "& .MuiOutlinedInput-root": {
                borderRadius: 1.5,
                bgcolor: "#F8FAFC",
              },
            }}
          />

          <TextField
            type="date"
            label="To Date"
            value={dateTo}
            onChange={handleDateToChange}
            size="small"
            slotProps={{
              htmlInput: {
                max: today,
                min: dateFrom,
              },
              inputLabel: {
                shrink: true,
              },
            }}
            sx={{
              width: 160,
              "& .MuiOutlinedInput-root": {
                borderRadius: 1.5,
                bgcolor: "#F8FAFC",
              },
            }}
          />

          <Button
            variant="contained"
            onClick={handleApplyDateFilter}
            sx={{
              borderRadius: 1.5,
              textTransform: "none",
              fontSize: 12,
              fontWeight: 600,
              bgcolor: "#6366F1",
              px: 2.5,
              py: 0.75,
              minWidth: 70,
              "&:hover": {
                bgcolor: "#4F46E5",
              },
            }}
          >
            Apply
          </Button>

          <Button
            variant="text"
            onClick={handleResetDateFilter}
            sx={{
              borderRadius: 1.5,
              textTransform: "none",
              fontSize: 12,
              fontWeight: 500,
              color: "#94A3B8",
              px: 2,
              py: 0.75,
              minWidth: 60,
            }}
          >
            Reset
          </Button>
          <IconButton
            size="small"
            onClick={() => setShowFilter(false)}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      )}

      <Grid
        container
        spacing={{ xs: 2, md: 2.5 }}
        sx={{ mb: 2.5 }}
      >
        {statCards.map((card) => (
          <Grid
            key={card.title}
            size={{ xs: 12, sm: 4 }}
          >
            <Card
              elevation={0}
              sx={{
                height: "100%",
                borderRadius: 3,
                border: "1px solid #E2E8F0",
                backgroundColor: "#FFFFFF",
                boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
                transition: "box-shadow 0.2s ease, transform 0.2s ease",
                "&:hover": {
                  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
                  transform: "translateY(-2px)",
                },
              }}
            >
              <CardContent
                sx={{
                  p: { xs: 2, sm: 2.5 },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    {card.icon}

                    <Typography
                      sx={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#475569",
                      }}
                    >
                      {card.title}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      backgroundColor: card.color,
                    }}
                  />
                </Box>

                <Typography
                  sx={{
                    fontSize: {
                      xs: 28,
                      sm: 32,
                    },
                    lineHeight: 1,
                    fontWeight: 700,
                    color: "#172033",
                    mb: 1,
                  }}
                >
                  {card.value.toLocaleString()}
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    color: card.trendUp ? "#16A34A" : "#DC2626",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {card.trendUp ? (
                    <TrendingUpIcon fontSize="small" />
                  ) : (
                    <TrendingDownIcon fontSize="small" />
                  )}

                  {card.trend}
                </Box>

                <Box
                  sx={{
                    mt: 2,
                    height: 4,
                    borderRadius: 10,
                    backgroundColor: card.background,
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      width: `${card.title === "Total Users"
                        ? 100
                        : card.title === "Active Users"
                          ? activePercentage
                          : 100 - activePercentage
                        }%`,
                      height: "100%",
                      borderRadius: 10,
                      backgroundColor: card.color,
                      transition: "width 0.6s ease",
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Stack
        direction="row"
        spacing={1.5}
        sx={{
          mb: 1.5,
          alignItems: "center",
        }}
      >
        <Typography
          sx={{
            fontSize: 16,
            fontWeight: 700,
            color: "#172033",
          }}
        >
          AmCharts
        </Typography>
      </Stack>

      <Grid
        container
        spacing={{ xs: 2, md: 2.5 }}
        sx={{ mb: 3 }}
      >
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={0} sx={cardSx}>
            <CardContent sx={cardContentSx}>
              <ChartTableCard<DepartmentTableRow>
                title="Department Wise Employee"
                columns={departmentColumns}
                data={departmentTableData}
                onRowClick={handleDepartmentClick}
                chart={
                  <AmBarChart
                    data={departmentChartData}
                    title=""
                    height={300}
                  />
                }
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={0} sx={cardSx}>
            <CardContent sx={cardContentSx}>
              <ChartTableCard<StatusTableRow>
                title="Active Users"
                columns={statusColumns}
                data={statusTableData}
                chart={
                  <AmGaugeChart
                    value={statusCount.activeCount}
                    min={0}
                    max={statusCount.totalCount || 1}
                    title=""
                    height={300}
                  />
                }
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Card elevation={0} sx={cardSx}>
            <CardContent sx={cardContentSx}>
              <ChartTableCard<DepartmentTableRow>
                title="Active vs Inactive Users by Department"
                columns={departmentColumns}
                data={departmentTableData}
                onRowClick={handleDepartmentClick}
                chart={
                  <AmStackedBarChart
                    data={stackedData}
                    title=""
                    height={320}
                  />
                }
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Stack
        direction="row"
        spacing={1.5}
        sx={{
          mb: 1.5,
          alignItems: "center",
        }}
      >
        <Typography
          sx={{
            fontSize: 16,
            fontWeight: 700,
            color: "#172033",
          }}
        >
          ReactChart
        </Typography>
      </Stack>

      <Grid
        container
        spacing={{ xs: 2, md: 2.5 }}
      >
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={0} sx={cardSx}>
            <CardContent sx={cardContentSx}>
              <ChartTableCard<DepartmentTableRow>
                title="Department Wise Employee"
                columns={departmentColumns}
                data={departmentTableData}
                onRowClick={handleDepartmentClick}
                chart={
                  <ReactBarChart
                    data={departmentChartData}
                    title=""
                    height={300}
                  />
                }
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={0} sx={cardSx}>
            <CardContent sx={cardContentSx}>
              <ChartTableCard<StatusTableRow>
                title="Active Users"
                columns={statusColumns}
                data={statusTableData}
                chart={
                  <ReactGaugeChart
                    value={statusCount.activeCount}
                    min={0}
                    max={statusCount.totalCount || 1}
                    title=""
                    height={300}
                  />
                }
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Card elevation={0} sx={cardSx}>
            <CardContent sx={cardContentSx}>
              <ChartTableCard<DepartmentTableRow>
                title="Active vs Inactive Users by Department"
                columns={departmentColumns}
                data={departmentTableData}
                onRowClick={handleDepartmentClick}
                chart={
                  <ReactStackedBarChart
                    data={stackedData}
                    title=""
                    height={320}
                  />
                }
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog
        open={departmentDialogOpen}
        onClose={closeDepartmentDialog}
        fullWidth
        maxWidth="xl"
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            color: "#172033",
          }}
        >
          {selectedDepartment} - Employee Details
        </DialogTitle>
        <DialogContent dividers>
          {departmentUsersLoading ? (
            <Box
              sx={{
                minHeight: 250,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
            </Box>
          ) : (
            <ReactMaterialTable<DepartmentUser>
              data={departmentUsers}
              columns={departmentUserColumns}
              page={0}
              rowsPerPage={10}
              totalElements={departmentUsers.length}
              onPageChange={() => { }}
              onRowsPerPageChange={() => { }}
            />
          )}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={closeDepartmentDialog}
            sx={{
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;