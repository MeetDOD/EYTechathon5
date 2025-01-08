const express = require('express');
const router = express.Router();
const { workFlowContentGenFn } = require("../Controller/workflow.controller");
const { authenticateToken } = require('../Middlewares/auth.middleware');

router.get("/generate-workflow-content",authenticateToken ,workFlowContentGenFn);


module.exports = router;