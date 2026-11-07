import "dotenv/config";
import { createServer } from "http";
import { attachWebRTC } from "./webrtc.js";

import app from "./app.js";

const PORT = process.env.PORT || 5000;

const server = createServer(app);
attachWebRTC(server);

server.listen(PORT, () => {
     console.log(`VoiceMate API running on port ${PORT}`);
});


process.on("SIGTERM", () => {
     console.log("SIGTERM received. Closing server...");

     server.close(() => {
          console.log("HTTP server closed.");
          process.exit(0);
     });
});