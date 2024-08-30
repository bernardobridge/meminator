import fs from 'fs';
import crypto from 'crypto';
import path from 'path';
import { tracer, SpanStatusCode } from './tracing/custom';

const DEFAULT_IMAGE_PATH = '../tmp/BusinessWitch.png';

/**
 * Download an image. If it fails, return a default one that lives on the filesystem
 * @param inputImageUrl 
 * @param inputImagePath 
 * @param req 
 * @returns 
 */
export async function download(inputImageUrl: string): Promise<string> {
    return tracer.startActiveSpan('download', async (span) => {
        try {
            if (!inputImageUrl) {
                throw new Error('No input image URL provided');
             }
             const downloadDestinationPath = `/tmp/${generateRandomFilename(path.extname(inputImageUrl))}`;
             span.setAttribute('image.download_path', downloadDestinationPath);
             await fetch(inputImageUrl)
                 .then(async (download) => {
                     const dest = fs.createWriteStream(downloadDestinationPath);
                     // ugh this is SO MESSY
                     // node-fetch@2 makes this into a simpler pipe (see commit 8cd897a56c745)
                     // but then there's no instrumentation argh
                     if (download.body === null) {
                         throw new Error(`Failed to fetch picture from meminator: ${download.status} ${download.statusText}`);
                     }
                     const reader = download.body.getReader();
                     // Stream the chunks of the picture data to the response as they are received
                     while (true) {
                         const { done, value } = await reader.read();
                         if (done) {
                             break;
                         }
                         dest.write(value);
                     }
                 })
                 .catch((err: Error) => {
                    //TODO: possibly add a log for this error or consider logging only the exception?
                    span.setAttribute('image.fallback', true);
                    span.setAttribute('image.download_path', DEFAULT_IMAGE_PATH);
                    return path.join(__dirname, DEFAULT_IMAGE_PATH);
                 });
            return downloadDestinationPath;
        } catch (err) {
            if (err instanceof Error) {
                span.recordException(err); 
            }

            span.setStatus({ code: SpanStatusCode.ERROR, message: err instanceof Error? err.message : 'Unknown error' });
            throw err;
        } finally {
            span.end();
        }

    })

}

export function generateRandomFilename(extension: string): string {
    const dotExtension = extension.startsWith('.') ? extension : `.${extension}`;
    const randomBytes = crypto.randomBytes(16).toString('hex');
    return `${randomBytes}${dotExtension}`;
}