import { type ReactNode } from "react";
import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography, IconButton, Tooltip, useMediaQuery, useTheme } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

export interface SidebarMenuItem {
  id: string;
  label: string;
  icon: ReactNode;
}

export interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
  menuItems?: SidebarMenuItem[];
  activePage: string;
  onNavigate: (page: string) => void;
  brandIcon?: ReactNode;
  brandLabel?: string;
  drawerWidth?: number;
  collapsedWidth?: number;
  bgColor?: string;
  accentColor?: string;
  textColor?: string;
  mutedTextColor?: string;
  borderColor?: string;
  isCollapsed?: boolean;
  onCollapseChange?: (collapsed: boolean) => void;
}

const Sidebar = ({
  open = true,
  onClose,
  menuItems = [],
  activePage,
  onNavigate,
  brandIcon,
  brandLabel = "User Master",
  drawerWidth = 238,
  collapsedWidth = 68,
  bgColor = "#172033",
  accentColor = "#3B82F6",
  textColor = "#F8FAFC",
  mutedTextColor = "#94A3B8",
  borderColor = "#263247",
  isCollapsed = false,
  onCollapseChange,
}: SidebarProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const collapsed = isCollapsed;
  const currentWidth = collapsed ? collapsedWidth : drawerWidth;

  const handleNavigation = (page: string) => {
    onNavigate(page);
    onClose?.();
  };

  const handleCollapse = () => {
    onCollapseChange?.(!collapsed);
  };

  return (
    <Drawer
      variant={isMobile ? "temporary" : "persistent"}
      open={isMobile ? open : true}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        width: isMobile ? 0 : (open ? currentWidth : 0),
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: currentWidth,
          boxSizing: "border-box",
          backgroundColor: bgColor,
          color: textColor,
          borderRight: `1px solid ${borderColor}`,
          overflowX: "hidden",
          transition: "width 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          height: "100vh",
        },
      }}
    >
      <Toolbar
        sx={{
          minHeight: "68px !important",
          height: 68,
          px: collapsed ? 1.5 : 2,
          borderBottom: `1px solid ${borderColor}`,
          backgroundColor: bgColor,
          justifyContent: collapsed ? "center" : "flex-start",
          gap: 1.3,
        }}
      >
        {brandIcon && (
          <Box
            sx={{
              width: 38,
              height: 38,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "10px",
              background: `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)`,
              boxShadow: `0 6px 18px ${accentColor}45`,
            }}
          >
            {brandIcon}
          </Box>
        )}

        {!collapsed && (
          <Typography
            sx={{
              fontSize: "0.95rem",
              fontWeight: 800,
              color: "#FFFFFF",
              letterSpacing: "0.3px",
              whiteSpace: "nowrap",
            }}
          >
            {brandLabel}
          </Typography>
        )}
      </Toolbar>

      {!collapsed && (
        <Box
          sx={{
            px: 2,
            pt: 2.5,
            pb: 1,
          }}
        >
          <Typography
            sx={{
              fontSize: "0.62rem",
              fontWeight: 800,
              color: "#64748B",
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
          >
            Navigation
          </Typography>
        </Box>
      )}

      <List
        sx={{
          px: collapsed ? 0.8 : 1.2,
          pt: collapsed ? 1.5 : 0,
          flex: 1,
          overflowY: "auto",
        }}
      >
        {(menuItems ?? []).map((item) => {
          const isActive = activePage === item.id;

          const menuButton = (
            <ListItemButton
              selected={isActive}
              onClick={() => handleNavigation(item.id)}
              sx={{
                minHeight: 44,
                mb: 0.5,
                px: collapsed ? 1 : 1.2,
                justifyContent: collapsed ? "center" : "flex-start",
                borderRadius: "9px",
                position: "relative",
                color: isActive ? "#FFFFFF" : mutedTextColor,
                backgroundColor: isActive ? `${accentColor}24` : "transparent",
                transition: "all 0.18s ease",
                "&:hover": { backgroundColor: isActive ? `${accentColor}30` : "#202C42", color: "#FFFFFF", transform: collapsed ? "scale(1.03)" : "translateX(2px)" },
                "&.Mui-selected": { backgroundColor: `${accentColor}24` },
                "&.Mui-selected:hover": { backgroundColor: `${accentColor}30` },
              }}
            >
              {isActive && (
                <Box
                  sx={{
                    position: "absolute",
                    left: 0,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 3,
                    height: 25,
                    borderRadius: "0 4px 4px 0",
                    backgroundColor: accentColor,
                  }}
                />
              )}

              <ListItemIcon
                sx={{
                  minWidth: collapsed ? 0 : 38,
                  justifyContent: "center",
                  color: isActive ? accentColor : "#7F8EA3",
                  transition: "color 0.18s ease",
                }}
              >
                {item.icon}
              </ListItemIcon>

              {!collapsed && (
                <ListItemText
                  primary={item.label}
                  slotProps={{
                    primary: {
                      sx: {
                        fontSize: "0.78rem",
                        fontWeight: isActive ? 700 : 500,
                        whiteSpace: "nowrap",
                      },
                    },
                  }}
                />
              )}
            </ListItemButton>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.id} title={item.label} placement="right" arrow>
                {menuButton}
              </Tooltip>
            );
          }

          return <Box key={item.id}>{menuButton}</Box>;
        })}
      </List>

      {!isMobile && (
        <Box
          sx={{
            borderTop: `1px solid ${borderColor}`,
            p: 1.5,
            display: "flex",
            justifyContent: collapsed ? "center" : "flex-end",
            backgroundColor: bgColor,
          }}
        >
          <IconButton
            onClick={handleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            sx={{
              width: 34,
              height: 34,
              borderRadius: "8px",
              color: mutedTextColor,
              backgroundColor: "#202C42",
              border: `1px solid ${borderColor}`,
              "&:hover": {
                backgroundColor: "#263752",
                color: accentColor,
                borderColor: accentColor,
              },
              transition: "all 0.2s ease",
            }}
          >
            {collapsed ? (
              <ChevronRightIcon sx={{ fontSize: 19 }} />
            ) : (
              <ChevronLeftIcon sx={{ fontSize: 19 }} />
            )}
          </IconButton>
        </Box>
      )}
    </Drawer>
  );
};

export default Sidebar;