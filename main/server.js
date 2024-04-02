const inquirer = require('inquirer');
const mysql = require('mysql2');
require ('dotenv').config();


const db = mysql.createConnection(
    {
        host: '127.0.0.1',
        user: 'root',
        //get password from .env file
        password: process.env.DB_PASSWORD,
        database: 'employees_db'
    },
    console.log(`Connected to the employee database.`)
);

function startApp () {
inquirer.prompt([
    {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: ['View all departments', 
                 'View all roles', 
                'View all employees', 
                'Add a department', 
                'Add a role', 
                'Add an employee', 
                'Update an employee role', 
                'Update an employee manager', 
                'Delete departments', 
                'Delete roles', 
                'Delete employees']
    }    
]).then((response) => {
    switch (response.action) {
        case 'View all departments':
            viewDepartments();
            break;
        case 'View all roles':
            viewRoles();
            break;
        case 'View all employees':
            viewEmployees();
            break;
        case 'Add a department':
            addDepartment();
            break;
        case 'Add a role':
            addRole();
            break;
        case 'Add an employee':
            addEmployee();
            break;
        case 'Update an employee role':
            updateRole();
            break;
        case 'Update an employee manager':
            updateManager();
            break;
        case 'Delete departments':
            deleteDepartment();
            break;
        case 'Delete roles':
            deleteRole();
            break;
        case 'Delete employees':
            deleteEmployee();
            break;
    }
});
}

// View all departments
function viewDepartments() {
    db.query('SELECT * FROM department', function (err, results) {
        console.table(results);
        startApp();
    });
}

// View all roles
function viewRoles() {
    db.query('SELECT * FROM role', function (err, results) {
        console.table(results);
        startApp();
    });
}

// View all employees
function viewEmployees() {
    // join salary based on role_id
    db.query('SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, manager_id, department.name AS department FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id', function (err, results) {
        console.table(results);
        startApp();
    });
}



// Add a department
function addDepartment() {
    inquirer.prompt([
        {
            type: 'input',
            name: 'department',
            message: 'What department would you like to add?'
        }
    ]).then((response) => {
        db.query('INSERT INTO department SET ?', {name: response.department}, function (err, results) {
            console.log('Department added.');
            viewDepartments();
        });
    });
}

// Add a role
function addRole() {
    db.query('SELECT * FROM department', function (err, results) {
        const departmentList = results.map(department => {
            return {
                name: department.name,
                value: department.id
            }
    });
    inquirer.prompt([
        {
            type: 'input',
            name: 'title',
            message: 'What role would you like to add?'
        },
        {
            type: 'input',
            name: 'salary',
            message: 'What is the salary for this role?'
        },
        {
            type: 'list',
            name: 'department_id',
            message: 'What is the department ID for this role?',
            choices: departmentList
        }
    ]).then((response) => {
        db.query('INSERT INTO role SET ?', {title: response.title, salary: response.salary, department_id: response.department_id}, function (err, results) {
            console.log('Role added.');
            viewRoles();
        });
    });
});
}

// Add an employee
function addEmployee() {
    db.query('SELECT * FROM role', function (err, results) {
        const roleList = results.map(role => {
            return {
                name: role.title,
                value: role.id
            }
        });
        inquirer.prompt([
            {
                type: 'input',
                name: 'first_name',
                message: 'What is the employee\'s first name?'
            },
            {
                type: 'input',
                name: 'last_name',
                message: 'What is the employee\'s last name?'
            },
            {
                type: 'list',
                name: 'role_id',
                message: 'What is the employee\'s role ID?',
                choices: roleList
            },

        ]).then((response) => {
            db.query('INSERT INTO employee SET ?', {first_name: response.first_name, last_name: response.last_name, role_id: response.role_id}, function (err, results) {
                console.log('Employee added.');
                viewEmployees();
            });
        });
    });
}

// Update an employee role

function updateRole() {
    db.query('SELECT * FROM employee', function (err, results) {
        const employeeList = results.map(employee => {
            return {
                name: `${employee.first_name} ${employee.last_name}`,
                value: employee.id
            }
        });
        db.query('SELECT * FROM role', function (err, results) {
            const roleList = results.map(role => {
                return {
                    name: role.title,
                    value: role.id
                }
            });
            inquirer.prompt([
                {
                    type: 'list',
                    name: 'employee_id',
                    message: 'Which employee would you like to update?',
                    choices: employeeList
                },
                {
                    type: 'list',
                    name: 'role_id',
                    message: 'What is the employee\'s new role?',
                    choices: roleList
                }
            ]).then((response) => {
                db.query('UPDATE employee SET role_id = ? WHERE id = ?', [response.role_id, response.employee_id], function (err, results) {
                    console.log('Employee role updated.');
                    startApp();
                });
            });
        });
    });
}

// Update an employee manager

function updateManager() {
    db.query('SELECT * FROM employee', function (err, results) {
        const employeeList = results.map(employee => {
            return {
                name: `${employee.first_name} ${employee.last_name}`,
                value: employee.id
            }
        });
        inquirer.prompt([
            {
                type: 'list',
                name: 'employee_id',
                message: 'Which employee would you like to update?',
                choices: employeeList
            },
            {
                type: 'input',
                name: 'manager_id',
                message: 'What is the employee\'s new manager ID?'
            }
        ]).then((response) => {
            db.query('UPDATE employee SET manager_id = ? WHERE id = ?', [response.manager_id, response.employee_id], function (err, results) {
                console.log('Employee manager updated.');
                startApp();
            });
        });
    });
}

// Delete departments

function deleteDepartment() {
    db.query('SELECT * FROM department', function (err, results) {
        const departmentList = results.map(department => {
            return {
                name: department.name,
                value: department.id
            }
        });
        inquirer.prompt([
            {
                type: 'list',
                name: 'id',
                message: 'Which department would you like to delete?',
                choices: departmentList
            }
        ]).then((response) => {
            db.query('DELETE FROM department WHERE id = ?', response.id, function (err, results) {
                console.log('Department deleted.');
                startApp();
            });
        });
    })
}

// Delete roles

function deleteRole() {
    db.query('SELECT * FROM role', function (err, results) {
        const roleList = results.map(role => {
            return {
                name: role.title,
                value: role.id
            }
        });
        inquirer.prompt([
            {
                type: 'list',
                name: 'id',
                message: 'Which role would you like to delete?',
                choices: roleList
            }
        ]).then((response) => {
            db.query('DELETE FROM role WHERE id = ?', response.id, function (err, results) {
                console.log('Role deleted.');
                startApp();
            });
        });
    })
}

// Delete employees

function deleteEmployee() {
    db.query('SELECT * FROM employee', function (err, results) {
        const employeeList = results.map(employee => {
            return {
                name: `${employee.first_name} ${employee.last_name}`,
                value: employee.id
            }
        });
        inquirer.prompt([
            {
                type: 'list',
                name: 'id',
                message: 'Which employee would you like to delete?',
                choices: employeeList
            }
        ]).then((response) => {
            db.query('DELETE FROM employee WHERE id = ?', response.id, function (err, results) {
                console.log('Employee deleted.');
                startApp();
            });
        });
    });
}


startApp();