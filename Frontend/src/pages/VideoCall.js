import React, { useEffect, useRef } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { useDispatch, useSelector } from "react-redux";
import { ResetVideoCallQueue } from "../redux/slices/videoCall";
import { socket } from "../socket";
// Hàm tạo ID ngẫu nhiên
function randomID(len) {
  let result = "";
  var chars = "12345qwertyuiopasdfgh67890jklmnbvcxzMNBVCZXASDQWERTYHGFUIOLKJP",
    maxPos = chars.length;
  len = len || 5;
  for (let i = 0; i < len; i++) {
    result += chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return result;
}

// Component chính
export default function App() {
  const dispatch = useDispatch();
  const zego = useRef(null);
  const [videoCall] = useSelector((state) => state.videoCall.call_queue);
  const { firstName, lastName } = useSelector((state) => state.app.user);
  const userName = firstName + " " + lastName;
  const roomID = videoCall?.roomID;
  const myMeeting = async (element) => {
    if (!element) return;
    const appID = 1389463141;
    const serverSecret = "6ad1690ad3a58119a4b912e317677a5f";
    // Tạo token sử dụng ZEGOCLOUD SDK
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID,
      serverSecret,
      roomID,
      randomID(5),
      userName
    );

    // Tạo instance và tham gia phòng họp
    zego.current = ZegoUIKitPrebuilt.create(kitToken);
    zego.current.joinRoom({
      container: element,
      showPreJoinView: false,
      sharedLinks: [
        {
          name: "Personal link",
          url:
            window.location.origin +
            window.location.pathname +
            "?roomID=" +
            roomID,
        },
      ],
      scenario: {
        mode: ZegoUIKitPrebuilt.OneONoneCall, // Sử dụng GroupCall. Để gọi 1-1, thay bằng OneONoneCall.
      },
      turnOnCameraWhenJoining: true,
      onLeaveRoom: () => {
        socket.emit("end_videocall",{roomID})
        dispatch(ResetVideoCallQueue());
        window.location.href = "/app";
      },
    });
  };
  return (
    <div
      className="myCallContainer"
      ref={myMeeting}
      style={{ width: "100vw", height: "100vh" }}
    ></div>
  );
}
