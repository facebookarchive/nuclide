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
  var child = _child_process2['default'].spawn(command, args, options);
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
  var child = _child_process2['default'].fork(modulePath, args, forkOptions);
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

var _child_process2 = _interopRequireDefault(_child_process);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _PromiseExecutors = require('./PromiseExecutors');

var _stream = require('./stream');

var _reactivexRxjs = require('@reactivex/rxjs');

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
      _child_process2['default'].execFile('/usr/libexec/path_helper', ['-s'], function (error, stdout, stderr) {
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

  return _reactivexRxjs.Observable.create(function (observer) {
    var childProcess = undefined;
    scriptSafeSpawn(command, args, options).then(function (proc) {
      childProcess = proc;

      childProcess.stdout.on('data', function (data) {
        observer.next({ stdout: data.toString() });
      });

      var stderr = '';
      childProcess.stderr.on('data', function (data) {
        stderr += data;
        observer.next({ stderr: data.toString() });
      });

      childProcess.on('exit', function (exitCode) {
        if (exitCode !== 0) {
          observer.error(stderr);
        } else {
          observer.complete();
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
  return _reactivexRxjs.Observable.create(function (observer) {
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

    var processStream = _reactivexRxjs.Observable.fromPromise(promise);

    var errors = throwOnError ? processStream.switchMap(function (p) {
      return _reactivexRxjs.Observable.fromEvent(p, 'error').flatMap(function (err) {
        return _reactivexRxjs.Observable['throw'](err);
      });
    }) : _reactivexRxjs.Observable.empty();

    var exit = processStream.flatMap(function (p) {
      return _reactivexRxjs.Observable.fromEvent(p, 'exit', function (code, signal) {
        return signal;
      });
    })
    // An exit signal from SIGUSR1 doesn't actually exit the process, so skip that.
    .filter(function (signal) {
      return signal !== 'SIGUSR1';
    })['do'](function () {
      exited = true;
    });

    return new _stream.CompositeSubscription(
    // A version of processStream that never completes...
    _reactivexRxjs.Observable.merge(processStream, _reactivexRxjs.Observable.create(function () {})).merge(errors)
    // ...which we take until the process exits.
    .takeUntil(exit).subscribe(observer), function () {
      disposed = true;maybeKill();
    });
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
    return _reactivexRxjs.Observable.fromEvent(process, 'exit').take(1);
  });
}

function getOutputStream(childProcess) {
  return _reactivexRxjs.Observable.fromPromise(Promise.resolve(childProcess)).flatMap(function (process) {
    (0, _assert2['default'])(process != null, 'process has not yet been disposed');
    // Use replay/connect on exit for the final concat.
    // By default concat defers subscription until after the LHS completes.
    var exit = _reactivexRxjs.Observable.fromEvent(process, 'exit').take(1).map(function (exitCode) {
      return { kind: 'exit', exitCode: exitCode };
    }).publishReplay();
    exit.connect();
    var error = _reactivexRxjs.Observable.fromEvent(process, 'error').takeUntil(exit).map(function (errorObj) {
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
      firstChild = _child_process2['default'].spawn(command, args, localOptions);
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

      lastChild = _child_process2['default'].spawn(localOptions.pipedCommand, localOptions.pipedArgs, localOptions);
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
      lastChild = _child_process2['default'].spawn(command, args, localOptions);
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
//# sourceMappingURL=data:application/json;base64,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QkFBbUIsRUFBbkIsbUJBQW1CO0FBQ25CLGFBQVcsRUFBWCxXQUFXO0FBQ1gseUJBQXVCLEVBQXZCLHVCQUF1QjtBQUN2QixpQkFBZSxFQUFmLGVBQWU7QUFDZixXQUFTLEVBQVQsU0FBUztBQUNULGlCQUFlLEVBQWYsZUFBZTtBQUNmLGlDQUErQixFQUEvQiwrQkFBK0I7QUFDL0IsdUJBQXFCLEVBQXJCLHFCQUFxQjtBQUNyQixvQkFBa0IsRUFBbEIsa0JBQWtCO0FBQ2xCLGdCQUFjLEVBQWQsY0FBYztBQUNkLHFCQUFtQixFQUFuQixtQkFBbUI7QUFDbkIsVUFBUSxFQUFFO0FBQ1IsNkJBQXlCLEVBQXpCLHlCQUF5QjtHQUMxQjtDQUNGLENBQUMiLCJmaWxlIjoicHJvY2Vzcy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBjaGlsZF9wcm9jZXNzIGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQge1Byb21pc2VRdWV1ZX0gZnJvbSAnLi9Qcm9taXNlRXhlY3V0b3JzJztcblxuaW1wb3J0IHR5cGUge09ic2VydmVyfSBmcm9tICdAcmVhY3RpdmV4L3J4anMnO1xuaW1wb3J0IHR5cGUge1Byb2Nlc3NNZXNzYWdlLCBwcm9jZXNzJGFzeW5jRXhlY3V0ZVJldH0gZnJvbSAnLi4nO1xuXG5pbXBvcnQge0NvbXBvc2l0ZVN1YnNjcmlwdGlvbiwgb2JzZXJ2ZVN0cmVhbSwgc3BsaXRTdHJlYW19IGZyb20gJy4vc3RyZWFtJztcbmltcG9ydCB7T2JzZXJ2YWJsZX0gZnJvbSAnQHJlYWN0aXZleC9yeGpzJztcbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCB7cXVvdGV9IGZyb20gJ3NoZWxsLXF1b3RlJztcblxubGV0IHBsYXRmb3JtUGF0aFByb21pc2U6ID9Qcm9taXNlPHN0cmluZz47XG5cbmNvbnN0IGJsb2NraW5nUXVldWVzID0ge307XG5jb25zdCBDT01NT05fQklOQVJZX1BBVEhTID0gWycvdXNyL2JpbicsICcvYmluJywgJy91c3Ivc2JpbicsICcvc2JpbicsICcvdXNyL2xvY2FsL2JpbiddO1xuXG4vKipcbiAqIENhcHR1cmVzIHRoZSB2YWx1ZSBvZiB0aGUgUEFUSCBlbnYgdmFyaWFibGUgcmV0dXJuZWQgYnkgRGFyd2luJ3MgKE9TIFgpIGBwYXRoX2hlbHBlcmAgdXRpbGl0eS5cbiAqIGBwYXRoX2hlbHBlciAtc2AncyByZXR1cm4gdmFsdWUgbG9va3MgbGlrZSB0aGlzOlxuICpcbiAqICAgICBQQVRIPVwiL3Vzci9iaW5cIjsgZXhwb3J0IFBBVEg7XG4gKi9cbmNvbnN0IERBUldJTl9QQVRIX0hFTFBFUl9SRUdFWFAgPSAvUEFUSD1cXFwiKFteXFxcIl0rKVxcXCIvO1xuXG5jb25zdCBTVFJFQU1fTkFNRVMgPSBbJ3N0ZGluJywgJ3N0ZG91dCcsICdzdGRlcnInXTtcblxuZnVuY3Rpb24gZ2V0UGxhdGZvcm1QYXRoKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gIC8vIERvIG5vdCByZXR1cm4gdGhlIGNhY2hlZCB2YWx1ZSBpZiB3ZSBhcmUgZXhlY3V0aW5nIHVuZGVyIHRoZSB0ZXN0IHJ1bm5lci5cbiAgaWYgKHBsYXRmb3JtUGF0aFByb21pc2UgJiYgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICd0ZXN0Jykge1xuICAgIC8vIFBhdGggaXMgYmVpbmcgZmV0Y2hlZCwgYXdhaXQgdGhlIFByb21pc2UgdGhhdCdzIGluIGZsaWdodC5cbiAgICByZXR1cm4gcGxhdGZvcm1QYXRoUHJvbWlzZTtcbiAgfVxuXG4gIC8vIFdlIGRvIG5vdCBjYWNoZSB0aGUgcmVzdWx0IG9mIHRoaXMgY2hlY2sgYmVjYXVzZSB3ZSBoYXZlIHVuaXQgdGVzdHMgdGhhdCB0ZW1wb3JhcmlseSByZWRlZmluZVxuICAvLyB0aGUgdmFsdWUgb2YgcHJvY2Vzcy5wbGF0Zm9ybS5cbiAgaWYgKHByb2Nlc3MucGxhdGZvcm0gPT09ICdkYXJ3aW4nKSB7XG4gICAgLy8gT1MgWCBhcHBzIGRvbid0IGluaGVyaXQgUEFUSCB3aGVuIG5vdCBsYXVuY2hlZCBmcm9tIHRoZSBDTEksIHNvIHJlY29uc3RydWN0IGl0LiBUaGlzIGlzIGFcbiAgICAvLyBidWcsIGZpbGVkIGFnYWluc3QgQXRvbSBMaW50ZXIgaGVyZTogaHR0cHM6Ly9naXRodWIuY29tL0F0b21MaW50ZXIvTGludGVyL2lzc3Vlcy8xNTBcbiAgICAvLyBUT0RPKGpqaWFhKTogcmVtb3ZlIHRoaXMgaGFjayB3aGVuIHRoZSBBdG9tIGlzc3VlIGlzIGNsb3NlZFxuICAgIHBsYXRmb3JtUGF0aFByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjaGlsZF9wcm9jZXNzLmV4ZWNGaWxlKCcvdXNyL2xpYmV4ZWMvcGF0aF9oZWxwZXInLCBbJy1zJ10sIChlcnJvciwgc3Rkb3V0LCBzdGRlcnIpID0+IHtcbiAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCBtYXRjaCA9IHN0ZG91dC5tYXRjaChEQVJXSU5fUEFUSF9IRUxQRVJfUkVHRVhQKTtcbiAgICAgICAgICByZXNvbHZlKChtYXRjaCAmJiBtYXRjaC5sZW5ndGggPiAxKSA/IG1hdGNoWzFdIDogJycpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICBwbGF0Zm9ybVBhdGhQcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKCcnKTtcbiAgfVxuXG4gIHJldHVybiBwbGF0Zm9ybVBhdGhQcm9taXNlO1xufVxuXG4vKipcbiAqIFNpbmNlIE9TIFggYXBwcyBkb24ndCBpbmhlcml0IFBBVEggd2hlbiBub3QgbGF1bmNoZWQgZnJvbSB0aGUgQ0xJLCB0aGlzIGZ1bmN0aW9uIGNyZWF0ZXMgYSBuZXdcbiAqIGVudmlyb25tZW50IG9iamVjdCBnaXZlbiB0aGUgb3JpZ2luYWwgZW52aXJvbm1lbnQgYnkgbW9kaWZ5aW5nIHRoZSBlbnYuUEFUSCB1c2luZyBmb2xsb3dpbmdcbiAqIGxvZ2ljOlxuICogIDEpIElmIG9yaWdpbmFsRW52LlBBVEggZG9lc24ndCBlcXVhbCB0byBwcm9jZXNzLmVudi5QQVRILCB3aGljaCBtZWFucyB0aGUgUEFUSCBoYXMgYmVlblxuICogICAgbW9kaWZpZWQsIHdlIHNob3VsZG4ndCBkbyBhbnl0aGluZy5cbiAqICAxKSBJZiB3ZSBhcmUgcnVubmluZyBpbiBPUyBYLCB1c2UgYC91c3IvbGliZXhlYy9wYXRoX2hlbHBlciAtc2AgdG8gZ2V0IHRoZSBjb3JyZWN0IFBBVEggYW5kXG4gKiAgICBSRVBMQUNFIHRoZSBQQVRILlxuICogIDIpIElmIHN0ZXAgMSBmYWlsZWQgb3Igd2UgYXJlIG5vdCBydW5uaW5nIGluIE9TIFgsIEFQUEVORCBjb21tb25CaW5hcnlQYXRocyB0byBjdXJyZW50IFBBVEguXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGNyZWF0ZUV4ZWNFbnZpcm9ubWVudChcbiAgb3JpZ2luYWxFbnY6IE9iamVjdCxcbiAgY29tbW9uQmluYXJ5UGF0aHM6IEFycmF5PHN0cmluZz4sXG4pOiBQcm9taXNlPE9iamVjdD4ge1xuICBjb25zdCBleGVjRW52ID0gey4uLm9yaWdpbmFsRW52fTtcblxuICBpZiAoZXhlY0Vudi5QQVRIICE9PSBwcm9jZXNzLmVudi5QQVRIKSB7XG4gICAgcmV0dXJuIGV4ZWNFbnY7XG4gIH1cblxuICBleGVjRW52LlBBVEggPSBleGVjRW52LlBBVEggfHwgJyc7XG5cbiAgbGV0IHBsYXRmb3JtUGF0aCA9IG51bGw7XG4gIHRyeSB7XG4gICAgcGxhdGZvcm1QYXRoID0gYXdhaXQgZ2V0UGxhdGZvcm1QYXRoKCk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgbG9nRXJyb3IoJ0ZhaWxlZCB0byBnZXRQbGF0Zm9ybVBhdGgnLCBlcnJvcik7XG4gIH1cblxuICAvLyBJZiB0aGUgcGxhdGZvcm0gcmV0dXJucyBhIG5vbi1lbXB0eSBQQVRILCB1c2UgaXQuIE90aGVyd2lzZSB1c2UgdGhlIGRlZmF1bHQgc2V0IG9mIGNvbW1vblxuICAvLyBiaW5hcnkgcGF0aHMuXG4gIGlmIChwbGF0Zm9ybVBhdGgpIHtcbiAgICBleGVjRW52LlBBVEggPSBwbGF0Zm9ybVBhdGg7XG4gIH0gZWxzZSBpZiAoY29tbW9uQmluYXJ5UGF0aHMubGVuZ3RoKSB7XG4gICAgY29uc3QgcGF0aHMgPSBleGVjRW52LlBBVEguc3BsaXQocGF0aC5kZWxpbWl0ZXIpO1xuICAgIGNvbW1vbkJpbmFyeVBhdGhzLmZvckVhY2goY29tbW9uQmluYXJ5UGF0aCA9PiB7XG4gICAgICBpZiAocGF0aHMuaW5kZXhPZihjb21tb25CaW5hcnlQYXRoKSA9PT0gLTEpIHtcbiAgICAgICAgcGF0aHMucHVzaChjb21tb25CaW5hcnlQYXRoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBleGVjRW52LlBBVEggPSBwYXRocy5qb2luKHBhdGguZGVsaW1pdGVyKTtcbiAgfVxuXG4gIHJldHVybiBleGVjRW52O1xufVxuXG5mdW5jdGlvbiBsb2dFcnJvciguLi5hcmdzKSB7XG4gIC8vIENhbid0IHVzZSBudWNsaWRlLWxvZ2dpbmcgaGVyZSB0byBub3QgY2F1c2UgY3ljbGUgZGVwZW5kZW5jeS5cbiAgLyplc2xpbnQtZGlzYWJsZSBuby1jb25zb2xlKi9cbiAgY29uc29sZS5lcnJvciguLi5hcmdzKTtcbiAgLyplc2xpbnQtZW5hYmxlIG5vLWNvbnNvbGUqL1xufVxuXG5mdW5jdGlvbiBtb25pdG9yU3RyZWFtRXJyb3JzKHByb2Nlc3M6IGNoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzLCBjb21tYW5kLCBhcmdzLCBvcHRpb25zKTogdm9pZCB7XG4gIFNUUkVBTV9OQU1FUy5mb3JFYWNoKHN0cmVhbU5hbWUgPT4ge1xuICAgIC8vICRGbG93SXNzdWVcbiAgICBjb25zdCBzdHJlYW0gPSBwcm9jZXNzW3N0cmVhbU5hbWVdO1xuICAgIGlmIChzdHJlYW0gPT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBzdHJlYW0ub24oJ2Vycm9yJywgZXJyb3IgPT4ge1xuICAgICAgLy8gVGhpcyBjYW4gaGFwcGVuIHdpdGhvdXQgdGhlIGZ1bGwgZXhlY3V0aW9uIG9mIHRoZSBjb21tYW5kIHRvIGZhaWwsXG4gICAgICAvLyBidXQgd2Ugd2FudCB0byBsZWFybiBhYm91dCBpdC5cbiAgICAgIGxvZ0Vycm9yKFxuICAgICAgICBgc3RyZWFtIGVycm9yIG9uIHN0cmVhbSAke3N0cmVhbU5hbWV9IHdpdGggY29tbWFuZDpgLFxuICAgICAgICBjb21tYW5kLFxuICAgICAgICBhcmdzLFxuICAgICAgICBvcHRpb25zLFxuICAgICAgICAnZXJyb3I6JyxcbiAgICAgICAgZXJyb3IsXG4gICAgICApO1xuICAgIH0pO1xuICB9KTtcbn1cblxuLyoqXG4gKiBCYXNpY2FsbHkgbGlrZSBzcGF3biwgZXhjZXB0IGl0IGhhbmRsZXMgYW5kIGxvZ3MgZXJyb3JzIGluc3RlYWQgb2YgY3Jhc2hpbmdcbiAqIHRoZSBwcm9jZXNzLiBUaGlzIGlzIG11Y2ggbG93ZXItbGV2ZWwgdGhhbiBhc3luY0V4ZWN1dGUuIFVubGVzcyB5b3UgaGF2ZSBhXG4gKiBzcGVjaWZpYyByZWFzb24geW91IHNob3VsZCB1c2UgYXN5bmNFeGVjdXRlIGluc3RlYWQuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIHNhZmVTcGF3bihcbiAgY29tbWFuZDogc3RyaW5nLFxuICBhcmdzPzogQXJyYXk8c3RyaW5nPiA9IFtdLFxuICBvcHRpb25zPzogT2JqZWN0ID0ge30sXG4pOiBQcm9taXNlPGNoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzPiB7XG4gIG9wdGlvbnMuZW52ID0gYXdhaXQgY3JlYXRlRXhlY0Vudmlyb25tZW50KG9wdGlvbnMuZW52IHx8IHByb2Nlc3MuZW52LCBDT01NT05fQklOQVJZX1BBVEhTKTtcbiAgY29uc3QgY2hpbGQgPSBjaGlsZF9wcm9jZXNzLnNwYXduKGNvbW1hbmQsIGFyZ3MsIG9wdGlvbnMpO1xuICBtb25pdG9yU3RyZWFtRXJyb3JzKGNoaWxkLCBjb21tYW5kLCBhcmdzLCBvcHRpb25zKTtcbiAgY2hpbGQub24oJ2Vycm9yJywgZXJyb3IgPT4ge1xuICAgIGxvZ0Vycm9yKCdlcnJvciB3aXRoIGNvbW1hbmQ6JywgY29tbWFuZCwgYXJncywgb3B0aW9ucywgJ2Vycm9yOicsIGVycm9yKTtcbiAgfSk7XG4gIHJldHVybiBjaGlsZDtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZm9ya1dpdGhFeGVjRW52aXJvbm1lbnQoXG4gIG1vZHVsZVBhdGg6IHN0cmluZyxcbiAgYXJncz86IEFycmF5PHN0cmluZz4gPSBbXSxcbiAgb3B0aW9ucz86IE9iamVjdCA9IHt9LFxuKTogUHJvbWlzZTxjaGlsZF9wcm9jZXNzJENoaWxkUHJvY2Vzcz4ge1xuICBjb25zdCBmb3JrT3B0aW9ucyA9IHtcbiAgICAuLi5vcHRpb25zLFxuICAgIGVudjogYXdhaXQgY3JlYXRlRXhlY0Vudmlyb25tZW50KG9wdGlvbnMuZW52IHx8IHByb2Nlc3MuZW52LCBDT01NT05fQklOQVJZX1BBVEhTKSxcbiAgfTtcbiAgY29uc3QgY2hpbGQgPSBjaGlsZF9wcm9jZXNzLmZvcmsobW9kdWxlUGF0aCwgYXJncywgZm9ya09wdGlvbnMpO1xuICBjaGlsZC5vbignZXJyb3InLCBlcnJvciA9PiB7XG4gICAgbG9nRXJyb3IoJ2Vycm9yIGZyb20gbW9kdWxlOicsIG1vZHVsZVBhdGgsIGFyZ3MsIG9wdGlvbnMsICdlcnJvcjonLCBlcnJvcik7XG4gIH0pO1xuICByZXR1cm4gY2hpbGQ7XG59XG5cbi8qKlxuICogVGFrZXMgdGhlIGNvbW1hbmQgYW5kIGFyZ3MgdGhhdCB5b3Ugd291bGQgbm9ybWFsbHkgcGFzcyB0byBgc3Bhd24oKWAgYW5kIHJldHVybnMgYG5ld0FyZ3NgIHN1Y2hcbiAqIHRoYXQgeW91IHNob3VsZCBjYWxsIGl0IHdpdGggYHNwYXduKCdzY3JpcHQnLCBuZXdBcmdzKWAgdG8gcnVuIHRoZSBvcmlnaW5hbCBjb21tYW5kL2FyZ3MgcGFpclxuICogdW5kZXIgYHNjcmlwdGAuXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUFyZ3NGb3JTY3JpcHRDb21tYW5kKGNvbW1hbmQ6IHN0cmluZywgYXJncz86IEFycmF5PHN0cmluZz4gPSBbXSk6IEFycmF5PHN0cmluZz4ge1xuICBpZiAocHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ2RhcndpbicpIHtcbiAgICAvLyBPbiBPUyBYLCBzY3JpcHQgdGFrZXMgdGhlIHByb2dyYW0gdG8gcnVuIGFuZCBpdHMgYXJndW1lbnRzIGFzIHZhcmFyZ3MgYXQgdGhlIGVuZC5cbiAgICByZXR1cm4gWyctcScsICcvZGV2L251bGwnLCBjb21tYW5kXS5jb25jYXQoYXJncyk7XG4gIH0gZWxzZSB7XG4gICAgLy8gT24gTGludXgsIHNjcmlwdCB0YWtlcyB0aGUgY29tbWFuZCB0byBydW4gYXMgdGhlIC1jIHBhcmFtZXRlci5cbiAgICBjb25zdCBhbGxBcmdzID0gW2NvbW1hbmRdLmNvbmNhdChhcmdzKTtcbiAgICByZXR1cm4gWyctcScsICcvZGV2L251bGwnLCAnLWMnLCBxdW90ZShhbGxBcmdzKV07XG4gIH1cbn1cblxuLyoqXG4gKiBCYXNpY2FsbHkgbGlrZSBzYWZlU3Bhd24sIGJ1dCBydW5zIHRoZSBjb21tYW5kIHdpdGggdGhlIGBzY3JpcHRgIGNvbW1hbmQuXG4gKiBgc2NyaXB0YCBlbnN1cmVzIHRlcm1pbmFsLWxpa2UgZW52aXJvbm1lbnQgYW5kIGNvbW1hbmRzIHdlIHJ1biBnaXZlIGNvbG9yZWQgb3V0cHV0LlxuICovXG5mdW5jdGlvbiBzY3JpcHRTYWZlU3Bhd24oXG4gIGNvbW1hbmQ6IHN0cmluZyxcbiAgYXJncz86IEFycmF5PHN0cmluZz4gPSBbXSxcbiAgb3B0aW9ucz86IE9iamVjdCA9IHt9LFxuKTogUHJvbWlzZTxjaGlsZF9wcm9jZXNzJENoaWxkUHJvY2Vzcz4ge1xuICBjb25zdCBuZXdBcmdzID0gY3JlYXRlQXJnc0ZvclNjcmlwdENvbW1hbmQoY29tbWFuZCwgYXJncyk7XG4gIHJldHVybiBzYWZlU3Bhd24oJ3NjcmlwdCcsIG5ld0FyZ3MsIG9wdGlvbnMpO1xufVxuXG4vKipcbiAqIFdyYXBzIHNjcmlwdFNhZmVTcGF3biB3aXRoIGFuIE9ic2VydmFibGUgdGhhdCBsZXRzIHlvdSBsaXN0ZW4gdG8gdGhlIHN0ZG91dCBhbmRcbiAqIHN0ZGVyciBvZiB0aGUgc3Bhd25lZCBwcm9jZXNzLlxuICovXG5mdW5jdGlvbiBzY3JpcHRTYWZlU3Bhd25BbmRPYnNlcnZlT3V0cHV0KFxuICBjb21tYW5kOiBzdHJpbmcsXG4gIGFyZ3M/OiBBcnJheTxzdHJpbmc+ID0gW10sXG4gIG9wdGlvbnM/OiBPYmplY3QgPSB7fSxcbik6IE9ic2VydmFibGU8e3N0ZGVycj86IHN0cmluZzsgc3Rkb3V0Pzogc3RyaW5nO30+IHtcbiAgcmV0dXJuIE9ic2VydmFibGUuY3JlYXRlKChvYnNlcnZlcjogT2JzZXJ2ZXIpID0+IHtcbiAgICBsZXQgY2hpbGRQcm9jZXNzO1xuICAgIHNjcmlwdFNhZmVTcGF3bihjb21tYW5kLCBhcmdzLCBvcHRpb25zKS50aGVuKHByb2MgPT4ge1xuICAgICAgY2hpbGRQcm9jZXNzID0gcHJvYztcblxuICAgICAgY2hpbGRQcm9jZXNzLnN0ZG91dC5vbignZGF0YScsIGRhdGEgPT4ge1xuICAgICAgICBvYnNlcnZlci5uZXh0KHtzdGRvdXQ6IGRhdGEudG9TdHJpbmcoKX0pO1xuICAgICAgfSk7XG5cbiAgICAgIGxldCBzdGRlcnIgPSAnJztcbiAgICAgIGNoaWxkUHJvY2Vzcy5zdGRlcnIub24oJ2RhdGEnLCBkYXRhID0+IHtcbiAgICAgICAgc3RkZXJyICs9IGRhdGE7XG4gICAgICAgIG9ic2VydmVyLm5leHQoe3N0ZGVycjogZGF0YS50b1N0cmluZygpfSk7XG4gICAgICB9KTtcblxuICAgICAgY2hpbGRQcm9jZXNzLm9uKCdleGl0JywgKGV4aXRDb2RlOiBudW1iZXIpID0+IHtcbiAgICAgICAgaWYgKGV4aXRDb2RlICE9PSAwKSB7XG4gICAgICAgICAgb2JzZXJ2ZXIuZXJyb3Ioc3RkZXJyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZSgpO1xuICAgICAgICB9XG4gICAgICAgIGNoaWxkUHJvY2VzcyA9IG51bGw7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBpZiAoY2hpbGRQcm9jZXNzKSB7XG4gICAgICAgIGNoaWxkUHJvY2Vzcy5raWxsKCk7XG4gICAgICB9XG4gICAgfTtcbiAgfSk7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBvYnNlcnZhYmxlIHdpdGggdGhlIGZvbGxvd2luZyBwcm9wZXJ0aWVzOlxuICpcbiAqIDEuIEl0IGNvbnRhaW5zIGEgcHJvY2VzcyB0aGF0J3MgY3JlYXRlZCB1c2luZyB0aGUgcHJvdmlkZWQgZmFjdG9yeSB1cG9uIHN1YnNjcmlwdGlvbi5cbiAqIDIuIEl0IGRvZXNuJ3QgY29tcGxldGUgdW50aWwgdGhlIHByb2Nlc3MgZXhpdHMgKG9yIGVycm9ycykuXG4gKiAzLiBUaGUgcHJvY2VzcyBpcyBraWxsZWQgd2hlbiB0aGVyZSBhcmUgbm8gbW9yZSBzdWJzY3JpYmVycy5cbiAqL1xuZnVuY3Rpb24gX2NyZWF0ZVByb2Nlc3NTdHJlYW0oXG4gIGNyZWF0ZVByb2Nlc3M6ICgpID0+IGNoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzIHwgUHJvbWlzZTxjaGlsZF9wcm9jZXNzJENoaWxkUHJvY2Vzcz4sXG4gIHRocm93T25FcnJvcjogYm9vbGVhbixcbik6IE9ic2VydmFibGU8Y2hpbGRfcHJvY2VzcyRDaGlsZFByb2Nlc3M+IHtcbiAgcmV0dXJuIE9ic2VydmFibGUuY3JlYXRlKG9ic2VydmVyID0+IHtcbiAgICBjb25zdCBwcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKGNyZWF0ZVByb2Nlc3MoKSk7XG4gICAgbGV0IHByb2Nlc3M7XG4gICAgbGV0IGRpc3Bvc2VkID0gZmFsc2U7XG4gICAgbGV0IGV4aXRlZCA9IGZhbHNlO1xuICAgIGNvbnN0IG1heWJlS2lsbCA9ICgpID0+IHtcbiAgICAgIGlmIChwcm9jZXNzICE9IG51bGwgJiYgZGlzcG9zZWQgJiYgIWV4aXRlZCkge1xuICAgICAgICBwcm9jZXNzLmtpbGwoKTtcbiAgICAgICAgcHJvY2VzcyA9IG51bGw7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHByb21pc2UudGhlbihwID0+IHtcbiAgICAgIHByb2Nlc3MgPSBwO1xuICAgICAgbWF5YmVLaWxsKCk7XG4gICAgfSk7XG5cbiAgICBjb25zdCBwcm9jZXNzU3RyZWFtID0gT2JzZXJ2YWJsZS5mcm9tUHJvbWlzZShwcm9taXNlKTtcblxuICAgIGNvbnN0IGVycm9ycyA9IHRocm93T25FcnJvclxuICAgICAgPyBwcm9jZXNzU3RyZWFtLnN3aXRjaE1hcChwID0+IChcbiAgICAgICAgT2JzZXJ2YWJsZS5mcm9tRXZlbnQocCwgJ2Vycm9yJykuZmxhdE1hcChlcnIgPT4gT2JzZXJ2YWJsZS50aHJvdyhlcnIpKVxuICAgICAgKSlcbiAgICAgIDogT2JzZXJ2YWJsZS5lbXB0eSgpO1xuXG4gICAgY29uc3QgZXhpdCA9IHByb2Nlc3NTdHJlYW1cbiAgICAgIC5mbGF0TWFwKHAgPT4gT2JzZXJ2YWJsZS5mcm9tRXZlbnQocCwgJ2V4aXQnLCAoY29kZSwgc2lnbmFsKSA9PiBzaWduYWwpKVxuICAgICAgLy8gQW4gZXhpdCBzaWduYWwgZnJvbSBTSUdVU1IxIGRvZXNuJ3QgYWN0dWFsbHkgZXhpdCB0aGUgcHJvY2Vzcywgc28gc2tpcCB0aGF0LlxuICAgICAgLmZpbHRlcihzaWduYWwgPT4gc2lnbmFsICE9PSAnU0lHVVNSMScpXG4gICAgICAuZG8oKCkgPT4geyBleGl0ZWQgPSB0cnVlOyB9KTtcblxuICAgIHJldHVybiBuZXcgQ29tcG9zaXRlU3Vic2NyaXB0aW9uKFxuICAgICAgLy8gQSB2ZXJzaW9uIG9mIHByb2Nlc3NTdHJlYW0gdGhhdCBuZXZlciBjb21wbGV0ZXMuLi5cbiAgICAgIE9ic2VydmFibGUubWVyZ2UocHJvY2Vzc1N0cmVhbSwgT2JzZXJ2YWJsZS5jcmVhdGUoKCkgPT4ge30pKVxuICAgICAgICAubWVyZ2UoZXJyb3JzKVxuICAgICAgICAvLyAuLi53aGljaCB3ZSB0YWtlIHVudGlsIHRoZSBwcm9jZXNzIGV4aXRzLlxuICAgICAgICAudGFrZVVudGlsKGV4aXQpXG4gICAgICAgIC5zdWJzY3JpYmUob2JzZXJ2ZXIpLFxuICAgICAgKCkgPT4geyBkaXNwb3NlZCA9IHRydWU7IG1heWJlS2lsbCgpOyB9LFxuICAgICk7XG4gIH0pO1xuICAvLyBUT0RPOiBXZSBzaG91bGQgcmVhbGx5IGAuc2hhcmUoKWAgdGhpcyBvYnNlcnZhYmxlLCBidXQgdGhlcmUgc2VlbSB0byBiZSBpc3N1ZXMgd2l0aCB0aGF0IGFuZFxuICAvLyAgIGAucmV0cnkoKWAgaW4gUnggMyBhbmQgNC4gT25jZSB3ZSB1cGdyYWRlIHRvIFJ4NSwgd2Ugc2hvdWxkIHNoYXJlIHRoaXMgb2JzZXJ2YWJsZSBhbmQgdmVyaWZ5XG4gIC8vICAgdGhhdCBvdXIgcmV0cnkgbG9naWMgKGUuZy4gaW4gYWRiLWxvZ2NhdCkgd29ya3MuXG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVByb2Nlc3NTdHJlYW0oXG4gIGNyZWF0ZVByb2Nlc3M6ICgpID0+IGNoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzIHwgUHJvbWlzZTxjaGlsZF9wcm9jZXNzJENoaWxkUHJvY2Vzcz4sXG4pOiBPYnNlcnZhYmxlPGNoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzPiB7XG4gIHJldHVybiBfY3JlYXRlUHJvY2Vzc1N0cmVhbShjcmVhdGVQcm9jZXNzLCB0cnVlKTtcbn1cblxuLyoqXG4gKiBPYnNlcnZlIHRoZSBzdGRvdXQsIHN0ZGVyciBhbmQgZXhpdCBjb2RlIG9mIGEgcHJvY2Vzcy5cbiAqIHN0ZG91dCBhbmQgc3RkZXJyIGFyZSBzcGxpdCBieSBuZXdsaW5lcy5cbiAqL1xuZnVuY3Rpb24gb2JzZXJ2ZVByb2Nlc3NFeGl0KFxuICBjcmVhdGVQcm9jZXNzOiAoKSA9PiBjaGlsZF9wcm9jZXNzJENoaWxkUHJvY2VzcyB8IFByb21pc2U8Y2hpbGRfcHJvY2VzcyRDaGlsZFByb2Nlc3M+LFxuKTogT2JzZXJ2YWJsZTxudW1iZXI+IHtcbiAgcmV0dXJuIF9jcmVhdGVQcm9jZXNzU3RyZWFtKGNyZWF0ZVByb2Nlc3MsIGZhbHNlKVxuICAgIC5mbGF0TWFwKHByb2Nlc3MgPT4gT2JzZXJ2YWJsZS5mcm9tRXZlbnQocHJvY2VzcywgJ2V4aXQnKS50YWtlKDEpKTtcbn1cblxuZnVuY3Rpb24gZ2V0T3V0cHV0U3RyZWFtKFxuICBjaGlsZFByb2Nlc3M6IGNoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzIHwgUHJvbWlzZTxjaGlsZF9wcm9jZXNzJENoaWxkUHJvY2Vzcz4sXG4pOiBPYnNlcnZhYmxlPFByb2Nlc3NNZXNzYWdlPiB7XG4gIHJldHVybiBPYnNlcnZhYmxlLmZyb21Qcm9taXNlKFByb21pc2UucmVzb2x2ZShjaGlsZFByb2Nlc3MpKVxuICAgIC5mbGF0TWFwKHByb2Nlc3MgPT4ge1xuICAgICAgaW52YXJpYW50KHByb2Nlc3MgIT0gbnVsbCwgJ3Byb2Nlc3MgaGFzIG5vdCB5ZXQgYmVlbiBkaXNwb3NlZCcpO1xuICAgICAgLy8gVXNlIHJlcGxheS9jb25uZWN0IG9uIGV4aXQgZm9yIHRoZSBmaW5hbCBjb25jYXQuXG4gICAgICAvLyBCeSBkZWZhdWx0IGNvbmNhdCBkZWZlcnMgc3Vic2NyaXB0aW9uIHVudGlsIGFmdGVyIHRoZSBMSFMgY29tcGxldGVzLlxuICAgICAgY29uc3QgZXhpdCA9IE9ic2VydmFibGUuZnJvbUV2ZW50KHByb2Nlc3MsICdleGl0JykudGFrZSgxKS5cbiAgICAgICAgbWFwKGV4aXRDb2RlID0+ICh7a2luZDogJ2V4aXQnLCBleGl0Q29kZX0pKS5wdWJsaXNoUmVwbGF5KCk7XG4gICAgICBleGl0LmNvbm5lY3QoKTtcbiAgICAgIGNvbnN0IGVycm9yID0gT2JzZXJ2YWJsZS5mcm9tRXZlbnQocHJvY2VzcywgJ2Vycm9yJykuXG4gICAgICAgIHRha2VVbnRpbChleGl0KS5cbiAgICAgICAgbWFwKGVycm9yT2JqID0+ICh7a2luZDogJ2Vycm9yJywgZXJyb3I6IGVycm9yT2JqfSkpO1xuICAgICAgY29uc3Qgc3Rkb3V0ID0gc3BsaXRTdHJlYW0ob2JzZXJ2ZVN0cmVhbShwcm9jZXNzLnN0ZG91dCkpLlxuICAgICAgICBtYXAoZGF0YSA9PiAoe2tpbmQ6ICdzdGRvdXQnLCBkYXRhfSkpO1xuICAgICAgY29uc3Qgc3RkZXJyID0gc3BsaXRTdHJlYW0ob2JzZXJ2ZVN0cmVhbShwcm9jZXNzLnN0ZGVycikpLlxuICAgICAgICBtYXAoZGF0YSA9PiAoe2tpbmQ6ICdzdGRlcnInLCBkYXRhfSkpO1xuICAgICAgcmV0dXJuIHN0ZG91dC5tZXJnZShzdGRlcnIpLm1lcmdlKGVycm9yKS5jb25jYXQoZXhpdCk7XG4gICAgfSk7XG59XG5cbi8qKlxuICogT2JzZXJ2ZSB0aGUgc3Rkb3V0LCBzdGRlcnIgYW5kIGV4aXQgY29kZSBvZiBhIHByb2Nlc3MuXG4gKi9cbmZ1bmN0aW9uIG9ic2VydmVQcm9jZXNzKFxuICBjcmVhdGVQcm9jZXNzOiAoKSA9PiBjaGlsZF9wcm9jZXNzJENoaWxkUHJvY2VzcyB8IFByb21pc2U8Y2hpbGRfcHJvY2VzcyRDaGlsZFByb2Nlc3M+LFxuKTogT2JzZXJ2YWJsZTxQcm9jZXNzTWVzc2FnZT4ge1xuICByZXR1cm4gX2NyZWF0ZVByb2Nlc3NTdHJlYW0oY3JlYXRlUHJvY2VzcywgZmFsc2UpLmZsYXRNYXAoZ2V0T3V0cHV0U3RyZWFtKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIHRoZSByZXN1bHQgb2YgZXhlY3V0aW5nIGEgcHJvY2Vzcy5cbiAqXG4gKiBAcGFyYW0gY29tbWFuZCBUaGUgY29tbWFuZCB0byBleGVjdXRlLlxuICogQHBhcmFtIGFyZ3MgVGhlIGFyZ3VtZW50cyB0byBwYXNzIHRvIHRoZSBjb21tYW5kLlxuICogQHBhcmFtIG9wdGlvbnMgT3B0aW9ucyBmb3IgY2hhbmdpbmcgaG93IHRvIHJ1biB0aGUgY29tbWFuZC5cbiAqICAgICBTZWUgaGVyZTogaHR0cDovL25vZGVqcy5vcmcvYXBpL2NoaWxkX3Byb2Nlc3MuaHRtbFxuICogICAgIFRoZSBhZGRpdGlvbmFsIG9wdGlvbnMgd2UgcHJvdmlkZTpcbiAqICAgICAgIHF1ZXVlTmFtZSBzdHJpbmcgVGhlIHF1ZXVlIG9uIHdoaWNoIHRvIGJsb2NrIGRlcGVuZGVudCBjYWxscy5cbiAqICAgICAgIHN0ZGluIHN0cmluZyBUaGUgY29udGVudHMgdG8gd3JpdGUgdG8gc3RkaW4uXG4gKiAgICAgICBwaXBlZENvbW1hbmQgc3RyaW5nIGEgY29tbWFuZCB0byBwaXBlIHRoZSBvdXRwdXQgb2YgY29tbWFuZCB0aHJvdWdoLlxuICogICAgICAgcGlwZWRBcmdzIGFycmF5IG9mIHN0cmluZ3MgYXMgYXJndW1lbnRzLlxuICogQHJldHVybiBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgdG8gYW4gb2JqZWN0IHdpdGggdGhlIHByb3BlcnRpZXM6XG4gKiAgICAgc3Rkb3V0IHN0cmluZyBUaGUgY29udGVudHMgb2YgdGhlIHByb2Nlc3MncyBvdXRwdXQgc3RyZWFtLlxuICogICAgIHN0ZGVyciBzdHJpbmcgVGhlIGNvbnRlbnRzIG9mIHRoZSBwcm9jZXNzJ3MgZXJyb3Igc3RyZWFtLlxuICogICAgIGV4aXRDb2RlIG51bWJlciBUaGUgZXhpdCBjb2RlIHJldHVybmVkIGJ5IHRoZSBwcm9jZXNzLlxuICovXG5mdW5jdGlvbiBjaGVja091dHB1dChcbiAgICBjb21tYW5kOiBzdHJpbmcsXG4gICAgYXJnczogQXJyYXk8c3RyaW5nPixcbiAgICBvcHRpb25zOiA/T2JqZWN0ID0ge30pOiBQcm9taXNlPHByb2Nlc3MkYXN5bmNFeGVjdXRlUmV0PiB7XG4gIC8vIENsb25lIHBhc3NlZCBpbiBvcHRpb25zIHNvIHRoaXMgZnVuY3Rpb24gZG9lc24ndCBtb2RpZnkgYW4gb2JqZWN0IGl0IGRvZXNuJ3Qgb3duLlxuICBjb25zdCBsb2NhbE9wdGlvbnMgPSB7Li4ub3B0aW9uc307XG5cbiAgY29uc3QgZXhlY3V0b3IgPSAocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgbGV0IGZpcnN0Q2hpbGQ7XG4gICAgbGV0IGxhc3RDaGlsZDtcblxuICAgIGxldCBmaXJzdENoaWxkU3RkZXJyO1xuICAgIGlmIChsb2NhbE9wdGlvbnMucGlwZWRDb21tYW5kKSB7XG4gICAgICAvLyBJZiBhIHNlY29uZCBjb21tYW5kIGlzIGdpdmVuLCBwaXBlIHN0ZG91dCBvZiBmaXJzdCB0byBzdGRpbiBvZiBzZWNvbmQuIFN0cmluZyBvdXRwdXRcbiAgICAgIC8vIHJldHVybmVkIGluIHRoaXMgZnVuY3Rpb24ncyBQcm9taXNlIHdpbGwgYmUgc3RkZXJyL3N0ZG91dCBvZiB0aGUgc2Vjb25kIGNvbW1hbmQuXG4gICAgICBmaXJzdENoaWxkID0gY2hpbGRfcHJvY2Vzcy5zcGF3bihjb21tYW5kLCBhcmdzLCBsb2NhbE9wdGlvbnMpO1xuICAgICAgbW9uaXRvclN0cmVhbUVycm9ycyhmaXJzdENoaWxkLCBjb21tYW5kLCBhcmdzLCBsb2NhbE9wdGlvbnMpO1xuICAgICAgZmlyc3RDaGlsZFN0ZGVyciA9ICcnO1xuXG4gICAgICBmaXJzdENoaWxkLm9uKCdlcnJvcicsIGVycm9yID0+IHtcbiAgICAgICAgLy8gUmVqZWN0IGVhcmx5IHdpdGggdGhlIHJlc3VsdCB3aGVuIGVuY291bnRlcmluZyBhbiBlcnJvci5cbiAgICAgICAgcmVqZWN0KHtcbiAgICAgICAgICBjb21tYW5kOiBbY29tbWFuZF0uY29uY2F0KGFyZ3MpLmpvaW4oJyAnKSxcbiAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UsXG4gICAgICAgICAgZXhpdENvZGU6IGVycm9yLmNvZGUsXG4gICAgICAgICAgc3RkZXJyOiBmaXJzdENoaWxkU3RkZXJyLFxuICAgICAgICAgIHN0ZG91dDogJycsXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG5cbiAgICAgIGZpcnN0Q2hpbGQuc3RkZXJyLm9uKCdkYXRhJywgZGF0YSA9PiB7XG4gICAgICAgIGZpcnN0Q2hpbGRTdGRlcnIgKz0gZGF0YTtcbiAgICAgIH0pO1xuXG4gICAgICBsYXN0Q2hpbGQgPSBjaGlsZF9wcm9jZXNzLnNwYXduKFxuICAgICAgICBsb2NhbE9wdGlvbnMucGlwZWRDb21tYW5kLFxuICAgICAgICBsb2NhbE9wdGlvbnMucGlwZWRBcmdzLFxuICAgICAgICBsb2NhbE9wdGlvbnNcbiAgICAgICk7XG4gICAgICBtb25pdG9yU3RyZWFtRXJyb3JzKGxhc3RDaGlsZCwgY29tbWFuZCwgYXJncywgbG9jYWxPcHRpb25zKTtcbiAgICAgIC8vIHBpcGUoKSBub3JtYWxseSBwYXVzZXMgdGhlIHdyaXRlciB3aGVuIHRoZSByZWFkZXIgZXJyb3JzIChjbG9zZXMpLlxuICAgICAgLy8gVGhpcyBpcyBub3QgaG93IFVOSVggcGlwZXMgd29yazogaWYgdGhlIHJlYWRlciBjbG9zZXMsIHRoZSB3cml0ZXIgbmVlZHNcbiAgICAgIC8vIHRvIGFsc28gY2xvc2UgKG90aGVyd2lzZSB0aGUgd3JpdGVyIHByb2Nlc3MgbWF5IGhhbmcuKVxuICAgICAgLy8gV2UgaGF2ZSB0byBtYW51YWxseSBjbG9zZSB0aGUgd3JpdGVyIGluIHRoaXMgY2FzZS5cbiAgICAgIGxhc3RDaGlsZC5zdGRpbi5vbignZXJyb3InLCAoKSA9PiB7XG4gICAgICAgIGZpcnN0Q2hpbGQuc3Rkb3V0LmVtaXQoJ2VuZCcpO1xuICAgICAgfSk7XG4gICAgICBmaXJzdENoaWxkLnN0ZG91dC5waXBlKGxhc3RDaGlsZC5zdGRpbik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxhc3RDaGlsZCA9IGNoaWxkX3Byb2Nlc3Muc3Bhd24oY29tbWFuZCwgYXJncywgbG9jYWxPcHRpb25zKTtcbiAgICAgIG1vbml0b3JTdHJlYW1FcnJvcnMobGFzdENoaWxkLCBjb21tYW5kLCBhcmdzLCBsb2NhbE9wdGlvbnMpO1xuICAgICAgZmlyc3RDaGlsZCA9IGxhc3RDaGlsZDtcbiAgICB9XG5cbiAgICBsZXQgc3RkZXJyID0gJyc7XG4gICAgbGV0IHN0ZG91dCA9ICcnO1xuICAgIGxhc3RDaGlsZC5vbignY2xvc2UnLCBleGl0Q29kZSA9PiB7XG4gICAgICByZXNvbHZlKHtcbiAgICAgICAgZXhpdENvZGUsXG4gICAgICAgIHN0ZGVycixcbiAgICAgICAgc3Rkb3V0LFxuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBsYXN0Q2hpbGQub24oJ2Vycm9yJywgZXJyb3IgPT4ge1xuICAgICAgLy8gUmVqZWN0IGVhcmx5IHdpdGggdGhlIHJlc3VsdCB3aGVuIGVuY291bnRlcmluZyBhbiBlcnJvci5cbiAgICAgIHJlamVjdCh7XG4gICAgICAgIGNvbW1hbmQ6IFtjb21tYW5kXS5jb25jYXQoYXJncykuam9pbignICcpLFxuICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UsXG4gICAgICAgIGV4aXRDb2RlOiBlcnJvci5jb2RlLFxuICAgICAgICBzdGRlcnIsXG4gICAgICAgIHN0ZG91dCxcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgbGFzdENoaWxkLnN0ZGVyci5vbignZGF0YScsIGRhdGEgPT4ge1xuICAgICAgc3RkZXJyICs9IGRhdGE7XG4gICAgfSk7XG4gICAgbGFzdENoaWxkLnN0ZG91dC5vbignZGF0YScsIGRhdGEgPT4ge1xuICAgICAgc3Rkb3V0ICs9IGRhdGE7XG4gICAgfSk7XG5cbiAgICBpZiAodHlwZW9mIGxvY2FsT3B0aW9ucy5zdGRpbiA9PT0gJ3N0cmluZycpIHtcbiAgICAgIC8vIE5vdGUgdGhhdCB0aGUgTm9kZSBkb2NzIGhhdmUgdGhpcyBzY2FyeSB3YXJuaW5nIGFib3V0IHN0ZGluLmVuZCgpIG9uXG4gICAgICAvLyBodHRwOi8vbm9kZWpzLm9yZy9hcGkvY2hpbGRfcHJvY2Vzcy5odG1sI2NoaWxkX3Byb2Nlc3NfY2hpbGRfc3RkaW46XG4gICAgICAvL1xuICAgICAgLy8gXCJBIFdyaXRhYmxlIFN0cmVhbSB0aGF0IHJlcHJlc2VudHMgdGhlIGNoaWxkIHByb2Nlc3MncyBzdGRpbi4gQ2xvc2luZ1xuICAgICAgLy8gdGhpcyBzdHJlYW0gdmlhIGVuZCgpIG9mdGVuIGNhdXNlcyB0aGUgY2hpbGQgcHJvY2VzcyB0byB0ZXJtaW5hdGUuXCJcbiAgICAgIC8vXG4gICAgICAvLyBJbiBwcmFjdGljZSwgdGhpcyBoYXMgbm90IGFwcGVhcmVkIHRvIGNhdXNlIGFueSBpc3N1ZXMgdGh1cyBmYXIuXG4gICAgICBmaXJzdENoaWxkLnN0ZGluLndyaXRlKGxvY2FsT3B0aW9ucy5zdGRpbik7XG4gICAgICBmaXJzdENoaWxkLnN0ZGluLmVuZCgpO1xuICAgIH1cbiAgfTtcblxuICBmdW5jdGlvbiBtYWtlUHJvbWlzZSgpOiBQcm9taXNlPHByb2Nlc3MkYXN5bmNFeGVjdXRlUmV0PiB7XG4gICAgaWYgKGxvY2FsT3B0aW9ucy5xdWV1ZU5hbWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGV4ZWN1dG9yKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKCFibG9ja2luZ1F1ZXVlc1tsb2NhbE9wdGlvbnMucXVldWVOYW1lXSkge1xuICAgICAgICBibG9ja2luZ1F1ZXVlc1tsb2NhbE9wdGlvbnMucXVldWVOYW1lXSA9IG5ldyBQcm9taXNlUXVldWUoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBibG9ja2luZ1F1ZXVlc1tsb2NhbE9wdGlvbnMucXVldWVOYW1lXS5zdWJtaXQoZXhlY3V0b3IpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBjcmVhdGVFeGVjRW52aXJvbm1lbnQobG9jYWxPcHRpb25zLmVudiB8fCBwcm9jZXNzLmVudiwgQ09NTU9OX0JJTkFSWV9QQVRIUykudGhlbihcbiAgICB2YWwgPT4ge1xuICAgICAgbG9jYWxPcHRpb25zLmVudiA9IHZhbDtcbiAgICAgIHJldHVybiBtYWtlUHJvbWlzZSgpO1xuICAgIH0sXG4gICAgZXJyb3IgPT4ge1xuICAgICAgbG9jYWxPcHRpb25zLmVudiA9IGxvY2FsT3B0aW9ucy5lbnYgfHwgcHJvY2Vzcy5lbnY7XG4gICAgICByZXR1cm4gbWFrZVByb21pc2UoKTtcbiAgICB9XG4gICk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGFzeW5jRXhlY3V0ZShcbiAgICBjb21tYW5kOiBzdHJpbmcsXG4gICAgYXJnczogQXJyYXk8c3RyaW5nPixcbiAgICBvcHRpb25zOiA/T2JqZWN0ID0ge30pOiBQcm9taXNlPHByb2Nlc3MkYXN5bmNFeGVjdXRlUmV0PiB7XG4gIC8qICRGbG93SXNzdWUgKHQ4MjE2MTg5KSAqL1xuICBjb25zdCByZXN1bHQgPSBhd2FpdCBjaGVja091dHB1dChjb21tYW5kLCBhcmdzLCBvcHRpb25zKTtcbiAgaWYgKHJlc3VsdC5leGl0Q29kZSAhPT0gMCkge1xuICAgIC8vIER1Y2sgdHlwaW5nIEVycm9yLlxuICAgIHJlc3VsdFsnbmFtZSddID0gJ0FzeW5jIEV4ZWN1dGlvbiBFcnJvcic7XG4gICAgcmVzdWx0WydtZXNzYWdlJ10gPVxuICAgICAgICBgZXhpdENvZGU6ICR7cmVzdWx0LmV4aXRDb2RlfSwgc3RkZXJyOiAke3Jlc3VsdC5zdGRlcnJ9LCBzdGRvdXQ6ICR7cmVzdWx0LnN0ZG91dH0uYDtcbiAgICB0aHJvdyByZXN1bHQ7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGFzeW5jRXhlY3V0ZSxcbiAgY3JlYXRlQXJnc0ZvclNjcmlwdENvbW1hbmQsXG4gIGNyZWF0ZVByb2Nlc3NTdHJlYW0sXG4gIGNoZWNrT3V0cHV0LFxuICBmb3JrV2l0aEV4ZWNFbnZpcm9ubWVudCxcbiAgZ2V0T3V0cHV0U3RyZWFtLFxuICBzYWZlU3Bhd24sXG4gIHNjcmlwdFNhZmVTcGF3bixcbiAgc2NyaXB0U2FmZVNwYXduQW5kT2JzZXJ2ZU91dHB1dCxcbiAgY3JlYXRlRXhlY0Vudmlyb25tZW50LFxuICBvYnNlcnZlUHJvY2Vzc0V4aXQsXG4gIG9ic2VydmVQcm9jZXNzLFxuICBDT01NT05fQklOQVJZX1BBVEhTLFxuICBfX3Rlc3RfXzoge1xuICAgIERBUldJTl9QQVRIX0hFTFBFUl9SRUdFWFAsXG4gIH0sXG59O1xuIl19