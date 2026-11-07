import { Server } from "socket.io";
const io = new Server({
  cors: {
    origin: "*",
  },
  transports: ["websocket"],
});

const activeClients = new Map();

io.on("connection", (socket) => {
  activeClients.set(socket.handshake.query.id, socket);
  console.log("Connected:", socket.id, "→", activeClients);

  socket.on("disconnect", () => {
    activeClients.delete(socket.id);
    console.log("Disconnected:", socket.id, "→", activeClients);
  });
});

export default io;
export {activeClients}
