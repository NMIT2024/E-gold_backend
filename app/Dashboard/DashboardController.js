const express = require("express");
const verifyToken = require("../../VerifyToken.js");
const router = express.Router();
const db = require(__root + "db");

router.post("/", verifyToken, async (req, res) => {
  const { input } = req.body;
  let current = new Date();
  let dateTime =
    current.getFullYear() +
    "-" +
    (current.getMonth() + 1) +
    "-" +
    current.getDate();

  let inputDate = current.getFullYear() + "-" + input + "-" + current.getDate();

  let sql, sql1, sql2, sql3, sql4, sql5, sql6, sql7;
  if (input === "all") {
    sql = `SELECT quantity, createdAt FROM purchase WHERE YEAR(createdAt) = YEAR('${dateTime}') AND WEEK(createdAt) = WEEK('${dateTime}')`;
    sql1 = `SELECT COUNT(*) AS count, createdAt FROM coupons WHERE YEAR(createdAt) = YEAR('${dateTime}') AND WEEK(createdAt) = WEEK('${dateTime}') GROUP BY createdAt`;
    sql2 = `SELECT COUNT(*) AS count, createdAt FROM users WHERE YEAR(createdAt) = YEAR('${dateTime}') AND WEEK(createdAt) = WEEK('${dateTime}') AND role != 1 GROUP BY createdAt`;
    sql3 = `SELECT COUNT(*) AS count, createdAt FROM purchase WHERE YEAR(createdAt) = YEAR('${dateTime}') AND WEEK(createdAt) = WEEK('${dateTime}') GROUP BY createdAt`;
    sql4 = `SELECT MONTH(createdAt) AS month, FORMAT(SUM(price), 2) AS total_purchase_amount FROM purchase GROUP BY YEAR(createdAt), MONTH(createdAt) ORDER BY YEAR(createdAt), MONTH(createdAt)`;
    sql5 = `SELECT MONTH(createdAt) AS month, FORMAT(SUM(weight), 2) AS total_quantity FROM coupons GROUP BY YEAR(createdAt), MONTH(createdAt) ORDER BY YEAR(createdAt), MONTH(createdAt)`;
    sql6 = `SELECT MONTH(createdAt) AS month, COUNT(*) AS total_count FROM users GROUP BY YEAR(createdAt), MONTH(createdAt) ORDER BY YEAR(createdAt), MONTH(createdAt)`;
    sql7 = `SELECT MONTH(createdAt) AS month, FORMAT(SUM(quantity), 2) AS total_quantity FROM purchase GROUP BY YEAR(createdAt), MONTH(createdAt) ORDER BY YEAR(createdAt), MONTH(createdAt)`;
  } else {
    sql = `SELECT quantity, createdAt FROM purchase WHERE YEAR(createdAt) = YEAR('${dateTime}') AND WEEK(createdAt) = WEEK('${dateTime}')`;
    sql1 = `SELECT COUNT(*) AS count, createdAt FROM coupons WHERE YEAR(createdAt) = YEAR('${dateTime}') AND WEEK(createdAt) = WEEK('${dateTime}') GROUP BY createdAt`;
    sql2 = `SELECT COUNT(*) AS count, createdAt FROM users WHERE YEAR(createdAt) = YEAR('${dateTime}') AND WEEK(createdAt) = WEEK('${dateTime}') AND role != 1 GROUP BY createdAt`;
    sql3 = `SELECT COUNT(*) AS count, createdAt FROM purchase WHERE YEAR(createdAt) = YEAR('${dateTime}') AND WEEK(createdAt) = WEEK('${dateTime}') GROUP BY createdAt`;

    // sql4 = `SELECT YEAR(createdAt) AS year, MONTH(createdAt) AS month, FLOOR((DAY(createdAt) - 1) / 7) + 1 AS week_number, AVG(price) AS weekly_price FROM purchase WHERE YEAR(createdAt) = YEAR('${inputDate}') AND MONTH(createdAt) = MONTH('${inputDate}') GROUP BY YEAR(createdAt), MONTH(createdAt), week_number ORDER BY year, month, week_number`;
    sql4 = `SELECT FLOOR((DAY(createdAt) - 1) / 7) + 1 AS month, FORMAT(SUM(price), 2) AS total_purchase_amount FROM purchase WHERE YEAR(createdAt) = YEAR('${inputDate}') AND MONTH(createdAt) = MONTH('${inputDate}') GROUP BY YEAR(createdAt), MONTH(createdAt), month ORDER BY month`;
    sql5 = `SELECT FLOOR((DAY(createdAt) - 1) / 7) + 1 AS month, FORMAT(SUM(weight), 2) AS total_quantity FROM coupons WHERE YEAR(createdAt) = YEAR('${inputDate}') AND MONTH(createdAt) = MONTH('${inputDate}') GROUP BY YEAR(createdAt), MONTH(createdAt), month ORDER BY month`;
    sql6 = `SELECT FLOOR((DAY(createdAt) - 1) / 7) + 1 AS month, COUNT(*) AS total_count FROM users WHERE YEAR(createdAt) = YEAR('${inputDate}') AND MONTH(createdAt) = MONTH('${inputDate}') GROUP BY YEAR(createdAt), MONTH(createdAt), month ORDER BY month`;
    sql7 = `SELECT FLOOR((DAY(createdAt) - 1) / 7) + 1 AS month, FORMAT(SUM(quantity), 2) AS total_quantity FROM purchase WHERE YEAR(createdAt) = YEAR('${inputDate}') AND MONTH(createdAt) = MONTH('${inputDate}') GROUP BY YEAR(createdAt), MONTH(createdAt), month ORDER BY month`;
  }

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
