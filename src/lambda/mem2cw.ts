import zlib = require('zlib');
import aws = require('aws-sdk');
import { CloudWatchLogsDecodedData, CloudWatchLogsEvent } from 'aws-lambda';

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
  return {
    Namespace: NAMESPACE,
    MetricData: [
      {
        MetricName: 'MemoryUtilization',
        Dimensions: [
          {
            Name: 'FunctionName',
            Value: functionName,
          },
        ],
        Unit: 'Percent',
        Value: 100.0 * usedMemory / limitMemory,
      },
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

// ------------------------- aws-sdk type definitions below: ----------------------------
type Namespace = string;
type MetricName = string;

type MetricData = MetricDatum[];
interface MetricDatum {
  /**
   * The name of the metric.
   */
  MetricName: MetricName;
  /**
   * The dimensions associated with the metric.
   */
  Dimensions?: Dimensions;
  /**
   * The time the metric data was received, expressed as the number of milliseconds since Jan 1, 1970 00:00:00 UTC.
   */
  Timestamp?: Timestamp;
  /**
   * The value for the metric. Although the parameter accepts numbers of type Double, CloudWatch rejects values that are either too small or too large. Values must be in the range of -2^360 to 2^360. In addition, special values (for example, NaN, +Infinity, -Infinity) are not supported.
   */
  Value?: DatapointValue;
  /**
   * The statistical values for the metric.
   */
  StatisticValues?: StatisticSet;
  /**
   * Array of numbers representing the values for the metric during the period. Each unique value is listed just once in this array, and the corresponding number in the Counts array specifies the number of times that value occurred during the period. You can include up to 150 unique values in each PutMetricData action that specifies a Values array. Although the Values array accepts numbers of type Double, CloudWatch rejects values that are either too small or too large. Values must be in the range of -2^360 to 2^360. In addition, special values (for example, NaN, +Infinity, -Infinity) are not supported.
   */
  Values?: Values;
  /**
   * Array of numbers that is used along with the Values array. Each number in the Count array is the number of times the corresponding value in the Values array occurred during the period.  If you omit the Counts array, the default of 1 is used as the value for each count. If you include a Counts array, it must include the same amount of values as the Values array.
   */
  Counts?: Counts;
  /**
   * When you are using a Put operation, this defines what unit you want to use when storing the metric. In a Get operation, this displays the unit that is used for the metric.
   */
  Unit?: StandardUnit;
  /**
   * Valid values are 1 and 60. Setting this to 1 specifies this metric as a high-resolution metric, so that CloudWatch stores the metric with sub-minute resolution down to one second. Setting this to 60 specifies this metric as a regular-resolution metric, which CloudWatch stores at 1-minute resolution. Currently, high resolution is available only for custom metrics. For more information about high-resolution metrics, see High-Resolution Metrics in the Amazon CloudWatch User Guide.  This field is optional, if you do not specify it the default of 60 is used.
   */
  StorageResolution?: StorageResolution;
}
interface PutMetricDataInput {
  /**
   * The namespace for the metric data. To avoid conflicts with AWS service namespaces, you should not specify a namespace that begins with AWS/ 
   */
  Namespace: Namespace;
  /**
   * The data for the metric. The array can include no more than 20 metrics per call.
   */
  MetricData: MetricData;
}
type Dimensions = Dimension[];
type DimensionName = string;
type DimensionValue = string;
type Timestamp = Date;
type Counts = DatapointValue[];

type StandardUnit = "Seconds" | "Microseconds" | "Milliseconds" | "Bytes" | "Kilobytes" | "Megabytes" | "Gigabytes" | "Terabytes" | "Bits" | "Kilobits" | "Megabits" | "Gigabits" | "Terabits" | "Percent" | "Count" | "Bytes/Second" | "Kilobytes/Second" | "Megabytes/Second" | "Gigabytes/Second" | "Terabytes/Second" | "Bits/Second" | "Kilobits/Second" | "Megabits/Second" | "Gigabits/Second" | "Terabits/Second" | "Count/Second" | "None" | string;
type Values = DatapointValue[];
type DatapointValue = number;
type StorageResolution = number;
interface StatisticSet {
  /**
   * The number of samples used for the statistic set.
   */
  SampleCount: DatapointValue;
  /**
   * The sum of values for the sample set.
   */
  Sum: DatapointValue;
  /**
   * The minimum value of the sample set.
   */
  Minimum: DatapointValue;
  /**
   * The maximum value of the sample set.
   */
  Maximum: DatapointValue;
}

interface Dimension {
  /**
   * The name of the dimension. Dimension names cannot contain blank spaces or non-ASCII characters.
   */
  Name: DimensionName;
  /**
   * The value of the dimension.
   */
  Value: DimensionValue;
}
