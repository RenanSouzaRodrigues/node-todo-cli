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

const createTask = (taskName) => {
    const currentDate = new Date();
    currentDate.setHours(currentDate.getHours() - 3);
    const newTask = { 
        id: Date.now(), 
        name: taskName, 
        completed: false, 
        createdAt: currentDate.toISOString(), 
        completedAt: "" 
    }
    database.tasks.push(newTask);
    saveDB("New task created");
} 

const listTasks = () => {
    const mappedTasks = database.tasks.map(task => {
        return {
            completed: task.completed ? "✅" : "❌",
            name: task.name,
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

program.command("new [taskName]")
    .action((taskName) => {
        createTask(taskName);
    });

program.command("ls")
    .action(() => {
        listTasks();
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