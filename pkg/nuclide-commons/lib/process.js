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
//# sourceMappingURL=data:application/json;base64,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LFdBQU8sV0FBVyxFQUFFLENBQUM7R0FDdEIsRUFDRCxVQUFBLEtBQUssRUFBSTtBQUNQLGdCQUFZLENBQUMsR0FBRyxHQUFHLFlBQVksQ0FBQyxHQUFHLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQztBQUNuRCxXQUFPLFdBQVcsRUFBRSxDQUFDO0dBQ3RCLENBQ0YsQ0FBQztDQUNIOztBQWtCRCxNQUFNLENBQUMsT0FBTyxHQUFHO0FBQ2YsY0FBWSxFQUFaLFlBQVk7QUFDWiw0QkFBMEIsRUFBMUIsMEJBQTBCO0FBQzFCLGFBQVcsRUFBWCxXQUFXO0FBQ1gseUJBQXVCLEVBQXZCLHVCQUF1QjtBQUN2QixXQUFTLEVBQVQsU0FBUztBQUNULGlCQUFlLEVBQWYsZUFBZTtBQUNmLGlDQUErQixFQUEvQiwrQkFBK0I7QUFDL0IsdUJBQXFCLEVBQXJCLHFCQUFxQjtBQUNyQixvQkFBa0IsRUFBbEIsa0JBQWtCO0FBQ2xCLGdCQUFjLEVBQWQsY0FBYztBQUNkLHFCQUFtQixFQUFuQixtQkFBbUI7QUFDbkIsVUFBUSxFQUFFO0FBQ1IsNkJBQXlCLEVBQXpCLHlCQUF5QjtHQUMxQjtDQUNGLENBQUMiLCJmaWxlIjoicHJvY2Vzcy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCAqIGFzIGFycmF5IGZyb20gJy4vYXJyYXknO1xuaW1wb3J0IHtcbiAgZXhlY0ZpbGUsXG4gIGZvcmssXG4gIHNwYXduLFxufSBmcm9tICdjaGlsZF9wcm9jZXNzJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHtQcm9taXNlUXVldWV9IGZyb20gJy4vUHJvbWlzZUV4ZWN1dG9ycyc7XG5cbmltcG9ydCB0eXBlIHtPYnNlcnZlcn0gZnJvbSAncngnO1xuaW1wb3J0IHR5cGUge1Byb2Nlc3NNZXNzYWdlLCBwcm9jZXNzJGFzeW5jRXhlY3V0ZVJldH0gZnJvbSAnLi4nO1xuXG5pbXBvcnQge29ic2VydmVTdHJlYW0sIHNwbGl0U3RyZWFtfSBmcm9tICcuL3N0cmVhbSc7XG5pbXBvcnQge09ic2VydmFibGUsIFJlcGxheVN1YmplY3R9IGZyb20gJ3J4JztcbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcblxubGV0IHBsYXRmb3JtUGF0aFByb21pc2U6ID9Qcm9taXNlPHN0cmluZz47XG5cbmNvbnN0IGJsb2NraW5nUXVldWVzID0ge307XG5jb25zdCBDT01NT05fQklOQVJZX1BBVEhTID0gWycvdXNyL2JpbicsICcvYmluJywgJy91c3Ivc2JpbicsICcvc2JpbicsICcvdXNyL2xvY2FsL2JpbiddO1xuXG4vKipcbiAqIENhcHR1cmVzIHRoZSB2YWx1ZSBvZiB0aGUgUEFUSCBlbnYgdmFyaWFibGUgcmV0dXJuZWQgYnkgRGFyd2luJ3MgKE9TIFgpIGBwYXRoX2hlbHBlcmAgdXRpbGl0eS5cbiAqIGBwYXRoX2hlbHBlciAtc2AncyByZXR1cm4gdmFsdWUgbG9va3MgbGlrZSB0aGlzOlxuICpcbiAqICAgICBQQVRIPVwiL3Vzci9iaW5cIjsgZXhwb3J0IFBBVEg7XG4gKi9cbmNvbnN0IERBUldJTl9QQVRIX0hFTFBFUl9SRUdFWFAgPSAvUEFUSD1cXFwiKFteXFxcIl0rKVxcXCIvO1xuXG5jb25zdCBTVFJFQU1fTkFNRVMgPSBbJ3N0ZGluJywgJ3N0ZG91dCcsICdzdGRlcnInXTtcblxuZnVuY3Rpb24gZ2V0UGxhdGZvcm1QYXRoKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gIC8vIERvIG5vdCByZXR1cm4gdGhlIGNhY2hlZCB2YWx1ZSBpZiB3ZSBhcmUgZXhlY3V0aW5nIHVuZGVyIHRoZSB0ZXN0IHJ1bm5lci5cbiAgaWYgKHBsYXRmb3JtUGF0aFByb21pc2UgJiYgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICd0ZXN0Jykge1xuICAgIC8vIFBhdGggaXMgYmVpbmcgZmV0Y2hlZCwgYXdhaXQgdGhlIFByb21pc2UgdGhhdCdzIGluIGZsaWdodC5cbiAgICByZXR1cm4gcGxhdGZvcm1QYXRoUHJvbWlzZTtcbiAgfVxuXG4gIC8vIFdlIGRvIG5vdCBjYWNoZSB0aGUgcmVzdWx0IG9mIHRoaXMgY2hlY2sgYmVjYXVzZSB3ZSBoYXZlIHVuaXQgdGVzdHMgdGhhdCB0ZW1wb3JhcmlseSByZWRlZmluZVxuICAvLyB0aGUgdmFsdWUgb2YgcHJvY2Vzcy5wbGF0Zm9ybS5cbiAgaWYgKHByb2Nlc3MucGxhdGZvcm0gPT09ICdkYXJ3aW4nKSB7XG4gICAgLy8gT1MgWCBhcHBzIGRvbid0IGluaGVyaXQgUEFUSCB3aGVuIG5vdCBsYXVuY2hlZCBmcm9tIHRoZSBDTEksIHNvIHJlY29uc3RydWN0IGl0LiBUaGlzIGlzIGFcbiAgICAvLyBidWcsIGZpbGVkIGFnYWluc3QgQXRvbSBMaW50ZXIgaGVyZTogaHR0cHM6Ly9naXRodWIuY29tL0F0b21MaW50ZXIvTGludGVyL2lzc3Vlcy8xNTBcbiAgICAvLyBUT0RPKGpqaWFhKTogcmVtb3ZlIHRoaXMgaGFjayB3aGVuIHRoZSBBdG9tIGlzc3VlIGlzIGNsb3NlZFxuICAgIHBsYXRmb3JtUGF0aFByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBleGVjRmlsZSgnL3Vzci9saWJleGVjL3BhdGhfaGVscGVyJywgWyctcyddLCAoZXJyb3IsIHN0ZG91dCwgc3RkZXJyKSA9PiB7XG4gICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3QgbWF0Y2ggPSBzdGRvdXQubWF0Y2goREFSV0lOX1BBVEhfSEVMUEVSX1JFR0VYUCk7XG4gICAgICAgICAgcmVzb2x2ZSgobWF0Y2ggJiYgbWF0Y2gubGVuZ3RoID4gMSkgPyBtYXRjaFsxXSA6ICcnKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgcGxhdGZvcm1QYXRoUHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZSgnJyk7XG4gIH1cblxuICByZXR1cm4gcGxhdGZvcm1QYXRoUHJvbWlzZTtcbn1cblxuLyoqXG4gKiBTaW5jZSBPUyBYIGFwcHMgZG9uJ3QgaW5oZXJpdCBQQVRIIHdoZW4gbm90IGxhdW5jaGVkIGZyb20gdGhlIENMSSwgdGhpcyBmdW5jdGlvbiBjcmVhdGVzIGEgbmV3XG4gKiBlbnZpcm9ubWVudCBvYmplY3QgZ2l2ZW4gdGhlIG9yaWdpbmFsIGVudmlyb25tZW50IGJ5IG1vZGlmeWluZyB0aGUgZW52LlBBVEggdXNpbmcgZm9sbG93aW5nXG4gKiBsb2dpYzpcbiAqICAxKSBJZiBvcmlnaW5hbEVudi5QQVRIIGRvZXNuJ3QgZXF1YWwgdG8gcHJvY2Vzcy5lbnYuUEFUSCwgd2hpY2ggbWVhbnMgdGhlIFBBVEggaGFzIGJlZW5cbiAqICAgIG1vZGlmaWVkLCB3ZSBzaG91bGRuJ3QgZG8gYW55dGhpbmcuXG4gKiAgMSkgSWYgd2UgYXJlIHJ1bm5pbmcgaW4gT1MgWCwgdXNlIGAvdXNyL2xpYmV4ZWMvcGF0aF9oZWxwZXIgLXNgIHRvIGdldCB0aGUgY29ycmVjdCBQQVRIIGFuZFxuICogICAgUkVQTEFDRSB0aGUgUEFUSC5cbiAqICAyKSBJZiBzdGVwIDEgZmFpbGVkIG9yIHdlIGFyZSBub3QgcnVubmluZyBpbiBPUyBYLCBBUFBFTkQgY29tbW9uQmluYXJ5UGF0aHMgdG8gY3VycmVudCBQQVRILlxuICovXG5hc3luYyBmdW5jdGlvbiBjcmVhdGVFeGVjRW52aXJvbm1lbnQoXG4gIG9yaWdpbmFsRW52OiBPYmplY3QsXG4gIGNvbW1vbkJpbmFyeVBhdGhzOiBBcnJheTxzdHJpbmc+LFxuKTogUHJvbWlzZTxPYmplY3Q+IHtcbiAgY29uc3QgZXhlY0VudiA9IHsuLi5vcmlnaW5hbEVudn07XG5cbiAgaWYgKGV4ZWNFbnYuUEFUSCAhPT0gcHJvY2Vzcy5lbnYuUEFUSCkge1xuICAgIHJldHVybiBleGVjRW52O1xuICB9XG5cbiAgZXhlY0Vudi5QQVRIID0gZXhlY0Vudi5QQVRIIHx8ICcnO1xuXG4gIGxldCBwbGF0Zm9ybVBhdGggPSBudWxsO1xuICB0cnkge1xuICAgIHBsYXRmb3JtUGF0aCA9IGF3YWl0IGdldFBsYXRmb3JtUGF0aCgpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGxvZ0Vycm9yKCdGYWlsZWQgdG8gZ2V0UGxhdGZvcm1QYXRoJywgZXJyb3IpO1xuICB9XG5cbiAgLy8gSWYgdGhlIHBsYXRmb3JtIHJldHVybnMgYSBub24tZW1wdHkgUEFUSCwgdXNlIGl0LiBPdGhlcndpc2UgdXNlIHRoZSBkZWZhdWx0IHNldCBvZiBjb21tb25cbiAgLy8gYmluYXJ5IHBhdGhzLlxuICBpZiAocGxhdGZvcm1QYXRoKSB7XG4gICAgZXhlY0Vudi5QQVRIID0gcGxhdGZvcm1QYXRoO1xuICB9IGVsc2UgaWYgKGNvbW1vbkJpbmFyeVBhdGhzLmxlbmd0aCkge1xuICAgIGNvbnN0IHBhdGhzID0gbmV3IFNldChbXG4gICAgICAuLi5leGVjRW52LlBBVEguc3BsaXQocGF0aC5kZWxpbWl0ZXIpLFxuICAgICAgLi4uY29tbW9uQmluYXJ5UGF0aHMsXG4gICAgXSk7XG4gICAgZXhlY0Vudi5QQVRIID0gYXJyYXkuZnJvbShwYXRocykuam9pbihwYXRoLmRlbGltaXRlcik7XG4gIH1cblxuICByZXR1cm4gZXhlY0Vudjtcbn1cblxuZnVuY3Rpb24gbG9nRXJyb3IoLi4uYXJncykge1xuICAvLyBDYW4ndCB1c2UgbnVjbGlkZS1sb2dnaW5nIGhlcmUgdG8gbm90IGNhdXNlIGN5Y2xlIGRlcGVuZGVuY3kuXG4gIC8qZXNsaW50LWRpc2FibGUgbm8tY29uc29sZSovXG4gIGNvbnNvbGUuZXJyb3IoLi4uYXJncyk7XG4gIC8qZXNsaW50LWVuYWJsZSBuby1jb25zb2xlKi9cbn1cblxuZnVuY3Rpb24gbW9uaXRvclN0cmVhbUVycm9ycyhwcm9jZXNzOiBjaGlsZF9wcm9jZXNzJENoaWxkUHJvY2VzcywgY29tbWFuZCwgYXJncywgb3B0aW9ucyk6IHZvaWQge1xuICBTVFJFQU1fTkFNRVMuZm9yRWFjaChzdHJlYW1OYW1lID0+IHtcbiAgICAvLyAkRmxvd0lzc3VlXG4gICAgY29uc3Qgc3RyZWFtID0gcHJvY2Vzc1tzdHJlYW1OYW1lXTtcbiAgICBpZiAoc3RyZWFtID09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgc3RyZWFtLm9uKCdlcnJvcicsIGVycm9yID0+IHtcbiAgICAgIC8vIFRoaXMgY2FuIGhhcHBlbiB3aXRob3V0IHRoZSBmdWxsIGV4ZWN1dGlvbiBvZiB0aGUgY29tbWFuZCB0byBmYWlsLFxuICAgICAgLy8gYnV0IHdlIHdhbnQgdG8gbGVhcm4gYWJvdXQgaXQuXG4gICAgICBsb2dFcnJvcihcbiAgICAgICAgYHN0cmVhbSBlcnJvciBvbiBzdHJlYW0gJHtzdHJlYW1OYW1lfSB3aXRoIGNvbW1hbmQ6YCxcbiAgICAgICAgY29tbWFuZCxcbiAgICAgICAgYXJncyxcbiAgICAgICAgb3B0aW9ucyxcbiAgICAgICAgJ2Vycm9yOicsXG4gICAgICAgIGVycm9yLFxuICAgICAgKTtcbiAgICB9KTtcbiAgfSk7XG59XG5cbi8qKlxuICogQmFzaWNhbGx5IGxpa2Ugc3Bhd24sIGV4Y2VwdCBpdCBoYW5kbGVzIGFuZCBsb2dzIGVycm9ycyBpbnN0ZWFkIG9mIGNyYXNoaW5nXG4gKiB0aGUgcHJvY2Vzcy4gVGhpcyBpcyBtdWNoIGxvd2VyLWxldmVsIHRoYW4gYXN5bmNFeGVjdXRlLiBVbmxlc3MgeW91IGhhdmUgYVxuICogc3BlY2lmaWMgcmVhc29uIHlvdSBzaG91bGQgdXNlIGFzeW5jRXhlY3V0ZSBpbnN0ZWFkLlxuICovXG5hc3luYyBmdW5jdGlvbiBzYWZlU3Bhd24oXG4gIGNvbW1hbmQ6IHN0cmluZyxcbiAgYXJncz86IEFycmF5PHN0cmluZz4gPSBbXSxcbiAgb3B0aW9ucz86IE9iamVjdCA9IHt9LFxuKTogUHJvbWlzZTxjaGlsZF9wcm9jZXNzJENoaWxkUHJvY2Vzcz4ge1xuICBvcHRpb25zLmVudiA9IGF3YWl0IGNyZWF0ZUV4ZWNFbnZpcm9ubWVudChvcHRpb25zLmVudiB8fCBwcm9jZXNzLmVudiwgQ09NTU9OX0JJTkFSWV9QQVRIUyk7XG4gIGNvbnN0IGNoaWxkID0gc3Bhd24oY29tbWFuZCwgYXJncywgb3B0aW9ucyk7XG4gIG1vbml0b3JTdHJlYW1FcnJvcnMoY2hpbGQsIGNvbW1hbmQsIGFyZ3MsIG9wdGlvbnMpO1xuICBjaGlsZC5vbignZXJyb3InLCBlcnJvciA9PiB7XG4gICAgbG9nRXJyb3IoJ2Vycm9yIHdpdGggY29tbWFuZDonLCBjb21tYW5kLCBhcmdzLCBvcHRpb25zLCAnZXJyb3I6JywgZXJyb3IpO1xuICB9KTtcbiAgcmV0dXJuIGNoaWxkO1xufVxuXG5hc3luYyBmdW5jdGlvbiBmb3JrV2l0aEV4ZWNFbnZpcm9ubWVudChcbiAgbW9kdWxlUGF0aDogc3RyaW5nLFxuICBhcmdzPzogQXJyYXk8c3RyaW5nPiA9IFtdLFxuICBvcHRpb25zPzogT2JqZWN0ID0ge30sXG4pOiBQcm9taXNlPGNoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzPiB7XG4gIGNvbnN0IGZvcmtPcHRpb25zID0ge1xuICAgIC4uLm9wdGlvbnMsXG4gICAgZW52OiBhd2FpdCBjcmVhdGVFeGVjRW52aXJvbm1lbnQob3B0aW9ucy5lbnYgfHwgcHJvY2Vzcy5lbnYsIENPTU1PTl9CSU5BUllfUEFUSFMpLFxuICB9O1xuICBjb25zdCBjaGlsZCA9IGZvcmsobW9kdWxlUGF0aCwgYXJncywgZm9ya09wdGlvbnMpO1xuICBjaGlsZC5vbignZXJyb3InLCBlcnJvciA9PiB7XG4gICAgbG9nRXJyb3IoJ2Vycm9yIGZyb20gbW9kdWxlOicsIG1vZHVsZVBhdGgsIGFyZ3MsIG9wdGlvbnMsICdlcnJvcjonLCBlcnJvcik7XG4gIH0pO1xuICByZXR1cm4gY2hpbGQ7XG59XG5cbmNvbnN0IGlzT3NYID0gcHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ2Rhcndpbic7XG5cbi8qKlxuICogVGFrZXMgdGhlIGNvbW1hbmQgYW5kIGFyZ3MgdGhhdCB5b3Ugd291bGQgbm9ybWFsbHkgcGFzcyB0byBgc3Bhd24oKWAgYW5kIHJldHVybnMgYG5ld0FyZ3NgIHN1Y2hcbiAqIHRoYXQgeW91IHNob3VsZCBjYWxsIGl0IHdpdGggYHNwYXduKCdzY3JpcHQnLCBuZXdBcmdzKWAgdG8gcnVuIHRoZSBvcmlnaW5hbCBjb21tYW5kL2FyZ3MgcGFpclxuICogdW5kZXIgYHNjcmlwdGAuXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUFyZ3NGb3JTY3JpcHRDb21tYW5kKGNvbW1hbmQ6IHN0cmluZywgYXJncz86IEFycmF5PHN0cmluZz4gPSBbXSk6IEFycmF5PHN0cmluZz4ge1xuICBpZiAoaXNPc1gpIHtcbiAgICAvLyBPbiBPUyBYLCBzY3JpcHQgdGFrZXMgdGhlIHByb2dyYW0gdG8gcnVuIGFuZCBpdHMgYXJndW1lbnRzIGFzIHZhcmFyZ3MgYXQgdGhlIGVuZC5cbiAgICByZXR1cm4gWyctcScsICcvZGV2L251bGwnLCBjb21tYW5kXS5jb25jYXQoYXJncyk7XG4gIH0gZWxzZSB7XG4gICAgLy8gT24gTGludXgsIHNjcmlwdCB0YWtlcyB0aGUgY29tbWFuZCB0byBydW4gYXMgdGhlIC1jIHBhcmFtZXRlci5cbiAgICAvLyBUT0RPOiBTaGVsbCBlc2NhcGUgZXZlcnkgZWxlbWVudCBpbiBhbGxBcmdzLlxuICAgIGNvbnN0IGFsbEFyZ3MgPSBbY29tbWFuZF0uY29uY2F0KGFyZ3MpO1xuICAgIGNvbnN0IGNvbW1hbmRBc0l0c093bkFyZyA9IGFsbEFyZ3Muam9pbignICcpO1xuICAgIHJldHVybiBbJy1xJywgJy9kZXYvbnVsbCcsICctYycsIGNvbW1hbmRBc0l0c093bkFyZ107XG4gIH1cbn1cblxuLyoqXG4gKiBCYXNpY2FsbHkgbGlrZSBzYWZlU3Bhd24sIGJ1dCBydW5zIHRoZSBjb21tYW5kIHdpdGggdGhlIGBzY3JpcHRgIGNvbW1hbmQuXG4gKiBgc2NyaXB0YCBlbnN1cmVzIHRlcm1pbmFsLWxpa2UgZW52aXJvbm1lbnQgYW5kIGNvbW1hbmRzIHdlIHJ1biBnaXZlIGNvbG9yZWQgb3V0cHV0LlxuICovXG5mdW5jdGlvbiBzY3JpcHRTYWZlU3Bhd24oXG4gIGNvbW1hbmQ6IHN0cmluZyxcbiAgYXJncz86IEFycmF5PHN0cmluZz4gPSBbXSxcbiAgb3B0aW9ucz86IE9iamVjdCA9IHt9LFxuKTogUHJvbWlzZTxjaGlsZF9wcm9jZXNzJENoaWxkUHJvY2Vzcz4ge1xuICBjb25zdCBuZXdBcmdzID0gY3JlYXRlQXJnc0ZvclNjcmlwdENvbW1hbmQoY29tbWFuZCwgYXJncyk7XG4gIHJldHVybiBzYWZlU3Bhd24oJ3NjcmlwdCcsIG5ld0FyZ3MsIG9wdGlvbnMpO1xufVxuXG4vKipcbiAqIFdyYXBzIHNjcmlwdFNhZmVTcGF3biB3aXRoIGFuIE9ic2VydmFibGUgdGhhdCBsZXRzIHlvdSBsaXN0ZW4gdG8gdGhlIHN0ZG91dCBhbmRcbiAqIHN0ZGVyciBvZiB0aGUgc3Bhd25lZCBwcm9jZXNzLlxuICovXG5mdW5jdGlvbiBzY3JpcHRTYWZlU3Bhd25BbmRPYnNlcnZlT3V0cHV0KFxuICBjb21tYW5kOiBzdHJpbmcsXG4gIGFyZ3M/OiBBcnJheTxzdHJpbmc+ID0gW10sXG4gIG9wdGlvbnM/OiBPYmplY3QgPSB7fSxcbik6IE9ic2VydmFibGU8e3N0ZGVycj86IHN0cmluZzsgc3Rkb3V0Pzogc3RyaW5nO30+IHtcbiAgcmV0dXJuIE9ic2VydmFibGUuY3JlYXRlKChvYnNlcnZlcjogT2JzZXJ2ZXIpID0+IHtcbiAgICBsZXQgY2hpbGRQcm9jZXNzO1xuICAgIHNjcmlwdFNhZmVTcGF3bihjb21tYW5kLCBhcmdzLCBvcHRpb25zKS50aGVuKHByb2MgPT4ge1xuICAgICAgY2hpbGRQcm9jZXNzID0gcHJvYztcblxuICAgICAgY2hpbGRQcm9jZXNzLnN0ZG91dC5vbignZGF0YScsIGRhdGEgPT4ge1xuICAgICAgICBvYnNlcnZlci5vbk5leHQoe3N0ZG91dDogZGF0YS50b1N0cmluZygpfSk7XG4gICAgICB9KTtcblxuICAgICAgbGV0IHN0ZGVyciA9ICcnO1xuICAgICAgY2hpbGRQcm9jZXNzLnN0ZGVyci5vbignZGF0YScsIGRhdGEgPT4ge1xuICAgICAgICBzdGRlcnIgKz0gZGF0YTtcbiAgICAgICAgb2JzZXJ2ZXIub25OZXh0KHtzdGRlcnI6IGRhdGEudG9TdHJpbmcoKX0pO1xuICAgICAgfSk7XG5cbiAgICAgIGNoaWxkUHJvY2Vzcy5vbignZXhpdCcsIChleGl0Q29kZTogbnVtYmVyKSA9PiB7XG4gICAgICAgIGlmIChleGl0Q29kZSAhPT0gMCkge1xuICAgICAgICAgIG9ic2VydmVyLm9uRXJyb3Ioc3RkZXJyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBvYnNlcnZlci5vbkNvbXBsZXRlZCgpO1xuICAgICAgICB9XG4gICAgICAgIGNoaWxkUHJvY2VzcyA9IG51bGw7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBpZiAoY2hpbGRQcm9jZXNzKSB7XG4gICAgICAgIGNoaWxkUHJvY2Vzcy5raWxsKCk7XG4gICAgICB9XG4gICAgfTtcbiAgfSk7XG59XG5cbmNsYXNzIFByb2Nlc3NSZXNvdXJjZSB7XG4gIHByb2Nlc3MkOiBPYnNlcnZhYmxlPGNoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzPjtcbiAgZGlzcG9zZWQkOiBSZXBsYXlTdWJqZWN0PGJvb2xlYW4+O1xuXG4gIGNvbnN0cnVjdG9yKHByb21pc2VPclByb2Nlc3M6IGNoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzIHwgUHJvbWlzZTxjaGlsZF9wcm9jZXNzJENoaWxkUHJvY2Vzcz4pIHtcbiAgICB0aGlzLmRpc3Bvc2VkJCA9IG5ldyBSZXBsYXlTdWJqZWN0KDEpO1xuICAgIHRoaXMucHJvY2VzcyQgPSBPYnNlcnZhYmxlLmZyb21Qcm9taXNlKFByb21pc2UucmVzb2x2ZShwcm9taXNlT3JQcm9jZXNzKSk7XG5cbiAgICBPYnNlcnZhYmxlLmNvbWJpbmVMYXRlc3QodGhpcy5wcm9jZXNzJCwgdGhpcy5kaXNwb3NlZCQpXG4gICAgICAudGFrZVVudGlsKFxuICAgICAgICB0aGlzLnByb2Nlc3MkLmZsYXRNYXAocHJvY2VzcyA9PiBPYnNlcnZhYmxlLmZyb21FdmVudChwcm9jZXNzLCAnZXhpdCcpKSxcbiAgICAgIClcbiAgICAgIC5zdWJzY3JpYmUoKFtwcm9jZXNzLCBkaXNwb3NlZF0pID0+IHtcbiAgICAgICAgaWYgKGRpc3Bvc2VkICYmIChwcm9jZXNzICE9IG51bGwpKSB7XG4gICAgICAgICAgcHJvY2Vzcy5raWxsKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICB9XG5cbiAgZ2V0U3RyZWFtKCk6IE9ic2VydmFibGU8Y2hpbGRfcHJvY2VzcyRDaGlsZFByb2Nlc3M+IHtcbiAgICByZXR1cm4gdGhpcy5wcm9jZXNzJC50YWtlVW50aWwodGhpcy5kaXNwb3NlZCQpO1xuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLmRpc3Bvc2VkJC5vbk5leHQodHJ1ZSk7XG4gICAgdGhpcy5kaXNwb3NlZCQub25Db21wbGV0ZWQoKTtcbiAgfVxuXG59XG5cbi8qKlxuICogT2JzZXJ2ZSB0aGUgc3Rkb3V0LCBzdGRlcnIgYW5kIGV4aXQgY29kZSBvZiBhIHByb2Nlc3MuXG4gKiBzdGRvdXQgYW5kIHN0ZGVyciBhcmUgc3BsaXQgYnkgbmV3bGluZXMuXG4gKi9cbmZ1bmN0aW9uIG9ic2VydmVQcm9jZXNzRXhpdChcbiAgY3JlYXRlUHJvY2VzczogKCkgPT4gY2hpbGRfcHJvY2VzcyRDaGlsZFByb2Nlc3MgfCBQcm9taXNlPGNoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzPixcbik6IE9ic2VydmFibGU8bnVtYmVyPiB7XG4gIHJldHVybiBPYnNlcnZhYmxlLnVzaW5nKFxuICAgICgpID0+IG5ldyBQcm9jZXNzUmVzb3VyY2UoY3JlYXRlUHJvY2VzcygpKSxcbiAgICBwcm9jZXNzUmVzb3VyY2UgPT4gKFxuICAgICAgcHJvY2Vzc1Jlc291cmNlLmdldFN0cmVhbSgpLmZsYXRNYXAocHJvY2VzcyA9PiBPYnNlcnZhYmxlLmZyb21FdmVudChwcm9jZXNzLCAnZXhpdCcpLnRha2UoMSkpXG4gICAgKSxcbiAgKTtcbn1cblxuLyoqXG4gKiBPYnNlcnZlIHRoZSBzdGRvdXQsIHN0ZGVyciBhbmQgZXhpdCBjb2RlIG9mIGEgcHJvY2Vzcy5cbiAqL1xuZnVuY3Rpb24gb2JzZXJ2ZVByb2Nlc3MoXG4gIGNyZWF0ZVByb2Nlc3M6ICgpID0+IGNoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzIHwgUHJvbWlzZTxjaGlsZF9wcm9jZXNzJENoaWxkUHJvY2Vzcz4sXG4pOiBPYnNlcnZhYmxlPFByb2Nlc3NNZXNzYWdlPiB7XG4gIHJldHVybiBPYnNlcnZhYmxlLnVzaW5nKFxuICAgICgpID0+IG5ldyBQcm9jZXNzUmVzb3VyY2UoY3JlYXRlUHJvY2VzcygpKSxcbiAgICBwcm9jZXNzUmVzb3VyY2UgPT4ge1xuICAgICAgcmV0dXJuIHByb2Nlc3NSZXNvdXJjZS5nZXRTdHJlYW0oKS5mbGF0TWFwKHByb2Nlc3MgPT4ge1xuICAgICAgICBpbnZhcmlhbnQocHJvY2VzcyAhPSBudWxsLCAncHJvY2VzcyBoYXMgbm90IHlldCBiZWVuIGRpc3Bvc2VkJyk7XG4gICAgICAgIC8vIFVzZSByZXBsYXkvY29ubmVjdCBvbiBleGl0IGZvciB0aGUgZmluYWwgY29uY2F0LlxuICAgICAgICAvLyBCeSBkZWZhdWx0IGNvbmNhdCBkZWZlcnMgc3Vic2NyaXB0aW9uIHVudGlsIGFmdGVyIHRoZSBMSFMgY29tcGxldGVzLlxuICAgICAgICBjb25zdCBleGl0ID0gT2JzZXJ2YWJsZS5mcm9tRXZlbnQocHJvY2VzcywgJ2V4aXQnKS50YWtlKDEpLlxuICAgICAgICAgICAgbWFwKGV4aXRDb2RlID0+ICh7a2luZDogJ2V4aXQnLCBleGl0Q29kZX0pKS5yZXBsYXkoKTtcbiAgICAgICAgZXhpdC5jb25uZWN0KCk7XG4gICAgICAgIGNvbnN0IGVycm9yID0gT2JzZXJ2YWJsZS5mcm9tRXZlbnQocHJvY2VzcywgJ2Vycm9yJykuXG4gICAgICAgICAgICB0YWtlVW50aWwoZXhpdCkuXG4gICAgICAgICAgICBtYXAoZXJyb3JPYmogPT4gKHtraW5kOiAnZXJyb3InLCBlcnJvcjogZXJyb3JPYmp9KSk7XG4gICAgICAgIGNvbnN0IHN0ZG91dCA9IHNwbGl0U3RyZWFtKG9ic2VydmVTdHJlYW0ocHJvY2Vzcy5zdGRvdXQpKS5cbiAgICAgICAgICAgIG1hcChkYXRhID0+ICh7a2luZDogJ3N0ZG91dCcsIGRhdGF9KSk7XG4gICAgICAgIGNvbnN0IHN0ZGVyciA9IHNwbGl0U3RyZWFtKG9ic2VydmVTdHJlYW0ocHJvY2Vzcy5zdGRlcnIpKS5cbiAgICAgICAgICAgIG1hcChkYXRhID0+ICh7a2luZDogJ3N0ZGVycicsIGRhdGF9KSk7XG4gICAgICAgIHJldHVybiBzdGRvdXQubWVyZ2Uoc3RkZXJyKS5tZXJnZShlcnJvcikuY29uY2F0KGV4aXQpO1xuICAgICAgfSk7XG4gICAgfSxcbiAgKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIHRoZSByZXN1bHQgb2YgZXhlY3V0aW5nIGEgcHJvY2Vzcy5cbiAqXG4gKiBAcGFyYW0gY29tbWFuZCBUaGUgY29tbWFuZCB0byBleGVjdXRlLlxuICogQHBhcmFtIGFyZ3MgVGhlIGFyZ3VtZW50cyB0byBwYXNzIHRvIHRoZSBjb21tYW5kLlxuICogQHBhcmFtIG9wdGlvbnMgT3B0aW9ucyBmb3IgY2hhbmdpbmcgaG93IHRvIHJ1biB0aGUgY29tbWFuZC5cbiAqICAgICBTZWUgaGVyZTogaHR0cDovL25vZGVqcy5vcmcvYXBpL2NoaWxkX3Byb2Nlc3MuaHRtbFxuICogICAgIFRoZSBhZGRpdGlvbmFsIG9wdGlvbnMgd2UgcHJvdmlkZTpcbiAqICAgICAgIHF1ZXVlTmFtZSBzdHJpbmcgVGhlIHF1ZXVlIG9uIHdoaWNoIHRvIGJsb2NrIGRlcGVuZGVudCBjYWxscy5cbiAqICAgICAgIHN0ZGluIHN0cmluZyBUaGUgY29udGVudHMgdG8gd3JpdGUgdG8gc3RkaW4uXG4gKiAgICAgICBwaXBlZENvbW1hbmQgc3RyaW5nIGEgY29tbWFuZCB0byBwaXBlIHRoZSBvdXRwdXQgb2YgY29tbWFuZCB0aHJvdWdoLlxuICogICAgICAgcGlwZWRBcmdzIGFycmF5IG9mIHN0cmluZ3MgYXMgYXJndW1lbnRzLlxuICogQHJldHVybiBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgdG8gYW4gb2JqZWN0IHdpdGggdGhlIHByb3BlcnRpZXM6XG4gKiAgICAgc3Rkb3V0IHN0cmluZyBUaGUgY29udGVudHMgb2YgdGhlIHByb2Nlc3MncyBvdXRwdXQgc3RyZWFtLlxuICogICAgIHN0ZGVyciBzdHJpbmcgVGhlIGNvbnRlbnRzIG9mIHRoZSBwcm9jZXNzJ3MgZXJyb3Igc3RyZWFtLlxuICogICAgIGV4aXRDb2RlIG51bWJlciBUaGUgZXhpdCBjb2RlIHJldHVybmVkIGJ5IHRoZSBwcm9jZXNzLlxuICovXG5mdW5jdGlvbiBjaGVja091dHB1dChcbiAgICBjb21tYW5kOiBzdHJpbmcsXG4gICAgYXJnczogQXJyYXk8c3RyaW5nPixcbiAgICBvcHRpb25zOiA/T2JqZWN0ID0ge30pOiBQcm9taXNlPHByb2Nlc3MkYXN5bmNFeGVjdXRlUmV0PiB7XG4gIC8vIENsb25lIHBhc3NlZCBpbiBvcHRpb25zIHNvIHRoaXMgZnVuY3Rpb24gZG9lc24ndCBtb2RpZnkgYW4gb2JqZWN0IGl0IGRvZXNuJ3Qgb3duLlxuICBjb25zdCBsb2NhbE9wdGlvbnMgPSB7Li4ub3B0aW9uc307XG5cbiAgY29uc3QgZXhlY3V0b3IgPSAocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgbGV0IGZpcnN0Q2hpbGQ7XG4gICAgbGV0IGxhc3RDaGlsZDtcblxuICAgIGxldCBmaXJzdENoaWxkU3RkZXJyO1xuICAgIGlmIChsb2NhbE9wdGlvbnMucGlwZWRDb21tYW5kKSB7XG4gICAgICAvLyBJZiBhIHNlY29uZCBjb21tYW5kIGlzIGdpdmVuLCBwaXBlIHN0ZG91dCBvZiBmaXJzdCB0byBzdGRpbiBvZiBzZWNvbmQuIFN0cmluZyBvdXRwdXRcbiAgICAgIC8vIHJldHVybmVkIGluIHRoaXMgZnVuY3Rpb24ncyBQcm9taXNlIHdpbGwgYmUgc3RkZXJyL3N0ZG91dCBvZiB0aGUgc2Vjb25kIGNvbW1hbmQuXG4gICAgICBmaXJzdENoaWxkID0gc3Bhd24oY29tbWFuZCwgYXJncywgbG9jYWxPcHRpb25zKTtcbiAgICAgIG1vbml0b3JTdHJlYW1FcnJvcnMoZmlyc3RDaGlsZCwgY29tbWFuZCwgYXJncywgbG9jYWxPcHRpb25zKTtcbiAgICAgIGZpcnN0Q2hpbGRTdGRlcnIgPSAnJztcblxuICAgICAgZmlyc3RDaGlsZC5vbignZXJyb3InLCBlcnJvciA9PiB7XG4gICAgICAgIC8vIFJlamVjdCBlYXJseSB3aXRoIHRoZSByZXN1bHQgd2hlbiBlbmNvdW50ZXJpbmcgYW4gZXJyb3IuXG4gICAgICAgIHJlamVjdCh7XG4gICAgICAgICAgY29tbWFuZDogW2NvbW1hbmRdLmNvbmNhdChhcmdzKS5qb2luKCcgJyksXG4gICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvci5tZXNzYWdlLFxuICAgICAgICAgIGV4aXRDb2RlOiBlcnJvci5jb2RlLFxuICAgICAgICAgIHN0ZGVycjogZmlyc3RDaGlsZFN0ZGVycixcbiAgICAgICAgICBzdGRvdXQ6ICcnLFxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgICBmaXJzdENoaWxkLnN0ZGVyci5vbignZGF0YScsIGRhdGEgPT4ge1xuICAgICAgICBmaXJzdENoaWxkU3RkZXJyICs9IGRhdGE7XG4gICAgICB9KTtcblxuICAgICAgbGFzdENoaWxkID0gc3Bhd24obG9jYWxPcHRpb25zLnBpcGVkQ29tbWFuZCwgbG9jYWxPcHRpb25zLnBpcGVkQXJncywgbG9jYWxPcHRpb25zKTtcbiAgICAgIG1vbml0b3JTdHJlYW1FcnJvcnMobGFzdENoaWxkLCBjb21tYW5kLCBhcmdzLCBsb2NhbE9wdGlvbnMpO1xuICAgICAgLy8gcGlwZSgpIG5vcm1hbGx5IHBhdXNlcyB0aGUgd3JpdGVyIHdoZW4gdGhlIHJlYWRlciBlcnJvcnMgKGNsb3NlcykuXG4gICAgICAvLyBUaGlzIGlzIG5vdCBob3cgVU5JWCBwaXBlcyB3b3JrOiBpZiB0aGUgcmVhZGVyIGNsb3NlcywgdGhlIHdyaXRlciBuZWVkc1xuICAgICAgLy8gdG8gYWxzbyBjbG9zZSAob3RoZXJ3aXNlIHRoZSB3cml0ZXIgcHJvY2VzcyBtYXkgaGFuZy4pXG4gICAgICAvLyBXZSBoYXZlIHRvIG1hbnVhbGx5IGNsb3NlIHRoZSB3cml0ZXIgaW4gdGhpcyBjYXNlLlxuICAgICAgbGFzdENoaWxkLnN0ZGluLm9uKCdlcnJvcicsICgpID0+IHtcbiAgICAgICAgZmlyc3RDaGlsZC5zdGRvdXQuZW1pdCgnZW5kJyk7XG4gICAgICB9KTtcbiAgICAgIGZpcnN0Q2hpbGQuc3Rkb3V0LnBpcGUobGFzdENoaWxkLnN0ZGluKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGFzdENoaWxkID0gc3Bhd24oY29tbWFuZCwgYXJncywgbG9jYWxPcHRpb25zKTtcbiAgICAgIG1vbml0b3JTdHJlYW1FcnJvcnMobGFzdENoaWxkLCBjb21tYW5kLCBhcmdzLCBsb2NhbE9wdGlvbnMpO1xuICAgICAgZmlyc3RDaGlsZCA9IGxhc3RDaGlsZDtcbiAgICB9XG5cbiAgICBsZXQgc3RkZXJyID0gJyc7XG4gICAgbGV0IHN0ZG91dCA9ICcnO1xuICAgIGxhc3RDaGlsZC5vbignY2xvc2UnLCBleGl0Q29kZSA9PiB7XG4gICAgICByZXNvbHZlKHtcbiAgICAgICAgZXhpdENvZGUsXG4gICAgICAgIHN0ZGVycixcbiAgICAgICAgc3Rkb3V0LFxuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBsYXN0Q2hpbGQub24oJ2Vycm9yJywgZXJyb3IgPT4ge1xuICAgICAgLy8gUmVqZWN0IGVhcmx5IHdpdGggdGhlIHJlc3VsdCB3aGVuIGVuY291bnRlcmluZyBhbiBlcnJvci5cbiAgICAgIHJlamVjdCh7XG4gICAgICAgIGNvbW1hbmQ6IFtjb21tYW5kXS5jb25jYXQoYXJncykuam9pbignICcpLFxuICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UsXG4gICAgICAgIGV4aXRDb2RlOiBlcnJvci5jb2RlLFxuICAgICAgICBzdGRlcnIsXG4gICAgICAgIHN0ZG91dCxcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgbGFzdENoaWxkLnN0ZGVyci5vbignZGF0YScsIGRhdGEgPT4ge1xuICAgICAgc3RkZXJyICs9IGRhdGE7XG4gICAgfSk7XG4gICAgbGFzdENoaWxkLnN0ZG91dC5vbignZGF0YScsIGRhdGEgPT4ge1xuICAgICAgc3Rkb3V0ICs9IGRhdGE7XG4gICAgfSk7XG5cbiAgICBpZiAodHlwZW9mIGxvY2FsT3B0aW9ucy5zdGRpbiA9PT0gJ3N0cmluZycpIHtcbiAgICAgIC8vIE5vdGUgdGhhdCB0aGUgTm9kZSBkb2NzIGhhdmUgdGhpcyBzY2FyeSB3YXJuaW5nIGFib3V0IHN0ZGluLmVuZCgpIG9uXG4gICAgICAvLyBodHRwOi8vbm9kZWpzLm9yZy9hcGkvY2hpbGRfcHJvY2Vzcy5odG1sI2NoaWxkX3Byb2Nlc3NfY2hpbGRfc3RkaW46XG4gICAgICAvL1xuICAgICAgLy8gXCJBIFdyaXRhYmxlIFN0cmVhbSB0aGF0IHJlcHJlc2VudHMgdGhlIGNoaWxkIHByb2Nlc3MncyBzdGRpbi4gQ2xvc2luZ1xuICAgICAgLy8gdGhpcyBzdHJlYW0gdmlhIGVuZCgpIG9mdGVuIGNhdXNlcyB0aGUgY2hpbGQgcHJvY2VzcyB0byB0ZXJtaW5hdGUuXCJcbiAgICAgIC8vXG4gICAgICAvLyBJbiBwcmFjdGljZSwgdGhpcyBoYXMgbm90IGFwcGVhcmVkIHRvIGNhdXNlIGFueSBpc3N1ZXMgdGh1cyBmYXIuXG4gICAgICBmaXJzdENoaWxkLnN0ZGluLndyaXRlKGxvY2FsT3B0aW9ucy5zdGRpbik7XG4gICAgICBmaXJzdENoaWxkLnN0ZGluLmVuZCgpO1xuICAgIH1cbiAgfTtcblxuICBmdW5jdGlvbiBtYWtlUHJvbWlzZSgpOiBQcm9taXNlPHByb2Nlc3MkYXN5bmNFeGVjdXRlUmV0PiB7XG4gICAgaWYgKGxvY2FsT3B0aW9ucy5xdWV1ZU5hbWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGV4ZWN1dG9yKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKCFibG9ja2luZ1F1ZXVlc1tsb2NhbE9wdGlvbnMucXVldWVOYW1lXSkge1xuICAgICAgICBibG9ja2luZ1F1ZXVlc1tsb2NhbE9wdGlvbnMucXVldWVOYW1lXSA9IG5ldyBQcm9taXNlUXVldWUoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBibG9ja2luZ1F1ZXVlc1tsb2NhbE9wdGlvbnMucXVldWVOYW1lXS5zdWJtaXQoZXhlY3V0b3IpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBjcmVhdGVFeGVjRW52aXJvbm1lbnQobG9jYWxPcHRpb25zLmVudiB8fCBwcm9jZXNzLmVudiwgQ09NTU9OX0JJTkFSWV9QQVRIUykudGhlbihcbiAgICB2YWwgPT4ge1xuICAgICAgbG9jYWxPcHRpb25zLmVudiA9IHZhbDtcbiAgICAgIHJldHVybiBtYWtlUHJvbWlzZSgpO1xuICAgIH0sXG4gICAgZXJyb3IgPT4ge1xuICAgICAgbG9jYWxPcHRpb25zLmVudiA9IGxvY2FsT3B0aW9ucy5lbnYgfHwgcHJvY2Vzcy5lbnY7XG4gICAgICByZXR1cm4gbWFrZVByb21pc2UoKTtcbiAgICB9XG4gICk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGFzeW5jRXhlY3V0ZShcbiAgICBjb21tYW5kOiBzdHJpbmcsXG4gICAgYXJnczogQXJyYXk8c3RyaW5nPixcbiAgICBvcHRpb25zOiA/T2JqZWN0ID0ge30pOiBQcm9taXNlPHByb2Nlc3MkYXN5bmNFeGVjdXRlUmV0PiB7XG4gIC8qICRGbG93SXNzdWUgKHQ4MjE2MTg5KSAqL1xuICBjb25zdCByZXN1bHQgPSBhd2FpdCBjaGVja091dHB1dChjb21tYW5kLCBhcmdzLCBvcHRpb25zKTtcbiAgaWYgKHJlc3VsdC5leGl0Q29kZSAhPT0gMCkge1xuICAgIC8vIER1Y2sgdHlwaW5nIEVycm9yLlxuICAgIHJlc3VsdFsnbmFtZSddID0gJ0FzeW5jIEV4ZWN1dGlvbiBFcnJvcic7XG4gICAgcmVzdWx0WydtZXNzYWdlJ10gPVxuICAgICAgICBgZXhpdENvZGU6ICR7cmVzdWx0LmV4aXRDb2RlfSwgc3RkZXJyOiAke3Jlc3VsdC5zdGRlcnJ9LCBzdGRvdXQ6ICR7cmVzdWx0LnN0ZG91dH0uYDtcbiAgICB0aHJvdyByZXN1bHQ7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGFzeW5jRXhlY3V0ZSxcbiAgY3JlYXRlQXJnc0ZvclNjcmlwdENvbW1hbmQsXG4gIGNoZWNrT3V0cHV0LFxuICBmb3JrV2l0aEV4ZWNFbnZpcm9ubWVudCxcbiAgc2FmZVNwYXduLFxuICBzY3JpcHRTYWZlU3Bhd24sXG4gIHNjcmlwdFNhZmVTcGF3bkFuZE9ic2VydmVPdXRwdXQsXG4gIGNyZWF0ZUV4ZWNFbnZpcm9ubWVudCxcbiAgb2JzZXJ2ZVByb2Nlc3NFeGl0LFxuICBvYnNlcnZlUHJvY2VzcyxcbiAgQ09NTU9OX0JJTkFSWV9QQVRIUyxcbiAgX190ZXN0X186IHtcbiAgICBEQVJXSU5fUEFUSF9IRUxQRVJfUkVHRVhQLFxuICB9LFxufTtcbiJdfQ==