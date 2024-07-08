const apiUrl = 'https://taskhive-310kf4xo9-onictechs-projects.vercel.app';  // Update with your Vercel backend URL

async function register(event) {
    event.preventDefault();
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    const response = await fetch(`${apiUrl}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });
    if (response.ok) {
        alert('Registration successful');
    } else {
        alert('Registration failed');
    }
}

async function login(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const response = await fetch(`${apiUrl}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });
    if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        showTasks();
    } else {
        alert('Login failed');
    }
}

async function updateProfile(event) {
    event.preventDefault();
    const token = localStorage.getItem('token');
    const username = document.getElementById('new-username').value;
    const response = await fetch(`${apiUrl}/profile`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ username }),
    });
    if (response.ok) {
        alert('Profile updated');
    } else {
        alert('Profile update failed');
    }
}

async function changePassword(event) {
    event.preventDefault();
    const token = localStorage.getItem('token');
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const response = await fetch(`${apiUrl}/change-password`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
    });
    if (response.ok) {
        alert('Password changed');
    } else {
        alert('Password change failed');
    }
}

async function showTasks() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${apiUrl}/tasks`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    if (response.ok) {
        const tasks = await response.json();
        // Code to display tasks on the frontend
    } else {
        alert('Failed to fetch tasks');
    }
}

document.getElementById('profile-form').addEventListener('submit', updateProfile);
document.getElementById('change-password-form').addEventListener('submit', changePassword);