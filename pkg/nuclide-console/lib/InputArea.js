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

var _reactivexRxjs = require('@reactivex/rxjs');

var _reactivexRxjs2 = _interopRequireDefault(_reactivexRxjs);

var _nuclideCommons = require('../../nuclide-commons');

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
        this._keySubscription = new _nuclideCommons.DisposableSubscription(_reactivexRxjs2['default'].Observable.fromEvent(el, 'keydown').subscribe(this._handleKeyDown));
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
//# sourceMappingURL=data:application/json;base64,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XG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge1JlYWN0LCBSZWFjdERPTX0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuaW1wb3J0IHtBdG9tVGV4dEVkaXRvcn0gZnJvbSAnLi4vLi4vbnVjbGlkZS11aS9saWIvQXRvbVRleHRFZGl0b3InO1xuaW1wb3J0IFJ4IGZyb20gJ0ByZWFjdGl2ZXgvcnhqcyc7XG5pbXBvcnQge0Rpc3Bvc2FibGVTdWJzY3JpcHRpb259IGZyb20gJy4uLy4uL251Y2xpZGUtY29tbW9ucyc7XG5cbnR5cGUgUHJvcHMgPSB7XG4gIG9uU3VibWl0OiAodmFsdWU6IHN0cmluZykgPT4gbWl4ZWQ7XG4gIHNjb3BlTmFtZTogP3N0cmluZztcbn07XG5cbmNvbnN0IEVOVEVSX0tFWV9DT0RFID0gMTM7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE91dHB1dFRhYmxlIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgcHJvcHM6IFByb3BzO1xuXG4gIF9rZXlTdWJzY3JpcHRpb246ID9JRGlzcG9zYWJsZTtcbiAgX3RleHRFZGl0b3JNb2RlbDogP2F0b20kVGV4dEVkaXRvcjtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogUHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgKHRoaXM6IGFueSkuX2hhbmRsZVRleHRFZGl0b3IgPSB0aGlzLl9oYW5kbGVUZXh0RWRpdG9yLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX2hhbmRsZUtleURvd24gPSB0aGlzLl9oYW5kbGVLZXlEb3duLmJpbmQodGhpcyk7XG4gIH1cblxuICBfaGFuZGxlVGV4dEVkaXRvcihjb21wb25lbnQ6ID9BdG9tVGV4dEVkaXRvcik6IHZvaWQge1xuICAgIGlmICh0aGlzLl9rZXlTdWJzY3JpcHRpb24pIHtcbiAgICAgIHRoaXMuX3RleHRFZGl0b3JNb2RlbCA9IG51bGw7XG4gICAgICB0aGlzLl9rZXlTdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgIH1cbiAgICBpZiAoY29tcG9uZW50KSB7XG4gICAgICB0aGlzLl90ZXh0RWRpdG9yTW9kZWwgPSBjb21wb25lbnQuZ2V0TW9kZWwoKTtcbiAgICAgIGNvbnN0IGVsID0gUmVhY3RET00uZmluZERPTU5vZGUoY29tcG9uZW50KTtcbiAgICAgIHRoaXMuX2tleVN1YnNjcmlwdGlvbiA9IG5ldyBEaXNwb3NhYmxlU3Vic2NyaXB0aW9uKFxuICAgICAgICBSeC5PYnNlcnZhYmxlLmZyb21FdmVudChlbCwgJ2tleWRvd24nKS5zdWJzY3JpYmUodGhpcy5faGFuZGxlS2V5RG93biksXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIF9oYW5kbGVLZXlEb3duKGV2ZW50OiBLZXlib2FyZEV2ZW50KTogdm9pZCB7XG4gICAgY29uc3QgZWRpdG9yID0gdGhpcy5fdGV4dEVkaXRvck1vZGVsO1xuICAgIGlmIChlZGl0b3IgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoZXZlbnQud2hpY2ggPT09IEVOVEVSX0tFWV9DT0RFKSB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgZXZlbnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG5cbiAgICAgIGlmIChldmVudC5jdHJsS2V5KSB7XG4gICAgICAgIGVkaXRvci5pbnNlcnROZXdsaW5lKCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gQ2xlYXIgdGhlIHRleHQgYW5kIHRyaWdnZXIgdGhlIGBvblN1Ym1pdGAgY2FsbGJhY2tcbiAgICAgIGNvbnN0IHRleHQgPSBlZGl0b3IuZ2V0VGV4dCgpO1xuXG4gICAgICBpZiAodGV4dCA9PT0gJycpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBlZGl0b3Iuc2V0VGV4dCgnJyk7IC8vIENsZWFyIHRoZSB0ZXh0IGZpZWxkLlxuICAgICAgdGhpcy5wcm9wcy5vblN1Ym1pdCh0ZXh0KTtcbiAgICB9XG4gIH1cblxuICByZW5kZXIoKTogP1JlYWN0LkVsZW1lbnQge1xuICAgIGNvbnN0IGdyYW1tYXIgPSB0aGlzLnByb3BzLnNjb3BlTmFtZSA9PSBudWxsXG4gICAgICA/IG51bGwgOiBhdG9tLmdyYW1tYXJzLmdyYW1tYXJGb3JTY29wZU5hbWUodGhpcy5wcm9wcy5zY29wZU5hbWUpO1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cIm51Y2xpZGUtY29uc29sZS1pbnB1dC13cmFwcGVyXCI+XG4gICAgICAgIDxBdG9tVGV4dEVkaXRvclxuICAgICAgICAgIHJlZj17dGhpcy5faGFuZGxlVGV4dEVkaXRvcn1cbiAgICAgICAgICBncmFtbWFyPXtncmFtbWFyfVxuICAgICAgICAgIGd1dHRlckhpZGRlblxuICAgICAgICAgIGF1dG9Hcm93XG4gICAgICAgICAgbGluZU51bWJlckd1dHRlclZpc2libGU9e2ZhbHNlfVxuICAgICAgICAvPlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG59XG4iXX0=