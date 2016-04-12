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
          this._subscription.dispose();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkhPQy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7NEJBYW9CLGdCQUFnQjs7Ozs7Ozs7Ozs7O0FBVzdCLFNBQVMsdUJBQXVCLENBQ3JDLE1BQXdDLEVBQ3hDLGlCQUFvQixFQUNqQjs7QUFFSDs7O0FBS2Esb0JBQUMsS0FBSyxFQUFFOzs7QUFDakIsb0ZBQU0sS0FBSyxFQUFFO0FBQ2IsVUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7QUFDMUIsVUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7QUFDaEIsVUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7S0FDeEI7Ozs7YUFFZ0IsNkJBQVM7OztBQUN4QixZQUFJLENBQUMsYUFBYSxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsVUFBQSxRQUFRLEVBQUk7QUFDaEQsZ0JBQUssU0FBUyxHQUFHLElBQUksQ0FBQztBQUN0QixnQkFBSyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDekIsQ0FBQyxDQUFDO09BQ0o7OzthQUVtQixnQ0FBUztBQUMzQixZQUFJLElBQUksQ0FBQyxhQUFhLElBQUksSUFBSSxFQUFFO0FBQzlCLGNBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUM7U0FDOUI7T0FDRjs7O2FBRUssa0JBQWtCO0FBQ3RCLFlBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFO0FBQ25CLGlCQUFPLElBQUksQ0FBQztTQUNiO0FBQ0QsWUFBTSxLQUFLLGdCQUNOLElBQUksQ0FBQyxLQUFLLEVBQ1YsSUFBSSxDQUFDLEtBQUssQ0FDZCxDQUFDO0FBQ0YsZUFBTyxrQ0FBQyxpQkFBaUIsRUFBSyxLQUFLLENBQUksQ0FBQztPQUN6Qzs7OztLQWxDa0Isb0JBQU0sU0FBUyxFQW1DbEM7Q0FDSCIsImZpbGUiOiJIT0MuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7T2JzZXJ2YWJsZX0gZnJvbSAncngnO1xuXG5pbXBvcnQge1JlYWN0fSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5cbi8qKlxuICogSW5qZWN0cyBhbnkga2V5L3ZhbHVlIHBhaXJzIGZyb20gdGhlIGdpdmVuIE9ic2VydmFibGUgdmFsdWUgaW50byB0aGUgY29tcG9uZW50IGFzIG5hbWVkIHByb3BzLlxuICogZS5nLiBgaW5qZWN0T2JzZXJ2YWJsZUFzUHJvcHMoUnguT2JzZXJ2YWJsZS5qdXN0KHt2YWw6IDQyfSksIEZvb0NvbXBvbmVudClgIHdpbGwgdHJhbnNsYXRlIHRvXG4gKiBgPEZvb0NvbXBvbmVudCB2YWw9ezQyfSAvPmAuXG4gKlxuICogVGhlIHJlc3VsdGluZyBjb21wb25lbnQgcmUtcmVuZGVycyBvbiB1cGRhdGVzIHRvIHRoZSBvYnNlcnZhYmxlLlxuICogVGhlIHdyYXBwZWQgY29tcG9uZW50IGlzIGd1YXJhbnRlZWQgdG8gcmVuZGVyIG9ubHkgaWYgdGhlIG9ic2VydmFibGUgaGFzIHJlc29sdmVkO1xuICogb3RoZXJ3aXNlLCB0aGUgd3JhcHBlciBjb21wb25lbnQgcmVuZGVycyBgbnVsbGAuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbmplY3RPYnNlcnZhYmxlQXNQcm9wczxUIDogUmVhY3RDbGFzcz4oXG4gIHN0cmVhbTogT2JzZXJ2YWJsZTx7W2tleTogc3RyaW5nXTogYW55fT4sXG4gIENvbXBvc2VkQ29tcG9uZW50OiBULFxuKTogVCB7XG4gIC8vICRGbG93SXNzdWUgVGhlIHJldHVybiB0eXBlIGlzIGd1YXJhbnRlZWQgdG8gYmUgdGhlIHNhbWUgYXMgdGhlIHR5cGUgb2YgQ29tcG9zZWRDb21wb25lbnQuXG4gIHJldHVybiBjbGFzcyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gICAgX3N1YnNjcmlwdGlvbjogP0lEaXNwb3NhYmxlO1xuICAgIHN0YXRlOiB7W2tleTogc3RyaW5nXTogYW55fTtcbiAgICBfcmVzb2x2ZWQ6IGJvb2xlYW47XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgc3VwZXIocHJvcHMpO1xuICAgICAgdGhpcy5fc3Vic2NyaXB0aW9uID0gbnVsbDtcbiAgICAgIHRoaXMuc3RhdGUgPSB7fTtcbiAgICAgIHRoaXMuX3Jlc29sdmVkID0gZmFsc2U7XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKTogdm9pZCB7XG4gICAgICB0aGlzLl9zdWJzY3JpcHRpb24gPSBzdHJlYW0uc3Vic2NyaWJlKG5ld1N0YXRlID0+IHtcbiAgICAgICAgdGhpcy5fcmVzb2x2ZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLnNldFN0YXRlKG5ld1N0YXRlKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCk6IHZvaWQge1xuICAgICAgaWYgKHRoaXMuX3N1YnNjcmlwdGlvbiAhPSBudWxsKSB7XG4gICAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmVuZGVyKCk6ID9SZWFjdEVsZW1lbnQge1xuICAgICAgaWYgKCF0aGlzLl9yZXNvbHZlZCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHByb3BzID0ge1xuICAgICAgICAuLi50aGlzLnByb3BzLFxuICAgICAgICAuLi50aGlzLnN0YXRlLFxuICAgICAgfTtcbiAgICAgIHJldHVybiA8Q29tcG9zZWRDb21wb25lbnQgey4uLnByb3BzfSAvPjtcbiAgICB9XG4gIH07XG59XG4iXX0=