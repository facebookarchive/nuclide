Object.defineProperty(exports, '__esModule', {
  value: true
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _console = require('./console');

/* eslint-disable no-console */
exports['default'] = _asyncToGenerator(function* (params) {
  // Verify that a --log-file argument has been specified.
  var logFile = params.logFile;

  if (logFile == null) {
    console.error('Must specify arguments via --log-file.');
    return 1;
  }

  // Parse the args passed as JSON.
  var args = undefined;
  try {
    args = JSON.parse(logFile);
  } catch (e) {
    console.error('Failed to parse --log-file argument: ' + logFile);
    return 1;
  }

  // Set global.atom before running any more code.
  var applicationDelegate = params.buildDefaultApplicationDelegate();
  var atomEnvParams = {
    applicationDelegate: applicationDelegate,
    window: window,
    document: document
  };
  global.atom = params.buildAtomEnvironment(atomEnvParams);

  // Set up the console before running any user code.
  var notifyWhenStdoutHasBeenFlushed = yield (0, _console.instrumentConsole)(args['stdout']);

  var pathArg = args['path'];
  if (typeof pathArg !== 'string') {
    console.error('Must specify a path in the --log-file JSON');
    return 1;
  }

  var entryPoint = args['path'];
  // $FlowFixMe: entryPoint is determined dynamically rather than a string literal.
  var handler = require(entryPoint);

  try {
    var exitCode = yield handler(args['args']);
    yield notifyWhenStdoutHasBeenFlushed();
    return exitCode;
  } catch (e) {
    console.error(e);
    return 1;
  }
});

/* eslint-enable no-console */
module.exports = exports['default'];

/** Absolute paths to tests to run. Could be paths to files or directories. */

/** A boolean indicating whether or not the tests are running headless. */

/** Creates the `atom` global object. */

/** Currently undocumnted, but seemingly necessary to use buildAtomEnvironment(). */

/** An optional path to a log file to which test output should be logged. */

/** Unclear what the contract of this is, but we will not be using it. */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRlc3QtcnVubmVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O3VCQVdnQyxXQUFXOzs7dUNBaUM1QixXQUF1QixNQUF3QixFQUFxQjs7TUFFMUUsT0FBTyxHQUFJLE1BQU0sQ0FBakIsT0FBTzs7QUFDZCxNQUFJLE9BQU8sSUFBSSxJQUFJLEVBQUU7QUFDbkIsV0FBTyxDQUFDLEtBQUssQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFDO0FBQ3hELFdBQU8sQ0FBQyxDQUFDO0dBQ1Y7OztBQUdELE1BQUksSUFBSSxZQUFBLENBQUM7QUFDVCxNQUFJO0FBQ0YsUUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7R0FDNUIsQ0FBQyxPQUFPLENBQUMsRUFBRTtBQUNWLFdBQU8sQ0FBQyxLQUFLLDJDQUF5QyxPQUFPLENBQUcsQ0FBQztBQUNqRSxXQUFPLENBQUMsQ0FBQztHQUNWOzs7QUFHRCxNQUFNLG1CQUFtQixHQUFHLE1BQU0sQ0FBQywrQkFBK0IsRUFBRSxDQUFDO0FBQ3JFLE1BQU0sYUFBYSxHQUFHO0FBQ3BCLHVCQUFtQixFQUFuQixtQkFBbUI7QUFDbkIsVUFBTSxFQUFOLE1BQU07QUFDTixZQUFRLEVBQVIsUUFBUTtHQUNULENBQUM7QUFDRixRQUFNLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxhQUFhLENBQUMsQ0FBQzs7O0FBR3pELE1BQU0sOEJBQThCLEdBQUcsTUFBTSxnQ0FBa0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7O0FBRS9FLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUM3QixNQUFJLE9BQU8sT0FBTyxLQUFLLFFBQVEsRUFBRTtBQUMvQixXQUFPLENBQUMsS0FBSyxDQUFDLDRDQUE0QyxDQUFDLENBQUM7QUFDNUQsV0FBTyxDQUFDLENBQUM7R0FDVjs7QUFFRCxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7O0FBRWhDLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQzs7QUFFcEMsTUFBSTtBQUNGLFFBQU0sUUFBUSxHQUFHLE1BQU0sT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0FBQzdDLFVBQU0sOEJBQThCLEVBQUUsQ0FBQztBQUN2QyxXQUFPLFFBQVEsQ0FBQztHQUNqQixDQUFDLE9BQU8sQ0FBQyxFQUFFO0FBQ1YsV0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNqQixXQUFPLENBQUMsQ0FBQztHQUNWO0NBQ0YiLCJmaWxlIjoidGVzdC1ydW5uZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge2luc3RydW1lbnRDb25zb2xlfSBmcm9tICcuL2NvbnNvbGUnO1xuXG50eXBlIFRlc3RSdW5uZXJQYXJhbXMgPSB7XG4gIC8qKiBBYnNvbHV0ZSBwYXRocyB0byB0ZXN0cyB0byBydW4uIENvdWxkIGJlIHBhdGhzIHRvIGZpbGVzIG9yIGRpcmVjdG9yaWVzLiAqL1xuICB0ZXN0UGF0aHM6IEFycmF5PHN0cmluZz47XG5cbiAgLyoqIEEgYm9vbGVhbiBpbmRpY2F0aW5nIHdoZXRoZXIgb3Igbm90IHRoZSB0ZXN0cyBhcmUgcnVubmluZyBoZWFkbGVzcy4gKi9cbiAgaGVhZGxlc3M6IGJvb2xlYW47XG5cbiAgLyoqIENyZWF0ZXMgdGhlIGBhdG9tYCBnbG9iYWwgb2JqZWN0LiAqL1xuICBidWlsZEF0b21FbnZpcm9ubWVudDogKHBhcmFtczogQnVpbGRBdG9tRW52aXJvbm1lbnRQYXJhbXMpID0+IEF0b21HbG9iYWw7XG5cbiAgLyoqIEN1cnJlbnRseSB1bmRvY3VtbnRlZCwgYnV0IHNlZW1pbmdseSBuZWNlc3NhcnkgdG8gdXNlIGJ1aWxkQXRvbUVudmlyb25tZW50KCkuICovXG4gIGJ1aWxkRGVmYXVsdEFwcGxpY2F0aW9uRGVsZWdhdGU6ICgpID0+IE9iamVjdDtcblxuICAvKiogQW4gb3B0aW9uYWwgcGF0aCB0byBhIGxvZyBmaWxlIHRvIHdoaWNoIHRlc3Qgb3V0cHV0IHNob3VsZCBiZSBsb2dnZWQuICovXG4gIGxvZ0ZpbGU6ID9zdHJpbmc7XG5cbiAgLyoqIFVuY2xlYXIgd2hhdCB0aGUgY29udHJhY3Qgb2YgdGhpcyBpcywgYnV0IHdlIHdpbGwgbm90IGJlIHVzaW5nIGl0LiAqL1xuICBsZWdhY3lUZXN0UnVubmVyOiAoKSA9PiB2b2lkO1xufTtcblxudHlwZSBCdWlsZEF0b21FbnZpcm9ubWVudFBhcmFtcyA9IHtcbiAgYXBwbGljYXRpb25EZWxlZ2F0ZTogT2JqZWN0O1xuICB3aW5kb3c6IE9iamVjdDtcbiAgZG9jdW1lbnQ6IE9iamVjdDtcbiAgY29uZmlnRGlyUGF0aD86IHN0cmluZztcbiAgZW5hYmxlUGVyc2lzdGVuY2U/OiBib29sZWFuO1xufTtcblxuZXhwb3J0IHR5cGUgRXhpdENvZGUgPSBudW1iZXI7XG5cbi8qIGVzbGludC1kaXNhYmxlIG5vLWNvbnNvbGUgKi9cbmV4cG9ydCBkZWZhdWx0IGFzeW5jIGZ1bmN0aW9uIHJ1blRlc3QocGFyYW1zOiBUZXN0UnVubmVyUGFyYW1zKTogUHJvbWlzZTxFeGl0Q29kZT4ge1xuICAvLyBWZXJpZnkgdGhhdCBhIC0tbG9nLWZpbGUgYXJndW1lbnQgaGFzIGJlZW4gc3BlY2lmaWVkLlxuICBjb25zdCB7bG9nRmlsZX0gPSBwYXJhbXM7XG4gIGlmIChsb2dGaWxlID09IG51bGwpIHtcbiAgICBjb25zb2xlLmVycm9yKCdNdXN0IHNwZWNpZnkgYXJndW1lbnRzIHZpYSAtLWxvZy1maWxlLicpO1xuICAgIHJldHVybiAxO1xuICB9XG5cbiAgLy8gUGFyc2UgdGhlIGFyZ3MgcGFzc2VkIGFzIEpTT04uXG4gIGxldCBhcmdzO1xuICB0cnkge1xuICAgIGFyZ3MgPSBKU09OLnBhcnNlKGxvZ0ZpbGUpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgY29uc29sZS5lcnJvcihgRmFpbGVkIHRvIHBhcnNlIC0tbG9nLWZpbGUgYXJndW1lbnQ6ICR7bG9nRmlsZX1gKTtcbiAgICByZXR1cm4gMTtcbiAgfVxuXG4gIC8vIFNldCBnbG9iYWwuYXRvbSBiZWZvcmUgcnVubmluZyBhbnkgbW9yZSBjb2RlLlxuICBjb25zdCBhcHBsaWNhdGlvbkRlbGVnYXRlID0gcGFyYW1zLmJ1aWxkRGVmYXVsdEFwcGxpY2F0aW9uRGVsZWdhdGUoKTtcbiAgY29uc3QgYXRvbUVudlBhcmFtcyA9IHtcbiAgICBhcHBsaWNhdGlvbkRlbGVnYXRlLFxuICAgIHdpbmRvdyxcbiAgICBkb2N1bWVudCxcbiAgfTtcbiAgZ2xvYmFsLmF0b20gPSBwYXJhbXMuYnVpbGRBdG9tRW52aXJvbm1lbnQoYXRvbUVudlBhcmFtcyk7XG5cbiAgLy8gU2V0IHVwIHRoZSBjb25zb2xlIGJlZm9yZSBydW5uaW5nIGFueSB1c2VyIGNvZGUuXG4gIGNvbnN0IG5vdGlmeVdoZW5TdGRvdXRIYXNCZWVuRmx1c2hlZCA9IGF3YWl0IGluc3RydW1lbnRDb25zb2xlKGFyZ3NbJ3N0ZG91dCddKTtcblxuICBjb25zdCBwYXRoQXJnID0gYXJnc1sncGF0aCddO1xuICBpZiAodHlwZW9mIHBhdGhBcmcgIT09ICdzdHJpbmcnKSB7XG4gICAgY29uc29sZS5lcnJvcignTXVzdCBzcGVjaWZ5IGEgcGF0aCBpbiB0aGUgLS1sb2ctZmlsZSBKU09OJyk7XG4gICAgcmV0dXJuIDE7XG4gIH1cblxuICBjb25zdCBlbnRyeVBvaW50ID0gYXJnc1sncGF0aCddO1xuICAvLyAkRmxvd0ZpeE1lOiBlbnRyeVBvaW50IGlzIGRldGVybWluZWQgZHluYW1pY2FsbHkgcmF0aGVyIHRoYW4gYSBzdHJpbmcgbGl0ZXJhbC5cbiAgY29uc3QgaGFuZGxlciA9IHJlcXVpcmUoZW50cnlQb2ludCk7XG5cbiAgdHJ5IHtcbiAgICBjb25zdCBleGl0Q29kZSA9IGF3YWl0IGhhbmRsZXIoYXJnc1snYXJncyddKTtcbiAgICBhd2FpdCBub3RpZnlXaGVuU3Rkb3V0SGFzQmVlbkZsdXNoZWQoKTtcbiAgICByZXR1cm4gZXhpdENvZGU7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgIHJldHVybiAxO1xuICB9XG59XG4vKiBlc2xpbnQtZW5hYmxlIG5vLWNvbnNvbGUgKi9cbiJdfQ==