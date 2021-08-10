# Angular GCP Template

This project is a template to stand up a development stack with an Angular frontend, NGRX, Firebase authentication, serverless Node.js and Python APIs, and Google Cloud Platform deployments. You can fork this project and edit for your own project work. 

## How this repo works
Throughout this repository, there are placeholder values for the `PROJECT_NAME` of your project. You must change these for this template to be useful. We suggest doing a global replace in your IDE of choice. This project name should match your project name on the Google Cloud Platform console.

You also need Docker set up on your machine in order to use all of the features of this template. 

## Google Cloud Platform
You must set up GCP credentials for your development environment following the process [here](https://cloud.google.com/deployment-manager/docs/step-by-step-guide/installation-and-setup). You can configure API keys for API Gateway and Firebase in the environments.ts files.

## Frontend
This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 11.0.2. 

This project follows a container/component architecture using NGRX. Containers load data from the store or API and pass that data to components, which display the data and handle interactions.

### Install
Install packages:

`npm install` or  `npm i`

### Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

### Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build. There are currently no frontend tests implemented.

### Authentication
Authentication is handled through Firebase. You can access this on the [Firebase console](https://console.firebase.google.com). Users can create their own accounts from the frontend. This can be used or discarded at your discretion.

### Theming
Themes are set up for the frontend in the `styles.scss` file. Edit this file with your color palette to configure a custom theme. 

### Websockets
This application has boilerplate to establish a websockets connection in NGRX to ws:// and wss:// endpoints for development and production. This can be used or discarded at your discretion.  

### CORS
In order to make requests from the frontend to a GCP storage bucket, you must configure CORS. We've provided CORS configuration for GCP in the cors-config.json file. Update this with your urls and follow [these instructions](https://cloud.google.com/storage/docs/configuring-cors) to allow CORS requests on GCP storage buckets. 

## API
There is code for Python and NodeJS endpoints, though currently all are Python. You can test functions from the `if __name__ == "__main__"` block at the bottom of `main.py`.

Create a virtual environment for the Python API in the `python-api` directory and install dependencies:

`pip install -r requirements.txt`

If writing functions using NodeJS, install node modules in the `node-api` directory:

`npm i` or `npm install`

This application uses a serverless API on Google Cloud Platform. Endpoints are documented in `api/openapi-functions.yaml`. You can see the swagger documentation for the API by running from the project root:

`npm run swagger`

Requests to the API must have a key included, which is defined in `src/environments/environment.ts`. This key must also be included if testing using Postman. 

## Deployment
You can manually deploy to GCP from the project using the following npm commands:

`npm run docker-build`

`npm run docker-push`

`npm run deploy`

You can also use the provided app.yaml and cloudbuild.yaml to configure automated deployments in the GCP console. 

### API
The API is deployed using serverless. Edit the `serverless.yml` files to include your GCP account information and run `serverless deploy` to create Cloud Functions for Node or Python. 

Commands to deploy a new API Gateway config are commented at the bottom of `openapi-functions.yaml`. This config links API endpoints to Cloud Functions. 
