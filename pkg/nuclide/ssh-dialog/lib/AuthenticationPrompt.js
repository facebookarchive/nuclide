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

var _atom = require('atom');

var _reactForAtom = require('react-for-atom');

var _reactForAtom2 = _interopRequireDefault(_reactForAtom);

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
      return _reactForAtom2['default'].createElement(
        'div',
        { ref: 'root' },
        _reactForAtom2['default'].createElement('div', {
          className: 'block',
          style: { whiteSpace: 'pre' },
          dangerouslySetInnerHTML: { __html: safeHtml }
        }),
        _reactForAtom2['default'].createElement('input', {
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
      var root = _reactForAtom2['default'].findDOMNode(this.refs['root']);

      // Hitting enter when this panel has focus should confirm the dialog.
      this._disposables.add(atom.commands.add(root, 'core:confirm', function (event) {
        return _this.props.onConfirm();
      }));

      // Hitting escape when this panel has focus should cancel the dialog.
      this._disposables.add(atom.commands.add(root, 'core:cancel', function (event) {
        return _this.props.onCancel();
      }));

      _reactForAtom2['default'].findDOMNode(this.refs.password).focus();
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
      return _reactForAtom2['default'].findDOMNode(this.refs.password).value;
    }
  }]);

  return AuthenticationPrompt;
})(_reactForAtom2['default'].Component);

