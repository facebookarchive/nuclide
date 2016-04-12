Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

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

var _nuclideUiLibAtomTextEditor = require('../../nuclide-ui/lib/AtomTextEditor');

var _rx = require('rx');

var _rx2 = _interopRequireDefault(_rx);

var ENTER_KEY_CODE = 13;

var OutputTable = (function (_React$Component) {
  _inherits(OutputTable, _React$Component);

  function OutputTable(props) {
    _classCallCheck(this, OutputTable);

    _get(Object.getPrototypeOf(OutputTable.prototype), 'constructor', this).call(this, props);
    this._handleTextEditor = this._handleTextEditor.bind(this);
    this._handleKeyDown = this._handleKeyDown.bind(this);
  }

  _createClass(OutputTable, [{
    key: '_handleTextEditor',
    value: function _handleTextEditor(component) {
      if (this._keySubscription) {
        this._textEditorModel = null;
        this._keySubscription.dispose();
      }
      if (component) {
        this._textEditorModel = component.getModel();
        var el = _reactForAtom.ReactDOM.findDOMNode(component);
        this._keySubscription = _rx2['default'].Observable.fromEvent(el, 'keydown').subscribe(this._handleKeyDown);
      }
    }
  }, {
    key: '_handleKeyDown',
    value: function _handleKeyDown(event) {
      var editor = this._textEditorModel;
      if (editor == null) {
        return;
      }
      if (event.which === ENTER_KEY_CODE) {
        event.preventDefault();
        event.stopImmediatePropagation();

        if (event.ctrlKey) {
          editor.insertNewline();
          return;
        }

        // Clear the text and trigger the `onSubmit` callback
        var text = editor.getText();

        if (text === '') {
          return;
        }

        editor.setText(''); // Clear the text field.
        this.props.onSubmit(text);
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var grammar = this.props.scopeName == null ? null : atom.grammars.grammarForScopeName(this.props.scopeName);
      return _reactForAtom.React.createElement(
        'div',
        { className: 'nuclide-console-input-wrapper' },
        _reactForAtom.React.createElement(_nuclideUiLibAtomTextEditor.AtomTextEditor, {
          ref: this._handleTextEditor,
          grammar: grammar,
          gutterHidden: true,
          autoGrow: true,
          lineNumberGutterVisible: false
        })
      );
    }
  }]);

  return OutputTable;
})(_reactForAtom.React.Component);

exports['default'] = OutputTable;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIklucHV0QXJlYS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzRCQVc4QixnQkFBZ0I7OzBDQUNqQixxQ0FBcUM7O2tCQUNuRCxJQUFJOzs7O0FBT25CLElBQU0sY0FBYyxHQUFHLEVBQUUsQ0FBQzs7SUFFTCxXQUFXO1lBQVgsV0FBVzs7QUFNbkIsV0FOUSxXQUFXLENBTWxCLEtBQVksRUFBRTswQkFOUCxXQUFXOztBQU81QiwrQkFQaUIsV0FBVyw2Q0FPdEIsS0FBSyxFQUFFO0FBQ2IsQUFBQyxRQUFJLENBQU8saUJBQWlCLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNsRSxBQUFDLFFBQUksQ0FBTyxjQUFjLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDN0Q7O2VBVmtCLFdBQVc7O1dBWWIsMkJBQUMsU0FBMEIsRUFBUTtBQUNsRCxVQUFJLElBQUksQ0FBQyxnQkFBZ0IsRUFBRTtBQUN6QixZQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDO0FBQzdCLFlBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQztPQUNqQztBQUNELFVBQUksU0FBUyxFQUFFO0FBQ2IsWUFBSSxDQUFDLGdCQUFnQixHQUFHLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztBQUM3QyxZQUFNLEVBQUUsR0FBRyx1QkFBUyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDM0MsWUFBSSxDQUFDLGdCQUFnQixHQUFHLGdCQUFHLFVBQVUsQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUFFLFNBQVMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7T0FDL0Y7S0FDRjs7O1dBRWEsd0JBQUMsS0FBb0IsRUFBUTtBQUN6QyxVQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUM7QUFDckMsVUFBSSxNQUFNLElBQUksSUFBSSxFQUFFO0FBQ2xCLGVBQU87T0FDUjtBQUNELFVBQUksS0FBSyxDQUFDLEtBQUssS0FBSyxjQUFjLEVBQUU7QUFDbEMsYUFBSyxDQUFDLGNBQWMsRUFBRSxDQUFDO0FBQ3ZCLGFBQUssQ0FBQyx3QkFBd0IsRUFBRSxDQUFDOztBQUVqQyxZQUFJLEtBQUssQ0FBQyxPQUFPLEVBQUU7QUFDakIsZ0JBQU0sQ0FBQyxhQUFhLEVBQUUsQ0FBQztBQUN2QixpQkFBTztTQUNSOzs7QUFHRCxZQUFNLElBQUksR0FBRyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7O0FBRTlCLFlBQUksSUFBSSxLQUFLLEVBQUUsRUFBRTtBQUNmLGlCQUFPO1NBQ1I7O0FBRUQsY0FBTSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNuQixZQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztPQUMzQjtLQUNGOzs7V0FFSyxrQkFBa0I7QUFDdEIsVUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLElBQUksSUFBSSxHQUN4QyxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ25FLGFBQ0U7O1VBQUssU0FBUyxFQUFDLCtCQUErQjtRQUM1QztBQUNFLGFBQUcsRUFBRSxJQUFJLENBQUMsaUJBQWlCLEFBQUM7QUFDNUIsaUJBQU8sRUFBRSxPQUFPLEFBQUM7QUFDakIsc0JBQVksTUFBQTtBQUNaLGtCQUFRLE1BQUE7QUFDUixpQ0FBdUIsRUFBRSxLQUFLLEFBQUM7VUFDL0I7T0FDRSxDQUNOO0tBQ0g7OztTQWhFa0IsV0FBVztHQUFTLG9CQUFNLFNBQVM7O3FCQUFuQyxXQUFXIiwiZmlsZSI6IklucHV0QXJlYS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB7UmVhY3QsIFJlYWN0RE9NfSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQge0F0b21UZXh0RWRpdG9yfSBmcm9tICcuLi8uLi9udWNsaWRlLXVpL2xpYi9BdG9tVGV4dEVkaXRvcic7XG5pbXBvcnQgUnggZnJvbSAncngnO1xuXG50eXBlIFByb3BzID0ge1xuICBvblN1Ym1pdDogKHZhbHVlOiBzdHJpbmcpID0+IG1peGVkO1xuICBzY29wZU5hbWU6ID9zdHJpbmc7XG59O1xuXG5jb25zdCBFTlRFUl9LRVlfQ09ERSA9IDEzO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPdXRwdXRUYWJsZSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHByb3BzOiBQcm9wcztcblxuICBfa2V5U3Vic2NyaXB0aW9uOiA/SURpc3Bvc2FibGU7XG4gIF90ZXh0RWRpdG9yTW9kZWw6ID9hdG9tJFRleHRFZGl0b3I7XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IFByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgICh0aGlzOiBhbnkpLl9oYW5kbGVUZXh0RWRpdG9yID0gdGhpcy5faGFuZGxlVGV4dEVkaXRvci5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9oYW5kbGVLZXlEb3duID0gdGhpcy5faGFuZGxlS2V5RG93bi5iaW5kKHRoaXMpO1xuICB9XG5cbiAgX2hhbmRsZVRleHRFZGl0b3IoY29tcG9uZW50OiA/QXRvbVRleHRFZGl0b3IpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fa2V5U3Vic2NyaXB0aW9uKSB7XG4gICAgICB0aGlzLl90ZXh0RWRpdG9yTW9kZWwgPSBudWxsO1xuICAgICAgdGhpcy5fa2V5U3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICB9XG4gICAgaWYgKGNvbXBvbmVudCkge1xuICAgICAgdGhpcy5fdGV4dEVkaXRvck1vZGVsID0gY29tcG9uZW50LmdldE1vZGVsKCk7XG4gICAgICBjb25zdCBlbCA9IFJlYWN0RE9NLmZpbmRET01Ob2RlKGNvbXBvbmVudCk7XG4gICAgICB0aGlzLl9rZXlTdWJzY3JpcHRpb24gPSBSeC5PYnNlcnZhYmxlLmZyb21FdmVudChlbCwgJ2tleWRvd24nKS5zdWJzY3JpYmUodGhpcy5faGFuZGxlS2V5RG93bik7XG4gICAgfVxuICB9XG5cbiAgX2hhbmRsZUtleURvd24oZXZlbnQ6IEtleWJvYXJkRXZlbnQpOiB2b2lkIHtcbiAgICBjb25zdCBlZGl0b3IgPSB0aGlzLl90ZXh0RWRpdG9yTW9kZWw7XG4gICAgaWYgKGVkaXRvciA9PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChldmVudC53aGljaCA9PT0gRU5URVJfS0VZX0NPREUpIHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBldmVudC5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcblxuICAgICAgaWYgKGV2ZW50LmN0cmxLZXkpIHtcbiAgICAgICAgZWRpdG9yLmluc2VydE5ld2xpbmUoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBDbGVhciB0aGUgdGV4dCBhbmQgdHJpZ2dlciB0aGUgYG9uU3VibWl0YCBjYWxsYmFja1xuICAgICAgY29uc3QgdGV4dCA9IGVkaXRvci5nZXRUZXh0KCk7XG5cbiAgICAgIGlmICh0ZXh0ID09PSAnJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGVkaXRvci5zZXRUZXh0KCcnKTsgLy8gQ2xlYXIgdGhlIHRleHQgZmllbGQuXG4gICAgICB0aGlzLnByb3BzLm9uU3VibWl0KHRleHQpO1xuICAgIH1cbiAgfVxuXG4gIHJlbmRlcigpOiA/UmVhY3RFbGVtZW50IHtcbiAgICBjb25zdCBncmFtbWFyID0gdGhpcy5wcm9wcy5zY29wZU5hbWUgPT0gbnVsbFxuICAgICAgPyBudWxsIDogYXRvbS5ncmFtbWFycy5ncmFtbWFyRm9yU2NvcGVOYW1lKHRoaXMucHJvcHMuc2NvcGVOYW1lKTtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLWNvbnNvbGUtaW5wdXQtd3JhcHBlclwiPlxuICAgICAgICA8QXRvbVRleHRFZGl0b3JcbiAgICAgICAgICByZWY9e3RoaXMuX2hhbmRsZVRleHRFZGl0b3J9XG4gICAgICAgICAgZ3JhbW1hcj17Z3JhbW1hcn1cbiAgICAgICAgICBndXR0ZXJIaWRkZW5cbiAgICAgICAgICBhdXRvR3Jvd1xuICAgICAgICAgIGxpbmVOdW1iZXJHdXR0ZXJWaXNpYmxlPXtmYWxzZX1cbiAgICAgICAgLz5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxufVxuIl19