import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  IconButton,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import { useState, useEffect, useMemo } from "react";
import {
  Organization,
  updateOrganization,
} from "../../../api/OrganizationSettings/organizationSettingsApi";
import CloseIcon from "@mui/icons-material/Close";
import { useForm } from "react-hook-form";
import useIsMobile from "../../../customHooks/useIsMobile";
import { StorageFile } from "../../../utils/StorageFiles.util";
import ImagePreview from "../../../components/OrganizationImagePreview";
import CustomButton from "../../../components/CustomButton";
import { useMutation } from "@tanstack/react-query";
import queryClient from "../../../state/queryClient";
import { useSnackbar } from "notistack";

interface Props {
  open: boolean;
  handleClose: () => void;
  defaultValues: Organization;
}

interface TabPanelProps {
  children?: React.ReactNode;
  dir?: string;
  index: number;
  value: number;
}

const EditOrganizationDialog = ({
  open,
  handleClose,
  defaultValues,
}: Props) => {
  const { enqueueSnackbar } = useSnackbar();
  const { isMobile } = useIsMobile();
  const [files, setFiles] = useState<File[]>([]);

  const [logoUrls, setLogoUrls] = useState<(StorageFile | File)[]>(() => {
    const logos = defaultValues?.logoUrl;
    if (Array.isArray(logos)) return logos;
    if (logos) return [logos];
    return [];
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<Organization>({
    defaultValues: {
      logoUrl: [],
      ...defaultValues,
    },
    reValidateMode: "onChange",
    mode: "onChange",
  });
  const resetForm = () => {
    reset();
    setFiles([]);
  };

  const handleSubmitOrganization = (data: Organization) => {
    const submitData: Organization = {
      ...data,
      logoUrl: logoUrls ? [logoUrls[0]] : [],
      id: defaultValues.id,
    };

    console.log("logo", logoUrls);
    updateOrganizationMutation(submitData);
    resetForm();
  };

  const { mutate: updateOrganizationMutation, isPending } = useMutation({
    mutationFn: updateOrganization,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization"] });
      enqueueSnackbar("Organization Updated Successfully!", {
        variant: "success",
      });
      handleClose();
    },
    onError: (error) => {
      enqueueSnackbar(`Error updating organization: ${error.message}`, {
        variant: "error",
      });
    },
  });

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullScreen={isMobile}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle
        sx={{
          paddingY: "1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="h6" component="div">
          Edit School General Details
        </Typography>
        <IconButton
          onClick={handleClose}
          edge="start"
          sx={{ color: "#024271" }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack
          display="flex"
          justifyContent="center"
          alignItems="center"
          alignContent="center"
        >
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            alignContent="center"
            width={400}
            height={400}
          >
            <ImagePreview
              image={logoUrls}
              onRemove={(fileToRemove) => {
                setLogoUrls((prev) =>
                  prev.filter(
                    (file) =>
                      !(
                        (file instanceof File && file === fileToRemove) ||
                        ("gsutil_uri" in file &&
                          file.gsutil_uri ===
                            (fileToRemove as any).gsutil_uri) ||
                        ("fileName" in file &&
                          file.fileName === (fileToRemove as any).fileName)
                      )
                  )
                );
              }}
            />
          </Box>
          <Box width={"100%"} px={"2rem"}>
            <CustomButton
              variant="outlined"
              component="label"
              sx={{ my: 1, width: "100%" }}
            >
              Change Logo Image
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => {
                  const files = e.target.files;
                  if (files && files.length > 0) {
                    setLogoUrls([files[0]]);
                  }
                }}
              />
            </CustomButton>
          </Box>
        </Stack>

        <Stack m={4} gap={4}>
          <TextField
            required
            id="organizationName"
            label="School Name"
            error={!!errors.organizationName}
            helperText={errors.organizationName?.message || ""}
            size="small"
            sx={{ flex: 1 }}
            {...register("organizationName", {
              required: "Organization name is required",
              pattern: {
                value: /^[A-Za-z\s\W_]+$/,
                message: "Only letters and symbols are allowed",
              },
            })}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ padding: "1rem" }}>
        <Button
          onClick={() => {
            resetForm();
            handleClose();
          }}
          sx={{ color: "var(--pallet-blue)" }}
          disabled={isPending}
        >
          Cancel
        </Button>
        <CustomButton
          variant="contained"
          sx={{
            backgroundColor: "var(--pallet-blue)",
          }}
          size="medium"
          onClick={handleSubmit((data) => {
            handleSubmitOrganization(data);
          })}
          disabled={isPending}
          endIcon={
            isPending && <CircularProgress size={20} sx={{ color: "gray" }} />
          }
        >
          Save Changes
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
};

export default EditOrganizationDialog;
