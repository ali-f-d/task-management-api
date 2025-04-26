const express = require('express');
const tasksRouter = require('./routers/tasksRouter');

const app = express();

// Middlewares
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to the Task Management API!');
});

app.use('/tasks', tasksRouter);

// Export
module.exports = app;
