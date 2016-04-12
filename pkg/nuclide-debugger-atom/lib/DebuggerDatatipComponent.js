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

var _reactForAtom = require('react-for-atom');

function renderObject(evaluationResult) {
  var _type = evaluationResult._type;
  var _description = evaluationResult._description;

  return _type === 'object' ? _description : null;
}

function renderNullish(evaluationResult) {
  var _type = evaluationResult._type;

  return _type === 'undefined' || _type === 'null' ? _type : null;
}

function renderString(evaluationResult) {
  var _type = evaluationResult._type;
  var value = evaluationResult.value;

  return _type === 'string' ? '"' + value + '"' : null;
}

function renderDefault(evaluationResult) {
  return evaluationResult.value;
}

var valueRenderers = [renderObject, renderString, renderNullish, renderDefault];

var DebuggerDatatipComponent = (function (_React$Component) {
  _inherits(DebuggerDatatipComponent, _React$Component);

  function DebuggerDatatipComponent() {
    _classCallCheck(this, DebuggerDatatipComponent);

    _get(Object.getPrototypeOf(DebuggerDatatipComponent.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(DebuggerDatatipComponent, [{
    key: 'render',
    value: function render() {
      var _props = this.props;
      var expression = _props.expression;
      var evaluationResult = _props.evaluationResult;

      var displayValue = undefined;
      for (var renderer of valueRenderers) {
        displayValue = renderer(evaluationResult);
        if (displayValue != null) {
          break;
        }
      }
      if (displayValue == null || displayValue === '') {
        displayValue = '(N/A)';
      }
      return _reactForAtom.React.createElement(
        'div',
        { className: 'nuclide-debugger-datatip' },
        expression,
        ':',
        ' ',
        _reactForAtom.React.createElement(
          'span',
          { className: 'nuclide-debugger-datatip-value' },
          displayValue
        )
      );
    }
  }]);

  return DebuggerDatatipComponent;
})(_reactForAtom.React.Component);

exports.DebuggerDatatipComponent = DebuggerDatatipComponent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRlYnVnZ2VyRGF0YXRpcENvbXBvbmVudC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs0QkFhb0IsZ0JBQWdCOztBQU9wQyxTQUFTLFlBQVksQ0FBQyxnQkFBa0MsRUFBVztNQUUvRCxLQUFLLEdBRUgsZ0JBQWdCLENBRmxCLEtBQUs7TUFDTCxZQUFZLEdBQ1YsZ0JBQWdCLENBRGxCLFlBQVk7O0FBRWQsU0FDRSxLQUFLLEtBQUssUUFBUSxHQUNkLFlBQVksR0FDWixJQUFJLENBQ1I7Q0FDSDs7QUFFRCxTQUFTLGFBQWEsQ0FBQyxnQkFBa0MsRUFBVztNQUMzRCxLQUFLLEdBQUksZ0JBQWdCLENBQXpCLEtBQUs7O0FBQ1osU0FDRSxLQUFLLEtBQUssV0FBVyxJQUFJLEtBQUssS0FBSyxNQUFNLEdBQ3JDLEtBQUssR0FDTCxJQUFJLENBQ1I7Q0FDSDs7QUFFRCxTQUFTLFlBQVksQ0FBQyxnQkFBa0MsRUFBVztNQUUvRCxLQUFLLEdBRUgsZ0JBQWdCLENBRmxCLEtBQUs7TUFDTCxLQUFLLEdBQ0gsZ0JBQWdCLENBRGxCLEtBQUs7O0FBRVAsU0FDRSxLQUFLLEtBQUssUUFBUSxTQUNWLEtBQUssU0FDVCxJQUFJLENBQ1I7Q0FDSDs7QUFFRCxTQUFTLGFBQWEsQ0FBQyxnQkFBa0MsRUFBVztBQUNsRSxTQUFPLGdCQUFnQixDQUFDLEtBQUssQ0FBQztDQUMvQjs7QUFFRCxJQUFNLGNBQWMsR0FBRyxDQUNyQixZQUFZLEVBQ1osWUFBWSxFQUNaLGFBQWEsRUFDYixhQUFhLENBQ2QsQ0FBQzs7SUFFVyx3QkFBd0I7WUFBeEIsd0JBQXdCOztXQUF4Qix3QkFBd0I7MEJBQXhCLHdCQUF3Qjs7K0JBQXhCLHdCQUF3Qjs7O2VBQXhCLHdCQUF3Qjs7V0FHN0Isa0JBQWtCO21CQUlsQixJQUFJLENBQUMsS0FBSztVQUZaLFVBQVUsVUFBVixVQUFVO1VBQ1YsZ0JBQWdCLFVBQWhCLGdCQUFnQjs7QUFFbEIsVUFBSSxZQUFZLFlBQUEsQ0FBQztBQUNqQixXQUFLLElBQU0sUUFBUSxJQUFJLGNBQWMsRUFBRTtBQUNyQyxvQkFBWSxHQUFHLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBQzFDLFlBQUksWUFBWSxJQUFJLElBQUksRUFBRTtBQUN4QixnQkFBTTtTQUNQO09BQ0Y7QUFDRCxVQUFJLFlBQVksSUFBSSxJQUFJLElBQUksWUFBWSxLQUFLLEVBQUUsRUFBRTtBQUMvQyxvQkFBWSxHQUFHLE9BQU8sQ0FBQztPQUN4QjtBQUNELGFBQ0U7O1VBQUssU0FBUyxFQUFDLDBCQUEwQjtRQUN0QyxVQUFVOztRQUFHLEdBQUc7UUFDakI7O1lBQU0sU0FBUyxFQUFDLGdDQUFnQztVQUFFLFlBQVk7U0FBUTtPQUNsRSxDQUNOO0tBQ0g7OztTQXhCVSx3QkFBd0I7R0FBUyxvQkFBTSxTQUFTIiwiZmlsZSI6IkRlYnVnZ2VyRGF0YXRpcENvbXBvbmVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtFdmFsdWF0aW9uUmVzdWx0fSBmcm9tICcuL0JyaWRnZSc7XG5cbmltcG9ydCB7UmVhY3R9IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcblxudHlwZSBEZWJ1Z2dlckRhdGF0aXBDb21wb25lbnRQcm9wcyA9IHtcbiAgZXhwcmVzc2lvbjogc3RyaW5nO1xuICBldmFsdWF0aW9uUmVzdWx0OiBFdmFsdWF0aW9uUmVzdWx0O1xufTtcblxuZnVuY3Rpb24gcmVuZGVyT2JqZWN0KGV2YWx1YXRpb25SZXN1bHQ6IEV2YWx1YXRpb25SZXN1bHQpOiA/c3RyaW5nIHtcbiAgY29uc3Qge1xuICAgIF90eXBlLFxuICAgIF9kZXNjcmlwdGlvbixcbiAgfSA9IGV2YWx1YXRpb25SZXN1bHQ7XG4gIHJldHVybiAoXG4gICAgX3R5cGUgPT09ICdvYmplY3QnXG4gICAgICA/IF9kZXNjcmlwdGlvblxuICAgICAgOiBudWxsXG4gICk7XG59XG5cbmZ1bmN0aW9uIHJlbmRlck51bGxpc2goZXZhbHVhdGlvblJlc3VsdDogRXZhbHVhdGlvblJlc3VsdCk6ID9zdHJpbmcge1xuICBjb25zdCB7X3R5cGV9ID0gZXZhbHVhdGlvblJlc3VsdDtcbiAgcmV0dXJuIChcbiAgICBfdHlwZSA9PT0gJ3VuZGVmaW5lZCcgfHwgX3R5cGUgPT09ICdudWxsJ1xuICAgICAgPyBfdHlwZVxuICAgICAgOiBudWxsXG4gICk7XG59XG5cbmZ1bmN0aW9uIHJlbmRlclN0cmluZyhldmFsdWF0aW9uUmVzdWx0OiBFdmFsdWF0aW9uUmVzdWx0KTogP3N0cmluZyB7XG4gIGNvbnN0IHtcbiAgICBfdHlwZSxcbiAgICB2YWx1ZSxcbiAgfSA9IGV2YWx1YXRpb25SZXN1bHQ7XG4gIHJldHVybiAoXG4gICAgX3R5cGUgPT09ICdzdHJpbmcnXG4gICAgICA/IGBcIiR7dmFsdWV9XCJgXG4gICAgICA6IG51bGxcbiAgKTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyRGVmYXVsdChldmFsdWF0aW9uUmVzdWx0OiBFdmFsdWF0aW9uUmVzdWx0KTogP3N0cmluZyB7XG4gIHJldHVybiBldmFsdWF0aW9uUmVzdWx0LnZhbHVlO1xufVxuXG5jb25zdCB2YWx1ZVJlbmRlcmVycyA9IFtcbiAgcmVuZGVyT2JqZWN0LFxuICByZW5kZXJTdHJpbmcsXG4gIHJlbmRlck51bGxpc2gsXG4gIHJlbmRlckRlZmF1bHQsXG5dO1xuXG5leHBvcnQgY2xhc3MgRGVidWdnZXJEYXRhdGlwQ29tcG9uZW50IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgcHJvcHM6IERlYnVnZ2VyRGF0YXRpcENvbXBvbmVudFByb3BzO1xuXG4gIHJlbmRlcigpOiA/UmVhY3RFbGVtZW50IHtcbiAgICBjb25zdCB7XG4gICAgICBleHByZXNzaW9uLFxuICAgICAgZXZhbHVhdGlvblJlc3VsdCxcbiAgICB9ID0gdGhpcy5wcm9wcztcbiAgICBsZXQgZGlzcGxheVZhbHVlO1xuICAgIGZvciAoY29uc3QgcmVuZGVyZXIgb2YgdmFsdWVSZW5kZXJlcnMpIHtcbiAgICAgIGRpc3BsYXlWYWx1ZSA9IHJlbmRlcmVyKGV2YWx1YXRpb25SZXN1bHQpO1xuICAgICAgaWYgKGRpc3BsYXlWYWx1ZSAhPSBudWxsKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoZGlzcGxheVZhbHVlID09IG51bGwgfHwgZGlzcGxheVZhbHVlID09PSAnJykge1xuICAgICAgZGlzcGxheVZhbHVlID0gJyhOL0EpJztcbiAgICB9XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS1kZWJ1Z2dlci1kYXRhdGlwXCI+XG4gICAgICAgIHtleHByZXNzaW9ufTp7JyAnfVxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJudWNsaWRlLWRlYnVnZ2VyLWRhdGF0aXAtdmFsdWVcIj57ZGlzcGxheVZhbHVlfTwvc3Bhbj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cbn1cbiJdfQ==