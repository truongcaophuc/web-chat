import React, { useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  IconButton,
  Stack,
  Typography,
  Box,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Avatar from "react-avatar";
import { PhoneDisconnect, Phone } from "phosphor-react";
import { useDispatch, useSelector } from "react-redux";
import { ResetVideoCallQueue } from "../../../redux/slices/videoCall";
import { socket } from "../../../socket";
import "./index.css";

const CallNotification = ({ open, handleClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { current_conversation } = useSelector(
    (state) => state.conversation.direct_chat
  );
  const [call_details] = useSelector((state) => state.videoCall.call_queue);

  // Tạo ref để lưu tham chiếu timeout
  const timeoutRef = useRef(null);

  const handleAccept = () => {
    clearTimeout(timeoutRef.current); // Clear timeout
    socket.emit("video_call_accepted", { ...call_details });
    navigate("/videocall");
    handleClose();
  };

  const handleDeny = () => {
    clearTimeout(timeoutRef.current); // Clear timeout
    socket.emit("video_call_denied", { ...call_details });
    dispatch(ResetVideoCallQueue());
    handleClose();
  };

  useEffect(() => {
    // Tạo timeout để tự động từ chối sau 10 giây
    timeoutRef.current = setTimeout(() => {
      dispatch(ResetVideoCallQueue());
      handleClose();
    }, 10000);

    // Dọn dẹp timeout khi component unmount
    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, [dispatch, handleClose]);

  useEffect(() => {
    socket.on("video_call_canceled", () => {
      clearTimeout(timeoutRef.current); // Clear timeout khi call bị huỷ
      dispatch(ResetVideoCallQueue());
      handleClose();
    });

    // Dọn dẹp sự kiện khi component unmount
    return () => {
      socket.off("video_call_canceled");
    };
  }, [dispatch, handleClose]);

  return (
    <Dialog
      open={open}
      onClose={handleDeny}
      aria-describedby="alert-dialog-slide-description"
      sx={{
        "& .MuiDialog-paper": {
          width: "400px",
          maxWidth: "90%",
        },
      }}
    >
      <DialogContent style={{ backgroundColor: "#0088FF" }}>
        <Stack
          direction="column"
          spacing={2}
          p={2}
          alignItems="center"
          justifyContent="center"
        >
          <Box className="ripple-container">
            <Box className="ripple" />
            <Box className="ripple" />
            <Avatar
              alt={""}
              src={""}
              name={
                call_details?.from.firstName + " " + call_details?.from.lastName
              }
              size={80}
              round={true}
              className="avatar"
            />
          </Box>
          <Typography style={{ color: "white", fontSize: "24px" }}>
          {current_conversation?.name}
          </Typography>
          <Typography style={{ color: "white" }}>Cuộc gọi đến</Typography>
        </Stack>
      </DialogContent>
      <DialogActions
        style={{ backgroundColor: "#0088FF", justifyContent: "center" }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="center"
          spacing={10}
        >
          <Stack spacing={1} alignItems={"center"}>
            <IconButton
              onClick={handleDeny}
              style={{
                backgroundColor: "#ff0000",
                borderRadius: "50%",
                width: "46px",
                height: "46px",
              }}
            >
              <PhoneDisconnect
                size={30}
                color="#ffffff"
                weight="fill"
                style={{ fontSize: "30px" }}
              />
            </IconButton>
            <Typography style={{ color: "white" }}>Từ chối</Typography>
          </Stack>
          <Stack spacing={1} alignItems={"center"}>
            <IconButton
              onClick={handleAccept}
              style={{ backgroundColor: "#00b91c", borderRadius: "50%" }}
              className="shake"
            >
              <Phone size={30} color="#ffffff" weight="fill" />
            </IconButton>
            <Typography style={{ color: "white" }}>Trả lời</Typography>
          </Stack>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default CallNotification;
