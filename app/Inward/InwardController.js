const express = require("express");
const moment = require("moment");
const { getCurrentDateTime, auditLogs } = require("../../Common");
const verifyToken = require("../../VerifyToken.js");
const router = express.Router();
const db = require(__root + "db");

router.post("/", verifyToken, function (req, res) {
  //api/inward
  const { coveredPosition } = req.body;
  let dateTime = getCurrentDateTime();

  let current = new Date();
  let cDate =
  current.getFullYear() +
  "-" +
  (current.getMonth() + 1) +
  "-" +
  current.getDate();

  const sqlCheck = `SELECT * FROM inward ORDER BY id DESC LIMIT 1`;
  db.query(sqlCheck, (err, rowData) => {
    if (err)
      return res.status(500).send({ status: false, message: err.message });
    if (rowData && rowData.length > 0) {
      let currentPosition = rowData[0].netPosition;
      let opPosition = rowData[0].openPosition;
      let coPosition = rowData[0].coveredPosition;
      let newNetPosition =
        parseFloat(currentPosition) - parseFloat(coveredPosition);
      let newCoPosition = parseFloat(coPosition) + parseFloat(coveredPosition);
      let newcurrentPosition =
        parseFloat(currentPosition) - parseFloat(coveredPosition);

      const sqlRowCheck = `SELECT * FROM inward WHERE createdAt = "${cDate}"`;
      db.query(sqlRowCheck, (err, results) => {
        if (results && results.length > 0) {
          auditLogs(req.userId, "inward", "update inward entry");
          const sqlOne = `UPDATE inward SET coveredPosition = '${newCoPosition}', netPosition = '${newNetPosition}' WHERE createdAt = "${cDate}"`;
          db.query(sqlOne, (err, result) => {
            if (err)
              return res
                .status(500)
                .send({ status: false, message: err.message });
            else
              res
                .status(200)
                .send({ auth: true, user: "inward added successfully" });
          });
        } else {
          auditLogs(req.userId, "inward", "new inward entry");
          const sqlOne = `INSERT INTO inward (openPosition, coveredPosition, netPosition, createdOn, createdAt) VALUES ('${currentPosition}', '${coveredPosition}', '${newcurrentPosition}', '${dateTime}', '${cDate}')`;
          db.query(sqlOne, (err, result) => {
            if (err)
              return res
                .status(500)
                .send({ status: false, message: err.message });
            else
              res
                .status(200)
                .send({ auth: true, user: "inward added successfully" });
          });
        }
      });
    }
  });
});

router.post("/getInward", verifyToken, function (req, res) {
  const { date } = req.body;
  const date_ = date.split(" - ");
  const fromdate = new Date(date_[0])
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");
  const todate = new Date(date_[1])
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");

  const startDate = moment(date_[0]);
  const endDate = moment(date_[1]);
  const datesBetween = [];
  let currentDate = startDate.clone();
  while (currentDate.isSameOrBefore(endDate, "day")) {
    datesBetween.push({
      date: currentDate.format("YYYY-MM-DD"),
      netCount: 0,
      coveredCount: 0,
    });
    currentDate.add(1, "day");
  }

  const sql1 = `SELECT * FROM inward WHERE createdAt BETWEEN '${fromdate}' AND '${todate}'`;
  db.query(sql1, function (err, result) {
    if (err) return res.status(500).send({ auth: false, message: err });
    if (result) {
      res.status(200).send({
        auth: true,
        data: result,
      });
    } else {
      return res
        .status(404)
        .send({ auth: false, message: "Sorry, Something went wrong." });
    }
  });
});

router.get("/op", verifyToken, function (req, res) {
  const sql = `SELECT netPosition as totalOp FROM inward ORDER BY id DESC LIMIT 1`;
  db.query(sql, function (err, result) {
    if (err) return res.status(500).send({ auth: false, message: err });
    if (result) {
      res.status(200).send({ auth: true, data: result[0] });
    } else {
      return res
        .status(404)
        .send({ auth: false, message: "Sorry, Something went wrong." });
    }
  });
});

router.get("/inward-details", verifyToken, function (req, res) {
  const todate = moment(new Date()).format("YYYY-MM-DD");
  const sql = `SELECT coveredPosition as totalInward, netPosition as totalNetInward FROM inward WHERE createdAt = '${todate}' `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).send({ auth: false, message: err });
    if (result && result.length > 0) {
      const sql1 = `SELECT SUM(quantity) as totalQuantity, SUM(price) as totalPrice FROM purchase WHERE createdAt = '${todate}' `;
      db.query(sql1, (err1, result1) => {
        if (err1) return res.status(500).send({ status: 0, message: err1 });
        if (result1 && result1.length > 0) {
          res.status(200).send({
            auth: true,
            status: 1,
            netInward: result[0].totalInward,
            netInwardPrice:
              result[0] && (result[0].totalInward * 5817)?.toFixed(2),
            netPurchaseQuantity:
              result1[0] && result1[0]?.totalQuantity?.toFixed(2),
            netPurchasePrice: result1[0] && result1[0]?.totalPrice?.toFixed(2),
          });
        }
      });
    } else {
      return res
        .status(500)
        .send({ status: 2, message: "Sorry, Something went wrong." });
    }
  });
});

router.get("/cumulativeRate", verifyToken, function (req, res) {
  const sql = `SELECT SUM(price) AS total_price , SUM(quantity) AS total_quantity FROM purchase`;
  db.query(sql, (err, result) => {
    if (err) return res.status(500).send({ status: false, message: err });
    return res.send({ status: false, result: result });
  });
});

module.exports = router;
