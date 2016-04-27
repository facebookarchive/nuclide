Object.defineProperty(exports, '__esModule', {
  value: true
});

var getHackRoot = _asyncToGenerator(function* (filePath) {
  return yield _nuclideCommons.fsPromise.findNearestFile('.hhconfig', filePath);
});

var setRootDirectoryUri = _asyncToGenerator(function* (directoryUri) {
  var hackRootDirectory = yield getHackRoot(directoryUri);
  _utils2['default'].log('setRootDirectoryUri: from ' + directoryUri + ' to ' + hackRootDirectory);
  // TODO: make xdebug_includes.php path configurable from hhconfig.
  var hackDummyRequestFilePath = _path2['default'].join(hackRootDirectory ? hackRootDirectory : '', '/scripts/xdebug_includes.php');

  // Use hackDummyRequestFilePath if possible.
  if (yield _nuclideCommons.fsPromise.exists(hackDummyRequestFilePath)) {
    (0, _config.getConfig)().dummyRequestFilePath = hackDummyRequestFilePath;
  }
});

exports.setRootDirectoryUri = setRootDirectoryUri;
exports.sendDummyRequest = sendDummyRequest;
exports.isDummyConnection = isDummyConnection;
exports.failConnection = failConnection;
exports.isCorrectConnection = isCorrectConnection;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

var _config = require('./config');

var _helpers = require('./helpers');

var _nuclideCommons = require('../../nuclide-commons');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function sendDummyRequest() {
  return (0, _helpers.launchScriptForDummyConnection)((0, _config.getConfig)().dummyRequestFilePath);
}

function isDummyConnection(message) {
  var attributes = message.init.$;
  return attributes.fileuri.endsWith((0, _config.getConfig)().dummyRequestFilePath);
}

function failConnection(socket, errorMessage) {
  _utils2['default'].log(errorMessage);
  socket.end();
  socket.destroy();
}

function isCorrectConnection(message) {
  var _getConfig = (0, _config.getConfig)();

  var pid = _getConfig.pid;
  var idekeyRegex = _getConfig.idekeyRegex;
  var scriptRegex = _getConfig.scriptRegex;

  if (!message || !message.init || !message.init.$) {
    _utils2['default'].logError('Incorrect init');
    return false;
  }

  var init = message.init;
  if (!init.engine || !init.engine || !init.engine[0] || init.engine[0]._ !== 'xdebug') {
    _utils2['default'].logError('Incorrect engine');
    return false;
  }

  var attributes = init.$;
  if (attributes.xmlns !== 'urn:debugger_protocol_v1' || attributes['xmlns:xdebug'] !== 'http://xdebug.org/dbgp/xdebug' || attributes.language !== 'PHP') {
    _utils2['default'].logError('Incorrect attributes');
    return false;
  }

  return (!pid || attributes.appid === String(pid)) && (!idekeyRegex || new RegExp(idekeyRegex).test(attributes.idekey)) && (!scriptRegex || new RegExp(scriptRegex).test((0, _helpers.uriToPath)(attributes.fileuri)));
}