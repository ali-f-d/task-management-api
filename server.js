const dotenv = require('dotenv');

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: 'sample.env' });
} else {
  dotenv.config({ path: 'production.env' });
}

const mongo = require('./mongo');
const app = require('./app');

// server initializations
const protocol = process.env.SERVER_PROTOCOL || 'http';
const hostname = process.env.SERVER_HOSTNAME || 'localhost';
const port = process.env.SERVER_PORT || 3000;

// functions
async function uncaughtException(error) {
  console.error('Uncaught Exception:', error);
  await mongo.disconnect();
  console.log('Server closed due to uncaught exception');
  process.exit(1);
}

// server function
async function server() {
  // Connect to MongoDB
  const mongoConnected = await mongo.connect();
  if (!mongoConnected) {
    mongo.disconnect();
    return;
  }

  app.listen(port, hostname, () => {
    console.log(`Server is running on ${protocol}://${hostname}:${port}`);
  });
}

// take care of closing the connection when the process ends
process.on('SIGINT', async () => {
  await mongo.disconnect();
  console.log('Server closed');
  process.exit(0);
});
process.on('uncaughtException', uncaughtException);

// Start the server
server().catch(uncaughtException);
