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
            'button',
            { className: 'btn', onClick: this._handleCancelButtonClick },
            'Cancel'
          ),
          _reactForAtom.React.createElement(
            'button',
            { className: 'btn', onClick: this._updateAttachTargetList },
            'Refresh'
          ),
          _reactForAtom.React.createElement(
            'button',
            {
              className: 'btn btn-primary',
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkF0dGFjaFVJQ29tcG9uZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7NEJBaUJvQixnQkFBZ0I7OzBCQUNiLFlBQVk7Ozs7cUNBQ1gsZ0NBQWdDOztJQWMzQyxpQkFBaUI7WUFBakIsaUJBQWlCOztBQUlqQixXQUpBLGlCQUFpQixDQUloQixLQUFnQixFQUFFOzBCQUpuQixpQkFBaUI7O0FBSzFCLCtCQUxTLGlCQUFpQiw2Q0FLcEIsS0FBSyxFQUFFOztBQUViLEFBQUMsUUFBSSxDQUFPLHVCQUF1QixHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDOUUsQUFBQyxRQUFJLENBQU8sd0JBQXdCLEdBQUcsSUFBSSxDQUFDLHdCQUF3QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoRixBQUFDLFFBQUksQ0FBTyxrQkFBa0IsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3BFLEFBQUMsUUFBSSxDQUFPLHVCQUF1QixHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDOUUsQUFBQyxRQUFJLENBQU8sV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3RELFFBQUksQ0FBQyxLQUFLLEdBQUc7QUFDWCxnQ0FBMEIsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDO0FBQ3hGLHVCQUFpQixFQUFFLEVBQUU7QUFDckIsMEJBQW9CLEVBQUUsSUFBSTtBQUMxQixnQkFBVSxFQUFFLEVBQUU7S0FDZixDQUFDO0dBQ0g7O2VBbEJVLGlCQUFpQjs7V0FvQlIsZ0NBQUc7QUFDckIsVUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLDBCQUEwQixJQUFJLElBQUksRUFBRTtBQUNqRCxZQUFJLENBQUMsS0FBSyxDQUFDLDBCQUEwQixDQUFDLE9BQU8sRUFBRSxDQUFDO09BQ2pEO0tBQ0Y7OztXQUVVLHVCQUFTO0FBQ2xCLFVBQUksQ0FBQyxRQUFRLENBQUM7QUFDWix5QkFBaUIsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsRUFBRTtPQUMzRCxDQUFDLENBQUM7S0FDSjs7O1dBRUssa0JBQWlCOzs7QUFDckIsVUFBTSxjQUFjLEdBQUc7QUFDckIsaUJBQVMsRUFBRSxNQUFNO0FBQ2pCLGdCQUFRLEVBQUUsTUFBTTtPQUNqQixDQUFDO0FBQ0YsVUFBTSxXQUFXLEdBQUcsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDM0QsVUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsQ0FDMUMsTUFBTSxDQUFDLFVBQUEsSUFBSTtlQUFJLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQztPQUFBLENBQUMsQ0FDcEYsR0FBRyxDQUFDLFVBQUMsSUFBSSxFQUFFLEtBQUs7ZUFDZjs7WUFBSSxHQUFHLEVBQUUsS0FBSyxHQUFHLENBQUMsQUFBQztBQUNmLGlCQUFLLEVBQUMsUUFBUTtBQUNkLHFCQUFTLEVBQ1AsNkJBQVcsRUFBQyxxQkFBcUIsRUFBRSxNQUFLLEtBQUssQ0FBQyxvQkFBb0IsS0FBSyxJQUFJLEVBQUMsQ0FBQyxBQUM5RTtBQUNELG1CQUFPLEVBQUUsTUFBSyxvQkFBb0IsQ0FBQyxJQUFJLFFBQU8sSUFBSSxDQUFDLEFBQUM7QUFDcEQseUJBQWEsRUFBRSxNQUFLLDBCQUEwQixDQUFDLElBQUksUUFBTyxLQUFLLENBQUMsQUFBQztVQUNuRTs7O1lBQUssSUFBSSxDQUFDLElBQUk7V0FBTTtVQUNwQjs7O1lBQUssSUFBSSxDQUFDLEdBQUc7V0FBTTtTQUNoQjtPQUNOLENBQ0YsQ0FBQzs7QUFFRixhQUNFOztVQUFLLFNBQVMsRUFBQyxPQUFPO1FBQ3BCO0FBQ0UseUJBQWUsRUFBQyxXQUFXO0FBQzNCLHNCQUFZLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLEFBQUM7QUFDcEMscUJBQVcsRUFBRSxJQUFJLENBQUMsdUJBQXVCLEFBQUM7QUFDMUMsY0FBSSxFQUFDLElBQUk7VUFDVDtRQUNGOztZQUFLLEtBQUssRUFBRSxjQUFjLEFBQUM7VUFDekI7O2NBQU8sS0FBSyxFQUFDLE1BQU07WUFDakI7OztjQUNFOztrQkFBSSxHQUFHLEVBQUMsR0FBRyxFQUFDLEtBQUssRUFBQyxRQUFRO2dCQUN4Qjs7OztpQkFBYTtnQkFDYjs7OztpQkFBWTtlQUNUO2FBQ0M7WUFDUjs7Z0JBQU8sS0FBSyxFQUFDLFFBQVE7Y0FDbEIsUUFBUTthQUNIO1dBQ0Y7U0FDSjtRQUNOOztZQUFLLFNBQVMsRUFBQyxtQkFBbUI7VUFDaEM7O2NBQVEsU0FBUyxFQUFDLEtBQUssRUFBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLHdCQUF3QixBQUFDOztXQUV0RDtVQUNUOztjQUFRLFNBQVMsRUFBQyxLQUFLLEVBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyx1QkFBdUIsQUFBQzs7V0FFckQ7VUFDVDs7O0FBQ0ksdUJBQVMsRUFBQyxpQkFBaUI7QUFDM0IscUJBQU8sRUFBRSxJQUFJLENBQUMsa0JBQWtCLEFBQUM7QUFDakMsc0JBQVEsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLG9CQUFvQixLQUFLLElBQUksQUFBQzs7V0FFOUM7U0FDTDtPQUNGLENBQ047S0FDSDs7O1dBRXNCLGlDQUFDLElBQVksRUFBUTtBQUMxQyxVQUFJLENBQUMsUUFBUSxDQUFDO0FBQ1osa0JBQVUsRUFBRSxJQUFJO09BQ2pCLENBQUMsQ0FBQztLQUNKOzs7V0FFbUIsOEJBQUMsSUFBc0IsRUFBUTtBQUNqRCxVQUFJLENBQUMsUUFBUSxDQUFDO0FBQ1osNEJBQW9CLEVBQUUsSUFBSTtPQUMzQixDQUFDLENBQUM7S0FDSjs7O1dBRXlCLHNDQUFTO0FBQ2pDLFVBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0tBQ3pCOzs7V0FFaUIsOEJBQVM7QUFDekIsVUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7S0FDekI7OztXQUV1QixvQ0FBUztBQUMvQixVQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO0tBQy9DOzs7V0FFc0IsbUNBQVM7O0FBRTlCLFVBQUksQ0FBQyxRQUFRLENBQUM7QUFDWix5QkFBaUIsRUFBRSxFQUFFO0FBQ3JCLDRCQUFvQixFQUFFLElBQUk7T0FDM0IsQ0FBQyxDQUFDOztBQUVILFVBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLHNCQUFzQixFQUFFLENBQUM7S0FDN0M7OztXQUVlLDRCQUFTO0FBQ3ZCLFVBQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsb0JBQW9CLENBQUM7QUFDckQsVUFBSSxZQUFZLEVBQUU7O0FBRWhCLFlBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUNoRCxZQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0FBQ3ZDLFlBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLHdCQUF3QixFQUFFLENBQUM7T0FDL0M7S0FDRjs7O1NBdklVLGlCQUFpQjtHQUFTLG9CQUFNLFNBQVMiLCJmaWxlIjoiQXR0YWNoVUlDb21wb25lbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7TGF1bmNoQXR0YWNoU3RvcmV9IGZyb20gJy4vTGF1bmNoQXR0YWNoU3RvcmUnO1xuaW1wb3J0IHR5cGUge0xhdW5jaEF0dGFjaEFjdGlvbnN9IGZyb20gJy4vTGF1bmNoQXR0YWNoQWN0aW9ucyc7XG5pbXBvcnQgdHlwZSB7XG4gIEF0dGFjaFRhcmdldEluZm8sXG59IGZyb20gJy4uLy4uL251Y2xpZGUtZGVidWdnZXItbGxkYi1zZXJ2ZXIvbGliL0RlYnVnZ2VyUnBjU2VydmljZUludGVyZmFjZSc7XG5cbmltcG9ydCB7UmVhY3R9IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcbmltcG9ydCBjbGFzc25hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuaW1wb3J0IHtBdG9tSW5wdXR9IGZyb20gJy4uLy4uL251Y2xpZGUtdWkvbGliL0F0b21JbnB1dCc7XG5cbnR5cGUgUHJvcHNUeXBlID0ge1xuICBzdG9yZTogTGF1bmNoQXR0YWNoU3RvcmU7XG4gIGFjdGlvbnM6IExhdW5jaEF0dGFjaEFjdGlvbnM7XG59O1xuXG50eXBlIFN0YXRlVHlwZSA9IHtcbiAgdGFyZ2V0TGlzdENoYW5nZURpc3Bvc2FibGU6IElEaXNwb3NhYmxlO1xuICBhdHRhY2hUYXJnZXRJbmZvczogQXJyYXk8QXR0YWNoVGFyZ2V0SW5mbz47XG4gIHNlbGVjdGVkQXR0YWNoVGFyZ2V0OiA/QXR0YWNoVGFyZ2V0SW5mbztcbiAgZmlsdGVyVGV4dDogc3RyaW5nO1xufTtcblxuZXhwb3J0IGNsYXNzIEF0dGFjaFVJQ29tcG9uZW50IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PHZvaWQsIFByb3BzVHlwZSwgU3RhdGVUeXBlPiB7XG4gIHByb3BzOiBQcm9wc1R5cGU7XG4gIHN0YXRlOiBTdGF0ZVR5cGU7XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IFByb3BzVHlwZSkge1xuICAgIHN1cGVyKHByb3BzKTtcblxuICAgICh0aGlzOiBhbnkpLl9oYW5kbGVGaWx0ZXJUZXh0Q2hhbmdlID0gdGhpcy5faGFuZGxlRmlsdGVyVGV4dENoYW5nZS5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9oYW5kbGVDYW5jZWxCdXR0b25DbGljayA9IHRoaXMuX2hhbmRsZUNhbmNlbEJ1dHRvbkNsaWNrLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX2hhbmRsZUF0dGFjaENsaWNrID0gdGhpcy5faGFuZGxlQXR0YWNoQ2xpY2suYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5fdXBkYXRlQXR0YWNoVGFyZ2V0TGlzdCA9IHRoaXMuX3VwZGF0ZUF0dGFjaFRhcmdldExpc3QuYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5fdXBkYXRlTGlzdCA9IHRoaXMuX3VwZGF0ZUxpc3QuYmluZCh0aGlzKTtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgdGFyZ2V0TGlzdENoYW5nZURpc3Bvc2FibGU6IHRoaXMucHJvcHMuc3RvcmUub25BdHRhY2hUYXJnZXRMaXN0Q2hhbmdlZCh0aGlzLl91cGRhdGVMaXN0KSxcbiAgICAgIGF0dGFjaFRhcmdldEluZm9zOiBbXSxcbiAgICAgIHNlbGVjdGVkQXR0YWNoVGFyZ2V0OiBudWxsLFxuICAgICAgZmlsdGVyVGV4dDogJycsXG4gICAgfTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgIGlmICh0aGlzLnN0YXRlLnRhcmdldExpc3RDaGFuZ2VEaXNwb3NhYmxlICE9IG51bGwpIHtcbiAgICAgIHRoaXMuc3RhdGUudGFyZ2V0TGlzdENoYW5nZURpc3Bvc2FibGUuZGlzcG9zZSgpO1xuICAgIH1cbiAgfVxuXG4gIF91cGRhdGVMaXN0KCk6IHZvaWQge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgYXR0YWNoVGFyZ2V0SW5mb3M6IHRoaXMucHJvcHMuc3RvcmUuZ2V0QXR0YWNoVGFyZ2V0SW5mb3MoKSxcbiAgICB9KTtcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIGNvbnN0IGNvbnRhaW5lclN0eWxlID0ge1xuICAgICAgbWF4SGVpZ2h0OiAnMzBlbScsXG4gICAgICBvdmVyZmxvdzogJ2F1dG8nLFxuICAgIH07XG4gICAgY29uc3QgZmlsdGVyUmVnZXggPSBuZXcgUmVnRXhwKHRoaXMuc3RhdGUuZmlsdGVyVGV4dCwgJ2knKTtcbiAgICBjb25zdCBjaGlsZHJlbiA9IHRoaXMuc3RhdGUuYXR0YWNoVGFyZ2V0SW5mb3NcbiAgICAgIC5maWx0ZXIoaXRlbSA9PiBmaWx0ZXJSZWdleC50ZXN0KGl0ZW0ubmFtZSkgfHwgZmlsdGVyUmVnZXgudGVzdChpdGVtLnBpZC50b1N0cmluZygpKSlcbiAgICAgIC5tYXAoKGl0ZW0sIGluZGV4KSA9PiAoXG4gICAgICAgIDx0ciBrZXk9e2luZGV4ICsgMX1cbiAgICAgICAgICAgIGFsaWduPVwiY2VudGVyXCJcbiAgICAgICAgICAgIGNsYXNzTmFtZT17XG4gICAgICAgICAgICAgIGNsYXNzbmFtZXMoeydhdHRhY2gtc2VsZWN0ZWQtcm93JzogdGhpcy5zdGF0ZS5zZWxlY3RlZEF0dGFjaFRhcmdldCA9PT0gaXRlbX0pXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvbkNsaWNrPXt0aGlzLl9oYW5kbGVDbGlja1RhYmxlUm93LmJpbmQodGhpcywgaXRlbSl9XG4gICAgICAgICAgICBvbkRvdWJsZUNsaWNrPXt0aGlzLl9oYW5kbGVEb3VibGVDbGlja1RhYmxlUm93LmJpbmQodGhpcywgaW5kZXgpfT5cbiAgICAgICAgICA8dGQ+e2l0ZW0ubmFtZX08L3RkPlxuICAgICAgICAgIDx0ZD57aXRlbS5waWR9PC90ZD5cbiAgICAgICAgPC90cj5cbiAgICAgIClcbiAgICApO1xuICAgIC8vIFRPRE86IHdyYXAgaW50byBzZXBhcmF0ZSBSZWFjdCBjb21wb25lbnRzLlxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImJsb2NrXCI+XG4gICAgICAgIDxBdG9tSW5wdXRcbiAgICAgICAgICBwbGFjZWhvbGRlclRleHQ9XCJTZWFyY2guLi5cIlxuICAgICAgICAgIGluaXRpYWxWYWx1ZT17dGhpcy5zdGF0ZS5maWx0ZXJUZXh0fVxuICAgICAgICAgIG9uRGlkQ2hhbmdlPXt0aGlzLl9oYW5kbGVGaWx0ZXJUZXh0Q2hhbmdlfVxuICAgICAgICAgIHNpemU9XCJzbVwiXG4gICAgICAgIC8+XG4gICAgICAgIDxkaXYgc3R5bGU9e2NvbnRhaW5lclN0eWxlfT5cbiAgICAgICAgICA8dGFibGUgd2lkdGg9XCIxMDAlXCI+XG4gICAgICAgICAgICA8dGhlYWQ+XG4gICAgICAgICAgICAgIDx0ciBrZXk9XCIwXCIgYWxpZ249XCJjZW50ZXJcIj5cbiAgICAgICAgICAgICAgICA8dGQ+TmFtZTwvdGQ+XG4gICAgICAgICAgICAgICAgPHRkPlBJRDwvdGQ+XG4gICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICA8L3RoZWFkPlxuICAgICAgICAgICAgPHRib2R5IGFsaWduPVwiY2VudGVyXCI+XG4gICAgICAgICAgICAgIHtjaGlsZHJlbn1cbiAgICAgICAgICAgIDwvdGJvZHk+XG4gICAgICAgICAgPC90YWJsZT5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicGFkZGVkIHRleHQtcmlnaHRcIj5cbiAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cImJ0blwiIG9uQ2xpY2s9e3RoaXMuX2hhbmRsZUNhbmNlbEJ1dHRvbkNsaWNrfT5cbiAgICAgICAgICAgIENhbmNlbFxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwiYnRuXCIgb25DbGljaz17dGhpcy5fdXBkYXRlQXR0YWNoVGFyZ2V0TGlzdH0+XG4gICAgICAgICAgICBSZWZyZXNoXG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJidG4gYnRuLXByaW1hcnlcIlxuICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLl9oYW5kbGVBdHRhY2hDbGlja31cbiAgICAgICAgICAgICAgZGlzYWJsZWQ9e3RoaXMuc3RhdGUuc2VsZWN0ZWRBdHRhY2hUYXJnZXQgPT09IG51bGx9PlxuICAgICAgICAgICAgQXR0YWNoXG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIF9oYW5kbGVGaWx0ZXJUZXh0Q2hhbmdlKHRleHQ6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgZmlsdGVyVGV4dDogdGV4dCxcbiAgICB9KTtcbiAgfVxuXG4gIF9oYW5kbGVDbGlja1RhYmxlUm93KGl0ZW06IEF0dGFjaFRhcmdldEluZm8pOiB2b2lkIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHNlbGVjdGVkQXR0YWNoVGFyZ2V0OiBpdGVtLFxuICAgIH0pO1xuICB9XG5cbiAgX2hhbmRsZURvdWJsZUNsaWNrVGFibGVSb3coKTogdm9pZCB7XG4gICAgdGhpcy5fYXR0YWNoVG9Qcm9jZXNzKCk7XG4gIH1cblxuICBfaGFuZGxlQXR0YWNoQ2xpY2soKTogdm9pZCB7XG4gICAgdGhpcy5fYXR0YWNoVG9Qcm9jZXNzKCk7XG4gIH1cblxuICBfaGFuZGxlQ2FuY2VsQnV0dG9uQ2xpY2soKTogdm9pZCB7XG4gICAgdGhpcy5wcm9wcy5hY3Rpb25zLnRvZ2dsZUxhdW5jaEF0dGFjaERpYWxvZygpO1xuICB9XG5cbiAgX3VwZGF0ZUF0dGFjaFRhcmdldExpc3QoKTogdm9pZCB7XG4gICAgLy8gQ2xlYXIgb2xkIGxpc3QuXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBhdHRhY2hUYXJnZXRJbmZvczogW10sXG4gICAgICBzZWxlY3RlZEF0dGFjaFRhcmdldDogbnVsbCxcbiAgICB9KTtcbiAgICAvLyBGaXJlIGFuZCBmb3JnZXQuXG4gICAgdGhpcy5wcm9wcy5hY3Rpb25zLnVwZGF0ZUF0dGFjaFRhcmdldExpc3QoKTtcbiAgfVxuXG4gIF9hdHRhY2hUb1Byb2Nlc3MoKTogdm9pZCB7XG4gICAgY29uc3QgYXR0YWNoVGFyZ2V0ID0gdGhpcy5zdGF0ZS5zZWxlY3RlZEF0dGFjaFRhcmdldDtcbiAgICBpZiAoYXR0YWNoVGFyZ2V0KSB7XG4gICAgICAvLyBGaXJlIGFuZCBmb3JnZXQuXG4gICAgICB0aGlzLnByb3BzLmFjdGlvbnMuYXR0YWNoRGVidWdnZXIoYXR0YWNoVGFyZ2V0KTtcbiAgICAgIHRoaXMucHJvcHMuYWN0aW9ucy5zaG93RGVidWdnZXJQYW5lbCgpO1xuICAgICAgdGhpcy5wcm9wcy5hY3Rpb25zLnRvZ2dsZUxhdW5jaEF0dGFjaERpYWxvZygpO1xuICAgIH1cbiAgfVxufVxuIl19