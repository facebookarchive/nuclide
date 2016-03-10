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

    // $FlowIssue: There's currently no good way to describe this function with Flow
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
//# sourceMappingURL=data:application/json;base64,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WSxDQUFDLEdBQUcsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDO0FBQ25ELFdBQU8sV0FBVyxFQUFFLENBQUM7R0FDdEIsQ0FDRixDQUFDO0NBQ0g7O0FBa0JELE1BQU0sQ0FBQyxPQUFPLEdBQUc7QUFDZixjQUFZLEVBQVosWUFBWTtBQUNaLDRCQUEwQixFQUExQiwwQkFBMEI7QUFDMUIsYUFBVyxFQUFYLFdBQVc7QUFDWCx5QkFBdUIsRUFBdkIsdUJBQXVCO0FBQ3ZCLFdBQVMsRUFBVCxTQUFTO0FBQ1QsaUJBQWUsRUFBZixlQUFlO0FBQ2YsaUNBQStCLEVBQS9CLCtCQUErQjtBQUMvQix1QkFBcUIsRUFBckIscUJBQXFCO0FBQ3JCLG9CQUFrQixFQUFsQixrQkFBa0I7QUFDbEIsZ0JBQWMsRUFBZCxjQUFjO0FBQ2QscUJBQW1CLEVBQW5CLG1CQUFtQjtBQUNuQixVQUFRLEVBQUU7QUFDUiw2QkFBeUIsRUFBekIseUJBQXlCO0dBQzFCO0NBQ0YsQ0FBQyIsImZpbGUiOiJwcm9jZXNzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0ICogYXMgYXJyYXkgZnJvbSAnLi9hcnJheSc7XG5pbXBvcnQge1xuICBleGVjRmlsZSxcbiAgZm9yayxcbiAgc3Bhd24sXG59IGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQge1Byb21pc2VRdWV1ZX0gZnJvbSAnLi9Qcm9taXNlRXhlY3V0b3JzJztcblxuaW1wb3J0IHR5cGUge09ic2VydmVyfSBmcm9tICdyeCc7XG5pbXBvcnQgdHlwZSB7UHJvY2Vzc01lc3NhZ2UsIHByb2Nlc3MkYXN5bmNFeGVjdXRlUmV0fSBmcm9tICcuL21haW4nO1xuXG5pbXBvcnQge29ic2VydmVTdHJlYW0sIHNwbGl0U3RyZWFtfSBmcm9tICcuL3N0cmVhbSc7XG5pbXBvcnQge09ic2VydmFibGUsIFJlcGxheVN1YmplY3R9IGZyb20gJ3J4JztcbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcblxubGV0IHBsYXRmb3JtUGF0aFByb21pc2U6ID9Qcm9taXNlPHN0cmluZz47XG5cbmNvbnN0IGJsb2NraW5nUXVldWVzID0ge307XG5jb25zdCBDT01NT05fQklOQVJZX1BBVEhTID0gWycvdXNyL2JpbicsICcvYmluJywgJy91c3Ivc2JpbicsICcvc2JpbicsICcvdXNyL2xvY2FsL2JpbiddO1xuXG4vKipcbiAqIENhcHR1cmVzIHRoZSB2YWx1ZSBvZiB0aGUgUEFUSCBlbnYgdmFyaWFibGUgcmV0dXJuZWQgYnkgRGFyd2luJ3MgKE9TIFgpIGBwYXRoX2hlbHBlcmAgdXRpbGl0eS5cbiAqIGBwYXRoX2hlbHBlciAtc2AncyByZXR1cm4gdmFsdWUgbG9va3MgbGlrZSB0aGlzOlxuICpcbiAqICAgICBQQVRIPVwiL3Vzci9iaW5cIjsgZXhwb3J0IFBBVEg7XG4gKi9cbmNvbnN0IERBUldJTl9QQVRIX0hFTFBFUl9SRUdFWFAgPSAvUEFUSD1cXFwiKFteXFxcIl0rKVxcXCIvO1xuXG5jb25zdCBTVFJFQU1fTkFNRVMgPSBbJ3N0ZGluJywgJ3N0ZG91dCcsICdzdGRlcnInXTtcblxuZnVuY3Rpb24gZ2V0UGxhdGZvcm1QYXRoKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gIC8vIERvIG5vdCByZXR1cm4gdGhlIGNhY2hlZCB2YWx1ZSBpZiB3ZSBhcmUgZXhlY3V0aW5nIHVuZGVyIHRoZSB0ZXN0IHJ1bm5lci5cbiAgaWYgKHBsYXRmb3JtUGF0aFByb21pc2UgJiYgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICd0ZXN0Jykge1xuICAgIC8vIFBhdGggaXMgYmVpbmcgZmV0Y2hlZCwgYXdhaXQgdGhlIFByb21pc2UgdGhhdCdzIGluIGZsaWdodC5cbiAgICByZXR1cm4gcGxhdGZvcm1QYXRoUHJvbWlzZTtcbiAgfVxuXG4gIC8vIFdlIGRvIG5vdCBjYWNoZSB0aGUgcmVzdWx0IG9mIHRoaXMgY2hlY2sgYmVjYXVzZSB3ZSBoYXZlIHVuaXQgdGVzdHMgdGhhdCB0ZW1wb3JhcmlseSByZWRlZmluZVxuICAvLyB0aGUgdmFsdWUgb2YgcHJvY2Vzcy5wbGF0Zm9ybS5cbiAgaWYgKHByb2Nlc3MucGxhdGZvcm0gPT09ICdkYXJ3aW4nKSB7XG4gICAgLy8gT1MgWCBhcHBzIGRvbid0IGluaGVyaXQgUEFUSCB3aGVuIG5vdCBsYXVuY2hlZCBmcm9tIHRoZSBDTEksIHNvIHJlY29uc3RydWN0IGl0LiBUaGlzIGlzIGFcbiAgICAvLyBidWcsIGZpbGVkIGFnYWluc3QgQXRvbSBMaW50ZXIgaGVyZTogaHR0cHM6Ly9naXRodWIuY29tL0F0b21MaW50ZXIvTGludGVyL2lzc3Vlcy8xNTBcbiAgICAvLyBUT0RPKGpqaWFhKTogcmVtb3ZlIHRoaXMgaGFjayB3aGVuIHRoZSBBdG9tIGlzc3VlIGlzIGNsb3NlZFxuICAgIHBsYXRmb3JtUGF0aFByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBleGVjRmlsZSgnL3Vzci9saWJleGVjL3BhdGhfaGVscGVyJywgWyctcyddLCAoZXJyb3IsIHN0ZG91dCwgc3RkZXJyKSA9PiB7XG4gICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3QgbWF0Y2ggPSBzdGRvdXQubWF0Y2goREFSV0lOX1BBVEhfSEVMUEVSX1JFR0VYUCk7XG4gICAgICAgICAgcmVzb2x2ZSgobWF0Y2ggJiYgbWF0Y2gubGVuZ3RoID4gMSkgPyBtYXRjaFsxXSA6ICcnKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgcGxhdGZvcm1QYXRoUHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZSgnJyk7XG4gIH1cblxuICByZXR1cm4gcGxhdGZvcm1QYXRoUHJvbWlzZTtcbn1cblxuLyoqXG4gKiBTaW5jZSBPUyBYIGFwcHMgZG9uJ3QgaW5oZXJpdCBQQVRIIHdoZW4gbm90IGxhdW5jaGVkIGZyb20gdGhlIENMSSwgdGhpcyBmdW5jdGlvbiBjcmVhdGVzIGEgbmV3XG4gKiBlbnZpcm9ubWVudCBvYmplY3QgZ2l2ZW4gdGhlIG9yaWdpbmFsIGVudmlyb25tZW50IGJ5IG1vZGlmeWluZyB0aGUgZW52LlBBVEggdXNpbmcgZm9sbG93aW5nXG4gKiBsb2dpYzpcbiAqICAxKSBJZiBvcmlnaW5hbEVudi5QQVRIIGRvZXNuJ3QgZXF1YWwgdG8gcHJvY2Vzcy5lbnYuUEFUSCwgd2hpY2ggbWVhbnMgdGhlIFBBVEggaGFzIGJlZW5cbiAqICAgIG1vZGlmaWVkLCB3ZSBzaG91bGRuJ3QgZG8gYW55dGhpbmcuXG4gKiAgMSkgSWYgd2UgYXJlIHJ1bm5pbmcgaW4gT1MgWCwgdXNlIGAvdXNyL2xpYmV4ZWMvcGF0aF9oZWxwZXIgLXNgIHRvIGdldCB0aGUgY29ycmVjdCBQQVRIIGFuZFxuICogICAgUkVQTEFDRSB0aGUgUEFUSC5cbiAqICAyKSBJZiBzdGVwIDEgZmFpbGVkIG9yIHdlIGFyZSBub3QgcnVubmluZyBpbiBPUyBYLCBBUFBFTkQgY29tbW9uQmluYXJ5UGF0aHMgdG8gY3VycmVudCBQQVRILlxuICovXG5hc3luYyBmdW5jdGlvbiBjcmVhdGVFeGVjRW52aXJvbm1lbnQoXG4gIG9yaWdpbmFsRW52OiBPYmplY3QsXG4gIGNvbW1vbkJpbmFyeVBhdGhzOiBBcnJheTxzdHJpbmc+LFxuKTogUHJvbWlzZTxPYmplY3Q+IHtcbiAgY29uc3QgZXhlY0VudiA9IHsuLi5vcmlnaW5hbEVudn07XG5cbiAgaWYgKGV4ZWNFbnYuUEFUSCAhPT0gcHJvY2Vzcy5lbnYuUEFUSCkge1xuICAgIHJldHVybiBleGVjRW52O1xuICB9XG5cbiAgZXhlY0Vudi5QQVRIID0gZXhlY0Vudi5QQVRIIHx8ICcnO1xuXG4gIGxldCBwbGF0Zm9ybVBhdGggPSBudWxsO1xuICB0cnkge1xuICAgIHBsYXRmb3JtUGF0aCA9IGF3YWl0IGdldFBsYXRmb3JtUGF0aCgpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGxvZ0Vycm9yKCdGYWlsZWQgdG8gZ2V0UGxhdGZvcm1QYXRoJywgZXJyb3IpO1xuICB9XG5cbiAgLy8gSWYgdGhlIHBsYXRmb3JtIHJldHVybnMgYSBub24tZW1wdHkgUEFUSCwgdXNlIGl0LiBPdGhlcndpc2UgdXNlIHRoZSBkZWZhdWx0IHNldCBvZiBjb21tb25cbiAgLy8gYmluYXJ5IHBhdGhzLlxuICBpZiAocGxhdGZvcm1QYXRoKSB7XG4gICAgZXhlY0Vudi5QQVRIID0gcGxhdGZvcm1QYXRoO1xuICB9IGVsc2UgaWYgKGNvbW1vbkJpbmFyeVBhdGhzLmxlbmd0aCkge1xuICAgIGNvbnN0IHBhdGhzID0gbmV3IFNldChbXG4gICAgICAuLi5leGVjRW52LlBBVEguc3BsaXQocGF0aC5kZWxpbWl0ZXIpLFxuICAgICAgLi4uY29tbW9uQmluYXJ5UGF0aHMsXG4gICAgXSk7XG4gICAgZXhlY0Vudi5QQVRIID0gYXJyYXkuZnJvbShwYXRocykuam9pbihwYXRoLmRlbGltaXRlcik7XG4gIH1cblxuICByZXR1cm4gZXhlY0Vudjtcbn1cblxuZnVuY3Rpb24gbG9nRXJyb3IoLi4uYXJncykge1xuICAvLyBDYW4ndCB1c2UgbnVjbGlkZS1sb2dnaW5nIGhlcmUgdG8gbm90IGNhdXNlIGN5Y2xlIGRlcGVuZGVuY3kuXG4gIC8qZXNsaW50LWRpc2FibGUgbm8tY29uc29sZSovXG4gIGNvbnNvbGUuZXJyb3IoLi4uYXJncyk7XG4gIC8qZXNsaW50LWVuYWJsZSBuby1jb25zb2xlKi9cbn1cblxuZnVuY3Rpb24gbW9uaXRvclN0cmVhbUVycm9ycyhwcm9jZXNzOiBjaGlsZF9wcm9jZXNzJENoaWxkUHJvY2VzcywgY29tbWFuZCwgYXJncywgb3B0aW9ucyk6IHZvaWQge1xuICBTVFJFQU1fTkFNRVMuZm9yRWFjaChzdHJlYW1OYW1lID0+IHtcbiAgICAvLyAkRmxvd0lzc3VlXG4gICAgcHJvY2Vzc1tzdHJlYW1OYW1lXS5vbignZXJyb3InLCBlcnJvciA9PiB7XG4gICAgICAvLyBUaGlzIGNhbiBoYXBwZW4gd2l0aG91dCB0aGUgZnVsbCBleGVjdXRpb24gb2YgdGhlIGNvbW1hbmQgdG8gZmFpbCxcbiAgICAgIC8vIGJ1dCB3ZSB3YW50IHRvIGxlYXJuIGFib3V0IGl0LlxuICAgICAgbG9nRXJyb3IoXG4gICAgICAgIGBzdHJlYW0gZXJyb3Igb24gc3RyZWFtICR7c3RyZWFtTmFtZX0gd2l0aCBjb21tYW5kOmAsXG4gICAgICAgIGNvbW1hbmQsXG4gICAgICAgIGFyZ3MsXG4gICAgICAgIG9wdGlvbnMsXG4gICAgICAgICdlcnJvcjonLFxuICAgICAgICBlcnJvcixcbiAgICAgICk7XG4gICAgfSk7XG4gIH0pO1xufVxuXG4vKipcbiAqIEJhc2ljYWxseSBsaWtlIHNwYXduLCBleGNlcHQgaXQgaGFuZGxlcyBhbmQgbG9ncyBlcnJvcnMgaW5zdGVhZCBvZiBjcmFzaGluZ1xuICogdGhlIHByb2Nlc3MuIFRoaXMgaXMgbXVjaCBsb3dlci1sZXZlbCB0aGFuIGFzeW5jRXhlY3V0ZS4gVW5sZXNzIHlvdSBoYXZlIGFcbiAqIHNwZWNpZmljIHJlYXNvbiB5b3Ugc2hvdWxkIHVzZSBhc3luY0V4ZWN1dGUgaW5zdGVhZC5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gc2FmZVNwYXduKFxuICBjb21tYW5kOiBzdHJpbmcsXG4gIGFyZ3M/OiBBcnJheTxzdHJpbmc+ID0gW10sXG4gIG9wdGlvbnM/OiBPYmplY3QgPSB7fSxcbik6IFByb21pc2U8Y2hpbGRfcHJvY2VzcyRDaGlsZFByb2Nlc3M+IHtcbiAgb3B0aW9ucy5lbnYgPSBhd2FpdCBjcmVhdGVFeGVjRW52aXJvbm1lbnQob3B0aW9ucy5lbnYgfHwgcHJvY2Vzcy5lbnYsIENPTU1PTl9CSU5BUllfUEFUSFMpO1xuICBjb25zdCBjaGlsZCA9IHNwYXduKGNvbW1hbmQsIGFyZ3MsIG9wdGlvbnMpO1xuICBtb25pdG9yU3RyZWFtRXJyb3JzKGNoaWxkLCBjb21tYW5kLCBhcmdzLCBvcHRpb25zKTtcbiAgY2hpbGQub24oJ2Vycm9yJywgZXJyb3IgPT4ge1xuICAgIGxvZ0Vycm9yKCdlcnJvciB3aXRoIGNvbW1hbmQ6JywgY29tbWFuZCwgYXJncywgb3B0aW9ucywgJ2Vycm9yOicsIGVycm9yKTtcbiAgfSk7XG4gIHJldHVybiBjaGlsZDtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZm9ya1dpdGhFeGVjRW52aXJvbm1lbnQoXG4gIG1vZHVsZVBhdGg6IHN0cmluZyxcbiAgYXJncz86IEFycmF5PHN0cmluZz4gPSBbXSxcbiAgb3B0aW9ucz86IE9iamVjdCA9IHt9LFxuKTogUHJvbWlzZTxjaGlsZF9wcm9jZXNzJENoaWxkUHJvY2Vzcz4ge1xuICBjb25zdCBmb3JrT3B0aW9ucyA9IHtcbiAgICAuLi5vcHRpb25zLFxuICAgIGVudjogYXdhaXQgY3JlYXRlRXhlY0Vudmlyb25tZW50KG9wdGlvbnMuZW52IHx8IHByb2Nlc3MuZW52LCBDT01NT05fQklOQVJZX1BBVEhTKSxcbiAgfTtcbiAgY29uc3QgY2hpbGQgPSBmb3JrKG1vZHVsZVBhdGgsIGFyZ3MsIGZvcmtPcHRpb25zKTtcbiAgY2hpbGQub24oJ2Vycm9yJywgZXJyb3IgPT4ge1xuICAgIGxvZ0Vycm9yKCdlcnJvciBmcm9tIG1vZHVsZTonLCBtb2R1bGVQYXRoLCBhcmdzLCBvcHRpb25zLCAnZXJyb3I6JywgZXJyb3IpO1xuICB9KTtcbiAgcmV0dXJuIGNoaWxkO1xufVxuXG5jb25zdCBpc09zWCA9IHByb2Nlc3MucGxhdGZvcm0gPT09ICdkYXJ3aW4nO1xuXG4vKipcbiAqIFRha2VzIHRoZSBjb21tYW5kIGFuZCBhcmdzIHRoYXQgeW91IHdvdWxkIG5vcm1hbGx5IHBhc3MgdG8gYHNwYXduKClgIGFuZCByZXR1cm5zIGBuZXdBcmdzYCBzdWNoXG4gKiB0aGF0IHlvdSBzaG91bGQgY2FsbCBpdCB3aXRoIGBzcGF3bignc2NyaXB0JywgbmV3QXJncylgIHRvIHJ1biB0aGUgb3JpZ2luYWwgY29tbWFuZC9hcmdzIHBhaXJcbiAqIHVuZGVyIGBzY3JpcHRgLlxuICovXG5mdW5jdGlvbiBjcmVhdGVBcmdzRm9yU2NyaXB0Q29tbWFuZChjb21tYW5kOiBzdHJpbmcsIGFyZ3M/OiBBcnJheTxzdHJpbmc+ID0gW10pOiBBcnJheTxzdHJpbmc+IHtcbiAgaWYgKGlzT3NYKSB7XG4gICAgLy8gT24gT1MgWCwgc2NyaXB0IHRha2VzIHRoZSBwcm9ncmFtIHRvIHJ1biBhbmQgaXRzIGFyZ3VtZW50cyBhcyB2YXJhcmdzIGF0IHRoZSBlbmQuXG4gICAgcmV0dXJuIFsnLXEnLCAnL2Rldi9udWxsJywgY29tbWFuZF0uY29uY2F0KGFyZ3MpO1xuICB9IGVsc2Uge1xuICAgIC8vIE9uIExpbnV4LCBzY3JpcHQgdGFrZXMgdGhlIGNvbW1hbmQgdG8gcnVuIGFzIHRoZSAtYyBwYXJhbWV0ZXIuXG4gICAgLy8gVE9ETzogU2hlbGwgZXNjYXBlIGV2ZXJ5IGVsZW1lbnQgaW4gYWxsQXJncy5cbiAgICBjb25zdCBhbGxBcmdzID0gW2NvbW1hbmRdLmNvbmNhdChhcmdzKTtcbiAgICBjb25zdCBjb21tYW5kQXNJdHNPd25BcmcgPSBhbGxBcmdzLmpvaW4oJyAnKTtcbiAgICByZXR1cm4gWyctcScsICcvZGV2L251bGwnLCAnLWMnLCBjb21tYW5kQXNJdHNPd25BcmddO1xuICB9XG59XG5cbi8qKlxuICogQmFzaWNhbGx5IGxpa2Ugc2FmZVNwYXduLCBidXQgcnVucyB0aGUgY29tbWFuZCB3aXRoIHRoZSBgc2NyaXB0YCBjb21tYW5kLlxuICogYHNjcmlwdGAgZW5zdXJlcyB0ZXJtaW5hbC1saWtlIGVudmlyb25tZW50IGFuZCBjb21tYW5kcyB3ZSBydW4gZ2l2ZSBjb2xvcmVkIG91dHB1dC5cbiAqL1xuZnVuY3Rpb24gc2NyaXB0U2FmZVNwYXduKFxuICBjb21tYW5kOiBzdHJpbmcsXG4gIGFyZ3M/OiBBcnJheTxzdHJpbmc+ID0gW10sXG4gIG9wdGlvbnM/OiBPYmplY3QgPSB7fSxcbik6IFByb21pc2U8Y2hpbGRfcHJvY2VzcyRDaGlsZFByb2Nlc3M+IHtcbiAgY29uc3QgbmV3QXJncyA9IGNyZWF0ZUFyZ3NGb3JTY3JpcHRDb21tYW5kKGNvbW1hbmQsIGFyZ3MpO1xuICByZXR1cm4gc2FmZVNwYXduKCdzY3JpcHQnLCBuZXdBcmdzLCBvcHRpb25zKTtcbn1cblxuLyoqXG4gKiBXcmFwcyBzY3JpcHRTYWZlU3Bhd24gd2l0aCBhbiBPYnNlcnZhYmxlIHRoYXQgbGV0cyB5b3UgbGlzdGVuIHRvIHRoZSBzdGRvdXQgYW5kXG4gKiBzdGRlcnIgb2YgdGhlIHNwYXduZWQgcHJvY2Vzcy5cbiAqL1xuZnVuY3Rpb24gc2NyaXB0U2FmZVNwYXduQW5kT2JzZXJ2ZU91dHB1dChcbiAgY29tbWFuZDogc3RyaW5nLFxuICBhcmdzPzogQXJyYXk8c3RyaW5nPiA9IFtdLFxuICBvcHRpb25zPzogT2JqZWN0ID0ge30sXG4pOiBPYnNlcnZhYmxlPHtzdGRlcnI/OiBzdHJpbmc7IHN0ZG91dD86IHN0cmluZzt9PiB7XG4gIHJldHVybiBPYnNlcnZhYmxlLmNyZWF0ZSgob2JzZXJ2ZXI6IE9ic2VydmVyKSA9PiB7XG4gICAgbGV0IGNoaWxkUHJvY2VzcztcbiAgICBzY3JpcHRTYWZlU3Bhd24oY29tbWFuZCwgYXJncywgb3B0aW9ucykudGhlbihwcm9jID0+IHtcbiAgICAgIGNoaWxkUHJvY2VzcyA9IHByb2M7XG5cbiAgICAgIGNoaWxkUHJvY2Vzcy5zdGRvdXQub24oJ2RhdGEnLCBkYXRhID0+IHtcbiAgICAgICAgb2JzZXJ2ZXIub25OZXh0KHtzdGRvdXQ6IGRhdGEudG9TdHJpbmcoKX0pO1xuICAgICAgfSk7XG5cbiAgICAgIGxldCBzdGRlcnIgPSAnJztcbiAgICAgIGNoaWxkUHJvY2Vzcy5zdGRlcnIub24oJ2RhdGEnLCBkYXRhID0+IHtcbiAgICAgICAgc3RkZXJyICs9IGRhdGE7XG4gICAgICAgIG9ic2VydmVyLm9uTmV4dCh7c3RkZXJyOiBkYXRhLnRvU3RyaW5nKCl9KTtcbiAgICAgIH0pO1xuXG4gICAgICBjaGlsZFByb2Nlc3Mub24oJ2V4aXQnLCAoZXhpdENvZGU6IG51bWJlcikgPT4ge1xuICAgICAgICBpZiAoZXhpdENvZGUgIT09IDApIHtcbiAgICAgICAgICBvYnNlcnZlci5vbkVycm9yKHN0ZGVycik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgb2JzZXJ2ZXIub25Db21wbGV0ZWQoKTtcbiAgICAgICAgfVxuICAgICAgICBjaGlsZFByb2Nlc3MgPSBudWxsO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgaWYgKGNoaWxkUHJvY2Vzcykge1xuICAgICAgICBjaGlsZFByb2Nlc3Mua2lsbCgpO1xuICAgICAgfVxuICAgIH07XG4gIH0pO1xufVxuXG5jbGFzcyBQcm9jZXNzUmVzb3VyY2Uge1xuICBwcm9jZXNzJDogT2JzZXJ2YWJsZTxjaGlsZF9wcm9jZXNzJENoaWxkUHJvY2Vzcz47XG4gIGRpc3Bvc2VkJDogUmVwbGF5U3ViamVjdDxib29sZWFuPjtcblxuICBjb25zdHJ1Y3Rvcihwcm9taXNlT3JQcm9jZXNzOiBjaGlsZF9wcm9jZXNzJENoaWxkUHJvY2VzcyB8IFByb21pc2U8Y2hpbGRfcHJvY2VzcyRDaGlsZFByb2Nlc3M+KSB7XG4gICAgdGhpcy5kaXNwb3NlZCQgPSBuZXcgUmVwbGF5U3ViamVjdCgxKTtcbiAgICB0aGlzLnByb2Nlc3MkID0gT2JzZXJ2YWJsZS5mcm9tUHJvbWlzZShQcm9taXNlLnJlc29sdmUocHJvbWlzZU9yUHJvY2VzcykpO1xuXG4gICAgLy8gJEZsb3dJc3N1ZTogVGhlcmUncyBjdXJyZW50bHkgbm8gZ29vZCB3YXkgdG8gZGVzY3JpYmUgdGhpcyBmdW5jdGlvbiB3aXRoIEZsb3dcbiAgICBPYnNlcnZhYmxlLmNvbWJpbmVMYXRlc3QodGhpcy5wcm9jZXNzJCwgdGhpcy5kaXNwb3NlZCQpXG4gICAgICAudGFrZVVudGlsKFxuICAgICAgICB0aGlzLnByb2Nlc3MkLmZsYXRNYXAocHJvY2VzcyA9PiBPYnNlcnZhYmxlLmZyb21FdmVudChwcm9jZXNzLCAnZXhpdCcpKSxcbiAgICAgIClcbiAgICAgIC5zdWJzY3JpYmUoKFtwcm9jZXNzLCBkaXNwb3NlZF0pID0+IHtcbiAgICAgICAgaWYgKGRpc3Bvc2VkICYmIChwcm9jZXNzICE9IG51bGwpKSB7XG4gICAgICAgICAgcHJvY2Vzcy5raWxsKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICB9XG5cbiAgZ2V0U3RyZWFtKCk6IE9ic2VydmFibGU8Y2hpbGRfcHJvY2VzcyRDaGlsZFByb2Nlc3M+IHtcbiAgICByZXR1cm4gdGhpcy5wcm9jZXNzJC50YWtlVW50aWwodGhpcy5kaXNwb3NlZCQpO1xuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLmRpc3Bvc2VkJC5vbk5leHQodHJ1ZSk7XG4gICAgdGhpcy5kaXNwb3NlZCQub25Db21wbGV0ZWQoKTtcbiAgfVxuXG59XG5cbi8qKlxuICogT2JzZXJ2ZSB0aGUgc3Rkb3V0LCBzdGRlcnIgYW5kIGV4aXQgY29kZSBvZiBhIHByb2Nlc3MuXG4gKiBzdGRvdXQgYW5kIHN0ZGVyciBhcmUgc3BsaXQgYnkgbmV3bGluZXMuXG4gKi9cbmZ1bmN0aW9uIG9ic2VydmVQcm9jZXNzRXhpdChcbiAgY3JlYXRlUHJvY2VzczogKCkgPT4gY2hpbGRfcHJvY2VzcyRDaGlsZFByb2Nlc3MgfCBQcm9taXNlPGNoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzPixcbik6IE9ic2VydmFibGU8bnVtYmVyPiB7XG4gIHJldHVybiBPYnNlcnZhYmxlLnVzaW5nKFxuICAgICgpID0+IG5ldyBQcm9jZXNzUmVzb3VyY2UoY3JlYXRlUHJvY2VzcygpKSxcbiAgICBwcm9jZXNzUmVzb3VyY2UgPT4gKFxuICAgICAgcHJvY2Vzc1Jlc291cmNlLmdldFN0cmVhbSgpLmZsYXRNYXAocHJvY2VzcyA9PiBPYnNlcnZhYmxlLmZyb21FdmVudChwcm9jZXNzLCAnZXhpdCcpLnRha2UoMSkpXG4gICAgKSxcbiAgKTtcbn1cblxuLyoqXG4gKiBPYnNlcnZlIHRoZSBzdGRvdXQsIHN0ZGVyciBhbmQgZXhpdCBjb2RlIG9mIGEgcHJvY2Vzcy5cbiAqL1xuZnVuY3Rpb24gb2JzZXJ2ZVByb2Nlc3MoXG4gIGNyZWF0ZVByb2Nlc3M6ICgpID0+IGNoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzIHwgUHJvbWlzZTxjaGlsZF9wcm9jZXNzJENoaWxkUHJvY2Vzcz4sXG4pOiBPYnNlcnZhYmxlPFByb2Nlc3NNZXNzYWdlPiB7XG4gIHJldHVybiBPYnNlcnZhYmxlLnVzaW5nKFxuICAgICgpID0+IG5ldyBQcm9jZXNzUmVzb3VyY2UoY3JlYXRlUHJvY2VzcygpKSxcbiAgICBwcm9jZXNzUmVzb3VyY2UgPT4ge1xuICAgICAgcmV0dXJuIHByb2Nlc3NSZXNvdXJjZS5nZXRTdHJlYW0oKS5mbGF0TWFwKHByb2Nlc3MgPT4ge1xuICAgICAgICBpbnZhcmlhbnQocHJvY2VzcyAhPSBudWxsLCAncHJvY2VzcyBoYXMgbm90IHlldCBiZWVuIGRpc3Bvc2VkJyk7XG4gICAgICAgIC8vIFVzZSByZXBsYXkvY29ubmVjdCBvbiBleGl0IGZvciB0aGUgZmluYWwgY29uY2F0LlxuICAgICAgICAvLyBCeSBkZWZhdWx0IGNvbmNhdCBkZWZlcnMgc3Vic2NyaXB0aW9uIHVudGlsIGFmdGVyIHRoZSBMSFMgY29tcGxldGVzLlxuICAgICAgICBjb25zdCBleGl0ID0gT2JzZXJ2YWJsZS5mcm9tRXZlbnQocHJvY2VzcywgJ2V4aXQnKS50YWtlKDEpLlxuICAgICAgICAgICAgbWFwKGV4aXRDb2RlID0+ICh7a2luZDogJ2V4aXQnLCBleGl0Q29kZX0pKS5yZXBsYXkoKTtcbiAgICAgICAgZXhpdC5jb25uZWN0KCk7XG4gICAgICAgIGNvbnN0IGVycm9yID0gT2JzZXJ2YWJsZS5mcm9tRXZlbnQocHJvY2VzcywgJ2Vycm9yJykuXG4gICAgICAgICAgICB0YWtlVW50aWwoZXhpdCkuXG4gICAgICAgICAgICBtYXAoZXJyb3JPYmogPT4gKHtraW5kOiAnZXJyb3InLCBlcnJvcjogZXJyb3JPYmp9KSk7XG4gICAgICAgIGNvbnN0IHN0ZG91dCA9IHNwbGl0U3RyZWFtKG9ic2VydmVTdHJlYW0ocHJvY2Vzcy5zdGRvdXQpKS5cbiAgICAgICAgICAgIG1hcChkYXRhID0+ICh7a2luZDogJ3N0ZG91dCcsIGRhdGF9KSk7XG4gICAgICAgIGNvbnN0IHN0ZGVyciA9IHNwbGl0U3RyZWFtKG9ic2VydmVTdHJlYW0ocHJvY2Vzcy5zdGRlcnIpKS5cbiAgICAgICAgICAgIG1hcChkYXRhID0+ICh7a2luZDogJ3N0ZGVycicsIGRhdGF9KSk7XG4gICAgICAgIHJldHVybiBzdGRvdXQubWVyZ2Uoc3RkZXJyKS5tZXJnZShlcnJvcikuY29uY2F0KGV4aXQpO1xuICAgICAgfSk7XG4gICAgfSxcbiAgKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIHRoZSByZXN1bHQgb2YgZXhlY3V0aW5nIGEgcHJvY2Vzcy5cbiAqXG4gKiBAcGFyYW0gY29tbWFuZCBUaGUgY29tbWFuZCB0byBleGVjdXRlLlxuICogQHBhcmFtIGFyZ3MgVGhlIGFyZ3VtZW50cyB0byBwYXNzIHRvIHRoZSBjb21tYW5kLlxuICogQHBhcmFtIG9wdGlvbnMgT3B0aW9ucyBmb3IgY2hhbmdpbmcgaG93IHRvIHJ1biB0aGUgY29tbWFuZC5cbiAqICAgICBTZWUgaGVyZTogaHR0cDovL25vZGVqcy5vcmcvYXBpL2NoaWxkX3Byb2Nlc3MuaHRtbFxuICogICAgIFRoZSBhZGRpdGlvbmFsIG9wdGlvbnMgd2UgcHJvdmlkZTpcbiAqICAgICAgIHF1ZXVlTmFtZSBzdHJpbmcgVGhlIHF1ZXVlIG9uIHdoaWNoIHRvIGJsb2NrIGRlcGVuZGVudCBjYWxscy5cbiAqICAgICAgIHN0ZGluIHN0cmluZyBUaGUgY29udGVudHMgdG8gd3JpdGUgdG8gc3RkaW4uXG4gKiAgICAgICBwaXBlZENvbW1hbmQgc3RyaW5nIGEgY29tbWFuZCB0byBwaXBlIHRoZSBvdXRwdXQgb2YgY29tbWFuZCB0aHJvdWdoLlxuICogICAgICAgcGlwZWRBcmdzIGFycmF5IG9mIHN0cmluZ3MgYXMgYXJndW1lbnRzLlxuICogQHJldHVybiBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgdG8gYW4gb2JqZWN0IHdpdGggdGhlIHByb3BlcnRpZXM6XG4gKiAgICAgc3Rkb3V0IHN0cmluZyBUaGUgY29udGVudHMgb2YgdGhlIHByb2Nlc3MncyBvdXRwdXQgc3RyZWFtLlxuICogICAgIHN0ZGVyciBzdHJpbmcgVGhlIGNvbnRlbnRzIG9mIHRoZSBwcm9jZXNzJ3MgZXJyb3Igc3RyZWFtLlxuICogICAgIGV4aXRDb2RlIG51bWJlciBUaGUgZXhpdCBjb2RlIHJldHVybmVkIGJ5IHRoZSBwcm9jZXNzLlxuICovXG5mdW5jdGlvbiBjaGVja091dHB1dChcbiAgICBjb21tYW5kOiBzdHJpbmcsXG4gICAgYXJnczogQXJyYXk8c3RyaW5nPixcbiAgICBvcHRpb25zOiA/T2JqZWN0ID0ge30pOiBQcm9taXNlPHByb2Nlc3MkYXN5bmNFeGVjdXRlUmV0PiB7XG4gIC8vIENsb25lIHBhc3NlZCBpbiBvcHRpb25zIHNvIHRoaXMgZnVuY3Rpb24gZG9lc24ndCBtb2RpZnkgYW4gb2JqZWN0IGl0IGRvZXNuJ3Qgb3duLlxuICBjb25zdCBsb2NhbE9wdGlvbnMgPSB7Li4ub3B0aW9uc307XG5cbiAgY29uc3QgZXhlY3V0b3IgPSAocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgbGV0IGZpcnN0Q2hpbGQ7XG4gICAgbGV0IGxhc3RDaGlsZDtcblxuICAgIGxldCBmaXJzdENoaWxkU3RkZXJyO1xuICAgIGlmIChsb2NhbE9wdGlvbnMucGlwZWRDb21tYW5kKSB7XG4gICAgICAvLyBJZiBhIHNlY29uZCBjb21tYW5kIGlzIGdpdmVuLCBwaXBlIHN0ZG91dCBvZiBmaXJzdCB0byBzdGRpbiBvZiBzZWNvbmQuIFN0cmluZyBvdXRwdXRcbiAgICAgIC8vIHJldHVybmVkIGluIHRoaXMgZnVuY3Rpb24ncyBQcm9taXNlIHdpbGwgYmUgc3RkZXJyL3N0ZG91dCBvZiB0aGUgc2Vjb25kIGNvbW1hbmQuXG4gICAgICBmaXJzdENoaWxkID0gc3Bhd24oY29tbWFuZCwgYXJncywgbG9jYWxPcHRpb25zKTtcbiAgICAgIG1vbml0b3JTdHJlYW1FcnJvcnMoZmlyc3RDaGlsZCwgY29tbWFuZCwgYXJncywgbG9jYWxPcHRpb25zKTtcbiAgICAgIGZpcnN0Q2hpbGRTdGRlcnIgPSAnJztcblxuICAgICAgZmlyc3RDaGlsZC5vbignZXJyb3InLCBlcnJvciA9PiB7XG4gICAgICAgIC8vIFJlamVjdCBlYXJseSB3aXRoIHRoZSByZXN1bHQgd2hlbiBlbmNvdW50ZXJpbmcgYW4gZXJyb3IuXG4gICAgICAgIHJlamVjdCh7XG4gICAgICAgICAgY29tbWFuZDogW2NvbW1hbmRdLmNvbmNhdChhcmdzKS5qb2luKCcgJyksXG4gICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvci5tZXNzYWdlLFxuICAgICAgICAgIGV4aXRDb2RlOiBlcnJvci5jb2RlLFxuICAgICAgICAgIHN0ZGVycjogZmlyc3RDaGlsZFN0ZGVycixcbiAgICAgICAgICBzdGRvdXQ6ICcnLFxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgICBmaXJzdENoaWxkLnN0ZGVyci5vbignZGF0YScsIGRhdGEgPT4ge1xuICAgICAgICBmaXJzdENoaWxkU3RkZXJyICs9IGRhdGE7XG4gICAgICB9KTtcblxuICAgICAgbGFzdENoaWxkID0gc3Bhd24obG9jYWxPcHRpb25zLnBpcGVkQ29tbWFuZCwgbG9jYWxPcHRpb25zLnBpcGVkQXJncywgbG9jYWxPcHRpb25zKTtcbiAgICAgIG1vbml0b3JTdHJlYW1FcnJvcnMobGFzdENoaWxkLCBjb21tYW5kLCBhcmdzLCBsb2NhbE9wdGlvbnMpO1xuICAgICAgLy8gcGlwZSgpIG5vcm1hbGx5IHBhdXNlcyB0aGUgd3JpdGVyIHdoZW4gdGhlIHJlYWRlciBlcnJvcnMgKGNsb3NlcykuXG4gICAgICAvLyBUaGlzIGlzIG5vdCBob3cgVU5JWCBwaXBlcyB3b3JrOiBpZiB0aGUgcmVhZGVyIGNsb3NlcywgdGhlIHdyaXRlciBuZWVkc1xuICAgICAgLy8gdG8gYWxzbyBjbG9zZSAob3RoZXJ3aXNlIHRoZSB3cml0ZXIgcHJvY2VzcyBtYXkgaGFuZy4pXG4gICAgICAvLyBXZSBoYXZlIHRvIG1hbnVhbGx5IGNsb3NlIHRoZSB3cml0ZXIgaW4gdGhpcyBjYXNlLlxuICAgICAgbGFzdENoaWxkLnN0ZGluLm9uKCdlcnJvcicsICgpID0+IHtcbiAgICAgICAgZmlyc3RDaGlsZC5zdGRvdXQuZW1pdCgnZW5kJyk7XG4gICAgICB9KTtcbiAgICAgIGZpcnN0Q2hpbGQuc3Rkb3V0LnBpcGUobGFzdENoaWxkLnN0ZGluKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGFzdENoaWxkID0gc3Bhd24oY29tbWFuZCwgYXJncywgbG9jYWxPcHRpb25zKTtcbiAgICAgIG1vbml0b3JTdHJlYW1FcnJvcnMobGFzdENoaWxkLCBjb21tYW5kLCBhcmdzLCBsb2NhbE9wdGlvbnMpO1xuICAgICAgZmlyc3RDaGlsZCA9IGxhc3RDaGlsZDtcbiAgICB9XG5cbiAgICBsZXQgc3RkZXJyID0gJyc7XG4gICAgbGV0IHN0ZG91dCA9ICcnO1xuICAgIGxhc3RDaGlsZC5vbignY2xvc2UnLCBleGl0Q29kZSA9PiB7XG4gICAgICByZXNvbHZlKHtcbiAgICAgICAgZXhpdENvZGUsXG4gICAgICAgIHN0ZGVycixcbiAgICAgICAgc3Rkb3V0LFxuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBsYXN0Q2hpbGQub24oJ2Vycm9yJywgZXJyb3IgPT4ge1xuICAgICAgLy8gUmVqZWN0IGVhcmx5IHdpdGggdGhlIHJlc3VsdCB3aGVuIGVuY291bnRlcmluZyBhbiBlcnJvci5cbiAgICAgIHJlamVjdCh7XG4gICAgICAgIGNvbW1hbmQ6IFtjb21tYW5kXS5jb25jYXQoYXJncykuam9pbignICcpLFxuICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UsXG4gICAgICAgIGV4aXRDb2RlOiBlcnJvci5jb2RlLFxuICAgICAgICBzdGRlcnIsXG4gICAgICAgIHN0ZG91dCxcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgbGFzdENoaWxkLnN0ZGVyci5vbignZGF0YScsIGRhdGEgPT4ge1xuICAgICAgc3RkZXJyICs9IGRhdGE7XG4gICAgfSk7XG4gICAgbGFzdENoaWxkLnN0ZG91dC5vbignZGF0YScsIGRhdGEgPT4ge1xuICAgICAgc3Rkb3V0ICs9IGRhdGE7XG4gICAgfSk7XG5cbiAgICBpZiAodHlwZW9mIGxvY2FsT3B0aW9ucy5zdGRpbiA9PT0gJ3N0cmluZycpIHtcbiAgICAgIC8vIE5vdGUgdGhhdCB0aGUgTm9kZSBkb2NzIGhhdmUgdGhpcyBzY2FyeSB3YXJuaW5nIGFib3V0IHN0ZGluLmVuZCgpIG9uXG4gICAgICAvLyBodHRwOi8vbm9kZWpzLm9yZy9hcGkvY2hpbGRfcHJvY2Vzcy5odG1sI2NoaWxkX3Byb2Nlc3NfY2hpbGRfc3RkaW46XG4gICAgICAvL1xuICAgICAgLy8gXCJBIFdyaXRhYmxlIFN0cmVhbSB0aGF0IHJlcHJlc2VudHMgdGhlIGNoaWxkIHByb2Nlc3MncyBzdGRpbi4gQ2xvc2luZ1xuICAgICAgLy8gdGhpcyBzdHJlYW0gdmlhIGVuZCgpIG9mdGVuIGNhdXNlcyB0aGUgY2hpbGQgcHJvY2VzcyB0byB0ZXJtaW5hdGUuXCJcbiAgICAgIC8vXG4gICAgICAvLyBJbiBwcmFjdGljZSwgdGhpcyBoYXMgbm90IGFwcGVhcmVkIHRvIGNhdXNlIGFueSBpc3N1ZXMgdGh1cyBmYXIuXG4gICAgICBmaXJzdENoaWxkLnN0ZGluLndyaXRlKGxvY2FsT3B0aW9ucy5zdGRpbik7XG4gICAgICBmaXJzdENoaWxkLnN0ZGluLmVuZCgpO1xuICAgIH1cbiAgfTtcblxuICBmdW5jdGlvbiBtYWtlUHJvbWlzZSgpOiBQcm9taXNlPHByb2Nlc3MkYXN5bmNFeGVjdXRlUmV0PiB7XG4gICAgaWYgKGxvY2FsT3B0aW9ucy5xdWV1ZU5hbWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGV4ZWN1dG9yKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKCFibG9ja2luZ1F1ZXVlc1tsb2NhbE9wdGlvbnMucXVldWVOYW1lXSkge1xuICAgICAgICBibG9ja2luZ1F1ZXVlc1tsb2NhbE9wdGlvbnMucXVldWVOYW1lXSA9IG5ldyBQcm9taXNlUXVldWUoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBibG9ja2luZ1F1ZXVlc1tsb2NhbE9wdGlvbnMucXVldWVOYW1lXS5zdWJtaXQoZXhlY3V0b3IpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBjcmVhdGVFeGVjRW52aXJvbm1lbnQobG9jYWxPcHRpb25zLmVudiB8fCBwcm9jZXNzLmVudiwgQ09NTU9OX0JJTkFSWV9QQVRIUykudGhlbihcbiAgICB2YWwgPT4ge1xuICAgICAgbG9jYWxPcHRpb25zLmVudiA9IHZhbDtcbiAgICAgIHJldHVybiBtYWtlUHJvbWlzZSgpO1xuICAgIH0sXG4gICAgZXJyb3IgPT4ge1xuICAgICAgbG9jYWxPcHRpb25zLmVudiA9IGxvY2FsT3B0aW9ucy5lbnYgfHwgcHJvY2Vzcy5lbnY7XG4gICAgICByZXR1cm4gbWFrZVByb21pc2UoKTtcbiAgICB9XG4gICk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGFzeW5jRXhlY3V0ZShcbiAgICBjb21tYW5kOiBzdHJpbmcsXG4gICAgYXJnczogQXJyYXk8c3RyaW5nPixcbiAgICBvcHRpb25zOiA/T2JqZWN0ID0ge30pOiBQcm9taXNlPHByb2Nlc3MkYXN5bmNFeGVjdXRlUmV0PiB7XG4gIC8qICRGbG93SXNzdWUgKHQ4MjE2MTg5KSAqL1xuICBjb25zdCByZXN1bHQgPSBhd2FpdCBjaGVja091dHB1dChjb21tYW5kLCBhcmdzLCBvcHRpb25zKTtcbiAgaWYgKHJlc3VsdC5leGl0Q29kZSAhPT0gMCkge1xuICAgIC8vIER1Y2sgdHlwaW5nIEVycm9yLlxuICAgIHJlc3VsdFsnbmFtZSddID0gJ0FzeW5jIEV4ZWN1dGlvbiBFcnJvcic7XG4gICAgcmVzdWx0WydtZXNzYWdlJ10gPVxuICAgICAgICBgZXhpdENvZGU6ICR7cmVzdWx0LmV4aXRDb2RlfSwgc3RkZXJyOiAke3Jlc3VsdC5zdGRlcnJ9LCBzdGRvdXQ6ICR7cmVzdWx0LnN0ZG91dH0uYDtcbiAgICB0aHJvdyByZXN1bHQ7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGFzeW5jRXhlY3V0ZSxcbiAgY3JlYXRlQXJnc0ZvclNjcmlwdENvbW1hbmQsXG4gIGNoZWNrT3V0cHV0LFxuICBmb3JrV2l0aEV4ZWNFbnZpcm9ubWVudCxcbiAgc2FmZVNwYXduLFxuICBzY3JpcHRTYWZlU3Bhd24sXG4gIHNjcmlwdFNhZmVTcGF3bkFuZE9ic2VydmVPdXRwdXQsXG4gIGNyZWF0ZUV4ZWNFbnZpcm9ubWVudCxcbiAgb2JzZXJ2ZVByb2Nlc3NFeGl0LFxuICBvYnNlcnZlUHJvY2VzcyxcbiAgQ09NTU9OX0JJTkFSWV9QQVRIUyxcbiAgX190ZXN0X186IHtcbiAgICBEQVJXSU5fUEFUSF9IRUxQRVJfUkVHRVhQLFxuICB9LFxufTtcbiJdfQ==