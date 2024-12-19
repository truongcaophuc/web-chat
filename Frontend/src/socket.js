import io from "socket.io-client"; // Add this

let socket;
let a;
const connectSocket = (user_id) => {
  a=Math.random();
  socket = io("http://localhost:4000/", {
    query: `user_id=${user_id}`,
  });
} // Add this -- our server will run on port 4000, so we connect to it from here

export {socket, connectSocket,a};
