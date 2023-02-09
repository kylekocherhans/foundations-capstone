require('dotenv').config();
const {CONNECTION_STRING} = process.env;

const Sequelize = require('sequelize');

const sequelize = new Sequelize(CONNECTION_STRING, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            rejectUnauthorized: false
        }
    }
});

module.exports = {
    seed: (req, res) => {
        sequelize.query(`
        drop table if exists tasks;
        drop table if exists projects;

        CREATE TABLE projects (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL
        );

        CREATE TABLE tasks (
            id SERIAL PRIMARY KEY,
            project_id INTEGER REFERENCES projects(id) NOT NULL,
            name VARCHAR(100) NOT NULL,
            notes TEXT,
            priority INTEGER,
            complete BOOLEAN
        );

        INSERT INTO projects (name)
        VALUES
        ('To Do');

        INSERT INTO tasks (project_id, name, notes, priority, complete)
        VALUES
        (1, 'Email Dan', '', 4, false),
        (1, 'Hang Shelf', '', 2, false),
        (1, 'Oil Change', 'should be changed by 2/20/2023', 3, false),
        (1, 'Back Up Pictures', 'from hard drive to Google Photos', 3, false),
        (1, 'Check Washer Fluid', '', 1, true),
        (1, 'Garbage to Street', '', 4, false);
        `).then(() => {
            console.log('DB seeded!')
            res.sendStatus(200)
        }).catch(err => console.log('error seeding DB', err))
    }
}
