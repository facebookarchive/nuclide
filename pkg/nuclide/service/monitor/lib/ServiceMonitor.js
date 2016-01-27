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
                _reactForAtom.React.createElement(_uiAtomInput2['default'], {
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
//# sourceMappingURL=data:application/json;base64,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VUFBWSxTQUFNLGtDQUFrQztRQUNsRDs7WUFBSyxTQUFTLEVBQUMsZUFBZTtVQUM1Qjs7Y0FBSyxTQUFTLEVBQUMsZ0NBQWdDO1lBQzdDOztnQkFBSyxTQUFTLEVBQUMscUNBQXFDOzthQUU5QztZQUNOOztnQkFBSyxTQUFTLEVBQUMsc0NBQXNDO2NBQ25EOztrQkFBSyxTQUFTLEVBQUMsMENBQTBDO2dCQUN2RDtBQUNFLDhCQUFZLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLEFBQUM7QUFDdkMsNkJBQVcsRUFBRSxJQUFJLENBQUMsa0JBQWtCLEFBQUM7QUFDckMsaUNBQWUsRUFBQyx3QkFBd0I7QUFDeEMscUJBQUcsRUFBQyxRQUFRO0FBQ1osc0JBQUksRUFBQyxJQUFJO2tCQUNUO2VBQ0U7YUFDRjtXQUNGO1NBQ0Y7UUFDTjs7WUFBSyxTQUFTLEVBQUMsNkNBQTZDO1VBQzFEOzs7WUFDRTs7O2NBQ0U7OztnQkFDRTs7b0JBQUksU0FBUyxFQUFDLHFDQUFxQzs7aUJBQVU7Z0JBQzdEOztvQkFBSSxTQUFTLEVBQUMscUNBQXFDOztpQkFBYTtnQkFDaEU7O29CQUFJLFNBQVMsRUFBQyxxQ0FBcUM7O2lCQUFZO2dCQUMvRDs7b0JBQUksU0FBUyxFQUFDLHFDQUFxQzs7aUJBQVk7Z0JBQy9EOztvQkFBSSxTQUFTLEVBQUMscUNBQXFDOztpQkFBZTtlQUMvRDtjQUNKLElBQUk7YUFDQztXQUNGO1NBQ0o7T0FDSyxDQUNiO0tBQ0g7OztTQXpHa0IsY0FBYztHQUFTLG9CQUFNLFNBQVM7O3FCQUF0QyxjQUFjIiwiZmlsZSI6IlNlcnZpY2VNb25pdG9yLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUgSXRlbSBmcm9tICcuLi8uLi8uLi9yZW1vdGUtY29ubmVjdGlvbi9saWIvU2VydmljZUxvZ2dlcic7XG5cbmltcG9ydCBBdG9tSW5wdXQgZnJvbSAnLi4vLi4vLi4vdWkvYXRvbS1pbnB1dCc7XG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHtSZWFjdH0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuXG5jb25zdCB7UHJvcFR5cGVzfSA9IFJlYWN0O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTZXJ2aWNlTW9uaXRvciBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICBzZXJ2aWNlTG9nZ2VyOiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gIH07XG5cbiAgX3N1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG5cbiAgX25leHRLZXk6IG51bWJlcjtcbiAgX2l0ZW1Ub0tleTogV2Vha01hcDxJdGVtLCBzdHJpbmc+O1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBPYmplY3QpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5fbmV4dEtleSA9IDA7XG4gICAgdGhpcy5faXRlbVRvS2V5ID0gbmV3IFdlYWtNYXAoKTtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgc2VydmljZUZpbHRlcjogJycsXG4gICAgfTtcbiAgICB0aGlzLl9vbkZpbHRlckRpZENoYW5nZSA9IHRoaXMuX29uRmlsdGVyRGlkQ2hhbmdlLmJpbmQodGhpcyk7XG4gIH1cblxuICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIHRoaXMucHJvcHMuc2VydmljZUxvZ2dlci5vbk5ld0l0ZW0oKGl0ZW06IEl0ZW0pID0+IHRoaXMuZm9yY2VVcGRhdGUoKSksXG4gICAgKTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICB9XG5cbiAgX29uRmlsdGVyRGlkQ2hhbmdlKGZpbHRlclRleHQ6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgc2VydmljZUZpbHRlcjogZmlsdGVyVGV4dCxcbiAgICB9KTtcbiAgfVxuXG4gIC8vIFRPRE8odDg1Nzk2NTQpOiBVc2UgRml4ZWREYXRhVGFibGUuXG4gIC8vIFRPRE8odDg1Nzk2OTUpOiBNYWtlIGl0IHBvc3NpYmxlIHRvIGNsaWNrIG9uIGEgcm93IGFuZCBjb25zb2xlLmRpcigpIHRoZSBhcmd1bWVudHMgc28gdGhhdCB0aGV5XG4gIC8vIGNhbiBiZSBpbnNwZWN0ZWQuXG4gIHJlbmRlcigpOiB2b2lkIHtcbiAgICBjb25zdCByb3dzID0gW107XG4gICAgY29uc3Qgc2VydmljZUZpbHRlciA9IHRoaXMuc3RhdGUuc2VydmljZUZpbHRlci50b0xvd2VyQ2FzZSgpO1xuICAgIGZvciAoY29uc3QgaXRlbSBvZiB0aGlzLnByb3BzLnNlcnZpY2VMb2dnZXIpIHtcbiAgICAgIGlmIChpdGVtLnNlcnZpY2UudG9Mb3dlckNhc2UoKS5pbmRleE9mKHNlcnZpY2VGaWx0ZXIpID09PSAtMSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgbGV0IGtleSA9IHRoaXMuX2l0ZW1Ub0tleS5nZXQoaXRlbSk7XG4gICAgICBpZiAoIWtleSkge1xuICAgICAgICBrZXkgPSBTdHJpbmcoKyt0aGlzLl9uZXh0S2V5KTtcbiAgICAgICAgdGhpcy5faXRlbVRvS2V5LnNldChpdGVtLCBrZXkpO1xuICAgICAgfVxuXG4gICAgICByb3dzLnB1c2goXG4gICAgICAgIDx0ciBrZXk9e2tleX0+XG4gICAgICAgICAgPHRkIGNsYXNzTmFtZT1cIm51Y2xpZGUtc2VydmljZS1tb25pdG9yLWNlbGxcIj57aXRlbS5kYXRlLnRvTG9jYWxlVGltZVN0cmluZygpfTwvdGQ+XG4gICAgICAgICAgPHRkIGNsYXNzTmFtZT1cIm51Y2xpZGUtc2VydmljZS1tb25pdG9yLWNlbGxcIj57aXRlbS5zZXJ2aWNlfTwvdGQ+XG4gICAgICAgICAgPHRkIGNsYXNzTmFtZT1cIm51Y2xpZGUtc2VydmljZS1tb25pdG9yLWNlbGxcIj57aXRlbS5tZXRob2R9PC90ZD5cbiAgICAgICAgICA8dGQgY2xhc3NOYW1lPVwibnVjbGlkZS1zZXJ2aWNlLW1vbml0b3ItY2VsbFwiPntTdHJpbmcoaXRlbS5pc0xvY2FsKX08L3RkPlxuICAgICAgICAgIDx0ZCBjbGFzc05hbWU9XCJudWNsaWRlLXNlcnZpY2UtbW9uaXRvci1jZWxsXCI+e2l0ZW0uYXJnSW5mb308L3RkPlxuICAgICAgICA8L3RyPlxuICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyBUT0RPKG1ib2xpbik6IENyZWF0ZSBhIHJldmVyc2UgaXRlcmF0b3IgZm9yIHRoZSBDaXJjdWxhckJ1ZmZlci5cbiAgICByb3dzLnJldmVyc2UoKTtcblxuICAgIHJldHVybiAoXG4gICAgICA8YXRvbS1wYW5lbCBjbGFzcz1cInRvcCBudWNsaWRlLXNlcnZpY2UtbW9uaXRvci1yb290XCI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicGFuZWwtaGVhZGluZ1wiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS1zZXJ2aWNlLW1vbml0b3ItaGVhZGVyXCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm51Y2xpZGUtc2VydmljZS1tb25pdG9yLWxlZnQtaGVhZGVyXCI+XG4gICAgICAgICAgICAgIE51Y2xpZGUgU2VydmljZSBNb25pdG9yXG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS1zZXJ2aWNlLW1vbml0b3ItcmlnaHQtaGVhZGVyXCI+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS1zZXJ2aWNlLW1vbml0b3ItZmlsdGVyLWNvbnRhaW5lclwiPlxuICAgICAgICAgICAgICAgIDxBdG9tSW5wdXRcbiAgICAgICAgICAgICAgICAgIGluaXRpYWxWYWx1ZT17dGhpcy5zdGF0ZS5zZXJ2aWNlRmlsdGVyfVxuICAgICAgICAgICAgICAgICAgb25EaWRDaGFuZ2U9e3RoaXMuX29uRmlsdGVyRGlkQ2hhbmdlfVxuICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXJUZXh0PVwiRmlsdGVyIGJ5IHNlcnZpY2UgbmFtZVwiXG4gICAgICAgICAgICAgICAgICByZWY9XCJmaWx0ZXJcIlxuICAgICAgICAgICAgICAgICAgc2l6ZT1cInNtXCJcbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJwYW5lbC1ib2R5IG51Y2xpZGUtc2VydmljZS1tb25pdG9yLWNvbnRlbnRzXCI+XG4gICAgICAgICAgPHRhYmxlPlxuICAgICAgICAgICAgPHRib2R5PlxuICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgPHRoIGNsYXNzTmFtZT1cIm51Y2xpZGUtc2VydmljZS1tb25pdG9yLWhlYWRlci1jZWxsXCI+VGltZTwvdGg+XG4gICAgICAgICAgICAgICAgPHRoIGNsYXNzTmFtZT1cIm51Y2xpZGUtc2VydmljZS1tb25pdG9yLWhlYWRlci1jZWxsXCI+U2VydmljZTwvdGg+XG4gICAgICAgICAgICAgICAgPHRoIGNsYXNzTmFtZT1cIm51Y2xpZGUtc2VydmljZS1tb25pdG9yLWhlYWRlci1jZWxsXCI+TWV0aG9kPC90aD5cbiAgICAgICAgICAgICAgICA8dGggY2xhc3NOYW1lPVwibnVjbGlkZS1zZXJ2aWNlLW1vbml0b3ItaGVhZGVyLWNlbGxcIj5Mb2NhbD88L3RoPlxuICAgICAgICAgICAgICAgIDx0aCBjbGFzc05hbWU9XCJudWNsaWRlLXNlcnZpY2UtbW9uaXRvci1oZWFkZXItY2VsbFwiPkFyZ3VtZW50czwvdGg+XG4gICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgIHtyb3dzfVxuICAgICAgICAgICAgPC90Ym9keT5cbiAgICAgICAgICA8L3RhYmxlPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvYXRvbS1wYW5lbD5cbiAgICApO1xuICB9XG59XG4iXX0=