var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

/**
 * @param options The argument to the constructor of ScriptBufferedProcess.
 * @return A ScriptBufferedProcess with common binary paths added to `options.env`.
 */

var createScriptBufferedProcessWithEnv = _asyncToGenerator(function* (options) {
  var localOptions = _extends({}, options);
  localOptions.env = yield (0, (_nuclideCommons2 || _nuclideCommons()).createExecEnvironment)(localOptions.env || process.env, (_nuclideCommons2 || _nuclideCommons()).COMMON_BINARY_PATHS);
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

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _nuclideCommons2;

function _nuclideCommons() {
  return _nuclideCommons2 = require('../../nuclide-commons');
}

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
    localOptions.args = (0, (_nuclideCommons2 || _nuclideCommons()).createArgsForScriptCommand)(localOptions.command, localOptions.args);
    localOptions.command = 'script';
    _get(Object.getPrototypeOf(ScriptBufferedProcess.prototype), 'constructor', this).call(this, localOptions);
  }

  return ScriptBufferedProcess;
})((_atom2 || _atom()).BufferedProcess);

module.exports = {
  createScriptBufferedProcessWithEnv: createScriptBufferedProcessWithEnv
};