import React, { useEffect } from "react";
import * as Yup from "yup";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Slide,
  Stack,
} from "@mui/material";
import { FetchAllUsers } from "../../redux/slices/app";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import FormProvider from "../../components/hook-form/FormProvider";
import { RHFTextField } from "../../components/hook-form";
import RHFAutocomplete from "../../components/hook-form/RHFAutocomplete";
import { useDispatch, useSelector } from "react-redux";
import { socket } from "../../socket";
import { AddGroupConversation } from "../../redux/slices/conversation";
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const CreateGroupForm = ({ handleClose }) => {
  const dispatch = useDispatch();
  const { all_users } = useSelector((state) => state.app);
  const format_users = all_users.map((user) => {
    return { id: user._id, name: user.firstName + " " + user.lastName };
  });
  useEffect(() => {
    console.log("lay du lieu user");
    dispatch(FetchAllUsers());
  }, []);
  const { _id, firstName,lastName } = useSelector(
    (state) => state.app.user
  );
  const NewGroupSchema = Yup.object().shape({
    title: Yup.string().required("Title is required"),

    members: Yup.array().min(2, "Must have at least 2 members"),
  });

  const defaultValues = {
    title: "",

    tags: [],
  };

  const methods = useForm({
    resolver: yupResolver(NewGroupSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting, isValid },
  } = methods;

  const onSubmit = async (data) => {
    try {
      //  API Call
      console.log("DATA", data);
      data.members.push({id:_id,name:`${firstName} ${lastName}`});
      socket.emit("new_group", data, (group) => {
        dispatch(AddGroupConversation({group}));
      });
      handleClose();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        <RHFTextField name="title" label="Tên" />
        <RHFAutocomplete
          name="members"
          label="Thành viên"
          multiple
          freeSolo
          options={format_users}
          ChipProps={{ size: "medium" }}
        />
        <Stack
          spacing={2}
          direction={"row"}
          alignItems="center"
          justifyContent={"end"}
        >
          <Button onClick={handleClose}>Hủy</Button>
          <Button type="submit" variant="contained">
            Tạo
          </Button>
        </Stack>
      </Stack>
    </FormProvider>
  );
};

const CreateGroup = ({ open, handleClose }) => {
  return (
    <Dialog
      fullWidth
      maxWidth="xs"
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={handleClose}
      aria-describedby="alert-dialog-slide-description"
      sx={{ p: 4 }}
    >
      <DialogTitle>{"Tạo nhóm mới"}</DialogTitle>

      <DialogContent sx={{ mt: 4 }}>
        {/* Create Group Form */}
        <CreateGroupForm handleClose={handleClose} />
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroup;
