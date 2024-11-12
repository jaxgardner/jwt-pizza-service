const express = require('express');
const { createAuthRouter, setAuthUser } = require('./routes/authRouter.js');
const { createOrderRouter } = require('./routes/orderRouter.js');
const { createFranchiseRouter } = require('./routes/franchiseRouter.js');
const version = require('./version.json');
const {DB} = require('./database/database.js'); // Import the DB class
const  metrics = require('./metrics'); // Import the Metrics class

async function createApp(config) {
  const app = express();
  const db = new DB(config, metrics); // Create an instance of DB with the configuration
  await db.initialized
  app.use(express.json());
  app.use((req, res, next) => setAuthUser(db, req, res, next)); 
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    next();
  });

  app.use((req, res, next) => metrics.collectRequest(req, res, next)); 

  const apiRouter = express.Router();
  app.use('/api', apiRouter);

  const { authRouter } = createAuthRouter(db, metrics);
  const { orderRouter } = createOrderRouter(db, authRouter, config, metrics);
  const { franchiseRouter } = createFranchiseRouter(db, authRouter);

  apiRouter.use('/auth', (req, res, next) => {
    req.db = db;
    next();
  }, authRouter);

  apiRouter.use('/order', (req, res, next) => {
    req.db = db;
    next();
  }, orderRouter);

  apiRouter.use('/franchise', (req, res, next) => {
    req.db = db;
    next();
  }, franchiseRouter);

  apiRouter.use('/docs', (req, res) => {
    res.json({
      version: version.version,
      endpoints: [...authRouter.endpoints, ...orderRouter.endpoints, ...franchiseRouter.endpoints],
      config: { factory: config.factory.url, db: config.db.connection.host },
    });
  });

  app.get('/', (req, res) => {
    res.json({
      message: 'welcome to JWT Pizza',
    });
  });

  return app;
}

module.exports = createApp;
