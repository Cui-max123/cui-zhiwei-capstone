const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const signToken = require('../utils/signToken');

function publicUser(user) {
  return {
    _id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt
  };
}

exports.register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  const existing = await User.findOne({ $or: [{ email }, { username }] }).select('email username');
  if (existing) {
    const field = existing.email === email ? 'email' : 'username';
    throw new ApiError(409, field === 'email' ? 'An account with that email already exists.' : 'That username is already taken.', {
      [field]: field === 'email' ? 'Email already registered' : 'Username already taken'
    });
  }

  const user = await User.create({ username, email, password });
  res.status(201).json({
    success: true,
    message: 'Account created.',
    data: { token: signToken(user), user: publicUser(user) }
  });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');

  // The same message for an unknown email and a wrong password avoids account
  // enumeration.
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Email or password is incorrect.');
  }

  res.set('Cache-Control', 'no-store').json({
    success: true,
    message: 'Signed in.',
    data: { token: signToken(user), user: publicUser(user) }
  });
});

exports.me = asyncHandler(async (req, res) => {
  res.set('Cache-Control', 'no-store').json({
    success: true,
    data: publicUser(req.user)
  });
});
