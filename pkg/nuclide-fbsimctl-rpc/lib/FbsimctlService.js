'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDevices = getDevices;
exports.install = install;
exports.relaunch = relaunch;
exports.getBundleIdOfBundleAtPath = getBundleIdOfBundleAtPath;

var _process;

function _load_process() {
  return _process = require('../../../modules/nuclide-commons/process');
}

var _xfetch;

function _load_xfetch() {
  return _xfetch = _interopRequireDefault(require('../../commons-node/xfetch'));
}

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('../../../modules/nuclide-commons/fsPromise'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _admZip;

function _load_admZip() {
  return _admZip = _interopRequireDefault(require('adm-zip'));
}

var _bplistParser;

function _load_bplistParser() {
  return _bplistParser = _interopRequireDefault(require('bplist-parser'));
}

var _Parsing;

function _load_Parsing() {
  return _Parsing = require('./Parsing');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

async function getDevices() {
  const output = await (0, (_process || _load_process()).runCommand)('fbsimctl', ['--json', '--format=%n%u%s%o%a', 'list']).toPromise();
  return (0, (_Parsing || _load_Parsing()).parseFbsimctlJsonOutput)(output);
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */

async function install(port, ipaUri) {
  const file = await (_fsPromise || _load_fsPromise()).default.readFile((_nuclideUri || _load_nuclideUri()).default.getPath(ipaUri));
  await (0, (_xfetch || _load_xfetch()).default)(`${_getHostname(port)}/install?codesign=1`, {
    method: 'POST',
    body: file
  });
}

async function relaunch(port, bundleId) {
  await (0, (_xfetch || _load_xfetch()).default)(`${_getHostname(port)}/relaunch`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify({
      bundle_id: bundleId
    })
  });
}

async function getBundleIdOfBundleAtPath(bundlePath) {
  const bundle = await (_fsPromise || _load_fsPromise()).default.readFile((_nuclideUri || _load_nuclideUri()).default.getPath(bundlePath));
  const infoPlist = new (_admZip || _load_admZip()).default(bundle).getEntries().find(entry => entry.entryName.match(/.app\/Info.plist$/));

  if (!infoPlist) {
    throw new Error("App bundle doesn't contain Info.plist");
  }

  let CFBundleIdentifier;
  (_bplistParser || _load_bplistParser()).default.parseFile(infoPlist.getData(), (error, parsed) => {
    if (parsed && parsed.length > 0) {
      CFBundleIdentifier = parsed[0].CFBundleIdentifier;
    }
  });

  if (!CFBundleIdentifier) {
    throw new Error("Couldn't find bundle identifier in bundle's Info.plist");
  }
  return CFBundleIdentifier;
}

function _getHostname(port) {
  return `http://localhost:${port}`;
}