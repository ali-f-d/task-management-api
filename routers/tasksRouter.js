const router = require('express').Router();
const mongo = require('../mongo');

// Middleware to check if the request body is a valid object
const checkBody = (req, res, next) => {
  if (
    typeof req.body !== 'object' || // Check if req.body is an object
    req.body === null || // Check if req.body is null
    Array.isArray(req.body) || // Check if req.body is an array
    Object.keys(req.body).length === 0 // Check if req.body is empty
  ) {
    return res.status(400).json({
      status: 'failed',
      message: 'Invalid request body',
    });
  }
  next();
};

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

// Routes
router.route('/').get(getAll).post(checkBody, createOne);
router
  .route('/:name')
  .get(getByName)
  .delete(deleteOneByName)
  .put(checkBody, updateOneByName)
  .patch(checkBody, updateOneByName);

// Export
module.exports = router;
