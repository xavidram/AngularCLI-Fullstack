const errors = require('../components/errors');
const path = require('path');

module.exports = function routes(app, root) {
  // Add your custom routes here
  app.use('/api/users', require('./users'));

  // Catching paths that are invalid and redirectin to 404 error
  app.route('/:url(api|auth|component|app|assets)/*').get(errors[404]);

  // All Other routes get redirected to the index if they not under /api
  app.route('/*').get((req, res) => {
    res.sendFile(path.join(root, 'dist/index.html'));
  });
};
