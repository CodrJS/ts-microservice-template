import { LoggerEntryContent, logLevel } from "kafkajs";
import winston, { transports, format } from "winston";

const toWinstonLogLevel = (level: logLevel) => {
  switch (level) {
    case logLevel.ERROR:
    case logLevel.NOTHING:
      return "error";
    case logLevel.WARN:
      return "warn";
    case logLevel.INFO:
      return "info";
    case logLevel.DEBUG:
      return "debug";
  }
};

const WinstonLogCreator = (logLevel: logLevel) => {
  const logger = winston.createLogger({
    level: toWinstonLogLevel(logLevel),
    format: format.printf(({ message, label, timestamp }) => {
      return `${timestamp} [${label}] ${message}`;
    }),
    transports: [
      new transports.Console(),
      new transports.File({ filename: "logs/error.log", level: "error" }),
      new transports.File({ filename: "logs/service.log" }),
    ],
  });

  return ({
    namespace,
    level,
    label,
    log,
  }: {
    namespace: string;
    level: logLevel;
    label: string;
    log: LoggerEntryContent;
  }) => {
    const { message, ...extra } = log;
    logger.log({
      level: toWinstonLogLevel(level),
      label,
      message: `[${namespace || "KafkaJS"}] ${message}`,
      ...extra,
    });
  };
};

export const logger = WinstonLogCreator;
