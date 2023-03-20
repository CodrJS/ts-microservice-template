import Logger, { transports } from "@codrjs/logger";

const MongoLogger = Logger.add("Mongo", [
  new transports.File({
    filename: "logs/mongo/all.log",
  }),
  new transports.File({
    filename: "logs/mongo/error.log",
    level: "error",
  }),
]);
export default MongoLogger;
