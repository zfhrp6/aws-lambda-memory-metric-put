import zlib = require('zlib');
import aws = require('aws-sdk');
import { CloudWatchLogsDecodedData, CloudWatchLogsEvent } from 'aws-lambda';

var cloudwatch = new aws.CloudWatch();

export const handler = async (event: CloudWatchLogsEvent): Promise<void> => {
  const data: CloudWatchLogsDecodedData
    = JSON.parse(zlib.gunzipSync(Buffer.from(event.awslogs.data, 'base64')).toString('utf-8'));
  const functionName = <string>data.logGroup.split('/').pop();
}
exports.handler = function (input: any, context: any, callback: any) {
  var data = Buffer.from(input.awslogs.data, 'base64');
  zlib.gunzip(data, function (e: any, result: any) {
    if (e) {
      callback(e);
    } else {
      result = JSON.parse(result.toString('utf-8'));
      var functionName = result['logGroup'].split('/').pop(); // /aws/lambda/[functionName];
      var metricData = result['logEvents']
        .map(function (evt: any) {
          var match = evt['message'].match(/^REPORT.+Memory Size: (\d+) MB\sMax Memory Used: (\d+) MB/);
          if (match === null) return null;
          return {
            MetricName: 'MemoryUtilization',
            Dimensions: [
              {
                Name: 'FunctionName',
                Value: functionName
              }
            ],
            Unit: 'Percent',
            Value: 100.0 * Number(match[2]) / Number(match[1])
          };
        })
        .filter(function (data: any) { return (data !== null); })
      if (metricData.length === 0) {
        callback();
        return;
      }
      console.log(functionName, metricData);
      cloudwatch.putMetricData({
        Namespace: '${Namespace}',
        MetricData: metricData
      }, function (err: any, data: any) {
        if (err) callback(err);
        else callback(null, data);
      });
    }
  });
};