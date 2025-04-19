const e = require('express');
const express = require('express');
const fs = require('fs');
const { MongoClient } = require('mongodb');

// initializing for MongoDB client
const mongoURI = 'mongodb://127.0.0.1:27017';
const client = new MongoClient(mongoURI);

// express initialization
const protocol = 'http';
const hostname = 'localhost';
const port = 3000;
const app = express();

// functions
async function mongoConnect() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    return true;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    return false;
  }
}

async function mongoDisconnect() {
  try {
    await client.close();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error);
  }
}

async function uncaughtException(error) {
  console.error('Uncaught Exception:', error);
  await mongoDisconnect();
  console.log('Server closed due to uncaught exception');
  process.exit(1);
}

// main function
async function main() {
  // Connect to MongoDB
  const mongoConnected = await mongoConnect();
  if (!mongoConnected) {
    mongoDisconnect();
    return;
  }

  // Getting Database and Collection
  const db = client.db('task-manager');
  const collection = db.collection('tasks');

  // Middlewares
  app.use(express.json());

  // Routes
  app.get('/', (req, res) => {
    res.send('Hello World!');
  });

  app
    .route('/tasks')
    .get((req, res) => {
      collection
        .find()
        .toArray()
        .then((tasks) => {
          res.json({ status: 'success', length: tasks.length, tasks });
        })
        .catch((err) => {
          console.error('Error fetching tasks:', err);
          res
            .status(500)
            .json({ status: 'failed', message: 'Error fetching tasks' });
        });
    })
    .post((req, res) => {
      const task = req.body;
      collection.insertOne(task).then(
        (result) => {
          res
            .status(201)
            .json({ status: 'success', insertedId: result.insertedId });
        },
        (err) => {
          console.error('Error inserting task:', err);
          res
            .status(500)
            .json({ status: 'failed', message: 'Error inserting task' });
        }
      );
    });
  app
    .route('/tasks/:name')
    .get((req, res) => {
      collection
        .find({ name: req.params.name })
        .toArray()
        .then(
          (tasks) => {
            console.log('Fetching task with ID:', req.params.name);
            console.log('Tasks:', tasks);
            res.json({ status: 'success', length: tasks.length, tasks });
          },
          (err) => {
            console.error('Error fetching tasks:', err);
            res.status(500).send('Internal Server Error');
          }
        );
    })
    .put((req, res) => {
      const task = req.body;
      collection.updateOne({ name: req.params.name }, { $set: task }).then(
        (result) => {
          res.json({ status: 'success', task });
        },
        (err) => {
          console.error('Error updating task:', err);
          res.status(500).send('Internal Server Error');
        }
      );
    })
    .patch((req, res) => {
      const task = req.body;
      collection.updateOne({ name: req.params.name }, { $set: task }).then(
        (result) => {
          res.json({ status: 'success', modifiedCount: result.modifiedCount });
        },
        (err) => {
          console.error('Error updating task:', err);
          res.status(500).send('Internal Server Error');
        }
      );
    })
    .delete((req, res) => {
      collection.deleteOne({ name: req.params.name }).then(
        (result) => {
          res.json({ status: 'success', message: 'Task deleted' });
        },
        (err) => {
          console.error('Error deleting task:', err);
        }
      );
    });

  app.listen(port, () => {
    console.log(`Server is running on ${protocol}://${hostname}:${port}`);
  });
}

// take care of closing the connection when the process ends
process.on('SIGINT', async () => {
  await mongoDisconnect();
  console.log('Server closed');
  process.exit(0);
});
process.on('uncaughtException', uncaughtException);

// Start the server
main().catch(uncaughtException);
