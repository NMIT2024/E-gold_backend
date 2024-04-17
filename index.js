const { setGoldRate } = require("./Common");
const app = require("./app");
const { socketURL } = require("./config");
const PORT = process.env.PORT || 4000;
const db = require("./db");
const cron = require("node-cron");

const http = require("http").Server(app);
const socketIO = require("socket.io")(http, {
  cors: {
    origin: socketURL,
  },
});

cron.schedule("*/10 * * * * *", () => {
  console.log("Execute every 10 Second");
  const sql = `SELECT * FROM gold_rate`;
  db.query(sql, (err, result) => {
    if (err) return { status: 0, message: err.message };

    if (result && result[0].rate > 0) {
      let goldRate = result[0].rate;
      let maxRate = result[0].ceilng;
      let minRate = result[0].floor;

      let newRate = goldRate + 1;
      if (newRate > maxRate) {
        newRate = Math.random() * (maxRate - minRate) + minRate;
      }
      let data = {
        rate: newRate,
        ceilng: result[0].ceilng,
        floor: result[0].floor,
      };
      setGoldRate(data);
      socketIO.emit("getGoldResponse", data);
    }
  });
});

socketIO.on("connection", (socket) => {
  console.log("⚡Client connected");

  socket.on("generateGoldRate", (response) => {
    console.log("response.data", response.data);
    setGoldRate(response.data);
  });

  socket.on("getGoldRate", (response) => {
    const sql = `SELECT * FROM gold_rate`;
    db.query(sql, (err, result) => {
      if (err) return { status: 0, message: err.message };

      if (result && result[0].rate > 0) {
        let newRate =
          Math.random() * (result[0].ceilng - result[0].floor) +
          result[0].floor;
        let data = {
          rate: newRate,
          ceilng: result[0].ceilng,
          floor: result[0].floor,
        };
        socketIO.emit("getGoldResponse", data);
        socketIO.emit("goldResponse", data);
      }
    });
  });

  socket.on("disconnect", () => {
    console.log("⚡Client disconnected");
  });
});

http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
