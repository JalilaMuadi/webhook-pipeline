
# Webhook-Pipeline

## 🌟 Overview
**Webhook-Pipeline** is a service that receives webhooks, queues them as jobs, processes them with customizable transformations, and delivers results to registered subscribers.  
Think of it as a lightweight Zapier for automating tasks based on incoming events.

---

## ✅ Features
- CRUD API for **pipelines** and **subscribers**
- Webhook ingestion with **job queue**
- Background **worker** processing jobs with **retry logic**
- Multiple **processing types** (uppercase, mask emails, filter_high_price, add timestamp, passthrough, etc.)
- **Delivery tracking** for subscribers with delivery attempts logging
- Dockerized setup for easy deployment
- GitHub Actions CI pipeline for automated testing and quality checks

---

## 🛠 Tech Stack
- **Language:** TypeScript  
- **Database:** PostgreSQL with Drizzle ORM  
- **Server:** Express.js  
- **Background Jobs:** Node.js worker  
- **Testing:** Vitest  
- **CI/CD:** GitHub Actions  
- **Containerization:** Docker, Docker Compose  

---

## ⚡ Setup

### 1. Clone the repository
```bash
git clone https://github.com/JalilaMuadi/webhook-pipeline.git
cd webhook-pipeline
````

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file with:

```bash
DB_URL=postgres://postgres:postgres@localhost:5432/webhook
```

### 4. Run migrations

```bash
npm run migrate
```

### 5. Run the service

* **Development mode:**

```bash
npm run dev
```

* **Production mode (with worker via Docker Compose):**

```bash
docker-compose up --build
```

---

## 🧩 API Endpoints

### Pipelines

| Method | Endpoint             | Description                                  |
| ------ | -------------------- | -------------------------------------------- |
| GET    | `/api/pipelines`     | Get all pipelines                            |
| GET    | `/api/pipelines/:id` | Get a pipeline by ID                         |
| POST   | `/api/pipelines`     | Create a pipeline `{ name, processingType }` |
| PATCH  | `/api/pipelines/:id` | Update pipeline `{ name?, processingType? }` |
| DELETE | `/api/pipelines/:id` | Delete a pipeline                            |

### Subscribers

| Method | Endpoint                         | Description                        |
| ------ | -------------------------------- | ---------------------------------- |
| GET    | `/api/pipelines/:id/subscribers` | Get all subscribers for a pipeline |
| POST   | `/api/pipelines/:id/subscribers` | Add a subscriber `{ targetUrl }`   |

### Jobs

| Method | Endpoint                  | Description                          |
| ------ | ------------------------- | ------------------------------------ |
| POST   | `/api/ingest/:pipelineId` | Ingest webhook payload into pipeline |
| GET    | `/api/jobs/:id`           | Get job status and delivery attempts |

---

## 🔄 Processing Types

* `uppercase` → Converts strings to uppercase
* `lowercase` → Converts strings to lowercase
* `add_timestamp` → Adds a `processedAt` timestamp
* `mask_emails` → Masks emails for privacy
* `filter_high_price` → Skips items with price < 100
* `format_for_discord` → Formats message for Discord
* `passthrough` → Sends the payload as-is

---

## ⚙️ Worker

The background worker:

* Fetches pending jobs every 10 seconds
* Applies the processing type
* Sends results to subscribers
* Retries failed deliveries up to **3 times**
* Logs all delivery attempts

---

## 🏗 Architecture

```text
[Webhook POST] --> [API Server] --> [Jobs Table] --> [Worker] --> [Subscribers]
```

* **Separation of concerns:** API only queues jobs, worker does background processing
* **Database:** tracks pipelines, subscribers, jobs, and delivery attempts
* **Retry logic:** ensures reliability on delivery failures

---

## 🧪 Tests

* Unit tests with **Vitest**
* Transformations & pipeline operations are covered

```bash
npm run test
```

---

## 💡 Design Decisions

* **Drizzle ORM:** type-safe SQL queries
* **Worker + retry logic:** asynchronous processing ensures fast webhook responses
* **Dockerized setup:** simplifies running locally & in production
* **Delivery attempts logging:** gives observability and debugging info

---

## 🚀 Stretch Goals / Future Improvements

* Webhook signature verification for security
* Rate limiting and concurrency control
* Dashboard UI for pipelines & jobs
* Metrics & monitoring
* Additional processing types and pipeline chaining

---

## 🎬 Demo

Be ready to show:

* Creating pipelines & subscribers
* Sending a webhook payload
* Worker processing jobs in the background
* Delivery attempts & retries

```
