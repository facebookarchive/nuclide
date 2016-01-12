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

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _rx = require('rx');

/**
 * Observe a stream like stdout or stderr.
 */

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

function observeStream(stream) {
  var error = _rx.Observable.fromEvent(stream, 'error').flatMap(_rx.Observable.throwError);
  return _rx.Observable.fromEvent(stream, 'data').map(function (data) {
    return data.toString();
  }).merge(error).takeUntil(_rx.Observable.fromEvent(stream, 'end').amb(error));
}

/**
 * Splits a stream of strings on newlines.
 * Includes the newlines in the resulting stream.
 * Sends any non-newline terminated data before closing.
 * Never sends an empty string.
 */
function splitStream(input) {
  return _rx.Observable.create(function (observer) {
    var current = '';

    function onEnd() {
      if (current !== '') {
        observer.onNext(current);
        current = '';
      }
    }

    return input.subscribe(function (value) {
      var lines = (current + value).split('\n');
      current = lines.pop();
      lines.forEach(function (line) {
        return observer.onNext(line + '\n');
      });
    }, function (error) {
      onEnd();observer.onError(error);
    }, function () {
      onEnd();observer.onCompleted();
    });
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
    var stdout = splitStream(observeStream(process.stdout)).map(function (data) {
      return { kind: 'stdout', data: data };
    });
    var stderr = splitStream(observeStream(process.stderr)).map(function (data) {
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
  observeStream: observeStream,
  observeProcessExit: observeProcessExit,
  observeProcess: observeProcess,
  COMMON_BINARY_PATHS: COMMON_BINARY_PATHS,
  __test__: {
    DARWIN_PATH_HELPER_REGEXP: DARWIN_PATH_HELPER_REGEXP
  }
};
//# sourceMappingURL=data:application/json;base64,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QUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7QUFDdkIsV0FBTyxXQUFXLEVBQUUsQ0FBQztHQUN0QixFQUNELFVBQUEsS0FBSyxFQUFJO0FBQ1AsZ0JBQVksQ0FBQyxHQUFHLEdBQUcsWUFBWSxDQUFDLEdBQUcsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDO0FBQ25ELFdBQU8sV0FBVyxFQUFFLENBQUM7R0FDdEIsQ0FDRixDQUFDO0NBQ0g7O0FBa0JELE1BQU0sQ0FBQyxPQUFPLEdBQUc7QUFDZixjQUFZLEVBQVosWUFBWTtBQUNaLDRCQUEwQixFQUExQiwwQkFBMEI7QUFDMUIsYUFBVyxFQUFYLFdBQVc7QUFDWCxXQUFTLEVBQVQsU0FBUztBQUNULGlCQUFlLEVBQWYsZUFBZTtBQUNmLGlDQUErQixFQUEvQiwrQkFBK0I7QUFDL0IsdUJBQXFCLEVBQXJCLHFCQUFxQjtBQUNyQixlQUFhLEVBQWIsYUFBYTtBQUNiLG9CQUFrQixFQUFsQixrQkFBa0I7QUFDbEIsZ0JBQWMsRUFBZCxjQUFjO0FBQ2QscUJBQW1CLEVBQW5CLG1CQUFtQjtBQUNuQixVQUFRLEVBQUU7QUFDUiw2QkFBeUIsRUFBekIseUJBQXlCO0dBQzFCO0NBQ0YsQ0FBQyIsImZpbGUiOiJwcm9jZXNzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHtcbiAgZXhlY0ZpbGUsXG4gIHNwYXduLFxufSBmcm9tICdjaGlsZF9wcm9jZXNzJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHtQcm9taXNlUXVldWV9IGZyb20gJy4vUHJvbWlzZUV4ZWN1dG9ycyc7XG5cbmltcG9ydCB0eXBlIHtPYnNlcnZhYmxlIGFzIE9ic2VydmFibGVUeXBlLCBPYnNlcnZlcn0gZnJvbSAncngnO1xuaW1wb3J0IHR5cGUge1Byb2Nlc3NNZXNzYWdlLCBwcm9jZXNzJGFzeW5jRXhlY3V0ZVJldH0gZnJvbSAnLi9tYWluJztcblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuXG5sZXQgcGxhdGZvcm1QYXRoUHJvbWlzZTogP1Byb21pc2U8c3RyaW5nPjtcblxuY29uc3QgYmxvY2tpbmdRdWV1ZXMgPSB7fTtcbmNvbnN0IENPTU1PTl9CSU5BUllfUEFUSFMgPSBbJy91c3IvYmluJywgJy9iaW4nLCAnL3Vzci9zYmluJywgJy9zYmluJywgJy91c3IvbG9jYWwvYmluJ107XG5cbi8qKlxuICogQ2FwdHVyZXMgdGhlIHZhbHVlIG9mIHRoZSBQQVRIIGVudiB2YXJpYWJsZSByZXR1cm5lZCBieSBEYXJ3aW4ncyAoT1MgWCkgYHBhdGhfaGVscGVyYCB1dGlsaXR5LlxuICogYHBhdGhfaGVscGVyIC1zYCdzIHJldHVybiB2YWx1ZSBsb29rcyBsaWtlIHRoaXM6XG4gKlxuICogICAgIFBBVEg9XCIvdXNyL2JpblwiOyBleHBvcnQgUEFUSDtcbiAqL1xuY29uc3QgREFSV0lOX1BBVEhfSEVMUEVSX1JFR0VYUCA9IC9QQVRIPVxcXCIoW15cXFwiXSspXFxcIi87XG5cbmNvbnN0IFNUUkVBTV9OQU1FUyA9IFsnc3RkaW4nLCAnc3Rkb3V0JywgJ3N0ZGVyciddO1xuXG5mdW5jdGlvbiBnZXRQbGF0Zm9ybVBhdGgoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgLy8gRG8gbm90IHJldHVybiB0aGUgY2FjaGVkIHZhbHVlIGlmIHdlIGFyZSBleGVjdXRpbmcgdW5kZXIgdGhlIHRlc3QgcnVubmVyLlxuICBpZiAocGxhdGZvcm1QYXRoUHJvbWlzZSAmJiBwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Rlc3QnKSB7XG4gICAgLy8gUGF0aCBpcyBiZWluZyBmZXRjaGVkLCBhd2FpdCB0aGUgUHJvbWlzZSB0aGF0J3MgaW4gZmxpZ2h0LlxuICAgIHJldHVybiBwbGF0Zm9ybVBhdGhQcm9taXNlO1xuICB9XG5cbiAgLy8gV2UgZG8gbm90IGNhY2hlIHRoZSByZXN1bHQgb2YgdGhpcyBjaGVjayBiZWNhdXNlIHdlIGhhdmUgdW5pdCB0ZXN0cyB0aGF0IHRlbXBvcmFyaWx5IHJlZGVmaW5lXG4gIC8vIHRoZSB2YWx1ZSBvZiBwcm9jZXNzLnBsYXRmb3JtLlxuICBpZiAocHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ2RhcndpbicpIHtcbiAgICAvLyBPUyBYIGFwcHMgZG9uJ3QgaW5oZXJpdCBQQVRIIHdoZW4gbm90IGxhdW5jaGVkIGZyb20gdGhlIENMSSwgc28gcmVjb25zdHJ1Y3QgaXQuIFRoaXMgaXMgYVxuICAgIC8vIGJ1ZywgZmlsZWQgYWdhaW5zdCBBdG9tIExpbnRlciBoZXJlOiBodHRwczovL2dpdGh1Yi5jb20vQXRvbUxpbnRlci9MaW50ZXIvaXNzdWVzLzE1MFxuICAgIC8vIFRPRE8oamppYWEpOiByZW1vdmUgdGhpcyBoYWNrIHdoZW4gdGhlIEF0b20gaXNzdWUgaXMgY2xvc2VkXG4gICAgcGxhdGZvcm1QYXRoUHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGV4ZWNGaWxlKCcvdXNyL2xpYmV4ZWMvcGF0aF9oZWxwZXInLCBbJy1zJ10sIChlcnJvciwgc3Rkb3V0LCBzdGRlcnIpID0+IHtcbiAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCBtYXRjaCA9IHN0ZG91dC5tYXRjaChEQVJXSU5fUEFUSF9IRUxQRVJfUkVHRVhQKTtcbiAgICAgICAgICByZXNvbHZlKChtYXRjaCAmJiBtYXRjaC5sZW5ndGggPiAxKSA/IG1hdGNoWzFdIDogJycpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICBwbGF0Zm9ybVBhdGhQcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKCcnKTtcbiAgfVxuXG4gIHJldHVybiBwbGF0Zm9ybVBhdGhQcm9taXNlO1xufVxuXG5mdW5jdGlvbiBhcHBlbmRDb21tb25CaW5hcnlQYXRocyhlbnY6IE9iamVjdCwgY29tbW9uQmluYXJ5UGF0aHM6IEFycmF5PHN0cmluZz4pOiB2b2lkIHtcbiAgY29tbW9uQmluYXJ5UGF0aHMuZm9yRWFjaCgoYmluYXJ5UGF0aCkgPT4ge1xuICAgIGlmIChlbnYuUEFUSC5pbmRleE9mKGJpbmFyeVBhdGgpID09PSAtMSkge1xuICAgICAgZW52LlBBVEggKz0gcGF0aC5kZWxpbWl0ZXIgKyBiaW5hcnlQYXRoO1xuICAgIH1cbiAgfSk7XG59XG5cbi8qKlxuICogU2luY2UgT1MgWCBhcHBzIGRvbid0IGluaGVyaXQgUEFUSCB3aGVuIG5vdCBsYXVuY2hlZCBmcm9tIHRoZSBDTEksIHRoaXMgZnVuY3Rpb24gY3JlYXRlcyBhIG5ld1xuICogZW52aXJvbm1lbnQgb2JqZWN0IGdpdmVuIHRoZSBvcmlnaW5hbCBlbnZpcm9ubWVudCBieSBtb2RpZnlpbmcgdGhlIGVudi5QQVRIIHVzaW5nIGZvbGxvd2luZ1xuICogbG9naWM6XG4gKiAgMSkgSWYgb3JpZ2luYWxFbnYuUEFUSCBkb2Vzbid0IGVxdWFsIHRvIHByb2Nlc3MuZW52LlBBVEgsIHdoaWNoIG1lYW5zIHRoZSBQQVRIIGhhcyBiZWVuXG4gKiAgICBtb2RpZmllZCwgd2Ugc2hvdWxkbid0IGRvIGFueXRoaW5nLlxuICogIDEpIElmIHdlIGFyZSBydW5uaW5nIGluIE9TIFgsIHVzZSBgL3Vzci9saWJleGVjL3BhdGhfaGVscGVyIC1zYCB0byBnZXQgdGhlIGNvcnJlY3QgUEFUSCBhbmRcbiAqICAgIFJFUExBQ0UgdGhlIFBBVEguXG4gKiAgMikgSWYgc3RlcCAxIGZhaWxlZCBvciB3ZSBhcmUgbm90IHJ1bm5pbmcgaW4gT1MgWCwgQVBQRU5EIGNvbW1vbkJpbmFyeVBhdGhzIHRvIGN1cnJlbnQgUEFUSC5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gY3JlYXRlRXhlY0Vudmlyb25tZW50KFxuICBvcmlnaW5hbEVudjogT2JqZWN0LFxuICBjb21tb25CaW5hcnlQYXRoczogQXJyYXk8c3RyaW5nPixcbik6IFByb21pc2U8T2JqZWN0PiB7XG4gIGNvbnN0IGV4ZWNFbnYgPSB7Li4ub3JpZ2luYWxFbnZ9O1xuXG4gIGlmIChleGVjRW52LlBBVEggIT09IHByb2Nlc3MuZW52LlBBVEgpIHtcbiAgICByZXR1cm4gZXhlY0VudjtcbiAgfVxuXG4gIGV4ZWNFbnYuUEFUSCA9IGV4ZWNFbnYuUEFUSCB8fCAnJztcblxuICBsZXQgcGxhdGZvcm1QYXRoID0gbnVsbDtcbiAgdHJ5IHtcbiAgICBwbGF0Zm9ybVBhdGggPSBhd2FpdCBnZXRQbGF0Zm9ybVBhdGgoKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBsb2dFcnJvcignRmFpbGVkIHRvIGdldFBsYXRmb3JtUGF0aCcsIGVycm9yKTtcbiAgfVxuXG4gIC8vIElmIHRoZSBwbGF0Zm9ybSByZXR1cm5zIGEgbm9uLWVtcHR5IFBBVEgsIHVzZSBpdC4gT3RoZXJ3aXNlIHVzZSB0aGUgZGVmYXVsdCBzZXQgb2YgY29tbW9uXG4gIC8vIGJpbmFyeSBwYXRocy5cbiAgaWYgKHBsYXRmb3JtUGF0aCkge1xuICAgIGV4ZWNFbnYuUEFUSCA9IHBsYXRmb3JtUGF0aDtcbiAgfSBlbHNlIHtcbiAgICBhcHBlbmRDb21tb25CaW5hcnlQYXRocyhleGVjRW52LCBjb21tb25CaW5hcnlQYXRocyk7XG4gIH1cblxuICByZXR1cm4gZXhlY0Vudjtcbn1cblxuZnVuY3Rpb24gbG9nRXJyb3IoLi4uYXJncykge1xuICAvLyBDYW4ndCB1c2UgbnVjbGlkZS1sb2dnaW5nIGhlcmUgdG8gbm90IGNhdXNlIGN5Y2xlIGRlcGVuZGVuY3kuXG4gIC8qZXNsaW50LWRpc2FibGUgbm8tY29uc29sZSovXG4gIGNvbnNvbGUuZXJyb3IoLi4uYXJncyk7XG4gIC8qZXNsaW50LWVuYWJsZSBuby1jb25zb2xlKi9cbn1cblxuZnVuY3Rpb24gbW9uaXRvclN0cmVhbUVycm9ycyhwcm9jZXNzOiBjaGlsZF9wcm9jZXNzJENoaWxkUHJvY2VzcywgY29tbWFuZCwgYXJncywgb3B0aW9ucyk6IHZvaWQge1xuICBTVFJFQU1fTkFNRVMuZm9yRWFjaChzdHJlYW1OYW1lID0+IHtcbiAgICAvLyAkRmxvd0lzc3VlXG4gICAgcHJvY2Vzc1tzdHJlYW1OYW1lXS5vbignZXJyb3InLCBlcnJvciA9PiB7XG4gICAgICAvLyBUaGlzIGNhbiBoYXBwZW4gd2l0aG91dCB0aGUgZnVsbCBleGVjdXRpb24gb2YgdGhlIGNvbW1hbmQgdG8gZmFpbCxcbiAgICAgIC8vIGJ1dCB3ZSB3YW50IHRvIGxlYXJuIGFib3V0IGl0LlxuICAgICAgbG9nRXJyb3IoXG4gICAgICAgIGBzdHJlYW0gZXJyb3Igb24gc3RyZWFtICR7c3RyZWFtTmFtZX0gd2l0aCBjb21tYW5kOmAsXG4gICAgICAgIGNvbW1hbmQsXG4gICAgICAgIGFyZ3MsXG4gICAgICAgIG9wdGlvbnMsXG4gICAgICAgICdlcnJvcjonLFxuICAgICAgICBlcnJvcixcbiAgICAgICk7XG4gICAgfSk7XG4gIH0pO1xufVxuXG4vKipcbiAqIEJhc2ljYWxseSBsaWtlIHNwYXduLCBleGNlcHQgaXQgaGFuZGxlcyBhbmQgbG9ncyBlcnJvcnMgaW5zdGVhZCBvZiBjcmFzaGluZ1xuICogdGhlIHByb2Nlc3MuIFRoaXMgaXMgbXVjaCBsb3dlci1sZXZlbCB0aGFuIGFzeW5jRXhlY3V0ZS4gVW5sZXNzIHlvdSBoYXZlIGFcbiAqIHNwZWNpZmljIHJlYXNvbiB5b3Ugc2hvdWxkIHVzZSBhc3luY0V4ZWN1dGUgaW5zdGVhZC5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gc2FmZVNwYXduKFxuICBjb21tYW5kOiBzdHJpbmcsXG4gIGFyZ3M/OiBBcnJheTxzdHJpbmc+ID0gW10sXG4gIG9wdGlvbnM/OiBPYmplY3QgPSB7fSxcbik6IFByb21pc2U8Y2hpbGRfcHJvY2VzcyRDaGlsZFByb2Nlc3M+IHtcbiAgb3B0aW9ucy5lbnYgPSBhd2FpdCBjcmVhdGVFeGVjRW52aXJvbm1lbnQob3B0aW9ucy5lbnYgfHwgcHJvY2Vzcy5lbnYsIENPTU1PTl9CSU5BUllfUEFUSFMpO1xuICBjb25zdCBjaGlsZCA9IHNwYXduKGNvbW1hbmQsIGFyZ3MsIG9wdGlvbnMpO1xuICBtb25pdG9yU3RyZWFtRXJyb3JzKGNoaWxkLCBjb21tYW5kLCBhcmdzLCBvcHRpb25zKTtcbiAgY2hpbGQub24oJ2Vycm9yJywgZXJyb3IgPT4ge1xuICAgIGxvZ0Vycm9yKCdlcnJvciB3aXRoIGNvbW1hbmQ6JywgY29tbWFuZCwgYXJncywgb3B0aW9ucywgJ2Vycm9yOicsIGVycm9yKTtcbiAgfSk7XG4gIHJldHVybiBjaGlsZDtcbn1cblxuY29uc3QgaXNPc1ggPSBwcm9jZXNzLnBsYXRmb3JtID09PSAnZGFyd2luJztcblxuLyoqXG4gKiBUYWtlcyB0aGUgY29tbWFuZCBhbmQgYXJncyB0aGF0IHlvdSB3b3VsZCBub3JtYWxseSBwYXNzIHRvIGBzcGF3bigpYCBhbmQgcmV0dXJucyBgbmV3QXJnc2Agc3VjaFxuICogdGhhdCB5b3Ugc2hvdWxkIGNhbGwgaXQgd2l0aCBgc3Bhd24oJ3NjcmlwdCcsIG5ld0FyZ3MpYCB0byBydW4gdGhlIG9yaWdpbmFsIGNvbW1hbmQvYXJncyBwYWlyXG4gKiB1bmRlciBgc2NyaXB0YC5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlQXJnc0ZvclNjcmlwdENvbW1hbmQoY29tbWFuZDogc3RyaW5nLCBhcmdzPzogQXJyYXk8c3RyaW5nPiA9IFtdKTogQXJyYXk8c3RyaW5nPiB7XG4gIGlmIChpc09zWCkge1xuICAgIC8vIE9uIE9TIFgsIHNjcmlwdCB0YWtlcyB0aGUgcHJvZ3JhbSB0byBydW4gYW5kIGl0cyBhcmd1bWVudHMgYXMgdmFyYXJncyBhdCB0aGUgZW5kLlxuICAgIHJldHVybiBbJy1xJywgJy9kZXYvbnVsbCcsIGNvbW1hbmRdLmNvbmNhdChhcmdzKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBPbiBMaW51eCwgc2NyaXB0IHRha2VzIHRoZSBjb21tYW5kIHRvIHJ1biBhcyB0aGUgLWMgcGFyYW1ldGVyLlxuICAgIC8vIFRPRE86IFNoZWxsIGVzY2FwZSBldmVyeSBlbGVtZW50IGluIGFsbEFyZ3MuXG4gICAgY29uc3QgYWxsQXJncyA9IFtjb21tYW5kXS5jb25jYXQoYXJncyk7XG4gICAgY29uc3QgY29tbWFuZEFzSXRzT3duQXJnID0gYWxsQXJncy5qb2luKCcgJyk7XG4gICAgcmV0dXJuIFsnLXEnLCAnL2Rldi9udWxsJywgJy1jJywgY29tbWFuZEFzSXRzT3duQXJnXTtcbiAgfVxufVxuXG4vKipcbiAqIEJhc2ljYWxseSBsaWtlIHNhZmVTcGF3biwgYnV0IHJ1bnMgdGhlIGNvbW1hbmQgd2l0aCB0aGUgYHNjcmlwdGAgY29tbWFuZC5cbiAqIGBzY3JpcHRgIGVuc3VyZXMgdGVybWluYWwtbGlrZSBlbnZpcm9ubWVudCBhbmQgY29tbWFuZHMgd2UgcnVuIGdpdmUgY29sb3JlZCBvdXRwdXQuXG4gKi9cbmZ1bmN0aW9uIHNjcmlwdFNhZmVTcGF3bihcbiAgY29tbWFuZDogc3RyaW5nLFxuICBhcmdzPzogQXJyYXk8c3RyaW5nPiA9IFtdLFxuICBvcHRpb25zPzogT2JqZWN0ID0ge30sXG4pOiBQcm9taXNlPGNoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzPiB7XG4gIGNvbnN0IG5ld0FyZ3MgPSBjcmVhdGVBcmdzRm9yU2NyaXB0Q29tbWFuZChjb21tYW5kLCBhcmdzKTtcbiAgcmV0dXJuIHNhZmVTcGF3bignc2NyaXB0JywgbmV3QXJncywgb3B0aW9ucyk7XG59XG5cbi8qKlxuICogV3JhcHMgc2NyaXB0U2FmZVNwYXduIHdpdGggYW4gT2JzZXJ2YWJsZSB0aGF0IGxldHMgeW91IGxpc3RlbiB0byB0aGUgc3Rkb3V0IGFuZFxuICogc3RkZXJyIG9mIHRoZSBzcGF3bmVkIHByb2Nlc3MuXG4gKi9cbmZ1bmN0aW9uIHNjcmlwdFNhZmVTcGF3bkFuZE9ic2VydmVPdXRwdXQoXG4gIGNvbW1hbmQ6IHN0cmluZyxcbiAgYXJncz86IEFycmF5PHN0cmluZz4gPSBbXSxcbiAgb3B0aW9ucz86IE9iamVjdCA9IHt9LFxuKTogT2JzZXJ2YWJsZVR5cGU8e3N0ZGVycj86IHN0cmluZzsgc3Rkb3V0Pzogc3RyaW5nO30+IHtcbiAgY29uc3Qge09ic2VydmFibGV9ID0gcmVxdWlyZSgncngnKTtcbiAgcmV0dXJuIE9ic2VydmFibGUuY3JlYXRlKChvYnNlcnZlcjogT2JzZXJ2ZXIpID0+IHtcbiAgICBsZXQgY2hpbGRQcm9jZXNzO1xuICAgIHNjcmlwdFNhZmVTcGF3bihjb21tYW5kLCBhcmdzLCBvcHRpb25zKS50aGVuKHByb2MgPT4ge1xuICAgICAgY2hpbGRQcm9jZXNzID0gcHJvYztcblxuICAgICAgY2hpbGRQcm9jZXNzLnN0ZG91dC5vbignZGF0YScsIChkYXRhKSA9PiB7XG4gICAgICAgIG9ic2VydmVyLm9uTmV4dCh7c3Rkb3V0OiBkYXRhLnRvU3RyaW5nKCl9KTtcbiAgICAgIH0pO1xuXG4gICAgICBsZXQgc3RkZXJyID0gJyc7XG4gICAgICBjaGlsZFByb2Nlc3Muc3RkZXJyLm9uKCdkYXRhJywgKGRhdGEpID0+IHtcbiAgICAgICAgc3RkZXJyICs9IGRhdGE7XG4gICAgICAgIG9ic2VydmVyLm9uTmV4dCh7c3RkZXJyOiBkYXRhLnRvU3RyaW5nKCl9KTtcbiAgICAgIH0pO1xuXG4gICAgICBjaGlsZFByb2Nlc3Mub24oJ2V4aXQnLCAoZXhpdENvZGU6IG51bWJlcikgPT4ge1xuICAgICAgICBpZiAoZXhpdENvZGUgIT09IDApIHtcbiAgICAgICAgICBvYnNlcnZlci5vbkVycm9yKHN0ZGVycik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgb2JzZXJ2ZXIub25Db21wbGV0ZWQoKTtcbiAgICAgICAgfVxuICAgICAgICBjaGlsZFByb2Nlc3MgPSBudWxsO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgaWYgKGNoaWxkUHJvY2Vzcykge1xuICAgICAgICBjaGlsZFByb2Nlc3Mua2lsbCgpO1xuICAgICAgfVxuICAgIH07XG4gIH0pO1xufVxuXG5pbXBvcnQge09ic2VydmFibGV9IGZyb20gJ3J4JztcblxuLyoqXG4gKiBPYnNlcnZlIGEgc3RyZWFtIGxpa2Ugc3Rkb3V0IG9yIHN0ZGVyci5cbiAqL1xuZnVuY3Rpb24gb2JzZXJ2ZVN0cmVhbShzdHJlYW06IHN0cmVhbSRSZWFkYWJsZSk6IE9ic2VydmFibGVUeXBlPHN0cmluZz4ge1xuICBjb25zdCBlcnJvciA9IE9ic2VydmFibGUuZnJvbUV2ZW50KHN0cmVhbSwgJ2Vycm9yJykuZmxhdE1hcChPYnNlcnZhYmxlLnRocm93RXJyb3IpO1xuICByZXR1cm4gT2JzZXJ2YWJsZS5mcm9tRXZlbnQoc3RyZWFtLCAnZGF0YScpLm1hcChkYXRhID0+IGRhdGEudG9TdHJpbmcoKSkuXG4gICAgbWVyZ2UoZXJyb3IpLlxuICAgIHRha2VVbnRpbChPYnNlcnZhYmxlLmZyb21FdmVudChzdHJlYW0sICdlbmQnKS5hbWIoZXJyb3IpKTtcbn1cblxuLyoqXG4gKiBTcGxpdHMgYSBzdHJlYW0gb2Ygc3RyaW5ncyBvbiBuZXdsaW5lcy5cbiAqIEluY2x1ZGVzIHRoZSBuZXdsaW5lcyBpbiB0aGUgcmVzdWx0aW5nIHN0cmVhbS5cbiAqIFNlbmRzIGFueSBub24tbmV3bGluZSB0ZXJtaW5hdGVkIGRhdGEgYmVmb3JlIGNsb3NpbmcuXG4gKiBOZXZlciBzZW5kcyBhbiBlbXB0eSBzdHJpbmcuXG4gKi9cbmZ1bmN0aW9uIHNwbGl0U3RyZWFtKGlucHV0OiBPYnNlcnZhYmxlVHlwZTxzdHJpbmc+KTogT2JzZXJ2YWJsZVR5cGU8c3RyaW5nPiB7XG4gIHJldHVybiBPYnNlcnZhYmxlLmNyZWF0ZShvYnNlcnZlciA9PiB7XG4gICAgbGV0IGN1cnJlbnQ6IHN0cmluZyA9ICcnO1xuXG4gICAgZnVuY3Rpb24gb25FbmQoKSB7XG4gICAgICBpZiAoY3VycmVudCAhPT0gJycpIHtcbiAgICAgICAgb2JzZXJ2ZXIub25OZXh0KGN1cnJlbnQpO1xuICAgICAgICBjdXJyZW50ID0gJyc7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGlucHV0LnN1YnNjcmliZShcbiAgICAgIHZhbHVlID0+IHtcbiAgICAgICAgY29uc3QgbGluZXMgPSAoY3VycmVudCArIHZhbHVlKS5zcGxpdCgnXFxuJyk7XG4gICAgICAgIGN1cnJlbnQgPSBsaW5lcy5wb3AoKTtcbiAgICAgICAgbGluZXMuZm9yRWFjaChsaW5lID0+IG9ic2VydmVyLm9uTmV4dChsaW5lICsgJ1xcbicpKTtcbiAgICAgIH0sXG4gICAgICBlcnJvciA9PiB7IG9uRW5kKCk7IG9ic2VydmVyLm9uRXJyb3IoZXJyb3IpOyB9LFxuICAgICAgKCkgPT4geyBvbkVuZCgpOyBvYnNlcnZlci5vbkNvbXBsZXRlZCgpOyB9LFxuICAgICk7XG4gIH0pO1xufVxuXG5jbGFzcyBQcm9jZXNzIHtcbiAgcHJvY2VzczogP2NoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzO1xuICBjb25zdHJ1Y3Rvcihwcm9jZXNzOiBjaGlsZF9wcm9jZXNzJENoaWxkUHJvY2Vzcykge1xuICAgIHRoaXMucHJvY2VzcyA9IHByb2Nlc3M7XG4gICAgT2JzZXJ2YWJsZS5mcm9tRXZlbnQocHJvY2VzcywgJ2V4aXQnKS5cbiAgICAgIHRha2UoMSkuXG4gICAgICBkb09uTmV4dCgoKSA9PiB7IHRoaXMucHJvY2VzcyA9IG51bGw7IH0pO1xuICB9XG4gIGRpc3Bvc2UoKSB7XG4gICAgaWYgKHRoaXMucHJvY2Vzcykge1xuICAgICAgdGhpcy5wcm9jZXNzLmtpbGwoKTtcbiAgICAgIHRoaXMucHJvY2VzcyA9IG51bGw7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogT2JzZXJ2ZSB0aGUgc3Rkb3V0LCBzdGRlcnIgYW5kIGV4aXQgY29kZSBvZiBhIHByb2Nlc3MuXG4gKiBzdGRvdXQgYW5kIHN0ZGVyciBhcmUgc3BsaXQgYnkgbmV3bGluZXMuXG4gKi9cbmZ1bmN0aW9uIG9ic2VydmVQcm9jZXNzRXhpdChjcmVhdGVQcm9jZXNzOiAoKSA9PiBjaGlsZF9wcm9jZXNzJENoaWxkUHJvY2Vzcyk6XG4gICAgT2JzZXJ2YWJsZVR5cGU8bnVtYmVyPiB7XG4gIHJldHVybiBPYnNlcnZhYmxlLnVzaW5nKFxuICAgICgpID0+IG5ldyBQcm9jZXNzKGNyZWF0ZVByb2Nlc3MoKSksXG4gICAgcHJvY2VzcyA9PiB7XG4gICAgICByZXR1cm4gT2JzZXJ2YWJsZS5mcm9tRXZlbnQocHJvY2Vzcy5wcm9jZXNzLCAnZXhpdCcpLnRha2UoMSk7XG4gICAgfSk7XG59XG5cbi8qKlxuICogT2JzZXJ2ZSB0aGUgc3Rkb3V0LCBzdGRlcnIgYW5kIGV4aXQgY29kZSBvZiBhIHByb2Nlc3MuXG4gKi9cbmZ1bmN0aW9uIG9ic2VydmVQcm9jZXNzKGNyZWF0ZVByb2Nlc3M6ICgpID0+IGNoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzKTpcbiAgICBPYnNlcnZhYmxlVHlwZTxQcm9jZXNzTWVzc2FnZT4ge1xuICByZXR1cm4gT2JzZXJ2YWJsZS51c2luZyhcbiAgICAoKSA9PiBuZXcgUHJvY2VzcyhjcmVhdGVQcm9jZXNzKCkpLFxuICAgICh7cHJvY2Vzc30pID0+IHtcbiAgICAgIGludmFyaWFudChwcm9jZXNzICE9IG51bGwsICdwcm9jZXNzIGhhcyBub3QgeWV0IGJlZW4gZGlzcG9zZWQnKTtcbiAgICAgIC8vIFVzZSByZXBsYXkvY29ubmVjdCBvbiBleGl0IGZvciB0aGUgZmluYWwgY29uY2F0LlxuICAgICAgLy8gQnkgZGVmYXVsdCBjb25jYXQgZGVmZXJzIHN1YnNjcmlwdGlvbiB1bnRpbCBhZnRlciB0aGUgTEhTIGNvbXBsZXRlcy5cbiAgICAgIGNvbnN0IGV4aXQgPSBPYnNlcnZhYmxlLmZyb21FdmVudChwcm9jZXNzLCAnZXhpdCcpLnRha2UoMSkuXG4gICAgICAgICAgbWFwKGV4aXRDb2RlID0+ICh7a2luZDogJ2V4aXQnLCBleGl0Q29kZX0pKS5yZXBsYXkoKTtcbiAgICAgIGV4aXQuY29ubmVjdCgpO1xuICAgICAgY29uc3QgZXJyb3IgPSBPYnNlcnZhYmxlLmZyb21FdmVudChwcm9jZXNzLCAnZXJyb3InKS5cbiAgICAgICAgICB0YWtlVW50aWwoZXhpdCkuXG4gICAgICAgICAgbWFwKGVycm9yT2JqID0+ICh7a2luZDogJ2Vycm9yJywgZXJyb3I6IGVycm9yT2JqfSkpO1xuICAgICAgY29uc3Qgc3Rkb3V0ID0gc3BsaXRTdHJlYW0ob2JzZXJ2ZVN0cmVhbShwcm9jZXNzLnN0ZG91dCkpLlxuICAgICAgICAgIG1hcChkYXRhID0+ICh7a2luZDogJ3N0ZG91dCcsIGRhdGF9KSk7XG4gICAgICBjb25zdCBzdGRlcnIgPSBzcGxpdFN0cmVhbShvYnNlcnZlU3RyZWFtKHByb2Nlc3Muc3RkZXJyKSkuXG4gICAgICAgICAgbWFwKGRhdGEgPT4gKHtraW5kOiAnc3RkZXJyJywgZGF0YX0pKTtcbiAgICAgIHJldHVybiBzdGRvdXQubWVyZ2Uoc3RkZXJyKS5tZXJnZShlcnJvcikuY29uY2F0KGV4aXQpO1xuICAgIH0pO1xufVxuXG4vKipcbiAqIFJldHVybnMgYSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgdG8gdGhlIHJlc3VsdCBvZiBleGVjdXRpbmcgYSBwcm9jZXNzLlxuICpcbiAqIEBwYXJhbSBjb21tYW5kIFRoZSBjb21tYW5kIHRvIGV4ZWN1dGUuXG4gKiBAcGFyYW0gYXJncyBUaGUgYXJndW1lbnRzIHRvIHBhc3MgdG8gdGhlIGNvbW1hbmQuXG4gKiBAcGFyYW0gb3B0aW9ucyBPcHRpb25zIGZvciBjaGFuZ2luZyBob3cgdG8gcnVuIHRoZSBjb21tYW5kLlxuICogICAgIFNlZSBoZXJlOiBodHRwOi8vbm9kZWpzLm9yZy9hcGkvY2hpbGRfcHJvY2Vzcy5odG1sXG4gKiAgICAgVGhlIGFkZGl0aW9uYWwgb3B0aW9ucyB3ZSBwcm92aWRlOlxuICogICAgICAgcXVldWVOYW1lIHN0cmluZyBUaGUgcXVldWUgb24gd2hpY2ggdG8gYmxvY2sgZGVwZW5kZW50IGNhbGxzLlxuICogICAgICAgc3RkaW4gc3RyaW5nIFRoZSBjb250ZW50cyB0byB3cml0ZSB0byBzdGRpbi5cbiAqICAgICAgIHBpcGVkQ29tbWFuZCBzdHJpbmcgYSBjb21tYW5kIHRvIHBpcGUgdGhlIG91dHB1dCBvZiBjb21tYW5kIHRocm91Z2guXG4gKiAgICAgICBwaXBlZEFyZ3MgYXJyYXkgb2Ygc3RyaW5ncyBhcyBhcmd1bWVudHMuXG4gKiBAcmV0dXJuIFByb21pc2UgdGhhdCByZXNvbHZlcyB0byBhbiBvYmplY3Qgd2l0aCB0aGUgcHJvcGVydGllczpcbiAqICAgICBzdGRvdXQgc3RyaW5nIFRoZSBjb250ZW50cyBvZiB0aGUgcHJvY2VzcydzIG91dHB1dCBzdHJlYW0uXG4gKiAgICAgc3RkZXJyIHN0cmluZyBUaGUgY29udGVudHMgb2YgdGhlIHByb2Nlc3MncyBlcnJvciBzdHJlYW0uXG4gKiAgICAgZXhpdENvZGUgbnVtYmVyIFRoZSBleGl0IGNvZGUgcmV0dXJuZWQgYnkgdGhlIHByb2Nlc3MuXG4gKi9cbmZ1bmN0aW9uIGNoZWNrT3V0cHV0KFxuICAgIGNvbW1hbmQ6IHN0cmluZyxcbiAgICBhcmdzOiBBcnJheTxzdHJpbmc+LFxuICAgIG9wdGlvbnM6ID9PYmplY3QgPSB7fSk6IFByb21pc2U8cHJvY2VzcyRhc3luY0V4ZWN1dGVSZXQ+IHtcbiAgLy8gQ2xvbmUgcGFzc2VkIGluIG9wdGlvbnMgc28gdGhpcyBmdW5jdGlvbiBkb2Vzbid0IG1vZGlmeSBhbiBvYmplY3QgaXQgZG9lc24ndCBvd24uXG4gIGNvbnN0IGxvY2FsT3B0aW9ucyA9IHsuLi5vcHRpb25zfTtcblxuICBjb25zdCBleGVjdXRvciA9IChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBsZXQgZmlyc3RDaGlsZDtcbiAgICBsZXQgbGFzdENoaWxkO1xuXG4gICAgbGV0IGZpcnN0Q2hpbGRTdGRlcnI7XG4gICAgaWYgKGxvY2FsT3B0aW9ucy5waXBlZENvbW1hbmQpIHtcbiAgICAgIC8vIElmIGEgc2Vjb25kIGNvbW1hbmQgaXMgZ2l2ZW4sIHBpcGUgc3Rkb3V0IG9mIGZpcnN0IHRvIHN0ZGluIG9mIHNlY29uZC4gU3RyaW5nIG91dHB1dFxuICAgICAgLy8gcmV0dXJuZWQgaW4gdGhpcyBmdW5jdGlvbidzIFByb21pc2Ugd2lsbCBiZSBzdGRlcnIvc3Rkb3V0IG9mIHRoZSBzZWNvbmQgY29tbWFuZC5cbiAgICAgIGZpcnN0Q2hpbGQgPSBzcGF3bihjb21tYW5kLCBhcmdzLCBsb2NhbE9wdGlvbnMpO1xuICAgICAgbW9uaXRvclN0cmVhbUVycm9ycyhmaXJzdENoaWxkLCBjb21tYW5kLCBhcmdzLCBsb2NhbE9wdGlvbnMpO1xuICAgICAgZmlyc3RDaGlsZFN0ZGVyciA9ICcnO1xuXG4gICAgICBmaXJzdENoaWxkLm9uKCdlcnJvcicsIGVycm9yID0+IHtcbiAgICAgICAgLy8gUmVqZWN0IGVhcmx5IHdpdGggdGhlIHJlc3VsdCB3aGVuIGVuY291bnRlcmluZyBhbiBlcnJvci5cbiAgICAgICAgcmVqZWN0KHtcbiAgICAgICAgICBjb21tYW5kOiBbY29tbWFuZF0uY29uY2F0KGFyZ3MpLmpvaW4oJyAnKSxcbiAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UsXG4gICAgICAgICAgZXhpdENvZGU6IGVycm9yLmNvZGUsXG4gICAgICAgICAgc3RkZXJyOiBmaXJzdENoaWxkU3RkZXJyLFxuICAgICAgICAgIHN0ZG91dDogJycsXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG5cbiAgICAgIGZpcnN0Q2hpbGQuc3RkZXJyLm9uKCdkYXRhJywgZGF0YSA9PiB7XG4gICAgICAgIGZpcnN0Q2hpbGRTdGRlcnIgKz0gZGF0YTtcbiAgICAgIH0pO1xuXG4gICAgICBsYXN0Q2hpbGQgPSBzcGF3bihsb2NhbE9wdGlvbnMucGlwZWRDb21tYW5kLCBsb2NhbE9wdGlvbnMucGlwZWRBcmdzLCBsb2NhbE9wdGlvbnMpO1xuICAgICAgbW9uaXRvclN0cmVhbUVycm9ycyhsYXN0Q2hpbGQsIGNvbW1hbmQsIGFyZ3MsIGxvY2FsT3B0aW9ucyk7XG4gICAgICBmaXJzdENoaWxkLnN0ZG91dC5waXBlKGxhc3RDaGlsZC5zdGRpbik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxhc3RDaGlsZCA9IHNwYXduKGNvbW1hbmQsIGFyZ3MsIGxvY2FsT3B0aW9ucyk7XG4gICAgICBtb25pdG9yU3RyZWFtRXJyb3JzKGxhc3RDaGlsZCwgY29tbWFuZCwgYXJncywgbG9jYWxPcHRpb25zKTtcbiAgICAgIGZpcnN0Q2hpbGQgPSBsYXN0Q2hpbGQ7XG4gICAgfVxuXG4gICAgbGV0IHN0ZGVyciA9ICcnO1xuICAgIGxldCBzdGRvdXQgPSAnJztcbiAgICBsYXN0Q2hpbGQub24oJ2Nsb3NlJywgZXhpdENvZGUgPT4ge1xuICAgICAgcmVzb2x2ZSh7XG4gICAgICAgIGV4aXRDb2RlLFxuICAgICAgICBzdGRlcnIsXG4gICAgICAgIHN0ZG91dCxcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgbGFzdENoaWxkLm9uKCdlcnJvcicsIGVycm9yID0+IHtcbiAgICAgIC8vIFJlamVjdCBlYXJseSB3aXRoIHRoZSByZXN1bHQgd2hlbiBlbmNvdW50ZXJpbmcgYW4gZXJyb3IuXG4gICAgICByZWplY3Qoe1xuICAgICAgICBjb21tYW5kOiBbY29tbWFuZF0uY29uY2F0KGFyZ3MpLmpvaW4oJyAnKSxcbiAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvci5tZXNzYWdlLFxuICAgICAgICBleGl0Q29kZTogZXJyb3IuY29kZSxcbiAgICAgICAgc3RkZXJyLFxuICAgICAgICBzdGRvdXQsXG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIGxhc3RDaGlsZC5zdGRlcnIub24oJ2RhdGEnLCBkYXRhID0+IHtcbiAgICAgIHN0ZGVyciArPSBkYXRhO1xuICAgIH0pO1xuICAgIGxhc3RDaGlsZC5zdGRvdXQub24oJ2RhdGEnLCBkYXRhID0+IHtcbiAgICAgIHN0ZG91dCArPSBkYXRhO1xuICAgIH0pO1xuXG4gICAgaWYgKHR5cGVvZiBsb2NhbE9wdGlvbnMuc3RkaW4gPT09ICdzdHJpbmcnKSB7XG4gICAgICAvLyBOb3RlIHRoYXQgdGhlIE5vZGUgZG9jcyBoYXZlIHRoaXMgc2Nhcnkgd2FybmluZyBhYm91dCBzdGRpbi5lbmQoKSBvblxuICAgICAgLy8gaHR0cDovL25vZGVqcy5vcmcvYXBpL2NoaWxkX3Byb2Nlc3MuaHRtbCNjaGlsZF9wcm9jZXNzX2NoaWxkX3N0ZGluOlxuICAgICAgLy9cbiAgICAgIC8vIFwiQSBXcml0YWJsZSBTdHJlYW0gdGhhdCByZXByZXNlbnRzIHRoZSBjaGlsZCBwcm9jZXNzJ3Mgc3RkaW4uIENsb3NpbmdcbiAgICAgIC8vIHRoaXMgc3RyZWFtIHZpYSBlbmQoKSBvZnRlbiBjYXVzZXMgdGhlIGNoaWxkIHByb2Nlc3MgdG8gdGVybWluYXRlLlwiXG4gICAgICAvL1xuICAgICAgLy8gSW4gcHJhY3RpY2UsIHRoaXMgaGFzIG5vdCBhcHBlYXJlZCB0byBjYXVzZSBhbnkgaXNzdWVzIHRodXMgZmFyLlxuICAgICAgZmlyc3RDaGlsZC5zdGRpbi53cml0ZShsb2NhbE9wdGlvbnMuc3RkaW4pO1xuICAgICAgZmlyc3RDaGlsZC5zdGRpbi5lbmQoKTtcbiAgICB9XG4gIH07XG5cbiAgZnVuY3Rpb24gbWFrZVByb21pc2UoKTogUHJvbWlzZTxwcm9jZXNzJGFzeW5jRXhlY3V0ZVJldD4ge1xuICAgIGlmIChsb2NhbE9wdGlvbnMucXVldWVOYW1lID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZShleGVjdXRvcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICghYmxvY2tpbmdRdWV1ZXNbbG9jYWxPcHRpb25zLnF1ZXVlTmFtZV0pIHtcbiAgICAgICAgYmxvY2tpbmdRdWV1ZXNbbG9jYWxPcHRpb25zLnF1ZXVlTmFtZV0gPSBuZXcgUHJvbWlzZVF1ZXVlKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gYmxvY2tpbmdRdWV1ZXNbbG9jYWxPcHRpb25zLnF1ZXVlTmFtZV0uc3VibWl0KGV4ZWN1dG9yKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gY3JlYXRlRXhlY0Vudmlyb25tZW50KGxvY2FsT3B0aW9ucy5lbnYgfHwgcHJvY2Vzcy5lbnYsIENPTU1PTl9CSU5BUllfUEFUSFMpLnRoZW4oXG4gICAgdmFsID0+IHtcbiAgICAgIGxvY2FsT3B0aW9ucy5lbnYgPSB2YWw7XG4gICAgICByZXR1cm4gbWFrZVByb21pc2UoKTtcbiAgICB9LFxuICAgIGVycm9yID0+IHtcbiAgICAgIGxvY2FsT3B0aW9ucy5lbnYgPSBsb2NhbE9wdGlvbnMuZW52IHx8IHByb2Nlc3MuZW52O1xuICAgICAgcmV0dXJuIG1ha2VQcm9taXNlKCk7XG4gICAgfVxuICApO1xufVxuXG5hc3luYyBmdW5jdGlvbiBhc3luY0V4ZWN1dGUoXG4gICAgY29tbWFuZDogc3RyaW5nLFxuICAgIGFyZ3M6IEFycmF5PHN0cmluZz4sXG4gICAgb3B0aW9uczogP09iamVjdCA9IHt9KTogUHJvbWlzZTxwcm9jZXNzJGFzeW5jRXhlY3V0ZVJldD4ge1xuICAvKiAkRmxvd0lzc3VlICh0ODIxNjE4OSkgKi9cbiAgY29uc3QgcmVzdWx0ID0gYXdhaXQgY2hlY2tPdXRwdXQoY29tbWFuZCwgYXJncywgb3B0aW9ucyk7XG4gIGlmIChyZXN1bHQuZXhpdENvZGUgIT09IDApIHtcbiAgICAvLyBEdWNrIHR5cGluZyBFcnJvci5cbiAgICByZXN1bHRbJ25hbWUnXSA9ICdBc3luYyBFeGVjdXRpb24gRXJyb3InO1xuICAgIHJlc3VsdFsnbWVzc2FnZSddID1cbiAgICAgICAgYGV4aXRDb2RlOiAke3Jlc3VsdC5leGl0Q29kZX0sIHN0ZGVycjogJHtyZXN1bHQuc3RkZXJyfSwgc3Rkb3V0OiAke3Jlc3VsdC5zdGRvdXR9LmA7XG4gICAgdGhyb3cgcmVzdWx0O1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBhc3luY0V4ZWN1dGUsXG4gIGNyZWF0ZUFyZ3NGb3JTY3JpcHRDb21tYW5kLFxuICBjaGVja091dHB1dCxcbiAgc2FmZVNwYXduLFxuICBzY3JpcHRTYWZlU3Bhd24sXG4gIHNjcmlwdFNhZmVTcGF3bkFuZE9ic2VydmVPdXRwdXQsXG4gIGNyZWF0ZUV4ZWNFbnZpcm9ubWVudCxcbiAgb2JzZXJ2ZVN0cmVhbSxcbiAgb2JzZXJ2ZVByb2Nlc3NFeGl0LFxuICBvYnNlcnZlUHJvY2VzcyxcbiAgQ09NTU9OX0JJTkFSWV9QQVRIUyxcbiAgX190ZXN0X186IHtcbiAgICBEQVJXSU5fUEFUSF9IRUxQRVJfUkVHRVhQLFxuICB9LFxufTtcbiJdfQ==