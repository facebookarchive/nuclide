Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.base64Decode = base64Decode;
exports.makeDbgpMessage = makeDbgpMessage;
exports.makeMessage = makeMessage;
exports.pathToUri = pathToUri;
exports.uriToPath = uriToPath;
exports.launchScriptForDummyConnection = launchScriptForDummyConnection;
exports.launchScriptToDebug = launchScriptToDebug;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

var _shellQuote = require('shell-quote');

var DUMMY_FRAME_ID = 'Frame.0';

exports.DUMMY_FRAME_ID = DUMMY_FRAME_ID;

function base64Decode(value) {
  return new Buffer(value, 'base64').toString();
}

function makeDbgpMessage(message) {
  return String(message.length) + '\x00' + message + '\x00';
}

function makeMessage(obj, body) {
  body = body || '';
  var result = '<?xml version="1.0" encoding="iso-8859-1"?>' + '<response xmlns="urn:debugger_protocol_v1" xmlns:xdebug="http://xdebug.org/dbgp/xdebug"';
  for (var key in obj) {
    result += ' ' + key + '="' + obj[key] + '"';
  }
  result += '>' + body + '</response>';
  return makeDbgpMessage(result);
}

function pathToUri(path) {
  return 'file://' + path;
}

function uriToPath(uri) {
  var components = require('url').parse(uri);
  // Some filename returned from hhvm does not have protocol.
  if (components.protocol !== 'file:' && components.protocol !== null) {
    _utils2['default'].logErrorAndThrow('unexpected file protocol. Got: ' + components.protocol);
  }
  return components.pathname || '';
}

/**
 * Used to start the HHVM instance that the dummy connection connects to so we can evaluate
 * expressions in the REPL.
 */

function launchScriptForDummyConnection(scriptPath) {
  return launchPhpScriptWithXDebugEnabled(scriptPath);
}

/**
 * Used to start an HHVM instance running the given script in debug mode.
 */

function launchScriptToDebug(scriptPath, sendToOutputWindow) {
  return new Promise(function (resolve) {
    launchPhpScriptWithXDebugEnabled(scriptPath, function (text) {
      sendToOutputWindow(text);
      resolve();
    });
  });
}

