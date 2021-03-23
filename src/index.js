const express = require("express");
const cors = require("cors");

const { v4: uuidv4, v4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const checkUser = users.find((user) => user.username === username);

  if (!checkUser) {
    return response.status(400).json({ error: "Customer not found." });
  }

  request.user = checkUser;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some((user) => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({ error: "Mensagem do erro" });
  }

  const newUser = {
    id: v4(),
    name,
    username,
    todos: [],
  };

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.status(200).json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todoDescription = {
    id: v4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todoDescription);

  return response.status(201).json(todoDescription);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const checkUser = users.find((user) => user.username === username);

  if (!checkUser) {
    return response.status(404).json({ error: "Mensagem de erro" });
  }

  const todoToUpdate = checkUser.todos.find((user) => user.id === id);

  if (!todoToUpdate) {
    return response.status(404).json({ error : "Mensagem de erro" });
  }

  todoToUpdate.title = title;
  todoToUpdate.deadline = deadline;

  return response.status(200).json(todoToUpdate);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { username } = request.headers;

  const myUser = users.find((user) => user.username === username);

  if (!myUser) {
    return response.status(404).json({ error: "Mensagem do erro" });
  }

  const task = myUser.todos.find((todo) => todo.id === id);

  if (!task) {
    return response.status(404).json({ error: "Mensagem de erro" });
  }

  task["done"] = true;

  return response.json(task);
});

app.delete("/todos/:id", (request, response) => {
  const { id } = request.params;
  const { username } = request.headers;

  const findUser = users.find((user) => user.username === username);

  if (!findUser) {
    return response.status(404).json({ error: "Mensagem de erro" });
  }

  const deletedTodo = findUser.todos.find((thisTodo) => thisTodo.id === id);

  if (!deletedTodo) {
    return response.status(404).json({ error: "Mensagem de erro" });
  }

  findUser.todos.splice(deletedTodo, 1);

  return response.status(204).send();
});

module.exports = app;
