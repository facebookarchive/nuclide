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

      this._disposables = new _atom.CompositeDisposable();
      var root = _reactForAtom.React.findDOMNode(this.refs['root']);

      // Hitting enter when this panel has focus should confirm the dialog.
      this._disposables.add(atom.commands.add(root, 'core:confirm', function (event) {
        return _this.props.onConfirm();
      }));

      // Hitting escape when this panel has focus should cancel the dialog.
      this._disposables.add(atom.commands.add(root, 'core:cancel', function (event) {
        return _this.props.onCancel();
      }));

      _reactForAtom.React.findDOMNode(this.refs.password).focus();
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
      return _reactForAtom.React.findDOMNode(this.refs.password).value;
    }
  }]);

  return AuthenticationPrompt;
})(_reactForAtom.React.Component);

exports['default'] = AuthenticationPrompt;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkF1dGhlbnRpY2F0aW9uUHJvbXB0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O29CQVdrQyxNQUFNOzs0QkFDcEIsZ0JBQWdCOzs7OztJQVlmLG9CQUFvQjtZQUFwQixvQkFBb0I7O0FBQzVCLFdBRFEsb0JBQW9CLENBQzNCLEtBQVksRUFBRTswQkFEUCxvQkFBb0I7O0FBRXJDLCtCQUZpQixvQkFBb0IsNkNBRS9CLEtBQUssRUFBRTtHQUNkOzs7O2VBSGtCLG9CQUFvQjs7V0FLakMsa0JBQWlCOztBQUVyQixVQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FDbkMsT0FBTyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FDdEIsT0FBTyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FDckIsT0FBTyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQzs7OztBQUk3QixhQUNFOztVQUFLLEdBQUcsRUFBQyxNQUFNO1FBQ2I7QUFDRSxtQkFBUyxFQUFDLE9BQU87QUFDakIsZUFBSyxFQUFFLEVBQUMsVUFBVSxFQUFFLEtBQUssRUFBQyxBQUFDO0FBQzNCLGlDQUF1QixFQUFFLEVBQUMsTUFBTSxFQUFFLFFBQVEsRUFBQyxBQUFDO1VBQzVDO1FBQ0Y7QUFDRSxjQUFJLEVBQUMsVUFBVTtBQUNmLG1CQUFTLEVBQUMsc0NBQXNDO0FBQ2hELGFBQUcsRUFBQyxVQUFVO0FBQ2QsaUJBQU8sRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQUFBQztVQUNsQztPQUNFLENBQ047S0FDSDs7O1dBRU8sa0JBQUMsQ0FBaUIsRUFBUTtBQUNoQyxVQUFJLENBQUMsQ0FBQyxHQUFHLEtBQUssT0FBTyxFQUFFO0FBQ3JCLFlBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUM7T0FDeEI7O0FBRUQsVUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLFFBQVEsRUFBRTtBQUN0QixZQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO09BQ3ZCO0tBQ0Y7OztXQUVnQiw2QkFBUzs7O0FBQ3hCLFVBQUksQ0FBQyxZQUFZLEdBQUcsK0JBQXlCLENBQUM7QUFDOUMsVUFBTSxJQUFJLEdBQUcsb0JBQU0sV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQzs7O0FBR2xELFVBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUNuQyxJQUFJLEVBQ0osY0FBYyxFQUNkLFVBQUMsS0FBSztlQUFLLE1BQUssS0FBSyxDQUFDLFNBQVMsRUFBRTtPQUFBLENBQUMsQ0FBQyxDQUFDOzs7QUFHeEMsVUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQ25DLElBQUksRUFDSixhQUFhLEVBQ2IsVUFBQyxLQUFLO2VBQUssTUFBSyxLQUFLLENBQUMsUUFBUSxFQUFFO09BQUEsQ0FBQyxDQUFDLENBQUM7O0FBRXZDLDBCQUFNLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO0tBQy9DOzs7V0FFbUIsZ0NBQVM7QUFDM0IsVUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFO0FBQ3JCLFlBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDNUIsWUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7T0FDMUI7S0FDRjs7O1dBRVUsdUJBQVc7QUFDcEIsYUFBTyxvQkFBTSxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUFLLENBQUM7S0FDcEQ7OztTQXJFa0Isb0JBQW9CO0dBQVMsb0JBQU0sU0FBUzs7cUJBQTVDLG9CQUFvQiIsImZpbGUiOiJBdXRoZW50aWNhdGlvblByb21wdC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge1JlYWN0fSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5cbnR5cGUgRGVmYXVsdFByb3BzID0ge307XG50eXBlIFByb3BzID0ge1xuICBpbnN0cnVjdGlvbnM6IHN0cmluZztcbiAgb25Db25maXJtOiAoKSA9PiBtaXhlZDtcbiAgb25DYW5jZWw6ICgpID0+IG1peGVkO1xufTtcbnR5cGUgU3RhdGUgPSB7fTtcblxuLyoqIENvbXBvbmVudCB0byBwcm9tcHQgdGhlIHVzZXIgZm9yIGF1dGhlbnRpY2F0aW9uIGluZm9ybWF0aW9uLiAqL1xuLyogZXNsaW50LWRpc2FibGUgcmVhY3QvcHJvcC10eXBlcyAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQXV0aGVudGljYXRpb25Qcm9tcHQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8RGVmYXVsdFByb3BzLCBQcm9wcywgU3RhdGU+IHtcbiAgY29uc3RydWN0b3IocHJvcHM6IFByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICB9XG5cbiAgcmVuZGVyKCk6IFJlYWN0RWxlbWVudCB7XG4gICAgLy8gSW5zdHJ1Y3Rpb25zIG1heSBjb250YWluIG5ld2xpbmVzIHRoYXQgbmVlZCB0byBiZSBjb252ZXJ0ZWQgdG8gPGJyPiB0YWdzLlxuICAgIGNvbnN0IHNhZmVIdG1sID0gdGhpcy5wcm9wcy5pbnN0cnVjdGlvbnNcbiAgICAgICAgLnJlcGxhY2UoLyYvZywgJyZhbXA7JylcbiAgICAgICAgLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxuICAgICAgICAucmVwbGFjZSgvXFxcXG4vZywgJzxicj4nKTtcblxuICAgIC8vIFdlIG5lZWQgbmF0aXZlLWtleS1iaW5kaW5ncyBzbyB0aGF0IGRlbGV0ZSB3b3JrcyBhbmQgd2UgbmVlZFxuICAgIC8vIF9vbktleVVwIHNvIHRoYXQgZXNjYXBlIGFuZCBlbnRlciB3b3JrXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgcmVmPVwicm9vdFwiPlxuICAgICAgICA8ZGl2XG4gICAgICAgICAgY2xhc3NOYW1lPVwiYmxvY2tcIlxuICAgICAgICAgIHN0eWxlPXt7d2hpdGVTcGFjZTogJ3ByZSd9fVxuICAgICAgICAgIGRhbmdlcm91c2x5U2V0SW5uZXJIVE1MPXt7X19odG1sOiBzYWZlSHRtbH19XG4gICAgICAgIC8+XG4gICAgICAgIDxpbnB1dFxuICAgICAgICAgIHR5cGU9XCJwYXNzd29yZFwiXG4gICAgICAgICAgY2xhc3NOYW1lPVwibnVjbGlkZS1wYXNzd29yZCBuYXRpdmUta2V5LWJpbmRpbmdzXCJcbiAgICAgICAgICByZWY9XCJwYXNzd29yZFwiXG4gICAgICAgICAgb25LZXlVcD17dGhpcy5fb25LZXlVcC5iaW5kKHRoaXMpfVxuICAgICAgICAvPlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIF9vbktleVVwKGU6IFN5bnRoZXRpY0V2ZW50KTogdm9pZCB7XG4gICAgaWYgKGUua2V5ID09PSAnRW50ZXInKSB7XG4gICAgICB0aGlzLnByb3BzLm9uQ29uZmlybSgpO1xuICAgIH1cblxuICAgIGlmIChlLmtleSA9PT0gJ0VzY2FwZScpIHtcbiAgICAgIHRoaXMucHJvcHMub25DYW5jZWwoKTtcbiAgICB9XG4gIH1cblxuICBjb21wb25lbnREaWRNb3VudCgpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgY29uc3Qgcm9vdCA9IFJlYWN0LmZpbmRET01Ob2RlKHRoaXMucmVmc1sncm9vdCddKTtcblxuICAgIC8vIEhpdHRpbmcgZW50ZXIgd2hlbiB0aGlzIHBhbmVsIGhhcyBmb2N1cyBzaG91bGQgY29uZmlybSB0aGUgZGlhbG9nLlxuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZChhdG9tLmNvbW1hbmRzLmFkZChcbiAgICAgICAgcm9vdCxcbiAgICAgICAgJ2NvcmU6Y29uZmlybScsXG4gICAgICAgIChldmVudCkgPT4gdGhpcy5wcm9wcy5vbkNvbmZpcm0oKSkpO1xuXG4gICAgLy8gSGl0dGluZyBlc2NhcGUgd2hlbiB0aGlzIHBhbmVsIGhhcyBmb2N1cyBzaG91bGQgY2FuY2VsIHRoZSBkaWFsb2cuXG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKGF0b20uY29tbWFuZHMuYWRkKFxuICAgICAgICByb290LFxuICAgICAgICAnY29yZTpjYW5jZWwnLFxuICAgICAgICAoZXZlbnQpID0+IHRoaXMucHJvcHMub25DYW5jZWwoKSkpO1xuXG4gICAgUmVhY3QuZmluZERPTU5vZGUodGhpcy5yZWZzLnBhc3N3b3JkKS5mb2N1cygpO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2Rpc3Bvc2FibGVzKSB7XG4gICAgICB0aGlzLl9kaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gICAgICB0aGlzLl9kaXNwb3NhYmxlcyA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgZ2V0UGFzc3dvcmQoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gUmVhY3QuZmluZERPTU5vZGUodGhpcy5yZWZzLnBhc3N3b3JkKS52YWx1ZTtcbiAgfVxufVxuLyogZXNsaW50LWVuYWJsZSByZWFjdC9wcm9wLXR5cGVzICovXG4iXX0=