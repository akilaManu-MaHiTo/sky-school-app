import { useState } from "react";
import {
  Badge,
  Box,
  Button,
  Divider,
  IconButton,
  Popover,
  Stack,
  Typography,
  Alert,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchStudentNotificationCount,
  fetchStudentNotifications,
  markAsRead,
  markAllAsRead,
  fetchParentNotificationCount,
  fetchParentNotifications,
} from "../../api/notificationApi";
import NotificationDetailsDialog, {
  StudentNotificationItem,
} from "./NotificationDetailsDialog";
import { useSnackbar } from "notistack";
import CheckIcon from "@mui/icons-material/Check";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import useIsMobile from "../../customHooks/useIsMobile";
import useCurrentUser from "../../hooks/useCurrentUser";
import { EmployeeType } from "../../api/userApi";

const NotificationsPopover = () => {
  const [notificationAnchorEl, setNotificationAnchorEl] =
    useState<HTMLElement | null>(null);
  const [notificationAnchorPosition, setNotificationAnchorPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [selectedNotification, setSelectedNotification] =
    useState<StudentNotificationItem | null>(null);
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { isMobile } = useIsMobile();
  const { user } = useCurrentUser();

  const { data: notificationCount } = useQuery({
    queryKey: ["student-notify-count"],
    queryFn: fetchStudentNotificationCount,
    refetchInterval: 10000,
    enabled: user?.employeeType === EmployeeType.STUDENT,
  });
  const { data: parentNotificationCount } = useQuery({
    queryKey: ["parent-notify-count"],
    queryFn: fetchParentNotificationCount,
    refetchInterval: 10000,
    enabled: user?.employeeType === EmployeeType.PARENT,
  });
  const { data: studentNotification } = useQuery({
    queryKey: ["student-notify"],
    queryFn: fetchStudentNotifications,
    refetchInterval: 10000,
    enabled: user?.employeeType === EmployeeType.STUDENT,
  });
  const { data: parentNotification } = useQuery({
    queryKey: ["parent-notify"],
    queryFn: fetchParentNotifications,
    refetchInterval: 10000,
    enabled: user?.employeeType === EmployeeType.PARENT,
  });

  const markAsReadMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: (data) => {
      const message = data?.data?.message || data?.message || "Marked as read";
      enqueueSnackbar(message, { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["student-notify-count"] });
      queryClient.invalidateQueries({ queryKey: ["student-notify"] });
      queryClient.invalidateQueries({ queryKey: ["parent-notify-count"] });
      queryClient.invalidateQueries({ queryKey: ["parent-notify"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: (data) => {
      const message =
        data?.data?.message ||
        data?.message ||
        "All notifications marked as read";
      enqueueSnackbar(message, { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["student-notify-count"] });
      queryClient.invalidateQueries({ queryKey: ["student-notify"] });
      queryClient.invalidateQueries({ queryKey: ["parent-notify-count"] });
      queryClient.invalidateQueries({ queryKey: ["parent-notify"] });
    },
  });

  const handleMarkAllAsRead = () => {
    const notificationIds = Array.from(
      new Set(
        [...(studentNotification ?? []), ...(parentNotification ?? [])]
          .filter((item) => !item.markedAsRead)
          .map((item) => item.id),
      ),
    );

    if (notificationIds.length === 0) {
      enqueueSnackbar("All notifications are already read", {
        variant: "info",
      });
      return;
    }

    markAllAsReadMutation.mutate({ notificationIds });
  };

  const handleNotificationOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
    if (isMobile) {
      const rect = event.currentTarget.getBoundingClientRect();
      setNotificationAnchorPosition({
        top: rect.bottom,
        left: window.innerWidth / 2,
      });
    }
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
    setNotificationAnchorPosition(null);
  };

  const handleOpenDetails = (item: StudentNotificationItem) => {
    setSelectedNotification(item);
  };

  const handleCloseDetails = () => {
    setSelectedNotification(null);
  };

  const isNotificationOpen = Boolean(notificationAnchorEl);

  return (
    <>
      <Badge
        sx={{ marginRight: "2rem", marginTop: "0.5rem" }}
        color="error"
        badgeContent={notificationCount || parentNotificationCount}
      >
        <IconButton size="small" onClick={handleNotificationOpen}>
          <NotificationsIcon
            sx={{
              color:
                notificationCount === 0 ? "gray" : "var(--pallet-light-blue)",
            }}
          />
        </IconButton>
      </Badge>
      <Popover
        open={isNotificationOpen}
        anchorEl={notificationAnchorEl}
        anchorReference={isMobile ? "anchorPosition" : "anchorEl"}
        anchorPosition={
          isMobile && notificationAnchorPosition
            ? notificationAnchorPosition
            : undefined
        }
        onClose={handleNotificationClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: isMobile ? "center" : "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: isMobile ? "center" : "right",
        }}
        PaperProps={{
          sx: {
            width: isMobile ? 360 : 500,
            maxHeight: 360,
            px: 1,
            pb: 1,
            pt: 0,
            overflowY: "auto",
          },
        }}
      >
        <Box
          sx={{
            px: 1,
            py: 0.5,
            position: "sticky",
            top: 0,
            zIndex: 1,
            bgcolor: "background.paper",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center",mt: 1.5 }}>
            <Typography
              variant="caption"
              sx={{ color: "var(--pallet-blue)", fontWeight: 500 }}
            >
              Notifications
            </Typography>
            <Typography
              variant="caption"
              onClick={
                (studentNotification || parentNotification)?.some(
                  (item) => !item.markedAsRead,
                )
                  ? handleMarkAllAsRead
                  : undefined
              }
              sx={{
                marginLeft: "auto",
                minWidth: "auto",
                color: "var(--pallet-blue)",
                fontWeight: 500,
                px: 1,
                cursor: (studentNotification || parentNotification)?.some(
                  (item) => !item.markedAsRead,
                )
                  ? "pointer"
                  : "not-allowed",
                opacity: (studentNotification || parentNotification)?.some(
                  (item) => !item.markedAsRead,
                )
                  ? 1
                  : 0.5,
              }}
            >
              Mark All
            </Typography>
          </Box>
        <Divider sx={{ mb: 1 }} />

        </Box>
        <Stack spacing={1} sx={{ px: 1, pb: 1 }}>
          {(studentNotification || parentNotification)?.length > 0 ? (
            (studentNotification || parentNotification)?.map((item) => (
              <Alert
                severity={item.markedAsRead ? "info" : "warning"}
                icon={false}
                key={item.id}
                sx={{
                  px: 2,
                  borderRadius: 1.5,
                  cursor: "pointer",
                }}
                onClick={() => handleOpenDetails(item)}
              >
                {/* Row 1 - Title */}
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 500, color: "#1a1a1a", mb: 0.5 }}
                >
                  {item.title}
                </Typography>

                {/* Row 2 - Description + Icon */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1,
                  }}
                >
                  <Typography
                    variant="caption"
                    noWrap
                    sx={{
                      color: "#4a4a4a",
                      flex: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.description}
                  </Typography>

                  <IconButton
                    size="small"
                    onClick={(event) => {
                      event.stopPropagation();
                      markAsReadMutation.mutate(item.id);
                    }}
                    disabled={Boolean(item.markedAsRead)}
                  >
                    {item.markedAsRead ? (
                      <DoneAllIcon fontSize="small" color="success" />
                    ) : (
                      <CheckIcon fontSize="small" color="error" />
                    )}
                  </IconButton>
                </Box>
              </Alert>
            ))
          ) : (
            <Typography variant="body2" sx={{ color: "#6b6b6b", px: 0.5 }}>
              No notifications
            </Typography>
          )}
        </Stack>
      </Popover>
      <NotificationDetailsDialog
        open={Boolean(selectedNotification)}
        notification={selectedNotification}
        onClose={handleCloseDetails}
      />
    </>
  );
};

export default NotificationsPopover;
