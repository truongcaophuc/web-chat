import React, { useState, useRef } from "react";
import {
  Box,
  Stack,
  Typography,
  IconButton,
  Link,
  Divider,
} from "@mui/material";
import {
  Search,
  SearchIconWrapper,
  StyledInputBase,
} from "../../components/Search";
import { MagnifyingGlass, Plus, X } from "phosphor-react";
import { useDispatch, useSelector } from "react-redux";
import Avatar from "react-avatar";
const truncateText = (string, n) => {
  return string?.length > n ? `${string?.slice(0, n)}...` : string;
};
const SearchConversation = ({ messageRefs, setShowSearchBar }) => {
  const { conversations, current_messages, current_conversation } = useSelector(
    (state) => state.conversation.direct_chat
  );
  const { firstName, lastName } = useSelector((state) => state.app.user);
  const userName = firstName + " " + lastName;

  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const messageContainerRef = useRef(null);

  const handleResultClick = (index) => {
    console.log("click", index);
    const targetMessage = messageRefs.current[index];
    if (targetMessage) {
      targetMessage.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };
  const handleSearchChange = (event) => {
    const searchText = event.target.value;
    setSearchText(event.target.value); // Cập nhật giá trị khi người dùng nhập
    if (!searchText) {
      setSearchResults([]);
      return 1;
    }
    const results = current_messages
      ?.map((msg, index) =>
        msg.message.toLowerCase().includes(searchText.toLowerCase())
          ? { ...msg, index }
          : null
      )
      .filter(Boolean);
    console.log("kết quả lọc", results);
    setSearchResults(results);
    console.log("Tìm kiếm:", event.target.value); // In ra giá trị tìm kiếm (tuỳ chọn)
  };
  return (
    <Stack
      sx={{ width: "22%" }}
      style={{
        backgroundColor: "#F8FAFF",
        padding: "20px",
        alignItems: "center",
        gap: "10px",
      }}
    >
      <Stack flexDirection={"row"} alignItems={"center"}>
        <Typography style={{ fontSize: "18px", fontWeight: 600 }}>
          Tìm kiếm trong trò chuyện
        </Typography>
        <IconButton
          onClick={() => {
            setShowSearchBar(false);
          }}
        >
          <X style={{}} />
        </IconButton>
      </Stack>
      <Stack>
        <Search>
          <SearchIconWrapper>
            <MagnifyingGlass color="#709CE6" />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="Tìm kiếm"
            inputProps={{ "aria-label": "search" }}
            value={searchText}
            onChange={handleSearchChange}
          />
        </Search>
      </Stack>

      <Stack
        ref={messageContainerRef}
        style={{
          overflowY: "scroll",
        }}
        width="100%"
      >
        {searchResults.map((msg, index) => (
          <Stack
            flexDirection={"row"}
            key={index}
            style={{ padding: "10px", alignItems: "center", gap: "10px" }}
            onClick={() => handleResultClick(msg.index)}
          >
            <Avatar
              name={msg.incoming ? current_conversation?.name : userName}
              size={40}
              round={true}
            />
            <Stack style={{flex:1}}>
            <Typography>{msg.incoming ? current_conversation?.name : userName}</Typography>
            <Typography>{truncateText(msg.message, 20)}</Typography>
            </Stack>
            <Typography>{current_conversation?.time}</Typography>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
};

export default SearchConversation;
