"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDevices = getDevices;
exports.install = install;
exports.relaunch = relaunch;
exports.getBundleIdOfBundleAtPath = getBundleIdOfBundleAtPath;

function _process() {
  const data = require("../../../modules/nuclide-commons/process");

  _process = function () {
    return data;
  };

  return data;
}

function _xfetch() {
  const data = _interopRequireDefault(require("../../commons-node/xfetch"));

  _xfetch = function () {
    return data;
  };

  return data;
}

function _fsPromise() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/fsPromise"));

  _fsPromise = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _admZip() {
  const data = _interopRequireDefault(require("adm-zip"));

  _admZip = function () {
    return data;
  };

  return data;
}

function _bplistParser() {
  const data = _interopRequireDefault(require("bplist-parser"));

  _bplistParser = function () {
    return data;
  };

  return data;
}

function _Parsing() {
  const data = require("./Parsing");

  _Parsing = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */
async function getDevices() {
  const output = await (0, _process().runCommand)('fbsimctl', ['--json', '--format=%n%u%s%o%a', 'list']).catch(e => {
    if (e.stdout != null) {
      e.message += `\n\n${e.stdout}`;
    }

    throw e;
  }).timeout(5000).toPromise();
  return (0, _Parsing().parseFbsimctlJsonOutput)(output);
}

async function install(port, ipaUri) {
  const file = await _fsPromise().default.readFile(_nuclideUri().default.getPath(ipaUri));
  await (0, _xfetch().default)(`${_getHostname(port)}/install?codesign=1`, {
    method: 'POST',
    body: file
  });
}

async function relaunch(port, bundleId) {
  await (0, _xfetch().default)(`${_getHostname(port)}/relaunch`, {
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
  let plistData = null;
  const stat = await _fsPromise().default.stat(_nuclideUri().default.getPath(bundlePath));

  if (stat.isFile()) {
    const bundle = await _fsPromise().default.readFile(_nuclideUri().default.getPath(bundlePath));
    const infoPlist = new (_admZip().default)(bundle).getEntries().find(entry => entry.entryName.match(/.app\/Info.plist$/));

    if (!infoPlist) {
      throw new Error("App bundle doesn't contain Info.plist");
    }

    plistData = infoPlist.getData();
  } else {
    plistData = await _fsPromise().default.readFile(_nuclideUri().default.getPath(_nuclideUri().default.join(bundlePath, 'Info.plist')));
  }

  let CFBundleIdentifier;

  _bplistParser().default.parseFile(plistData, (error, parsed) => {
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