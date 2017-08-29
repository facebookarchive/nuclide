'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _addTooltip;

function _load_addTooltip() {
  return _addTooltip = _interopRequireDefault(require('nuclide-commons-ui/addTooltip'));
}

var _hideAllTooltips;

function _load_hideAllTooltips() {
  return _hideAllTooltips = _interopRequireDefault(require('../../nuclide-ui/hide-all-tooltips'));
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _atom = require('atom');

var _electron = require('electron');

var _nuclideVcsLog;

function _load_nuclideVcsLog() {
  return _nuclideVcsLog = require('../../nuclide-vcs-log');
}

var _react = _interopRequireWildcard(require('react'));

var _reactDom = _interopRequireDefault(require('react-dom'));

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
const BLAME_DECORATION_CLASS = 'blame-decoration'; /**
                                                    * Copyright (c) 2015-present, Facebook, Inc.
                                                    * All rights reserved.
                                                    *
                                                    * This source code is licensed under the license found in the LICENSE file in
                                                    * the root directory of this source tree.
                                                    *
                                                    * 
                                                    * @format
                                                    */

let Avatar;
try {
  // $FlowFB
  Avatar = require('../../nuclide-ui/fb-Avatar').default;
} catch (err) {
  Avatar = null;
}

function escapeHTML(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function getHash(revision) {
  if (revision == null) {
    return null;
  }
  return revision.hash;
}

class BlameGutter {

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
    this._bufferLineToDecoration = new Map();
    // Priority is -200 by default and 0 is the line number
    this._gutter = editor.addGutter({ name: gutterName, priority: -1200 });

    this._subscriptions.add(editor.onDidDestroy(() => {
      this._isEditorDestroyed = true;
    }));
    const editorView = atom.views.getView(editor);
    this._subscriptions.add(editorView.onDidChangeScrollTop(() => {
      (0, (_hideAllTooltips || _load_hideAllTooltips()).default)();
    }));
    this._fetchAndDisplayBlame();
  }

  _onClick(revision) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const blameProvider = _this._blameProvider;
      if (typeof blameProvider.getUrlForRevision !== 'function') {
        return;
      }

      const url = yield blameProvider.getUrlForRevision(_this._editor, revision.hash);
      // flowlint-next-line sketchy-null-string:off
      if (url) {
        // Note that 'shell' is not the public 'shell' package on npm but an Atom built-in.
        _electron.shell.openExternal(url);
      } else {
        atom.notifications.addWarning(`No URL found for ${revision.hash}.`);
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
        atom.notifications.addError('Failed to fetch blame to display. ' + 'The file is empty or untracked or the repository cannot be reached.', { detail: error });
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
    if (this._loadingSpinnerDiv) {
      return;
    }
    const gutterView = atom.views.getView(this._gutter);
    this._loadingSpinnerDiv = document.createElement('div');
    this._loadingSpinnerDiv.className = 'nuclide-blame-spinner';
    gutterView.appendChild(this._loadingSpinnerDiv);
    gutterView.classList.add('nuclide-blame-loading');
  }

  _cleanUpLoadingSpinner() {
    if (this._loadingSpinnerDiv) {
      this._loadingSpinnerDiv.remove();
      this._loadingSpinnerDiv = null;
      const gutterView = atom.views.getView(this._gutter);
      gutterView.classList.remove('nuclide-blame-loading');
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
    // Remove all the lines
    for (const lineNumber of this._bufferLineToDecoration.keys()) {
      this._removeBlameLine(lineNumber);
    }
  }

  _updateBlame(blameForEditor) {
    return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)('blame-ui.blame-gutter.updateBlame', () => this.__updateBlame(blameForEditor));
  }

  // The BlameForEditor completely replaces any previous blame information.
  __updateBlame(blameForEditor) {
    if (blameForEditor.length === 0) {
      atom.notifications.addInfo(`Found no blame to display. Is this file empty or untracked?
          If not, check for errors in the Nuclide logs local to your repo.`);
    }
    const allPreviousBlamedLines = new Set(this._bufferLineToDecoration.keys());

    let oldest = Number.POSITIVE_INFINITY;
    let newest = Number.NEGATIVE_INFINITY;
    for (let i = 0; i < blameForEditor.length; ++i) {
      const revision = blameForEditor[i];
      if (!revision) {
        continue;
      }
      const date = Number(revision.date);
      if (date < oldest) {
        oldest = date;
      }
      if (date > newest) {
        newest = date;
      }
    }

    for (let bufferLine = 0; bufferLine < blameForEditor.length; ++bufferLine) {
      const hash = getHash(blameForEditor[bufferLine]);
      const isFirstLine = hash !== getHash(blameForEditor[bufferLine - 1]);
      const isLastLine = hash !== getHash(blameForEditor[bufferLine + 1]);

      const blameInfo = blameForEditor[bufferLine];
      if (blameInfo) {
        this._setBlameLine(bufferLine, blameInfo, isFirstLine, isLastLine, oldest, newest);
      }
      allPreviousBlamedLines.delete(bufferLine);
    }

    // Any lines that weren't in the new blameForEditor are outdated.
    for (const oldLine of allPreviousBlamedLines) {
      this._removeBlameLine(oldLine);
    }
  }

  _setBlameLine(bufferLine, revision, isFirstLine, isLastLine, oldest, newest) {
    const item = this._createGutterItem(revision, isFirstLine, isLastLine, oldest, newest);
    const decorationProperties = {
      type: 'gutter',
      gutterName: this._gutter.name,
      class: BLAME_DECORATION_CLASS,
      item
    };

    let decoration = this._bufferLineToDecoration.get(bufferLine);
    if (!decoration) {
      const marker = this._editor.markBufferRange([[bufferLine, 0], [bufferLine, 100000]], { invalidate: 'touch' });

      decoration = this._editor.decorateMarker(marker, decorationProperties);
      this._bufferLineToDecoration.set(bufferLine, decoration);
    } else {
      _reactDom.default.unmountComponentAtNode(decoration.getProperties().item);
      decoration.setProperties(decorationProperties);
    }
  }

  _removeBlameLine(bufferLine) {
    const blameDecoration = this._bufferLineToDecoration.get(bufferLine);
    if (!blameDecoration) {
      return;
    }
    _reactDom.default.unmountComponentAtNode(blameDecoration.getProperties().item);
    // The recommended way of destroying a decoration is by destroying its marker.
    blameDecoration.getMarker().destroy();
    this._bufferLineToDecoration.delete(bufferLine);
  }

  _createGutterItem(blameInfo, isFirstLine, isLastLine, oldest, newest) {
    const item = document.createElement('div');

    item.addEventListener('click', () => {
      this._onClick(blameInfo);
    });

    _reactDom.default.render(_react.createElement(GutterElement, {
      revision: blameInfo,
      isFirstLine: isFirstLine,
      isLastLine: isLastLine,
      oldest: oldest,
      newest: newest
    }), item);
    return item;
  }
}

exports.default = BlameGutter;


class GutterElement extends _react.Component {
  render() {
    const { oldest, newest, revision, isLastLine, isFirstLine } = this.props;
    const date = Number(revision.date);

    const alpha = 1 - (date - newest) / (oldest - newest);
    const opacity = 0.2 + 0.8 * alpha;

    if (isFirstLine) {
      const unixname = (0, (_nuclideVcsLog || _load_nuclideVcsLog()).shortNameForAuthor)(revision.author);
      const tooltip = {
        title: escapeHTML(revision.title) + '<br />' + escapeHTML(unixname) + ' &middot; ' + escapeHTML(revision.date.toDateString()),
        delay: 0,
        placement: 'right'
      };

      return _react.createElement(
        'div',
        {
          className: 'nuclide-blame-row nuclide-blame-content'
          // $FlowFixMe(>=0.53.0) Flow suppress
          , ref: (0, (_addTooltip || _load_addTooltip()).default)(tooltip) },
        !isLastLine ? _react.createElement('div', { className: 'nuclide-blame-vertical-bar nuclide-blame-vertical-bar-first' }) : null,
        Avatar ? _react.createElement(Avatar, { size: 16, unixname: unixname }) : unixname + ': ',
        _react.createElement(
          'span',
          null,
          revision.title
        ),
        _react.createElement('div', { style: { opacity }, className: 'nuclide-blame-border-age' })
      );
    }

    return _react.createElement(
      'div',
      { className: 'nuclide-blame-row' },
      _react.createElement('div', {
        className: (0, (_classnames || _load_classnames()).default)('nuclide-blame-vertical-bar', {
          'nuclide-blame-vertical-bar-last': isLastLine,
          'nuclide-blame-vertical-bar-middle': !isLastLine
        })
      }),
      _react.createElement('div', { style: { opacity }, className: 'nuclide-blame-border-age' })
    );
  }
}