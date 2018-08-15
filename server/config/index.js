const path = require('path');
const _ = require('lodash');

/**
 * Configuration settings for DB and application
 */
const all = {
  secrets: {
    session: 'sample-secret'
  },
  mongo: {
    connection: {
      useMongoClient: true,
      uri: 'mongodb://localpuppy:tig0Bidd35@ds119692.mlab.com:19692/schoolview'
    },
    options: {
      db: {
        safe: true
      }
    },
    seed: false
  },
  userRoles: ['guest', 'user', 'admin'],
};

module.exports = _.merge(
  all
);
