import type { ReactNode } from "react";
import { Box,Card,CardContent,Grid,Typography,ToggleButton,ToggleButtonGroup,} from "@mui/material";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import AllInclusiveIcon from "@mui/icons-material/AllInclusive";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const tokens = {
  ink: "#0F172A",
  subtle: "#64748B",
  border: "#E2E8F0",
  surface: "#FFFFFF",
  surfaceMuted: "#F8FAFC",
  radius: 2,
};

export interface StatConfig {
  key: string;
  label: string;
  count: number;
  icon: ReactNode;
  color: string;
  background: string;
  border: string;
  shadow: string;
}

interface StatCardProps extends Omit<StatConfig, "key"> {
  selected: boolean;
  onClick: () => void;
}

export type StatsViewMode = "asPerDate" | "sinceBeginning";

interface UserOverviewStatsProps {
  stats?: StatConfig[];
  selectedStatus?: string;
  onStatClick?: (statusKey: string) => void;
  viewMode: StatsViewMode;
  onViewModeChange: (mode: StatsViewMode) => void;
}

const StatCard = ({
  label,
  count,
  icon,
  color,
  selected,
  onClick,
}: StatCardProps) => {
  const formattedCount = Number(count ?? 0).toLocaleString();

  return (
    <Box
      onClick={onClick}
      role="button"
      aria-pressed={selected}
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
      sx={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: 128,
        p: 2,
        pl: 2.5,
        boxSizing: "border-box",
        borderRadius: 2,
        cursor: "pointer",
        overflow: "hidden",
        border: `1px solid ${selected ? color : `${color}30`}`,
        background: `${color}0D`,
        boxShadow: selected ? `0 0 0 3px ${color}22` : "none",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: 1.5,
        transition:
          "box-shadow 0.15s ease, border-color 0.15s ease, background-color 0.15s ease",

        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          width: 4,
          height: "100%",
          background: color,
        },

        "&:hover": {
          background: `${color}16`,
          borderColor: color,
        },

        "&:focus-visible": {
          outline: `2px solid ${color}`,
          outlineOffset: 2,
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: color,
            boxShadow: `0 4px 10px ${color}40`,
            "& svg": { fontSize: "1.1rem", color: "#FFFFFF" },
          }}
        >
          {icon}
        </Box>

        {selected && (
          <Box
            sx={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: color,
            }}
          >
            <CheckCircleIcon sx={{ fontSize: "0.95rem", color: "#FFFFFF" }} />
          </Box>
        )}
      </Box>

      <Box>
        <Typography
          sx={{
            fontSize: { xs: "1.6rem", sm: "1.8rem" },
            fontWeight: 800,
            lineHeight: 1.1,
            color: tokens.ink,
            letterSpacing: "-0.02em",
          }}
        >
          {formattedCount}
        </Typography>
        <Typography
          sx={{
            fontSize: "0.8rem",
            fontWeight: 600,
            color,
            mt: 0.35,
          }}
        >
          {label}
        </Typography>
      </Box>
    </Box>
  );
};

const UserOverviewStats = ({
  stats = [],
  selectedStatus = "",
  onStatClick = () => {},
  viewMode,
  onViewModeChange,
}: UserOverviewStatsProps) => {
  const safeStats = Array.isArray(stats) ? stats : [];

  return (
    <Card
      elevation={0}
      sx={{
        width: "100%",
        height: "100%",
        minHeight: 250,
        borderRadius: 3,
        border: `1px solid ${tokens.border}`,
        background: tokens.surface,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardContent
        sx={{
          flex: 1,
          minHeight: 0,
          p: { xs: 2, sm: 2.5 },
          "&:last-child": { pb: { xs: 2, sm: 2.5 } },
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            mb: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 1.5,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: tokens.surfaceMuted,
                border: `1px solid ${tokens.border}`,
              }}
            >
              <PeopleAltOutlinedIcon sx={{ fontSize: 18, color: tokens.ink }} />
            </Box>

            <Typography
              sx={{
                color: tokens.ink,
                fontSize: { xs: "0.95rem", sm: "1.05rem" },
                fontWeight: 600,
                lineHeight: 1.2,
              }}
            >
              Users status overview
            </Typography>
          </Box>

          <ToggleButtonGroup
            value={viewMode}
            exclusive
            size="small"
            onChange={(_, val) => {
              if (val) onViewModeChange(val);
            }}
            sx={{
              p: 0.4,
              gap: 0.4,
              bgcolor: tokens.surfaceMuted,
              border: `1px solid ${tokens.border}`,
              borderRadius: 2,
              "& .MuiToggleButton-root": {
                textTransform: "none",
                fontSize: "0.75rem",
                fontWeight: 600,
                color: tokens.subtle,
                px: 1.4,
                py: 0.55,
                border: "none",
                borderRadius: "10px !important",
                transition:
                  "background-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease",

                "&.Mui-selected": {
                  bgcolor: tokens.surface,
                  boxShadow: "0 1px 4px rgba(15,23,42,0.12)",
                },
                "&.Mui-selected:hover": {
                  bgcolor: tokens.surface,
                },
              },
            }}
          >
            <ToggleButton
              value="asPerDate"
              sx={{
                color: viewMode === "asPerDate" ? "#2563EB" : tokens.subtle,
                "&.Mui-selected": { color: "#2563EB" },
              }}
            >
              <EventOutlinedIcon sx={{ fontSize: 15, mr: 0.6 }} />
              As of date
            </ToggleButton>
            <ToggleButton
              value="sinceBeginning"
              sx={{
                color: viewMode === "sinceBeginning" ? "#7C3AED" : tokens.subtle,
                "&.Mui-selected": { color: "#7C3AED" },
              }}
            >
              <AllInclusiveIcon sx={{ fontSize: 15, mr: 0.6 }} />
              Since Beggining
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Grid
          container
          spacing={1.5}
          sx={{ alignItems: "stretch", flex: 1, minHeight: 0 }}
        >
          {safeStats.length > 0 ? (
            safeStats.map((stat) => {
              const { key, ...statProps } = stat;
              return (
                <Grid
                  key={key}
                  size={{ xs: 12, sm: 4 }}
                  sx={{ minWidth: 0, display: "flex" }}
                >
                  <StatCard
                    {...statProps}
                    selected={selectedStatus === key}
                    onClick={() => onStatClick(key)}
                  />
                </Grid>
              );
            })
          ) : (
            <Grid
              size={12}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 112,
              }}
            >
              <Typography sx={{ fontSize: "0.85rem", color: tokens.subtle }}>
                No data to show yet.
              </Typography>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default UserOverviewStats;