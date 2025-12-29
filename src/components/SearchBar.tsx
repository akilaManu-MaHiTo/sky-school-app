import * as React from "react";
import { styled } from "@mui/material/styles";
import InputBase from "@mui/material/InputBase";
import SearchIcon from "@mui/icons-material/Search";
import IconButton from "@mui/material/IconButton";
import { CircularProgress } from "@mui/material";

interface SearchInputProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  isSearching: boolean;
  maxWidth?: string | number;
}

const SearchContainer = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  borderRadius: 5,
  border: "1px solid var(--pallet-light-blue)",
  padding: "4px 8px",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  width: "100%",
  transition: "box-shadow 0.3s ease",
  "&:focus-within": {
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
  },
}));

const StyledInput = styled(InputBase)(({ theme }) => ({
  flex: 1,
  marginLeft: theme.spacing(1),
  fontSize: 16,
  "& input": {
    padding: theme.spacing(1),
  },
}));

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ placeholder, value, onChange, isSearching, maxWidth }, ref) => {
    const resolvedMaxWidth =
      typeof maxWidth === "number" ? `${maxWidth}px` : maxWidth || 400;

    return (
      <SearchContainer style={{ maxWidth: resolvedMaxWidth }}>
        <StyledInput
          inputRef={ref}
          placeholder={placeholder || "Search…"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          inputProps={{ "aria-label": "search input" }}
        />
        <IconButton disabled>
          {isSearching ? <CircularProgress size={20} /> : <SearchIcon />}
        </IconButton>
      </SearchContainer>
    );
  }
);

export default SearchInput;
