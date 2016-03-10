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

function launchPhpScriptWithXDebugEnabled(scriptPath, sendToOutputWindow) {
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
    if (sendToOutputWindow != null) {
      sendToOutputWindow('The process running script: ' + scriptPath + ' encountered an error: ' + err);
    }
  });
  proc.on('exit', function (code) {
    _utils2['default'].log('child_process(' + proc.pid + ') exit: ' + code);
    if (sendToOutputWindow != null) {
      sendToOutputWindow('Script: ' + scriptPath + ' exited with code: ' + code);
    }
  });
  return proc;
}

// string would come on one line.
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImhlbHBlcnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztxQkFXbUIsU0FBUzs7OzswQkFDUixhQUFhOztBQUUxQixJQUFNLGNBQWMsR0FBRyxTQUFTLENBQUM7Ozs7QUFFakMsU0FBUyxZQUFZLENBQUMsS0FBYSxFQUFVO0FBQ2xELFNBQU8sSUFBSSxNQUFNLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO0NBQy9DOztBQUVNLFNBQVMsZUFBZSxDQUFDLE9BQWUsRUFBVTtBQUN2RCxTQUFPLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsTUFBTSxHQUFHLE9BQU8sR0FBRyxNQUFNLENBQUM7Q0FDM0Q7O0FBRU0sU0FBUyxXQUFXLENBQUMsR0FBVyxFQUFFLElBQWEsRUFBVTtBQUM5RCxNQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztBQUNsQixNQUFJLE1BQU0sR0FBRyw2Q0FBNkMsR0FDeEQseUZBQXlGLENBQUM7QUFDNUYsT0FBSyxJQUFNLEdBQUcsSUFBSSxHQUFHLEVBQUU7QUFDckIsVUFBTSxJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUM7R0FDN0M7QUFDRCxRQUFNLElBQUksR0FBRyxHQUFHLElBQUksR0FBRyxhQUFhLENBQUM7QUFDckMsU0FBTyxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUM7Q0FDaEM7O0FBRU0sU0FBUyxTQUFTLENBQUMsSUFBWSxFQUFVO0FBQzlDLFNBQU8sU0FBUyxHQUFHLElBQUksQ0FBQztDQUN6Qjs7QUFFTSxTQUFTLFNBQVMsQ0FBQyxHQUFXLEVBQVU7QUFDN0MsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQzs7QUFFN0MsTUFBSSxVQUFVLENBQUMsUUFBUSxLQUFLLE9BQU8sSUFBSSxVQUFVLENBQUMsUUFBUSxLQUFLLElBQUksRUFBRTtBQUNuRSx1QkFBTyxnQkFBZ0IscUNBQW1DLFVBQVUsQ0FBQyxRQUFRLENBQUcsQ0FBQztHQUNsRjtBQUNELFNBQU8sVUFBVSxDQUFDLFFBQVEsSUFBSSxFQUFFLENBQUM7Q0FDbEM7O0FBRU0sU0FBUyxnQ0FBZ0MsQ0FDOUMsVUFBa0IsRUFDbEIsa0JBQTJDLEVBQ2Y7QUFDNUIsTUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQy9DLE1BQU0sVUFBVSxHQUFHLHVCQUFNLFVBQVUsQ0FBQyxDQUFDO0FBQ3JDLE1BQU0sSUFBSSxJQUFJLElBQUksRUFBRSxZQUFZLDRCQUFLLFVBQVUsRUFBQyxDQUFDOzs7QUFHakQsTUFBTSxJQUFJLEdBQUcsYUFBYSxDQUFDLEtBQUssQ0FBQywyQkFBMkIsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNwRSxxQkFBTyxHQUFHLG9CQUFrQixJQUFJLENBQUMsR0FBRywyQ0FBc0MsVUFBVSxDQUFHLENBQUM7O0FBRXhGLE1BQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxVQUFBLEtBQUssRUFBSTs7O0FBRzlCLFFBQU0sS0FBYSxHQUFHLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztBQUN2QyxRQUFNLE1BQU0sc0JBQW9CLElBQUksQ0FBQyxHQUFHLGtCQUFhLEtBQUssQUFBRSxDQUFDO0FBQzdELHVCQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztHQUNwQixDQUFDLENBQUM7QUFDSCxNQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxVQUFBLEdBQUcsRUFBSTtBQUN0Qix1QkFBTyxHQUFHLG9CQUFrQixJQUFJLENBQUMsR0FBRyxpQkFBWSxHQUFHLENBQUcsQ0FBQztBQUN2RCxRQUFJLGtCQUFrQixJQUFJLElBQUksRUFBRTtBQUM5Qix3QkFBa0Isa0NBQWdDLFVBQVUsK0JBQTBCLEdBQUcsQ0FBRyxDQUFDO0tBQzlGO0dBQ0YsQ0FBQyxDQUFDO0FBQ0gsTUFBSSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsVUFBQSxJQUFJLEVBQUk7QUFDdEIsdUJBQU8sR0FBRyxvQkFBa0IsSUFBSSxDQUFDLEdBQUcsZ0JBQVcsSUFBSSxDQUFHLENBQUM7QUFDdkQsUUFBSSxrQkFBa0IsSUFBSSxJQUFJLEVBQUU7QUFDOUIsd0JBQWtCLGNBQVksVUFBVSwyQkFBc0IsSUFBSSxDQUFHLENBQUM7S0FDdkU7R0FDRixDQUFDLENBQUM7QUFDSCxTQUFPLElBQUksQ0FBQztDQUNiIiwiZmlsZSI6ImhlbHBlcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgbG9nZ2VyIGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IHtwYXJzZX0gZnJvbSAnc2hlbGwtcXVvdGUnO1xuXG5leHBvcnQgY29uc3QgRFVNTVlfRlJBTUVfSUQgPSAnRnJhbWUuMCc7XG5cbmV4cG9ydCBmdW5jdGlvbiBiYXNlNjREZWNvZGUodmFsdWU6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBuZXcgQnVmZmVyKHZhbHVlLCAnYmFzZTY0JykudG9TdHJpbmcoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1ha2VEYmdwTWVzc2FnZShtZXNzYWdlOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gU3RyaW5nKG1lc3NhZ2UubGVuZ3RoKSArICdcXHgwMCcgKyBtZXNzYWdlICsgJ1xceDAwJztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1ha2VNZXNzYWdlKG9iajogT2JqZWN0LCBib2R5OiA/c3RyaW5nKTogc3RyaW5nIHtcbiAgYm9keSA9IGJvZHkgfHwgJyc7XG4gIGxldCByZXN1bHQgPSAnPD94bWwgdmVyc2lvbj1cIjEuMFwiIGVuY29kaW5nPVwiaXNvLTg4NTktMVwiPz4nICtcbiAgICAnPHJlc3BvbnNlIHhtbG5zPVwidXJuOmRlYnVnZ2VyX3Byb3RvY29sX3YxXCIgeG1sbnM6eGRlYnVnPVwiaHR0cDovL3hkZWJ1Zy5vcmcvZGJncC94ZGVidWdcIic7XG4gIGZvciAoY29uc3Qga2V5IGluIG9iaikge1xuICAgIHJlc3VsdCArPSAnICcgKyBrZXkgKyAnPVwiJyArIG9ialtrZXldICsgJ1wiJztcbiAgfVxuICByZXN1bHQgKz0gJz4nICsgYm9keSArICc8L3Jlc3BvbnNlPic7XG4gIHJldHVybiBtYWtlRGJncE1lc3NhZ2UocmVzdWx0KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhdGhUb1VyaShwYXRoOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gJ2ZpbGU6Ly8nICsgcGF0aDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVyaVRvUGF0aCh1cmk6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IGNvbXBvbmVudHMgPSByZXF1aXJlKCd1cmwnKS5wYXJzZSh1cmkpO1xuICAvLyBTb21lIGZpbGVuYW1lIHJldHVybmVkIGZyb20gaGh2bSBkb2VzIG5vdCBoYXZlIHByb3RvY29sLlxuICBpZiAoY29tcG9uZW50cy5wcm90b2NvbCAhPT0gJ2ZpbGU6JyAmJiBjb21wb25lbnRzLnByb3RvY29sICE9PSBudWxsKSB7XG4gICAgbG9nZ2VyLmxvZ0Vycm9yQW5kVGhyb3coYHVuZXhwZWN0ZWQgZmlsZSBwcm90b2NvbC4gR290OiAke2NvbXBvbmVudHMucHJvdG9jb2x9YCk7XG4gIH1cbiAgcmV0dXJuIGNvbXBvbmVudHMucGF0aG5hbWUgfHwgJyc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsYXVuY2hQaHBTY3JpcHRXaXRoWERlYnVnRW5hYmxlZChcbiAgc2NyaXB0UGF0aDogc3RyaW5nLFxuICBzZW5kVG9PdXRwdXRXaW5kb3c/OiAodGV4dDogc3RyaW5nKSA9PiB2b2lkLFxuKTogY2hpbGRfcHJvY2VzcyRDaGlsZFByb2Nlc3Mge1xuICBjb25zdCBjaGlsZF9wcm9jZXNzID0gcmVxdWlyZSgnY2hpbGRfcHJvY2VzcycpO1xuICBjb25zdCBzY3JpcHRBcmd2ID0gcGFyc2Uoc2NyaXB0UGF0aCk7XG4gIGNvbnN0IGFyZ3MgPSBbJy1jJywgJ3hkZWJ1Zy5pbmknLCAuLi5zY3JpcHRBcmd2XTtcbiAgLy8gVE9ET1tqZWZmcmV5dGFuXTogbWFrZSBoaHZtIHBhdGggY29uZmlndXJhYmxlIHNvIHRoYXQgaXQgd2lsbFxuICAvLyB3b3JrIGZvciBub24tRkIgZW52aXJvbm1lbnQuXG4gIGNvbnN0IHByb2MgPSBjaGlsZF9wcm9jZXNzLnNwYXduKCcvdXNyL2xvY2FsL2hwaHBpL2Jpbi9oaHZtJywgYXJncyk7XG4gIGxvZ2dlci5sb2coYGNoaWxkX3Byb2Nlc3MoJHtwcm9jLnBpZH0pIHNwYXduZWQgd2l0aCB4ZGVidWcgZW5hYmxlZCBmb3I6ICR7c2NyaXB0UGF0aH1gKTtcblxuICBwcm9jLnN0ZG91dC5vbignZGF0YScsIGNodW5rID0+IHtcbiAgICAvLyBzdGRvdXQgc2hvdWxkIGhvcGVmdWxseSBiZSBzZXQgdG8gbGluZS1idWZmZXJpbmcsIGluIHdoaWNoIGNhc2UgdGhlXG4gICAgLy8gc3RyaW5nIHdvdWxkIGNvbWUgb24gb25lIGxpbmUuXG4gICAgY29uc3QgYmxvY2s6IHN0cmluZyA9IGNodW5rLnRvU3RyaW5nKCk7XG4gICAgY29uc3Qgb3V0cHV0ID0gYGNoaWxkX3Byb2Nlc3MoJHtwcm9jLnBpZH0pIHN0ZG91dDogJHtibG9ja31gO1xuICAgIGxvZ2dlci5sb2cob3V0cHV0KTtcbiAgfSk7XG4gIHByb2Mub24oJ2Vycm9yJywgZXJyID0+IHtcbiAgICBsb2dnZXIubG9nKGBjaGlsZF9wcm9jZXNzKCR7cHJvYy5waWR9KSBlcnJvcjogJHtlcnJ9YCk7XG4gICAgaWYgKHNlbmRUb091dHB1dFdpbmRvdyAhPSBudWxsKSB7XG4gICAgICBzZW5kVG9PdXRwdXRXaW5kb3coYFRoZSBwcm9jZXNzIHJ1bm5pbmcgc2NyaXB0OiAke3NjcmlwdFBhdGh9IGVuY291bnRlcmVkIGFuIGVycm9yOiAke2Vycn1gKTtcbiAgICB9XG4gIH0pO1xuICBwcm9jLm9uKCdleGl0JywgY29kZSA9PiB7XG4gICAgbG9nZ2VyLmxvZyhgY2hpbGRfcHJvY2Vzcygke3Byb2MucGlkfSkgZXhpdDogJHtjb2RlfWApO1xuICAgIGlmIChzZW5kVG9PdXRwdXRXaW5kb3cgIT0gbnVsbCkge1xuICAgICAgc2VuZFRvT3V0cHV0V2luZG93KGBTY3JpcHQ6ICR7c2NyaXB0UGF0aH0gZXhpdGVkIHdpdGggY29kZTogJHtjb2RlfWApO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBwcm9jO1xufVxuIl19