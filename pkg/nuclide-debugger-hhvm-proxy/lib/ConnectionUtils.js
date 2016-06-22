Object.defineProperty(exports, '__esModule', {
  value: true
});

var getHackRoot = _asyncToGenerator(function* (filePath) {
  return yield (_commonsNodeFsPromise2 || _commonsNodeFsPromise()).default.findNearestFile('.hhconfig', filePath);
});

var setRootDirectoryUri = _asyncToGenerator(function* (directoryUri) {
  var hackRootDirectory = yield getHackRoot(directoryUri);
  (_utils2 || _utils()).default.log('setRootDirectoryUri: from ' + directoryUri + ' to ' + hackRootDirectory);
  // TODO: make xdebug_includes.php path configurable from hhconfig.
  var hackDummyRequestFilePath = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.join(hackRootDirectory ? hackRootDirectory : '', '/scripts/xdebug_includes.php');

  // Use hackDummyRequestFilePath if possible.
  if (yield (_commonsNodeFsPromise2 || _commonsNodeFsPromise()).default.exists(hackDummyRequestFilePath)) {
    (0, (_config2 || _config()).getConfig)().dummyRequestFilePath = hackDummyRequestFilePath;
  }
});

exports.setRootDirectoryUri = setRootDirectoryUri;
exports.sendDummyRequest = sendDummyRequest;
exports.isDummyConnection = isDummyConnection;
exports.failConnection = failConnection;
exports.isCorrectConnection = isCorrectConnection;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _utils2;

function _utils() {
  return _utils2 = _interopRequireDefault(require('./utils'));
}

var _config2;

function _config() {
  return _config2 = require('./config');
}

var _helpers2;

function _helpers() {
  return _helpers2 = require('./helpers');
}

var _commonsNodeFsPromise2;

function _commonsNodeFsPromise() {
  return _commonsNodeFsPromise2 = _interopRequireDefault(require('../../commons-node/fsPromise'));
}

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../nuclide-remote-uri'));
}

function sendDummyRequest() {
  return (0, (_helpers2 || _helpers()).launchScriptForDummyConnection)((0, (_config2 || _config()).getConfig)().dummyRequestFilePath);
}

function isDummyConnection(message) {
  var attributes = message.init.$;
  return attributes.fileuri.endsWith((0, (_config2 || _config()).getConfig)().dummyRequestFilePath);
}

function failConnection(socket, errorMessage) {
  (_utils2 || _utils()).default.log(errorMessage);
  socket.end();
  socket.destroy();
}

function isCorrectConnection(message) {
  var _ref = (0, (_config2 || _config()).getConfig)();

  var pid = _ref.pid;
  var idekeyRegex = _ref.idekeyRegex;
  var scriptRegex = _ref.scriptRegex;

  if (!message || !message.init || !message.init.$) {
    (_utils2 || _utils()).default.logError('Incorrect init');
    return false;
  }

  var init = message.init;
  if (!init.engine || !init.engine || !init.engine[0] || init.engine[0]._ !== 'xdebug') {
    (_utils2 || _utils()).default.logError('Incorrect engine');
    return false;
  }

  var attributes = init.$;
  if (attributes.xmlns !== 'urn:debugger_protocol_v1' || attributes['xmlns:xdebug'] !== 'http://xdebug.org/dbgp/xdebug' || attributes.language !== 'PHP') {
    (_utils2 || _utils()).default.logError('Incorrect attributes');
    return false;
  }

  return (!pid || attributes.appid === String(pid)) && (!idekeyRegex || new RegExp(idekeyRegex).test(attributes.idekey)) && (!scriptRegex || new RegExp(scriptRegex).test((0, (_helpers2 || _helpers()).uriToPath)(attributes.fileuri)));
}