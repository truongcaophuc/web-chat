import React, { useState } from "react";
import "./index.css";
import {
  Stack,
  Box,
  Typography,
  Menu,
  MenuItem,
  IconButton,
  Divider,
  Modal,
  Alert,
} from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import Microlink from "@microlink/react";
import Avatar from "react-avatar";
import { useTheme, alpha } from "@mui/material/styles";
import {
  DotsThreeVertical,
  DownloadSimple,
  Image,
  Folder,
  FileVideo,
  Share,
  Chat,
} from "phosphor-react";
import { Link } from "react-router-dom";
import { SocialMediaEmbed } from "react-social-media-embed";
import { useDispatch, useSelector } from "react-redux";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
import PushPinIcon from "@mui/icons-material/PushPin";
import { updateMessagePin } from "../../redux/slices/conversation";
import { socket } from "../../socket";
const MessageOption = ({ method, data }) => {
  const dispatch = useDispatch();
  const { current_messages,current_conversation } = useSelector(
    (state) => state.conversation.direct_chat
  );
  const { handleReply, handleOpen, setMessageShare } = method;
  const Message_options = [
    {
      title: "Trả lời",
      icon: <Chat></Chat>,
      click: (event) => {
        handleReply(data);
      },
    },
    {
      title: "Chia sẻ",
      icon: <Share></Share>,
      click: () => {
        setMessageShare(data);
        handleOpen();
      },
    },
    {
      title: data?.pinned ? "Bỏ ghim" : "Ghim tin nhắn",
      icon: data?.pinned ? (
        <PushPinIcon style={{ fontSize: "16px" }}></PushPinIcon>
      ) : (
        <PushPinOutlinedIcon style={{ fontSize: "16px" }}></PushPinOutlinedIcon>
      ),
      click: () => {
        const MAX_PINNED_MESSAGES = 3; // Số tin nhắn có thể ghim tối đa
        const pinnedCount = current_messages.filter((msg) => msg.pinned).length;
        if (pinnedCount < MAX_PINNED_MESSAGES) {
          socket.emit("pin_message",{message_id:data.id,conversation_id:current_conversation.id})
          dispatch(updateMessagePin({ message_id: data.id }));
        } else {
          toast.warning("Chỉ có thêm ghim tối đa 3 tin nhắn", {
            autoClose: 2000,
          });
        }
      },
    },
  ];
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <>
      <DotsThreeVertical
        size={20}
        id="basic-button"
        aria-controls={open ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
      />
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        <Stack spacing={1} px={1}>
          {Message_options.map((el) => (
            <MenuItem
              onClick={() => {
                el.click(el.title);
                handleClose();
              }}
              style={{ alignItems: "center" }}
            >
              <Stack
                style={{
                  flexDirection: "row",
                  gap: "16px",
                  alignItems: "center",
                }}
              >
                <Typography>{el.icon}</Typography>
                <Typography>{el.title}</Typography>
              </Stack>
            </MenuItem>
          ))}
        </Stack>
      </Menu>
    </>
  );
};
const formatFileSize = (size) => {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let unitIndex = 0;
  while (size > 1024 && unitIndex < units.length) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(2)} ${units[unitIndex]}`;
};
const TextMsg = ({ el, menu, messageRefs, method }) => {
  const theme = useTheme();
  const { current_conversation, conversations } = useSelector(
    (state) => state.conversation.direct_chat
  );
  const { current_messages } = useSelector(
    (state) => state.conversation.direct_chat
  );
  const index_message = current_messages.indexOf(el);
  const prev_message = current_messages[index_message - 1];
  let is_last_message =
    current_messages.indexOf(el) === current_messages.length - 1;
  const new_conversation = conversations.find(
    (conversation) => conversation.id === current_conversation.id
  );
  return (
    <Stack
      direction="row"
      justifyContent={el.incoming ? "start" : "end"}
      alignItems={"center"}
      sx={{ paddingLeft: "35px" }}
      style={{ position: "relative" }}
    >
      {el.incoming && el.incoming != prev_message?.incoming && (
        <Avatar
          src={``}
          round
          size="30"
          name={current_conversation.name}
          style={{ position: "absolute", left: "0px" }}
        />
      )}
      <Stack direction="column" alignItems={"end"} spacing={1}>
        <Box
          px={1.5}
          py={1.5}
          sx={{
            backgroundColor: el.incoming
              ? alpha(theme.palette.background.default, 1)
              : theme.palette.primary.main,
            borderRadius: 1,
            width: "max-content",
          }}
        >
          <Typography
            variant="body2"
            color={el.incoming ? theme.palette.text : "#fff"}
            ref={(el) => (messageRefs.current[index_message] = el)}
          >
            {el.message}
          </Typography>
        </Box>
        {is_last_message && new_conversation?.isSeen && el.outgoing && (
          <Avatar src={``} round size="15" name={current_conversation.name} />
        )}
      </Stack>
      {menu && <MessageOption method={method} data={el} />}
    </Stack>
  );
};
const MediaMsg = ({ el, menu, method, messageRefs }) => {
  const { current_messages } = useSelector(
    (state) => state.conversation.direct_chat
  );
  const index_message = current_messages.indexOf(el);
  const [open, setOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const theme = useTheme();
  const handleOpen = (image) => {
    setSelectedImage(image);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);
  const downloadFile = () => {
    fetch(el.fileUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/pdf",
      },
    })
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(new Blob([blob]));

        const link = document.createElement("a");
        link.href = url;
        link.download = el.fileName;

        document.body.appendChild(link);

        link.click();

        link.parentNode.removeChild(link);
      });
  };
  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
  };
  return (
    <Stack direction="row" justifyContent={el.incoming ? "start" : "end"}>
      <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle}>
          <img src={selectedImage} alt="Preview" style={{ width: "100%" }} />
        </Box>
      </Modal>
      <Box
        px={1.5}
        py={1.5}
        sx={{
          backgroundColor: el.incoming
            ? alpha(theme.palette.background.default, 1)
            : theme.palette.primary.main,
          borderRadius: 1.5,
          width: "max-content",
        }}
      >
        <Stack spacing={1}>
          {el.subtype.startsWith("image/") ? (
            <img
              src={el.fileUrl || el.fileData}
              // alt={el.message}
              onClick={() => handleOpen(el.fileUrl)}
              style={{ maxHeight: 210, borderRadius: "10px" }}
            />
          ) : (
            <video src={el.fileUrl || el.fileData} controls></video>
          )}
          <Stack flexDirection={"row"} gap="10px" alignItems={"center"}>
            {el.subtype.startsWith("image/") ? (
              <Image size={48} color={el.incoming ? "black" : "#fff"} />
            ) : (
              <FileVideo size={48} color={el.incoming ? "black" : "#fff"} />
            )}
            <Stack sx={{ flex: 1 }}>
              <Typography
                variant="body2"
                color={el.incoming ? theme.palette.text : "#fff"}
                ref={(el) => (messageRefs.current[index_message] = el)}
              >
                {el.fileName}
              </Typography>
              <Typography
                variant="body2"
                color={el.incoming ? theme.palette.text : "#fff"}
              >
                {formatFileSize(el.fileSize)}
              </Typography>
            </Stack>
            <Stack flexDirection={"row"}>
              <IconButton>
                <Folder size={30} color={el.incoming ? "black" : "#fff"} />
              </IconButton>
              <IconButton onClick={downloadFile}>
                <DownloadSimple
                  size={30}
                  color={el.incoming ? "black" : "#fff"}
                />
              </IconButton>
            </Stack>
          </Stack>
        </Stack>
      </Box>
      {menu && <MessageOption method={method} />}
    </Stack>
  );
};
const DocMsg = ({ el, menu, method }) => {
  const theme = useTheme();
  return (
    <Stack direction="row" justifyContent={el.incoming ? "start" : "end"}>
      <Box
        px={1.5}
        py={1.5}
        sx={{
          backgroundColor: el.incoming
            ? alpha(theme.palette.background.default, 1)
            : theme.palette.primary.main,
          borderRadius: 1.5,
          width: "max-content",
        }}
      >
        <Stack spacing={2}>
          <Stack
            p={2}
            direction="row"
            spacing={3}
            alignItems="center"
            sx={{
              backgroundColor: theme.palette.background.paper,
              borderRadius: 1,
            }}
          >
            <Image size={48} />
            <Typography variant="caption">Abstract.png</Typography>
            <IconButton>
              <DownloadSimple />
            </IconButton>
          </Stack>
          <Typography
            variant="body2"
            color={el.incoming ? theme.palette.text : "#fff"}
          >
            {el.message}
          </Typography>
        </Stack>
      </Box>
      {menu && <MessageOption method={method} />}
    </Stack>
  );
};
const LinkMsg = ({ el, menu, method, messageRefs }) => {
  const { current_messages } = useSelector(
    (state) => state.conversation.direct_chat
  );
  const theme = useTheme();
  const index_message = current_messages.indexOf(el);
  return (
    <Stack direction="row" justifyContent={el.incoming ? "start" : "end"}>
      <Box
        px={1.5}
        py={1.5}
        sx={{
          backgroundColor: el.incoming
            ? alpha(theme.palette.background.default, 1)
            : theme.palette.primary.main,
          borderRadius: 1.5,
          width: "max-content",
          maxWidth: "400px",
        }}
      >
        <Stack direction="column" spacing={1}>
          <Stack direction={"column"} spacing={2}>
            <Typography
              variant="body2"
              color={el.incoming ? theme.palette.text : "#fff"}
              sx={{
                "& a": {
                  color: el.incoming ? "black" : "#fff",
                  textDecoration: "none",
                },
              }}
              ref={(el) => (messageRefs.current[index_message] = el)}
            >
              <div dangerouslySetInnerHTML={{ __html: el.message }}></div>
            </Typography>
          </Stack>
          <Microlink
            url={el.message.match(/href="([^"]+)"/)[1]}
            style={{ minWidth: "300px", width: "100%" }}
          />
        </Stack>
      </Box>
      {menu && <MessageOption method={method} />}
    </Stack>
  );
};
const ReplyMsg = ({ el, menu, method, messageRefs }) => {
  const theme = useTheme();
  const { current_messages } = useSelector(
    (state) => state.conversation.direct_chat
  );
  let reply_message_index = 0;
  current_messages.find((message, index) => {
    if (message.id === el.replyTo?.id) {
      reply_message_index = index;
    }
    return message._id === el.replyTo?.id;
  });
  const index_message = current_messages.indexOf(el);
  return (
    <Stack direction="row" justifyContent={el.incoming ? "start" : "end"}>
      <Box
        px={1.5}
        py={1.5}
        sx={{
          backgroundColor: el.incoming
            ? alpha(theme.palette.background.paper, 1)
            : theme.palette.primary.main,
          width: "max-content",
          borderRadius: 1.5,
        }}
      >
        <Stack spacing={2}>
          <Stack
            p={2}
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{
              backgroundColor: "#ededed",
              height: "70px",
            }}
            onClick={() => {
              const targetMessage = messageRefs.current[reply_message_index];
              if (targetMessage) {
                targetMessage.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
              }
            }}
          >
            <Divider
              orientation="vertical"
              variant="middle"
              sx={{
                borderRightWidth: "3px", // Độ dày cho vertical
                borderColor: "#009a24",
              }}
            />
            <Stack>
              <Typography variant="body2">{el.replyTo?.name}</Typography>
              <Typography variant="body2" color={theme.palette.text}>
                {el.replyTo?.message}
              </Typography>
            </Stack>
          </Stack>
          <Stack>
            <Typography
              variant="body2"
              color={el.incoming ? theme.palette.text : "#fff"}
              ref={(el) => (messageRefs.current[index_message] = el)}
            >
              {el.message}
            </Typography>
          </Stack>
        </Stack>
      </Box>
      {menu && <MessageOption method={method} />}
    </Stack>
  );
};
const Timeline = ({ el }) => {
  const theme = useTheme();
  return (
    <Stack direction="row" alignItems={"center"} justifyContent="space-between">
      <Divider width="46%" />
      <Typography variant="caption" sx={{ color: theme.palette.text }}>
        {el.text}
      </Typography>
      <Divider width="46%" />
    </Stack>
  );
};

export { Timeline, MediaMsg, LinkMsg, DocMsg, TextMsg, ReplyMsg };
