import "dotenv/config";

import app from "./app.js";

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
     console.log(`VoiceMate API running on port ${PORT}`);
});


process.on("SIGTERM", () => {
     console.log("SIGTERM received. Closing server...");

     server.close(() => {
          console.log("HTTP server closed.");
          process.exit(0);
     });
});