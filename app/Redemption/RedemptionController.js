const express = require("express");
const router = express.Router();
const db = require(__root + "db");
const moment = require("moment");
const { getCurrentDateTime, auditLogs } = require("../../Common");
const verifyToken = require("../../VerifyToken.js");

// router.post("/validateUser", verifyToken, function (req, res) {
//   //api/redemption/validateUser
//   // Should validate cusomer is from same jwelly trying to access the wallet
//   res.status(200).send({
//     auth: true,
//     status: 1,
//     message: "User validated and otp sent successfully",
//   });
// });

// router.post("/validateOTP", verifyToken, function (req, res) {
//   //api/redemption/validateOTP
//   const { otp } = req.body;
//   if (otp == "") {
//     res.status(200).send({
//       auth: true,
//       status: 1,
//       data: { name: "Finment", amount: 10000 },
//       message: "OTP validated successfully",
//     });
//   } else {
//     res.status(500).send({ auth: false, status: 0, message: "OTP is wrong" });
//   }
// });

router.post("/addCoupon", verifyToken, function (req, res) {
  const { jwellery, coupon, userId, weight, price } = req.body;
  let dateTime = getCurrentDateTime();

  // Need to call Validate OTP API
  const todate = moment(new Date()).format("YYYY-MM-DD");
  const sql = `INSERT INTO coupons (jeweller, coupon, weight, userId, price, createdOn, createdAt) VALUES ('${jwellery}', '${coupon}', '${weight}', '${userId}', '${price}', '${dateTime}',  "${todate}")`;
  auditLogs(userId, "coupons", "New coupons");
  db.query(sql, (err, result) => {
    if (err)
      return res.status(500).send({ auth: false, status: 0, message: err });
    if (result) {
      // Debit amount from the wallet if coupen has been generated.
      const sql2 = `UPDATE wallet SET quantity = quantity - ${weight} WHERE userId="${userId}"`;
      db.query(sql2, (err, result) => {
        res
          .status(200)
          .send({ auth: true, status: 1, message: "Added successfully" });
      });
    } else {
      return res.status(404).send({
        auth: false,
        status: 0,
        message: "Sorry, Something went wrong.",
      });
    }
  });
});

router.get("/fetchCoupon/:id", verifyToken, (req, res) => {
  const id = req.params.id;
  const sql = `SELECT * FROM coupons WHERE userId = '${id}' ORDER BY createdOn DESC`;
  db.query(sql, (err, result) => {
    if (err)
      return res.status(500).send({ status: false, message: err.message });
    res.status(200).send({ status: true, result: result });
  });
});

router.post("/paymentConfirm", verifyToken, function (req, res) {
  //api/redemption/paymentConfirm
  const { amount } = req.body;
  //If P amount is > W amount - Error
  if (amount) {
    res.status(200).send({
      auth: true,
      status: 1,
      message: "Payment completed successfully",
    });
  } else {
    res.status(500).send({ auth: false, status: 0, message: "OTP is wrong" });
  }
});

router.post("/validateRedeem", verifyToken, function (req, res) {
  const { weight, userId } = req.body;
  const sql = `SELECT SUM(quantity) AS total_quantity FROM purchase WHERE userId='${userId}' AND createdAt <= DATE_SUB(NOW(), INTERVAL 3 DAY)`;
  db.query(sql, (err, result) => {
    if (err)
      return res
        .status(500)
        .send({ status: false, isValid: false, message: err.message });
    if (result && result.length > 0) {
      const sql1 = `SELECT SUM(weight) AS total_coupon
      FROM coupons
      WHERE createdAt <= CURDATE() AND userId ='${userId}'`;
      db.query(sql1, (err1, result1) => {
        if (err1)
          return res
            .status(500)
            .send({ status: false, isValid: false, message: err.message });
        if (result) {
          let isValid =
            result[0].total_quantity - result1[0].total_coupon >= weight;
          res.status(200).send({ status: true, isValid });
        }
      });
    }
  });
});

module.exports = router;
