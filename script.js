// =====================================================
// POMODORO PRO v4.0
// script.js
// PART 1 OF 6
// Core Data Model
// =====================================================



// =====================================================
// TIMER SETTINGS
// =====================================================

const DEFAULT_WORK_MINUTES = 25;

const DEFAULT_BREAK_MINUTES = 5;

let workDuration =
DEFAULT_WORK_MINUTES * 60;

let breakDuration =
DEFAULT_BREAK_MINUTES * 60;

let timeLeft =
workDuration;

let timer = null;

let running = false;

let isWorkSession = true;



// =====================================================
// LOCAL STORAGE KEYS
// =====================================================

const STORAGE_KEYS={

    PRODUCTIVITY:"productivity",

    TASKS:"tasks",

    SETTINGS:"settings",

    ACTIVE_TASK:"activeTaskId"

};



// =====================================================
// DATE HELPERS
// =====================================================

function getToday(){

    return new Date()

    .toISOString()

    .split("T")[0];

}



function getWeekKey(){

    const today=new Date();

    const firstDay=

    new Date(

        today.getFullYear(),

        0,

        1

    );

    const days=

    Math.floor(

        (today-firstDay)/86400000

    );

    const week=

    Math.ceil(

        (days+1)/7

    );

    return

    `${today.getFullYear()}-W${week}`;

}



// =====================================================
// PRODUCTIVITY MODEL
// =====================================================

function createProductivity(){

    return{

        totalSessions:0,

        totalMinutes:0,

        totalTasks:0,

        streak:0,

        lastCompleted:"",

        today:{

            date:getToday(),

            sessions:0,

            minutes:0,

            tasks:0

        },

        week:{

            id:getWeekKey(),

            sessions:0,

            minutes:0,

            tasks:0

        }

    };

}



let productivity=

JSON.parse(

localStorage.getItem(

STORAGE_KEYS.PRODUCTIVITY

)

)

||

createProductivity();



// =====================================================
// RESET DAILY DATA
// =====================================================

if(

productivity.today.date

!==

getToday()

){

    productivity.today={

        date:getToday(),

        sessions:0,

        minutes:0,

        tasks:0

    };

}



// =====================================================
// RESET WEEKLY DATA
// =====================================================

if(

productivity.week.id

!==

getWeekKey()

){

    productivity.week={

        id:getWeekKey(),

        sessions:0,

        minutes:0,

        tasks:0

    };

}



// =====================================================
// TASK MODEL
// =====================================================

function createTask(text){

    return{

        id:Date.now(),

        text:text,

        completed:false,

        pomodoros:0,

        createdAt:

        new Date()

        .toISOString()

    };

}



// =====================================================
// TASK STORAGE
// =====================================================

let tasks=

JSON.parse(

localStorage.getItem(

STORAGE_KEYS.TASKS

)

)

||

[];



let activeTaskId=

localStorage.getItem(

STORAGE_KEYS.ACTIVE_TASK

)

||

null;



// =====================================================
// SETTINGS
// =====================================================

let settings=

JSON.parse(

localStorage.getItem(

STORAGE_KEYS.SETTINGS

)

)

||

{

    theme:"light"

};



// =====================================================
// SAVE FUNCTIONS
// =====================================================

function saveProductivity(){

    localStorage.setItem(

        STORAGE_KEYS.PRODUCTIVITY,

        JSON.stringify(

            productivity

        )

    );

}



function saveTasks(){

    localStorage.setItem(

        STORAGE_KEYS.TASKS,

        JSON.stringify(

            tasks

        )

    );

}



function saveSettings(){

    localStorage.setItem(

        STORAGE_KEYS.SETTINGS,

        JSON.stringify(

            settings

        )

    );

}



function saveActiveTask(){

    if(activeTaskId){

        localStorage.setItem(

            STORAGE_KEYS.ACTIVE_TASK,

            activeTaskId

        );

    }

    else{

        localStorage.removeItem(

            STORAGE_KEYS.ACTIVE_TASK

        );

    }

}



// =====================================================
// FIND HELPERS
// =====================================================

function getTaskById(id){

    return tasks.find(

        task=>

        String(task.id)

        ===

        String(id)

    );

}



function getActiveTask(){

    return getTaskById(

        activeTaskId

    );

}



// =====================================================
// PART 2 STARTS BELOW
// =====================================================

// =====================================================
// POMODORO PRO v4.0
// script.js
// PART 2A OF 7
// DOM + THEME
// =====================================================



// =====================================================
// DOM ELEMENTS
// =====================================================

