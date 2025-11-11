import storage from "../../config/storage";
import fs from 'fs';
import IStorageAdapter from "./storage.interface";

const BUCKET_NAME = 'challenge-cograder.firebasestorage.app';
class FirebaseStorageAdapter implements IStorageAdapter {
    async uploadFile(path: string): Promise<string> {
        const fileExtension = path.split('.').reverse()[0];

        const bucket = storage.bucket(BUCKET_NAME);
        const readStream = fs.createReadStream(path);
        const file = bucket.file(path);

        const writeStream = file.createWriteStream({
            metadata: {
                contentType: `image/${fileExtension}`
            },
        });

        const result = await new Promise((resolve, reject) => {
            readStream.pipe(writeStream)
                .on('error', (err) => {
                    reject(err);
                })
                .on('finish', () => {
                    file.get()
                        .then((item) => {
                            if (!item[0].metadata.mediaLink) {
                                return reject('Media link not found');
                            }

                            resolve(item[0].metadata.mediaLink);
                        }).catch((err) => {
                            reject(err);
                        });
                });
        });

        readStream.close();
        writeStream.end();

        return result as string;
    }

    async getSignedUrl(file: string, expirationInMinutes: number): Promise<string> {
        const currentDate = new Date();
        const response = await storage
            .bucket(BUCKET_NAME)
            .file(file)
            .getSignedUrl({
                action: 'read',
                expires: new Date(currentDate.setMinutes(currentDate.getMinutes() + expirationInMinutes))
            })

        return response[0];
    }
}

export default FirebaseStorageAdapter;
