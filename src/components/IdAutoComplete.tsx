import React from "react";
import { Autocomplete, TextField, SxProps, Theme, Typography, Box } from "@mui/material";
import { Control, Controller, FieldErrors } from "react-hook-form";

/** Generic option shape used by this component */
export type IdOption = {
  id: string | number;
  label: string; // primary visible text
  subLabel?: string; // optional secondary text shown smaller
};

function getIn(obj: any, path?: string) {
  if (!path) return undefined;
  return path.split(".").reduce((acc: any, key: string) => (acc ? acc[key] : undefined), obj);
}

function IdAutoComplete({
  name,
  label,
  control,
  errors,
  options,
  defaultValue,
  required = false,
  style,
}: {
  name: string; // supports nested names like "grades.id"
  label: string;
  control: Control<any>;
  errors?: FieldErrors;
  options: IdOption[] | null | undefined;
  defaultValue?: string | number | null; // id value
  required?: boolean;
  style?: SxProps<Theme>;
}) {
  const opts: IdOption[] = options && Array.isArray(options) ? options : [];

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue ?? null}
      render={({ field }) => {
        // current selected option object resolved from stored id
        const selectedOption = opts.find((o) => o.id === field.value) ?? null;

        const fieldError = errors ? getIn(errors, name) : undefined;
        const helperText = fieldError ? (fieldError.message ?? "Required") : "";

        return (
          <Autocomplete
            size="small"
            options={opts}
            getOptionLabel={(option) => (option ? option.label : "")}
            value={selectedOption}
            onChange={(_, newValue) => {
              // store only the id in the form state (or null if cleared)
              field.onChange(newValue ? newValue.id : null);
            }}
            isOptionEqualToValue={(option, value) => option.id === value?.id}
            sx={{ flex: 1, margin: "0.5rem", ...style }}
            renderOption={(props, option) => (
              <li {...props} key={option.id}>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography component="span">{option.label}</Typography>
                  {option.subLabel ? (
                    <Typography component="span" variant="caption" sx={{ opacity: 0.7 }}>
                      {option.subLabel}
                    </Typography>
                  ) : null}
                </Box>
              </li>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label={label}
                required={required}
                error={!!fieldError}
                helperText={helperText}
                // keep name off TextField so react-hook-form Controller controls the value
              />
            )}
          />
        );
      }}
    />
  );
}

export default IdAutoComplete;
