import React from "react";
import { Box, Badge, Stack, Typography } from "@mui/material";
import { styled, useTheme, alpha } from "@mui/material/styles";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { SelectConversation } from "../redux/slices/app";
import { UpdateMessageStatus } from "../redux/slices/conversation";
import { socket } from "../socket";
import Avatar from 'react-avatar';
const truncateText = (string, n) => {
  return string?.length > n ? `${string?.slice(0, n)}...` : string;
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

const ChatElement = ({ img, name, msg, time, unread, online, id }) => {
  const dispatch = useDispatch();
  const { room_id } = useSelector((state) => state.app);
  const { conversations } = useSelector(
    (state) => state.conversation.direct_chat
  );
  const selectedChatId = room_id?.toString();
  const conversation = conversations.find(
    (conversation) => conversation.id === id
  );
  let isSelected = selectedChatId === id;

  if (!selectedChatId) {
    isSelected = false;
  }

  const theme = useTheme();

  return (
    <StyledChatBox
      onClick={() => {
        dispatch(SelectConversation({ room_id: id }));
        if (conversation.unread != 0) {
          console.log("Ta đã phát sự kiện")
          dispatch(
            UpdateMessageStatus({ conversation_id: id, type: "Message viewed" })
          );
          socket.emit("message_seen", {
            conversation_id: id,
            from: conversation.user_id,
          });
        }
      }}
      sx={{
        width: "100%",

        borderRadius: 1,

        backgroundColor: isSelected
          ? theme.palette.mode === "light"
            ? alpha(theme.palette.primary.main, 0.5)
            : theme.palette.primary.main
          : theme.palette.mode === "light"
          ? "#fff"
          : theme.palette.background.paper,
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
          {online ? (
            <StyledBadge
              overlap="circular"
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              variant="dot"
            >
              <Avatar alt={name} src={""} name={name} size={40} round={true}/>
            </StyledBadge>
          ) : (
            <Avatar alt={name} src={""} name={name} size={40} round={true}/>
          )}
          <Stack spacing={0.3}>
            <Typography variant="subtitle2">{name}</Typography>
            <Typography
              variant="caption"
              sx={{ color: unread ? "black" : "#878787" }}
            >
              {truncateText(msg, 15)}
            </Typography>
          </Stack>
        </Stack>
        <Stack
          spacing={2}
          alignItems={"center"}
          justifyContent="center"
          sx={{ height: "100%" }}
        >
          <Typography
            sx={{ fontWeight: 600, color: unread ? "black" : "#878787" }}
            variant="caption"
          >
            {time}
          </Typography>
          <Badge
            className="unread-count"
            color="primary"
            badgeContent={unread}
          />
        </Stack>
      </Stack>
    </StyledChatBox>
  );
};

export default ChatElement;
