'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setRootDirectoryUri = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let getHackRoot = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (filePath) {
    return (_fsPromise || _load_fsPromise()).default.findNearestFile('.hhconfig', filePath);
  });

  return function getHackRoot(_x) {
    return _ref.apply(this, arguments);
  };
})(); /**
       * Copyright (c) 2015-present, Facebook, Inc.
       * All rights reserved.
       *
       * This source code is licensed under the license found in the LICENSE file in
       * the root directory of this source tree.
       *
       * 
       * @format
       */

let setRootDirectoryUri = exports.setRootDirectoryUri = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (directoryUri) {
    const hackRootDirectory = yield getHackRoot(directoryUri);
    (_utils || _load_utils()).default.debug(`setRootDirectoryUri: from ${directoryUri} to ${(0, (_string || _load_string()).maybeToString)(hackRootDirectory)}`);
    // TODO: make xdebug_includes.php path configurable from hhconfig.
    const hackDummyRequestFilePath = (_nuclideUri || _load_nuclideUri()).default.join(
    // flowlint-next-line sketchy-null-string:off
    hackRootDirectory ? hackRootDirectory : '', '/scripts/xdebug_includes.php');

    // Use hackDummyRequestFilePath if possible.
    if (yield (_fsPromise || _load_fsPromise()).default.exists(hackDummyRequestFilePath)) {
      (0, (_config || _load_config()).getConfig)().dummyRequestFilePath = hackDummyRequestFilePath;
    }
  });

  return function setRootDirectoryUri(_x2) {
    return _ref2.apply(this, arguments);
  };
})();

exports.sendDummyRequest = sendDummyRequest;
exports.isDummyConnection = isDummyConnection;
exports.failConnection = failConnection;
exports.isCorrectConnection = isCorrectConnection;

var _utils;

function _load_utils() {
  return _utils = _interopRequireDefault(require('./utils'));
}

var _config;

function _load_config() {
  return _config = require('./config');
}

var _helpers;

function _load_helpers() {
  return _helpers = require('./helpers');
}

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('nuclide-commons/fsPromise'));
}

var _string;

function _load_string() {
  return _string = require('nuclide-commons/string');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function sendDummyRequest() {
  return (0, (_helpers || _load_helpers()).launchScriptForDummyConnection)((0, (_config || _load_config()).getConfig)().dummyRequestFilePath);
}

function isDummyConnection(message) {
  const attributes = message.init.$;
  return attributes.fileuri.endsWith((0, (_config || _load_config()).getConfig)().dummyRequestFilePath);
}

function failConnection(socket, errorMessage) {
  (_utils || _load_utils()).default.error(errorMessage);
  socket.end();
  socket.destroy();
}

function isCorrectConnection(isAttachConnection, message) {
  const {
    pid,
    idekeyRegex,
    attachScriptRegex,
    launchScriptPath,
    launchWrapperCommand
  } = (0, (_config || _load_config()).getConfig)();
  if (!message || !message.init || !message.init.$) {
    (_utils || _load_utils()).default.error('Incorrect init');
    return false;
  }

  const init = message.init;
  if (!init.engine || !init.engine || !init.engine[0] || init.engine[0]._.toLowerCase() !== 'xdebug') {
    (_utils || _load_utils()).default.error('Incorrect engine');
    return false;
  }

  const attributes = init.$;
  if (attributes.xmlns !== 'urn:debugger_protocol_v1' || attributes['xmlns:xdebug'] !== 'http://xdebug.org/dbgp/xdebug' || attributes.language !== 'PHP') {
    (_utils || _load_utils()).default.error('Incorrect attributes');
    return false;
  }

  if (isDummyConnection(message)) {
    return true;
  }

  // Reject connections via the launch port when attached.
  if ((0, (_helpers || _load_helpers()).getMode)() === 'attach' && !isAttachConnection) {
    return false;
  }

  const requestScriptPath = (0, (_helpers || _load_helpers()).uriToPath)(attributes.fileuri);
  if ((0, (_helpers || _load_helpers()).getMode)() === 'launch') {
    // TODO: Pass arguments separately from script path so this check can be simpler.
    if (!(launchScriptPath != null)) {
      throw new Error('Null launchScriptPath in launch mode');
    }

    if (launchWrapperCommand != null) {
      return (_nuclideUri || _load_nuclideUri()).default.basename(requestScriptPath) === launchWrapperCommand;
    }

    return (0, (_string || _load_string()).shellParse)(launchScriptPath)[0] === requestScriptPath;
  }

  // The regex is only applied to connections coming in during attach mode.  We do not use the
  // regex for launching.
  return (
    // flowlint-next-line sketchy-null-number:off
    (!pid || attributes.appid === String(pid)) && (
    // flowlint-next-line sketchy-null-string:off
    !idekeyRegex || new RegExp(idekeyRegex).test(attributes.idekey)) && (
    // flowlint-next-line sketchy-null-string:off
    !attachScriptRegex || new RegExp(attachScriptRegex).test(requestScriptPath))
  );
}