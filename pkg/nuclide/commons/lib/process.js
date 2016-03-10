var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

/**
 * Since OS X apps don't inherit PATH when not launched from the CLI, this function creates a new
 * environment object given the original environment by modifying the env.PATH using following
 * logic:
 *  1) If originalEnv.PATH doesn't equal to process.env.PATH, which means the PATH has been
 *    modified, we shouldn't do anything.
 *  1) If we are running in OS X, use `/usr/libexec/path_helper -s` to get the correct PATH and
 *    REPLACE the PATH.
 *  2) If step 1 failed or we are not running in OS X, APPEND commonBinaryPaths to current PATH.
 */

var createExecEnvironment = _asyncToGenerator(function* (originalEnv, commonBinaryPaths) {
  var execEnv = _extends({}, originalEnv);

  if (execEnv.PATH !== process.env.PATH) {
    return execEnv;
  }

  execEnv.PATH = execEnv.PATH || '';

  var platformPath = null;
  try {
    platformPath = yield getPlatformPath();
  } catch (error) {
    logError('Failed to getPlatformPath', error);
  }

  // If the platform returns a non-empty PATH, use it. Otherwise use the default set of common
  // binary paths.
  if (platformPath) {
    execEnv.PATH = platformPath;
  } else if (commonBinaryPaths.length) {
    var paths = new Set([].concat(_toConsumableArray(execEnv.PATH.split(_path2['default'].delimiter)), commonBinaryPaths));
    execEnv.PATH = array.from(paths).join(_path2['default'].delimiter);
  }

  return execEnv;
});

/**
 * Basically like spawn, except it handles and logs errors instead of crashing
 * the process. This is much lower-level than asyncExecute. Unless you have a
 * specific reason you should use asyncExecute instead.
 */

var safeSpawn = _asyncToGenerator(function* (command) {
  var args = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];
  var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  options.env = yield createExecEnvironment(options.env || process.env, COMMON_BINARY_PATHS);
  var child = (0, _child_process.spawn)(command, args, options);
  monitorStreamErrors(child, command, args, options);
  child.on('error', function (error) {
    logError('error with command:', command, args, options, 'error:', error);
  });
  return child;
});

var forkWithExecEnvironment = _asyncToGenerator(function* (modulePath) {
  var args = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];
  var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  var forkOptions = _extends({}, options, {
    env: yield createExecEnvironment(options.env || process.env, COMMON_BINARY_PATHS)
  });
  var child = (0, _child_process.fork)(modulePath, args, forkOptions);
  child.on('error', function (error) {
    logError('error from module:', modulePath, args, options, 'error:', error);
  });
  return child;
});

var asyncExecute = _asyncToGenerator(function* (command, args) {
  var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  /* $FlowIssue (t8216189) */
  var result = yield checkOutput(command, args, options);
  if (result.exitCode !== 0) {
    // Duck typing Error.
    result['name'] = 'Async Execution Error';
    result['message'] = 'exitCode: ' + result.exitCode + ', stderr: ' + result.stderr + ', stdout: ' + result.stdout + '.';
    throw result;
  }
  return result;
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _array = require('./array');

var array = _interopRequireWildcard(_array);

var _child_process = require('child_process');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _PromiseExecutors = require('./PromiseExecutors');

var _stream = require('./stream');

var _rx = require('rx');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var platformPathPromise = undefined;

var blockingQueues = {};
var COMMON_BINARY_PATHS = ['/usr/bin', '/bin', '/usr/sbin', '/sbin', '/usr/local/bin'];

/**
 * Captures the value of the PATH env variable returned by Darwin's (OS X) `path_helper` utility.
 * `path_helper -s`'s return value looks like this:
 *
 *     PATH="/usr/bin"; export PATH;
 */
var DARWIN_PATH_HELPER_REGEXP = /PATH=\"([^\"]+)\"/;

var STREAM_NAMES = ['stdin', 'stdout', 'stderr'];

function getPlatformPath() {
  // Do not return the cached value if we are executing under the test runner.
  if (platformPathPromise && process.env.NODE_ENV !== 'test') {
    // Path is being fetched, await the Promise that's in flight.
    return platformPathPromise;
  }

  // We do not cache the result of this check because we have unit tests that temporarily redefine
  // the value of process.platform.
  if (process.platform === 'darwin') {
    // OS X apps don't inherit PATH when not launched from the CLI, so reconstruct it. This is a
    // bug, filed against Atom Linter here: https://github.com/AtomLinter/Linter/issues/150
    // TODO(jjiaa): remove this hack when the Atom issue is closed
    platformPathPromise = new Promise(function (resolve, reject) {
      (0, _child_process.execFile)('/usr/libexec/path_helper', ['-s'], function (error, stdout, stderr) {
        if (error) {
          reject(error);
        } else {
          var match = stdout.match(DARWIN_PATH_HELPER_REGEXP);
          resolve(match && match.length > 1 ? match[1] : '');
        }
      });
    });
  } else {
    platformPathPromise = Promise.resolve('');
  }

  return platformPathPromise;
}

function logError() {
  // Can't use nuclide-logging here to not cause cycle dependency.
  /*eslint-disable no-console*/
  console.error.apply(console, arguments);
  /*eslint-enable no-console*/
}

function monitorStreamErrors(process, command, args, options) {
  STREAM_NAMES.forEach(function (streamName) {
    // $FlowIssue
    process[streamName].on('error', function (error) {
      // This can happen without the full execution of the command to fail,
      // but we want to learn about it.
      logError('stream error on stream ' + streamName + ' with command:', command, args, options, 'error:', error);
    });
  });
}

var isOsX = process.platform === 'darwin';

/**
 * Takes the command and args that you would normally pass to `spawn()` and returns `newArgs` such
 * that you should call it with `spawn('script', newArgs)` to run the original command/args pair
 * under `script`.
 */
function createArgsForScriptCommand(command) {
  var args = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

  if (isOsX) {
    // On OS X, script takes the program to run and its arguments as varargs at the end.
    return ['-q', '/dev/null', command].concat(args);
  } else {
    // On Linux, script takes the command to run as the -c parameter.
    // TODO: Shell escape every element in allArgs.
    var allArgs = [command].concat(args);
    var commandAsItsOwnArg = allArgs.join(' ');
    return ['-q', '/dev/null', '-c', commandAsItsOwnArg];
  }
}

/**
 * Basically like safeSpawn, but runs the command with the `script` command.
 * `script` ensures terminal-like environment and commands we run give colored output.
 */
function scriptSafeSpawn(command) {
  var args = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];
  var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  var newArgs = createArgsForScriptCommand(command, args);
  return safeSpawn('script', newArgs, options);
}

/**
 * Wraps scriptSafeSpawn with an Observable that lets you listen to the stdout and
 * stderr of the spawned process.
 */
function scriptSafeSpawnAndObserveOutput(command) {
  var args = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];
  var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  return _rx.Observable.create(function (observer) {
    var childProcess = undefined;
    scriptSafeSpawn(command, args, options).then(function (proc) {
      childProcess = proc;

      childProcess.stdout.on('data', function (data) {
        observer.onNext({ stdout: data.toString() });
      });

      var stderr = '';
      childProcess.stderr.on('data', function (data) {
        stderr += data;
        observer.onNext({ stderr: data.toString() });
      });

      childProcess.on('exit', function (exitCode) {
        if (exitCode !== 0) {
          observer.onError(stderr);
        } else {
          observer.onCompleted();
        }
        childProcess = null;
      });
    });

    return function () {
      if (childProcess) {
        childProcess.kill();
      }
    };
  });
}

