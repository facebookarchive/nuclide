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
    (function () {
      var paths = execEnv.PATH.split(_path2['default'].delimiter);
      commonBinaryPaths.forEach(function (commonBinaryPath) {
        if (paths.indexOf(commonBinaryPath) === -1) {
          paths.push(commonBinaryPath);
        }
      });
      execEnv.PATH = paths.join(_path2['default'].delimiter);
    })();
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
}

/**
 * Takes the command and args that you would normally pass to `spawn()` and returns `newArgs` such
 * that you should call it with `spawn('script', newArgs)` to run the original command/args pair
 * under `script`.
 */
);

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

var _eventKit = require('event-kit');

var _rx = require('rx');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _shellQuote = require('shell-quote');

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
    var stream = process[streamName];
    if (stream == null) {
      return;
    }
    stream.on('error', function (error) {
      // This can happen without the full execution of the command to fail,
      // but we want to learn about it.
      logError('stream error on stream ' + streamName + ' with command:', command, args, options, 'error:', error);
    });
  });
}function createArgsForScriptCommand(command) {
  var args = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

  if (process.platform === 'darwin') {
    // On OS X, script takes the program to run and its arguments as varargs at the end.
    return ['-q', '/dev/null', command].concat(args);
  } else {
    // On Linux, script takes the command to run as the -c parameter.
    var allArgs = [command].concat(args);
    return ['-q', '/dev/null', '-c', (0, _shellQuote.quote)(allArgs)];
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

/**
 * Creates an observable with the following properties:
 *
 * 1. It contains a process that's created using the provided factory upon subscription.
 * 2. It doesn't complete until the process exits (or errors).
 * 3. The process is killed when there are no more subscribers.
 */
function _createProcessStream(createProcess, throwOnError) {
  return _rx.Observable.create(function (observer) {
    var promise = Promise.resolve(createProcess());
    var process = undefined;
    var disposed = false;
    var exited = false;
    var maybeKill = function maybeKill() {
      if (process != null && disposed && !exited) {
        process.kill();
        process = null;
      }
    };

    promise.then(function (p) {
      process = p;
      maybeKill();
    });

    var processStream = _rx.Observable.fromPromise(promise);

    var errors = throwOnError ? processStream.flatMapLatest(function (p) {
      return _rx.Observable.fromEvent(p, 'error').flatMap(function (err) {
        return _rx.Observable['throw'](err);
      });
    }) : _rx.Observable.empty();

    var exit = processStream.flatMap(function (p) {
      return _rx.Observable.fromEvent(p, 'exit', function (code, signal) {
        return signal;
      });
    })
    // An exit signal from SIGUSR1 doesn't actually exit the process, so skip that.
    .filter(function (signal) {
      return signal !== 'SIGUSR1';
    }).tap(function () {
      exited = true;
    });

    return new _eventKit.CompositeDisposable(
    // A version of processStream that never completes...
    _rx.Observable.merge(processStream, _rx.Observable.create(function () {})).merge(errors)
    // ...which we take until the process exits.
    .takeUntil(exit).subscribe(observer), new _eventKit.Disposable(function () {
      disposed = true;maybeKill();
    }));
  });
  // TODO: We should really `.share()` this observable, but there seem to be issues with that and
  //   `.retry()` in Rx 3 and 4. Once we upgrade to Rx5, we should share this observable and verify
  //   that our retry logic (e.g. in adb-logcat) works.
}

function createProcessStream(createProcess) {
  return _createProcessStream(createProcess, true);
}

/**
 * Observe the stdout, stderr and exit code of a process.
 * stdout and stderr are split by newlines.
 */
function observeProcessExit(createProcess) {
  return _createProcessStream(createProcess, false).flatMap(function (process) {
    return _rx.Observable.fromEvent(process, 'exit').take(1);
  });
}

function getOutputStream(childProcess) {
  return _rx.Observable.fromPromise(Promise.resolve(childProcess)).flatMap(function (process) {
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
 * Observe the stdout, stderr and exit code of a process.
 */
function observeProcess(createProcess) {
  return _createProcessStream(createProcess, false).flatMap(getOutputStream);
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
  createProcessStream: createProcessStream,
  checkOutput: checkOutput,
  forkWithExecEnvironment: forkWithExecEnvironment,
  getOutputStream: getOutputStream,
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
//# sourceMappingURL=data:application/json;base64,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QUF2Qix1QkFBdUI7QUFDdkIsaUJBQWUsRUFBZixlQUFlO0FBQ2YsV0FBUyxFQUFULFNBQVM7QUFDVCxpQkFBZSxFQUFmLGVBQWU7QUFDZixpQ0FBK0IsRUFBL0IsK0JBQStCO0FBQy9CLHVCQUFxQixFQUFyQixxQkFBcUI7QUFDckIsb0JBQWtCLEVBQWxCLGtCQUFrQjtBQUNsQixnQkFBYyxFQUFkLGNBQWM7QUFDZCxxQkFBbUIsRUFBbkIsbUJBQW1CO0FBQ25CLFVBQVEsRUFBRTtBQUNSLDZCQUF5QixFQUF6Qix5QkFBeUI7R0FDMUI7Q0FDRixDQUFDIiwiZmlsZSI6InByb2Nlc3MuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge1xuICBleGVjRmlsZSxcbiAgZm9yayxcbiAgc3Bhd24sXG59IGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQge1Byb21pc2VRdWV1ZX0gZnJvbSAnLi9Qcm9taXNlRXhlY3V0b3JzJztcblxuaW1wb3J0IHR5cGUge09ic2VydmVyfSBmcm9tICdyeCc7XG5pbXBvcnQgdHlwZSB7UHJvY2Vzc01lc3NhZ2UsIHByb2Nlc3MkYXN5bmNFeGVjdXRlUmV0fSBmcm9tICcuLic7XG5cbmltcG9ydCB7b2JzZXJ2ZVN0cmVhbSwgc3BsaXRTdHJlYW19IGZyb20gJy4vc3RyZWFtJztcbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZSwgRGlzcG9zYWJsZX0gZnJvbSAnZXZlbnQta2l0JztcbmltcG9ydCB7T2JzZXJ2YWJsZX0gZnJvbSAncngnO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHtxdW90ZX0gZnJvbSAnc2hlbGwtcXVvdGUnO1xuXG5sZXQgcGxhdGZvcm1QYXRoUHJvbWlzZTogP1Byb21pc2U8c3RyaW5nPjtcblxuY29uc3QgYmxvY2tpbmdRdWV1ZXMgPSB7fTtcbmNvbnN0IENPTU1PTl9CSU5BUllfUEFUSFMgPSBbJy91c3IvYmluJywgJy9iaW4nLCAnL3Vzci9zYmluJywgJy9zYmluJywgJy91c3IvbG9jYWwvYmluJ107XG5cbi8qKlxuICogQ2FwdHVyZXMgdGhlIHZhbHVlIG9mIHRoZSBQQVRIIGVudiB2YXJpYWJsZSByZXR1cm5lZCBieSBEYXJ3aW4ncyAoT1MgWCkgYHBhdGhfaGVscGVyYCB1dGlsaXR5LlxuICogYHBhdGhfaGVscGVyIC1zYCdzIHJldHVybiB2YWx1ZSBsb29rcyBsaWtlIHRoaXM6XG4gKlxuICogICAgIFBBVEg9XCIvdXNyL2JpblwiOyBleHBvcnQgUEFUSDtcbiAqL1xuY29uc3QgREFSV0lOX1BBVEhfSEVMUEVSX1JFR0VYUCA9IC9QQVRIPVxcXCIoW15cXFwiXSspXFxcIi87XG5cbmNvbnN0IFNUUkVBTV9OQU1FUyA9IFsnc3RkaW4nLCAnc3Rkb3V0JywgJ3N0ZGVyciddO1xuXG5mdW5jdGlvbiBnZXRQbGF0Zm9ybVBhdGgoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgLy8gRG8gbm90IHJldHVybiB0aGUgY2FjaGVkIHZhbHVlIGlmIHdlIGFyZSBleGVjdXRpbmcgdW5kZXIgdGhlIHRlc3QgcnVubmVyLlxuICBpZiAocGxhdGZvcm1QYXRoUHJvbWlzZSAmJiBwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Rlc3QnKSB7XG4gICAgLy8gUGF0aCBpcyBiZWluZyBmZXRjaGVkLCBhd2FpdCB0aGUgUHJvbWlzZSB0aGF0J3MgaW4gZmxpZ2h0LlxuICAgIHJldHVybiBwbGF0Zm9ybVBhdGhQcm9taXNlO1xuICB9XG5cbiAgLy8gV2UgZG8gbm90IGNhY2hlIHRoZSByZXN1bHQgb2YgdGhpcyBjaGVjayBiZWNhdXNlIHdlIGhhdmUgdW5pdCB0ZXN0cyB0aGF0IHRlbXBvcmFyaWx5IHJlZGVmaW5lXG4gIC8vIHRoZSB2YWx1ZSBvZiBwcm9jZXNzLnBsYXRmb3JtLlxuICBpZiAocHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ2RhcndpbicpIHtcbiAgICAvLyBPUyBYIGFwcHMgZG9uJ3QgaW5oZXJpdCBQQVRIIHdoZW4gbm90IGxhdW5jaGVkIGZyb20gdGhlIENMSSwgc28gcmVjb25zdHJ1Y3QgaXQuIFRoaXMgaXMgYVxuICAgIC8vIGJ1ZywgZmlsZWQgYWdhaW5zdCBBdG9tIExpbnRlciBoZXJlOiBodHRwczovL2dpdGh1Yi5jb20vQXRvbUxpbnRlci9MaW50ZXIvaXNzdWVzLzE1MFxuICAgIC8vIFRPRE8oamppYWEpOiByZW1vdmUgdGhpcyBoYWNrIHdoZW4gdGhlIEF0b20gaXNzdWUgaXMgY2xvc2VkXG4gICAgcGxhdGZvcm1QYXRoUHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGV4ZWNGaWxlKCcvdXNyL2xpYmV4ZWMvcGF0aF9oZWxwZXInLCBbJy1zJ10sIChlcnJvciwgc3Rkb3V0LCBzdGRlcnIpID0+IHtcbiAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCBtYXRjaCA9IHN0ZG91dC5tYXRjaChEQVJXSU5fUEFUSF9IRUxQRVJfUkVHRVhQKTtcbiAgICAgICAgICByZXNvbHZlKChtYXRjaCAmJiBtYXRjaC5sZW5ndGggPiAxKSA/IG1hdGNoWzFdIDogJycpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICBwbGF0Zm9ybVBhdGhQcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKCcnKTtcbiAgfVxuXG4gIHJldHVybiBwbGF0Zm9ybVBhdGhQcm9taXNlO1xufVxuXG4vKipcbiAqIFNpbmNlIE9TIFggYXBwcyBkb24ndCBpbmhlcml0IFBBVEggd2hlbiBub3QgbGF1bmNoZWQgZnJvbSB0aGUgQ0xJLCB0aGlzIGZ1bmN0aW9uIGNyZWF0ZXMgYSBuZXdcbiAqIGVudmlyb25tZW50IG9iamVjdCBnaXZlbiB0aGUgb3JpZ2luYWwgZW52aXJvbm1lbnQgYnkgbW9kaWZ5aW5nIHRoZSBlbnYuUEFUSCB1c2luZyBmb2xsb3dpbmdcbiAqIGxvZ2ljOlxuICogIDEpIElmIG9yaWdpbmFsRW52LlBBVEggZG9lc24ndCBlcXVhbCB0byBwcm9jZXNzLmVudi5QQVRILCB3aGljaCBtZWFucyB0aGUgUEFUSCBoYXMgYmVlblxuICogICAgbW9kaWZpZWQsIHdlIHNob3VsZG4ndCBkbyBhbnl0aGluZy5cbiAqICAxKSBJZiB3ZSBhcmUgcnVubmluZyBpbiBPUyBYLCB1c2UgYC91c3IvbGliZXhlYy9wYXRoX2hlbHBlciAtc2AgdG8gZ2V0IHRoZSBjb3JyZWN0IFBBVEggYW5kXG4gKiAgICBSRVBMQUNFIHRoZSBQQVRILlxuICogIDIpIElmIHN0ZXAgMSBmYWlsZWQgb3Igd2UgYXJlIG5vdCBydW5uaW5nIGluIE9TIFgsIEFQUEVORCBjb21tb25CaW5hcnlQYXRocyB0byBjdXJyZW50IFBBVEguXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGNyZWF0ZUV4ZWNFbnZpcm9ubWVudChcbiAgb3JpZ2luYWxFbnY6IE9iamVjdCxcbiAgY29tbW9uQmluYXJ5UGF0aHM6IEFycmF5PHN0cmluZz4sXG4pOiBQcm9taXNlPE9iamVjdD4ge1xuICBjb25zdCBleGVjRW52ID0gey4uLm9yaWdpbmFsRW52fTtcblxuICBpZiAoZXhlY0Vudi5QQVRIICE9PSBwcm9jZXNzLmVudi5QQVRIKSB7XG4gICAgcmV0dXJuIGV4ZWNFbnY7XG4gIH1cblxuICBleGVjRW52LlBBVEggPSBleGVjRW52LlBBVEggfHwgJyc7XG5cbiAgbGV0IHBsYXRmb3JtUGF0aCA9IG51bGw7XG4gIHRyeSB7XG4gICAgcGxhdGZvcm1QYXRoID0gYXdhaXQgZ2V0UGxhdGZvcm1QYXRoKCk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgbG9nRXJyb3IoJ0ZhaWxlZCB0byBnZXRQbGF0Zm9ybVBhdGgnLCBlcnJvcik7XG4gIH1cblxuICAvLyBJZiB0aGUgcGxhdGZvcm0gcmV0dXJucyBhIG5vbi1lbXB0eSBQQVRILCB1c2UgaXQuIE90aGVyd2lzZSB1c2UgdGhlIGRlZmF1bHQgc2V0IG9mIGNvbW1vblxuICAvLyBiaW5hcnkgcGF0aHMuXG4gIGlmIChwbGF0Zm9ybVBhdGgpIHtcbiAgICBleGVjRW52LlBBVEggPSBwbGF0Zm9ybVBhdGg7XG4gIH0gZWxzZSBpZiAoY29tbW9uQmluYXJ5UGF0aHMubGVuZ3RoKSB7XG4gICAgY29uc3QgcGF0aHMgPSBleGVjRW52LlBBVEguc3BsaXQocGF0aC5kZWxpbWl0ZXIpO1xuICAgIGNvbW1vbkJpbmFyeVBhdGhzLmZvckVhY2goY29tbW9uQmluYXJ5UGF0aCA9PiB7XG4gICAgICBpZiAocGF0aHMuaW5kZXhPZihjb21tb25CaW5hcnlQYXRoKSA9PT0gLTEpIHtcbiAgICAgICAgcGF0aHMucHVzaChjb21tb25CaW5hcnlQYXRoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBleGVjRW52LlBBVEggPSBwYXRocy5qb2luKHBhdGguZGVsaW1pdGVyKTtcbiAgfVxuXG4gIHJldHVybiBleGVjRW52O1xufVxuXG5mdW5jdGlvbiBsb2dFcnJvciguLi5hcmdzKSB7XG4gIC8vIENhbid0IHVzZSBudWNsaWRlLWxvZ2dpbmcgaGVyZSB0byBub3QgY2F1c2UgY3ljbGUgZGVwZW5kZW5jeS5cbiAgLyplc2xpbnQtZGlzYWJsZSBuby1jb25zb2xlKi9cbiAgY29uc29sZS5lcnJvciguLi5hcmdzKTtcbiAgLyplc2xpbnQtZW5hYmxlIG5vLWNvbnNvbGUqL1xufVxuXG5mdW5jdGlvbiBtb25pdG9yU3RyZWFtRXJyb3JzKHByb2Nlc3M6IGNoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzLCBjb21tYW5kLCBhcmdzLCBvcHRpb25zKTogdm9pZCB7XG4gIFNUUkVBTV9OQU1FUy5mb3JFYWNoKHN0cmVhbU5hbWUgPT4ge1xuICAgIC8vICRGbG93SXNzdWVcbiAgICBjb25zdCBzdHJlYW0gPSBwcm9jZXNzW3N0cmVhbU5hbWVdO1xuICAgIGlmIChzdHJlYW0gPT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBzdHJlYW0ub24oJ2Vycm9yJywgZXJyb3IgPT4ge1xuICAgICAgLy8gVGhpcyBjYW4gaGFwcGVuIHdpdGhvdXQgdGhlIGZ1bGwgZXhlY3V0aW9uIG9mIHRoZSBjb21tYW5kIHRvIGZhaWwsXG4gICAgICAvLyBidXQgd2Ugd2FudCB0byBsZWFybiBhYm91dCBpdC5cbiAgICAgIGxvZ0Vycm9yKFxuICAgICAgICBgc3RyZWFtIGVycm9yIG9uIHN0cmVhbSAke3N0cmVhbU5hbWV9IHdpdGggY29tbWFuZDpgLFxuICAgICAgICBjb21tYW5kLFxuICAgICAgICBhcmdzLFxuICAgICAgICBvcHRpb25zLFxuICAgICAgICAnZXJyb3I6JyxcbiAgICAgICAgZXJyb3IsXG4gICAgICApO1xuICAgIH0pO1xuICB9KTtcbn1cblxuLyoqXG4gKiBCYXNpY2FsbHkgbGlrZSBzcGF3biwgZXhjZXB0IGl0IGhhbmRsZXMgYW5kIGxvZ3MgZXJyb3JzIGluc3RlYWQgb2YgY3Jhc2hpbmdcbiAqIHRoZSBwcm9jZXNzLiBUaGlzIGlzIG11Y2ggbG93ZXItbGV2ZWwgdGhhbiBhc3luY0V4ZWN1dGUuIFVubGVzcyB5b3UgaGF2ZSBhXG4gKiBzcGVjaWZpYyByZWFzb24geW91IHNob3VsZCB1c2UgYXN5bmNFeGVjdXRlIGluc3RlYWQuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIHNhZmVTcGF3bihcbiAgY29tbWFuZDogc3RyaW5nLFxuICBhcmdzPzogQXJyYXk8c3RyaW5nPiA9IFtdLFxuICBvcHRpb25zPzogT2JqZWN0ID0ge30sXG4pOiBQcm9taXNlPGNoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzPiB7XG4gIG9wdGlvbnMuZW52ID0gYXdhaXQgY3JlYXRlRXhlY0Vudmlyb25tZW50KG9wdGlvbnMuZW52IHx8IHByb2Nlc3MuZW52LCBDT01NT05fQklOQVJZX1BBVEhTKTtcbiAgY29uc3QgY2hpbGQgPSBzcGF3bihjb21tYW5kLCBhcmdzLCBvcHRpb25zKTtcbiAgbW9uaXRvclN0cmVhbUVycm9ycyhjaGlsZCwgY29tbWFuZCwgYXJncywgb3B0aW9ucyk7XG4gIGNoaWxkLm9uKCdlcnJvcicsIGVycm9yID0+IHtcbiAgICBsb2dFcnJvcignZXJyb3Igd2l0aCBjb21tYW5kOicsIGNvbW1hbmQsIGFyZ3MsIG9wdGlvbnMsICdlcnJvcjonLCBlcnJvcik7XG4gIH0pO1xuICByZXR1cm4gY2hpbGQ7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGZvcmtXaXRoRXhlY0Vudmlyb25tZW50KFxuICBtb2R1bGVQYXRoOiBzdHJpbmcsXG4gIGFyZ3M/OiBBcnJheTxzdHJpbmc+ID0gW10sXG4gIG9wdGlvbnM/OiBPYmplY3QgPSB7fSxcbik6IFByb21pc2U8Y2hpbGRfcHJvY2VzcyRDaGlsZFByb2Nlc3M+IHtcbiAgY29uc3QgZm9ya09wdGlvbnMgPSB7XG4gICAgLi4ub3B0aW9ucyxcbiAgICBlbnY6IGF3YWl0IGNyZWF0ZUV4ZWNFbnZpcm9ubWVudChvcHRpb25zLmVudiB8fCBwcm9jZXNzLmVudiwgQ09NTU9OX0JJTkFSWV9QQVRIUyksXG4gIH07XG4gIGNvbnN0IGNoaWxkID0gZm9yayhtb2R1bGVQYXRoLCBhcmdzLCBmb3JrT3B0aW9ucyk7XG4gIGNoaWxkLm9uKCdlcnJvcicsIGVycm9yID0+IHtcbiAgICBsb2dFcnJvcignZXJyb3IgZnJvbSBtb2R1bGU6JywgbW9kdWxlUGF0aCwgYXJncywgb3B0aW9ucywgJ2Vycm9yOicsIGVycm9yKTtcbiAgfSk7XG4gIHJldHVybiBjaGlsZDtcbn1cblxuLyoqXG4gKiBUYWtlcyB0aGUgY29tbWFuZCBhbmQgYXJncyB0aGF0IHlvdSB3b3VsZCBub3JtYWxseSBwYXNzIHRvIGBzcGF3bigpYCBhbmQgcmV0dXJucyBgbmV3QXJnc2Agc3VjaFxuICogdGhhdCB5b3Ugc2hvdWxkIGNhbGwgaXQgd2l0aCBgc3Bhd24oJ3NjcmlwdCcsIG5ld0FyZ3MpYCB0byBydW4gdGhlIG9yaWdpbmFsIGNvbW1hbmQvYXJncyBwYWlyXG4gKiB1bmRlciBgc2NyaXB0YC5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlQXJnc0ZvclNjcmlwdENvbW1hbmQoY29tbWFuZDogc3RyaW5nLCBhcmdzPzogQXJyYXk8c3RyaW5nPiA9IFtdKTogQXJyYXk8c3RyaW5nPiB7XG4gIGlmIChwcm9jZXNzLnBsYXRmb3JtID09PSAnZGFyd2luJykge1xuICAgIC8vIE9uIE9TIFgsIHNjcmlwdCB0YWtlcyB0aGUgcHJvZ3JhbSB0byBydW4gYW5kIGl0cyBhcmd1bWVudHMgYXMgdmFyYXJncyBhdCB0aGUgZW5kLlxuICAgIHJldHVybiBbJy1xJywgJy9kZXYvbnVsbCcsIGNvbW1hbmRdLmNvbmNhdChhcmdzKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBPbiBMaW51eCwgc2NyaXB0IHRha2VzIHRoZSBjb21tYW5kIHRvIHJ1biBhcyB0aGUgLWMgcGFyYW1ldGVyLlxuICAgIGNvbnN0IGFsbEFyZ3MgPSBbY29tbWFuZF0uY29uY2F0KGFyZ3MpO1xuICAgIHJldHVybiBbJy1xJywgJy9kZXYvbnVsbCcsICctYycsIHF1b3RlKGFsbEFyZ3MpXTtcbiAgfVxufVxuXG4vKipcbiAqIEJhc2ljYWxseSBsaWtlIHNhZmVTcGF3biwgYnV0IHJ1bnMgdGhlIGNvbW1hbmQgd2l0aCB0aGUgYHNjcmlwdGAgY29tbWFuZC5cbiAqIGBzY3JpcHRgIGVuc3VyZXMgdGVybWluYWwtbGlrZSBlbnZpcm9ubWVudCBhbmQgY29tbWFuZHMgd2UgcnVuIGdpdmUgY29sb3JlZCBvdXRwdXQuXG4gKi9cbmZ1bmN0aW9uIHNjcmlwdFNhZmVTcGF3bihcbiAgY29tbWFuZDogc3RyaW5nLFxuICBhcmdzPzogQXJyYXk8c3RyaW5nPiA9IFtdLFxuICBvcHRpb25zPzogT2JqZWN0ID0ge30sXG4pOiBQcm9taXNlPGNoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzPiB7XG4gIGNvbnN0IG5ld0FyZ3MgPSBjcmVhdGVBcmdzRm9yU2NyaXB0Q29tbWFuZChjb21tYW5kLCBhcmdzKTtcbiAgcmV0dXJuIHNhZmVTcGF3bignc2NyaXB0JywgbmV3QXJncywgb3B0aW9ucyk7XG59XG5cbi8qKlxuICogV3JhcHMgc2NyaXB0U2FmZVNwYXduIHdpdGggYW4gT2JzZXJ2YWJsZSB0aGF0IGxldHMgeW91IGxpc3RlbiB0byB0aGUgc3Rkb3V0IGFuZFxuICogc3RkZXJyIG9mIHRoZSBzcGF3bmVkIHByb2Nlc3MuXG4gKi9cbmZ1bmN0aW9uIHNjcmlwdFNhZmVTcGF3bkFuZE9ic2VydmVPdXRwdXQoXG4gIGNvbW1hbmQ6IHN0cmluZyxcbiAgYXJncz86IEFycmF5PHN0cmluZz4gPSBbXSxcbiAgb3B0aW9ucz86IE9iamVjdCA9IHt9LFxuKTogT2JzZXJ2YWJsZTx7c3RkZXJyPzogc3RyaW5nOyBzdGRvdXQ/OiBzdHJpbmc7fT4ge1xuICByZXR1cm4gT2JzZXJ2YWJsZS5jcmVhdGUoKG9ic2VydmVyOiBPYnNlcnZlcikgPT4ge1xuICAgIGxldCBjaGlsZFByb2Nlc3M7XG4gICAgc2NyaXB0U2FmZVNwYXduKGNvbW1hbmQsIGFyZ3MsIG9wdGlvbnMpLnRoZW4ocHJvYyA9PiB7XG4gICAgICBjaGlsZFByb2Nlc3MgPSBwcm9jO1xuXG4gICAgICBjaGlsZFByb2Nlc3Muc3Rkb3V0Lm9uKCdkYXRhJywgZGF0YSA9PiB7XG4gICAgICAgIG9ic2VydmVyLm9uTmV4dCh7c3Rkb3V0OiBkYXRhLnRvU3RyaW5nKCl9KTtcbiAgICAgIH0pO1xuXG4gICAgICBsZXQgc3RkZXJyID0gJyc7XG4gICAgICBjaGlsZFByb2Nlc3Muc3RkZXJyLm9uKCdkYXRhJywgZGF0YSA9PiB7XG4gICAgICAgIHN0ZGVyciArPSBkYXRhO1xuICAgICAgICBvYnNlcnZlci5vbk5leHQoe3N0ZGVycjogZGF0YS50b1N0cmluZygpfSk7XG4gICAgICB9KTtcblxuICAgICAgY2hpbGRQcm9jZXNzLm9uKCdleGl0JywgKGV4aXRDb2RlOiBudW1iZXIpID0+IHtcbiAgICAgICAgaWYgKGV4aXRDb2RlICE9PSAwKSB7XG4gICAgICAgICAgb2JzZXJ2ZXIub25FcnJvcihzdGRlcnIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG9ic2VydmVyLm9uQ29tcGxldGVkKCk7XG4gICAgICAgIH1cbiAgICAgICAgY2hpbGRQcm9jZXNzID0gbnVsbDtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGlmIChjaGlsZFByb2Nlc3MpIHtcbiAgICAgICAgY2hpbGRQcm9jZXNzLmtpbGwoKTtcbiAgICAgIH1cbiAgICB9O1xuICB9KTtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGFuIG9ic2VydmFibGUgd2l0aCB0aGUgZm9sbG93aW5nIHByb3BlcnRpZXM6XG4gKlxuICogMS4gSXQgY29udGFpbnMgYSBwcm9jZXNzIHRoYXQncyBjcmVhdGVkIHVzaW5nIHRoZSBwcm92aWRlZCBmYWN0b3J5IHVwb24gc3Vic2NyaXB0aW9uLlxuICogMi4gSXQgZG9lc24ndCBjb21wbGV0ZSB1bnRpbCB0aGUgcHJvY2VzcyBleGl0cyAob3IgZXJyb3JzKS5cbiAqIDMuIFRoZSBwcm9jZXNzIGlzIGtpbGxlZCB3aGVuIHRoZXJlIGFyZSBubyBtb3JlIHN1YnNjcmliZXJzLlxuICovXG5mdW5jdGlvbiBfY3JlYXRlUHJvY2Vzc1N0cmVhbShcbiAgY3JlYXRlUHJvY2VzczogKCkgPT4gY2hpbGRfcHJvY2VzcyRDaGlsZFByb2Nlc3MgfCBQcm9taXNlPGNoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzPixcbiAgdGhyb3dPbkVycm9yOiBib29sZWFuLFxuKTogT2JzZXJ2YWJsZTxjaGlsZF9wcm9jZXNzJENoaWxkUHJvY2Vzcz4ge1xuICByZXR1cm4gT2JzZXJ2YWJsZS5jcmVhdGUob2JzZXJ2ZXIgPT4ge1xuICAgIGNvbnN0IHByb21pc2UgPSBQcm9taXNlLnJlc29sdmUoY3JlYXRlUHJvY2VzcygpKTtcbiAgICBsZXQgcHJvY2VzcztcbiAgICBsZXQgZGlzcG9zZWQgPSBmYWxzZTtcbiAgICBsZXQgZXhpdGVkID0gZmFsc2U7XG4gICAgY29uc3QgbWF5YmVLaWxsID0gKCkgPT4ge1xuICAgICAgaWYgKHByb2Nlc3MgIT0gbnVsbCAmJiBkaXNwb3NlZCAmJiAhZXhpdGVkKSB7XG4gICAgICAgIHByb2Nlc3Mua2lsbCgpO1xuICAgICAgICBwcm9jZXNzID0gbnVsbDtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJvbWlzZS50aGVuKHAgPT4ge1xuICAgICAgcHJvY2VzcyA9IHA7XG4gICAgICBtYXliZUtpbGwoKTtcbiAgICB9KTtcblxuICAgIGNvbnN0IHByb2Nlc3NTdHJlYW0gPSBPYnNlcnZhYmxlLmZyb21Qcm9taXNlKHByb21pc2UpO1xuXG4gICAgY29uc3QgZXJyb3JzID0gdGhyb3dPbkVycm9yXG4gICAgICA/IHByb2Nlc3NTdHJlYW0uZmxhdE1hcExhdGVzdChwID0+IChcbiAgICAgICAgT2JzZXJ2YWJsZS5mcm9tRXZlbnQocCwgJ2Vycm9yJykuZmxhdE1hcChlcnIgPT4gT2JzZXJ2YWJsZS50aHJvdyhlcnIpKVxuICAgICAgKSlcbiAgICAgIDogT2JzZXJ2YWJsZS5lbXB0eSgpO1xuXG4gICAgY29uc3QgZXhpdCA9IHByb2Nlc3NTdHJlYW1cbiAgICAgIC5mbGF0TWFwKHAgPT4gT2JzZXJ2YWJsZS5mcm9tRXZlbnQocCwgJ2V4aXQnLCAoY29kZSwgc2lnbmFsKSA9PiBzaWduYWwpKVxuICAgICAgLy8gQW4gZXhpdCBzaWduYWwgZnJvbSBTSUdVU1IxIGRvZXNuJ3QgYWN0dWFsbHkgZXhpdCB0aGUgcHJvY2Vzcywgc28gc2tpcCB0aGF0LlxuICAgICAgLmZpbHRlcihzaWduYWwgPT4gc2lnbmFsICE9PSAnU0lHVVNSMScpXG4gICAgICAudGFwKCgpID0+IHsgZXhpdGVkID0gdHJ1ZTsgfSk7XG5cbiAgICByZXR1cm4gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoXG4gICAgICAvLyBBIHZlcnNpb24gb2YgcHJvY2Vzc1N0cmVhbSB0aGF0IG5ldmVyIGNvbXBsZXRlcy4uLlxuICAgICAgT2JzZXJ2YWJsZS5tZXJnZShwcm9jZXNzU3RyZWFtLCBPYnNlcnZhYmxlLmNyZWF0ZSgoKSA9PiB7fSkpXG4gICAgICAgIC5tZXJnZShlcnJvcnMpXG4gICAgICAgIC8vIC4uLndoaWNoIHdlIHRha2UgdW50aWwgdGhlIHByb2Nlc3MgZXhpdHMuXG4gICAgICAgIC50YWtlVW50aWwoZXhpdClcbiAgICAgICAgLnN1YnNjcmliZShvYnNlcnZlciksXG4gICAgICBuZXcgRGlzcG9zYWJsZSgoKSA9PiB7IGRpc3Bvc2VkID0gdHJ1ZTsgbWF5YmVLaWxsKCk7IH0pLFxuICAgICk7XG4gIH0pO1xuICAvLyBUT0RPOiBXZSBzaG91bGQgcmVhbGx5IGAuc2hhcmUoKWAgdGhpcyBvYnNlcnZhYmxlLCBidXQgdGhlcmUgc2VlbSB0byBiZSBpc3N1ZXMgd2l0aCB0aGF0IGFuZFxuICAvLyAgIGAucmV0cnkoKWAgaW4gUnggMyBhbmQgNC4gT25jZSB3ZSB1cGdyYWRlIHRvIFJ4NSwgd2Ugc2hvdWxkIHNoYXJlIHRoaXMgb2JzZXJ2YWJsZSBhbmQgdmVyaWZ5XG4gIC8vICAgdGhhdCBvdXIgcmV0cnkgbG9naWMgKGUuZy4gaW4gYWRiLWxvZ2NhdCkgd29ya3MuXG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVByb2Nlc3NTdHJlYW0oXG4gIGNyZWF0ZVByb2Nlc3M6ICgpID0+IGNoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzIHwgUHJvbWlzZTxjaGlsZF9wcm9jZXNzJENoaWxkUHJvY2Vzcz4sXG4pOiBPYnNlcnZhYmxlPGNoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzPiB7XG4gIHJldHVybiBfY3JlYXRlUHJvY2Vzc1N0cmVhbShjcmVhdGVQcm9jZXNzLCB0cnVlKTtcbn1cblxuLyoqXG4gKiBPYnNlcnZlIHRoZSBzdGRvdXQsIHN0ZGVyciBhbmQgZXhpdCBjb2RlIG9mIGEgcHJvY2Vzcy5cbiAqIHN0ZG91dCBhbmQgc3RkZXJyIGFyZSBzcGxpdCBieSBuZXdsaW5lcy5cbiAqL1xuZnVuY3Rpb24gb2JzZXJ2ZVByb2Nlc3NFeGl0KFxuICBjcmVhdGVQcm9jZXNzOiAoKSA9PiBjaGlsZF9wcm9jZXNzJENoaWxkUHJvY2VzcyB8IFByb21pc2U8Y2hpbGRfcHJvY2VzcyRDaGlsZFByb2Nlc3M+LFxuKTogT2JzZXJ2YWJsZTxudW1iZXI+IHtcbiAgcmV0dXJuIF9jcmVhdGVQcm9jZXNzU3RyZWFtKGNyZWF0ZVByb2Nlc3MsIGZhbHNlKVxuICAgIC5mbGF0TWFwKHByb2Nlc3MgPT4gT2JzZXJ2YWJsZS5mcm9tRXZlbnQocHJvY2VzcywgJ2V4aXQnKS50YWtlKDEpKTtcbn1cblxuZnVuY3Rpb24gZ2V0T3V0cHV0U3RyZWFtKFxuICBjaGlsZFByb2Nlc3M6IGNoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzIHwgUHJvbWlzZTxjaGlsZF9wcm9jZXNzJENoaWxkUHJvY2Vzcz4sXG4pOiBPYnNlcnZhYmxlPFByb2Nlc3NNZXNzYWdlPiB7XG4gIHJldHVybiBPYnNlcnZhYmxlLmZyb21Qcm9taXNlKFByb21pc2UucmVzb2x2ZShjaGlsZFByb2Nlc3MpKVxuICAgIC5mbGF0TWFwKHByb2Nlc3MgPT4ge1xuICAgICAgaW52YXJpYW50KHByb2Nlc3MgIT0gbnVsbCwgJ3Byb2Nlc3MgaGFzIG5vdCB5ZXQgYmVlbiBkaXNwb3NlZCcpO1xuICAgICAgLy8gVXNlIHJlcGxheS9jb25uZWN0IG9uIGV4aXQgZm9yIHRoZSBmaW5hbCBjb25jYXQuXG4gICAgICAvLyBCeSBkZWZhdWx0IGNvbmNhdCBkZWZlcnMgc3Vic2NyaXB0aW9uIHVudGlsIGFmdGVyIHRoZSBMSFMgY29tcGxldGVzLlxuICAgICAgY29uc3QgZXhpdCA9IE9ic2VydmFibGUuZnJvbUV2ZW50KHByb2Nlc3MsICdleGl0JykudGFrZSgxKS5cbiAgICAgICAgbWFwKGV4aXRDb2RlID0+ICh7a2luZDogJ2V4aXQnLCBleGl0Q29kZX0pKS5yZXBsYXkoKTtcbiAgICAgIGV4aXQuY29ubmVjdCgpO1xuICAgICAgY29uc3QgZXJyb3IgPSBPYnNlcnZhYmxlLmZyb21FdmVudChwcm9jZXNzLCAnZXJyb3InKS5cbiAgICAgICAgdGFrZVVudGlsKGV4aXQpLlxuICAgICAgICBtYXAoZXJyb3JPYmogPT4gKHtraW5kOiAnZXJyb3InLCBlcnJvcjogZXJyb3JPYmp9KSk7XG4gICAgICBjb25zdCBzdGRvdXQgPSBzcGxpdFN0cmVhbShvYnNlcnZlU3RyZWFtKHByb2Nlc3Muc3Rkb3V0KSkuXG4gICAgICAgIG1hcChkYXRhID0+ICh7a2luZDogJ3N0ZG91dCcsIGRhdGF9KSk7XG4gICAgICBjb25zdCBzdGRlcnIgPSBzcGxpdFN0cmVhbShvYnNlcnZlU3RyZWFtKHByb2Nlc3Muc3RkZXJyKSkuXG4gICAgICAgIG1hcChkYXRhID0+ICh7a2luZDogJ3N0ZGVycicsIGRhdGF9KSk7XG4gICAgICByZXR1cm4gc3Rkb3V0Lm1lcmdlKHN0ZGVycikubWVyZ2UoZXJyb3IpLmNvbmNhdChleGl0KTtcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBPYnNlcnZlIHRoZSBzdGRvdXQsIHN0ZGVyciBhbmQgZXhpdCBjb2RlIG9mIGEgcHJvY2Vzcy5cbiAqL1xuZnVuY3Rpb24gb2JzZXJ2ZVByb2Nlc3MoXG4gIGNyZWF0ZVByb2Nlc3M6ICgpID0+IGNoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzIHwgUHJvbWlzZTxjaGlsZF9wcm9jZXNzJENoaWxkUHJvY2Vzcz4sXG4pOiBPYnNlcnZhYmxlPFByb2Nlc3NNZXNzYWdlPiB7XG4gIHJldHVybiBfY3JlYXRlUHJvY2Vzc1N0cmVhbShjcmVhdGVQcm9jZXNzLCBmYWxzZSkuZmxhdE1hcChnZXRPdXRwdXRTdHJlYW0pO1xufVxuXG4vKipcbiAqIFJldHVybnMgYSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgdG8gdGhlIHJlc3VsdCBvZiBleGVjdXRpbmcgYSBwcm9jZXNzLlxuICpcbiAqIEBwYXJhbSBjb21tYW5kIFRoZSBjb21tYW5kIHRvIGV4ZWN1dGUuXG4gKiBAcGFyYW0gYXJncyBUaGUgYXJndW1lbnRzIHRvIHBhc3MgdG8gdGhlIGNvbW1hbmQuXG4gKiBAcGFyYW0gb3B0aW9ucyBPcHRpb25zIGZvciBjaGFuZ2luZyBob3cgdG8gcnVuIHRoZSBjb21tYW5kLlxuICogICAgIFNlZSBoZXJlOiBodHRwOi8vbm9kZWpzLm9yZy9hcGkvY2hpbGRfcHJvY2Vzcy5odG1sXG4gKiAgICAgVGhlIGFkZGl0aW9uYWwgb3B0aW9ucyB3ZSBwcm92aWRlOlxuICogICAgICAgcXVldWVOYW1lIHN0cmluZyBUaGUgcXVldWUgb24gd2hpY2ggdG8gYmxvY2sgZGVwZW5kZW50IGNhbGxzLlxuICogICAgICAgc3RkaW4gc3RyaW5nIFRoZSBjb250ZW50cyB0byB3cml0ZSB0byBzdGRpbi5cbiAqICAgICAgIHBpcGVkQ29tbWFuZCBzdHJpbmcgYSBjb21tYW5kIHRvIHBpcGUgdGhlIG91dHB1dCBvZiBjb21tYW5kIHRocm91Z2guXG4gKiAgICAgICBwaXBlZEFyZ3MgYXJyYXkgb2Ygc3RyaW5ncyBhcyBhcmd1bWVudHMuXG4gKiBAcmV0dXJuIFByb21pc2UgdGhhdCByZXNvbHZlcyB0byBhbiBvYmplY3Qgd2l0aCB0aGUgcHJvcGVydGllczpcbiAqICAgICBzdGRvdXQgc3RyaW5nIFRoZSBjb250ZW50cyBvZiB0aGUgcHJvY2VzcydzIG91dHB1dCBzdHJlYW0uXG4gKiAgICAgc3RkZXJyIHN0cmluZyBUaGUgY29udGVudHMgb2YgdGhlIHByb2Nlc3MncyBlcnJvciBzdHJlYW0uXG4gKiAgICAgZXhpdENvZGUgbnVtYmVyIFRoZSBleGl0IGNvZGUgcmV0dXJuZWQgYnkgdGhlIHByb2Nlc3MuXG4gKi9cbmZ1bmN0aW9uIGNoZWNrT3V0cHV0KFxuICAgIGNvbW1hbmQ6IHN0cmluZyxcbiAgICBhcmdzOiBBcnJheTxzdHJpbmc+LFxuICAgIG9wdGlvbnM6ID9PYmplY3QgPSB7fSk6IFByb21pc2U8cHJvY2VzcyRhc3luY0V4ZWN1dGVSZXQ+IHtcbiAgLy8gQ2xvbmUgcGFzc2VkIGluIG9wdGlvbnMgc28gdGhpcyBmdW5jdGlvbiBkb2Vzbid0IG1vZGlmeSBhbiBvYmplY3QgaXQgZG9lc24ndCBvd24uXG4gIGNvbnN0IGxvY2FsT3B0aW9ucyA9IHsuLi5vcHRpb25zfTtcblxuICBjb25zdCBleGVjdXRvciA9IChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBsZXQgZmlyc3RDaGlsZDtcbiAgICBsZXQgbGFzdENoaWxkO1xuXG4gICAgbGV0IGZpcnN0Q2hpbGRTdGRlcnI7XG4gICAgaWYgKGxvY2FsT3B0aW9ucy5waXBlZENvbW1hbmQpIHtcbiAgICAgIC8vIElmIGEgc2Vjb25kIGNvbW1hbmQgaXMgZ2l2ZW4sIHBpcGUgc3Rkb3V0IG9mIGZpcnN0IHRvIHN0ZGluIG9mIHNlY29uZC4gU3RyaW5nIG91dHB1dFxuICAgICAgLy8gcmV0dXJuZWQgaW4gdGhpcyBmdW5jdGlvbidzIFByb21pc2Ugd2lsbCBiZSBzdGRlcnIvc3Rkb3V0IG9mIHRoZSBzZWNvbmQgY29tbWFuZC5cbiAgICAgIGZpcnN0Q2hpbGQgPSBzcGF3bihjb21tYW5kLCBhcmdzLCBsb2NhbE9wdGlvbnMpO1xuICAgICAgbW9uaXRvclN0cmVhbUVycm9ycyhmaXJzdENoaWxkLCBjb21tYW5kLCBhcmdzLCBsb2NhbE9wdGlvbnMpO1xuICAgICAgZmlyc3RDaGlsZFN0ZGVyciA9ICcnO1xuXG4gICAgICBmaXJzdENoaWxkLm9uKCdlcnJvcicsIGVycm9yID0+IHtcbiAgICAgICAgLy8gUmVqZWN0IGVhcmx5IHdpdGggdGhlIHJlc3VsdCB3aGVuIGVuY291bnRlcmluZyBhbiBlcnJvci5cbiAgICAgICAgcmVqZWN0KHtcbiAgICAgICAgICBjb21tYW5kOiBbY29tbWFuZF0uY29uY2F0KGFyZ3MpLmpvaW4oJyAnKSxcbiAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UsXG4gICAgICAgICAgZXhpdENvZGU6IGVycm9yLmNvZGUsXG4gICAgICAgICAgc3RkZXJyOiBmaXJzdENoaWxkU3RkZXJyLFxuICAgICAgICAgIHN0ZG91dDogJycsXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG5cbiAgICAgIGZpcnN0Q2hpbGQuc3RkZXJyLm9uKCdkYXRhJywgZGF0YSA9PiB7XG4gICAgICAgIGZpcnN0Q2hpbGRTdGRlcnIgKz0gZGF0YTtcbiAgICAgIH0pO1xuXG4gICAgICBsYXN0Q2hpbGQgPSBzcGF3bihsb2NhbE9wdGlvbnMucGlwZWRDb21tYW5kLCBsb2NhbE9wdGlvbnMucGlwZWRBcmdzLCBsb2NhbE9wdGlvbnMpO1xuICAgICAgbW9uaXRvclN0cmVhbUVycm9ycyhsYXN0Q2hpbGQsIGNvbW1hbmQsIGFyZ3MsIGxvY2FsT3B0aW9ucyk7XG4gICAgICAvLyBwaXBlKCkgbm9ybWFsbHkgcGF1c2VzIHRoZSB3cml0ZXIgd2hlbiB0aGUgcmVhZGVyIGVycm9ycyAoY2xvc2VzKS5cbiAgICAgIC8vIFRoaXMgaXMgbm90IGhvdyBVTklYIHBpcGVzIHdvcms6IGlmIHRoZSByZWFkZXIgY2xvc2VzLCB0aGUgd3JpdGVyIG5lZWRzXG4gICAgICAvLyB0byBhbHNvIGNsb3NlIChvdGhlcndpc2UgdGhlIHdyaXRlciBwcm9jZXNzIG1heSBoYW5nLilcbiAgICAgIC8vIFdlIGhhdmUgdG8gbWFudWFsbHkgY2xvc2UgdGhlIHdyaXRlciBpbiB0aGlzIGNhc2UuXG4gICAgICBsYXN0Q2hpbGQuc3RkaW4ub24oJ2Vycm9yJywgKCkgPT4ge1xuICAgICAgICBmaXJzdENoaWxkLnN0ZG91dC5lbWl0KCdlbmQnKTtcbiAgICAgIH0pO1xuICAgICAgZmlyc3RDaGlsZC5zdGRvdXQucGlwZShsYXN0Q2hpbGQuc3RkaW4pO1xuICAgIH0gZWxzZSB7XG4gICAgICBsYXN0Q2hpbGQgPSBzcGF3bihjb21tYW5kLCBhcmdzLCBsb2NhbE9wdGlvbnMpO1xuICAgICAgbW9uaXRvclN0cmVhbUVycm9ycyhsYXN0Q2hpbGQsIGNvbW1hbmQsIGFyZ3MsIGxvY2FsT3B0aW9ucyk7XG4gICAgICBmaXJzdENoaWxkID0gbGFzdENoaWxkO1xuICAgIH1cblxuICAgIGxldCBzdGRlcnIgPSAnJztcbiAgICBsZXQgc3Rkb3V0ID0gJyc7XG4gICAgbGFzdENoaWxkLm9uKCdjbG9zZScsIGV4aXRDb2RlID0+IHtcbiAgICAgIHJlc29sdmUoe1xuICAgICAgICBleGl0Q29kZSxcbiAgICAgICAgc3RkZXJyLFxuICAgICAgICBzdGRvdXQsXG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIGxhc3RDaGlsZC5vbignZXJyb3InLCBlcnJvciA9PiB7XG4gICAgICAvLyBSZWplY3QgZWFybHkgd2l0aCB0aGUgcmVzdWx0IHdoZW4gZW5jb3VudGVyaW5nIGFuIGVycm9yLlxuICAgICAgcmVqZWN0KHtcbiAgICAgICAgY29tbWFuZDogW2NvbW1hbmRdLmNvbmNhdChhcmdzKS5qb2luKCcgJyksXG4gICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3IubWVzc2FnZSxcbiAgICAgICAgZXhpdENvZGU6IGVycm9yLmNvZGUsXG4gICAgICAgIHN0ZGVycixcbiAgICAgICAgc3Rkb3V0LFxuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBsYXN0Q2hpbGQuc3RkZXJyLm9uKCdkYXRhJywgZGF0YSA9PiB7XG4gICAgICBzdGRlcnIgKz0gZGF0YTtcbiAgICB9KTtcbiAgICBsYXN0Q2hpbGQuc3Rkb3V0Lm9uKCdkYXRhJywgZGF0YSA9PiB7XG4gICAgICBzdGRvdXQgKz0gZGF0YTtcbiAgICB9KTtcblxuICAgIGlmICh0eXBlb2YgbG9jYWxPcHRpb25zLnN0ZGluID09PSAnc3RyaW5nJykge1xuICAgICAgLy8gTm90ZSB0aGF0IHRoZSBOb2RlIGRvY3MgaGF2ZSB0aGlzIHNjYXJ5IHdhcm5pbmcgYWJvdXQgc3RkaW4uZW5kKCkgb25cbiAgICAgIC8vIGh0dHA6Ly9ub2RlanMub3JnL2FwaS9jaGlsZF9wcm9jZXNzLmh0bWwjY2hpbGRfcHJvY2Vzc19jaGlsZF9zdGRpbjpcbiAgICAgIC8vXG4gICAgICAvLyBcIkEgV3JpdGFibGUgU3RyZWFtIHRoYXQgcmVwcmVzZW50cyB0aGUgY2hpbGQgcHJvY2VzcydzIHN0ZGluLiBDbG9zaW5nXG4gICAgICAvLyB0aGlzIHN0cmVhbSB2aWEgZW5kKCkgb2Z0ZW4gY2F1c2VzIHRoZSBjaGlsZCBwcm9jZXNzIHRvIHRlcm1pbmF0ZS5cIlxuICAgICAgLy9cbiAgICAgIC8vIEluIHByYWN0aWNlLCB0aGlzIGhhcyBub3QgYXBwZWFyZWQgdG8gY2F1c2UgYW55IGlzc3VlcyB0aHVzIGZhci5cbiAgICAgIGZpcnN0Q2hpbGQuc3RkaW4ud3JpdGUobG9jYWxPcHRpb25zLnN0ZGluKTtcbiAgICAgIGZpcnN0Q2hpbGQuc3RkaW4uZW5kKCk7XG4gICAgfVxuICB9O1xuXG4gIGZ1bmN0aW9uIG1ha2VQcm9taXNlKCk6IFByb21pc2U8cHJvY2VzcyRhc3luY0V4ZWN1dGVSZXQ+IHtcbiAgICBpZiAobG9jYWxPcHRpb25zLnF1ZXVlTmFtZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoZXhlY3V0b3IpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoIWJsb2NraW5nUXVldWVzW2xvY2FsT3B0aW9ucy5xdWV1ZU5hbWVdKSB7XG4gICAgICAgIGJsb2NraW5nUXVldWVzW2xvY2FsT3B0aW9ucy5xdWV1ZU5hbWVdID0gbmV3IFByb21pc2VRdWV1ZSgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGJsb2NraW5nUXVldWVzW2xvY2FsT3B0aW9ucy5xdWV1ZU5hbWVdLnN1Ym1pdChleGVjdXRvcik7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGNyZWF0ZUV4ZWNFbnZpcm9ubWVudChsb2NhbE9wdGlvbnMuZW52IHx8IHByb2Nlc3MuZW52LCBDT01NT05fQklOQVJZX1BBVEhTKS50aGVuKFxuICAgIHZhbCA9PiB7XG4gICAgICBsb2NhbE9wdGlvbnMuZW52ID0gdmFsO1xuICAgICAgcmV0dXJuIG1ha2VQcm9taXNlKCk7XG4gICAgfSxcbiAgICBlcnJvciA9PiB7XG4gICAgICBsb2NhbE9wdGlvbnMuZW52ID0gbG9jYWxPcHRpb25zLmVudiB8fCBwcm9jZXNzLmVudjtcbiAgICAgIHJldHVybiBtYWtlUHJvbWlzZSgpO1xuICAgIH1cbiAgKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gYXN5bmNFeGVjdXRlKFxuICAgIGNvbW1hbmQ6IHN0cmluZyxcbiAgICBhcmdzOiBBcnJheTxzdHJpbmc+LFxuICAgIG9wdGlvbnM6ID9PYmplY3QgPSB7fSk6IFByb21pc2U8cHJvY2VzcyRhc3luY0V4ZWN1dGVSZXQ+IHtcbiAgLyogJEZsb3dJc3N1ZSAodDgyMTYxODkpICovXG4gIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGNoZWNrT3V0cHV0KGNvbW1hbmQsIGFyZ3MsIG9wdGlvbnMpO1xuICBpZiAocmVzdWx0LmV4aXRDb2RlICE9PSAwKSB7XG4gICAgLy8gRHVjayB0eXBpbmcgRXJyb3IuXG4gICAgcmVzdWx0WyduYW1lJ10gPSAnQXN5bmMgRXhlY3V0aW9uIEVycm9yJztcbiAgICByZXN1bHRbJ21lc3NhZ2UnXSA9XG4gICAgICAgIGBleGl0Q29kZTogJHtyZXN1bHQuZXhpdENvZGV9LCBzdGRlcnI6ICR7cmVzdWx0LnN0ZGVycn0sIHN0ZG91dDogJHtyZXN1bHQuc3Rkb3V0fS5gO1xuICAgIHRocm93IHJlc3VsdDtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgYXN5bmNFeGVjdXRlLFxuICBjcmVhdGVBcmdzRm9yU2NyaXB0Q29tbWFuZCxcbiAgY3JlYXRlUHJvY2Vzc1N0cmVhbSxcbiAgY2hlY2tPdXRwdXQsXG4gIGZvcmtXaXRoRXhlY0Vudmlyb25tZW50LFxuICBnZXRPdXRwdXRTdHJlYW0sXG4gIHNhZmVTcGF3bixcbiAgc2NyaXB0U2FmZVNwYXduLFxuICBzY3JpcHRTYWZlU3Bhd25BbmRPYnNlcnZlT3V0cHV0LFxuICBjcmVhdGVFeGVjRW52aXJvbm1lbnQsXG4gIG9ic2VydmVQcm9jZXNzRXhpdCxcbiAgb2JzZXJ2ZVByb2Nlc3MsXG4gIENPTU1PTl9CSU5BUllfUEFUSFMsXG4gIF9fdGVzdF9fOiB7XG4gICAgREFSV0lOX1BBVEhfSEVMUEVSX1JFR0VYUCxcbiAgfSxcbn07XG4iXX0=