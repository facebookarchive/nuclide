var getProcessInfoList = _asyncToGenerator(function* () {
  // TODO: Currently first local dir only.
  var localDirectory = atom.project.getDirectories().filter(function (directory) {
    return (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.isLocal(directory.getPath());
  })[0];

  if (!localDirectory) {
    return [];
  }

  var localService = (0, (_nuclideRemoteConnection2 || _nuclideRemoteConnection()).getServiceByNuclideUri)('NativeDebuggerService', localDirectory.getPath());
  (0, (_assert2 || _assert()).default)(localService);
  var targetInfoList = yield localService.getAttachTargetInfoList();

  var processes = [];
  for (var targetInfo of targetInfoList) {
    processes.push(new (_AttachProcessInfo2 || _AttachProcessInfo()).AttachProcessInfo(localDirectory.getPath(), targetInfo));
  }
  return processes;
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _commonsNodeNuclideUri2;

function _commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri2 = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _nuclideRemoteConnection2;

function _nuclideRemoteConnection() {
  return _nuclideRemoteConnection2 = require('../../nuclide-remote-connection');
}

var _AttachProcessInfo2;

function _AttachProcessInfo() {
  return _AttachProcessInfo2 = require('./AttachProcessInfo');
}

module.exports = {
  name: 'lldb',
  getProcessInfoList: getProcessInfoList
};