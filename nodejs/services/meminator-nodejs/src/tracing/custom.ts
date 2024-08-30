import { trace, context, SpanStatusCode } from "@opentelemetry/api";
import * as conventions from "@opentelemetry/semantic-conventions";

export const SERVICE_NAME = 'meminator-service';

export const tracer = trace.getTracer(SERVICE_NAME);

export { conventions, trace, context, SpanStatusCode };