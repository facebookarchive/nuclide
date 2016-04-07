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

/**
 * Creates an observable with the following properties:
 *
 * 1. It contains a process that's created using the provided factory upon subscription.
 * 2. It doesn't complete until the process exits.
 * 3. The process is killed when there are no more subscribers.
 */
function createProcessStream(createProcess) {
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
    _rx.Observable.merge(processStream, _rx.Observable.create(function () {}))
    // ...which we take until the process exits.
    .takeUntil(exit).subscribe(observer), new _eventKit.Disposable(function () {
      disposed = true;maybeKill();
    }));
  }).share();
}

/**
 * Observe the stdout, stderr and exit code of a process.
 * stdout and stderr are split by newlines.
 */
function observeProcessExit(createProcess) {
  return createProcessStream(createProcess).flatMap(function (process) {
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
  return createProcessStream(createProcess).flatMap(getOutputStream);
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
//# sourceMappingURL=data:application/json;base64,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ZXNzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHtcbiAgZXhlY0ZpbGUsXG4gIGZvcmssXG4gIHNwYXduLFxufSBmcm9tICdjaGlsZF9wcm9jZXNzJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHtQcm9taXNlUXVldWV9IGZyb20gJy4vUHJvbWlzZUV4ZWN1dG9ycyc7XG5cbmltcG9ydCB0eXBlIHtPYnNlcnZlcn0gZnJvbSAncngnO1xuaW1wb3J0IHR5cGUge1Byb2Nlc3NNZXNzYWdlLCBwcm9jZXNzJGFzeW5jRXhlY3V0ZVJldH0gZnJvbSAnLi4nO1xuXG5pbXBvcnQge29ic2VydmVTdHJlYW0sIHNwbGl0U3RyZWFtfSBmcm9tICcuL3N0cmVhbSc7XG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGUsIERpc3Bvc2FibGV9IGZyb20gJ2V2ZW50LWtpdCc7XG5pbXBvcnQge09ic2VydmFibGV9IGZyb20gJ3J4JztcbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcblxubGV0IHBsYXRmb3JtUGF0aFByb21pc2U6ID9Qcm9taXNlPHN0cmluZz47XG5cbmNvbnN0IGJsb2NraW5nUXVldWVzID0ge307XG5jb25zdCBDT01NT05fQklOQVJZX1BBVEhTID0gWycvdXNyL2JpbicsICcvYmluJywgJy91c3Ivc2JpbicsICcvc2JpbicsICcvdXNyL2xvY2FsL2JpbiddO1xuXG4vKipcbiAqIENhcHR1cmVzIHRoZSB2YWx1ZSBvZiB0aGUgUEFUSCBlbnYgdmFyaWFibGUgcmV0dXJuZWQgYnkgRGFyd2luJ3MgKE9TIFgpIGBwYXRoX2hlbHBlcmAgdXRpbGl0eS5cbiAqIGBwYXRoX2hlbHBlciAtc2AncyByZXR1cm4gdmFsdWUgbG9va3MgbGlrZSB0aGlzOlxuICpcbiAqICAgICBQQVRIPVwiL3Vzci9iaW5cIjsgZXhwb3J0IFBBVEg7XG4gKi9cbmNvbnN0IERBUldJTl9QQVRIX0hFTFBFUl9SRUdFWFAgPSAvUEFUSD1cXFwiKFteXFxcIl0rKVxcXCIvO1xuXG5jb25zdCBTVFJFQU1fTkFNRVMgPSBbJ3N0ZGluJywgJ3N0ZG91dCcsICdzdGRlcnInXTtcblxuZnVuY3Rpb24gZ2V0UGxhdGZvcm1QYXRoKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gIC8vIERvIG5vdCByZXR1cm4gdGhlIGNhY2hlZCB2YWx1ZSBpZiB3ZSBhcmUgZXhlY3V0aW5nIHVuZGVyIHRoZSB0ZXN0IHJ1bm5lci5cbiAgaWYgKHBsYXRmb3JtUGF0aFByb21pc2UgJiYgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICd0ZXN0Jykge1xuICAgIC8vIFBhdGggaXMgYmVpbmcgZmV0Y2hlZCwgYXdhaXQgdGhlIFByb21pc2UgdGhhdCdzIGluIGZsaWdodC5cbiAgICByZXR1cm4gcGxhdGZvcm1QYXRoUHJvbWlzZTtcbiAgfVxuXG4gIC8vIFdlIGRvIG5vdCBjYWNoZSB0aGUgcmVzdWx0IG9mIHRoaXMgY2hlY2sgYmVjYXVzZSB3ZSBoYXZlIHVuaXQgdGVzdHMgdGhhdCB0ZW1wb3JhcmlseSByZWRlZmluZVxuICAvLyB0aGUgdmFsdWUgb2YgcHJvY2Vzcy5wbGF0Zm9ybS5cbiAgaWYgKHByb2Nlc3MucGxhdGZvcm0gPT09ICdkYXJ3aW4nKSB7XG4gICAgLy8gT1MgWCBhcHBzIGRvbid0IGluaGVyaXQgUEFUSCB3aGVuIG5vdCBsYXVuY2hlZCBmcm9tIHRoZSBDTEksIHNvIHJlY29uc3RydWN0IGl0LiBUaGlzIGlzIGFcbiAgICAvLyBidWcsIGZpbGVkIGFnYWluc3QgQXRvbSBMaW50ZXIgaGVyZTogaHR0cHM6Ly9naXRodWIuY29tL0F0b21MaW50ZXIvTGludGVyL2lzc3Vlcy8xNTBcbiAgICAvLyBUT0RPKGpqaWFhKTogcmVtb3ZlIHRoaXMgaGFjayB3aGVuIHRoZSBBdG9tIGlzc3VlIGlzIGNsb3NlZFxuICAgIHBsYXRmb3JtUGF0aFByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBleGVjRmlsZSgnL3Vzci9saWJleGVjL3BhdGhfaGVscGVyJywgWyctcyddLCAoZXJyb3IsIHN0ZG91dCwgc3RkZXJyKSA9PiB7XG4gICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3QgbWF0Y2ggPSBzdGRvdXQubWF0Y2goREFSV0lOX1BBVEhfSEVMUEVSX1JFR0VYUCk7XG4gICAgICAgICAgcmVzb2x2ZSgobWF0Y2ggJiYgbWF0Y2gubGVuZ3RoID4gMSkgPyBtYXRjaFsxXSA6ICcnKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgcGxhdGZvcm1QYXRoUHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZSgnJyk7XG4gIH1cblxuICByZXR1cm4gcGxhdGZvcm1QYXRoUHJvbWlzZTtcbn1cblxuLyoqXG4gKiBTaW5jZSBPUyBYIGFwcHMgZG9uJ3QgaW5oZXJpdCBQQVRIIHdoZW4gbm90IGxhdW5jaGVkIGZyb20gdGhlIENMSSwgdGhpcyBmdW5jdGlvbiBjcmVhdGVzIGEgbmV3XG4gKiBlbnZpcm9ubWVudCBvYmplY3QgZ2l2ZW4gdGhlIG9yaWdpbmFsIGVudmlyb25tZW50IGJ5IG1vZGlmeWluZyB0aGUgZW52LlBBVEggdXNpbmcgZm9sbG93aW5nXG4gKiBsb2dpYzpcbiAqICAxKSBJZiBvcmlnaW5hbEVudi5QQVRIIGRvZXNuJ3QgZXF1YWwgdG8gcHJvY2Vzcy5lbnYuUEFUSCwgd2hpY2ggbWVhbnMgdGhlIFBBVEggaGFzIGJlZW5cbiAqICAgIG1vZGlmaWVkLCB3ZSBzaG91bGRuJ3QgZG8gYW55dGhpbmcuXG4gKiAgMSkgSWYgd2UgYXJlIHJ1bm5pbmcgaW4gT1MgWCwgdXNlIGAvdXNyL2xpYmV4ZWMvcGF0aF9oZWxwZXIgLXNgIHRvIGdldCB0aGUgY29ycmVjdCBQQVRIIGFuZFxuICogICAgUkVQTEFDRSB0aGUgUEFUSC5cbiAqICAyKSBJZiBzdGVwIDEgZmFpbGVkIG9yIHdlIGFyZSBub3QgcnVubmluZyBpbiBPUyBYLCBBUFBFTkQgY29tbW9uQmluYXJ5UGF0aHMgdG8gY3VycmVudCBQQVRILlxuICovXG5hc3luYyBmdW5jdGlvbiBjcmVhdGVFeGVjRW52aXJvbm1lbnQoXG4gIG9yaWdpbmFsRW52OiBPYmplY3QsXG4gIGNvbW1vbkJpbmFyeVBhdGhzOiBBcnJheTxzdHJpbmc+LFxuKTogUHJvbWlzZTxPYmplY3Q+IHtcbiAgY29uc3QgZXhlY0VudiA9IHsuLi5vcmlnaW5hbEVudn07XG5cbiAgaWYgKGV4ZWNFbnYuUEFUSCAhPT0gcHJvY2Vzcy5lbnYuUEFUSCkge1xuICAgIHJldHVybiBleGVjRW52O1xuICB9XG5cbiAgZXhlY0Vudi5QQVRIID0gZXhlY0Vudi5QQVRIIHx8ICcnO1xuXG4gIGxldCBwbGF0Zm9ybVBhdGggPSBudWxsO1xuICB0cnkge1xuICAgIHBsYXRmb3JtUGF0aCA9IGF3YWl0IGdldFBsYXRmb3JtUGF0aCgpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGxvZ0Vycm9yKCdGYWlsZWQgdG8gZ2V0UGxhdGZvcm1QYXRoJywgZXJyb3IpO1xuICB9XG5cbiAgLy8gSWYgdGhlIHBsYXRmb3JtIHJldHVybnMgYSBub24tZW1wdHkgUEFUSCwgdXNlIGl0LiBPdGhlcndpc2UgdXNlIHRoZSBkZWZhdWx0IHNldCBvZiBjb21tb25cbiAgLy8gYmluYXJ5IHBhdGhzLlxuICBpZiAocGxhdGZvcm1QYXRoKSB7XG4gICAgZXhlY0Vudi5QQVRIID0gcGxhdGZvcm1QYXRoO1xuICB9IGVsc2UgaWYgKGNvbW1vbkJpbmFyeVBhdGhzLmxlbmd0aCkge1xuICAgIGNvbnN0IHBhdGhzID0gZXhlY0Vudi5QQVRILnNwbGl0KHBhdGguZGVsaW1pdGVyKTtcbiAgICBjb21tb25CaW5hcnlQYXRocy5mb3JFYWNoKGNvbW1vbkJpbmFyeVBhdGggPT4ge1xuICAgICAgaWYgKHBhdGhzLmluZGV4T2YoY29tbW9uQmluYXJ5UGF0aCkgPT09IC0xKSB7XG4gICAgICAgIHBhdGhzLnB1c2goY29tbW9uQmluYXJ5UGF0aCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgZXhlY0Vudi5QQVRIID0gcGF0aHMuam9pbihwYXRoLmRlbGltaXRlcik7XG4gIH1cblxuICByZXR1cm4gZXhlY0Vudjtcbn1cblxuZnVuY3Rpb24gbG9nRXJyb3IoLi4uYXJncykge1xuICAvLyBDYW4ndCB1c2UgbnVjbGlkZS1sb2dnaW5nIGhlcmUgdG8gbm90IGNhdXNlIGN5Y2xlIGRlcGVuZGVuY3kuXG4gIC8qZXNsaW50LWRpc2FibGUgbm8tY29uc29sZSovXG4gIGNvbnNvbGUuZXJyb3IoLi4uYXJncyk7XG4gIC8qZXNsaW50LWVuYWJsZSBuby1jb25zb2xlKi9cbn1cblxuZnVuY3Rpb24gbW9uaXRvclN0cmVhbUVycm9ycyhwcm9jZXNzOiBjaGlsZF9wcm9jZXNzJENoaWxkUHJvY2VzcywgY29tbWFuZCwgYXJncywgb3B0aW9ucyk6IHZvaWQge1xuICBTVFJFQU1fTkFNRVMuZm9yRWFjaChzdHJlYW1OYW1lID0+IHtcbiAgICAvLyAkRmxvd0lzc3VlXG4gICAgY29uc3Qgc3RyZWFtID0gcHJvY2Vzc1tzdHJlYW1OYW1lXTtcbiAgICBpZiAoc3RyZWFtID09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgc3RyZWFtLm9uKCdlcnJvcicsIGVycm9yID0+IHtcbiAgICAgIC8vIFRoaXMgY2FuIGhhcHBlbiB3aXRob3V0IHRoZSBmdWxsIGV4ZWN1dGlvbiBvZiB0aGUgY29tbWFuZCB0byBmYWlsLFxuICAgICAgLy8gYnV0IHdlIHdhbnQgdG8gbGVhcm4gYWJvdXQgaXQuXG4gICAgICBsb2dFcnJvcihcbiAgICAgICAgYHN0cmVhbSBlcnJvciBvbiBzdHJlYW0gJHtzdHJlYW1OYW1lfSB3aXRoIGNvbW1hbmQ6YCxcbiAgICAgICAgY29tbWFuZCxcbiAgICAgICAgYXJncyxcbiAgICAgICAgb3B0aW9ucyxcbiAgICAgICAgJ2Vycm9yOicsXG4gICAgICAgIGVycm9yLFxuICAgICAgKTtcbiAgICB9KTtcbiAgfSk7XG59XG5cbi8qKlxuICogQmFzaWNhbGx5IGxpa2Ugc3Bhd24sIGV4Y2VwdCBpdCBoYW5kbGVzIGFuZCBsb2dzIGVycm9ycyBpbnN0ZWFkIG9mIGNyYXNoaW5nXG4gKiB0aGUgcHJvY2Vzcy4gVGhpcyBpcyBtdWNoIGxvd2VyLWxldmVsIHRoYW4gYXN5bmNFeGVjdXRlLiBVbmxlc3MgeW91IGhhdmUgYVxuICogc3BlY2lmaWMgcmVhc29uIHlvdSBzaG91bGQgdXNlIGFzeW5jRXhlY3V0ZSBpbnN0ZWFkLlxuICovXG5hc3luYyBmdW5jdGlvbiBzYWZlU3Bhd24oXG4gIGNvbW1hbmQ6IHN0cmluZyxcbiAgYXJncz86IEFycmF5PHN0cmluZz4gPSBbXSxcbiAgb3B0aW9ucz86IE9iamVjdCA9IHt9LFxuKTogUHJvbWlzZTxjaGlsZF9wcm9jZXNzJENoaWxkUHJvY2Vzcz4ge1xuICBvcHRpb25zLmVudiA9IGF3YWl0IGNyZWF0ZUV4ZWNFbnZpcm9ubWVudChvcHRpb25zLmVudiB8fCBwcm9jZXNzLmVudiwgQ09NTU9OX0JJTkFSWV9QQVRIUyk7XG4gIGNvbnN0IGNoaWxkID0gc3Bhd24oY29tbWFuZCwgYXJncywgb3B0aW9ucyk7XG4gIG1vbml0b3JTdHJlYW1FcnJvcnMoY2hpbGQsIGNvbW1hbmQsIGFyZ3MsIG9wdGlvbnMpO1xuICBjaGlsZC5vbignZXJyb3InLCBlcnJvciA9PiB7XG4gICAgbG9nRXJyb3IoJ2Vycm9yIHdpdGggY29tbWFuZDonLCBjb21tYW5kLCBhcmdzLCBvcHRpb25zLCAnZXJyb3I6JywgZXJyb3IpO1xuICB9KTtcbiAgcmV0dXJuIGNoaWxkO1xufVxuXG5hc3luYyBmdW5jdGlvbiBmb3JrV2l0aEV4ZWNFbnZpcm9ubWVudChcbiAgbW9kdWxlUGF0aDogc3RyaW5nLFxuICBhcmdzPzogQXJyYXk8c3RyaW5nPiA9IFtdLFxuICBvcHRpb25zPzogT2JqZWN0ID0ge30sXG4pOiBQcm9taXNlPGNoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzPiB7XG4gIGNvbnN0IGZvcmtPcHRpb25zID0ge1xuICAgIC4uLm9wdGlvbnMsXG4gICAgZW52OiBhd2FpdCBjcmVhdGVFeGVjRW52aXJvbm1lbnQob3B0aW9ucy5lbnYgfHwgcHJvY2Vzcy5lbnYsIENPTU1PTl9CSU5BUllfUEFUSFMpLFxuICB9O1xuICBjb25zdCBjaGlsZCA9IGZvcmsobW9kdWxlUGF0aCwgYXJncywgZm9ya09wdGlvbnMpO1xuICBjaGlsZC5vbignZXJyb3InLCBlcnJvciA9PiB7XG4gICAgbG9nRXJyb3IoJ2Vycm9yIGZyb20gbW9kdWxlOicsIG1vZHVsZVBhdGgsIGFyZ3MsIG9wdGlvbnMsICdlcnJvcjonLCBlcnJvcik7XG4gIH0pO1xuICByZXR1cm4gY2hpbGQ7XG59XG5cbmNvbnN0IGlzT3NYID0gcHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ2Rhcndpbic7XG5cbi8qKlxuICogVGFrZXMgdGhlIGNvbW1hbmQgYW5kIGFyZ3MgdGhhdCB5b3Ugd291bGQgbm9ybWFsbHkgcGFzcyB0byBgc3Bhd24oKWAgYW5kIHJldHVybnMgYG5ld0FyZ3NgIHN1Y2hcbiAqIHRoYXQgeW91IHNob3VsZCBjYWxsIGl0IHdpdGggYHNwYXduKCdzY3JpcHQnLCBuZXdBcmdzKWAgdG8gcnVuIHRoZSBvcmlnaW5hbCBjb21tYW5kL2FyZ3MgcGFpclxuICogdW5kZXIgYHNjcmlwdGAuXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUFyZ3NGb3JTY3JpcHRDb21tYW5kKGNvbW1hbmQ6IHN0cmluZywgYXJncz86IEFycmF5PHN0cmluZz4gPSBbXSk6IEFycmF5PHN0cmluZz4ge1xuICBpZiAoaXNPc1gpIHtcbiAgICAvLyBPbiBPUyBYLCBzY3JpcHQgdGFrZXMgdGhlIHByb2dyYW0gdG8gcnVuIGFuZCBpdHMgYXJndW1lbnRzIGFzIHZhcmFyZ3MgYXQgdGhlIGVuZC5cbiAgICByZXR1cm4gWyctcScsICcvZGV2L251bGwnLCBjb21tYW5kXS5jb25jYXQoYXJncyk7XG4gIH0gZWxzZSB7XG4gICAgLy8gT24gTGludXgsIHNjcmlwdCB0YWtlcyB0aGUgY29tbWFuZCB0byBydW4gYXMgdGhlIC1jIHBhcmFtZXRlci5cbiAgICAvLyBUT0RPOiBTaGVsbCBlc2NhcGUgZXZlcnkgZWxlbWVudCBpbiBhbGxBcmdzLlxuICAgIGNvbnN0IGFsbEFyZ3MgPSBbY29tbWFuZF0uY29uY2F0KGFyZ3MpO1xuICAgIGNvbnN0IGNvbW1hbmRBc0l0c093bkFyZyA9IGFsbEFyZ3Muam9pbignICcpO1xuICAgIHJldHVybiBbJy1xJywgJy9kZXYvbnVsbCcsICctYycsIGNvbW1hbmRBc0l0c093bkFyZ107XG4gIH1cbn1cblxuLyoqXG4gKiBCYXNpY2FsbHkgbGlrZSBzYWZlU3Bhd24sIGJ1dCBydW5zIHRoZSBjb21tYW5kIHdpdGggdGhlIGBzY3JpcHRgIGNvbW1hbmQuXG4gKiBgc2NyaXB0YCBlbnN1cmVzIHRlcm1pbmFsLWxpa2UgZW52aXJvbm1lbnQgYW5kIGNvbW1hbmRzIHdlIHJ1biBnaXZlIGNvbG9yZWQgb3V0cHV0LlxuICovXG5mdW5jdGlvbiBzY3JpcHRTYWZlU3Bhd24oXG4gIGNvbW1hbmQ6IHN0cmluZyxcbiAgYXJncz86IEFycmF5PHN0cmluZz4gPSBbXSxcbiAgb3B0aW9ucz86IE9iamVjdCA9IHt9LFxuKTogUHJvbWlzZTxjaGlsZF9wcm9jZXNzJENoaWxkUHJvY2Vzcz4ge1xuICBjb25zdCBuZXdBcmdzID0gY3JlYXRlQXJnc0ZvclNjcmlwdENvbW1hbmQoY29tbWFuZCwgYXJncyk7XG4gIHJldHVybiBzYWZlU3Bhd24oJ3NjcmlwdCcsIG5ld0FyZ3MsIG9wdGlvbnMpO1xufVxuXG4vKipcbiAqIFdyYXBzIHNjcmlwdFNhZmVTcGF3biB3aXRoIGFuIE9ic2VydmFibGUgdGhhdCBsZXRzIHlvdSBsaXN0ZW4gdG8gdGhlIHN0ZG91dCBhbmRcbiAqIHN0ZGVyciBvZiB0aGUgc3Bhd25lZCBwcm9jZXNzLlxuICovXG5mdW5jdGlvbiBzY3JpcHRTYWZlU3Bhd25BbmRPYnNlcnZlT3V0cHV0KFxuICBjb21tYW5kOiBzdHJpbmcsXG4gIGFyZ3M/OiBBcnJheTxzdHJpbmc+ID0gW10sXG4gIG9wdGlvbnM/OiBPYmplY3QgPSB7fSxcbik6IE9ic2VydmFibGU8e3N0ZGVycj86IHN0cmluZzsgc3Rkb3V0Pzogc3RyaW5nO30+IHtcbiAgcmV0dXJuIE9ic2VydmFibGUuY3JlYXRlKChvYnNlcnZlcjogT2JzZXJ2ZXIpID0+IHtcbiAgICBsZXQgY2hpbGRQcm9jZXNzO1xuICAgIHNjcmlwdFNhZmVTcGF3bihjb21tYW5kLCBhcmdzLCBvcHRpb25zKS50aGVuKHByb2MgPT4ge1xuICAgICAgY2hpbGRQcm9jZXNzID0gcHJvYztcblxuICAgICAgY2hpbGRQcm9jZXNzLnN0ZG91dC5vbignZGF0YScsIGRhdGEgPT4ge1xuICAgICAgICBvYnNlcnZlci5vbk5leHQoe3N0ZG91dDogZGF0YS50b1N0cmluZygpfSk7XG4gICAgICB9KTtcblxuICAgICAgbGV0IHN0ZGVyciA9ICcnO1xuICAgICAgY2hpbGRQcm9jZXNzLnN0ZGVyci5vbignZGF0YScsIGRhdGEgPT4ge1xuICAgICAgICBzdGRlcnIgKz0gZGF0YTtcbiAgICAgICAgb2JzZXJ2ZXIub25OZXh0KHtzdGRlcnI6IGRhdGEudG9TdHJpbmcoKX0pO1xuICAgICAgfSk7XG5cbiAgICAgIGNoaWxkUHJvY2Vzcy5vbignZXhpdCcsIChleGl0Q29kZTogbnVtYmVyKSA9PiB7XG4gICAgICAgIGlmIChleGl0Q29kZSAhPT0gMCkge1xuICAgICAgICAgIG9ic2VydmVyLm9uRXJyb3Ioc3RkZXJyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBvYnNlcnZlci5vbkNvbXBsZXRlZCgpO1xuICAgICAgICB9XG4gICAgICAgIGNoaWxkUHJvY2VzcyA9IG51bGw7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBpZiAoY2hpbGRQcm9jZXNzKSB7XG4gICAgICAgIGNoaWxkUHJvY2Vzcy5raWxsKCk7XG4gICAgICB9XG4gICAgfTtcbiAgfSk7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBvYnNlcnZhYmxlIHdpdGggdGhlIGZvbGxvd2luZyBwcm9wZXJ0aWVzOlxuICpcbiAqIDEuIEl0IGNvbnRhaW5zIGEgcHJvY2VzcyB0aGF0J3MgY3JlYXRlZCB1c2luZyB0aGUgcHJvdmlkZWQgZmFjdG9yeSB1cG9uIHN1YnNjcmlwdGlvbi5cbiAqIDIuIEl0IGRvZXNuJ3QgY29tcGxldGUgdW50aWwgdGhlIHByb2Nlc3MgZXhpdHMuXG4gKiAzLiBUaGUgcHJvY2VzcyBpcyBraWxsZWQgd2hlbiB0aGVyZSBhcmUgbm8gbW9yZSBzdWJzY3JpYmVycy5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlUHJvY2Vzc1N0cmVhbShcbiAgY3JlYXRlUHJvY2VzczogKCkgPT4gY2hpbGRfcHJvY2VzcyRDaGlsZFByb2Nlc3MgfCBQcm9taXNlPGNoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzPixcbik6IE9ic2VydmFibGU8Y2hpbGRfcHJvY2VzcyRDaGlsZFByb2Nlc3M+IHtcbiAgcmV0dXJuIE9ic2VydmFibGUuY3JlYXRlKG9ic2VydmVyID0+IHtcbiAgICBjb25zdCBwcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKGNyZWF0ZVByb2Nlc3MoKSk7XG4gICAgbGV0IHByb2Nlc3M7XG4gICAgbGV0IGRpc3Bvc2VkID0gZmFsc2U7XG4gICAgbGV0IGV4aXRlZCA9IGZhbHNlO1xuICAgIGNvbnN0IG1heWJlS2lsbCA9ICgpID0+IHtcbiAgICAgIGlmIChwcm9jZXNzICE9IG51bGwgJiYgZGlzcG9zZWQgJiYgIWV4aXRlZCkge1xuICAgICAgICBwcm9jZXNzLmtpbGwoKTtcbiAgICAgICAgcHJvY2VzcyA9IG51bGw7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHByb21pc2UudGhlbihwID0+IHtcbiAgICAgIHByb2Nlc3MgPSBwO1xuICAgICAgbWF5YmVLaWxsKCk7XG4gICAgfSk7XG5cbiAgICBjb25zdCBwcm9jZXNzU3RyZWFtID0gT2JzZXJ2YWJsZS5mcm9tUHJvbWlzZShwcm9taXNlKTtcblxuICAgIGNvbnN0IGV4aXQgPSBwcm9jZXNzU3RyZWFtXG4gICAgICAuZmxhdE1hcChwID0+IE9ic2VydmFibGUuZnJvbUV2ZW50KHAsICdleGl0JywgKGNvZGUsIHNpZ25hbCkgPT4gc2lnbmFsKSlcbiAgICAgIC8vIEFuIGV4aXQgc2lnbmFsIGZyb20gU0lHVVNSMSBkb2Vzbid0IGFjdHVhbGx5IGV4aXQgdGhlIHByb2Nlc3MsIHNvIHNraXAgdGhhdC5cbiAgICAgIC5maWx0ZXIoc2lnbmFsID0+IHNpZ25hbCAhPT0gJ1NJR1VTUjEnKVxuICAgICAgLnRhcCgoKSA9PiB7IGV4aXRlZCA9IHRydWU7IH0pO1xuXG4gICAgcmV0dXJuIG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKFxuICAgICAgLy8gQSB2ZXJzaW9uIG9mIHByb2Nlc3NTdHJlYW0gdGhhdCBuZXZlciBjb21wbGV0ZXMuLi5cbiAgICAgIE9ic2VydmFibGUubWVyZ2UocHJvY2Vzc1N0cmVhbSwgT2JzZXJ2YWJsZS5jcmVhdGUoKCkgPT4ge30pKVxuICAgICAgICAvLyAuLi53aGljaCB3ZSB0YWtlIHVudGlsIHRoZSBwcm9jZXNzIGV4aXRzLlxuICAgICAgICAudGFrZVVudGlsKGV4aXQpXG4gICAgICAgIC5zdWJzY3JpYmUob2JzZXJ2ZXIpLFxuICAgICAgbmV3IERpc3Bvc2FibGUoKCkgPT4geyBkaXNwb3NlZCA9IHRydWU7IG1heWJlS2lsbCgpOyB9KSxcbiAgICApO1xuICB9KS5zaGFyZSgpO1xufVxuXG4vKipcbiAqIE9ic2VydmUgdGhlIHN0ZG91dCwgc3RkZXJyIGFuZCBleGl0IGNvZGUgb2YgYSBwcm9jZXNzLlxuICogc3Rkb3V0IGFuZCBzdGRlcnIgYXJlIHNwbGl0IGJ5IG5ld2xpbmVzLlxuICovXG5mdW5jdGlvbiBvYnNlcnZlUHJvY2Vzc0V4aXQoXG4gIGNyZWF0ZVByb2Nlc3M6ICgpID0+IGNoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzIHwgUHJvbWlzZTxjaGlsZF9wcm9jZXNzJENoaWxkUHJvY2Vzcz4sXG4pOiBPYnNlcnZhYmxlPG51bWJlcj4ge1xuICByZXR1cm4gY3JlYXRlUHJvY2Vzc1N0cmVhbShjcmVhdGVQcm9jZXNzKVxuICAgIC5mbGF0TWFwKHByb2Nlc3MgPT4gT2JzZXJ2YWJsZS5mcm9tRXZlbnQocHJvY2VzcywgJ2V4aXQnKS50YWtlKDEpKTtcbn1cblxuZnVuY3Rpb24gZ2V0T3V0cHV0U3RyZWFtKFxuICBjaGlsZFByb2Nlc3M6IGNoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzIHwgUHJvbWlzZTxjaGlsZF9wcm9jZXNzJENoaWxkUHJvY2Vzcz4sXG4pOiBPYnNlcnZhYmxlPFByb2Nlc3NNZXNzYWdlPiB7XG4gIHJldHVybiBPYnNlcnZhYmxlLmZyb21Qcm9taXNlKFByb21pc2UucmVzb2x2ZShjaGlsZFByb2Nlc3MpKVxuICAgIC5mbGF0TWFwKHByb2Nlc3MgPT4ge1xuICAgICAgaW52YXJpYW50KHByb2Nlc3MgIT0gbnVsbCwgJ3Byb2Nlc3MgaGFzIG5vdCB5ZXQgYmVlbiBkaXNwb3NlZCcpO1xuICAgICAgLy8gVXNlIHJlcGxheS9jb25uZWN0IG9uIGV4aXQgZm9yIHRoZSBmaW5hbCBjb25jYXQuXG4gICAgICAvLyBCeSBkZWZhdWx0IGNvbmNhdCBkZWZlcnMgc3Vic2NyaXB0aW9uIHVudGlsIGFmdGVyIHRoZSBMSFMgY29tcGxldGVzLlxuICAgICAgY29uc3QgZXhpdCA9IE9ic2VydmFibGUuZnJvbUV2ZW50KHByb2Nlc3MsICdleGl0JykudGFrZSgxKS5cbiAgICAgICAgbWFwKGV4aXRDb2RlID0+ICh7a2luZDogJ2V4aXQnLCBleGl0Q29kZX0pKS5yZXBsYXkoKTtcbiAgICAgIGV4aXQuY29ubmVjdCgpO1xuICAgICAgY29uc3QgZXJyb3IgPSBPYnNlcnZhYmxlLmZyb21FdmVudChwcm9jZXNzLCAnZXJyb3InKS5cbiAgICAgICAgdGFrZVVudGlsKGV4aXQpLlxuICAgICAgICBtYXAoZXJyb3JPYmogPT4gKHtraW5kOiAnZXJyb3InLCBlcnJvcjogZXJyb3JPYmp9KSk7XG4gICAgICBjb25zdCBzdGRvdXQgPSBzcGxpdFN0cmVhbShvYnNlcnZlU3RyZWFtKHByb2Nlc3Muc3Rkb3V0KSkuXG4gICAgICAgIG1hcChkYXRhID0+ICh7a2luZDogJ3N0ZG91dCcsIGRhdGF9KSk7XG4gICAgICBjb25zdCBzdGRlcnIgPSBzcGxpdFN0cmVhbShvYnNlcnZlU3RyZWFtKHByb2Nlc3Muc3RkZXJyKSkuXG4gICAgICAgIG1hcChkYXRhID0+ICh7a2luZDogJ3N0ZGVycicsIGRhdGF9KSk7XG4gICAgICByZXR1cm4gc3Rkb3V0Lm1lcmdlKHN0ZGVycikubWVyZ2UoZXJyb3IpLmNvbmNhdChleGl0KTtcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBPYnNlcnZlIHRoZSBzdGRvdXQsIHN0ZGVyciBhbmQgZXhpdCBjb2RlIG9mIGEgcHJvY2Vzcy5cbiAqL1xuZnVuY3Rpb24gb2JzZXJ2ZVByb2Nlc3MoXG4gIGNyZWF0ZVByb2Nlc3M6ICgpID0+IGNoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzIHwgUHJvbWlzZTxjaGlsZF9wcm9jZXNzJENoaWxkUHJvY2Vzcz4sXG4pOiBPYnNlcnZhYmxlPFByb2Nlc3NNZXNzYWdlPiB7XG4gIHJldHVybiBjcmVhdGVQcm9jZXNzU3RyZWFtKGNyZWF0ZVByb2Nlc3MpLmZsYXRNYXAoZ2V0T3V0cHV0U3RyZWFtKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIHRoZSByZXN1bHQgb2YgZXhlY3V0aW5nIGEgcHJvY2Vzcy5cbiAqXG4gKiBAcGFyYW0gY29tbWFuZCBUaGUgY29tbWFuZCB0byBleGVjdXRlLlxuICogQHBhcmFtIGFyZ3MgVGhlIGFyZ3VtZW50cyB0byBwYXNzIHRvIHRoZSBjb21tYW5kLlxuICogQHBhcmFtIG9wdGlvbnMgT3B0aW9ucyBmb3IgY2hhbmdpbmcgaG93IHRvIHJ1biB0aGUgY29tbWFuZC5cbiAqICAgICBTZWUgaGVyZTogaHR0cDovL25vZGVqcy5vcmcvYXBpL2NoaWxkX3Byb2Nlc3MuaHRtbFxuICogICAgIFRoZSBhZGRpdGlvbmFsIG9wdGlvbnMgd2UgcHJvdmlkZTpcbiAqICAgICAgIHF1ZXVlTmFtZSBzdHJpbmcgVGhlIHF1ZXVlIG9uIHdoaWNoIHRvIGJsb2NrIGRlcGVuZGVudCBjYWxscy5cbiAqICAgICAgIHN0ZGluIHN0cmluZyBUaGUgY29udGVudHMgdG8gd3JpdGUgdG8gc3RkaW4uXG4gKiAgICAgICBwaXBlZENvbW1hbmQgc3RyaW5nIGEgY29tbWFuZCB0byBwaXBlIHRoZSBvdXRwdXQgb2YgY29tbWFuZCB0aHJvdWdoLlxuICogICAgICAgcGlwZWRBcmdzIGFycmF5IG9mIHN0cmluZ3MgYXMgYXJndW1lbnRzLlxuICogQHJldHVybiBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgdG8gYW4gb2JqZWN0IHdpdGggdGhlIHByb3BlcnRpZXM6XG4gKiAgICAgc3Rkb3V0IHN0cmluZyBUaGUgY29udGVudHMgb2YgdGhlIHByb2Nlc3MncyBvdXRwdXQgc3RyZWFtLlxuICogICAgIHN0ZGVyciBzdHJpbmcgVGhlIGNvbnRlbnRzIG9mIHRoZSBwcm9jZXNzJ3MgZXJyb3Igc3RyZWFtLlxuICogICAgIGV4aXRDb2RlIG51bWJlciBUaGUgZXhpdCBjb2RlIHJldHVybmVkIGJ5IHRoZSBwcm9jZXNzLlxuICovXG5mdW5jdGlvbiBjaGVja091dHB1dChcbiAgICBjb21tYW5kOiBzdHJpbmcsXG4gICAgYXJnczogQXJyYXk8c3RyaW5nPixcbiAgICBvcHRpb25zOiA/T2JqZWN0ID0ge30pOiBQcm9taXNlPHByb2Nlc3MkYXN5bmNFeGVjdXRlUmV0PiB7XG4gIC8vIENsb25lIHBhc3NlZCBpbiBvcHRpb25zIHNvIHRoaXMgZnVuY3Rpb24gZG9lc24ndCBtb2RpZnkgYW4gb2JqZWN0IGl0IGRvZXNuJ3Qgb3duLlxuICBjb25zdCBsb2NhbE9wdGlvbnMgPSB7Li4ub3B0aW9uc307XG5cbiAgY29uc3QgZXhlY3V0b3IgPSAocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgbGV0IGZpcnN0Q2hpbGQ7XG4gICAgbGV0IGxhc3RDaGlsZDtcblxuICAgIGxldCBmaXJzdENoaWxkU3RkZXJyO1xuICAgIGlmIChsb2NhbE9wdGlvbnMucGlwZWRDb21tYW5kKSB7XG4gICAgICAvLyBJZiBhIHNlY29uZCBjb21tYW5kIGlzIGdpdmVuLCBwaXBlIHN0ZG91dCBvZiBmaXJzdCB0byBzdGRpbiBvZiBzZWNvbmQuIFN0cmluZyBvdXRwdXRcbiAgICAgIC8vIHJldHVybmVkIGluIHRoaXMgZnVuY3Rpb24ncyBQcm9taXNlIHdpbGwgYmUgc3RkZXJyL3N0ZG91dCBvZiB0aGUgc2Vjb25kIGNvbW1hbmQuXG4gICAgICBmaXJzdENoaWxkID0gc3Bhd24oY29tbWFuZCwgYXJncywgbG9jYWxPcHRpb25zKTtcbiAgICAgIG1vbml0b3JTdHJlYW1FcnJvcnMoZmlyc3RDaGlsZCwgY29tbWFuZCwgYXJncywgbG9jYWxPcHRpb25zKTtcbiAgICAgIGZpcnN0Q2hpbGRTdGRlcnIgPSAnJztcblxuICAgICAgZmlyc3RDaGlsZC5vbignZXJyb3InLCBlcnJvciA9PiB7XG4gICAgICAgIC8vIFJlamVjdCBlYXJseSB3aXRoIHRoZSByZXN1bHQgd2hlbiBlbmNvdW50ZXJpbmcgYW4gZXJyb3IuXG4gICAgICAgIHJlamVjdCh7XG4gICAgICAgICAgY29tbWFuZDogW2NvbW1hbmRdLmNvbmNhdChhcmdzKS5qb2luKCcgJyksXG4gICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvci5tZXNzYWdlLFxuICAgICAgICAgIGV4aXRDb2RlOiBlcnJvci5jb2RlLFxuICAgICAgICAgIHN0ZGVycjogZmlyc3RDaGlsZFN0ZGVycixcbiAgICAgICAgICBzdGRvdXQ6ICcnLFxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgICBmaXJzdENoaWxkLnN0ZGVyci5vbignZGF0YScsIGRhdGEgPT4ge1xuICAgICAgICBmaXJzdENoaWxkU3RkZXJyICs9IGRhdGE7XG4gICAgICB9KTtcblxuICAgICAgbGFzdENoaWxkID0gc3Bhd24obG9jYWxPcHRpb25zLnBpcGVkQ29tbWFuZCwgbG9jYWxPcHRpb25zLnBpcGVkQXJncywgbG9jYWxPcHRpb25zKTtcbiAgICAgIG1vbml0b3JTdHJlYW1FcnJvcnMobGFzdENoaWxkLCBjb21tYW5kLCBhcmdzLCBsb2NhbE9wdGlvbnMpO1xuICAgICAgLy8gcGlwZSgpIG5vcm1hbGx5IHBhdXNlcyB0aGUgd3JpdGVyIHdoZW4gdGhlIHJlYWRlciBlcnJvcnMgKGNsb3NlcykuXG4gICAgICAvLyBUaGlzIGlzIG5vdCBob3cgVU5JWCBwaXBlcyB3b3JrOiBpZiB0aGUgcmVhZGVyIGNsb3NlcywgdGhlIHdyaXRlciBuZWVkc1xuICAgICAgLy8gdG8gYWxzbyBjbG9zZSAob3RoZXJ3aXNlIHRoZSB3cml0ZXIgcHJvY2VzcyBtYXkgaGFuZy4pXG4gICAgICAvLyBXZSBoYXZlIHRvIG1hbnVhbGx5IGNsb3NlIHRoZSB3cml0ZXIgaW4gdGhpcyBjYXNlLlxuICAgICAgbGFzdENoaWxkLnN0ZGluLm9uKCdlcnJvcicsICgpID0+IHtcbiAgICAgICAgZmlyc3RDaGlsZC5zdGRvdXQuZW1pdCgnZW5kJyk7XG4gICAgICB9KTtcbiAgICAgIGZpcnN0Q2hpbGQuc3Rkb3V0LnBpcGUobGFzdENoaWxkLnN0ZGluKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGFzdENoaWxkID0gc3Bhd24oY29tbWFuZCwgYXJncywgbG9jYWxPcHRpb25zKTtcbiAgICAgIG1vbml0b3JTdHJlYW1FcnJvcnMobGFzdENoaWxkLCBjb21tYW5kLCBhcmdzLCBsb2NhbE9wdGlvbnMpO1xuICAgICAgZmlyc3RDaGlsZCA9IGxhc3RDaGlsZDtcbiAgICB9XG5cbiAgICBsZXQgc3RkZXJyID0gJyc7XG4gICAgbGV0IHN0ZG91dCA9ICcnO1xuICAgIGxhc3RDaGlsZC5vbignY2xvc2UnLCBleGl0Q29kZSA9PiB7XG4gICAgICByZXNvbHZlKHtcbiAgICAgICAgZXhpdENvZGUsXG4gICAgICAgIHN0ZGVycixcbiAgICAgICAgc3Rkb3V0LFxuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBsYXN0Q2hpbGQub24oJ2Vycm9yJywgZXJyb3IgPT4ge1xuICAgICAgLy8gUmVqZWN0IGVhcmx5IHdpdGggdGhlIHJlc3VsdCB3aGVuIGVuY291bnRlcmluZyBhbiBlcnJvci5cbiAgICAgIHJlamVjdCh7XG4gICAgICAgIGNvbW1hbmQ6IFtjb21tYW5kXS5jb25jYXQoYXJncykuam9pbignICcpLFxuICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UsXG4gICAgICAgIGV4aXRDb2RlOiBlcnJvci5jb2RlLFxuICAgICAgICBzdGRlcnIsXG4gICAgICAgIHN0ZG91dCxcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgbGFzdENoaWxkLnN0ZGVyci5vbignZGF0YScsIGRhdGEgPT4ge1xuICAgICAgc3RkZXJyICs9IGRhdGE7XG4gICAgfSk7XG4gICAgbGFzdENoaWxkLnN0ZG91dC5vbignZGF0YScsIGRhdGEgPT4ge1xuICAgICAgc3Rkb3V0ICs9IGRhdGE7XG4gICAgfSk7XG5cbiAgICBpZiAodHlwZW9mIGxvY2FsT3B0aW9ucy5zdGRpbiA9PT0gJ3N0cmluZycpIHtcbiAgICAgIC8vIE5vdGUgdGhhdCB0aGUgTm9kZSBkb2NzIGhhdmUgdGhpcyBzY2FyeSB3YXJuaW5nIGFib3V0IHN0ZGluLmVuZCgpIG9uXG4gICAgICAvLyBodHRwOi8vbm9kZWpzLm9yZy9hcGkvY2hpbGRfcHJvY2Vzcy5odG1sI2NoaWxkX3Byb2Nlc3NfY2hpbGRfc3RkaW46XG4gICAgICAvL1xuICAgICAgLy8gXCJBIFdyaXRhYmxlIFN0cmVhbSB0aGF0IHJlcHJlc2VudHMgdGhlIGNoaWxkIHByb2Nlc3MncyBzdGRpbi4gQ2xvc2luZ1xuICAgICAgLy8gdGhpcyBzdHJlYW0gdmlhIGVuZCgpIG9mdGVuIGNhdXNlcyB0aGUgY2hpbGQgcHJvY2VzcyB0byB0ZXJtaW5hdGUuXCJcbiAgICAgIC8vXG4gICAgICAvLyBJbiBwcmFjdGljZSwgdGhpcyBoYXMgbm90IGFwcGVhcmVkIHRvIGNhdXNlIGFueSBpc3N1ZXMgdGh1cyBmYXIuXG4gICAgICBmaXJzdENoaWxkLnN0ZGluLndyaXRlKGxvY2FsT3B0aW9ucy5zdGRpbik7XG4gICAgICBmaXJzdENoaWxkLnN0ZGluLmVuZCgpO1xuICAgIH1cbiAgfTtcblxuICBmdW5jdGlvbiBtYWtlUHJvbWlzZSgpOiBQcm9taXNlPHByb2Nlc3MkYXN5bmNFeGVjdXRlUmV0PiB7XG4gICAgaWYgKGxvY2FsT3B0aW9ucy5xdWV1ZU5hbWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGV4ZWN1dG9yKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKCFibG9ja2luZ1F1ZXVlc1tsb2NhbE9wdGlvbnMucXVldWVOYW1lXSkge1xuICAgICAgICBibG9ja2luZ1F1ZXVlc1tsb2NhbE9wdGlvbnMucXVldWVOYW1lXSA9IG5ldyBQcm9taXNlUXVldWUoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBibG9ja2luZ1F1ZXVlc1tsb2NhbE9wdGlvbnMucXVldWVOYW1lXS5zdWJtaXQoZXhlY3V0b3IpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBjcmVhdGVFeGVjRW52aXJvbm1lbnQobG9jYWxPcHRpb25zLmVudiB8fCBwcm9jZXNzLmVudiwgQ09NTU9OX0JJTkFSWV9QQVRIUykudGhlbihcbiAgICB2YWwgPT4ge1xuICAgICAgbG9jYWxPcHRpb25zLmVudiA9IHZhbDtcbiAgICAgIHJldHVybiBtYWtlUHJvbWlzZSgpO1xuICAgIH0sXG4gICAgZXJyb3IgPT4ge1xuICAgICAgbG9jYWxPcHRpb25zLmVudiA9IGxvY2FsT3B0aW9ucy5lbnYgfHwgcHJvY2Vzcy5lbnY7XG4gICAgICByZXR1cm4gbWFrZVByb21pc2UoKTtcbiAgICB9XG4gICk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGFzeW5jRXhlY3V0ZShcbiAgICBjb21tYW5kOiBzdHJpbmcsXG4gICAgYXJnczogQXJyYXk8c3RyaW5nPixcbiAgICBvcHRpb25zOiA/T2JqZWN0ID0ge30pOiBQcm9taXNlPHByb2Nlc3MkYXN5bmNFeGVjdXRlUmV0PiB7XG4gIC8qICRGbG93SXNzdWUgKHQ4MjE2MTg5KSAqL1xuICBjb25zdCByZXN1bHQgPSBhd2FpdCBjaGVja091dHB1dChjb21tYW5kLCBhcmdzLCBvcHRpb25zKTtcbiAgaWYgKHJlc3VsdC5leGl0Q29kZSAhPT0gMCkge1xuICAgIC8vIER1Y2sgdHlwaW5nIEVycm9yLlxuICAgIHJlc3VsdFsnbmFtZSddID0gJ0FzeW5jIEV4ZWN1dGlvbiBFcnJvcic7XG4gICAgcmVzdWx0WydtZXNzYWdlJ10gPVxuICAgICAgICBgZXhpdENvZGU6ICR7cmVzdWx0LmV4aXRDb2RlfSwgc3RkZXJyOiAke3Jlc3VsdC5zdGRlcnJ9LCBzdGRvdXQ6ICR7cmVzdWx0LnN0ZG91dH0uYDtcbiAgICB0aHJvdyByZXN1bHQ7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGFzeW5jRXhlY3V0ZSxcbiAgY3JlYXRlQXJnc0ZvclNjcmlwdENvbW1hbmQsXG4gIGNyZWF0ZVByb2Nlc3NTdHJlYW0sXG4gIGNoZWNrT3V0cHV0LFxuICBmb3JrV2l0aEV4ZWNFbnZpcm9ubWVudCxcbiAgZ2V0T3V0cHV0U3RyZWFtLFxuICBzYWZlU3Bhd24sXG4gIHNjcmlwdFNhZmVTcGF3bixcbiAgc2NyaXB0U2FmZVNwYXduQW5kT2JzZXJ2ZU91dHB1dCxcbiAgY3JlYXRlRXhlY0Vudmlyb25tZW50LFxuICBvYnNlcnZlUHJvY2Vzc0V4aXQsXG4gIG9ic2VydmVQcm9jZXNzLFxuICBDT01NT05fQklOQVJZX1BBVEhTLFxuICBfX3Rlc3RfXzoge1xuICAgIERBUldJTl9QQVRIX0hFTFBFUl9SRUdFWFAsXG4gIH0sXG59O1xuIl19