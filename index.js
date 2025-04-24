const dotenv = require('dotenv');

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: 'sample.env' });
} else {
  dotenv.config({ path: 'production.env' });
}

const express = require('express');
const mongo = require('./mongo');

// express initialization
const protocol = process.env.SERVER_PROTOCOL || 'http';
const hostname = process.env.SERVER_HOSTNAME || 'localhost';
const port = process.env.SERVER_PORT || 3000;
const app = express();

// functions
async function uncaughtException(error) {
  console.error('Uncaught Exception:', error);
  await mongo.disconnect();
  console.log('Server closed due to uncaught exception');
  process.exit(1);
}

// api functions
async function getAll(req, res) {
  try {
    const tasks = await mongo.getAll();
    res.json({ status: 'success', length: tasks.length, tasks });
  } catch (err) {
    res.status(500).json({ status: 'failed', message: 'Error fetching tasks' });
  }
}

async function getByName(req, res) {
  try {
    const tasks = await mongo.getByName(req.params.name);
    res.json({ status: 'success', length: tasks.length, tasks });
  } catch (err) {
    res.status(500).json({
      status: 'failed',
      message: 'Error fetching tasks',
    });
  }
}

async function createOne(req, res) {
  try {
    const task = req.body;
    const result = await mongo.createOne(task);
    res.status(201).json({ status: 'success', insertedId: result.insertedId });
  } catch (err) {
    res.status(500).json({ status: 'failed', message: 'Error inserting task' });
  }
}

async function updateOneByName(req, res) {
  try {
    const task = req.body;
    const result = await mongo.updateOneByName(req.params.name, task);
    if (result.matchedCount === 0) {
      return res.status(404).json({
        status: 'failed',
        message: 'Task not found',
      });
    }
    res.json({ status: 'success', modifiedCount: result.modifiedCount });
  } catch (err) {
    res.status(500).json({
      status: 'failed',
      message: 'Error updating task',
    });
  }
}

async function deleteOneByName(req, res) {
  try {
    const result = await mongo.deleteOneByName(req.params.name);
    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ status: 'failed', message: 'Task not found' });
    }

    res.json({ status: 'success', message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({
      status: 'failed',
      message: 'Error deleting task',
    });
  }
}

// main function
async function main() {
  // Connect to MongoDB
  const mongoConnected = await mongo.connect();
  if (!mongoConnected) {
    mongo.disconnect();
    return;
  }

  // Middlewares
  app.use(express.json());

  // Routes
  app.get('/', (req, res) => {
    res.send('Hello World!');
  });

  app.route('/tasks').get(getAll).post(createOne);
  app
    .route('/tasks/:name')
    .get(getByName)
    .put(updateOneByName)
    .patch(updateOneByName)
    .delete(deleteOneByName);

  app.listen(port, () => {
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
main().catch(uncaughtException);
