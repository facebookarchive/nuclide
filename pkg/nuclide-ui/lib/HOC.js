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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

exports.injectObservableAsProps = injectObservableAsProps;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _reactForAtom = require('react-for-atom');

/**
 * Injects any key/value pairs from the given Observable value into the component as named props.
 * e.g. `injectObservableAsProps(Rx.Observable.just({val: 42}), FooComponent)` will translate to
 * `<FooComponent val={42} />`.
 *
 * The resulting component re-renders on updates to the observable.
 * The wrapped component is guaranteed to render only if the observable has resolved;
 * otherwise, the wrapper component renders `null`.
 */

function injectObservableAsProps(stream, ComposedComponent) {
  // $FlowIssue The return type is guaranteed to be the same as the type of ComposedComponent.
  return (function (_React$Component) {
    _inherits(_class, _React$Component);

    function _class(props) {
      _classCallCheck(this, _class);

      _get(Object.getPrototypeOf(_class.prototype), 'constructor', this).call(this, props);
      this._subscription = null;
      this.state = {};
      this._resolved = false;
    }

    _createClass(_class, [{
      key: 'componentDidMount',
      value: function componentDidMount() {
        var _this = this;

        this._subscription = stream.subscribe(function (newState) {
          _this._resolved = true;
          _this.setState(newState);
        });
      }
    }, {
      key: 'componentWillUnmount',
      value: function componentWillUnmount() {
        if (this._subscription != null) {
          this._subscription.unsubscribe();
        }
      }
    }, {
      key: 'render',
      value: function render() {
        if (!this._resolved) {
          return null;
        }
        var props = _extends({}, this.props, this.state);
        return _reactForAtom.React.createElement(ComposedComponent, props);
      }
    }]);

    return _class;
  })(_reactForAtom.React.Component);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkhPQy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7NEJBYW9CLGdCQUFnQjs7Ozs7Ozs7Ozs7O0FBVzdCLFNBQVMsdUJBQXVCLENBQ3JDLE1BQXdDLEVBQ3hDLGlCQUFvQixFQUNqQjs7QUFFSDs7O0FBS2Esb0JBQUMsS0FBSyxFQUFFOzs7QUFDakIsb0ZBQU0sS0FBSyxFQUFFO0FBQ2IsVUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7QUFDMUIsVUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7QUFDaEIsVUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7S0FDeEI7Ozs7YUFFZ0IsNkJBQVM7OztBQUN4QixZQUFJLENBQUMsYUFBYSxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsVUFBQSxRQUFRLEVBQUk7QUFDaEQsZ0JBQUssU0FBUyxHQUFHLElBQUksQ0FBQztBQUN0QixnQkFBSyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDekIsQ0FBQyxDQUFDO09BQ0o7OzthQUVtQixnQ0FBUztBQUMzQixZQUFJLElBQUksQ0FBQyxhQUFhLElBQUksSUFBSSxFQUFFO0FBQzlCLGNBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxFQUFFLENBQUM7U0FDbEM7T0FDRjs7O2FBRUssa0JBQW1CO0FBQ3ZCLFlBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFO0FBQ25CLGlCQUFPLElBQUksQ0FBQztTQUNiO0FBQ0QsWUFBTSxLQUFLLGdCQUNOLElBQUksQ0FBQyxLQUFLLEVBQ1YsSUFBSSxDQUFDLEtBQUssQ0FDZCxDQUFDO0FBQ0YsZUFBTyxrQ0FBQyxpQkFBaUIsRUFBSyxLQUFLLENBQUksQ0FBQztPQUN6Qzs7OztLQWxDa0Isb0JBQU0sU0FBUyxFQW1DbEM7Q0FDSCIsImZpbGUiOiJIT0MuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7T2JzZXJ2YWJsZX0gZnJvbSAnQHJlYWN0aXZleC9yeGpzJztcblxuaW1wb3J0IHtSZWFjdH0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuXG4vKipcbiAqIEluamVjdHMgYW55IGtleS92YWx1ZSBwYWlycyBmcm9tIHRoZSBnaXZlbiBPYnNlcnZhYmxlIHZhbHVlIGludG8gdGhlIGNvbXBvbmVudCBhcyBuYW1lZCBwcm9wcy5cbiAqIGUuZy4gYGluamVjdE9ic2VydmFibGVBc1Byb3BzKFJ4Lk9ic2VydmFibGUuanVzdCh7dmFsOiA0Mn0pLCBGb29Db21wb25lbnQpYCB3aWxsIHRyYW5zbGF0ZSB0b1xuICogYDxGb29Db21wb25lbnQgdmFsPXs0Mn0gLz5gLlxuICpcbiAqIFRoZSByZXN1bHRpbmcgY29tcG9uZW50IHJlLXJlbmRlcnMgb24gdXBkYXRlcyB0byB0aGUgb2JzZXJ2YWJsZS5cbiAqIFRoZSB3cmFwcGVkIGNvbXBvbmVudCBpcyBndWFyYW50ZWVkIHRvIHJlbmRlciBvbmx5IGlmIHRoZSBvYnNlcnZhYmxlIGhhcyByZXNvbHZlZDtcbiAqIG90aGVyd2lzZSwgdGhlIHdyYXBwZXIgY29tcG9uZW50IHJlbmRlcnMgYG51bGxgLlxuICovXG5leHBvcnQgZnVuY3Rpb24gaW5qZWN0T2JzZXJ2YWJsZUFzUHJvcHM8VCA6IFJlYWN0Q2xhc3M+KFxuICBzdHJlYW06IE9ic2VydmFibGU8e1trZXk6IHN0cmluZ106IGFueX0+LFxuICBDb21wb3NlZENvbXBvbmVudDogVCxcbik6IFQge1xuICAvLyAkRmxvd0lzc3VlIFRoZSByZXR1cm4gdHlwZSBpcyBndWFyYW50ZWVkIHRvIGJlIHRoZSBzYW1lIGFzIHRoZSB0eXBlIG9mIENvbXBvc2VkQ29tcG9uZW50LlxuICByZXR1cm4gY2xhc3MgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIF9zdWJzY3JpcHRpb246ID9yeCRJU3Vic2NyaXB0aW9uO1xuICAgIHN0YXRlOiB7W2tleTogc3RyaW5nXTogYW55fTtcbiAgICBfcmVzb2x2ZWQ6IGJvb2xlYW47XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgc3VwZXIocHJvcHMpO1xuICAgICAgdGhpcy5fc3Vic2NyaXB0aW9uID0gbnVsbDtcbiAgICAgIHRoaXMuc3RhdGUgPSB7fTtcbiAgICAgIHRoaXMuX3Jlc29sdmVkID0gZmFsc2U7XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKTogdm9pZCB7XG4gICAgICB0aGlzLl9zdWJzY3JpcHRpb24gPSBzdHJlYW0uc3Vic2NyaWJlKG5ld1N0YXRlID0+IHtcbiAgICAgICAgdGhpcy5fcmVzb2x2ZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLnNldFN0YXRlKG5ld1N0YXRlKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCk6IHZvaWQge1xuICAgICAgaWYgKHRoaXMuX3N1YnNjcmlwdGlvbiAhPSBudWxsKSB7XG4gICAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJlbmRlcigpOiA/UmVhY3QuRWxlbWVudCB7XG4gICAgICBpZiAoIXRoaXMuX3Jlc29sdmVkKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgY29uc3QgcHJvcHMgPSB7XG4gICAgICAgIC4uLnRoaXMucHJvcHMsXG4gICAgICAgIC4uLnRoaXMuc3RhdGUsXG4gICAgICB9O1xuICAgICAgcmV0dXJuIDxDb21wb3NlZENvbXBvbmVudCB7Li4ucHJvcHN9IC8+O1xuICAgIH1cbiAgfTtcbn1cbiJdfQ==