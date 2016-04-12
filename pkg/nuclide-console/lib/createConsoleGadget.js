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
        this._state$Subscription.dispose();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNyZWF0ZUNvbnNvbGVHYWRnZXQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztxQkEwQndCLG1CQUFtQjs7Ozs7Ozs7dUJBVnZCLFdBQVc7Ozs7NEJBQ1gsZ0JBQWdCOztvQ0FDSCx3QkFBd0I7Ozs7QUFRMUMsU0FBUyxtQkFBbUIsQ0FDekMsTUFBK0IsRUFDL0IsUUFBa0IsRUFDVjtNQUVGLFlBQVk7Y0FBWixZQUFZOztpQkFBWixZQUFZOzthQUdFLGlCQUFpQjs7OzthQUNWLFFBQVE7Ozs7QUFJdEIsYUFSUCxZQUFZLENBUUosS0FBWSxFQUFFOzRCQVJ0QixZQUFZOztBQVNkLGlDQVRFLFlBQVksNkNBU1IsS0FBSyxFQUFFO0FBQ2IsVUFBSSxDQUFDLEtBQUssR0FBRztBQUNYLHVCQUFlLEVBQUUsSUFBSTtBQUNyQixpQkFBUyxFQUFFLElBQUksR0FBRyxFQUFFO0FBQ3BCLGVBQU8sRUFBRSxFQUFFO09BQ1osQ0FBQztLQUNIOztpQkFmRyxZQUFZOzthQWlCTCx1QkFBVztBQUNwQixlQUFPLFVBQVUsQ0FBQztPQUNuQjs7O2FBRU8sb0JBQVc7QUFDakIsZUFBTyxTQUFTLENBQUM7T0FDbEI7OzthQUVpQiw4QkFBRzs7O0FBQ25CLFlBQUksQ0FBQyxtQkFBbUIsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLFVBQUEsS0FBSyxFQUFJO0FBQ25ELGNBQU0saUJBQWlCLEdBQUcsdUNBQXFCLEtBQUssQ0FBQyxDQUFDO0FBQ3RELGNBQU0sZUFBZSxHQUNuQixpQkFBaUIsSUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsR0FBRyxJQUFJLENBQUM7QUFDNUUsZ0JBQUssUUFBUSxDQUFDO0FBQ1osMkJBQWUsRUFBZixlQUFlO0FBQ2YscUJBQVMsRUFBRSxLQUFLLENBQUMsU0FBUztBQUMxQixtQkFBTyxFQUFFLEtBQUssQ0FBQyxPQUFPO1dBQ3ZCLENBQUMsQ0FBQztTQUNKLENBQUMsQ0FBQztPQUNKOzs7YUFFbUIsZ0NBQUc7QUFDckIsWUFBSSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxDQUFDO09BQ3BDOzs7YUFFSyxrQkFBa0I7QUFDdEIsZUFDRTtBQUNFLGlCQUFPLEVBQUUsVUFBQSxJQUFJO21CQUFJLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDO1dBQUEsQUFBQztBQUN4Qyx3QkFBYyxFQUFFLFFBQVEsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxBQUFDO0FBQ3ZELHNCQUFZLEVBQUUsUUFBUSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEFBQUM7QUFDbkQseUJBQWUsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsQUFBQztBQUM1QyxpQkFBTyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxBQUFDO0FBQzVCLG1CQUFTLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEFBQUM7VUFDaEMsQ0FDRjtPQUNIOzs7V0FyREcsWUFBWTtLQUFTLG9CQUFNLFNBQVM7O0FBeUQxQyxTQUFTLFlBQVksQ0FBZ0I7Q0FDdEMiLCJmaWxlIjoiY3JlYXRlQ29uc29sZUdhZGdldC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIENvbW1hbmRzIGZyb20gJy4vQ29tbWFuZHMnO1xuaW1wb3J0IHR5cGUge0dhZGdldH0gZnJvbSAnLi4vLi4vbnVjbGlkZS1nYWRnZXRzLWludGVyZmFjZXMnO1xuaW1wb3J0IHR5cGUge0FwcFN0YXRlLCBSZWNvcmQsIEV4ZWN1dG9yfSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB0eXBlIFJ4IGZyb20gJ3J4JztcblxuaW1wb3J0IENvbnNvbGUgZnJvbSAnLi9Db25zb2xlJztcbmltcG9ydCB7UmVhY3R9IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcbmltcG9ydCBnZXRDdXJyZW50RXhlY3V0b3JJZCBmcm9tICcuL2dldEN1cnJlbnRFeGVjdXRvcklkJztcblxudHlwZSBTdGF0ZSA9IHtcbiAgY3VycmVudEV4ZWN1dG9yOiA/RXhlY3V0b3I7XG4gIHJlY29yZHM6IEFycmF5PFJlY29yZD47XG4gIGV4ZWN1dG9yczogTWFwPHN0cmluZywgRXhlY3V0b3I+O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY3JlYXRlQ29uc29sZUdhZGdldChcbiAgc3RhdGUkOiBSeC5PYnNlcnZhYmxlPEFwcFN0YXRlPixcbiAgY29tbWFuZHM6IENvbW1hbmRzLFxuKTogR2FkZ2V0IHtcblxuICBjbGFzcyBPdXRwdXRHYWRnZXQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8dm9pZCwgdm9pZCwgU3RhdGU+IHtcbiAgICBzdGF0ZTogU3RhdGU7XG5cbiAgICBzdGF0aWMgZ2FkZ2V0SWQgPSAnbnVjbGlkZS1jb25zb2xlJztcbiAgICBzdGF0aWMgZGVmYXVsdExvY2F0aW9uID0gJ2JvdHRvbSc7XG5cbiAgICBfc3RhdGUkU3Vic2NyaXB0aW9uOiBJRGlzcG9zYWJsZTtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzOiBtaXhlZCkge1xuICAgICAgc3VwZXIocHJvcHMpO1xuICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgY3VycmVudEV4ZWN1dG9yOiBudWxsLFxuICAgICAgICBleGVjdXRvcnM6IG5ldyBNYXAoKSxcbiAgICAgICAgcmVjb3JkczogW10sXG4gICAgICB9O1xuICAgIH1cblxuICAgIGdldEljb25OYW1lKCk6IHN0cmluZyB7XG4gICAgICByZXR1cm4gJ3Rlcm1pbmFsJztcbiAgICB9XG5cbiAgICBnZXRUaXRsZSgpOiBzdHJpbmcge1xuICAgICAgcmV0dXJuICdDb25zb2xlJztcbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsTW91bnQoKSB7XG4gICAgICB0aGlzLl9zdGF0ZSRTdWJzY3JpcHRpb24gPSBzdGF0ZSQuc3Vic2NyaWJlKHN0YXRlID0+IHtcbiAgICAgICAgY29uc3QgY3VycmVudEV4ZWN1dG9ySWQgPSBnZXRDdXJyZW50RXhlY3V0b3JJZChzdGF0ZSk7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRFeGVjdXRvciA9XG4gICAgICAgICAgY3VycmVudEV4ZWN1dG9ySWQgIT0gbnVsbCA/IHN0YXRlLmV4ZWN1dG9ycy5nZXQoY3VycmVudEV4ZWN1dG9ySWQpIDogbnVsbDtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgY3VycmVudEV4ZWN1dG9yLFxuICAgICAgICAgIGV4ZWN1dG9yczogc3RhdGUuZXhlY3V0b3JzLFxuICAgICAgICAgIHJlY29yZHM6IHN0YXRlLnJlY29yZHMsXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICB0aGlzLl9zdGF0ZSRTdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgIH1cblxuICAgIHJlbmRlcigpOiA/UmVhY3RFbGVtZW50IHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxDb25zb2xlXG4gICAgICAgICAgZXhlY3V0ZT17Y29kZSA9PiBjb21tYW5kcy5leGVjdXRlKGNvZGUpfVxuICAgICAgICAgIHNlbGVjdEV4ZWN1dG9yPXtjb21tYW5kcy5zZWxlY3RFeGVjdXRvci5iaW5kKGNvbW1hbmRzKX1cbiAgICAgICAgICBjbGVhclJlY29yZHM9e2NvbW1hbmRzLmNsZWFyUmVjb3Jkcy5iaW5kKGNvbW1hbmRzKX1cbiAgICAgICAgICBjdXJyZW50RXhlY3V0b3I9e3RoaXMuc3RhdGUuY3VycmVudEV4ZWN1dG9yfVxuICAgICAgICAgIHJlY29yZHM9e3RoaXMuc3RhdGUucmVjb3Jkc31cbiAgICAgICAgICBleGVjdXRvcnM9e3RoaXMuc3RhdGUuZXhlY3V0b3JzfVxuICAgICAgICAvPlxuICAgICAgKTtcbiAgICB9XG5cbiAgfVxuXG4gIHJldHVybiAoKE91dHB1dEdhZGdldDogYW55KTogR2FkZ2V0KTtcbn1cbiJdfQ==