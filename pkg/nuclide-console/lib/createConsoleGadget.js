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

exports['default'] = createConsoleGadget;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _Console = require('./Console');

var _Console2 = _interopRequireDefault(_Console);

var _reactForAtom = require('react-for-atom');

var _getCurrentExecutorId = require('./getCurrentExecutorId');

var _getCurrentExecutorId2 = _interopRequireDefault(_getCurrentExecutorId);

function createConsoleGadget(state$, commands) {
  var OutputGadget = (function (_React$Component) {
    _inherits(OutputGadget, _React$Component);

    _createClass(OutputGadget, null, [{
      key: 'gadgetId',
      value: 'nuclide-console',
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
        currentExecutor: null,
        executors: new Map(),
        records: []
      };
    }

    _createClass(OutputGadget, [{
      key: 'getIconName',
      value: function getIconName() {
        return 'terminal';
      }
    }, {
      key: 'getTitle',
      value: function getTitle() {
        return 'Console';
      }
    }, {
      key: 'componentWillMount',
      value: function componentWillMount() {
        var _this = this;

        this._state$Subscription = state$.subscribe(function (state) {
          var currentExecutorId = (0, _getCurrentExecutorId2['default'])(state);
          var currentExecutor = currentExecutorId != null ? state.executors.get(currentExecutorId) : null;
          _this.setState({
            currentExecutor: currentExecutor,
            executors: state.executors,
            records: state.records
          });
        });
      }
    }, {
      key: 'componentWillUnmount',
      value: function componentWillUnmount() {
        this._state$Subscription.unsubscribe();
      }
    }, {
      key: 'render',
      value: function render() {
        return _reactForAtom.React.createElement(_Console2['default'], {
          execute: function (code) {
            return commands.execute(code);
          },
          selectExecutor: commands.selectExecutor.bind(commands),
          clearRecords: commands.clearRecords.bind(commands),
          currentExecutor: this.state.currentExecutor,
          records: this.state.records,
          executors: this.state.executors
        });
      }
    }]);

    return OutputGadget;
  })(_reactForAtom.React.Component);

  return OutputGadget;
}

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNyZWF0ZUNvbnNvbGVHYWRnZXQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztxQkEwQndCLG1CQUFtQjs7Ozs7Ozs7dUJBVnZCLFdBQVc7Ozs7NEJBQ1gsZ0JBQWdCOztvQ0FDSCx3QkFBd0I7Ozs7QUFRMUMsU0FBUyxtQkFBbUIsQ0FDekMsTUFBK0IsRUFDL0IsUUFBa0IsRUFDVjtNQUVGLFlBQVk7Y0FBWixZQUFZOztpQkFBWixZQUFZOzthQUdFLGlCQUFpQjs7OzthQUNWLFFBQVE7Ozs7QUFJdEIsYUFSUCxZQUFZLENBUUosS0FBWSxFQUFFOzRCQVJ0QixZQUFZOztBQVNkLGlDQVRFLFlBQVksNkNBU1IsS0FBSyxFQUFFO0FBQ2IsVUFBSSxDQUFDLEtBQUssR0FBRztBQUNYLHVCQUFlLEVBQUUsSUFBSTtBQUNyQixpQkFBUyxFQUFFLElBQUksR0FBRyxFQUFFO0FBQ3BCLGVBQU8sRUFBRSxFQUFFO09BQ1osQ0FBQztLQUNIOztpQkFmRyxZQUFZOzthQWlCTCx1QkFBVztBQUNwQixlQUFPLFVBQVUsQ0FBQztPQUNuQjs7O2FBRU8sb0JBQVc7QUFDakIsZUFBTyxTQUFTLENBQUM7T0FDbEI7OzthQUVpQiw4QkFBRzs7O0FBQ25CLFlBQUksQ0FBQyxtQkFBbUIsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLFVBQUEsS0FBSyxFQUFJO0FBQ25ELGNBQU0saUJBQWlCLEdBQUcsdUNBQXFCLEtBQUssQ0FBQyxDQUFDO0FBQ3RELGNBQU0sZUFBZSxHQUNuQixpQkFBaUIsSUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsR0FBRyxJQUFJLENBQUM7QUFDNUUsZ0JBQUssUUFBUSxDQUFDO0FBQ1osMkJBQWUsRUFBZixlQUFlO0FBQ2YscUJBQVMsRUFBRSxLQUFLLENBQUMsU0FBUztBQUMxQixtQkFBTyxFQUFFLEtBQUssQ0FBQyxPQUFPO1dBQ3ZCLENBQUMsQ0FBQztTQUNKLENBQUMsQ0FBQztPQUNKOzs7YUFFbUIsZ0NBQUc7QUFDckIsWUFBSSxDQUFDLG1CQUFtQixDQUFDLFdBQVcsRUFBRSxDQUFDO09BQ3hDOzs7YUFFSyxrQkFBbUI7QUFDdkIsZUFDRTtBQUNFLGlCQUFPLEVBQUUsVUFBQSxJQUFJO21CQUFJLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDO1dBQUEsQUFBQztBQUN4Qyx3QkFBYyxFQUFFLFFBQVEsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxBQUFDO0FBQ3ZELHNCQUFZLEVBQUUsUUFBUSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEFBQUM7QUFDbkQseUJBQWUsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsQUFBQztBQUM1QyxpQkFBTyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxBQUFDO0FBQzVCLG1CQUFTLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEFBQUM7VUFDaEMsQ0FDRjtPQUNIOzs7V0FyREcsWUFBWTtLQUFTLG9CQUFNLFNBQVM7O0FBeUQxQyxTQUFTLFlBQVksQ0FBZ0I7Q0FDdEMiLCJmaWxlIjoiY3JlYXRlQ29uc29sZUdhZGdldC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIENvbW1hbmRzIGZyb20gJy4vQ29tbWFuZHMnO1xuaW1wb3J0IHR5cGUge0dhZGdldH0gZnJvbSAnLi4vLi4vbnVjbGlkZS1nYWRnZXRzLWludGVyZmFjZXMnO1xuaW1wb3J0IHR5cGUge0FwcFN0YXRlLCBSZWNvcmQsIEV4ZWN1dG9yfSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB0eXBlIFJ4IGZyb20gJ0ByZWFjdGl2ZXgvcnhqcyc7XG5cbmltcG9ydCBDb25zb2xlIGZyb20gJy4vQ29uc29sZSc7XG5pbXBvcnQge1JlYWN0fSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQgZ2V0Q3VycmVudEV4ZWN1dG9ySWQgZnJvbSAnLi9nZXRDdXJyZW50RXhlY3V0b3JJZCc7XG5cbnR5cGUgU3RhdGUgPSB7XG4gIGN1cnJlbnRFeGVjdXRvcjogP0V4ZWN1dG9yO1xuICByZWNvcmRzOiBBcnJheTxSZWNvcmQ+O1xuICBleGVjdXRvcnM6IE1hcDxzdHJpbmcsIEV4ZWN1dG9yPjtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNyZWF0ZUNvbnNvbGVHYWRnZXQoXG4gIHN0YXRlJDogUnguT2JzZXJ2YWJsZTxBcHBTdGF0ZT4sXG4gIGNvbW1hbmRzOiBDb21tYW5kcyxcbik6IEdhZGdldCB7XG5cbiAgY2xhc3MgT3V0cHV0R2FkZ2V0IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PHZvaWQsIHZvaWQsIFN0YXRlPiB7XG4gICAgc3RhdGU6IFN0YXRlO1xuXG4gICAgc3RhdGljIGdhZGdldElkID0gJ251Y2xpZGUtY29uc29sZSc7XG4gICAgc3RhdGljIGRlZmF1bHRMb2NhdGlvbiA9ICdib3R0b20nO1xuXG4gICAgX3N0YXRlJFN1YnNjcmlwdGlvbjogcngkSVN1YnNjcmlwdGlvbjtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzOiBtaXhlZCkge1xuICAgICAgc3VwZXIocHJvcHMpO1xuICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgY3VycmVudEV4ZWN1dG9yOiBudWxsLFxuICAgICAgICBleGVjdXRvcnM6IG5ldyBNYXAoKSxcbiAgICAgICAgcmVjb3JkczogW10sXG4gICAgICB9O1xuICAgIH1cblxuICAgIGdldEljb25OYW1lKCk6IHN0cmluZyB7XG4gICAgICByZXR1cm4gJ3Rlcm1pbmFsJztcbiAgICB9XG5cbiAgICBnZXRUaXRsZSgpOiBzdHJpbmcge1xuICAgICAgcmV0dXJuICdDb25zb2xlJztcbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsTW91bnQoKSB7XG4gICAgICB0aGlzLl9zdGF0ZSRTdWJzY3JpcHRpb24gPSBzdGF0ZSQuc3Vic2NyaWJlKHN0YXRlID0+IHtcbiAgICAgICAgY29uc3QgY3VycmVudEV4ZWN1dG9ySWQgPSBnZXRDdXJyZW50RXhlY3V0b3JJZChzdGF0ZSk7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRFeGVjdXRvciA9XG4gICAgICAgICAgY3VycmVudEV4ZWN1dG9ySWQgIT0gbnVsbCA/IHN0YXRlLmV4ZWN1dG9ycy5nZXQoY3VycmVudEV4ZWN1dG9ySWQpIDogbnVsbDtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgY3VycmVudEV4ZWN1dG9yLFxuICAgICAgICAgIGV4ZWN1dG9yczogc3RhdGUuZXhlY3V0b3JzLFxuICAgICAgICAgIHJlY29yZHM6IHN0YXRlLnJlY29yZHMsXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICB0aGlzLl9zdGF0ZSRTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgICB9XG5cbiAgICByZW5kZXIoKTogP1JlYWN0LkVsZW1lbnQge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPENvbnNvbGVcbiAgICAgICAgICBleGVjdXRlPXtjb2RlID0+IGNvbW1hbmRzLmV4ZWN1dGUoY29kZSl9XG4gICAgICAgICAgc2VsZWN0RXhlY3V0b3I9e2NvbW1hbmRzLnNlbGVjdEV4ZWN1dG9yLmJpbmQoY29tbWFuZHMpfVxuICAgICAgICAgIGNsZWFyUmVjb3Jkcz17Y29tbWFuZHMuY2xlYXJSZWNvcmRzLmJpbmQoY29tbWFuZHMpfVxuICAgICAgICAgIGN1cnJlbnRFeGVjdXRvcj17dGhpcy5zdGF0ZS5jdXJyZW50RXhlY3V0b3J9XG4gICAgICAgICAgcmVjb3Jkcz17dGhpcy5zdGF0ZS5yZWNvcmRzfVxuICAgICAgICAgIGV4ZWN1dG9ycz17dGhpcy5zdGF0ZS5leGVjdXRvcnN9XG4gICAgICAgIC8+XG4gICAgICApO1xuICAgIH1cblxuICB9XG5cbiAgcmV0dXJuICgoT3V0cHV0R2FkZ2V0OiBhbnkpOiBHYWRnZXQpO1xufVxuIl19