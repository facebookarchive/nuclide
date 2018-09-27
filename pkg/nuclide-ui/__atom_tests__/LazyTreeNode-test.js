"use strict";

function Immutable() {
  const data = _interopRequireWildcard(require("immutable"));

  Immutable = function () {
    return data;
  };

  return data;
}

function _LazyTestTreeNode() {
  const data = require("../__mocks__/LazyTestTreeNode");

  _LazyTestTreeNode = function () {
    return data;
  };

  return data;
}

function _nullthrows() {
  const data = _interopRequireDefault(require("nullthrows"));

  _nullthrows = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 * @emails oncall+nuclide
 */
describe('LazyTreeNode', () => {
  it('caches the fetched children', async () => {
    await (async () => {
      let children = null;

      async function fetchChildren(parentNode) {
        children = [new (_LazyTestTreeNode().LazyTestTreeNode)({
          label: 'B'
        },
        /* parent */
        parentNode, false), new (_LazyTestTreeNode().LazyTestTreeNode)({
          label: 'C'
        },
        /* parent */
        parentNode, false)];
        return children;
      }

      const node = new (_LazyTestTreeNode().LazyTestTreeNode)({
        label: 'A'
      },
      /* parent */
      null, true, fetchChildren);
      expect((await node.fetchChildren())).toEqual(children);
      expect(node.getCachedChildren()).toEqual(children);
    })();
  });
  describe('isRoot', () => {
    it('returns true for a root', async () => {
      await (async () => {
        let children = null;

        async function fetchChildren(parentNode) {
          children = [new (_LazyTestTreeNode().LazyTestTreeNode)({
            label: 'B'
          },
          /* parent */
          parentNode, false), new (_LazyTestTreeNode().LazyTestTreeNode)({
            label: 'C'
          },
          /* parent */
          parentNode, false)];
          return children;
        }

        const node = new (_LazyTestTreeNode().LazyTestTreeNode)({
          label: 'A'
        },
        /* parent */
        null, true, fetchChildren);
        expect((await node.fetchChildren())).toEqual(children);
        expect(node.isRoot()).toBe(true);
      })();
    });
    it('returns false for a fetched, non-root node', async () => {
      await (async () => {
        let children = null;

        async function fetchChildren(parentNode) {
          children = Immutable().List([new (_LazyTestTreeNode().LazyTestTreeNode)({
            label: 'B'
          },
          /* parent */
          parentNode, false), new (_LazyTestTreeNode().LazyTestTreeNode)({
            label: 'C'
          },
          /* parent */
          parentNode, false)]);
          return children;
        }

        const node = new (_LazyTestTreeNode().LazyTestTreeNode)({
          label: 'A'
        },
        /* parent */
        null, true, fetchChildren);
        expect((await node.fetchChildren())).toEqual(children);
        const cachedChildren = node.getCachedChildren();

        if (!cachedChildren) {
          throw new Error("Invariant violation: \"cachedChildren\"");
        }

        expect((0, _nullthrows().default)(cachedChildren.first()).isRoot()).toBe(false);
      })();
    });
  });
});