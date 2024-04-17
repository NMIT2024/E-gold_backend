const express = require('express');
const router = express.Router();
const db = require(__root + 'db');

router.post('/', function (req, res) {
    const {userId, lat, long, history, ip_address, imei_no} = req.body
    const sql = `INSERT INTO historyDetails ( userid, lat, long, date_time, history, ip_address, imei_no )VALUES (${userId}, 0, 0, '', ${history}, ${ip_address}, ${imei_no})`;
    db.query(sql, function (err, result) {
        if (err) return res.status(500).send({ auth: false, message: err });
        if (result) {
            res.status(200).send({ auth: true, user: "Added successfully" });
        }else{
            return res.status(404).send({ auth: false, message: 'Sorry, Something went wrong.' });
        }
    });
});

router.get('/', function (req, res) {
    res.status(500).send({ auth: false, message: 'Error' });
});

module.exports = router;