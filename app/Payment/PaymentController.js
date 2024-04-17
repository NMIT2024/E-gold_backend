const express = require("express");
const Razorpay = require("razorpay");
const router = express.Router();
const config = require("../../config"); // get config file
const db = require(__root + "db");
const crypto = require("crypto");
const moment = require("moment");
const { getCurrentDateTime, auditLogs } = require("../../Common");

const razorpay = new Razorpay({
  key_id: config.key_id,
  key_secret: config.key_secret,
});

router.route("/order").post(function (req, res) {
  var options = {
    amount: req.body.amount,
    currency: "INR",
    receipt: "order_rcptid_11",
    payment_capture: 1,
  };
  razorpay.orders.create(options, function (err, order) {
    if (err) {
      return res.send(err);
    } else {
      return res.json(order);
    }
  });
});

router.route("/payment").post(function (req, res) {
  const generated_signature = crypto.createHmac("sha256", config.key_secret);
  const {
    razorpay_order_id,
    transactionid,
    razorpay_signature,
    quantity,
    transactionamount,
    userId,
    price_per_quantity,
  } = req.body;
  generated_signature.update(razorpay_order_id + "|" + transactionid);

  if (generated_signature.digest("hex") === razorpay_signature) {
    let current = new Date();
    let cDate =
      current.getFullYear() +
      "-" +
      (current.getMonth() + 1) +
      "-" +
      current.getDate();
    let dateTime = getCurrentDateTime();
    let sql2 = "";

    // First entry to the inward
    const sqlRowCheck = `SELECT COUNT(*) AS row_count FROM inward`;
    db.query(sqlRowCheck, (err, results) => {
      if (err)
        return res.status(500).send({ status: false, message: err.message });

      if (results[0].row_count === 0) {
        // Insert in to inward to store the history
        const sqlOne = `INSERT INTO inward (openPosition, netPosition, createdOn, createdAt )
        VALUES ('${quantity}', '${quantity}', '${dateTime}', '${cDate}')`;
        auditLogs(userId, "inward", "inward new entry");
        db.query(sqlOne, (err, result) => {
          if (err)
            return res
              .status(500)
              .send({ status: false, message: err.message });
        });
      } else if (results[0].row_count > 0) {
        //get the last NP
        const sqlCheck = `SELECT * FROM inward ORDER BY id DESC LIMIT 1`;
        db.query(sqlCheck, (err, rowData) => {
          if (err)
            return res
              .status(500)
              .send({ status: false, message: err.message });
          if (rowData && rowData.length > 0) {
            let currentPosition = rowData[0].netPosition;
            let newOpenPosition =
              parseFloat(quantity) + parseFloat(currentPosition);
            // Check if entry is there for same date or not
            const sqlRowCheck = `SELECT * FROM inward WHERE createdAt = "${cDate}"`;
            db.query(sqlRowCheck, (err, results) => {
              // purchase date row exists in inwards table
              if (results && results.length > 0) {
                // Update inward NP - NetPosition
                const sqlOne = `UPDATE inward SET openPosition = '${newOpenPosition}',  netPosition = '${newOpenPosition}' WHERE createdAt = "${cDate}"`;
                auditLogs(userId, "inward", "inward update");

                db.query(sqlOne, (err, result) => {
                  if (err)
                    return res
                      .status(500)
                      .send({ status: false, message: err.message });
                });
              } else {
                // Insert inward OP and NP
                const sqlOne = `INSERT INTO inward (openPosition, netPosition, createdOn, createdAt) VALUES ('${newOpenPosition}', '${newOpenPosition}', '${dateTime}', '${cDate}')`;
                db.query(sqlOne, (err, result) => {
                  if (err)
                    return res
                      .status(500)
                      .send({ status: false, message: err.message });
                });
              }
            });
          }
        });
      }
    });

    const todate = moment(new Date()).format("YYYY-MM-DD");
    const sql = `INSERT INTO purchase (transId, quantity, price, price_per_quantity, userId, createdOn, createdAt)
      VALUES ("${transactionid}", "${quantity}", "${transactionamount}", "${price_per_quantity}", "${userId}", "${dateTime}", "${todate}")`;
    auditLogs(userId, "purchase", "New purchase");
    db.query(sql, (err, result1) => {
      if (err)
        return res.status(500).send({ status: false, message: err.message });

      // updte user wallet if already exists
      const sql1 = `SELECT * FROM wallet WHERE userId="${userId}"`;
      db.query(sql1, (err, result) => {
        if (err)
          return res.status(500).send({ status: false, message: err.message });

        if (result && result.length > 0) {
          auditLogs(userId, "wallet", "Update wallet");
          sql2 = `UPDATE wallet SET quantity = quantity + ${quantity} WHERE userId="${userId}"`;
        } else if (result && result.length == 0) {
          auditLogs(userId, "wallet", "New wallet");
          sql2 = `INSERT INTO wallet (userId, quantity, createdOn)
          VALUES ("${userId}", "${quantity}", "${dateTime}")`;
        }

        db.query(sql2, (err, result2) => {
          if (err)
            return res
              .status(500)
              .send({ status: false, message: err.message });
          res.send({
            transactionId: transactionid,
            message: "Success",
            status: 1,
          });
        });
      });
    });
  } else {
    return res.send("Failed");
  }
});

module.exports = router;
