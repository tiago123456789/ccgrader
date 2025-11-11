export default interface NewJob {
    url: string;
    changesToApply: {
        action: string;
        [key: string]: string;
    }[];
}
