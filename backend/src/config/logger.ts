import winston from 'winston';

const logFormat = winston.format.combine(
    winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ssZ'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
);

const transports: winston.transport[] = [
    new winston.transports.Console({
        level: "info",
        format: logFormat
    })
];

export const logger = winston.createLogger({
    level: "info",
    format: logFormat,
    transports,
    exitOnError: false
});

export const loggerStream = {
    write: (message: string) => {
        logger.info(message.trim());
    }
};