// ---------------------------
// Timer
// ---------------------------

const timerDisplay =
document.getElementById("timer");

const modeDisplay =
document.getElementById("mode");

const progressCircle =
document.querySelector(
".progress-ring-circle"
);



// ---------------------------
// Controls
// ---------------------------

const startBtn =
document.getElementById("start");

const pauseBtn =
document.getElementById("pause");

const resetBtn =
document.getElementById("reset");

const themeToggle =
document.getElementById("themeToggle");



// ---------------------------
// Dashboard
// ---------------------------

const todaySessions =
document.getElementById(
"todaySessions"
);

const todayMinutes =
document.getElementById(
"todayMinutes"
);

const todayTasks =
document.getElementById(
"todayTasks"
);

const weekSessions =
document.getElementById(
"weekSessions"
);

const weekMinutes =
document.getElementById(
"weekMinutes"
);

const weekTasks =
document.getElementById(
"weekTasks"
);

const totalSessions =
document.getElementById(
"totalSessions"
);

const totalMinutes =
document.getElementById(
"totalMinutes"
);

const totalTasks =
document.getElementById(
"totalTasks"
);

const streakDisplay =
document.getElementById(
"streak"
);



// ---------------------------
// Tasks
// ---------------------------

const taskInput =
document.getElementById(
"taskInput"
);

const addTaskBtn =
document.getElementById(
"addTask"
);

const taskList =
document.getElementById(
"taskList"
);

const currentTask =
document.getElementById(
"currentTask"
);

const clearCurrentTask =
document.getElementById(
"clearCurrentTask"
);



// ---------------------------
// Celebration
// ---------------------------

const celebration =
document.getElementById(
"celebration"
);



// =====================================================
// PROGRESS RING
// =====================================================

const radius = 100;

const circumference =
2 * Math.PI * radius;

progressCircle.style.strokeDasharray =
circumference;

progressCircle.style.strokeDashoffset =
0;



// =====================================================
// THEME MANAGER
// =====================================================

function applyTheme(){

    if(settings.theme==="dark"){

        document.body.classList.add(
        "dark"
        );

        themeToggle.textContent="☀️";

    }

    else{

        document.body.classList.remove(
        "dark"
        );

        themeToggle.textContent="🌙";

    }

}



function toggleTheme(){

    if(settings.theme==="light"){

        settings.theme="dark";

    }

    else{

        settings.theme="light";

    }

    saveSettings();

    applyTheme();

}



// =====================================================
// PART 2B STARTS BELOW
// =====================================================

// =====================================================
// POMODORO PRO v4.0
// script.js
// PART 2B OF 7
// UI UPDATE FUNCTIONS
// =====================================================



// =====================================================
// DASHBOARD
// =====================================================

function updateDashboard(){

    todaySessions.textContent =
    productivity.today.sessions;

    todayMinutes.textContent =
    productivity.today.minutes;

    todayTasks.textContent =
    productivity.today.tasks;

    weekSessions.textContent =
    productivity.week.sessions;

    weekMinutes.textContent =
    productivity.week.minutes;

    weekTasks.textContent =
    productivity.week.tasks;

    totalSessions.textContent =
    productivity.totalSessions;

    totalMinutes.textContent =
    productivity.totalMinutes;

    totalTasks.textContent =
    productivity.totalTasks;

    streakDisplay.textContent =
    productivity.streak;

}



// =====================================================
// TIMER DISPLAY
// =====================================================

function updateTimerDisplay(){

    const minutes =
    Math.floor(timeLeft / 60);

    const seconds =
    timeLeft % 60;

    timerDisplay.textContent =

    `${String(minutes).padStart(2,"0")}:${String(seconds).padStart(2,"0")}`;

    modeDisplay.textContent =

    isWorkSession

    ?

    "Focus Time"

    :

    "Break Time";



    const totalTime =

    isWorkSession

    ?

    workDuration

    :

    breakDuration;



    const progress =

    timeLeft / totalTime;



    progressCircle.style.strokeDashoffset =

    circumference * (1 - progress);



    if(isWorkSession){

        progressCircle.style.stroke =
        "#8B5CF6";

    }

    else{

        progressCircle.style.stroke =
        "#10B981";

    }

}



// =====================================================
// ACTIVE TASK
// =====================================================

function updateCurrentTask(){

    const activeTask =
    getActiveTask();



    if(activeTask){

        currentTask.textContent =
        activeTask.text;

    }

    else{

        currentTask.textContent =
        "No task selected";

    }

}



