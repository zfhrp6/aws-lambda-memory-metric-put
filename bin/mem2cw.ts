#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Mem2CwStack } from '../lib/mem2cw-stack';
import { TargetStack } from '../lib/target-stack';

const app = new cdk.App();
// this stack contains mem2cw
const mem2cwStack = new Mem2CwStack(app, 'Mem2CwStack');

// this stack contains the target Lambda function, you want to get memory metric.
new TargetStack(app, 'TargetStack', { mem2cw: mem2cwStack.mem2cwFn });
