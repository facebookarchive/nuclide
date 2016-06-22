Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _get = function get(_x14, _x15, _x16) { var _again = true; _function: while (_again) { var object = _x14, property = _x15, receiver = _x16; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x14 = parent; _x15 = property; _x16 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

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
      var paths = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.splitPathList(execEnv.PATH);
      commonBinaryPaths.forEach(function (commonBinaryPath) {
        if (paths.indexOf(commonBinaryPath) === -1) {
          paths.push(commonBinaryPath);
        }
      });
      execEnv.PATH = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.joinPathList(paths);
    })();
  }

  return execEnv;
});

exports.createExecEnvironment = createExecEnvironment;

/**
 * Basically like spawn, except it handles and logs errors instead of crashing
 * the process. This is much lower-level than asyncExecute. Unless you have a
 * specific reason you should use asyncExecute instead.
 */

var safeSpawn = _asyncToGenerator(function* (command) {
  var args = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];
  var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  options.env = yield createExecEnvironment(options.env || process.env, COMMON_BINARY_PATHS);
  var child = (_child_process2 || _child_process()).default.spawn(command, args, options);
  monitorStreamErrors(child, command, args, options);
  child.on('error', function (error) {
    logError('error with command:', command, args, options, 'error:', error);
  });
  return child;
});

exports.safeSpawn = safeSpawn;

var forkWithExecEnvironment = _asyncToGenerator(function* (modulePath) {
  var args = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];
  var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  var forkOptions = _extends({}, options, {
    env: yield createExecEnvironment(options.env || process.env, COMMON_BINARY_PATHS)
  });
  var child = (_child_process2 || _child_process()).default.fork(modulePath, args, forkOptions);
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

exports.forkWithExecEnvironment = forkWithExecEnvironment;
exports.createArgsForScriptCommand = createArgsForScriptCommand;
exports.scriptSafeSpawn = scriptSafeSpawn;
exports.scriptSafeSpawnAndObserveOutput = scriptSafeSpawnAndObserveOutput;
exports.createProcessStream = createProcessStream;
exports.observeProcessExit = observeProcessExit;
exports.getOutputStream = getOutputStream;
exports.observeProcess = observeProcess;
exports.asyncExecute = asyncExecute;

/**
 * Simple wrapper around asyncExecute that throws if the exitCode is non-zero.
 */

var checkOutput = _asyncToGenerator(function* (command, args) {
  var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  var result = yield asyncExecute(command, args, options);
  if (result.exitCode !== 0) {
    var reason = result.exitCode != null ? 'exitCode: ' + result.exitCode : 'error: ' + result.errorMessage;
    throw new Error('asyncExecute "' + command + '" failed with ' + reason + ', ' + ('stderr: ' + result.stderr + ', stdout: ' + result.stdout + '.'));
  }
  return result;
}

/**
 * Run a command, accumulate the output. Errors are surfaced as stream errors and unsubscribing will
 * kill the process.
 */
);

exports.checkOutput = checkOutput;
exports.runCommand = runCommand;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _child_process2;

function _child_process() {
  return _child_process2 = _interopRequireDefault(require('child_process'));
}

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../nuclide-remote-uri'));
}

var _stream2;

function _stream() {
  return _stream2 = require('./stream');
}

var _rxjsBundlesRxUmdMinJs2;

function _rxjsBundlesRxUmdMinJs() {
  return _rxjsBundlesRxUmdMinJs2 = require('rxjs/bundles/Rx.umd.min.js');
}

var _promiseExecutors2;

function _promiseExecutors() {
  return _promiseExecutors2 = require('./promise-executors');
}

var _shellQuote2;

function _shellQuote() {
  return _shellQuote2 = require('shell-quote');
}

var ProcessSystemError = (function (_Error) {
  _inherits(ProcessSystemError, _Error);

  function ProcessSystemError(opts) {
    _classCallCheck(this, ProcessSystemError);

    _get(Object.getPrototypeOf(ProcessSystemError.prototype), 'constructor', this).call(this, '"' + opts.command + '" failed with code ' + opts.code);
    this.name = 'ProcessSystemError';
    this.command = opts.command;
    this.args = opts.args;
    this.options = opts.options;
    this.code = opts.code;
    this.originalError = opts.originalError;
  }

  return ProcessSystemError;
})(Error);

exports.ProcessSystemError = ProcessSystemError;

