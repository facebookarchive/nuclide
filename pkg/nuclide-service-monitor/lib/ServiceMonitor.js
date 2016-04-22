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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _nuclideUiLibAtomInput = require('../../nuclide-ui/lib/AtomInput');

var _atom = require('atom');

var _reactForAtom = require('react-for-atom');

var PropTypes = _reactForAtom.React.PropTypes;

var ServiceMonitor = (function (_React$Component) {
  _inherits(ServiceMonitor, _React$Component);

  _createClass(ServiceMonitor, null, [{
    key: 'propTypes',
    value: {
      serviceLogger: PropTypes.object.isRequired
    },
    enumerable: true
  }]);

  function ServiceMonitor(props) {
    _classCallCheck(this, ServiceMonitor);

    _get(Object.getPrototypeOf(ServiceMonitor.prototype), 'constructor', this).call(this, props);
    this._subscriptions = new _atom.CompositeDisposable();
    this._nextKey = 0;
    this._itemToKey = new WeakMap();
    this.state = {
      serviceFilter: ''
    };
    this._onFilterDidChange = this._onFilterDidChange.bind(this);
  }

  _createClass(ServiceMonitor, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this = this;

      this._subscriptions.add(this.props.serviceLogger.onNewItem(function (item) {
        return _this.forceUpdate();
      }));
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this._subscriptions.dispose();
    }
  }, {
    key: '_onFilterDidChange',
    value: function _onFilterDidChange(filterText) {
      this.setState({
        serviceFilter: filterText
      });
    }

    // TODO(t8579654): Use FixedDataTable.
    // TODO(t8579695): Make it possible to click on a row and console.dir() the arguments so that they
    // can be inspected.
  }, {
    key: 'render',
    value: function render() {
      var rows = [];
      var serviceFilter = this.state.serviceFilter.toLowerCase();
      for (var item of this.props.serviceLogger) {
        if (item.service.toLowerCase().indexOf(serviceFilter) === -1) {
          continue;
        }

        var key = this._itemToKey.get(item);
        if (!key) {
          key = String(++this._nextKey);
          this._itemToKey.set(item, key);
        }

        rows.push(_reactForAtom.React.createElement(
          'tr',
          { key: key },
          _reactForAtom.React.createElement(
            'td',
            { className: 'nuclide-service-monitor-cell' },
            item.date.toLocaleTimeString()
          ),
          _reactForAtom.React.createElement(
            'td',
            { className: 'nuclide-service-monitor-cell' },
            item.service
          ),
          _reactForAtom.React.createElement(
            'td',
            { className: 'nuclide-service-monitor-cell' },
            item.method
          ),
          _reactForAtom.React.createElement(
            'td',
            { className: 'nuclide-service-monitor-cell' },
            String(item.isLocal)
          ),
          _reactForAtom.React.createElement(
            'td',
            { className: 'nuclide-service-monitor-cell' },
            item.argInfo
          )
        ));
      }

      // TODO(mbolin): Create a reverse iterator for the CircularBuffer.
      rows.reverse();

      return _reactForAtom.React.createElement(
        'atom-panel',
        { 'class': 'top nuclide-service-monitor-root' },
        _reactForAtom.React.createElement(
          'div',
          { className: 'panel-heading' },
          _reactForAtom.React.createElement(
            'div',
            { className: 'nuclide-service-monitor-header' },
            _reactForAtom.React.createElement(
              'div',
              { className: 'nuclide-service-monitor-left-header' },
              'Nuclide Service Monitor'
            ),
            _reactForAtom.React.createElement(
              'div',
              { className: 'nuclide-service-monitor-right-header' },
              _reactForAtom.React.createElement(
                'div',
                { className: 'nuclide-service-monitor-filter-container' },
                _reactForAtom.React.createElement(_nuclideUiLibAtomInput.AtomInput, {
                  initialValue: this.state.serviceFilter,
                  onDidChange: this._onFilterDidChange,
                  placeholderText: 'Filter by service name',
                  ref: 'filter',
                  size: 'sm'
                })
              )
            )
          )
        ),
        _reactForAtom.React.createElement(
          'div',
          { className: 'panel-body nuclide-service-monitor-contents' },
          _reactForAtom.React.createElement(
            'table',
            null,
            _reactForAtom.React.createElement(
              'tbody',
              null,
              _reactForAtom.React.createElement(
                'tr',
                null,
                _reactForAtom.React.createElement(
                  'th',
                  { className: 'nuclide-service-monitor-header-cell' },
                  'Time'
                ),
                _reactForAtom.React.createElement(
                  'th',
                  { className: 'nuclide-service-monitor-header-cell' },
                  'Service'
                ),
                _reactForAtom.React.createElement(
                  'th',
                  { className: 'nuclide-service-monitor-header-cell' },
                  'Method'
                ),
                _reactForAtom.React.createElement(
                  'th',
                  { className: 'nuclide-service-monitor-header-cell' },
                  'Local?'
                ),
                _reactForAtom.React.createElement(
                  'th',
                  { className: 'nuclide-service-monitor-header-cell' },
                  'Arguments'
                )
              ),
              rows
            )
          )
        )
      );
    }
  }]);

  return ServiceMonitor;
})(_reactForAtom.React.Component);

