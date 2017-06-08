'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getServerSideMarshalers = exports.localNuclideUriMarshalers = undefined;
exports.getRemoteNuclideUriMarshalers = getRemoteNuclideUriMarshalers;

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _simpleTextBuffer;

function _load_simpleTextBuffer() {
  return _simpleTextBuffer = require('simple-text-buffer');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getRemoteNuclideUriMarshalers(hostname) {
  return {
    typeName: (_nuclideUri || _load_nuclideUri()).default.NUCLIDE_URI_TYPE_NAME,
    marshaller: remoteUri => (_nuclideUri || _load_nuclideUri()).default.getPath(remoteUri),
    unmarshaller: path => (_nuclideUri || _load_nuclideUri()).default.createRemoteUri(hostname, path)
  };
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

const localNuclideUriMarshalers = exports.localNuclideUriMarshalers = {
  typeName: (_nuclideUri || _load_nuclideUri()).default.NUCLIDE_URI_TYPE_NAME,
  marshaller: uri => {
    (_nuclideUri || _load_nuclideUri()).default.validate(uri, false);
    return uri;
  },
  unmarshaller: remotePath => {
    (_nuclideUri || _load_nuclideUri()).default.validate(remotePath, false);
    return remotePath;
  }
};

const jsonToServerPoint = json => new (_simpleTextBuffer || _load_simpleTextBuffer()).Point(json.row, json.column);
const jsonToServerRange = json => new (_simpleTextBuffer || _load_simpleTextBuffer()).Range(jsonToServerPoint(json.start), jsonToServerPoint(json.end));

const getServerSideMarshalers = exports.getServerSideMarshalers = [localNuclideUriMarshalers, {
  typeName: 'atom$Point',
  marshaller: point => point,
  unmarshaller: jsonToServerPoint
}, {
  typeName: 'atom$Range',
  marshaller: range => range,
  unmarshaller: jsonToServerRange
}];