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
    getProjects: (req, res) => {
        sequelize.query(`
            SELECT * FROM projects;
        `)
        .then((dbRes) => res.status(200).send(dbRes[0]))
        .catch(err => console.log(err));
    },

    addProject: (req, res) => {
        const {name} = req.body;

        sequelize.query(`
            INSERT INTO projects (name)
            VALUES
            ('${name}');
        `)
        .then((dbRes) => res.status(200).send(dbRes[0]))
        .catch(err => console.log(err));
    },

    updateProject: (req, res) => {
        const {id} = req.params;
        const {name} = req.body;

        sequelize.query(`
            UPDATE projects
            SET
            name = '${name}'
            WHERE id = ${id};
        `)
        .then((dbRes) => res.status(200).send(dbRes[0]))
        .catch(err => console.log(err));
    },

    deleteProject: (req, res) => {
        const {id} = req.params;

        sequelize.query(`
            DELETE FROM tasks
            WHERE project_id = ${id};

            DELETE FROM projects
            WHERE id = ${id};
        `)
        .then((dbRes) => res.status(200).send(dbRes[0]))
        .catch(err => console.log(err));
    },
    
    getTasks: (req, res) => {
        const {projectID} = req.params;

        sequelize.query(`
            SELECT * FROM tasks
            WHERE project_id = ${projectID};
        `)
        .then((dbRes) => res.status(200).send(dbRes[0]))
        .catch(err => console.log(err));
    },

    addTask: (req, res) => {
        const {projectID, name, notes, priority} = req.body;

        sequelize.query(`
            INSERT INTO tasks (project_id, name, notes, priority)
            VALUES
            (${projectID}, '${name}', '${notes}', ${priority});
        `)
        .then((dbRes) => res.status(200).send(dbRes[0]))
        .catch(err => console.log(err));
    },

    updateTask: (req, res) => {
        const {id} = req.params;
        const {projectID, name, complete} = req.body;

        sequelize.query(`
            UPDATE tasks
            SET
            project_id = ${projectID},
            name = '${name}',
            notes = '',
            priority = 1,
            complete = ${complete}
            WHERE id = ${id};
        `)
        .then((dbRes) => res.status(200).send(dbRes[0]))
        .catch(err => console.log(err));
    },

    deleteTask: (req, res) => {
        const {id} = req.params;

        sequelize.query(`
            DELETE FROM tasks
            WHERE id = ${id};
        `)
        .then((dbRes) => res.status(200).send(dbRes[0]))
        .catch(err => console.log(err));
    },
};
