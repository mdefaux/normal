# Datagrid Normaly Example Web App

## How to run
from the backend folder `cd ../dbapp` do:

    npm start

from another terminal

    yarn dev

## How to create from Scratch

    yarn create vite@latest ./

choose react

    yarn
    yarn dev

## Configure Vite to point to backend
In Vite `config.js` file:

    import { defineConfig } from 'vite'
    import react from '@vitejs/plugin-react'

    // https://vitejs.dev/config/
    export default defineConfig({
        plugins: [react()],
        build: {
            manifest: true,
            rollupOptions: {
            input: './src/main.jsx',
            },
        },
        server: {
            proxy: {
            "/api": "http://localhost:5000/", // the address that u serve in the backend 
            },
        },
    })

 ## Install normaly or link

    yarn add normaly

    npm link normaly

## Install Table

    yarn add forte-table

