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
  } else {
    appendCommonBinaryPaths(execEnv, commonBinaryPaths);
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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

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

function appendCommonBinaryPaths(env, commonBinaryPaths) {
  commonBinaryPaths.forEach(function (binaryPath) {
    if (env.PATH.indexOf(binaryPath) === -1) {
      env.PATH += _path2['default'].delimiter + binaryPath;
    }
  });
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

  var _require = require('rx');

  var Observable = _require.Observable;

  return Observable.create(function (observer) {
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
//# sourceMappingURL=data:application/json;base64,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bkQsV0FBTyxXQUFXLEVBQUUsQ0FBQztHQUN0QixDQUNGLENBQUM7Q0FDSDs7QUFrQkQsTUFBTSxDQUFDLE9BQU8sR0FBRztBQUNmLGNBQVksRUFBWixZQUFZO0FBQ1osNEJBQTBCLEVBQTFCLDBCQUEwQjtBQUMxQixhQUFXLEVBQVgsV0FBVztBQUNYLFdBQVMsRUFBVCxTQUFTO0FBQ1QsaUJBQWUsRUFBZixlQUFlO0FBQ2YsaUNBQStCLEVBQS9CLCtCQUErQjtBQUMvQix1QkFBcUIsRUFBckIscUJBQXFCO0FBQ3JCLG9CQUFrQixFQUFsQixrQkFBa0I7QUFDbEIsZ0JBQWMsRUFBZCxjQUFjO0FBQ2QscUJBQW1CLEVBQW5CLG1CQUFtQjtBQUNuQixVQUFRLEVBQUU7QUFDUiw2QkFBeUIsRUFBekIseUJBQXlCO0dBQzFCO0NBQ0YsQ0FBQyIsImZpbGUiOiJwcm9jZXNzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHtcbiAgZXhlY0ZpbGUsXG4gIHNwYXduLFxufSBmcm9tICdjaGlsZF9wcm9jZXNzJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHtQcm9taXNlUXVldWV9IGZyb20gJy4vUHJvbWlzZUV4ZWN1dG9ycyc7XG5cbmltcG9ydCB0eXBlIHtPYnNlcnZhYmxlIGFzIE9ic2VydmFibGVUeXBlLCBPYnNlcnZlcn0gZnJvbSAncngnO1xuaW1wb3J0IHR5cGUge1Byb2Nlc3NNZXNzYWdlLCBwcm9jZXNzJGFzeW5jRXhlY3V0ZVJldH0gZnJvbSAnLi9tYWluJztcblxuaW1wb3J0IHtvYnNlcnZlU3RyZWFtLCBzcGxpdFN0cmVhbX0gZnJvbSAnLi9zdHJlYW0nO1xuaW1wb3J0IHtPYnNlcnZhYmxlfSBmcm9tICdyeCc7XG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5cbmxldCBwbGF0Zm9ybVBhdGhQcm9taXNlOiA/UHJvbWlzZTxzdHJpbmc+O1xuXG5jb25zdCBibG9ja2luZ1F1ZXVlcyA9IHt9O1xuY29uc3QgQ09NTU9OX0JJTkFSWV9QQVRIUyA9IFsnL3Vzci9iaW4nLCAnL2JpbicsICcvdXNyL3NiaW4nLCAnL3NiaW4nLCAnL3Vzci9sb2NhbC9iaW4nXTtcblxuLyoqXG4gKiBDYXB0dXJlcyB0aGUgdmFsdWUgb2YgdGhlIFBBVEggZW52IHZhcmlhYmxlIHJldHVybmVkIGJ5IERhcndpbidzIChPUyBYKSBgcGF0aF9oZWxwZXJgIHV0aWxpdHkuXG4gKiBgcGF0aF9oZWxwZXIgLXNgJ3MgcmV0dXJuIHZhbHVlIGxvb2tzIGxpa2UgdGhpczpcbiAqXG4gKiAgICAgUEFUSD1cIi91c3IvYmluXCI7IGV4cG9ydCBQQVRIO1xuICovXG5jb25zdCBEQVJXSU5fUEFUSF9IRUxQRVJfUkVHRVhQID0gL1BBVEg9XFxcIihbXlxcXCJdKylcXFwiLztcblxuY29uc3QgU1RSRUFNX05BTUVTID0gWydzdGRpbicsICdzdGRvdXQnLCAnc3RkZXJyJ107XG5cbmZ1bmN0aW9uIGdldFBsYXRmb3JtUGF0aCgpOiBQcm9taXNlPHN0cmluZz4ge1xuICAvLyBEbyBub3QgcmV0dXJuIHRoZSBjYWNoZWQgdmFsdWUgaWYgd2UgYXJlIGV4ZWN1dGluZyB1bmRlciB0aGUgdGVzdCBydW5uZXIuXG4gIGlmIChwbGF0Zm9ybVBhdGhQcm9taXNlICYmIHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAndGVzdCcpIHtcbiAgICAvLyBQYXRoIGlzIGJlaW5nIGZldGNoZWQsIGF3YWl0IHRoZSBQcm9taXNlIHRoYXQncyBpbiBmbGlnaHQuXG4gICAgcmV0dXJuIHBsYXRmb3JtUGF0aFByb21pc2U7XG4gIH1cblxuICAvLyBXZSBkbyBub3QgY2FjaGUgdGhlIHJlc3VsdCBvZiB0aGlzIGNoZWNrIGJlY2F1c2Ugd2UgaGF2ZSB1bml0IHRlc3RzIHRoYXQgdGVtcG9yYXJpbHkgcmVkZWZpbmVcbiAgLy8gdGhlIHZhbHVlIG9mIHByb2Nlc3MucGxhdGZvcm0uXG4gIGlmIChwcm9jZXNzLnBsYXRmb3JtID09PSAnZGFyd2luJykge1xuICAgIC8vIE9TIFggYXBwcyBkb24ndCBpbmhlcml0IFBBVEggd2hlbiBub3QgbGF1bmNoZWQgZnJvbSB0aGUgQ0xJLCBzbyByZWNvbnN0cnVjdCBpdC4gVGhpcyBpcyBhXG4gICAgLy8gYnVnLCBmaWxlZCBhZ2FpbnN0IEF0b20gTGludGVyIGhlcmU6IGh0dHBzOi8vZ2l0aHViLmNvbS9BdG9tTGludGVyL0xpbnRlci9pc3N1ZXMvMTUwXG4gICAgLy8gVE9ETyhqamlhYSk6IHJlbW92ZSB0aGlzIGhhY2sgd2hlbiB0aGUgQXRvbSBpc3N1ZSBpcyBjbG9zZWRcbiAgICBwbGF0Zm9ybVBhdGhQcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgZXhlY0ZpbGUoJy91c3IvbGliZXhlYy9wYXRoX2hlbHBlcicsIFsnLXMnXSwgKGVycm9yLCBzdGRvdXQsIHN0ZGVycikgPT4ge1xuICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnN0IG1hdGNoID0gc3Rkb3V0Lm1hdGNoKERBUldJTl9QQVRIX0hFTFBFUl9SRUdFWFApO1xuICAgICAgICAgIHJlc29sdmUoKG1hdGNoICYmIG1hdGNoLmxlbmd0aCA+IDEpID8gbWF0Y2hbMV0gOiAnJyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIHBsYXRmb3JtUGF0aFByb21pc2UgPSBQcm9taXNlLnJlc29sdmUoJycpO1xuICB9XG5cbiAgcmV0dXJuIHBsYXRmb3JtUGF0aFByb21pc2U7XG59XG5cbmZ1bmN0aW9uIGFwcGVuZENvbW1vbkJpbmFyeVBhdGhzKGVudjogT2JqZWN0LCBjb21tb25CaW5hcnlQYXRoczogQXJyYXk8c3RyaW5nPik6IHZvaWQge1xuICBjb21tb25CaW5hcnlQYXRocy5mb3JFYWNoKChiaW5hcnlQYXRoKSA9PiB7XG4gICAgaWYgKGVudi5QQVRILmluZGV4T2YoYmluYXJ5UGF0aCkgPT09IC0xKSB7XG4gICAgICBlbnYuUEFUSCArPSBwYXRoLmRlbGltaXRlciArIGJpbmFyeVBhdGg7XG4gICAgfVxuICB9KTtcbn1cblxuLyoqXG4gKiBTaW5jZSBPUyBYIGFwcHMgZG9uJ3QgaW5oZXJpdCBQQVRIIHdoZW4gbm90IGxhdW5jaGVkIGZyb20gdGhlIENMSSwgdGhpcyBmdW5jdGlvbiBjcmVhdGVzIGEgbmV3XG4gKiBlbnZpcm9ubWVudCBvYmplY3QgZ2l2ZW4gdGhlIG9yaWdpbmFsIGVudmlyb25tZW50IGJ5IG1vZGlmeWluZyB0aGUgZW52LlBBVEggdXNpbmcgZm9sbG93aW5nXG4gKiBsb2dpYzpcbiAqICAxKSBJZiBvcmlnaW5hbEVudi5QQVRIIGRvZXNuJ3QgZXF1YWwgdG8gcHJvY2Vzcy5lbnYuUEFUSCwgd2hpY2ggbWVhbnMgdGhlIFBBVEggaGFzIGJlZW5cbiAqICAgIG1vZGlmaWVkLCB3ZSBzaG91bGRuJ3QgZG8gYW55dGhpbmcuXG4gKiAgMSkgSWYgd2UgYXJlIHJ1bm5pbmcgaW4gT1MgWCwgdXNlIGAvdXNyL2xpYmV4ZWMvcGF0aF9oZWxwZXIgLXNgIHRvIGdldCB0aGUgY29ycmVjdCBQQVRIIGFuZFxuICogICAgUkVQTEFDRSB0aGUgUEFUSC5cbiAqICAyKSBJZiBzdGVwIDEgZmFpbGVkIG9yIHdlIGFyZSBub3QgcnVubmluZyBpbiBPUyBYLCBBUFBFTkQgY29tbW9uQmluYXJ5UGF0aHMgdG8gY3VycmVudCBQQVRILlxuICovXG5hc3luYyBmdW5jdGlvbiBjcmVhdGVFeGVjRW52aXJvbm1lbnQoXG4gIG9yaWdpbmFsRW52OiBPYmplY3QsXG4gIGNvbW1vbkJpbmFyeVBhdGhzOiBBcnJheTxzdHJpbmc+LFxuKTogUHJvbWlzZTxPYmplY3Q+IHtcbiAgY29uc3QgZXhlY0VudiA9IHsuLi5vcmlnaW5hbEVudn07XG5cbiAgaWYgKGV4ZWNFbnYuUEFUSCAhPT0gcHJvY2Vzcy5lbnYuUEFUSCkge1xuICAgIHJldHVybiBleGVjRW52O1xuICB9XG5cbiAgZXhlY0Vudi5QQVRIID0gZXhlY0Vudi5QQVRIIHx8ICcnO1xuXG4gIGxldCBwbGF0Zm9ybVBhdGggPSBudWxsO1xuICB0cnkge1xuICAgIHBsYXRmb3JtUGF0aCA9IGF3YWl0IGdldFBsYXRmb3JtUGF0aCgpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGxvZ0Vycm9yKCdGYWlsZWQgdG8gZ2V0UGxhdGZvcm1QYXRoJywgZXJyb3IpO1xuICB9XG5cbiAgLy8gSWYgdGhlIHBsYXRmb3JtIHJldHVybnMgYSBub24tZW1wdHkgUEFUSCwgdXNlIGl0LiBPdGhlcndpc2UgdXNlIHRoZSBkZWZhdWx0IHNldCBvZiBjb21tb25cbiAgLy8gYmluYXJ5IHBhdGhzLlxuICBpZiAocGxhdGZvcm1QYXRoKSB7XG4gICAgZXhlY0Vudi5QQVRIID0gcGxhdGZvcm1QYXRoO1xuICB9IGVsc2Uge1xuICAgIGFwcGVuZENvbW1vbkJpbmFyeVBhdGhzKGV4ZWNFbnYsIGNvbW1vbkJpbmFyeVBhdGhzKTtcbiAgfVxuXG4gIHJldHVybiBleGVjRW52O1xufVxuXG5mdW5jdGlvbiBsb2dFcnJvciguLi5hcmdzKSB7XG4gIC8vIENhbid0IHVzZSBudWNsaWRlLWxvZ2dpbmcgaGVyZSB0byBub3QgY2F1c2UgY3ljbGUgZGVwZW5kZW5jeS5cbiAgLyplc2xpbnQtZGlzYWJsZSBuby1jb25zb2xlKi9cbiAgY29uc29sZS5lcnJvciguLi5hcmdzKTtcbiAgLyplc2xpbnQtZW5hYmxlIG5vLWNvbnNvbGUqL1xufVxuXG5mdW5jdGlvbiBtb25pdG9yU3RyZWFtRXJyb3JzKHByb2Nlc3M6IGNoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzLCBjb21tYW5kLCBhcmdzLCBvcHRpb25zKTogdm9pZCB7XG4gIFNUUkVBTV9OQU1FUy5mb3JFYWNoKHN0cmVhbU5hbWUgPT4ge1xuICAgIC8vICRGbG93SXNzdWVcbiAgICBwcm9jZXNzW3N0cmVhbU5hbWVdLm9uKCdlcnJvcicsIGVycm9yID0+IHtcbiAgICAgIC8vIFRoaXMgY2FuIGhhcHBlbiB3aXRob3V0IHRoZSBmdWxsIGV4ZWN1dGlvbiBvZiB0aGUgY29tbWFuZCB0byBmYWlsLFxuICAgICAgLy8gYnV0IHdlIHdhbnQgdG8gbGVhcm4gYWJvdXQgaXQuXG4gICAgICBsb2dFcnJvcihcbiAgICAgICAgYHN0cmVhbSBlcnJvciBvbiBzdHJlYW0gJHtzdHJlYW1OYW1lfSB3aXRoIGNvbW1hbmQ6YCxcbiAgICAgICAgY29tbWFuZCxcbiAgICAgICAgYXJncyxcbiAgICAgICAgb3B0aW9ucyxcbiAgICAgICAgJ2Vycm9yOicsXG4gICAgICAgIGVycm9yLFxuICAgICAgKTtcbiAgICB9KTtcbiAgfSk7XG59XG5cbi8qKlxuICogQmFzaWNhbGx5IGxpa2Ugc3Bhd24sIGV4Y2VwdCBpdCBoYW5kbGVzIGFuZCBsb2dzIGVycm9ycyBpbnN0ZWFkIG9mIGNyYXNoaW5nXG4gKiB0aGUgcHJvY2Vzcy4gVGhpcyBpcyBtdWNoIGxvd2VyLWxldmVsIHRoYW4gYXN5bmNFeGVjdXRlLiBVbmxlc3MgeW91IGhhdmUgYVxuICogc3BlY2lmaWMgcmVhc29uIHlvdSBzaG91bGQgdXNlIGFzeW5jRXhlY3V0ZSBpbnN0ZWFkLlxuICovXG5hc3luYyBmdW5jdGlvbiBzYWZlU3Bhd24oXG4gIGNvbW1hbmQ6IHN0cmluZyxcbiAgYXJncz86IEFycmF5PHN0cmluZz4gPSBbXSxcbiAgb3B0aW9ucz86IE9iamVjdCA9IHt9LFxuKTogUHJvbWlzZTxjaGlsZF9wcm9jZXNzJENoaWxkUHJvY2Vzcz4ge1xuICBvcHRpb25zLmVudiA9IGF3YWl0IGNyZWF0ZUV4ZWNFbnZpcm9ubWVudChvcHRpb25zLmVudiB8fCBwcm9jZXNzLmVudiwgQ09NTU9OX0JJTkFSWV9QQVRIUyk7XG4gIGNvbnN0IGNoaWxkID0gc3Bhd24oY29tbWFuZCwgYXJncywgb3B0aW9ucyk7XG4gIG1vbml0b3JTdHJlYW1FcnJvcnMoY2hpbGQsIGNvbW1hbmQsIGFyZ3MsIG9wdGlvbnMpO1xuICBjaGlsZC5vbignZXJyb3InLCBlcnJvciA9PiB7XG4gICAgbG9nRXJyb3IoJ2Vycm9yIHdpdGggY29tbWFuZDonLCBjb21tYW5kLCBhcmdzLCBvcHRpb25zLCAnZXJyb3I6JywgZXJyb3IpO1xuICB9KTtcbiAgcmV0dXJuIGNoaWxkO1xufVxuXG5jb25zdCBpc09zWCA9IHByb2Nlc3MucGxhdGZvcm0gPT09ICdkYXJ3aW4nO1xuXG4vKipcbiAqIFRha2VzIHRoZSBjb21tYW5kIGFuZCBhcmdzIHRoYXQgeW91IHdvdWxkIG5vcm1hbGx5IHBhc3MgdG8gYHNwYXduKClgIGFuZCByZXR1cm5zIGBuZXdBcmdzYCBzdWNoXG4gKiB0aGF0IHlvdSBzaG91bGQgY2FsbCBpdCB3aXRoIGBzcGF3bignc2NyaXB0JywgbmV3QXJncylgIHRvIHJ1biB0aGUgb3JpZ2luYWwgY29tbWFuZC9hcmdzIHBhaXJcbiAqIHVuZGVyIGBzY3JpcHRgLlxuICovXG5mdW5jdGlvbiBjcmVhdGVBcmdzRm9yU2NyaXB0Q29tbWFuZChjb21tYW5kOiBzdHJpbmcsIGFyZ3M/OiBBcnJheTxzdHJpbmc+ID0gW10pOiBBcnJheTxzdHJpbmc+IHtcbiAgaWYgKGlzT3NYKSB7XG4gICAgLy8gT24gT1MgWCwgc2NyaXB0IHRha2VzIHRoZSBwcm9ncmFtIHRvIHJ1biBhbmQgaXRzIGFyZ3VtZW50cyBhcyB2YXJhcmdzIGF0IHRoZSBlbmQuXG4gICAgcmV0dXJuIFsnLXEnLCAnL2Rldi9udWxsJywgY29tbWFuZF0uY29uY2F0KGFyZ3MpO1xuICB9IGVsc2Uge1xuICAgIC8vIE9uIExpbnV4LCBzY3JpcHQgdGFrZXMgdGhlIGNvbW1hbmQgdG8gcnVuIGFzIHRoZSAtYyBwYXJhbWV0ZXIuXG4gICAgLy8gVE9ETzogU2hlbGwgZXNjYXBlIGV2ZXJ5IGVsZW1lbnQgaW4gYWxsQXJncy5cbiAgICBjb25zdCBhbGxBcmdzID0gW2NvbW1hbmRdLmNvbmNhdChhcmdzKTtcbiAgICBjb25zdCBjb21tYW5kQXNJdHNPd25BcmcgPSBhbGxBcmdzLmpvaW4oJyAnKTtcbiAgICByZXR1cm4gWyctcScsICcvZGV2L251bGwnLCAnLWMnLCBjb21tYW5kQXNJdHNPd25BcmddO1xuICB9XG59XG5cbi8qKlxuICogQmFzaWNhbGx5IGxpa2Ugc2FmZVNwYXduLCBidXQgcnVucyB0aGUgY29tbWFuZCB3aXRoIHRoZSBgc2NyaXB0YCBjb21tYW5kLlxuICogYHNjcmlwdGAgZW5zdXJlcyB0ZXJtaW5hbC1saWtlIGVudmlyb25tZW50IGFuZCBjb21tYW5kcyB3ZSBydW4gZ2l2ZSBjb2xvcmVkIG91dHB1dC5cbiAqL1xuZnVuY3Rpb24gc2NyaXB0U2FmZVNwYXduKFxuICBjb21tYW5kOiBzdHJpbmcsXG4gIGFyZ3M/OiBBcnJheTxzdHJpbmc+ID0gW10sXG4gIG9wdGlvbnM/OiBPYmplY3QgPSB7fSxcbik6IFByb21pc2U8Y2hpbGRfcHJvY2VzcyRDaGlsZFByb2Nlc3M+IHtcbiAgY29uc3QgbmV3QXJncyA9IGNyZWF0ZUFyZ3NGb3JTY3JpcHRDb21tYW5kKGNvbW1hbmQsIGFyZ3MpO1xuICByZXR1cm4gc2FmZVNwYXduKCdzY3JpcHQnLCBuZXdBcmdzLCBvcHRpb25zKTtcbn1cblxuLyoqXG4gKiBXcmFwcyBzY3JpcHRTYWZlU3Bhd24gd2l0aCBhbiBPYnNlcnZhYmxlIHRoYXQgbGV0cyB5b3UgbGlzdGVuIHRvIHRoZSBzdGRvdXQgYW5kXG4gKiBzdGRlcnIgb2YgdGhlIHNwYXduZWQgcHJvY2Vzcy5cbiAqL1xuZnVuY3Rpb24gc2NyaXB0U2FmZVNwYXduQW5kT2JzZXJ2ZU91dHB1dChcbiAgY29tbWFuZDogc3RyaW5nLFxuICBhcmdzPzogQXJyYXk8c3RyaW5nPiA9IFtdLFxuICBvcHRpb25zPzogT2JqZWN0ID0ge30sXG4pOiBPYnNlcnZhYmxlVHlwZTx7c3RkZXJyPzogc3RyaW5nOyBzdGRvdXQ/OiBzdHJpbmc7fT4ge1xuICBjb25zdCB7T2JzZXJ2YWJsZX0gPSByZXF1aXJlKCdyeCcpO1xuICByZXR1cm4gT2JzZXJ2YWJsZS5jcmVhdGUoKG9ic2VydmVyOiBPYnNlcnZlcikgPT4ge1xuICAgIGxldCBjaGlsZFByb2Nlc3M7XG4gICAgc2NyaXB0U2FmZVNwYXduKGNvbW1hbmQsIGFyZ3MsIG9wdGlvbnMpLnRoZW4ocHJvYyA9PiB7XG4gICAgICBjaGlsZFByb2Nlc3MgPSBwcm9jO1xuXG4gICAgICBjaGlsZFByb2Nlc3Muc3Rkb3V0Lm9uKCdkYXRhJywgKGRhdGEpID0+IHtcbiAgICAgICAgb2JzZXJ2ZXIub25OZXh0KHtzdGRvdXQ6IGRhdGEudG9TdHJpbmcoKX0pO1xuICAgICAgfSk7XG5cbiAgICAgIGxldCBzdGRlcnIgPSAnJztcbiAgICAgIGNoaWxkUHJvY2Vzcy5zdGRlcnIub24oJ2RhdGEnLCAoZGF0YSkgPT4ge1xuICAgICAgICBzdGRlcnIgKz0gZGF0YTtcbiAgICAgICAgb2JzZXJ2ZXIub25OZXh0KHtzdGRlcnI6IGRhdGEudG9TdHJpbmcoKX0pO1xuICAgICAgfSk7XG5cbiAgICAgIGNoaWxkUHJvY2Vzcy5vbignZXhpdCcsIChleGl0Q29kZTogbnVtYmVyKSA9PiB7XG4gICAgICAgIGlmIChleGl0Q29kZSAhPT0gMCkge1xuICAgICAgICAgIG9ic2VydmVyLm9uRXJyb3Ioc3RkZXJyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBvYnNlcnZlci5vbkNvbXBsZXRlZCgpO1xuICAgICAgICB9XG4gICAgICAgIGNoaWxkUHJvY2VzcyA9IG51bGw7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBpZiAoY2hpbGRQcm9jZXNzKSB7XG4gICAgICAgIGNoaWxkUHJvY2Vzcy5raWxsKCk7XG4gICAgICB9XG4gICAgfTtcbiAgfSk7XG59XG5cbmNsYXNzIFByb2Nlc3Mge1xuICBwcm9jZXNzOiA/Y2hpbGRfcHJvY2VzcyRDaGlsZFByb2Nlc3M7XG4gIGNvbnN0cnVjdG9yKHByb2Nlc3M6IGNoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzKSB7XG4gICAgdGhpcy5wcm9jZXNzID0gcHJvY2VzcztcbiAgICBPYnNlcnZhYmxlLmZyb21FdmVudChwcm9jZXNzLCAnZXhpdCcpLlxuICAgICAgdGFrZSgxKS5cbiAgICAgIGRvT25OZXh0KCgpID0+IHsgdGhpcy5wcm9jZXNzID0gbnVsbDsgfSk7XG4gIH1cbiAgZGlzcG9zZSgpIHtcbiAgICBpZiAodGhpcy5wcm9jZXNzKSB7XG4gICAgICB0aGlzLnByb2Nlc3Mua2lsbCgpO1xuICAgICAgdGhpcy5wcm9jZXNzID0gbnVsbDtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBPYnNlcnZlIHRoZSBzdGRvdXQsIHN0ZGVyciBhbmQgZXhpdCBjb2RlIG9mIGEgcHJvY2Vzcy5cbiAqIHN0ZG91dCBhbmQgc3RkZXJyIGFyZSBzcGxpdCBieSBuZXdsaW5lcy5cbiAqL1xuZnVuY3Rpb24gb2JzZXJ2ZVByb2Nlc3NFeGl0KGNyZWF0ZVByb2Nlc3M6ICgpID0+IGNoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzKTpcbiAgICBPYnNlcnZhYmxlVHlwZTxudW1iZXI+IHtcbiAgcmV0dXJuIE9ic2VydmFibGUudXNpbmcoXG4gICAgKCkgPT4gbmV3IFByb2Nlc3MoY3JlYXRlUHJvY2VzcygpKSxcbiAgICBwcm9jZXNzID0+IHtcbiAgICAgIHJldHVybiBPYnNlcnZhYmxlLmZyb21FdmVudChwcm9jZXNzLnByb2Nlc3MsICdleGl0JykudGFrZSgxKTtcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBPYnNlcnZlIHRoZSBzdGRvdXQsIHN0ZGVyciBhbmQgZXhpdCBjb2RlIG9mIGEgcHJvY2Vzcy5cbiAqL1xuZnVuY3Rpb24gb2JzZXJ2ZVByb2Nlc3MoY3JlYXRlUHJvY2VzczogKCkgPT4gY2hpbGRfcHJvY2VzcyRDaGlsZFByb2Nlc3MpOlxuICAgIE9ic2VydmFibGVUeXBlPFByb2Nlc3NNZXNzYWdlPiB7XG4gIHJldHVybiBPYnNlcnZhYmxlLnVzaW5nKFxuICAgICgpID0+IG5ldyBQcm9jZXNzKGNyZWF0ZVByb2Nlc3MoKSksXG4gICAgKHtwcm9jZXNzfSkgPT4ge1xuICAgICAgaW52YXJpYW50KHByb2Nlc3MgIT0gbnVsbCwgJ3Byb2Nlc3MgaGFzIG5vdCB5ZXQgYmVlbiBkaXNwb3NlZCcpO1xuICAgICAgLy8gVXNlIHJlcGxheS9jb25uZWN0IG9uIGV4aXQgZm9yIHRoZSBmaW5hbCBjb25jYXQuXG4gICAgICAvLyBCeSBkZWZhdWx0IGNvbmNhdCBkZWZlcnMgc3Vic2NyaXB0aW9uIHVudGlsIGFmdGVyIHRoZSBMSFMgY29tcGxldGVzLlxuICAgICAgY29uc3QgZXhpdCA9IE9ic2VydmFibGUuZnJvbUV2ZW50KHByb2Nlc3MsICdleGl0JykudGFrZSgxKS5cbiAgICAgICAgICBtYXAoZXhpdENvZGUgPT4gKHtraW5kOiAnZXhpdCcsIGV4aXRDb2RlfSkpLnJlcGxheSgpO1xuICAgICAgZXhpdC5jb25uZWN0KCk7XG4gICAgICBjb25zdCBlcnJvciA9IE9ic2VydmFibGUuZnJvbUV2ZW50KHByb2Nlc3MsICdlcnJvcicpLlxuICAgICAgICAgIHRha2VVbnRpbChleGl0KS5cbiAgICAgICAgICBtYXAoZXJyb3JPYmogPT4gKHtraW5kOiAnZXJyb3InLCBlcnJvcjogZXJyb3JPYmp9KSk7XG4gICAgICBjb25zdCBzdGRvdXQgPSBzcGxpdFN0cmVhbShvYnNlcnZlU3RyZWFtKHByb2Nlc3Muc3Rkb3V0KSkuXG4gICAgICAgICAgbWFwKGRhdGEgPT4gKHtraW5kOiAnc3Rkb3V0JywgZGF0YX0pKTtcbiAgICAgIGNvbnN0IHN0ZGVyciA9IHNwbGl0U3RyZWFtKG9ic2VydmVTdHJlYW0ocHJvY2Vzcy5zdGRlcnIpKS5cbiAgICAgICAgICBtYXAoZGF0YSA9PiAoe2tpbmQ6ICdzdGRlcnInLCBkYXRhfSkpO1xuICAgICAgcmV0dXJuIHN0ZG91dC5tZXJnZShzdGRlcnIpLm1lcmdlKGVycm9yKS5jb25jYXQoZXhpdCk7XG4gICAgfSk7XG59XG5cbi8qKlxuICogUmV0dXJucyBhIHByb21pc2UgdGhhdCByZXNvbHZlcyB0byB0aGUgcmVzdWx0IG9mIGV4ZWN1dGluZyBhIHByb2Nlc3MuXG4gKlxuICogQHBhcmFtIGNvbW1hbmQgVGhlIGNvbW1hbmQgdG8gZXhlY3V0ZS5cbiAqIEBwYXJhbSBhcmdzIFRoZSBhcmd1bWVudHMgdG8gcGFzcyB0byB0aGUgY29tbWFuZC5cbiAqIEBwYXJhbSBvcHRpb25zIE9wdGlvbnMgZm9yIGNoYW5naW5nIGhvdyB0byBydW4gdGhlIGNvbW1hbmQuXG4gKiAgICAgU2VlIGhlcmU6IGh0dHA6Ly9ub2RlanMub3JnL2FwaS9jaGlsZF9wcm9jZXNzLmh0bWxcbiAqICAgICBUaGUgYWRkaXRpb25hbCBvcHRpb25zIHdlIHByb3ZpZGU6XG4gKiAgICAgICBxdWV1ZU5hbWUgc3RyaW5nIFRoZSBxdWV1ZSBvbiB3aGljaCB0byBibG9jayBkZXBlbmRlbnQgY2FsbHMuXG4gKiAgICAgICBzdGRpbiBzdHJpbmcgVGhlIGNvbnRlbnRzIHRvIHdyaXRlIHRvIHN0ZGluLlxuICogICAgICAgcGlwZWRDb21tYW5kIHN0cmluZyBhIGNvbW1hbmQgdG8gcGlwZSB0aGUgb3V0cHV0IG9mIGNvbW1hbmQgdGhyb3VnaC5cbiAqICAgICAgIHBpcGVkQXJncyBhcnJheSBvZiBzdHJpbmdzIGFzIGFyZ3VtZW50cy5cbiAqIEByZXR1cm4gUHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIGFuIG9iamVjdCB3aXRoIHRoZSBwcm9wZXJ0aWVzOlxuICogICAgIHN0ZG91dCBzdHJpbmcgVGhlIGNvbnRlbnRzIG9mIHRoZSBwcm9jZXNzJ3Mgb3V0cHV0IHN0cmVhbS5cbiAqICAgICBzdGRlcnIgc3RyaW5nIFRoZSBjb250ZW50cyBvZiB0aGUgcHJvY2VzcydzIGVycm9yIHN0cmVhbS5cbiAqICAgICBleGl0Q29kZSBudW1iZXIgVGhlIGV4aXQgY29kZSByZXR1cm5lZCBieSB0aGUgcHJvY2Vzcy5cbiAqL1xuZnVuY3Rpb24gY2hlY2tPdXRwdXQoXG4gICAgY29tbWFuZDogc3RyaW5nLFxuICAgIGFyZ3M6IEFycmF5PHN0cmluZz4sXG4gICAgb3B0aW9uczogP09iamVjdCA9IHt9KTogUHJvbWlzZTxwcm9jZXNzJGFzeW5jRXhlY3V0ZVJldD4ge1xuICAvLyBDbG9uZSBwYXNzZWQgaW4gb3B0aW9ucyBzbyB0aGlzIGZ1bmN0aW9uIGRvZXNuJ3QgbW9kaWZ5IGFuIG9iamVjdCBpdCBkb2Vzbid0IG93bi5cbiAgY29uc3QgbG9jYWxPcHRpb25zID0gey4uLm9wdGlvbnN9O1xuXG4gIGNvbnN0IGV4ZWN1dG9yID0gKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGxldCBmaXJzdENoaWxkO1xuICAgIGxldCBsYXN0Q2hpbGQ7XG5cbiAgICBsZXQgZmlyc3RDaGlsZFN0ZGVycjtcbiAgICBpZiAobG9jYWxPcHRpb25zLnBpcGVkQ29tbWFuZCkge1xuICAgICAgLy8gSWYgYSBzZWNvbmQgY29tbWFuZCBpcyBnaXZlbiwgcGlwZSBzdGRvdXQgb2YgZmlyc3QgdG8gc3RkaW4gb2Ygc2Vjb25kLiBTdHJpbmcgb3V0cHV0XG4gICAgICAvLyByZXR1cm5lZCBpbiB0aGlzIGZ1bmN0aW9uJ3MgUHJvbWlzZSB3aWxsIGJlIHN0ZGVyci9zdGRvdXQgb2YgdGhlIHNlY29uZCBjb21tYW5kLlxuICAgICAgZmlyc3RDaGlsZCA9IHNwYXduKGNvbW1hbmQsIGFyZ3MsIGxvY2FsT3B0aW9ucyk7XG4gICAgICBtb25pdG9yU3RyZWFtRXJyb3JzKGZpcnN0Q2hpbGQsIGNvbW1hbmQsIGFyZ3MsIGxvY2FsT3B0aW9ucyk7XG4gICAgICBmaXJzdENoaWxkU3RkZXJyID0gJyc7XG5cbiAgICAgIGZpcnN0Q2hpbGQub24oJ2Vycm9yJywgZXJyb3IgPT4ge1xuICAgICAgICAvLyBSZWplY3QgZWFybHkgd2l0aCB0aGUgcmVzdWx0IHdoZW4gZW5jb3VudGVyaW5nIGFuIGVycm9yLlxuICAgICAgICByZWplY3Qoe1xuICAgICAgICAgIGNvbW1hbmQ6IFtjb21tYW5kXS5jb25jYXQoYXJncykuam9pbignICcpLFxuICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3IubWVzc2FnZSxcbiAgICAgICAgICBleGl0Q29kZTogZXJyb3IuY29kZSxcbiAgICAgICAgICBzdGRlcnI6IGZpcnN0Q2hpbGRTdGRlcnIsXG4gICAgICAgICAgc3Rkb3V0OiAnJyxcbiAgICAgICAgfSk7XG4gICAgICB9KTtcblxuICAgICAgZmlyc3RDaGlsZC5zdGRlcnIub24oJ2RhdGEnLCBkYXRhID0+IHtcbiAgICAgICAgZmlyc3RDaGlsZFN0ZGVyciArPSBkYXRhO1xuICAgICAgfSk7XG5cbiAgICAgIGxhc3RDaGlsZCA9IHNwYXduKGxvY2FsT3B0aW9ucy5waXBlZENvbW1hbmQsIGxvY2FsT3B0aW9ucy5waXBlZEFyZ3MsIGxvY2FsT3B0aW9ucyk7XG4gICAgICBtb25pdG9yU3RyZWFtRXJyb3JzKGxhc3RDaGlsZCwgY29tbWFuZCwgYXJncywgbG9jYWxPcHRpb25zKTtcbiAgICAgIGZpcnN0Q2hpbGQuc3Rkb3V0LnBpcGUobGFzdENoaWxkLnN0ZGluKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGFzdENoaWxkID0gc3Bhd24oY29tbWFuZCwgYXJncywgbG9jYWxPcHRpb25zKTtcbiAgICAgIG1vbml0b3JTdHJlYW1FcnJvcnMobGFzdENoaWxkLCBjb21tYW5kLCBhcmdzLCBsb2NhbE9wdGlvbnMpO1xuICAgICAgZmlyc3RDaGlsZCA9IGxhc3RDaGlsZDtcbiAgICB9XG5cbiAgICBsZXQgc3RkZXJyID0gJyc7XG4gICAgbGV0IHN0ZG91dCA9ICcnO1xuICAgIGxhc3RDaGlsZC5vbignY2xvc2UnLCBleGl0Q29kZSA9PiB7XG4gICAgICByZXNvbHZlKHtcbiAgICAgICAgZXhpdENvZGUsXG4gICAgICAgIHN0ZGVycixcbiAgICAgICAgc3Rkb3V0LFxuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBsYXN0Q2hpbGQub24oJ2Vycm9yJywgZXJyb3IgPT4ge1xuICAgICAgLy8gUmVqZWN0IGVhcmx5IHdpdGggdGhlIHJlc3VsdCB3aGVuIGVuY291bnRlcmluZyBhbiBlcnJvci5cbiAgICAgIHJlamVjdCh7XG4gICAgICAgIGNvbW1hbmQ6IFtjb21tYW5kXS5jb25jYXQoYXJncykuam9pbignICcpLFxuICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UsXG4gICAgICAgIGV4aXRDb2RlOiBlcnJvci5jb2RlLFxuICAgICAgICBzdGRlcnIsXG4gICAgICAgIHN0ZG91dCxcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgbGFzdENoaWxkLnN0ZGVyci5vbignZGF0YScsIGRhdGEgPT4ge1xuICAgICAgc3RkZXJyICs9IGRhdGE7XG4gICAgfSk7XG4gICAgbGFzdENoaWxkLnN0ZG91dC5vbignZGF0YScsIGRhdGEgPT4ge1xuICAgICAgc3Rkb3V0ICs9IGRhdGE7XG4gICAgfSk7XG5cbiAgICBpZiAodHlwZW9mIGxvY2FsT3B0aW9ucy5zdGRpbiA9PT0gJ3N0cmluZycpIHtcbiAgICAgIC8vIE5vdGUgdGhhdCB0aGUgTm9kZSBkb2NzIGhhdmUgdGhpcyBzY2FyeSB3YXJuaW5nIGFib3V0IHN0ZGluLmVuZCgpIG9uXG4gICAgICAvLyBodHRwOi8vbm9kZWpzLm9yZy9hcGkvY2hpbGRfcHJvY2Vzcy5odG1sI2NoaWxkX3Byb2Nlc3NfY2hpbGRfc3RkaW46XG4gICAgICAvL1xuICAgICAgLy8gXCJBIFdyaXRhYmxlIFN0cmVhbSB0aGF0IHJlcHJlc2VudHMgdGhlIGNoaWxkIHByb2Nlc3MncyBzdGRpbi4gQ2xvc2luZ1xuICAgICAgLy8gdGhpcyBzdHJlYW0gdmlhIGVuZCgpIG9mdGVuIGNhdXNlcyB0aGUgY2hpbGQgcHJvY2VzcyB0byB0ZXJtaW5hdGUuXCJcbiAgICAgIC8vXG4gICAgICAvLyBJbiBwcmFjdGljZSwgdGhpcyBoYXMgbm90IGFwcGVhcmVkIHRvIGNhdXNlIGFueSBpc3N1ZXMgdGh1cyBmYXIuXG4gICAgICBmaXJzdENoaWxkLnN0ZGluLndyaXRlKGxvY2FsT3B0aW9ucy5zdGRpbik7XG4gICAgICBmaXJzdENoaWxkLnN0ZGluLmVuZCgpO1xuICAgIH1cbiAgfTtcblxuICBmdW5jdGlvbiBtYWtlUHJvbWlzZSgpOiBQcm9taXNlPHByb2Nlc3MkYXN5bmNFeGVjdXRlUmV0PiB7XG4gICAgaWYgKGxvY2FsT3B0aW9ucy5xdWV1ZU5hbWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGV4ZWN1dG9yKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKCFibG9ja2luZ1F1ZXVlc1tsb2NhbE9wdGlvbnMucXVldWVOYW1lXSkge1xuICAgICAgICBibG9ja2luZ1F1ZXVlc1tsb2NhbE9wdGlvbnMucXVldWVOYW1lXSA9IG5ldyBQcm9taXNlUXVldWUoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBibG9ja2luZ1F1ZXVlc1tsb2NhbE9wdGlvbnMucXVldWVOYW1lXS5zdWJtaXQoZXhlY3V0b3IpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBjcmVhdGVFeGVjRW52aXJvbm1lbnQobG9jYWxPcHRpb25zLmVudiB8fCBwcm9jZXNzLmVudiwgQ09NTU9OX0JJTkFSWV9QQVRIUykudGhlbihcbiAgICB2YWwgPT4ge1xuICAgICAgbG9jYWxPcHRpb25zLmVudiA9IHZhbDtcbiAgICAgIHJldHVybiBtYWtlUHJvbWlzZSgpO1xuICAgIH0sXG4gICAgZXJyb3IgPT4ge1xuICAgICAgbG9jYWxPcHRpb25zLmVudiA9IGxvY2FsT3B0aW9ucy5lbnYgfHwgcHJvY2Vzcy5lbnY7XG4gICAgICByZXR1cm4gbWFrZVByb21pc2UoKTtcbiAgICB9XG4gICk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGFzeW5jRXhlY3V0ZShcbiAgICBjb21tYW5kOiBzdHJpbmcsXG4gICAgYXJnczogQXJyYXk8c3RyaW5nPixcbiAgICBvcHRpb25zOiA/T2JqZWN0ID0ge30pOiBQcm9taXNlPHByb2Nlc3MkYXN5bmNFeGVjdXRlUmV0PiB7XG4gIC8qICRGbG93SXNzdWUgKHQ4MjE2MTg5KSAqL1xuICBjb25zdCByZXN1bHQgPSBhd2FpdCBjaGVja091dHB1dChjb21tYW5kLCBhcmdzLCBvcHRpb25zKTtcbiAgaWYgKHJlc3VsdC5leGl0Q29kZSAhPT0gMCkge1xuICAgIC8vIER1Y2sgdHlwaW5nIEVycm9yLlxuICAgIHJlc3VsdFsnbmFtZSddID0gJ0FzeW5jIEV4ZWN1dGlvbiBFcnJvcic7XG4gICAgcmVzdWx0WydtZXNzYWdlJ10gPVxuICAgICAgICBgZXhpdENvZGU6ICR7cmVzdWx0LmV4aXRDb2RlfSwgc3RkZXJyOiAke3Jlc3VsdC5zdGRlcnJ9LCBzdGRvdXQ6ICR7cmVzdWx0LnN0ZG91dH0uYDtcbiAgICB0aHJvdyByZXN1bHQ7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGFzeW5jRXhlY3V0ZSxcbiAgY3JlYXRlQXJnc0ZvclNjcmlwdENvbW1hbmQsXG4gIGNoZWNrT3V0cHV0LFxuICBzYWZlU3Bhd24sXG4gIHNjcmlwdFNhZmVTcGF3bixcbiAgc2NyaXB0U2FmZVNwYXduQW5kT2JzZXJ2ZU91dHB1dCxcbiAgY3JlYXRlRXhlY0Vudmlyb25tZW50LFxuICBvYnNlcnZlUHJvY2Vzc0V4aXQsXG4gIG9ic2VydmVQcm9jZXNzLFxuICBDT01NT05fQklOQVJZX1BBVEhTLFxuICBfX3Rlc3RfXzoge1xuICAgIERBUldJTl9QQVRIX0hFTFBFUl9SRUdFWFAsXG4gIH0sXG59O1xuIl19