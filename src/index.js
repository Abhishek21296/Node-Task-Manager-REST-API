const express = require('express')
require('./db/mongoose')        //ensures the file mongoose will run and connect to database

const user_router = require('./routers/user_router')
const task_router = require('./routers/task_router')

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(user_router)
app.use(task_router)

app.listen(port, () => {
    console.log('Server started on port', port);
})