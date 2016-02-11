var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

/**
 * @param options The argument to the constructor of ScriptBufferedProcess.
 * @return A ScriptBufferedProcess with common binary paths added to `options.env`.
 */

var createScriptBufferedProcessWithEnv = _asyncToGenerator(function* (options) {
  var _require3 = require('../../commons');

  var createExecEnvironment = _require3.createExecEnvironment;
  var COMMON_BINARY_PATHS = _require3.COMMON_BINARY_PATHS;

  var localOptions = _extends({}, options);
  localOptions.env = yield createExecEnvironment(localOptions.env || process.env, COMMON_BINARY_PATHS);
  // Flow infers Promise<ScriptBufferedProcess> and believes that to be incompatible with
  // Promise<BufferedProcess> so we need to cast.
  return new ScriptBufferedProcess(localOptions);
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _require = require('atom');

var BufferedProcess = _require.BufferedProcess;

var _require2 = require('../../commons');

var createArgsForScriptCommand = _require2.createArgsForScriptCommand;

/**
 * Wrapper around BufferedProcess that runs the command using unix `script`
 * command. Most of the commands (scripts) we run will color output only if
 * their stdout is terminal. `script` ensures terminal-like environment and
 * commands we run give colored output.
 */

var ScriptBufferedProcess = (function (_BufferedProcess) {
  _inherits(ScriptBufferedProcess, _BufferedProcess);

  function ScriptBufferedProcess(options) {
    _classCallCheck(this, ScriptBufferedProcess);

    var localOptions = _extends({}, options);
    localOptions.args = createArgsForScriptCommand(localOptions.command, localOptions.args);
    localOptions.command = 'script';
    _get(Object.getPrototypeOf(ScriptBufferedProcess.prototype), 'constructor', this).call(this, localOptions);
  }

  return ScriptBufferedProcess;
})(BufferedProcess);

module.exports = {
  createScriptBufferedProcessWithEnv: createScriptBufferedProcessWithEnv
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjcmlwdC1idWZmZXJlZC1wcm9jZXNzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztJQWlDZSxrQ0FBa0MscUJBQWpELFdBQWtELE9BQWUsRUFBNEI7a0JBQ3RDLE9BQU8sQ0FBQyxlQUFlLENBQUM7O01BQXRFLHFCQUFxQixhQUFyQixxQkFBcUI7TUFBRSxtQkFBbUIsYUFBbkIsbUJBQW1COztBQUVqRCxNQUFNLFlBQVksZ0JBQU8sT0FBTyxDQUFDLENBQUM7QUFDbEMsY0FBWSxDQUFDLEdBQUcsR0FBRyxNQUFNLHFCQUFxQixDQUFDLFlBQVksQ0FBQyxHQUFHLElBQUssT0FBTyxDQUFDLEdBQUcsRUFDN0UsbUJBQW1CLENBQUMsQ0FBQzs7O0FBR3ZCLFNBQVEsSUFBSSxxQkFBcUIsQ0FBQyxZQUFZLENBQUMsQ0FBbUI7Q0FDbkU7Ozs7Ozs7Ozs7Ozs7Ozs7ZUEvQnlCLE9BQU8sQ0FBQyxNQUFNLENBQUM7O0lBQWxDLGVBQWUsWUFBZixlQUFlOztnQkFDZSxPQUFPLENBQUMsZUFBZSxDQUFDOztJQUF0RCwwQkFBMEIsYUFBMUIsMEJBQTBCOzs7Ozs7Ozs7SUFRM0IscUJBQXFCO1lBQXJCLHFCQUFxQjs7QUFDZCxXQURQLHFCQUFxQixDQUNiLE9BQU8sRUFBRTswQkFEakIscUJBQXFCOztBQUV2QixRQUFNLFlBQVksZ0JBQU8sT0FBTyxDQUFDLENBQUM7QUFDbEMsZ0JBQVksQ0FBQyxJQUFJLEdBQUcsMEJBQTBCLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDeEYsZ0JBQVksQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDO0FBQ2hDLCtCQUxFLHFCQUFxQiw2Q0FLakIsWUFBWSxFQUFFO0dBQ3JCOztTQU5HLHFCQUFxQjtHQUFTLGVBQWU7O0FBd0JuRCxNQUFNLENBQUMsT0FBTyxHQUFHO0FBQ2Ysb0NBQWtDLEVBQWxDLGtDQUFrQztDQUNuQyxDQUFDIiwiZmlsZSI6InNjcmlwdC1idWZmZXJlZC1wcm9jZXNzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3Qge0J1ZmZlcmVkUHJvY2Vzc30gPSByZXF1aXJlKCdhdG9tJyk7XG5jb25zdCB7Y3JlYXRlQXJnc0ZvclNjcmlwdENvbW1hbmR9ID0gcmVxdWlyZSgnLi4vLi4vY29tbW9ucycpO1xuXG4vKipcbiAqIFdyYXBwZXIgYXJvdW5kIEJ1ZmZlcmVkUHJvY2VzcyB0aGF0IHJ1bnMgdGhlIGNvbW1hbmQgdXNpbmcgdW5peCBgc2NyaXB0YFxuICogY29tbWFuZC4gTW9zdCBvZiB0aGUgY29tbWFuZHMgKHNjcmlwdHMpIHdlIHJ1biB3aWxsIGNvbG9yIG91dHB1dCBvbmx5IGlmXG4gKiB0aGVpciBzdGRvdXQgaXMgdGVybWluYWwuIGBzY3JpcHRgIGVuc3VyZXMgdGVybWluYWwtbGlrZSBlbnZpcm9ubWVudCBhbmRcbiAqIGNvbW1hbmRzIHdlIHJ1biBnaXZlIGNvbG9yZWQgb3V0cHV0LlxuICovXG5jbGFzcyBTY3JpcHRCdWZmZXJlZFByb2Nlc3MgZXh0ZW5kcyBCdWZmZXJlZFByb2Nlc3Mge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgY29uc3QgbG9jYWxPcHRpb25zID0gey4uLm9wdGlvbnN9O1xuICAgIGxvY2FsT3B0aW9ucy5hcmdzID0gY3JlYXRlQXJnc0ZvclNjcmlwdENvbW1hbmQobG9jYWxPcHRpb25zLmNvbW1hbmQsIGxvY2FsT3B0aW9ucy5hcmdzKTtcbiAgICBsb2NhbE9wdGlvbnMuY29tbWFuZCA9ICdzY3JpcHQnO1xuICAgIHN1cGVyKGxvY2FsT3B0aW9ucyk7XG4gIH1cbn1cblxuLyoqXG4gKiBAcGFyYW0gb3B0aW9ucyBUaGUgYXJndW1lbnQgdG8gdGhlIGNvbnN0cnVjdG9yIG9mIFNjcmlwdEJ1ZmZlcmVkUHJvY2Vzcy5cbiAqIEByZXR1cm4gQSBTY3JpcHRCdWZmZXJlZFByb2Nlc3Mgd2l0aCBjb21tb24gYmluYXJ5IHBhdGhzIGFkZGVkIHRvIGBvcHRpb25zLmVudmAuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGNyZWF0ZVNjcmlwdEJ1ZmZlcmVkUHJvY2Vzc1dpdGhFbnYob3B0aW9uczogT2JqZWN0KTogUHJvbWlzZTxCdWZmZXJlZFByb2Nlc3M+IHtcbiAgY29uc3Qge2NyZWF0ZUV4ZWNFbnZpcm9ubWVudCwgQ09NTU9OX0JJTkFSWV9QQVRIU30gPSByZXF1aXJlKCcuLi8uLi9jb21tb25zJyk7XG5cbiAgY29uc3QgbG9jYWxPcHRpb25zID0gey4uLm9wdGlvbnN9O1xuICBsb2NhbE9wdGlvbnMuZW52ID0gYXdhaXQgY3JlYXRlRXhlY0Vudmlyb25tZW50KGxvY2FsT3B0aW9ucy5lbnYgfHwgIHByb2Nlc3MuZW52LFxuICAgIENPTU1PTl9CSU5BUllfUEFUSFMpO1xuICAvLyBGbG93IGluZmVycyBQcm9taXNlPFNjcmlwdEJ1ZmZlcmVkUHJvY2Vzcz4gYW5kIGJlbGlldmVzIHRoYXQgdG8gYmUgaW5jb21wYXRpYmxlIHdpdGhcbiAgLy8gUHJvbWlzZTxCdWZmZXJlZFByb2Nlc3M+IHNvIHdlIG5lZWQgdG8gY2FzdC5cbiAgcmV0dXJuIChuZXcgU2NyaXB0QnVmZmVyZWRQcm9jZXNzKGxvY2FsT3B0aW9ucyk6IEJ1ZmZlcmVkUHJvY2Vzcyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBjcmVhdGVTY3JpcHRCdWZmZXJlZFByb2Nlc3NXaXRoRW52LFxufTtcbiJdfQ==