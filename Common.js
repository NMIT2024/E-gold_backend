const db = require("./db");
const { networkInterfaces } = require("os");

function getCurrentDateTime() {
  let current = new Date();
  let cDate =
    current.getFullYear() +
    "-" +
    (current.getMonth() + 1) +
    "-" +
    current.getDate();
  let cTime =
    current.getHours() +
    ":" +
    current.getMinutes() +
    ":" +
    current.getSeconds();
  let dateTime = cDate + " " + cTime;
  return dateTime;
}

function setGoldRate({ rate, ceilng, floor }) {
  const dateTime = getCurrentDateTime();
  const sql = `UPDATE gold_rate SET rate = "${rate}", ceilng = "${ceilng}", floor = "${floor}", create_at = "${dateTime}"`;
  db.query(sql, (err, result) => {
    if (err) return { status: 0, message: err.message };
    return { status: 1 };
  });
}

function getIpAddres() {
  const nets = networkInterfaces();
  const results = []; // Or just '{}', an empty object

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      // 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
      const familyV4Value = typeof net.family === "string" ? "IPv4" : 4;
      if (net.family === familyV4Value && !net.internal) {
        if (!results[name]) {
          results[name] = [];
        }
        console.log("net.address", net.address);
        results.push(net.address);
      }
    }
  }
  console.log("Result", results);

  return results[0];
}

function auditLogs(userId, url, log_message) {
  const dateTime = getCurrentDateTime();
  const ip = getIpAddres();
  const sql = `INSERT INTO logs (userId, url, ip, createdOn, log_message) VALUES ("${userId}", "${url}", "${ip}", "${dateTime}", "${log_message}")`;
  console.log("sql", sql);
  db.query(sql, (err, result) => {
    if (err) return { status: 0, message: err.message };
    return { status: 1 };
  });
}

// function getGoldRate() {
//   const sql = `SELECT * FROM gold_rate`;
//   let response = {};
//   db.query(sql, (err, result) => {
//     if (err) return { status: 0, message: err.message };
//     response = { status: 1, goldrate: result[0] };
//   });
//   return response
// }
module.exports = { getCurrentDateTime, setGoldRate, auditLogs };
