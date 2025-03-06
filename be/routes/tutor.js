const express = require('express');
const router = express.Router();
const { createAccount, login, getTutor } = require("../controllers/tutorController");

router.post('/create-account', createAccount);


router.get("/",getTutor);

router.post('/login', login );

module.exports = router;
