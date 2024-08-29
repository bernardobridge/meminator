import './tracing/auto';
import express, { Request, Response } from 'express';
import { download } from "./download";
import { applyTextWithImagemagick } from "./applyTextWithImagemagick";
import { trace, context } from './tracing/custom';

const app = express();
const PORT = 10117;

// Middleware to parse JSON bodies
app.use(express.json());

app.get("/health", (req: Request, res: Response) => {
    res.send("OK");
});

async function simulateDelay(imageUrl: string): Promise<void> {
    const delayedImages = [
        "cat-with-bowtie.heic",
        "cat.jpg",
        "clementine.png",
        "cow-peeking.jpg",
        "different-animals-01.png",
        "dratini.png",
        "everything-is-an-experiment.png",
    ];

    if (delayedImages.some(delayedImage => imageUrl.includes(delayedImage))) {
        const delayMs = 12000; // 12 seconds delay
        await new Promise(resolve => setTimeout(resolve, delayMs));
    } else {
        return;
    }
}

app.post('/applyPhraseToPicture', async (req, res) => {
        try {
            const input = req.body;
            let { phrase: inputPhrase, imageUrl } = input;
            const phrase = inputPhrase.toLocaleUpperCase();

            const span = trace.getSpan(context.active())!;
            span.setAttribute('phrase', phrase);
            span.setAttribute('imageUrl', imageUrl);

            await simulateDelay(imageUrl)
    
            // download the image, defaulting to a local image
            const inputImagePath = await download(imageUrl);
    
            const outputImagePath = await applyTextWithImagemagick(phrase, inputImagePath);

            res.sendFile(outputImagePath);
        }
        catch (error) {
            //TODO: consider handling this with a log?
            console.error('Error creating picture:', error);
            res.status(500).send('Internal Server Error');
        }
})

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
