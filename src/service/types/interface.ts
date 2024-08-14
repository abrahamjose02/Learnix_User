export interface S3Params{
    Bucket: string;
    Key:string;
    Body: Buffer;
    ContentType: string;
}