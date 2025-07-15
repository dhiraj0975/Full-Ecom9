const express = require('express');
const retailerRoutes = express.Router();
const retailerController = require('../controllers/retailerController');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

retailerRoutes.get('/with-product-count', auth, isAdmin, retailerController.getAllRetailersWithProductCount);

retailerRoutes.get('/',auth,isAdmin, retailerController.getAllRetailers);
retailerRoutes.get('/:id',auth,isAdmin, retailerController.getRetailer);
retailerRoutes.post('/',auth,isAdmin, retailerController.createRetailer);
retailerRoutes.put('/:id',auth,isAdmin, retailerController.updateRetailer);
retailerRoutes.delete('/:id', auth,isAdmin, retailerController.deleteRetailer);


module.exports = retailerRoutes;