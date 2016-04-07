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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRpZmZWaWV3RWRpdG9yUGFuZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7b0JBY2tDLE1BQU07OzhCQUNqQix1QkFBdUI7OzRCQUl2QyxnQkFBZ0I7OzhCQUNJLGtCQUFrQjs7OzswQ0FDaEIscUNBQXFDOztzQkFDNUMsUUFBUTs7OztBQUU5QixJQUFNLHdCQUF3QixHQUFHLENBQUMsQ0FBQzs7SUFtQmQsa0JBQWtCO1lBQWxCLGtCQUFrQjs7QUFVMUIsV0FWUSxrQkFBa0IsQ0FVekIsS0FBWSxFQUFFOzBCQVZQLGtCQUFrQjs7QUFXbkMsK0JBWGlCLGtCQUFrQiw2Q0FXN0IsS0FBSyxFQUFFO0FBQ2IsUUFBSSxDQUFDLGNBQWMsR0FBRywrQkFBeUIsQ0FBQztBQUNoRCxRQUFJLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQztHQUN6Qjs7ZUFka0Isa0JBQWtCOztXQWdCcEIsNkJBQVM7QUFDeEIsVUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7QUFDdkIsVUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7S0FDekI7OztXQUVlLDRCQUFTOzs7QUFDdkIsVUFBTSxtQkFBbUIsR0FBRyxJQUFJLENBQUMsb0JBQW9CLEdBQUcsK0JBQXlCLENBQUM7QUFDbEYsVUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUMsQ0FBQzs7QUFFN0MsVUFBSSxDQUFDLGVBQWUsR0FBRyxnQ0FBbUIsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUMsQ0FBQztBQUN0RSxVQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7QUFDekMsVUFBTSxVQUFVLEdBQUcsVUFBVSxDQUFDLFNBQVMsRUFBRSxDQUFDOztBQUUxQyxVQUFNLGlCQUFpQixHQUFHLDhCQUN4QixZQUFNO0FBQ0osWUFBSSxDQUFDLE1BQUssVUFBVSxJQUFJLFVBQVUsS0FBSyxNQUFLLEtBQUssQ0FBQyxVQUFVLEVBQUU7QUFDNUQsaUJBQU87U0FDUjtBQUNELFlBQU0sV0FBVyxHQUFHLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUN6QyxZQUFJLFdBQVcsS0FBSyxNQUFLLEtBQUssQ0FBQyxrQkFBa0IsRUFBRTtBQUNqRCxpQkFBTztTQUNSO0FBQ0QsWUFBSSxNQUFLLEtBQUssQ0FBQyxRQUFRLEVBQUU7QUFDdkIsZ0JBQUssS0FBSyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQztTQUNsQztPQUNGLEVBQ0Qsd0JBQXdCLEVBQ3hCLEtBQUssQ0FDTixDQUFDO0FBQ0YseUJBQW1CLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDOzs7Ozs7QUFNbkUseUJBQW1CLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLGtCQUFrQixFQUFFLFVBQUEsU0FBUyxFQUFJO0FBQzNFLGtCQUFVLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDO09BQ3BDLENBQUMsQ0FBQyxDQUFDO0FBQ0oseUJBQW1CLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLGlCQUFpQixFQUFFLFVBQUEsUUFBUSxFQUFJO0FBQ3pFLGtCQUFVLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO09BQ2xDLENBQUMsQ0FBQyxDQUFDOztBQUVKLFVBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyw0QkFBNEIsRUFBRTtBQUMzQyxZQUFJLENBQUMsS0FBSyxDQUFDLDRCQUE0QixFQUFFLENBQUM7T0FDM0M7S0FDRjs7O1dBRW1CLGdDQUFTO0FBQzNCLFVBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDOUIsVUFBSSxJQUFJLENBQUMsZUFBZSxJQUFJLElBQUksRUFBRTtBQUNoQyxZQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7QUFDekMsa0JBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNyQixZQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQztPQUM3QjtBQUNELFVBQUksQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO0tBQ3pCOzs7V0FFSyxrQkFBaUI7QUFDckIsYUFDRTs7VUFBSyxTQUFTLEVBQUMsK0JBQStCO1FBQzVDOztZQUFLLFNBQVMsRUFBQyw2QkFBNkI7VUFDMUM7QUFDRSxlQUFHLEVBQUMsUUFBUTtBQUNaLG9CQUFRLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEFBQUM7QUFDOUIsc0JBQVUsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQUFBQztBQUNsQyw0QkFBZ0IsRUFBRSxLQUFLLEFBQUM7WUFDeEI7U0FDRTtPQUNGLENBQ047S0FDSDs7O1dBRWlCLDRCQUFDLFNBQWdCLEVBQVE7QUFDekMsVUFBSSxTQUFTLENBQUMsVUFBVSxLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFO0FBQ2xELFlBQU0sc0JBQXNCLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDO0FBQ3pELFlBQUksc0JBQXNCLElBQUksSUFBSSxFQUFFO0FBQ2xDLGdDQUFzQixDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ2pDLGNBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLHNCQUFzQixDQUFDLENBQUM7QUFDbkQsY0FBSSxDQUFDLG9CQUFvQixHQUFHLElBQUksQ0FBQztTQUNsQztBQUNELFlBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO09BQ3pCO0FBQ0QsVUFBSSxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsQ0FBQztLQUNqQzs7O1dBRWMseUJBQUMsUUFBZSxFQUFRO0FBQ3JDLFVBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7QUFDNUIsVUFBTSxpQkFBaUIsR0FBRyxRQUFRLENBQUMsVUFBVSxLQUFLLFFBQVEsQ0FBQyxVQUFVLENBQUM7QUFDdEUsVUFBSSxpQkFBaUIsSUFBSSxRQUFRLENBQUMsa0JBQWtCLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsRUFBRTtBQUN0RixZQUFJLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLGtCQUFrQixDQUFDLENBQUM7T0FDdEU7QUFDRCxVQUFJLGlCQUFpQixJQUFJLFFBQVEsQ0FBQyxnQkFBZ0IsS0FBSyxRQUFRLENBQUMsZ0JBQWdCLEVBQUU7QUFDaEYsWUFBSSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO09BQ3REO0FBQ0QsVUFBSSxpQkFBaUIsSUFBSSxRQUFRLENBQUMsT0FBTyxLQUFLLFFBQVEsQ0FBQyxPQUFPLEVBQUU7QUFDOUQsWUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7T0FDcEM7QUFDRCxVQUFJLFFBQVEsQ0FBQyxjQUFjLEtBQUssUUFBUSxDQUFDLGNBQWMsRUFBRTtBQUN2RCxZQUFJLENBQUMsdUJBQXVCLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxDQUFDO09BQ3ZEO0tBQ0Y7OztXQUVpQiw0QkFBQyxVQUFrQixFQUFRO0FBQzNDLCtCQUFVLElBQUksQ0FBQyxlQUFlLEVBQUUsd0NBQXdDLENBQUMsQ0FBQztBQUMxRSxVQUFJLENBQUMsZUFBZSxDQUFDLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxDQUFDO0tBQ3JEOzs7V0FFYyx5QkFBQyxRQUFnQixFQUFFLElBQVksRUFBUTtBQUNwRCwrQkFBVSxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDaEMsVUFBSSxDQUFDLGVBQWUsQ0FBQyxlQUFlLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO0tBQ3REOzs7V0FFbUIsOEJBQUMsZ0JBQWtDLEVBQVE7QUFDN0QsK0JBQVUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQ2hDLFVBQUksQ0FBQyxlQUFlLENBQUMsbUJBQW1CLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxFQUFFLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQzVGOzs7V0FFVSxxQkFBQyxPQUFrQixFQUFRO0FBQ3BDLCtCQUFVLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUNoQyxVQUFJLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztLQUMxQzs7OzZCQUU0QixXQUFDLFFBQXVCLEVBQVc7OztBQUM5RCxVQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDO0FBQzVDLCtCQUFVLGNBQWMsQ0FBQyxDQUFDO0FBQzFCLFVBQU0sVUFBVSxHQUFHLE1BQU0sY0FBYyxDQUFDLHNCQUFzQixDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3pFLFVBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxJQUFJLFFBQVEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO0FBQzdDLGVBQU87T0FDUjs7QUFFRCxvQkFBYyxDQUFDLHNCQUFzQixDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ2xELFVBQU0scUJBQXFCLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQzs7Ozs7OztBQU94QyxnQkFBVSxDQUFDLFlBQU07QUFDZixZQUFJLENBQUMsT0FBSyxVQUFVLEVBQUU7QUFDcEIsaUJBQU87U0FDUjtBQUNELFlBQU0sV0FBVyxHQUFHLE9BQUssbUJBQW1CLEVBQUUsQ0FBQyxXQUFXLENBQUM7QUFDM0Qsa0JBQVUsQ0FBQyxPQUFPLENBQUMsVUFBQSxPQUFPLEVBQUk7QUFDNUIsY0FBTSxPQUFPLEdBQUcsdUJBQVMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQzs7QUFFeEQsY0FBTSxlQUFlLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQztBQUM3QyxjQUFNLFVBQVUsR0FBRyxjQUFjLENBQUMscUJBQXFCLEVBQUUsQ0FBQzs7Ozs7QUFLMUQsaUJBQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLEFBQUMsV0FBVyxHQUFHLEVBQUUsR0FBSSxJQUFJLENBQUM7Ozs7QUFJaEQsY0FBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLEdBQUcsVUFBVSxDQUFDLENBQUM7QUFDdkQsY0FBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQztBQUNwQywrQkFBcUIsQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDOzs7QUFHN0MsaUJBQU8sQ0FBQyxLQUFLLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQztTQUN0QyxDQUFDLENBQUM7QUFDSCxlQUFLLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO09BQ3BELEVBQUUsVUFBVSxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUMsQ0FBQztLQUM3Qjs7O1dBRWEsMEJBQW9CO0FBQ2hDLGFBQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztLQUN2Qzs7O1dBRWtCLCtCQUEyQjtBQUM1QyxhQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsVUFBVSxFQUFFLENBQUM7S0FDekM7OztTQTdMa0Isa0JBQWtCO0dBQVMsb0JBQU0sU0FBUzs7cUJBQTFDLGtCQUFrQiIsImZpbGUiOiJEaWZmVmlld0VkaXRvclBhbmUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1yZW1vdGUtdXJpJztcbmltcG9ydCB0eXBlIHtIaWdobGlnaHRlZExpbmVzLCBPZmZzZXRNYXAsIElubGluZUNvbXBvbmVudH0gZnJvbSAnLi90eXBlcyc7XG5cbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge2RlYm91bmNlfSBmcm9tICcuLi8uLi9udWNsaWRlLWNvbW1vbnMnO1xuaW1wb3J0IHtcbiAgUmVhY3QsXG4gIFJlYWN0RE9NLFxufSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQgRGlmZlZpZXdFZGl0b3IgZnJvbSAnLi9EaWZmVmlld0VkaXRvcic7XG5pbXBvcnQge0F0b21UZXh0RWRpdG9yfSBmcm9tICcuLi8uLi9udWNsaWRlLXVpL2xpYi9BdG9tVGV4dEVkaXRvcic7XG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5cbmNvbnN0IENIQU5HRV9ERUJPVU5DRV9ERUxBWV9NUyA9IDU7XG5cbnR5cGUgUHJvcHMgPSB7XG4gIGZpbGVQYXRoOiBOdWNsaWRlVXJpO1xuICB0ZXh0QnVmZmVyOiBhdG9tJFRleHRCdWZmZXI7XG4gIG9mZnNldHM6IE9mZnNldE1hcDtcbiAgaGlnaGxpZ2h0ZWRMaW5lczoge1xuICAgIGFkZGVkOiBBcnJheTxudW1iZXI+O1xuICAgIHJlbW92ZWQ6IEFycmF5PG51bWJlcj47XG4gIH07XG4gIGluaXRpYWxUZXh0Q29udGVudDogc3RyaW5nO1xuICBzYXZlZENvbnRlbnRzOiBzdHJpbmc7XG4gIGlubGluZUVsZW1lbnRzOiBBcnJheTxJbmxpbmVDb21wb25lbnQ+O1xuICBoYW5kbGVOZXdPZmZzZXRzOiAobmV3T2Zmc2V0czogT2Zmc2V0TWFwKSA9PiBhbnk7XG4gIHJlYWRPbmx5OiBib29sZWFuO1xuICBvbkNoYW5nZTogKG5ld0NvbnRlbnRzOiBzdHJpbmcpID0+IGFueTtcbiAgb25EaWRVcGRhdGVUZXh0RWRpdG9yRWxlbWVudDogKCkgPT4gbWl4ZWQ7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEaWZmVmlld0VkaXRvclBhbmUgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBwcm9wczogUHJvcHM7XG5cbiAgX2RpZmZWaWV3RWRpdG9yOiA/RGlmZlZpZXdFZGl0b3I7XG4gIF9zdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBfZWRpdG9yU3Vic2NyaXB0aW9uczogP0NvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIC8vIFRPRE8obW9zdCk6IG1vdmUgYXN5bmMgY29kZSBvdXQgb2YgdGhlIHZpZXcgYW5kIGRlcHJlY2F0ZSB0aGUgdXNhZ2Ugb2YgYF9pc01vdW50ZWRgLlxuICAvLyBBbGwgdmlldyBjaGFuZ2VzIHNob3VsZCBiZSBwdXNoZWQgZnJvbSB0aGUgbW9kZWwvc3RvcmUgdGhyb3VnaCBzdWJzY3JpcHRpb25zLlxuICBfaXNNb3VudGVkOiBib29sZWFuO1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBQcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLl9pc01vdW50ZWQgPSBmYWxzZTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCk6IHZvaWQge1xuICAgIHRoaXMuX2lzTW91bnRlZCA9IHRydWU7XG4gICAgdGhpcy5fc2V0dXBEaWZmRWRpdG9yKCk7XG4gIH1cblxuICBfc2V0dXBEaWZmRWRpdG9yKCk6IHZvaWQge1xuICAgIGNvbnN0IGVkaXRvclN1YnNjcmlwdGlvbnMgPSB0aGlzLl9lZGl0b3JTdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChlZGl0b3JTdWJzY3JpcHRpb25zKTtcblxuICAgIHRoaXMuX2RpZmZWaWV3RWRpdG9yID0gbmV3IERpZmZWaWV3RWRpdG9yKHRoaXMuZ2V0RWRpdG9yRG9tRWxlbWVudCgpKTtcbiAgICBjb25zdCB0ZXh0RWRpdG9yID0gdGhpcy5nZXRFZGl0b3JNb2RlbCgpO1xuICAgIGNvbnN0IHRleHRCdWZmZXIgPSB0ZXh0RWRpdG9yLmdldEJ1ZmZlcigpO1xuXG4gICAgY29uc3QgZGVib3VuY2VkT25DaGFuZ2UgPSBkZWJvdW5jZShcbiAgICAgICgpID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLl9pc01vdW50ZWQgfHwgdGV4dEJ1ZmZlciAhPT0gdGhpcy5wcm9wcy50ZXh0QnVmZmVyKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHRleHRDb250ZW50ID0gdGV4dEJ1ZmZlci5nZXRUZXh0KCk7XG4gICAgICAgIGlmICh0ZXh0Q29udGVudCA9PT0gdGhpcy5wcm9wcy5pbml0aWFsVGV4dENvbnRlbnQpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMucHJvcHMub25DaGFuZ2UpIHtcbiAgICAgICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKHRleHRDb250ZW50KTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIENIQU5HRV9ERUJPVU5DRV9ERUxBWV9NUyxcbiAgICAgIGZhbHNlLFxuICAgICk7XG4gICAgZWRpdG9yU3Vic2NyaXB0aW9ucy5hZGQodGV4dEJ1ZmZlci5vbkRpZENoYW5nZShkZWJvdW5jZWRPbkNoYW5nZSkpO1xuICAgIC8qXG4gICAgICogVGhvc2Ugc2hvdWxkIGhhdmUgYmVlbiBzeW5jZWQgYXV0b21hdGljYWxseSwgYnV0IGFuIGltcGxlbWVudGF0aW9uIGxpbWl0YXRpb24gb2YgY3JlYXRpbmdcbiAgICAgKiBhIDxhdG9tLXRleHQtZWRpdG9yPiBlbGVtZW50IGFzc3VtZXMgZGVmYXVsdCBzZXR0aW5ncyBmb3IgdGhvc2UuXG4gICAgICogRmlsZWQ6IGh0dHBzOi8vZ2l0aHViLmNvbS9hdG9tL2F0b20vaXNzdWVzLzEwNTA2XG4gICAgICovXG4gICAgZWRpdG9yU3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZSgnZWRpdG9yLnRhYkxlbmd0aCcsIHRhYkxlbmd0aCA9PiB7XG4gICAgICB0ZXh0RWRpdG9yLnNldFRhYkxlbmd0aCh0YWJMZW5ndGgpO1xuICAgIH0pKTtcbiAgICBlZGl0b3JTdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdlZGl0b3Iuc29mdFRhYnMnLCBzb2Z0VGFicyA9PiB7XG4gICAgICB0ZXh0RWRpdG9yLnNldFNvZnRUYWJzKHNvZnRUYWJzKTtcbiAgICB9KSk7XG5cbiAgICBpZiAodGhpcy5wcm9wcy5vbkRpZFVwZGF0ZVRleHRFZGl0b3JFbGVtZW50KSB7XG4gICAgICB0aGlzLnByb3BzLm9uRGlkVXBkYXRlVGV4dEVkaXRvckVsZW1lbnQoKTtcbiAgICB9XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpOiB2b2lkIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgICBpZiAodGhpcy5fZGlmZlZpZXdFZGl0b3IgIT0gbnVsbCkge1xuICAgICAgY29uc3QgdGV4dEVkaXRvciA9IHRoaXMuZ2V0RWRpdG9yTW9kZWwoKTtcbiAgICAgIHRleHRFZGl0b3IuZGVzdHJveSgpO1xuICAgICAgdGhpcy5fZGlmZlZpZXdFZGl0b3IgPSBudWxsO1xuICAgIH1cbiAgICB0aGlzLl9pc01vdW50ZWQgPSBmYWxzZTtcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cIm51Y2xpZGUtZGlmZi1lZGl0b3ItY29udGFpbmVyXCI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS1kaWZmLWVkaXRvci13cmFwcGVyXCI+XG4gICAgICAgICAgPEF0b21UZXh0RWRpdG9yXG4gICAgICAgICAgICByZWY9XCJlZGl0b3JcIlxuICAgICAgICAgICAgcmVhZE9ubHk9e3RoaXMucHJvcHMucmVhZE9ubHl9XG4gICAgICAgICAgICB0ZXh0QnVmZmVyPXt0aGlzLnByb3BzLnRleHRCdWZmZXJ9XG4gICAgICAgICAgICBzeW5jVGV4dENvbnRlbnRzPXtmYWxzZX1cbiAgICAgICAgICAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICBjb21wb25lbnREaWRVcGRhdGUocHJldlByb3BzOiBQcm9wcyk6IHZvaWQge1xuICAgIGlmIChwcmV2UHJvcHMudGV4dEJ1ZmZlciAhPT0gdGhpcy5wcm9wcy50ZXh0QnVmZmVyKSB7XG4gICAgICBjb25zdCBvbGRFZGl0b3JTdWJzY3JpcHRpb25zID0gdGhpcy5fZWRpdG9yU3Vic2NyaXB0aW9ucztcbiAgICAgIGlmIChvbGRFZGl0b3JTdWJzY3JpcHRpb25zICE9IG51bGwpIHtcbiAgICAgICAgb2xkRWRpdG9yU3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gICAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMucmVtb3ZlKG9sZEVkaXRvclN1YnNjcmlwdGlvbnMpO1xuICAgICAgICB0aGlzLl9lZGl0b3JTdWJzY3JpcHRpb25zID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIHRoaXMuX3NldHVwRGlmZkVkaXRvcigpO1xuICAgIH1cbiAgICB0aGlzLl91cGRhdGVEaWZmVmlldyhwcmV2UHJvcHMpO1xuICB9XG5cbiAgX3VwZGF0ZURpZmZWaWV3KG9sZFByb3BzOiBQcm9wcyk6IHZvaWQge1xuICAgIGNvbnN0IG5ld1Byb3BzID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCBkaWZmRWRpdG9yVXBkYXRlZCA9IG9sZFByb3BzLnRleHRCdWZmZXIgIT09IG5ld1Byb3BzLnRleHRCdWZmZXI7XG4gICAgaWYgKGRpZmZFZGl0b3JVcGRhdGVkIHx8IG9sZFByb3BzLmluaXRpYWxUZXh0Q29udGVudCAhPT0gdGhpcy5wcm9wcy5pbml0aWFsVGV4dENvbnRlbnQpIHtcbiAgICAgIHRoaXMuX3NldFRleHRDb250ZW50KG5ld1Byb3BzLmZpbGVQYXRoLCBuZXdQcm9wcy5pbml0aWFsVGV4dENvbnRlbnQpO1xuICAgIH1cbiAgICBpZiAoZGlmZkVkaXRvclVwZGF0ZWQgfHwgb2xkUHJvcHMuaGlnaGxpZ2h0ZWRMaW5lcyAhPT0gbmV3UHJvcHMuaGlnaGxpZ2h0ZWRMaW5lcykge1xuICAgICAgdGhpcy5fc2V0SGlnaGxpZ2h0ZWRMaW5lcyhuZXdQcm9wcy5oaWdobGlnaHRlZExpbmVzKTtcbiAgICB9XG4gICAgaWYgKGRpZmZFZGl0b3JVcGRhdGVkIHx8IG9sZFByb3BzLm9mZnNldHMgIT09IG5ld1Byb3BzLm9mZnNldHMpIHtcbiAgICAgIHRoaXMuX3NldE9mZnNldHMobmV3UHJvcHMub2Zmc2V0cyk7XG4gICAgfVxuICAgIGlmIChvbGRQcm9wcy5pbmxpbmVFbGVtZW50cyAhPT0gbmV3UHJvcHMuaW5saW5lRWxlbWVudHMpIHtcbiAgICAgIHRoaXMuX3JlbmRlckNvbXBvbmVudHNJbmxpbmUobmV3UHJvcHMuaW5saW5lRWxlbWVudHMpO1xuICAgIH1cbiAgfVxuXG4gIHNjcm9sbFRvU2NyZWVuTGluZShzY3JlZW5MaW5lOiBudW1iZXIpOiB2b2lkIHtcbiAgICBpbnZhcmlhbnQodGhpcy5fZGlmZlZpZXdFZGl0b3IsICdkaWZmVmlld0VkaXRvciBoYXMgbm90IGJlZW4gc2V0dXAgeWV0LicpO1xuICAgIHRoaXMuX2RpZmZWaWV3RWRpdG9yLnNjcm9sbFRvU2NyZWVuTGluZShzY3JlZW5MaW5lKTtcbiAgfVxuXG4gIF9zZXRUZXh0Q29udGVudChmaWxlUGF0aDogc3RyaW5nLCB0ZXh0OiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpbnZhcmlhbnQodGhpcy5fZGlmZlZpZXdFZGl0b3IpO1xuICAgIHRoaXMuX2RpZmZWaWV3RWRpdG9yLnNldEZpbGVDb250ZW50cyhmaWxlUGF0aCwgdGV4dCk7XG4gIH1cblxuICBfc2V0SGlnaGxpZ2h0ZWRMaW5lcyhoaWdobGlnaHRlZExpbmVzOiBIaWdobGlnaHRlZExpbmVzKTogdm9pZCB7XG4gICAgaW52YXJpYW50KHRoaXMuX2RpZmZWaWV3RWRpdG9yKTtcbiAgICB0aGlzLl9kaWZmVmlld0VkaXRvci5zZXRIaWdobGlnaHRlZExpbmVzKGhpZ2hsaWdodGVkTGluZXMuYWRkZWQsIGhpZ2hsaWdodGVkTGluZXMucmVtb3ZlZCk7XG4gIH1cblxuICBfc2V0T2Zmc2V0cyhvZmZzZXRzOiBPZmZzZXRNYXApOiB2b2lkIHtcbiAgICBpbnZhcmlhbnQodGhpcy5fZGlmZlZpZXdFZGl0b3IpO1xuICAgIHRoaXMuX2RpZmZWaWV3RWRpdG9yLnNldE9mZnNldHMob2Zmc2V0cyk7XG4gIH1cblxuICBhc3luYyBfcmVuZGVyQ29tcG9uZW50c0lubGluZShlbGVtZW50czogQXJyYXk8T2JqZWN0Pik6IFByb21pc2Uge1xuICAgIGNvbnN0IGRpZmZWaWV3RWRpdG9yID0gdGhpcy5fZGlmZlZpZXdFZGl0b3I7XG4gICAgaW52YXJpYW50KGRpZmZWaWV3RWRpdG9yKTtcbiAgICBjb25zdCBjb21wb25lbnRzID0gYXdhaXQgZGlmZlZpZXdFZGl0b3IucmVuZGVySW5saW5lQ29tcG9uZW50cyhlbGVtZW50cyk7XG4gICAgaWYgKCF0aGlzLl9pc01vdW50ZWQgfHwgZWxlbWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZGlmZlZpZXdFZGl0b3IuYXR0YWNoSW5saW5lQ29tcG9uZW50cyhjb21wb25lbnRzKTtcbiAgICBjb25zdCBvZmZzZXRzRnJvbUNvbXBvbmVudHMgPSBuZXcgTWFwKCk7XG5cbiAgICAvLyBUT0RPKGdlbmRyb24pOlxuICAgIC8vIFRoZSBSZWFjdCBjb21wb25lbnRzIGFyZW4ndCBhY3R1YWxseSByZW5kZXJlZCBpbiB0aGUgRE9NIHVudGlsIHRoZVxuICAgIC8vIGFzc29jaWF0ZWQgZGVjb3JhdGlvbnMgYXJlIGF0dGFjaGVkIHRvIHRoZSBUZXh0RWRpdG9yLlxuICAgIC8vIChzZWUgRGlmZlZpZXdFZGl0b3IuYXR0YWNoSW5saW5lQ29tcG9uZW50cylcbiAgICAvLyBUaGVyZSdzIG5vIGVhc3kgd2F5IHRvIGxpc3RlbiBmb3IgdGhpcyBldmVudCwgc28ganVzdCB3YWl0IDAuNXMgcGVyIGNvbXBvbmVudC5cbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGlmICghdGhpcy5faXNNb3VudGVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGVkaXRvcldpZHRoID0gdGhpcy5nZXRFZGl0b3JEb21FbGVtZW50KCkuY2xpZW50V2lkdGg7XG4gICAgICBjb21wb25lbnRzLmZvckVhY2goZWxlbWVudCA9PiB7XG4gICAgICAgIGNvbnN0IGRvbU5vZGUgPSBSZWFjdERPTS5maW5kRE9NTm9kZShlbGVtZW50LmNvbXBvbmVudCk7XG4gICAgICAgIC8vIGdldCB0aGUgaGVpZ2h0IG9mIHRoZSBjb21wb25lbnQgYWZ0ZXIgaXQgaGFzIGJlZW4gcmVuZGVyZWQgaW4gdGhlIERPTVxuICAgICAgICBjb25zdCBjb21wb25lbnRIZWlnaHQgPSBkb21Ob2RlLmNsaWVudEhlaWdodDtcbiAgICAgICAgY29uc3QgbGluZUhlaWdodCA9IGRpZmZWaWV3RWRpdG9yLmdldExpbmVIZWlnaHRJblBpeGVscygpO1xuXG4gICAgICAgIC8vIFRPRE8oZ2VuZHJvbik6XG4gICAgICAgIC8vIFNldCB0aGUgd2lkdGggb2YgdGhlIG92ZXJsYXkgc28gdGhhdCBpdCB3b24ndCByZXNpemUgd2hlbiB3ZVxuICAgICAgICAvLyB0eXBlIGNvbW1lbnQgcmVwbGllcyBpbnRvIHRoZSB0ZXh0IGVkaXRvci5cbiAgICAgICAgZG9tTm9kZS5zdHlsZS53aWR0aCA9IChlZGl0b3JXaWR0aCAtIDcwKSArICdweCc7XG5cbiAgICAgICAgLy8gY2FsY3VsYXRlIHRoZSBudW1iZXIgb2YgbGluZXMgd2UgbmVlZCB0byBpbnNlcnQgaW4gdGhlIGJ1ZmZlciB0byBtYWtlIHJvb21cbiAgICAgICAgLy8gZm9yIHRoZSBjb21wb25lbnQgdG8gYmUgZGlzcGxheWVkXG4gICAgICAgIGNvbnN0IG9mZnNldCA9IE1hdGguY2VpbChjb21wb25lbnRIZWlnaHQgLyBsaW5lSGVpZ2h0KTtcbiAgICAgICAgY29uc3Qgb2Zmc2V0Um93ID0gZWxlbWVudC5idWZmZXJSb3c7XG4gICAgICAgIG9mZnNldHNGcm9tQ29tcG9uZW50cy5zZXQob2Zmc2V0Um93LCBvZmZzZXQpO1xuXG4gICAgICAgIC8vIFBoYWJyaWNhdG9yQ29tbWVudHNMaXN0IGlzIHJlbmRlcmVkIHdpdGggdmlzaWJpbGl0eTogaGlkZGVuLlxuICAgICAgICBkb21Ob2RlLnN0eWxlLnZpc2liaWxpdHkgPSAndmlzaWJsZSc7XG4gICAgICB9KTtcbiAgICAgIHRoaXMucHJvcHMuaGFuZGxlTmV3T2Zmc2V0cyhvZmZzZXRzRnJvbUNvbXBvbmVudHMpO1xuICAgIH0sIGNvbXBvbmVudHMubGVuZ3RoICogNTAwKTtcbiAgfVxuXG4gIGdldEVkaXRvck1vZGVsKCk6IGF0b20kVGV4dEVkaXRvciB7XG4gICAgcmV0dXJuIHRoaXMucmVmc1snZWRpdG9yJ10uZ2V0TW9kZWwoKTtcbiAgfVxuXG4gIGdldEVkaXRvckRvbUVsZW1lbnQoKTogYXRvbSRUZXh0RWRpdG9yRWxlbWVudCB7XG4gICAgcmV0dXJuIHRoaXMucmVmc1snZWRpdG9yJ10uZ2V0RWxlbWVudCgpO1xuICB9XG59XG4iXX0=