exports['default'] = ServiceMonitor;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,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Q0U7O1VBQVksU0FBTSxrQ0FBa0M7UUFDbEQ7O1lBQUssU0FBUyxFQUFDLGVBQWU7VUFDNUI7O2NBQUssU0FBUyxFQUFDLGdDQUFnQztZQUM3Qzs7Z0JBQUssU0FBUyxFQUFDLHFDQUFxQzs7YUFFOUM7WUFDTjs7Z0JBQUssU0FBUyxFQUFDLHNDQUFzQztjQUNuRDs7a0JBQUssU0FBUyxFQUFDLDBDQUEwQztnQkFDdkQ7QUFDRSw4QkFBWSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxBQUFDO0FBQ3ZDLDZCQUFXLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixBQUFDO0FBQ3JDLGlDQUFlLEVBQUMsd0JBQXdCO0FBQ3hDLHFCQUFHLEVBQUMsUUFBUTtBQUNaLHNCQUFJLEVBQUMsSUFBSTtrQkFDVDtlQUNFO2FBQ0Y7V0FDRjtTQUNGO1FBQ047O1lBQUssU0FBUyxFQUFDLDZDQUE2QztVQUMxRDs7O1lBQ0U7OztjQUNFOzs7Z0JBQ0U7O29CQUFJLFNBQVMsRUFBQyxxQ0FBcUM7O2lCQUFVO2dCQUM3RDs7b0JBQUksU0FBUyxFQUFDLHFDQUFxQzs7aUJBQWE7Z0JBQ2hFOztvQkFBSSxTQUFTLEVBQUMscUNBQXFDOztpQkFBWTtnQkFDL0Q7O29CQUFJLFNBQVMsRUFBQyxxQ0FBcUM7O2lCQUFZO2dCQUMvRDs7b0JBQUksU0FBUyxFQUFDLHFDQUFxQzs7aUJBQWU7ZUFDL0Q7Y0FDSixJQUFJO2FBQ0M7V0FDRjtTQUNKO09BQ0ssQ0FDYjtLQUNIOzs7U0ExR2tCLGNBQWM7R0FBUyxvQkFBTSxTQUFTOztxQkFBdEMsY0FBYyIsImZpbGUiOiJTZXJ2aWNlTW9uaXRvci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIEl0ZW0gZnJvbSAnLi4vLi4vbnVjbGlkZS1yZW1vdGUtY29ubmVjdGlvbi9saWIvU2VydmljZUxvZ2dlcic7XG5cbmltcG9ydCB7QXRvbUlucHV0fSBmcm9tICcuLi8uLi9udWNsaWRlLXVpL2xpYi9BdG9tSW5wdXQnO1xuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCB7UmVhY3R9IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcblxuY29uc3Qge1Byb3BUeXBlc30gPSBSZWFjdDtcblxudHlwZSBTdGF0ZSA9IHtcbiAgc2VydmljZUZpbHRlcjogc3RyaW5nO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2VydmljZU1vbml0b3IgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBzdGF0ZTogU3RhdGU7XG5cbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICBzZXJ2aWNlTG9nZ2VyOiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gIH07XG5cbiAgX3N1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG5cbiAgX25leHRLZXk6IG51bWJlcjtcbiAgX2l0ZW1Ub0tleTogV2Vha01hcDxJdGVtLCBzdHJpbmc+O1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBPYmplY3QpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5fbmV4dEtleSA9IDA7XG4gICAgdGhpcy5faXRlbVRvS2V5ID0gbmV3IFdlYWtNYXAoKTtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgc2VydmljZUZpbHRlcjogJycsXG4gICAgfTtcbiAgICAodGhpczogYW55KS5fb25GaWx0ZXJEaWRDaGFuZ2UgPSB0aGlzLl9vbkZpbHRlckRpZENoYW5nZS5iaW5kKHRoaXMpO1xuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICB0aGlzLnByb3BzLnNlcnZpY2VMb2dnZXIub25OZXdJdGVtKChpdGVtOiBJdGVtKSA9PiB0aGlzLmZvcmNlVXBkYXRlKCkpLFxuICAgICk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIF9vbkZpbHRlckRpZENoYW5nZShmaWx0ZXJUZXh0OiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHNlcnZpY2VGaWx0ZXI6IGZpbHRlclRleHQsXG4gICAgfSk7XG4gIH1cblxuICAvLyBUT0RPKHQ4NTc5NjU0KTogVXNlIEZpeGVkRGF0YVRhYmxlLlxuICAvLyBUT0RPKHQ4NTc5Njk1KTogTWFrZSBpdCBwb3NzaWJsZSB0byBjbGljayBvbiBhIHJvdyBhbmQgY29uc29sZS5kaXIoKSB0aGUgYXJndW1lbnRzIHNvIHRoYXQgdGhleVxuICAvLyBjYW4gYmUgaW5zcGVjdGVkLlxuICByZW5kZXIoKTogUmVhY3QuRWxlbWVudCB7XG4gICAgY29uc3Qgcm93cyA9IFtdO1xuICAgIGNvbnN0IHNlcnZpY2VGaWx0ZXIgPSB0aGlzLnN0YXRlLnNlcnZpY2VGaWx0ZXIudG9Mb3dlckNhc2UoKTtcbiAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgdGhpcy5wcm9wcy5zZXJ2aWNlTG9nZ2VyKSB7XG4gICAgICBpZiAoaXRlbS5zZXJ2aWNlLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihzZXJ2aWNlRmlsdGVyKSA9PT0gLTEpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGxldCBrZXkgPSB0aGlzLl9pdGVtVG9LZXkuZ2V0KGl0ZW0pO1xuICAgICAgaWYgKCFrZXkpIHtcbiAgICAgICAga2V5ID0gU3RyaW5nKCsrdGhpcy5fbmV4dEtleSk7XG4gICAgICAgIHRoaXMuX2l0ZW1Ub0tleS5zZXQoaXRlbSwga2V5KTtcbiAgICAgIH1cblxuICAgICAgcm93cy5wdXNoKFxuICAgICAgICA8dHIga2V5PXtrZXl9PlxuICAgICAgICAgIDx0ZCBjbGFzc05hbWU9XCJudWNsaWRlLXNlcnZpY2UtbW9uaXRvci1jZWxsXCI+e2l0ZW0uZGF0ZS50b0xvY2FsZVRpbWVTdHJpbmcoKX08L3RkPlxuICAgICAgICAgIDx0ZCBjbGFzc05hbWU9XCJudWNsaWRlLXNlcnZpY2UtbW9uaXRvci1jZWxsXCI+e2l0ZW0uc2VydmljZX08L3RkPlxuICAgICAgICAgIDx0ZCBjbGFzc05hbWU9XCJudWNsaWRlLXNlcnZpY2UtbW9uaXRvci1jZWxsXCI+e2l0ZW0ubWV0aG9kfTwvdGQ+XG4gICAgICAgICAgPHRkIGNsYXNzTmFtZT1cIm51Y2xpZGUtc2VydmljZS1tb25pdG9yLWNlbGxcIj57U3RyaW5nKGl0ZW0uaXNMb2NhbCl9PC90ZD5cbiAgICAgICAgICA8dGQgY2xhc3NOYW1lPVwibnVjbGlkZS1zZXJ2aWNlLW1vbml0b3ItY2VsbFwiPntpdGVtLmFyZ0luZm99PC90ZD5cbiAgICAgICAgPC90cj5cbiAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gVE9ETyhtYm9saW4pOiBDcmVhdGUgYSByZXZlcnNlIGl0ZXJhdG9yIGZvciB0aGUgQ2lyY3VsYXJCdWZmZXIuXG4gICAgcm93cy5yZXZlcnNlKCk7XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGF0b20tcGFuZWwgY2xhc3M9XCJ0b3AgbnVjbGlkZS1zZXJ2aWNlLW1vbml0b3Itcm9vdFwiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInBhbmVsLWhlYWRpbmdcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm51Y2xpZGUtc2VydmljZS1tb25pdG9yLWhlYWRlclwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLXNlcnZpY2UtbW9uaXRvci1sZWZ0LWhlYWRlclwiPlxuICAgICAgICAgICAgICBOdWNsaWRlIFNlcnZpY2UgTW9uaXRvclxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm51Y2xpZGUtc2VydmljZS1tb25pdG9yLXJpZ2h0LWhlYWRlclwiPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm51Y2xpZGUtc2VydmljZS1tb25pdG9yLWZpbHRlci1jb250YWluZXJcIj5cbiAgICAgICAgICAgICAgICA8QXRvbUlucHV0XG4gICAgICAgICAgICAgICAgICBpbml0aWFsVmFsdWU9e3RoaXMuc3RhdGUuc2VydmljZUZpbHRlcn1cbiAgICAgICAgICAgICAgICAgIG9uRGlkQ2hhbmdlPXt0aGlzLl9vbkZpbHRlckRpZENoYW5nZX1cbiAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyVGV4dD1cIkZpbHRlciBieSBzZXJ2aWNlIG5hbWVcIlxuICAgICAgICAgICAgICAgICAgcmVmPVwiZmlsdGVyXCJcbiAgICAgICAgICAgICAgICAgIHNpemU9XCJzbVwiXG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicGFuZWwtYm9keSBudWNsaWRlLXNlcnZpY2UtbW9uaXRvci1jb250ZW50c1wiPlxuICAgICAgICAgIDx0YWJsZT5cbiAgICAgICAgICAgIDx0Ym9keT5cbiAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgIDx0aCBjbGFzc05hbWU9XCJudWNsaWRlLXNlcnZpY2UtbW9uaXRvci1oZWFkZXItY2VsbFwiPlRpbWU8L3RoPlxuICAgICAgICAgICAgICAgIDx0aCBjbGFzc05hbWU9XCJudWNsaWRlLXNlcnZpY2UtbW9uaXRvci1oZWFkZXItY2VsbFwiPlNlcnZpY2U8L3RoPlxuICAgICAgICAgICAgICAgIDx0aCBjbGFzc05hbWU9XCJudWNsaWRlLXNlcnZpY2UtbW9uaXRvci1oZWFkZXItY2VsbFwiPk1ldGhvZDwvdGg+XG4gICAgICAgICAgICAgICAgPHRoIGNsYXNzTmFtZT1cIm51Y2xpZGUtc2VydmljZS1tb25pdG9yLWhlYWRlci1jZWxsXCI+TG9jYWw/PC90aD5cbiAgICAgICAgICAgICAgICA8dGggY2xhc3NOYW1lPVwibnVjbGlkZS1zZXJ2aWNlLW1vbml0b3ItaGVhZGVyLWNlbGxcIj5Bcmd1bWVudHM8L3RoPlxuICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgICB7cm93c31cbiAgICAgICAgICAgIDwvdGJvZHk+XG4gICAgICAgICAgPC90YWJsZT5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2F0b20tcGFuZWw+XG4gICAgKTtcbiAgfVxufVxuIl19