var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _reactForAtom = require('react-for-atom');

var _atom = require('atom');

var _atomHelpers = require('../../../atom-helpers');

var PropTypes = _reactForAtom.React.PropTypes;

var AtomTextEditor = (function (_React$Component) {
  _inherits(AtomTextEditor, _React$Component);

  _createClass(AtomTextEditor, null, [{
    key: 'propTypes',
    value: {
      gutterHidden: PropTypes.bool.isRequired,
      path: PropTypes.string,
      readOnly: PropTypes.bool.isRequired,
      textBuffer: PropTypes.instanceOf(_atom.TextBuffer)
    },
    enumerable: true
  }, {
    key: 'defaultProps',
    value: {
      gutterHidden: false,
      lineNumberGutterVisible: true,
      readOnly: false
    },
    enumerable: true
  }]);

  function AtomTextEditor(props) {
    _classCallCheck(this, AtomTextEditor);

    _get(Object.getPrototypeOf(AtomTextEditor.prototype), 'constructor', this).call(this, props);

    this._textBuffer = props.textBuffer || new _atom.TextBuffer();
    if (props.path) {
      this._textBuffer.setPath(props.path);
    }

    var textEditorParams = {
      buffer: this._textBuffer,
      lineNumberGutterVisible: !this.props.gutterHidden
    };
    var textEditor = (0, _atomHelpers.createTextEditor)(textEditorParams);

    // As of the introduction of atom.workspace.buildTextEditor(), it is no longer possible to
    // subclass TextEditor to create a ReadOnlyTextEditor. Instead, the way to achieve this effect
    // is to create an ordinary TextEditor and then override any methods that would allow it to
    // change its contents.
    // TODO: https://github.com/atom/atom/issues/9237.
    if (props.readOnly) {
      // Cancel insert events to prevent typing in the text editor and disallow editing (read-only).
      textEditor.onWillInsertText(function (event) {
        event.cancel();
      });

      var doNothing = function doNothing() {};

      // Make pasting in the text editor a no-op to disallow editing (read-only).
      textEditor.pasteText = doNothing;

      // Make delete key presses in the text editor a no-op to disallow editing (read-only).
      textEditor['delete'] = doNothing;

      // Make backspace key presses in the text editor a no-op to disallow editing (read-only).
      textEditor.backspace = doNothing;
    }

    this._textEditorModel = textEditor;
  }

  _createClass(AtomTextEditor, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var atomTextEditorElement = _reactForAtom.React.findDOMNode(this);
      atomTextEditorElement.setModel(this._textEditorModel);

      // HACK! This is a workaround for the ViewRegistry where Atom has a default view provider for
      // TextEditor (that we cannot override), which is responsible for creating the view associated
      // with the TextEditor that we create and adding a mapping for it in its private views map.
      // To workaround this, we reach into the internals of the ViewRegistry and update the entry in
      // the map manually. Filed as https://github.com/atom/atom/issues/7954.
      // $FlowFixMe
      atom.views.views.set(this._textEditorModel, atomTextEditorElement);
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      if (nextProps.path !== this.props.path) {
        this._textBuffer.setPath(nextProps.path);
      }
      if (nextProps.gutterHidden !== this.props.gutterHidden) {
        this._textEditorModel.setLineNumberGutterVisible(nextProps.gutterHidden);
      }
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this._textEditorModel.destroy();
    }
  }, {
    key: 'getTextBuffer',
    value: function getTextBuffer() {
      return this._textBuffer;
    }
  }, {
    key: 'getModel',
    value: function getModel() {
      return this._textEditorModel;
    }
  }, {
    key: 'render',
    value: function render() {
      return _reactForAtom.React.createElement('atom-text-editor', null);
    }

    // This component wraps the imperative API of `<atom-text-editor>`, and so React's rendering
    // should always pass because this subtree won't change.
  }, {
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps, nextState) {
      return false;
    }
  }]);

  return AtomTextEditor;
})(_reactForAtom.React.Component);

