import { useState } from "react";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  IconButton,
  Popover,
  Typography,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";

export interface ColumnVisibilityOption {
  key: string;
  label: string;
  checked: boolean;
}

interface ColumnVisibilitySelectorProps {
  options: ColumnVisibilityOption[];
  onToggle: (key: string, checked: boolean) => void;
  buttonText?: string;
  popoverTitle?: string;
}

const ColumnVisibilitySelector = ({
  options,
  onToggle,
  buttonText = "",
  popoverTitle = "Show/Hide Columns",
}: ColumnVisibilitySelectorProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const buttonLabel = buttonText || "Column visibility";

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Button
        sx={{ borderColor: "var(--pallet-blue)", color: "var(--pallet-blue)" }}
        size="medium"
        onClick={handleOpen}
        aria-label={buttonLabel}
        title={buttonLabel}
      >
        {buttonText ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <ViewColumnIcon fontSize="small" />
            <Typography variant="body2">{buttonText}</Typography>
          </Box>
        ) : (
          <MoreVertIcon />
        )}
      </Button>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box marginBottom={2}>
            <Typography variant="caption">{popoverTitle}</Typography>
          </Box>

          <FormGroup>
            {options.map((option) => (
              <FormControlLabel
                key={option.key}
                control={
                  <Checkbox
                    checked={option.checked}
                    onChange={(event) =>
                      onToggle(option.key, event.target.checked)
                    }
                  />
                }
                label={option.label}
              />
            ))}
          </FormGroup>
        </Box>
      </Popover>
    </>
  );
};

export default ColumnVisibilitySelector;
