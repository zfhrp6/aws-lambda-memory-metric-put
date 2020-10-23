import { SynthUtils } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as Mem2Cw from '../lib/mem2cw-stack';

expect.addSnapshotSerializer({
  test: (val) => typeof val === 'string',
  print: (val) => {
    const v = <string>val;
    const newVal = v.replace(/AssetParameters([A-Fa-f0-9]{64})(\w+)/, '[HASH REMOVED]');
    const newVal2 = newVal.replace(/(\w+) (\w+) for asset\s?(version)?\s?"([A-Fa-f0-9]{64})"/, '[HASH REMOVED]');
    return `"${newVal2}"`;
  },
});

test('Snapshot Test', () => {
  const app = new cdk.App();
  // WHEN
  const stack = new Mem2Cw.Mem2CwStack(app, 'MyTestStack');
  // THEN
  expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
});
