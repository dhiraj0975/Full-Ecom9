const bcrypt = require("bcryptjs");
exports.hashPassword = async pwd => await bcrypt.hash(pwd, 10);
exports.comparePassword = async (plain, hash) => await bcrypt.compare(plain, hash);