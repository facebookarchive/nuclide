'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WorkingSet = undefined;

var _collection;

function _load_collection() {
  return _collection = require('nuclide-commons/collection');
}

var _uri;

function _load_uri() {
  return _uri = require('./uri');
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
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

const logger = (0, (_log4js || _load_log4js()).getLogger)('nuclide-working-sets-common');

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

  static union(...sets) {
    const combinedUris = [].concat(...sets.map(s => s._uris));
    return new WorkingSet(combinedUris);
  }

  constructor(uris = []) {
    try {
      this._uris = (0, (_uri || _load_uri()).dedupeUris)(uris.filter(uri => !(_nuclideUri || _load_nuclideUri()).default.isBrokenDeserializedUri(uri)));
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
      return this.containsFileBySplitPath((_nuclideUri || _load_nuclideUri()).default.split(uri));
    } catch (e) {
      logger.error(e);
      return true;
    }
  }

  containsFileBySplitPath(tokens) {
    if (this.isEmpty()) {
      return true;
    }

    return this._containsPathFor(tokens, /* mustHaveLeaf */true);
  }

  containsDir(uri) {
    if (this.isEmpty()) {
      return true;
    }

    try {
      return this.containsDirBySplitPath((_nuclideUri || _load_nuclideUri()).default.split(uri));
    } catch (e) {
      logger.error(e);
      return true;
    }
  }

  containsDirBySplitPath(tokens) {
    if (this.isEmpty()) {
      return true;
    }

    return this._containsPathFor(tokens, /* mustHaveLeaf */false);
  }

  isEmpty() {
    return this._uris.length === 0;
  }

  getUris() {
    return this._uris;
  }

  append(...uris) {
    return new WorkingSet(this._uris.concat(uris));
  }

  remove(rootUri) {
    try {
      const uris = this._uris.filter(uri => !(_nuclideUri || _load_nuclideUri()).default.contains(rootUri, uri));
      return new WorkingSet(uris);
    } catch (e) {
      logger.error(e);
      return this;
    }
  }

  equals(other) {
    return (0, (_collection || _load_collection()).arrayEqual)(this._uris, other._uris);
  }

  _buildDirTree(uris) {
    if (uris.length === 0) {
      return null;
    }

    const root = newInnerNode();

    for (const uri of uris) {
      const tokens = (_nuclideUri || _load_nuclideUri()).default.split(uri);
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
            throw new Error('Invariant violation: "tokenNode.kind === \'inner\'"');
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
  return { kind: 'inner', children: new Map() };
}

function newLeafNode() {
  return { kind: 'leaf' };
}