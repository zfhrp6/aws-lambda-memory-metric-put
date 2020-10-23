# Overview
mem2cw is CDK template for Lambda function 
that Memory Usage as CloudWatch Metric Data using CloudWatchLogs subscription filter.

Original CloudFormation template is in https://github.com/watanabeshuji/mem2cw .

# Usage

`npm install && npm run build && npx cdk deploy '*'` will create mem2cw-stack and target-stack.

mem2cw-stack is the body, and target-stack is for sample.

See: http://dev.classmethod.jp/cloud/aws/send-lambda-memory-usage-to-cloudwatch/ 

# How it works?

- Create IAM Role for Lambda function.
- Create Lambda function process CloudWatch Logs streaming event (filter and put CloudWatch Metric).
- Add permission to Lambda function to invoke from CloudWatch Logs

# Useful CDK commands

this repository uses AWS CDK(Cloud Development Kit)

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template
