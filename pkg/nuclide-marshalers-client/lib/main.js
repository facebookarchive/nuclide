"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getClientSideMarshalers = getClientSideMarshalers;
exports.getClientSideLoopbackMarshalers = void 0;

function _nuclideMarshalersCommon() {
  const data = require("../../nuclide-marshalers-common");

  _nuclideMarshalersCommon = function () {
    return data;
  };

  return data;
}

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
const isAtomProcess = typeof atom !== 'undefined';
let clientMarshallers = []; // TODO support other client's point & range marshalling.

if (isAtomProcess) {
  const AtomPoint = require('atom').Point;

  const AtomRange = require('atom').Range;

  const jsonToAtomPoint = json => new AtomPoint(json.row, json.column);

  const jsonToAtomRange = json => new AtomRange(jsonToAtomPoint(json.start), jsonToAtomPoint(json.end));

  clientMarshallers = [{
    typeName: 'atom$Point',
    marshaller: point => point,
    unmarshaller: jsonToAtomPoint
  }, {
    typeName: 'atom$Range',
    marshaller: range => range,
    unmarshaller: jsonToAtomRange
  }];
}

function getClientSideMarshalers(hostname) {
  const remoteUriMarshaller = (0, _nuclideMarshalersCommon().getRemoteNuclideUriMarshalers)(hostname);
  return [remoteUriMarshaller, ...clientMarshallers];
}

const getClientSideLoopbackMarshalers = [_nuclideMarshalersCommon().localNuclideUriMarshalers, ...clientMarshallers];
exports.getClientSideLoopbackMarshalers = getClientSideLoopbackMarshalers;