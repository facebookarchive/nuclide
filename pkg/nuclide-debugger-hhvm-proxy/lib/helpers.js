Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.base64Decode = base64Decode;
exports.base64Encode = base64Encode;
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

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

var _config = require('./config');

var _shellQuote = require('shell-quote');

var DUMMY_FRAME_ID = 'Frame.0';

exports.DUMMY_FRAME_ID = DUMMY_FRAME_ID;

function base64Decode(value) {
  return new Buffer(value, 'base64').toString();
}

function base64Encode(value) {
  return new Buffer(value).toString('base64');
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
  var components = _url2['default'].parse(uri);
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
  return launchPhpScriptWithXDebugEnabled(scriptPath, null, true);
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

function launchPhpScriptWithXDebugEnabled(scriptPath, sendToOutputWindowAndResolve, isDummyConnection) {
  var args = (0, _shellQuote.parse)(scriptPath);
  var proc = undefined;
  if (isDummyConnection) {
    proc = _child_process2['default'].spawn('/usr/local/hphpi/bin/hhvm', ['-c', 'xdebug.ini'].concat(_toConsumableArray(args)));
  } else {
    proc = _child_process2['default'].spawn((0, _config.getConfig)().phpRuntimePath, args);
  }
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
// TODO remove this, this is a hack, t10536025
// string would come on one line.
//# sourceMappingURL=data:application/json;base64,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QUM7R0FDOUQ7QUFDRCxxQkFBTyxHQUFHLG9CQUFrQixJQUFJLENBQUMsR0FBRywyQ0FBc0MsVUFBVSxDQUFHLENBQUM7O0FBRXhGLE1BQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxVQUFBLEtBQUssRUFBSTs7O0FBRzlCLFFBQU0sS0FBYSxHQUFHLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztBQUN2QyxRQUFNLE1BQU0sc0JBQW9CLElBQUksQ0FBQyxHQUFHLGtCQUFhLEtBQUssQUFBRSxDQUFDO0FBQzdELHVCQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztHQUNwQixDQUFDLENBQUM7QUFDSCxNQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxVQUFBLEdBQUcsRUFBSTtBQUN0Qix1QkFBTyxHQUFHLG9CQUFrQixJQUFJLENBQUMsR0FBRyxpQkFBWSxHQUFHLENBQUcsQ0FBQztBQUN2RCxRQUFJLDRCQUE0QixJQUFJLElBQUksRUFBRTtBQUN4QyxrQ0FBNEIsa0NBQ0ssVUFBVSwrQkFBMEIsR0FBRyxDQUN2RSxDQUFDO0tBQ0g7R0FDRixDQUFDLENBQUM7QUFDSCxNQUFJLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxVQUFBLElBQUksRUFBSTtBQUN0Qix1QkFBTyxHQUFHLG9CQUFrQixJQUFJLENBQUMsR0FBRyxnQkFBVyxJQUFJLENBQUcsQ0FBQztBQUN2RCxRQUFJLDRCQUE0QixJQUFJLElBQUksRUFBRTtBQUN4QyxrQ0FBNEIsY0FBWSxVQUFVLDJCQUFzQixJQUFJLENBQUcsQ0FBQztLQUNqRjtHQUNGLENBQUMsQ0FBQztBQUNILFNBQU8sSUFBSSxDQUFDO0NBQ2IiLCJmaWxlIjoiaGVscGVycy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBjaGlsZF9wcm9jZXNzIGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xuaW1wb3J0IHVybCBmcm9tICd1cmwnO1xuaW1wb3J0IGxvZ2dlciBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7Z2V0Q29uZmlnfSBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQge3BhcnNlfSBmcm9tICdzaGVsbC1xdW90ZSc7XG5cbmV4cG9ydCBjb25zdCBEVU1NWV9GUkFNRV9JRCA9ICdGcmFtZS4wJztcblxuZXhwb3J0IGZ1bmN0aW9uIGJhc2U2NERlY29kZSh2YWx1ZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIG5ldyBCdWZmZXIodmFsdWUsICdiYXNlNjQnKS50b1N0cmluZygpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmFzZTY0RW5jb2RlKHZhbHVlOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gbmV3IEJ1ZmZlcih2YWx1ZSkudG9TdHJpbmcoJ2Jhc2U2NCcpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFrZURiZ3BNZXNzYWdlKG1lc3NhZ2U6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBTdHJpbmcobWVzc2FnZS5sZW5ndGgpICsgJ1xceDAwJyArIG1lc3NhZ2UgKyAnXFx4MDAnO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFrZU1lc3NhZ2Uob2JqOiBPYmplY3QsIGJvZHk6ID9zdHJpbmcpOiBzdHJpbmcge1xuICBib2R5ID0gYm9keSB8fCAnJztcbiAgbGV0IHJlc3VsdCA9ICc8P3htbCB2ZXJzaW9uPVwiMS4wXCIgZW5jb2Rpbmc9XCJpc28tODg1OS0xXCI/PicgK1xuICAgICc8cmVzcG9uc2UgeG1sbnM9XCJ1cm46ZGVidWdnZXJfcHJvdG9jb2xfdjFcIiB4bWxuczp4ZGVidWc9XCJodHRwOi8veGRlYnVnLm9yZy9kYmdwL3hkZWJ1Z1wiJztcbiAgZm9yIChjb25zdCBrZXkgaW4gb2JqKSB7XG4gICAgcmVzdWx0ICs9ICcgJyArIGtleSArICc9XCInICsgb2JqW2tleV0gKyAnXCInO1xuICB9XG4gIHJlc3VsdCArPSAnPicgKyBib2R5ICsgJzwvcmVzcG9uc2U+JztcbiAgcmV0dXJuIG1ha2VEYmdwTWVzc2FnZShyZXN1bHQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGF0aFRvVXJpKHBhdGg6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiAnZmlsZTovLycgKyBwYXRoO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdXJpVG9QYXRoKHVyaTogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgY29tcG9uZW50cyA9IHVybC5wYXJzZSh1cmkpO1xuICAvLyBTb21lIGZpbGVuYW1lIHJldHVybmVkIGZyb20gaGh2bSBkb2VzIG5vdCBoYXZlIHByb3RvY29sLlxuICBpZiAoY29tcG9uZW50cy5wcm90b2NvbCAhPT0gJ2ZpbGU6JyAmJiBjb21wb25lbnRzLnByb3RvY29sICE9PSBudWxsKSB7XG4gICAgbG9nZ2VyLmxvZ0Vycm9yQW5kVGhyb3coYHVuZXhwZWN0ZWQgZmlsZSBwcm90b2NvbC4gR290OiAke2NvbXBvbmVudHMucHJvdG9jb2x9YCk7XG4gIH1cbiAgcmV0dXJuIGNvbXBvbmVudHMucGF0aG5hbWUgfHwgJyc7XG59XG5cbi8qKlxuICogVXNlZCB0byBzdGFydCB0aGUgSEhWTSBpbnN0YW5jZSB0aGF0IHRoZSBkdW1teSBjb25uZWN0aW9uIGNvbm5lY3RzIHRvIHNvIHdlIGNhbiBldmFsdWF0ZVxuICogZXhwcmVzc2lvbnMgaW4gdGhlIFJFUEwuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsYXVuY2hTY3JpcHRGb3JEdW1teUNvbm5lY3Rpb24oc2NyaXB0UGF0aDogc3RyaW5nKTogY2hpbGRfcHJvY2VzcyRDaGlsZFByb2Nlc3Mge1xuICByZXR1cm4gbGF1bmNoUGhwU2NyaXB0V2l0aFhEZWJ1Z0VuYWJsZWQoc2NyaXB0UGF0aCwgbnVsbCwgdHJ1ZSk7XG59XG5cbi8qKlxuICogVXNlZCB0byBzdGFydCBhbiBISFZNIGluc3RhbmNlIHJ1bm5pbmcgdGhlIGdpdmVuIHNjcmlwdCBpbiBkZWJ1ZyBtb2RlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gbGF1bmNoU2NyaXB0VG9EZWJ1ZyhcbiAgc2NyaXB0UGF0aDogc3RyaW5nLFxuICBzZW5kVG9PdXRwdXRXaW5kb3c6ICh0ZXh0OiBzdHJpbmcpID0+IHZvaWQsXG4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgIGxhdW5jaFBocFNjcmlwdFdpdGhYRGVidWdFbmFibGVkKHNjcmlwdFBhdGgsIHRleHQgPT4ge1xuICAgICAgc2VuZFRvT3V0cHV0V2luZG93KHRleHQpO1xuICAgICAgcmVzb2x2ZSgpO1xuICAgIH0pO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gbGF1bmNoUGhwU2NyaXB0V2l0aFhEZWJ1Z0VuYWJsZWQoXG4gIHNjcmlwdFBhdGg6IHN0cmluZyxcbiAgc2VuZFRvT3V0cHV0V2luZG93QW5kUmVzb2x2ZT86ID8odGV4dDogc3RyaW5nKSA9PiB2b2lkLFxuICBpc0R1bW15Q29ubmVjdGlvbj86IGJvb2xlYW4sIC8vIFRPRE8gcmVtb3ZlIHRoaXMsIHRoaXMgaXMgYSBoYWNrLCB0MTA1MzYwMjVcbik6IGNoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzIHtcbiAgY29uc3QgYXJncyA9IHBhcnNlKHNjcmlwdFBhdGgpO1xuICBsZXQgcHJvYztcbiAgaWYgKGlzRHVtbXlDb25uZWN0aW9uKSB7XG4gICAgcHJvYyA9IGNoaWxkX3Byb2Nlc3Muc3Bhd24oJy91c3IvbG9jYWwvaHBocGkvYmluL2hodm0nLCBbJy1jJywgJ3hkZWJ1Zy5pbmknLCAuLi5hcmdzXSk7XG4gIH0gZWxzZSB7XG4gICAgcHJvYyA9IGNoaWxkX3Byb2Nlc3Muc3Bhd24oZ2V0Q29uZmlnKCkucGhwUnVudGltZVBhdGgsIGFyZ3MpO1xuICB9XG4gIGxvZ2dlci5sb2coYGNoaWxkX3Byb2Nlc3MoJHtwcm9jLnBpZH0pIHNwYXduZWQgd2l0aCB4ZGVidWcgZW5hYmxlZCBmb3I6ICR7c2NyaXB0UGF0aH1gKTtcblxuICBwcm9jLnN0ZG91dC5vbignZGF0YScsIGNodW5rID0+IHtcbiAgICAvLyBzdGRvdXQgc2hvdWxkIGhvcGVmdWxseSBiZSBzZXQgdG8gbGluZS1idWZmZXJpbmcsIGluIHdoaWNoIGNhc2UgdGhlXG4gICAgLy8gc3RyaW5nIHdvdWxkIGNvbWUgb24gb25lIGxpbmUuXG4gICAgY29uc3QgYmxvY2s6IHN0cmluZyA9IGNodW5rLnRvU3RyaW5nKCk7XG4gICAgY29uc3Qgb3V0cHV0ID0gYGNoaWxkX3Byb2Nlc3MoJHtwcm9jLnBpZH0pIHN0ZG91dDogJHtibG9ja31gO1xuICAgIGxvZ2dlci5sb2cob3V0cHV0KTtcbiAgfSk7XG4gIHByb2Mub24oJ2Vycm9yJywgZXJyID0+IHtcbiAgICBsb2dnZXIubG9nKGBjaGlsZF9wcm9jZXNzKCR7cHJvYy5waWR9KSBlcnJvcjogJHtlcnJ9YCk7XG4gICAgaWYgKHNlbmRUb091dHB1dFdpbmRvd0FuZFJlc29sdmUgIT0gbnVsbCkge1xuICAgICAgc2VuZFRvT3V0cHV0V2luZG93QW5kUmVzb2x2ZShcbiAgICAgICAgYFRoZSBwcm9jZXNzIHJ1bm5pbmcgc2NyaXB0OiAke3NjcmlwdFBhdGh9IGVuY291bnRlcmVkIGFuIGVycm9yOiAke2Vycn1gXG4gICAgICApO1xuICAgIH1cbiAgfSk7XG4gIHByb2Mub24oJ2V4aXQnLCBjb2RlID0+IHtcbiAgICBsb2dnZXIubG9nKGBjaGlsZF9wcm9jZXNzKCR7cHJvYy5waWR9KSBleGl0OiAke2NvZGV9YCk7XG4gICAgaWYgKHNlbmRUb091dHB1dFdpbmRvd0FuZFJlc29sdmUgIT0gbnVsbCkge1xuICAgICAgc2VuZFRvT3V0cHV0V2luZG93QW5kUmVzb2x2ZShgU2NyaXB0OiAke3NjcmlwdFBhdGh9IGV4aXRlZCB3aXRoIGNvZGU6ICR7Y29kZX1gKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gcHJvYztcbn1cbiJdfQ==