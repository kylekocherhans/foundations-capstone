require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const {SERVER_PORT} = process.env;
const {seed} = require('./seed.js');
const {getProjects, addProject, updateProject, deleteProject, getTasks, addTask, updateTask, deleteTask} = require('./controller.js');

app.use(express.json());
app.use(cors());

// DEV
app.post('/seed', seed);

// Projects
app.get('/projects', getProjects);
app.post('/projects', addProject);
app.put('/projects/:id', updateProject);
app.delete('/projects/:id', deleteProject);

// Tasks
app.get('/tasks/:projectID', getTasks);
app.post('/tasks', addTask);
app.put('/tasks/:id', updateTask);
app.delete('/tasks/:id', deleteTask);



app.listen(SERVER_PORT, () => console.log(`Up and running on port ${SERVER_PORT}`));