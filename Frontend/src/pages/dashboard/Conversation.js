import {
  Stack,
  Box,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  TextField,
  Checkbox,
} from "@mui/material";
import Avatar from "react-avatar";
import {
  Search,
  SearchIconWrapper,
  StyledInputBase,
} from "../../components/Search";
import { ArchiveBox, CircleDashed, MagnifyingGlass } from "phosphor-react";
import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "@mui/material/styles";
import { SimpleBarStyle } from "../../components/Scrollbar";
import { format, parseISO } from "date-fns";
import { ChatHeader, ChatFooter } from "../../components/Chat";
import PinMessage from "../../components/PinMessage";
import useResponsive from "../../hooks/useResponsive";
import { Chat_History } from "../../data";
import {
  DocMsg,
  LinkMsg,
  MediaMsg,
  ReplyMsg,
  TextMsg,
  Timeline,
} from "../../sections/dashboard/Conversation";
import { useDispatch, useSelector } from "react-redux";
import {
  FetchCurrentMessages,
  SetCurrentConversation,
  SortConversation,
  UpdateDirectConversation,
  AddDirectMessage,
  UpdateMessageStatus,
} from "../../redux/slices/conversation";
import { socket } from "../../socket";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
function linkify(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(
    urlRegex,
    (url) => `<a href="${url}" target="_blank">${url}</a>`
  );
}

function containsUrl(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return urlRegex.test(text);
}
const groupMessagesByDate = (messages) => {
  if (messages)
    return messages.reduce((groups, message) => {
      const date = format(parseISO(message.created_at), "yyyy-MM-dd"); // Lấy ngày từ timestamp
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
      return groups;
    }, {});
};
const Conversation = ({ isMobile, menu, messageRefs, method }) => {
  const dispatch = useDispatch();
  const { conversations, current_messages, current_conversation } = useSelector(
    (state) => state.conversation.direct_chat
  );
  const { room_id } = useSelector((state) => state.app);
  const groupedMessages = groupMessagesByDate(current_messages || []);

  useEffect(() => {
    const current = conversations.find((el) => el?.id === room_id);

    socket.emit("get_messages", { conversation_id: current?.id }, (data) => {
      // data => list of messages
      console.log(data, "List of messages");
      dispatch(FetchCurrentMessages({ messages: data }));
    });

    dispatch(SetCurrentConversation(current));
  }, [room_id]);
  return (
    current_conversation && (
      <Box p={isMobile ? 1 : 3}>
        <ToastContainer />
        <Stack spacing={3}>
          {Object.keys(groupedMessages).map((date) => (
            <div>
              <Stack spacing={1}>
                <Divider textAlign="center">
                  <Chip
                    label={format(parseISO(date), "dd/MM/yyyy")}
                    size="small"
                  />
                </Divider>
                {groupedMessages[date].map((el, index) => {
                  switch (el.type) {
                    // case "divider":
                    //   return (
                    //     // Timeline
                    //     <Timeline el={el} index={index} messageRefs={messageRefs}/>
                    //   );
                    case "msg":
                      switch (el.subtype) {
                        case "Text":
                          return (
                            // Doc Message
                            <TextMsg
                              el={el}
                              menu={menu}
                              index={index}
                              messageRefs={messageRefs}
                              method={method}
                            />
                          );
                        case "Link":
                          return (
                            //  Link Message
                            <LinkMsg
                              el={el}
                              menu={menu}
                              index={index}
                              messageRefs={messageRefs}
                              method={method}
                            />
                          );
                        case "Reply":
                          return (
                            //  ReplyMessage
                            <ReplyMsg
                              el={el}
                              menu={menu}
                              index={index}
                              messageRefs={messageRefs}
                              method={method}
                            />
                          );
                        default:
                          return (
                            // Text Message
                            <MediaMsg
                              el={el}
                              menu={menu}
                              index={index}
                              messageRefs={messageRefs}
                              method={method}
                            />
                          );
                      }
                    default:
                      return <></>;
                  }
                })}
              </Stack>
            </div>
          ))}
        </Stack>
      </Box>
    )
  );
};

