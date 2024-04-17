const express = require("express");
const router = express.Router();
const db = require(__root + "db");
const jwt = require("jsonwebtoken"); // used to create, sign, and verify tokens
const bcrypt = require("bcryptjs");
const config = require("../../config"); // get config file

router.post("/setGoldrate", async (req, res) => {
  const { rate, ceilng, floor } = req.body;
  let current = new Date();
  let cDate =
    current.getFullYear() +
    "-" +
    (current.getMonth() + 1) +
    "-" +
    current.getDate();
  let dateTime = cDate;

  const sql = `UPDATE gold_rate SET rate = "${rate}", ceilng = "${ceilng}", floor = "${floor}", create_at = "${dateTime}"`;

  db.query(sql, (err, result) => {
    if (err)
      return res.status(500).send({ status: 0, message: err.message });
    res.status(200).send({ status: 1, goldrate: req.body, message: "Success" });
  });
});

router.get("/getGoldrate", async (req, res) => {
  const sql = `SELECT * FROM gold_rate`;

  db.query(sql, (err, result) => {
    if (err)
      return res.status(500).send({ status: false, message: err.message });
    res.status(200).send({ status: true, goldrate: result[0], message: "Success" });
  });
});

module.exports = router;
