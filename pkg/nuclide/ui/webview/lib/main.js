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

/*eslint-disable react/prop-types */

var _atom = require('atom');

var _reactForAtom = require('react-for-atom');

var Webview = (function (_React$Component) {
  _inherits(Webview, _React$Component);

  function Webview(props) {
    _classCallCheck(this, Webview);

    _get(Object.getPrototypeOf(Webview.prototype), 'constructor', this).call(this, props);
    this._handleDidFinishLoad = this._handleDidFinishLoad.bind(this);
    this._disposables = new _atom.CompositeDisposable();
  }

  _createClass(Webview, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this = this;

      var element = _reactForAtom.React.findDOMNode(this);

      // Add event listeners. This has the drawbacks of 1) adding an event listener even when we don't
      // have a callback for it and 2) needing to add explicit support for each event type we want to
      // support. However, those costs aren't great enough to justify a new abstraction for managing
      // it at this time.
      element.addEventListener('did-finish-load', this._handleDidFinishLoad);
      this._disposables.add(new _atom.Disposable(function () {
        return element.removeEventListener('did-finish-load', _this._handleDidFinishLoad);
      }));

      this.updateAttributes({});
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps) {
      this.updateAttributes(prevProps);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this._disposables.dispose();
    }
  }, {
    key: 'render',
    value: function render() {
      return _reactForAtom.React.createElement('webview', { className: this.props.className, style: this.props.style });
    }

    /**
     * Update the attributes on the current element. Custom attributes won't be added by React because
     * "webview" isn't a valid custom element name (custom elements need a dash), so we set the
     * attributes ourselves. But not "className" or "style" because React has special rules for those.
     * *sigh*
     */
  }, {
    key: 'updateAttributes',
    value: function updateAttributes(prevProps) {
      var _this2 = this;

      var element = _reactForAtom.React.findDOMNode(this);
      var specialProps = ['className', 'style', 'onDidFinishLoad'];
      var normalProps = Object.keys(this.props).filter(function (prop) {
        return specialProps.indexOf(prop) === -1;
      });
      normalProps.forEach(function (prop) {
        var value = _this2.props[prop];
        var prevValue = prevProps[prop];
        var valueChanged = value !== prevValue;
        if (valueChanged) {
          element[prop] = value;
        }
      });
    }
  }, {
    key: '_handleDidFinishLoad',
    value: function _handleDidFinishLoad(event) {
      if (this.props.onDidFinishLoad) {
        this.props.onDidFinishLoad(event);
      }
    }
  }]);

  return Webview;
})(_reactForAtom.React.Component);

