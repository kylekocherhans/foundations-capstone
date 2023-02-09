const baseURL = 'http://localhost:4040';
let selectedProjectID = 0;

const projectsUL = document.querySelector('#projects');
const addProjectBtn = document.querySelector('#add-project-btn');

const selectedProjectName = document.querySelector('#selected-project-name');
const tasksDiv = document.querySelector('#tasks');
const completedDiv = document.querySelector('#completed-tasks');
const addTaskBtn = document.querySelector('#add-task-btn');

function getProjects(clickFirst) {
    axios.get(`${baseURL}/projects`)
    .then(res => {
        displayProjects(res.data);
    })
    .then(() => {
        const firstProject = projectsUL.querySelector('li');

        // Is there even a project to click on?
        if (firstProject) {
            if (clickFirst) {
                firstProject.click();
            } else {
                projectsUL.lastElementChild.click();
            }
        }
    })
    .catch(err => console.log(err));
}

// TODO - check for valid project name before saving, show error if invalid
function addProject() {
    const nameInput = document.querySelector('.name-input');

    // if (projectNameInput.value === "") {

    // }

    const body = {
        name: nameInput.value
    }

    axios.post(`${baseURL}/projects`, body)
    .then(res => {
        closePopup();
        getProjects(false);
    })
    .catch(err => console.log(err));
}

// TODO - check for valid project name before saving, show error if invalid
function editProject(projectID) {
    const nameInput = document.querySelector('.name-input');

    const body = {
        name: nameInput.value
    }

    axios.put(`${baseURL}/projects/${projectID}`, body)
    .then(res => {
        closePopup();
        const editedProject = projectsUL.querySelector(`[projectid="${projectID}"]`);
        editedProject.firstElementChild.innerHTML = nameInput.value;
        const wasSelected = editedProject.classList.contains('selected');

        if (wasSelected) {
            selectedProjectName.innerHTML = nameInput.value;
        }
    })
    .catch(err => console.log(err));
}

function deleteProject(e, projectID) {
    e.stopPropagation();

    axios.delete(`${baseURL}/projects/${projectID}`)
    .then(res => {
        const deletedProject = projectsUL.querySelector(`[projectid="${projectID}"]`);
        const wasSelected = deletedProject.classList.contains('selected');
        deletedProject.remove();

        if (wasSelected) {
            const firstProject = projectsUL.querySelector('li');
            if (firstProject) {
                firstProject.click();
            } else {
                tasksDiv.innerHTML = "";
                document.querySelector('#tasks-section').style.display = "none";
            }
        }
    })
    .catch(err => console.log(err));
}

function getTasks(projectID) {
    selectedProjectID = projectID;
    axios.get(`${baseURL}/tasks/${projectID}`)
    .then(res => {
        displayTasks(res.data);
    })
    .catch(err => console.log(err));
}

function addTask() {
    const nameInput = document.querySelector('.name-input');

    const body = {
        projectID: selectedProjectID,
        name: nameInput.value,
        notes: "These are notes",
        priority: 2
    }
    
    axios.post(`${baseURL}/tasks`, body)
    .then(res => {
        closePopup();
        getTasks(selectedProjectID);
    })
    .catch(err => console.log(err));
}

function updateTask(taskID, body) {
    axios.put(`${baseURL}/tasks/${taskID}`, body)
    .then(res => {
        closePopup();
        getTasks(selectedProjectID);
    })
    .catch(err => console.log(err));
}

function editTaskName(taskID, taskComplete) {
    const nameInput = document.querySelector('.name-input');

    const body = {
        projectID: selectedProjectID,
        name: nameInput.value,
        complete: taskComplete
    }

    updateTask(taskID, body);
}

function toggleCompleted(e) {
    const taskItem = e.currentTarget;
    const taskID = taskItem.getAttribute('taskid');
    const taskName = taskItem.firstElementChild.innerHTML;
    const taskComplete = taskItem.getAttribute('complete') === 'true' ? false : true;

    const body = {
        projectID: selectedProjectID,
        name: taskName,
        complete: taskComplete
    }

    updateTask(taskID, body);
}

function editTaskComplete(taskID) {
    
}

function deleteTask(e, taskID) {
    e.stopPropagation();

    axios.delete(`${baseURL}/tasks/${taskID}`)
    .then(res => {
        getTasks(selectedProjectID);
    })
    .catch(err => console.log(err));
}

function displayProjects(projects) {
    projectsUL.innerHTML = "";

    projects.forEach(project => {
        createProjectItem(project);
    });
}

function createProjectItem(project) {
    const newProjectItem = document.createElement('li');
    newProjectItem.setAttribute('projectid', project.id);

    newProjectItem.innerHTML = `
        <div>${project.name}</div>
        <div class="buttons-container">
            <button class="edit-btn" onclick="showEditProject(event, ${project.id})">Edit</button>
            <button class="delete-btn" onclick="deleteProject(event, ${project.id})">Delete</button>
        </div>
    `;

    projectsUL.appendChild(newProjectItem);
    newProjectItem.addEventListener('click', (e) => {
        selectProject(e, project.id, project.name);
    });
}

