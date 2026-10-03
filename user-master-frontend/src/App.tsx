import { useCallback, useState } from "react";
import { Box, CssBaseline, useMediaQuery, useTheme, GlobalStyles } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Navbar from "./apps/layout/navbar";
import Sidebar, { type SidebarMenuItem } from "./apps/layout/sidebar";
import Footer from "./apps/layout/footer";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import Dashboard from "./apps/pages/user/user-dashboard";
import UserActivityBoard from "./apps/pages/user/user-activity-board";
import userService from "./apps/pages/user/api";

const SIDEBAR_WIDTH = 238;
const SIDEBAR_COLLAPSED_WIDTH = 68;

const menuItems: SidebarMenuItem[] = [
  {
    id: "user-master",
    label: "User Master",
    icon: <ManageAccountsIcon />,
  },
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <DashboardIcon />,
  },
];

const App = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [currentPage, setCurrentPage] = useState("user-master");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const userData = JSON.parse(localStorage.getItem("user") || "{}");

  const userName =
    userData.fullName ||
    userData.userName ||
    userData.name ||
    userData.username ||
    "Admin";

  const userInitial = userName.charAt(0).toUpperCase();

  const userRole =
    userData.role ||
    userData.roleName ||
    userData.roles?.[0] ||
    "Administrator";

  const currentSidebarWidth = sidebarCollapsed
    ? SIDEBAR_COLLAPSED_WIDTH
    : SIDEBAR_WIDTH;

  const handleSidebarCollapse = useCallback((collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
  }, []);

  const handleMenuClick = () => {
    setMobileSidebarOpen((prev) => !prev);
  };

  const handleProfile = () => {
    console.log("Profile clicked");
  };

  const handleLogout = () => {
    userService.logout();
    navigate("/login", { replace: true });
  };

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />;

      case "user-master":
        return <UserActivityBoard />;

      case "add-user":
        return <UserActivityBoard />;

      case "view-users":
        return <UserActivityBoard />;

      default:
        return <Dashboard />;
    }
  };

  return (
    <>
      <CssBaseline />
      <GlobalStyles
        styles={{
          "html, body, #root": {
            height: "100%",
            margin: 0,
            overflow: "hidden",
          },
        }}
      />

      <Box
        sx={{
          height: "100vh",
          "@supports (height: 100dvh)": { height: "100dvh" },
          overflow: "hidden",
          backgroundColor: "#F4F7FA",
          display: "flex",
          position: "relative",
        }}
      >
        <Sidebar
          open={isMobile ? mobileSidebarOpen : true}
          onClose={() => setMobileSidebarOpen(false)}
          menuItems={menuItems}
          activePage={currentPage}
          onNavigate={setCurrentPage}
          brandLabel="USER MASTER"
          brandIcon={
            <ManageAccountsIcon
              sx={{
                color: "#FFFFFF",
                fontSize: 24,
              }}
            />
          }
          isCollapsed={sidebarCollapsed}
          onCollapseChange={handleSidebarCollapse}
        />

        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            height: "100%",
            minHeight: 0,
            overflow: "hidden",
            position: "relative",
          }}
        >
          <Box
            sx={{
              flexShrink: 0,
              zIndex: 1100,
              backgroundColor: "#FFFFFF",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Navbar
              userName={userName}
              userInitial={userInitial}
              onProfile={handleProfile}
              onLogout={handleLogout}
              onMenuClick={handleMenuClick}
            />
          </Box>

          <Box
            component="main"
            sx={{
              flex: 1,
              minHeight: 0,
              width: "100%",
              minWidth: 0,
              backgroundColor: "#F1F5F9",
              overflowY: "auto",
              overflowX: "hidden",
            }}
          >
            {renderPage()}
          </Box>
          <Box sx={{ flexShrink: 0 }}>
            <Footer />
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default App;