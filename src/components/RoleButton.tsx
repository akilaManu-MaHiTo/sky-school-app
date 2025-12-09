import { Button, styled } from "@mui/material";

interface RoleButtonProps {
  value: string;
  selected?: boolean;
  onClick?: (value: string) => void;
  children: React.ReactNode;
}

const StyledButton = styled(Button)(({ theme }) => ({
  width: 90,
  height: 90,
  borderRadius: "50%",
  border: `2px solid ${theme.palette.grey[400]}`,
  color: theme.palette.grey[600],
  flexDirection: "column",
  textTransform: "none",
  backgroundColor: "transparent",

  "&.selected": {
    backgroundColor: theme.palette.primary.main,
    borderColor: theme.palette.primary.main,
    color: "#fff",
  },
}));

export default function RoleButton(props: RoleButtonProps) {
  const { value, selected, onClick, children } = props;

  return (
    <StyledButton
      className={selected ? "selected" : ""}
      onClick={() => onClick?.(value)}
      variant="outlined"
    >
      {children}
    </StyledButton>
  );
}