var ProcessExitError = (function (_Error2) {
  _inherits(ProcessExitError, _Error2);

  function ProcessExitError(opts) {
    _classCallCheck(this, ProcessExitError);

    _get(Object.getPrototypeOf(ProcessExitError.prototype), 'constructor', this).call(this, '"' + opts.command + '" failed with code ' + opts.code + '\n\n' + opts.stderr);
    this.name = 'ProcessExitError';
    this.command = opts.command;
    this.args = opts.args;
    this.options = opts.options;
    this.code = opts.code;
    this.stdout = opts.stdout;
    this.stderr = opts.stderr;
  }

  return ProcessExitError;
})(Error);

exports.ProcessExitError = ProcessExitError;

var platformPathPromise = undefined;

var blockingQueues = {};
var COMMON_BINARY_PATHS = ['/usr/bin', '/bin', '/usr/sbin', '/sbin', '/usr/local/bin'];

/**
 * Captures the value of the PATH env variable returned by Darwin's (OS X) `path_helper` utility.
 * `path_helper -s`'s return value looks like this:
 *
 *     PATH="/usr/bin"; export PATH;
 */
var DARWIN_PATH_HELPER_REGEXP = /PATH="([^"]+)"/;

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
      (_child_process2 || _child_process()).default.execFile('/usr/libexec/path_helper', ['-s'], function (error, stdout, stderr) {
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
function createArgsForScriptCommand(command) {
  var args = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

  if (process.platform === 'darwin') {
    // On OS X, script takes the program to run and its arguments as varargs at the end.
    return ['-q', '/dev/null', command].concat(args);
  } else {
    // On Linux, script takes the command to run as the -c parameter.
    var allArgs = [command].concat(args);
    return ['-q', '/dev/null', '-c', (0, (_shellQuote2 || _shellQuote()).quote)(allArgs)];
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

  return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.create(function (observer) {
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
 *
 * IMPORTANT: The exit event does NOT mean that all stdout and stderr events have been received.
 */
function _createProcessStream(createProcess, throwOnError) {
  return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.create(function (observer) {
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

    // Create a stream that contains the process but never completes. We'll use this to build the
    // completion conditions.
    var processStream = (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.fromPromise(promise).merge((_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.never());

    var errors = processStream.switchMap(function (p) {
      return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.fromEvent(p, 'error');
    });
    var exit = processStream.flatMap(function (p) {
      return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.fromEvent(p, 'exit', function (code, signal) {
        return signal;
      });
    })
    // An exit signal from SIGUSR1 doesn't actually exit the process, so skip that.
    .filter(function (signal) {
      return signal !== 'SIGUSR1';
    }).do(function () {
      exited = true;
    });
    var completion = throwOnError ? exit : exit.race(errors);

    return new (_stream2 || _stream()).CompositeSubscription(processStream.merge(throwOnError ? errors.flatMap((_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.throw) : (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.empty()).takeUntil(completion).subscribe(observer), function () {
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
    return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.fromEvent(process, 'exit').take(1);
  });
}

function getOutputStream(childProcess) {
  return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.fromPromise(Promise.resolve(childProcess)).flatMap(function (process) {
    // We need to start listening for the exit event immediately, but defer emitting it until the
    // output streams end.
    var exit = (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.fromEvent(process, 'exit').take(1).map(function (exitCode) {
      return { kind: 'exit', exitCode: exitCode };
    }).publishReplay();
    var exitSub = exit.connect();

    var error = (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.fromEvent(process, 'error').map(function (errorObj) {
      return { kind: 'error', error: errorObj };
    });
    var stdout = (0, (_stream2 || _stream()).splitStream)((0, (_stream2 || _stream()).observeStream)(process.stdout)).map(function (data) {
      return { kind: 'stdout', data: data };
    });
    var stderr = (0, (_stream2 || _stream()).splitStream)((0, (_stream2 || _stream()).observeStream)(process.stderr)).map(function (data) {
      return { kind: 'stderr', data: data };
    });

    return (0, (_stream2 || _stream()).takeWhileInclusive)((_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.merge((_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.merge(stdout, stderr).concat(exit), error), function (event) {
      return event.kind !== 'error' && event.kind !== 'exit';
    }).finally(function () {
      exitSub.unsubscribe();
    });
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
 *     Supports the options listed here: http://nodejs.org/api/child_process.html
 *     in addition to the custom options listed in AsyncExecuteOptions.
 */

function asyncExecute(command, args) {
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
      firstChild = (_child_process2 || _child_process()).default.spawn(command, args, localOptions);
      monitorStreamErrors(firstChild, command, args, localOptions);
      firstChildStderr = '';

      firstChild.on('error', function (error) {
        // Resolve early with the result when encountering an error.
        resolve({
          command: [command].concat(args).join(' '),
          errorMessage: error.message,
          errorCode: error.code,
          stderr: firstChildStderr,
          stdout: ''
        });
      });

      if (firstChild.stderr != null) {
        firstChild.stderr.on('data', function (data) {
          firstChildStderr += data;
        });
      }

      lastChild = (_child_process2 || _child_process()).default.spawn(localOptions.pipedCommand, localOptions.pipedArgs, localOptions);
      monitorStreamErrors(lastChild, command, args, localOptions);
      // pipe() normally pauses the writer when the reader errors (closes).
      // This is not how UNIX pipes work: if the reader closes, the writer needs
      // to also close (otherwise the writer process may hang.)
      // We have to manually close the writer in this case.
      if (lastChild.stdin != null && firstChild.stdout != null) {
        lastChild.stdin.on('error', function () {
          firstChild.stdout.emit('end');
        });
        firstChild.stdout.pipe(lastChild.stdin);
      }
    } else {
      lastChild = (_child_process2 || _child_process()).default.spawn(command, args, localOptions);
      monitorStreamErrors(lastChild, command, args, localOptions);
      firstChild = lastChild;
    }

    var stderr = '';
    var stdout = '';
    var timeout = null;
    if (localOptions.timeout != null) {
      timeout = setTimeout(function () {
        // Prevent the other handlers from firing.
        lastChild.removeAllListeners();
        lastChild.kill();
        resolve({
          command: [command].concat(args).join(' '),
          errorMessage: 'Exceeded timeout of ' + localOptions.timeout + 'ms',
          errorCode: 'ETIMEDOUT',
          stderr: stderr,
          stdout: stdout
        });
      }, localOptions.timeout);
    }

    lastChild.on('close', function (exitCode) {
      resolve({
        exitCode: exitCode,
        stderr: stderr,
        stdout: stdout
      });
      if (timeout != null) {
        clearTimeout(timeout);
      }
    });

    lastChild.on('error', function (error) {
      // Return early with the result when encountering an error.
      resolve({
        command: [command].concat(args).join(' '),
        errorMessage: error.message,
        errorCode: error.code,
        stderr: stderr,
        stdout: stdout
      });
      if (timeout != null) {
        clearTimeout(timeout);
      }
    });

    if (lastChild.stderr != null) {
      lastChild.stderr.on('data', function (data) {
        stderr += data;
      });
    }
    if (lastChild.stdout != null) {
      lastChild.stdout.on('data', function (data) {
        stdout += data;
      });
    }

    if (typeof localOptions.stdin === 'string' && firstChild.stdin != null) {
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
        blockingQueues[localOptions.queueName] = new (_promiseExecutors2 || _promiseExecutors()).PromiseQueue();
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

function runCommand(command) {
  var args = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];
  var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  return observeProcess(function () {
    return safeSpawn(command, args, options);
  }).reduce(function (acc, event) {
    switch (event.kind) {
      case 'stdout':
        acc.stdout += event.data;
        break;
      case 'stderr':
        acc.stderr += event.data;
        break;
      case 'error':
        acc.error = event.error;
        break;
      case 'exit':
        acc.exitCode = event.exitCode;
        break;
    }
    return acc;
  }, { error: null, stdout: '', stderr: '', exitCode: null }).map(function (acc) {
    if (acc.error != null) {
      throw new ProcessSystemError({
        command: command,
        args: args,
        options: options,
        code: acc.error.code, // Alias of errno
        originalError: acc.error });
    }
    // Just in case.
    if (acc.exitCode != null && acc.exitCode !== 0) {
      throw new ProcessExitError({
        command: command,
        args: args,
        options: options,
        code: acc.exitCode,
        stdout: acc.stdout,
        stderr: acc.stderr
      });
    }
    return acc.stdout;
  });
}

var __test__ = {
  DARWIN_PATH_HELPER_REGEXP: DARWIN_PATH_HELPER_REGEXP
};
exports.__test__ = __test__;

// If the process fails to even start up, exitCode will not be set
// and errorCode / errorMessage will contain the actual error message.
// Otherwise, exitCode will always be defined.

// The queue on which to block dependent calls.

// The contents to write to stdin.

// A command to pipe output through.

// Arguments to the piped command.

// Timeout (in milliseconds).