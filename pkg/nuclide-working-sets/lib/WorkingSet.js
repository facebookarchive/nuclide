Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _commonsNodeCollection2;

function _commonsNodeCollection() {
  return _commonsNodeCollection2 = require('../../commons-node/collection');
}

var _uri2;

function _uri() {
  return _uri2 = require('./uri');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _nuclideLogging2;

function _nuclideLogging() {
  return _nuclideLogging2 = require('../../nuclide-logging');
}

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../nuclide-remote-uri'));
}

var logger = (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)();

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

var WorkingSet = (function () {
  _createClass(WorkingSet, null, [{
    key: 'union',
    value: function union() {
      var _ref;

      for (var _len = arguments.length, sets = Array(_len), _key = 0; _key < _len; _key++) {
        sets[_key] = arguments[_key];
      }

      var combinedUris = (_ref = []).concat.apply(_ref, _toConsumableArray(sets.map(function (s) {
        return s._uris;
      })));
      return new WorkingSet(combinedUris);
    }
  }]);

  function WorkingSet() {
    var uris = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

    _classCallCheck(this, WorkingSet);

    try {
      this._uris = (0, (_uri2 || _uri()).dedupeUris)(uris);
      this._root = this._buildDirTree(this._uris);
    } catch (e) {
      logger.error('Failed to initialize a WorkingSet with URIs ' + uris.join(',') + '. ' + e.message);
      this._uris = [];
      this._root = null;
    }
  }

  _createClass(WorkingSet, [{
    key: 'containsFile',
    value: function containsFile(uri) {
      if (this.isEmpty()) {
        return true;
      }

      try {
        var tokens = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.split(uri);
        return this._containsPathFor(tokens, /* mustHaveLeaf */true);
      } catch (e) {
        logger.error(e);
        return true;
      }
    }
  }, {
    key: 'containsDir',
    value: function containsDir(uri) {
      if (this.isEmpty()) {
        return true;
      }

      try {
        var tokens = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.split(uri);
        return this._containsPathFor(tokens, /* mustHaveLeaf */false);
      } catch (e) {
        logger.error(e);
        return true;
      }
    }
  }, {
    key: 'isEmpty',
    value: function isEmpty() {
      return this._uris.length === 0;
    }
  }, {
    key: 'getUris',
    value: function getUris() {
      return this._uris;
    }
  }, {
    key: 'append',
    value: function append() {
      for (var _len2 = arguments.length, uris = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        uris[_key2] = arguments[_key2];
      }

      return new WorkingSet(this._uris.concat(uris));
    }
  }, {
    key: 'remove',
    value: function remove(rootUri) {
      try {
        var uris = this._uris.filter(function (uri) {
          return !(_nuclideRemoteUri2 || _nuclideRemoteUri()).default.contains(rootUri, uri);
        });
        return new WorkingSet(uris);
      } catch (e) {
        logger.error(e);
        return this;
      }
    }
  }, {
    key: 'equals',
    value: function equals(other) {
      return (0, (_commonsNodeCollection2 || _commonsNodeCollection()).arrayEqual)(this._uris, other._uris);
    }
  }, {
    key: '_buildDirTree',
    value: function _buildDirTree(uris) {
      if (uris.length === 0) {
        return null;
      }

      var root = newInnerNode();

      for (var uri of uris) {
        var tokens = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.split(uri);
        if (tokens.length === 0) {
          continue;
        }

        var currentNode = root;

        for (var token of tokens.slice(0, -1)) {
          var tokenNode = currentNode.children.get(token);

          if (!tokenNode) {
            tokenNode = newInnerNode();
            currentNode.children.set(token, tokenNode);
            currentNode = tokenNode;
          } else {
            (0, (_assert2 || _assert()).default)(tokenNode.kind === 'inner');
            currentNode = tokenNode;
          }
        }

        var lastToken = tokens[tokens.length - 1];
        currentNode.children.set(lastToken, newLeafNode());
      }

      return root;
    }
  }, {
    key: '_containsPathFor',
    value: function _containsPathFor(tokens, mustHaveLeaf) {
      var currentNode = this._root;
      if (currentNode == null) {
        // Empty set actually contains everything
        return true;
      }

      for (var token of tokens) {
        var tokenNode = currentNode.children.get(token);
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
  }]);

  return WorkingSet;
})();

exports.WorkingSet = WorkingSet;

function newInnerNode() {
  return { kind: 'inner', children: new Map() };
}

function newLeafNode() {
  return { kind: 'leaf' };
}