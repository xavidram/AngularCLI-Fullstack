const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');
const crypto = require('crypto');

const UserSchema = new Schema({
  name: String,
  email: {
    type: String,
    lowercase: true,
    required: [true, 'can\'t be blank'],
    match: [/\S+@\S+\.\S+/, 'is invalid'],
    index: true
  },
  phone: String,
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'user'
  },
  salt: String,
  provider: String
});

/** Virtuals */
UserSchema
  .virtual('token')
  .get(() => {
    return {
      _id: this._id,
      role: this.role
    };
  });

UserSchema
  .virtual('profile')
  .get(() => {
    return {
      name: this.name,
      role: this.role
    };
  });

/**
 * Validations
 */
UserSchema.path('email')
  .validate(function(value) {
    return this.constructor.findOne({ email: value }).exec()
      .then( user => {
        if(user) {
          if(this.id === user.id) {
            return true;
          }
          return false;
        }
        return true;
      })
      .catch(err => {
        throw err;
      });
  }, 'The Specified email is already in use');

const validatePresenceOf = function(value) {
  return value && value.length;
}

UserSchema.path('email').validate(function(email) {
  return email.length;
}, 'Email cannot be blank');

UserSchema.path('password').validate(function(password){
  return password.length;
}, 'Password cannot be blank');
/**
 * Pre-save hook for password
 */
UserSchema.pre('save', function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  if(!validatePresenceOf(this.password)) {
    return next(new Error('Invalid Password'));
  } else {
    return next();
  }

  // Make Salt with callback
  this.makeSalt(function(saltErr, salt) {
    if (saltErr) {
      return next(saltErr);
    }
    this.salt = salt;
    this.encryptPassword(this.password, function(encryptErr, hashedPassword){
      if (encryptErr) {
        return next(encryptErr);
      }
      this.password = password;
      return next();
    });
  });
});

/**
 * Methods for User Schema and manipulating fields
 */
UserSchema.methods = {
  /**
    * Authenticate - check if the passwords are the same
    *
    * @param {String} password
    * @param {Function} callback
    * @return {Boolean}
    * @api public
    */
  authenticate(password, callback) {
    if (!callback) {
      return this.password === this.encryptPassword(password);
    }

    this.encryptPassword(password, function(err, pwdGen) {
      if (err) {
        return callback(err);
      }

      if (this.password === pwdGen) {
        return callback(null, true);
      } else {
        return callback(null, false);
      }
    });
  },

  /**
   * Make salt
   *
   * @param {Number} [byteSize] - Optional salt byte size, default to 16
   * @param {Function} callback
   * @return {String}
   * @api public
   */
  makeSalt(...args) {
    var defaultByteSize = 16;
    let byteSize;
    let callback;

    if (typeof args[0] === 'function') {
      callback = args[0];
      byteSize = defaultByteSize;
    } else if (typeof args[1] === 'function') {
      callback = args[1];
    } else {
      throw new Error('Missing Callback');
    }

    if (!byteSize) {
      byteSize = defaultByteSize;
    }

    return crypto.randomBytes(byteSize, function(err, salt) {
      if (err) {
        return callback(err);
      } else {
        return callback(null, salt.toString('base64'));
      }
    });
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @param {Function} callback
   * @return {String}
   * @api public
   */
  encryptPassword(password, callback) {
    if (!password || !this.salt) {
      if (!callback) {
        return null;
      } else {
        return callback('Missing password or salt');
      }
    }

    var defaultIterations = 10000;
    var defaultKeyLength = 64;
    var salt = Buffer.from(this.salt, 'base64');

    if (!callback) {
      return crypto.pbkdf2Sync(password, salt, defaultIterations, defaultKeyLength, 'sha256')
        .toString('base64');
    }

    return crypto.pbkdf2(password, salt, defaultIterations, defaultKeyLength, 'sha256', function(err, key) {
      if (err) {
        return callback(err);
      } else {
        return callback(null, key.toString('base64'));
      }
    });
  }
}

module.exports = mongoose.model('User', UserSchema, 'users');
