var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

/**
 * @param options The argument to the constructor of ScriptBufferedProcess.
 * @return A ScriptBufferedProcess with common binary paths added to `options.env`.
 */

var createScriptBufferedProcessWithEnv = _asyncToGenerator(function* (options) {
  var _require3 = require('../../nuclide-commons');

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

var _require2 = require('../../nuclide-commons');

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjcmlwdC1idWZmZXJlZC1wcm9jZXNzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztJQWlDZSxrQ0FBa0MscUJBQWpELFdBQWtELE9BQWUsRUFBNEI7a0JBQ3RDLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQzs7TUFBOUUscUJBQXFCLGFBQXJCLHFCQUFxQjtNQUFFLG1CQUFtQixhQUFuQixtQkFBbUI7O0FBRWpELE1BQU0sWUFBWSxnQkFBTyxPQUFPLENBQUMsQ0FBQztBQUNsQyxjQUFZLENBQUMsR0FBRyxHQUFHLE1BQU0scUJBQXFCLENBQUMsWUFBWSxDQUFDLEdBQUcsSUFBSyxPQUFPLENBQUMsR0FBRyxFQUM3RSxtQkFBbUIsQ0FBQyxDQUFDOzs7QUFHdkIsU0FBUSxJQUFJLHFCQUFxQixDQUFDLFlBQVksQ0FBQyxDQUFtQjtDQUNuRTs7Ozs7Ozs7Ozs7Ozs7OztlQS9CeUIsT0FBTyxDQUFDLE1BQU0sQ0FBQzs7SUFBbEMsZUFBZSxZQUFmLGVBQWU7O2dCQUNlLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQzs7SUFBOUQsMEJBQTBCLGFBQTFCLDBCQUEwQjs7Ozs7Ozs7O0lBUTNCLHFCQUFxQjtZQUFyQixxQkFBcUI7O0FBQ2QsV0FEUCxxQkFBcUIsQ0FDYixPQUFPLEVBQUU7MEJBRGpCLHFCQUFxQjs7QUFFdkIsUUFBTSxZQUFZLGdCQUFPLE9BQU8sQ0FBQyxDQUFDO0FBQ2xDLGdCQUFZLENBQUMsSUFBSSxHQUFHLDBCQUEwQixDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3hGLGdCQUFZLENBQUMsT0FBTyxHQUFHLFFBQVEsQ0FBQztBQUNoQywrQkFMRSxxQkFBcUIsNkNBS2pCLFlBQVksRUFBRTtHQUNyQjs7U0FORyxxQkFBcUI7R0FBUyxlQUFlOztBQXdCbkQsTUFBTSxDQUFDLE9BQU8sR0FBRztBQUNmLG9DQUFrQyxFQUFsQyxrQ0FBa0M7Q0FDbkMsQ0FBQyIsImZpbGUiOiJzY3JpcHQtYnVmZmVyZWQtcHJvY2Vzcy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IHtCdWZmZXJlZFByb2Nlc3N9ID0gcmVxdWlyZSgnYXRvbScpO1xuY29uc3Qge2NyZWF0ZUFyZ3NGb3JTY3JpcHRDb21tYW5kfSA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtY29tbW9ucycpO1xuXG4vKipcbiAqIFdyYXBwZXIgYXJvdW5kIEJ1ZmZlcmVkUHJvY2VzcyB0aGF0IHJ1bnMgdGhlIGNvbW1hbmQgdXNpbmcgdW5peCBgc2NyaXB0YFxuICogY29tbWFuZC4gTW9zdCBvZiB0aGUgY29tbWFuZHMgKHNjcmlwdHMpIHdlIHJ1biB3aWxsIGNvbG9yIG91dHB1dCBvbmx5IGlmXG4gKiB0aGVpciBzdGRvdXQgaXMgdGVybWluYWwuIGBzY3JpcHRgIGVuc3VyZXMgdGVybWluYWwtbGlrZSBlbnZpcm9ubWVudCBhbmRcbiAqIGNvbW1hbmRzIHdlIHJ1biBnaXZlIGNvbG9yZWQgb3V0cHV0LlxuICovXG5jbGFzcyBTY3JpcHRCdWZmZXJlZFByb2Nlc3MgZXh0ZW5kcyBCdWZmZXJlZFByb2Nlc3Mge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgY29uc3QgbG9jYWxPcHRpb25zID0gey4uLm9wdGlvbnN9O1xuICAgIGxvY2FsT3B0aW9ucy5hcmdzID0gY3JlYXRlQXJnc0ZvclNjcmlwdENvbW1hbmQobG9jYWxPcHRpb25zLmNvbW1hbmQsIGxvY2FsT3B0aW9ucy5hcmdzKTtcbiAgICBsb2NhbE9wdGlvbnMuY29tbWFuZCA9ICdzY3JpcHQnO1xuICAgIHN1cGVyKGxvY2FsT3B0aW9ucyk7XG4gIH1cbn1cblxuLyoqXG4gKiBAcGFyYW0gb3B0aW9ucyBUaGUgYXJndW1lbnQgdG8gdGhlIGNvbnN0cnVjdG9yIG9mIFNjcmlwdEJ1ZmZlcmVkUHJvY2Vzcy5cbiAqIEByZXR1cm4gQSBTY3JpcHRCdWZmZXJlZFByb2Nlc3Mgd2l0aCBjb21tb24gYmluYXJ5IHBhdGhzIGFkZGVkIHRvIGBvcHRpb25zLmVudmAuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGNyZWF0ZVNjcmlwdEJ1ZmZlcmVkUHJvY2Vzc1dpdGhFbnYob3B0aW9uczogT2JqZWN0KTogUHJvbWlzZTxCdWZmZXJlZFByb2Nlc3M+IHtcbiAgY29uc3Qge2NyZWF0ZUV4ZWNFbnZpcm9ubWVudCwgQ09NTU9OX0JJTkFSWV9QQVRIU30gPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLWNvbW1vbnMnKTtcblxuICBjb25zdCBsb2NhbE9wdGlvbnMgPSB7Li4ub3B0aW9uc307XG4gIGxvY2FsT3B0aW9ucy5lbnYgPSBhd2FpdCBjcmVhdGVFeGVjRW52aXJvbm1lbnQobG9jYWxPcHRpb25zLmVudiB8fCAgcHJvY2Vzcy5lbnYsXG4gICAgQ09NTU9OX0JJTkFSWV9QQVRIUyk7XG4gIC8vIEZsb3cgaW5mZXJzIFByb21pc2U8U2NyaXB0QnVmZmVyZWRQcm9jZXNzPiBhbmQgYmVsaWV2ZXMgdGhhdCB0byBiZSBpbmNvbXBhdGlibGUgd2l0aFxuICAvLyBQcm9taXNlPEJ1ZmZlcmVkUHJvY2Vzcz4gc28gd2UgbmVlZCB0byBjYXN0LlxuICByZXR1cm4gKG5ldyBTY3JpcHRCdWZmZXJlZFByb2Nlc3MobG9jYWxPcHRpb25zKTogQnVmZmVyZWRQcm9jZXNzKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNyZWF0ZVNjcmlwdEJ1ZmZlcmVkUHJvY2Vzc1dpdGhFbnYsXG59O1xuIl19