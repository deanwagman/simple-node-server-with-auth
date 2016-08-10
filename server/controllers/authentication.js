const User = require('../models/user');
const jwt = require('jwt-simple');
const config = require('../config');

function tokenForUser(user) {
  const timestamp = new Date().getTime();
  return jwt.encode({ sub: user.id, iat: timestamp }, config.secret);
}

exports.signup = function(req, res, next) {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(422).send({ error: "You must provide an email and a password"});
  }

  // See if User exists
  User.findOne({ email: email }, function(err, existingUser) {
    if (err) { return next(err); }

    // If user exists
    if (existingUser) {
      return res.status(422).send({ error: "Email is in use"});
    }

    // Create
    const user = new User({
      email: email,
      password: password
    });

    // Save
    user.save(function(err) {
      if (err) return next(err);

      // Respond to request the user was created
      return res.json({ token: tokenForUser(user) });
    });

  });
};

exports.signin = function(req, res, next) {
  res.send({ token: tokenForUser(req.user) });
};
