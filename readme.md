# Node.js API

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
    POSTGRES_URL=postgresql://{USER}:{PASSWORD}@localhost:5432/{DB_NAME}
    TOKEN_SECRET={SECRET}
    ```
   There is an auth script to generate a token if needed
    ```bash
    tsx scripts/auth.ts
    ```
4. Start the server
    ```bash
    pnpm dev
    ```