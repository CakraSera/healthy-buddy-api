# HealthyBuddy AI API

Welcome to the HealthyBuddy AI API! This project was born out of a passion for helping people build healthier habits through conversation and reflection. Whether you're chatting with an AI health coach or generating a weekly summary of your progress, this API is designed to be your foundation.

## API Endpoints

### Chat

| Method | Endpoint | Description                    |
| ------ | -------- | ------------------------------ |
| POST   | /chat    | Send a message to the AI coach |

### Summary

| Method | Endpoint             | Description                                    |
| ------ | -------------------- | ----------------------------------------------- |
| POST   | /summary/summary     | Request a weekly health summary (runs in background) |
| GET    | /summary/summary/{id} | Get the status/result of a summary request     |

For more detail: [http://localhost:3000](http://localhost:3000) (Scalar API reference, served from `/openapi.json`)

Summary generation runs asynchronously: a request enqueues a job on a BullMQ queue, and a separate worker process picks it up, talks to the AI, and stores the result — poll the `GET` endpoint until `status` is `done`.

## Getting Started: Your First Steps

Ready to start chatting with your health coach? Follow these simple steps:

1. **Install dependencies:**

   ```sh
   npm install
   ```

2. **Set up your environment:**

   Copy `.env` and fill in your database, Redis, and AI provider credentials.

3. **Start Postgres and run migrations:**

   ```sh
   npm run db:up
   npm run db:migrate
   ```

4. **Run the development server:**

   ```sh
   npm run dev
   ```

5. **Run the background worker (in a separate terminal):**

   ```sh
   npm run worker:dev
   ```

6. **Open your browser and visit:**

   [http://localhost:3000](http://localhost:3000)

Now you're ready to explore, build, and create with the HealthyBuddy AI API. Stay healthy!
