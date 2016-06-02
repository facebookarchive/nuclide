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

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _commonsAtomTextEditor2;

function _commonsAtomTextEditor() {
  return _commonsAtomTextEditor2 = require('../../commons-atom/text-editor');
}

var _nuclideUiLibAtomTextEditor2;

function _nuclideUiLibAtomTextEditor() {
  return _nuclideUiLibAtomTextEditor2 = require('../../nuclide-ui/lib/AtomTextEditor');
}

var _nuclideUiLibObservingComponent2;

function _nuclideUiLibObservingComponent() {
  return _nuclideUiLibObservingComponent2 = require('../../nuclide-ui/lib/ObservingComponent');
}

var CodePreviewView = (function (_ObservingComponent) {
  _inherits(CodePreviewView, _ObservingComponent);

  function CodePreviewView(props) {
    _classCallCheck(this, CodePreviewView);

    _get(Object.getPrototypeOf(CodePreviewView.prototype), 'constructor', this).call(this, props);
    this._loadAndScroll = null;
  }

  _createClass(CodePreviewView, [{
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(newProps) {
      if (newProps.data === this.props.data) {
        return;
      }
      _get(Object.getPrototypeOf(CodePreviewView.prototype), 'componentWillReceiveProps', this).call(this, newProps);
      this._loadAndScroll = null;
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {
      // Kick this off after we have the editor rendered.
      if (this._loadAndScroll != null) {
        this._loadAndScroll();
      }
    }
  }, {
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(newProps, newState) {
      return newState.data !== this.state.data;
    }
  }, {
    key: 'render',
    value: function render() {
      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        { className: 'pane-item padded nuclide-definition-preview' },
        this._maybeContent()
      );
    }
  }, {
    key: '_maybeContent',
    value: function _maybeContent() {
      var previewContent = this.state.data;
      return previewContent == null ? (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        { className: 'nuclide-definition-container' },
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'span',
          null,
          'Unknown Definition'
        )
      ) : this._previewDefinition(previewContent);
    }
  }, {
    key: '_previewDefinition',
    value: function _previewDefinition(content) {
      var _this = this;

      this._loadAndScroll = null;

      var definition = content.location;

      var path = definition.path;
      var textBuffer = (0, (_commonsAtomTextEditor2 || _commonsAtomTextEditor()).bufferForUri)(path);
      var loadAndScroll = _asyncToGenerator(function* () {
        if (_this._loadAndScroll !== loadAndScroll) {
          return;
        }

        if (!textBuffer.loaded) {
          // TODO: figure out what to do if loading fails
          // TODO(peterhal): Can we use TextBuffer.onDidReload here?
          yield textBuffer.load();
          if (_this._loadAndScroll !== loadAndScroll) {
            return;
          }
        }

        // Scroll after loading is complete.
        // TODO(peterhal): Add an initial scroll position property to AtomTextEditor
        setTimeout(function () {
          if (_this._loadAndScroll !== loadAndScroll) {
            return;
          }
          _this._scrollToRow(definition.position.row);
          _this._loadAndScroll = null;
        }, 50);
      });
      // Defer loading and scrolling until after rendering.
      this._loadAndScroll = loadAndScroll;

      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        { className: 'nuclide-definition-preview-container' },
        (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiLibAtomTextEditor2 || _nuclideUiLibAtomTextEditor()).AtomTextEditor, {
          ref: 'editor',
          gutterHidden: true,
          lineNumberGutterVisible: false,
          path: path,
          readOnly: true,
          textBuffer: textBuffer,
          grammar: content.grammar,
          syncTextContents: false
        })
      );
    }
  }, {
    key: 'getEditor',
    value: function getEditor() {
      return this.refs['editor'].getModel();
    }
  }, {
    key: '_scrollToRow',
    value: function _scrollToRow(row) {
      // TODO: Don't scroll to a center - scroll to top of buffer.
      this.getEditor().scrollToBufferPosition([row, 0], { center: true });
    }
  }]);

  return CodePreviewView;
})((_nuclideUiLibObservingComponent2 || _nuclideUiLibObservingComponent()).ObservingComponent);

exports.CodePreviewView = CodePreviewView;