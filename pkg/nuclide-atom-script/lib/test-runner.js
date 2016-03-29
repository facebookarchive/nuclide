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
  (0, _console.instrumentConsole)(args['stdout']);

  var pathArg = args['path'];
  if (typeof pathArg !== 'string') {
    console.error('Must specify a path in the --log-file JSON');
    return 1;
  }

  var entryPoint = args['path'];
  // $FlowFixMe: entryPoint is determined dynamically rather than a string literal.
  var handler = require(entryPoint);

  try {
    return yield handler(args['args']);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRlc3QtcnVubmVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O3VCQVdnQyxXQUFXOzs7dUNBaUM1QixXQUF1QixNQUF3QixFQUFxQjs7TUFFMUUsT0FBTyxHQUFJLE1BQU0sQ0FBakIsT0FBTzs7QUFDZCxNQUFJLE9BQU8sSUFBSSxJQUFJLEVBQUU7QUFDbkIsV0FBTyxDQUFDLEtBQUssQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFDO0FBQ3hELFdBQU8sQ0FBQyxDQUFDO0dBQ1Y7OztBQUdELE1BQUksSUFBSSxZQUFBLENBQUM7QUFDVCxNQUFJO0FBQ0YsUUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7R0FDNUIsQ0FBQyxPQUFPLENBQUMsRUFBRTtBQUNWLFdBQU8sQ0FBQyxLQUFLLDJDQUF5QyxPQUFPLENBQUcsQ0FBQztBQUNqRSxXQUFPLENBQUMsQ0FBQztHQUNWOzs7QUFHRCxNQUFNLG1CQUFtQixHQUFHLE1BQU0sQ0FBQywrQkFBK0IsRUFBRSxDQUFDO0FBQ3JFLE1BQU0sYUFBYSxHQUFHO0FBQ3BCLHVCQUFtQixFQUFuQixtQkFBbUI7QUFDbkIsVUFBTSxFQUFOLE1BQU07QUFDTixZQUFRLEVBQVIsUUFBUTtHQUNULENBQUM7QUFDRixRQUFNLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxhQUFhLENBQUMsQ0FBQzs7O0FBR3pELGtDQUFrQixJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQzs7QUFFbEMsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzdCLE1BQUksT0FBTyxPQUFPLEtBQUssUUFBUSxFQUFFO0FBQy9CLFdBQU8sQ0FBQyxLQUFLLENBQUMsNENBQTRDLENBQUMsQ0FBQztBQUM1RCxXQUFPLENBQUMsQ0FBQztHQUNWOztBQUVELE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQzs7QUFFaEMsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDOztBQUVwQyxNQUFJO0FBQ0YsV0FBTyxNQUFNLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztHQUNwQyxDQUFDLE9BQU8sQ0FBQyxFQUFFO0FBQ1YsV0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNqQixXQUFPLENBQUMsQ0FBQztHQUNWO0NBQ0YiLCJmaWxlIjoidGVzdC1ydW5uZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge2luc3RydW1lbnRDb25zb2xlfSBmcm9tICcuL2NvbnNvbGUnO1xuXG50eXBlIFRlc3RSdW5uZXJQYXJhbXMgPSB7XG4gIC8qKiBBYnNvbHV0ZSBwYXRocyB0byB0ZXN0cyB0byBydW4uIENvdWxkIGJlIHBhdGhzIHRvIGZpbGVzIG9yIGRpcmVjdG9yaWVzLiAqL1xuICB0ZXN0UGF0aHM6IEFycmF5PHN0cmluZz47XG5cbiAgLyoqIEEgYm9vbGVhbiBpbmRpY2F0aW5nIHdoZXRoZXIgb3Igbm90IHRoZSB0ZXN0cyBhcmUgcnVubmluZyBoZWFkbGVzcy4gKi9cbiAgaGVhZGxlc3M6IGJvb2xlYW47XG5cbiAgLyoqIENyZWF0ZXMgdGhlIGBhdG9tYCBnbG9iYWwgb2JqZWN0LiAqL1xuICBidWlsZEF0b21FbnZpcm9ubWVudDogKHBhcmFtczogQnVpbGRBdG9tRW52aXJvbm1lbnRQYXJhbXMpID0+IEF0b21HbG9iYWw7XG5cbiAgLyoqIEN1cnJlbnRseSB1bmRvY3VtbnRlZCwgYnV0IHNlZW1pbmdseSBuZWNlc3NhcnkgdG8gdXNlIGJ1aWxkQXRvbUVudmlyb25tZW50KCkuICovXG4gIGJ1aWxkRGVmYXVsdEFwcGxpY2F0aW9uRGVsZWdhdGU6ICgpID0+IE9iamVjdDtcblxuICAvKiogQW4gb3B0aW9uYWwgcGF0aCB0byBhIGxvZyBmaWxlIHRvIHdoaWNoIHRlc3Qgb3V0cHV0IHNob3VsZCBiZSBsb2dnZWQuICovXG4gIGxvZ0ZpbGU6ID9zdHJpbmc7XG5cbiAgLyoqIFVuY2xlYXIgd2hhdCB0aGUgY29udHJhY3Qgb2YgdGhpcyBpcywgYnV0IHdlIHdpbGwgbm90IGJlIHVzaW5nIGl0LiAqL1xuICBsZWdhY3lUZXN0UnVubmVyOiAoKSA9PiB2b2lkO1xufVxuXG50eXBlIEJ1aWxkQXRvbUVudmlyb25tZW50UGFyYW1zID0ge1xuICBhcHBsaWNhdGlvbkRlbGVnYXRlOiBPYmplY3Q7XG4gIHdpbmRvdzogT2JqZWN0O1xuICBkb2N1bWVudDogT2JqZWN0O1xuICBjb25maWdEaXJQYXRoPzogc3RyaW5nO1xuICBlbmFibGVQZXJzaXN0ZW5jZT86IGJvb2xlYW47XG59XG5cbmV4cG9ydCB0eXBlIEV4aXRDb2RlID0gbnVtYmVyO1xuXG4vKiBlc2xpbnQtZGlzYWJsZSBuby1jb25zb2xlICovXG5leHBvcnQgZGVmYXVsdCBhc3luYyBmdW5jdGlvbiBydW5UZXN0KHBhcmFtczogVGVzdFJ1bm5lclBhcmFtcyk6IFByb21pc2U8RXhpdENvZGU+IHtcbiAgLy8gVmVyaWZ5IHRoYXQgYSAtLWxvZy1maWxlIGFyZ3VtZW50IGhhcyBiZWVuIHNwZWNpZmllZC5cbiAgY29uc3Qge2xvZ0ZpbGV9ID0gcGFyYW1zO1xuICBpZiAobG9nRmlsZSA9PSBudWxsKSB7XG4gICAgY29uc29sZS5lcnJvcignTXVzdCBzcGVjaWZ5IGFyZ3VtZW50cyB2aWEgLS1sb2ctZmlsZS4nKTtcbiAgICByZXR1cm4gMTtcbiAgfVxuXG4gIC8vIFBhcnNlIHRoZSBhcmdzIHBhc3NlZCBhcyBKU09OLlxuICBsZXQgYXJncztcbiAgdHJ5IHtcbiAgICBhcmdzID0gSlNPTi5wYXJzZShsb2dGaWxlKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGNvbnNvbGUuZXJyb3IoYEZhaWxlZCB0byBwYXJzZSAtLWxvZy1maWxlIGFyZ3VtZW50OiAke2xvZ0ZpbGV9YCk7XG4gICAgcmV0dXJuIDE7XG4gIH1cblxuICAvLyBTZXQgZ2xvYmFsLmF0b20gYmVmb3JlIHJ1bm5pbmcgYW55IG1vcmUgY29kZS5cbiAgY29uc3QgYXBwbGljYXRpb25EZWxlZ2F0ZSA9IHBhcmFtcy5idWlsZERlZmF1bHRBcHBsaWNhdGlvbkRlbGVnYXRlKCk7XG4gIGNvbnN0IGF0b21FbnZQYXJhbXMgPSB7XG4gICAgYXBwbGljYXRpb25EZWxlZ2F0ZSxcbiAgICB3aW5kb3csXG4gICAgZG9jdW1lbnQsXG4gIH07XG4gIGdsb2JhbC5hdG9tID0gcGFyYW1zLmJ1aWxkQXRvbUVudmlyb25tZW50KGF0b21FbnZQYXJhbXMpO1xuXG4gIC8vIFNldCB1cCB0aGUgY29uc29sZSBiZWZvcmUgcnVubmluZyBhbnkgdXNlciBjb2RlLlxuICBpbnN0cnVtZW50Q29uc29sZShhcmdzWydzdGRvdXQnXSk7XG5cbiAgY29uc3QgcGF0aEFyZyA9IGFyZ3NbJ3BhdGgnXTtcbiAgaWYgKHR5cGVvZiBwYXRoQXJnICE9PSAnc3RyaW5nJykge1xuICAgIGNvbnNvbGUuZXJyb3IoJ011c3Qgc3BlY2lmeSBhIHBhdGggaW4gdGhlIC0tbG9nLWZpbGUgSlNPTicpO1xuICAgIHJldHVybiAxO1xuICB9XG5cbiAgY29uc3QgZW50cnlQb2ludCA9IGFyZ3NbJ3BhdGgnXTtcbiAgLy8gJEZsb3dGaXhNZTogZW50cnlQb2ludCBpcyBkZXRlcm1pbmVkIGR5bmFtaWNhbGx5IHJhdGhlciB0aGFuIGEgc3RyaW5nIGxpdGVyYWwuXG4gIGNvbnN0IGhhbmRsZXIgPSByZXF1aXJlKGVudHJ5UG9pbnQpO1xuXG4gIHRyeSB7XG4gICAgcmV0dXJuIGF3YWl0IGhhbmRsZXIoYXJnc1snYXJncyddKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgcmV0dXJuIDE7XG4gIH1cbn1cbi8qIGVzbGludC1lbmFibGUgbm8tY29uc29sZSAqL1xuIl19