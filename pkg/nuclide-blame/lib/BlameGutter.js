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
exports.default = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _dec, _desc, _value, _class;

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _atom = require('atom');

var _electron = require('electron');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
  var desc = {};
  Object['ke' + 'ys'](descriptor).forEach(function (key) {
    desc[key] = descriptor[key];
  });
  desc.enumerable = !!desc.enumerable;
  desc.configurable = !!desc.configurable;

  if ('value' in desc || desc.initializer) {
    desc.writable = true;
  }

  desc = decorators.slice().reverse().reduce(function (desc, decorator) {
    return decorator(target, property, desc) || desc;
  }, desc);

  if (context && desc.initializer !== void 0) {
    desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
    desc.initializer = undefined;
  }

  if (desc.initializer === void 0) {
    Object['define' + 'Property'](target, property, desc);
    desc = null;
  }

  return desc;
}

const MS_TO_WAIT_BEFORE_SPINNER = 2000;
const CHANGESET_CSS_CLASS = 'nuclide-blame-hash';
const CLICKABLE_CHANGESET_CSS_CLASS = 'nuclide-blame-hash-clickable';
const HG_CHANGESET_DATA_ATTRIBUTE = 'hgChangeset';
const BLAME_DECORATION_CLASS = 'blame-decoration';