function launchPhpScriptWithXDebugEnabled(scriptPath, sendToOutputWindowAndResolve) {
  var child_process = require('child_process');
  var scriptArgv = (0, _shellQuote.parse)(scriptPath);
  var args = ['-c', 'xdebug.ini'].concat(_toConsumableArray(scriptArgv));
  // TODO[jeffreytan]: make hhvm path configurable so that it will
  // work for non-FB environment.
  var proc = child_process.spawn('/usr/local/hphpi/bin/hhvm', args);
  _utils2['default'].log('child_process(' + proc.pid + ') spawned with xdebug enabled for: ' + scriptPath);

  proc.stdout.on('data', function (chunk) {
    // stdout should hopefully be set to line-buffering, in which case the

    var block = chunk.toString();
    var output = 'child_process(' + proc.pid + ') stdout: ' + block;
    _utils2['default'].log(output);
  });
  proc.on('error', function (err) {
    _utils2['default'].log('child_process(' + proc.pid + ') error: ' + err);
    if (sendToOutputWindowAndResolve != null) {
      sendToOutputWindowAndResolve('The process running script: ' + scriptPath + ' encountered an error: ' + err);
    }
  });
  proc.on('exit', function (code) {
    _utils2['default'].log('child_process(' + proc.pid + ') exit: ' + code);
    if (sendToOutputWindowAndResolve != null) {
      sendToOutputWindowAndResolve('Script: ' + scriptPath + ' exited with code: ' + code);
    }
  });
  return proc;
}
// string would come on one line.
//# sourceMappingURL=data:application/json;base64,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QkFBb0IsSUFBSSxDQUFDLEdBQUcsa0JBQWEsS0FBSyxBQUFFLENBQUM7QUFDN0QsdUJBQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0dBQ3BCLENBQUMsQ0FBQztBQUNILE1BQUksQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLFVBQUEsR0FBRyxFQUFJO0FBQ3RCLHVCQUFPLEdBQUcsb0JBQWtCLElBQUksQ0FBQyxHQUFHLGlCQUFZLEdBQUcsQ0FBRyxDQUFDO0FBQ3ZELFFBQUksNEJBQTRCLElBQUksSUFBSSxFQUFFO0FBQ3hDLGtDQUE0QixrQ0FDSyxVQUFVLCtCQUEwQixHQUFHLENBQ3ZFLENBQUM7S0FDSDtHQUNGLENBQUMsQ0FBQztBQUNILE1BQUksQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLFVBQUEsSUFBSSxFQUFJO0FBQ3RCLHVCQUFPLEdBQUcsb0JBQWtCLElBQUksQ0FBQyxHQUFHLGdCQUFXLElBQUksQ0FBRyxDQUFDO0FBQ3ZELFFBQUksNEJBQTRCLElBQUksSUFBSSxFQUFFO0FBQ3hDLGtDQUE0QixjQUFZLFVBQVUsMkJBQXNCLElBQUksQ0FBRyxDQUFDO0tBQ2pGO0dBQ0YsQ0FBQyxDQUFDO0FBQ0gsU0FBTyxJQUFJLENBQUM7Q0FDYiIsImZpbGUiOiJoZWxwZXJzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IGxvZ2dlciBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7cGFyc2V9IGZyb20gJ3NoZWxsLXF1b3RlJztcblxuZXhwb3J0IGNvbnN0IERVTU1ZX0ZSQU1FX0lEID0gJ0ZyYW1lLjAnO1xuXG5leHBvcnQgZnVuY3Rpb24gYmFzZTY0RGVjb2RlKHZhbHVlOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gbmV3IEJ1ZmZlcih2YWx1ZSwgJ2Jhc2U2NCcpLnRvU3RyaW5nKCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYWtlRGJncE1lc3NhZ2UobWVzc2FnZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIFN0cmluZyhtZXNzYWdlLmxlbmd0aCkgKyAnXFx4MDAnICsgbWVzc2FnZSArICdcXHgwMCc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYWtlTWVzc2FnZShvYmo6IE9iamVjdCwgYm9keTogP3N0cmluZyk6IHN0cmluZyB7XG4gIGJvZHkgPSBib2R5IHx8ICcnO1xuICBsZXQgcmVzdWx0ID0gJzw/eG1sIHZlcnNpb249XCIxLjBcIiBlbmNvZGluZz1cImlzby04ODU5LTFcIj8+JyArXG4gICAgJzxyZXNwb25zZSB4bWxucz1cInVybjpkZWJ1Z2dlcl9wcm90b2NvbF92MVwiIHhtbG5zOnhkZWJ1Zz1cImh0dHA6Ly94ZGVidWcub3JnL2RiZ3AveGRlYnVnXCInO1xuICBmb3IgKGNvbnN0IGtleSBpbiBvYmopIHtcbiAgICByZXN1bHQgKz0gJyAnICsga2V5ICsgJz1cIicgKyBvYmpba2V5XSArICdcIic7XG4gIH1cbiAgcmVzdWx0ICs9ICc+JyArIGJvZHkgKyAnPC9yZXNwb25zZT4nO1xuICByZXR1cm4gbWFrZURiZ3BNZXNzYWdlKHJlc3VsdCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXRoVG9VcmkocGF0aDogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuICdmaWxlOi8vJyArIHBhdGg7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1cmlUb1BhdGgodXJpOiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCBjb21wb25lbnRzID0gcmVxdWlyZSgndXJsJykucGFyc2UodXJpKTtcbiAgLy8gU29tZSBmaWxlbmFtZSByZXR1cm5lZCBmcm9tIGhodm0gZG9lcyBub3QgaGF2ZSBwcm90b2NvbC5cbiAgaWYgKGNvbXBvbmVudHMucHJvdG9jb2wgIT09ICdmaWxlOicgJiYgY29tcG9uZW50cy5wcm90b2NvbCAhPT0gbnVsbCkge1xuICAgIGxvZ2dlci5sb2dFcnJvckFuZFRocm93KGB1bmV4cGVjdGVkIGZpbGUgcHJvdG9jb2wuIEdvdDogJHtjb21wb25lbnRzLnByb3RvY29sfWApO1xuICB9XG4gIHJldHVybiBjb21wb25lbnRzLnBhdGhuYW1lIHx8ICcnO1xufVxuXG4vKipcbiAqIFVzZWQgdG8gc3RhcnQgdGhlIEhIVk0gaW5zdGFuY2UgdGhhdCB0aGUgZHVtbXkgY29ubmVjdGlvbiBjb25uZWN0cyB0byBzbyB3ZSBjYW4gZXZhbHVhdGVcbiAqIGV4cHJlc3Npb25zIGluIHRoZSBSRVBMLlxuICovXG5leHBvcnQgZnVuY3Rpb24gbGF1bmNoU2NyaXB0Rm9yRHVtbXlDb25uZWN0aW9uKHNjcmlwdFBhdGg6IHN0cmluZyk6IGNoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzIHtcbiAgcmV0dXJuIGxhdW5jaFBocFNjcmlwdFdpdGhYRGVidWdFbmFibGVkKHNjcmlwdFBhdGgpO1xufVxuXG4vKipcbiAqIFVzZWQgdG8gc3RhcnQgYW4gSEhWTSBpbnN0YW5jZSBydW5uaW5nIHRoZSBnaXZlbiBzY3JpcHQgaW4gZGVidWcgbW9kZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxhdW5jaFNjcmlwdFRvRGVidWcoXG4gIHNjcmlwdFBhdGg6IHN0cmluZyxcbiAgc2VuZFRvT3V0cHV0V2luZG93OiAodGV4dDogc3RyaW5nKSA9PiB2b2lkLFxuKTogUHJvbWlzZTx2b2lkPiB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICBsYXVuY2hQaHBTY3JpcHRXaXRoWERlYnVnRW5hYmxlZChzY3JpcHRQYXRoLCB0ZXh0ID0+IHtcbiAgICAgIHNlbmRUb091dHB1dFdpbmRvdyh0ZXh0KTtcbiAgICAgIHJlc29sdmUoKTtcbiAgICB9KTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGxhdW5jaFBocFNjcmlwdFdpdGhYRGVidWdFbmFibGVkKFxuICBzY3JpcHRQYXRoOiBzdHJpbmcsXG4gIHNlbmRUb091dHB1dFdpbmRvd0FuZFJlc29sdmU/OiAodGV4dDogc3RyaW5nKSA9PiB2b2lkLFxuKTogY2hpbGRfcHJvY2VzcyRDaGlsZFByb2Nlc3Mge1xuICBjb25zdCBjaGlsZF9wcm9jZXNzID0gcmVxdWlyZSgnY2hpbGRfcHJvY2VzcycpO1xuICBjb25zdCBzY3JpcHRBcmd2ID0gcGFyc2Uoc2NyaXB0UGF0aCk7XG4gIGNvbnN0IGFyZ3MgPSBbJy1jJywgJ3hkZWJ1Zy5pbmknLCAuLi5zY3JpcHRBcmd2XTtcbiAgLy8gVE9ET1tqZWZmcmV5dGFuXTogbWFrZSBoaHZtIHBhdGggY29uZmlndXJhYmxlIHNvIHRoYXQgaXQgd2lsbFxuICAvLyB3b3JrIGZvciBub24tRkIgZW52aXJvbm1lbnQuXG4gIGNvbnN0IHByb2MgPSBjaGlsZF9wcm9jZXNzLnNwYXduKCcvdXNyL2xvY2FsL2hwaHBpL2Jpbi9oaHZtJywgYXJncyk7XG4gIGxvZ2dlci5sb2coYGNoaWxkX3Byb2Nlc3MoJHtwcm9jLnBpZH0pIHNwYXduZWQgd2l0aCB4ZGVidWcgZW5hYmxlZCBmb3I6ICR7c2NyaXB0UGF0aH1gKTtcblxuICBwcm9jLnN0ZG91dC5vbignZGF0YScsIGNodW5rID0+IHtcbiAgICAvLyBzdGRvdXQgc2hvdWxkIGhvcGVmdWxseSBiZSBzZXQgdG8gbGluZS1idWZmZXJpbmcsIGluIHdoaWNoIGNhc2UgdGhlXG4gICAgLy8gc3RyaW5nIHdvdWxkIGNvbWUgb24gb25lIGxpbmUuXG4gICAgY29uc3QgYmxvY2s6IHN0cmluZyA9IGNodW5rLnRvU3RyaW5nKCk7XG4gICAgY29uc3Qgb3V0cHV0ID0gYGNoaWxkX3Byb2Nlc3MoJHtwcm9jLnBpZH0pIHN0ZG91dDogJHtibG9ja31gO1xuICAgIGxvZ2dlci5sb2cob3V0cHV0KTtcbiAgfSk7XG4gIHByb2Mub24oJ2Vycm9yJywgZXJyID0+IHtcbiAgICBsb2dnZXIubG9nKGBjaGlsZF9wcm9jZXNzKCR7cHJvYy5waWR9KSBlcnJvcjogJHtlcnJ9YCk7XG4gICAgaWYgKHNlbmRUb091dHB1dFdpbmRvd0FuZFJlc29sdmUgIT0gbnVsbCkge1xuICAgICAgc2VuZFRvT3V0cHV0V2luZG93QW5kUmVzb2x2ZShcbiAgICAgICAgYFRoZSBwcm9jZXNzIHJ1bm5pbmcgc2NyaXB0OiAke3NjcmlwdFBhdGh9IGVuY291bnRlcmVkIGFuIGVycm9yOiAke2Vycn1gXG4gICAgICApO1xuICAgIH1cbiAgfSk7XG4gIHByb2Mub24oJ2V4aXQnLCBjb2RlID0+IHtcbiAgICBsb2dnZXIubG9nKGBjaGlsZF9wcm9jZXNzKCR7cHJvYy5waWR9KSBleGl0OiAke2NvZGV9YCk7XG4gICAgaWYgKHNlbmRUb091dHB1dFdpbmRvd0FuZFJlc29sdmUgIT0gbnVsbCkge1xuICAgICAgc2VuZFRvT3V0cHV0V2luZG93QW5kUmVzb2x2ZShgU2NyaXB0OiAke3NjcmlwdFBhdGh9IGV4aXRlZCB3aXRoIGNvZGU6ICR7Y29kZX1gKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gcHJvYztcbn1cbiJdfQ==