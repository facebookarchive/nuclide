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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _commonsNodeCollection;

function _load_commonsNodeCollection() {
  return _commonsNodeCollection = require('../../commons-node/collection');
}

var _reactForAtom;

function _load_reactForAtom() {
  return _reactForAtom = require('react-for-atom');
}

var _DiffViewEditor;

function _load_DiffViewEditor() {
  return _DiffViewEditor = _interopRequireDefault(require('./DiffViewEditor'));
}

var _nuclideUiAtomTextEditor;

function _load_nuclideUiAtomTextEditor() {
  return _nuclideUiAtomTextEditor = require('../../nuclide-ui/AtomTextEditor');
}

var _assert;

function _load_assert() {
  return _assert = _interopRequireDefault(require('assert'));
}

var _commonsNodeUniversalDisposable;

function _load_commonsNodeUniversalDisposable() {
  return _commonsNodeUniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _rxjsBundlesRxMinJs;

function _load_rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');
}

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _nuclideUiLoadingSpinner;

function _load_nuclideUiLoadingSpinner() {
  return _nuclideUiLoadingSpinner = require('../../nuclide-ui/LoadingSpinner');
}

var _commonsNodeEvent;

function _load_commonsNodeEvent() {
  return _commonsNodeEvent = require('../../commons-node/event');
}

var SPINNER_DELAY_MS = 50;
var DEBOUNCE_SCROLL_MS = 50;

