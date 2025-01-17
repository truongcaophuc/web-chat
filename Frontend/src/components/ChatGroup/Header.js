import React, { useState } from "react";
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
  Avatar as AvatarMUI,
} from "@mui/material";
import AddMemberDialog from "../../sections/dashboard/AddMemberDialog"; // Import dialog đã tạo
import { socket } from "../../socket";
import { useTheme } from "@mui/material/styles";
import { CaretDown, MagnifyingGlass, Phone, VideoCamera } from "phosphor-react";
import useResponsive from "../../hooks/useResponsive";
import { ToggleSidebar, resetGroup } from "../../redux/slices/app";
import { leaveGroup, addMember } from "../../redux/slices/conversation";
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
  const [openAddMemberDialog, setOpenAddMemberDialog] = useState(false);
  const isMobile = useResponsive("between", "md", "xs", "sm");
  const theme = useTheme();
  const { all_users } = useSelector((state) => state.app);
  const { current_conversation } = useSelector(
    (state) => state.conversation.group_chat
  );
  const { user_id } = useSelector((state) => state.auth);
  console.log("current", current_conversation);
  // const { conversations } = useSelector(
  //   (state) => state.conversation.group_chat
  // );
  const [conversationMenuAnchorEl, setConversationMenuAnchorEl] =
    React.useState(null);
  const openConversationMenu = Boolean(conversationMenuAnchorEl);
  const handleClickConversationMenu = (event) => {
    setConversationMenuAnchorEl(event.currentTarget);
  };
  const handleCloseConversationMenu = () => {
    setConversationMenuAnchorEl(null);
  };
  const maxDisplay = 4; // Số lượng avatar tối đa hiển thị
  const displayMembers = current_conversation?.users?.slice(0, maxDisplay);
  const extraCount = current_conversation?.users?.length - (maxDisplay - 1);
  const handleOpenAddMemberDialog = () => {
    setOpenAddMemberDialog(true);
  };
  const handleCloseAddMemberDialog = () => {
    setOpenAddMemberDialog(false);
  };

  const handleAddMembers = (selectedMembers) => {
    console.log("Thành viên được thêm:", selectedMembers);
    // Gửi thông tin thành viên được chọn lên server
    socket.emit("addMember", {
      id: current_conversation?.id,
      members: selectedMembers,
    });
    dispatch(
      addMember({
        id: current_conversation?.id,
        members: selectedMembers,
      })
    );
  };
  const Conversation_Menu = [
    {
      title: "Thêm thành viên",
      onClick: handleOpenAddMemberDialog,
    },
    {
      title: "Rời nhóm",
      onClick: () => {
        socket.emit("leaveGroup", {
          user_id,
          id: current_conversation?.id,
        });
        dispatch(resetGroup());
        dispatch(leaveGroup(current_conversation?.id));
      },
    },
  ];
  return (
    <>
      <AddMemberDialog
        open={openAddMemberDialog}
        handleClose={handleCloseAddMemberDialog}
        members={current_conversation?.users}
        onAdd={handleAddMembers}
        users={all_users}
      />
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
            alignItems={"center"}
          >
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
            <Stack spacing={0.2}>
              <Typography style={{ fontSize: "20px", fontWeight: 700 }}>
                {current_conversation?.name}
              </Typography>
              <Typography variant="caption">
                {current_conversation?.users?.length + " thành viên"}
              </Typography>
            </Stack>
          </Stack>
          <Stack
            direction={"row"}
            alignItems="center"
            spacing={isMobile ? 1 : 3}
          >
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
                        console.log("click rồi");
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
