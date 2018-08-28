"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getAtomSideMarshalers = getAtomSideMarshalers;
exports.getAtomSideLoopbackMarshalers = void 0;

function _nuclideMarshalersCommon() {
  const data = require("../../nuclide-marshalers-common");

  _nuclideMarshalersCommon = function () {
    return data;
  };

  return data;
}

var _atom = require("atom");

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
const jsonToAtomPoint = json => new _atom.Point(json.row, json.column);

const jsonToAtomRange = json => new _atom.Range(jsonToAtomPoint(json.start), jsonToAtomPoint(json.end));

const atomPointMarshalers = {
  typeName: 'atom$Point',
  marshaller: point => point,
  unmarshaller: jsonToAtomPoint
};
const atomRangeMarshalers = {
  typeName: 'atom$Range',
  marshaller: range => range,
  unmarshaller: jsonToAtomRange
};

function getAtomSideMarshalers(hostname) {
  return [(0, _nuclideMarshalersCommon().getRemoteNuclideUriMarshalers)(hostname), atomPointMarshalers, atomRangeMarshalers];
}

const getAtomSideLoopbackMarshalers = [_nuclideMarshalersCommon().localNuclideUriMarshalers, atomPointMarshalers, atomRangeMarshalers];
exports.getAtomSideLoopbackMarshalers = getAtomSideLoopbackMarshalers;