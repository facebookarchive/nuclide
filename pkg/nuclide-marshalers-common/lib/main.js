Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

exports.getRemoteNuclideUriMarshalers = getRemoteNuclideUriMarshalers;
exports.getAtomSideMarshalers = getAtomSideMarshalers;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _commonsNodeNuclideUri2;

function _commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri2 = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _simpleTextBuffer2;

function _simpleTextBuffer() {
  return _simpleTextBuffer2 = require('simple-text-buffer');
}

function getRemoteNuclideUriMarshalers(hostname) {
  return {
    typeName: (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.NUCLIDE_URI_TYPE_NAME,
    marshaller: function marshaller(remoteUri) {
      return (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.getPath(remoteUri);
    },
    unmarshaller: function unmarshaller(path) {
      return (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.createRemoteUri(hostname, path);
    }
  };
}

var localNuclideUriMarshalers = {
  typeName: (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.NUCLIDE_URI_TYPE_NAME,
  marshaller: function marshaller(uri) {
    return uri;
  },
  unmarshaller: function unmarshaller(remotePath) {
    return remotePath;
  }
};

exports.localNuclideUriMarshalers = localNuclideUriMarshalers;
var jsonToAtomPoint = function jsonToAtomPoint(json) {
  return new (_atom2 || _atom()).Point(json.row, json.column);
};
var jsonToAtomRange = function jsonToAtomRange(json) {
  return new (_atom2 || _atom()).Range(jsonToAtomPoint(json.start), jsonToAtomPoint(json.end));
};

function getAtomSideMarshalers(hostname) {
  return [getRemoteNuclideUriMarshalers(hostname), {
    typeName: 'atom$Point',
    marshaller: function marshaller(point) {
      return point;
    },
    unmarshaller: jsonToAtomPoint
  }, {
    typeName: 'atom$Range',
    marshaller: function marshaller(range) {
      return range;
    },
    unmarshaller: jsonToAtomRange
  }];
}

var getAtomSideLoopbackMarshalers = [localNuclideUriMarshalers, {
  typeName: 'atom$Point',
  marshaller: function marshaller(point) {
    return point;
  },
  unmarshaller: jsonToAtomPoint
}, {
  typeName: 'atom$Range',
  marshaller: function marshaller(range) {
    return range;
  },
  unmarshaller: jsonToAtomRange
}];

exports.getAtomSideLoopbackMarshalers = getAtomSideLoopbackMarshalers;
var jsonToServerPoint = function jsonToServerPoint(json) {
  return new (_simpleTextBuffer2 || _simpleTextBuffer()).Point(json.row, json.column);
};
var jsonToServerRange = function jsonToServerRange(json) {
  return new (_simpleTextBuffer2 || _simpleTextBuffer()).Range(jsonToServerPoint(json.start), jsonToServerPoint(json.end));
};

var getServerSideMarshalers = [localNuclideUriMarshalers, {
  typeName: 'atom$Point',
  marshaller: function marshaller(point) {
    return point;
  },
  unmarshaller: jsonToServerPoint
}, {
  typeName: 'atom$Range',
  marshaller: function marshaller(range) {
    return range;
  },
  unmarshaller: jsonToServerRange
}];
exports.getServerSideMarshalers = getServerSideMarshalers;