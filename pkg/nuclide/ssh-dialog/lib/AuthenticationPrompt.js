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

var _atom = require('atom');

var _reactForAtom = require('react-for-atom');

/** Component to prompt the user for authentication information. */
/* eslint-disable react/prop-types */

var AuthenticationPrompt = (function (_React$Component) {
  _inherits(AuthenticationPrompt, _React$Component);

  function AuthenticationPrompt(props) {
    _classCallCheck(this, AuthenticationPrompt);

    _get(Object.getPrototypeOf(AuthenticationPrompt.prototype), 'constructor', this).call(this, props);
  }

  /* eslint-enable react/prop-types */

  _createClass(AuthenticationPrompt, [{
    key: 'render',
    value: function render() {
      // Instructions may contain newlines that need to be converted to <br> tags.
      var safeHtml = this.props.instructions.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\\n/g, '<br>');

      // We need native-key-bindings so that delete works and we need
      // _onKeyUp so that escape and enter work
      return _reactForAtom.React.createElement(
        'div',
        { ref: 'root' },
        _reactForAtom.React.createElement('div', {
          className: 'block',
          style: { whiteSpace: 'pre' },
          dangerouslySetInnerHTML: { __html: safeHtml }
        }),
        _reactForAtom.React.createElement('input', {
          type: 'password',
          className: 'nuclide-password native-key-bindings',
          ref: 'password',
          onKeyUp: this._onKeyUp.bind(this)
        })
      );
    }
  }, {
    key: '_onKeyUp',
    value: function _onKeyUp(e) {
      if (e.key === 'Enter') {
        this.props.onConfirm();
      }

      if (e.key === 'Escape') {
        this.props.onCancel();
      }
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this = this;

      var disposables = this._disposables = new _atom.CompositeDisposable();
      var root = _reactForAtom.ReactDOM.findDOMNode(this.refs['root']);

      // Hitting enter when this panel has focus should confirm the dialog.
      disposables.add(atom.commands.add(root, 'core:confirm', function (event) {
        return _this.props.onConfirm();
      }));

      // Hitting escape when this panel has focus should cancel the dialog.
      disposables.add(atom.commands.add(root, 'core:cancel', function (event) {
        return _this.props.onCancel();
      }));

      _reactForAtom.ReactDOM.findDOMNode(this.refs.password).focus();
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      if (this._disposables) {
        this._disposables.dispose();
        this._disposables = null;
      }
    }
  }, {
    key: 'getPassword',
    value: function getPassword() {
      return _reactForAtom.ReactDOM.findDOMNode(this.refs.password).value;
    }
  }]);

  return AuthenticationPrompt;
})(_reactForAtom.React.Component);

