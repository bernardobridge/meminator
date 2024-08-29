import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { SERVICE_NAME } from './custom';

const sdk: NodeSDK = new NodeSDK({
    traceExporter: new OTLPTraceExporter(),
    serviceName: SERVICE_NAME,
    instrumentations: [
        getNodeAutoInstrumentations({
            '@opentelemetry/instrumentation-fs': {
                enabled: false,
            }
        }),
    ],
});

sdk.start();