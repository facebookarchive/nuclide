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
      var root = _reactForAtom.ReactDOM.findDOMNode(this.refs['root']);

      // Hitting enter when this panel has focus should confirm the dialog.
      this._disposables.add(atom.commands.add(root, 'core:confirm', function (event) {
        return _this.props.onConfirm();
      }));

      // Hitting escape when this panel has focus should cancel the dialog.
      this._disposables.add(atom.commands.add(root, 'core:cancel', function (event) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkF1dGhlbnRpY2F0aW9uUHJvbXB0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O29CQVdrQyxNQUFNOzs0QkFJakMsZ0JBQWdCOzs7OztJQVlGLG9CQUFvQjtZQUFwQixvQkFBb0I7O0FBQzVCLFdBRFEsb0JBQW9CLENBQzNCLEtBQVksRUFBRTswQkFEUCxvQkFBb0I7O0FBRXJDLCtCQUZpQixvQkFBb0IsNkNBRS9CLEtBQUssRUFBRTtHQUNkOzs7O2VBSGtCLG9CQUFvQjs7V0FLakMsa0JBQWlCOztBQUVyQixVQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FDbkMsT0FBTyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FDdEIsT0FBTyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FDckIsT0FBTyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQzs7OztBQUk3QixhQUNFOztVQUFLLEdBQUcsRUFBQyxNQUFNO1FBQ2I7QUFDRSxtQkFBUyxFQUFDLE9BQU87QUFDakIsZUFBSyxFQUFFLEVBQUMsVUFBVSxFQUFFLEtBQUssRUFBQyxBQUFDO0FBQzNCLGlDQUF1QixFQUFFLEVBQUMsTUFBTSxFQUFFLFFBQVEsRUFBQyxBQUFDO1VBQzVDO1FBQ0Y7QUFDRSxjQUFJLEVBQUMsVUFBVTtBQUNmLG1CQUFTLEVBQUMsc0NBQXNDO0FBQ2hELGFBQUcsRUFBQyxVQUFVO0FBQ2QsaUJBQU8sRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQUFBQztVQUNsQztPQUNFLENBQ047S0FDSDs7O1dBRU8sa0JBQUMsQ0FBaUIsRUFBUTtBQUNoQyxVQUFJLENBQUMsQ0FBQyxHQUFHLEtBQUssT0FBTyxFQUFFO0FBQ3JCLFlBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUM7T0FDeEI7O0FBRUQsVUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLFFBQVEsRUFBRTtBQUN0QixZQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO09BQ3ZCO0tBQ0Y7OztXQUVnQiw2QkFBUzs7O0FBQ3hCLFVBQUksQ0FBQyxZQUFZLEdBQUcsK0JBQXlCLENBQUM7QUFDOUMsVUFBTSxJQUFJLEdBQUcsdUJBQVMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQzs7O0FBR3JELFVBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUNuQyxJQUFJLEVBQ0osY0FBYyxFQUNkLFVBQUMsS0FBSztlQUFLLE1BQUssS0FBSyxDQUFDLFNBQVMsRUFBRTtPQUFBLENBQUMsQ0FBQyxDQUFDOzs7QUFHeEMsVUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQ25DLElBQUksRUFDSixhQUFhLEVBQ2IsVUFBQyxLQUFLO2VBQUssTUFBSyxLQUFLLENBQUMsUUFBUSxFQUFFO09BQUEsQ0FBQyxDQUFDLENBQUM7O0FBRXZDLDZCQUFTLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO0tBQ2xEOzs7V0FFbUIsZ0NBQVM7QUFDM0IsVUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFO0FBQ3JCLFlBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDNUIsWUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7T0FDMUI7S0FDRjs7O1dBRVUsdUJBQVc7QUFDcEIsYUFBTyx1QkFBUyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUFLLENBQUM7S0FDdkQ7OztTQXJFa0Isb0JBQW9CO0dBQVMsb0JBQU0sU0FBUzs7cUJBQTVDLG9CQUFvQiIsImZpbGUiOiJBdXRoZW50aWNhdGlvblByb21wdC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge1xuICBSZWFjdCxcbiAgUmVhY3RET00sXG59IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcblxudHlwZSBEZWZhdWx0UHJvcHMgPSB7fTtcbnR5cGUgUHJvcHMgPSB7XG4gIGluc3RydWN0aW9uczogc3RyaW5nO1xuICBvbkNvbmZpcm06ICgpID0+IG1peGVkO1xuICBvbkNhbmNlbDogKCkgPT4gbWl4ZWQ7XG59O1xudHlwZSBTdGF0ZSA9IHt9O1xuXG4vKiogQ29tcG9uZW50IHRvIHByb21wdCB0aGUgdXNlciBmb3IgYXV0aGVudGljYXRpb24gaW5mb3JtYXRpb24uICovXG4vKiBlc2xpbnQtZGlzYWJsZSByZWFjdC9wcm9wLXR5cGVzICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBdXRoZW50aWNhdGlvblByb21wdCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxEZWZhdWx0UHJvcHMsIFByb3BzLCBTdGF0ZT4ge1xuICBjb25zdHJ1Y3Rvcihwcm9wczogUHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gIH1cblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICAvLyBJbnN0cnVjdGlvbnMgbWF5IGNvbnRhaW4gbmV3bGluZXMgdGhhdCBuZWVkIHRvIGJlIGNvbnZlcnRlZCB0byA8YnI+IHRhZ3MuXG4gICAgY29uc3Qgc2FmZUh0bWwgPSB0aGlzLnByb3BzLmluc3RydWN0aW9uc1xuICAgICAgICAucmVwbGFjZSgvJi9nLCAnJmFtcDsnKVxuICAgICAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgICAgIC5yZXBsYWNlKC9cXFxcbi9nLCAnPGJyPicpO1xuXG4gICAgLy8gV2UgbmVlZCBuYXRpdmUta2V5LWJpbmRpbmdzIHNvIHRoYXQgZGVsZXRlIHdvcmtzIGFuZCB3ZSBuZWVkXG4gICAgLy8gX29uS2V5VXAgc28gdGhhdCBlc2NhcGUgYW5kIGVudGVyIHdvcmtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiByZWY9XCJyb290XCI+XG4gICAgICAgIDxkaXZcbiAgICAgICAgICBjbGFzc05hbWU9XCJibG9ja1wiXG4gICAgICAgICAgc3R5bGU9e3t3aGl0ZVNwYWNlOiAncHJlJ319XG4gICAgICAgICAgZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUw9e3tfX2h0bWw6IHNhZmVIdG1sfX1cbiAgICAgICAgLz5cbiAgICAgICAgPGlucHV0XG4gICAgICAgICAgdHlwZT1cInBhc3N3b3JkXCJcbiAgICAgICAgICBjbGFzc05hbWU9XCJudWNsaWRlLXBhc3N3b3JkIG5hdGl2ZS1rZXktYmluZGluZ3NcIlxuICAgICAgICAgIHJlZj1cInBhc3N3b3JkXCJcbiAgICAgICAgICBvbktleVVwPXt0aGlzLl9vbktleVVwLmJpbmQodGhpcyl9XG4gICAgICAgIC8+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbiAgX29uS2V5VXAoZTogU3ludGhldGljRXZlbnQpOiB2b2lkIHtcbiAgICBpZiAoZS5rZXkgPT09ICdFbnRlcicpIHtcbiAgICAgIHRoaXMucHJvcHMub25Db25maXJtKCk7XG4gICAgfVxuXG4gICAgaWYgKGUua2V5ID09PSAnRXNjYXBlJykge1xuICAgICAgdGhpcy5wcm9wcy5vbkNhbmNlbCgpO1xuICAgIH1cbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCk6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICBjb25zdCByb290ID0gUmVhY3RET00uZmluZERPTU5vZGUodGhpcy5yZWZzWydyb290J10pO1xuXG4gICAgLy8gSGl0dGluZyBlbnRlciB3aGVuIHRoaXMgcGFuZWwgaGFzIGZvY3VzIHNob3VsZCBjb25maXJtIHRoZSBkaWFsb2cuXG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKGF0b20uY29tbWFuZHMuYWRkKFxuICAgICAgICByb290LFxuICAgICAgICAnY29yZTpjb25maXJtJyxcbiAgICAgICAgKGV2ZW50KSA9PiB0aGlzLnByb3BzLm9uQ29uZmlybSgpKSk7XG5cbiAgICAvLyBIaXR0aW5nIGVzY2FwZSB3aGVuIHRoaXMgcGFuZWwgaGFzIGZvY3VzIHNob3VsZCBjYW5jZWwgdGhlIGRpYWxvZy5cbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoXG4gICAgICAgIHJvb3QsXG4gICAgICAgICdjb3JlOmNhbmNlbCcsXG4gICAgICAgIChldmVudCkgPT4gdGhpcy5wcm9wcy5vbkNhbmNlbCgpKSk7XG5cbiAgICBSZWFjdERPTS5maW5kRE9NTm9kZSh0aGlzLnJlZnMucGFzc3dvcmQpLmZvY3VzKCk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fZGlzcG9zYWJsZXMpIHtcbiAgICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuX2Rpc3Bvc2FibGVzID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBnZXRQYXNzd29yZCgpOiBzdHJpbmcge1xuICAgIHJldHVybiBSZWFjdERPTS5maW5kRE9NTm9kZSh0aGlzLnJlZnMucGFzc3dvcmQpLnZhbHVlO1xuICB9XG59XG4vKiBlc2xpbnQtZW5hYmxlIHJlYWN0L3Byb3AtdHlwZXMgKi9cbiJdfQ==