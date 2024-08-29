
import { generateRandomFilename } from "./download";
import { spawnProcess } from "./shellOut";
import { tracer, SpanStatusCode } from './tracing/custom';

const IMAGE_MAX_HEIGHT_PX = 1000;
const IMAGE_MAX_WIDTH_PX = 1000;

export async function applyTextWithImagemagick(phrase: string, inputImagePath: string) {
    return tracer.startActiveSpan('applyTextWithImagemagick', async (span) => {
        try {
            const outputImagePath = `/tmp/${generateRandomFilename('png')}`;
            span.setAttribute('image.output_path', outputImagePath);

            const args = [inputImagePath,
                '-resize', `${IMAGE_MAX_WIDTH_PX}x${IMAGE_MAX_HEIGHT_PX}\>`,
                '-gravity', 'North',
                '-pointsize', '48',
                '-fill', 'white',
                '-undercolor', '#00000080',
                '-font', 'Angkor-Regular',
                '-annotate', '0', `${phrase}`,
                outputImagePath];
        
            const processResult = await spawnProcess('convert', args);
        
            return outputImagePath
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
