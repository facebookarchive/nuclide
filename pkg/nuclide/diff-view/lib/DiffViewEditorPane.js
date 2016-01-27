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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _atom = require('atom');

var _commons = require('../../commons');

var _reactForAtom = require('react-for-atom');

var _DiffViewEditor = require('./DiffViewEditor');

var _DiffViewEditor2 = _interopRequireDefault(_DiffViewEditor);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var CHANGE_DEBOUNCE_DELAY_MS = 100;

/* eslint-disable react/prop-types */

var DiffViewEditorPane = (function (_React$Component) {
  _inherits(DiffViewEditorPane, _React$Component);

  function DiffViewEditorPane(props) {
    _classCallCheck(this, DiffViewEditorPane);

    _get(Object.getPrototypeOf(DiffViewEditorPane.prototype), 'constructor', this).call(this, props);
    this.state = {
      textContent: this.props.initialTextContent
    };
    this._isMounted = false;
    this._subscriptions = new _atom.CompositeDisposable();
  }

  _createClass(DiffViewEditorPane, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this = this;

      this._isMounted = true;
      var diffViewEditor = this._diffViewEditor = new _DiffViewEditor2['default'](this.getEditorDomElement());
      var textEditor = this.getEditorModel();
      var debouncedOnChange = (0, _commons.debounce)(function () {
        var textContent = textEditor.getText();
        _this.setState({ textContent: textContent });
        if (_this.props.onChange) {
          _this.props.onChange(textContent);
        }
      }, CHANGE_DEBOUNCE_DELAY_MS, false);
      if (this.props.readOnly) {
        diffViewEditor.setReadOnly();
      }
      this._subscriptions.add(textEditor.onDidChange(debouncedOnChange));
      /*
       * Those should have been synced automatically, but an implementation limitation of creating
       * a <atom-text-editor> element assumes default settings for those.
       * Filed: https://github.com/atom/atom/issues/10506
       */
      this._subscriptions.add(atom.config.observe('editor.tabLength', function (tabLength) {
        textEditor.setTabLength(tabLength);
      }));
      this._subscriptions.add(atom.config.observe('editor.softTabs', function (softTabs) {
        textEditor.setSoftTabs(softTabs);
      }));
      this._updateDiffView(this.props, this.state);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      if (this._subscriptions) {
        this._subscriptions.dispose();
      }
      if (this._diffViewEditor) {
        var textEditor = this.getEditorModel();
        textEditor.destroy();
        this._diffViewEditor = null;
      }
      this._isMounted = false;
    }
  }, {
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps, nextState) {
      return false;
    }
  }, {
    key: 'render',
    value: function render() {
      return _reactForAtom.React.createElement('atom-text-editor', { ref: 'editor', style: { height: '100%', overflow: 'hidden' } });
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(newProps) {
      var newState = this.state;
      if (newProps.initialTextContent !== this.state.textContent) {
        newState = { textContent: newProps.initialTextContent };
        this.setState(newState);
        this._setTextContent(newProps.filePath, newState.textContent, false /*clearHistory*/);
      }
      this._updateDiffView(newProps, newState);
    }
  }, {
    key: '_updateDiffView',
    value: function _updateDiffView(newProps, newState) {
      var oldProps = this.props;
      if (oldProps.filePath !== newProps.filePath) {
        // Loading a new file should clear the undo history.
        this._setTextContent(newProps.filePath, newState.textContent, true /*clearHistory*/);
      }
      if (oldProps.highlightedLines !== newProps.highlightedLines) {
        this._setHighlightedLines(newProps.highlightedLines);
      }
      if (oldProps.offsets !== newProps.offsets) {
        this._setOffsets(newProps.offsets);
      }
      if (oldProps.inlineElements !== newProps.inlineElements) {
        this._renderComponentsInline(newProps.inlineElements);
      }
    }
  }, {
    key: '_setTextContent',
    value: function _setTextContent(filePath, text, clearHistory) {
      (0, _assert2['default'])(this._diffViewEditor);
      this._diffViewEditor.setFileContents(filePath, text, clearHistory);
    }
  }, {
    key: '_setHighlightedLines',
    value: function _setHighlightedLines(highlightedLines) {
      (0, _assert2['default'])(this._diffViewEditor);
      this._diffViewEditor.setHighlightedLines(highlightedLines.added, highlightedLines.removed);
    }
  }, {
    key: '_setOffsets',
    value: function _setOffsets(offsets) {
      (0, _assert2['default'])(this._diffViewEditor);
      this._diffViewEditor.setOffsets(offsets);
    }
  }, {
    key: '_renderComponentsInline',
    value: _asyncToGenerator(function* (elements) {
      var _this2 = this;

      var diffViewEditor = this._diffViewEditor;
      (0, _assert2['default'])(diffViewEditor);
      var components = yield diffViewEditor.renderInlineComponents(elements);
      if (!this._isMounted) {
        return;
      }

      diffViewEditor.attachInlineComponents(components);
      var offsetsFromComponents = new Map();

      // TODO(gendron):
      // The React components aren't actually rendered in the DOM until the
      // associated decorations are attached to the TextEditor.
      // (see DiffViewEditor.attachInlineComponents)
      // There's no easy way to listen for this event, so just wait 0.5s per component.
      setTimeout(function () {
        if (!_this2._isMounted) {
          return;
        }
        var editorWidth = _this2.getEditorDomElement().clientWidth;
        components.forEach(function (element) {
          var domNode = _reactForAtom.React.findDOMNode(element.component);
          // get the height of the component after it has been rendered in the DOM
          var componentHeight = domNode.clientHeight;
          var lineHeight = diffViewEditor.getLineHeightInPixels();

          // TODO(gendron):
          // Set the width of the overlay so that it won't resize when we
          // type comment replies into the text editor.
          domNode.style.width = editorWidth - 70 + 'px';

          // calculate the number of lines we need to insert in the buffer to make room
          // for the component to be displayed
          var offset = Math.ceil(componentHeight / lineHeight);
          var offsetRow = element.bufferRow;
          offsetsFromComponents.set(offsetRow, offset);

          // PhabricatorCommentsList is rendered with visibility: hidden.
          domNode.style.visibility = 'visible';
        });
        _this2.props.handleNewOffsets(offsetsFromComponents);
      }, components.length * 500);
    })
  }, {
    key: 'getEditorModel',
    value: function getEditorModel() {
      (0, _assert2['default'])(this._diffViewEditor);
      return this._diffViewEditor.getModel();
    }
  }, {
    key: 'getEditorDomElement',
    value: function getEditorDomElement() {
      return _reactForAtom.React.findDOMNode(this.refs['editor']);
    }
  }]);

  return DiffViewEditorPane;
})(_reactForAtom.React.Component);

