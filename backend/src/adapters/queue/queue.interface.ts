import IMessage from "./message/message.interface";

interface IQueueAdapter {
    
    publish(message: IMessage): Promise<void>;

    process(callback: (message: IMessage) => void, concurrency?: number): void;
}

export default IQueueAdapter;
