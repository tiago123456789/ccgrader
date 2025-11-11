import { Request, Response } from "express";
import { logger } from "../config/logger";

export default function handleExceptionMiddleware(
    err: Error, _: Request, res: Response,
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