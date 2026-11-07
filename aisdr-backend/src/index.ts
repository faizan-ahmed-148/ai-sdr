import { createServer } from 'node:http';
import { EmailScheduler } from './cron/emailCron';
import App from "./server";
import Socket from "./socket";
import "./polyfills";

const PORT = process.env.PORT || 5000;
const server = createServer(App);

// Initialize email scheduler
new EmailScheduler().start();

// Socket.attach(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
