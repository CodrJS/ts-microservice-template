import express, { Express } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";

import v1 from "./api";
import morgan from "./middlewares/morgan.middleware";
import { Error } from "./classes/Error";
import ExpressLogger from "./utils/logger";
import type { IncomingMessage, Server, ServerResponse } from "http";
import { ServiceHealth } from "@codrjs/health";

dotenv.config();

const app: Express = express();
const port = process.env.EXPRESS_PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(morgan);

app.use("/api", v1);

app.use(((err, req, res, next) => {
  // if headers are already sent, let express handler the error
  if (res.headersSent) {
    return next(err);
  }

  // if the path is for the API, have it handle the error
  if (req.path.startsWith("/api")) {
    return v1.get("errorHandler")(err, req, res, next);
  }

  // if all fails, send the error to express
  return next(err);
}) as express.ErrorRequestHandler);

app.use((req, res, next) => {
  // catch 404 errors?

  // if the path is for API v1, have v1 handler the error
  if (req.path.startsWith("/api")) {
    const err = new Error({ status: 404, message: `not found: ${req.path}` });
    return v1.get("errorHandler")(err, req, res, next);
  }
});

let server: Server<typeof IncomingMessage, typeof ServerResponse>;

export const start = () => {
  console.log("server?");
  server = app.listen(port, () => {
    ExpressLogger.info(`Started on 0.0.0.0:${port}`);
    ServiceHealth.handleEvent("express", "connect");
  });
};

export const stop = () => {
  ExpressLogger.info(`Server is shutting down`);
  ServiceHealth.handleEvent("express", "disconnect");
  server.close();
};

export default app;
