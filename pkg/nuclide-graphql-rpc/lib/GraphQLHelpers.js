/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import invariant from 'assert';
import {asyncExecute} from '../../commons-node/process';
import {PromiseQueue} from '../../commons-node/promise-executors';
import {print} from 'graphql';

let graphqlPromiseQueue: ?PromiseQueue = null;

export async function callGraphQLClient(
  command: string,
  args: Object,
): Promise<Array<Object>> {
  if (!graphqlPromiseQueue) {
    graphqlPromiseQueue = new PromiseQueue();
  }
  invariant(graphqlPromiseQueue);
  return graphqlPromiseQueue.submit(async () => {
    try {
      const graphqlExecPath = require.resolve(
        '../../nuclide-graphql-language-service/bin/graphql.js',
      );
      const argsArray = [command];
      if (args.filePath) {
        argsArray.push(`-f ${args.filePath}`);
      }
      if (args.textBuffer) {
        let fragments = '';
        if (args.fragmentDependencies != null) {
          fragments = args.fragmentDependencies.map(
            dep => print(dep.fragment),
          ).join('\n');
        }
        const text =
          `${args.textBuffer.getText()}\n${fragments || ''}`;
        argsArray.push(`-t ${text}`);
      }
      if (args.schemaPath) {
        argsArray.push(`-s ${args.schemaPath}`);
      }
      const result = await asyncExecute(
        graphqlExecPath,
        argsArray,
      );
      if (!result) {
        throw new Error('GraphQL cli did not run with an undefined error.');
      }
      if (result.stdout) {
        switch (command) {
          case 'lint':
            const errorsJSON = JSON.parse(result.stdout);
            return Object.keys(errorsJSON).map(key => errorsJSON[key]);
        }
      } else if (result.stderr) {
        throw new Error(result.stderr);
      }
      throw new Error('Undefined error.');
    } catch (error) {
      throw new Error(error);
    }
  });
}
