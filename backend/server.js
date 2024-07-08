const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// In-memory storage for demonstration purposes
const users = [];
const tasks = [];

// User Registration
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ username, password: hashedPassword });
    res.status(201).send('User registered');
});

// User Login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).send('Invalid credentials');
    }
    const token = jwt.sign({ username: user.username }, 'secretkey', { expiresIn: '1h' });
    res.status(200).json({ token });
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
app.post('/tasks', authenticate, (req, res) => {
    const { task, deadline, priority } = req.body;
    tasks.push({ username: req.user.username, task, deadline, priority });
    res.status(201).send('Task created');
});

// Get Tasks
app.get('/tasks', authenticate, (req, res) => {
    const userTasks = tasks.filter(t => t.username === req.user.username);
    res.status(200).json(userTasks);
});

// Delete Task
app.delete('/tasks/:id', authenticate, (req, res) => {
    const index = tasks.findIndex(t => t.id === req.params.id && t.username === req.user.username);
    if (index !== -1) {
        tasks.splice(index, 1);
        res.status(200).send('Task deleted');
    } else {
        res.status(400).send('Task not found');
    }
});

// Update Task
app.put('/tasks/:id', authenticate, (req, res) => {
    const task = tasks.find(t => t.id === req.params.id && t.username === req.user.username);
    if (task) {
        Object.assign(task, req.body);
        res.status(200).send('Task updated');
    } else {
        res.status(400).send('Task not found');
    }
});

// Update Profile
app.put('/profile', authenticate, (req, res) => {
    const user = users.find(u => u.username === req.user.username);
    if (user) {
        user.username = req.body.username || user.username;
        res.status(200).send('Profile updated');
    } else {
        res.status(400).send('User not found');
    }
});

// Change Password
app.put('/change-password', authenticate, async (req, res) => {
    const user = users.find(u => u.username === req.user.username);
    if (user) {
        const isMatch = await bcrypt.compare(req.body.currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).send('Current password is incorrect');
        }
        user.password = await bcrypt.hash(req.body.newPassword, 10);
        res.status(200).send('Password changed');
    } else {
        res.status(400).send('User not found');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});