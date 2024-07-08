const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/taskhive', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// Task Schema
const taskSchema = new mongoose.Schema({
    username: { type: String, required: true },
    task: { type: String, required: true },
    deadline: { type: Date },
    priority: { type: String, required: true }
});

const Task = mongoose.model('Task', taskSchema);

// User Registration
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword });
        await user.save();
        res.status(201).send('User registered');
    } catch (error) {
        res.status(400).send('Error registering user');
    }
});

// User Login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).send('Invalid credentials');
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send('Invalid credentials');
        }
        const token = jwt.sign({ username: user.username }, 'secretkey', { expiresIn: '1h' });
        res.status(200).json({ token });
    } catch (error) {
        res.status(400).send('Error logging in');
    }
});

// Middleware for authenticating tokens
const authenticate = (req, res, next) => {
    const token = req.header('Authorization').replace('Bearer ', '');
    try {
        const decoded = jwt.verify(token, 'secretkey');
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).send('Authentication failed');
    }
};

// Create Task
app.post('/tasks', authenticate, async (req, res) => {
    const { task, deadline, priority } = req.body;
    const newTask = new Task({ username: req.user.username, task, deadline, priority });
    try {
        await newTask.save();
        res.status(201).send('Task created');
    } catch (error) {
        res.status(400).send('Error creating task');
    }
});

// Get Tasks
app.get('/tasks', authenticate, async (req, res) => {
    try {
        const tasks = await Task.find({ username: req.user.username });
        res.status(200).json(tasks);
    } catch (error) {
        res.status(400).send('Error fetching tasks');
    }
});

// Delete Task
app.delete('/tasks/:id', authenticate, async (req, res) => {
    try {
        await Task.deleteOne({ _id: req.params.id, username: req.user.username });
        res.status(200).send('Task deleted');
    } catch (error) {
        res.status(400).send('Error deleting task');
    }
});

// Update Task
app.put('/tasks/:id', authenticate, async (req, res) => {
    try {
        await Task.updateOne(
            { _id: req.params.id, username: req.user.username },
            { $set: req.body }
        );
        res.status(200).send('Task updated');
    } catch (error) {
        res.status(400).send('Error updating task');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
