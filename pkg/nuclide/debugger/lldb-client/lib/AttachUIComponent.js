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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _reactForAtom = require('react-for-atom');

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _uiAtomInput = require('../../../ui/atom-input');

var _uiAtomInput2 = _interopRequireDefault(_uiAtomInput);

var AttachUIComponent = (function (_React$Component) {
  _inherits(AttachUIComponent, _React$Component);

  function AttachUIComponent(props) {
    _classCallCheck(this, AttachUIComponent);

    _get(Object.getPrototypeOf(AttachUIComponent.prototype), 'constructor', this).call(this, props);

    this._handleFilterTextChange = this._handleFilterTextChange.bind(this);
    this._handleCancelButtonClick = this._handleCancelButtonClick.bind(this);
    this._handleAttachClick = this._handleAttachClick.bind(this);
    this._updateAttachTargetList = this._updateAttachTargetList.bind(this);
    this._updateList = this._updateList.bind(this);
    this.state = {
      targetListChangeDisposable: this.props.store.onAttachTargetListChanged(this._updateList),
      attachTargetInfos: [],
      selectedAttachTarget: null,
      filterText: ''
    };
  }

  _createClass(AttachUIComponent, [{
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      if (this.state.targetListChangeDisposable != null) {
        this.state.targetListChangeDisposable.dispose();
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

      var containerStyle = {
        maxHeight: '30em',
        overflow: 'auto'
      };
      var filterRegex = new RegExp(this.state.filterText, 'i');
      var children = this.state.attachTargetInfos.filter(function (item) {
        return filterRegex.test(item.name) || filterRegex.test(item.pid.toString());
      }).map(function (item, index) {
        return _reactForAtom.React.createElement(
          'tr',
          { key: index + 1,
            align: 'center',
            className: (0, _classnames2['default'])({ 'attach-selected-row': _this.state.selectedAttachTarget === item }),
            onClick: _this._handleClickTableRow.bind(_this, item),
            onDoubleClick: _this._handleDoubleClickTableRow.bind(_this, index) },
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
      // TODO: wrap into separate React components.
      return _reactForAtom.React.createElement(
        'div',
        { className: 'block' },
        _reactForAtom.React.createElement(_uiAtomInput2['default'], {
          placeholderText: 'Search...',
          initialValue: this.state.filterText,
          onDidChange: this._handleFilterTextChange,
          size: 'sm'
        }),
        _reactForAtom.React.createElement(
          'div',
          { style: containerStyle },
          _reactForAtom.React.createElement(
            'table',
            { width: '100%' },
            _reactForAtom.React.createElement(
              'thead',
              null,
              _reactForAtom.React.createElement(
                'tr',
                { key: '0', align: 'center' },
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
          )
        ),
        _reactForAtom.React.createElement(
          'div',
          { className: 'padded text-right' },
          _reactForAtom.React.createElement(
            'button',
            {
              className: 'btn btn-primary',
              onClick: this._handleAttachClick,
              disabled: this.state.selectedAttachTarget === null },
            'Attach'
          ),
          _reactForAtom.React.createElement(
            'button',
            { className: 'btn', onClick: this._updateAttachTargetList },
            'Refresh'
          ),
          _reactForAtom.React.createElement(
            'button',
            { className: 'btn', onClick: this._handleCancelButtonClick },
            'Cancel'
          )
        )
      );
    }
  }, {
    key: '_handleFilterTextChange',
    value: function _handleFilterTextChange(text) {
      this.setState({
        filterText: text
      });
    }
  }, {
    key: '_handleClickTableRow',
    value: function _handleClickTableRow(item) {
      this.setState({
        selectedAttachTarget: item
      });
    }
  }, {
    key: '_handleDoubleClickTableRow',
    value: function _handleDoubleClickTableRow() {
      this._attachToProcess();
    }
  }, {
    key: '_handleAttachClick',
    value: function _handleAttachClick() {
      this._attachToProcess();
    }
  }, {
    key: '_handleCancelButtonClick',
    value: function _handleCancelButtonClick() {
      this.props.actions.toggleLaunchAttachDialog();
    }
  }, {
    key: '_updateAttachTargetList',
    value: function _updateAttachTargetList() {
      // Clear old list.
      this.setState({
        attachTargetInfos: [],
        selectedAttachTarget: null
      });
      // Fire and forget.
      this.props.actions.updateAttachTargetList();
    }
  }, {
    key: '_attachToProcess',
    value: function _attachToProcess() {
      var attachTarget = this.state.selectedAttachTarget;
      if (attachTarget) {
        // Fire and forget.
        this.props.actions.attachDebugger(attachTarget);
        this.props.actions.showDebuggerPanel();
        this.props.actions.toggleLaunchAttachDialog();
      }
    }
  }]);

  return AttachUIComponent;
})(_reactForAtom.React.Component);

exports.AttachUIComponent = AttachUIComponent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkF0dGFjaFVJQ29tcG9uZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs0QkFpQm9CLGdCQUFnQjs7MEJBQ2IsWUFBWTs7OzsyQkFDYix3QkFBd0I7Ozs7SUFjakMsaUJBQWlCO1lBQWpCLGlCQUFpQjs7QUFHakIsV0FIQSxpQkFBaUIsQ0FHaEIsS0FBZ0IsRUFBRTswQkFIbkIsaUJBQWlCOztBQUkxQiwrQkFKUyxpQkFBaUIsNkNBSXBCLEtBQUssRUFBRTs7QUFFYixBQUFDLFFBQUksQ0FBTyx1QkFBdUIsR0FBRyxJQUFJLENBQUMsdUJBQXVCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzlFLEFBQUMsUUFBSSxDQUFPLHdCQUF3QixHQUFHLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDaEYsQUFBQyxRQUFJLENBQU8sa0JBQWtCLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNwRSxBQUFDLFFBQUksQ0FBTyx1QkFBdUIsR0FBRyxJQUFJLENBQUMsdUJBQXVCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzlFLEFBQUMsUUFBSSxDQUFPLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN0RCxRQUFJLENBQUMsS0FBSyxHQUFHO0FBQ1gsZ0NBQTBCLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMseUJBQXlCLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQztBQUN4Rix1QkFBaUIsRUFBRSxFQUFFO0FBQ3JCLDBCQUFvQixFQUFFLElBQUk7QUFDMUIsZ0JBQVUsRUFBRSxFQUFFO0tBQ2YsQ0FBQztHQUNIOztlQWpCVSxpQkFBaUI7O1dBbUJSLGdDQUFHO0FBQ3JCLFVBQUksSUFBSSxDQUFDLEtBQUssQ0FBQywwQkFB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LDRCQUFvQixFQUFFLElBQUk7T0FDM0IsQ0FBQyxDQUFDO0tBQ0o7OztXQUV5QixzQ0FBUztBQUNqQyxVQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztLQUN6Qjs7O1dBRWlCLDhCQUFTO0FBQ3pCLFVBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0tBQ3pCOzs7V0FFdUIsb0NBQVM7QUFDL0IsVUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsd0JBQXdCLEVBQUUsQ0FBQztLQUMvQzs7O1dBRXNCLG1DQUFTOztBQUU5QixVQUFJLENBQUMsUUFBUSxDQUFDO0FBQ1oseUJBQWlCLEVBQUUsRUFBRTtBQUNyQiw0QkFBb0IsRUFBRSxJQUFJO09BQzNCLENBQUMsQ0FBQzs7QUFFSCxVQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO0tBQzdDOzs7V0FFZSw0QkFBUztBQUN2QixVQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLG9CQUFvQixDQUFDO0FBQ3JELFVBQUksWUFBWSxFQUFFOztBQUVoQixZQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDaEQsWUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztBQUN2QyxZQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO09BQy9DO0tBQ0Y7OztTQXRJVSxpQkFBaUI7R0FBUyxvQkFBTSxTQUFTIiwiZmlsZSI6IkF0dGFjaFVJQ29tcG9uZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuLyogZXNsaW50LWRpc2FibGUgcmVhY3QvcHJvcC10eXBlcyAqL1xuXG5pbXBvcnQgdHlwZSB7TGF1bmNoQXR0YWNoU3RvcmV9IGZyb20gJy4vTGF1bmNoQXR0YWNoU3RvcmUnO1xuaW1wb3J0IHR5cGUge0xhdW5jaEF0dGFjaEFjdGlvbnN9IGZyb20gJy4vTGF1bmNoQXR0YWNoQWN0aW9ucyc7XG5pbXBvcnQgdHlwZSB7QXR0YWNoVGFyZ2V0SW5mb30gZnJvbSAnLi4vLi4vbGxkYi1zZXJ2ZXIvbGliL0RlYnVnZ2VyUnBjU2VydmljZUludGVyZmFjZSc7XG5cbmltcG9ydCB7UmVhY3R9IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcbmltcG9ydCBjbGFzc25hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuaW1wb3J0IEF0b21JbnB1dCBmcm9tICcuLi8uLi8uLi91aS9hdG9tLWlucHV0JztcblxudHlwZSBQcm9wc1R5cGUgPSB7XG4gIHN0b3JlOiBMYXVuY2hBdHRhY2hTdG9yZTtcbiAgYWN0aW9uczogTGF1bmNoQXR0YWNoQWN0aW9ucztcbn07XG5cbnR5cGUgU3RhdGVUeXBlID0ge1xuICB0YXJnZXRMaXN0Q2hhbmdlRGlzcG9zYWJsZTogSURpc3Bvc2FibGU7XG4gIGF0dGFjaFRhcmdldEluZm9zOiBBcnJheTxBdHRhY2hUYXJnZXRJbmZvPjtcbiAgc2VsZWN0ZWRBdHRhY2hUYXJnZXQ6ID9BdHRhY2hUYXJnZXRJbmZvO1xuICBmaWx0ZXJUZXh0OiBzdHJpbmc7XG59O1xuXG5leHBvcnQgY2xhc3MgQXR0YWNoVUlDb21wb25lbnQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8dm9pZCwgUHJvcHNUeXBlLCBTdGF0ZVR5cGU+IHtcbiAgc3RhdGU6IFN0YXRlVHlwZTtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogUHJvcHNUeXBlKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuXG4gICAgKHRoaXM6IGFueSkuX2hhbmRsZUZpbHRlclRleHRDaGFuZ2UgPSB0aGlzLl9oYW5kbGVGaWx0ZXJUZXh0Q2hhbmdlLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX2hhbmRsZUNhbmNlbEJ1dHRvbkNsaWNrID0gdGhpcy5faGFuZGxlQ2FuY2VsQnV0dG9uQ2xpY2suYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5faGFuZGxlQXR0YWNoQ2xpY2sgPSB0aGlzLl9oYW5kbGVBdHRhY2hDbGljay5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl91cGRhdGVBdHRhY2hUYXJnZXRMaXN0ID0gdGhpcy5fdXBkYXRlQXR0YWNoVGFyZ2V0TGlzdC5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl91cGRhdGVMaXN0ID0gdGhpcy5fdXBkYXRlTGlzdC5iaW5kKHRoaXMpO1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICB0YXJnZXRMaXN0Q2hhbmdlRGlzcG9zYWJsZTogdGhpcy5wcm9wcy5zdG9yZS5vbkF0dGFjaFRhcmdldExpc3RDaGFuZ2VkKHRoaXMuX3VwZGF0ZUxpc3QpLFxuICAgICAgYXR0YWNoVGFyZ2V0SW5mb3M6IFtdLFxuICAgICAgc2VsZWN0ZWRBdHRhY2hUYXJnZXQ6IG51bGwsXG4gICAgICBmaWx0ZXJUZXh0OiAnJyxcbiAgICB9O1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgaWYgKHRoaXMuc3RhdGUudGFyZ2V0TGlzdENoYW5nZURpc3Bvc2FibGUgIT0gbnVsbCkge1xuICAgICAgdGhpcy5zdGF0ZS50YXJnZXRMaXN0Q2hhbmdlRGlzcG9zYWJsZS5kaXNwb3NlKCk7XG4gICAgfVxuICB9XG5cbiAgX3VwZGF0ZUxpc3QoKTogdm9pZCB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBhdHRhY2hUYXJnZXRJbmZvczogdGhpcy5wcm9wcy5zdG9yZS5nZXRBdHRhY2hUYXJnZXRJbmZvcygpLFxuICAgIH0pO1xuICB9XG5cbiAgcmVuZGVyKCk6IFJlYWN0RWxlbWVudCB7XG4gICAgY29uc3QgY29udGFpbmVyU3R5bGUgPSB7XG4gICAgICBtYXhIZWlnaHQ6ICczMGVtJyxcbiAgICAgIG92ZXJmbG93OiAnYXV0bycsXG4gICAgfTtcbiAgICBjb25zdCBmaWx0ZXJSZWdleCA9IG5ldyBSZWdFeHAodGhpcy5zdGF0ZS5maWx0ZXJUZXh0LCAnaScpO1xuICAgIGNvbnN0IGNoaWxkcmVuID0gdGhpcy5zdGF0ZS5hdHRhY2hUYXJnZXRJbmZvc1xuICAgICAgLmZpbHRlcihpdGVtID0+IGZpbHRlclJlZ2V4LnRlc3QoaXRlbS5uYW1lKSB8fCBmaWx0ZXJSZWdleC50ZXN0KGl0ZW0ucGlkLnRvU3RyaW5nKCkpKVxuICAgICAgLm1hcCgoaXRlbSwgaW5kZXgpID0+IChcbiAgICAgICAgPHRyIGtleT17aW5kZXggKyAxfVxuICAgICAgICAgICAgYWxpZ249XCJjZW50ZXJcIlxuICAgICAgICAgICAgY2xhc3NOYW1lPXtcbiAgICAgICAgICAgICAgY2xhc3NuYW1lcyh7J2F0dGFjaC1zZWxlY3RlZC1yb3cnOiB0aGlzLnN0YXRlLnNlbGVjdGVkQXR0YWNoVGFyZ2V0ID09PSBpdGVtfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuX2hhbmRsZUNsaWNrVGFibGVSb3cuYmluZCh0aGlzLCBpdGVtKX1cbiAgICAgICAgICAgIG9uRG91YmxlQ2xpY2s9e3RoaXMuX2hhbmRsZURvdWJsZUNsaWNrVGFibGVSb3cuYmluZCh0aGlzLCBpbmRleCl9PlxuICAgICAgICAgIDx0ZD57aXRlbS5uYW1lfTwvdGQ+XG4gICAgICAgICAgPHRkPntpdGVtLnBpZH08L3RkPlxuICAgICAgICA8L3RyPlxuICAgICAgKVxuICAgICk7XG4gICAgLy8gVE9ETzogd3JhcCBpbnRvIHNlcGFyYXRlIFJlYWN0IGNvbXBvbmVudHMuXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYmxvY2tcIj5cbiAgICAgICAgPEF0b21JbnB1dFxuICAgICAgICAgIHBsYWNlaG9sZGVyVGV4dD1cIlNlYXJjaC4uLlwiXG4gICAgICAgICAgaW5pdGlhbFZhbHVlPXt0aGlzLnN0YXRlLmZpbHRlclRleHR9XG4gICAgICAgICAgb25EaWRDaGFuZ2U9e3RoaXMuX2hhbmRsZUZpbHRlclRleHRDaGFuZ2V9XG4gICAgICAgICAgc2l6ZT1cInNtXCJcbiAgICAgICAgLz5cbiAgICAgICAgPGRpdiBzdHlsZT17Y29udGFpbmVyU3R5bGV9PlxuICAgICAgICAgIDx0YWJsZSB3aWR0aD1cIjEwMCVcIj5cbiAgICAgICAgICAgIDx0aGVhZD5cbiAgICAgICAgICAgICAgPHRyIGtleT1cIjBcIiBhbGlnbj1cImNlbnRlclwiPlxuICAgICAgICAgICAgICAgIDx0ZD5OYW1lPC90ZD5cbiAgICAgICAgICAgICAgICA8dGQ+UElEPC90ZD5cbiAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgIDwvdGhlYWQ+XG4gICAgICAgICAgICA8dGJvZHkgYWxpZ249XCJjZW50ZXJcIj5cbiAgICAgICAgICAgICAge2NoaWxkcmVufVxuICAgICAgICAgICAgPC90Ym9keT5cbiAgICAgICAgICA8L3RhYmxlPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJwYWRkZWQgdGV4dC1yaWdodFwiPlxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiYnRuIGJ0bi1wcmltYXJ5XCJcbiAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5faGFuZGxlQXR0YWNoQ2xpY2t9XG4gICAgICAgICAgICAgIGRpc2FibGVkPXt0aGlzLnN0YXRlLnNlbGVjdGVkQXR0YWNoVGFyZ2V0ID09PSBudWxsfT5cbiAgICAgICAgICAgIEF0dGFjaFxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwiYnRuXCIgb25DbGljaz17dGhpcy5fdXBkYXRlQXR0YWNoVGFyZ2V0TGlzdH0+XG4gICAgICAgICAgICBSZWZyZXNoXG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9XCJidG5cIiBvbkNsaWNrPXt0aGlzLl9oYW5kbGVDYW5jZWxCdXR0b25DbGlja30+XG4gICAgICAgICAgICBDYW5jZWxcbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbiAgX2hhbmRsZUZpbHRlclRleHRDaGFuZ2UodGV4dDogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBmaWx0ZXJUZXh0OiB0ZXh0LFxuICAgIH0pO1xuICB9XG5cbiAgX2hhbmRsZUNsaWNrVGFibGVSb3coaXRlbTogQXR0YWNoVGFyZ2V0SW5mbyk6IHZvaWQge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgc2VsZWN0ZWRBdHRhY2hUYXJnZXQ6IGl0ZW0sXG4gICAgfSk7XG4gIH1cblxuICBfaGFuZGxlRG91YmxlQ2xpY2tUYWJsZVJvdygpOiB2b2lkIHtcbiAgICB0aGlzLl9hdHRhY2hUb1Byb2Nlc3MoKTtcbiAgfVxuXG4gIF9oYW5kbGVBdHRhY2hDbGljaygpOiB2b2lkIHtcbiAgICB0aGlzLl9hdHRhY2hUb1Byb2Nlc3MoKTtcbiAgfVxuXG4gIF9oYW5kbGVDYW5jZWxCdXR0b25DbGljaygpOiB2b2lkIHtcbiAgICB0aGlzLnByb3BzLmFjdGlvbnMudG9nZ2xlTGF1bmNoQXR0YWNoRGlhbG9nKCk7XG4gIH1cblxuICBfdXBkYXRlQXR0YWNoVGFyZ2V0TGlzdCgpOiB2b2lkIHtcbiAgICAvLyBDbGVhciBvbGQgbGlzdC5cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGF0dGFjaFRhcmdldEluZm9zOiBbXSxcbiAgICAgIHNlbGVjdGVkQXR0YWNoVGFyZ2V0OiBudWxsLFxuICAgIH0pO1xuICAgIC8vIEZpcmUgYW5kIGZvcmdldC5cbiAgICB0aGlzLnByb3BzLmFjdGlvbnMudXBkYXRlQXR0YWNoVGFyZ2V0TGlzdCgpO1xuICB9XG5cbiAgX2F0dGFjaFRvUHJvY2VzcygpOiB2b2lkIHtcbiAgICBjb25zdCBhdHRhY2hUYXJnZXQgPSB0aGlzLnN0YXRlLnNlbGVjdGVkQXR0YWNoVGFyZ2V0O1xuICAgIGlmIChhdHRhY2hUYXJnZXQpIHtcbiAgICAgIC8vIEZpcmUgYW5kIGZvcmdldC5cbiAgICAgIHRoaXMucHJvcHMuYWN0aW9ucy5hdHRhY2hEZWJ1Z2dlcihhdHRhY2hUYXJnZXQpO1xuICAgICAgdGhpcy5wcm9wcy5hY3Rpb25zLnNob3dEZWJ1Z2dlclBhbmVsKCk7XG4gICAgICB0aGlzLnByb3BzLmFjdGlvbnMudG9nZ2xlTGF1bmNoQXR0YWNoRGlhbG9nKCk7XG4gICAgfVxuICB9XG59XG4iXX0=