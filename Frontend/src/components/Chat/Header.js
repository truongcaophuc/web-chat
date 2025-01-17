import React from "react";
import {
  Badge,
  Box,
  Divider,
  Fade,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  styled,
  Typography,
} from "@mui/material";
import { socket } from "../../socket";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import { CaretDown, MagnifyingGlass, Phone, VideoCamera } from "phosphor-react";
import useResponsive from "../../hooks/useResponsive";
import { ToggleSidebar,unFriend } from "../../redux/slices/app";
import { useDispatch, useSelector } from "react-redux";
import { StartAudioCall } from "../../redux/slices/audioCall";
import { StartVideoCall } from "../../redux/slices/videoCall";
import Avatar from "react-avatar";

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



const ChatHeader = ({setShowSearchBar}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isMobile = useResponsive("between", "md", "xs", "sm");
  const theme = useTheme();

  const { current_conversation, conversations } = useSelector(
    (state) => state.conversation.direct_chat
  );
  const { friends } = useSelector((state) => state.app);
  const { user_id } = useSelector((state) => state.auth);
  const statusUser = conversations.find(
    (conversation) => conversation.id === current_conversation?.id
  )?.online;
  const [conversationMenuAnchorEl, setConversationMenuAnchorEl] =
    React.useState(null);
  const openConversationMenu = Boolean(conversationMenuAnchorEl);
  const handleClickConversationMenu = (event) => {
    setConversationMenuAnchorEl(event.currentTarget);
  };
  const handleCloseConversationMenu = () => {
    setConversationMenuAnchorEl(null);
  };
  const isFriend = friends.find(
    (friend) => friend._id === current_conversation?.user_id
  );
  const Conversation_Menu = [
    {
      title: "Thông tin liên hệ",
      onClick: () => {
        // socket.emit("unfriend", {
        //   from: user_id,
        //   to: current_conversation.user_id,
        // });
        // dispatch(unFriend(current_conversation.user_id));
      },
    },
    {
      title: "Hủy kết bạn",
      onClick: () => {
        socket.emit("unFriend", {
          from: user_id,
          to: current_conversation?.user_id,
        });
        dispatch(unFriend(current_conversation?.user_id));
      },
    },
  ];
  return (
    <>
      <Box
        p={2}
        width={"100%"}
        sx={{
          backgroundColor:
            theme.palette.mode === "light"
              ? "#F8FAFF"
              : theme.palette.background,
          boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.25)",
        }}
      >
        <Stack
          alignItems={"center"}
          direction={"row"}
          sx={{ width: "100%", height: "100%" }}
          justifyContent="space-between"
        >
          <Stack
            onClick={() => {
              dispatch(ToggleSidebar());
            }}
            spacing={2}
            direction="row"
          >
            <Box>
              {statusUser ? (
                <StyledBadge
                  overlap="circular"
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                  }}
                  variant="dot"
                >
                  <Avatar
                    alt={current_conversation?.name}
                    src={""}
                    name={current_conversation?.name}
                    size={40}
                    round={true}
                  />
                </StyledBadge>
              ) : (
                <Avatar
                  alt={current_conversation?.name}
                  src={""}
                  name={current_conversation?.name}
                  size={40}
                  round={true}
                />
              )}
            </Box>
            <Stack spacing={0.2}>
              <Typography variant="subtitle2">
                {current_conversation?.name}
              </Typography>
              <Stack direction={"row"}>
                {!isFriend && (
                  <Typography variant="caption" style={{ marginRight: "8px" }}>
                    Người lạ |
                  </Typography>
                )}

                <Typography variant="caption">
                  {statusUser ? "Online" : "Offline"}
                </Typography>
              </Stack>
            </Stack>
          </Stack>
          <Stack
            direction={"row"}
            alignItems="center"
            spacing={isMobile ? 1 : 3}
          >
            <IconButton
              onClick={() => {
                dispatch(StartVideoCall(current_conversation?.user_id));
                //navigate("/call?type=video")
              }}
            >
              <VideoCamera />
            </IconButton>
            <IconButton
              onClick={() => {
                dispatch(StartAudioCall(current_conversation?.user_id));
                //navigate("/call?type=audio")
              }}
            >
              <Phone />
            </IconButton>
            {!isMobile && (
              <IconButton onClick={()=>{setShowSearchBar(true)}}>
                <MagnifyingGlass />
              </IconButton>
            )}
            <Divider orientation="vertical" flexItem />
            <IconButton
              id="conversation-positioned-button"
              aria-controls={
                openConversationMenu
                  ? "conversation-positioned-menu"
                  : undefined
              }
              aria-haspopup="true"
              aria-expanded={openConversationMenu ? "true" : undefined}
              onClick={handleClickConversationMenu}
            >
              <CaretDown />
            </IconButton>
            <Menu
              MenuListProps={{
                "aria-labelledby": "fade-button",
              }}
              TransitionComponent={Fade}
              id="conversation-positioned-menu"
              aria-labelledby="conversation-positioned-button"
              anchorEl={conversationMenuAnchorEl}
              open={openConversationMenu}
              onClose={handleCloseConversationMenu}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
            >
              <Box p={1}>
                <Stack spacing={1}>
                  {Conversation_Menu.map((el, index) => (
                    <MenuItem
                      onClick={() => {
                        el.onClick();
                        handleCloseConversationMenu();
                      }}
                      key={index}
                    >
                      <Stack
                        sx={{ minWidth: 100 }}
                        direction="row"
                        alignItems={"center"}
                        justifyContent="space-between"
                      >
                        <span>{el.title}</span>
                      </Stack>{" "}
                    </MenuItem>
                  ))}
                </Stack>
              </Box>
            </Menu>
          </Stack>
        </Stack>
      </Box>
    </>
  );
};

export default ChatHeader;
