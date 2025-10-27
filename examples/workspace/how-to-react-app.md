# How to Launch the React App Example (Vite + TypeScript)

This guide will help you set up and launch the React app example in this folder using Vite and TypeScript.

## Prerequisites
- Node.js (v16 or newer recommended)
- npm or yarn

## Setup Steps

1. **Install dependencies**

   Open a terminal in this folder and run:
   ```bash
   npm install
   # or
   yarn install
   ```

2. **Start the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

   The app will be available at [http://localhost:5173](http://localhost:5173) by default.

3. **Build for production**

   ```bash
   npm run build
   # or
   yarn build
   ```

   The production-ready files will be in the `dist` folder.

## Notes
- If you haven't created the React app yet, run:
  ```bash
  npm create vite@latest . -- --template react-ts
  ```
  Then follow the prompts and install dependencies as above.
- For more details, see the [Vite documentation](https://vitejs.dev/).
