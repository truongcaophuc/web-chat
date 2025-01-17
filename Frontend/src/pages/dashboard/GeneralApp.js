import React, { useState, useRef } from "react";
import { useTheme } from "@mui/material/styles";
import { Box, Stack, Typography } from "@mui/material";

import { Link, useSearchParams } from "react-router-dom";
import ChatComponent from "./Conversation";
import Chats from "./Chats";
import SearchConversation from "./SearchConversation";
import Contact from "../../sections/dashboard/Contact";
import NoChat from "../../assets/Illustration/NoChat";
import { useSelector } from "react-redux";
import StarredMessages from "../../sections/dashboard/StarredMessages";
import Media from "../../sections/dashboard/SharedMessages";

const GeneralApp = () => {
  const [searchParams] = useSearchParams();
  const messageRefs = useRef([]);
  const theme = useTheme();
  const [showSearchBar, setShowSearchBar] = useState(false);
  const { sideBar, room_id, chat_type } = useSelector((state) => state.app);

  return (
    <>
      <Stack direction="row" sx={{ width: "100%" }}>
        <Chats />
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
          {room_id !== null ? (
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
        {showSearchBar && <SearchConversation messageRefs={messageRefs} setShowSearchBar={setShowSearchBar}/>}
        {sideBar.open &&
          (() => {
            switch (sideBar.type) {
              case "CONTACT":
                return <Contact />;

              case "STARRED":
                return <StarredMessages />;

              case "SHARED":
                return <Media />;

              default:
                break;
            }
          })()}
      </Stack>
    </>
  );
};

export default GeneralApp;
