import * as zlib from 'zlib';
import * as aws from 'aws-sdk';
import { CloudWatchLogsDecodedData, CloudWatchLogsEvent } from 'aws-lambda';
import { MetricDatum, PutMetricDataInput } from 'aws-sdk/clients/cloudwatch';

const cloudwatch = new aws.CloudWatch();

const NAMESPACE = 'AWS/Lambda';

const extract = (message: string): { usedMemory: number, limitMemory: number, } | null => {
  const match = message.match(/^REPORT.+Memory Size: (?<limitMemory>\d+) MB\sMax Memory Used: (?<usedMemory>\d+) MB/);

  if (match === undefined || match?.groups === undefined) {
    return null;
  }
  return { usedMemory: Number(match.groups.usedMemory), limitMemory: Number(match.groups.limitMemory) }
}

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
    Value: 100.0 * usedMemory / limitMemory,
  }

  return {
    Namespace: NAMESPACE,
    MetricData: [
      metricDatum,
    ],
  }
}

export const handler = async (event: CloudWatchLogsEvent): Promise<any> => {
  const data: CloudWatchLogsDecodedData
    = JSON.parse(zlib.gunzipSync(Buffer.from(event.awslogs.data, 'base64')).toString('utf-8'));
  const functionName = <string>data.logGroup.split('/').pop();
  const metricData = data.logEvents
    .map(event => extract(event.message))
    .filter(e => e !== null)
    .map(memoryInfo => createMetricData(functionName, memoryInfo!.usedMemory, memoryInfo!.limitMemory));
  console.log(JSON.stringify(metricData));
  return Promise.all(metricData.map(datum => cloudwatch.putMetricData(datum).promise()));
}
