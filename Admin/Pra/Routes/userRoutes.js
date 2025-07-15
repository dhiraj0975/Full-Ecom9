const express = require('express');
const userRoute = express.Router();
const userController = require('../controllers/userController');
const isAdmin = require('../middleware/isAdmin');

// Debug route to check database structure
userRoute.get('/debug', userController.debugTables);

userRoute.get('/', userController.getAllUsers);
userRoute.post('/', userController.createUser);
userRoute.get('/:id', userController.getUserById);
userRoute.put('/:id',  userController.updateUser);
userRoute.delete('/:id',  userController.deleteUser);

// Route to update user status
userRoute.patch('/:id/status', userController.updateUserStatus);

module.exports = userRoute;

