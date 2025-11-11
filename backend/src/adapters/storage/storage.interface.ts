
interface IStorageAdapter {
 
    uploadFile(file: string): Promise<string>;

    getSignedUrl(file: string, expirationInMinutes: number): Promise<string>;
}

export default IStorageAdapter;