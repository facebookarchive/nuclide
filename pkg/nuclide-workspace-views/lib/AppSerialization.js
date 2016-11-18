'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.serialize = serialize;
exports.deserialize = deserialize;

var _collection;

function _load_collection() {
  return _collection = require('../../commons-node/collection');
}

function serialize(state) {
  return {
    serializedLocationStates: (0, (_collection || _load_collection()).objectFromMap)(new Map(Array.from(state.locations.entries()).map((_ref) => {
      var _ref2 = _slicedToArray(_ref, 2);

      let id = _ref2[0],
          location = _ref2[1];

      const serialized = typeof location.serialize === 'function' ? location.serialize() : null;
      return [id, serialized];
    }).filter((_ref3) => {
      var _ref4 = _slicedToArray(_ref3, 2);

      let serialized = _ref4[1];
      return serialized != null;
    })))
  };
}

function deserialize(rawState) {
  return {
    // Viewables and locations will re-register using the service.
    locations: new Map(),
    viewableFactories: new Map(),
    serializedLocationStates: new Map((0, (_collection || _load_collection()).objectEntries)(rawState.serializedLocationStates || {}))
  };
}