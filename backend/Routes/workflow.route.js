const express = require('express');
const router = express.Router();
const { workFlowContentGenFn, alertGenFn } = require("../Controller/workflow.controller");
const { authenticateToken } = require('../Middlewares/auth.middleware');

router.get("/generate-workflow-content",authenticateToken ,workFlowContentGenFn);
router.get("/alert", authenticateToken, alertGenFn);


module.exports = router;