exports['default'] = AuthenticationPrompt;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkF1dGhlbnRpY2F0aW9uUHJvbXB0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7b0JBV2tDLE1BQU07OzRCQUN0QixnQkFBZ0I7Ozs7Ozs7SUFZYixvQkFBb0I7WUFBcEIsb0JBQW9COztBQUM1QixXQURRLG9CQUFvQixDQUMzQixLQUFZLEVBQUU7MEJBRFAsb0JBQW9COztBQUVyQywrQkFGaUIsb0JBQW9CLDZDQUUvQixLQUFLLEVBQUU7R0FDZDs7OztlQUhrQixvQkFBb0I7O1dBS2pDLGtCQUFpQjs7QUFFckIsVUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQ25DLE9BQU8sQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQ3RCLE9BQU8sQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQ3JCLE9BQU8sQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7Ozs7QUFJN0IsYUFDRTs7VUFBSyxHQUFHLEVBQUMsTUFBTTtRQUNiO0FBQ0UsbUJBQVMsRUFBQyxPQUFPO0FBQ2pCLGVBQUssRUFBRSxFQUFDLFVBQVUsRUFBRSxLQUFLLEVBQUMsQUFBQztBQUMzQixpQ0FBdUIsRUFBRSxFQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUMsQUFBQztVQUM1QztRQUNGO0FBQ0UsY0FBSSxFQUFDLFVBQVU7QUFDZixtQkFBUyxFQUFDLHNDQUFzQztBQUNoRCxhQUFHLEVBQUMsVUFBVTtBQUNkLGlCQUFPLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEFBQUM7VUFDbEM7T0FDRSxDQUNOO0tBQ0g7OztXQUVPLGtCQUFDLENBQWlCLEVBQVE7QUFDaEMsVUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLE9BQU8sRUFBRTtBQUNyQixZQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFDO09BQ3hCOztBQUVELFVBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSyxRQUFRLEVBQUU7QUFDdEIsWUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztPQUN2QjtLQUNGOzs7V0FFZ0IsNkJBQVM7OztBQUN4QixVQUFJLENBQUMsWUFBWSxHQUFHLCtCQUF5QixDQUFDO0FBQzlDLFVBQU0sSUFBSSxHQUFHLDBCQUFNLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7OztBQUdsRCxVQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FDbkMsSUFBSSxFQUNKLGNBQWMsRUFDZCxVQUFDLEtBQUs7ZUFBSyxNQUFLLEtBQUssQ0FBQyxTQUFTLEVBQUU7T0FBQSxDQUFDLENBQUMsQ0FBQzs7O0FBR3hDLFVBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUNuQyxJQUFJLEVBQ0osYUFBYSxFQUNiLFVBQUMsS0FBSztlQUFLLE1BQUssS0FBSyxDQUFDLFFBQVEsRUFBRTtPQUFBLENBQUMsQ0FBQyxDQUFDOztBQUV2QyxnQ0FBTSxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztLQUMvQzs7O1dBRW1CLGdDQUFTO0FBQzNCLFVBQUksSUFBSSxDQUFDLFlBQVksRUFBRTtBQUNyQixZQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQzVCLFlBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO09BQzFCO0tBQ0Y7OztXQUVVLHVCQUFXO0FBQ3BCLGFBQU8sMEJBQU0sV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsS0FBSyxDQUFDO0tBQ3BEOzs7U0FyRWtCLG9CQUFvQjtHQUFTLDBCQUFNLFNBQVM7O3FCQUE1QyxvQkFBb0IiLCJmaWxlIjoiQXV0aGVudGljYXRpb25Qcm9tcHQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcblxudHlwZSBEZWZhdWx0UHJvcHMgPSB7fTtcbnR5cGUgUHJvcHMgPSB7XG4gIGluc3RydWN0aW9uczogc3RyaW5nO1xuICBvbkNvbmZpcm06ICgpID0+IG1peGVkO1xuICBvbkNhbmNlbDogKCkgPT4gbWl4ZWQ7XG59O1xudHlwZSBTdGF0ZSA9IHt9O1xuXG4vKiogQ29tcG9uZW50IHRvIHByb21wdCB0aGUgdXNlciBmb3IgYXV0aGVudGljYXRpb24gaW5mb3JtYXRpb24uICovXG4vKiBlc2xpbnQtZGlzYWJsZSByZWFjdC9wcm9wLXR5cGVzICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBdXRoZW50aWNhdGlvblByb21wdCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxEZWZhdWx0UHJvcHMsIFByb3BzLCBTdGF0ZT4ge1xuICBjb25zdHJ1Y3Rvcihwcm9wczogUHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gIH1cblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICAvLyBJbnN0cnVjdGlvbnMgbWF5IGNvbnRhaW4gbmV3bGluZXMgdGhhdCBuZWVkIHRvIGJlIGNvbnZlcnRlZCB0byA8YnI+IHRhZ3MuXG4gICAgY29uc3Qgc2FmZUh0bWwgPSB0aGlzLnByb3BzLmluc3RydWN0aW9uc1xuICAgICAgICAucmVwbGFjZSgvJi9nLCAnJmFtcDsnKVxuICAgICAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgICAgIC5yZXBsYWNlKC9cXFxcbi9nLCAnPGJyPicpO1xuXG4gICAgLy8gV2UgbmVlZCBuYXRpdmUta2V5LWJpbmRpbmdzIHNvIHRoYXQgZGVsZXRlIHdvcmtzIGFuZCB3ZSBuZWVkXG4gICAgLy8gX29uS2V5VXAgc28gdGhhdCBlc2NhcGUgYW5kIGVudGVyIHdvcmtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiByZWY9XCJyb290XCI+XG4gICAgICAgIDxkaXZcbiAgICAgICAgICBjbGFzc05hbWU9XCJibG9ja1wiXG4gICAgICAgICAgc3R5bGU9e3t3aGl0ZVNwYWNlOiAncHJlJ319XG4gICAgICAgICAgZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUw9e3tfX2h0bWw6IHNhZmVIdG1sfX1cbiAgICAgICAgLz5cbiAgICAgICAgPGlucHV0XG4gICAgICAgICAgdHlwZT1cInBhc3N3b3JkXCJcbiAgICAgICAgICBjbGFzc05hbWU9XCJudWNsaWRlLXBhc3N3b3JkIG5hdGl2ZS1rZXktYmluZGluZ3NcIlxuICAgICAgICAgIHJlZj1cInBhc3N3b3JkXCJcbiAgICAgICAgICBvbktleVVwPXt0aGlzLl9vbktleVVwLmJpbmQodGhpcyl9XG4gICAgICAgIC8+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbiAgX29uS2V5VXAoZTogU3ludGhldGljRXZlbnQpOiB2b2lkIHtcbiAgICBpZiAoZS5rZXkgPT09ICdFbnRlcicpIHtcbiAgICAgIHRoaXMucHJvcHMub25Db25maXJtKCk7XG4gICAgfVxuXG4gICAgaWYgKGUua2V5ID09PSAnRXNjYXBlJykge1xuICAgICAgdGhpcy5wcm9wcy5vbkNhbmNlbCgpO1xuICAgIH1cbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCk6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICBjb25zdCByb290ID0gUmVhY3QuZmluZERPTU5vZGUodGhpcy5yZWZzWydyb290J10pO1xuXG4gICAgLy8gSGl0dGluZyBlbnRlciB3aGVuIHRoaXMgcGFuZWwgaGFzIGZvY3VzIHNob3VsZCBjb25maXJtIHRoZSBkaWFsb2cuXG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKGF0b20uY29tbWFuZHMuYWRkKFxuICAgICAgICByb290LFxuICAgICAgICAnY29yZTpjb25maXJtJyxcbiAgICAgICAgKGV2ZW50KSA9PiB0aGlzLnByb3BzLm9uQ29uZmlybSgpKSk7XG5cbiAgICAvLyBIaXR0aW5nIGVzY2FwZSB3aGVuIHRoaXMgcGFuZWwgaGFzIGZvY3VzIHNob3VsZCBjYW5jZWwgdGhlIGRpYWxvZy5cbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoXG4gICAgICAgIHJvb3QsXG4gICAgICAgICdjb3JlOmNhbmNlbCcsXG4gICAgICAgIChldmVudCkgPT4gdGhpcy5wcm9wcy5vbkNhbmNlbCgpKSk7XG5cbiAgICBSZWFjdC5maW5kRE9NTm9kZSh0aGlzLnJlZnMucGFzc3dvcmQpLmZvY3VzKCk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fZGlzcG9zYWJsZXMpIHtcbiAgICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuX2Rpc3Bvc2FibGVzID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBnZXRQYXNzd29yZCgpOiBzdHJpbmcge1xuICAgIHJldHVybiBSZWFjdC5maW5kRE9NTm9kZSh0aGlzLnJlZnMucGFzc3dvcmQpLnZhbHVlO1xuICB9XG59XG4vKiBlc2xpbnQtZW5hYmxlIHJlYWN0L3Byb3AtdHlwZXMgKi9cbiJdfQ==