import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Typography,
  CircularProgress,
} from "@mui/material";
import CustomButton from "./CustomButton";

interface StudentAddConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  studentName?: string;
  studentAdmissionNumber?: string;
}

const StudentAddConfirmationModal = ({
  open,
  onClose,
  onConfirm,
  isLoading,
  studentName,
  studentAdmissionNumber,
}: StudentAddConfirmationModalProps) => {
  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      open={open}
      onClose={onClose}
      aria-labelledby="add-student-dialog"
    >
      <DialogTitle id="add-student-dialog">
        <Typography variant="h6">Add Student</Typography>
      </DialogTitle>
      <DialogContent dividers>
        <DialogContentText>
          {`Do you want to add this student${
            studentName ? ` (${studentName})` : ""
          }${studentAdmissionNumber ? ` - ${studentAdmissionNumber}` : ""}?`}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <CustomButton disabled={isLoading} variant="text" onClick={onClose}>
          Cancel
        </CustomButton>
        <CustomButton
          variant="contained"
          sx={{ backgroundColor: "var(--pallet-blue)" }}
          disabled={isLoading}
          onClick={onConfirm}
          startIcon={
            isLoading ? <CircularProgress size={14} color="inherit" /> : null
          }
        >
          {isLoading ? "Adding..." : "Add Student"}
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
};

export default StudentAddConfirmationModal;