exports['default'] = Webview;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztvQkFhOEMsTUFBTTs7NEJBQ2hDLGdCQUFnQjs7SUFVZixPQUFPO1lBQVAsT0FBTzs7QUFFZixXQUZRLE9BQU8sQ0FFZCxLQUFhLEVBQUU7MEJBRlIsT0FBTzs7QUFHeEIsK0JBSGlCLE9BQU8sNkNBR2xCLEtBQUssRUFBRTtBQUNiLFFBQUksQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2pFLFFBQUksQ0FBQyxZQUFZLEdBQUcsK0JBQXlCLENBQUM7R0FDL0M7O2VBTmtCLE9BQU87O1dBUVQsNkJBQUc7OztBQUNsQixVQUFNLE9BQU8sR0FBRyxvQkFBTSxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7Ozs7OztBQU14QyxhQUFPLENBQUMsZ0JBQWdCLENBQUMsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUM7QUFDdkUsVUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQ25CLHFCQUNFO2VBQU0sT0FBTyxDQUFDLG1CQUFtQixDQUFDLGlCQUFpQixFQUFFLE1BQUssb0JBQW9CLENBQUM7T0FBQSxDQUNoRixDQUNGLENBQUM7O0FBRUYsVUFBSSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsQ0FBQyxDQUFDO0tBQzNCOzs7V0FFaUIsNEJBQUMsU0FBZ0IsRUFBUTtBQUN6QyxVQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLENBQUM7S0FDbEM7OztXQUVtQixnQ0FBRztBQUNyQixVQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQzdCOzs7V0FFSyxrQkFBa0I7QUFDdEIsYUFDRSwrQ0FBUyxTQUFTLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEFBQUMsRUFBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEFBQUMsR0FBRyxDQUNyRTtLQUNIOzs7Ozs7Ozs7O1dBUWUsMEJBQUMsU0FBaUIsRUFBUTs7O0FBQ3hDLFVBQU0sT0FBTyxHQUFHLG9CQUFNLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN4QyxVQUFNLFlBQVksR0FBRyxDQUFDLFdBQVcsRUFBRSxPQUFPLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztBQUMvRCxVQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBQSxJQUFJO2VBQUksWUFBWSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7T0FBQSxDQUFDLENBQUM7QUFDOUYsaUJBQVcsQ0FBQyxPQUFPLENBQUMsVUFBQSxJQUFJLEVBQUk7QUFDMUIsWUFBTSxLQUFLLEdBQUcsT0FBSyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDL0IsWUFBTSxTQUFTLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2xDLFlBQU0sWUFBWSxHQUFHLEtBQUssS0FBSyxTQUFTLENBQUM7QUFDekMsWUFBSSxZQUFZLEVBQUU7QUFDaEIsaUJBQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUM7U0FDdkI7T0FDRixDQUFDLENBQUM7S0FDSjs7O1dBRW1CLDhCQUFDLEtBQVksRUFBUTtBQUN2QyxVQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsZUFBZSxFQUFFO0FBQzlCLFlBQUksQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDO09BQ25DO0tBQ0Y7OztTQS9Ea0IsT0FBTztHQUFTLG9CQUFNLFNBQVM7O3FCQUEvQixPQUFPIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG4vKmVzbGludC1kaXNhYmxlIHJlYWN0L3Byb3AtdHlwZXMgKi9cblxuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlLCBEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCB7UmVhY3R9IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcblxudHlwZSBQcm9wcyA9IHtcbiAgY2xhc3NOYW1lOiA/c3RyaW5nO1xuICBub2RlaW50ZWdyYXRpb246ID9ib29sZWFuO1xuICBvbkRpZEZpbmlzaExvYWQ6IChldmVudDogRXZlbnQpID0+IG1peGVkO1xuICBzcmM6IHN0cmluZztcbiAgc3R5bGU6ID9PYmplY3Q7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBXZWJ2aWV3IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PHZvaWQsIFByb3BzLCB2b2lkPiB7XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IE9iamVjdCkge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICB0aGlzLl9oYW5kbGVEaWRGaW5pc2hMb2FkID0gdGhpcy5faGFuZGxlRGlkRmluaXNoTG9hZC5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIGNvbnN0IGVsZW1lbnQgPSBSZWFjdC5maW5kRE9NTm9kZSh0aGlzKTtcblxuICAgIC8vIEFkZCBldmVudCBsaXN0ZW5lcnMuIFRoaXMgaGFzIHRoZSBkcmF3YmFja3Mgb2YgMSkgYWRkaW5nIGFuIGV2ZW50IGxpc3RlbmVyIGV2ZW4gd2hlbiB3ZSBkb24ndFxuICAgIC8vIGhhdmUgYSBjYWxsYmFjayBmb3IgaXQgYW5kIDIpIG5lZWRpbmcgdG8gYWRkIGV4cGxpY2l0IHN1cHBvcnQgZm9yIGVhY2ggZXZlbnQgdHlwZSB3ZSB3YW50IHRvXG4gICAgLy8gc3VwcG9ydC4gSG93ZXZlciwgdGhvc2UgY29zdHMgYXJlbid0IGdyZWF0IGVub3VnaCB0byBqdXN0aWZ5IGEgbmV3IGFic3RyYWN0aW9uIGZvciBtYW5hZ2luZ1xuICAgIC8vIGl0IGF0IHRoaXMgdGltZS5cbiAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2RpZC1maW5pc2gtbG9hZCcsIHRoaXMuX2hhbmRsZURpZEZpbmlzaExvYWQpO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZChcbiAgICAgIG5ldyBEaXNwb3NhYmxlKFxuICAgICAgICAoKSA9PiBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2RpZC1maW5pc2gtbG9hZCcsIHRoaXMuX2hhbmRsZURpZEZpbmlzaExvYWQpLFxuICAgICAgKSxcbiAgICApO1xuXG4gICAgdGhpcy51cGRhdGVBdHRyaWJ1dGVzKHt9KTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZFVwZGF0ZShwcmV2UHJvcHM6IFByb3BzKTogdm9pZCB7XG4gICAgdGhpcy51cGRhdGVBdHRyaWJ1dGVzKHByZXZQcm9wcyk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gIH1cblxuICByZW5kZXIoKTogP1JlYWN0RWxlbWVudCB7XG4gICAgcmV0dXJuIChcbiAgICAgIDx3ZWJ2aWV3IGNsYXNzTmFtZT17dGhpcy5wcm9wcy5jbGFzc05hbWV9IHN0eWxlPXt0aGlzLnByb3BzLnN0eWxlfSAvPlxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlIHRoZSBhdHRyaWJ1dGVzIG9uIHRoZSBjdXJyZW50IGVsZW1lbnQuIEN1c3RvbSBhdHRyaWJ1dGVzIHdvbid0IGJlIGFkZGVkIGJ5IFJlYWN0IGJlY2F1c2VcbiAgICogXCJ3ZWJ2aWV3XCIgaXNuJ3QgYSB2YWxpZCBjdXN0b20gZWxlbWVudCBuYW1lIChjdXN0b20gZWxlbWVudHMgbmVlZCBhIGRhc2gpLCBzbyB3ZSBzZXQgdGhlXG4gICAqIGF0dHJpYnV0ZXMgb3Vyc2VsdmVzLiBCdXQgbm90IFwiY2xhc3NOYW1lXCIgb3IgXCJzdHlsZVwiIGJlY2F1c2UgUmVhY3QgaGFzIHNwZWNpYWwgcnVsZXMgZm9yIHRob3NlLlxuICAgKiAqc2lnaCpcbiAgICovXG4gIHVwZGF0ZUF0dHJpYnV0ZXMocHJldlByb3BzOiBPYmplY3QpOiB2b2lkIHtcbiAgICBjb25zdCBlbGVtZW50ID0gUmVhY3QuZmluZERPTU5vZGUodGhpcyk7XG4gICAgY29uc3Qgc3BlY2lhbFByb3BzID0gWydjbGFzc05hbWUnLCAnc3R5bGUnLCAnb25EaWRGaW5pc2hMb2FkJ107XG4gICAgY29uc3Qgbm9ybWFsUHJvcHMgPSBPYmplY3Qua2V5cyh0aGlzLnByb3BzKS5maWx0ZXIocHJvcCA9PiBzcGVjaWFsUHJvcHMuaW5kZXhPZihwcm9wKSA9PT0gLTEpO1xuICAgIG5vcm1hbFByb3BzLmZvckVhY2gocHJvcCA9PiB7XG4gICAgICBjb25zdCB2YWx1ZSA9IHRoaXMucHJvcHNbcHJvcF07XG4gICAgICBjb25zdCBwcmV2VmFsdWUgPSBwcmV2UHJvcHNbcHJvcF07XG4gICAgICBjb25zdCB2YWx1ZUNoYW5nZWQgPSB2YWx1ZSAhPT0gcHJldlZhbHVlO1xuICAgICAgaWYgKHZhbHVlQ2hhbmdlZCkge1xuICAgICAgICBlbGVtZW50W3Byb3BdID0gdmFsdWU7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBfaGFuZGxlRGlkRmluaXNoTG9hZChldmVudDogRXZlbnQpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5wcm9wcy5vbkRpZEZpbmlzaExvYWQpIHtcbiAgICAgIHRoaXMucHJvcHMub25EaWRGaW5pc2hMb2FkKGV2ZW50KTtcbiAgICB9XG4gIH1cblxufVxuIl19