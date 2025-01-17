import React, { useEffect, useRef } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Slide,
  Stack,
  Typography,
  Box,
  IconButton,
} from "@mui/material";
import { PhoneDisconnect, Phone } from "phosphor-react";
import Avatar from "react-avatar";
import { useDispatch, useSelector } from "react-redux";
import { ResetAudioCallQueue } from "../../../redux/slices/audioCall";
import { socket } from "../../../socket";
import { useNavigate } from "react-router-dom";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const CallNotification = ({ open, handleClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // Tạo ref để lưu tham chiếu timeout
  const timeoutRef = useRef(null);
  const { current_conversation } = useSelector(
    (state) => state.conversation.direct_chat
  );
  const { user } = useSelector((state) => state.app);
  const [call_details] = useSelector((state) => state.audioCall.call_queue);

  const handleAccept = () => {
    clearTimeout(timeoutRef.current); // Clear timeout
    socket.emit("audio_call_accepted", { ...call_details });
    navigate("/audiocall");
    handleClose();
  };

  const handleDeny = () => {
    clearTimeout(timeoutRef.current); // Clear timeout
    socket.emit("audio_call_denied", { ...call_details });
    dispatch(ResetAudioCallQueue());
    handleClose();
  };
  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      dispatch(ResetAudioCallQueue());
      handleClose();
    }, 10000);
  }, []);
  return (
    <>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleDeny}
        sx={{
          "& .MuiDialog-paper": {
            width: "400px",
            maxWidth: "90%",
          },
        }}
        aria-describedby="alert-dialog-slide-description"
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
              {/* Multiple ripple elements */}
              <Box className="ripple" />
              <Box className="ripple" />
              <Avatar
                alt={""}
                src={""}
                name={
                  call_details?.from.firstName +
                  " " +
                  call_details?.from.lastName
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
    </>
  );
};

export default CallNotification;
