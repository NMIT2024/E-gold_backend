const express = require("express");
const router = express.Router();
const db = require(__root + "db");
const jwt = require("jsonwebtoken"); // used to create, sign, and verify tokens
const config = require("../../config");
const verifyToken = require("../../VerifyToken.js");

router.get("/userInfo", verifyToken, (req, res) => {
  const { userId } = req;
  const menuItem = [];

  const sql = `SELECT * FROM users WHERE id='${userId}'`;
  db.query(sql, (err, result) => {
    if (err)
      return res
        .status(500)
        .send({ auth: false, message: err.message, status: 0 });
    if (!result || result.length <= 0) {
      return res
        .status(404)
        .send({ auth: false, message: "Invalid user", status: 0 });
    } else if (result && result.length > 0) {
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
          res
            .status(200)
            .send({ auth: true, user: result, menus: menuItem });
        });
      });
    }
  });
});

router.post("/kyc", function (req, res) {
  //api/user/kyc
  const {} = req.body;
  const sql = `INSERT INTO userDetails (id, userid, aadhar, pan_no, dob, maritalstatus, gender, nationality, address1, address2, loction, city, state, pincode )VALUES ('1', '1', 'xyz', 'xyz', 'xyz', 'xyz', 'xyz', 'xyz', 'xyz', 'xyz', 'xyz', 'xyz', 'xyz', 'xyz')`;
  db.query(sql, function (err, result) {
    if (err) return res.status(500).send({ auth: false, message: err });
    if (result) {
      res.status(200).send({ auth: true, user: "Added successfully" });
    } else {
      return res
        .status(404)
        .send({ auth: false, message: "Sorry, Something went wrong." });
    }
  });
});

router.get("/", function (req, res) {
  res.status(500).send({ auth: false, message: "Error" });
});

module.exports = router;
