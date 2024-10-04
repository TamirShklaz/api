// vitest.setup.ts
import { afterAll, beforeAll } from "vitest";
import app from "@/app"; // Adjust the import to your app's entry point

let server: any;

beforeAll(() => {
  server = app.listen(0, () => {
    const port = server.address().port;

    console.log(`Test server is running on port ${port}`);
  });
});

afterAll(() => {
  server.close(() => {
    console.log("Test server closed");
  });
});
