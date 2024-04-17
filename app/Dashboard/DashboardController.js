const express = require("express");
const verifyToken = require("../../VerifyToken.js");
const router = express.Router();
const db = require(__root + "db");

router.get("/", verifyToken, async (req, res) => {
  let current = new Date();
  let cDate =
    current.getFullYear() +
    "-" +
    (current.getMonth() + 1) +
    "-" +
    current.getDate();
  let dateTime = cDate;

  const sql = `SELECT quantity, createdAt FROM purchase WHERE YEAR(createdAt) = YEAR('${dateTime}') AND WEEK(createdAt) = WEEK('${dateTime}')`;
  const sql1 = `SELECT COUNT(*) AS count, createdAt FROM coupons WHERE YEAR(createdAt) = YEAR('${dateTime}') AND WEEK(createdAt) = WEEK('${dateTime}') GROUP BY createdAt`;
  const sql2 = `SELECT COUNT(*) AS count, createdAt FROM users WHERE YEAR(createdAt) = YEAR('${dateTime}') AND WEEK(createdAt) = WEEK('${dateTime}') AND role != 1 GROUP BY createdAt`;
  const sql3 = `SELECT COUNT(*) AS count, createdAt FROM purchase WHERE YEAR(createdAt) = YEAR('${dateTime}') AND WEEK(createdAt) = WEEK('${dateTime}') GROUP BY createdAt`;
  const sql4 = `SELECT MONTH(createdAt) AS month, FORMAT(SUM(price), 2) AS total_purchase_amount FROM purchase GROUP BY YEAR(createdAt), MONTH(createdAt) ORDER BY YEAR(createdAt), MONTH(createdAt)`;
  const sql5 = `SELECT MONTH(createdAt) AS month, FORMAT(SUM(weight), 2) AS total_quantity FROM coupons GROUP BY YEAR(createdAt), MONTH(createdAt) ORDER BY YEAR(createdAt), MONTH(createdAt)`;
  const sql6 = `SELECT MONTH(createdAt) AS month, COUNT(*) AS total_count FROM users GROUP BY YEAR(createdAt), MONTH(createdAt) ORDER BY YEAR(createdAt), MONTH(createdAt)`;
  const sql7 = `SELECT MONTH(createdAt) AS month, FORMAT(SUM(quantity), 2) AS total_quantity FROM purchase GROUP BY YEAR(createdAt), MONTH(createdAt) ORDER BY YEAR(createdAt), MONTH(createdAt)`;

  db.query(sql, (err, result) => {
    if (err)
      return res.status(500).send({ status: false, message: err.message });

    db.query(sql1, (err1, result1) => {
      if (err1)
        return res.status(500).send({ status: false, message: err1.message });

      db.query(sql2, (err2, result2) => {
        if (err1)
          return res.status(500).send({ status: false, message: err2.message });

        db.query(sql3, (err3, result3) => {
          if (err1)
            return res
              .status(500)
              .send({ status: false, message: err3.message });

          db.query(sql4, (err, result4) => {
            if (err)
              return res
                .status(500)
                .send({ status: false, message: err.message });

            db.query(sql5, (err, result5) => {
              if (err)
                return res
                  .status(500)
                  .send({ status: false, message: err.message });

              db.query(sql6, (err, result6) => {
                if (err)
                  return res
                    .status(500)
                    .send({ status: false, message: err.message });

                db.query(sql7, (err, result7) => {
                  if (err)
                    return res
                      .status(500)
                      .send({ status: false, message: err.message });

                  res.status(200).send({
                    status: true,
                    weeklySalesCount: result3,
                    weeklyCoupon: result1,
                    weeklyWallet: result2,
                    weeklyPurchase: result,
                    monthlyPurchase: result4,
                    monthlyRedemption: result5,
                    monthlyWallet: result6,
                    monthlyQuantity: result7,
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});

module.exports = router;
