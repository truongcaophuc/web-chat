import React from "react";
import { Box, Badge, Stack, Typography,Avatar as AvatarMUI } from "@mui/material";
import { styled, useTheme, alpha } from "@mui/material/styles";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { SelectGroup } from "../redux/slices/app";
import { UpdateMessageStatus,UpdateMessageGroupStatus } from "../redux/slices/conversation";
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

const ChatGroupElement = ({ img, name, msg, time, unread, online, id }) => {
  const dispatch = useDispatch();
  const { group_id } = useSelector((state) => state.app);
  const { conversations } = useSelector(
    (state) => state.conversation.group_chat
  );
  const selectedChatId = group_id?.toString();
  const conversation = conversations.find(
    (conversation) => conversation.id === id
  );
  let isSelected = selectedChatId === id;

  if (!selectedChatId) {
    isSelected = false;
  }

  const theme = useTheme();
  const maxDisplay = 4; // Số lượng avatar tối đa hiển thị
  const displayMembers = conversation?.users?.slice(0, maxDisplay);
  const extraCount = conversation?.users?.length - (maxDisplay - 1);
  return (
    <StyledChatBox
      onClick={() => {
        console.log("đã chọn");
        console.log(id);
        dispatch(SelectGroup({ group_id: id }));
        if (conversation.unread != 0) {
          console.log("Ta đã phát sự kiện")
          dispatch(
            UpdateMessageGroupStatus({ conversation_id: id, type: "Message viewed" })
          );
          // socket.emit("message_group_seen", {
          //   conversation_id: id,
          //   from: conversation.user_id,
          // });
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
        <Box sx={{ position: "relative", width: 45, height: 45 }}>
              {displayMembers?.map((member, index) => (
                <Avatar
                  key={index}
                  src={member.avatarUrl}
                  round
                  size="25"
                  style={{
                    position: "absolute",
                    ...(index === 0 && { top: 0, left: 0 }),
                    ...(index === 1 && { top: 0, right: 0 }),
                    ...(index === 2 && {
                      bottom: 0,
                      left: displayMembers.length === 3 ? 10 : 0,
                    }),
                    ...(index === 3 && { bottom: 0, right: 0 }),
                  }}
                  name={member.firstName + " " + member.lastName}
                />
              ))}
              {extraCount > 1 && (
                <AvatarMUI
                  sx={{
                    width: 25, // Kích thước chiều rộng
                    height: 25, // Kích thước chiều cao
                    fontSize: 14,
                    bottom: 0,
                    right: 0,
                    position: "absolute",
                  }}
                >
                  +{extraCount}
                </AvatarMUI>
              )}
            </Box>
          <Stack spacing={0.3}>
            <Typography variant="subtitle2">{name}</Typography>
            <Typography
              variant="caption"
              sx={{ color: unread ? "black" : "#878787" }}
            >
              {truncateText(msg, 20)}
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

export default ChatGroupElement;
