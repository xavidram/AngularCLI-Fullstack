const express = require('express');
const path = require('path');
const http = require('http');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const connectMongo = require('connect-mongo');
const session = require('express-session');
const config = require('./server/config');
const MongoStore = connectMongo(session);

const mongooseConnectionPromise = mongoose.connect(config.mongo.connection.uri, { useNewUrlParser: true });
mongoose.connection.on('error', (err) => {
  console.error('MongoDB Connection Error: ' + err);
  process.exit(-1); // eslint-disable-line no-process-exit
});

// Get our API Routes from routes.js
const routes = require('./server/routes');

// Assign express variable
const app = express();

// Parser for POST data;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Point to static path to dist
app.use(express.static(path.join(__dirname, 'public')));

// Set common routes
app.set('views', `${__dirname}/server/views`);
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// Set Up mongo connection
app.use(session({
  secret: config.secrets.session,
  saveUninitialized: true,
  resave: false,
  store: new MongoStore({
    url: config.mongo.connection.uri
  })
}));

// Add API Routes
routes(app, __dirname);

// Get port from environment and store in Express
const port = process.env.PORT || '3000';
app.set('port', port);

// CREATE HTTP SERVER
const server = http.createServer(app);

// LISTEN ON PORT
server.listen(port, () => console.log(`API RUNNING ON LOCALHOST: ${port}`));
