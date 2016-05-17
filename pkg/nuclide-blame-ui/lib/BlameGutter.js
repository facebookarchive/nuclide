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

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === 'function') { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError('The decorator for method ' + descriptor.key + ' is of the invalid type ' + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _constants2;

function _constants() {
  return _constants2 = require('./constants');
}

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _shell2;

function _shell() {
  return _shell2 = _interopRequireDefault(require('shell'));
}

var MS_TO_WAIT_BEFORE_SPINNER = 2000;
var CHANGESET_CSS_CLASS = 'nuclide-blame-ui-hash';
var CLICKABLE_CHANGESET_CSS_CLASS = 'nuclide-blame-ui-hash-clickable';
var HG_CHANGESET_DATA_ATTRIBUTE = 'hgChangeset';

var _default = (function () {

  /**
   * @param gutterName A name for this gutter. Must not be used by any another
   *   gutter in this TextEditor.
   * @param editor The TextEditor this BlameGutter should create UI for.
   * @param blameProvider The BlameProvider that provides the appropriate blame
   *   information for this BlameGutter.
   */

  function _default(gutterName, editor, blameProvider) {
    var _this = this;

    _classCallCheck(this, _default);

    this._isDestroyed = false;
    this._isEditorDestroyed = false;

    this._subscriptions = new (_atom2 || _atom()).CompositeDisposable();
    this._editor = editor;
    this._blameProvider = blameProvider;
    this._changesetSpanClassName = CHANGESET_CSS_CLASS;
    this._bufferLineToDecoration = new Map();
    this._gutter = editor.addGutter({ name: gutterName });
    var gutterView = atom.views.getView(this._gutter);
    gutterView.classList.add('nuclide-blame');

    // If getUrlForRevision() is available, add a single, top-level click handler for the gutter.
    if (typeof blameProvider.getUrlForRevision === 'function') {
      (function () {
        // We also want to style the changeset differently if it is clickable.
        _this._changesetSpanClassName += ' ' + CLICKABLE_CHANGESET_CSS_CLASS;

        var onClick = _this._onClick.bind(_this);
        gutterView.addEventListener('click', onClick);
        _this._subscriptions.add(_this._gutter.onDidDestroy(function () {
          return gutterView.removeEventListener('click', onClick);
        }));
      })();
    }

    this._subscriptions.add(editor.onDidDestroy(function () {
      _this._isEditorDestroyed = true;
    }));
    this._fetchAndDisplayBlame();
  }

  /**
   * If the user clicked on a ChangeSet ID, extract it from the DOM element via the data- attribute
   * and find the corresponding Differential revision. If successful, open the URL for the revision.
   */

  _createDecoratedClass(_default, [{
    key: '_onClick',
    value: _asyncToGenerator(function* (e) {
      var target = e.target;
      if (!target) {
        return;
      }

      var dataset = target.dataset;
      var changeset = dataset[HG_CHANGESET_DATA_ATTRIBUTE];
      if (!changeset) {
        return;
      }

      var blameProvider = this._blameProvider;
      (0, (_assert2 || _assert()).default)(typeof blameProvider.getUrlForRevision === 'function');
      var url = yield blameProvider.getUrlForRevision(this._editor, changeset);
      if (url) {
        // Note that 'shell' is not the public 'shell' package on npm but an Atom built-in.
        (_shell2 || _shell()).default.openExternal(url);
      } else {
        atom.notifications.addWarning('No URL found for ' + changeset + '.');
      }

      (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('blame-gutter-click-revision', {
        editorPath: this._editor.getPath() || '',
        url: url || ''
      });
    })
  }, {
    key: '_fetchAndDisplayBlame',
    value: _asyncToGenerator(function* () {
      // Add a loading spinner while we fetch the blame.
      this._addLoadingSpinner();

      var newBlame = undefined;
      try {
        newBlame = yield this._blameProvider.getBlameForEditor(this._editor);
      } catch (error) {
        atom.notifications.addError('Failed to fetch blame to display. ' + 'The file is empty or untracked or the repository cannot be reached.', error);
        return;
      }
      // The BlameGutter could have been destroyed while blame was being fetched.
      if (this._isDestroyed) {
        return;
      }

      // Remove the loading spinner before setting the contents of the blame gutter.
      this._cleanUpLoadingSpinner();

      this._updateBlame(newBlame);
    })
  }, {
    key: '_addLoadingSpinner',
    value: function _addLoadingSpinner() {
      var _this2 = this;

      if (this._loadingSpinnerIsPending) {
        return;
      }
      this._loadingSpinnerIsPending = true;
      this._loadingSpinnerTimeoutId = window.setTimeout(function () {
        _this2._loadingSpinnerIsPending = false;
        _this2._loadingSpinnerDiv = document.createElement('div');
        _this2._loadingSpinnerDiv.className = 'nuclide-blame-ui-spinner';
        var gutterView = atom.views.getView(_this2._gutter);
        gutterView.appendChild(_this2._loadingSpinnerDiv);
      }, MS_TO_WAIT_BEFORE_SPINNER);
    }
  }, {
    key: '_cleanUpLoadingSpinner',
    value: function _cleanUpLoadingSpinner() {
      if (this._loadingSpinnerIsPending) {
        window.clearTimeout(this._loadingSpinnerTimeoutId);
        this._loadingSpinnerIsPending = false;
      }
      if (this._loadingSpinnerDiv) {
        this._loadingSpinnerDiv.remove();
        this._loadingSpinnerDiv = null;
      }
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this._isDestroyed = true;
      this._cleanUpLoadingSpinner();
      if (!this._isEditorDestroyed) {
        // Due to a bug in the Gutter API, destroying a Gutter after the editor
        // has been destroyed results in an exception.
        this._gutter.destroy();
      }
      for (var decoration of this._bufferLineToDecoration.values()) {
        decoration.getMarker().destroy();
      }
    }

    // The BlameForEditor completely replaces any previous blame information.
  }, {
    key: '_updateBlame',
    decorators: [(0, (_nuclideAnalytics2 || _nuclideAnalytics()).trackTiming)('blame-ui.blame-gutter.updateBlame')],
    value: function _updateBlame(blameForEditor) {
      if (blameForEditor.size === 0) {
        atom.notifications.addInfo('Found no blame to display. Is this file empty or untracked?\n          If not, check for errors in the Nuclide logs local to your repo.');
      }
      var allPreviousBlamedLines = new Set(this._bufferLineToDecoration.keys());

      var longestBlame = 0;
      for (var blameInfo of blameForEditor.values()) {
        var blameLength = blameInfo.author.length;
        if (blameInfo.changeset) {
          blameLength += blameInfo.changeset.length + 1;
        }
        if (blameLength > longestBlame) {
          longestBlame = blameLength;
        }
      }

      for (var _ref3 of blameForEditor) {
        var _ref2 = _slicedToArray(_ref3, 2);

        var bufferLine = _ref2[0];
        var blameInfo = _ref2[1];

        this._setBlameLine(bufferLine, blameInfo, longestBlame);
        allPreviousBlamedLines.delete(bufferLine);
      }

      // Any lines that weren't in the new blameForEditor are outdated.
      for (var oldLine of allPreviousBlamedLines) {
        this._removeBlameLine(oldLine);
      }

      // Update the width of the gutter according to the new contents.
      this._updateGutterWidthToCharacterLength(longestBlame);
    }
  }, {
    key: '_updateGutterWidthToCharacterLength',
    value: function _updateGutterWidthToCharacterLength(characters) {
      var gutterView = atom.views.getView(this._gutter);
      gutterView.style.width = characters + 'ch';
    }
  }, {
    key: '_setBlameLine',
    value: function _setBlameLine(bufferLine, blameInfo, longestBlame) {
      var item = this._createGutterItem(blameInfo, longestBlame);
      var decorationProperties = {
        type: 'gutter',
        gutterName: this._gutter.name,
        'class': (_constants2 || _constants()).BLAME_DECORATION_CLASS,
        item: item
      };

      var decoration = this._bufferLineToDecoration.get(bufferLine);
      if (!decoration) {
        var bufferLineHeadPoint = [bufferLine, 0];
        // The range of this Marker doesn't matter, only the line it is on, because
        // the Decoration is for a Gutter.
        var marker = this._editor.markBufferRange([bufferLineHeadPoint, bufferLineHeadPoint]);
        decoration = this._editor.decorateMarker(marker, decorationProperties);
        this._bufferLineToDecoration.set(bufferLine, decoration);
      } else {
        decoration.setProperties(decorationProperties);
      }
    }
  }, {
    key: '_removeBlameLine',
    value: function _removeBlameLine(bufferLine) {
      var blameDecoration = this._bufferLineToDecoration.get(bufferLine);
      if (!blameDecoration) {
        return;
      }
      // The recommended way of destroying a decoration is by destroying its marker.
      blameDecoration.getMarker().destroy();
      this._bufferLineToDecoration.delete(bufferLine);
    }
  }, {
    key: '_createGutterItem',
    value: function _createGutterItem(blameInfo, longestBlame) {
      var doc = window.document;
      var item = doc.createElement('div');

      var authorSpan = doc.createElement('span');
      authorSpan.innerText = blameInfo.author;
      item.appendChild(authorSpan);

      if (blameInfo.changeset) {
        var numSpaces = longestBlame - blameInfo.author.length - blameInfo.changeset.length;
        // Insert non-breaking spaces to ensure the changeset is right-aligned.
        // Admittedly, this is a little gross, but it seems better than setting style.width on every
        // item that we create and having to give it a special flexbox layout. Hooray monospace!
        item.appendChild(doc.createTextNode(' '.repeat(numSpaces)));

        var changesetSpan = doc.createElement('span');
        changesetSpan.className = this._changesetSpanClassName;
        changesetSpan.dataset[HG_CHANGESET_DATA_ATTRIBUTE] = blameInfo.changeset;
        changesetSpan.innerText = blameInfo.changeset;
        item.appendChild(changesetSpan);
      }

      return item;
    }
  }]);

  return _default;
})();

exports.default = _default;
module.exports = exports.default;