// =====================================================
// CELEBRATION
// =====================================================

function showCelebration(){

    celebration.classList.add(
        "show"
    );

    setTimeout(()=>{

        celebration.classList.remove(
            "show"
        );

    },1200);

}



// =====================================================
// RESET TIMER
// =====================================================

function resetTimerDisplay(){

    if(isWorkSession){

        timeLeft = workDuration;

    }

    else{

        timeLeft = breakDuration;

    }

    updateTimerDisplay();

}



// =====================================================
// INITIAL UI
// =====================================================





// =====================================================
// PART 3 STARTS BELOW
// =====================================================
    

// =====================================================
// POMODORO PRO v4.0
// script.js
// PART 3 OF 7
// TIMER ENGINE
// =====================================================



// =====================================================
// START TIMER
// =====================================================

function startTimer(){

    if(running){

        return;

    }

    running = true;

    timer = setInterval(timerTick,1000);

}



// =====================================================
// PAUSE TIMER
// =====================================================

function pauseTimer(){

    running = false;

    clearInterval(timer);

    timer = null;

}



// =====================================================
// RESET TIMER
// =====================================================

function resetTimer(){

    pauseTimer();

    if(isWorkSession){

        timeLeft = workDuration;

    }

    else{

        timeLeft = breakDuration;

    }

    updateTimerDisplay();

}



// =====================================================
// TIMER TICK
// =====================================================

function timerTick(){

    if(timeLeft>0){

        timeLeft--;

        updateTimerDisplay();

        return;

    }

    completeSession();

}



// =====================================================
// COMPLETE SESSION
// =====================================================

function completeSession(){

    pauseTimer();

    showCelebration();

    if(isWorkSession){

        finishWorkSession();

    }

    else{

        finishBreakSession();

    }

}



// =====================================================
// WORK SESSION COMPLETE
// =====================================================

function finishWorkSession(){

    // Record productivity
    recordFocusSession();

    // Switch to break mode
    isWorkSession = false;

    timeLeft = breakDuration;

    updateTimerDisplay();

    startTimer();

}



// =====================================================
// BREAK SESSION COMPLETE
// =====================================================

function finishBreakSession(){

    isWorkSession = true;

    timeLeft = workDuration;

    updateTimerDisplay();

    startTimer();

}



// =====================================================
// CHANGE SESSION MODE
// =====================================================

function switchToWork(){

    isWorkSession = true;

    timeLeft = workDuration;

    updateTimerDisplay();

}



function switchToBreak(){

    isWorkSession = false;

    timeLeft = breakDuration;

    updateTimerDisplay();

}



// =====================================================
// TIMER STATE
// =====================================================

function isRunning(){

    return running;

}



// =====================================================
// PART 4 STARTS BELOW
// =====================================================



// =====================================================
// POMODORO PRO v4.0
// script.js
// PART 4 OF 7
// PRODUCTIVITY STATISTICS & STREAKS
// =====================================================



// =====================================================
// RECORD A COMPLETED FOCUS SESSION
// =====================================================

function recordFocusSession(){

    productivity.today.sessions++;

    productivity.today.minutes +=
    DEFAULT_WORK_MINUTES;

    productivity.week.sessions++;

    productivity.week.minutes +=
    DEFAULT_WORK_MINUTES;

    productivity.totalSessions++;

    productivity.totalMinutes +=
    DEFAULT_WORK_MINUTES;

    updateStreak();

    updateTaskPomodoros();

    saveProductivity();

    saveTasks();

    updateDashboard();

}



// =====================================================
// RECORD COMPLETED TASK
// =====================================================

function recordCompletedTask(){

    productivity.today.tasks++;

    productivity.week.tasks++;

    productivity.totalTasks++;

    saveProductivity();

    updateDashboard();

}



// =====================================================
// UPDATE STREAK
// =====================================================

function updateStreak(){

    const today = getToday();

    if(productivity.lastCompleted === today){

        return;

    }

    if(productivity.lastCompleted === ""){

        productivity.streak = 1;

    }

    else{

        const lastDate =
        new Date(productivity.lastCompleted);

        const currentDate =
        new Date(today);

        const difference =

        Math.floor(

            (currentDate-lastDate)

            /86400000

        );

        if(difference===1){

            productivity.streak++;

        }

        else if(difference>1){

            productivity.streak=1;

        }

    }

    productivity.lastCompleted = today;

}



// =====================================================
// ACTIVE TASK POMODOROS
// =====================================================

