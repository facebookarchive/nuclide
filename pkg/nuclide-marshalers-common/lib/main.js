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

var _commonsNodeNuclideUri;

function _load_commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _atom;

function _load_atom() {
  return _atom = require('atom');
}

var _simpleTextBuffer;

function _load_simpleTextBuffer() {
  return _simpleTextBuffer = require('simple-text-buffer');
}

function getRemoteNuclideUriMarshalers(hostname) {
  return {
    typeName: (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.NUCLIDE_URI_TYPE_NAME,
    marshaller: function marshaller(remoteUri) {
      return (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.getPath(remoteUri);
    },
    unmarshaller: function unmarshaller(path) {
      return (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.createRemoteUri(hostname, path);
    }
  };
}

var localNuclideUriMarshalers = {
  typeName: (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.NUCLIDE_URI_TYPE_NAME,
  marshaller: function marshaller(uri) {
    (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.validate(uri, false);
    return uri;
  },
  unmarshaller: function unmarshaller(remotePath) {
    (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.validate(remotePath, false);
    return remotePath;
  }
};

exports.localNuclideUriMarshalers = localNuclideUriMarshalers;
var jsonToAtomPoint = function jsonToAtomPoint(json) {
  return new (_atom || _load_atom()).Point(json.row, json.column);
};
var jsonToAtomRange = function jsonToAtomRange(json) {
  return new (_atom || _load_atom()).Range(jsonToAtomPoint(json.start), jsonToAtomPoint(json.end));
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
  return new (_simpleTextBuffer || _load_simpleTextBuffer()).Point(json.row, json.column);
};
var jsonToServerRange = function jsonToServerRange(json) {
  return new (_simpleTextBuffer || _load_simpleTextBuffer()).Range(jsonToServerPoint(json.start), jsonToServerPoint(json.end));
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