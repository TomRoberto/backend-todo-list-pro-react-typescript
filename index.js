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

app.listen(process.env.PORT, () => console.log("Server started"));