var DiffViewEditorPane = (function (_React$Component) {
  _inherits(DiffViewEditorPane, _React$Component);

  function DiffViewEditorPane(props) {
    _classCallCheck(this, DiffViewEditorPane);

    _get(Object.getPrototypeOf(DiffViewEditorPane.prototype), 'constructor', this).call(this, props);
    this._subscriptions = new (_commonsNodeUniversalDisposable || _load_commonsNodeUniversalDisposable()).default();
    this._isMounted = false;
  }

  _createClass(DiffViewEditorPane, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this._isMounted = true;
      this._setupDiffEditor();
    }
  }, {
    key: '_setupDiffEditor',
    value: function _setupDiffEditor() {
      var _this = this;

      var editorSubscriptions = this._editorSubscriptions = new (_commonsNodeUniversalDisposable || _load_commonsNodeUniversalDisposable()).default();
      this._subscriptions.add(editorSubscriptions);

      var editorDomElement = this.getEditorDomElement();
      this._diffViewEditor = new (_DiffViewEditor || _load_DiffViewEditor()).default(editorDomElement);
      var textEditor = this.getEditorModel();

      /*
       * Those should have been synced automatically, but an implementation limitation of creating
       * a <atom-text-editor> element assumes default settings for those.
       * Filed: https://github.com/atom/atom/issues/10506
       */
      editorSubscriptions.add(atom.config.observe('editor.tabLength', function (tabLength) {
        textEditor.setTabLength(tabLength);
      }));
      editorSubscriptions.add(atom.config.observe('editor.softTabs', function (softTabs) {
        textEditor.setSoftTabs(softTabs);
      }));

      if (this.props.onDidChangeScrollTop != null) {
        editorSubscriptions.add(
        // Debounce for smooth scrolling without hogging the CPU.
        (0, (_commonsNodeEvent || _load_commonsNodeEvent()).observableFromSubscribeFunction)(editorDomElement.onDidChangeScrollTop.bind(editorDomElement)).debounceTime(DEBOUNCE_SCROLL_MS).subscribe(this.props.onDidChangeScrollTop));
      }

      this.props.onDidUpdateTextEditorElement();
      // TODO(most): Fix by listening to text editor rendering.
      editorSubscriptions.add((_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.interval(100).first().subscribe(function () {
        return _this._setOffsets(_this.props.offsets);
      }));
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this._subscriptions.dispose();
      if (this._diffViewEditor != null) {
        this._diffViewEditor.destroy();
        this._diffViewEditor = null;
      }
      this._isMounted = false;
    }
  }, {
    key: 'render',
    value: function render() {
      var isLoading = this.props.isLoading;

      var rootClassName = (0, (_classnames || _load_classnames()).default)({
        'nuclide-diff-editor-container': true,
        'nuclide-diff-view-editor-loading': isLoading
      });

      var loadingIndicator = isLoading ? (_reactForAtom || _load_reactForAtom()).React.createElement(
        'div',
        { className: 'nuclide-diff-view-pane-loading-indicator' },
        (_reactForAtom || _load_reactForAtom()).React.createElement((_nuclideUiLoadingSpinner || _load_nuclideUiLoadingSpinner()).LoadingSpinner, { delay: SPINNER_DELAY_MS, size: (_nuclideUiLoadingSpinner || _load_nuclideUiLoadingSpinner()).LoadingSpinnerSizes.LARGE })
      ) : null;

      return (_reactForAtom || _load_reactForAtom()).React.createElement(
        'div',
        { className: rootClassName },
        loadingIndicator,
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          'div',
          { className: 'nuclide-diff-editor-wrapper' },
          (_reactForAtom || _load_reactForAtom()).React.createElement((_nuclideUiAtomTextEditor || _load_nuclideUiAtomTextEditor()).AtomTextEditor, {
            _alwaysUpdate: true,
            ref: 'editor',
            readOnly: this.props.readOnly,
            textBuffer: this.props.textBuffer,
            syncTextContents: false
          })
        )
      );
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps) {
      if (prevProps.textBuffer !== this.props.textBuffer) {
        var oldEditorSubscriptions = this._editorSubscriptions;
        if (oldEditorSubscriptions != null) {
          oldEditorSubscriptions.dispose();
          this._subscriptions.remove(oldEditorSubscriptions);
          this._editorSubscriptions = null;
        }
        this._setupDiffEditor();
      }
      this._updateDiffView(prevProps);
    }
  }, {
    key: '_updateDiffView',
    value: function _updateDiffView(oldProps) {
      var newProps = this.props;
      var diffEditorUpdated = oldProps.textBuffer !== newProps.textBuffer;
      // The Diff View can never edit the edited buffer contents.
      if (newProps.readOnly && newProps.textContent != null && oldProps.textContent !== newProps.textContent) {
        this._setTextContent(newProps.filePath, newProps.textContent);
      }
      if (diffEditorUpdated || !(0, (_commonsNodeCollection || _load_commonsNodeCollection()).mapEqual)(oldProps.offsets, newProps.offsets)) {
        this._setOffsets(newProps.offsets);
      }
      if (diffEditorUpdated || !(0, (_commonsNodeCollection || _load_commonsNodeCollection()).arrayEqual)(oldProps.inlineElements, newProps.inlineElements)) {
        this._renderComponentsInline(newProps.inlineElements);
      }
      this._setHighlightedLines(newProps.highlightedLines);
    }
  }, {
    key: '_setTextContent',
    value: function _setTextContent(filePath, text) {
      (0, (_assert || _load_assert()).default)(this._diffViewEditor);
      this._diffViewEditor.setFileContents(filePath, text);
    }
  }, {
    key: '_setHighlightedLines',
    value: function _setHighlightedLines(highlightedLines) {
      (0, (_assert || _load_assert()).default)(this._diffViewEditor);
      this._diffViewEditor.setHighlightedLines(highlightedLines.added, highlightedLines.removed);
    }
  }, {
    key: '_setOffsets',
    value: function _setOffsets(offsets) {
      (0, (_assert || _load_assert()).default)(this._diffViewEditor);
      this._diffViewEditor.setOffsets(offsets);
    }
  }, {
    key: '_renderComponentsInline',
    value: function _renderComponentsInline(elements) {
      if (!this._isMounted || elements.length === 0) {
        return;
      }
      (0, (_assert || _load_assert()).default)(this._diffViewEditor, 'diffViewEditor has not been setup yet.');
      this._diffViewEditor.setUIElements(elements);
    }
  }, {
    key: 'getEditorModel',
    value: function getEditorModel() {
      return this.refs.editor.getModel();
    }
  }, {
    key: 'getEditorDomElement',
    value: function getEditorDomElement() {
      return this.refs.editor.getElement();
    }
  }]);

  return DiffViewEditorPane;
})((_reactForAtom || _load_reactForAtom()).React.Component);

exports.default = DiffViewEditorPane;
module.exports = exports.default;

// TODO(most): move async code out of the view and deprecate the usage of `_isMounted`.
// All view changes should be pushed from the model/store through subscriptions.