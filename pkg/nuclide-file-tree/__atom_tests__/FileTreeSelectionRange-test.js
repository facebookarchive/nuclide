"use strict";

function _FileTreeSelectionRange() {
  const data = require("../lib/FileTreeSelectionRange");

  _FileTreeSelectionRange = function () {
    return data;
  };

  return data;
}

function _FileTreeNode() {
  const data = require("../lib/FileTreeNode");

  _FileTreeNode = function () {
    return data;
  };

  return data;
}

function _createStore() {
  const data = _interopRequireDefault(require("../lib/redux/createStore"));

  _createStore = function () {
    return data;
  };

  return data;
}

function Selectors() {
  const data = _interopRequireWildcard(require("../lib/redux/Selectors"));

  Selectors = function () {
    return data;
  };

  return data;
}

function _temp() {
  const data = _interopRequireDefault(require("temp"));

  _temp = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
 * @emails oncall+nuclide
 */
_temp().default.track();

describe('FileTreeSelectionRange', () => {
  let store;
  beforeEach(() => {
    store = (0, _createStore().default)();
  });

  function createNode(rootUri, uri) {
    return new (_FileTreeNode().FileTreeNode)({
      rootUri,
      uri
    }, Selectors().getConf(store.getState()));
  }

  describe('RangeKey', () => {
    it('properly construct the object', () => {
      const key = new (_FileTreeSelectionRange().RangeKey)('a', 'b');
      expect(key.rootKey() === 'a').toBe(true);
      expect(key.nodeKey() === 'b').toBe(true);
    });
    it('properly construct with factory method', () => {
      const node = createNode('a', 'b');

      const key = _FileTreeSelectionRange().RangeKey.of(node);

      expect(key.rootKey() === 'a').toBe(true);
      expect(key.nodeKey() === 'b').toBe(true);
    });
    it('properly test equality', () => {
      const key1 = new (_FileTreeSelectionRange().RangeKey)('a', 'b');
      const key2 = new (_FileTreeSelectionRange().RangeKey)('a', 'b');
      expect(key1 === key2).toBe(false);
      expect(key1).toEqual(key2);
      expect(key1.equals(key2)).toBe(true);
    });
  });
  describe('SelectionRange', () => {
    const key1 = new (_FileTreeSelectionRange().RangeKey)('a', '1');
    const key2 = new (_FileTreeSelectionRange().RangeKey)('a', '2');
    const key3 = new (_FileTreeSelectionRange().RangeKey)('a', '3');
    it('properly construct the object', () => {
      const range = new (_FileTreeSelectionRange().SelectionRange)(key1, key2);
      expect(range.anchor().equals(key1)).toBe(true);
      expect(range.range().equals(key2)).toBe(true);
    });
    describe('factory method', () => {
      it('properly construct new object based on existing ones', () => {
        const range = new (_FileTreeSelectionRange().SelectionRange)(key1, key2);
        const range2 = range.withNewRange(key2);
        expect(range2.anchor().equals(key1)).toBe(true);
        expect(range2.range().equals(key2)).toBe(true);
        const range3 = range.withNewAnchor(key3);
        expect(range3.anchor().equals(key3)).toBe(true);
        expect(range3.range().equals(key2)).toBe(true);

        const range4 = _FileTreeSelectionRange().SelectionRange.ofSingleItem(key2);

        expect(range4.anchor().equals(key2)).toBe(true);
        expect(range4.range().equals(key2)).toBe(true);
      });
    });
    it('properly test equality', () => {
      const range1 = new (_FileTreeSelectionRange().SelectionRange)(key1, key2);
      const range2 = new (_FileTreeSelectionRange().SelectionRange)(key1, key2);
      expect(range1.equals(range2)).toBe(true);
    });
  });
});