import { trace, context } from "@opentelemetry/api";
import * as conventions from "@opentelemetry/semantic-conventions";

export const SERVICE_NAME = 'bff-service';

export const tracer = trace.getTracer(SERVICE_NAME);

export { conventions, trace, context };