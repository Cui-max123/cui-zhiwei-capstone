const mongoose = require('mongoose');
const ApiError = require('../utils/ApiError');

function assertObjectId(value, label = 'ID') {
  if (!mongoose.isValidObjectId(value) || String(value).length !== 24) {
    throw new ApiError(400, `Invalid ${label}.`);
  }
  return value;
}

function objectIdParam(name = 'id', label = 'ID') {
  return function checkId(req, _res, next) {
    try {
      assertObjectId(req.params[name], label);
      next();
    } catch (error) {
      next(error);
    }
  };
}

module.exports = { assertObjectId, objectIdParam };
