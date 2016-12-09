/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @noflow
 */
'use strict';

/* eslint comma-dangle: [1, always-multiline], prefer-object-spread/prefer-object-spread: 0 */

const http = require('http');
const invariant = require('assert');
const url = require('url');
const vm = require('vm');

let currentContext = null;

process.on('message', request => {
  switch (request.method) {
    case 'prepareJSRuntime':
      currentContext = vm.createContext({console});
      sendResult(request.id);
      return;

    case 'executeApplicationScript':
      // Modify the URL to make sure we get the inline source map.
      const parsedUrl = url.parse(request.url, /* parseQueryString */ true);
      invariant(parsedUrl.query);
      parsedUrl.query.inlineSourceMap = true;
      delete parsedUrl.search;
      // $FlowIssue url.format() does not accept what url.parse() returns.
      const scriptUrl = url.format(parsedUrl);

      getScriptContents(scriptUrl, (err, script) => {
        if (err != null) {
          sendError('Failed to get script from packager: ' + err.message);
          return;
        }

        if (currentContext == null) {
          sendError('JS runtime not prepared');
          return;
        }

        if (request.inject) {
          for (const name in request.inject) {
            currentContext[name] = JSON.parse(request.inject[name]);
          }
        }

        try {
          // The file name is dummy here. Without a file name, the source map is not used.
          vm.runInContext(script, currentContext, '/tmp/react-native.js');
        } catch (e) {
          sendError('Failed to exec script: ' + e.message);
        }
        sendResult(request.id);
      });

      return;

    default:
      let returnValue = [[], [], [], 0];
      try {
        if (currentContext != null && typeof currentContext.__fbBatchedBridge === 'object') {
          returnValue =
            currentContext.__fbBatchedBridge[request.method].apply(null, request.arguments);
        }
      } catch (e) {
        sendError('Failed while making a call ' + request.method + ':::' + e.message);
      } finally {
        sendResult(request.id, JSON.stringify(returnValue));
      }

      return;
  }
});

function sendResult(replyId, result) {
  process.send({
    kind: 'result',
    replyId,
    result,
  });
}

function sendError(message) {
  process.send({
    kind: 'error',
    message,
  });
}

function getScriptContents(src, callback) {
  http
    .get(src, res => {
      res.setEncoding('utf8');
      let buff = '';
      res.on('data', chunk => { buff += chunk; });
      res.on('end', () => {
        callback(null, buff);
      });
    })
    .on('error', err => { callback(err); });
}
