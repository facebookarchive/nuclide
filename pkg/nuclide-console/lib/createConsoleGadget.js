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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNyZWF0ZUNvbnNvbGVHYWRnZXQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztxQkEwQndCLG1CQUFtQjs7Ozs7Ozs7dUJBVnZCLFdBQVc7Ozs7NEJBQ1gsZ0JBQWdCOztvQ0FDSCx3QkFBd0I7Ozs7QUFRMUMsU0FBUyxtQkFBbUIsQ0FDekMsTUFBK0IsRUFDL0IsUUFBa0IsRUFDVjtNQUVGLFlBQVk7Y0FBWixZQUFZOztpQkFBWixZQUFZOzthQUdFLGlCQUFpQjs7OzthQUNWLFFBQVE7Ozs7QUFJdEIsYUFSUCxZQUFZLENBUUosS0FBWSxFQUFFOzRCQVJ0QixZQUFZOztBQVNkLGlDQVRFLFlBQVksNkNBU1IsS0FBSyxFQUFFO0FBQ2IsVUFBSSxDQUFDLEtBQUssR0FBRztBQUNYLHVCQUFlLEVBQUUsSUFBSTtBQUNyQixpQkFBUyxFQUFFLElBQUksR0FBRyxFQUFFO0FBQ3BCLGVBQU8sRUFBRSxFQUFFO09BQ1osQ0FBQztLQUNIOztpQkFmRyxZQUFZOzthQWlCUixvQkFBVztBQUNqQixlQUFPLFNBQVMsQ0FBQztPQUNsQjs7O2FBRWlCLDhCQUFHOzs7QUFDbkIsWUFBSSxDQUFDLG1CQUFtQixHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsVUFBQSxLQUFLLEVBQUk7QUFDbkQsY0FBTSxpQkFBaUIsR0FBRyx1Q0FBcUIsS0FBSyxDQUFDLENBQUM7QUFDdEQsY0FBTSxlQUFlLEdBQ25CLGlCQUFpQixJQUFJLElBQUksR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLElBQUksQ0FBQztBQUM1RSxnQkFBSyxRQUFRLENBQUM7QUFDWiwyQkFBZSxFQUFmLGVBQWU7QUFDZixxQkFBUyxFQUFFLEtBQUssQ0FBQyxTQUFTO0FBQzFCLG1CQUFPLEVBQUUsS0FBSyxDQUFDLE9BQU87V0FDdkIsQ0FBQyxDQUFDO1NBQ0osQ0FBQyxDQUFDO09BQ0o7OzthQUVtQixnQ0FBRztBQUNyQixZQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLENBQUM7T0FDcEM7OzthQUVLLGtCQUFrQjtBQUN0QixlQUNFO0FBQ0UsaUJBQU8sRUFBRSxVQUFBLElBQUk7bUJBQUksUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7V0FBQSxBQUFDO0FBQ3hDLHdCQUFjLEVBQUUsUUFBUSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEFBQUM7QUFDdkQsc0JBQVksRUFBRSxRQUFRLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQUFBQztBQUNuRCx5QkFBZSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsZUFBZSxBQUFDO0FBQzVDLGlCQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEFBQUM7QUFDNUIsbUJBQVMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQUFBQztVQUNoQyxDQUNGO09BQ0g7OztXQWpERyxZQUFZO0tBQVMsb0JBQU0sU0FBUzs7QUFxRDFDLFNBQVMsWUFBWSxDQUFnQjtDQUN0QyIsImZpbGUiOiJjcmVhdGVDb25zb2xlR2FkZ2V0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUgQ29tbWFuZHMgZnJvbSAnLi9Db21tYW5kcyc7XG5pbXBvcnQgdHlwZSB7R2FkZ2V0fSBmcm9tICcuLi8uLi9udWNsaWRlLWdhZGdldHMtaW50ZXJmYWNlcyc7XG5pbXBvcnQgdHlwZSB7QXBwU3RhdGUsIFJlY29yZCwgRXhlY3V0b3J9IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0IHR5cGUgUnggZnJvbSAncngnO1xuXG5pbXBvcnQgQ29uc29sZSBmcm9tICcuL0NvbnNvbGUnO1xuaW1wb3J0IHtSZWFjdH0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuaW1wb3J0IGdldEN1cnJlbnRFeGVjdXRvcklkIGZyb20gJy4vZ2V0Q3VycmVudEV4ZWN1dG9ySWQnO1xuXG50eXBlIFN0YXRlID0ge1xuICBjdXJyZW50RXhlY3V0b3I6ID9FeGVjdXRvcjtcbiAgcmVjb3JkczogQXJyYXk8UmVjb3JkPjtcbiAgZXhlY3V0b3JzOiBNYXA8c3RyaW5nLCBFeGVjdXRvcj47XG59O1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjcmVhdGVDb25zb2xlR2FkZ2V0KFxuICBzdGF0ZSQ6IFJ4Lk9ic2VydmFibGU8QXBwU3RhdGU+LFxuICBjb21tYW5kczogQ29tbWFuZHMsXG4pOiBHYWRnZXQge1xuXG4gIGNsYXNzIE91dHB1dEdhZGdldCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDx2b2lkLCB2b2lkLCBTdGF0ZT4ge1xuICAgIHN0YXRlOiBTdGF0ZTtcblxuICAgIHN0YXRpYyBnYWRnZXRJZCA9ICdudWNsaWRlLWNvbnNvbGUnO1xuICAgIHN0YXRpYyBkZWZhdWx0TG9jYXRpb24gPSAnYm90dG9tJztcblxuICAgIF9zdGF0ZSRTdWJzY3JpcHRpb246IElEaXNwb3NhYmxlO1xuXG4gICAgY29uc3RydWN0b3IocHJvcHM6IG1peGVkKSB7XG4gICAgICBzdXBlcihwcm9wcyk7XG4gICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICBjdXJyZW50RXhlY3V0b3I6IG51bGwsXG4gICAgICAgIGV4ZWN1dG9yczogbmV3IE1hcCgpLFxuICAgICAgICByZWNvcmRzOiBbXSxcbiAgICAgIH07XG4gICAgfVxuXG4gICAgZ2V0VGl0bGUoKTogc3RyaW5nIHtcbiAgICAgIHJldHVybiAnQ29uc29sZSc7XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbE1vdW50KCkge1xuICAgICAgdGhpcy5fc3RhdGUkU3Vic2NyaXB0aW9uID0gc3RhdGUkLnN1YnNjcmliZShzdGF0ZSA9PiB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRFeGVjdXRvcklkID0gZ2V0Q3VycmVudEV4ZWN1dG9ySWQoc3RhdGUpO1xuICAgICAgICBjb25zdCBjdXJyZW50RXhlY3V0b3IgPVxuICAgICAgICAgIGN1cnJlbnRFeGVjdXRvcklkICE9IG51bGwgPyBzdGF0ZS5leGVjdXRvcnMuZ2V0KGN1cnJlbnRFeGVjdXRvcklkKSA6IG51bGw7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgIGN1cnJlbnRFeGVjdXRvcixcbiAgICAgICAgICBleGVjdXRvcnM6IHN0YXRlLmV4ZWN1dG9ycyxcbiAgICAgICAgICByZWNvcmRzOiBzdGF0ZS5yZWNvcmRzLFxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgdGhpcy5fc3RhdGUkU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICB9XG5cbiAgICByZW5kZXIoKTogP1JlYWN0RWxlbWVudCB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8Q29uc29sZVxuICAgICAgICAgIGV4ZWN1dGU9e2NvZGUgPT4gY29tbWFuZHMuZXhlY3V0ZShjb2RlKX1cbiAgICAgICAgICBzZWxlY3RFeGVjdXRvcj17Y29tbWFuZHMuc2VsZWN0RXhlY3V0b3IuYmluZChjb21tYW5kcyl9XG4gICAgICAgICAgY2xlYXJSZWNvcmRzPXtjb21tYW5kcy5jbGVhclJlY29yZHMuYmluZChjb21tYW5kcyl9XG4gICAgICAgICAgY3VycmVudEV4ZWN1dG9yPXt0aGlzLnN0YXRlLmN1cnJlbnRFeGVjdXRvcn1cbiAgICAgICAgICByZWNvcmRzPXt0aGlzLnN0YXRlLnJlY29yZHN9XG4gICAgICAgICAgZXhlY3V0b3JzPXt0aGlzLnN0YXRlLmV4ZWN1dG9yc31cbiAgICAgICAgLz5cbiAgICAgICk7XG4gICAgfVxuXG4gIH1cblxuICByZXR1cm4gKChPdXRwdXRHYWRnZXQ6IGFueSk6IEdhZGdldCk7XG59XG4iXX0=