var ProcessResource = (function () {
  function ProcessResource(promiseOrProcess) {
    _classCallCheck(this, ProcessResource);

    this.disposed$ = new _rx.ReplaySubject(1);
    this.process$ = _rx.Observable.fromPromise(Promise.resolve(promiseOrProcess));

    _rx.Observable.combineLatest(this.process$, this.disposed$).takeUntil(this.process$.flatMap(function (process) {
      return _rx.Observable.fromEvent(process, 'exit');
    })).subscribe(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2);

      var process = _ref2[0];
      var disposed = _ref2[1];

      if (disposed && process != null) {
        process.kill();
      }
    });
  }

  /**
   * Observe the stdout, stderr and exit code of a process.
   * stdout and stderr are split by newlines.
   */

  _createClass(ProcessResource, [{
    key: 'getStream',
    value: function getStream() {
      return this.process$.takeUntil(this.disposed$);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this.disposed$.onNext(true);
      this.disposed$.onCompleted();
    }
  }]);

  return ProcessResource;
})();

function observeProcessExit(createProcess) {
  return _rx.Observable.using(function () {
    return new ProcessResource(createProcess());
  }, function (processResource) {
    return processResource.getStream().flatMap(function (process) {
      return _rx.Observable.fromEvent(process, 'exit').take(1);
    });
  });
}

/**
 * Observe the stdout, stderr and exit code of a process.
 */
function observeProcess(createProcess) {
  return _rx.Observable.using(function () {
    return new ProcessResource(createProcess());
  }, function (processResource) {
    return processResource.getStream().flatMap(function (process) {
      (0, _assert2['default'])(process != null, 'process has not yet been disposed');
      // Use replay/connect on exit for the final concat.
      // By default concat defers subscription until after the LHS completes.
      var exit = _rx.Observable.fromEvent(process, 'exit').take(1).map(function (exitCode) {
        return { kind: 'exit', exitCode: exitCode };
      }).replay();
      exit.connect();
      var error = _rx.Observable.fromEvent(process, 'error').takeUntil(exit).map(function (errorObj) {
        return { kind: 'error', error: errorObj };
      });
      var stdout = (0, _stream.splitStream)((0, _stream.observeStream)(process.stdout)).map(function (data) {
        return { kind: 'stdout', data: data };
      });
      var stderr = (0, _stream.splitStream)((0, _stream.observeStream)(process.stderr)).map(function (data) {
        return { kind: 'stderr', data: data };
      });
      return stdout.merge(stderr).merge(error).concat(exit);
    });
  });
}

/**
 * Returns a promise that resolves to the result of executing a process.
 *
 * @param command The command to execute.
 * @param args The arguments to pass to the command.
 * @param options Options for changing how to run the command.
 *     See here: http://nodejs.org/api/child_process.html
 *     The additional options we provide:
 *       queueName string The queue on which to block dependent calls.
 *       stdin string The contents to write to stdin.
 *       pipedCommand string a command to pipe the output of command through.
 *       pipedArgs array of strings as arguments.
 * @return Promise that resolves to an object with the properties:
 *     stdout string The contents of the process's output stream.
 *     stderr string The contents of the process's error stream.
 *     exitCode number The exit code returned by the process.
 */
function checkOutput(command, args) {
  var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  // Clone passed in options so this function doesn't modify an object it doesn't own.
  var localOptions = _extends({}, options);

  var executor = function executor(resolve, reject) {
    var firstChild = undefined;
    var lastChild = undefined;

    var firstChildStderr = undefined;
    if (localOptions.pipedCommand) {
      // If a second command is given, pipe stdout of first to stdin of second. String output
      // returned in this function's Promise will be stderr/stdout of the second command.
      firstChild = (0, _child_process.spawn)(command, args, localOptions);
      monitorStreamErrors(firstChild, command, args, localOptions);
      firstChildStderr = '';

      firstChild.on('error', function (error) {
        // Reject early with the result when encountering an error.
        reject({
          command: [command].concat(args).join(' '),
          errorMessage: error.message,
          exitCode: error.code,
          stderr: firstChildStderr,
          stdout: ''
        });
      });

      firstChild.stderr.on('data', function (data) {
        firstChildStderr += data;
      });

      lastChild = (0, _child_process.spawn)(localOptions.pipedCommand, localOptions.pipedArgs, localOptions);
      monitorStreamErrors(lastChild, command, args, localOptions);
      // pipe() normally pauses the writer when the reader errors (closes).
      // This is not how UNIX pipes work: if the reader closes, the writer needs
      // to also close (otherwise the writer process may hang.)
      // We have to manually close the writer in this case.
      lastChild.stdin.on('error', function () {
        firstChild.stdout.emit('end');
      });
      firstChild.stdout.pipe(lastChild.stdin);
    } else {
      lastChild = (0, _child_process.spawn)(command, args, localOptions);
      monitorStreamErrors(lastChild, command, args, localOptions);
      firstChild = lastChild;
    }

    var stderr = '';
    var stdout = '';
    lastChild.on('close', function (exitCode) {
      resolve({
        exitCode: exitCode,
        stderr: stderr,
        stdout: stdout
      });
    });

    lastChild.on('error', function (error) {
      // Reject early with the result when encountering an error.
      reject({
        command: [command].concat(args).join(' '),
        errorMessage: error.message,
        exitCode: error.code,
        stderr: stderr,
        stdout: stdout
      });
    });

    lastChild.stderr.on('data', function (data) {
      stderr += data;
    });
    lastChild.stdout.on('data', function (data) {
      stdout += data;
    });

    if (typeof localOptions.stdin === 'string') {
      // Note that the Node docs have this scary warning about stdin.end() on
      // http://nodejs.org/api/child_process.html#child_process_child_stdin:
      //
      // "A Writable Stream that represents the child process's stdin. Closing
      // this stream via end() often causes the child process to terminate."
      //
      // In practice, this has not appeared to cause any issues thus far.
      firstChild.stdin.write(localOptions.stdin);
      firstChild.stdin.end();
    }
  };

  function makePromise() {
    if (localOptions.queueName === undefined) {
      return new Promise(executor);
    } else {
      if (!blockingQueues[localOptions.queueName]) {
        blockingQueues[localOptions.queueName] = new _PromiseExecutors.PromiseQueue();
      }
      return blockingQueues[localOptions.queueName].submit(executor);
    }
  }

  return createExecEnvironment(localOptions.env || process.env, COMMON_BINARY_PATHS).then(function (val) {
    localOptions.env = val;
    return makePromise();
  }, function (error) {
    localOptions.env = localOptions.env || process.env;
    return makePromise();
  });
}

