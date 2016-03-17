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

exports['default'] = createOutputGadget;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _Console = require('./Console');

var _Console2 = _interopRequireDefault(_Console);

var _reactForAtom = require('react-for-atom');

function createOutputGadget(state$, commands) {
  var OutputGadget = (function (_React$Component) {
    _inherits(OutputGadget, _React$Component);

    _createClass(OutputGadget, null, [{
      key: 'gadgetId',
      value: 'nuclide-output',
      enumerable: true
    }, {
      key: 'defaultLocation',
      value: 'bottom',
      enumerable: true
    }]);

    function OutputGadget(props) {
      _classCallCheck(this, OutputGadget);

      _get(Object.getPrototypeOf(OutputGadget.prototype), 'constructor', this).call(this, props);
      this.state = {
        records: []
      };
    }

    _createClass(OutputGadget, [{
      key: 'getTitle',
      value: function getTitle() {
        return 'Output';
      }
    }, {
      key: 'componentWillMount',
      value: function componentWillMount() {
        var _this = this;

        this._state$Subscription = state$.subscribe(function (state) {
          return _this.setState({ records: state.records });
        });
      }
    }, {
      key: 'componentWillUnmount',
      value: function componentWillUnmount() {
        this._state$Subscription.dispose();
      }
    }, {
      key: 'render',
      value: function render() {
        return _reactForAtom.React.createElement(_Console2['default'], {
          clearRecords: function () {
            return commands.clearRecords();
          },
          records: this.state.records
        });
      }
    }]);

    return OutputGadget;
  })(_reactForAtom.React.Component);

  return OutputGadget;
}

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNyZWF0ZU91dHB1dEdhZGdldC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O3FCQXVCd0Isa0JBQWtCOzs7Ozs7Ozt1QkFQdEIsV0FBVzs7Ozs0QkFDWCxnQkFBZ0I7O0FBTXJCLFNBQVMsa0JBQWtCLENBQ3hDLE1BQStCLEVBQy9CLFFBQWtCLEVBQ1Y7TUFFRixZQUFZO2NBQVosWUFBWTs7aUJBQVosWUFBWTs7YUFJRSxnQkFBZ0I7Ozs7YUFDVCxRQUFROzs7O0FBSXRCLGFBVFAsWUFBWSxDQVNKLEtBQVksRUFBRTs0QkFUdEIsWUFBWTs7QUFVZCxpQ0FWRSxZQUFZLDZDQVVSLEtBQUssRUFBRTtBQUNiLFVBQUksQ0FBQyxLQUFLLEdBQUc7QUFDWCxlQUFPLEVBQUUsRUFBRTtPQUNaLENBQUM7S0FDSDs7aUJBZEcsWUFBWTs7YUFnQlIsb0JBQVc7QUFDakIsZUFBTyxRQUFRLENBQUM7T0FDakI7OzthQUVpQiw4QkFBRzs7O0FBQ25CLFlBQUksQ0FBQyxtQkFBbUIsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLFVBQUEsS0FBSztpQkFBSSxNQUFLLFFBQVEsQ0FBQyxFQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsT0FBTyxFQUFDLENBQUM7U0FBQSxDQUFDLENBQUM7T0FDL0Y7OzthQUVtQixnQ0FBRztBQUNyQixZQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLENBQUM7T0FDcEM7OzthQUVLLGtCQUFrQjtBQUN0QixlQUNFO0FBQ0Usc0JBQVksRUFBRTttQkFBTSxRQUFRLENBQUMsWUFBWSxFQUFFO1dBQUEsQUFBQztBQUM1QyxpQkFBTyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxBQUFDO1VBQzVCLENBQ0Y7T0FDSDs7O1dBbkNHLFlBQVk7S0FBUyxvQkFBTSxTQUFTOztBQXVDMUMsU0FBUyxZQUFZLENBQWdCO0NBQ3RDIiwiZmlsZSI6ImNyZWF0ZU91dHB1dEdhZGdldC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIENvbW1hbmRzIGZyb20gJy4vQ29tbWFuZHMnO1xuaW1wb3J0IHR5cGUge0dhZGdldH0gZnJvbSAnLi4vLi4vbnVjbGlkZS1nYWRnZXRzLWludGVyZmFjZXMnO1xuaW1wb3J0IHR5cGUge0FwcFN0YXRlLCBSZWNvcmR9IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0IHR5cGUgUnggZnJvbSAncngnO1xuXG5pbXBvcnQgQ29uc29sZSBmcm9tICcuL0NvbnNvbGUnO1xuaW1wb3J0IHtSZWFjdH0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuXG50eXBlIFN0YXRlID0ge1xuICByZWNvcmRzOiBBcnJheTxSZWNvcmQ+O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY3JlYXRlT3V0cHV0R2FkZ2V0KFxuICBzdGF0ZSQ6IFJ4Lk9ic2VydmFibGU8QXBwU3RhdGU+LFxuICBjb21tYW5kczogQ29tbWFuZHMsXG4pOiBHYWRnZXQge1xuXG4gIGNsYXNzIE91dHB1dEdhZGdldCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cbiAgICBzdGF0ZTogU3RhdGU7XG5cbiAgICBzdGF0aWMgZ2FkZ2V0SWQgPSAnbnVjbGlkZS1vdXRwdXQnO1xuICAgIHN0YXRpYyBkZWZhdWx0TG9jYXRpb24gPSAnYm90dG9tJztcblxuICAgIF9zdGF0ZSRTdWJzY3JpcHRpb246IElEaXNwb3NhYmxlO1xuXG4gICAgY29uc3RydWN0b3IocHJvcHM6IG1peGVkKSB7XG4gICAgICBzdXBlcihwcm9wcyk7XG4gICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICByZWNvcmRzOiBbXSxcbiAgICAgIH07XG4gICAgfVxuXG4gICAgZ2V0VGl0bGUoKTogc3RyaW5nIHtcbiAgICAgIHJldHVybiAnT3V0cHV0JztcbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsTW91bnQoKSB7XG4gICAgICB0aGlzLl9zdGF0ZSRTdWJzY3JpcHRpb24gPSBzdGF0ZSQuc3Vic2NyaWJlKHN0YXRlID0+IHRoaXMuc2V0U3RhdGUoe3JlY29yZHM6IHN0YXRlLnJlY29yZHN9KSk7XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICB0aGlzLl9zdGF0ZSRTdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgIH1cblxuICAgIHJlbmRlcigpOiA/UmVhY3RFbGVtZW50IHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxDb25zb2xlXG4gICAgICAgICAgY2xlYXJSZWNvcmRzPXsoKSA9PiBjb21tYW5kcy5jbGVhclJlY29yZHMoKX1cbiAgICAgICAgICByZWNvcmRzPXt0aGlzLnN0YXRlLnJlY29yZHN9XG4gICAgICAgIC8+XG4gICAgICApO1xuICAgIH1cblxuICB9XG5cbiAgcmV0dXJuICgoT3V0cHV0R2FkZ2V0OiBhbnkpOiBHYWRnZXQpO1xufVxuIl19