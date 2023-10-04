import createError from 'http-errors';
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import connectDB from './config/database.config';
import cors from 'cors';
import 'dotenv/config';


import userRouter from './routes/users';


connectDB()

const app = express();

const corsOptions = {
  origin: 'http://localhost:3000', // Replace with your frontend's actual origin
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Enable cookies and other credentials to be included in the request (if needed)
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join("public")));

app.use('/users', userRouter);

app.use(function (req, res, next) {
  next(createError(404));
});

export default app;
