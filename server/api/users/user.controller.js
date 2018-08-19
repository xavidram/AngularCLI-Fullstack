'use strict';
const User = require('./user.model');
const jwt = require('jsonwebtoken');
const config = require('../../config');

function validationError(res, statusCode) {
  statusCode = statusCode || 422;
  return function (err) {
    return res.status(statusCode).json(err);
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function (err) {
    return res.status(statusCode).send(err);
  };
}

function index(req, res) {
  return User.find({}, '-salt -password')
    .exec()
    .then(users => {
      res.status(200).json(users);
    })
    .catch(handleError(res));
}

function show(req, res, next) {
  User.find({
    email: req.params.id
  }, (err, usr) => {
    if (err) {
      res.send(err);
    }
    res.json(usr);
  }).catch(err => next(err));
}

function create(req, res) {
  let newUser = new User(req.body);
  newUser.role = 'user';
  return newUser.save().then(function(user) {
    console.log(user);
    const token = jwt.sign({ _id: user._id }, config.secrets.session, {
      expiresIn: 60 * 60 * 5
    });
    res.json({ token });
  }).catch(validationError(res));
}

function authCallback(req, res) {
  res.redirect('/');
}

module.exports = { index, show, create, authCallback };
