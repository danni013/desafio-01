const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(
    (user) => user.username === username
  );

  if (!user) {
    return response.status(404).json({ error: "User not found"});
  }

  request.username = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some(
    (user) => user.username === username
  );

  if (userAlreadyExists) {
    return response.status(400).json({error: "Username already in use!"})
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
  const { username } = request; 
  return response.status(201).json(username.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const { username } = request;

  const todo = {
    id: uuidv4(),
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  username.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;
  const { username } = request;

  const todo = username.todos.find(
    (todo) => todo.id === id);

  if (!todo) {
    return response.status(404).json({error: "Task not found!"});
  }

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { username } = request;

  const todo = username.todos.find(
    (todo) => todo.id === id);
    
  if (!todo) {
    return response.status(404).json({error: "Task not found!"});
  }
    
  todo.done = true;

  return response.json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { id } = request.params;

  const todo = username.todos.find(
    (todo) => todo.id === id);
  
  if (!todo) {
    return response.status(404).json({error: "Task not found!"});
  }

  username.todos.splice(username.todos.indexOf(todo), 1);

  return response.status(204).json();
});

module.exports = app;