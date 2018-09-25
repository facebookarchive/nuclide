"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getRemoteNuclideUriMarshalers = getRemoteNuclideUriMarshalers;
exports.getServerSideMarshalers = exports.localNuclideUriMarshalers = void 0;

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _simpleTextBuffer() {
  const data = require("simple-text-buffer");

  _simpleTextBuffer = function () {
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
 *  strict-local
 * @format
 */
function getRemoteNuclideUriMarshalers(hostname) {
  return {
    typeName: _nuclideUri().default.NUCLIDE_URI_TYPE_NAME,
    marshaller: remoteUri => _nuclideUri().default.getPath(remoteUri),
    unmarshaller: path => _nuclideUri().default.createRemoteUri(hostname, path)
  };
}

const localNuclideUriMarshalers = {
  typeName: _nuclideUri().default.NUCLIDE_URI_TYPE_NAME,
  marshaller: uri => {
    _nuclideUri().default.validate(uri, false);

    return uri;
  },
  unmarshaller: remotePath => {
    _nuclideUri().default.validate(remotePath, false);

    return remotePath;
  }
};
exports.localNuclideUriMarshalers = localNuclideUriMarshalers;

const jsonToServerPoint = json => new (_simpleTextBuffer().Point)(json.row, json.column);

const jsonToServerRange = json => new (_simpleTextBuffer().Range)(jsonToServerPoint(json.start), jsonToServerPoint(json.end));

const getServerSideMarshalers = [localNuclideUriMarshalers, {
  typeName: 'atom$Point',
  marshaller: point => point,
  unmarshaller: jsonToServerPoint
}, {
  typeName: 'atom$Range',
  marshaller: range => range,
  unmarshaller: jsonToServerRange
}];
exports.getServerSideMarshalers = getServerSideMarshalers;