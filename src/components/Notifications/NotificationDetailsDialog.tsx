import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Typography,
  Alert,
  Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import useIsMobile from "../../customHooks/useIsMobile";
import { DrawerContentItem } from "../ViewDataDrawer";

export interface StudentNotificationItem {
  id: number;
  title?: string;
  description?: string;
  year?: any;
  grade?: any;
  gradeId?: any;
  class?: any;
  classId?: any;
  created_at?: string;
  updated_at?: string;
  created_by_user?: any;
  markedAsRead?: boolean;
}

interface NotificationDetailsDialogProps {
  open: boolean;
  notification: StudentNotificationItem | null;
  onClose: () => void;
}

const formatDateTime = (value?: string) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString();
};

const resolveYear = (notification: StudentNotificationItem | null) => {
  if (!notification) return "";
  const yearValue = notification.year;
  return typeof yearValue === "string" ? yearValue : (yearValue?.year ?? "");
};

const resolveGrade = (notification: StudentNotificationItem | null) => {
  if (!notification) return "";
  return (
    notification.grade?.grade ??
    notification.gradeId?.grade ??
    notification.gradeId?.id ??
    ""
  );
};

const resolveClassName = (notification: StudentNotificationItem | null) => {
  if (!notification) return "";
  return (
    notification.class?.className ??
    notification.classId?.className ??
    notification.classId?.id ??
    ""
  );
};

const NotificationDetailsDialog = ({
  open,
  notification,
  onClose,
}: NotificationDetailsDialogProps) => {
  const { isMobile } = useIsMobile();

  if (!notification) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={isMobile}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingRight: 1,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {notification.title}
        </Typography>
        <IconButton onClick={onClose} aria-label="Close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Stack spacing={2}>
          <Alert
            icon={false}
            severity={notification.markedAsRead ? "info" : "warning"}
            sx={{ px: 2, borderRadius: 1.5 }}
          >
            <Typography variant="body2" sx={{ color: "#3d3d3d" }}>
              {notification.description}
            </Typography>
          </Alert>

          <Stack
            direction={isMobile ? "column" : "row"}
            justifyContent={"space-between"}
          >
            <DrawerContentItem
              label="For Year"
              value={resolveYear(notification) || "-"}
            />
            <DrawerContentItem
              label="For Grade"
              value={resolveGrade(notification) || "-"}
            />
            <DrawerContentItem
              label="For Class"
              value={resolveClassName(notification) || "-"}
            />

            <DrawerContentItem
              label="Notification From"
              value={notification.created_by_user?.name ?? "-"}
            />
          </Stack>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems:"center"
            }}
          >
            <DrawerContentItem
              label="Notification Date & Time"
              value={formatDateTime(notification.created_at) || "-"}
            />

            <Box alignItems={"center"}>
              <Chip
                label={notification.markedAsRead ? "Read" : "Unread"}
                color={notification.markedAsRead ? "primary" : "warning"}
              />
            </Box>
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationDetailsDialog;