function displayTasks(tasks) {
    document.querySelector('#tasks-section').style.display = "block";
    tasksDiv.innerHTML = "";
    completedDiv.innerHTML = "";

    tasks.forEach(task => {
        createTaskItem(task);
    });
}

function createTaskItem(task) {
    const newTaskItem = document.createElement('li');
    newTaskItem.setAttribute('taskid', task.id);
    newTaskItem.setAttribute('complete', task.complete);

    newTaskItem.innerHTML = `
        <div>${task.name}</div>
        <div class="buttons-container">
            <button class="edit-btn" onclick="showEditTask(event, ${task.id})">Edit</button>
            <button class="delete-btn" onclick="deleteTask(event, ${task.id})">Delete</button>
        </div>
    `;

    if (task.complete) {
        completedDiv.appendChild(newTaskItem);
    } else {
        tasksDiv.appendChild(newTaskItem);
    }

    newTaskItem.addEventListener('click', toggleCompleted);
}

function showAddProject() {
    const overlay = document.createElement('div');
    overlay.classList.add('overlay');

    overlay.innerHTML = `
        <div class="popup-container">
            <h3 class="popup-title">Add Project</h3>
            <input class="name-input" type="text" placeholder="Enter Project Name">
            <div class="popup-btns-container">
                <button class="cancel-btn popup-btn" onclick="closePopup()">Cancel</button>
                <button class="save-btn popup-btn" onclick="addProject()">Save</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    const input = document.querySelector('.name-input');
    const saveBtn = document.querySelector('.save-btn');
    input.addEventListener("keyup", ({key}) => {
        if (key === "Enter") {
            saveBtn.click();
        }
    });

    document.querySelector('.name-input').focus();
}

function showEditProject(e, projectID) {
    e.stopPropagation();
    const projectName = e.currentTarget.parentElement.previousElementSibling.innerHTML;

    const overlay = document.createElement('div');
    overlay.classList.add('overlay');

    overlay.innerHTML = `
        <div class="popup-container">
            <h3 class="popup-title">Edit Project</h3>
            <input class="name-input" type="text" placeholder="Enter Project Name" value="${projectName}">
            <div class="popup-btns-container">
                <button class="cancel-btn popup-btn" onclick="closePopup()">Cancel</button>
                <button class="save-btn popup-btn" onclick="editProject(${projectID})">Save</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    const input = document.querySelector('.name-input');
    const saveBtn = document.querySelector('.save-btn');
    input.addEventListener("keyup", ({key}) => {
        if (key === "Enter") {
            saveBtn.click();
        }
    });

    const end = projectName.length;
    input.setSelectionRange(end, end);
    input.focus();
}

function showAddTask() {
    const overlay = document.createElement('div');
    overlay.classList.add('overlay');

    overlay.innerHTML = `
        <div class="popup-container">
            <h3 class="popup-title">Add Task</h3>
            <input class="name-input" type="text" placeholder="Enter Task Name">
            <div class="popup-btns-container">
                <button class="cancel-btn popup-btn" onclick="closePopup()">Cancel</button>
                <button class="save-btn popup-btn" onclick="addTask()">Save</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    const input = document.querySelector('.name-input');
    const saveBtn = document.querySelector('.save-btn');
    input.addEventListener("keyup", ({key}) => {
        if (key === "Enter") {
            saveBtn.click();
        }
    });

    document.querySelector('.name-input').focus();
}

function showEditTask(e, taskID) {
    e.stopPropagation();

    const projectItem = e.currentTarget.parentElement.parentElement;
    const taskName = projectItem.firstElementChild.innerHTML;
    const taskComplete = projectItem.getAttribute('complete');

    const overlay = document.createElement('div');
    overlay.classList.add('overlay');

    overlay.innerHTML = `
        <div class="popup-container">
            <h3 class="popup-title">Edit Task</h3>
            <input class="name-input" type="text" placeholder="Enter Task Name" value="${taskName}">
            <div class="popup-btns-container">
                <button class="cancel-btn popup-btn" onclick="closePopup()">Cancel</button>
                <button class="save-btn popup-btn" onclick="editTaskName(${taskID}, ${taskComplete})">Save</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    const input = document.querySelector('.name-input');
    const saveBtn = document.querySelector('.save-btn');
    input.addEventListener("keyup", ({key}) => {
        if (key === "Enter") {
            saveBtn.click();
        }
    });

    const end = taskName.length;
    input.setSelectionRange(end, end);
    input.focus();
}

function closePopup() {
    const overlay = document.querySelector('.overlay');
    if (overlay) {
        overlay.remove();
    }
}

function selectProject(e, projectID, projectName) {
    selectedProjectName.innerHTML = projectName;
    const selectedProject = projectsUL.querySelector('.selected');
    if (selectedProject) {
        selectedProject.classList.remove('selected');
    }
    e.currentTarget.classList.add('selected');
    getTasks(projectID);
}

addProjectBtn.addEventListener('click', showAddProject);
addTaskBtn.addEventListener('click', showAddTask);


getProjects(true);