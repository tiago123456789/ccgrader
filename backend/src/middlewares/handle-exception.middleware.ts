import { NextFunction, Request, Response } from "express";
import { logger } from "../config/logger";

export default function handleExceptionMiddleware(
    // @ts-ignore
    err: Error, _: Request, res: Response, next: NextFunction
): void {

    switch (err.name) {
        case "NotFoundException":
            res.status(404).json({
                error: err.message.toString()
            });
            break;
        case "InvalidDataException":
            res.status(400).json({
                error: err.message.toString()
            });
            break;
        default:
            logger.error(`Error: ${err?.message}`, err);
            res.status(500).json({
                error: 'Internal server error'
            });
    }
}