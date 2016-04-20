Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _nuclideCommons = require('../../nuclide-commons');

var _uri = require('./uri');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _nuclideLogging = require('../../nuclide-logging');

var logger = (0, _nuclideLogging.getLogger)();

/**
* WorkingSet is an implementation of a filter for files and directories.
* - It is *immutable*
* - It is created from a set of NuclideUris.
*     A path URI is either a local path, such as: /aaa/bb/ccc
*     or remote nuclide://sandbox.com/aaa/bb/ccc
* - The URIs can point either to files or to directories.
* - The remote URIs are port-insensitive and the port part is stripped from when
*   internal structures are built.
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
      this._uris = (0, _uri.dedupeNormalizedUris)(uris.map(_uri.normalizePathUri));
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
        var tokens = (0, _uri.splitUri)((0, _uri.normalizePathUri)(uri));
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
        var tokens = (0, _uri.splitUri)((0, _uri.normalizePathUri)(uri));
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
      var _this = this;

      try {
        var _ret = (function () {
          var normalizedRoot = (0, _uri.normalizePathUri)(rootUri);
          var uris = _this._uris.filter(function (uri) {
            return !(0, _uri.isUriBelow)(normalizedRoot, uri);
          });
          return {
            v: new WorkingSet(uris)
          };
        })();

        if (typeof _ret === 'object') return _ret.v;
      } catch (e) {
        logger.error(e);
        return this;
      }
    }
  }, {
    key: 'equals',
    value: function equals(other) {
      return _nuclideCommons.array.equal(this._uris, other._uris);
    }
  }, {
    key: '_buildDirTree',
    value: function _buildDirTree(uris) {
      if (uris.length === 0) {
        return null;
      }

      var root = newInnerNode();

      for (var uri of uris) {
        var tokens = (0, _uri.splitUri)(uri);
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
            (0, _assert2['default'])(tokenNode.kind === 'inner');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIldvcmtpbmdTZXQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OEJBWW9CLHVCQUF1Qjs7bUJBQ2dDLE9BQU87O3NCQUM1RCxRQUFROzs7OzhCQUNOLHVCQUF1Qjs7QUFDL0MsSUFBTSxNQUFNLEdBQUcsZ0NBQVcsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBa0NkLFVBQVU7ZUFBVixVQUFVOztXQUlULGlCQUF5Qzs7O3dDQUFyQyxJQUFJO0FBQUosWUFBSTs7O0FBQ2xCLFVBQU0sWUFBWSxHQUFHLFFBQUEsRUFBRSxFQUFDLE1BQU0sTUFBQSwwQkFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQUEsQ0FBQztlQUFJLENBQUMsQ0FBQyxLQUFLO09BQUEsQ0FBQyxFQUFDLENBQUM7QUFDMUQsYUFBTyxJQUFJLFVBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQztLQUNyQzs7O0FBRVUsV0FUQSxVQUFVLEdBU3FCO1FBQTlCLElBQXVCLHlEQUFHLEVBQUU7OzBCQVQ3QixVQUFVOztBQVVuQixRQUFJO0FBQ0YsVUFBSSxDQUFDLEtBQUssR0FBRywrQkFBcUIsSUFBSSxDQUFDLEdBQUcsdUJBQWtCLENBQUMsQ0FBQztBQUM5RCxVQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQzdDLENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDVixZQUFNLENBQUMsS0FBSyxDQUNWLDhDQUE4QyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQ25GLENBQUM7QUFDRixVQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztBQUNoQixVQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztLQUNuQjtHQUNGOztlQXBCVSxVQUFVOztXQXNCVCxzQkFBQyxHQUFlLEVBQVk7QUFDdEMsVUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUU7QUFDbEIsZUFBTyxJQUFJLENBQUM7T0FDYjs7QUFFRCxVQUFJO0FBQ0YsWUFBTSxNQUFNLEdBQUcsbUJBQVMsMkJBQWlCLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDL0MsZUFBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxvQkFBcUIsSUFBSSxDQUFDLENBQUM7T0FDL0QsQ0FBQyxPQUFPLENBQUMsRUFBRTtBQUNWLGNBQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDaEIsZUFBTyxJQUFJLENBQUM7T0FDYjtLQUNGOzs7V0FFVSxxQkFBQyxHQUFlLEVBQVc7QUFDcEMsVUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUU7QUFDbEIsZUFBTyxJQUFJLENBQUM7T0FDYjs7QUFFRCxVQUFJO0FBQ0YsWUFBTSxNQUFNLEdBQUcsbUJBQVMsMkJBQWlCLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDL0MsZUFBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxvQkFBcUIsS0FBSyxDQUFDLENBQUM7T0FDaEUsQ0FBQyxPQUFPLENBQUMsRUFBRTtBQUNWLGNBQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDaEIsZUFBTyxJQUFJLENBQUM7T0FDYjtLQUNGOzs7V0FFTSxtQkFBWTtBQUNqQixhQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQztLQUNoQzs7O1dBRU0sbUJBQWtCO0FBQ3ZCLGFBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztLQUNuQjs7O1dBRUssa0JBQXlDO3lDQUFyQyxJQUFJO0FBQUosWUFBSTs7O0FBQ1osYUFBTyxJQUFJLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0tBQ2hEOzs7V0FFSyxnQkFBQyxPQUFtQixFQUFjOzs7QUFDdEMsVUFBSTs7QUFDRixjQUFNLGNBQWMsR0FBRywyQkFBaUIsT0FBTyxDQUFDLENBQUM7QUFDakQsY0FBTSxJQUFJLEdBQUcsTUFBSyxLQUFLLENBQUMsTUFBTSxDQUFDLFVBQUEsR0FBRzttQkFBSSxDQUFDLHFCQUFXLGNBQWMsRUFBRSxHQUFHLENBQUM7V0FBQSxDQUFDLENBQUM7QUFDeEU7ZUFBTyxJQUFJLFVBQVUsQ0FBQyxJQUFJLENBQUM7WUFBQzs7OztPQUM3QixDQUFDLE9BQU8sQ0FBQyxFQUFFO0FBQ1YsY0FBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNoQixlQUFPLElBQUksQ0FBQztPQUNiO0tBQ0Y7OztXQUVLLGdCQUFDLEtBQWlCLEVBQVc7QUFDakMsYUFBTyxzQkFBTSxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDN0M7OztXQUVZLHVCQUFDLElBQW1CLEVBQWM7QUFDN0MsVUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtBQUNyQixlQUFPLElBQUksQ0FBQztPQUNiOztBQUVELFVBQU0sSUFBZSxHQUFHLFlBQVksRUFBRSxDQUFDOztBQUV2QyxXQUFLLElBQU0sR0FBRyxJQUFJLElBQUksRUFBRTtBQUN0QixZQUFNLE1BQU0sR0FBRyxtQkFBUyxHQUFHLENBQUMsQ0FBQztBQUM3QixZQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO0FBQ3ZCLG1CQUFTO1NBQ1Y7O0FBRUQsWUFBSSxXQUFzQixHQUFHLElBQUksQ0FBQzs7QUFFbEMsYUFBSyxJQUFNLEtBQUssSUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFO0FBQ3ZDLGNBQUksU0FBb0IsR0FBRyxXQUFXLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQzs7QUFFM0QsY0FBSSxDQUFDLFNBQVMsRUFBRTtBQUNkLHFCQUFTLEdBQUcsWUFBWSxFQUFFLENBQUM7QUFDM0IsdUJBQVcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQztBQUMzQyx1QkFBVyxHQUFHLFNBQVMsQ0FBQztXQUN6QixNQUFNO0FBQ0wscUNBQVUsU0FBUyxDQUFDLElBQUksS0FBSyxPQUFPLENBQUMsQ0FBQztBQUN0Qyx1QkFBVyxHQUFHLFNBQVMsQ0FBQztXQUN6QjtTQUNGOztBQUVELFlBQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQzVDLG1CQUFXLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsV0FBVyxFQUFFLENBQUMsQ0FBQztPQUNwRDs7QUFFRCxhQUFPLElBQUksQ0FBQztLQUNiOzs7V0FFZSwwQkFBQyxNQUFxQixFQUFFLFlBQXFCLEVBQVc7QUFDdEUsVUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztBQUM3QixVQUFJLFdBQVcsSUFBSSxJQUFJLEVBQUU7O0FBQ3ZCLGVBQU8sSUFBSSxDQUFDO09BQ2I7O0FBRUQsV0FBSyxJQUFNLEtBQUssSUFBSSxNQUFNLEVBQUU7QUFDMUIsWUFBTSxTQUFTLEdBQUcsV0FBVyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDbEQsWUFBSSxTQUFTLElBQUksSUFBSSxFQUFFO0FBQ3JCLGlCQUFPLEtBQUssQ0FBQztTQUNkLE1BQU0sSUFBSSxTQUFTLENBQUMsSUFBSSxLQUFLLE1BQU0sRUFBRTtBQUNwQyxpQkFBTyxJQUFJLENBQUM7U0FDYixNQUFNLElBQUksU0FBUyxDQUFDLElBQUksS0FBSyxPQUFPLEVBQUU7QUFDckMscUJBQVcsR0FBRyxTQUFTLENBQUM7U0FDekI7T0FDRjs7QUFFRCxhQUFPLENBQUMsWUFBWSxDQUFDO0tBQ3RCOzs7U0FsSVUsVUFBVTs7Ozs7QUFxSXZCLFNBQVMsWUFBWSxHQUFjO0FBQ2pDLFNBQU8sRUFBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxJQUFJLEdBQUcsRUFBRSxFQUFDLENBQUM7Q0FDN0M7O0FBRUQsU0FBUyxXQUFXLEdBQWE7QUFDL0IsU0FBTyxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUMsQ0FBQztDQUN2QiIsImZpbGUiOiJXb3JraW5nU2V0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuXG5pbXBvcnQge2FycmF5fSBmcm9tICcuLi8uLi9udWNsaWRlLWNvbW1vbnMnO1xuaW1wb3J0IHtub3JtYWxpemVQYXRoVXJpLCBkZWR1cGVOb3JtYWxpemVkVXJpcywgc3BsaXRVcmksIGlzVXJpQmVsb3d9IGZyb20gJy4vdXJpJztcbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCB7Z2V0TG9nZ2VyfSBmcm9tICcuLi8uLi9udWNsaWRlLWxvZ2dpbmcnO1xuY29uc3QgbG9nZ2VyID0gZ2V0TG9nZ2VyKCk7XG5cblxuaW1wb3J0IHR5cGUge051Y2xpZGVVcml9IGZyb20gJy4uLy4uL251Y2xpZGUtcmVtb3RlLXVyaSc7XG5cbnR5cGUgSW5uZXJOb2RlID0ge1xuICBraW5kOiAnaW5uZXInO1xuICBjaGlsZHJlbjogTWFwPHN0cmluZywgVHJlZU5vZGU+O1xufTtcblxudHlwZSBMZWFmTm9kZSA9IHtcbiAga2luZDogJ2xlYWYnO1xufTtcblxudHlwZSBUcmVlTm9kZSA9IElubmVyTm9kZSB8IExlYWZOb2RlO1xuXG4vKipcbiogV29ya2luZ1NldCBpcyBhbiBpbXBsZW1lbnRhdGlvbiBvZiBhIGZpbHRlciBmb3IgZmlsZXMgYW5kIGRpcmVjdG9yaWVzLlxuKiAtIEl0IGlzICppbW11dGFibGUqXG4qIC0gSXQgaXMgY3JlYXRlZCBmcm9tIGEgc2V0IG9mIE51Y2xpZGVVcmlzLlxuKiAgICAgQSBwYXRoIFVSSSBpcyBlaXRoZXIgYSBsb2NhbCBwYXRoLCBzdWNoIGFzOiAvYWFhL2JiL2NjY1xuKiAgICAgb3IgcmVtb3RlIG51Y2xpZGU6Ly9zYW5kYm94LmNvbS9hYWEvYmIvY2NjXG4qIC0gVGhlIFVSSXMgY2FuIHBvaW50IGVpdGhlciB0byBmaWxlcyBvciB0byBkaXJlY3Rvcmllcy5cbiogLSBUaGUgcmVtb3RlIFVSSXMgYXJlIHBvcnQtaW5zZW5zaXRpdmUgYW5kIHRoZSBwb3J0IHBhcnQgaXMgc3RyaXBwZWQgZnJvbSB3aGVuXG4qICAgaW50ZXJuYWwgc3RydWN0dXJlcyBhcmUgYnVpbHQuXG4qIC0gRW1wdHkgV29ya2luZ1NldCBpcyBlc3NlbnRpYWxseSBhbiBlbXB0eSBmaWx0ZXIgLSBpdCBhY2NlcHRzIGV2ZXJ5dGhpbmcuXG4qIC0gTm9uLWVtcHR5IFdvcmtpbmdTZXQgY29udGFpbnMgZXZlcnkgZmlsZSBzcGVjaWZpZWQgYnkgdGhlIGNvbnRhaW5lZCBVUklzIG9yIGJlbG93LlxuKiAgIFNvLCBpZiBhIFVSSSBwb2ludHMgdG8gYSBkaXJlY3RvcnkgLSBhbGwgaXRzIHN1Yi1kaXJlY3RvcmllcyBhbmQgZmlsZXMgaW4gdGhlbSBhcmUgaW5jbHVkZWQuXG4qICAgVGhpcyBraW5kIG9mIHRlc3QgaXMgcGVyZm9ybWVkIGJ5IHRoZSAuY29udGFpbnNGaWxlKCkgbWV0aG9kLlxuKiAtIFdvcmtpbmdTZXQgYWltcyB0byBzdXBwb3J0IHF1ZXJpZXMgZm9yIHRoZSBoaWVyYXJjaGljYWwgc3RydWN0dXJlcywgc3VjaCBhcyBUcmVlVmlldy5cbiogICBUaGVyZWZvcmUsIGlmIGEgZmlsZSBpcyBpbmNsdWRlZCBpbiB0aGUgV29ya2luZ1NldCwgdGhlbiB0aGUgZmlsZS10cmVlIG11c3QgaGF2ZSBhIHdheVxuKiAgIHRvIGtub3cgdGhhdCBpdCBtdXN0IGluY2x1ZGUgaXRzIHBhcmVudCBkaXJlY3Rvcmllcy5cbiogICBUaGlzIGtpbmQgb2YgdGVzdCBpcyBwZXJmb3JtZWQgYnkgdGhlIC5jb250YWluc0RpcigpIG1ldGhvZC5cbiovXG5leHBvcnQgY2xhc3MgV29ya2luZ1NldCB7XG4gIF91cmlzOiBBcnJheTxzdHJpbmc+O1xuICBfcm9vdDogP0lubmVyTm9kZTtcblxuICBzdGF0aWMgdW5pb24oLi4uc2V0czogQXJyYXk8V29ya2luZ1NldD4pOiBXb3JraW5nU2V0IHtcbiAgICBjb25zdCBjb21iaW5lZFVyaXMgPSBbXS5jb25jYXQoLi4uc2V0cy5tYXAocyA9PiBzLl91cmlzKSk7XG4gICAgcmV0dXJuIG5ldyBXb3JraW5nU2V0KGNvbWJpbmVkVXJpcyk7XG4gIH1cblxuICBjb25zdHJ1Y3Rvcih1cmlzOiBBcnJheTxOdWNsaWRlVXJpPiA9IFtdKSB7XG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuX3VyaXMgPSBkZWR1cGVOb3JtYWxpemVkVXJpcyh1cmlzLm1hcChub3JtYWxpemVQYXRoVXJpKSk7XG4gICAgICB0aGlzLl9yb290ID0gdGhpcy5fYnVpbGREaXJUcmVlKHRoaXMuX3VyaXMpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGxvZ2dlci5lcnJvcihcbiAgICAgICAgJ0ZhaWxlZCB0byBpbml0aWFsaXplIGEgV29ya2luZ1NldCB3aXRoIFVSSXMgJyArIHVyaXMuam9pbignLCcpICsgJy4gJyArIGUubWVzc2FnZVxuICAgICAgKTtcbiAgICAgIHRoaXMuX3VyaXMgPSBbXTtcbiAgICAgIHRoaXMuX3Jvb3QgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIGNvbnRhaW5zRmlsZSh1cmk6IE51Y2xpZGVVcmkpIDogYm9vbGVhbiB7XG4gICAgaWYgKHRoaXMuaXNFbXB0eSgpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgdG9rZW5zID0gc3BsaXRVcmkobm9ybWFsaXplUGF0aFVyaSh1cmkpKTtcbiAgICAgIHJldHVybiB0aGlzLl9jb250YWluc1BhdGhGb3IodG9rZW5zLCAvKiBtdXN0SGF2ZUxlYWYgKi8gdHJ1ZSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgbG9nZ2VyLmVycm9yKGUpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG5cbiAgY29udGFpbnNEaXIodXJpOiBOdWNsaWRlVXJpKTogYm9vbGVhbiB7XG4gICAgaWYgKHRoaXMuaXNFbXB0eSgpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgdG9rZW5zID0gc3BsaXRVcmkobm9ybWFsaXplUGF0aFVyaSh1cmkpKTtcbiAgICAgIHJldHVybiB0aGlzLl9jb250YWluc1BhdGhGb3IodG9rZW5zLCAvKiBtdXN0SGF2ZUxlYWYgKi8gZmFsc2UpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGxvZ2dlci5lcnJvcihlKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIGlzRW1wdHkoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX3VyaXMubGVuZ3RoID09PSAwO1xuICB9XG5cbiAgZ2V0VXJpcygpOiBBcnJheTxzdHJpbmc+IHtcbiAgICByZXR1cm4gdGhpcy5fdXJpcztcbiAgfVxuXG4gIGFwcGVuZCguLi51cmlzOiBBcnJheTxOdWNsaWRlVXJpPik6IFdvcmtpbmdTZXQge1xuICAgIHJldHVybiBuZXcgV29ya2luZ1NldCh0aGlzLl91cmlzLmNvbmNhdCh1cmlzKSk7XG4gIH1cblxuICByZW1vdmUocm9vdFVyaTogTnVjbGlkZVVyaSk6IFdvcmtpbmdTZXQge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBub3JtYWxpemVkUm9vdCA9IG5vcm1hbGl6ZVBhdGhVcmkocm9vdFVyaSk7XG4gICAgICBjb25zdCB1cmlzID0gdGhpcy5fdXJpcy5maWx0ZXIodXJpID0+ICFpc1VyaUJlbG93KG5vcm1hbGl6ZWRSb290LCB1cmkpKTtcbiAgICAgIHJldHVybiBuZXcgV29ya2luZ1NldCh1cmlzKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBsb2dnZXIuZXJyb3IoZSk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gIH1cblxuICBlcXVhbHMob3RoZXI6IFdvcmtpbmdTZXQpOiBib29sZWFuIHtcbiAgICByZXR1cm4gYXJyYXkuZXF1YWwodGhpcy5fdXJpcywgb3RoZXIuX3VyaXMpO1xuICB9XG5cbiAgX2J1aWxkRGlyVHJlZSh1cmlzOiBBcnJheTxzdHJpbmc+KTogP0lubmVyTm9kZSB7XG4gICAgaWYgKHVyaXMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCByb290OiBJbm5lck5vZGUgPSBuZXdJbm5lck5vZGUoKTtcblxuICAgIGZvciAoY29uc3QgdXJpIG9mIHVyaXMpIHtcbiAgICAgIGNvbnN0IHRva2VucyA9IHNwbGl0VXJpKHVyaSk7XG4gICAgICBpZiAodG9rZW5zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgbGV0IGN1cnJlbnROb2RlOiBJbm5lck5vZGUgPSByb290O1xuXG4gICAgICBmb3IgKGNvbnN0IHRva2VuIG9mIHRva2Vucy5zbGljZSgwLCAtMSkpIHtcbiAgICAgICAgbGV0IHRva2VuTm9kZTogP1RyZWVOb2RlID0gY3VycmVudE5vZGUuY2hpbGRyZW4uZ2V0KHRva2VuKTtcblxuICAgICAgICBpZiAoIXRva2VuTm9kZSkge1xuICAgICAgICAgIHRva2VuTm9kZSA9IG5ld0lubmVyTm9kZSgpO1xuICAgICAgICAgIGN1cnJlbnROb2RlLmNoaWxkcmVuLnNldCh0b2tlbiwgdG9rZW5Ob2RlKTtcbiAgICAgICAgICBjdXJyZW50Tm9kZSA9IHRva2VuTm9kZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpbnZhcmlhbnQodG9rZW5Ob2RlLmtpbmQgPT09ICdpbm5lcicpO1xuICAgICAgICAgIGN1cnJlbnROb2RlID0gdG9rZW5Ob2RlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGxhc3RUb2tlbiA9IHRva2Vuc1t0b2tlbnMubGVuZ3RoIC0gMV07XG4gICAgICBjdXJyZW50Tm9kZS5jaGlsZHJlbi5zZXQobGFzdFRva2VuLCBuZXdMZWFmTm9kZSgpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcm9vdDtcbiAgfVxuXG4gIF9jb250YWluc1BhdGhGb3IodG9rZW5zOiBBcnJheTxzdHJpbmc+LCBtdXN0SGF2ZUxlYWY6IGJvb2xlYW4pOiBib29sZWFuIHtcbiAgICBsZXQgY3VycmVudE5vZGUgPSB0aGlzLl9yb290O1xuICAgIGlmIChjdXJyZW50Tm9kZSA9PSBudWxsKSB7IC8vIEVtcHR5IHNldCBhY3R1YWxseSBjb250YWlucyBldmVyeXRoaW5nXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IHRva2VuIG9mIHRva2Vucykge1xuICAgICAgY29uc3QgdG9rZW5Ob2RlID0gY3VycmVudE5vZGUuY2hpbGRyZW4uZ2V0KHRva2VuKTtcbiAgICAgIGlmICh0b2tlbk5vZGUgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9IGVsc2UgaWYgKHRva2VuTm9kZS5raW5kID09PSAnbGVhZicpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9IGVsc2UgaWYgKHRva2VuTm9kZS5raW5kID09PSAnaW5uZXInKSB7XG4gICAgICAgIGN1cnJlbnROb2RlID0gdG9rZW5Ob2RlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiAhbXVzdEhhdmVMZWFmO1xuICB9XG59XG5cbmZ1bmN0aW9uIG5ld0lubmVyTm9kZSgpOiBJbm5lck5vZGUge1xuICByZXR1cm4ge2tpbmQ6ICdpbm5lcicsIGNoaWxkcmVuOiBuZXcgTWFwKCl9O1xufVxuXG5mdW5jdGlvbiBuZXdMZWFmTm9kZSgpOiBMZWFmTm9kZSB7XG4gIHJldHVybiB7a2luZDogJ2xlYWYnfTtcbn1cbiJdfQ==