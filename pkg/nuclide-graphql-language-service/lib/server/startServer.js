'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let processMessage = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (message, graphQLCache, languageService) {
    if (message.length === 0) {
      return;
    }

    let json;

    try {
      json = JSON.parse(message);
    } catch (error) {
      process.stdout.write(JSON.stringify(convertToRpcMessage('error', '-1', 'Request contains incorrect JSON format')));
      return;
    }

    const { query, position, filePath } = json.args;
    const id = json.id;

    try {
      let result = null;
      let responseMsg = null;
      switch (json.method) {
        case 'disconnect':
          exitProcess(0);
          break;
        case 'getDiagnostics':
          result = yield languageService.getDiagnostics(query, filePath);
          if (result && result.length > 0) {
            const queryLines = query.split('\n');
            const totalRows = queryLines.length;
            const lastLineLength = queryLines[totalRows - 1].length;
            const lastCharacterPoint = new (_Range || _load_Range()).Point(totalRows, lastLineLength);
            result = result.filter(function (diagnostic) {
              return diagnostic.range.end.lessThanOrEqualTo(lastCharacterPoint);
            });
          }
          responseMsg = convertToRpcMessage('response', id, result);
          process.stdout.write(JSON.stringify(responseMsg) + '\n');
          break;
        case 'getDefinition':
          result = yield languageService.getDefinition(query, position, filePath);
          responseMsg = convertToRpcMessage('response', id, result);
          process.stdout.write(JSON.stringify(responseMsg) + '\n');
          break;
        case 'getAutocompleteSuggestions':
          result = yield languageService.getAutocompleteSuggestions(query, position, filePath);

          const formatted = result.map(function (res) {
            return {
              text: res.text,
              typeName: res.type ? String(res.type) : null,
              description: res.description || null
            };
          });
          responseMsg = convertToRpcMessage('response', id, formatted);
          process.stdout.write(JSON.stringify(responseMsg) + '\n');
          break;
        case 'getOutline':
          result = (0, (_getOutline || _load_getOutline()).getOutline)(query);
          responseMsg = convertToRpcMessage('response', id, result);
          process.stdout.write(JSON.stringify(responseMsg) + '\n');
          break;
        default:
          break;
      }
    } catch (error) {
      process.stdout.write(JSON.stringify(convertToRpcMessage('error', id, error.message)));
    }
  });

  return function processMessage(_x2, _x3, _x4) {
    return _ref2.apply(this, arguments);
  };
})();

var _path = _interopRequireDefault(require('path'));

var _GraphQLCache;

function _load_GraphQLCache() {
  return _GraphQLCache = require('./GraphQLCache');
}

var _getOutline;

function _load_getOutline() {
  return _getOutline = require('../interfaces/getOutline');
}

var _GraphQLLanguageService;

function _load_GraphQLLanguageService() {
  return _GraphQLLanguageService = require('../interfaces/GraphQLLanguageService');
}

var _Range;

function _load_Range() {
  return _Range = require('../utils/Range');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// RPC message types
const ERROR_RESPONSE_MESSAGE = 'error-response'; /**
                                                  * Copyright (c) 2015-present, Facebook, Inc.
                                                  * All rights reserved.
                                                  *
                                                  * This source code is licensed under the license found in the LICENSE file in
                                                  * the root directory of this source tree.
                                                  *
                                                  * 
                                                  */

// eslint-disable-next-line nuclide-internal/prefer-nuclide-uri

const ERROR_MESSAGE = 'error';
const RESPONSE_MESSAGE = 'response';
const NEXT_MESSAGE = 'next';
const COMPLETE_MESSAGE = 'complete';

exports.default = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (rawConfigDir) {
    const configDir = _path.default.resolve(rawConfigDir);

    const graphQLCache = yield (0, (_GraphQLCache || _load_GraphQLCache()).getGraphQLCache)(configDir || process.cwd());
    const languageService = new (_GraphQLLanguageService || _load_GraphQLLanguageService()).GraphQLLanguageService(graphQLCache);

    // Depending on the size of the query, incomplete query strings
    // may be streamed in. The below code tries to detect the end of current
    // batch of streamed data, splits the batch into appropriate JSON string,
    // and calls the function to process those messages.
    // This might get tricky since the query string needs to preserve the newline
    // characters to ensure the correct Range/Point values gets computed by the
    // language service interface methods. The current solution is to flow the
    // stream until aggregated data ends with the unescaped newline character,
    // pauses the stream and process the messages, and resumes back the stream
    // for another batch.
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', function (chunk) {
      data += chunk.toString();

      // Check if the current buffer contains newline character.
      const flagPosition = data.indexOf('\n');
      if (flagPosition !== -1) {
        // There may be more than one message in the buffer.
        const messages = data.split('\n');
        data = messages.pop().trim();
        messages.forEach(function (message) {
          return processMessage(message, graphQLCache, languageService);
        });
      }
    });
  });

  function startServer(_x) {
    return _ref.apply(this, arguments);
  }

  return startServer;
})();

function exitProcess(exitCode) {
  process.exit(exitCode);
}

function convertToRpcMessage(type, id, response) {
  let responseObj;
  switch (type) {
    case RESPONSE_MESSAGE:
      responseObj = { result: response };
      break;
    case ERROR_MESSAGE:
    case ERROR_RESPONSE_MESSAGE:
      responseObj = { error: response };
      break;
    case NEXT_MESSAGE:
      responseObj = { value: response };
      break;
    case COMPLETE_MESSAGE:
      // Intentionally blank
      responseObj = {};
      break;
  }
  return Object.assign({
    protocol: 'graphql_language_service',
    type,
    id
  }, responseObj);
}