function updateTaskPomodoros(){

    if(!activeTaskId){

        return;

    }

    const task =

    getTaskById(activeTaskId);

    if(!task){

        return;

    }

    task.pomodoros++;

}



// =====================================================
// COMPLETE WORK SESSION
// =====================================================




// =====================================================
// MARK TASK COMPLETE
// =====================================================

function completeTask(taskId){

    const task =

    getTaskById(taskId);

    if(!task){

        return;

    }

    if(task.completed){

        return;

    }

    task.completed = true;

    recordCompletedTask();

    saveTasks();

};



// =====================================================
// PART 5 STARTS BELOW
// =====================================================

// =====================================================
// POMODORO PRO v4.0
// script.js
// PART 5 OF 7
// TASK MANAGER
// =====================================================



// =====================================================
// ADD TASK
// =====================================================

function addTask(){

    const text = taskInput.value.trim();

    if(text===""){

        return;

    }

    const task = createTask(text);

    tasks.push(task);

    saveTasks();

    renderTasks();

    taskInput.value="";

}



// =====================================================
// DELETE TASK
// =====================================================

function deleteTask(taskId){

    tasks = tasks.filter(task=>task.id!==taskId);

    if(String(activeTaskId)===String(taskId)){

        activeTaskId=null;

        saveActiveTask();

        updateCurrentTask();

    }

    saveTasks();

    renderTasks();

}



// =====================================================
// SELECT ACTIVE TASK
// =====================================================

function selectTask(taskId){

    activeTaskId = taskId;

    saveActiveTask();

    updateCurrentTask();

    renderTasks();

}



// =====================================================
// CLEAR ACTIVE TASK
// =====================================================

function clearActiveTask(){

    activeTaskId = null;

    saveActiveTask();

    updateCurrentTask();

    renderTasks();

}



// =====================================================
// TOGGLE TASK COMPLETE
// =====================================================

function toggleTask(taskId){

    const task = getTaskById(taskId);

    if(!task){

        return;

    }

    task.completed = !task.completed;

    if(task.completed){

        recordCompletedTask();

    }

    saveTasks();

    renderTasks();

}



// =====================================================
// RENDER TASKS
// =====================================================

function renderTasks(){

    taskList.innerHTML="";

    tasks.forEach(task=>{

        const li =
        document.createElement("li");

        li.className="task";

        if(task.completed){

            li.classList.add("completed");

        }

        if(String(task.id)===String(activeTaskId)){

            li.classList.add("active");

        }

        li.innerHTML=`

        <div class="task-left">

            <input
                type="checkbox"
                ${task.completed ? "checked" : ""}
            >

            <span>${task.text}</span>

            <small>🍅 ${task.pomodoros}</small>

        </div>

        <button class="delete-btn">

            🗑

        </button>

        `;

        const checkbox =
        li.querySelector("input");

        checkbox.addEventListener(

            "change",

            ()=>toggleTask(task.id)

        );

        const text =
        li.querySelector("span");

        text.addEventListener(

            "click",

            ()=>selectTask(task.id)

        );

        const deleteButton =
        li.querySelector(".delete-btn");

        deleteButton.addEventListener(

            "click",

            ()=>deleteTask(task.id)

        );

        taskList.appendChild(li);

    });

}



// =====================================================
// PART 6 STARTS BELOW
// =====================================================

// =====================================================
// POMODORO PRO v4.0
// script.js
// PART 6 OF 7
// INITIALIZATION & EVENT LISTENERS
// =====================================================



// =====================================================
// BUTTON EVENTS
// =====================================================

startBtn.addEventListener(

    "click",

    startTimer

);



pauseBtn.addEventListener(

    "click",

    pauseTimer

);



resetBtn.addEventListener(

    "click",

    resetTimer

);



themeToggle.addEventListener(

    "click",

    toggleTheme

);



addTaskBtn.addEventListener(

    "click",

    addTask

);



clearCurrentTask.addEventListener(

    "click",

    clearActiveTask

);



// =====================================================
// ENTER KEY ADDS TASK
// =====================================================

taskInput.addEventListener(

    "keypress",

    function(event){

        if(event.key==="Enter"){

            addTask();

        }

    }

);



// =====================================================
// INITIALIZE APP
// =====================================================

applyTheme();

updateDashboard();

updateCurrentTask();

updateTimerDisplay();

renderTasks();



// =====================================================
// SAFETY CHECKS
// =====================================================

if(isWorkSession){

    timeLeft = workDuration;

}

else{

    timeLeft = breakDuration;

}

updateTimerDisplay();



// =====================================================
// END OF FILE
// =====================================================



