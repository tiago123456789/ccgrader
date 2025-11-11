import InvalidDataException from "../../../exception/invalid-data.exception";
import { WATERMARK } from "../../../types/change.type";
import { BaseModificationPayload, IModification, ResultAfterApplied } from "./modification.interface";
import sharp from 'sharp';
import axios from 'axios';
import fs from 'fs';
import { randomUUID } from "crypto";

class WatermarkModification implements IModification {

    private data: BaseModificationPayload | null = null;
    getId(): string {
        return WATERMARK;
    }

    public isParamsValid(data: BaseModificationPayload): boolean {
        if (!data || data.fileInput === undefined) {
            throw new InvalidDataException(`${this.getId()} - You need to provide a fileInput.`);
        }
        if (!data || data.fileOutput === undefined) {
            throw new InvalidDataException(`${this.getId()} - You need to provide a fileOutput.`);
        }

        if (!data.position) {
            throw new InvalidDataException(`${this.getId()} - You need to provide a position.`);
        }

        const positionValues: { [key: string]: boolean } = {
            "north": true,
            "northeast": true,
            "southeast": true,
            "south": true,
            "southwest": true,
            "west": true,
            "northwest": true,
            "east": true,
        }

        if (data.position && !positionValues[data.position]) {
            throw new InvalidDataException(`${this.getId()} - You need to provide a valid position. The valid positions are: ${Object.keys(positionValues)}`);
        }

        if (!data.watermarkFileUrl) {
            throw new InvalidDataException(`${this.getId()} - You need to provide a watermarkFileUrl.`);
        }

        const isPngOrJpg = data.watermarkFileUrl.endsWith('.png') || 
                        data.watermarkFileUrl.endsWith('.jpg') || 
                        data.watermarkFileUrl.endsWith('.jpeg');
        if (!isPngOrJpg) {
        throw new InvalidDataException(`${this.getId()} - Watermark file must be a PNG, JPG or JPEG image`);
        }


        return true;
    }

    private async downloadFile(url: string, fileOutput: string): Promise<void> {
        const fileWriteStream = fs.createWriteStream(fileOutput)
        const response = await axios({
            method: 'get',
            url,
            responseType: 'stream',
        })

        if (response.status !== 200) {
            throw new Error(`Failed to download file: ${response.status}`);
        }

        response.data.pipe(fileWriteStream);

        await new Promise((resolve, reject) => {
            fileWriteStream.on('finish', () => {
                resolve({});
            });
            fileWriteStream.on('error', (err) => {
                reject(err);
            });
        });

    }

    async apply(params: BaseModificationPayload): Promise<ResultAfterApplied> {
        this.data = params

        this.isParamsValid(this.data);

        const extension = this.data.fileInput.split('.').reverse()[0];
        const watermarkPathFile = `./${randomUUID()}.${extension}`;
        await this.downloadFile(this.data.watermarkFileUrl!, watermarkPathFile);
        await sharp(this.data.fileInput)
            .composite([
                {
                    input: watermarkPathFile,
                    gravity: this.data.position,
                }
            ])
            .toFile(this.data.fileOutput!);

        console.log("passed on here watermark")

        fs.unlinkSync(watermarkPathFile);
        return { fileOutput: this.data.fileOutput! };
    }
}

export default WatermarkModification;