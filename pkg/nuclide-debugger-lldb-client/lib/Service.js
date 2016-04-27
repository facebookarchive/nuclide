var getProcessInfoList = _asyncToGenerator(function* () {
  var _require = require('./AttachProcessInfo');

  var AttachProcessInfo = _require.AttachProcessInfo;

  // TODO: Currently first local dir only.
  var remoteUri = require('../../nuclide-remote-uri');
  var localDirectory = atom.project.getDirectories().filter(function (directory) {
    return remoteUri.isLocal(directory.getPath());
  })[0];

  if (!localDirectory) {
    return [];
  }

  var _require2 = require('../../nuclide-client');

  var getServiceByNuclideUri = _require2.getServiceByNuclideUri;

  var localService = getServiceByNuclideUri('LLDBDebuggerRpcService', localDirectory.getPath());
  (0, _assert2['default'])(localService);
  var targetInfoList = yield localService.getAttachTargetInfoList();

  var processes = [];
  for (var targetInfo of targetInfoList) {
    processes.push(new AttachProcessInfo(localDirectory.getPath(), targetInfo));
  }
  return processes;
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

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

module.exports = {
  name: 'lldb',
  getProcessInfoList: getProcessInfoList
};