import PropTypes from "prop-types";
// form
import { useFormContext, Controller } from "react-hook-form";
// @mui
import { Autocomplete, TextField } from "@mui/material";
import { Stack, Typography } from "@mui/material";
// ----------------------------------------------------------------------
import Avatar from "react-avatar";
RHFAutocomplete.propTypes = {
  name: PropTypes.string,
  label: PropTypes.string,
  helperText: PropTypes.node,
};

export default function RHFAutocomplete({ name, label, helperText, ...other }) {
  const { control, setValue } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Autocomplete
          {...field}
          onChange={(event, newValue) =>
            setValue(name, newValue, { shouldValidate: true })
          }
          renderInput={(params) => (
            <TextField
              label={label}
              error={!!error}
              helperText={error ? error?.message : helperText}
              {...params}
            />
          )}
          getOptionLabel={(option) => option.name} 
          renderOption={(props, option) => (
            <Stack
              spacing={1}
              direction="row"
              component="li"
              {...props}
              sx={{ display: "flex", alignItems: "center" }}
            >
              <Avatar
                name={option.name}
                size={40}
                round={true}
              />
              <Typography>{option.name}</Typography>
            </Stack>
          )}
          {...other}
        />
      )}
    />
  );
}
