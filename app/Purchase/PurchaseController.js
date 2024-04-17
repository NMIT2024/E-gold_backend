const express = require("express");
const router = express.Router();
const db = require(__root + "db");
const verifyToken = require("../../VerifyToken.js");

router.get("/", verifyToken, (req, res) => {
  const { userId } = req;
  const sql = `SELECT purchase.*, wallet.quantity as totalquantity FROM purchase JOIN wallet ON purchase.userId = wallet.userId WHERE purchase.userId = ${userId} ORDER BY purchase.createdOn DESC`;
  db.query(sql, (err, result) => {
    if (err)
      return res.status(500).send({ status: false, message: err.message });
    res.status(200).send({ status: true, result: result });
  });
});

module.exports = router;
