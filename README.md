## Technologies

- Backend
    - Node.js
    - TypeScript
    - Express.js
    - Queue(Bullmq + redis)
    - Firebase(storage and database)
    - Docker
    - Docker compose

- Frontend
    - React
    - TypeScript
    - Vite
    - TailwindCSS
    - Firebase(database)
    - Docker
    - Docker compose


## How to run the project

- Clone the repository
- Access the **backend** folder and copy the **.env.example** to **.env**
- Access the **backend** folder, go to firebase console, generate a service account and create a **fcredential.json** file.
- Access the **frontend** folder and copy the **.env.example** to **.env**
- Access the **frontend** folder, go to firebase console, generate firebase credentials to use on javascript on client side and create a **firebase.json** file.
- Execute the command `docker compose up --build` to start the projects: backend, frontend and redis container.


## Architecture

![Architecture](./architecture.png)


## Improvements points on solution

- Enable feature on redis to save data on disk to avoid lose data
- Implement solution to scale jobs based how many messages are on queue. 
    - Kubernetes has a project named KEDA (Kubernetes Event-Driven Autoscaling) that can be used to scale based on the number of messages on the queue.
    - Implement solution like AWS show on this link:  https://docs.aws.amazon.com/autoscaling/ec2/userguide/as-using-sqs-queue.html
    - Or consider replace bullmq + redis to SQS where you can plugin a Lambda function to process the messages.
- Instead show the logs from backend on console, send the logs to Cloudwatch where you can centralize the logs and create alerts if something goes wrong. For example: if the application start to generate a lot of logs with level error, you can create an alert to notify the team via slack or email. PS: you can do this easier using Winston library and change only the logger configuration.


## Extra points

- To test the endpoint you can import the **Insomnia.yaml** file on Insomnia
- Access the bull board on http://localhost:3000/bull-board to monitor the queues and how many messages are on queue
- To test the backend code, execute the command `npm run test` on backend folder


## BACKEND FOLDER STRUCTURE

```
- src
--- adapters    // The code to connect with external services
--- config      // The configuration of the application
--- constants   // The constants of the application
--- controllers // The controllers of the application
--- exception   // The exception of the application
--- factory     // The factory of the application
--- jobs        // The jobs(queue consumers) of the application
--- models      // The models of the application represents the database collection
--- middlewares // The middlewares of the application
--- routes      // The routes of the application
--- services    // The services of the application where contains the business logic
--- types       // The types of the application
--- validations // The validations of the application
```

## BACKEND ENVS

```
CORS_ORIGIN_ALLOWED=http://localhost:8080 // The origin allowed to make requests to the backend. PS: avoid any client to make request to backend if it is not allowed.

REDIS_HOST=redis // The host of the redis container
REDIS_PORT=6379 // The port of the redis container
REDIS_PASSWORD= // The password of the redis container
REDIS_DATABASE=0 // The database of the redis container
```

## FRONTEND FOLDER STRUCTURE

```
- src
--- components // The components of the application
--- hooks      // The hooks of the application where make interactions with the backend and manage the state of the application
--- pages      // The pages of the application
--- services   // The services of the application where contains code interaction with external services, such as Firebase
--- types      // The types of the application
```

## FRONTEND ENVS

```
VITE_API_URL=http://localhost:3000 // The url from backend api
```

