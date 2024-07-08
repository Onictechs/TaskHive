function showLogin() {
    document.getElementById('registration-section').style.display = 'none';
    document.getElementById('login-section').style.display = 'block';
}

function showRegister() {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('registration-section').style.display = 'block';
}

function register(event) {
    event.preventDefault();
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    if (localStorage.getItem(username)) {
        alert('Username already exists.');
        return;
    }
    localStorage.setItem(username, password);
    alert('Registration successful! Please log in.');
    showLogin();
}

function login(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const storedPassword = localStorage.getItem(username);
    if (storedPassword === password) {
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('task-section').style.display = 'block';
        loadTasks();
    } else {
        alert('Invalid username or password.');
    }
}

function logout() {
    document.getElementById('task-section').style.display = 'none';
    document.getElementById('login-section').style.display = 'block';
}

function createTask(event) {
    event.preventDefault();
    const task = document.getElementById('task').value;
    const deadline = document.getElementById('deadline').value;
    const priority = document.getElementById('priority').value;
    const taskObject = { task, deadline, priority };
    addTaskToList(taskObject);
    saveTask(taskObject);
    document.getElementById('task').value = '';
    document.getElementById('deadline').value = '';
    document.getElementById('priority').value = 'low';
}

function addTaskToList(taskObject) {
    const taskList = document.getElementById('task-list');
    const listItem = document.createElement('li');

    const taskDetailsDiv = document.createElement('div');
    taskDetailsDiv.className = 'task-details';

    const taskSpan = document.createElement('span');
    taskSpan.textContent = taskObject.task;
    taskDetailsDiv.appendChild(taskSpan);

    if (taskObject.deadline) {
        const deadlineSpan = document.createElement('span');
        deadlineSpan.textContent = `Deadline: ${taskObject.deadline}`;
        taskDetailsDiv.appendChild(deadlineSpan);
    }

    const prioritySpan = document.createElement('span');
    prioritySpan.textContent = `Priority: ${taskObject.priority}`;
    prioritySpan.className = `priority-${taskObject.priority}`;
    taskDetailsDiv.appendChild(prioritySpan);

    const buttonsDiv = document.createElement('div');
    buttonsDiv.className = 'task-buttons';

    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.onclick = () => editTask(listItem, taskObject);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.onclick = () => deleteTask(listItem, taskObject);

    buttonsDiv.appendChild(editButton);
    buttonsDiv.appendChild(deleteButton);

    listItem.appendChild(taskDetailsDiv);
    listItem.appendChild(buttonsDiv);

    taskList.appendChild(listItem);

    if (taskObject.deadline && new Date(taskObject.deadline) < new Date()) {
        displayNotification(`Task "${taskObject.task}" is overdue!`);
    }
}

function deleteTask(taskElement, taskObject) {
    taskElement.remove();
    removeTask(taskObject);
}

function editTask(taskElement, taskObject) {
    const newTaskText = prompt("Edit your task:", taskObject.task);
    const newDeadline = prompt("Edit your deadline:", taskObject.deadline);
    const newPriority = prompt("Edit your priority:", taskObject.priority);
    if (newTaskText !== null && newTaskText.trim() !== "" &&
        newPriority !== null && ['low', 'medium', 'high'].includes(newPriority)) {
        const updatedTaskObject = { task: newTaskText, deadline: newDeadline, priority: newPriority };
        updateTask(taskObject, updatedTaskObject);
        taskElement.remove();
        addTaskToList(updatedTaskObject);
    }
}

function saveTask(taskObject) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.push(taskObject);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function removeTask(taskObject) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks = tasks.filter(task => task.task !== taskObject.task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function updateTask(oldTaskObject, newTaskObject) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const taskIndex = tasks.findIndex(task => task.task === oldTaskObject.task);
    if (taskIndex > -1) {
        tasks[taskIndex] = newTaskObject;
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
}

function loadTasks() {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.forEach(task => addTaskToList(task));
}

function displayNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.insertBefore(notification, document.body.firstChild);
    setTimeout(() => notification.remove(), 5000);
}
