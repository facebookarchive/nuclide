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

var _nuclideCommons = require('../../nuclide-commons');

var _reactForAtom = require('react-for-atom');

var _DiffViewEditor = require('./DiffViewEditor');

var _DiffViewEditor2 = _interopRequireDefault(_DiffViewEditor);

var _nuclideUiAtomTextEditor = require('../../nuclide-ui-atom-text-editor');

var _nuclideUiAtomTextEditor2 = _interopRequireDefault(_nuclideUiAtomTextEditor);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var CHANGE_DEBOUNCE_DELAY_MS = 5;

var DiffViewEditorPane = (function (_React$Component) {
  _inherits(DiffViewEditorPane, _React$Component);

  function DiffViewEditorPane(props) {
    _classCallCheck(this, DiffViewEditorPane);

    _get(Object.getPrototypeOf(DiffViewEditorPane.prototype), 'constructor', this).call(this, props);
    this._subscriptions = new _atom.CompositeDisposable();
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

      var editorSubscriptions = this._editorSubscriptions = new _atom.CompositeDisposable();
      this._subscriptions.add(editorSubscriptions);

      this._diffViewEditor = new _DiffViewEditor2['default'](this.getEditorDomElement());
      var textEditor = this.getEditorModel();
      var textBuffer = textEditor.getBuffer();

      var debouncedOnChange = (0, _nuclideCommons.debounce)(function () {
        if (!_this._isMounted || textBuffer !== _this.props.textBuffer) {
          return;
        }
        var textContent = textBuffer.getText();
        if (textContent === _this.props.initialTextContent) {
          return;
        }
        if (_this.props.onChange) {
          _this.props.onChange(textContent);
        }
      }, CHANGE_DEBOUNCE_DELAY_MS, false);
      editorSubscriptions.add(textBuffer.onDidChange(debouncedOnChange));
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

      if (this.props.onDidUpdateTextEditorElement) {
        this.props.onDidUpdateTextEditorElement();
      }
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this._subscriptions.dispose();
      if (this._diffViewEditor != null) {
        var textEditor = this.getEditorModel();
        textEditor.destroy();
        this._diffViewEditor = null;
      }
      this._isMounted = false;
    }
  }, {
    key: 'render',
    value: function render() {
      return _reactForAtom.React.createElement(
        'div',
        { className: 'nuclide-diff-editor-container' },
        _reactForAtom.React.createElement(
          'div',
          { className: 'nuclide-diff-editor-wrapper' },
          _reactForAtom.React.createElement(_nuclideUiAtomTextEditor2['default'], {
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
      if (diffEditorUpdated || oldProps.initialTextContent !== this.props.initialTextContent) {
        this._setTextContent(newProps.filePath, newProps.initialTextContent);
      }
      if (diffEditorUpdated || oldProps.highlightedLines !== newProps.highlightedLines) {
        this._setHighlightedLines(newProps.highlightedLines);
      }
      if (diffEditorUpdated || oldProps.offsets !== newProps.offsets) {
        this._setOffsets(newProps.offsets);
      }
      if (oldProps.inlineElements !== newProps.inlineElements) {
        this._renderComponentsInline(newProps.inlineElements);
      }
    }
  }, {
    key: 'scrollToScreenLine',
    value: function scrollToScreenLine(screenLine) {
      (0, _assert2['default'])(this._diffViewEditor, 'diffViewEditor has not been setup yet.');
      this._diffViewEditor.scrollToScreenLine(screenLine);
    }
  }, {
    key: '_setTextContent',
    value: function _setTextContent(filePath, text) {
      (0, _assert2['default'])(this._diffViewEditor);
      this._diffViewEditor.setFileContents(filePath, text);
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
      if (!this._isMounted || elements.length === 0) {
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
          var domNode = _reactForAtom.ReactDOM.findDOMNode(element.component);
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
      return this.refs['editor'].getModel();
    }
  }, {
    key: 'getEditorDomElement',
    value: function getEditorDomElement() {
      return this.refs['editor'].getElement();
    }
  }]);

  return DiffViewEditorPane;
})(_reactForAtom.React.Component);

exports['default'] = DiffViewEditorPane;
module.exports = exports['default'];

// TODO(most): move async code out of the view and deprecate the usage of `_isMounted`.
// All view changes should be pushed from the model/store through subscriptions.
//# sourceMappingURL=data:application/json;base64,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R0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDO0FBQ3BDLCtCQUFxQixDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7OztBQUc3QyxpQkFBTyxDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDO1NBQ3RDLENBQUMsQ0FBQztBQUNILGVBQUssS0FBSyxDQUFDLGdCQUFnQixDQUFDLHFCQUFxQixDQUFDLENBQUM7T0FDcEQsRUFBRSxVQUFVLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQyxDQUFDO0tBQzdCOzs7V0FFYSwwQkFBb0I7QUFDaEMsYUFBTyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO0tBQ3ZDOzs7V0FFa0IsK0JBQTJCO0FBQzVDLGFBQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQztLQUN6Qzs7O1NBN0xrQixrQkFBa0I7R0FBUyxvQkFBTSxTQUFTOztxQkFBMUMsa0JBQWtCIiwiZmlsZSI6IkRpZmZWaWV3RWRpdG9yUGFuZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS11cmknO1xuaW1wb3J0IHR5cGUge0hpZ2hsaWdodGVkTGluZXMsIE9mZnNldE1hcCwgSW5saW5lQ29tcG9uZW50fSBmcm9tICcuL3R5cGVzJztcblxuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCB7ZGVib3VuY2V9IGZyb20gJy4uLy4uL251Y2xpZGUtY29tbW9ucyc7XG5pbXBvcnQge1xuICBSZWFjdCxcbiAgUmVhY3RET00sXG59IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcbmltcG9ydCBEaWZmVmlld0VkaXRvciBmcm9tICcuL0RpZmZWaWV3RWRpdG9yJztcbmltcG9ydCBBdG9tVGV4dEVkaXRvciBmcm9tICcuLi8uLi9udWNsaWRlLXVpLWF0b20tdGV4dC1lZGl0b3InO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuXG5jb25zdCBDSEFOR0VfREVCT1VOQ0VfREVMQVlfTVMgPSA1O1xuXG50eXBlIFByb3BzID0ge1xuICBmaWxlUGF0aDogTnVjbGlkZVVyaTtcbiAgdGV4dEJ1ZmZlcjogYXRvbSRUZXh0QnVmZmVyO1xuICBvZmZzZXRzOiBPZmZzZXRNYXA7XG4gIGhpZ2hsaWdodGVkTGluZXM6IHtcbiAgICBhZGRlZDogQXJyYXk8bnVtYmVyPjtcbiAgICByZW1vdmVkOiBBcnJheTxudW1iZXI+O1xuICB9O1xuICBpbml0aWFsVGV4dENvbnRlbnQ6IHN0cmluZztcbiAgc2F2ZWRDb250ZW50czogc3RyaW5nO1xuICBpbmxpbmVFbGVtZW50czogQXJyYXk8SW5saW5lQ29tcG9uZW50PjtcbiAgaGFuZGxlTmV3T2Zmc2V0czogKG5ld09mZnNldHM6IE9mZnNldE1hcCkgPT4gYW55O1xuICByZWFkT25seTogYm9vbGVhbjtcbiAgb25DaGFuZ2U6IChuZXdDb250ZW50czogc3RyaW5nKSA9PiBhbnk7XG4gIG9uRGlkVXBkYXRlVGV4dEVkaXRvckVsZW1lbnQ6ICgpID0+IG1peGVkO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGlmZlZpZXdFZGl0b3JQYW5lIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgcHJvcHM6IFByb3BzO1xuXG4gIF9kaWZmVmlld0VkaXRvcjogP0RpZmZWaWV3RWRpdG9yO1xuICBfc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX2VkaXRvclN1YnNjcmlwdGlvbnM6ID9Db21wb3NpdGVEaXNwb3NhYmxlO1xuICAvLyBUT0RPKG1vc3QpOiBtb3ZlIGFzeW5jIGNvZGUgb3V0IG9mIHRoZSB2aWV3IGFuZCBkZXByZWNhdGUgdGhlIHVzYWdlIG9mIGBfaXNNb3VudGVkYC5cbiAgLy8gQWxsIHZpZXcgY2hhbmdlcyBzaG91bGQgYmUgcHVzaGVkIGZyb20gdGhlIG1vZGVsL3N0b3JlIHRocm91Z2ggc3Vic2NyaXB0aW9ucy5cbiAgX2lzTW91bnRlZDogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogUHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5faXNNb3VudGVkID0gZmFsc2U7XG4gIH1cblxuICBjb21wb25lbnREaWRNb3VudCgpOiB2b2lkIHtcbiAgICB0aGlzLl9pc01vdW50ZWQgPSB0cnVlO1xuICAgIHRoaXMuX3NldHVwRGlmZkVkaXRvcigpO1xuICB9XG5cbiAgX3NldHVwRGlmZkVkaXRvcigpOiB2b2lkIHtcbiAgICBjb25zdCBlZGl0b3JTdWJzY3JpcHRpb25zID0gdGhpcy5fZWRpdG9yU3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoZWRpdG9yU3Vic2NyaXB0aW9ucyk7XG5cbiAgICB0aGlzLl9kaWZmVmlld0VkaXRvciA9IG5ldyBEaWZmVmlld0VkaXRvcih0aGlzLmdldEVkaXRvckRvbUVsZW1lbnQoKSk7XG4gICAgY29uc3QgdGV4dEVkaXRvciA9IHRoaXMuZ2V0RWRpdG9yTW9kZWwoKTtcbiAgICBjb25zdCB0ZXh0QnVmZmVyID0gdGV4dEVkaXRvci5nZXRCdWZmZXIoKTtcblxuICAgIGNvbnN0IGRlYm91bmNlZE9uQ2hhbmdlID0gZGVib3VuY2UoXG4gICAgICAoKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5faXNNb3VudGVkIHx8IHRleHRCdWZmZXIgIT09IHRoaXMucHJvcHMudGV4dEJ1ZmZlcikge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0ZXh0Q29udGVudCA9IHRleHRCdWZmZXIuZ2V0VGV4dCgpO1xuICAgICAgICBpZiAodGV4dENvbnRlbnQgPT09IHRoaXMucHJvcHMuaW5pdGlhbFRleHRDb250ZW50KSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnByb3BzLm9uQ2hhbmdlKSB7XG4gICAgICAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZSh0ZXh0Q29udGVudCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBDSEFOR0VfREVCT1VOQ0VfREVMQVlfTVMsXG4gICAgICBmYWxzZSxcbiAgICApO1xuICAgIGVkaXRvclN1YnNjcmlwdGlvbnMuYWRkKHRleHRCdWZmZXIub25EaWRDaGFuZ2UoZGVib3VuY2VkT25DaGFuZ2UpKTtcbiAgICAvKlxuICAgICAqIFRob3NlIHNob3VsZCBoYXZlIGJlZW4gc3luY2VkIGF1dG9tYXRpY2FsbHksIGJ1dCBhbiBpbXBsZW1lbnRhdGlvbiBsaW1pdGF0aW9uIG9mIGNyZWF0aW5nXG4gICAgICogYSA8YXRvbS10ZXh0LWVkaXRvcj4gZWxlbWVudCBhc3N1bWVzIGRlZmF1bHQgc2V0dGluZ3MgZm9yIHRob3NlLlxuICAgICAqIEZpbGVkOiBodHRwczovL2dpdGh1Yi5jb20vYXRvbS9hdG9tL2lzc3Vlcy8xMDUwNlxuICAgICAqL1xuICAgIGVkaXRvclN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoJ2VkaXRvci50YWJMZW5ndGgnLCB0YWJMZW5ndGggPT4ge1xuICAgICAgdGV4dEVkaXRvci5zZXRUYWJMZW5ndGgodGFiTGVuZ3RoKTtcbiAgICB9KSk7XG4gICAgZWRpdG9yU3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZSgnZWRpdG9yLnNvZnRUYWJzJywgc29mdFRhYnMgPT4ge1xuICAgICAgdGV4dEVkaXRvci5zZXRTb2Z0VGFicyhzb2Z0VGFicyk7XG4gICAgfSkpO1xuXG4gICAgaWYgKHRoaXMucHJvcHMub25EaWRVcGRhdGVUZXh0RWRpdG9yRWxlbWVudCkge1xuICAgICAgdGhpcy5wcm9wcy5vbkRpZFVwZGF0ZVRleHRFZGl0b3JFbGVtZW50KCk7XG4gICAgfVxuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKTogdm9pZCB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gICAgaWYgKHRoaXMuX2RpZmZWaWV3RWRpdG9yICE9IG51bGwpIHtcbiAgICAgIGNvbnN0IHRleHRFZGl0b3IgPSB0aGlzLmdldEVkaXRvck1vZGVsKCk7XG4gICAgICB0ZXh0RWRpdG9yLmRlc3Ryb3koKTtcbiAgICAgIHRoaXMuX2RpZmZWaWV3RWRpdG9yID0gbnVsbDtcbiAgICB9XG4gICAgdGhpcy5faXNNb3VudGVkID0gZmFsc2U7XG4gIH1cblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLWRpZmYtZWRpdG9yLWNvbnRhaW5lclwiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm51Y2xpZGUtZGlmZi1lZGl0b3Itd3JhcHBlclwiPlxuICAgICAgICAgIDxBdG9tVGV4dEVkaXRvclxuICAgICAgICAgICAgcmVmPVwiZWRpdG9yXCJcbiAgICAgICAgICAgIHJlYWRPbmx5PXt0aGlzLnByb3BzLnJlYWRPbmx5fVxuICAgICAgICAgICAgdGV4dEJ1ZmZlcj17dGhpcy5wcm9wcy50ZXh0QnVmZmVyfVxuICAgICAgICAgICAgc3luY1RleHRDb250ZW50cz17ZmFsc2V9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbiAgY29tcG9uZW50RGlkVXBkYXRlKHByZXZQcm9wczogUHJvcHMpOiB2b2lkIHtcbiAgICBpZiAocHJldlByb3BzLnRleHRCdWZmZXIgIT09IHRoaXMucHJvcHMudGV4dEJ1ZmZlcikge1xuICAgICAgY29uc3Qgb2xkRWRpdG9yU3Vic2NyaXB0aW9ucyA9IHRoaXMuX2VkaXRvclN1YnNjcmlwdGlvbnM7XG4gICAgICBpZiAob2xkRWRpdG9yU3Vic2NyaXB0aW9ucyAhPSBudWxsKSB7XG4gICAgICAgIG9sZEVkaXRvclN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICAgICAgICB0aGlzLl9zdWJzY3JpcHRpb25zLnJlbW92ZShvbGRFZGl0b3JTdWJzY3JpcHRpb25zKTtcbiAgICAgICAgdGhpcy5fZWRpdG9yU3Vic2NyaXB0aW9ucyA9IG51bGw7XG4gICAgICB9XG4gICAgICB0aGlzLl9zZXR1cERpZmZFZGl0b3IoKTtcbiAgICB9XG4gICAgdGhpcy5fdXBkYXRlRGlmZlZpZXcocHJldlByb3BzKTtcbiAgfVxuXG4gIF91cGRhdGVEaWZmVmlldyhvbGRQcm9wczogUHJvcHMpOiB2b2lkIHtcbiAgICBjb25zdCBuZXdQcm9wcyA9IHRoaXMucHJvcHM7XG4gICAgY29uc3QgZGlmZkVkaXRvclVwZGF0ZWQgPSBvbGRQcm9wcy50ZXh0QnVmZmVyICE9PSBuZXdQcm9wcy50ZXh0QnVmZmVyO1xuICAgIGlmIChkaWZmRWRpdG9yVXBkYXRlZCB8fCBvbGRQcm9wcy5pbml0aWFsVGV4dENvbnRlbnQgIT09IHRoaXMucHJvcHMuaW5pdGlhbFRleHRDb250ZW50KSB7XG4gICAgICB0aGlzLl9zZXRUZXh0Q29udGVudChuZXdQcm9wcy5maWxlUGF0aCwgbmV3UHJvcHMuaW5pdGlhbFRleHRDb250ZW50KTtcbiAgICB9XG4gICAgaWYgKGRpZmZFZGl0b3JVcGRhdGVkIHx8IG9sZFByb3BzLmhpZ2hsaWdodGVkTGluZXMgIT09IG5ld1Byb3BzLmhpZ2hsaWdodGVkTGluZXMpIHtcbiAgICAgIHRoaXMuX3NldEhpZ2hsaWdodGVkTGluZXMobmV3UHJvcHMuaGlnaGxpZ2h0ZWRMaW5lcyk7XG4gICAgfVxuICAgIGlmIChkaWZmRWRpdG9yVXBkYXRlZCB8fCBvbGRQcm9wcy5vZmZzZXRzICE9PSBuZXdQcm9wcy5vZmZzZXRzKSB7XG4gICAgICB0aGlzLl9zZXRPZmZzZXRzKG5ld1Byb3BzLm9mZnNldHMpO1xuICAgIH1cbiAgICBpZiAob2xkUHJvcHMuaW5saW5lRWxlbWVudHMgIT09IG5ld1Byb3BzLmlubGluZUVsZW1lbnRzKSB7XG4gICAgICB0aGlzLl9yZW5kZXJDb21wb25lbnRzSW5saW5lKG5ld1Byb3BzLmlubGluZUVsZW1lbnRzKTtcbiAgICB9XG4gIH1cblxuICBzY3JvbGxUb1NjcmVlbkxpbmUoc2NyZWVuTGluZTogbnVtYmVyKTogdm9pZCB7XG4gICAgaW52YXJpYW50KHRoaXMuX2RpZmZWaWV3RWRpdG9yLCAnZGlmZlZpZXdFZGl0b3IgaGFzIG5vdCBiZWVuIHNldHVwIHlldC4nKTtcbiAgICB0aGlzLl9kaWZmVmlld0VkaXRvci5zY3JvbGxUb1NjcmVlbkxpbmUoc2NyZWVuTGluZSk7XG4gIH1cblxuICBfc2V0VGV4dENvbnRlbnQoZmlsZVBhdGg6IHN0cmluZywgdGV4dDogc3RyaW5nKTogdm9pZCB7XG4gICAgaW52YXJpYW50KHRoaXMuX2RpZmZWaWV3RWRpdG9yKTtcbiAgICB0aGlzLl9kaWZmVmlld0VkaXRvci5zZXRGaWxlQ29udGVudHMoZmlsZVBhdGgsIHRleHQpO1xuICB9XG5cbiAgX3NldEhpZ2hsaWdodGVkTGluZXMoaGlnaGxpZ2h0ZWRMaW5lczogSGlnaGxpZ2h0ZWRMaW5lcyk6IHZvaWQge1xuICAgIGludmFyaWFudCh0aGlzLl9kaWZmVmlld0VkaXRvcik7XG4gICAgdGhpcy5fZGlmZlZpZXdFZGl0b3Iuc2V0SGlnaGxpZ2h0ZWRMaW5lcyhoaWdobGlnaHRlZExpbmVzLmFkZGVkLCBoaWdobGlnaHRlZExpbmVzLnJlbW92ZWQpO1xuICB9XG5cbiAgX3NldE9mZnNldHMob2Zmc2V0czogT2Zmc2V0TWFwKTogdm9pZCB7XG4gICAgaW52YXJpYW50KHRoaXMuX2RpZmZWaWV3RWRpdG9yKTtcbiAgICB0aGlzLl9kaWZmVmlld0VkaXRvci5zZXRPZmZzZXRzKG9mZnNldHMpO1xuICB9XG5cbiAgYXN5bmMgX3JlbmRlckNvbXBvbmVudHNJbmxpbmUoZWxlbWVudHM6IEFycmF5PE9iamVjdD4pOiBQcm9taXNlIHtcbiAgICBjb25zdCBkaWZmVmlld0VkaXRvciA9IHRoaXMuX2RpZmZWaWV3RWRpdG9yO1xuICAgIGludmFyaWFudChkaWZmVmlld0VkaXRvcik7XG4gICAgY29uc3QgY29tcG9uZW50cyA9IGF3YWl0IGRpZmZWaWV3RWRpdG9yLnJlbmRlcklubGluZUNvbXBvbmVudHMoZWxlbWVudHMpO1xuICAgIGlmICghdGhpcy5faXNNb3VudGVkIHx8IGVsZW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGRpZmZWaWV3RWRpdG9yLmF0dGFjaElubGluZUNvbXBvbmVudHMoY29tcG9uZW50cyk7XG4gICAgY29uc3Qgb2Zmc2V0c0Zyb21Db21wb25lbnRzID0gbmV3IE1hcCgpO1xuXG4gICAgLy8gVE9ETyhnZW5kcm9uKTpcbiAgICAvLyBUaGUgUmVhY3QgY29tcG9uZW50cyBhcmVuJ3QgYWN0dWFsbHkgcmVuZGVyZWQgaW4gdGhlIERPTSB1bnRpbCB0aGVcbiAgICAvLyBhc3NvY2lhdGVkIGRlY29yYXRpb25zIGFyZSBhdHRhY2hlZCB0byB0aGUgVGV4dEVkaXRvci5cbiAgICAvLyAoc2VlIERpZmZWaWV3RWRpdG9yLmF0dGFjaElubGluZUNvbXBvbmVudHMpXG4gICAgLy8gVGhlcmUncyBubyBlYXN5IHdheSB0byBsaXN0ZW4gZm9yIHRoaXMgZXZlbnQsIHNvIGp1c3Qgd2FpdCAwLjVzIHBlciBjb21wb25lbnQuXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBpZiAoIXRoaXMuX2lzTW91bnRlZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCBlZGl0b3JXaWR0aCA9IHRoaXMuZ2V0RWRpdG9yRG9tRWxlbWVudCgpLmNsaWVudFdpZHRoO1xuICAgICAgY29tcG9uZW50cy5mb3JFYWNoKGVsZW1lbnQgPT4ge1xuICAgICAgICBjb25zdCBkb21Ob2RlID0gUmVhY3RET00uZmluZERPTU5vZGUoZWxlbWVudC5jb21wb25lbnQpO1xuICAgICAgICAvLyBnZXQgdGhlIGhlaWdodCBvZiB0aGUgY29tcG9uZW50IGFmdGVyIGl0IGhhcyBiZWVuIHJlbmRlcmVkIGluIHRoZSBET01cbiAgICAgICAgY29uc3QgY29tcG9uZW50SGVpZ2h0ID0gZG9tTm9kZS5jbGllbnRIZWlnaHQ7XG4gICAgICAgIGNvbnN0IGxpbmVIZWlnaHQgPSBkaWZmVmlld0VkaXRvci5nZXRMaW5lSGVpZ2h0SW5QaXhlbHMoKTtcblxuICAgICAgICAvLyBUT0RPKGdlbmRyb24pOlxuICAgICAgICAvLyBTZXQgdGhlIHdpZHRoIG9mIHRoZSBvdmVybGF5IHNvIHRoYXQgaXQgd29uJ3QgcmVzaXplIHdoZW4gd2VcbiAgICAgICAgLy8gdHlwZSBjb21tZW50IHJlcGxpZXMgaW50byB0aGUgdGV4dCBlZGl0b3IuXG4gICAgICAgIGRvbU5vZGUuc3R5bGUud2lkdGggPSAoZWRpdG9yV2lkdGggLSA3MCkgKyAncHgnO1xuXG4gICAgICAgIC8vIGNhbGN1bGF0ZSB0aGUgbnVtYmVyIG9mIGxpbmVzIHdlIG5lZWQgdG8gaW5zZXJ0IGluIHRoZSBidWZmZXIgdG8gbWFrZSByb29tXG4gICAgICAgIC8vIGZvciB0aGUgY29tcG9uZW50IHRvIGJlIGRpc3BsYXllZFxuICAgICAgICBjb25zdCBvZmZzZXQgPSBNYXRoLmNlaWwoY29tcG9uZW50SGVpZ2h0IC8gbGluZUhlaWdodCk7XG4gICAgICAgIGNvbnN0IG9mZnNldFJvdyA9IGVsZW1lbnQuYnVmZmVyUm93O1xuICAgICAgICBvZmZzZXRzRnJvbUNvbXBvbmVudHMuc2V0KG9mZnNldFJvdywgb2Zmc2V0KTtcblxuICAgICAgICAvLyBQaGFicmljYXRvckNvbW1lbnRzTGlzdCBpcyByZW5kZXJlZCB3aXRoIHZpc2liaWxpdHk6IGhpZGRlbi5cbiAgICAgICAgZG9tTm9kZS5zdHlsZS52aXNpYmlsaXR5ID0gJ3Zpc2libGUnO1xuICAgICAgfSk7XG4gICAgICB0aGlzLnByb3BzLmhhbmRsZU5ld09mZnNldHMob2Zmc2V0c0Zyb21Db21wb25lbnRzKTtcbiAgICB9LCBjb21wb25lbnRzLmxlbmd0aCAqIDUwMCk7XG4gIH1cblxuICBnZXRFZGl0b3JNb2RlbCgpOiBhdG9tJFRleHRFZGl0b3Ige1xuICAgIHJldHVybiB0aGlzLnJlZnNbJ2VkaXRvciddLmdldE1vZGVsKCk7XG4gIH1cblxuICBnZXRFZGl0b3JEb21FbGVtZW50KCk6IGF0b20kVGV4dEVkaXRvckVsZW1lbnQge1xuICAgIHJldHVybiB0aGlzLnJlZnNbJ2VkaXRvciddLmdldEVsZW1lbnQoKTtcbiAgfVxufVxuIl19