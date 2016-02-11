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

var Process = (function () {
  function Process(process) {
    var _this = this;

    _classCallCheck(this, Process);

    this.process = process;
    _rx.Observable.fromEvent(process, 'exit').take(1).doOnNext(function () {
      _this.process = null;
    });
  }

  /**
   * Observe the stdout, stderr and exit code of a process.
   * stdout and stderr are split by newlines.
   */

  _createClass(Process, [{
    key: 'dispose',
    value: function dispose() {
      if (this.process) {
        this.process.kill();
        this.process = null;
      }
    }
  }]);

  return Process;
})();

function observeProcessExit(createProcess) {
  return _rx.Observable.using(function () {
    return new Process(createProcess());
  }, function (process) {
    return _rx.Observable.fromEvent(process.process, 'exit').take(1);
  });
}

/**
 * Observe the stdout, stderr and exit code of a process.
 */
function observeProcess(createProcess) {
  return _rx.Observable.using(function () {
    return new Process(createProcess());
  }, function (_ref) {
    var process = _ref.process;

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
//# sourceMappingURL=data:application/json;base64,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LEVBQVosWUFBWTtBQUNaLDRCQUEwQixFQUExQiwwQkFBMEI7QUFDMUIsYUFBVyxFQUFYLFdBQVc7QUFDWCxXQUFTLEVBQVQsU0FBUztBQUNULGlCQUFlLEVBQWYsZUFBZTtBQUNmLGlDQUErQixFQUEvQiwrQkFBK0I7QUFDL0IsdUJBQXFCLEVBQXJCLHFCQUFxQjtBQUNyQixvQkFBa0IsRUFBbEIsa0JBQWtCO0FBQ2xCLGdCQUFjLEVBQWQsY0FBYztBQUNkLHFCQUFtQixFQUFuQixtQkFBbUI7QUFDbkIsVUFBUSxFQUFFO0FBQ1IsNkJBQXlCLEVBQXpCLHlCQUF5QjtHQUMxQjtDQUNGLENBQUMiLCJmaWxlIjoicHJvY2Vzcy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCAqIGFzIGFycmF5IGZyb20gJy4vYXJyYXknO1xuaW1wb3J0IHtcbiAgZXhlY0ZpbGUsXG4gIHNwYXduLFxufSBmcm9tICdjaGlsZF9wcm9jZXNzJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHtQcm9taXNlUXVldWV9IGZyb20gJy4vUHJvbWlzZUV4ZWN1dG9ycyc7XG5cbmltcG9ydCB0eXBlIHtPYnNlcnZlcn0gZnJvbSAncngnO1xuaW1wb3J0IHR5cGUge1Byb2Nlc3NNZXNzYWdlLCBwcm9jZXNzJGFzeW5jRXhlY3V0ZVJldH0gZnJvbSAnLi9tYWluJztcblxuaW1wb3J0IHtvYnNlcnZlU3RyZWFtLCBzcGxpdFN0cmVhbX0gZnJvbSAnLi9zdHJlYW0nO1xuaW1wb3J0IHtPYnNlcnZhYmxlfSBmcm9tICdyeCc7XG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5cbmxldCBwbGF0Zm9ybVBhdGhQcm9taXNlOiA/UHJvbWlzZTxzdHJpbmc+O1xuXG5jb25zdCBibG9ja2luZ1F1ZXVlcyA9IHt9O1xuY29uc3QgQ09NTU9OX0JJTkFSWV9QQVRIUyA9IFsnL3Vzci9iaW4nLCAnL2JpbicsICcvdXNyL3NiaW4nLCAnL3NiaW4nLCAnL3Vzci9sb2NhbC9iaW4nXTtcblxuLyoqXG4gKiBDYXB0dXJlcyB0aGUgdmFsdWUgb2YgdGhlIFBBVEggZW52IHZhcmlhYmxlIHJldHVybmVkIGJ5IERhcndpbidzIChPUyBYKSBgcGF0aF9oZWxwZXJgIHV0aWxpdHkuXG4gKiBgcGF0aF9oZWxwZXIgLXNgJ3MgcmV0dXJuIHZhbHVlIGxvb2tzIGxpa2UgdGhpczpcbiAqXG4gKiAgICAgUEFUSD1cIi91c3IvYmluXCI7IGV4cG9ydCBQQVRIO1xuICovXG5jb25zdCBEQVJXSU5fUEFUSF9IRUxQRVJfUkVHRVhQID0gL1BBVEg9XFxcIihbXlxcXCJdKylcXFwiLztcblxuY29uc3QgU1RSRUFNX05BTUVTID0gWydzdGRpbicsICdzdGRvdXQnLCAnc3RkZXJyJ107XG5cbmZ1bmN0aW9uIGdldFBsYXRmb3JtUGF0aCgpOiBQcm9taXNlPHN0cmluZz4ge1xuICAvLyBEbyBub3QgcmV0dXJuIHRoZSBjYWNoZWQgdmFsdWUgaWYgd2UgYXJlIGV4ZWN1dGluZyB1bmRlciB0aGUgdGVzdCBydW5uZXIuXG4gIGlmIChwbGF0Zm9ybVBhdGhQcm9taXNlICYmIHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAndGVzdCcpIHtcbiAgICAvLyBQYXRoIGlzIGJlaW5nIGZldGNoZWQsIGF3YWl0IHRoZSBQcm9taXNlIHRoYXQncyBpbiBmbGlnaHQuXG4gICAgcmV0dXJuIHBsYXRmb3JtUGF0aFByb21pc2U7XG4gIH1cblxuICAvLyBXZSBkbyBub3QgY2FjaGUgdGhlIHJlc3VsdCBvZiB0aGlzIGNoZWNrIGJlY2F1c2Ugd2UgaGF2ZSB1bml0IHRlc3RzIHRoYXQgdGVtcG9yYXJpbHkgcmVkZWZpbmVcbiAgLy8gdGhlIHZhbHVlIG9mIHByb2Nlc3MucGxhdGZvcm0uXG4gIGlmIChwcm9jZXNzLnBsYXRmb3JtID09PSAnZGFyd2luJykge1xuICAgIC8vIE9TIFggYXBwcyBkb24ndCBpbmhlcml0IFBBVEggd2hlbiBub3QgbGF1bmNoZWQgZnJvbSB0aGUgQ0xJLCBzbyByZWNvbnN0cnVjdCBpdC4gVGhpcyBpcyBhXG4gICAgLy8gYnVnLCBmaWxlZCBhZ2FpbnN0IEF0b20gTGludGVyIGhlcmU6IGh0dHBzOi8vZ2l0aHViLmNvbS9BdG9tTGludGVyL0xpbnRlci9pc3N1ZXMvMTUwXG4gICAgLy8gVE9ETyhqamlhYSk6IHJlbW92ZSB0aGlzIGhhY2sgd2hlbiB0aGUgQXRvbSBpc3N1ZSBpcyBjbG9zZWRcbiAgICBwbGF0Zm9ybVBhdGhQcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgZXhlY0ZpbGUoJy91c3IvbGliZXhlYy9wYXRoX2hlbHBlcicsIFsnLXMnXSwgKGVycm9yLCBzdGRvdXQsIHN0ZGVycikgPT4ge1xuICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnN0IG1hdGNoID0gc3Rkb3V0Lm1hdGNoKERBUldJTl9QQVRIX0hFTFBFUl9SRUdFWFApO1xuICAgICAgICAgIHJlc29sdmUoKG1hdGNoICYmIG1hdGNoLmxlbmd0aCA+IDEpID8gbWF0Y2hbMV0gOiAnJyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIHBsYXRmb3JtUGF0aFByb21pc2UgPSBQcm9taXNlLnJlc29sdmUoJycpO1xuICB9XG5cbiAgcmV0dXJuIHBsYXRmb3JtUGF0aFByb21pc2U7XG59XG5cbi8qKlxuICogU2luY2UgT1MgWCBhcHBzIGRvbid0IGluaGVyaXQgUEFUSCB3aGVuIG5vdCBsYXVuY2hlZCBmcm9tIHRoZSBDTEksIHRoaXMgZnVuY3Rpb24gY3JlYXRlcyBhIG5ld1xuICogZW52aXJvbm1lbnQgb2JqZWN0IGdpdmVuIHRoZSBvcmlnaW5hbCBlbnZpcm9ubWVudCBieSBtb2RpZnlpbmcgdGhlIGVudi5QQVRIIHVzaW5nIGZvbGxvd2luZ1xuICogbG9naWM6XG4gKiAgMSkgSWYgb3JpZ2luYWxFbnYuUEFUSCBkb2Vzbid0IGVxdWFsIHRvIHByb2Nlc3MuZW52LlBBVEgsIHdoaWNoIG1lYW5zIHRoZSBQQVRIIGhhcyBiZWVuXG4gKiAgICBtb2RpZmllZCwgd2Ugc2hvdWxkbid0IGRvIGFueXRoaW5nLlxuICogIDEpIElmIHdlIGFyZSBydW5uaW5nIGluIE9TIFgsIHVzZSBgL3Vzci9saWJleGVjL3BhdGhfaGVscGVyIC1zYCB0byBnZXQgdGhlIGNvcnJlY3QgUEFUSCBhbmRcbiAqICAgIFJFUExBQ0UgdGhlIFBBVEguXG4gKiAgMikgSWYgc3RlcCAxIGZhaWxlZCBvciB3ZSBhcmUgbm90IHJ1bm5pbmcgaW4gT1MgWCwgQVBQRU5EIGNvbW1vbkJpbmFyeVBhdGhzIHRvIGN1cnJlbnQgUEFUSC5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gY3JlYXRlRXhlY0Vudmlyb25tZW50KFxuICBvcmlnaW5hbEVudjogT2JqZWN0LFxuICBjb21tb25CaW5hcnlQYXRoczogQXJyYXk8c3RyaW5nPixcbik6IFByb21pc2U8T2JqZWN0PiB7XG4gIGNvbnN0IGV4ZWNFbnYgPSB7Li4ub3JpZ2luYWxFbnZ9O1xuXG4gIGlmIChleGVjRW52LlBBVEggIT09IHByb2Nlc3MuZW52LlBBVEgpIHtcbiAgICByZXR1cm4gZXhlY0VudjtcbiAgfVxuXG4gIGV4ZWNFbnYuUEFUSCA9IGV4ZWNFbnYuUEFUSCB8fCAnJztcblxuICBsZXQgcGxhdGZvcm1QYXRoID0gbnVsbDtcbiAgdHJ5IHtcbiAgICBwbGF0Zm9ybVBhdGggPSBhd2FpdCBnZXRQbGF0Zm9ybVBhdGgoKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBsb2dFcnJvcignRmFpbGVkIHRvIGdldFBsYXRmb3JtUGF0aCcsIGVycm9yKTtcbiAgfVxuXG4gIC8vIElmIHRoZSBwbGF0Zm9ybSByZXR1cm5zIGEgbm9uLWVtcHR5IFBBVEgsIHVzZSBpdC4gT3RoZXJ3aXNlIHVzZSB0aGUgZGVmYXVsdCBzZXQgb2YgY29tbW9uXG4gIC8vIGJpbmFyeSBwYXRocy5cbiAgaWYgKHBsYXRmb3JtUGF0aCkge1xuICAgIGV4ZWNFbnYuUEFUSCA9IHBsYXRmb3JtUGF0aDtcbiAgfSBlbHNlIGlmIChjb21tb25CaW5hcnlQYXRocy5sZW5ndGgpIHtcbiAgICBjb25zdCBwYXRocyA9IG5ldyBTZXQoW1xuICAgICAgLi4uZXhlY0Vudi5QQVRILnNwbGl0KHBhdGguZGVsaW1pdGVyKSxcbiAgICAgIC4uLmNvbW1vbkJpbmFyeVBhdGhzLFxuICAgIF0pO1xuICAgIGV4ZWNFbnYuUEFUSCA9IGFycmF5LmZyb20ocGF0aHMpLmpvaW4ocGF0aC5kZWxpbWl0ZXIpO1xuICB9XG5cbiAgcmV0dXJuIGV4ZWNFbnY7XG59XG5cbmZ1bmN0aW9uIGxvZ0Vycm9yKC4uLmFyZ3MpIHtcbiAgLy8gQ2FuJ3QgdXNlIG51Y2xpZGUtbG9nZ2luZyBoZXJlIHRvIG5vdCBjYXVzZSBjeWNsZSBkZXBlbmRlbmN5LlxuICAvKmVzbGludC1kaXNhYmxlIG5vLWNvbnNvbGUqL1xuICBjb25zb2xlLmVycm9yKC4uLmFyZ3MpO1xuICAvKmVzbGludC1lbmFibGUgbm8tY29uc29sZSovXG59XG5cbmZ1bmN0aW9uIG1vbml0b3JTdHJlYW1FcnJvcnMocHJvY2VzczogY2hpbGRfcHJvY2VzcyRDaGlsZFByb2Nlc3MsIGNvbW1hbmQsIGFyZ3MsIG9wdGlvbnMpOiB2b2lkIHtcbiAgU1RSRUFNX05BTUVTLmZvckVhY2goc3RyZWFtTmFtZSA9PiB7XG4gICAgLy8gJEZsb3dJc3N1ZVxuICAgIHByb2Nlc3Nbc3RyZWFtTmFtZV0ub24oJ2Vycm9yJywgZXJyb3IgPT4ge1xuICAgICAgLy8gVGhpcyBjYW4gaGFwcGVuIHdpdGhvdXQgdGhlIGZ1bGwgZXhlY3V0aW9uIG9mIHRoZSBjb21tYW5kIHRvIGZhaWwsXG4gICAgICAvLyBidXQgd2Ugd2FudCB0byBsZWFybiBhYm91dCBpdC5cbiAgICAgIGxvZ0Vycm9yKFxuICAgICAgICBgc3RyZWFtIGVycm9yIG9uIHN0cmVhbSAke3N0cmVhbU5hbWV9IHdpdGggY29tbWFuZDpgLFxuICAgICAgICBjb21tYW5kLFxuICAgICAgICBhcmdzLFxuICAgICAgICBvcHRpb25zLFxuICAgICAgICAnZXJyb3I6JyxcbiAgICAgICAgZXJyb3IsXG4gICAgICApO1xuICAgIH0pO1xuICB9KTtcbn1cblxuLyoqXG4gKiBCYXNpY2FsbHkgbGlrZSBzcGF3biwgZXhjZXB0IGl0IGhhbmRsZXMgYW5kIGxvZ3MgZXJyb3JzIGluc3RlYWQgb2YgY3Jhc2hpbmdcbiAqIHRoZSBwcm9jZXNzLiBUaGlzIGlzIG11Y2ggbG93ZXItbGV2ZWwgdGhhbiBhc3luY0V4ZWN1dGUuIFVubGVzcyB5b3UgaGF2ZSBhXG4gKiBzcGVjaWZpYyByZWFzb24geW91IHNob3VsZCB1c2UgYXN5bmNFeGVjdXRlIGluc3RlYWQuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIHNhZmVTcGF3bihcbiAgY29tbWFuZDogc3RyaW5nLFxuICBhcmdzPzogQXJyYXk8c3RyaW5nPiA9IFtdLFxuICBvcHRpb25zPzogT2JqZWN0ID0ge30sXG4pOiBQcm9taXNlPGNoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzPiB7XG4gIG9wdGlvbnMuZW52ID0gYXdhaXQgY3JlYXRlRXhlY0Vudmlyb25tZW50KG9wdGlvbnMuZW52IHx8IHByb2Nlc3MuZW52LCBDT01NT05fQklOQVJZX1BBVEhTKTtcbiAgY29uc3QgY2hpbGQgPSBzcGF3bihjb21tYW5kLCBhcmdzLCBvcHRpb25zKTtcbiAgbW9uaXRvclN0cmVhbUVycm9ycyhjaGlsZCwgY29tbWFuZCwgYXJncywgb3B0aW9ucyk7XG4gIGNoaWxkLm9uKCdlcnJvcicsIGVycm9yID0+IHtcbiAgICBsb2dFcnJvcignZXJyb3Igd2l0aCBjb21tYW5kOicsIGNvbW1hbmQsIGFyZ3MsIG9wdGlvbnMsICdlcnJvcjonLCBlcnJvcik7XG4gIH0pO1xuICByZXR1cm4gY2hpbGQ7XG59XG5cbmNvbnN0IGlzT3NYID0gcHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ2Rhcndpbic7XG5cbi8qKlxuICogVGFrZXMgdGhlIGNvbW1hbmQgYW5kIGFyZ3MgdGhhdCB5b3Ugd291bGQgbm9ybWFsbHkgcGFzcyB0byBgc3Bhd24oKWAgYW5kIHJldHVybnMgYG5ld0FyZ3NgIHN1Y2hcbiAqIHRoYXQgeW91IHNob3VsZCBjYWxsIGl0IHdpdGggYHNwYXduKCdzY3JpcHQnLCBuZXdBcmdzKWAgdG8gcnVuIHRoZSBvcmlnaW5hbCBjb21tYW5kL2FyZ3MgcGFpclxuICogdW5kZXIgYHNjcmlwdGAuXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUFyZ3NGb3JTY3JpcHRDb21tYW5kKGNvbW1hbmQ6IHN0cmluZywgYXJncz86IEFycmF5PHN0cmluZz4gPSBbXSk6IEFycmF5PHN0cmluZz4ge1xuICBpZiAoaXNPc1gpIHtcbiAgICAvLyBPbiBPUyBYLCBzY3JpcHQgdGFrZXMgdGhlIHByb2dyYW0gdG8gcnVuIGFuZCBpdHMgYXJndW1lbnRzIGFzIHZhcmFyZ3MgYXQgdGhlIGVuZC5cbiAgICByZXR1cm4gWyctcScsICcvZGV2L251bGwnLCBjb21tYW5kXS5jb25jYXQoYXJncyk7XG4gIH0gZWxzZSB7XG4gICAgLy8gT24gTGludXgsIHNjcmlwdCB0YWtlcyB0aGUgY29tbWFuZCB0byBydW4gYXMgdGhlIC1jIHBhcmFtZXRlci5cbiAgICAvLyBUT0RPOiBTaGVsbCBlc2NhcGUgZXZlcnkgZWxlbWVudCBpbiBhbGxBcmdzLlxuICAgIGNvbnN0IGFsbEFyZ3MgPSBbY29tbWFuZF0uY29uY2F0KGFyZ3MpO1xuICAgIGNvbnN0IGNvbW1hbmRBc0l0c093bkFyZyA9IGFsbEFyZ3Muam9pbignICcpO1xuICAgIHJldHVybiBbJy1xJywgJy9kZXYvbnVsbCcsICctYycsIGNvbW1hbmRBc0l0c093bkFyZ107XG4gIH1cbn1cblxuLyoqXG4gKiBCYXNpY2FsbHkgbGlrZSBzYWZlU3Bhd24sIGJ1dCBydW5zIHRoZSBjb21tYW5kIHdpdGggdGhlIGBzY3JpcHRgIGNvbW1hbmQuXG4gKiBgc2NyaXB0YCBlbnN1cmVzIHRlcm1pbmFsLWxpa2UgZW52aXJvbm1lbnQgYW5kIGNvbW1hbmRzIHdlIHJ1biBnaXZlIGNvbG9yZWQgb3V0cHV0LlxuICovXG5mdW5jdGlvbiBzY3JpcHRTYWZlU3Bhd24oXG4gIGNvbW1hbmQ6IHN0cmluZyxcbiAgYXJncz86IEFycmF5PHN0cmluZz4gPSBbXSxcbiAgb3B0aW9ucz86IE9iamVjdCA9IHt9LFxuKTogUHJvbWlzZTxjaGlsZF9wcm9jZXNzJENoaWxkUHJvY2Vzcz4ge1xuICBjb25zdCBuZXdBcmdzID0gY3JlYXRlQXJnc0ZvclNjcmlwdENvbW1hbmQoY29tbWFuZCwgYXJncyk7XG4gIHJldHVybiBzYWZlU3Bhd24oJ3NjcmlwdCcsIG5ld0FyZ3MsIG9wdGlvbnMpO1xufVxuXG4vKipcbiAqIFdyYXBzIHNjcmlwdFNhZmVTcGF3biB3aXRoIGFuIE9ic2VydmFibGUgdGhhdCBsZXRzIHlvdSBsaXN0ZW4gdG8gdGhlIHN0ZG91dCBhbmRcbiAqIHN0ZGVyciBvZiB0aGUgc3Bhd25lZCBwcm9jZXNzLlxuICovXG5mdW5jdGlvbiBzY3JpcHRTYWZlU3Bhd25BbmRPYnNlcnZlT3V0cHV0KFxuICBjb21tYW5kOiBzdHJpbmcsXG4gIGFyZ3M/OiBBcnJheTxzdHJpbmc+ID0gW10sXG4gIG9wdGlvbnM/OiBPYmplY3QgPSB7fSxcbik6IE9ic2VydmFibGU8e3N0ZGVycj86IHN0cmluZzsgc3Rkb3V0Pzogc3RyaW5nO30+IHtcbiAgcmV0dXJuIE9ic2VydmFibGUuY3JlYXRlKChvYnNlcnZlcjogT2JzZXJ2ZXIpID0+IHtcbiAgICBsZXQgY2hpbGRQcm9jZXNzO1xuICAgIHNjcmlwdFNhZmVTcGF3bihjb21tYW5kLCBhcmdzLCBvcHRpb25zKS50aGVuKHByb2MgPT4ge1xuICAgICAgY2hpbGRQcm9jZXNzID0gcHJvYztcblxuICAgICAgY2hpbGRQcm9jZXNzLnN0ZG91dC5vbignZGF0YScsIGRhdGEgPT4ge1xuICAgICAgICBvYnNlcnZlci5vbk5leHQoe3N0ZG91dDogZGF0YS50b1N0cmluZygpfSk7XG4gICAgICB9KTtcblxuICAgICAgbGV0IHN0ZGVyciA9ICcnO1xuICAgICAgY2hpbGRQcm9jZXNzLnN0ZGVyci5vbignZGF0YScsIGRhdGEgPT4ge1xuICAgICAgICBzdGRlcnIgKz0gZGF0YTtcbiAgICAgICAgb2JzZXJ2ZXIub25OZXh0KHtzdGRlcnI6IGRhdGEudG9TdHJpbmcoKX0pO1xuICAgICAgfSk7XG5cbiAgICAgIGNoaWxkUHJvY2Vzcy5vbignZXhpdCcsIChleGl0Q29kZTogbnVtYmVyKSA9PiB7XG4gICAgICAgIGlmIChleGl0Q29kZSAhPT0gMCkge1xuICAgICAgICAgIG9ic2VydmVyLm9uRXJyb3Ioc3RkZXJyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBvYnNlcnZlci5vbkNvbXBsZXRlZCgpO1xuICAgICAgICB9XG4gICAgICAgIGNoaWxkUHJvY2VzcyA9IG51bGw7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBpZiAoY2hpbGRQcm9jZXNzKSB7XG4gICAgICAgIGNoaWxkUHJvY2Vzcy5raWxsKCk7XG4gICAgICB9XG4gICAgfTtcbiAgfSk7XG59XG5cbmNsYXNzIFByb2Nlc3Mge1xuICBwcm9jZXNzOiA/Y2hpbGRfcHJvY2VzcyRDaGlsZFByb2Nlc3M7XG4gIGNvbnN0cnVjdG9yKHByb2Nlc3M6IGNoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzKSB7XG4gICAgdGhpcy5wcm9jZXNzID0gcHJvY2VzcztcbiAgICBPYnNlcnZhYmxlLmZyb21FdmVudChwcm9jZXNzLCAnZXhpdCcpLlxuICAgICAgdGFrZSgxKS5cbiAgICAgIGRvT25OZXh0KCgpID0+IHsgdGhpcy5wcm9jZXNzID0gbnVsbDsgfSk7XG4gIH1cbiAgZGlzcG9zZSgpIHtcbiAgICBpZiAodGhpcy5wcm9jZXNzKSB7XG4gICAgICB0aGlzLnByb2Nlc3Mua2lsbCgpO1xuICAgICAgdGhpcy5wcm9jZXNzID0gbnVsbDtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBPYnNlcnZlIHRoZSBzdGRvdXQsIHN0ZGVyciBhbmQgZXhpdCBjb2RlIG9mIGEgcHJvY2Vzcy5cbiAqIHN0ZG91dCBhbmQgc3RkZXJyIGFyZSBzcGxpdCBieSBuZXdsaW5lcy5cbiAqL1xuZnVuY3Rpb24gb2JzZXJ2ZVByb2Nlc3NFeGl0KGNyZWF0ZVByb2Nlc3M6ICgpID0+IGNoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzKTpcbiAgICBPYnNlcnZhYmxlPG51bWJlcj4ge1xuICByZXR1cm4gT2JzZXJ2YWJsZS51c2luZyhcbiAgICAoKSA9PiBuZXcgUHJvY2VzcyhjcmVhdGVQcm9jZXNzKCkpLFxuICAgIHByb2Nlc3MgPT4ge1xuICAgICAgcmV0dXJuIE9ic2VydmFibGUuZnJvbUV2ZW50KHByb2Nlc3MucHJvY2VzcywgJ2V4aXQnKS50YWtlKDEpO1xuICAgIH0pO1xufVxuXG4vKipcbiAqIE9ic2VydmUgdGhlIHN0ZG91dCwgc3RkZXJyIGFuZCBleGl0IGNvZGUgb2YgYSBwcm9jZXNzLlxuICovXG5mdW5jdGlvbiBvYnNlcnZlUHJvY2VzcyhjcmVhdGVQcm9jZXNzOiAoKSA9PiBjaGlsZF9wcm9jZXNzJENoaWxkUHJvY2Vzcyk6XG4gICAgT2JzZXJ2YWJsZTxQcm9jZXNzTWVzc2FnZT4ge1xuICByZXR1cm4gT2JzZXJ2YWJsZS51c2luZyhcbiAgICAoKSA9PiBuZXcgUHJvY2VzcyhjcmVhdGVQcm9jZXNzKCkpLFxuICAgICh7cHJvY2Vzc30pID0+IHtcbiAgICAgIGludmFyaWFudChwcm9jZXNzICE9IG51bGwsICdwcm9jZXNzIGhhcyBub3QgeWV0IGJlZW4gZGlzcG9zZWQnKTtcbiAgICAgIC8vIFVzZSByZXBsYXkvY29ubmVjdCBvbiBleGl0IGZvciB0aGUgZmluYWwgY29uY2F0LlxuICAgICAgLy8gQnkgZGVmYXVsdCBjb25jYXQgZGVmZXJzIHN1YnNjcmlwdGlvbiB1bnRpbCBhZnRlciB0aGUgTEhTIGNvbXBsZXRlcy5cbiAgICAgIGNvbnN0IGV4aXQgPSBPYnNlcnZhYmxlLmZyb21FdmVudChwcm9jZXNzLCAnZXhpdCcpLnRha2UoMSkuXG4gICAgICAgICAgbWFwKGV4aXRDb2RlID0+ICh7a2luZDogJ2V4aXQnLCBleGl0Q29kZX0pKS5yZXBsYXkoKTtcbiAgICAgIGV4aXQuY29ubmVjdCgpO1xuICAgICAgY29uc3QgZXJyb3IgPSBPYnNlcnZhYmxlLmZyb21FdmVudChwcm9jZXNzLCAnZXJyb3InKS5cbiAgICAgICAgICB0YWtlVW50aWwoZXhpdCkuXG4gICAgICAgICAgbWFwKGVycm9yT2JqID0+ICh7a2luZDogJ2Vycm9yJywgZXJyb3I6IGVycm9yT2JqfSkpO1xuICAgICAgY29uc3Qgc3Rkb3V0ID0gc3BsaXRTdHJlYW0ob2JzZXJ2ZVN0cmVhbShwcm9jZXNzLnN0ZG91dCkpLlxuICAgICAgICAgIG1hcChkYXRhID0+ICh7a2luZDogJ3N0ZG91dCcsIGRhdGF9KSk7XG4gICAgICBjb25zdCBzdGRlcnIgPSBzcGxpdFN0cmVhbShvYnNlcnZlU3RyZWFtKHByb2Nlc3Muc3RkZXJyKSkuXG4gICAgICAgICAgbWFwKGRhdGEgPT4gKHtraW5kOiAnc3RkZXJyJywgZGF0YX0pKTtcbiAgICAgIHJldHVybiBzdGRvdXQubWVyZ2Uoc3RkZXJyKS5tZXJnZShlcnJvcikuY29uY2F0KGV4aXQpO1xuICAgIH0pO1xufVxuXG4vKipcbiAqIFJldHVybnMgYSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgdG8gdGhlIHJlc3VsdCBvZiBleGVjdXRpbmcgYSBwcm9jZXNzLlxuICpcbiAqIEBwYXJhbSBjb21tYW5kIFRoZSBjb21tYW5kIHRvIGV4ZWN1dGUuXG4gKiBAcGFyYW0gYXJncyBUaGUgYXJndW1lbnRzIHRvIHBhc3MgdG8gdGhlIGNvbW1hbmQuXG4gKiBAcGFyYW0gb3B0aW9ucyBPcHRpb25zIGZvciBjaGFuZ2luZyBob3cgdG8gcnVuIHRoZSBjb21tYW5kLlxuICogICAgIFNlZSBoZXJlOiBodHRwOi8vbm9kZWpzLm9yZy9hcGkvY2hpbGRfcHJvY2Vzcy5odG1sXG4gKiAgICAgVGhlIGFkZGl0aW9uYWwgb3B0aW9ucyB3ZSBwcm92aWRlOlxuICogICAgICAgcXVldWVOYW1lIHN0cmluZyBUaGUgcXVldWUgb24gd2hpY2ggdG8gYmxvY2sgZGVwZW5kZW50IGNhbGxzLlxuICogICAgICAgc3RkaW4gc3RyaW5nIFRoZSBjb250ZW50cyB0byB3cml0ZSB0byBzdGRpbi5cbiAqICAgICAgIHBpcGVkQ29tbWFuZCBzdHJpbmcgYSBjb21tYW5kIHRvIHBpcGUgdGhlIG91dHB1dCBvZiBjb21tYW5kIHRocm91Z2guXG4gKiAgICAgICBwaXBlZEFyZ3MgYXJyYXkgb2Ygc3RyaW5ncyBhcyBhcmd1bWVudHMuXG4gKiBAcmV0dXJuIFByb21pc2UgdGhhdCByZXNvbHZlcyB0byBhbiBvYmplY3Qgd2l0aCB0aGUgcHJvcGVydGllczpcbiAqICAgICBzdGRvdXQgc3RyaW5nIFRoZSBjb250ZW50cyBvZiB0aGUgcHJvY2VzcydzIG91dHB1dCBzdHJlYW0uXG4gKiAgICAgc3RkZXJyIHN0cmluZyBUaGUgY29udGVudHMgb2YgdGhlIHByb2Nlc3MncyBlcnJvciBzdHJlYW0uXG4gKiAgICAgZXhpdENvZGUgbnVtYmVyIFRoZSBleGl0IGNvZGUgcmV0dXJuZWQgYnkgdGhlIHByb2Nlc3MuXG4gKi9cbmZ1bmN0aW9uIGNoZWNrT3V0cHV0KFxuICAgIGNvbW1hbmQ6IHN0cmluZyxcbiAgICBhcmdzOiBBcnJheTxzdHJpbmc+LFxuICAgIG9wdGlvbnM6ID9PYmplY3QgPSB7fSk6IFByb21pc2U8cHJvY2VzcyRhc3luY0V4ZWN1dGVSZXQ+IHtcbiAgLy8gQ2xvbmUgcGFzc2VkIGluIG9wdGlvbnMgc28gdGhpcyBmdW5jdGlvbiBkb2Vzbid0IG1vZGlmeSBhbiBvYmplY3QgaXQgZG9lc24ndCBvd24uXG4gIGNvbnN0IGxvY2FsT3B0aW9ucyA9IHsuLi5vcHRpb25zfTtcblxuICBjb25zdCBleGVjdXRvciA9IChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBsZXQgZmlyc3RDaGlsZDtcbiAgICBsZXQgbGFzdENoaWxkO1xuXG4gICAgbGV0IGZpcnN0Q2hpbGRTdGRlcnI7XG4gICAgaWYgKGxvY2FsT3B0aW9ucy5waXBlZENvbW1hbmQpIHtcbiAgICAgIC8vIElmIGEgc2Vjb25kIGNvbW1hbmQgaXMgZ2l2ZW4sIHBpcGUgc3Rkb3V0IG9mIGZpcnN0IHRvIHN0ZGluIG9mIHNlY29uZC4gU3RyaW5nIG91dHB1dFxuICAgICAgLy8gcmV0dXJuZWQgaW4gdGhpcyBmdW5jdGlvbidzIFByb21pc2Ugd2lsbCBiZSBzdGRlcnIvc3Rkb3V0IG9mIHRoZSBzZWNvbmQgY29tbWFuZC5cbiAgICAgIGZpcnN0Q2hpbGQgPSBzcGF3bihjb21tYW5kLCBhcmdzLCBsb2NhbE9wdGlvbnMpO1xuICAgICAgbW9uaXRvclN0cmVhbUVycm9ycyhmaXJzdENoaWxkLCBjb21tYW5kLCBhcmdzLCBsb2NhbE9wdGlvbnMpO1xuICAgICAgZmlyc3RDaGlsZFN0ZGVyciA9ICcnO1xuXG4gICAgICBmaXJzdENoaWxkLm9uKCdlcnJvcicsIGVycm9yID0+IHtcbiAgICAgICAgLy8gUmVqZWN0IGVhcmx5IHdpdGggdGhlIHJlc3VsdCB3aGVuIGVuY291bnRlcmluZyBhbiBlcnJvci5cbiAgICAgICAgcmVqZWN0KHtcbiAgICAgICAgICBjb21tYW5kOiBbY29tbWFuZF0uY29uY2F0KGFyZ3MpLmpvaW4oJyAnKSxcbiAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UsXG4gICAgICAgICAgZXhpdENvZGU6IGVycm9yLmNvZGUsXG4gICAgICAgICAgc3RkZXJyOiBmaXJzdENoaWxkU3RkZXJyLFxuICAgICAgICAgIHN0ZG91dDogJycsXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG5cbiAgICAgIGZpcnN0Q2hpbGQuc3RkZXJyLm9uKCdkYXRhJywgZGF0YSA9PiB7XG4gICAgICAgIGZpcnN0Q2hpbGRTdGRlcnIgKz0gZGF0YTtcbiAgICAgIH0pO1xuXG4gICAgICBsYXN0Q2hpbGQgPSBzcGF3bihsb2NhbE9wdGlvbnMucGlwZWRDb21tYW5kLCBsb2NhbE9wdGlvbnMucGlwZWRBcmdzLCBsb2NhbE9wdGlvbnMpO1xuICAgICAgbW9uaXRvclN0cmVhbUVycm9ycyhsYXN0Q2hpbGQsIGNvbW1hbmQsIGFyZ3MsIGxvY2FsT3B0aW9ucyk7XG4gICAgICBmaXJzdENoaWxkLnN0ZG91dC5waXBlKGxhc3RDaGlsZC5zdGRpbik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxhc3RDaGlsZCA9IHNwYXduKGNvbW1hbmQsIGFyZ3MsIGxvY2FsT3B0aW9ucyk7XG4gICAgICBtb25pdG9yU3RyZWFtRXJyb3JzKGxhc3RDaGlsZCwgY29tbWFuZCwgYXJncywgbG9jYWxPcHRpb25zKTtcbiAgICAgIGZpcnN0Q2hpbGQgPSBsYXN0Q2hpbGQ7XG4gICAgfVxuXG4gICAgbGV0IHN0ZGVyciA9ICcnO1xuICAgIGxldCBzdGRvdXQgPSAnJztcbiAgICBsYXN0Q2hpbGQub24oJ2Nsb3NlJywgZXhpdENvZGUgPT4ge1xuICAgICAgcmVzb2x2ZSh7XG4gICAgICAgIGV4aXRDb2RlLFxuICAgICAgICBzdGRlcnIsXG4gICAgICAgIHN0ZG91dCxcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgbGFzdENoaWxkLm9uKCdlcnJvcicsIGVycm9yID0+IHtcbiAgICAgIC8vIFJlamVjdCBlYXJseSB3aXRoIHRoZSByZXN1bHQgd2hlbiBlbmNvdW50ZXJpbmcgYW4gZXJyb3IuXG4gICAgICByZWplY3Qoe1xuICAgICAgICBjb21tYW5kOiBbY29tbWFuZF0uY29uY2F0KGFyZ3MpLmpvaW4oJyAnKSxcbiAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvci5tZXNzYWdlLFxuICAgICAgICBleGl0Q29kZTogZXJyb3IuY29kZSxcbiAgICAgICAgc3RkZXJyLFxuICAgICAgICBzdGRvdXQsXG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIGxhc3RDaGlsZC5zdGRlcnIub24oJ2RhdGEnLCBkYXRhID0+IHtcbiAgICAgIHN0ZGVyciArPSBkYXRhO1xuICAgIH0pO1xuICAgIGxhc3RDaGlsZC5zdGRvdXQub24oJ2RhdGEnLCBkYXRhID0+IHtcbiAgICAgIHN0ZG91dCArPSBkYXRhO1xuICAgIH0pO1xuXG4gICAgaWYgKHR5cGVvZiBsb2NhbE9wdGlvbnMuc3RkaW4gPT09ICdzdHJpbmcnKSB7XG4gICAgICAvLyBOb3RlIHRoYXQgdGhlIE5vZGUgZG9jcyBoYXZlIHRoaXMgc2Nhcnkgd2FybmluZyBhYm91dCBzdGRpbi5lbmQoKSBvblxuICAgICAgLy8gaHR0cDovL25vZGVqcy5vcmcvYXBpL2NoaWxkX3Byb2Nlc3MuaHRtbCNjaGlsZF9wcm9jZXNzX2NoaWxkX3N0ZGluOlxuICAgICAgLy9cbiAgICAgIC8vIFwiQSBXcml0YWJsZSBTdHJlYW0gdGhhdCByZXByZXNlbnRzIHRoZSBjaGlsZCBwcm9jZXNzJ3Mgc3RkaW4uIENsb3NpbmdcbiAgICAgIC8vIHRoaXMgc3RyZWFtIHZpYSBlbmQoKSBvZnRlbiBjYXVzZXMgdGhlIGNoaWxkIHByb2Nlc3MgdG8gdGVybWluYXRlLlwiXG4gICAgICAvL1xuICAgICAgLy8gSW4gcHJhY3RpY2UsIHRoaXMgaGFzIG5vdCBhcHBlYXJlZCB0byBjYXVzZSBhbnkgaXNzdWVzIHRodXMgZmFyLlxuICAgICAgZmlyc3RDaGlsZC5zdGRpbi53cml0ZShsb2NhbE9wdGlvbnMuc3RkaW4pO1xuICAgICAgZmlyc3RDaGlsZC5zdGRpbi5lbmQoKTtcbiAgICB9XG4gIH07XG5cbiAgZnVuY3Rpb24gbWFrZVByb21pc2UoKTogUHJvbWlzZTxwcm9jZXNzJGFzeW5jRXhlY3V0ZVJldD4ge1xuICAgIGlmIChsb2NhbE9wdGlvbnMucXVldWVOYW1lID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZShleGVjdXRvcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICghYmxvY2tpbmdRdWV1ZXNbbG9jYWxPcHRpb25zLnF1ZXVlTmFtZV0pIHtcbiAgICAgICAgYmxvY2tpbmdRdWV1ZXNbbG9jYWxPcHRpb25zLnF1ZXVlTmFtZV0gPSBuZXcgUHJvbWlzZVF1ZXVlKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gYmxvY2tpbmdRdWV1ZXNbbG9jYWxPcHRpb25zLnF1ZXVlTmFtZV0uc3VibWl0KGV4ZWN1dG9yKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gY3JlYXRlRXhlY0Vudmlyb25tZW50KGxvY2FsT3B0aW9ucy5lbnYgfHwgcHJvY2Vzcy5lbnYsIENPTU1PTl9CSU5BUllfUEFUSFMpLnRoZW4oXG4gICAgdmFsID0+IHtcbiAgICAgIGxvY2FsT3B0aW9ucy5lbnYgPSB2YWw7XG4gICAgICByZXR1cm4gbWFrZVByb21pc2UoKTtcbiAgICB9LFxuICAgIGVycm9yID0+IHtcbiAgICAgIGxvY2FsT3B0aW9ucy5lbnYgPSBsb2NhbE9wdGlvbnMuZW52IHx8IHByb2Nlc3MuZW52O1xuICAgICAgcmV0dXJuIG1ha2VQcm9taXNlKCk7XG4gICAgfVxuICApO1xufVxuXG5hc3luYyBmdW5jdGlvbiBhc3luY0V4ZWN1dGUoXG4gICAgY29tbWFuZDogc3RyaW5nLFxuICAgIGFyZ3M6IEFycmF5PHN0cmluZz4sXG4gICAgb3B0aW9uczogP09iamVjdCA9IHt9KTogUHJvbWlzZTxwcm9jZXNzJGFzeW5jRXhlY3V0ZVJldD4ge1xuICAvKiAkRmxvd0lzc3VlICh0ODIxNjE4OSkgKi9cbiAgY29uc3QgcmVzdWx0ID0gYXdhaXQgY2hlY2tPdXRwdXQoY29tbWFuZCwgYXJncywgb3B0aW9ucyk7XG4gIGlmIChyZXN1bHQuZXhpdENvZGUgIT09IDApIHtcbiAgICAvLyBEdWNrIHR5cGluZyBFcnJvci5cbiAgICByZXN1bHRbJ25hbWUnXSA9ICdBc3luYyBFeGVjdXRpb24gRXJyb3InO1xuICAgIHJlc3VsdFsnbWVzc2FnZSddID1cbiAgICAgICAgYGV4aXRDb2RlOiAke3Jlc3VsdC5leGl0Q29kZX0sIHN0ZGVycjogJHtyZXN1bHQuc3RkZXJyfSwgc3Rkb3V0OiAke3Jlc3VsdC5zdGRvdXR9LmA7XG4gICAgdGhyb3cgcmVzdWx0O1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBhc3luY0V4ZWN1dGUsXG4gIGNyZWF0ZUFyZ3NGb3JTY3JpcHRDb21tYW5kLFxuICBjaGVja091dHB1dCxcbiAgc2FmZVNwYXduLFxuICBzY3JpcHRTYWZlU3Bhd24sXG4gIHNjcmlwdFNhZmVTcGF3bkFuZE9ic2VydmVPdXRwdXQsXG4gIGNyZWF0ZUV4ZWNFbnZpcm9ubWVudCxcbiAgb2JzZXJ2ZVByb2Nlc3NFeGl0LFxuICBvYnNlcnZlUHJvY2VzcyxcbiAgQ09NTU9OX0JJTkFSWV9QQVRIUyxcbiAgX190ZXN0X186IHtcbiAgICBEQVJXSU5fUEFUSF9IRUxQRVJfUkVHRVhQLFxuICB9LFxufTtcbiJdfQ==