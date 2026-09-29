import { useEffect, useState, type MouseEvent } from "react";
import { Divider, AppBar, Badge, Avatar, Pagination, Box, Button, IconButton, ListItemIcon, ListItemButton, Menu, MenuItem, Toolbar, Typography, Popover, Dialog, DialogContent, DialogActions } from "@mui/material";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import userService, { type Notification } from "@/pages/user/api";
import dreamsolLogo from "../../../src/assets/dream-sol.png";
import DownloadIcon from "@mui/icons-material/Download";

interface NavbarProps {
  userName?: string;
  userInitial?: string;
  onProfile?: () => void;
  onLogout?: () => void;
  onMenuClick?: () => void;
}

const Navbar = ({
  userName = "Admin",
  userInitial = "A",
  onProfile,
  onLogout,
  onMenuClick,
}: NavbarProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationPage, setNotificationPage] = useState(0);
  const [notificationTotalPages, setNotificationTotalPages] = useState(0);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [selectedExportNotification, setSelectedExportNotification] = useState<Notification | null>(null);
  const NOTIFICATION_PAGE_SIZE = 3;
  const menuOpen = Boolean(anchorEl);
  const notificationOpen = Boolean(notificationAnchor);

  const handleProfileClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    handleClose();
    onProfile?.();
  };

  const handleLogout = () => {
    handleClose();
    onLogout?.();
  };

  const fetchUnreadCount = async () => {
    try {
      const count = await userService.getUnreadNotificationCount();
      setUnreadCount(count ?? 0);
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  };

  const fetchNotifications = async (page = 0) => {
    try {
      setNotificationLoading(true);
      const data = await userService.getNotifications(page, NOTIFICATION_PAGE_SIZE);
      setNotifications(data?.content ?? []);
      setNotificationPage(data?.number ?? page);
      setNotificationTotalPages(data?.totalPages ?? 0);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      setNotifications([]);
      setNotificationTotalPages(0);
    } finally {
      setNotificationLoading(false);
    }
  };

  const handleNotificationPageChange = (
    _event: React.ChangeEvent<unknown>,
    newPage: number,
  ) => {
    fetchNotifications(newPage - 1);
  };

  const handleDownloadExport = async (referenceId: string) => {
    try {
      const blob = await userService.downloadExportFile(referenceId);
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute("download", "user_master_export.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Failed to download export file:", error);
    }
  };

  useEffect(() => {
    fetchNotifications(0);
    fetchUnreadCount();
  }, []);

  useEffect(() => {
    const handleNotificationUpdate = () => {
      fetchNotifications(0);
      fetchUnreadCount();
    };
    window.addEventListener("notification-updated", handleNotificationUpdate);
    return () => {
      window.removeEventListener("notification-updated", handleNotificationUpdate);
    };
  }, []);

  const handleNotificationClick = async (notification: Notification) => {
    try {
      if (!notification.isRead) {
        await userService.markNotificationAsRead(notification.id);
        setNotifications((prev) =>
          prev.map((item) =>
            item.id === notification.id ? { ...item, read: true } : item,
          ),
        );
        setUnreadCount((prev) => Math.max(prev - 1, 0));
      }

      if (notification.type === "USER_EXPORT" && notification.referenceId) {
        setSelectedExportNotification(notification);
        setExportDialogOpen(true);
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const parseExportMessage = (message: string) => {
    const recordsMatch = message.match(/of (\d+) records/);
    const dateMatch = message.match(/from (\S+) to (\S+)/);
    return {
      records: recordsMatch ? recordsMatch[1] : "N/A",
      fromDate: dateMatch ? dateMatch[1] : "",
      toDate: dateMatch ? dateMatch[2] : "",
    };
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: "#FFFFFF",
        color: "#172033",
        borderBottom: "1px solid #E2E8F0",
        boxShadow: "0 2px 12px rgba(15,23,42,0.05)",
      }}
    >
      <Toolbar
        disableGutters
        sx={{
          height: 68,
          minHeight: "68px !important",
          px: { xs: 1.5, sm: 2.5, md: 3 },
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <IconButton
            onClick={onMenuClick}
            sx={{
              display: { xs: "flex", md: "none" },
              mr: 1,
              color: "#172033",
            }}
          >
            <MenuRoundedIcon />
          </IconButton>

          <Box
            component="img"
            src={dreamsolLogo}
            alt="DreamSol"
            sx={{
              height: { xs: 28, sm: 30, md: 34 },
              width: "auto",
              display: "block",
              objectFit: "contain",
            }}
          />
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 0.75, sm: 1.25 },
            flexShrink: 0,
          }}
        >
          <IconButton
            onClick={(event) => setNotificationAnchor(event.currentTarget)}
            sx={{
              width: 42,
              height: 42,
              color: "#172033",
              borderRadius: "10px",
              "&:hover": {
                backgroundColor: "#F1F5F9",
              },
            }}
          >
            <Badge badgeContent={unreadCount} color="error" max={99}>
              <NotificationsNoneRoundedIcon />
            </Badge>
          </IconButton>

          <Popover
            open={notificationOpen}
            anchorEl={notificationAnchor}
            onClose={() => setNotificationAnchor(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            slotProps={{
              paper: {
                sx: {
                  width: { xs: 340, sm: 420 },
                  maxHeight: 550,
                  mt: 1,
                  borderRadius: "12px",
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 12px 30px rgba(15,23,42,0.12)",
                  overflow: "hidden",
                },
              },
            }}
          >
            <Box
              sx={{
                px: 2,
                py: 1.5,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography sx={{ fontSize: "0.95rem", fontWeight: 800, color: "#172033" }}>
                Notifications
              </Typography>
              {unreadCount > 0 && (
                <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#2563EB" }}>
                  {unreadCount} unread
                </Typography>
              )}
            </Box>

            <Divider />

            <Box sx={{ maxHeight: 470, overflowY: "auto" }}>
              {notificationLoading ? (
                <Box sx={{ py: 5, px: 2, textAlign: "center" }}>
                  <Typography sx={{ fontSize: "0.85rem", color: "#64748B" }}>
                    Loading notifications...
                  </Typography>
                </Box>
              ) : notifications.length === 0 ? (
                <Box sx={{ py: 5, px: 2, textAlign: "center" }}>
                  <NotificationsNoneRoundedIcon sx={{ fontSize: 40, color: "#94A3B8", mb: 1 }} />
                  <Typography sx={{ fontSize: "0.85rem", color: "#64748B" }}>
                    No notifications
                  </Typography>
                </Box>
              ) : (
                notifications.map((notification) => (
                  <ListItemButton
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    sx={{
                      px: 2,
                      py: 1.5,
                      alignItems: "flex-start",
                      backgroundColor: notification.isRead ? "#FFFFFF" : "#EFF6FF",
                      borderBottom: "1px solid #F1F5F9",
                      "&:hover": {
                        backgroundColor: notification.isRead ? "#F8FAFC" : "#DBEAFE",
                      },
                    }}
                  >
                    <Box sx={{ width: "100%" }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
                        <Typography
                          sx={{
                            fontSize: "0.82rem",
                            fontWeight: notification.isRead ? 600 : 800,
                            color: "#172033",
                          }}
                        >
                          {notification.title}
                        </Typography>


                      </Box>

                      <Typography sx={{ mt: 0.5, fontSize: "0.75rem", lineHeight: 1.5, color: "#64748B" }}>
                        {notification.message}
                      </Typography>
                      <Typography sx={{ mt: 0.8, fontSize: "0.65rem", color: "#94A3B8" }}>
                        {new Date(notification.createdAt).toLocaleString()}
                      </Typography>
                    </Box>
                  </ListItemButton>
                ))
              )}
            </Box>

            {notificationTotalPages > 1 && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  py: 1.5,
                  borderTop: "1px solid #E0E0E0",
                }}
              >
                <Pagination
                  count={notificationTotalPages}
                  page={notificationPage + 1}
                  onChange={handleNotificationPageChange}
                  color="primary"
                  size="small"
                  disabled={notificationLoading}
                />
              </Box>
            )}
          </Popover>

          <Dialog
            open={exportDialogOpen}
            onClose={() => setExportDialogOpen(false)}
            maxWidth="xs"
            fullWidth
            slotProps={{
              paper: { sx: { borderRadius: 3, overflow: "hidden" } },
            }}
          >
            {selectedExportNotification && (() => {
              const { records, fromDate, toDate } = parseExportMessage(selectedExportNotification.message);
              return (
                <>
                  <Box
                    sx={{
                      background: "linear-gradient(135deg,#6366F1,#4F46E5)",
                      px: 3,
                      py: 2.5,
                    }}
                  >
                    <Typography sx={{ color: "#FFFFFF", fontSize: "1rem", fontWeight: 700 }}>
                      User Data Export
                    </Typography>
                  </Box>

                  <DialogContent sx={{ px: 3, py: 2.5 }}>
                    <Typography sx={{ color: "#0F172A", fontSize: "0.9rem", mb: 1.5 }}>
                      Hello,
                    </Typography>
                    <Typography sx={{ color: "#334155", fontSize: "0.85rem", lineHeight: 1.6, mb: 2 }}>
                      Your requested user data export has been generated and is attached below as an Excel file.
                    </Typography>

                    <Box
                      sx={{
                        bgcolor: "#F8FAFC",
                        border: "1px solid #E2E8F0",
                        borderRadius: 2,
                        p: 1.5,
                        mb: 2,
                      }}
                    >
                      <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
                        <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748B" }}>
                          Date Range
                        </Typography>
                        <Typography sx={{ fontSize: "0.75rem", color: "#0F172A" }}>
                          {fromDate} to {toDate}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
                        <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748B" }}>
                          Records
                        </Typography>
                        <Typography sx={{ fontSize: "0.75rem", color: "#0F172A" }}>
                          {records}
                        </Typography>
                      </Box>
                    </Box>

                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleDownloadExport(selectedExportNotification.referenceId!)}
                      sx={{
                        textTransform: "none",
                        borderRadius: 2,
                        fontWeight: 600,
                        background: "linear-gradient(135deg,#6366F1,#4F46E5)",
                      }}
                    >
                      Download Excel
                    </Button>
                  </DialogContent>
                </>
              );
            })()}

            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={() => setExportDialogOpen(false)} sx={{ textTransform: "none" }}>
                Close
              </Button>
            </DialogActions>
          </Dialog>

          <Button
            onClick={handleProfileClick}
            aria-controls={menuOpen ? "profile-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={menuOpen ? "true" : undefined}
            sx={{
              minWidth: 0,
              height: 48,
              px: { xs: 0.5, sm: 1 },
              py: 0.5,
              display: "flex",
              alignItems: "center",
              borderRadius: "10px",
              color: "#172033",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "#F1F5F9",
              },
            }}
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                flexShrink: 0,
                background: "linear-gradient(135deg,#3B82F6,#2563EB)",
                fontSize: "0.85rem",
                fontWeight: 800,
                boxShadow: "0 0 0 3px rgba(59,130,246,0.10)",
              }}
            >
              {userInitial}
            </Avatar>

            <Box
              sx={{
                display: { xs: "none", sm: "flex" },
                flexDirection: "column",
                justifyContent: "center",
                textAlign: "left",
                ml: 1,
                minWidth: 0,
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.78rem",
                  fontWeight: 800,
                  lineHeight: 1.2,
                  whiteSpace: "nowrap",
                  maxWidth: 130,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {userName}
              </Typography>
            </Box>

            <KeyboardArrowDownRoundedIcon
              sx={{
                fontSize: 20,
                ml: { xs: 0.25, sm: 0.5 },
                color: "#64748B",
                transform: menuOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease",
              }}
            />
          </Button>

          <Menu
            id="profile-menu"
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={handleClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            slotProps={{
              paper: {
                sx: {
                  mt: 1,
                  minWidth: 190,
                  borderRadius: "10px",
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 12px 30px rgba(15,23,42,0.12)",
                  overflow: "hidden",
                },
              },
            }}
          >
            <MenuItem
              onClick={handleProfile}
              sx={{
                py: 1.1,
                px: 2,
                "&:hover": {
                  backgroundColor: "#F8FAFC",
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: "34px !important" }}>
                <PersonOutlineOutlinedIcon fontSize="small" sx={{ color: "#2563EB" }} />
              </ListItemIcon>
              <Typography sx={{ fontSize: "0.82rem", fontWeight: 500 }}>Profile</Typography>
            </MenuItem>

            <MenuItem
              onClick={handleLogout}
              sx={{
                py: 1.1,
                px: 2,
                "&:hover": {
                  backgroundColor: "#FEF2F2",
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: "34px !important" }}>
                <LogoutIcon fontSize="small" sx={{ color: "#EF4444" }} />
              </ListItemIcon>
              <Typography sx={{ fontSize: "0.82rem", fontWeight: 500 }}>Logout</Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;