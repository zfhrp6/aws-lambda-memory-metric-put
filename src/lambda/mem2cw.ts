/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */
import * as zlib from 'zlib';
import * as aws from 'aws-sdk';
// eslint-disable-next-line import/no-unresolved
import { CloudWatchLogsDecodedData, CloudWatchLogsEvent } from 'aws-lambda';
import { MetricDatum, PutMetricDataInput } from 'aws-sdk/clients/cloudwatch';

const cloudwatch = new aws.CloudWatch();

const NAMESPACE = 'AWS/Lambda';

const extract = (message: string): { usedMemory: number; limitMemory: number } | null => {
  const match = message.match(/^REPORT.+Memory Size: (?<limitMemory>\d+) MB\sMax Memory Used: (?<usedMemory>\d+) MB/);

  if (match === undefined || match?.groups === undefined) {
    return null;
  }
  return {
    usedMemory: Number(match.groups.usedMemory),
    limitMemory: Number(match.groups.limitMemory),
  };
};

const createMetricData = (functionName: string, usedMemory: number, limitMemory: number): PutMetricDataInput => {
  const metricDatum: MetricDatum = {
    MetricName: 'MemoryUtilization',
    Dimensions: [
      {
        Name: 'FunctionName',
        Value: functionName,
      },
    ],
    Unit: 'Percent',
    Value: (100.0 * usedMemory) / limitMemory,
  };

  return {
    Namespace: NAMESPACE,
    MetricData: [metricDatum],
  };
};

// eslint-disable-next-line import/prefer-default-export
export function handler(event: CloudWatchLogsEvent): Promise<unknown[]> {
  const data: CloudWatchLogsDecodedData = JSON.parse(
    zlib.gunzipSync(Buffer.from(event.awslogs.data, 'base64')).toString('utf-8'),
  );
  const functionName = <string>data.logGroup.split('/').pop();
  const metricData = data.logEvents
    .map((logEvent) => extract(logEvent.message))
    .filter((memoryInfo) => memoryInfo !== null)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    .map((memoryInfo) => createMetricData(functionName, memoryInfo!.usedMemory, memoryInfo!.limitMemory));
  console.log(JSON.stringify(metricData));
  return Promise.all(metricData.map((datum) => cloudwatch.putMetricData(datum).promise()));
}
