const errors = require('../components/errors');
const path = require('path');

module.exports = function routes(app, root) {
  app.use('/api/users', require('./users'));

  app.route('/:url(api|auth|component|app|assets)/*').get(errors[404]);

  app.route('/*').get((req, res) => {
    res.sendFile(path.join(root, 'dist/index.html'));
  });
};
