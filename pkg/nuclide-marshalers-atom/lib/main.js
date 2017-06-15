'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getAtomSideLoopbackMarshalers = undefined;
exports.getAtomSideMarshalers = getAtomSideMarshalers;

var _nuclideMarshalersCommon;

function _load_nuclideMarshalersCommon() {
  return _nuclideMarshalersCommon = require('../../nuclide-marshalers-common');
}

var _atom = require('atom');

const jsonToAtomPoint = json => new _atom.Point(json.row, json.column); /**
                                                                         * Copyright (c) 2015-present, Facebook, Inc.
                                                                         * All rights reserved.
                                                                         *
                                                                         * This source code is licensed under the license found in the LICENSE file in
                                                                         * the root directory of this source tree.
                                                                         *
                                                                         * 
                                                                         * @format
                                                                         */

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
  return [(0, (_nuclideMarshalersCommon || _load_nuclideMarshalersCommon()).getRemoteNuclideUriMarshalers)(hostname), atomPointMarshalers, atomRangeMarshalers];
}

const getAtomSideLoopbackMarshalers = exports.getAtomSideLoopbackMarshalers = [(_nuclideMarshalersCommon || _load_nuclideMarshalersCommon()).localNuclideUriMarshalers, atomPointMarshalers, atomRangeMarshalers];