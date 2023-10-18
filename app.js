#!/usr/bin/env node

const fs = require("fs");
const { resolve, dirname, join } = require("path");
const { program } = require("commander");

const getDB = () => {
    const dir = dirname(require.main.filename);
    const filePath = join(dir, "database.json");
    const content = fs.readFileSync(filePath, "utf-8").toString();
    return JSON.parse(content);
}

const database = getDB();

const saveDB = (successMessage) => {
    const dir = dirname(require.main.filename);
    const filePath = join(dir, "database.json");
    const data = JSON.stringify(database);
    try {
        fs.writeFileSync(filePath, data);
        console.info(successMessage);
    } catch (error) {
        console.error(error);
    }
}

const createTask = (taskName, category) => {
    const currentDate = new Date();
    currentDate.setHours(currentDate.getHours() - 3);
    const newTask = { 
        id: Date.now(), 
        name: taskName, 
        category: !category ? "pessoal" : category,
        completed: false, 
        createdAt: currentDate.toISOString(), 
        completedAt: "" 
    }
    database.tasks.push(newTask);
    saveDB("New task created");
} 

const listTasks = (category) => {
    var filteredTasks = [];
    if (category) {
        database.tasks.forEach((task, index) => {
            if (task.category == category) {
                filteredTasks[index] = task;
            }
        });
    } else {
        filteredTasks = database.tasks;
    }

    const mappedTasks = filteredTasks.map(task => {
        return {
            completed: task.completed ? "✅" : "❌",
            name: task.name,
            category: task.category ? task.category : "default",
            createdAt: task.createdAt.split("T")[0].split("-").reverse().join("/") + " " + task.createdAt.split("T")[1].split(".")[0],
            completedAt: task.completedAt ? task.completedAt.split("T")[0].split("-").reverse().join("/") + " " + task.completedAt.split("T")[1]?.split(".")[0] : ""
        }
    });

    console.table(mappedTasks);
}

const updateTask = (index, completed) => {
    const currentDate = new Date();
    currentDate.setHours(currentDate.getHours() - 3);
    database.tasks[index].completed = completed;
    database.tasks[index].completedAt = completed ? currentDate.toISOString() : "";
    saveDB("Task updated");
}

const deleteTask = (index) => {
    database.tasks.pop(index);
    saveDB("Task deleted");
}

const deleteAll = () => {
    database.tasks = [];
    saveDB("All tasks deleted");
}

program.command("new [taskName] [category]")
    .action((taskName, category) => {
        createTask(taskName, category);
    });

program.command("ls [category]")
    .action((category) => {
        listTasks(category);
    });

program.command("check [index]")
    .action((index) => {     
        updateTask(index, true);
    });

program.command("uncheck [index]")
    .action((index) => {
        updateTask(index, false);
    });

program.command("del [index]")
    .action((index) => {
        deleteTask(index);
    });

program.command("cls")
    .action(() => {
        deleteAll();
    });

program.parse(process.argv);