exports['default'] = DiffViewEditorPane;
module.exports = exports['default'];

// TODO(most): move async code out of the view and deprecate the usage of `_isMounted`.
// All view changes should be pushed from the model/store through subscriptions.
//# sourceMappingURL=data:application/json;base64,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QUFRLENBQUMsQ0FBQyxDQUFDO0tBQy9DOzs7U0F4S2tCLGtCQUFrQjtHQUFTLG9CQUFNLFNBQVM7O3FCQUExQyxrQkFBa0IiLCJmaWxlIjoiRGlmZlZpZXdFZGl0b3JQYW5lLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge051Y2xpZGVVcml9IGZyb20gJy4uLy4uL3JlbW90ZS11cmknO1xuaW1wb3J0IHR5cGUge0hpZ2hsaWdodGVkTGluZXMsIE9mZnNldE1hcCwgSW5saW5lQ29tcG9uZW50fSBmcm9tICcuL3R5cGVzJztcblxuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCB7ZGVib3VuY2V9IGZyb20gJy4uLy4uL2NvbW1vbnMnO1xuaW1wb3J0IHtSZWFjdH0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuaW1wb3J0IERpZmZWaWV3RWRpdG9yIGZyb20gJy4vRGlmZlZpZXdFZGl0b3InO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuXG5jb25zdCBDSEFOR0VfREVCT1VOQ0VfREVMQVlfTVMgPSAxMDA7XG5cbnR5cGUgUHJvcHMgPSB7XG4gIGZpbGVQYXRoOiBOdWNsaWRlVXJpLFxuICBvZmZzZXRzOiBPZmZzZXRNYXAsXG4gIGhpZ2hsaWdodGVkTGluZXM6IHtcbiAgICBhZGRlZDogQXJyYXk8bnVtYmVyPjtcbiAgICByZW1vdmVkOiBBcnJheTxudW1iZXI+O1xuICB9LFxuICBpbml0aWFsVGV4dENvbnRlbnQ6IHN0cmluZztcbiAgaW5saW5lRWxlbWVudHM6IEFycmF5PElubGluZUNvbXBvbmVudD47XG4gIGhhbmRsZU5ld09mZnNldHM6IChuZXdPZmZzZXRzOiBPZmZzZXRNYXApID0+IGFueSxcbiAgcmVhZE9ubHk6IGJvb2xlYW4sXG4gIG9uQ2hhbmdlOiAobmV3Q29udGVudHM6IHN0cmluZykgPT4gYW55LFxufTtcblxudHlwZSBTdGF0ZSA9IHtcbiAgdGV4dENvbnRlbnQ6IHN0cmluZztcbn07XG5cbi8qIGVzbGludC1kaXNhYmxlIHJlYWN0L3Byb3AtdHlwZXMgKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERpZmZWaWV3RWRpdG9yUGFuZSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHByb3BzOiBQcm9wcztcbiAgc3RhdGU6IFN0YXRlO1xuXG4gIF9kaWZmVmlld0VkaXRvcjogP0RpZmZWaWV3RWRpdG9yO1xuICBfc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgLy8gVE9ETyhtb3N0KTogbW92ZSBhc3luYyBjb2RlIG91dCBvZiB0aGUgdmlldyBhbmQgZGVwcmVjYXRlIHRoZSB1c2FnZSBvZiBgX2lzTW91bnRlZGAuXG4gIC8vIEFsbCB2aWV3IGNoYW5nZXMgc2hvdWxkIGJlIHB1c2hlZCBmcm9tIHRoZSBtb2RlbC9zdG9yZSB0aHJvdWdoIHN1YnNjcmlwdGlvbnMuXG4gIF9pc01vdW50ZWQ6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IFByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICB0ZXh0Q29udGVudDogdGhpcy5wcm9wcy5pbml0aWFsVGV4dENvbnRlbnQsXG4gICAgfTtcbiAgICB0aGlzLl9pc01vdW50ZWQgPSBmYWxzZTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCk6IHZvaWQge1xuICAgIHRoaXMuX2lzTW91bnRlZCA9IHRydWU7XG4gICAgY29uc3QgZGlmZlZpZXdFZGl0b3IgPSB0aGlzLl9kaWZmVmlld0VkaXRvciA9IG5ldyBEaWZmVmlld0VkaXRvcih0aGlzLmdldEVkaXRvckRvbUVsZW1lbnQoKSk7XG4gICAgY29uc3QgdGV4dEVkaXRvciA9IHRoaXMuZ2V0RWRpdG9yTW9kZWwoKTtcbiAgICBjb25zdCBkZWJvdW5jZWRPbkNoYW5nZSA9IGRlYm91bmNlKFxuICAgICAgKCkgPT4ge1xuICAgICAgICBjb25zdCB0ZXh0Q29udGVudCA9IHRleHRFZGl0b3IuZ2V0VGV4dCgpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHt0ZXh0Q29udGVudH0pO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5vbkNoYW5nZSkge1xuICAgICAgICAgIHRoaXMucHJvcHMub25DaGFuZ2UodGV4dENvbnRlbnQpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgQ0hBTkdFX0RFQk9VTkNFX0RFTEFZX01TLFxuICAgICAgZmFsc2UsXG4gICAgKTtcbiAgICBpZiAodGhpcy5wcm9wcy5yZWFkT25seSkge1xuICAgICAgZGlmZlZpZXdFZGl0b3Iuc2V0UmVhZE9ubHkoKTtcbiAgICB9XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQodGV4dEVkaXRvci5vbkRpZENoYW5nZShkZWJvdW5jZWRPbkNoYW5nZSkpO1xuICAgIC8qXG4gICAgICogVGhvc2Ugc2hvdWxkIGhhdmUgYmVlbiBzeW5jZWQgYXV0b21hdGljYWxseSwgYnV0IGFuIGltcGxlbWVudGF0aW9uIGxpbWl0YXRpb24gb2YgY3JlYXRpbmdcbiAgICAgKiBhIDxhdG9tLXRleHQtZWRpdG9yPiBlbGVtZW50IGFzc3VtZXMgZGVmYXVsdCBzZXR0aW5ncyBmb3IgdGhvc2UuXG4gICAgICogRmlsZWQ6IGh0dHBzOi8vZ2l0aHViLmNvbS9hdG9tL2F0b20vaXNzdWVzLzEwNTA2XG4gICAgICovXG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZSgnZWRpdG9yLnRhYkxlbmd0aCcsIHRhYkxlbmd0aCA9PiB7XG4gICAgICB0ZXh0RWRpdG9yLnNldFRhYkxlbmd0aCh0YWJMZW5ndGgpO1xuICAgIH0pKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdlZGl0b3Iuc29mdFRhYnMnLCBzb2Z0VGFicyA9PiB7XG4gICAgICB0ZXh0RWRpdG9yLnNldFNvZnRUYWJzKHNvZnRUYWJzKTtcbiAgICB9KSk7XG4gICAgdGhpcy5fdXBkYXRlRGlmZlZpZXcodGhpcy5wcm9wcywgdGhpcy5zdGF0ZSk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fc3Vic2NyaXB0aW9ucykge1xuICAgICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLl9kaWZmVmlld0VkaXRvcikge1xuICAgICAgY29uc3QgdGV4dEVkaXRvciA9IHRoaXMuZ2V0RWRpdG9yTW9kZWwoKTtcbiAgICAgIHRleHRFZGl0b3IuZGVzdHJveSgpO1xuICAgICAgdGhpcy5fZGlmZlZpZXdFZGl0b3IgPSBudWxsO1xuICAgIH1cbiAgICB0aGlzLl9pc01vdW50ZWQgPSBmYWxzZTtcbiAgfVxuXG4gIHNob3VsZENvbXBvbmVudFVwZGF0ZShuZXh0UHJvcHM6IE9iamVjdCwgbmV4dFN0YXRlOiBPYmplY3QpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICByZXR1cm4gKFxuICAgICAgPGF0b20tdGV4dC1lZGl0b3IgcmVmPVwiZWRpdG9yXCIgc3R5bGU9e3toZWlnaHQ6ICcxMDAlJywgb3ZlcmZsb3c6ICdoaWRkZW4nfX0gLz5cbiAgICApO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXdQcm9wczogT2JqZWN0KTogdm9pZCB7XG4gICAgbGV0IG5ld1N0YXRlID0gdGhpcy5zdGF0ZTtcbiAgICBpZiAobmV3UHJvcHMuaW5pdGlhbFRleHRDb250ZW50ICE9PSB0aGlzLnN0YXRlLnRleHRDb250ZW50KSB7XG4gICAgICBuZXdTdGF0ZSA9IHt0ZXh0Q29udGVudDogbmV3UHJvcHMuaW5pdGlhbFRleHRDb250ZW50fTtcbiAgICAgIHRoaXMuc2V0U3RhdGUobmV3U3RhdGUpO1xuICAgICAgdGhpcy5fc2V0VGV4dENvbnRlbnQobmV3UHJvcHMuZmlsZVBhdGgsIG5ld1N0YXRlLnRleHRDb250ZW50LCBmYWxzZSAvKmNsZWFySGlzdG9yeSovKTtcbiAgICB9XG4gICAgdGhpcy5fdXBkYXRlRGlmZlZpZXcobmV3UHJvcHMsIG5ld1N0YXRlKTtcbiAgfVxuXG4gIF91cGRhdGVEaWZmVmlldyhuZXdQcm9wczogT2JqZWN0LCBuZXdTdGF0ZTogT2JqZWN0KTogdm9pZCB7XG4gICAgY29uc3Qgb2xkUHJvcHMgPSB0aGlzLnByb3BzO1xuICAgIGlmIChvbGRQcm9wcy5maWxlUGF0aCAhPT0gbmV3UHJvcHMuZmlsZVBhdGgpIHtcbiAgICAgIC8vIExvYWRpbmcgYSBuZXcgZmlsZSBzaG91bGQgY2xlYXIgdGhlIHVuZG8gaGlzdG9yeS5cbiAgICAgIHRoaXMuX3NldFRleHRDb250ZW50KG5ld1Byb3BzLmZpbGVQYXRoLCBuZXdTdGF0ZS50ZXh0Q29udGVudCwgdHJ1ZSAvKmNsZWFySGlzdG9yeSovKTtcbiAgICB9XG4gICAgaWYgKG9sZFByb3BzLmhpZ2hsaWdodGVkTGluZXMgIT09IG5ld1Byb3BzLmhpZ2hsaWdodGVkTGluZXMpIHtcbiAgICAgIHRoaXMuX3NldEhpZ2hsaWdodGVkTGluZXMobmV3UHJvcHMuaGlnaGxpZ2h0ZWRMaW5lcyk7XG4gICAgfVxuICAgIGlmIChvbGRQcm9wcy5vZmZzZXRzICE9PSBuZXdQcm9wcy5vZmZzZXRzKSB7XG4gICAgICB0aGlzLl9zZXRPZmZzZXRzKG5ld1Byb3BzLm9mZnNldHMpO1xuICAgIH1cbiAgICBpZiAob2xkUHJvcHMuaW5saW5lRWxlbWVudHMgIT09IG5ld1Byb3BzLmlubGluZUVsZW1lbnRzKSB7XG4gICAgICB0aGlzLl9yZW5kZXJDb21wb25lbnRzSW5saW5lKG5ld1Byb3BzLmlubGluZUVsZW1lbnRzKTtcbiAgICB9XG4gIH1cblxuICBfc2V0VGV4dENvbnRlbnQoZmlsZVBhdGg6IHN0cmluZywgdGV4dDogc3RyaW5nLCBjbGVhckhpc3Rvcnk6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICBpbnZhcmlhbnQodGhpcy5fZGlmZlZpZXdFZGl0b3IpO1xuICAgIHRoaXMuX2RpZmZWaWV3RWRpdG9yLnNldEZpbGVDb250ZW50cyhmaWxlUGF0aCwgdGV4dCwgY2xlYXJIaXN0b3J5KTtcbiAgfVxuXG4gIF9zZXRIaWdobGlnaHRlZExpbmVzKGhpZ2hsaWdodGVkTGluZXM6IEhpZ2hsaWdodGVkTGluZXMpOiB2b2lkIHtcbiAgICBpbnZhcmlhbnQodGhpcy5fZGlmZlZpZXdFZGl0b3IpO1xuICAgIHRoaXMuX2RpZmZWaWV3RWRpdG9yLnNldEhpZ2hsaWdodGVkTGluZXMoaGlnaGxpZ2h0ZWRMaW5lcy5hZGRlZCwgaGlnaGxpZ2h0ZWRMaW5lcy5yZW1vdmVkKTtcbiAgfVxuXG4gIF9zZXRPZmZzZXRzKG9mZnNldHM6IE9mZnNldE1hcCk6IHZvaWQge1xuICAgIGludmFyaWFudCh0aGlzLl9kaWZmVmlld0VkaXRvcik7XG4gICAgdGhpcy5fZGlmZlZpZXdFZGl0b3Iuc2V0T2Zmc2V0cyhvZmZzZXRzKTtcbiAgfVxuXG4gIGFzeW5jIF9yZW5kZXJDb21wb25lbnRzSW5saW5lKGVsZW1lbnRzOiBBcnJheTxPYmplY3Q+KTogUHJvbWlzZSB7XG4gICAgY29uc3QgZGlmZlZpZXdFZGl0b3IgPSB0aGlzLl9kaWZmVmlld0VkaXRvcjtcbiAgICBpbnZhcmlhbnQoZGlmZlZpZXdFZGl0b3IpO1xuICAgIGNvbnN0IGNvbXBvbmVudHMgPSBhd2FpdCBkaWZmVmlld0VkaXRvci5yZW5kZXJJbmxpbmVDb21wb25lbnRzKGVsZW1lbnRzKTtcbiAgICBpZiAoIXRoaXMuX2lzTW91bnRlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGRpZmZWaWV3RWRpdG9yLmF0dGFjaElubGluZUNvbXBvbmVudHMoY29tcG9uZW50cyk7XG4gICAgY29uc3Qgb2Zmc2V0c0Zyb21Db21wb25lbnRzID0gbmV3IE1hcCgpO1xuXG4gICAgLy8gVE9ETyhnZW5kcm9uKTpcbiAgICAvLyBUaGUgUmVhY3QgY29tcG9uZW50cyBhcmVuJ3QgYWN0dWFsbHkgcmVuZGVyZWQgaW4gdGhlIERPTSB1bnRpbCB0aGVcbiAgICAvLyBhc3NvY2lhdGVkIGRlY29yYXRpb25zIGFyZSBhdHRhY2hlZCB0byB0aGUgVGV4dEVkaXRvci5cbiAgICAvLyAoc2VlIERpZmZWaWV3RWRpdG9yLmF0dGFjaElubGluZUNvbXBvbmVudHMpXG4gICAgLy8gVGhlcmUncyBubyBlYXN5IHdheSB0byBsaXN0ZW4gZm9yIHRoaXMgZXZlbnQsIHNvIGp1c3Qgd2FpdCAwLjVzIHBlciBjb21wb25lbnQuXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBpZiAoIXRoaXMuX2lzTW91bnRlZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCBlZGl0b3JXaWR0aCA9IHRoaXMuZ2V0RWRpdG9yRG9tRWxlbWVudCgpLmNsaWVudFdpZHRoO1xuICAgICAgY29tcG9uZW50cy5mb3JFYWNoKGVsZW1lbnQgPT4ge1xuICAgICAgICBjb25zdCBkb21Ob2RlID0gUmVhY3QuZmluZERPTU5vZGUoZWxlbWVudC5jb21wb25lbnQpO1xuICAgICAgICAvLyBnZXQgdGhlIGhlaWdodCBvZiB0aGUgY29tcG9uZW50IGFmdGVyIGl0IGhhcyBiZWVuIHJlbmRlcmVkIGluIHRoZSBET01cbiAgICAgICAgY29uc3QgY29tcG9uZW50SGVpZ2h0ID0gZG9tTm9kZS5jbGllbnRIZWlnaHQ7XG4gICAgICAgIGNvbnN0IGxpbmVIZWlnaHQgPSBkaWZmVmlld0VkaXRvci5nZXRMaW5lSGVpZ2h0SW5QaXhlbHMoKTtcblxuICAgICAgICAvLyBUT0RPKGdlbmRyb24pOlxuICAgICAgICAvLyBTZXQgdGhlIHdpZHRoIG9mIHRoZSBvdmVybGF5IHNvIHRoYXQgaXQgd29uJ3QgcmVzaXplIHdoZW4gd2VcbiAgICAgICAgLy8gdHlwZSBjb21tZW50IHJlcGxpZXMgaW50byB0aGUgdGV4dCBlZGl0b3IuXG4gICAgICAgIGRvbU5vZGUuc3R5bGUud2lkdGggPSAoZWRpdG9yV2lkdGggLSA3MCkgKyAncHgnO1xuXG4gICAgICAgIC8vIGNhbGN1bGF0ZSB0aGUgbnVtYmVyIG9mIGxpbmVzIHdlIG5lZWQgdG8gaW5zZXJ0IGluIHRoZSBidWZmZXIgdG8gbWFrZSByb29tXG4gICAgICAgIC8vIGZvciB0aGUgY29tcG9uZW50IHRvIGJlIGRpc3BsYXllZFxuICAgICAgICBjb25zdCBvZmZzZXQgPSBNYXRoLmNlaWwoY29tcG9uZW50SGVpZ2h0IC8gbGluZUhlaWdodCk7XG4gICAgICAgIGNvbnN0IG9mZnNldFJvdyA9IGVsZW1lbnQuYnVmZmVyUm93O1xuICAgICAgICBvZmZzZXRzRnJvbUNvbXBvbmVudHMuc2V0KG9mZnNldFJvdywgb2Zmc2V0KTtcblxuICAgICAgICAvLyBQaGFicmljYXRvckNvbW1lbnRzTGlzdCBpcyByZW5kZXJlZCB3aXRoIHZpc2liaWxpdHk6IGhpZGRlbi5cbiAgICAgICAgZG9tTm9kZS5zdHlsZS52aXNpYmlsaXR5ID0gJ3Zpc2libGUnO1xuICAgICAgfSk7XG4gICAgICB0aGlzLnByb3BzLmhhbmRsZU5ld09mZnNldHMob2Zmc2V0c0Zyb21Db21wb25lbnRzKTtcbiAgICB9LCBjb21wb25lbnRzLmxlbmd0aCAqIDUwMCk7XG4gIH1cblxuICBnZXRFZGl0b3JNb2RlbCgpOiBhdG9tJFRleHRFZGl0b3Ige1xuICAgIGludmFyaWFudCh0aGlzLl9kaWZmVmlld0VkaXRvcik7XG4gICAgcmV0dXJuIHRoaXMuX2RpZmZWaWV3RWRpdG9yLmdldE1vZGVsKCk7XG4gIH1cblxuICBnZXRFZGl0b3JEb21FbGVtZW50KCk6IGF0b20kVGV4dEVkaXRvckVsZW1lbnQge1xuICAgIHJldHVybiBSZWFjdC5maW5kRE9NTm9kZSh0aGlzLnJlZnNbJ2VkaXRvciddKTtcbiAgfVxufVxuIl19