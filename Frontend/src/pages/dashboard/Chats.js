import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import {
  ArchiveBox,
  CircleDashed,
  MagnifyingGlass,
  Users,
} from "phosphor-react";
import { SimpleBarStyle } from "../../components/Scrollbar";
import { useTheme } from "@mui/material/styles";
import useResponsive from "../../hooks/useResponsive";
import BottomNav from "../../layouts/dashboard/BottomNav";
import { ChatList } from "../../data";
import ChatElement from "../../components/ChatElement";
import {
  Search,
  SearchIconWrapper,
  StyledInputBase,
} from "../../components/Search";
import Friends from "../../sections/dashboard/Friends";
import { socket } from "../../socket";
import { useDispatch, useSelector } from "react-redux";
import { FetchDirectConversations } from "../../redux/slices/conversation";
import {
  FetchFriendRequests,
  FetchFriends,
  FetchUsers,
  FetchFriendInvitations
} from "../../redux/slices/app";

const Chats = () => {
  const theme = useTheme();
  const user_id = window.localStorage.getItem("user_id");
  const [searchText, setSearchText] = useState(""); // State để lưu giá trị tìm kiếm

  const { conversations } = useSelector(
    (state) => state.conversation.direct_chat
  );

  const handleSearchChange = (event) => {
    setSearchText(event.target.value); // Cập nhật giá trị khi người dùng nhập
    console.log("Tìm kiếm:", event.target.value); // In ra giá trị tìm kiếm (tuỳ chọn)
  };
  const filter_conversation=conversations.filter((conversation)=>{
    return conversation.name.toLowerCase().includes(searchText.toLowerCase())
  })

  const isDesktop = useResponsive("up", "md");
  console.log("đã vào");
  const dispatch = useDispatch();

  useEffect(() => {
    console.log("user_id là",user_id)
    socket.emit("get_direct_conversations", { user_id }, (data) => {
      console.log("Dữ liệu data là :", data); // this data is the list of conversations
      // dispatch action

      dispatch(FetchDirectConversations({ conversations: data }));
    });
      dispatch(FetchFriends());
  }, []);

  const [openDialog, setOpenDialog] = useState(false);

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  return (
    <>
      <Box
        sx={{
          position: "relative",
          height: "100%",
          width: isDesktop ? 320 : "100vw",
          backgroundColor:
            theme.palette.mode === "light"
              ? "#F8FAFF"
              : theme.palette.background,

          boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.25)",
        }}
      >
        {!isDesktop && (
          // Bottom Nav
          <BottomNav />
        )}

        <Stack p={3} spacing={2} sx={{ maxHeight: "100vh" }}>
          <Stack
            alignItems={"center"}
            justifyContent="space-between"
            direction="row"
          >
            <Typography variant="h5">Chats</Typography>

            <Stack direction={"row"} alignItems="center" spacing={1}>
              <IconButton
                onClick={() => {
                  handleOpenDialog();
                }}
                sx={{ width: "max-content" }}
              >
                <Users />
              </IconButton>
              {/* <IconButton sx={{ width: "max-content" }}>
                <CircleDashed />
              </IconButton> */}
            </Stack>
          </Stack>
          <Stack sx={{ width: "100%" }}>
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
          </Stack>
          <Stack spacing={1}>
            {/* <Stack direction={"row"} spacing={1.5} alignItems="center">
              <ArchiveBox size={24} />
              <Button variant="text">Archive</Button>
            </Stack> */}
            <Divider />
          </Stack>
          <Stack sx={{ flexGrow: 1, overflowY: "scroll", height: "100%" }}>
            <SimpleBarStyle timeout={500} clickOnTrack={false}>
              <Stack spacing={2.4}>
                <Typography variant="subtitle2" sx={{ color: "#676667" }}>
                  Tất cả
                </Typography>
                {/* Chat List */}
                <Stack spacing={1}>
                {filter_conversation
                  ?.filter((el) => !el.pinned)
                  .map((el, idx) => {
                    return <ChatElement {...el} key={idx} />;
                  })}
                </Stack>
              </Stack>
            </SimpleBarStyle>
          </Stack>
        </Stack>
      </Box>
      {openDialog && (
        <Friends open={openDialog} handleClose={handleCloseDialog} />
      )}
    </>
  );
};

export default Chats;
