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

var _uri = require('./uri');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

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

    this._uris = (0, _uri.dedupeNormalizedUris)(uris.map(_uri.normalizePathUri));
    this._root = this._buildDirTree(this._uris);
  }

  _createClass(WorkingSet, [{
    key: 'containsFile',
    value: function containsFile(uri) {
      var tokens = (0, _uri.splitUri)((0, _uri.normalizePathUri)(uri));
      return this._containsPathFor(tokens, /* mustHaveLeaf */true);
    }
  }, {
    key: 'containsDir',
    value: function containsDir(uri) {
      var tokens = (0, _uri.splitUri)((0, _uri.normalizePathUri)(uri));
      return this._containsPathFor(tokens, /* mustHaveLeaf */false);
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
      var normalizedRoot = (0, _uri.normalizePathUri)(rootUri);
      var uris = this._uris.filter(function (uri) {
        return !(0, _uri.isUriBelow)(normalizedRoot, uri);
      });
      return new WorkingSet(uris);
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
//# sourceMappingURL=data:application/json;base64,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QUksRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLElBQUksR0FBRyxFQUFFLEVBQUMsQ0FBQztDQUM3Qzs7QUFFRCxTQUFTLFdBQVcsR0FBYTtBQUMvQixTQUFPLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBQyxDQUFDO0NBQ3ZCIiwiZmlsZSI6IldvcmtpbmdTZXQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5cbmltcG9ydCB7bm9ybWFsaXplUGF0aFVyaSwgZGVkdXBlTm9ybWFsaXplZFVyaXMsIHNwbGl0VXJpLCBpc1VyaUJlbG93fSBmcm9tICcuL3VyaSc7XG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5cbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9yZW1vdGUtdXJpJztcblxudHlwZSBJbm5lck5vZGUgPSB7XG4gIGtpbmQ6ICdpbm5lcic7XG4gIGNoaWxkcmVuOiBNYXA8c3RyaW5nLCBUcmVlTm9kZT47XG59O1xuXG50eXBlIExlYWZOb2RlID0ge1xuICBraW5kOiAnbGVhZic7XG59O1xuXG50eXBlIFRyZWVOb2RlID0gSW5uZXJOb2RlIHwgTGVhZk5vZGU7XG5cbi8qKlxuKiBXb3JraW5nU2V0IGlzIGFuIGltcGxlbWVudGF0aW9uIG9mIGEgZmlsdGVyIGZvciBmaWxlcyBhbmQgZGlyZWN0b3JpZXMuXG4qIC0gSXQgaXMgKmltbXV0YWJsZSpcbiogLSBJdCBpcyBjcmVhdGVkIGZyb20gYSBzZXQgb2YgTnVjbGlkZVVyaXMuXG4qICAgICBBIHBhdGggVVJJIGlzIGVpdGhlciBhIGxvY2FsIHBhdGgsIHN1Y2ggYXM6IC9hYWEvYmIvY2NjXG4qICAgICBvciByZW1vdGUgbnVjbGlkZTovL3NhbmRib3guY29tL2FhYS9iYi9jY2NcbiogLSBUaGUgVVJJcyBjYW4gcG9pbnQgZWl0aGVyIHRvIGZpbGVzIG9yIHRvIGRpcmVjdG9yaWVzLlxuKiAtIFRoZSByZW1vdGUgVVJJcyBhcmUgcG9ydC1pbnNlbnNpdGl2ZSBhbmQgdGhlIHBvcnQgcGFydCBpcyBzdHJpcHBlZCBmcm9tIHdoZW5cbiogICBpbnRlcm5hbCBzdHJ1Y3R1cmVzIGFyZSBidWlsdC5cbiogLSBFbXB0eSBXb3JraW5nU2V0IGlzIGVzc2VudGlhbGx5IGFuIGVtcHR5IGZpbHRlciAtIGl0IGFjY2VwdHMgZXZlcnl0aGluZy5cbiogLSBOb24tZW1wdHkgV29ya2luZ1NldCBjb250YWlucyBldmVyeSBmaWxlIHNwZWNpZmllZCBieSB0aGUgY29udGFpbmVkIFVSSXMgb3IgYmVsb3cuXG4qICAgU28sIGlmIGEgVVJJIHBvaW50cyB0byBhIGRpcmVjdG9yeSAtIGFsbCBpdHMgc3ViLWRpcmVjdG9yaWVzIGFuZCBmaWxlcyBpbiB0aGVtIGFyZSBpbmNsdWRlZC5cbiogICBUaGlzIGtpbmQgb2YgdGVzdCBpcyBwZXJmb3JtZWQgYnkgdGhlIC5jb250YWluc0ZpbGUoKSBtZXRob2QuXG4qIC0gV29ya2luZ1NldCBhaW1zIHRvIHN1cHBvcnQgcXVlcmllcyBmb3IgdGhlIGhpZXJhcmNoaWNhbCBzdHJ1Y3R1cmVzLCBzdWNoIGFzIFRyZWVWaWV3LlxuKiAgIFRoZXJlZm9yZSwgaWYgYSBmaWxlIGlzIGluY2x1ZGVkIGluIHRoZSBXb3JraW5nU2V0LCB0aGVuIHRoZSBmaWxlLXRyZWUgbXVzdCBoYXZlIGEgd2F5XG4qICAgdG8ga25vdyB0aGF0IGl0IG11c3QgaW5jbHVkZSBpdHMgcGFyZW50IGRpcmVjdG9yaWVzLlxuKiAgIFRoaXMga2luZCBvZiB0ZXN0IGlzIHBlcmZvcm1lZCBieSB0aGUgLmNvbnRhaW5zRGlyKCkgbWV0aG9kLlxuKi9cbmV4cG9ydCBjbGFzcyBXb3JraW5nU2V0IHtcbiAgX3VyaXM6IEFycmF5PHN0cmluZz47XG4gIF9yb290OiA/SW5uZXJOb2RlO1xuXG4gIHN0YXRpYyB1bmlvbiguLi5zZXRzOiBBcnJheTxXb3JraW5nU2V0Pik6IFdvcmtpbmdTZXQge1xuICAgIGNvbnN0IGNvbWJpbmVkVXJpcyA9IFtdLmNvbmNhdCguLi5zZXRzLm1hcChzID0+IHMuX3VyaXMpKTtcbiAgICByZXR1cm4gbmV3IFdvcmtpbmdTZXQoY29tYmluZWRVcmlzKTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKHVyaXM6IEFycmF5PE51Y2xpZGVVcmk+ID0gW10pIHtcbiAgICB0aGlzLl91cmlzID0gZGVkdXBlTm9ybWFsaXplZFVyaXModXJpcy5tYXAobm9ybWFsaXplUGF0aFVyaSkpO1xuICAgIHRoaXMuX3Jvb3QgPSB0aGlzLl9idWlsZERpclRyZWUodGhpcy5fdXJpcyk7XG4gIH1cblxuICBjb250YWluc0ZpbGUodXJpOiBOdWNsaWRlVXJpKSA6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHRva2VucyA9IHNwbGl0VXJpKG5vcm1hbGl6ZVBhdGhVcmkodXJpKSk7XG4gICAgcmV0dXJuIHRoaXMuX2NvbnRhaW5zUGF0aEZvcih0b2tlbnMsIC8qIG11c3RIYXZlTGVhZiAqLyB0cnVlKTtcbiAgfVxuXG4gIGNvbnRhaW5zRGlyKHVyaTogTnVjbGlkZVVyaSk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHRva2VucyA9IHNwbGl0VXJpKG5vcm1hbGl6ZVBhdGhVcmkodXJpKSk7XG4gICAgcmV0dXJuIHRoaXMuX2NvbnRhaW5zUGF0aEZvcih0b2tlbnMsIC8qIG11c3RIYXZlTGVhZiAqLyBmYWxzZSk7XG4gIH1cblxuICBpc0VtcHR5KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl91cmlzLmxlbmd0aCA9PT0gMDtcbiAgfVxuXG4gIGdldFVyaXMoKTogQXJyYXk8c3RyaW5nPiB7XG4gICAgcmV0dXJuIHRoaXMuX3VyaXM7XG4gIH1cblxuICBhcHBlbmQoLi4udXJpczogQXJyYXk8TnVjbGlkZVVyaT4pOiBXb3JraW5nU2V0IHtcbiAgICByZXR1cm4gbmV3IFdvcmtpbmdTZXQodGhpcy5fdXJpcy5jb25jYXQodXJpcykpO1xuICB9XG5cbiAgcmVtb3ZlKHJvb3RVcmk6IE51Y2xpZGVVcmkpOiBXb3JraW5nU2V0IHtcbiAgICBjb25zdCBub3JtYWxpemVkUm9vdCA9IG5vcm1hbGl6ZVBhdGhVcmkocm9vdFVyaSk7XG4gICAgY29uc3QgdXJpcyA9IHRoaXMuX3VyaXMuZmlsdGVyKHVyaSA9PiAhaXNVcmlCZWxvdyhub3JtYWxpemVkUm9vdCwgdXJpKSk7XG4gICAgcmV0dXJuIG5ldyBXb3JraW5nU2V0KHVyaXMpO1xuICB9XG5cbiAgX2J1aWxkRGlyVHJlZSh1cmlzOiBBcnJheTxzdHJpbmc+KTogP0lubmVyTm9kZSB7XG4gICAgaWYgKHVyaXMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCByb290OiBJbm5lck5vZGUgPSBuZXdJbm5lck5vZGUoKTtcblxuICAgIGZvciAoY29uc3QgdXJpIG9mIHVyaXMpIHtcbiAgICAgIGNvbnN0IHRva2VucyA9IHNwbGl0VXJpKHVyaSk7XG4gICAgICBpZiAodG9rZW5zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgbGV0IGN1cnJlbnROb2RlOiBJbm5lck5vZGUgPSByb290O1xuXG4gICAgICBmb3IgKGNvbnN0IHRva2VuIG9mIHRva2Vucy5zbGljZSgwLCAtMSkpIHtcbiAgICAgICAgbGV0IHRva2VuTm9kZTogP1RyZWVOb2RlID0gY3VycmVudE5vZGUuY2hpbGRyZW4uZ2V0KHRva2VuKTtcblxuICAgICAgICBpZiAoIXRva2VuTm9kZSkge1xuICAgICAgICAgIHRva2VuTm9kZSA9IG5ld0lubmVyTm9kZSgpO1xuICAgICAgICAgIGN1cnJlbnROb2RlLmNoaWxkcmVuLnNldCh0b2tlbiwgdG9rZW5Ob2RlKTtcbiAgICAgICAgICBjdXJyZW50Tm9kZSA9IHRva2VuTm9kZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpbnZhcmlhbnQodG9rZW5Ob2RlLmtpbmQgPT09ICdpbm5lcicpO1xuICAgICAgICAgIGN1cnJlbnROb2RlID0gdG9rZW5Ob2RlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGxhc3RUb2tlbiA9IHRva2Vuc1t0b2tlbnMubGVuZ3RoIC0gMV07XG4gICAgICBjdXJyZW50Tm9kZS5jaGlsZHJlbi5zZXQobGFzdFRva2VuLCBuZXdMZWFmTm9kZSgpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcm9vdDtcbiAgfVxuXG4gIF9jb250YWluc1BhdGhGb3IodG9rZW5zOiBBcnJheTxzdHJpbmc+LCBtdXN0SGF2ZUxlYWY6IGJvb2xlYW4pOiBib29sZWFuIHtcbiAgICBsZXQgY3VycmVudE5vZGUgPSB0aGlzLl9yb290O1xuICAgIGlmIChjdXJyZW50Tm9kZSA9PSBudWxsKSB7IC8vIEVtcHR5IHNldCBhY3R1YWxseSBjb250YWlucyBldmVyeXRoaW5nXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IHRva2VuIG9mIHRva2Vucykge1xuICAgICAgY29uc3QgdG9rZW5Ob2RlID0gY3VycmVudE5vZGUuY2hpbGRyZW4uZ2V0KHRva2VuKTtcbiAgICAgIGlmICh0b2tlbk5vZGUgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9IGVsc2UgaWYgKHRva2VuTm9kZS5raW5kID09PSAnbGVhZicpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9IGVsc2UgaWYgKHRva2VuTm9kZS5raW5kID09PSAnaW5uZXInKSB7XG4gICAgICAgIGN1cnJlbnROb2RlID0gdG9rZW5Ob2RlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiAhbXVzdEhhdmVMZWFmO1xuICB9XG59XG5cbmZ1bmN0aW9uIG5ld0lubmVyTm9kZSgpOiBJbm5lck5vZGUge1xuICByZXR1cm4ge2tpbmQ6ICdpbm5lcicsIGNoaWxkcmVuOiBuZXcgTWFwKCl9O1xufVxuXG5mdW5jdGlvbiBuZXdMZWFmTm9kZSgpOiBMZWFmTm9kZSB7XG4gIHJldHVybiB7a2luZDogJ2xlYWYnfTtcbn1cbiJdfQ==