const express = require('express');
const router = express.Router();
const db = require(__root + 'db');

router.post('/', function (req, res) {
    const { clientId, inputList } = req.body
    const selectSql = `SELECT * FROM master where clientId=${clientId}`;

    db.query(selectSql, function (err, result) {
        if (err) return res.status(500).send({ message: false, message: err });
        if (result) {
            let dbQuery = ''
            if (result.length > 0) {
                let prevData = JSON.parse(result[0].fieldData)
                let newData = inputList.concat(prevData)
                dbQuery = `UPDATE master SET fieldData = '${JSON.stringify(newData)}' WHERE clientId = ${clientId}`;
            } else {
                dbQuery = `INSERT INTO master (clientId, fieldData) VALUES (${clientId}, '${JSON.stringify(inputList)}')`;
            }
            db.query(dbQuery, function (err, response) {
                if (err) return res.status(500).send({ auth: false, message: err });
                if (response) {
                    res.status(200).send({ res: true, message: "Added successfully" });
                } else {
                    return res.status(404).send({ res: false, message: 'Sorry, Something went wrong.' });
                }
            });
        } else {
            return res.status(404).send({ res: false, message: 'Sorry, Something went wrong.' });
        }
    });


});

// Get client fields
router.get('/:id', function (req, res) {
    const sql = `SELECT * FROM master where clientId=${req.params.id} limit 1`;
    db.query(sql, function (err, result) {
        if (err) return res.status(500).send({ message: false, message: err });
        if (result) {
            res.status(200).send({ message: true, data: result });
        } else {
            return res.status(404).send({ message: false, message: 'Sorry, Something went wrong.' });
        }
    });
});

module.exports = router;