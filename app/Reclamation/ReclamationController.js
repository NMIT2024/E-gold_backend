const express = require("express");
const { auditLogs } = require("../../Common");
const router = express.Router();
const db = require(__root + "db");

//fetch coupon
router.get("/:userid", function (req, res) {
  const id = req.params.userid;
  let sql = "";
  if (id == 1) {
    //Admin
    sql = `SELECT coupons.id, coupons.userId, coupons.weight, coupons.coupon, coupons.createdOn, coupons.createdAt, ROUND(coupons.price, 2) as price, coupons.status, users.name,users.phone FROM coupons JOIN users ON users.id=coupons.userId`;
  } else {
    sql = `SELECT id, userId, weight, coupon, createdOn, createdAt, ROUND(price, 2) as price, status FROM coupons WHERE userId='${id}' ORDER BY createdOn DESC`;
  }

  db.query(sql, function (err, result) {
    if (err) return res.status(500).send({ auth: false, message: err });
    if (result) {
      res.status(200).send({ auth: true, data: result });
    } else {
      return res
        .status(404)
        .send({ auth: false, message: "Sorry, Something went wrong." });
    }
  });
});

// coupon status update
//status 1 > active
//status 0 > Used
router.get("/status/:id", function (req, res) {
  const id = req.params.id;
  const sql = `UPDATE coupons SET status=0 WHERE id='${id}'`;
  auditLogs(id, "coupons", "Update coupons");

  db.query(sql, function (err, result) {
    if (err) return res.status(500).send({ auth: false, message: err });
    if (result) {
      res
        .status(200)
        .send({
          auth: true,
          status: 1,
          message: "Status Updated successfully",
        });
    } else {
      return res
        .status(404)
        .send({
          auth: false,
          status: 0,
          message: "Sorry, Something went wrong.",
        });
    }
  });
});

module.exports = router;
