import React from "react";
import { Box, Badge, Stack, Typography, IconButton } from "@mui/material";
import { format, isThisYear, isToday, formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { styled, useTheme } from "@mui/material/styles";
import {
  ArrowDownLeft,
  ArrowUpRight,
  VideoCamera,
  Phone,
} from "phosphor-react";
import { StartAudioCall } from "../redux/slices/audioCall";
import { StartVideoCall } from "../redux/slices/videoCall";
import Avatar from "react-avatar";
import { useDispatch, useSelector } from "react-redux";
const getMessageTime = (timestamp) => {
  const date = new Date(timestamp);
  console.log(date)
  const daysDifference = Math.floor(
    (new Date() - date) / (1000 * 60 * 60 * 24)
  );
  if (daysDifference < 7) {
    let result = formatDistanceToNow(date, {
      addSuffix: false,
      locale: vi,
    }).replace(/^khoảng /, "");
    if (result === "dưới 1 phút") {
      return "Vài giây";
    }
    console.log(result)
    return result;
  } else {
    if (isThisYear(date)) {
      // Nếu cùng năm, hiển thị ngày và tháng
      return format(date, "dd/MM");
    } else {
      // Nếu năm khác, hiển thị ngày, tháng và năm với 2 chữ số cuối
      return format(date, "dd/MM/yy");
    }
  }
};
const StyledChatBox = styled(Box)(({ theme }) => ({
  "&:hover": {
    cursor: "pointer",
  },
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    backgroundColor: "#44b700",
    color: "#44b700",
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    "&::after": {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      animation: "ripple 1.2s infinite ease-in-out",
      border: "1px solid currentColor",
      content: '""',
    },
  },
  "@keyframes ripple": {
    "0%": {
      transform: "scale(.8)",
      opacity: 1,
    },
    "100%": {
      transform: "scale(2.4)",
      opacity: 0,
    },
  },
}));

const CallLogElement = ({ img, name, incoming, missed, user_id,start }) => {
  const theme = useTheme();
  const { conversations } = useSelector((state) => state.conversation.direct_chat);
  console.log("conversation là", conversations)
  console.log("user", user_id)
  const user=conversations.find((conversation) =>conversation.user_id===user_id)
  return (
    <StyledChatBox
      sx={{
        width: "100%",

        borderRadius: 1,

        backgroundColor: theme.palette.background.paper,
      }}
      p={2}
    >
      <Stack
        direction="row"
        alignItems={"center"}
        justifyContent="space-between"
      >
        <Stack direction="row" spacing={2}>
          {" "}
          {user?.online ? (
            <StyledBadge
              overlap="circular"
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              variant="dot"
            >
              <Avatar
                alt={name}
                src={""}
                name={name}
                size={35}
                round={true}
                className="avatar"
              />
            </StyledBadge>
          ) : (
            <Avatar
              alt={name}
              src={""}
              name={name}
              size={35}
              round={true}
              className="avatar"
            />
          )}
          <Stack spacing={0.3}>
            <Typography variant="subtitle2">{name}</Typography>
            <Stack spacing={1} alignItems="center" direction={"row"}>
              {incoming ? (
                <ArrowDownLeft color={missed ? "red" : "green"} />
              ) : (
                <ArrowUpRight color={missed ? "red" : "green"} />
              )}
              <Typography variant="caption">{getMessageTime(start)}</Typography>
            </Stack>
          </Stack>
        </Stack>
        <Stack direction={"row"} spacing={2} alignItems={"center"}>
          <Phone />

          <VideoCamera />
        </Stack>
      </Stack>
    </StyledChatBox>
  );
};

const CallElement = ({ img, name, id, handleClose }) => {
  const dispatch = useDispatch();
  const theme = useTheme();

  return (
    <StyledChatBox
      sx={{
        width: "100%",

        borderRadius: 1,

        backgroundColor: theme.palette.background.paper,
      }}
      p={2}
    >
      <Stack
        direction="row"
        alignItems={"center"}
        justifyContent="space-between"
      >
        <Stack direction="row" spacing={2}>
          {" "}
          <Avatar
              alt={name}
              src={""}
              name={name}
              size={35}
              round={true}
              className="avatar"
            />
          <Stack spacing={0.3} alignItems="center" direction={"row"}>
            <Typography variant="subtitle2">{name}</Typography>
          </Stack>
        </Stack>
        <Stack direction={"row"} spacing={2} alignItems={"center"}>
          <IconButton
            onClick={() => {
              dispatch(StartAudioCall(id));
              handleClose();
            }}
          >
            <Phone style={{ color: theme.palette.primary.main }} />
          </IconButton>

          <IconButton
            onClick={() => {
              dispatch(StartVideoCall(id));
              handleClose();
            }}
          >
            <VideoCamera style={{ color: theme.palette.primary.main }} />
          </IconButton>
        </Stack>
      </Stack>
    </StyledChatBox>
  );
};

export { CallLogElement, CallElement };
