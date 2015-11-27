var express = require('express');
var router = express.Router();
var audit = require("../mgmt/mgmt_audit");

/*  API:
        /api/audit?offset=0
    Retrieves all audit logs.
*/
router.get('/audit', function (req, res, next) {
    var _u = req.user;
    if (req.query.offset) {
        var _org = _u.org;
        audit.get(_u.username, _org, req.query.offset, function (_e, _d) {
            if (_e) res.status(500).send("Fail!");
            res.status(200).send(_d);
        });
    } else res.sendStatus(400);
});


module.exports = router;