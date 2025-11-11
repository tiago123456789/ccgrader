import InvalidDataException from "../../../exception/invalid-data.exception";
import { GRAYSCALE } from "../../../types/change.type";
import { BaseModificationPayload, IModification, ResultAfterApplied } from "./modification.interface";
import sharp from 'sharp';

class GrayscaleModification implements IModification {

    private data: BaseModificationPayload | null = null;
    getId(): string {
        return GRAYSCALE;
    }

    public isParamsValid(data: BaseModificationPayload): boolean {
        if (!data || data.fileInput === undefined) {
            throw new InvalidDataException(`${this.getId()} - You need to provide a fileInput.`);
        }
        if (!data || data.fileOutput === undefined) {
            throw new InvalidDataException(`${this.getId()} - You need to provide a fileOutput.`);
        }

        return true;
    }

    async apply(params: BaseModificationPayload): Promise<ResultAfterApplied> {
        this.data = params

        this.isParamsValid(this.data);
        await sharp(this.data.fileInput)
            .grayscale()
            .toFile(this.data.fileOutput!);
        
        return { fileOutput: this.data.fileOutput! };
    }
}

export default GrayscaleModification;