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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _reactForAtom = require('react-for-atom');

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _nuclideUiLibAtomInput = require('../../nuclide-ui/lib/AtomInput');

var _nuclideUiLibButton = require('../../nuclide-ui/lib/Button');

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
        _reactForAtom.React.createElement(_nuclideUiLibAtomInput.AtomInput, {
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
            _nuclideUiLibButton.Button,
            { onClick: this._handleCancelButtonClick },
            'Cancel'
          ),
          _reactForAtom.React.createElement(
            _nuclideUiLibButton.Button,
            { onClick: this._updateAttachTargetList },
            'Refresh'
          ),
          _reactForAtom.React.createElement(
            _nuclideUiLibButton.Button,
            {
              buttonType: _nuclideUiLibButton.ButtonTypes.PRIMARY,
              onClick: this._handleAttachClick,
              disabled: this.state.selectedAttachTarget === null },
            'Attach'
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
//# sourceMappingURL=data:application/json;base64,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QzNCLENBQUMsQ0FBQztLQUNKOzs7V0FFeUIsc0NBQVM7QUFDakMsVUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7S0FDekI7OztXQUVpQiw4QkFBUztBQUN6QixVQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztLQUN6Qjs7O1dBRXVCLG9DQUFTO0FBQy9CLFVBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLHdCQUF3QixFQUFFLENBQUM7S0FDL0M7OztXQUVzQixtQ0FBUzs7QUFFOUIsVUFBSSxDQUFDLFFBQVEsQ0FBQztBQUNaLHlCQUFpQixFQUFFLEVBQUU7QUFDckIsNEJBQW9CLEVBQUUsSUFBSTtPQUMzQixDQUFDLENBQUM7O0FBRUgsVUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztLQUM3Qzs7O1dBRWUsNEJBQVM7QUFDdkIsVUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQztBQUNyRCxVQUFJLFlBQVksRUFBRTs7QUFFaEIsWUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ2hELFlBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLGlCQUFpQixFQUFFLENBQUM7QUFDdkMsWUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsd0JBQXdCLEVBQUUsQ0FBQztPQUMvQztLQUNGOzs7U0F2SVUsaUJBQWlCO0dBQVMsb0JBQU0sU0FBUyIsImZpbGUiOiJBdHRhY2hVSUNvbXBvbmVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtMYXVuY2hBdHRhY2hTdG9yZX0gZnJvbSAnLi9MYXVuY2hBdHRhY2hTdG9yZSc7XG5pbXBvcnQgdHlwZSB7TGF1bmNoQXR0YWNoQWN0aW9uc30gZnJvbSAnLi9MYXVuY2hBdHRhY2hBY3Rpb25zJztcbmltcG9ydCB0eXBlIHtcbiAgQXR0YWNoVGFyZ2V0SW5mbyxcbn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1kZWJ1Z2dlci1sbGRiLXNlcnZlci9saWIvRGVidWdnZXJScGNTZXJ2aWNlSW50ZXJmYWNlJztcblxuaW1wb3J0IHtSZWFjdH0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuaW1wb3J0IGNsYXNzbmFtZXMgZnJvbSAnY2xhc3NuYW1lcyc7XG5pbXBvcnQge0F0b21JbnB1dH0gZnJvbSAnLi4vLi4vbnVjbGlkZS11aS9saWIvQXRvbUlucHV0JztcbmltcG9ydCB7XG4gIEJ1dHRvbixcbiAgQnV0dG9uVHlwZXMsXG59IGZyb20gJy4uLy4uL251Y2xpZGUtdWkvbGliL0J1dHRvbic7XG5cbnR5cGUgUHJvcHNUeXBlID0ge1xuICBzdG9yZTogTGF1bmNoQXR0YWNoU3RvcmU7XG4gIGFjdGlvbnM6IExhdW5jaEF0dGFjaEFjdGlvbnM7XG59O1xuXG50eXBlIFN0YXRlVHlwZSA9IHtcbiAgdGFyZ2V0TGlzdENoYW5nZURpc3Bvc2FibGU6IElEaXNwb3NhYmxlO1xuICBhdHRhY2hUYXJnZXRJbmZvczogQXJyYXk8QXR0YWNoVGFyZ2V0SW5mbz47XG4gIHNlbGVjdGVkQXR0YWNoVGFyZ2V0OiA/QXR0YWNoVGFyZ2V0SW5mbztcbiAgZmlsdGVyVGV4dDogc3RyaW5nO1xufTtcblxuZXhwb3J0IGNsYXNzIEF0dGFjaFVJQ29tcG9uZW50IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PHZvaWQsIFByb3BzVHlwZSwgU3RhdGVUeXBlPiB7XG4gIHByb3BzOiBQcm9wc1R5cGU7XG4gIHN0YXRlOiBTdGF0ZVR5cGU7XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IFByb3BzVHlwZSkge1xuICAgIHN1cGVyKHByb3BzKTtcblxuICAgICh0aGlzOiBhbnkpLl9oYW5kbGVGaWx0ZXJUZXh0Q2hhbmdlID0gdGhpcy5faGFuZGxlRmlsdGVyVGV4dENoYW5nZS5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9oYW5kbGVDYW5jZWxCdXR0b25DbGljayA9IHRoaXMuX2hhbmRsZUNhbmNlbEJ1dHRvbkNsaWNrLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX2hhbmRsZUF0dGFjaENsaWNrID0gdGhpcy5faGFuZGxlQXR0YWNoQ2xpY2suYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5fdXBkYXRlQXR0YWNoVGFyZ2V0TGlzdCA9IHRoaXMuX3VwZGF0ZUF0dGFjaFRhcmdldExpc3QuYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5fdXBkYXRlTGlzdCA9IHRoaXMuX3VwZGF0ZUxpc3QuYmluZCh0aGlzKTtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgdGFyZ2V0TGlzdENoYW5nZURpc3Bvc2FibGU6IHRoaXMucHJvcHMuc3RvcmUub25BdHRhY2hUYXJnZXRMaXN0Q2hhbmdlZCh0aGlzLl91cGRhdGVMaXN0KSxcbiAgICAgIGF0dGFjaFRhcmdldEluZm9zOiBbXSxcbiAgICAgIHNlbGVjdGVkQXR0YWNoVGFyZ2V0OiBudWxsLFxuICAgICAgZmlsdGVyVGV4dDogJycsXG4gICAgfTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgIGlmICh0aGlzLnN0YXRlLnRhcmdldExpc3RDaGFuZ2VEaXNwb3NhYmxlICE9IG51bGwpIHtcbiAgICAgIHRoaXMuc3RhdGUudGFyZ2V0TGlzdENoYW5nZURpc3Bvc2FibGUuZGlzcG9zZSgpO1xuICAgIH1cbiAgfVxuXG4gIF91cGRhdGVMaXN0KCk6IHZvaWQge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgYXR0YWNoVGFyZ2V0SW5mb3M6IHRoaXMucHJvcHMuc3RvcmUuZ2V0QXR0YWNoVGFyZ2V0SW5mb3MoKSxcbiAgICB9KTtcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdC5FbGVtZW50IHtcbiAgICBjb25zdCBjb250YWluZXJTdHlsZSA9IHtcbiAgICAgIG1heEhlaWdodDogJzMwZW0nLFxuICAgICAgb3ZlcmZsb3c6ICdhdXRvJyxcbiAgICB9O1xuICAgIGNvbnN0IGZpbHRlclJlZ2V4ID0gbmV3IFJlZ0V4cCh0aGlzLnN0YXRlLmZpbHRlclRleHQsICdpJyk7XG4gICAgY29uc3QgY2hpbGRyZW4gPSB0aGlzLnN0YXRlLmF0dGFjaFRhcmdldEluZm9zXG4gICAgICAuZmlsdGVyKGl0ZW0gPT4gZmlsdGVyUmVnZXgudGVzdChpdGVtLm5hbWUpIHx8IGZpbHRlclJlZ2V4LnRlc3QoaXRlbS5waWQudG9TdHJpbmcoKSkpXG4gICAgICAubWFwKChpdGVtLCBpbmRleCkgPT4gKFxuICAgICAgICA8dHIga2V5PXtpbmRleCArIDF9XG4gICAgICAgICAgICBhbGlnbj1cImNlbnRlclwiXG4gICAgICAgICAgICBjbGFzc05hbWU9e1xuICAgICAgICAgICAgICBjbGFzc25hbWVzKHsnYXR0YWNoLXNlbGVjdGVkLXJvdyc6IHRoaXMuc3RhdGUuc2VsZWN0ZWRBdHRhY2hUYXJnZXQgPT09IGl0ZW19KVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb25DbGljaz17dGhpcy5faGFuZGxlQ2xpY2tUYWJsZVJvdy5iaW5kKHRoaXMsIGl0ZW0pfVxuICAgICAgICAgICAgb25Eb3VibGVDbGljaz17dGhpcy5faGFuZGxlRG91YmxlQ2xpY2tUYWJsZVJvdy5iaW5kKHRoaXMsIGluZGV4KX0+XG4gICAgICAgICAgPHRkPntpdGVtLm5hbWV9PC90ZD5cbiAgICAgICAgICA8dGQ+e2l0ZW0ucGlkfTwvdGQ+XG4gICAgICAgIDwvdHI+XG4gICAgICApXG4gICAgKTtcbiAgICAvLyBUT0RPOiB3cmFwIGludG8gc2VwYXJhdGUgUmVhY3QgY29tcG9uZW50cy5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJibG9ja1wiPlxuICAgICAgICA8QXRvbUlucHV0XG4gICAgICAgICAgcGxhY2Vob2xkZXJUZXh0PVwiU2VhcmNoLi4uXCJcbiAgICAgICAgICBpbml0aWFsVmFsdWU9e3RoaXMuc3RhdGUuZmlsdGVyVGV4dH1cbiAgICAgICAgICBvbkRpZENoYW5nZT17dGhpcy5faGFuZGxlRmlsdGVyVGV4dENoYW5nZX1cbiAgICAgICAgICBzaXplPVwic21cIlxuICAgICAgICAvPlxuICAgICAgICA8ZGl2IHN0eWxlPXtjb250YWluZXJTdHlsZX0+XG4gICAgICAgICAgPHRhYmxlIHdpZHRoPVwiMTAwJVwiPlxuICAgICAgICAgICAgPHRoZWFkPlxuICAgICAgICAgICAgICA8dHIga2V5PVwiMFwiIGFsaWduPVwiY2VudGVyXCI+XG4gICAgICAgICAgICAgICAgPHRkPk5hbWU8L3RkPlxuICAgICAgICAgICAgICAgIDx0ZD5QSUQ8L3RkPlxuICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgPC90aGVhZD5cbiAgICAgICAgICAgIDx0Ym9keSBhbGlnbj1cImNlbnRlclwiPlxuICAgICAgICAgICAgICB7Y2hpbGRyZW59XG4gICAgICAgICAgICA8L3Rib2R5PlxuICAgICAgICAgIDwvdGFibGU+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInBhZGRlZCB0ZXh0LXJpZ2h0XCI+XG4gICAgICAgICAgPEJ1dHRvbiBvbkNsaWNrPXt0aGlzLl9oYW5kbGVDYW5jZWxCdXR0b25DbGlja30+XG4gICAgICAgICAgICBDYW5jZWxcbiAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgICA8QnV0dG9uIG9uQ2xpY2s9e3RoaXMuX3VwZGF0ZUF0dGFjaFRhcmdldExpc3R9PlxuICAgICAgICAgICAgUmVmcmVzaFxuICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICAgIDxCdXR0b25cbiAgICAgICAgICAgICAgYnV0dG9uVHlwZT17QnV0dG9uVHlwZXMuUFJJTUFSWX1cbiAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5faGFuZGxlQXR0YWNoQ2xpY2t9XG4gICAgICAgICAgICAgIGRpc2FibGVkPXt0aGlzLnN0YXRlLnNlbGVjdGVkQXR0YWNoVGFyZ2V0ID09PSBudWxsfT5cbiAgICAgICAgICAgIEF0dGFjaFxuICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICBfaGFuZGxlRmlsdGVyVGV4dENoYW5nZSh0ZXh0OiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGZpbHRlclRleHQ6IHRleHQsXG4gICAgfSk7XG4gIH1cblxuICBfaGFuZGxlQ2xpY2tUYWJsZVJvdyhpdGVtOiBBdHRhY2hUYXJnZXRJbmZvKTogdm9pZCB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBzZWxlY3RlZEF0dGFjaFRhcmdldDogaXRlbSxcbiAgICB9KTtcbiAgfVxuXG4gIF9oYW5kbGVEb3VibGVDbGlja1RhYmxlUm93KCk6IHZvaWQge1xuICAgIHRoaXMuX2F0dGFjaFRvUHJvY2VzcygpO1xuICB9XG5cbiAgX2hhbmRsZUF0dGFjaENsaWNrKCk6IHZvaWQge1xuICAgIHRoaXMuX2F0dGFjaFRvUHJvY2VzcygpO1xuICB9XG5cbiAgX2hhbmRsZUNhbmNlbEJ1dHRvbkNsaWNrKCk6IHZvaWQge1xuICAgIHRoaXMucHJvcHMuYWN0aW9ucy50b2dnbGVMYXVuY2hBdHRhY2hEaWFsb2coKTtcbiAgfVxuXG4gIF91cGRhdGVBdHRhY2hUYXJnZXRMaXN0KCk6IHZvaWQge1xuICAgIC8vIENsZWFyIG9sZCBsaXN0LlxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgYXR0YWNoVGFyZ2V0SW5mb3M6IFtdLFxuICAgICAgc2VsZWN0ZWRBdHRhY2hUYXJnZXQ6IG51bGwsXG4gICAgfSk7XG4gICAgLy8gRmlyZSBhbmQgZm9yZ2V0LlxuICAgIHRoaXMucHJvcHMuYWN0aW9ucy51cGRhdGVBdHRhY2hUYXJnZXRMaXN0KCk7XG4gIH1cblxuICBfYXR0YWNoVG9Qcm9jZXNzKCk6IHZvaWQge1xuICAgIGNvbnN0IGF0dGFjaFRhcmdldCA9IHRoaXMuc3RhdGUuc2VsZWN0ZWRBdHRhY2hUYXJnZXQ7XG4gICAgaWYgKGF0dGFjaFRhcmdldCkge1xuICAgICAgLy8gRmlyZSBhbmQgZm9yZ2V0LlxuICAgICAgdGhpcy5wcm9wcy5hY3Rpb25zLmF0dGFjaERlYnVnZ2VyKGF0dGFjaFRhcmdldCk7XG4gICAgICB0aGlzLnByb3BzLmFjdGlvbnMuc2hvd0RlYnVnZ2VyUGFuZWwoKTtcbiAgICAgIHRoaXMucHJvcHMuYWN0aW9ucy50b2dnbGVMYXVuY2hBdHRhY2hEaWFsb2coKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==