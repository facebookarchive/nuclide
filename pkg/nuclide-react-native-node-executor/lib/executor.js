/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

'use strict';

/* eslint-disable no-var, no-console, prefer-arrow-callback */

var http = require('http');
var invariant = require('assert');
var url = require('url');
var vm = require('vm');

var currentContext = null;

process.on('message', function(request) {
  switch (request.method) {
    case 'prepareJSRuntime':
      currentContext = vm.createContext({console});
      sendResult(request.id);
      return;

    case 'executeApplicationScript':
      // Modify the URL to make sure we get the inline source map.
      var parsedUrl = url.parse(request.url, /* parseQueryString */ true);
      invariant(parsedUrl.query);
      parsedUrl.query.inlineSourceMap = true;
      delete parsedUrl.search;
      // $FlowIssue url.format() does not accept what url.parse() returns.
      var scriptUrl = url.format(parsedUrl);

      getScriptContents(scriptUrl, function(err, script) {
        if (err != null) {
          sendError('Failed to get script from packager: ' + err.message);
          return;
        }

        if (currentContext == null) {
          sendError('JS runtime not prepared');
          return;
        }

        if (request.inject) {
          for (var name in request.inject) {
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
      var returnValue = [[], [], [], [], []];
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
    .get(src, function(res) {
      res.setEncoding('utf8');
      var buff = '';
      res.on('data', function(chunk) { buff += chunk; });
      res.on('end', () => {
        callback(null, buff);
      });
    })
    .on('error', function(err) { callback(err); });
}
