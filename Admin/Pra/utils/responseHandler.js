exports.sendSuccess = (res, code, data, message = "Success") =>
  res.status(code).json({ success: true, message, data });
exports.sendError = (res, code, message = "Something went wrong", error = null) =>
  res.status(code).json({ success: false, message, error });