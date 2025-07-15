const express = require('express');
const retailerBankController = require('../controllers/retailerBankController');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

const router = express.Router();

router.get('/',auth, isAdmin, retailerBankController.getAllRetailersWithBank);
router.post('/', auth, isAdmin, retailerBankController.createBankAccount);
router.put('/:id', auth, isAdmin, retailerBankController.updateBankAccount);
router.delete('/:id', auth, isAdmin, retailerBankController.deleteBankAccount);

module.exports = router;
