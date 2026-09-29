import { useState } from "react";
import { Box, Button, Card, CardContent, Grid, TextField, Typography, } from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    bgcolor: "#FAFBFC",
    height: 38,
    fontSize: "0.8rem",
    transition: "all 0.2s ease",
    "& fieldset": {
      borderColor: "#E2E8F0",
      borderWidth: 1.5,
    },
    "&:hover fieldset": {
      borderColor: "#94A3B8",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#6366F1",
      borderWidth: 2,
    },
  },
};

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <Typography
    sx={{
      fontSize: "0.65rem",
      fontWeight: 600,
      color: "#475569",
      mb: 0.5,
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    }}
  >
    {children}
  </Typography>
);

export interface DashboardDateFilterProps {
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onApply: () => void;
  onReset: () => void;
  minDate?: string;
  maxDate?: string;
}

const DashboardDateFilter = ({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onApply,
  onReset,
  minDate,
  maxDate,
}: DashboardDateFilterProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const today = new Date().toISOString().split("T")[0];
  const isFiltered = Boolean(dateFrom || dateTo);

  return (
    <Card
      elevation={0}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        borderRadius: 3,
        border: "1px solid #E2E8F0",
        background: "linear-gradient(145deg, #FFFFFF 0%, #F8FAFC 100%)",
        boxShadow: isHovered
          ? "0 8px 32px rgba(15,23,42,0.08)"
          : "0 2px 8px rgba(15,23,42,0.025)",
        transition: "box-shadow 0.3s ease",
        mb: { xs: 2.5, md: 3 },
      }}
    >
      <CardContent sx={{ p: { xs: 1.5, sm: 2 }, "&:last-child": { pb: { xs: 1.5, sm: 2 } } }}>
        <Grid
          container
          spacing={1.5}
          sx={{ alignItems: "flex-end" }}
        >
          <Grid size={{ xs: 12, sm: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "#EEF2FF",
                  border: "1.5px solid #C7D2FE",
                  flexShrink: 0,
                }}
              >
                <CalendarMonthRoundedIcon sx={{ fontSize: 18, color: "#4F46E5" }} />
              </Box>
              <Typography
                sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#0F172A" }}
              >
                Filter by Date
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 6, sm: 3 }}>
            <FieldLabel>From Date</FieldLabel>
            <TextField
              fullWidth
              type="date"
              value={dateFrom}
              onChange={(e) => {
                const value = e.target.value;
                if (minDate && value < minDate) return;
                if (dateTo && value > dateTo) return;
                onDateFromChange(value);
              }}
              slotProps={{
                htmlInput: { min: minDate, max: dateTo || maxDate || today },
              }}
              sx={fieldSx}
            />
          </Grid>

          <Grid size={{ xs: 6, sm: 3 }}>
            <FieldLabel>To Date</FieldLabel>
            <TextField
              fullWidth
              type="date"
              value={dateTo}
              onChange={(e) => {
                const value = e.target.value;
                if (value > today) return;
                if (dateFrom && value < dateFrom) return;
                onDateToChange(value);
              }}
              slotProps={{
                htmlInput: { min: dateFrom || minDate, max: maxDate || today },
              }}
              sx={fieldSx}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                type="button"
                variant="contained"
                fullWidth
                startIcon={<SearchRoundedIcon sx={{ fontSize: 16 }} />}
                onClick={onApply}
                sx={{
                  height: 38,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  background: "linear-gradient(135deg, #6366F1, #4F46E5)",
                  boxShadow: "0 2px 12px rgba(79,70,229,0.25)",
                  "&:hover": {
                    boxShadow: "0 4px 20px rgba(79,70,229,0.35)",
                    transform: "translateY(-1px)",
                  },
                  "&:active": { transform: "translateY(0)" },
                }}
              >
                Apply
              </Button>

              <Button
                type="button"
                variant="outlined"
                fullWidth
                disabled={!isFiltered}
                startIcon={<RestartAltIcon sx={{ fontSize: 16 }} />}
                onClick={onReset}
                sx={{
                  height: 38,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  color: "#DC2626",
                  borderColor: "#FCA5A5",
                  borderWidth: 1.5,
                  "&:hover": {
                    bgcolor: "#FEF2F2",
                    borderColor: "#DC2626",
                    borderWidth: 2,
                  },
                  "&.Mui-disabled": {
                    color: "#CBD5E1",
                    borderColor: "#E2E8F0",
                  },
                }}
              >
                Reset
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default DashboardDateFilter;