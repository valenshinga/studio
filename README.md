# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Local Development Setup

To run this project on your local machine for development, follow these steps:

1.  **Clone the repository:**
    If you haven't already, clone this project to your local machine.
    ```bash
    git clone <your-repository-url>
    cd <project-directory>
    ```

2.  **Install dependencies:**
    This project uses npm as its package manager. Open your terminal in the project's root directory and run:
    ```bash
    npm install
    ```

3.  **Environment Variables (Optional but Recommended for Genkit):**
    While the core Next.js app might run without specific environment variables initially, Genkit (for AI features) will likely require API keys (e.g., for Google AI Studio).
    *   Create a file named `.env.local` in the root of your project.
    *   Add any necessary environment variables in this file, for example:
        ```
        GOOGLE_API_KEY=your_google_ai_api_key_here
        ```
    *   **Important:** `.env.local` is listed in `.gitignore` by default in Next.js projects, so your keys won't be committed to version control.

4.  **Run the Development Servers:**
    This project has two main development processes:
    *   **Next.js Development Server (for the frontend):**
        This server handles the web application, page rendering, and hot reloading.
        ```bash
        npm run dev
        ```
        By default, this usually starts the app on `http://localhost:9002` (as per your `package.json` "dev" script).

    *   **Genkit Development Server (for AI flows):**
        If you are working on or testing Genkit AI flows, you'll need to run the Genkit development server.
        ```bash
        npm run genkit:dev
        ```
        Or, for automatic reloading when flow files change:
        ```bash
        npm run genkit:watch
        ```
        This server typically starts on `http://localhost:3400` and provides a UI for inspecting and testing your Genkit flows.

5.  **Access the Application:**
    *   Open your web browser and navigate to `http://localhost:9002` (or the port specified in your terminal for the Next.js app).
    *   If you're working with Genkit, you can also access the Genkit developer UI at `http://localhost:3400`.

You should now have the application running locally and be able to make changes with hot reloading.
