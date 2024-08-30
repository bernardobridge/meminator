import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { ExpressLayerType } from '@opentelemetry/instrumentation-express';
import { SERVICE_NAME } from './custom';
import {
    diag,
    DiagConsoleLogger,
    DiagLogLevel
} from '@opentelemetry/api';

if (process.env.DEBUG) {
    diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ERROR);
} 

const sdk: NodeSDK = new NodeSDK({
    traceExporter: new OTLPTraceExporter(),
    serviceName: SERVICE_NAME,
    instrumentations: [
        getNodeAutoInstrumentations({
            '@opentelemetry/instrumentation-fs': {
                enabled: false,
            },
            '@opentelemetry/instrumentation-express': {
                ignoreLayersType: [ExpressLayerType.MIDDLEWARE, ExpressLayerType.REQUEST_HANDLER],
            },
        }),
        
    ],
});

sdk.start();