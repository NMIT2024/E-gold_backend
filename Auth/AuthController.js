const express = require("express");
const router = express.Router();
const db = require(__root + "db");
const jwt = require("jsonwebtoken"); // used to create, sign, and verify tokens
const config = require("../config"); // get config file
const request = require("request");
const moment = require("moment");
const { getCurrentDateTime, auditLogs } = require("../Common");

router.post("/login", (req, res) => {
  const { phoneNumber, otp } = req.body;
  const menuItem = [];
  let sql = {};

  if (!phoneNumber) {
    sql = `SELECT * FROM users WHERE email='${email}' and password = '${password}'`;
  } else {
    sql = `SELECT * FROM users WHERE phone='${phoneNumber}' and status=1`;
  }

  // const otpCheck = `SELECT * FROM otp_history WHERE phone='${phoneNumber}' AND otp='${otp}' AND created_at >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)`;

  // db.query(otpCheck, (err1, result1) => {
  //   if (err1)
  //     return res
  //       .status(500)
  //       .send({ auth: false, status: "error", message: err1, status: 0 });
  // if (result1 && result1.length > 0) {
  db.query(sql, (err, result) => {
    if (err)
      return res
        .status(500)
        .send({ auth: false, status: "error", message: err, status: 0 });
    if (!result || result.length === 0)
      return res.status(404).send({
        auth: false,
        message: "User not found. Please sign up.",
        status: 0,
      });
    if (!result[0].role)
      return res.status(404).send({
        auth: false,
        message: "Please wait for Admin approval.",
        status: 0,
      });

    let sql1 = `SELECT * FROM permission WHERE roleId='${result[0].role}'`;
    db.query(sql1, (err1, result1) => {
      let sql2 = `SELECT * FROM menus WHERE id IN (${result1[0].menuId})`;
      db.query(sql2, (err2, result2) => {
        for (let index = 0; index < result2.length; index++) {
          let submenus = [];
          if (result2[index].title === "Treasurer") {
            submenus = [
              {
                name: "Open Position",
                to: "/e-gold/treasurer",
              },
              {
                name: "Inward Form",
                to: "/e-gold/inward-form",
              },
              {
                name: "Report",
                to: "/e-gold/treasurer-report",
              },
            ];
          }
          menuItem.push({
            name: result2[index].title,
            to: result2[index].url || "/dashboard",
            icon: result2[index].icon || "cilPencil",
            ...(submenus && submenus.length > 0 ? { items: submenus } : {}),
          });
        }
        const token = jwt.sign({ id: result[0].id }, config.secret, {
          expiresIn: 345600, // expires in 24 hours
        });
        auditLogs(result[0].id, "login", "login success");
        res.status(200).send({
          auth: true,
          token: token,
          user: result,
          menus: menuItem,
          status: 1,
        });
      });
    });
  });
  //   } else {
  //     res.send({ message: "Invalid OTP entered", status: 0 });
  //   }
  // });
});

router.post("/validateOTP", (req, res) => {
  const { phone, otp } = req.body;
  const sql = `SELECT * FROM otp_history WHERE phone='${phone}' AND otp='${otp}' AND created_at >= DATE_SUB(NOW(), INTERVAL 3 MINUTE)`;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).send({ message: err.message, status: 0 });
    if (!result || result.length <= 0) {
      return res
        .status(404)
        .send({ message: "Invalid OTP entered", status: 0 });
    } else if (result && result.length > 0) {
      const sq11 = `DELETE FROM otp_history WHERE phone='${phone}'`;
      db.query(sq11, (err1, result1) => {
        if (err1)
          return res.status(500).send({ message: err1.message, status: 0 });
        res.send({ message: "OTP validated successfully", status: 1 });
      });
    }
  });
});

router.post("/validatePhone", (req, res) => {
  const { phone } = req.body;
  const sql = `SELECT * FROM users WHERE phone='${phone}'`;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).send({ message: err.message, status: 0 });
    if (!result || result.length <= 0) {
      return res.status(200).send({ message: "Invalid Phone", status: 0 });
    } else if (result && result.length > 0) {
      res.send({ message: "Success", status: 1 });
    }
  });
});

router.post("/generateOTP", (req, res) => {
  const { phone } = req.body;
  const OTPnumber = Math.floor(1000 + Math.random() * 9000);

  let from = "FinMet";
  let to = phone;
  let message = `Hi from FinMetGold! Your OTP is ${OTPnumber} Thank you for visiting www.finmetgold.com`;

  const options = {
    url: `https://${config.sms_API_key}:${config.sms_API_token}${config.sms_subdomain}/v1/Accounts/${config.sms_sid}/Sms/send?From=${from}&To=${to}&Body=${message}`,
    method: "POST",
  };

  const currentDateTime = getCurrentDateTime();

  request(options, (error, response, body) => {
    if (!error && response.statusCode == 200) {
      // if (true) {
      const sqlCheck = `SELECT * FROM otp_history WHERE phone = "${phone}"`;
      db.query(sqlCheck, (err, rows) => {
        if (err)
          return res.status(500).send({ status: 0, message: err.message });

        if (rows.length > 0) {
          // Phone number already exists, update OTP
          const updateSql = `UPDATE otp_history SET otp = "${OTPnumber}", created_at = "${currentDateTime}" WHERE phone = "${phone}"`;
          db.query(updateSql, (err, result) => {
            if (err)
              return res.status(500).send({ status: 0, message: err.message });
            res.send({ message: "OTP updated successfully", status: 1 });
          });
        } else {
          // Phone number doesn't exist, insert new OTP
          const insertSql = `INSERT INTO otp_history (phone, otp, created_at) VALUES ("${phone}", "${OTPnumber}", "${currentDateTime}")`;
          db.query(insertSql, (err, result) => {
            if (err)
              return res
                .status(500)
                .send({ auth: false, message: err.message });
            res.send({ message: "OTP sent successfully", status: 1 });
          });
        }
      });
    } else {
      res.send({ message: "Failed to send OTP", status: 0 });
    }
  });
});

router.post("/register", (req, res) => {
  const { firstName, lastName, phone } = req.body;
  const todate = moment(new Date()).format("YYYY-MM-DD");
  const sql = `INSERT INTO users (name, email, username, role, phone, password, createdAt, status)
      VALUES ("${firstName}", "${lastName}", "${firstName}", "${2}", "${phone}", "123", "${todate}", 1)`;

  db.query(sql, (err, result) => {
    if (err && err.code === "ER_DUP_ENTRY") {
      return res.status(501).send({
        auth: false,
        status: 2,
        message: "Phone Number already exists",
      });
    }
    if (err)
      return res
        .status(500)
        .send({ auth: false, message: err.message, status: 0 });
    // Create a token
    const token = jwt.sign({ id: result.insertId }, config.secret, {
      expiresIn: 86400, // expires in 24 hours
    });
    auditLogs(result.insertId, "register", "registration success");
    res.status(200).send({ auth: true, token: token, status: 1 });
  });
});

module.exports = router;
