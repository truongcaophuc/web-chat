const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

process.on("uncaughtException", (err) => {
  console.log(err);
  console.log("UNCAUGHT Exception! Shutting down ...");
  process.exit(1); // Exit Code 1 indicates that a container shut down, either because of an application failure.
});

const app = require("./app");

const http = require("http");
const server = http.createServer(app);

const { Server } = require("socket.io"); // Add this
const { promisify } = require("util");
const User = require("./models/user");
const FriendRequest = require("./models/friendRequest");
const OneToOneMessage = require("./models/OneToOneMessage");
const GroupConversation = require("./models/GroupConversation");
const AudioCall = require("./models/audioCall");
const VideoCall = require("./models/videoCall");

// Add this
// Create an io server and allow for CORS from http://localhost:3000 with GET and POST methods
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

mongoose
  .connect(
    "mongodb+srv://truongphuc:truongphuc@chat-application.8vkcg.mongodb.net/demo?retryWrites=true&w=majority&appName=Chat-application"
  )
  .then((con) => {
    console.log("DB Connection successful");
  })
  .catch((err) => console.error("Lỗi kết nối:", err));

const port = process.env.PORT || 8000;

server.listen(port, () => {
  console.log(`App running on port ${port} ...`);
});

// Add this
// Listen for when the client connects via socket.io-client
io.on("connection", async (socket) => {
  //console.log(JSON.stringify(socket.handshake.query));
  const user_id = socket.handshake.query["user_id"];

  // console.log(`User connected ${socket.id}`);
  // console.log("user_id là", user_id);
  if (user_id != null && Boolean(user_id)) {
    try {
      await User.findByIdAndUpdate(user_id, {
        socket_id: socket.id,
        status: "Online",
      });
      const groups_id = await GroupConversation.find({
        participants: { $all: [user_id] },
      }).select("_id");
      groups_id.forEach((group_id) => {
        socket.join(group_id._id.toString());
        //console.log(`${socket.id} joined room: ${group_id}`);
      });
      //console.log("đã cập nhật trạng thái thành công");
      io.emit("user_status_update", { _id: user_id, status: "Online" });
    } catch (e) {
      console.log(e);
    }
  }
  socket.on("user_status_update", (data) => {
    // TODO => dispatch an action to add this in call_queue
    dispatch(UpdateUserStatus(data));
  });
  // We can write our socket event listeners in here...
  socket.on("friend_request", async (data) => {
    const to = await User.findById(data.to).select("socket_id");
    const from = await User.findById(data.from).select("socket_id");

    // create a friend request
    await FriendRequest.create({
      sender: data.from,
      recipient: data.to,
    });
    // emit event request received to recipient
    io.to(to?.socket_id).emit("new_friend_request", {
      message: "New friend request received",
    });
    io.to(from?.socket_id).emit("request_sent", {
      message: "Request Sent successfully!",
    });
  });
  socket.on("unFriend", async (data) => {
    const { from, to } = data;
    const user = await User.findById(from);
    if (user.friends.includes(to)) {
      user.friends = user.friends.filter((friend) => friend != to);
      await user.save({ new: true, validateModifiedOnly: true });
    }
  });
  socket.on("leaveGroup", async (data) => {
    const { id, user_id } = data;
    const group = await GroupConversation.findById(id);
    if (group.participants.includes(user_id)) {
      group.participants = group.participants.filter(
        (participant) => participant != user_id
      );
      await group.save({ new: true, validateModifiedOnly: true });
    }
  });
  socket.on("addMember", async (data) => {
    const { id, members } = data;
    console.log("id là",id)
    console.log("members là",members)
    const group = await GroupConversation.findById(id);
    group.participants=[...group.participants,...members]
    await group.save({ new: true, validateModifiedOnly: true });
  });
  socket.on("accept_request", async (data) => {
    // accept friend request => add ref of each other in friends array
    //console.log(data);
    const request_doc = await FriendRequest.findById(data.request_id);

    // console.log(request_doc);

    const sender = await User.findById(request_doc.sender);
    const receiver = await User.findById(request_doc.recipient);
    if (!sender.friends.includes(request_doc.recipient))
      sender.friends.push(request_doc.recipient);
    if (!receiver.friends.includes(request_doc.sender))
      receiver.friends.push(request_doc.sender);

    await receiver.save({ new: true, validateModifiedOnly: true });
    await sender.save({ new: true, validateModifiedOnly: true });

    await FriendRequest.findByIdAndDelete(data.request_id);

    // delete this request doc
    // emit event to both of them

    // emit event request accepted to both
    io.to(sender?.socket_id).emit("request_accepted", {
      message: "Friend Request Accepted",
      id: request_doc.recipient,
    });
    io.to(receiver?.socket_id).emit("request_accepted", {
      message: "Friend Request Accepted",
      id: request_doc.recipient,
    });
  });

  socket.on("get_direct_conversations", async ({ user_id }, callback) => {
    const existing_conversations = await OneToOneMessage.find({
      participants: { $all: [user_id] },
    }).populate("participants", "firstName lastName avatar _id email status");

    // console.log("Các cuộc họp hiện tại là: ",existing_conversations);

    callback(existing_conversations);
  });

  socket.on("get_group_conversations", async ({ user_id }, callback) => {
    const existing_conversations = await GroupConversation.find({
      participants: { $all: [user_id] },
    }).populate("participants", "firstName lastName avatar _id email status");

    // console.log("Các cuộc họp hiện tại là: ",existing_conversations);

    callback(existing_conversations);
  });

  socket.on("start_conversation", async (data) => {
    // data: {to: from:}
    const { to, from } = data;

    // check if there is any existing conversation

    const existing_conversations = await OneToOneMessage.find({
      participants: { $all: [to, from] },
    }).populate("participants", "firstName lastName _id email status");

    // console.log(existing_conversations[0], "Existing Conversation");

    // if no => create a new OneToOneMessage doc & emit event "start_chat" & send conversation details as payload
    if (existing_conversations.length === 0) {
      let new_chat = await OneToOneMessage.create({
        participants: [to, from],
      });

      new_chat = await OneToOneMessage.findById(new_chat._id).populate(
        "participants",
        "firstName lastName _id email status"
      );

      socket.emit("start_chat", new_chat);
    }
    // if yes => just emit event "start_chat" & send conversation details as payload
    else {
      socket.emit("start_chat", existing_conversations[0]);
    }
  });
  socket.on("new_group", async (data, callback) => {
    // data: {to: from:}
    const { title, members } = data;
    const users_id = members.map((member) => member.id);
    // check if there is any existing conversation

    const new_group = await GroupConversation.create({
      participants: users_id,
      title,
    });
    const result = await GroupConversation.findById(new_group._id).populate(
      "participants",
      "firstName lastName _id"
    );
    callback(result);
    // console.log(existing_conversations[0], "Existing Conversation");

    // if no => create a new OneToOneMessage doc & emit event "start_chat" & send conversation details as payload

    // if yes => just emit event "start_chat" & send conversation details as payload
  });
  socket.on("get_messages", async (data, callback) => {
    try {
      const { messages } = await OneToOneMessage.findById(
        data.conversation_id
      ).select("messages");

      callback(messages);
    } catch (error) {
      console.log(error);
    }
  });
  socket.on("get_messages_group", async (data, callback) => {
    try {
      const { messages } = await GroupConversation.findById(
        data.conversation_id
      )
        .select("messages")
        .populate({
          path: "messages.from", // Đường dẫn đến trường cần populate
          select: "_id firstName lastName", // Chọn các trường cụ thể từ User (ví dụ: name và email)
        });
      callback(messages);
    } catch (error) {
      console.log(error);
    }
  });
  socket.on("new_message_group", async (data, callback) => {
    try {
      const { message, conversation_id, from, type } = data;
      console.log("All rooms:", socket.rooms);
      // message => {to, from, type, created_at, text, file}

      const new_message = {
        from: from,
        type: type,
        created_at: Date.now(),
        text: message,
      };

      // fetch OneToOneMessage Doc & push a new message to existing conversation
      const chat = await GroupConversation.findById(conversation_id);
      chat.messages.push(new_message);
      // save to db`
      console.log("conversation id", conversation_id);
      const from_user = await User.find({ _id: from });
      await chat.save({ new: true, validateModifiedOnly: true });
      socket.to(conversation_id).emit("new_message_group", {
        conversation_id,
        message: new_message,
        from: from_user.firstName + " " + from_user.lastName,
      });
      // emit incoming_message -> to user
    } catch (error) {
      console.log(error);
    }
  });
  socket.on("message_seen", async (data, callback) => {
    try {
      await OneToOneMessage.updateMany(
        { _id: data.conversation_id }, // Điều kiện lọc
        { $set: { "messages.$[msg].is_read": true } }, // Cập nhật với identifier
        { arrayFilters: [{ "msg.is_read": false }] } // Lọc các phần tử trong mảng
      );
      const from_user = await User.findById(data.from);
      socket
        .to(from_user?.socket_id)
        .emit("seen_message_notification", { ...data });
    } catch (error) {
      console.log(error);
    }
  });
  socket.on("message_group_seen", async (data, callback) => {
    try {
      await GroupConversation.updateMany(
        { _id: data.conversation_id }, // Điều kiện lọc
        { $set: { "messages.$[msg].is_read": true } }, // Cập nhật với identifier
        { arrayFilters: [{ "msg.is_read": false }] } // Lọc các phần tử trong mảng
      );
      socket
        .to(data.conversation_id)
        .emit("seen_message_group_notification", { ...data });
    } catch (error) {
      console.log(error);
    }
  });
  // Handle incoming text/link messages
  socket.on("text_message", async (data) => {
    // data: {to, from, text}

    const { message, conversation_id, from, to, type } = data;

    const to_user = await User.findById(to);
    const from_user = await User.findById(from);

    // message => {to, from, type, created_at, text, file}

    const new_message = {
      to: to,
      from: from,
      type: type,
      created_at: Date.now(),
      text: message,
    };

    // fetch OneToOneMessage Doc & push a new message to existing conversation
    const chat = await OneToOneMessage.findById(conversation_id);
    chat.messages.push(new_message);
    // save to db`
    await chat.save({ new: true, validateModifiedOnly: true });

    // emit incoming_message -> to user

    socket.to(to_user?.socket_id).emit("new_message", {
      conversation_id,
      message: new_message,
    });

    // emit outgoing_message -> from user
    // io.to(from_user?.socket_id).emit("new_message", {
    //   conversation_id,
    //   message: new_message,
    // });
  });

  // handle Media/Document Message
  socket.on("file_message", (data) => {
    console.log("Received message:", data);

    // data: {to, from, text, file}

    // Get the file extension
    const fileExtension = path.extname(data.file.name);

    // Generate a unique filename
    const filename = `${Date.now()}_${Math.floor(
      Math.random() * 10000
    )}${fileExtension}`;

    // upload file to AWS s3

    // create a new conversation if its dosent exists yet or add a new message to existing conversation

    // save to db

    // emit incoming_message -> to user

    // emit outgoing_message -> from user
  });

  // -------------- HANDLE AUDIO CALL SOCKET EVENTS ----------------- //

  // handle start_audio_call event
  socket.on("start_audio_call", async (data) => {
    const { from, to, roomID } = data;

    const to_user = await User.findById(to);
    const from_user = await User.findById(from);

    //console.log("to_user", to_user);

    // send notification to receiver of call
    io.to(to_user?.socket_id).emit("audio_call_notification", {
      from: from_user,
      roomID,
      streamID: from,
      userID: to,
      userName: to,
    });
  });

  // handle audio_call_not_picked
  socket.on("audio_call_not_picked", async (data) => {
    //console.log(data);
    // find and update call record
    const { to, from, roomID } = data;

    const to_user = await User.findById(to);

    await AudioCall.findOneAndUpdate(
      {
        _id: roomID,
      },
      { verdict: "Missed", status: "Ended", endedAt: Date.now() }
    );

    // TODO => emit call_missed to receiver of call
    io.to(to_user?.socket_id).emit("audio_call_missed", {
      from,
      to,
    });
  });

  // handle audio_call_accepted
  socket.on("audio_call_accepted", async (data) => {
    const { to, from, roomID } = data;

    const from_user = await User.findById(from);

    // find and update call record
    await AudioCall.findOneAndUpdate(
      {
        _id: roomID,
      },
      { verdict: "Accepted" }
    );

    // TODO => emit call_accepted to sender of call
    io.to(from_user?.socket_id).emit("audio_call_accepted", {
      from,
      to,
    });
  });

  // handle audio_call_denied
  socket.on("audio_call_denied", async (data) => {
    // find and update call record
    const { to, from, roomID } = data;

    await AudioCall.findOneAndUpdate(
      {
        _id: roomID,
      },
      { verdict: "Denied", status: "Ended", endedAt: Date.now() }
    );

    const from_user = await User.findById(from);
    // TODO => emit call_denied to sender of call

    io.to(from_user?.socket_id).emit("audio_call_denied", {
      from,
      to,
    });
  });

  // handle user_is_busy_audio_call
  socket.on("user_is_busy_audio_call", async (data) => {
    const { to, from, roomID } = data;
    // find and update call record
    await AudioCall.findOneAndUpdate(
      {
        _id: roomID,
      },
      { verdict: "Busy", status: "Ended", endedAt: Date.now() }
    );

    const from_user = await User.findById(from);
    // TODO => emit on_another_audio_call to sender of call
    io.to(from_user?.socket_id).emit("on_another_audio_call", {
      from,
      to,
    });
  });

  // --------------------- HANDLE VIDEO CALL SOCKET EVENTS ---------------------- //

  // handle start_video_call event
  socket.on("start_video_call", async (data) => {
    const { from, to, roomID } = data;
    // console.log("yêu cầu gọi video");
    // console.log(data);

    const to_user = await User.findById(to);
    const from_user = await User.findById(from);

    // console.log("to_user", to_user);

    // send notification to receiver of call
    io.to(to_user?.socket_id).emit("video_call_notification", {
      from: from_user,
      to: to_user,
      roomID,
    });
  });

  // handle video_call_not_picked
  socket.on("video_call_not_picked", async (data) => {
    // find and update call record
    try {
      const { to, from, roomID } = data;
      await VideoCall.findOneAndUpdate(
        {
          _id: roomID,
        },
        { verdict: "Missed", status: "Ended", endedAt: Date.now() }
      );
      // TODO => emit call_missed to receiver of call
      socket.emit("video_call_missed", {
        from,
        to,
      });
    } catch (err) {
      console.log(err);
    }
  });
  socket.on("cancel_audiocall", async (data) => {
    // find and update call record
    try {
      console.log("hủy cuộc gọi");
      const { to, from, roomID } = data;

      const to_user = await User.findById(to);

      await AudioCall.findOneAndUpdate(
        {
          _id: roomID,
        },
        { verdict: "Canceled", status: "Ended", endedAt: Date.now() }
      );
      io.to(to_user?.socket_id).emit("audio_call_canceled", {
        from,
        to,
      });
    } catch (err) {
      console.log(err);
    }
  });
  socket.on("cancel_videocall", async (data) => {
    // find and update call record
    try {
      console.log("hủy cuộc gọi");
      const { to, from, roomID } = data;

      const to_user = await User.findById(to);

      await VideoCall.findOneAndUpdate(
        {
          _id: roomID,
        },
        { verdict: "Canceled", status: "Ended", endedAt: Date.now() }
      );
      io.to(to_user?.socket_id).emit("video_call_canceled", {
        from,
        to,
      });
    } catch (err) {
      console.log(err);
    }
  });
  socket.on("end_audiocall", async (data) => {
    // find and update call record
    try {
      console.log("kết thúc cuộc gọi");
      const { roomID } = data;
      await AudioCall.findOneAndUpdate(
        {
          _id: roomID,
        },
        { status: "Ended", endedAt: Date.now() }
      );
    } catch (err) {
      console.log(err);
    }
  });
  socket.on("end_videocall", async (data) => {
    // find and update call record
    try {
      console.log("kết thúc cuộc gọi");
      const { roomID } = data;
      await VideoCall.findOneAndUpdate(
        {
          _id: roomID,
        },
        { status: "Ended", endedAt: Date.now() }
      );
    } catch (err) {
      console.log(err);
    }
  });
  // handle video_call_accepted
  socket.on("video_call_accepted", async (data) => {
    try {
      const { to, from, roomID } = data;

      const from_user = await User.findById(from);

      // find and update call record
      await VideoCall.findOneAndUpdate(
        {
          _id: roomID,
        },
        { verdict: "Accepted" }
      );

      // TODO => emit call_accepted to sender of call
      io.to(from_user?.socket_id).emit("video_call_accepted", {
        from,
        to,
      });
    } catch (err) {
      console.log(err);
    }
  });

  // handle video_call_denied
  socket.on("video_call_denied", async (data) => {
    // find and update call record
    const { to, from, roomID } = data;

    await VideoCall.findOneAndUpdate(
      {
        _id: roomID,
      },
      { verdict: "Denied", status: "Ended", endedAt: Date.now() }
    );

    const from_user = await User.findById(from);
    // TODO => emit call_denied to sender of call

    io.to(from_user?.socket_id).emit("video_call_denied", {
      from,
      to,
    });
  });

  // handle user_is_busy_video_call
  socket.on("user_is_busy_video_call", async (data) => {
    const { to, from, roomID } = data;
    // find and update call record
    await VideoCall.findOneAndUpdate(
      {
        _id: roomID,
      },
      { verdict: "Busy", status: "Ended", endedAt: Date.now() }
    );

    const from_user = await User.findById(from);
    // TODO => emit on_another_video_call to sender of call
    io.to(from_user?.socket_id).emit("on_another_video_call", {
      from,
      to,
    });
  });

  // -------------- HANDLE SOCKET DISCONNECTION ----------------- //

  socket.on("disconnect", async (data) => {
    // Find user by ID and set status as offline

    if (user_id) {
      await User.findByIdAndUpdate(user_id, { status: "Offline" });
      io.emit("user_status_update", { _id: user_id, status: "Offline" });
    } else {
      console.log("User not found");
    }
    // broadcast to all conversation rooms of this user that this user is offline (disconnected)

    console.log("closing connection");
    socket.disconnect(0);
  });
});

process.on("unhandledRejection", (err) => {
  console.log(err);
  console.log("UNHANDLED REJECTION! Shutting down ...");
  server.close(() => {
    process.exit(1); //  Exit Code 1 indicates that a container shut down, either because of an application failure.
  });
});
