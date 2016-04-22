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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _atom = require('atom');

var _nuclideCommons = require('../../nuclide-commons');

var _reactForAtom = require('react-for-atom');

var _DiffViewEditor = require('./DiffViewEditor');

var _DiffViewEditor2 = _interopRequireDefault(_DiffViewEditor);

var _nuclideUiLibAtomTextEditor = require('../../nuclide-ui/lib/AtomTextEditor');

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
        this._diffViewEditor.destroy();
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
          _reactForAtom.React.createElement(_nuclideUiLibAtomTextEditor.AtomTextEditor, {
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
    value: function _renderComponentsInline(elements) {
      if (!this._isMounted || elements.length === 0) {
        return;
      }
      (0, _assert2['default'])(this._diffViewEditor, 'diffViewEditor has not been setup yet.');
      this._diffViewEditor.setUIElements(elements);
    }
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
//# sourceMappingURL=data:application/json;base64,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QUFJLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztLQUMxQzs7O1dBRXNCLGlDQUFDLFFBQTBCLEVBQVE7QUFDeEQsVUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLElBQUksUUFBUSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7QUFDN0MsZUFBTztPQUNSO0FBQ0QsK0JBQVUsSUFBSSxDQUFDLGVBQWUsRUFBRSx3Q0FBd0MsQ0FBQyxDQUFDO0FBQzFFLFVBQUksQ0FBQyxlQUFlLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQzlDOzs7V0FFYSwwQkFBb0I7QUFDaEMsYUFBTyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO0tBQ3ZDOzs7V0FFa0IsK0JBQTJCO0FBQzVDLGFBQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQztLQUN6Qzs7O1NBdkprQixrQkFBa0I7R0FBUyxvQkFBTSxTQUFTOztxQkFBMUMsa0JBQWtCIiwiZmlsZSI6IkRpZmZWaWV3RWRpdG9yUGFuZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS11cmknO1xuaW1wb3J0IHR5cGUge0hpZ2hsaWdodGVkTGluZXMsIE9mZnNldE1hcH0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQgdHlwZSB7VUlFbGVtZW50fSBmcm9tICcuLi8uLi9udWNsaWRlLWRpZmYtdWktcHJvdmlkZXItaW50ZXJmYWNlcyc7XG5cbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge2RlYm91bmNlfSBmcm9tICcuLi8uLi9udWNsaWRlLWNvbW1vbnMnO1xuaW1wb3J0IHtcbiAgUmVhY3QsXG59IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcbmltcG9ydCBEaWZmVmlld0VkaXRvciBmcm9tICcuL0RpZmZWaWV3RWRpdG9yJztcbmltcG9ydCB7QXRvbVRleHRFZGl0b3J9IGZyb20gJy4uLy4uL251Y2xpZGUtdWkvbGliL0F0b21UZXh0RWRpdG9yJztcbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcblxuY29uc3QgQ0hBTkdFX0RFQk9VTkNFX0RFTEFZX01TID0gNTtcblxudHlwZSBQcm9wcyA9IHtcbiAgZmlsZVBhdGg6IE51Y2xpZGVVcmk7XG4gIHRleHRCdWZmZXI6IGF0b20kVGV4dEJ1ZmZlcjtcbiAgb2Zmc2V0czogT2Zmc2V0TWFwO1xuICBoaWdobGlnaHRlZExpbmVzOiB7XG4gICAgYWRkZWQ6IEFycmF5PG51bWJlcj47XG4gICAgcmVtb3ZlZDogQXJyYXk8bnVtYmVyPjtcbiAgfTtcbiAgaW5pdGlhbFRleHRDb250ZW50OiBzdHJpbmc7XG4gIHNhdmVkQ29udGVudHM6IHN0cmluZztcbiAgaW5saW5lRWxlbWVudHM6IEFycmF5PFVJRWxlbWVudD47XG4gIHJlYWRPbmx5OiBib29sZWFuO1xuICBvbkNoYW5nZTogKG5ld0NvbnRlbnRzOiBzdHJpbmcpID0+IGFueTtcbiAgb25EaWRVcGRhdGVUZXh0RWRpdG9yRWxlbWVudDogKCkgPT4gbWl4ZWQ7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEaWZmVmlld0VkaXRvclBhbmUgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBwcm9wczogUHJvcHM7XG5cbiAgX2RpZmZWaWV3RWRpdG9yOiA/RGlmZlZpZXdFZGl0b3I7XG4gIF9zdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBfZWRpdG9yU3Vic2NyaXB0aW9uczogP0NvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIC8vIFRPRE8obW9zdCk6IG1vdmUgYXN5bmMgY29kZSBvdXQgb2YgdGhlIHZpZXcgYW5kIGRlcHJlY2F0ZSB0aGUgdXNhZ2Ugb2YgYF9pc01vdW50ZWRgLlxuICAvLyBBbGwgdmlldyBjaGFuZ2VzIHNob3VsZCBiZSBwdXNoZWQgZnJvbSB0aGUgbW9kZWwvc3RvcmUgdGhyb3VnaCBzdWJzY3JpcHRpb25zLlxuICBfaXNNb3VudGVkOiBib29sZWFuO1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBQcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLl9pc01vdW50ZWQgPSBmYWxzZTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCk6IHZvaWQge1xuICAgIHRoaXMuX2lzTW91bnRlZCA9IHRydWU7XG4gICAgdGhpcy5fc2V0dXBEaWZmRWRpdG9yKCk7XG4gIH1cblxuICBfc2V0dXBEaWZmRWRpdG9yKCk6IHZvaWQge1xuICAgIGNvbnN0IGVkaXRvclN1YnNjcmlwdGlvbnMgPSB0aGlzLl9lZGl0b3JTdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChlZGl0b3JTdWJzY3JpcHRpb25zKTtcblxuICAgIHRoaXMuX2RpZmZWaWV3RWRpdG9yID0gbmV3IERpZmZWaWV3RWRpdG9yKHRoaXMuZ2V0RWRpdG9yRG9tRWxlbWVudCgpKTtcbiAgICBjb25zdCB0ZXh0RWRpdG9yID0gdGhpcy5nZXRFZGl0b3JNb2RlbCgpO1xuICAgIGNvbnN0IHRleHRCdWZmZXIgPSB0ZXh0RWRpdG9yLmdldEJ1ZmZlcigpO1xuXG4gICAgY29uc3QgZGVib3VuY2VkT25DaGFuZ2UgPSBkZWJvdW5jZShcbiAgICAgICgpID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLl9pc01vdW50ZWQgfHwgdGV4dEJ1ZmZlciAhPT0gdGhpcy5wcm9wcy50ZXh0QnVmZmVyKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHRleHRDb250ZW50ID0gdGV4dEJ1ZmZlci5nZXRUZXh0KCk7XG4gICAgICAgIGlmICh0ZXh0Q29udGVudCA9PT0gdGhpcy5wcm9wcy5pbml0aWFsVGV4dENvbnRlbnQpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMucHJvcHMub25DaGFuZ2UpIHtcbiAgICAgICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKHRleHRDb250ZW50KTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIENIQU5HRV9ERUJPVU5DRV9ERUxBWV9NUyxcbiAgICAgIGZhbHNlLFxuICAgICk7XG4gICAgZWRpdG9yU3Vic2NyaXB0aW9ucy5hZGQodGV4dEJ1ZmZlci5vbkRpZENoYW5nZShkZWJvdW5jZWRPbkNoYW5nZSkpO1xuICAgIC8qXG4gICAgICogVGhvc2Ugc2hvdWxkIGhhdmUgYmVlbiBzeW5jZWQgYXV0b21hdGljYWxseSwgYnV0IGFuIGltcGxlbWVudGF0aW9uIGxpbWl0YXRpb24gb2YgY3JlYXRpbmdcbiAgICAgKiBhIDxhdG9tLXRleHQtZWRpdG9yPiBlbGVtZW50IGFzc3VtZXMgZGVmYXVsdCBzZXR0aW5ncyBmb3IgdGhvc2UuXG4gICAgICogRmlsZWQ6IGh0dHBzOi8vZ2l0aHViLmNvbS9hdG9tL2F0b20vaXNzdWVzLzEwNTA2XG4gICAgICovXG4gICAgZWRpdG9yU3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZSgnZWRpdG9yLnRhYkxlbmd0aCcsIHRhYkxlbmd0aCA9PiB7XG4gICAgICB0ZXh0RWRpdG9yLnNldFRhYkxlbmd0aCh0YWJMZW5ndGgpO1xuICAgIH0pKTtcbiAgICBlZGl0b3JTdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdlZGl0b3Iuc29mdFRhYnMnLCBzb2Z0VGFicyA9PiB7XG4gICAgICB0ZXh0RWRpdG9yLnNldFNvZnRUYWJzKHNvZnRUYWJzKTtcbiAgICB9KSk7XG5cbiAgICBpZiAodGhpcy5wcm9wcy5vbkRpZFVwZGF0ZVRleHRFZGl0b3JFbGVtZW50KSB7XG4gICAgICB0aGlzLnByb3BzLm9uRGlkVXBkYXRlVGV4dEVkaXRvckVsZW1lbnQoKTtcbiAgICB9XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpOiB2b2lkIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgICBpZiAodGhpcy5fZGlmZlZpZXdFZGl0b3IgIT0gbnVsbCkge1xuICAgICAgdGhpcy5fZGlmZlZpZXdFZGl0b3IuZGVzdHJveSgpO1xuICAgICAgdGhpcy5fZGlmZlZpZXdFZGl0b3IgPSBudWxsO1xuICAgIH1cbiAgICB0aGlzLl9pc01vdW50ZWQgPSBmYWxzZTtcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdC5FbGVtZW50IHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLWRpZmYtZWRpdG9yLWNvbnRhaW5lclwiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm51Y2xpZGUtZGlmZi1lZGl0b3Itd3JhcHBlclwiPlxuICAgICAgICAgIDxBdG9tVGV4dEVkaXRvclxuICAgICAgICAgICAgcmVmPVwiZWRpdG9yXCJcbiAgICAgICAgICAgIHJlYWRPbmx5PXt0aGlzLnByb3BzLnJlYWRPbmx5fVxuICAgICAgICAgICAgdGV4dEJ1ZmZlcj17dGhpcy5wcm9wcy50ZXh0QnVmZmVyfVxuICAgICAgICAgICAgc3luY1RleHRDb250ZW50cz17ZmFsc2V9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbiAgY29tcG9uZW50RGlkVXBkYXRlKHByZXZQcm9wczogUHJvcHMpOiB2b2lkIHtcbiAgICBpZiAocHJldlByb3BzLnRleHRCdWZmZXIgIT09IHRoaXMucHJvcHMudGV4dEJ1ZmZlcikge1xuICAgICAgY29uc3Qgb2xkRWRpdG9yU3Vic2NyaXB0aW9ucyA9IHRoaXMuX2VkaXRvclN1YnNjcmlwdGlvbnM7XG4gICAgICBpZiAob2xkRWRpdG9yU3Vic2NyaXB0aW9ucyAhPSBudWxsKSB7XG4gICAgICAgIG9sZEVkaXRvclN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICAgICAgICB0aGlzLl9zdWJzY3JpcHRpb25zLnJlbW92ZShvbGRFZGl0b3JTdWJzY3JpcHRpb25zKTtcbiAgICAgICAgdGhpcy5fZWRpdG9yU3Vic2NyaXB0aW9ucyA9IG51bGw7XG4gICAgICB9XG4gICAgICB0aGlzLl9zZXR1cERpZmZFZGl0b3IoKTtcbiAgICB9XG4gICAgdGhpcy5fdXBkYXRlRGlmZlZpZXcocHJldlByb3BzKTtcbiAgfVxuXG4gIF91cGRhdGVEaWZmVmlldyhvbGRQcm9wczogUHJvcHMpOiB2b2lkIHtcbiAgICBjb25zdCBuZXdQcm9wcyA9IHRoaXMucHJvcHM7XG4gICAgY29uc3QgZGlmZkVkaXRvclVwZGF0ZWQgPSBvbGRQcm9wcy50ZXh0QnVmZmVyICE9PSBuZXdQcm9wcy50ZXh0QnVmZmVyO1xuICAgIGlmIChkaWZmRWRpdG9yVXBkYXRlZCB8fCBvbGRQcm9wcy5pbml0aWFsVGV4dENvbnRlbnQgIT09IHRoaXMucHJvcHMuaW5pdGlhbFRleHRDb250ZW50KSB7XG4gICAgICB0aGlzLl9zZXRUZXh0Q29udGVudChuZXdQcm9wcy5maWxlUGF0aCwgbmV3UHJvcHMuaW5pdGlhbFRleHRDb250ZW50KTtcbiAgICB9XG4gICAgaWYgKGRpZmZFZGl0b3JVcGRhdGVkIHx8IG9sZFByb3BzLmhpZ2hsaWdodGVkTGluZXMgIT09IG5ld1Byb3BzLmhpZ2hsaWdodGVkTGluZXMpIHtcbiAgICAgIHRoaXMuX3NldEhpZ2hsaWdodGVkTGluZXMobmV3UHJvcHMuaGlnaGxpZ2h0ZWRMaW5lcyk7XG4gICAgfVxuICAgIGlmIChkaWZmRWRpdG9yVXBkYXRlZCB8fCBvbGRQcm9wcy5vZmZzZXRzICE9PSBuZXdQcm9wcy5vZmZzZXRzKSB7XG4gICAgICB0aGlzLl9zZXRPZmZzZXRzKG5ld1Byb3BzLm9mZnNldHMpO1xuICAgIH1cbiAgICBpZiAob2xkUHJvcHMuaW5saW5lRWxlbWVudHMgIT09IG5ld1Byb3BzLmlubGluZUVsZW1lbnRzKSB7XG4gICAgICB0aGlzLl9yZW5kZXJDb21wb25lbnRzSW5saW5lKG5ld1Byb3BzLmlubGluZUVsZW1lbnRzKTtcbiAgICB9XG4gIH1cblxuICBzY3JvbGxUb1NjcmVlbkxpbmUoc2NyZWVuTGluZTogbnVtYmVyKTogdm9pZCB7XG4gICAgaW52YXJpYW50KHRoaXMuX2RpZmZWaWV3RWRpdG9yLCAnZGlmZlZpZXdFZGl0b3IgaGFzIG5vdCBiZWVuIHNldHVwIHlldC4nKTtcbiAgICB0aGlzLl9kaWZmVmlld0VkaXRvci5zY3JvbGxUb1NjcmVlbkxpbmUoc2NyZWVuTGluZSk7XG4gIH1cblxuICBfc2V0VGV4dENvbnRlbnQoZmlsZVBhdGg6IHN0cmluZywgdGV4dDogc3RyaW5nKTogdm9pZCB7XG4gICAgaW52YXJpYW50KHRoaXMuX2RpZmZWaWV3RWRpdG9yKTtcbiAgICB0aGlzLl9kaWZmVmlld0VkaXRvci5zZXRGaWxlQ29udGVudHMoZmlsZVBhdGgsIHRleHQpO1xuICB9XG5cbiAgX3NldEhpZ2hsaWdodGVkTGluZXMoaGlnaGxpZ2h0ZWRMaW5lczogSGlnaGxpZ2h0ZWRMaW5lcyk6IHZvaWQge1xuICAgIGludmFyaWFudCh0aGlzLl9kaWZmVmlld0VkaXRvcik7XG4gICAgdGhpcy5fZGlmZlZpZXdFZGl0b3Iuc2V0SGlnaGxpZ2h0ZWRMaW5lcyhoaWdobGlnaHRlZExpbmVzLmFkZGVkLCBoaWdobGlnaHRlZExpbmVzLnJlbW92ZWQpO1xuICB9XG5cbiAgX3NldE9mZnNldHMob2Zmc2V0czogT2Zmc2V0TWFwKTogdm9pZCB7XG4gICAgaW52YXJpYW50KHRoaXMuX2RpZmZWaWV3RWRpdG9yKTtcbiAgICB0aGlzLl9kaWZmVmlld0VkaXRvci5zZXRPZmZzZXRzKG9mZnNldHMpO1xuICB9XG5cbiAgX3JlbmRlckNvbXBvbmVudHNJbmxpbmUoZWxlbWVudHM6IEFycmF5PFVJRWxlbWVudD4pOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuX2lzTW91bnRlZCB8fCBlbGVtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaW52YXJpYW50KHRoaXMuX2RpZmZWaWV3RWRpdG9yLCAnZGlmZlZpZXdFZGl0b3IgaGFzIG5vdCBiZWVuIHNldHVwIHlldC4nKTtcbiAgICB0aGlzLl9kaWZmVmlld0VkaXRvci5zZXRVSUVsZW1lbnRzKGVsZW1lbnRzKTtcbiAgfVxuXG4gIGdldEVkaXRvck1vZGVsKCk6IGF0b20kVGV4dEVkaXRvciB7XG4gICAgcmV0dXJuIHRoaXMucmVmc1snZWRpdG9yJ10uZ2V0TW9kZWwoKTtcbiAgfVxuXG4gIGdldEVkaXRvckRvbUVsZW1lbnQoKTogYXRvbSRUZXh0RWRpdG9yRWxlbWVudCB7XG4gICAgcmV0dXJuIHRoaXMucmVmc1snZWRpdG9yJ10uZ2V0RWxlbWVudCgpO1xuICB9XG59XG4iXX0=