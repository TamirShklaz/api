# Node.js API mocking a posts and comments API

## Getting Started

1. Install packages
    ```bash
    pnpm install
    ```
2. Setup the db
    ```bash
    docker-compose up 
    ```
3. Create a .env file in the root directory and add the following
   ```env
    POSTGRES_URL=postgresql://postgres:postgres@localhost:5432/yc_db
    TOKEN_SECRET=fbdad1567e422c15cbde2f39f2f03e49d1f475748f5b7d4feee0cd867f4ab5f3d434cd0008a29f7c49f6d1ddb266575da576e92d7980bf345893ee76c42000a9
    ```
   Update the POSTGRES_URL to match your db connection string if you change docker-compuse.yml

   There is an auth script to generate a new token secret if needed
    ```bash
    tsx scripts/auth.ts
    ```
4. Run DB migrations
    ```bash
    pnpm db:migrate
    ```
5. Seed the db
    ```bash
    pnpm db:seed
    ```
6. Start the server
    ```bash
    pnpm dev
    ```
   If you're using Webstorm you can update run http files under the http-testing directory


7. Test the server
   ```bash
    pnpm test
   ```

# API Endpoints

Basic email, password authentication is used for the API. The password is hashed using bcrypt.

## Auth

- POST /api/v1/auth/login
- POST /api/v1/auth/register

## Posts

- GET /api/v1/posts
- GET /api/v1/posts/:id
- POST /api/v1/posts - Requires authentication
- POST /api/v1/posts/:id/comments - Requires authentication

# Project structure

The API is defined in the src/api directory.
The schema is defined in db/schema.ts