module.exports = {
  asyncExecute: asyncExecute,
  createArgsForScriptCommand: createArgsForScriptCommand,
  checkOutput: checkOutput,
  forkWithExecEnvironment: forkWithExecEnvironment,
  safeSpawn: safeSpawn,
  scriptSafeSpawn: scriptSafeSpawn,
  scriptSafeSpawnAndObserveOutput: scriptSafeSpawnAndObserveOutput,
  createExecEnvironment: createExecEnvironment,
  observeProcessExit: observeProcessExit,
  observeProcess: observeProcess,
  COMMON_BINARY_PATHS: COMMON_BINARY_PATHS,
  __test__: {
    DARWIN_PATH_HELPER_REGEXP: DARWIN_PATH_HELPER_REGEXP
  }
};
//# sourceMappingURL=data:application/json;base64,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LENBQUMsR0FBRyxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUM7QUFDbkQsV0FBTyxXQUFXLEVBQUUsQ0FBQztHQUN0QixDQUNGLENBQUM7Q0FDSDs7QUFrQkQsTUFBTSxDQUFDLE9BQU8sR0FBRztBQUNmLGNBQVksRUFBWixZQUFZO0FBQ1osNEJBQTBCLEVBQTFCLDBCQUEwQjtBQUMxQixhQUFXLEVBQVgsV0FBVztBQUNYLHlCQUF1QixFQUF2Qix1QkFBdUI7QUFDdkIsV0FBUyxFQUFULFNBQVM7QUFDVCxpQkFBZSxFQUFmLGVBQWU7QUFDZixpQ0FBK0IsRUFBL0IsK0JBQStCO0FBQy9CLHVCQUFxQixFQUFyQixxQkFBcUI7QUFDckIsb0JBQWtCLEVBQWxCLGtCQUFrQjtBQUNsQixnQkFBYyxFQUFkLGNBQWM7QUFDZCxxQkFBbUIsRUFBbkIsbUJBQW1CO0FBQ25CLFVBQVEsRUFBRTtBQUNSLDZCQUF5QixFQUF6Qix5QkFBeUI7R0FDMUI7Q0FDRixDQUFDIiwiZmlsZSI6InByb2Nlc3MuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgKiBhcyBhcnJheSBmcm9tICcuL2FycmF5JztcbmltcG9ydCB7XG4gIGV4ZWNGaWxlLFxuICBmb3JrLFxuICBzcGF3bixcbn0gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7UHJvbWlzZVF1ZXVlfSBmcm9tICcuL1Byb21pc2VFeGVjdXRvcnMnO1xuXG5pbXBvcnQgdHlwZSB7T2JzZXJ2ZXJ9IGZyb20gJ3J4JztcbmltcG9ydCB0eXBlIHtQcm9jZXNzTWVzc2FnZSwgcHJvY2VzcyRhc3luY0V4ZWN1dGVSZXR9IGZyb20gJy4vbWFpbic7XG5cbmltcG9ydCB7b2JzZXJ2ZVN0cmVhbSwgc3BsaXRTdHJlYW19IGZyb20gJy4vc3RyZWFtJztcbmltcG9ydCB7T2JzZXJ2YWJsZSwgUmVwbGF5U3ViamVjdH0gZnJvbSAncngnO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuXG5sZXQgcGxhdGZvcm1QYXRoUHJvbWlzZTogP1Byb21pc2U8c3RyaW5nPjtcblxuY29uc3QgYmxvY2tpbmdRdWV1ZXMgPSB7fTtcbmNvbnN0IENPTU1PTl9CSU5BUllfUEFUSFMgPSBbJy91c3IvYmluJywgJy9iaW4nLCAnL3Vzci9zYmluJywgJy9zYmluJywgJy91c3IvbG9jYWwvYmluJ107XG5cbi8qKlxuICogQ2FwdHVyZXMgdGhlIHZhbHVlIG9mIHRoZSBQQVRIIGVudiB2YXJpYWJsZSByZXR1cm5lZCBieSBEYXJ3aW4ncyAoT1MgWCkgYHBhdGhfaGVscGVyYCB1dGlsaXR5LlxuICogYHBhdGhfaGVscGVyIC1zYCdzIHJldHVybiB2YWx1ZSBsb29rcyBsaWtlIHRoaXM6XG4gKlxuICogICAgIFBBVEg9XCIvdXNyL2JpblwiOyBleHBvcnQgUEFUSDtcbiAqL1xuY29uc3QgREFSV0lOX1BBVEhfSEVMUEVSX1JFR0VYUCA9IC9QQVRIPVxcXCIoW15cXFwiXSspXFxcIi87XG5cbmNvbnN0IFNUUkVBTV9OQU1FUyA9IFsnc3RkaW4nLCAnc3Rkb3V0JywgJ3N0ZGVyciddO1xuXG5mdW5jdGlvbiBnZXRQbGF0Zm9ybVBhdGgoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgLy8gRG8gbm90IHJldHVybiB0aGUgY2FjaGVkIHZhbHVlIGlmIHdlIGFyZSBleGVjdXRpbmcgdW5kZXIgdGhlIHRlc3QgcnVubmVyLlxuICBpZiAocGxhdGZvcm1QYXRoUHJvbWlzZSAmJiBwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Rlc3QnKSB7XG4gICAgLy8gUGF0aCBpcyBiZWluZyBmZXRjaGVkLCBhd2FpdCB0aGUgUHJvbWlzZSB0aGF0J3MgaW4gZmxpZ2h0LlxuICAgIHJldHVybiBwbGF0Zm9ybVBhdGhQcm9taXNlO1xuICB9XG5cbiAgLy8gV2UgZG8gbm90IGNhY2hlIHRoZSByZXN1bHQgb2YgdGhpcyBjaGVjayBiZWNhdXNlIHdlIGhhdmUgdW5pdCB0ZXN0cyB0aGF0IHRlbXBvcmFyaWx5IHJlZGVmaW5lXG4gIC8vIHRoZSB2YWx1ZSBvZiBwcm9jZXNzLnBsYXRmb3JtLlxuICBpZiAocHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ2RhcndpbicpIHtcbiAgICAvLyBPUyBYIGFwcHMgZG9uJ3QgaW5oZXJpdCBQQVRIIHdoZW4gbm90IGxhdW5jaGVkIGZyb20gdGhlIENMSSwgc28gcmVjb25zdHJ1Y3QgaXQuIFRoaXMgaXMgYVxuICAgIC8vIGJ1ZywgZmlsZWQgYWdhaW5zdCBBdG9tIExpbnRlciBoZXJlOiBodHRwczovL2dpdGh1Yi5jb20vQXRvbUxpbnRlci9MaW50ZXIvaXNzdWVzLzE1MFxuICAgIC8vIFRPRE8oamppYWEpOiByZW1vdmUgdGhpcyBoYWNrIHdoZW4gdGhlIEF0b20gaXNzdWUgaXMgY2xvc2VkXG4gICAgcGxhdGZvcm1QYXRoUHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGV4ZWNGaWxlKCcvdXNyL2xpYmV4ZWMvcGF0aF9oZWxwZXInLCBbJy1zJ10sIChlcnJvciwgc3Rkb3V0LCBzdGRlcnIpID0+IHtcbiAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCBtYXRjaCA9IHN0ZG91dC5tYXRjaChEQVJXSU5fUEFUSF9IRUxQRVJfUkVHRVhQKTtcbiAgICAgICAgICByZXNvbHZlKChtYXRjaCAmJiBtYXRjaC5sZW5ndGggPiAxKSA/IG1hdGNoWzFdIDogJycpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICBwbGF0Zm9ybVBhdGhQcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKCcnKTtcbiAgfVxuXG4gIHJldHVybiBwbGF0Zm9ybVBhdGhQcm9taXNlO1xufVxuXG4vKipcbiAqIFNpbmNlIE9TIFggYXBwcyBkb24ndCBpbmhlcml0IFBBVEggd2hlbiBub3QgbGF1bmNoZWQgZnJvbSB0aGUgQ0xJLCB0aGlzIGZ1bmN0aW9uIGNyZWF0ZXMgYSBuZXdcbiAqIGVudmlyb25tZW50IG9iamVjdCBnaXZlbiB0aGUgb3JpZ2luYWwgZW52aXJvbm1lbnQgYnkgbW9kaWZ5aW5nIHRoZSBlbnYuUEFUSCB1c2luZyBmb2xsb3dpbmdcbiAqIGxvZ2ljOlxuICogIDEpIElmIG9yaWdpbmFsRW52LlBBVEggZG9lc24ndCBlcXVhbCB0byBwcm9jZXNzLmVudi5QQVRILCB3aGljaCBtZWFucyB0aGUgUEFUSCBoYXMgYmVlblxuICogICAgbW9kaWZpZWQsIHdlIHNob3VsZG4ndCBkbyBhbnl0aGluZy5cbiAqICAxKSBJZiB3ZSBhcmUgcnVubmluZyBpbiBPUyBYLCB1c2UgYC91c3IvbGliZXhlYy9wYXRoX2hlbHBlciAtc2AgdG8gZ2V0IHRoZSBjb3JyZWN0IFBBVEggYW5kXG4gKiAgICBSRVBMQUNFIHRoZSBQQVRILlxuICogIDIpIElmIHN0ZXAgMSBmYWlsZWQgb3Igd2UgYXJlIG5vdCBydW5uaW5nIGluIE9TIFgsIEFQUEVORCBjb21tb25CaW5hcnlQYXRocyB0byBjdXJyZW50IFBBVEguXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGNyZWF0ZUV4ZWNFbnZpcm9ubWVudChcbiAgb3JpZ2luYWxFbnY6IE9iamVjdCxcbiAgY29tbW9uQmluYXJ5UGF0aHM6IEFycmF5PHN0cmluZz4sXG4pOiBQcm9taXNlPE9iamVjdD4ge1xuICBjb25zdCBleGVjRW52ID0gey4uLm9yaWdpbmFsRW52fTtcblxuICBpZiAoZXhlY0Vudi5QQVRIICE9PSBwcm9jZXNzLmVudi5QQVRIKSB7XG4gICAgcmV0dXJuIGV4ZWNFbnY7XG4gIH1cblxuICBleGVjRW52LlBBVEggPSBleGVjRW52LlBBVEggfHwgJyc7XG5cbiAgbGV0IHBsYXRmb3JtUGF0aCA9IG51bGw7XG4gIHRyeSB7XG4gICAgcGxhdGZvcm1QYXRoID0gYXdhaXQgZ2V0UGxhdGZvcm1QYXRoKCk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgbG9nRXJyb3IoJ0ZhaWxlZCB0byBnZXRQbGF0Zm9ybVBhdGgnLCBlcnJvcik7XG4gIH1cblxuICAvLyBJZiB0aGUgcGxhdGZvcm0gcmV0dXJucyBhIG5vbi1lbXB0eSBQQVRILCB1c2UgaXQuIE90aGVyd2lzZSB1c2UgdGhlIGRlZmF1bHQgc2V0IG9mIGNvbW1vblxuICAvLyBiaW5hcnkgcGF0aHMuXG4gIGlmIChwbGF0Zm9ybVBhdGgpIHtcbiAgICBleGVjRW52LlBBVEggPSBwbGF0Zm9ybVBhdGg7XG4gIH0gZWxzZSBpZiAoY29tbW9uQmluYXJ5UGF0aHMubGVuZ3RoKSB7XG4gICAgY29uc3QgcGF0aHMgPSBuZXcgU2V0KFtcbiAgICAgIC4uLmV4ZWNFbnYuUEFUSC5zcGxpdChwYXRoLmRlbGltaXRlciksXG4gICAgICAuLi5jb21tb25CaW5hcnlQYXRocyxcbiAgICBdKTtcbiAgICBleGVjRW52LlBBVEggPSBhcnJheS5mcm9tKHBhdGhzKS5qb2luKHBhdGguZGVsaW1pdGVyKTtcbiAgfVxuXG4gIHJldHVybiBleGVjRW52O1xufVxuXG5mdW5jdGlvbiBsb2dFcnJvciguLi5hcmdzKSB7XG4gIC8vIENhbid0IHVzZSBudWNsaWRlLWxvZ2dpbmcgaGVyZSB0byBub3QgY2F1c2UgY3ljbGUgZGVwZW5kZW5jeS5cbiAgLyplc2xpbnQtZGlzYWJsZSBuby1jb25zb2xlKi9cbiAgY29uc29sZS5lcnJvciguLi5hcmdzKTtcbiAgLyplc2xpbnQtZW5hYmxlIG5vLWNvbnNvbGUqL1xufVxuXG5mdW5jdGlvbiBtb25pdG9yU3RyZWFtRXJyb3JzKHByb2Nlc3M6IGNoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzLCBjb21tYW5kLCBhcmdzLCBvcHRpb25zKTogdm9pZCB7XG4gIFNUUkVBTV9OQU1FUy5mb3JFYWNoKHN0cmVhbU5hbWUgPT4ge1xuICAgIC8vICRGbG93SXNzdWVcbiAgICBwcm9jZXNzW3N0cmVhbU5hbWVdLm9uKCdlcnJvcicsIGVycm9yID0+IHtcbiAgICAgIC8vIFRoaXMgY2FuIGhhcHBlbiB3aXRob3V0IHRoZSBmdWxsIGV4ZWN1dGlvbiBvZiB0aGUgY29tbWFuZCB0byBmYWlsLFxuICAgICAgLy8gYnV0IHdlIHdhbnQgdG8gbGVhcm4gYWJvdXQgaXQuXG4gICAgICBsb2dFcnJvcihcbiAgICAgICAgYHN0cmVhbSBlcnJvciBvbiBzdHJlYW0gJHtzdHJlYW1OYW1lfSB3aXRoIGNvbW1hbmQ6YCxcbiAgICAgICAgY29tbWFuZCxcbiAgICAgICAgYXJncyxcbiAgICAgICAgb3B0aW9ucyxcbiAgICAgICAgJ2Vycm9yOicsXG4gICAgICAgIGVycm9yLFxuICAgICAgKTtcbiAgICB9KTtcbiAgfSk7XG59XG5cbi8qKlxuICogQmFzaWNhbGx5IGxpa2Ugc3Bhd24sIGV4Y2VwdCBpdCBoYW5kbGVzIGFuZCBsb2dzIGVycm9ycyBpbnN0ZWFkIG9mIGNyYXNoaW5nXG4gKiB0aGUgcHJvY2Vzcy4gVGhpcyBpcyBtdWNoIGxvd2VyLWxldmVsIHRoYW4gYXN5bmNFeGVjdXRlLiBVbmxlc3MgeW91IGhhdmUgYVxuICogc3BlY2lmaWMgcmVhc29uIHlvdSBzaG91bGQgdXNlIGFzeW5jRXhlY3V0ZSBpbnN0ZWFkLlxuICovXG5hc3luYyBmdW5jdGlvbiBzYWZlU3Bhd24oXG4gIGNvbW1hbmQ6IHN0cmluZyxcbiAgYXJncz86IEFycmF5PHN0cmluZz4gPSBbXSxcbiAgb3B0aW9ucz86IE9iamVjdCA9IHt9LFxuKTogUHJvbWlzZTxjaGlsZF9wcm9jZXNzJENoaWxkUHJvY2Vzcz4ge1xuICBvcHRpb25zLmVudiA9IGF3YWl0IGNyZWF0ZUV4ZWNFbnZpcm9ubWVudChvcHRpb25zLmVudiB8fCBwcm9jZXNzLmVudiwgQ09NTU9OX0JJTkFSWV9QQVRIUyk7XG4gIGNvbnN0IGNoaWxkID0gc3Bhd24oY29tbWFuZCwgYXJncywgb3B0aW9ucyk7XG4gIG1vbml0b3JTdHJlYW1FcnJvcnMoY2hpbGQsIGNvbW1hbmQsIGFyZ3MsIG9wdGlvbnMpO1xuICBjaGlsZC5vbignZXJyb3InLCBlcnJvciA9PiB7XG4gICAgbG9nRXJyb3IoJ2Vycm9yIHdpdGggY29tbWFuZDonLCBjb21tYW5kLCBhcmdzLCBvcHRpb25zLCAnZXJyb3I6JywgZXJyb3IpO1xuICB9KTtcbiAgcmV0dXJuIGNoaWxkO1xufVxuXG5hc3luYyBmdW5jdGlvbiBmb3JrV2l0aEV4ZWNFbnZpcm9ubWVudChcbiAgbW9kdWxlUGF0aDogc3RyaW5nLFxuICBhcmdzPzogQXJyYXk8c3RyaW5nPiA9IFtdLFxuICBvcHRpb25zPzogT2JqZWN0ID0ge30sXG4pOiBQcm9taXNlPGNoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzPiB7XG4gIGNvbnN0IGZvcmtPcHRpb25zID0ge1xuICAgIC4uLm9wdGlvbnMsXG4gICAgZW52OiBhd2FpdCBjcmVhdGVFeGVjRW52aXJvbm1lbnQob3B0aW9ucy5lbnYgfHwgcHJvY2Vzcy5lbnYsIENPTU1PTl9CSU5BUllfUEFUSFMpLFxuICB9O1xuICBjb25zdCBjaGlsZCA9IGZvcmsobW9kdWxlUGF0aCwgYXJncywgZm9ya09wdGlvbnMpO1xuICBjaGlsZC5vbignZXJyb3InLCBlcnJvciA9PiB7XG4gICAgbG9nRXJyb3IoJ2Vycm9yIGZyb20gbW9kdWxlOicsIG1vZHVsZVBhdGgsIGFyZ3MsIG9wdGlvbnMsICdlcnJvcjonLCBlcnJvcik7XG4gIH0pO1xuICByZXR1cm4gY2hpbGQ7XG59XG5cbmNvbnN0IGlzT3NYID0gcHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ2Rhcndpbic7XG5cbi8qKlxuICogVGFrZXMgdGhlIGNvbW1hbmQgYW5kIGFyZ3MgdGhhdCB5b3Ugd291bGQgbm9ybWFsbHkgcGFzcyB0byBgc3Bhd24oKWAgYW5kIHJldHVybnMgYG5ld0FyZ3NgIHN1Y2hcbiAqIHRoYXQgeW91IHNob3VsZCBjYWxsIGl0IHdpdGggYHNwYXduKCdzY3JpcHQnLCBuZXdBcmdzKWAgdG8gcnVuIHRoZSBvcmlnaW5hbCBjb21tYW5kL2FyZ3MgcGFpclxuICogdW5kZXIgYHNjcmlwdGAuXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUFyZ3NGb3JTY3JpcHRDb21tYW5kKGNvbW1hbmQ6IHN0cmluZywgYXJncz86IEFycmF5PHN0cmluZz4gPSBbXSk6IEFycmF5PHN0cmluZz4ge1xuICBpZiAoaXNPc1gpIHtcbiAgICAvLyBPbiBPUyBYLCBzY3JpcHQgdGFrZXMgdGhlIHByb2dyYW0gdG8gcnVuIGFuZCBpdHMgYXJndW1lbnRzIGFzIHZhcmFyZ3MgYXQgdGhlIGVuZC5cbiAgICByZXR1cm4gWyctcScsICcvZGV2L251bGwnLCBjb21tYW5kXS5jb25jYXQoYXJncyk7XG4gIH0gZWxzZSB7XG4gICAgLy8gT24gTGludXgsIHNjcmlwdCB0YWtlcyB0aGUgY29tbWFuZCB0byBydW4gYXMgdGhlIC1jIHBhcmFtZXRlci5cbiAgICAvLyBUT0RPOiBTaGVsbCBlc2NhcGUgZXZlcnkgZWxlbWVudCBpbiBhbGxBcmdzLlxuICAgIGNvbnN0IGFsbEFyZ3MgPSBbY29tbWFuZF0uY29uY2F0KGFyZ3MpO1xuICAgIGNvbnN0IGNvbW1hbmRBc0l0c093bkFyZyA9IGFsbEFyZ3Muam9pbignICcpO1xuICAgIHJldHVybiBbJy1xJywgJy9kZXYvbnVsbCcsICctYycsIGNvbW1hbmRBc0l0c093bkFyZ107XG4gIH1cbn1cblxuLyoqXG4gKiBCYXNpY2FsbHkgbGlrZSBzYWZlU3Bhd24sIGJ1dCBydW5zIHRoZSBjb21tYW5kIHdpdGggdGhlIGBzY3JpcHRgIGNvbW1hbmQuXG4gKiBgc2NyaXB0YCBlbnN1cmVzIHRlcm1pbmFsLWxpa2UgZW52aXJvbm1lbnQgYW5kIGNvbW1hbmRzIHdlIHJ1biBnaXZlIGNvbG9yZWQgb3V0cHV0LlxuICovXG5mdW5jdGlvbiBzY3JpcHRTYWZlU3Bhd24oXG4gIGNvbW1hbmQ6IHN0cmluZyxcbiAgYXJncz86IEFycmF5PHN0cmluZz4gPSBbXSxcbiAgb3B0aW9ucz86IE9iamVjdCA9IHt9LFxuKTogUHJvbWlzZTxjaGlsZF9wcm9jZXNzJENoaWxkUHJvY2Vzcz4ge1xuICBjb25zdCBuZXdBcmdzID0gY3JlYXRlQXJnc0ZvclNjcmlwdENvbW1hbmQoY29tbWFuZCwgYXJncyk7XG4gIHJldHVybiBzYWZlU3Bhd24oJ3NjcmlwdCcsIG5ld0FyZ3MsIG9wdGlvbnMpO1xufVxuXG4vKipcbiAqIFdyYXBzIHNjcmlwdFNhZmVTcGF3biB3aXRoIGFuIE9ic2VydmFibGUgdGhhdCBsZXRzIHlvdSBsaXN0ZW4gdG8gdGhlIHN0ZG91dCBhbmRcbiAqIHN0ZGVyciBvZiB0aGUgc3Bhd25lZCBwcm9jZXNzLlxuICovXG5mdW5jdGlvbiBzY3JpcHRTYWZlU3Bhd25BbmRPYnNlcnZlT3V0cHV0KFxuICBjb21tYW5kOiBzdHJpbmcsXG4gIGFyZ3M/OiBBcnJheTxzdHJpbmc+ID0gW10sXG4gIG9wdGlvbnM/OiBPYmplY3QgPSB7fSxcbik6IE9ic2VydmFibGU8e3N0ZGVycj86IHN0cmluZzsgc3Rkb3V0Pzogc3RyaW5nO30+IHtcbiAgcmV0dXJuIE9ic2VydmFibGUuY3JlYXRlKChvYnNlcnZlcjogT2JzZXJ2ZXIpID0+IHtcbiAgICBsZXQgY2hpbGRQcm9jZXNzO1xuICAgIHNjcmlwdFNhZmVTcGF3bihjb21tYW5kLCBhcmdzLCBvcHRpb25zKS50aGVuKHByb2MgPT4ge1xuICAgICAgY2hpbGRQcm9jZXNzID0gcHJvYztcblxuICAgICAgY2hpbGRQcm9jZXNzLnN0ZG91dC5vbignZGF0YScsIGRhdGEgPT4ge1xuICAgICAgICBvYnNlcnZlci5vbk5leHQoe3N0ZG91dDogZGF0YS50b1N0cmluZygpfSk7XG4gICAgICB9KTtcblxuICAgICAgbGV0IHN0ZGVyciA9ICcnO1xuICAgICAgY2hpbGRQcm9jZXNzLnN0ZGVyci5vbignZGF0YScsIGRhdGEgPT4ge1xuICAgICAgICBzdGRlcnIgKz0gZGF0YTtcbiAgICAgICAgb2JzZXJ2ZXIub25OZXh0KHtzdGRlcnI6IGRhdGEudG9TdHJpbmcoKX0pO1xuICAgICAgfSk7XG5cbiAgICAgIGNoaWxkUHJvY2Vzcy5vbignZXhpdCcsIChleGl0Q29kZTogbnVtYmVyKSA9PiB7XG4gICAgICAgIGlmIChleGl0Q29kZSAhPT0gMCkge1xuICAgICAgICAgIG9ic2VydmVyLm9uRXJyb3Ioc3RkZXJyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBvYnNlcnZlci5vbkNvbXBsZXRlZCgpO1xuICAgICAgICB9XG4gICAgICAgIGNoaWxkUHJvY2VzcyA9IG51bGw7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBpZiAoY2hpbGRQcm9jZXNzKSB7XG4gICAgICAgIGNoaWxkUHJvY2Vzcy5raWxsKCk7XG4gICAgICB9XG4gICAgfTtcbiAgfSk7XG59XG5cbmNsYXNzIFByb2Nlc3NSZXNvdXJjZSB7XG4gIHByb2Nlc3MkOiBPYnNlcnZhYmxlPGNoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzPjtcbiAgZGlzcG9zZWQkOiBSZXBsYXlTdWJqZWN0PGJvb2xlYW4+O1xuXG4gIGNvbnN0cnVjdG9yKHByb21pc2VPclByb2Nlc3M6IGNoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzIHwgUHJvbWlzZTxjaGlsZF9wcm9jZXNzJENoaWxkUHJvY2Vzcz4pIHtcbiAgICB0aGlzLmRpc3Bvc2VkJCA9IG5ldyBSZXBsYXlTdWJqZWN0KDEpO1xuICAgIHRoaXMucHJvY2VzcyQgPSBPYnNlcnZhYmxlLmZyb21Qcm9taXNlKFByb21pc2UucmVzb2x2ZShwcm9taXNlT3JQcm9jZXNzKSk7XG5cbiAgICBPYnNlcnZhYmxlLmNvbWJpbmVMYXRlc3QodGhpcy5wcm9jZXNzJCwgdGhpcy5kaXNwb3NlZCQpXG4gICAgICAudGFrZVVudGlsKFxuICAgICAgICB0aGlzLnByb2Nlc3MkLmZsYXRNYXAocHJvY2VzcyA9PiBPYnNlcnZhYmxlLmZyb21FdmVudChwcm9jZXNzLCAnZXhpdCcpKSxcbiAgICAgIClcbiAgICAgIC5zdWJzY3JpYmUoKFtwcm9jZXNzLCBkaXNwb3NlZF0pID0+IHtcbiAgICAgICAgaWYgKGRpc3Bvc2VkICYmIChwcm9jZXNzICE9IG51bGwpKSB7XG4gICAgICAgICAgcHJvY2Vzcy5raWxsKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICB9XG5cbiAgZ2V0U3RyZWFtKCk6IE9ic2VydmFibGU8Y2hpbGRfcHJvY2VzcyRDaGlsZFByb2Nlc3M+IHtcbiAgICByZXR1cm4gdGhpcy5wcm9jZXNzJC50YWtlVW50aWwodGhpcy5kaXNwb3NlZCQpO1xuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLmRpc3Bvc2VkJC5vbk5leHQodHJ1ZSk7XG4gICAgdGhpcy5kaXNwb3NlZCQub25Db21wbGV0ZWQoKTtcbiAgfVxuXG59XG5cbi8qKlxuICogT2JzZXJ2ZSB0aGUgc3Rkb3V0LCBzdGRlcnIgYW5kIGV4aXQgY29kZSBvZiBhIHByb2Nlc3MuXG4gKiBzdGRvdXQgYW5kIHN0ZGVyciBhcmUgc3BsaXQgYnkgbmV3bGluZXMuXG4gKi9cbmZ1bmN0aW9uIG9ic2VydmVQcm9jZXNzRXhpdChcbiAgY3JlYXRlUHJvY2VzczogKCkgPT4gY2hpbGRfcHJvY2VzcyRDaGlsZFByb2Nlc3MgfCBQcm9taXNlPGNoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzPixcbik6IE9ic2VydmFibGU8bnVtYmVyPiB7XG4gIHJldHVybiBPYnNlcnZhYmxlLnVzaW5nKFxuICAgICgpID0+IG5ldyBQcm9jZXNzUmVzb3VyY2UoY3JlYXRlUHJvY2VzcygpKSxcbiAgICBwcm9jZXNzUmVzb3VyY2UgPT4gKFxuICAgICAgcHJvY2Vzc1Jlc291cmNlLmdldFN0cmVhbSgpLmZsYXRNYXAocHJvY2VzcyA9PiBPYnNlcnZhYmxlLmZyb21FdmVudChwcm9jZXNzLCAnZXhpdCcpLnRha2UoMSkpXG4gICAgKSxcbiAgKTtcbn1cblxuLyoqXG4gKiBPYnNlcnZlIHRoZSBzdGRvdXQsIHN0ZGVyciBhbmQgZXhpdCBjb2RlIG9mIGEgcHJvY2Vzcy5cbiAqL1xuZnVuY3Rpb24gb2JzZXJ2ZVByb2Nlc3MoXG4gIGNyZWF0ZVByb2Nlc3M6ICgpID0+IGNoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzIHwgUHJvbWlzZTxjaGlsZF9wcm9jZXNzJENoaWxkUHJvY2Vzcz4sXG4pOiBPYnNlcnZhYmxlPFByb2Nlc3NNZXNzYWdlPiB7XG4gIHJldHVybiBPYnNlcnZhYmxlLnVzaW5nKFxuICAgICgpID0+IG5ldyBQcm9jZXNzUmVzb3VyY2UoY3JlYXRlUHJvY2VzcygpKSxcbiAgICBwcm9jZXNzUmVzb3VyY2UgPT4ge1xuICAgICAgcmV0dXJuIHByb2Nlc3NSZXNvdXJjZS5nZXRTdHJlYW0oKS5mbGF0TWFwKHByb2Nlc3MgPT4ge1xuICAgICAgICBpbnZhcmlhbnQocHJvY2VzcyAhPSBudWxsLCAncHJvY2VzcyBoYXMgbm90IHlldCBiZWVuIGRpc3Bvc2VkJyk7XG4gICAgICAgIC8vIFVzZSByZXBsYXkvY29ubmVjdCBvbiBleGl0IGZvciB0aGUgZmluYWwgY29uY2F0LlxuICAgICAgICAvLyBCeSBkZWZhdWx0IGNvbmNhdCBkZWZlcnMgc3Vic2NyaXB0aW9uIHVudGlsIGFmdGVyIHRoZSBMSFMgY29tcGxldGVzLlxuICAgICAgICBjb25zdCBleGl0ID0gT2JzZXJ2YWJsZS5mcm9tRXZlbnQocHJvY2VzcywgJ2V4aXQnKS50YWtlKDEpLlxuICAgICAgICAgICAgbWFwKGV4aXRDb2RlID0+ICh7a2luZDogJ2V4aXQnLCBleGl0Q29kZX0pKS5yZXBsYXkoKTtcbiAgICAgICAgZXhpdC5jb25uZWN0KCk7XG4gICAgICAgIGNvbnN0IGVycm9yID0gT2JzZXJ2YWJsZS5mcm9tRXZlbnQocHJvY2VzcywgJ2Vycm9yJykuXG4gICAgICAgICAgICB0YWtlVW50aWwoZXhpdCkuXG4gICAgICAgICAgICBtYXAoZXJyb3JPYmogPT4gKHtraW5kOiAnZXJyb3InLCBlcnJvcjogZXJyb3JPYmp9KSk7XG4gICAgICAgIGNvbnN0IHN0ZG91dCA9IHNwbGl0U3RyZWFtKG9ic2VydmVTdHJlYW0ocHJvY2Vzcy5zdGRvdXQpKS5cbiAgICAgICAgICAgIG1hcChkYXRhID0+ICh7a2luZDogJ3N0ZG91dCcsIGRhdGF9KSk7XG4gICAgICAgIGNvbnN0IHN0ZGVyciA9IHNwbGl0U3RyZWFtKG9ic2VydmVTdHJlYW0ocHJvY2Vzcy5zdGRlcnIpKS5cbiAgICAgICAgICAgIG1hcChkYXRhID0+ICh7a2luZDogJ3N0ZGVycicsIGRhdGF9KSk7XG4gICAgICAgIHJldHVybiBzdGRvdXQubWVyZ2Uoc3RkZXJyKS5tZXJnZShlcnJvcikuY29uY2F0KGV4aXQpO1xuICAgICAgfSk7XG4gICAgfSxcbiAgKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIHRoZSByZXN1bHQgb2YgZXhlY3V0aW5nIGEgcHJvY2Vzcy5cbiAqXG4gKiBAcGFyYW0gY29tbWFuZCBUaGUgY29tbWFuZCB0byBleGVjdXRlLlxuICogQHBhcmFtIGFyZ3MgVGhlIGFyZ3VtZW50cyB0byBwYXNzIHRvIHRoZSBjb21tYW5kLlxuICogQHBhcmFtIG9wdGlvbnMgT3B0aW9ucyBmb3IgY2hhbmdpbmcgaG93IHRvIHJ1biB0aGUgY29tbWFuZC5cbiAqICAgICBTZWUgaGVyZTogaHR0cDovL25vZGVqcy5vcmcvYXBpL2NoaWxkX3Byb2Nlc3MuaHRtbFxuICogICAgIFRoZSBhZGRpdGlvbmFsIG9wdGlvbnMgd2UgcHJvdmlkZTpcbiAqICAgICAgIHF1ZXVlTmFtZSBzdHJpbmcgVGhlIHF1ZXVlIG9uIHdoaWNoIHRvIGJsb2NrIGRlcGVuZGVudCBjYWxscy5cbiAqICAgICAgIHN0ZGluIHN0cmluZyBUaGUgY29udGVudHMgdG8gd3JpdGUgdG8gc3RkaW4uXG4gKiAgICAgICBwaXBlZENvbW1hbmQgc3RyaW5nIGEgY29tbWFuZCB0byBwaXBlIHRoZSBvdXRwdXQgb2YgY29tbWFuZCB0aHJvdWdoLlxuICogICAgICAgcGlwZWRBcmdzIGFycmF5IG9mIHN0cmluZ3MgYXMgYXJndW1lbnRzLlxuICogQHJldHVybiBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgdG8gYW4gb2JqZWN0IHdpdGggdGhlIHByb3BlcnRpZXM6XG4gKiAgICAgc3Rkb3V0IHN0cmluZyBUaGUgY29udGVudHMgb2YgdGhlIHByb2Nlc3MncyBvdXRwdXQgc3RyZWFtLlxuICogICAgIHN0ZGVyciBzdHJpbmcgVGhlIGNvbnRlbnRzIG9mIHRoZSBwcm9jZXNzJ3MgZXJyb3Igc3RyZWFtLlxuICogICAgIGV4aXRDb2RlIG51bWJlciBUaGUgZXhpdCBjb2RlIHJldHVybmVkIGJ5IHRoZSBwcm9jZXNzLlxuICovXG5mdW5jdGlvbiBjaGVja091dHB1dChcbiAgICBjb21tYW5kOiBzdHJpbmcsXG4gICAgYXJnczogQXJyYXk8c3RyaW5nPixcbiAgICBvcHRpb25zOiA/T2JqZWN0ID0ge30pOiBQcm9taXNlPHByb2Nlc3MkYXN5bmNFeGVjdXRlUmV0PiB7XG4gIC8vIENsb25lIHBhc3NlZCBpbiBvcHRpb25zIHNvIHRoaXMgZnVuY3Rpb24gZG9lc24ndCBtb2RpZnkgYW4gb2JqZWN0IGl0IGRvZXNuJ3Qgb3duLlxuICBjb25zdCBsb2NhbE9wdGlvbnMgPSB7Li4ub3B0aW9uc307XG5cbiAgY29uc3QgZXhlY3V0b3IgPSAocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgbGV0IGZpcnN0Q2hpbGQ7XG4gICAgbGV0IGxhc3RDaGlsZDtcblxuICAgIGxldCBmaXJzdENoaWxkU3RkZXJyO1xuICAgIGlmIChsb2NhbE9wdGlvbnMucGlwZWRDb21tYW5kKSB7XG4gICAgICAvLyBJZiBhIHNlY29uZCBjb21tYW5kIGlzIGdpdmVuLCBwaXBlIHN0ZG91dCBvZiBmaXJzdCB0byBzdGRpbiBvZiBzZWNvbmQuIFN0cmluZyBvdXRwdXRcbiAgICAgIC8vIHJldHVybmVkIGluIHRoaXMgZnVuY3Rpb24ncyBQcm9taXNlIHdpbGwgYmUgc3RkZXJyL3N0ZG91dCBvZiB0aGUgc2Vjb25kIGNvbW1hbmQuXG4gICAgICBmaXJzdENoaWxkID0gc3Bhd24oY29tbWFuZCwgYXJncywgbG9jYWxPcHRpb25zKTtcbiAgICAgIG1vbml0b3JTdHJlYW1FcnJvcnMoZmlyc3RDaGlsZCwgY29tbWFuZCwgYXJncywgbG9jYWxPcHRpb25zKTtcbiAgICAgIGZpcnN0Q2hpbGRTdGRlcnIgPSAnJztcblxuICAgICAgZmlyc3RDaGlsZC5vbignZXJyb3InLCBlcnJvciA9PiB7XG4gICAgICAgIC8vIFJlamVjdCBlYXJseSB3aXRoIHRoZSByZXN1bHQgd2hlbiBlbmNvdW50ZXJpbmcgYW4gZXJyb3IuXG4gICAgICAgIHJlamVjdCh7XG4gICAgICAgICAgY29tbWFuZDogW2NvbW1hbmRdLmNvbmNhdChhcmdzKS5qb2luKCcgJyksXG4gICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvci5tZXNzYWdlLFxuICAgICAgICAgIGV4aXRDb2RlOiBlcnJvci5jb2RlLFxuICAgICAgICAgIHN0ZGVycjogZmlyc3RDaGlsZFN0ZGVycixcbiAgICAgICAgICBzdGRvdXQ6ICcnLFxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgICBmaXJzdENoaWxkLnN0ZGVyci5vbignZGF0YScsIGRhdGEgPT4ge1xuICAgICAgICBmaXJzdENoaWxkU3RkZXJyICs9IGRhdGE7XG4gICAgICB9KTtcblxuICAgICAgbGFzdENoaWxkID0gc3Bhd24obG9jYWxPcHRpb25zLnBpcGVkQ29tbWFuZCwgbG9jYWxPcHRpb25zLnBpcGVkQXJncywgbG9jYWxPcHRpb25zKTtcbiAgICAgIG1vbml0b3JTdHJlYW1FcnJvcnMobGFzdENoaWxkLCBjb21tYW5kLCBhcmdzLCBsb2NhbE9wdGlvbnMpO1xuICAgICAgLy8gcGlwZSgpIG5vcm1hbGx5IHBhdXNlcyB0aGUgd3JpdGVyIHdoZW4gdGhlIHJlYWRlciBlcnJvcnMgKGNsb3NlcykuXG4gICAgICAvLyBUaGlzIGlzIG5vdCBob3cgVU5JWCBwaXBlcyB3b3JrOiBpZiB0aGUgcmVhZGVyIGNsb3NlcywgdGhlIHdyaXRlciBuZWVkc1xuICAgICAgLy8gdG8gYWxzbyBjbG9zZSAob3RoZXJ3aXNlIHRoZSB3cml0ZXIgcHJvY2VzcyBtYXkgaGFuZy4pXG4gICAgICAvLyBXZSBoYXZlIHRvIG1hbnVhbGx5IGNsb3NlIHRoZSB3cml0ZXIgaW4gdGhpcyBjYXNlLlxuICAgICAgbGFzdENoaWxkLnN0ZGluLm9uKCdlcnJvcicsICgpID0+IHtcbiAgICAgICAgZmlyc3RDaGlsZC5zdGRvdXQuZW1pdCgnZW5kJyk7XG4gICAgICB9KTtcbiAgICAgIGZpcnN0Q2hpbGQuc3Rkb3V0LnBpcGUobGFzdENoaWxkLnN0ZGluKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGFzdENoaWxkID0gc3Bhd24oY29tbWFuZCwgYXJncywgbG9jYWxPcHRpb25zKTtcbiAgICAgIG1vbml0b3JTdHJlYW1FcnJvcnMobGFzdENoaWxkLCBjb21tYW5kLCBhcmdzLCBsb2NhbE9wdGlvbnMpO1xuICAgICAgZmlyc3RDaGlsZCA9IGxhc3RDaGlsZDtcbiAgICB9XG5cbiAgICBsZXQgc3RkZXJyID0gJyc7XG4gICAgbGV0IHN0ZG91dCA9ICcnO1xuICAgIGxhc3RDaGlsZC5vbignY2xvc2UnLCBleGl0Q29kZSA9PiB7XG4gICAgICByZXNvbHZlKHtcbiAgICAgICAgZXhpdENvZGUsXG4gICAgICAgIHN0ZGVycixcbiAgICAgICAgc3Rkb3V0LFxuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBsYXN0Q2hpbGQub24oJ2Vycm9yJywgZXJyb3IgPT4ge1xuICAgICAgLy8gUmVqZWN0IGVhcmx5IHdpdGggdGhlIHJlc3VsdCB3aGVuIGVuY291bnRlcmluZyBhbiBlcnJvci5cbiAgICAgIHJlamVjdCh7XG4gICAgICAgIGNvbW1hbmQ6IFtjb21tYW5kXS5jb25jYXQoYXJncykuam9pbignICcpLFxuICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UsXG4gICAgICAgIGV4aXRDb2RlOiBlcnJvci5jb2RlLFxuICAgICAgICBzdGRlcnIsXG4gICAgICAgIHN0ZG91dCxcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgbGFzdENoaWxkLnN0ZGVyci5vbignZGF0YScsIGRhdGEgPT4ge1xuICAgICAgc3RkZXJyICs9IGRhdGE7XG4gICAgfSk7XG4gICAgbGFzdENoaWxkLnN0ZG91dC5vbignZGF0YScsIGRhdGEgPT4ge1xuICAgICAgc3Rkb3V0ICs9IGRhdGE7XG4gICAgfSk7XG5cbiAgICBpZiAodHlwZW9mIGxvY2FsT3B0aW9ucy5zdGRpbiA9PT0gJ3N0cmluZycpIHtcbiAgICAgIC8vIE5vdGUgdGhhdCB0aGUgTm9kZSBkb2NzIGhhdmUgdGhpcyBzY2FyeSB3YXJuaW5nIGFib3V0IHN0ZGluLmVuZCgpIG9uXG4gICAgICAvLyBodHRwOi8vbm9kZWpzLm9yZy9hcGkvY2hpbGRfcHJvY2Vzcy5odG1sI2NoaWxkX3Byb2Nlc3NfY2hpbGRfc3RkaW46XG4gICAgICAvL1xuICAgICAgLy8gXCJBIFdyaXRhYmxlIFN0cmVhbSB0aGF0IHJlcHJlc2VudHMgdGhlIGNoaWxkIHByb2Nlc3MncyBzdGRpbi4gQ2xvc2luZ1xuICAgICAgLy8gdGhpcyBzdHJlYW0gdmlhIGVuZCgpIG9mdGVuIGNhdXNlcyB0aGUgY2hpbGQgcHJvY2VzcyB0byB0ZXJtaW5hdGUuXCJcbiAgICAgIC8vXG4gICAgICAvLyBJbiBwcmFjdGljZSwgdGhpcyBoYXMgbm90IGFwcGVhcmVkIHRvIGNhdXNlIGFueSBpc3N1ZXMgdGh1cyBmYXIuXG4gICAgICBmaXJzdENoaWxkLnN0ZGluLndyaXRlKGxvY2FsT3B0aW9ucy5zdGRpbik7XG4gICAgICBmaXJzdENoaWxkLnN0ZGluLmVuZCgpO1xuICAgIH1cbiAgfTtcblxuICBmdW5jdGlvbiBtYWtlUHJvbWlzZSgpOiBQcm9taXNlPHByb2Nlc3MkYXN5bmNFeGVjdXRlUmV0PiB7XG4gICAgaWYgKGxvY2FsT3B0aW9ucy5xdWV1ZU5hbWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGV4ZWN1dG9yKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKCFibG9ja2luZ1F1ZXVlc1tsb2NhbE9wdGlvbnMucXVldWVOYW1lXSkge1xuICAgICAgICBibG9ja2luZ1F1ZXVlc1tsb2NhbE9wdGlvbnMucXVldWVOYW1lXSA9IG5ldyBQcm9taXNlUXVldWUoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBibG9ja2luZ1F1ZXVlc1tsb2NhbE9wdGlvbnMucXVldWVOYW1lXS5zdWJtaXQoZXhlY3V0b3IpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBjcmVhdGVFeGVjRW52aXJvbm1lbnQobG9jYWxPcHRpb25zLmVudiB8fCBwcm9jZXNzLmVudiwgQ09NTU9OX0JJTkFSWV9QQVRIUykudGhlbihcbiAgICB2YWwgPT4ge1xuICAgICAgbG9jYWxPcHRpb25zLmVudiA9IHZhbDtcbiAgICAgIHJldHVybiBtYWtlUHJvbWlzZSgpO1xuICAgIH0sXG4gICAgZXJyb3IgPT4ge1xuICAgICAgbG9jYWxPcHRpb25zLmVudiA9IGxvY2FsT3B0aW9ucy5lbnYgfHwgcHJvY2Vzcy5lbnY7XG4gICAgICByZXR1cm4gbWFrZVByb21pc2UoKTtcbiAgICB9XG4gICk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGFzeW5jRXhlY3V0ZShcbiAgICBjb21tYW5kOiBzdHJpbmcsXG4gICAgYXJnczogQXJyYXk8c3RyaW5nPixcbiAgICBvcHRpb25zOiA/T2JqZWN0ID0ge30pOiBQcm9taXNlPHByb2Nlc3MkYXN5bmNFeGVjdXRlUmV0PiB7XG4gIC8qICRGbG93SXNzdWUgKHQ4MjE2MTg5KSAqL1xuICBjb25zdCByZXN1bHQgPSBhd2FpdCBjaGVja091dHB1dChjb21tYW5kLCBhcmdzLCBvcHRpb25zKTtcbiAgaWYgKHJlc3VsdC5leGl0Q29kZSAhPT0gMCkge1xuICAgIC8vIER1Y2sgdHlwaW5nIEVycm9yLlxuICAgIHJlc3VsdFsnbmFtZSddID0gJ0FzeW5jIEV4ZWN1dGlvbiBFcnJvcic7XG4gICAgcmVzdWx0WydtZXNzYWdlJ10gPVxuICAgICAgICBgZXhpdENvZGU6ICR7cmVzdWx0LmV4aXRDb2RlfSwgc3RkZXJyOiAke3Jlc3VsdC5zdGRlcnJ9LCBzdGRvdXQ6ICR7cmVzdWx0LnN0ZG91dH0uYDtcbiAgICB0aHJvdyByZXN1bHQ7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGFzeW5jRXhlY3V0ZSxcbiAgY3JlYXRlQXJnc0ZvclNjcmlwdENvbW1hbmQsXG4gIGNoZWNrT3V0cHV0LFxuICBmb3JrV2l0aEV4ZWNFbnZpcm9ubWVudCxcbiAgc2FmZVNwYXduLFxuICBzY3JpcHRTYWZlU3Bhd24sXG4gIHNjcmlwdFNhZmVTcGF3bkFuZE9ic2VydmVPdXRwdXQsXG4gIGNyZWF0ZUV4ZWNFbnZpcm9ubWVudCxcbiAgb2JzZXJ2ZVByb2Nlc3NFeGl0LFxuICBvYnNlcnZlUHJvY2VzcyxcbiAgQ09NTU9OX0JJTkFSWV9QQVRIUyxcbiAgX190ZXN0X186IHtcbiAgICBEQVJXSU5fUEFUSF9IRUxQRVJfUkVHRVhQLFxuICB9LFxufTtcbiJdfQ==