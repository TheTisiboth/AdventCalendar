# AdventCalendar

Site deployed with Netlify  
[![Netlify Status](https://api.netlify.com/api/v1/badges/6e572c14-2221-4d04-a8cf-27db1b46df7c/deploy-status)](https://app.netlify.com/sites/mellifluous-biscotti-78c41f/deploys)

## Stack

The website is built with [React](https://react.dev/), and is bootstrapped with [Vite](https://vitejs.dev/). The database is stored in [MongoDB](https://www.mongodb.com/). The UI is built with the [MUI](https://mui.com/) Framework. The authentication is done using the [JWT](https://jwt.io/) methodology, and implemented thanks to [middy](https://middy.js.org/) for the middleware. The Frontend is making calls to [Netlify serverless functions](https://www.netlify.com/products/functions/). The pictures are stored in an [AWS S3 bucket](https://aws.amazon.com/s3/), and accessible through [AWS Cloudfront](https://aws.amazon.com/cloudfront/). This web app is compliant to Desktop and Mobile browsers (it is responsive), and is also accessible as a [PWA](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps). 

## Documentation

### Developing a Web Application with Netlify Serverless Functions and MongoDB
https://www.mongodb.com/developer/languages/javascript/developing-web-application-netlify-serverless-functions-mongodb/
