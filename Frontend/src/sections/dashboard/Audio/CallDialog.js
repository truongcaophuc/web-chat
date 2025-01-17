import React, { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Slide,
  Stack,
  IconButton,
  Typography,
  Box,
} from "@mui/material";
import { PhoneDisconnect } from "phosphor-react";
import Avatar from "react-avatar";
import { ZegoExpressEngine } from "zego-express-engine-webrtc";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { socket } from "../../../socket";
import { ResetAudioCallQueue } from "../../../redux/slices/audioCall";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const CallDialog = ({ open, handleClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.app);
  const [statusCall, setStatusCall] = useState("Đang đổ chuông");
  //* Use params from call_details if available => like in case of receiver's end
  const { current_conversation } = useSelector(
    (state) => state.conversation.direct_chat
  );
  const [call_details] = useSelector((state) => state.audioCall.call_queue);
  const { from, to } = call_details;
  const { incoming } = useSelector((state) => state.audioCall);
  const roomID = call_details?.roomID;

  const handleDisconnect = (event, reason) => {
    if (reason && reason === "backdropClick") {
      return;
    } else {
      dispatch(ResetAudioCallQueue());
      socket?.off("audio_call_accepted");
      socket?.off("audio_call_denied");
      socket?.off("audio_call_missed");
      setTimeout(() => {
        dispatch(ResetAudioCallQueue());
        handleClose();
      }, 3000);
    }
  };
  const handleCancel = () => {
    socket.emit("cancel_audiocall", { roomID, to: to._id, from: from._id });
    dispatch(ResetAudioCallQueue());
    handleClose();
  };
  useEffect(() => {
    const timer = setTimeout(() => {
      socket.emit("audio_call_not_picked", {
        to: to._id,
        from: from._id,
        roomID,
      });
    }, 30 * 1000);

    socket.on("audio_call_missed", () => {
      setStatusCall("Nguời nhận đang bận");
      handleDisconnect();
    });

    socket.on("audio_call_accepted", () => {
      clearTimeout(timer);
      handleClose();
      navigate("/audiocall");
    });

    if (!incoming) {
      socket.emit("start_audio_call", {
        to: to._id,
        from: from._id,
        roomID,
      });
    }

    socket.on("audio_call_denied", () => {
      setStatusCall("Nguời nhận từ chối cuộc gọi");
      handleDisconnect();
    });
  }, []);

  return (
    <>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleDisconnect}
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
              {/* Multiple ripple elements */}
              <Box className="ripple" />
              <Box className="ripple" />
              <Avatar
                alt={current_conversation?.name}
                src={""}
                name={current_conversation?.name}
                size={80}
                round={true}
                className="avatar"
              />
            </Box>
            <Typography style={{ color: "white", fontSize: "24px" }}>
              {current_conversation?.name}
            </Typography>
            <Typography style={{ color: "white" }}>{statusCall}</Typography>
          </Stack>
        </DialogContent>
        <DialogActions
          style={{
            backgroundColor: "#0088FF",
            justifyContent: "center",
            padding: "24px",
          }}
        >
          <IconButton
            onClick={() => {
              handleCancel();
            }}
            style={{
              display: "inline-flex",
              justifyContent: "center",
              alignItems: "center",
              width: "46px",
              height: "46px",
              border: "2px solid #FF0000",
              borderRadius: "50%",
              backgroundColor: "#ff0000",
            }}
          >
            <PhoneDisconnect size={30} color="#ffffff" weight="fill" />
          </IconButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CallDialog;
