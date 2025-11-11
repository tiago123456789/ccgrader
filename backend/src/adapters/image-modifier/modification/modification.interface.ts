
interface ResultAfterApplied {
    fileOutput: string;
}

interface BaseModificationPayload {
    fileInput: string;
    fileOutput: string;
    [key: string]: any;
}

interface IModification {
    
    getId(): string;

    isParamsValid(data: BaseModificationPayload): boolean;
    
    apply(data: BaseModificationPayload): Promise<ResultAfterApplied>;
}

export type { IModification, ResultAfterApplied, BaseModificationPayload }