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
3. If you're not using local MongoDB wothout specific user, you have to change the mongoURI value in `index.js` at line 6 with your connection URI (You can learn more About Connection URI [here](https://www.mongodb.com/docs/drivers/node/current/fundamentals/connection/connect/).)
4. Run following commands:

```
npm init -y
npm install
node index.js
```

5. Open your client application (like a browser or postman or etc) and send your requests to `http://localhost:3000/tasks`.
