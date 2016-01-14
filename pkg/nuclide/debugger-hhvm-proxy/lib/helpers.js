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

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

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
  var args = ['-c', 'xdebug.ini', scriptPath];
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
//# sourceMappingURL=data:application/json;base64,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bGUiOiJoZWxwZXJzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IGxvZ2dlciBmcm9tICcuL3V0aWxzJztcblxuZXhwb3J0IGNvbnN0IERVTU1ZX0ZSQU1FX0lEID0gJ0ZyYW1lLjAnO1xuXG5leHBvcnQgZnVuY3Rpb24gYmFzZTY0RGVjb2RlKHZhbHVlOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gbmV3IEJ1ZmZlcih2YWx1ZSwgJ2Jhc2U2NCcpLnRvU3RyaW5nKCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYWtlRGJncE1lc3NhZ2UobWVzc2FnZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIFN0cmluZyhtZXNzYWdlLmxlbmd0aCkgKyAnXFx4MDAnICsgbWVzc2FnZSArICdcXHgwMCc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYWtlTWVzc2FnZShvYmo6IE9iamVjdCwgYm9keTogP3N0cmluZyk6IHN0cmluZyB7XG4gIGJvZHkgPSBib2R5IHx8ICcnO1xuICBsZXQgcmVzdWx0ID0gJzw/eG1sIHZlcnNpb249XCIxLjBcIiBlbmNvZGluZz1cImlzby04ODU5LTFcIj8+JyArXG4gICAgJzxyZXNwb25zZSB4bWxucz1cInVybjpkZWJ1Z2dlcl9wcm90b2NvbF92MVwiIHhtbG5zOnhkZWJ1Zz1cImh0dHA6Ly94ZGVidWcub3JnL2RiZ3AveGRlYnVnXCInO1xuICBmb3IgKGNvbnN0IGtleSBpbiBvYmopIHtcbiAgICByZXN1bHQgKz0gJyAnICsga2V5ICsgJz1cIicgKyBvYmpba2V5XSArICdcIic7XG4gIH1cbiAgcmVzdWx0ICs9ICc+JyArIGJvZHkgKyAnPC9yZXNwb25zZT4nO1xuICByZXR1cm4gbWFrZURiZ3BNZXNzYWdlKHJlc3VsdCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXRoVG9VcmkocGF0aDogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuICdmaWxlOi8vJyArIHBhdGg7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1cmlUb1BhdGgodXJpOiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCBjb21wb25lbnRzID0gcmVxdWlyZSgndXJsJykucGFyc2UodXJpKTtcbiAgLy8gU29tZSBmaWxlbmFtZSByZXR1cm5lZCBmcm9tIGhodm0gZG9lcyBub3QgaGF2ZSBwcm90b2NvbC5cbiAgaWYgKGNvbXBvbmVudHMucHJvdG9jb2wgIT09ICdmaWxlOicgJiYgY29tcG9uZW50cy5wcm90b2NvbCAhPT0gbnVsbCkge1xuICAgIGxvZ2dlci5sb2dFcnJvckFuZFRocm93KGB1bmV4cGVjdGVkIGZpbGUgcHJvdG9jb2wuIEdvdDogJHtjb21wb25lbnRzLnByb3RvY29sfWApO1xuICB9XG4gIHJldHVybiBjb21wb25lbnRzLnBhdGhuYW1lIHx8ICcnO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbGF1bmNoUGhwU2NyaXB0V2l0aFhEZWJ1Z0VuYWJsZWQoc2NyaXB0UGF0aDogc3RyaW5nKTogY2hpbGRfcHJvY2VzcyRDaGlsZFByb2Nlc3Mge1xuICBjb25zdCBjaGlsZF9wcm9jZXNzID0gcmVxdWlyZSgnY2hpbGRfcHJvY2VzcycpO1xuICBjb25zdCBhcmdzID0gWyctYycsICd4ZGVidWcuaW5pJywgc2NyaXB0UGF0aF07XG4gIC8vIFRPRE9bamVmZnJleXRhbl06IG1ha2UgaGh2bSBwYXRoIGNvbmZpZ3VyYWJsZSBzbyB0aGF0IGl0IHdpbGxcbiAgLy8gd29yayBmb3Igbm9uLUZCIGVudmlyb25tZW50LlxuICBjb25zdCBwcm9jID0gY2hpbGRfcHJvY2Vzcy5zcGF3bignL3Vzci9sb2NhbC9ocGhwaS9iaW4vaGh2bScsIGFyZ3MpO1xuICBsb2dnZXIubG9nKGBjaGlsZF9wcm9jZXNzKCR7cHJvYy5waWR9KSBzcGF3bmVkIHdpdGggeGRlYnVnIGVuYWJsZWQgZm9yOiAke3NjcmlwdFBhdGh9YCk7XG5cbiAgcHJvYy5zdGRvdXQub24oJ2RhdGEnLCBjaHVuayA9PiB7XG4gICAgLy8gc3Rkb3V0IHNob3VsZCBob3BlZnVsbHkgYmUgc2V0IHRvIGxpbmUtYnVmZmVyaW5nLCBpbiB3aGljaCBjYXNlIHRoZVxuICAgIC8vIHN0cmluZyB3b3VsZCBjb21lIG9uIG9uZSBsaW5lLlxuICAgIGNvbnN0IGJsb2NrOiBzdHJpbmcgPSBjaHVuay50b1N0cmluZygpO1xuICAgIGNvbnN0IG91dHB1dCA9IGBjaGlsZF9wcm9jZXNzKCR7cHJvYy5waWR9KSBzdGRvdXQ6ICR7YmxvY2t9YDtcbiAgICBsb2dnZXIubG9nKG91dHB1dCk7XG4gIH0pO1xuICBwcm9jLm9uKCdlcnJvcicsIGVyciA9PiB7XG4gICAgbG9nZ2VyLmxvZyhgY2hpbGRfcHJvY2Vzcygke3Byb2MucGlkfSkgZXJyb3I6ICR7ZXJyfWApO1xuICB9KTtcbiAgcHJvYy5vbignZXhpdCcsIGNvZGUgPT4ge1xuICAgIGxvZ2dlci5sb2coYGNoaWxkX3Byb2Nlc3MoJHtwcm9jLnBpZH0pIGV4aXQ6ICR7Y29kZX1gKTtcbiAgfSk7XG4gIHJldHVybiBwcm9jO1xufVxuIl19