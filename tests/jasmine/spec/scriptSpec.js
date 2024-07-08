describe("Task Management Tool", function() {
    beforeAll(function() {
        // Setup: Create DOM elements for testing
        document.body.innerHTML = `
            <div id="registration-section">
                <form class="registration-form" onsubmit="register(event)">
                    <input type="text" id="reg-username" name="reg-username" required>
                    <input type="password" id="reg-password" name="reg-password" required>
                    <button type="submit">Register</button>
                </form>
            </div>
            <div id="login-section" style="display:none;">
                <form class="login-form" onsubmit="login(event)">
                    <input type="text" id="username" name="username" required>
                    <input type="password" id="password" name="password" required>
                    <button type="submit">Login</button>
                </form>
            </div>
            <div id="task-section" style="display:none;">
                <form class="task-form" onsubmit="createTask(event)">
                    <input type="text" id="task" name="task" required>
                    <button type="submit">Add Task</button>
                </form>
                <ul id="task-list" class="task-list"></ul>
            </div>
        `;
    });

    it("should register a new user", function() {
        document.getElementById('reg-username').value = 'testuser';
        document.getElementById('reg-password').value = 'password123';
        register({ preventDefault: () => {} });
        expect(localStorage.getItem('testuser')).toEqual('password123');
    });

    it("should not register an existing user", function() {
        document.getElementById('reg-username').value = 'testuser';
        document.getElementById('reg-password').value = 'password123';
        spyOn(window, 'alert');
        register({ preventDefault: () => {} });
        expect(window.alert).toHaveBeenCalledWith('Username already exists.');
    });

    it("should log in a registered user", function() {
        document.getElementById('username').value = 'testuser';
        document.getElementById('password').value = 'password123';
        spyOn(document.getElementById('login-section').style, 'display').and.returnValue('none');
        spyOn(document.getElementById('task-section').style, 'display').and.returnValue('block');
        login({ preventDefault: () => {} });
        expect(document.getElementById('login-section').style.display).toEqual('none');
        expect(document.getElementById('task-section').style.display).toEqual('block');
    });

    it("should not log in with incorrect credentials", function() {
        document.getElementById('username').value = 'testuser';
        document.getElementById('password').value = 'wrongpassword';
        spyOn(window, 'alert');
        login({ preventDefault: () => {} });
        expect(window.alert).toHaveBeenCalledWith('Invalid username or password.');
    });

    it("should create a new task", function() {
        document.getElementById('task').value = 'New Task';
        createTask({ preventDefault: () => {} });
        const taskList = document.getElementById('task-list');
        expect(taskList.children.length).toBe(1);
        expect(taskList.children[0].textContent).toContain('New Task');
    });

    it("should delete a task", function() {
        document.getElementById('task').value = 'Task to delete';
        createTask({ preventDefault: () => {} });
        const taskElement = document.getElementById('task-list').children[0];
        deleteTask(taskElement, 'Task to delete');
        expect(document.getElementById('task-list').children.length).toBe(0);
    });

    it("should edit a task", function() {
        document.getElementById('task').value = 'Task to edit';
        createTask({ preventDefault: () => {} });
        const taskElement = document.getElementById('task-list').children[0];
        const taskSpan = taskElement.querySelector('span');
        spyOn(window, 'prompt').and.returnValue('Edited Task');
        editTask(taskElement, taskSpan);
        expect(taskSpan.textContent).toBe('Edited Task');
    });
});
