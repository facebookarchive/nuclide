'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.callGraphQLClient = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let callGraphQLClient = exports.callGraphQLClient = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (command, args) {
    if (!graphqlPromiseQueue) {
      graphqlPromiseQueue = new (_promiseExecutors || _load_promiseExecutors()).PromiseQueue();
    }

    if (!graphqlPromiseQueue) {
      throw new Error('Invariant violation: "graphqlPromiseQueue"');
    }

    return graphqlPromiseQueue.submit((0, _asyncToGenerator.default)(function* () {
      try {
        const graphqlExecPath = require.resolve('../../nuclide-graphql-language-service/bin/graphql.js');
        const argsArray = [command];
        if (args.filePath) {
          argsArray.push(`-f ${args.filePath}`);
        }
        if (args.textBuffer) {
          let fragments = '';
          if (args.fragmentDependencies != null) {
            fragments = args.fragmentDependencies.map(function (dep) {
              return (0, (_graphql || _load_graphql()).print)(dep.fragment);
            }).join('\n');
          }
          const text = `${args.textBuffer.getText()}\n${fragments || ''}`;
          argsArray.push(`-t ${text}`);
        }
        if (args.schemaPath) {
          argsArray.push(`-s ${args.schemaPath}`);
        }
        const result = yield (0, (_process || _load_process()).asyncExecute)(graphqlExecPath, argsArray);
        if (!result) {
          throw new Error('GraphQL cli did not run with an undefined error.');
        }
        if (result.stdout) {
          switch (command) {
            case 'lint':
              const errorsJSON = JSON.parse(result.stdout);
              return Object.keys(errorsJSON).map(function (key) {
                return errorsJSON[key];
              });
          }
        } else if (result.stderr) {
          throw new Error(result.stderr);
        }
        throw new Error('Undefined error.');
      } catch (error) {
        throw new Error(error);
      }
    }));
  });

  return function callGraphQLClient(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

var _process;

function _load_process() {
  return _process = require('../../commons-node/process');
}

var _promiseExecutors;

function _load_promiseExecutors() {
  return _promiseExecutors = require('../../commons-node/promise-executors');
}

var _graphql;

function _load_graphql() {
  return _graphql = require('graphql');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let graphqlPromiseQueue = null; /**
                                 * Copyright (c) 2015-present, Facebook, Inc.
                                 * All rights reserved.
                                 *
                                 * This source code is licensed under the license found in the LICENSE file in
                                 * the root directory of this source tree.
                                 *
                                 * 
                                 */