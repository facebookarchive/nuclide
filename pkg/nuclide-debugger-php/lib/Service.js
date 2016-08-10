var getProcessInfoList = _asyncToGenerator(function* () {
  var log = (_utils2 || _utils()).default.log;

  log('Getting process info list');

  // TODO: Currently first remote dir only.
  var remoteDirectoryPath = atom.project.getDirectories().map(function (directoryPath) {
    return directoryPath.getPath();
  }).filter(function (directoryPath) {
    return (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.isRemote(directoryPath);
  })[0];

  if (remoteDirectoryPath) {
    return [new (_AttachProcessInfo2 || _AttachProcessInfo()).AttachProcessInfo(remoteDirectoryPath)];
  } else {
    log('No remote dirs getting process info list');
    return [];
  }
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

var _utils2;

function _utils() {
  return _utils2 = _interopRequireDefault(require('./utils'));
}

var _commonsNodeNuclideUri2;

function _commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri2 = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _AttachProcessInfo2;

function _AttachProcessInfo() {
  return _AttachProcessInfo2 = require('./AttachProcessInfo');
}

module.exports = {
  name: 'hhvm',
  getProcessInfoList: getProcessInfoList
};