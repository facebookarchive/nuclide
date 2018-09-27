"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WorkingSet = void 0;

function _collection() {
  const data = require("../../../modules/nuclide-commons/collection");

  _collection = function () {
    return data;
  };

  return data;
}

function _uri() {
  const data = require("./uri");

  _uri = function () {
    return data;
  };

  return data;
}

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
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
 * 
 * @format
 */
const logger = (0, _log4js().getLogger)('nuclide-working-sets-common');

/**
 * WorkingSet is an implementation of a filter for files and directories.
 * - It is *immutable*
 * - It is created from a set of NuclideUris.
 *     A path URI is either a local path, such as: /aaa/bb/ccc
 *     or remote nuclide://sandbox.com/aaa/bb/ccc
 * - The URIs can point either to files or to directories.
 * - Empty WorkingSet is essentially an empty filter - it accepts everything.
 * - Non-empty WorkingSet contains every file specified by the contained URIs or below.
 *   So, if a URI points to a directory - all its sub-directories and files in them are included.
 *   This kind of test is performed by the .containsFile() method.
 * - WorkingSet aims to support queries for the hierarchical structures, such as TreeView.
 *   Therefore, if a file is included in the WorkingSet, then the file-tree must have a way
 *   to know that it must include its parent directories.
 *   This kind of test is performed by the .containsDir() method.
 */
class WorkingSet {
  constructor(uris = []) {
    try {
      this._absoluteUris = (0, _uri().dedupeUris)(uris);
      this._uris = this._absoluteUris.map(_nuclideUri().default.getPath);
      this._root = this._buildDirTree(this._uris);
    } catch (e) {
      logger.error('Failed to initialize a WorkingSet with URIs ' + uris.join(',') + '. ' + e.message);
      this._uris = [];
      this._root = null;
    }
  }

  containsFile(uri) {
    if (this.isEmpty()) {
      return true;
    }

    try {
      return this.containsFileBySplitPath(_nuclideUri().default.split(uri));
    } catch (e) {
      logger.error(e);
      return true;
    }
  }

  containsFileBySplitPath(tokens) {
    if (this.isEmpty()) {
      return true;
    }

    const uriTokens = tokens.map(_nuclideUri().default.getPath);
    return this._containsPathFor(uriTokens,
    /* mustHaveLeaf */
    true);
  }

  containsDir(uri) {
    if (this.isEmpty()) {
      return true;
    }

    try {
      return this.containsDirBySplitPath(_nuclideUri().default.split(uri));
    } catch (e) {
      logger.error(e);
      return true;
    }
  }

  containsDirBySplitPath(tokens) {
    if (this.isEmpty()) {
      return true;
    }

    const uriTokens = tokens.map(_nuclideUri().default.getPath);
    return this._containsPathFor(uriTokens,
    /* mustHaveLeaf */
    false);
  }

  isEmpty() {
    return this._uris.length === 0;
  }

  getUris() {
    return this._uris;
  }

  getAbsoluteUris() {
    return this._absoluteUris;
  }

  append(...uris) {
    return new WorkingSet(this._uris.concat(uris));
  }

  remove(rootUri) {
    try {
      const uriPath = _nuclideUri().default.getPath(rootUri);

      const uris = this._uris.filter(uri => !_nuclideUri().default.contains(uriPath, uri));

      return new WorkingSet(uris);
    } catch (e) {
      logger.error(e);
      return this;
    }
  }

  equals(other) {
    return (0, _collection().arrayEqual)(this._uris, other._uris);
  }

  _buildDirTree(uris) {
    if (uris.length === 0) {
      return null;
    }

    const root = newInnerNode();

    for (const uri of uris) {
      const tokens = _nuclideUri().default.split(uri);

      if (tokens.length === 0) {
        continue;
      }

      let currentNode = root;

      for (const token of tokens.slice(0, -1)) {
        let tokenNode = currentNode.children.get(token);

        if (!tokenNode) {
          tokenNode = newInnerNode();
          currentNode.children.set(token, tokenNode);
          currentNode = tokenNode;
        } else {
          if (!(tokenNode.kind === 'inner')) {
            throw new Error("Invariant violation: \"tokenNode.kind === 'inner'\"");
          }

          currentNode = tokenNode;
        }
      }

      const lastToken = tokens[tokens.length - 1];
      currentNode.children.set(lastToken, newLeafNode());
    }

    return root;
  }

  _containsPathFor(tokens, mustHaveLeaf) {
    let currentNode = this._root;

    if (currentNode == null) {
      // Empty set actually contains everything
      return true;
    }

    for (const token of tokens) {
      const tokenNode = currentNode.children.get(token);

      if (tokenNode == null) {
        return false;
      } else if (tokenNode.kind === 'leaf') {
        return true;
      } else if (tokenNode.kind === 'inner') {
        currentNode = tokenNode;
      }
    }

    return !mustHaveLeaf;
  }

}

exports.WorkingSet = WorkingSet;

function newInnerNode() {
  return {
    kind: 'inner',
    children: new Map()
  };
}

function newLeafNode() {
  return {
    kind: 'leaf'
  };
}