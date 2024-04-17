const express = require('express');
const router = express.Router();
const db = require(__root + 'db');

router.post('/', function (req, res) { //api/jeweller
    const {title} = req.body
    const sql = `INSERT INTO jeweller (title, status )VALUES ('${title}', '1')`;
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
    const sql = `SELECT * FROM jeweller`;
    db.query(sql, function (err, result) {
        if (err) return res.status(500).send({ auth: false, message: err });
        if (result) {
            res.status(200).send({ auth: true, data: result });
        }else{
            return res.status(404).send({ auth: false, message: 'Sorry, Something went wrong.' });
        }
    });
});

module.exports = router;