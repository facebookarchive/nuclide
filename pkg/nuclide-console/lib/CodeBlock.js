Object.defineProperty(exports, '__esModule', {
  value: true
});

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

var _nuclideUiLibAtomTextEditor = require('../../nuclide-ui/lib/AtomTextEditor');

var _reactForAtom = require('react-for-atom');

var CodeBlock = (function (_React$Component) {
  _inherits(CodeBlock, _React$Component);

  function CodeBlock(props) {
    _classCallCheck(this, CodeBlock);

    _get(Object.getPrototypeOf(CodeBlock.prototype), 'constructor', this).call(this, props);
    this._handleTextEditor = this._handleTextEditor.bind(this);
  }

  _createClass(CodeBlock, [{
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {
      this._updateEditor();
    }
  }, {
    key: '_handleTextEditor',
    value: function _handleTextEditor(component) {
      if (component == null) {
        this._textEditor = null;
        return;
      }
      this._textEditor = component.getModel();
      this._updateEditor();
    }
  }, {
    key: '_updateEditor',
    value: function _updateEditor() {
      if (this._textEditor == null) {
        return;
      }
      this._textEditor.setText(this.props.text);
    }
  }, {
    key: 'render',
    value: function render() {
      var grammar = this.props.scopeName == null ? null : atom.grammars.grammarForScopeName(this.props.scopeName);
      return _reactForAtom.React.createElement(
        'div',
        { className: 'nuclide-console-text-editor-wrapper' },
        _reactForAtom.React.createElement(_nuclideUiLibAtomTextEditor.AtomTextEditor, {
          ref: this._handleTextEditor,
          grammar: grammar,
          readOnly: true,
          gutterHidden: true,
          autoGrow: true,
          lineNumberGutterVisible: false
        })
      );
    }
  }]);

  return CodeBlock;
})(_reactForAtom.React.Component);

exports['default'] = CodeBlock;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNvZGVCbG9jay5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OzswQ0FXNkIscUNBQXFDOzs0QkFDOUMsZ0JBQWdCOztJQU9mLFNBQVM7WUFBVCxTQUFTOztBQUtqQixXQUxRLFNBQVMsQ0FLaEIsS0FBWSxFQUFFOzBCQUxQLFNBQVM7O0FBTTFCLCtCQU5pQixTQUFTLDZDQU1wQixLQUFLLEVBQUU7QUFDYixBQUFDLFFBQUksQ0FBTyxpQkFBaUIsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0dBQ25FOztlQVJrQixTQUFTOztXQVVWLDhCQUFTO0FBQ3pCLFVBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztLQUN0Qjs7O1dBRWdCLDJCQUFDLFNBQXlCLEVBQVE7QUFDakQsVUFBSSxTQUFTLElBQUksSUFBSSxFQUFFO0FBQ3JCLFlBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO0FBQ3hCLGVBQU87T0FDUjtBQUNELFVBQUksQ0FBQyxXQUFXLEdBQUcsU0FBUyxDQUFDLFFBQVEsRUFBRSxDQUFDO0FBQ3hDLFVBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztLQUN0Qjs7O1dBRVkseUJBQVM7QUFDcEIsVUFBSSxJQUFJLENBQUMsV0FBVyxJQUFJLElBQUksRUFBRTtBQUM1QixlQUFPO09BQ1I7QUFDRCxVQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQzNDOzs7V0FFSyxrQkFBRztBQUNQLFVBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxJQUFJLElBQUksR0FDeEMsSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNuRSxhQUNFOztVQUFLLFNBQVMsRUFBQyxxQ0FBcUM7UUFDbEQ7QUFDRSxhQUFHLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixBQUFDO0FBQzVCLGlCQUFPLEVBQUUsT0FBTyxBQUFDO0FBQ2pCLGtCQUFRLE1BQUE7QUFDUixzQkFBWSxNQUFBO0FBQ1osa0JBQVEsTUFBQTtBQUNSLGlDQUF1QixFQUFFLEtBQUssQUFBQztVQUMvQjtPQUNFLENBQ047S0FDSDs7O1NBN0NrQixTQUFTO0dBQVMsb0JBQU0sU0FBUzs7cUJBQWpDLFNBQVMiLCJmaWxlIjoiQ29kZUJsb2NrLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHtBdG9tVGV4dEVkaXRvcn0gZnJvbSAnLi4vLi4vbnVjbGlkZS11aS9saWIvQXRvbVRleHRFZGl0b3InO1xuaW1wb3J0IHtSZWFjdH0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuXG50eXBlIFByb3BzID0ge1xuICBzY29wZU5hbWU6ID9zdHJpbmc7XG4gIHRleHQ6IHN0cmluZztcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvZGVCbG9jayBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHByb3BzOiBQcm9wcztcblxuICBfdGV4dEVkaXRvcjogP2F0b20kVGV4dEVkaXRvcjtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogUHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgKHRoaXM6IGFueSkuX2hhbmRsZVRleHRFZGl0b3IgPSB0aGlzLl9oYW5kbGVUZXh0RWRpdG9yLmJpbmQodGhpcyk7XG4gIH1cblxuICBjb21wb25lbnREaWRVcGRhdGUoKTogdm9pZCB7XG4gICAgdGhpcy5fdXBkYXRlRWRpdG9yKCk7XG4gIH1cblxuICBfaGFuZGxlVGV4dEVkaXRvcihjb21wb25lbnQ6IEF0b21UZXh0RWRpdG9yKTogdm9pZCB7XG4gICAgaWYgKGNvbXBvbmVudCA9PSBudWxsKSB7XG4gICAgICB0aGlzLl90ZXh0RWRpdG9yID0gbnVsbDtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5fdGV4dEVkaXRvciA9IGNvbXBvbmVudC5nZXRNb2RlbCgpO1xuICAgIHRoaXMuX3VwZGF0ZUVkaXRvcigpO1xuICB9XG5cbiAgX3VwZGF0ZUVkaXRvcigpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fdGV4dEVkaXRvciA9PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX3RleHRFZGl0b3Iuc2V0VGV4dCh0aGlzLnByb3BzLnRleHQpO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IGdyYW1tYXIgPSB0aGlzLnByb3BzLnNjb3BlTmFtZSA9PSBudWxsXG4gICAgICA/IG51bGwgOiBhdG9tLmdyYW1tYXJzLmdyYW1tYXJGb3JTY29wZU5hbWUodGhpcy5wcm9wcy5zY29wZU5hbWUpO1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cIm51Y2xpZGUtY29uc29sZS10ZXh0LWVkaXRvci13cmFwcGVyXCI+XG4gICAgICAgIDxBdG9tVGV4dEVkaXRvclxuICAgICAgICAgIHJlZj17dGhpcy5faGFuZGxlVGV4dEVkaXRvcn1cbiAgICAgICAgICBncmFtbWFyPXtncmFtbWFyfVxuICAgICAgICAgIHJlYWRPbmx5XG4gICAgICAgICAgZ3V0dGVySGlkZGVuXG4gICAgICAgICAgYXV0b0dyb3dcbiAgICAgICAgICBsaW5lTnVtYmVyR3V0dGVyVmlzaWJsZT17ZmFsc2V9XG4gICAgICAgIC8+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG59XG4iXX0=