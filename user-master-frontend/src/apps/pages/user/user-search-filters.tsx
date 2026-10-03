import { useMemo, useState } from "react";
import { Box, Button, Card, CardContent, Chip, Grid, TextField, Typography, Paper, MenuItem, Fade, Badge, } from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import FilterListIcon from "@mui/icons-material/FilterList";
import AutoComplete from "@/components/auto-complete";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

export type FilterKey =
  | "globalSearch"
  | "createdDateFrom"
  | "createdDateTo"
  | "status"
  | "department"
  | "designation"
  | "branch"
  | "role"
  | "employeeName";

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterConfig {
  label: string;
  key: FilterKey;
  type: "select" | "autocomplete";
  options: FilterOption[];
  placeholder?: string;
}

export interface UserFilterValues {
  globalSearch: string;
  createdDateFrom: string;
  createdDateTo: string;
  status: string;
  department: string;
  designation: string;
  branch: string;
  role: string;
  employeeName: string;
}

interface UserSearchFiltersProps {
  filters: UserFilterValues;
  appliedFilters: UserFilterValues;
  filterFields: FilterConfig[];
  minDate: string;
  maxDate: string;

  onFilterChange: (
    key: FilterKey,
    value: string
  ) => void;

  onApply: () => void;
  onClear: () => void;

  statistics?: {
    pending: number;
    smsPending: number;
    nfa: number;
    actionTaken: number;
    autoNfa: number;
    peClosureDone: number;
    peClosurePending: number;
  };
}

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "8px",
    backgroundColor: "#FFFFFF",
    fontSize: "0.78rem",
  },

  "& .MuiInputBase-input": {
    padding: "8px 10px",
    fontSize: "0.78rem",
  },

  "& .MuiFormHelperText-root": {
    marginLeft: 0,
    fontSize: "0.62rem",
  },
};

const compactFieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "7px",
    backgroundColor: "#FFFFFF",
    fontSize: "0.75rem",
  },

  "& .MuiInputBase-input": {
    padding: "7px 9px",
    fontSize: "0.75rem",
  },
};

const compactAutoCompleteWrapperSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "7px",
    backgroundColor: "#FFFFFF",
    minHeight: "34px",
  },

  "& input": {
    fontSize: "0.75rem",
  },
};

const INPUT_HEIGHT = 40;

const inputSx = {
  "& .MuiOutlinedInput-root": {
    height: INPUT_HEIGHT,
    borderRadius: "8px",
    backgroundColor: "#FFFFFF",
    fontSize: "0.78rem",
    "& fieldset": { borderColor: "#CBD5E1" },
    "&:hover fieldset": { borderColor: "#94A3B8" },
    "&.Mui-focused fieldset": { borderColor: "#6366F1", borderWidth: "1.5px" },
  },
  "& .MuiInputBase-input": {
    paddingTop: 0,
    paddingBottom: 0,
    height: "100%",
    boxSizing: "border-box",
    fontSize: "0.78rem",
  },
  "& .MuiSelect-select": {
    display: "flex",
    alignItems: "center",
  },
  "& .MuiFormHelperText-root": {
    marginLeft: 0,
    fontSize: "0.62rem",
  },
};

const autoCompleteWrapperSx = {
  "& .MuiInputLabel-root": { display: "none" },
  "& .MuiOutlinedInput-root": {
    height: INPUT_HEIGHT,
    minHeight: INPUT_HEIGHT,
    borderRadius: "8px",
    backgroundColor: "#FFFFFF",
    fontSize: "0.78rem",
    padding: "0 12px !important",
    "& fieldset": { borderColor: "#CBD5E1" },
    "&:hover fieldset": { borderColor: "#94A3B8" },
    "&.Mui-focused fieldset": { borderColor: "#6366F1", borderWidth: "1.5px" },
  },
  "& .MuiAutocomplete-input": {
    padding: "0 !important",
    fontSize: "0.78rem",
  },
};

const FieldLabel = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <Typography
    sx={{
      fontSize: "0.68rem",
      fontWeight: 600,
      color: "#475569",
      mb: 0.5,
    }}
  >
    {children}
  </Typography>
);

