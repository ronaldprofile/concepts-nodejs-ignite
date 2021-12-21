const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "User not found!" });
  }

  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  users.push({
    id: uuidv4(),
    name,
    username,
    todos: [],
  });

  return response.json(users);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const todos = user.todos;

  return response.json(todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  user.todos.push({
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  });

  return response.json(user);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const todo = user.todos.map((todo) => {
    if (todo.id === id) {
      return {
        ...todo,
        title,
        deadline,
      };
    } else {
      return response.json({ error: "unable to update todo!" });
    }
  });

  return response.json(todo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { done } = request.body;

  const todo = user.todos.map((todo) => {
    if (todo.id === id) {
      return {
        ...todo,
        done,
      };
    } else {
      return response.json({ error: "unable to update todo status" });
    }
  });

  return response.json(todo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.map((todo) => {
    if (todo.id === id) {
      return todo;
    } else {
      return response.json({ error: "todo not found!" });
    }
  });

  user.todos.splice(todo, 1);

  return response.json(users);
});

module.exports = app;
