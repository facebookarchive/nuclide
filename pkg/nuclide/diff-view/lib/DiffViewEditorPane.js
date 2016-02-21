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

var _uiAtomTextEditor = require('../../ui/atom-text-editor');

var _uiAtomTextEditor2 = _interopRequireDefault(_uiAtomTextEditor);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var CHANGE_DEBOUNCE_DELAY_MS = 5;

/* eslint-disable react/prop-types */

var DiffViewEditorPane = (function (_React$Component) {
  _inherits(DiffViewEditorPane, _React$Component);

  function DiffViewEditorPane(props) {
    _classCallCheck(this, DiffViewEditorPane);

    _get(Object.getPrototypeOf(DiffViewEditorPane.prototype), 'constructor', this).call(this, props);
    this.state = {
      textContent: this.props.initialTextContent
    };
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

      var debouncedOnChange = (0, _commons.debounce)(function () {
        if (!_this._isMounted || textEditor !== _this.getEditorModel()) {
          return;
        }
        var textContent = textEditor.getText();
        if (textContent === _this.state.textContent) {
          return;
        }
        _this.setState({ textContent: textContent });
        if (_this.props.onChange) {
          _this.props.onChange(textContent);
        }
      }, CHANGE_DEBOUNCE_DELAY_MS, false);
      editorSubscriptions.add(textEditor.onDidChange(debouncedOnChange));
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
          { className: 'panel-heading text-center nuclide-diff-editor-header' },
          this.props.headerTitle
        ),
        _reactForAtom.React.createElement(
          'div',
          { className: 'nuclide-diff-editor-wrapper' },
          _reactForAtom.React.createElement(_uiAtomTextEditor2['default'], {
            ref: 'editor',
            readOnly: this.props.readOnly,
            textBuffer: this.props.textBuffer
          })
        )
      );
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      if (this.props.initialTextContent !== nextProps.initialTextContent) {
        this.setState({ textContent: nextProps.initialTextContent });
      }
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps, prevState) {
      if (prevProps.textBuffer !== this.props.textBuffer) {
        var oldEditorSubscriptions = this._editorSubscriptions;
        if (oldEditorSubscriptions != null) {
          oldEditorSubscriptions.dispose();
          this._subscriptions.remove(oldEditorSubscriptions);
          this._editorSubscriptions = null;
        }
        this._setupDiffEditor();
      }
      this._updateDiffView(prevProps, prevState);
    }
  }, {
    key: '_updateDiffView',
    value: function _updateDiffView(oldProps, oldState) {
      var newProps = this.props;
      var newState = this.state;
      var diffEditorUpdated = oldProps.textBuffer !== newProps.textBuffer;
      // Cache latest disk contents for an accurate `isModified` functionality.
      newProps.textBuffer.cachedDiskContents = this.props.savedContents;
      if (diffEditorUpdated || oldProps.filePath !== newProps.filePath) {
        // Loading a new file should clear the undo history.
        this._setTextContent(newProps.filePath, newState.textContent, true /*clearHistory*/);
      } else if (newState.textContent !== oldState.textContent) {
          this._setTextContent(newProps.filePath, newState.textContent, false /*clearHistory*/);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRpZmZWaWV3RWRpdG9yUGFuZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7b0JBY2tDLE1BQU07O3VCQUNqQixlQUFlOzs0QkFJL0IsZ0JBQWdCOzs4QkFDSSxrQkFBa0I7Ozs7Z0NBQ2xCLDJCQUEyQjs7OztzQkFDaEMsUUFBUTs7OztBQUU5QixJQUFNLHdCQUF3QixHQUFHLENBQUMsQ0FBQzs7OztJQXlCZCxrQkFBa0I7WUFBbEIsa0JBQWtCOztBQVcxQixXQVhRLGtCQUFrQixDQVd6QixLQUFZLEVBQUU7MEJBWFAsa0JBQWtCOztBQVluQywrQkFaaUIsa0JBQWtCLDZDQVk3QixLQUFLLEVBQUU7QUFDYixRQUFJLENBQUMsS0FBSyxHQUFHO0FBQ1gsaUJBQVcsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLGtCQUFrQjtLQUMzQyxDQUFDO0FBQ0YsUUFBSSxDQUFDLGNBQWMsR0FBRywrQkFBeUIsQ0FBQztBQUNoRCxRQUFJLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQztHQUN6Qjs7ZUFsQmtCLGtCQUFrQjs7V0FvQnBCLDZCQUFTO0FBQ3hCLFVBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO0FBQ3ZCLFVBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0tBQ3pCOzs7V0FFZSw0QkFBUzs7O0FBQ3ZCLFVBQU0sbUJBQW1CLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixHQUFHLCtCQUF5QixDQUFDO0FBQ2xGLFVBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLG1CQUFtQixDQUFDLENBQUM7O0FBRTdDLFVBQUksQ0FBQyxlQUFlLEdBQUcsZ0NBQW1CLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLENBQUM7QUFDdEUsVUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDOztBQUV6QyxVQUFNLGlCQUFpQixHQUFHLHVCQUN4QixZQUFNO0FBQ0osWUFBSSxDQUFDLE1BQUssVUFBVSxJQUFJLFVB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QkFBMUMsa0JBQWtCIiwiZmlsZSI6IkRpZmZWaWV3RWRpdG9yUGFuZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9yZW1vdGUtdXJpJztcbmltcG9ydCB0eXBlIHtIaWdobGlnaHRlZExpbmVzLCBPZmZzZXRNYXAsIElubGluZUNvbXBvbmVudH0gZnJvbSAnLi90eXBlcyc7XG5cbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge2RlYm91bmNlfSBmcm9tICcuLi8uLi9jb21tb25zJztcbmltcG9ydCB7XG4gIFJlYWN0LFxuICBSZWFjdERPTSxcbn0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuaW1wb3J0IERpZmZWaWV3RWRpdG9yIGZyb20gJy4vRGlmZlZpZXdFZGl0b3InO1xuaW1wb3J0IEF0b21UZXh0RWRpdG9yIGZyb20gJy4uLy4uL3VpL2F0b20tdGV4dC1lZGl0b3InO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuXG5jb25zdCBDSEFOR0VfREVCT1VOQ0VfREVMQVlfTVMgPSA1O1xuXG50eXBlIFByb3BzID0ge1xuICBoZWFkZXJUaXRsZTogc3RyaW5nO1xuICBmaWxlUGF0aDogTnVjbGlkZVVyaTtcbiAgdGV4dEJ1ZmZlcjogYXRvbSRUZXh0QnVmZmVyO1xuICBvZmZzZXRzOiBPZmZzZXRNYXA7XG4gIGhpZ2hsaWdodGVkTGluZXM6IHtcbiAgICBhZGRlZDogQXJyYXk8bnVtYmVyPjtcbiAgICByZW1vdmVkOiBBcnJheTxudW1iZXI+O1xuICB9O1xuICBpbml0aWFsVGV4dENvbnRlbnQ6IHN0cmluZztcbiAgc2F2ZWRDb250ZW50czogc3RyaW5nO1xuICBpbmxpbmVFbGVtZW50czogQXJyYXk8SW5saW5lQ29tcG9uZW50PjtcbiAgaGFuZGxlTmV3T2Zmc2V0czogKG5ld09mZnNldHM6IE9mZnNldE1hcCkgPT4gYW55O1xuICByZWFkT25seTogYm9vbGVhbjtcbiAgb25DaGFuZ2U6IChuZXdDb250ZW50czogc3RyaW5nKSA9PiBhbnk7XG4gIG9uRGlkVXBkYXRlVGV4dEVkaXRvckVsZW1lbnQ6ICgpID0+IG1peGVkO1xufTtcblxudHlwZSBTdGF0ZSA9IHtcbiAgdGV4dENvbnRlbnQ6IHN0cmluZztcbn07XG5cbi8qIGVzbGludC1kaXNhYmxlIHJlYWN0L3Byb3AtdHlwZXMgKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERpZmZWaWV3RWRpdG9yUGFuZSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHByb3BzOiBQcm9wcztcbiAgc3RhdGU6IFN0YXRlO1xuXG4gIF9kaWZmVmlld0VkaXRvcjogP0RpZmZWaWV3RWRpdG9yO1xuICBfc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX2VkaXRvclN1YnNjcmlwdGlvbnM6ID9Db21wb3NpdGVEaXNwb3NhYmxlO1xuICAvLyBUT0RPKG1vc3QpOiBtb3ZlIGFzeW5jIGNvZGUgb3V0IG9mIHRoZSB2aWV3IGFuZCBkZXByZWNhdGUgdGhlIHVzYWdlIG9mIGBfaXNNb3VudGVkYC5cbiAgLy8gQWxsIHZpZXcgY2hhbmdlcyBzaG91bGQgYmUgcHVzaGVkIGZyb20gdGhlIG1vZGVsL3N0b3JlIHRocm91Z2ggc3Vic2NyaXB0aW9ucy5cbiAgX2lzTW91bnRlZDogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogUHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIHRleHRDb250ZW50OiB0aGlzLnByb3BzLmluaXRpYWxUZXh0Q29udGVudCxcbiAgICB9O1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHRoaXMuX2lzTW91bnRlZCA9IGZhbHNlO1xuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKTogdm9pZCB7XG4gICAgdGhpcy5faXNNb3VudGVkID0gdHJ1ZTtcbiAgICB0aGlzLl9zZXR1cERpZmZFZGl0b3IoKTtcbiAgfVxuXG4gIF9zZXR1cERpZmZFZGl0b3IoKTogdm9pZCB7XG4gICAgY29uc3QgZWRpdG9yU3Vic2NyaXB0aW9ucyA9IHRoaXMuX2VkaXRvclN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKGVkaXRvclN1YnNjcmlwdGlvbnMpO1xuXG4gICAgdGhpcy5fZGlmZlZpZXdFZGl0b3IgPSBuZXcgRGlmZlZpZXdFZGl0b3IodGhpcy5nZXRFZGl0b3JEb21FbGVtZW50KCkpO1xuICAgIGNvbnN0IHRleHRFZGl0b3IgPSB0aGlzLmdldEVkaXRvck1vZGVsKCk7XG5cbiAgICBjb25zdCBkZWJvdW5jZWRPbkNoYW5nZSA9IGRlYm91bmNlKFxuICAgICAgKCkgPT4ge1xuICAgICAgICBpZiAoIXRoaXMuX2lzTW91bnRlZCB8fCB0ZXh0RWRpdG9yICE9PSB0aGlzLmdldEVkaXRvck1vZGVsKCkpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdGV4dENvbnRlbnQgPSB0ZXh0RWRpdG9yLmdldFRleHQoKTtcbiAgICAgICAgaWYgKHRleHRDb250ZW50ID09PSB0aGlzLnN0YXRlLnRleHRDb250ZW50KSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe3RleHRDb250ZW50fSk7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLm9uQ2hhbmdlKSB7XG4gICAgICAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZSh0ZXh0Q29udGVudCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBDSEFOR0VfREVCT1VOQ0VfREVMQVlfTVMsXG4gICAgICBmYWxzZSxcbiAgICApO1xuICAgIGVkaXRvclN1YnNjcmlwdGlvbnMuYWRkKHRleHRFZGl0b3Iub25EaWRDaGFuZ2UoZGVib3VuY2VkT25DaGFuZ2UpKTtcbiAgICAvKlxuICAgICAqIFRob3NlIHNob3VsZCBoYXZlIGJlZW4gc3luY2VkIGF1dG9tYXRpY2FsbHksIGJ1dCBhbiBpbXBsZW1lbnRhdGlvbiBsaW1pdGF0aW9uIG9mIGNyZWF0aW5nXG4gICAgICogYSA8YXRvbS10ZXh0LWVkaXRvcj4gZWxlbWVudCBhc3N1bWVzIGRlZmF1bHQgc2V0dGluZ3MgZm9yIHRob3NlLlxuICAgICAqIEZpbGVkOiBodHRwczovL2dpdGh1Yi5jb20vYXRvbS9hdG9tL2lzc3Vlcy8xMDUwNlxuICAgICAqL1xuICAgIGVkaXRvclN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoJ2VkaXRvci50YWJMZW5ndGgnLCB0YWJMZW5ndGggPT4ge1xuICAgICAgdGV4dEVkaXRvci5zZXRUYWJMZW5ndGgodGFiTGVuZ3RoKTtcbiAgICB9KSk7XG4gICAgZWRpdG9yU3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZSgnZWRpdG9yLnNvZnRUYWJzJywgc29mdFRhYnMgPT4ge1xuICAgICAgdGV4dEVkaXRvci5zZXRTb2Z0VGFicyhzb2Z0VGFicyk7XG4gICAgfSkpO1xuXG4gICAgaWYgKHRoaXMucHJvcHMub25EaWRVcGRhdGVUZXh0RWRpdG9yRWxlbWVudCkge1xuICAgICAgdGhpcy5wcm9wcy5vbkRpZFVwZGF0ZVRleHRFZGl0b3JFbGVtZW50KCk7XG4gICAgfVxuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKTogdm9pZCB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gICAgaWYgKHRoaXMuX2RpZmZWaWV3RWRpdG9yICE9IG51bGwpIHtcbiAgICAgIGNvbnN0IHRleHRFZGl0b3IgPSB0aGlzLmdldEVkaXRvck1vZGVsKCk7XG4gICAgICB0ZXh0RWRpdG9yLmRlc3Ryb3koKTtcbiAgICAgIHRoaXMuX2RpZmZWaWV3RWRpdG9yID0gbnVsbDtcbiAgICB9XG4gICAgdGhpcy5faXNNb3VudGVkID0gZmFsc2U7XG4gIH1cblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLWRpZmYtZWRpdG9yLWNvbnRhaW5lclwiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInBhbmVsLWhlYWRpbmcgdGV4dC1jZW50ZXIgbnVjbGlkZS1kaWZmLWVkaXRvci1oZWFkZXJcIj5cbiAgICAgICAgICB7dGhpcy5wcm9wcy5oZWFkZXJUaXRsZX1cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS1kaWZmLWVkaXRvci13cmFwcGVyXCI+XG4gICAgICAgICAgPEF0b21UZXh0RWRpdG9yXG4gICAgICAgICAgICByZWY9XCJlZGl0b3JcIlxuICAgICAgICAgICAgcmVhZE9ubHk9e3RoaXMucHJvcHMucmVhZE9ubHl9XG4gICAgICAgICAgICB0ZXh0QnVmZmVyPXt0aGlzLnByb3BzLnRleHRCdWZmZXJ9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXh0UHJvcHM6IFByb3BzKSB7XG4gICAgaWYgKHRoaXMucHJvcHMuaW5pdGlhbFRleHRDb250ZW50ICE9PSBuZXh0UHJvcHMuaW5pdGlhbFRleHRDb250ZW50KSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHt0ZXh0Q29udGVudDogbmV4dFByb3BzLmluaXRpYWxUZXh0Q29udGVudH0pO1xuICAgIH1cbiAgfVxuXG4gIGNvbXBvbmVudERpZFVwZGF0ZShwcmV2UHJvcHM6IFByb3BzLCBwcmV2U3RhdGU6IFN0YXRlKTogdm9pZCB7XG4gICAgaWYgKHByZXZQcm9wcy50ZXh0QnVmZmVyICE9PSB0aGlzLnByb3BzLnRleHRCdWZmZXIpIHtcbiAgICAgIGNvbnN0IG9sZEVkaXRvclN1YnNjcmlwdGlvbnMgPSB0aGlzLl9lZGl0b3JTdWJzY3JpcHRpb25zO1xuICAgICAgaWYgKG9sZEVkaXRvclN1YnNjcmlwdGlvbnMgIT0gbnVsbCkge1xuICAgICAgICBvbGRFZGl0b3JTdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgICAgICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5yZW1vdmUob2xkRWRpdG9yU3Vic2NyaXB0aW9ucyk7XG4gICAgICAgIHRoaXMuX2VkaXRvclN1YnNjcmlwdGlvbnMgPSBudWxsO1xuICAgICAgfVxuICAgICAgdGhpcy5fc2V0dXBEaWZmRWRpdG9yKCk7XG4gICAgfVxuICAgIHRoaXMuX3VwZGF0ZURpZmZWaWV3KHByZXZQcm9wcywgcHJldlN0YXRlKTtcbiAgfVxuXG4gIF91cGRhdGVEaWZmVmlldyhvbGRQcm9wczogUHJvcHMsIG9sZFN0YXRlOiBTdGF0ZSk6IHZvaWQge1xuICAgIGNvbnN0IG5ld1Byb3BzID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCBuZXdTdGF0ZSA9IHRoaXMuc3RhdGU7XG4gICAgY29uc3QgZGlmZkVkaXRvclVwZGF0ZWQgPSBvbGRQcm9wcy50ZXh0QnVmZmVyICE9PSBuZXdQcm9wcy50ZXh0QnVmZmVyO1xuICAgIC8vIENhY2hlIGxhdGVzdCBkaXNrIGNvbnRlbnRzIGZvciBhbiBhY2N1cmF0ZSBgaXNNb2RpZmllZGAgZnVuY3Rpb25hbGl0eS5cbiAgICBuZXdQcm9wcy50ZXh0QnVmZmVyLmNhY2hlZERpc2tDb250ZW50cyA9IHRoaXMucHJvcHMuc2F2ZWRDb250ZW50cztcbiAgICBpZiAoZGlmZkVkaXRvclVwZGF0ZWQgfHwgb2xkUHJvcHMuZmlsZVBhdGggIT09IG5ld1Byb3BzLmZpbGVQYXRoKSB7XG4gICAgICAvLyBMb2FkaW5nIGEgbmV3IGZpbGUgc2hvdWxkIGNsZWFyIHRoZSB1bmRvIGhpc3RvcnkuXG4gICAgICB0aGlzLl9zZXRUZXh0Q29udGVudChuZXdQcm9wcy5maWxlUGF0aCwgbmV3U3RhdGUudGV4dENvbnRlbnQsIHRydWUgLypjbGVhckhpc3RvcnkqLyk7XG4gICAgfSBlbHNlIGlmIChuZXdTdGF0ZS50ZXh0Q29udGVudCAhPT0gb2xkU3RhdGUudGV4dENvbnRlbnQpIHtcbiAgICAgIHRoaXMuX3NldFRleHRDb250ZW50KG5ld1Byb3BzLmZpbGVQYXRoLCBuZXdTdGF0ZS50ZXh0Q29udGVudCwgZmFsc2UgLypjbGVhckhpc3RvcnkqLyk7XG4gICAgfVxuICAgIGlmIChkaWZmRWRpdG9yVXBkYXRlZCB8fCBvbGRQcm9wcy5oaWdobGlnaHRlZExpbmVzICE9PSBuZXdQcm9wcy5oaWdobGlnaHRlZExpbmVzKSB7XG4gICAgICB0aGlzLl9zZXRIaWdobGlnaHRlZExpbmVzKG5ld1Byb3BzLmhpZ2hsaWdodGVkTGluZXMpO1xuICAgIH1cbiAgICBpZiAoZGlmZkVkaXRvclVwZGF0ZWQgfHwgb2xkUHJvcHMub2Zmc2V0cyAhPT0gbmV3UHJvcHMub2Zmc2V0cykge1xuICAgICAgdGhpcy5fc2V0T2Zmc2V0cyhuZXdQcm9wcy5vZmZzZXRzKTtcbiAgICB9XG4gICAgaWYgKG9sZFByb3BzLmlubGluZUVsZW1lbnRzICE9PSBuZXdQcm9wcy5pbmxpbmVFbGVtZW50cykge1xuICAgICAgdGhpcy5fcmVuZGVyQ29tcG9uZW50c0lubGluZShuZXdQcm9wcy5pbmxpbmVFbGVtZW50cyk7XG4gICAgfVxuICB9XG5cbiAgX3NldFRleHRDb250ZW50KGZpbGVQYXRoOiBzdHJpbmcsIHRleHQ6IHN0cmluZywgY2xlYXJIaXN0b3J5OiBib29sZWFuKTogdm9pZCB7XG4gICAgaW52YXJpYW50KHRoaXMuX2RpZmZWaWV3RWRpdG9yKTtcbiAgICB0aGlzLl9kaWZmVmlld0VkaXRvci5zZXRGaWxlQ29udGVudHMoZmlsZVBhdGgsIHRleHQsIGNsZWFySGlzdG9yeSk7XG4gIH1cblxuICBfc2V0SGlnaGxpZ2h0ZWRMaW5lcyhoaWdobGlnaHRlZExpbmVzOiBIaWdobGlnaHRlZExpbmVzKTogdm9pZCB7XG4gICAgaW52YXJpYW50KHRoaXMuX2RpZmZWaWV3RWRpdG9yKTtcbiAgICB0aGlzLl9kaWZmVmlld0VkaXRvci5zZXRIaWdobGlnaHRlZExpbmVzKGhpZ2hsaWdodGVkTGluZXMuYWRkZWQsIGhpZ2hsaWdodGVkTGluZXMucmVtb3ZlZCk7XG4gIH1cblxuICBfc2V0T2Zmc2V0cyhvZmZzZXRzOiBPZmZzZXRNYXApOiB2b2lkIHtcbiAgICBpbnZhcmlhbnQodGhpcy5fZGlmZlZpZXdFZGl0b3IpO1xuICAgIHRoaXMuX2RpZmZWaWV3RWRpdG9yLnNldE9mZnNldHMob2Zmc2V0cyk7XG4gIH1cblxuICBhc3luYyBfcmVuZGVyQ29tcG9uZW50c0lubGluZShlbGVtZW50czogQXJyYXk8T2JqZWN0Pik6IFByb21pc2Uge1xuICAgIGNvbnN0IGRpZmZWaWV3RWRpdG9yID0gdGhpcy5fZGlmZlZpZXdFZGl0b3I7XG4gICAgaW52YXJpYW50KGRpZmZWaWV3RWRpdG9yKTtcbiAgICBjb25zdCBjb21wb25lbnRzID0gYXdhaXQgZGlmZlZpZXdFZGl0b3IucmVuZGVySW5saW5lQ29tcG9uZW50cyhlbGVtZW50cyk7XG4gICAgaWYgKCF0aGlzLl9pc01vdW50ZWQgfHwgZWxlbWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZGlmZlZpZXdFZGl0b3IuYXR0YWNoSW5saW5lQ29tcG9uZW50cyhjb21wb25lbnRzKTtcbiAgICBjb25zdCBvZmZzZXRzRnJvbUNvbXBvbmVudHMgPSBuZXcgTWFwKCk7XG5cbiAgICAvLyBUT0RPKGdlbmRyb24pOlxuICAgIC8vIFRoZSBSZWFjdCBjb21wb25lbnRzIGFyZW4ndCBhY3R1YWxseSByZW5kZXJlZCBpbiB0aGUgRE9NIHVudGlsIHRoZVxuICAgIC8vIGFzc29jaWF0ZWQgZGVjb3JhdGlvbnMgYXJlIGF0dGFjaGVkIHRvIHRoZSBUZXh0RWRpdG9yLlxuICAgIC8vIChzZWUgRGlmZlZpZXdFZGl0b3IuYXR0YWNoSW5saW5lQ29tcG9uZW50cylcbiAgICAvLyBUaGVyZSdzIG5vIGVhc3kgd2F5IHRvIGxpc3RlbiBmb3IgdGhpcyBldmVudCwgc28ganVzdCB3YWl0IDAuNXMgcGVyIGNvbXBvbmVudC5cbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGlmICghdGhpcy5faXNNb3VudGVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGVkaXRvcldpZHRoID0gdGhpcy5nZXRFZGl0b3JEb21FbGVtZW50KCkuY2xpZW50V2lkdGg7XG4gICAgICBjb21wb25lbnRzLmZvckVhY2goZWxlbWVudCA9PiB7XG4gICAgICAgIGNvbnN0IGRvbU5vZGUgPSBSZWFjdERPTS5maW5kRE9NTm9kZShlbGVtZW50LmNvbXBvbmVudCk7XG4gICAgICAgIC8vIGdldCB0aGUgaGVpZ2h0IG9mIHRoZSBjb21wb25lbnQgYWZ0ZXIgaXQgaGFzIGJlZW4gcmVuZGVyZWQgaW4gdGhlIERPTVxuICAgICAgICBjb25zdCBjb21wb25lbnRIZWlnaHQgPSBkb21Ob2RlLmNsaWVudEhlaWdodDtcbiAgICAgICAgY29uc3QgbGluZUhlaWdodCA9IGRpZmZWaWV3RWRpdG9yLmdldExpbmVIZWlnaHRJblBpeGVscygpO1xuXG4gICAgICAgIC8vIFRPRE8oZ2VuZHJvbik6XG4gICAgICAgIC8vIFNldCB0aGUgd2lkdGggb2YgdGhlIG92ZXJsYXkgc28gdGhhdCBpdCB3b24ndCByZXNpemUgd2hlbiB3ZVxuICAgICAgICAvLyB0eXBlIGNvbW1lbnQgcmVwbGllcyBpbnRvIHRoZSB0ZXh0IGVkaXRvci5cbiAgICAgICAgZG9tTm9kZS5zdHlsZS53aWR0aCA9IChlZGl0b3JXaWR0aCAtIDcwKSArICdweCc7XG5cbiAgICAgICAgLy8gY2FsY3VsYXRlIHRoZSBudW1iZXIgb2YgbGluZXMgd2UgbmVlZCB0byBpbnNlcnQgaW4gdGhlIGJ1ZmZlciB0byBtYWtlIHJvb21cbiAgICAgICAgLy8gZm9yIHRoZSBjb21wb25lbnQgdG8gYmUgZGlzcGxheWVkXG4gICAgICAgIGNvbnN0IG9mZnNldCA9IE1hdGguY2VpbChjb21wb25lbnRIZWlnaHQgLyBsaW5lSGVpZ2h0KTtcbiAgICAgICAgY29uc3Qgb2Zmc2V0Um93ID0gZWxlbWVudC5idWZmZXJSb3c7XG4gICAgICAgIG9mZnNldHNGcm9tQ29tcG9uZW50cy5zZXQob2Zmc2V0Um93LCBvZmZzZXQpO1xuXG4gICAgICAgIC8vIFBoYWJyaWNhdG9yQ29tbWVudHNMaXN0IGlzIHJlbmRlcmVkIHdpdGggdmlzaWJpbGl0eTogaGlkZGVuLlxuICAgICAgICBkb21Ob2RlLnN0eWxlLnZpc2liaWxpdHkgPSAndmlzaWJsZSc7XG4gICAgICB9KTtcbiAgICAgIHRoaXMucHJvcHMuaGFuZGxlTmV3T2Zmc2V0cyhvZmZzZXRzRnJvbUNvbXBvbmVudHMpO1xuICAgIH0sIGNvbXBvbmVudHMubGVuZ3RoICogNTAwKTtcbiAgfVxuXG4gIGdldEVkaXRvck1vZGVsKCk6IGF0b20kVGV4dEVkaXRvciB7XG4gICAgcmV0dXJuIHRoaXMucmVmc1snZWRpdG9yJ10uZ2V0TW9kZWwoKTtcbiAgfVxuXG4gIGdldEVkaXRvckRvbUVsZW1lbnQoKTogYXRvbSRUZXh0RWRpdG9yRWxlbWVudCB7XG4gICAgcmV0dXJuIHRoaXMucmVmc1snZWRpdG9yJ10uZ2V0RWxlbWVudCgpO1xuICB9XG59XG4iXX0=