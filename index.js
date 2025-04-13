require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const data = require("./data.json");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI);

const Todo = mongoose.model("Todo", {
  title: String,
  isDone: {
    default: false,
    type: Boolean,
  },
});

app.post("/populate-db", async (req, res) => {
  try {
    await Todo.deleteMany();
    await Todo.insertMany(data);
    res.status(201).json({ message: "DB populated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/todos", async (req, res) => {
  try {
    const todos = await Todo.find().select("-__v");
    res.json(todos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Créer un todo
app.post("/todos", async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const newTodo = new Todo({
      title,
      isDone: false,
    });

    await newTodo.save();
    res.status(201).json(newTodo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Inverser l'état (isDone) d'un todo
app.put("/todos/:id", async (req, res) => {
  try {
    const todoId = req.params.id;

    const todo = await Todo.findById(todoId);

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    // Inverser la valeur de isDone
    todo.isDone = !todo.isDone;
    await todo.save();

    res.json(todo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Supprimer un todo
app.delete("/todos/:id", async (req, res) => {
  try {
    const todoId = req.params.id;
    const deletedTodo = await Todo.findByIdAndDelete(todoId);

    if (!deletedTodo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    res.json({ message: "Todo deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(process.env.PORT, () => console.log("Server started"));
