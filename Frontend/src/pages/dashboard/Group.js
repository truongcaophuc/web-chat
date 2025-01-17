import React, { useState, useEffect,useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Box,
  Stack,
  Typography,
  IconButton,
  Link,
  Divider,
} from "@mui/material";
import { MagnifyingGlass, Plus } from "phosphor-react";
import { useTheme } from "@mui/material/styles";
import { SimpleBarStyle } from "../../components/Scrollbar";
import { ChatList } from "../../data";
import ChatElement from "../../components/ChatGroupElement";
import ChatComponent from "./GroupConversation";
import NoChat from "../../assets/Illustration/NoChat";
import {
  Search,
  SearchIconWrapper,
  StyledInputBase,
} from "../../components/Search";
import CreateGroup from "../../sections/dashboard/CreateGroup";
import { socket } from "../../socket";
import { useDispatch, useSelector } from "react-redux";
import { FetchGroupConversations } from "../../redux/slices/conversation";
import SearchGroup from "./SearchGroup";
const Group = () => {
    const messageRefs = useRef([]);
     const [showSearchBar, setShowSearchBar] = useState(false);
  const user_id = window.localStorage.getItem("user_id");
  const [openDialog, setOpenDialog] = useState(false);
  const [searchText, setSearchText] = useState(""); // State để lưu giá trị tìm kiếm
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  const handleOpenDialog = () => {
    setOpenDialog(true);
  };
  const theme = useTheme();

  const { conversations } = useSelector(
    (state) => state.conversation.group_chat
  );
  const { sideBar, group_id, chat_type } = useSelector((state) => state.app);
  const handleSearchChange = (event) => {
    setSearchText(event.target.value); // Cập nhật giá trị khi người dùng nhập
    console.log("Tìm kiếm:", event.target.value); // In ra giá trị tìm kiếm (tuỳ chọn)
  };
  const filter_conversation = conversations.filter((conversation) => {
    return conversation.name.toLowerCase().includes(searchText.toLowerCase());
  });
  useEffect(() => {
    socket.emit("get_group_conversations", { user_id }, (data) => {
      console.log("Dữ liệu data là :", data); // this data is the list of conversations
      // dispatch action

      dispatch(FetchGroupConversations({ conversations: data }));
    });
  }, []);
  return (
    <>
      <Stack direction="row" sx={{ width: "100%" }}>
        {/* Left */}

        <Box
          sx={{
            overflowY: "scroll",

            height: "100vh",
            width: 320,
            backgroundColor: (theme) =>
              theme.palette.mode === "light"
                ? "#F8FAFF"
                : theme.palette.background,

            boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.25)",
          }}
        >
          <Stack p={3} spacing={2} sx={{ maxHeight: "100vh" }}>
            <Stack
              alignItems={"center"}
              justifyContent="space-between"
              direction="row"
            >
              <Typography variant="h5">Groups</Typography>
            </Stack>
            <Stack sx={{ width: "100%" }}>
              <Search>
                <SearchIconWrapper>
                  <MagnifyingGlass color="#709CE6" />
                </SearchIconWrapper>
                <StyledInputBase
                  placeholder="Tìm kiếm"
                  inputProps={{ "aria-label": "search" }}
                  onChange={handleSearchChange}
                />
              </Search>
            </Stack>
            <Stack
              justifyContent={"space-between"}
              alignItems={"center"}
              direction={"row"}
            >
              <Typography variant="subtitle2" sx={{}} component={Link}>
                Tạo nhóm mới
              </Typography>
              <IconButton onClick={handleOpenDialog}>
                <Plus style={{ color: theme.palette.primary.main }} />
              </IconButton>
            </Stack>
            <Divider />
            <Stack sx={{ flexGrow: 1, overflowY: "scroll", height: "100%" }}>
              <SimpleBarStyle timeout={500} clickOnTrack={false}>
                {!searchText ? (
                  <Stack spacing={2.4}>
                    <Typography variant="subtitle2" sx={{ color: "#676667" }}>
                      Nhóm đã ghim
                    </Typography>
                    {/* Chat List */}
                    {conversations
                      .filter((el) => el.pinned)
                      .map((el, idx) => {
                        return <ChatElement {...el} />;
                      })}
                    <Typography variant="subtitle2" sx={{ color: "#676667" }}>
                      Tất cả
                    </Typography>
                    {/* Chat List */}
                    <Stack spacing={1}>
                      {conversations
                        ?.filter((el) => !el.pinned)
                        .map((el, idx) => {
                          return <ChatElement {...el} key={idx} />;
                        })}
                    </Stack>
                  </Stack>
                ) : (
                  <Stack spacing={2.4}>
                    {/* Chat List */}
                    {filter_conversation.map((el, idx) => {
                      return <ChatElement {...el} />;
                    })}
                  </Stack>
                )}
              </SimpleBarStyle>
            </Stack>
          </Stack>
        </Box>

        {/* Right */}
        <Box
          sx={{
            height: "100%",
            // width: sideBar.open
            //   ? `calc(100vw - 740px )`
            //   : "calc(100vw - 420px )",
            backgroundColor:
              theme.palette.mode === "light"
                ? "#FFF"
                : theme.palette.background.paper,
            borderBottom:
              searchParams.get("type") === "individual-chat" &&
              searchParams.get("id")
                ? "0px"
                : "6px solid #0162C4",
          }}
          style={{ flex: 1 }}
        >
          { group_id !== null ? (
            <ChatComponent messageRefs={messageRefs} setShowSearchBar={setShowSearchBar}/>
          ) : (
            <Stack
              spacing={2}
              sx={{ height: "100%", width: "100%" }}
              alignItems="center"
              justifyContent={"center"}
            >
              <NoChat />
              <Typography variant="subtitle2">
                Chọn một cuộc trò chuyện để bắt đầu{" "}
                {/* <Link
                  style={{
                    color: theme.palette.primary.main,
                    textDecoration: "none",
                  }}
                  to="/"
                >
                  new one
                </Link> */}
              </Typography>
            </Stack>
          )}
        </Box>
        {showSearchBar && <SearchGroup messageRefs={messageRefs} setShowSearchBar={setShowSearchBar}/>}
      </Stack>
      {openDialog && (
        <CreateGroup open={openDialog} handleClose={handleCloseDialog} />
      )}
    </>
  );
};

export default Group;
