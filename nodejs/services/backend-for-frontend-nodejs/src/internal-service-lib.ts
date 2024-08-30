import { tracer, conventions } from "./tracing/custom";

/**
 * This represents an internal library used for communication between services.
 * That is a common pattern, and a great place to customize some telemetry.
 */

const SERVICES = {
    'image-picker': 'http://image-picker:10116/imageUrl',
    'meminator': 'http://meminator:10117/applyPhraseToPicture', // this one is a POST
    'phrase-picker': 'http://phrase-picker:10118/phrase',
}

type FetchOptions = {
    method?: "GET" | "POST" | "PUT" | "DELETE",
    body?: any // will be stringified
}

/**
 * Make an HTTP request to one of our services.
 * 
 * 
 * @param service one of our known services
 * @param options choose method and/or send a body
 * @returns 
 */
export async function fetchFromService(service: keyof typeof SERVICES, options?: FetchOptions) {
    return tracer.startActiveSpan('fetchFromService', async (span) => { 
        const { method, body: bodyObject } = options || { method: "GET" };
        let body: string | null = null;
        if (bodyObject) {
            body = JSON.stringify(bodyObject);
        }
        const headers: Record<string, string> = {
            "Content-Type": "application/json"
        }
    
        const url = SERVICES[service];

        span.setAttribute('meminator.target.service', service);
        span.setAttribute(conventions.ATTR_HTTP_REQUEST_METHOD, method || 'GET');
        span.setAttribute('meminator.target.url', url);
        span.setAttribute('meminator.request_body.size', body ? body.length : 0)
    
        const response = await fetch(url, { headers, method, body });

        span.end();
    
        return response;
    });
}