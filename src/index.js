const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find(user => user.username === username);

  if (!user) {
    return response.status(400).json({ error: "User not found" })
  }

  request.user = user;

  next();
}

app.post('/users', (request, response) => {

  const { name, username } = request.body;

  const verifyIfUserExist = users.some(user => user.username === username);


  if (verifyIfUserExist) {
    return response.status(400).json({ error: "Username Already exists !!!" })
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };


  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {

  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  user.todos.push(todo);

  return response.status(201).json(todo);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const verifyIfTaskExist = user.todos.some(user => user.id === id);

  if (!verifyIfTaskExist) {
    return response.status(404).json({ error: "Task not found" });
  }

  const task = user.todos.find(user => user.id === id);

  task.title = title;
  task.deadline = new Date(deadline);

  return response.status(201).json(task);


});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const verifyIfTaskExist = user.todos.some(user => user.id === id);

  if (!verifyIfTaskExist) {
    return response.status(404).json({ error: "Task not found" });
  }

  const task = user.todos.find(user => user.id === id);

  task.done = true;

  return response.status(201).json(task);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const verifyIfTaskExist = user.todos.some(user => user.id === id);

  if (!verifyIfTaskExist) {
    return response.status(404).json({ error: "Task not found" });
  }

  const task = user.todos.find(user => user.id === id);

  user.todos.splice(task, 1);

  return response.status(204).send();
});

module.exports = app;