exports['default'] = AuthenticationPrompt;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkF1dGhlbnRpY2F0aW9uUHJvbXB0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O29CQVdrQyxNQUFNOzs0QkFJakMsZ0JBQWdCOzs7OztJQVVGLG9CQUFvQjtZQUFwQixvQkFBb0I7O0FBRTVCLFdBRlEsb0JBQW9CLENBRTNCLEtBQVksRUFBRTswQkFGUCxvQkFBb0I7O0FBR3JDLCtCQUhpQixvQkFBb0IsNkNBRy9CLEtBQUssRUFBRTtHQUNkOzs7O2VBSmtCLG9CQUFvQjs7V0FNakMsa0JBQWlCOztBQUVyQixVQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FDbkMsT0FBTyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FDdEIsT0FBTyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FDckIsT0FBTyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQzs7OztBQUk3QixhQUNFOztVQUFLLEdBQUcsRUFBQyxNQUFNO1FBQ2I7QUFDRSxtQkFBUyxFQUFDLE9BQU87QUFDakIsZUFBSyxFQUFFLEVBQUMsVUFBVSxFQUFFLEtBQUssRUFBQyxBQUFDO0FBQzNCLGlDQUF1QixFQUFFLEVBQUMsTUFBTSxFQUFFLFFBQVEsRUFBQyxBQUFDO1VBQzVDO1FBQ0Y7QUFDRSxjQUFJLEVBQUMsVUFBVTtBQUNmLG1CQUFTLEVBQUMsc0NBQXNDO0FBQ2hELGFBQUcsRUFBQyxVQUFVO0FBQ2QsaUJBQU8sRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQUFBQztVQUNsQztPQUNFLENBQ047S0FDSDs7O1dBRU8sa0JBQUMsQ0FBeUIsRUFBUTtBQUN4QyxVQUFJLENBQUMsQ0FBQyxHQUFHLEtBQUssT0FBTyxFQUFFO0FBQ3JCLFlBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUM7T0FDeEI7O0FBRUQsVUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLFFBQVEsRUFBRTtBQUN0QixZQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO09BQ3ZCO0tBQ0Y7OztXQUVnQiw2QkFBUzs7O0FBQ3hCLFVBQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxZQUFZLEdBQUcsK0JBQXlCLENBQUM7QUFDbEUsVUFBTSxJQUFJLEdBQUcsdUJBQVMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQzs7O0FBR3JELGlCQUFXLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUM3QixJQUFJLEVBQ0osY0FBYyxFQUNkLFVBQUEsS0FBSztlQUFJLE1BQUssS0FBSyxDQUFDLFNBQVMsRUFBRTtPQUFBLENBQUMsQ0FBQyxDQUFDOzs7QUFHdEMsaUJBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQzdCLElBQUksRUFDSixhQUFhLEVBQ2IsVUFBQSxLQUFLO2VBQUksTUFBSyxLQUFLLENBQUMsUUFBUSxFQUFFO09BQUEsQ0FBQyxDQUFDLENBQUM7O0FBRXJDLDZCQUFTLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO0tBQ2xEOzs7V0FFbUIsZ0NBQVM7QUFDM0IsVUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFO0FBQ3JCLFlBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDNUIsWUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7T0FDMUI7S0FDRjs7O1dBRVUsdUJBQVc7QUFDcEIsYUFBTyx1QkFBUyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUFLLENBQUM7S0FDdkQ7OztTQXRFa0Isb0JBQW9CO0dBQVMsb0JBQU0sU0FBUzs7cUJBQTVDLG9CQUFvQiIsImZpbGUiOiJBdXRoZW50aWNhdGlvblByb21wdC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge1xuICBSZWFjdCxcbiAgUmVhY3RET00sXG59IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcblxudHlwZSBQcm9wcyA9IHtcbiAgaW5zdHJ1Y3Rpb25zOiBzdHJpbmc7XG4gIG9uQ29uZmlybTogKCkgPT4gbWl4ZWQ7XG4gIG9uQ2FuY2VsOiAoKSA9PiBtaXhlZDtcbn07XG5cbi8qKiBDb21wb25lbnQgdG8gcHJvbXB0IHRoZSB1c2VyIGZvciBhdXRoZW50aWNhdGlvbiBpbmZvcm1hdGlvbi4gKi9cbi8qIGVzbGludC1kaXNhYmxlIHJlYWN0L3Byb3AtdHlwZXMgKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEF1dGhlbnRpY2F0aW9uUHJvbXB0IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PHZvaWQsIFByb3BzLCB2b2lkPiB7XG4gIF9kaXNwb3NhYmxlczogP0NvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIGNvbnN0cnVjdG9yKHByb3BzOiBQcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIC8vIEluc3RydWN0aW9ucyBtYXkgY29udGFpbiBuZXdsaW5lcyB0aGF0IG5lZWQgdG8gYmUgY29udmVydGVkIHRvIDxicj4gdGFncy5cbiAgICBjb25zdCBzYWZlSHRtbCA9IHRoaXMucHJvcHMuaW5zdHJ1Y3Rpb25zXG4gICAgICAgIC5yZXBsYWNlKC8mL2csICcmYW1wOycpXG4gICAgICAgIC5yZXBsYWNlKC88L2csICcmbHQ7JylcbiAgICAgICAgLnJlcGxhY2UoL1xcXFxuL2csICc8YnI+Jyk7XG5cbiAgICAvLyBXZSBuZWVkIG5hdGl2ZS1rZXktYmluZGluZ3Mgc28gdGhhdCBkZWxldGUgd29ya3MgYW5kIHdlIG5lZWRcbiAgICAvLyBfb25LZXlVcCBzbyB0aGF0IGVzY2FwZSBhbmQgZW50ZXIgd29ya1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IHJlZj1cInJvb3RcIj5cbiAgICAgICAgPGRpdlxuICAgICAgICAgIGNsYXNzTmFtZT1cImJsb2NrXCJcbiAgICAgICAgICBzdHlsZT17e3doaXRlU3BhY2U6ICdwcmUnfX1cbiAgICAgICAgICBkYW5nZXJvdXNseVNldElubmVySFRNTD17e19faHRtbDogc2FmZUh0bWx9fVxuICAgICAgICAvPlxuICAgICAgICA8aW5wdXRcbiAgICAgICAgICB0eXBlPVwicGFzc3dvcmRcIlxuICAgICAgICAgIGNsYXNzTmFtZT1cIm51Y2xpZGUtcGFzc3dvcmQgbmF0aXZlLWtleS1iaW5kaW5nc1wiXG4gICAgICAgICAgcmVmPVwicGFzc3dvcmRcIlxuICAgICAgICAgIG9uS2V5VXA9e3RoaXMuX29uS2V5VXAuYmluZCh0aGlzKX1cbiAgICAgICAgLz5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICBfb25LZXlVcChlOiBTeW50aGV0aWNLZXlib2FyZEV2ZW50KTogdm9pZCB7XG4gICAgaWYgKGUua2V5ID09PSAnRW50ZXInKSB7XG4gICAgICB0aGlzLnByb3BzLm9uQ29uZmlybSgpO1xuICAgIH1cblxuICAgIGlmIChlLmtleSA9PT0gJ0VzY2FwZScpIHtcbiAgICAgIHRoaXMucHJvcHMub25DYW5jZWwoKTtcbiAgICB9XG4gIH1cblxuICBjb21wb25lbnREaWRNb3VudCgpOiB2b2lkIHtcbiAgICBjb25zdCBkaXNwb3NhYmxlcyA9IHRoaXMuX2Rpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICBjb25zdCByb290ID0gUmVhY3RET00uZmluZERPTU5vZGUodGhpcy5yZWZzWydyb290J10pO1xuXG4gICAgLy8gSGl0dGluZyBlbnRlciB3aGVuIHRoaXMgcGFuZWwgaGFzIGZvY3VzIHNob3VsZCBjb25maXJtIHRoZSBkaWFsb2cuXG4gICAgZGlzcG9zYWJsZXMuYWRkKGF0b20uY29tbWFuZHMuYWRkKFxuICAgICAgICByb290LFxuICAgICAgICAnY29yZTpjb25maXJtJyxcbiAgICAgICAgZXZlbnQgPT4gdGhpcy5wcm9wcy5vbkNvbmZpcm0oKSkpO1xuXG4gICAgLy8gSGl0dGluZyBlc2NhcGUgd2hlbiB0aGlzIHBhbmVsIGhhcyBmb2N1cyBzaG91bGQgY2FuY2VsIHRoZSBkaWFsb2cuXG4gICAgZGlzcG9zYWJsZXMuYWRkKGF0b20uY29tbWFuZHMuYWRkKFxuICAgICAgICByb290LFxuICAgICAgICAnY29yZTpjYW5jZWwnLFxuICAgICAgICBldmVudCA9PiB0aGlzLnByb3BzLm9uQ2FuY2VsKCkpKTtcblxuICAgIFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMucmVmcy5wYXNzd29yZCkuZm9jdXMoKTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9kaXNwb3NhYmxlcykge1xuICAgICAgdGhpcy5fZGlzcG9zYWJsZXMuZGlzcG9zZSgpO1xuICAgICAgdGhpcy5fZGlzcG9zYWJsZXMgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIGdldFBhc3N3b3JkKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMucmVmcy5wYXNzd29yZCkudmFsdWU7XG4gIH1cbn1cbi8qIGVzbGludC1lbmFibGUgcmVhY3QvcHJvcC10eXBlcyAqL1xuIl19