let BlameGutter = (_dec = (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)('blame-ui.blame-gutter.updateBlame'), (_class = class BlameGutter {

  /**
   * @param gutterName A name for this gutter. Must not be used by any another
   *   gutter in this TextEditor.
   * @param editor The TextEditor this BlameGutter should create UI for.
   * @param blameProvider The BlameProvider that provides the appropriate blame
   *   information for this BlameGutter.
   */
  constructor(gutterName, editor, blameProvider) {
    this._isDestroyed = false;
    this._isEditorDestroyed = false;

    this._subscriptions = new _atom.CompositeDisposable();
    this._editor = editor;
    this._blameProvider = blameProvider;
    this._changesetSpanClassName = CHANGESET_CSS_CLASS;
    this._bufferLineToDecoration = new Map();
    // Priority is -200 by default and 0 is the line number
    this._gutter = editor.addGutter({ name: gutterName, priority: -1200 });
    const gutterView = atom.views.getView(this._gutter);
    gutterView.classList.add('nuclide-blame');

    // If getUrlForRevision() is available, add a single, top-level click handler for the gutter.
    if (typeof blameProvider.getUrlForRevision === 'function') {
      // We also want to style the changeset differently if it is clickable.
      this._changesetSpanClassName += ' ' + CLICKABLE_CHANGESET_CSS_CLASS;

      const onClick = this._onClick.bind(this);
      gutterView.addEventListener('click', onClick);
      this._subscriptions.add(this._gutter.onDidDestroy(() => gutterView.removeEventListener('click', onClick)));
    }

    this._subscriptions.add(editor.onDidDestroy(() => {
      this._isEditorDestroyed = true;
    }));
    this._fetchAndDisplayBlame();
  }

  /**
   * If the user clicked on a ChangeSet ID, extract it from the DOM element via the data- attribute
   * and find the corresponding Differential revision. If successful, open the URL for the revision.
   */
  _onClick(e) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const target = e.target;
      if (!target) {
        return;
      }

      const dataset = target.dataset;
      const changeset = dataset[HG_CHANGESET_DATA_ATTRIBUTE];
      if (!changeset) {
        return;
      }

      const blameProvider = _this._blameProvider;

      if (!(typeof blameProvider.getUrlForRevision === 'function')) {
        throw new Error('Invariant violation: "typeof blameProvider.getUrlForRevision === \'function\'"');
      }

      const url = yield blameProvider.getUrlForRevision(_this._editor, changeset);
      if (url) {
        // Note that 'shell' is not the public 'shell' package on npm but an Atom built-in.
        _electron.shell.openExternal(url);
      } else {
        atom.notifications.addWarning(`No URL found for ${ changeset }.`);
      }

      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('blame-gutter-click-revision', {
        editorPath: _this._editor.getPath() || '',
        url: url || ''
      });
    })();
  }

  _fetchAndDisplayBlame() {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      // Add a loading spinner while we fetch the blame.
      _this2._addLoadingSpinner();

      let newBlame;
      try {
        newBlame = yield _this2._blameProvider.getBlameForEditor(_this2._editor);
      } catch (error) {
        atom.notifications.addError('Failed to fetch blame to display. ' + 'The file is empty or untracked or the repository cannot be reached.', error);
        atom.commands.dispatch(atom.views.getView(_this2._editor), 'nuclide-blame:hide-blame');
        return;
      }
      // The BlameGutter could have been destroyed while blame was being fetched.
      if (_this2._isDestroyed) {
        return;
      }

      // Remove the loading spinner before setting the contents of the blame gutter.
      _this2._cleanUpLoadingSpinner();

      _this2._updateBlame(newBlame);
    })();
  }

  _addLoadingSpinner() {
    if (this._loadingSpinnerIsPending) {
      return;
    }
    this._loadingSpinnerIsPending = true;
    this._loadingSpinnerTimeoutId = window.setTimeout(() => {
      const gutterView = atom.views.getView(this._gutter);
      this._loadingSpinnerIsPending = false;
      this._loadingSpinnerDiv = document.createElement('div');
      this._loadingSpinnerDiv.className = 'nuclide-blame-spinner';
      gutterView.appendChild(this._loadingSpinnerDiv);
    }, MS_TO_WAIT_BEFORE_SPINNER);
  }

  _cleanUpLoadingSpinner() {
    if (this._loadingSpinnerIsPending) {
      window.clearTimeout(this._loadingSpinnerTimeoutId);
      this._loadingSpinnerIsPending = false;
    }
    if (this._loadingSpinnerDiv) {
      this._loadingSpinnerDiv.remove();
      this._loadingSpinnerDiv = null;
    }
  }

  destroy() {
    this._isDestroyed = true;
    this._cleanUpLoadingSpinner();
    if (!this._isEditorDestroyed) {
      // Due to a bug in the Gutter API, destroying a Gutter after the editor
      // has been destroyed results in an exception.
      this._gutter.destroy();
    }
    for (const decoration of this._bufferLineToDecoration.values()) {
      decoration.getMarker().destroy();
    }
  }

  // The BlameForEditor completely replaces any previous blame information.

  _updateBlame(blameForEditor) {
    if (blameForEditor.size === 0) {
      atom.notifications.addInfo(`Found no blame to display. Is this file empty or untracked?
          If not, check for errors in the Nuclide logs local to your repo.`);
    }
    const allPreviousBlamedLines = new Set(this._bufferLineToDecoration.keys());

    let longestBlame = 0;
    for (const blameInfo of blameForEditor.values()) {
      let blameLength = blameInfo.author.length;
      if (blameInfo.changeset) {
        blameLength += blameInfo.changeset.length + 1;
      }
      if (blameLength > longestBlame) {
        longestBlame = blameLength;
      }
    }

    for (const _ref of blameForEditor) {
      var _ref2 = _slicedToArray(_ref, 2);

      const bufferLine = _ref2[0];
      const blameInfo = _ref2[1];

      this._setBlameLine(bufferLine, blameInfo, longestBlame);
      allPreviousBlamedLines.delete(bufferLine);
    }

    // Any lines that weren't in the new blameForEditor are outdated.
    for (const oldLine of allPreviousBlamedLines) {
      this._removeBlameLine(oldLine);
    }

    // Update the width of the gutter according to the new contents.
    this._updateGutterWidthToCharacterLength(longestBlame);
  }

  _updateGutterWidthToCharacterLength(characters) {
    const gutterView = atom.views.getView(this._gutter);
    gutterView.style.width = `${ characters }ch`;
  }

  _setBlameLine(bufferLine, blameInfo, longestBlame) {
    const item = this._createGutterItem(blameInfo, longestBlame);
    const decorationProperties = {
      type: 'gutter',
      gutterName: this._gutter.name,
      class: BLAME_DECORATION_CLASS,
      item: item
    };

    let decoration = this._bufferLineToDecoration.get(bufferLine);
    if (!decoration) {
      const bufferLineHeadPoint = [bufferLine, 0];
      // The range of this Marker doesn't matter, only the line it is on, because
      // the Decoration is for a Gutter.
      const marker = this._editor.markBufferRange([bufferLineHeadPoint, bufferLineHeadPoint]);
      decoration = this._editor.decorateMarker(marker, decorationProperties);
      this._bufferLineToDecoration.set(bufferLine, decoration);
    } else {
      decoration.setProperties(decorationProperties);
    }
  }

  _removeBlameLine(bufferLine) {
    const blameDecoration = this._bufferLineToDecoration.get(bufferLine);
    if (!blameDecoration) {
      return;
    }
    // The recommended way of destroying a decoration is by destroying its marker.
    blameDecoration.getMarker().destroy();
    this._bufferLineToDecoration.delete(bufferLine);
  }

  _createGutterItem(blameInfo, longestBlame) {
    const doc = window.document;
    const item = doc.createElement('div');

    const authorSpan = doc.createElement('span');
    authorSpan.innerText = blameInfo.author;
    item.appendChild(authorSpan);

    if (blameInfo.changeset) {
      const numSpaces = longestBlame - blameInfo.author.length - blameInfo.changeset.length;
      // Insert non-breaking spaces to ensure the changeset is right-aligned.
      // Admittedly, this is a little gross, but it seems better than setting style.width on every
      // item that we create and having to give it a special flexbox layout. Hooray monospace!
      item.appendChild(doc.createTextNode('\u00A0'.repeat(numSpaces)));

      const changesetSpan = doc.createElement('span');
      changesetSpan.className = this._changesetSpanClassName;
      changesetSpan.dataset[HG_CHANGESET_DATA_ATTRIBUTE] = blameInfo.changeset;
      changesetSpan.innerText = blameInfo.changeset;
      item.appendChild(changesetSpan);
    }

    return item;
  }
}, (_applyDecoratedDescriptor(_class.prototype, '_updateBlame', [_dec], Object.getOwnPropertyDescriptor(_class.prototype, '_updateBlame'), _class.prototype)), _class));
exports.default = BlameGutter;
module.exports = exports['default'];