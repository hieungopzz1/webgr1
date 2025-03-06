const express = require('express');
const jwt = require('jsonwebtoken');
const { createAccount, login, getStudent } = require("../controllers/studentController");

const router = express.Router();

router.post('/create-account', createAccount);

router.get("/", getStudent);

router.post('/login', login);

module.exports = router;
