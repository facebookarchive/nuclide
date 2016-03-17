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

var _nuclideUiAtomInput = require('../../nuclide-ui-atom-input');

var _nuclideUiAtomInput2 = _interopRequireDefault(_nuclideUiAtomInput);

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
                _reactForAtom.React.createElement(_nuclideUiAtomInput2['default'], {
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
//# sourceMappingURL=data:application/json;base64,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ZixhQUNFOztVQUFZLFNBQU0sa0NBQWtDO1FBQ2xEOztZQUFLLFNBQVMsRUFBQyxlQUFlO1VBQzVCOztjQUFLLFNBQVMsRUFBQyxnQ0FBZ0M7WUFDN0M7O2dCQUFLLFNBQVMsRUFBQyxxQ0FBcUM7O2FBRTlDO1lBQ047O2dCQUFLLFNBQVMsRUFBQyxzQ0FBc0M7Y0FDbkQ7O2tCQUFLLFNBQVMsRUFBQywwQ0FBMEM7Z0JBQ3ZEO0FBQ0UsOEJBQVksRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsQUFBQztBQUN2Qyw2QkFBVyxFQUFFLElBQUksQ0FBQyxrQkFBa0IsQUFBQztBQUNyQyxpQ0FBZSxFQUFDLHdCQUF3QjtBQUN4QyxxQkFBRyxFQUFDLFFBQVE7QUFDWixzQkFBSSxFQUFDLElBQUk7a0JBQ1Q7ZUFDRTthQUNGO1dBQ0Y7U0FDRjtRQUNOOztZQUFLLFNBQVMsRUFBQyw2Q0FBNkM7VUFDMUQ7OztZQUNFOzs7Y0FDRTs7O2dCQUNFOztvQkFBSSxTQUFTLEVBQUMscUNBQXFDOztpQkFBVTtnQkFDN0Q7O29CQUFJLFNBQVMsRUFBQyxxQ0FBcUM7O2lCQUFhO2dCQUNoRTs7b0JBQUksU0FBUyxFQUFDLHFDQUFxQzs7aUJBQVk7Z0JBQy9EOztvQkFBSSxTQUFTLEVBQUMscUNBQXFDOztpQkFBWTtnQkFDL0Q7O29CQUFJLFNBQVMsRUFBQyxxQ0FBcUM7O2lCQUFlO2VBQy9EO2NBQ0osSUFBSTthQUNDO1dBQ0Y7U0FDSjtPQUNLLENBQ2I7S0FDSDs7O1NBMUdrQixjQUFjO0dBQVMsb0JBQU0sU0FBUzs7cUJBQXRDLGNBQWMiLCJmaWxlIjoiU2VydmljZU1vbml0b3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSBJdGVtIGZyb20gJy4uLy4uL251Y2xpZGUtcmVtb3RlLWNvbm5lY3Rpb24vbGliL1NlcnZpY2VMb2dnZXInO1xuXG5pbXBvcnQgQXRvbUlucHV0IGZyb20gJy4uLy4uL251Y2xpZGUtdWktYXRvbS1pbnB1dCc7XG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHtSZWFjdH0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuXG5jb25zdCB7UHJvcFR5cGVzfSA9IFJlYWN0O1xuXG50eXBlIFN0YXRlID0ge1xuICBzZXJ2aWNlRmlsdGVyOiBzdHJpbmc7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTZXJ2aWNlTW9uaXRvciBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHN0YXRlOiBTdGF0ZTtcblxuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgIHNlcnZpY2VMb2dnZXI6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgfTtcblxuICBfc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcblxuICBfbmV4dEtleTogbnVtYmVyO1xuICBfaXRlbVRvS2V5OiBXZWFrTWFwPEl0ZW0sIHN0cmluZz47XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IE9iamVjdCkge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLl9uZXh0S2V5ID0gMDtcbiAgICB0aGlzLl9pdGVtVG9LZXkgPSBuZXcgV2Vha01hcCgpO1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBzZXJ2aWNlRmlsdGVyOiAnJyxcbiAgICB9O1xuICAgICh0aGlzOiBhbnkpLl9vbkZpbHRlckRpZENoYW5nZSA9IHRoaXMuX29uRmlsdGVyRGlkQ2hhbmdlLmJpbmQodGhpcyk7XG4gIH1cblxuICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIHRoaXMucHJvcHMuc2VydmljZUxvZ2dlci5vbk5ld0l0ZW0oKGl0ZW06IEl0ZW0pID0+IHRoaXMuZm9yY2VVcGRhdGUoKSksXG4gICAgKTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICB9XG5cbiAgX29uRmlsdGVyRGlkQ2hhbmdlKGZpbHRlclRleHQ6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgc2VydmljZUZpbHRlcjogZmlsdGVyVGV4dCxcbiAgICB9KTtcbiAgfVxuXG4gIC8vIFRPRE8odDg1Nzk2NTQpOiBVc2UgRml4ZWREYXRhVGFibGUuXG4gIC8vIFRPRE8odDg1Nzk2OTUpOiBNYWtlIGl0IHBvc3NpYmxlIHRvIGNsaWNrIG9uIGEgcm93IGFuZCBjb25zb2xlLmRpcigpIHRoZSBhcmd1bWVudHMgc28gdGhhdCB0aGV5XG4gIC8vIGNhbiBiZSBpbnNwZWN0ZWQuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIGNvbnN0IHJvd3MgPSBbXTtcbiAgICBjb25zdCBzZXJ2aWNlRmlsdGVyID0gdGhpcy5zdGF0ZS5zZXJ2aWNlRmlsdGVyLnRvTG93ZXJDYXNlKCk7XG4gICAgZm9yIChjb25zdCBpdGVtIG9mIHRoaXMucHJvcHMuc2VydmljZUxvZ2dlcikge1xuICAgICAgaWYgKGl0ZW0uc2VydmljZS50b0xvd2VyQ2FzZSgpLmluZGV4T2Yoc2VydmljZUZpbHRlcikgPT09IC0xKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBsZXQga2V5ID0gdGhpcy5faXRlbVRvS2V5LmdldChpdGVtKTtcbiAgICAgIGlmICgha2V5KSB7XG4gICAgICAgIGtleSA9IFN0cmluZygrK3RoaXMuX25leHRLZXkpO1xuICAgICAgICB0aGlzLl9pdGVtVG9LZXkuc2V0KGl0ZW0sIGtleSk7XG4gICAgICB9XG5cbiAgICAgIHJvd3MucHVzaChcbiAgICAgICAgPHRyIGtleT17a2V5fT5cbiAgICAgICAgICA8dGQgY2xhc3NOYW1lPVwibnVjbGlkZS1zZXJ2aWNlLW1vbml0b3ItY2VsbFwiPntpdGVtLmRhdGUudG9Mb2NhbGVUaW1lU3RyaW5nKCl9PC90ZD5cbiAgICAgICAgICA8dGQgY2xhc3NOYW1lPVwibnVjbGlkZS1zZXJ2aWNlLW1vbml0b3ItY2VsbFwiPntpdGVtLnNlcnZpY2V9PC90ZD5cbiAgICAgICAgICA8dGQgY2xhc3NOYW1lPVwibnVjbGlkZS1zZXJ2aWNlLW1vbml0b3ItY2VsbFwiPntpdGVtLm1ldGhvZH08L3RkPlxuICAgICAgICAgIDx0ZCBjbGFzc05hbWU9XCJudWNsaWRlLXNlcnZpY2UtbW9uaXRvci1jZWxsXCI+e1N0cmluZyhpdGVtLmlzTG9jYWwpfTwvdGQ+XG4gICAgICAgICAgPHRkIGNsYXNzTmFtZT1cIm51Y2xpZGUtc2VydmljZS1tb25pdG9yLWNlbGxcIj57aXRlbS5hcmdJbmZvfTwvdGQ+XG4gICAgICAgIDwvdHI+XG4gICAgICApO1xuICAgIH1cblxuICAgIC8vIFRPRE8obWJvbGluKTogQ3JlYXRlIGEgcmV2ZXJzZSBpdGVyYXRvciBmb3IgdGhlIENpcmN1bGFyQnVmZmVyLlxuICAgIHJvd3MucmV2ZXJzZSgpO1xuXG4gICAgcmV0dXJuIChcbiAgICAgIDxhdG9tLXBhbmVsIGNsYXNzPVwidG9wIG51Y2xpZGUtc2VydmljZS1tb25pdG9yLXJvb3RcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJwYW5lbC1oZWFkaW5nXCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLXNlcnZpY2UtbW9uaXRvci1oZWFkZXJcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS1zZXJ2aWNlLW1vbml0b3ItbGVmdC1oZWFkZXJcIj5cbiAgICAgICAgICAgICAgTnVjbGlkZSBTZXJ2aWNlIE1vbml0b3JcbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLXNlcnZpY2UtbW9uaXRvci1yaWdodC1oZWFkZXJcIj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLXNlcnZpY2UtbW9uaXRvci1maWx0ZXItY29udGFpbmVyXCI+XG4gICAgICAgICAgICAgICAgPEF0b21JbnB1dFxuICAgICAgICAgICAgICAgICAgaW5pdGlhbFZhbHVlPXt0aGlzLnN0YXRlLnNlcnZpY2VGaWx0ZXJ9XG4gICAgICAgICAgICAgICAgICBvbkRpZENoYW5nZT17dGhpcy5fb25GaWx0ZXJEaWRDaGFuZ2V9XG4gICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlclRleHQ9XCJGaWx0ZXIgYnkgc2VydmljZSBuYW1lXCJcbiAgICAgICAgICAgICAgICAgIHJlZj1cImZpbHRlclwiXG4gICAgICAgICAgICAgICAgICBzaXplPVwic21cIlxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInBhbmVsLWJvZHkgbnVjbGlkZS1zZXJ2aWNlLW1vbml0b3ItY29udGVudHNcIj5cbiAgICAgICAgICA8dGFibGU+XG4gICAgICAgICAgICA8dGJvZHk+XG4gICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICA8dGggY2xhc3NOYW1lPVwibnVjbGlkZS1zZXJ2aWNlLW1vbml0b3ItaGVhZGVyLWNlbGxcIj5UaW1lPC90aD5cbiAgICAgICAgICAgICAgICA8dGggY2xhc3NOYW1lPVwibnVjbGlkZS1zZXJ2aWNlLW1vbml0b3ItaGVhZGVyLWNlbGxcIj5TZXJ2aWNlPC90aD5cbiAgICAgICAgICAgICAgICA8dGggY2xhc3NOYW1lPVwibnVjbGlkZS1zZXJ2aWNlLW1vbml0b3ItaGVhZGVyLWNlbGxcIj5NZXRob2Q8L3RoPlxuICAgICAgICAgICAgICAgIDx0aCBjbGFzc05hbWU9XCJudWNsaWRlLXNlcnZpY2UtbW9uaXRvci1oZWFkZXItY2VsbFwiPkxvY2FsPzwvdGg+XG4gICAgICAgICAgICAgICAgPHRoIGNsYXNzTmFtZT1cIm51Y2xpZGUtc2VydmljZS1tb25pdG9yLWhlYWRlci1jZWxsXCI+QXJndW1lbnRzPC90aD5cbiAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAge3Jvd3N9XG4gICAgICAgICAgICA8L3Rib2R5PlxuICAgICAgICAgIDwvdGFibGU+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9hdG9tLXBhbmVsPlxuICAgICk7XG4gIH1cbn1cbiJdfQ==