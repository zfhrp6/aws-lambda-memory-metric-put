import * as iam from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';
import * as logs from '@aws-cdk/aws-logs';
import * as cdk from '@aws-cdk/core';

export class Mem2CwStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const mem2cwFn = new lambda.Function(this, 'mem2cw-function', {
      code: lambda.Code.fromAsset('src/lambda'),
      handler: 'mem2cw.handler',
      runtime: lambda.Runtime.NODEJS_12_X,
      logRetention: logs.RetentionDays.ONE_YEAR,
      timeout: cdk.Duration.seconds(3)
    });
    mem2cwFn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['cloudwatch:PutMetricData'],
        effect: iam.Effect.ALLOW,
        resources: ['*']
      })
    );
    this.mem2cwFn = mem2cwFn;
  }
  mem2cwFn: lambda.IFunction;
}