const StatTile = ({
  label,
  value,
}: {
  label: string;
  value: number;
}) => (
  <Paper
    elevation={0}
    sx={{
      p: 1.2,
      border: "1px solid #E2E8F0",
      borderRadius: "8px",
      backgroundColor: "#FFFFFF",
    }}
  >
    <Typography
      sx={{
        fontSize: "0.62rem",
        color: "#64748B",
        fontWeight: 600,
        mb: 0.3,
      }}
    >
      {label}
    </Typography>

    <Typography
      sx={{
        fontSize: "1rem",
        fontWeight: 700,
        color: "#0F172A",
      }}
    >
      {value}
    </Typography>
  </Paper>
);

const UserSearchFilters = ({
  filters,
  appliedFilters,
  filterFields,
  minDate,
  maxDate,
  onFilterChange,
  onApply,
  onClear,
  statistics,
}: UserSearchFiltersProps) => {
  const [showAdvancedFilters, setShowAdvancedFilters] =
    useState(false);

  const [isHovered, setIsHovered] = useState(false);

  const activeFilterCount = useMemo(
    () =>
      Object.values(appliedFilters ?? {}).filter(
        (value) =>
          typeof value === "string" &&
          value.trim() !== ""
      ).length,
    [appliedFilters]
  );

  const handleSearch = () => {
    const searchValue = filters.globalSearch.trim();

    if (searchValue.length === 1) {
      return;
    }

    if (searchValue.length === 0) {
      return;
    }

    onApply();
  };

  const handleApplyFilters = () => {
    onApply();
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLElement>
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSearch();
    }
  };

  const handleClear = () => {
    onClear();
    setShowAdvancedFilters(false);
  };

  const handleDateChange = (
    key: "createdDateFrom" | "createdDateTo",
    d: dayjs.Dayjs | null,
    min?: string,
    max?: string
  ) => {
    if (d === null) {
      onFilterChange(key, "");
      return;
    }
    if (!d.isValid()) return;
    if (min && d.isBefore(dayjs(min), "day")) return;
    if (max && d.isAfter(dayjs(max), "day")) return;
    onFilterChange(key, d.format("YYYY-MM-DD"));
  };

  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid #E2E8F0",
        borderRadius: "12px",
        backgroundColor: "#FFFFFF",
        overflow: "visible",
      }}
    >
      <CardContent
        sx={{
          p: 2,
          "&:last-child": {
            pb: 2,
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1.5,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.8,
            }}
          >
            <FilterListIcon
              sx={{
                fontSize: 19,
                color: "#6366F1",
              }}
            />

            <Typography
              sx={{
                fontSize: "0.9rem",
                fontWeight: 700,
                color: "#0F172A",
              }}
            >
              Search & Filter
            </Typography>

            {activeFilterCount > 0 && (
              <Chip
                label={`${activeFilterCount} active`}
                size="small"
                sx={{
                  height: 20,
                  bgcolor: "#EEF2FF",
                  color: "#4F46E5",
                  fontSize: "0.55rem",
                  fontWeight: 600,
                }}
              />
            )}
          </Box>
        </Box>

        <Box sx={{ mb: 1.8 }}>
          <TextField
            fullWidth
            placeholder="Search by name, email, ID..."
            value={filters.globalSearch}
            onChange={(e) =>
              onFilterChange(
                "globalSearch",
                e.target.value
              )
            }
            onKeyDown={handleKeyDown}
            helperText="Enter at least 2 letters to search"
            sx={fieldSx}
            slotProps={{
              input: {
                endAdornment: (
                  <Button
                    type="button"
                    onClick={handleSearch}
                    sx={{
                      minWidth: 34,
                      width: 34,
                      height: 34,
                      borderRadius: "7px",
                      p: 0,
                      color: "#6366F1",
                    }}
                  >
                    <SearchRoundedIcon sx={{ fontSize: 19 }} />
                  </Button>
                ),
              },
            }}
          />
        </Box>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel>From Date</FieldLabel>
              <DatePicker
                format="DD-MM-YYYY"
                value={filters.createdDateFrom ? dayjs(filters.createdDateFrom) : null}
                minDate={minDate ? dayjs(minDate) : undefined}
                maxDate={
                  filters.createdDateTo
                    ? dayjs(filters.createdDateTo)
                    : maxDate
                      ? dayjs(maxDate)
                      : undefined
                }
                onChange={(d) =>
                  handleDateChange(
                    "createdDateFrom",
                    d,
                    minDate || undefined,
                    filters.createdDateTo || maxDate || undefined
                  )
                }
                slotProps={{
                  textField: { size: "small", fullWidth: true, sx: fieldSx },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel>To Date</FieldLabel>
              <DatePicker
                format="DD-MM-YYYY"
                value={filters.createdDateTo ? dayjs(filters.createdDateTo) : null}
                minDate={
                  filters.createdDateFrom
                    ? dayjs(filters.createdDateFrom)
                    : minDate
                      ? dayjs(minDate)
                      : undefined
                }
                maxDate={maxDate ? dayjs(maxDate) : undefined}
                onChange={(d) =>
                  handleDateChange(
                    "createdDateTo",
                    d,
                    filters.createdDateFrom || minDate || undefined,
                    maxDate || undefined
                  )
                }
                slotProps={{
                  textField: { size: "small", fullWidth: true, sx: fieldSx },
                }}
              />
            </Grid>
          </Grid>
        </LocalizationProvider>
        {showAdvancedFilters && (
          <Fade
            in={showAdvancedFilters}
            timeout={200}
          >
            <Box
              sx={{
                mt: 1.8,
                pt: 1.8,
                borderTop:
                  "1.5px solid #E2E8F0",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.8,
                  mb: 1.5,
                }}
              >
                <TuneRoundedIcon
                  sx={{
                    fontSize: 18,
                    color: "#6366F1",
                  }}
                />

                <Typography
                  sx={{
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    color: "#0F172A",
                  }}
                >
                  Advanced Filters
                </Typography>

                {activeFilterCount > 0 && (
                  <Chip
                    label={`${activeFilterCount} active`}
                    size="small"
                    sx={{
                      height: 20,
                      bgcolor: "#EEF2FF",
                      color: "#4F46E5",
                      fontSize: "0.55rem",
                      fontWeight: 600,
                    }}
                  />
                )}
              </Box>

              <Grid container spacing={1.5}>
                {filterFields.map((field) => (
                  <Grid
                    size={{
                      xs: 12,
                      sm: 6,
                      md: 4,
                    }}
                    key={field.key}
                  >
                    <FieldLabel>
                      {field.label}
                    </FieldLabel>

                    {field.type ===
                      "autocomplete" ? (
                      <Box
                        sx={
                          compactAutoCompleteWrapperSx
                        }
                      >
                        <AutoComplete
                          label=""
                          options={field.options}
                          value={
                            field.options.find(
                              (opt) =>
                                String(
                                  opt.value
                                ) ===
                                String(
                                  filters[
                                  field.key
                                  ]
                                )
                            ) || null
                          }
                          onChange={(
                            newValue
                          ) =>
                            onFilterChange(
                              field.key,
                              newValue?.value !=
                                null
                                ? String(
                                  newValue.value
                                )
                                : ""
                            )
                          }
                        />
                      </Box>
                    ) : (
                      <TextField
                        select
                        fullWidth
                        size="small"
                        value={filters[field.key]}
                        onChange={(e) => onFilterChange(field.key, e.target.value)}
                        sx={inputSx}
                        slotProps={{
                          select: {
                            displayEmpty: true,
                            renderValue: (selected) => {
                              const value = String(selected ?? "");
                              if (!value) {
                                return <span style={{ color: "#94A3B8" }}>All</span>;
                              }
                              return field.options.find((o) => String(o.value) === value)?.label ?? value;
                            },
                          },
                        }}
                      >
                        <MenuItem value="">All</MenuItem>
                        {field.options.map((opt) => (
                          <MenuItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Fade>
        )}

        <Box
          sx={{
            display: "flex",
            gap: 1,
            alignItems: "center",
            justifyContent: "space-between",
            mt: 1.8,
            pt: 1.5,
            borderTop: showAdvancedFilters
              ? "1.5px solid #E2E8F0"
              : "none",
          }}
        >
          <Box
            sx={{
              display: "flex",
              gap: 1,
              alignItems: "center",
            }}
          >
            <Button
              type="button"
              variant="contained"
              startIcon={
                <SearchRoundedIcon
                  sx={{ fontSize: 16 }}
                />
              }
              onClick={handleApplyFilters}
              sx={{
                borderRadius: "7px",
                textTransform: "none",
                fontSize: "0.72rem",
                fontWeight: 600,
                minHeight: 34,
                px: 1.5,
              }}
            >
              Apply Filters
            </Button>

            <Button
              type="button"
              variant="outlined"
              endIcon={
                <KeyboardArrowDownRoundedIcon
                  sx={{
                    fontSize: 16,
                    transform:
                      showAdvancedFilters
                        ? "rotate(180deg)"
                        : "none",
                    transition:
                      "transform 0.3s ease",
                  }}
                />
              }
              onClick={() =>
                setShowAdvancedFilters(
                  (prev) => !prev
                )
              }
              sx={{
                borderRadius: "7px",
                textTransform: "none",
                fontSize: "0.72rem",
                fontWeight: 600,
                minHeight: 34,
                px: 1.2,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                <TuneRoundedIcon
                  sx={{ fontSize: 16 }}
                />

                {showAdvancedFilters
                  ? "Less"
                  : "More"}

                {!showAdvancedFilters &&
                  activeFilterCount > 0 && (
                    <Badge
                      badgeContent={
                        activeFilterCount
                      }
                      color="primary"
                      sx={{
                        ml: 0.3,
                        "& .MuiBadge-badge": {
                          fontSize:
                            "0.5rem",
                          minWidth: 15,
                          height: 15,
                          padding: 0,
                        },
                      }}
                    />
                  )}
              </Box>
            </Button>
          </Box>

          <Button
            type="button"
            variant="outlined"
            startIcon={
              <RestartAltIcon
                sx={{ fontSize: 16 }}
              />
            }
            onClick={handleClear}
            sx={{
              borderRadius: "7px",
              textTransform: "none",
              fontSize: "0.72rem",
              fontWeight: 600,
              minHeight: 34,
              px: 1.2,
            }}
          >
            Reset
          </Button>
        </Box>

        {statistics && (
          <Fade in timeout={300}>
            <Box sx={{ mt: 2 }}>
              <Typography
                sx={{
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  color: "#0F172A",
                  mb: 1,
                }}
              >
                Statistics Overview
              </Typography>

              <Grid
                container
                spacing={1}
              >
                <Grid
                  size={{
                    xs: 6,
                    sm: 4,
                    md: 2,
                  }}
                >
                  <StatTile
                    label="Pending"
                    value={
                      statistics.pending
                    }
                  />
                </Grid>

                <Grid
                  size={{
                    xs: 6,
                    sm: 4,
                    md: 2,
                  }}
                >
                  <StatTile
                    label="SMS Pending"
                    value={
                      statistics.smsPending
                    }
                  />
                </Grid>

                <Grid
                  size={{
                    xs: 6,
                    sm: 4,
                    md: 2,
                  }}
                >
                  <StatTile
                    label="NFA"
                    value={
                      statistics.nfa
                    }
                  />
                </Grid>

                <Grid
                  size={{
                    xs: 6,
                    sm: 4,
                    md: 2,
                  }}
                >
                  <StatTile
                    label="Action Taken"
                    value={
                      statistics.actionTaken
                    }
                  />
                </Grid>

                <Grid
                  size={{
                    xs: 6,
                    sm: 4,
                    md: 2,
                  }}
                >
                  <StatTile
                    label="Auto NFA"
                    value={
                      statistics.autoNfa
                    }
                  />
                </Grid>

                <Grid
                  size={{
                    xs: 6,
                    sm: 4,
                    md: 2,
                  }}
                >
                  <StatTile
                    label="PE Closure Done"
                    value={
                      statistics.peClosureDone
                    }
                  />
                </Grid>

                <Grid
                  size={{
                    xs: 6,
                    sm: 4,
                    md: 2,
                  }}
                >
                  <StatTile
                    label="PE Closure Pending"
                    value={
                      statistics.peClosurePending
                    }
                  />
                </Grid>
              </Grid>
            </Box>
          </Fade>
        )}
      </CardContent>
    </Card>
  );
};

export default UserSearchFilters;