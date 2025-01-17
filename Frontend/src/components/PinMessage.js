import React, { useState } from "react";
import {
  List,
  ListItem,
  ListItemText,
  IconButton,
  Typography,
  Button,
  Box,
  Stack,
} from "@mui/material";
import { socket } from "../socket";
import { ChatCircleText } from "phosphor-react";
import PushPinIcon from "@mui/icons-material/PushPin";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
import DeleteIcon from "@mui/icons-material/Delete";
import { useDispatch, useSelector } from "react-redux";
import { updateMessagePin } from "../redux/slices/conversation";
export default function MessageList({ messageRefs }) {
  const dispatch = useDispatch();
  const { current_messages, current_conversation } = useSelector(
    (state) => state.conversation.direct_chat
  );
  const [showAllPinned, setShowAllPinned] = useState(false); // Trạng thái mở rộng

  const MAX_PINNED_DISPLAY = 1; // Số lượng tin nhắn ghim hiển thị khi thu gọn
  // Lọc danh sách ghim
  const pinnedMessages = current_messages.filter((msg) => msg.pinned);
  // Toggle ghim tin nhắn
  const togglePin = (message, event) => {
    event.stopPropagation();
    socket.emit("pin_message", {
      message_id: message.id,
      conversation_id: current_conversation.id,
    });
    dispatch(updateMessagePin({ message_id: message.id }));
  };
  // Xử lý danh sách tin nhắn ghim
  const displayedPinnedMessages = showAllPinned
    ? pinnedMessages
    : pinnedMessages.slice(0, MAX_PINNED_DISPLAY);

  return (
    <Box
      style={{
        position: "fixed",
        top: "70px",
        width: "70%",
        right: "20px",
        zIndex: 10,
      }}
    >
      <Stack>
        {pinnedMessages.length > 0 && (
          <Stack sx={{}}>
            {showAllPinned && (
              <Stack
                style={{
                  flexDirection: "row",
                  backgroundColor: "#cfcfcf",
                  padding: "8px",
                  alignItems: "center",
                }}
              >
                <Typography
                  style={{ fontSize: "14px", fontWeight: "bold", flex: 1 }}
                >
                  Danh sách ghim
                </Typography>
                <Button
                  onClick={(e) => {
                    setShowAllPinned(!showAllPinned);
                    e.stopPropagation();
                  }}
                  variant="outlined"
                  size="small"
                >
                  {showAllPinned ? "Thu gọn" : "Hiển thị thêm"}
                </Button>
              </Stack>
            )}
            <Stack>
              {displayedPinnedMessages.map((message) => (
                <Stack
                  key={message.id}
                  sx={{
                    flexDirection: "row",
                    backgroundColor: "white",
                    gap: "8px",
                    borderBottom: "1px solid #c8c8c8",
                    alignItems: "center",
                    padding: "8px",
                  }}
                  onClick={() => {
                    console.log("click");
                    const index_message = current_messages.indexOf(message);
                    console.log(index_message);
                    const targetMessage = messageRefs.current[index_message];
                    console.log(messageRefs.current.length);
                    if (targetMessage) {
                      targetMessage.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      });
                    }
                  }}
                >
                  <ChatCircleText size={30} color={"#0062ff"}></ChatCircleText>
                  <Stack style={{ flex: 1 }}>
                    <Typography>Tin nhắn</Typography>
                    <Typography>
                      {message.message || message.fileName}
                    </Typography>
                  </Stack>
                  {pinnedMessages.length > MAX_PINNED_DISPLAY &&
                    !showAllPinned && (
                      <Button
                        onClick={(e) => {
                          setShowAllPinned(!showAllPinned);
                          e.stopPropagation();
                        }}
                        variant="outlined"
                        size="small"
                      >
                        {showAllPinned ? "Thu gọn" : "Hiển thị thêm"}
                      </Button>
                    )}
                  <IconButton onClick={(event) => togglePin(message, event)}>
                    <PushPinIcon color="primary" />
                  </IconButton>
                </Stack>
              ))}
            </Stack>
          </Stack>
        )}
      </Stack>
    </Box>
  );
}