const ChatComponent = ({ messageRefs, setShowSearchBar }) => {
  const dispatch = useDispatch();
  const isMobile = useResponsive("between", "md", "xs", "sm");
  const theme = useTheme();
  const [replyTo, setReplyTo] = useState(null);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const messageListRef = useRef(null);

  const { current_messages, conversations } = useSelector(
    (state) => state.conversation.direct_chat
  );
  const { all_users } = useSelector((state) => state.app);
  const { user_id } = useSelector((state) => state.auth);
  const [open, setOpen] = useState(false);
  const [messageShare, setMessageShare] = useState("");
  const [searchText, setSearchText] = useState(""); // State để lưu giá trị tìm kiếm
  const handleSearchChange = (event) => {
    setSearchText(event.target.value); // Cập nhật giá trị khi người dùng nhập
    console.log("Tìm kiếm:", event.target.value); // In ra giá trị tìm kiếm (tuỳ chọn)
  };
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleReply = (message) => {
    setReplyTo(message); // Gán tin nhắn được trả lời
  };
  const clearReply = () => {
    setReplyTo(null); // Hủy tin nhắn trả lời
  };
  const handleToggle = (memberId) => {
    setSelectedMembers((prevSelected) =>
      prevSelected.includes(memberId)
        ? prevSelected.filter((id) => id !== memberId)
        : [...prevSelected, memberId]
    );
  };
  const handleShare = () => {
    console.log(user_id);
    console.log(selectedMembers);
    console.log(messageShare);
    socket.emit("share_message", {
      from: user_id,
      to: selectedMembers,
      message: messageShare,
    });

    const inforMembers = selectedMembers.map((member) => {
      const conversation = conversations.find((conversation) => {
        return conversation.user_id === member;
      });
      return {
        user_id: member,
        room_id: conversation.id,
        message: messageShare,
      };
    });
    inforMembers.forEach((infoMember) => {
      dispatch(
        AddDirectMessage({
          message: {
            type: "msg",
            subtype: containsUrl(infoMember.message.message) ? "Link" : "Text",
            message: linkify(infoMember.message.message),
            incoming: false,
            outgoing: true,
            created_at: new Date(Date.now()).toISOString(),
          },
          conversation_id: infoMember.room_id,
        })
      );
      dispatch(SortConversation({ room_id: infoMember.room_id }));
      dispatch(
        UpdateDirectConversation({
          conversation: infoMember.room_id,
          msg: { text: infoMember.message.message },
          type: "Share",
        })
      );

      dispatch(
        UpdateMessageStatus({
          conversation_id: infoMember.room_id,
          type: "Message sent",
        })
      );
    });

    handleClose();
  };
  const filter_users = all_users.filter((user) => {
    const name = user.firstName + user.lastName;
    return name.toLowerCase().includes(searchText.toLowerCase());
  });
  useEffect(() => {
    // Scroll to the bottom of the message list when new messages are added
    messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
  }, [current_messages]);

  return (
    <Stack
      height={"100%"}
      maxHeight={"100vh"}
      width={isMobile ? "100vw" : "auto"}
      style={{ position: "relative" }}
    >
      {/*  */}
      <ChatHeader setShowSearchBar={setShowSearchBar} />
      <Box
        ref={messageListRef}
        width={"100%"}
        sx={{
          position: "relative",
          flexGrow: 1,
          overflowY: "scroll",
          backgroundColor:
            theme.palette.mode === "light"
              ? "#F0F4FA"
              : theme.palette.background,

          boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.25)",
          alignItems: "center",
        }}
      >
        <SimpleBarStyle timeout={500} clickOnTrack={false}>
          <Conversation
            menu={true}
            isMobile={isMobile}
            messageRefs={messageRefs}
            method={{ replyTo, handleReply, handleOpen, setMessageShare }}
          />
        </SimpleBarStyle>
        <PinMessage messageRefs={messageRefs}></PinMessage>
      </Box>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Chia sẻ</DialogTitle>
        <DialogContent>
          <Stack sx={{ width: "100%", padding: "16px", minWidth: "400px" }}>
            <Search>
              <SearchIconWrapper>
                <MagnifyingGlass color="#709CE6" />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Tìm kiếm"
                inputProps={{ "aria-label": "search" }}
                value={searchText} // Gắn giá trị tìm kiếm vào input
                onChange={handleSearchChange} // Gọi handleSearchChange khi thay đổi
              />
            </Search>
            <List
              style={{
                minHeight: "200px",
                overflowY: "scroll",
                height: "200px",
              }}
            >
              {filter_users.map((user) => (
                <ListItem key={user._id}>
                  <ListItemAvatar>
                    <Avatar
                      name={user.firstName + " " + user.lastName}
                      size={40}
                      round={true}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={user.firstName + " " + user.lastName}
                  />
                  <Checkbox
                    edge="end"
                    onChange={() => handleToggle(user._id)}
                  />
                </ListItem>
              ))}
            </List>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Hủy</Button>
          <Button onClick={handleShare} variant="contained" color="primary">
            Chia sẻ
          </Button>
        </DialogActions>
      </Dialog>
      {/*  */}
      <ChatFooter method={{ replyTo, handleReply }} />
    </Stack>
  );
};

export default ChatComponent;

export { Conversation };
