Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.base64Decode = base64Decode;
exports.makeDbgpMessage = makeDbgpMessage;
exports.makeMessage = makeMessage;
exports.pathToUri = pathToUri;
exports.uriToPath = uriToPath;
exports.launchPhpScriptWithXDebugEnabled = launchPhpScriptWithXDebugEnabled;

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

function launchPhpScriptWithXDebugEnabled(scriptPath) {
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
  });
  proc.on('exit', function (code) {
    _utils2['default'].log('child_process(' + proc.pid + ') exit: ' + code);
  });
  return proc;
}

// string would come on one line.
//# sourceMappingURL=data:application/json;base64,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RyxDQUFDO0dBQ3hELENBQUMsQ0FBQztBQUNILFNBQU8sSUFBSSxDQUFDO0NBQ2IiLCJmaWxlIjoiaGVscGVycy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBsb2dnZXIgZnJvbSAnLi91dGlscyc7XG5pbXBvcnQge3BhcnNlfSBmcm9tICdzaGVsbC1xdW90ZSc7XG5cbmV4cG9ydCBjb25zdCBEVU1NWV9GUkFNRV9JRCA9ICdGcmFtZS4wJztcblxuZXhwb3J0IGZ1bmN0aW9uIGJhc2U2NERlY29kZSh2YWx1ZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIG5ldyBCdWZmZXIodmFsdWUsICdiYXNlNjQnKS50b1N0cmluZygpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFrZURiZ3BNZXNzYWdlKG1lc3NhZ2U6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBTdHJpbmcobWVzc2FnZS5sZW5ndGgpICsgJ1xceDAwJyArIG1lc3NhZ2UgKyAnXFx4MDAnO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFrZU1lc3NhZ2Uob2JqOiBPYmplY3QsIGJvZHk6ID9zdHJpbmcpOiBzdHJpbmcge1xuICBib2R5ID0gYm9keSB8fCAnJztcbiAgbGV0IHJlc3VsdCA9ICc8P3htbCB2ZXJzaW9uPVwiMS4wXCIgZW5jb2Rpbmc9XCJpc28tODg1OS0xXCI/PicgK1xuICAgICc8cmVzcG9uc2UgeG1sbnM9XCJ1cm46ZGVidWdnZXJfcHJvdG9jb2xfdjFcIiB4bWxuczp4ZGVidWc9XCJodHRwOi8veGRlYnVnLm9yZy9kYmdwL3hkZWJ1Z1wiJztcbiAgZm9yIChjb25zdCBrZXkgaW4gb2JqKSB7XG4gICAgcmVzdWx0ICs9ICcgJyArIGtleSArICc9XCInICsgb2JqW2tleV0gKyAnXCInO1xuICB9XG4gIHJlc3VsdCArPSAnPicgKyBib2R5ICsgJzwvcmVzcG9uc2U+JztcbiAgcmV0dXJuIG1ha2VEYmdwTWVzc2FnZShyZXN1bHQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGF0aFRvVXJpKHBhdGg6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiAnZmlsZTovLycgKyBwYXRoO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdXJpVG9QYXRoKHVyaTogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgY29tcG9uZW50cyA9IHJlcXVpcmUoJ3VybCcpLnBhcnNlKHVyaSk7XG4gIC8vIFNvbWUgZmlsZW5hbWUgcmV0dXJuZWQgZnJvbSBoaHZtIGRvZXMgbm90IGhhdmUgcHJvdG9jb2wuXG4gIGlmIChjb21wb25lbnRzLnByb3RvY29sICE9PSAnZmlsZTonICYmIGNvbXBvbmVudHMucHJvdG9jb2wgIT09IG51bGwpIHtcbiAgICBsb2dnZXIubG9nRXJyb3JBbmRUaHJvdyhgdW5leHBlY3RlZCBmaWxlIHByb3RvY29sLiBHb3Q6ICR7Y29tcG9uZW50cy5wcm90b2NvbH1gKTtcbiAgfVxuICByZXR1cm4gY29tcG9uZW50cy5wYXRobmFtZSB8fCAnJztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxhdW5jaFBocFNjcmlwdFdpdGhYRGVidWdFbmFibGVkKHNjcmlwdFBhdGg6IHN0cmluZyk6IGNoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzIHtcbiAgY29uc3QgY2hpbGRfcHJvY2VzcyA9IHJlcXVpcmUoJ2NoaWxkX3Byb2Nlc3MnKTtcbiAgY29uc3Qgc2NyaXB0QXJndiA9IHBhcnNlKHNjcmlwdFBhdGgpO1xuICBjb25zdCBhcmdzID0gWyctYycsICd4ZGVidWcuaW5pJywgLi4uc2NyaXB0QXJndl07XG4gIC8vIFRPRE9bamVmZnJleXRhbl06IG1ha2UgaGh2bSBwYXRoIGNvbmZpZ3VyYWJsZSBzbyB0aGF0IGl0IHdpbGxcbiAgLy8gd29yayBmb3Igbm9uLUZCIGVudmlyb25tZW50LlxuICBjb25zdCBwcm9jID0gY2hpbGRfcHJvY2Vzcy5zcGF3bignL3Vzci9sb2NhbC9ocGhwaS9iaW4vaGh2bScsIGFyZ3MpO1xuICBsb2dnZXIubG9nKGBjaGlsZF9wcm9jZXNzKCR7cHJvYy5waWR9KSBzcGF3bmVkIHdpdGggeGRlYnVnIGVuYWJsZWQgZm9yOiAke3NjcmlwdFBhdGh9YCk7XG5cbiAgcHJvYy5zdGRvdXQub24oJ2RhdGEnLCBjaHVuayA9PiB7XG4gICAgLy8gc3Rkb3V0IHNob3VsZCBob3BlZnVsbHkgYmUgc2V0IHRvIGxpbmUtYnVmZmVyaW5nLCBpbiB3aGljaCBjYXNlIHRoZVxuICAgIC8vIHN0cmluZyB3b3VsZCBjb21lIG9uIG9uZSBsaW5lLlxuICAgIGNvbnN0IGJsb2NrOiBzdHJpbmcgPSBjaHVuay50b1N0cmluZygpO1xuICAgIGNvbnN0IG91dHB1dCA9IGBjaGlsZF9wcm9jZXNzKCR7cHJvYy5waWR9KSBzdGRvdXQ6ICR7YmxvY2t9YDtcbiAgICBsb2dnZXIubG9nKG91dHB1dCk7XG4gIH0pO1xuICBwcm9jLm9uKCdlcnJvcicsIGVyciA9PiB7XG4gICAgbG9nZ2VyLmxvZyhgY2hpbGRfcHJvY2Vzcygke3Byb2MucGlkfSkgZXJyb3I6ICR7ZXJyfWApO1xuICB9KTtcbiAgcHJvYy5vbignZXhpdCcsIGNvZGUgPT4ge1xuICAgIGxvZ2dlci5sb2coYGNoaWxkX3Byb2Nlc3MoJHtwcm9jLnBpZH0pIGV4aXQ6ICR7Y29kZX1gKTtcbiAgfSk7XG4gIHJldHVybiBwcm9jO1xufVxuIl19