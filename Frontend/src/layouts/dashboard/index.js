import React, { useRef, useEffect } from "react";
import { Stack } from "@mui/material";
import { Navigate, Outlet } from "react-router-dom";
import useResponsive from "../../hooks/useResponsive";
import SideNav from "./SideNav";
import { useDispatch, useSelector } from "react-redux";
import {
  FetchUserProfile,
  SelectConversation,
  showSnackbar,
  UpdateOutgoingInvitaion,
  FetchAllUsers
} from "../../redux/slices/app";
import { socket, connectSocket } from "../../socket";
import {
  UpdateDirectConversation,
  UpdateGroupConversation,
  AddDirectConversation,
  AddDirectMessage,
  AddGroupMessage,
  UpdateUserStatus,
  SortConversation,
  SortConversationGroup,
  UpdateMessageStatus,
  UpdateMessageGroupStatus
} from "../../redux/slices/conversation";
import AudioCallNotification from "../../sections/dashboard/Audio/CallNotification";
import VideoCallNotification from "../../sections/dashboard/video/CallNotification";
import {
  PushToAudioCallQueue,
  CloseAudioNotificationDialog,
  CloseAudioDialog
} from "../../redux/slices/audioCall";
import AudioCallDialog from "../../sections/dashboard/Audio/CallDialog";
import VideoCallDialog from "../../sections/dashboard/video/CallDialog";
import {
  PushToVideoCallQueue,
  CloseVideoNotificationDialog,
  CloseVideoDialog
} from "../../redux/slices/videoCall";

const DashboardLayout = () => {
  const isDesktop = useResponsive("up", "md");
  const dispatch = useDispatch();
  const { user_id } = useSelector((state) => state.auth);
  const { open_audio_notification_dialog, open_audio_dialog } = useSelector(
    (state) => state.audioCall
  );
  const { open_video_notification_dialog, open_video_dialog } = useSelector(
    (state) => state.videoCall
  );
  const { isLoggedIn } = useSelector((state) => state.auth);
  const { conversations, current_conversation } = useSelector(
    (state) => state.conversation.direct_chat
  );

  useEffect(() => {
    dispatch(FetchUserProfile());
    dispatch(FetchAllUsers());
  }, []);

  const handleCloseAudioDialog = () => {
    dispatch(CloseAudioDialog());
  };
  const handleCloseVideoDialog = () => {
    dispatch(CloseVideoDialog());
  };
  const handleCloseAudioNotificationDialog = () => {
    dispatch(CloseAudioNotificationDialog());
  };
  const handleCloseVideoNotificationDialog = () => {
    dispatch(CloseVideoNotificationDialog());
  };
  useEffect(() => {
    if (isLoggedIn) {
      if (!socket) {
        console.log("Khởi tạo socket")
        connectSocket(user_id);
        socket.on("connect", () => {
          console.log("Kết nối thành công tới socket có id là: ", socket.id);
        });
      }
      else console.log("đã kết nối rồi", socket.id)
      socket.on("user_status_update", (data) => {
        // TODO => dispatch an action to add this in call_queue
        dispatch(UpdateUserStatus(data));
      });
      socket.on("audio_call_notification", (data) => {
        // TODO => dispatch an action to add this in call_queue
        dispatch(PushToAudioCallQueue(data));
      });

      socket.on("video_call_notification", (data) => {
        // TODO => dispatch an action to add this in call_queue
        dispatch(PushToVideoCallQueue(data));
      });
      socket.on("seen_message_notification", (data) => {
        console.log("thông báo về người nhận đã xem tin nhắn", data);
        dispatch(
          UpdateMessageStatus({
            conversation_id: data.conversation_id,
            type: "Notification of viewed messages",
          })
        );
      });
      socket.on("seen_message_group_notification", (data) => {
        console.log("thông báo về người nhận đã xem tin nhắn", data);
        dispatch(
          UpdateMessageGroupStatus({
            conversation_id: data.conversation_id,
            type: "Notification of viewed messages",
          })
        );
      });
      socket.on("new_message", (data) => {
        const { message, conversation_id } = data;
        console.log(data);

        console.log(current_conversation);
        dispatch(
          SortConversation({
            room_id: data.conversation_id,
          })
        );
        dispatch(
          UpdateDirectConversation({
            conversation: data.conversation_id,
            msg: message,
          })
        );

        dispatch(
          AddDirectMessage({
            message: {
              id: message._id,
              type: "msg",
              subtype: message.type,
              message: message.text,
              fileName:message.fileName,
              fileSize:message.fileSize,
              fileUrl: message.fileUrl,
              incoming: message.to === user_id,
              outgoing: message.from === user_id,
              created_at:message.created_at
            },
            conversation_id,
          })
        );
      });
      socket.on("new_message_group",(data)=>{
        const { message, conversation_id } = data;
        console.log("nhận được tin nhắn group");
        console.log(data);

        console.log(current_conversation);
        dispatch(
          SortConversationGroup({
            room_id: data.conversation_id,
          })
        );
        dispatch(
          UpdateGroupConversation({
            conversation: data.conversation_id,
            msg: message,
          })
        );

        dispatch(
          AddGroupMessage({
            message: {
              id: message._id,
              type: "msg",
              subtype: message.type,
              message: message.text,
              incoming: message.from !== user_id,
              outgoing: message.from === user_id,
              from:data.from,
              created_at:message.created_at
            },
            conversation_id,
          })
        );
      })
      socket.on("start_chat", (data) => {
        console.log(data);
        // add / update to conversation list

        dispatch(AddDirectConversation({ conversation: data }));

        dispatch(SelectConversation({ room_id: data._id }));
      });

      socket.on("new_friend_request", (data) => {
        dispatch(
          showSnackbar({
            severity: "success",
            message: "New friend request received",
          })
        );
      });

      socket.on("request_accepted", (data) => {
        dispatch(
          showSnackbar({
            severity: "success",
            message: "Friend Request Accepted",
          })
        );
        dispatch(UpdateOutgoingInvitaion({invitation:data.id,type:"remove"}))
      });

      socket.on("request_sent", (data) => {
        dispatch(showSnackbar({ severity: "success", message: data.message }));
      });
    }

    // Remove event listener on component unmount
    return () => {
      socket?.off("new_friend_request");
      socket?.off("request_accepted");
      socket?.off("request_sent");
      socket?.off("start_chat");
      socket?.off("new_message");
      socket?.off("new_message_group");
      socket?.off("audio_call_notification");
      socket?.off("video_call_notification");
    };
  }, [isLoggedIn, socket]);

  if (!isLoggedIn) {
    return <Navigate to={"/auth/login"} />;
  }
  return (
    <>
      <Stack direction="row">
        {isDesktop && (
          // SideBar
          <SideNav />
        )}

        <Outlet />
      </Stack>
      {open_audio_notification_dialog && (
        <AudioCallNotification open={open_audio_notification_dialog}  handleClose={handleCloseAudioNotificationDialog}/>
      )}
      {open_audio_dialog && (
        <AudioCallDialog
          open={open_audio_dialog}
          handleClose={handleCloseAudioDialog}
        />
      )}
      {open_video_notification_dialog && (
        <VideoCallNotification open={open_video_notification_dialog}  handleClose={handleCloseVideoNotificationDialog}/>
      )}
      {open_video_dialog && (
        <VideoCallDialog
          open={open_video_dialog}
          handleClose={handleCloseVideoDialog}
        />
      )}
    </>
  );
};

export default DashboardLayout;
