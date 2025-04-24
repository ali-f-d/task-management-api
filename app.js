const express = require('express');

const app = express();

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

// Middlewares
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to the Task Management API!');
});

app.route('/tasks').get(getAll).post(createOne);
app
  .route('/tasks/:name')
  .get(getByName)
  .put(updateOneByName)
  .patch(updateOneByName)
  .delete(deleteOneByName);

// export
module.exports = app;
