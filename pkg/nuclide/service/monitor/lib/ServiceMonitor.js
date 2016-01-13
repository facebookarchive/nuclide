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

var _uiAtomInput = require('../../../ui/atom-input');

var _uiAtomInput2 = _interopRequireDefault(_uiAtomInput);

var _atom = require('atom');

var _reactForAtom = require('react-for-atom');

var _reactForAtom2 = _interopRequireDefault(_reactForAtom);

var PropTypes = _reactForAtom2['default'].PropTypes;

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

        rows.push(_reactForAtom2['default'].createElement(
          'tr',
          { key: key },
          _reactForAtom2['default'].createElement(
            'td',
            { className: 'nuclide-service-monitor-cell' },
            item.date.toLocaleTimeString()
          ),
          _reactForAtom2['default'].createElement(
            'td',
            { className: 'nuclide-service-monitor-cell' },
            item.service
          ),
          _reactForAtom2['default'].createElement(
            'td',
            { className: 'nuclide-service-monitor-cell' },
            item.method
          ),
          _reactForAtom2['default'].createElement(
            'td',
            { className: 'nuclide-service-monitor-cell' },
            String(item.isLocal)
          ),
          _reactForAtom2['default'].createElement(
            'td',
            { className: 'nuclide-service-monitor-cell' },
            item.argInfo
          )
        ));
      }

      // TODO(mbolin): Create a reverse iterator for the CircularBuffer.
      rows.reverse();

      return _reactForAtom2['default'].createElement(
        'atom-panel',
        { 'class': 'top nuclide-service-monitor-root' },
        _reactForAtom2['default'].createElement(
          'div',
          { className: 'panel-heading' },
          _reactForAtom2['default'].createElement(
            'div',
            { className: 'nuclide-service-monitor-header' },
            _reactForAtom2['default'].createElement(
              'div',
              { className: 'nuclide-service-monitor-left-header' },
              'Nuclide Service Monitor'
            ),
            _reactForAtom2['default'].createElement(
              'div',
              { className: 'nuclide-service-monitor-right-header' },
              _reactForAtom2['default'].createElement(
                'div',
                { className: 'nuclide-service-monitor-filter-container' },
                _reactForAtom2['default'].createElement(_uiAtomInput2['default'], {
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
        _reactForAtom2['default'].createElement(
          'div',
          { className: 'panel-body nuclide-service-monitor-contents' },
          _reactForAtom2['default'].createElement(
            'table',
            null,
            _reactForAtom2['default'].createElement(
              'tbody',
              null,
              _reactForAtom2['default'].createElement(
                'tr',
                null,
                _reactForAtom2['default'].createElement(
                  'th',
                  { className: 'nuclide-service-monitor-header-cell' },
                  'Time'
                ),
                _reactForAtom2['default'].createElement(
                  'th',
                  { className: 'nuclide-service-monitor-header-cell' },
                  'Service'
                ),
                _reactForAtom2['default'].createElement(
                  'th',
                  { className: 'nuclide-service-monitor-header-cell' },
                  'Method'
                ),
                _reactForAtom2['default'].createElement(
                  'th',
                  { className: 'nuclide-service-monitor-header-cell' },
                  'Local?'
                ),
                _reactForAtom2['default'].createElement(
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
})(_reactForAtom2['default'].Component);

exports['default'] = ServiceMonitor;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlNlcnZpY2VNb25pdG9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7MkJBYXNCLHdCQUF3Qjs7OztvQkFDWixNQUFNOzs0QkFDdEIsZ0JBQWdCOzs7O0lBRTNCLFNBQVMsNkJBQVQsU0FBUzs7SUFFSyxjQUFjO1lBQWQsY0FBYzs7ZUFBZCxjQUFjOztXQUVkO0FBQ2pCLG1CQUFhLEVBQUUsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVO0tBQzNDOzs7O0FBT1UsV0FYUSxjQUFjLENBV3JCLEtBQWEsRUFBRTswQkFYUixjQUFjOztBQVkvQiwrQkFaaUIsY0FBYyw2Q0FZekIsS0FBSyxFQUFFO0FBQ2IsUUFBSSxDQUFDLGNBQWMsR0FBRywrQkFBeUIsQ0FBQztBQUNoRCxRQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQztBQUNsQixRQUFJLENBQUMsVUFBVSxHQUFHLElBQUksT0FBTyxFQUFFLENBQUM7QUFDaEMsUUFBSSxDQUFDLEtBQUssR0FBRztBQUNYLG1CQUFhLEVBQUUsRUFBRTtLQUNsQixDQUFDO0FBQ0YsUUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDOUQ7O2VBcEJrQixjQUFjOztXQXNCaEIsNkJBQUc7OztBQUNsQixVQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FDckIsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLFVBQUMsSUFBSTtlQUFXLE1BQUssV0FBVyxFQUFFO09BQUEsQ0FBQyxDQUN2RSxDQUFDO0tBQ0g7OztXQUVtQixnQ0FBRztBQUNyQixVQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQy9COzs7V0FFaUIsNEJBQUMsVUFBa0IsRUFBUTtBQUMzQyxVQUFJLENBQUMsUUFBUSxDQUFDO0FBQ1oscUJBQWEsRUFBRSxVQUFVO09BQzFCLENBQUMsQ0FBQztLQUNKOzs7Ozs7O1dBS0ssa0JBQVM7QUFDYixVQUFNLElBQUksR0FBRyxFQUFFLENBQUM7QUFDaEIsVUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsV0FBVyxFQUFFLENBQUM7QUFDN0QsV0FBSyxJQUFNLElBQUksSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBRTtBQUMzQyxZQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO0FBQzVELG1CQUFTO1NBQ1Y7O0FBRUQsWUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDcEMsWUFBSSxDQUFDLEdBQUcsRUFBRTtBQUNSLGFBQUcsR0FBRyxNQUFNLENBQUMsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDOUIsY0FBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1NBQ2hDOztBQUVELFlBQUksQ0FBQyxJQUFJLENBQ1A7O1lBQUksR0FBRyxFQUFFLEdBQUcsQUFBQztVQUNYOztjQUFJLFNBQVMsRUFBQyw4QkFBOEI7WUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixFQUFFO1dBQU07VUFDbEY7O2NBQUksU0FBUyxFQUFDLDhCQUE4QjtZQUFFLElBQUksQ0FBQyxPQUFPO1dBQU07VUFDaEU7O2NBQUksU0FBUyxFQUFDLDhCQUE4QjtZQUFFLElBQUksQ0FBQyxNQUFNO1dBQU07VUFDL0Q7O2NBQUksU0FBUyxFQUFDLDhCQUE4QjtZQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO1dBQU07VUFDeEU7O2NBQUksU0FBUyxFQUFDLDhCQUE4QjtZQUFFLElBQUksQ0FBQyxPQUFPO1dBQU07U0FDN0QsQ0FDTixDQUFDO09BQ0g7OztBQUdELFVBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQzs7QUFFZixhQUNFOztVQUFZLFNBQU0sa0NBQWtDO1FBQ2xEOztZQUFLLFNBQVMsRUFBQyxlQUFlO1VBQzVCOztjQUFLLFNBQVMsRUFBQyxnQ0FBZ0M7WUFDN0M7O2dCQUFLLFNBQVMsRUFBQyxxQ0FBcUM7O2FBRTlDO1lBQ047O2dCQUFLLFNBQVMsRUFBQyxzQ0FBc0M7Y0FDbkQ7O2tCQUFLLFNBQVMsRUFBQywwQ0FBMEM7Z0JBQ3ZEO0FBQ0UsOEJBQVksRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsQUFBQztBQUN2Qyw2QkFBVyxFQUFFLElBQUksQ0FBQyxrQkFBa0IsQUFBQztBQUNyQyxpQ0FBZSxFQUFDLHdCQUF3QjtBQUN4QyxxQkFBRyxFQUFDLFFBQVE7QUFDWixzQkFBSSxFQUFDLElBQUk7a0JBQ1Q7ZUFDRTthQUNGO1dBQ0Y7U0FDRjtRQUNOOztZQUFLLFNBQVMsRUFBQyw2Q0FBNkM7VUFDMUQ7OztZQUNFOzs7Y0FDRTs7O2dCQUNFOztvQkFBSSxTQUFTLEVBQUMscUNBQXFDOztpQkFBVTtnQkFDN0Q7O29CQUFJLFNBQVMsRUFBQyxxQ0FBcUM7O2lCQUFhO2dCQUNoRTs7b0JBQUksU0FBUyxFQUFDLHFDQUFxQzs7aUJBQVk7Z0JBQy9EOztvQkFBSSxTQUFTLEVBQUMscUNBQXFDOztpQkFBWTtnQkFDL0Q7O29CQUFJLFNBQVMsRUFBQyxxQ0FBcUM7O2lCQUFlO2VBQy9EO2NBQ0osSUFBSTthQUNDO1dBQ0Y7U0FDSjtPQUNLLENBQ2I7S0FDSDs7O1NBekdrQixjQUFjO0dBQVMsMEJBQU0sU0FBUzs7cUJBQXRDLGNBQWMiLCJmaWxlIjoiU2VydmljZU1vbml0b3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSBJdGVtIGZyb20gJy4uLy4uLy4uL3JlbW90ZS1jb25uZWN0aW9uL2xpYi9TZXJ2aWNlTG9nZ2VyJztcblxuaW1wb3J0IEF0b21JbnB1dCBmcm9tICcuLi8uLi8uLi91aS9hdG9tLWlucHV0JztcbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuXG5jb25zdCB7UHJvcFR5cGVzfSA9IFJlYWN0O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTZXJ2aWNlTW9uaXRvciBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICBzZXJ2aWNlTG9nZ2VyOiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gIH07XG5cbiAgX3N1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG5cbiAgX25leHRLZXk6IG51bWJlcjtcbiAgX2l0ZW1Ub0tleTogV2Vha01hcDxJdGVtLCBzdHJpbmc+O1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBPYmplY3QpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5fbmV4dEtleSA9IDA7XG4gICAgdGhpcy5faXRlbVRvS2V5ID0gbmV3IFdlYWtNYXAoKTtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgc2VydmljZUZpbHRlcjogJycsXG4gICAgfTtcbiAgICB0aGlzLl9vbkZpbHRlckRpZENoYW5nZSA9IHRoaXMuX29uRmlsdGVyRGlkQ2hhbmdlLmJpbmQodGhpcyk7XG4gIH1cblxuICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIHRoaXMucHJvcHMuc2VydmljZUxvZ2dlci5vbk5ld0l0ZW0oKGl0ZW06IEl0ZW0pID0+IHRoaXMuZm9yY2VVcGRhdGUoKSksXG4gICAgKTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICB9XG5cbiAgX29uRmlsdGVyRGlkQ2hhbmdlKGZpbHRlclRleHQ6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgc2VydmljZUZpbHRlcjogZmlsdGVyVGV4dCxcbiAgICB9KTtcbiAgfVxuXG4gIC8vIFRPRE8odDg1Nzk2NTQpOiBVc2UgRml4ZWREYXRhVGFibGUuXG4gIC8vIFRPRE8odDg1Nzk2OTUpOiBNYWtlIGl0IHBvc3NpYmxlIHRvIGNsaWNrIG9uIGEgcm93IGFuZCBjb25zb2xlLmRpcigpIHRoZSBhcmd1bWVudHMgc28gdGhhdCB0aGV5XG4gIC8vIGNhbiBiZSBpbnNwZWN0ZWQuXG4gIHJlbmRlcigpOiB2b2lkIHtcbiAgICBjb25zdCByb3dzID0gW107XG4gICAgY29uc3Qgc2VydmljZUZpbHRlciA9IHRoaXMuc3RhdGUuc2VydmljZUZpbHRlci50b0xvd2VyQ2FzZSgpO1xuICAgIGZvciAoY29uc3QgaXRlbSBvZiB0aGlzLnByb3BzLnNlcnZpY2VMb2dnZXIpIHtcbiAgICAgIGlmIChpdGVtLnNlcnZpY2UudG9Mb3dlckNhc2UoKS5pbmRleE9mKHNlcnZpY2VGaWx0ZXIpID09PSAtMSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgbGV0IGtleSA9IHRoaXMuX2l0ZW1Ub0tleS5nZXQoaXRlbSk7XG4gICAgICBpZiAoIWtleSkge1xuICAgICAgICBrZXkgPSBTdHJpbmcoKyt0aGlzLl9uZXh0S2V5KTtcbiAgICAgICAgdGhpcy5faXRlbVRvS2V5LnNldChpdGVtLCBrZXkpO1xuICAgICAgfVxuXG4gICAgICByb3dzLnB1c2goXG4gICAgICAgIDx0ciBrZXk9e2tleX0+XG4gICAgICAgICAgPHRkIGNsYXNzTmFtZT1cIm51Y2xpZGUtc2VydmljZS1tb25pdG9yLWNlbGxcIj57aXRlbS5kYXRlLnRvTG9jYWxlVGltZVN0cmluZygpfTwvdGQ+XG4gICAgICAgICAgPHRkIGNsYXNzTmFtZT1cIm51Y2xpZGUtc2VydmljZS1tb25pdG9yLWNlbGxcIj57aXRlbS5zZXJ2aWNlfTwvdGQ+XG4gICAgICAgICAgPHRkIGNsYXNzTmFtZT1cIm51Y2xpZGUtc2VydmljZS1tb25pdG9yLWNlbGxcIj57aXRlbS5tZXRob2R9PC90ZD5cbiAgICAgICAgICA8dGQgY2xhc3NOYW1lPVwibnVjbGlkZS1zZXJ2aWNlLW1vbml0b3ItY2VsbFwiPntTdHJpbmcoaXRlbS5pc0xvY2FsKX08L3RkPlxuICAgICAgICAgIDx0ZCBjbGFzc05hbWU9XCJudWNsaWRlLXNlcnZpY2UtbW9uaXRvci1jZWxsXCI+e2l0ZW0uYXJnSW5mb308L3RkPlxuICAgICAgICA8L3RyPlxuICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyBUT0RPKG1ib2xpbik6IENyZWF0ZSBhIHJldmVyc2UgaXRlcmF0b3IgZm9yIHRoZSBDaXJjdWxhckJ1ZmZlci5cbiAgICByb3dzLnJldmVyc2UoKTtcblxuICAgIHJldHVybiAoXG4gICAgICA8YXRvbS1wYW5lbCBjbGFzcz1cInRvcCBudWNsaWRlLXNlcnZpY2UtbW9uaXRvci1yb290XCI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicGFuZWwtaGVhZGluZ1wiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS1zZXJ2aWNlLW1vbml0b3ItaGVhZGVyXCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm51Y2xpZGUtc2VydmljZS1tb25pdG9yLWxlZnQtaGVhZGVyXCI+XG4gICAgICAgICAgICAgIE51Y2xpZGUgU2VydmljZSBNb25pdG9yXG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS1zZXJ2aWNlLW1vbml0b3ItcmlnaHQtaGVhZGVyXCI+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS1zZXJ2aWNlLW1vbml0b3ItZmlsdGVyLWNvbnRhaW5lclwiPlxuICAgICAgICAgICAgICAgIDxBdG9tSW5wdXRcbiAgICAgICAgICAgICAgICAgIGluaXRpYWxWYWx1ZT17dGhpcy5zdGF0ZS5zZXJ2aWNlRmlsdGVyfVxuICAgICAgICAgICAgICAgICAgb25EaWRDaGFuZ2U9e3RoaXMuX29uRmlsdGVyRGlkQ2hhbmdlfVxuICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXJUZXh0PVwiRmlsdGVyIGJ5IHNlcnZpY2UgbmFtZVwiXG4gICAgICAgICAgICAgICAgICByZWY9XCJmaWx0ZXJcIlxuICAgICAgICAgICAgICAgICAgc2l6ZT1cInNtXCJcbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJwYW5lbC1ib2R5IG51Y2xpZGUtc2VydmljZS1tb25pdG9yLWNvbnRlbnRzXCI+XG4gICAgICAgICAgPHRhYmxlPlxuICAgICAgICAgICAgPHRib2R5PlxuICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgPHRoIGNsYXNzTmFtZT1cIm51Y2xpZGUtc2VydmljZS1tb25pdG9yLWhlYWRlci1jZWxsXCI+VGltZTwvdGg+XG4gICAgICAgICAgICAgICAgPHRoIGNsYXNzTmFtZT1cIm51Y2xpZGUtc2VydmljZS1tb25pdG9yLWhlYWRlci1jZWxsXCI+U2VydmljZTwvdGg+XG4gICAgICAgICAgICAgICAgPHRoIGNsYXNzTmFtZT1cIm51Y2xpZGUtc2VydmljZS1tb25pdG9yLWhlYWRlci1jZWxsXCI+TWV0aG9kPC90aD5cbiAgICAgICAgICAgICAgICA8dGggY2xhc3NOYW1lPVwibnVjbGlkZS1zZXJ2aWNlLW1vbml0b3ItaGVhZGVyLWNlbGxcIj5Mb2NhbD88L3RoPlxuICAgICAgICAgICAgICAgIDx0aCBjbGFzc05hbWU9XCJudWNsaWRlLXNlcnZpY2UtbW9uaXRvci1oZWFkZXItY2VsbFwiPkFyZ3VtZW50czwvdGg+XG4gICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgIHtyb3dzfVxuICAgICAgICAgICAgPC90Ym9keT5cbiAgICAgICAgICA8L3RhYmxlPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvYXRvbS1wYW5lbD5cbiAgICApO1xuICB9XG59XG4iXX0=