module.exports = AtomTextEditor;
//# sourceMappingURL=data:application/json;base64,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QkFBZTtBQUNyQixhQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQztLQUM5Qjs7O1dBRUssa0JBQWlCO0FBQ3JCLGFBQ0UsMkRBQW9CLENBQ3BCO0tBQ0g7Ozs7OztXQUlvQiwrQkFBQyxTQUFpQixFQUFFLFNBQWlCLEVBQVc7QUFDbkUsYUFBTyxLQUFLLENBQUM7S0FDZDs7O1NBdEdHLGNBQWM7R0FBUyxvQkFBTSxTQUFTOztBQTBHNUMsTUFBTSxDQUFDLE9BQU8sR0FBRyxjQUFjLENBQUMiLCJmaWxlIjoiQXRvbVRleHRFZGl0b3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge1JlYWN0fSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQge1RleHRCdWZmZXJ9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHtjcmVhdGVUZXh0RWRpdG9yfSBmcm9tICcuLi8uLi8uLi9hdG9tLWhlbHBlcnMnO1xuXG5jb25zdCB7UHJvcFR5cGVzfSA9IFJlYWN0O1xuXG5jbGFzcyBBdG9tVGV4dEVkaXRvciBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cbiAgX3RleHRCdWZmZXI6IFRleHRCdWZmZXI7XG4gIF90ZXh0RWRpdG9yTW9kZWw6IFRleHRFZGl0b3I7XG5cbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICBndXR0ZXJIaWRkZW46IFByb3BUeXBlcy5ib29sLmlzUmVxdWlyZWQsXG4gICAgcGF0aDogUHJvcFR5cGVzLnN0cmluZyxcbiAgICByZWFkT25seTogUHJvcFR5cGVzLmJvb2wuaXNSZXF1aXJlZCxcbiAgICB0ZXh0QnVmZmVyOiBQcm9wVHlwZXMuaW5zdGFuY2VPZihUZXh0QnVmZmVyKSxcbiAgfTtcblxuICBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgIGd1dHRlckhpZGRlbjogZmFsc2UsXG4gICAgbGluZU51bWJlckd1dHRlclZpc2libGU6IHRydWUsXG4gICAgcmVhZE9ubHk6IGZhbHNlLFxuICB9O1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBPYmplY3QpIHtcbiAgICBzdXBlcihwcm9wcyk7XG5cbiAgICB0aGlzLl90ZXh0QnVmZmVyID0gcHJvcHMudGV4dEJ1ZmZlciB8fCBuZXcgVGV4dEJ1ZmZlcigpO1xuICAgIGlmIChwcm9wcy5wYXRoKSB7XG4gICAgICB0aGlzLl90ZXh0QnVmZmVyLnNldFBhdGgocHJvcHMucGF0aCk7XG4gICAgfVxuXG4gICAgY29uc3QgdGV4dEVkaXRvclBhcmFtcyA9IHtcbiAgICAgIGJ1ZmZlcjogdGhpcy5fdGV4dEJ1ZmZlcixcbiAgICAgIGxpbmVOdW1iZXJHdXR0ZXJWaXNpYmxlOiAhdGhpcy5wcm9wcy5ndXR0ZXJIaWRkZW4sXG4gICAgfTtcbiAgICBjb25zdCB0ZXh0RWRpdG9yID0gY3JlYXRlVGV4dEVkaXRvcih0ZXh0RWRpdG9yUGFyYW1zKTtcblxuICAgIC8vIEFzIG9mIHRoZSBpbnRyb2R1Y3Rpb24gb2YgYXRvbS53b3Jrc3BhY2UuYnVpbGRUZXh0RWRpdG9yKCksIGl0IGlzIG5vIGxvbmdlciBwb3NzaWJsZSB0b1xuICAgIC8vIHN1YmNsYXNzIFRleHRFZGl0b3IgdG8gY3JlYXRlIGEgUmVhZE9ubHlUZXh0RWRpdG9yLiBJbnN0ZWFkLCB0aGUgd2F5IHRvIGFjaGlldmUgdGhpcyBlZmZlY3RcbiAgICAvLyBpcyB0byBjcmVhdGUgYW4gb3JkaW5hcnkgVGV4dEVkaXRvciBhbmQgdGhlbiBvdmVycmlkZSBhbnkgbWV0aG9kcyB0aGF0IHdvdWxkIGFsbG93IGl0IHRvXG4gICAgLy8gY2hhbmdlIGl0cyBjb250ZW50cy5cbiAgICAvLyBUT0RPOiBodHRwczovL2dpdGh1Yi5jb20vYXRvbS9hdG9tL2lzc3Vlcy85MjM3LlxuICAgIGlmIChwcm9wcy5yZWFkT25seSkge1xuICAgICAgLy8gQ2FuY2VsIGluc2VydCBldmVudHMgdG8gcHJldmVudCB0eXBpbmcgaW4gdGhlIHRleHQgZWRpdG9yIGFuZCBkaXNhbGxvdyBlZGl0aW5nIChyZWFkLW9ubHkpLlxuICAgICAgdGV4dEVkaXRvci5vbldpbGxJbnNlcnRUZXh0KGV2ZW50ID0+IHtcbiAgICAgICAgZXZlbnQuY2FuY2VsKCk7XG4gICAgICB9KTtcblxuICAgICAgY29uc3QgZG9Ob3RoaW5nID0gKCkgPT4ge307XG5cbiAgICAgIC8vIE1ha2UgcGFzdGluZyBpbiB0aGUgdGV4dCBlZGl0b3IgYSBuby1vcCB0byBkaXNhbGxvdyBlZGl0aW5nIChyZWFkLW9ubHkpLlxuICAgICAgdGV4dEVkaXRvci5wYXN0ZVRleHQgPSBkb05vdGhpbmc7XG5cbiAgICAgIC8vIE1ha2UgZGVsZXRlIGtleSBwcmVzc2VzIGluIHRoZSB0ZXh0IGVkaXRvciBhIG5vLW9wIHRvIGRpc2FsbG93IGVkaXRpbmcgKHJlYWQtb25seSkuXG4gICAgICB0ZXh0RWRpdG9yLmRlbGV0ZSA9IGRvTm90aGluZztcblxuICAgICAgLy8gTWFrZSBiYWNrc3BhY2Uga2V5IHByZXNzZXMgaW4gdGhlIHRleHQgZWRpdG9yIGEgbm8tb3AgdG8gZGlzYWxsb3cgZWRpdGluZyAocmVhZC1vbmx5KS5cbiAgICAgIHRleHRFZGl0b3IuYmFja3NwYWNlID0gZG9Ob3RoaW5nO1xuICAgIH1cblxuICAgIHRoaXMuX3RleHRFZGl0b3JNb2RlbCA9IHRleHRFZGl0b3I7XG4gIH1cblxuICBjb21wb25lbnREaWRNb3VudCgpOiB2b2lkIHtcbiAgICBjb25zdCBhdG9tVGV4dEVkaXRvckVsZW1lbnQgPSBSZWFjdC5maW5kRE9NTm9kZSh0aGlzKTtcbiAgICBhdG9tVGV4dEVkaXRvckVsZW1lbnQuc2V0TW9kZWwodGhpcy5fdGV4dEVkaXRvck1vZGVsKTtcblxuICAgIC8vIEhBQ0shIFRoaXMgaXMgYSB3b3JrYXJvdW5kIGZvciB0aGUgVmlld1JlZ2lzdHJ5IHdoZXJlIEF0b20gaGFzIGEgZGVmYXVsdCB2aWV3IHByb3ZpZGVyIGZvclxuICAgIC8vIFRleHRFZGl0b3IgKHRoYXQgd2UgY2Fubm90IG92ZXJyaWRlKSwgd2hpY2ggaXMgcmVzcG9uc2libGUgZm9yIGNyZWF0aW5nIHRoZSB2aWV3IGFzc29jaWF0ZWRcbiAgICAvLyB3aXRoIHRoZSBUZXh0RWRpdG9yIHRoYXQgd2UgY3JlYXRlIGFuZCBhZGRpbmcgYSBtYXBwaW5nIGZvciBpdCBpbiBpdHMgcHJpdmF0ZSB2aWV3cyBtYXAuXG4gICAgLy8gVG8gd29ya2Fyb3VuZCB0aGlzLCB3ZSByZWFjaCBpbnRvIHRoZSBpbnRlcm5hbHMgb2YgdGhlIFZpZXdSZWdpc3RyeSBhbmQgdXBkYXRlIHRoZSBlbnRyeSBpblxuICAgIC8vIHRoZSBtYXAgbWFudWFsbHkuIEZpbGVkIGFzIGh0dHBzOi8vZ2l0aHViLmNvbS9hdG9tL2F0b20vaXNzdWVzLzc5NTQuXG4gICAgLy8gJEZsb3dGaXhNZVxuICAgIGF0b20udmlld3Mudmlld3Muc2V0KHRoaXMuX3RleHRFZGl0b3JNb2RlbCwgYXRvbVRleHRFZGl0b3JFbGVtZW50KTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV4dFByb3BzOiBPYmplY3QpOiB2b2lkIHtcbiAgICBpZiAobmV4dFByb3BzLnBhdGggIT09IHRoaXMucHJvcHMucGF0aCkge1xuICAgICAgdGhpcy5fdGV4dEJ1ZmZlci5zZXRQYXRoKG5leHRQcm9wcy5wYXRoKTtcbiAgICB9XG4gICAgaWYgKG5leHRQcm9wcy5ndXR0ZXJIaWRkZW4gIT09IHRoaXMucHJvcHMuZ3V0dGVySGlkZGVuKSB7XG4gICAgICB0aGlzLl90ZXh0RWRpdG9yTW9kZWwuc2V0TGluZU51bWJlckd1dHRlclZpc2libGUobmV4dFByb3BzLmd1dHRlckhpZGRlbik7XG4gICAgfVxuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKTogdm9pZCB7XG4gICAgdGhpcy5fdGV4dEVkaXRvck1vZGVsLmRlc3Ryb3koKTtcbiAgfVxuXG4gIGdldFRleHRCdWZmZXIoKTogVGV4dEJ1ZmZlciB7XG4gICAgcmV0dXJuIHRoaXMuX3RleHRCdWZmZXI7XG4gIH1cblxuICBnZXRNb2RlbCgpOiBUZXh0RWRpdG9yIHtcbiAgICByZXR1cm4gdGhpcy5fdGV4dEVkaXRvck1vZGVsO1xuICB9XG5cbiAgcmVuZGVyKCk6IFJlYWN0RWxlbWVudCB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxhdG9tLXRleHQtZWRpdG9yIC8+XG4gICAgKTtcbiAgfVxuXG4gIC8vIFRoaXMgY29tcG9uZW50IHdyYXBzIHRoZSBpbXBlcmF0aXZlIEFQSSBvZiBgPGF0b20tdGV4dC1lZGl0b3I+YCwgYW5kIHNvIFJlYWN0J3MgcmVuZGVyaW5nXG4gIC8vIHNob3VsZCBhbHdheXMgcGFzcyBiZWNhdXNlIHRoaXMgc3VidHJlZSB3b24ndCBjaGFuZ2UuXG4gIHNob3VsZENvbXBvbmVudFVwZGF0ZShuZXh0UHJvcHM6IE9iamVjdCwgbmV4dFN0YXRlOiBPYmplY3QpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEF0b21UZXh0RWRpdG9yO1xuIl19