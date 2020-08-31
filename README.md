# Blog  Application Backend

- This directory contains the backend source code and the frontend built code for the Bloglist application.
- The source code for the frontend application can be found in this link: https://github.com/surendp/FullStackOpen/tree/master/part7/bloglist-frontend.

## Link to the running application
- Heroku: https://blog-listing-app.herokuapp.com/

## Running Blog Application Backend

To run the backend application correctly MONGODB_URI and SECRET environment variables should be defined.
- MONGODB_URI -> URI to the mongodb database
- SECRET -> Secret key for password hashing

Step 1: Clone the repository

```
  git clone https://github.com/surendp/BlogsAppBackend.git
```

Step 2: Navigate to the directory containing the code

```
  cd ./BlogsAppBackend
```

Step 3: Install the dependencies and run the application

```
  npm install
  npm run dev
```

## Technologies used

- Node
- Express
- JWT
- MongoDB
- Mongoose
- Jest
- Supertest