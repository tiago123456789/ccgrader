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