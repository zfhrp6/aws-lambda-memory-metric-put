import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as Mem2Cw from '../lib/mem2cw-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new Mem2Cw.Mem2CwStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
