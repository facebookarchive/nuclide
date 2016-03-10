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

/* eslint-disable react/prop-types */

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _reactForAtom = require('react-for-atom');

var AttachUIComponent = (function (_React$Component) {
  _inherits(AttachUIComponent, _React$Component);

  function AttachUIComponent(props) {
    _classCallCheck(this, AttachUIComponent);

    _get(Object.getPrototypeOf(AttachUIComponent.prototype), 'constructor', this).call(this, props);
    this._updateList = this._updateList.bind(this);
    this.state = {
      targetListChangeDisposable: null,
      attachTargetInfos: []
    };
  }

  _createClass(AttachUIComponent, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      this.setState({
        targetListChangeDisposable: this.props.store.onAttachTargetListChanged(this._updateList)
      });
      this._updateList();
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      var disposable = this.state.targetListChangeDisposable;
      if (disposable != null) {
        disposable.dispose();
      }
    }
  }, {
    key: '_updateList',
    value: function _updateList() {
      this.setState({
        attachTargetInfos: this.props.store.getAttachTargetInfos()
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var _this = this;

      var children = this.state.attachTargetInfos.map(function (item, index) {
        return _reactForAtom.React.createElement(
          'tr',
          { align: 'center', onDoubleClick: _this._handleDoubleClickItem.bind(_this, index) },
          _reactForAtom.React.createElement(
            'td',
            null,
            item.name
          ),
          _reactForAtom.React.createElement(
            'td',
            null,
            item.pid
          )
        );
      });
      return _reactForAtom.React.createElement(
        'table',
        { width: '100%' },
        _reactForAtom.React.createElement(
          'thead',
          null,
          _reactForAtom.React.createElement(
            'tr',
            { align: 'center' },
            _reactForAtom.React.createElement(
              'td',
              null,
              'Name'
            ),
            _reactForAtom.React.createElement(
              'td',
              null,
              'PID'
            )
          )
        ),
        _reactForAtom.React.createElement(
          'tbody',
          { align: 'center' },
          children
        )
      );
    }
  }, {
    key: '_handleDoubleClickItem',
    value: function _handleDoubleClickItem(index) {
      var attachTarget = this.props.store.getAttachTargetInfos()[index];
      // Fire and forget.
      this.props.actions.attachDebugger(attachTarget);
    }
  }]);

  return AttachUIComponent;
})(_reactForAtom.React.Component);

