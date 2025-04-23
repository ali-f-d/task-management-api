# task-management-api

This a simple project for using MongoDB database to add, check, edit or delete tasks with HTTP requests.

## Features

- Using GET method to get existing tasks
- Using POST method to create a new task
- Using PATCH and PUT methods for update xisting tasks
- Using DELETE method for deleting existing tasks.

## How to Run

1. Change your working directory to the path of the project.
2. Make sure your MongoDB server is running.
3. If you're not using local MongoDB wothout specific user, you have to change the mongoURI value in `mongo.js` at line 4 with your connection URI (You can learn more About Connection URI [here](https://www.mongodb.com/docs/drivers/node/current/fundamentals/connection/connect/).)
4. Run following commands:

```
npm init -y
npm install
node index.js
```

5. Open your client application (like a browser or postman or etc) and send your requests to `http://localhost:3000/tasks`.

## How to Use

You can use any http client application to send following requests to api on `http://localhost:3000/tasks`:

1. `GET` request to get all tasks from database
2. `POST` request to create a new task. you must send a JSON in your request's body and it have to contain a `name` property.
3. `GET` request to find tasks with specific name. you should request to `localhost:3000/tasks/<name>` where the `<name>` is the `name` of task to search.
4. `PUT` and `PATCH` requests do the same thing. you must request to `localhost:3000/tasks/<name>` where the `<name>` is the `name` of task to search and send your new data in your request's body to update the first request found with specific `name`.
5. `DELETE` request to delete the first task with the name you asked by URL as I described for previous requests.
