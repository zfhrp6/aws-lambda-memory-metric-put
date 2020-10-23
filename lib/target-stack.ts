import * as lambda from '@aws-cdk/aws-lambda';
import * as destinations from '@aws-cdk/aws-logs-destinations';
import * as logs from '@aws-cdk/aws-logs';
import * as cdk from '@aws-cdk/core';

/**
 * This stack is example.
 */

export interface TargetStackProps extends cdk.StackProps {
  mem2cw: lambda.IFunction;
}

export class TargetStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: TargetStackProps) {
    super(scope, id, props);

    const targetFn = new lambda.Function(this, 'target-function', {
      // empty lambda function
      code: lambda.Code.fromInline('exports.handler = function (input, context, callback) {};'),
      handler: 'index.handler',
      runtime: lambda.Runtime.NODEJS_12_X,
    });
    targetFn.logGroup.addSubscriptionFilter('mem2cw-subscription', {
      destination: new destinations.LambdaDestination(props.mem2cw),
      // Lambda execution info log contains `REPORT`.
      filterPattern: logs.FilterPattern.literal('REPORT'),
    });
  }
}