exports.AttachUIComponent = AttachUIComponent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkF0dGFjaFVJQ29tcG9uZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7NEJBaUJvQixnQkFBZ0I7O0lBWXZCLGlCQUFpQjtZQUFqQixpQkFBaUI7O0FBR2pCLFdBSEEsaUJBQWlCLENBR2hCLEtBQWdCLEVBQUU7MEJBSG5CLGlCQUFpQjs7QUFJMUIsK0JBSlMsaUJBQWlCLDZDQUlwQixLQUFLLEVBQUU7QUFDYixBQUFDLFFBQUksQ0FBTyxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDdEQsUUFBSSxDQUFDLEtBQUssR0FBRztBQUNYLGdDQUEwQixFQUFFLElBQUk7QUFDaEMsdUJBQWlCLEVBQUUsRUFBRTtLQUN0QixDQUFDO0dBQ0g7O2VBVlUsaUJBQWlCOztXQVlWLDhCQUFHO0FBQ25CLFVBQUksQ0FBQyxRQUFRLENBQUM7QUFDWixrQ0FBMEIsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDO09BQ3pGLENBQUMsQ0FBQztBQUNILFVBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztLQUNwQjs7O1dBRW1CLGdDQUFHO0FBQ3JCLFVBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsMEJBQTBCLENBQUM7QUFDekQsVUFBSSxVQUFVLElBQUksSUFBSSxFQUFFO0FBQ3RCLGtCQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7T0FDdEI7S0FDRjs7O1dBRVUsdUJBQVM7QUFDbEIsVUFBSSxDQUFDLFFBQVEsQ0FBQztBQUNaLHlCQUFpQixFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLG9CQUFvQixFQUFFO09BQzNELENBQUMsQ0FBQztLQUNKOzs7V0FFSyxrQkFBaUI7OztBQUNyQixVQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxVQUFDLElBQUksRUFBRSxLQUFLLEVBQUs7QUFDakUsZUFDRTs7WUFBSSxLQUFLLEVBQUMsUUFBUSxFQUFDLGFBQWEsRUFBRSxNQUFLLHNCQUFzQixDQUFDLElBQUksUUFBTyxLQUFLLENBQUMsQUFBQztVQUM5RTs7O1lBQUssSUFBSSxDQUFDLElBQUk7V0FBTTtVQUNwQjs7O1lBQUssSUFBSSxDQUFDLEdBQUc7V0FBTTtTQUNoQixDQUNMO09BQ0gsQ0FBQyxDQUFDO0FBQ0gsYUFDRTs7VUFBTyxLQUFLLEVBQUMsTUFBTTtRQUNqQjs7O1VBQ0U7O2NBQUksS0FBSyxFQUFDLFFBQVE7WUFDaEI7Ozs7YUFBYTtZQUNiOzs7O2FBQVk7V0FDVDtTQUNDO1FBQ1I7O1lBQU8sS0FBSyxFQUFDLFFBQVE7VUFDbEIsUUFBUTtTQUNIO09BQ0YsQ0FDUjtLQUNIOzs7V0FFcUIsZ0NBQUMsS0FBYSxFQUFRO0FBQzFDLFVBQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLG9CQUFvQixFQUFFLENBQUMsS0FBSyxDQUFDLENBQUM7O0FBRXBFLFVBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUMsQ0FBQztLQUNqRDs7O1NBNURVLGlCQUFpQjtHQUFTLG9CQUFNLFNBQVMiLCJmaWxlIjoiQXR0YWNoVUlDb21wb25lbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG4vKiBlc2xpbnQtZGlzYWJsZSByZWFjdC9wcm9wLXR5cGVzICovXG5cbmltcG9ydCB0eXBlIHtMYXVuY2hBdHRhY2hTdG9yZX0gZnJvbSAnLi9MYXVuY2hBdHRhY2hTdG9yZSc7XG5pbXBvcnQgdHlwZSB7TGF1bmNoQXR0YWNoQWN0aW9uc30gZnJvbSAnLi9MYXVuY2hBdHRhY2hBY3Rpb25zJztcbmltcG9ydCB0eXBlIHtBdHRhY2hUYXJnZXRJbmZvfSBmcm9tICcuLi8uLi9sbGRiLXNlcnZlci9saWIvRGVidWdnZXJScGNTZXJ2aWNlSW50ZXJmYWNlJztcblxuaW1wb3J0IHtSZWFjdH0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuXG50eXBlIFByb3BzVHlwZSA9IHtcbiAgc3RvcmU6IExhdW5jaEF0dGFjaFN0b3JlO1xuICBhY3Rpb25zOiBMYXVuY2hBdHRhY2hBY3Rpb25zO1xufTtcblxudHlwZSBTdGF0ZVR5cGUgPSB7XG4gIHRhcmdldExpc3RDaGFuZ2VEaXNwb3NhYmxlOiA/SURpc3Bvc2FibGU7XG4gIGF0dGFjaFRhcmdldEluZm9zOiBBcnJheTxBdHRhY2hUYXJnZXRJbmZvPjtcbn07XG5cbmV4cG9ydCBjbGFzcyBBdHRhY2hVSUNvbXBvbmVudCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDx2b2lkLCBQcm9wc1R5cGUsIFN0YXRlVHlwZT4ge1xuICBzdGF0ZTogU3RhdGVUeXBlO1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBQcm9wc1R5cGUpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgKHRoaXM6IGFueSkuX3VwZGF0ZUxpc3QgPSB0aGlzLl91cGRhdGVMaXN0LmJpbmQodGhpcyk7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIHRhcmdldExpc3RDaGFuZ2VEaXNwb3NhYmxlOiBudWxsLFxuICAgICAgYXR0YWNoVGFyZ2V0SW5mb3M6IFtdLFxuICAgIH07XG4gIH1cblxuICBjb21wb25lbnRXaWxsTW91bnQoKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICB0YXJnZXRMaXN0Q2hhbmdlRGlzcG9zYWJsZTogdGhpcy5wcm9wcy5zdG9yZS5vbkF0dGFjaFRhcmdldExpc3RDaGFuZ2VkKHRoaXMuX3VwZGF0ZUxpc3QpLFxuICAgIH0pO1xuICAgIHRoaXMuX3VwZGF0ZUxpc3QoKTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgIGNvbnN0IGRpc3Bvc2FibGUgPSB0aGlzLnN0YXRlLnRhcmdldExpc3RDaGFuZ2VEaXNwb3NhYmxlO1xuICAgIGlmIChkaXNwb3NhYmxlICE9IG51bGwpIHtcbiAgICAgIGRpc3Bvc2FibGUuZGlzcG9zZSgpO1xuICAgIH1cbiAgfVxuXG4gIF91cGRhdGVMaXN0KCk6IHZvaWQge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgYXR0YWNoVGFyZ2V0SW5mb3M6IHRoaXMucHJvcHMuc3RvcmUuZ2V0QXR0YWNoVGFyZ2V0SW5mb3MoKSxcbiAgICB9KTtcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIGNvbnN0IGNoaWxkcmVuID0gdGhpcy5zdGF0ZS5hdHRhY2hUYXJnZXRJbmZvcy5tYXAoKGl0ZW0sIGluZGV4KSA9PiB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8dHIgYWxpZ249XCJjZW50ZXJcIiBvbkRvdWJsZUNsaWNrPXt0aGlzLl9oYW5kbGVEb3VibGVDbGlja0l0ZW0uYmluZCh0aGlzLCBpbmRleCl9PlxuICAgICAgICAgIDx0ZD57aXRlbS5uYW1lfTwvdGQ+XG4gICAgICAgICAgPHRkPntpdGVtLnBpZH08L3RkPlxuICAgICAgICA8L3RyPlxuICAgICAgKTtcbiAgICB9KTtcbiAgICByZXR1cm4gKFxuICAgICAgPHRhYmxlIHdpZHRoPVwiMTAwJVwiPlxuICAgICAgICA8dGhlYWQ+XG4gICAgICAgICAgPHRyIGFsaWduPVwiY2VudGVyXCI+XG4gICAgICAgICAgICA8dGQ+TmFtZTwvdGQ+XG4gICAgICAgICAgICA8dGQ+UElEPC90ZD5cbiAgICAgICAgICA8L3RyPlxuICAgICAgICA8L3RoZWFkPlxuICAgICAgICA8dGJvZHkgYWxpZ249XCJjZW50ZXJcIj5cbiAgICAgICAgICB7Y2hpbGRyZW59XG4gICAgICAgIDwvdGJvZHk+XG4gICAgICA8L3RhYmxlPlxuICAgICk7XG4gIH1cblxuICBfaGFuZGxlRG91YmxlQ2xpY2tJdGVtKGluZGV4OiBudW1iZXIpOiB2b2lkIHtcbiAgICBjb25zdCBhdHRhY2hUYXJnZXQgPSB0aGlzLnByb3BzLnN0b3JlLmdldEF0dGFjaFRhcmdldEluZm9zKClbaW5kZXhdO1xuICAgIC8vIEZpcmUgYW5kIGZvcmdldC5cbiAgICB0aGlzLnByb3BzLmFjdGlvbnMuYXR0YWNoRGVidWdnZXIoYXR0YWNoVGFyZ2V0KTtcbiAgfVxufVxuIl19