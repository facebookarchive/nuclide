Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _reactForAtom = require('react-for-atom');

var _HandlesTableComponent = require('./HandlesTableComponent');

var _HandlesTableComponent2 = _interopRequireDefault(_HandlesTableComponent);

var PropTypes = _reactForAtom.React.PropTypes;

var ActiveHandlesSectionComponent = (function (_React$Component) {
  _inherits(ActiveHandlesSectionComponent, _React$Component);

  function ActiveHandlesSectionComponent() {
    _classCallCheck(this, ActiveHandlesSectionComponent);

    _get(Object.getPrototypeOf(ActiveHandlesSectionComponent.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(ActiveHandlesSectionComponent, [{
    key: 'render',
    value: function render() {
      if (!this.props.activeHandleObjects || this.props.activeHandleObjects.length === 0) {
        return _reactForAtom.React.createElement('div', null);
      }

      var handlesByType = {};
      ActiveHandlesSectionComponent.getTopLevelHandles(this.props.activeHandleObjects).forEach(function (handle) {
        var type = handle.constructor.name.toLowerCase();
        if (type !== 'childprocess' && type !== 'tlssocket') {
          type = 'other';
        }
        if (!handlesByType[type]) {
          handlesByType[type] = [];
        }
        handlesByType[type].push(handle);
      });

      // Note that widthPercentage properties should add up to 90 since the ID column always adds 10.
      return _reactForAtom.React.createElement(
        'div',
        null,
        _reactForAtom.React.createElement(_HandlesTableComponent2['default'], {
          key: 1,
          title: 'Processes',
          handles: handlesByType['childprocess'],
          keyed: function (process) {
            return process.pid;
          },
          columns: [{
            title: 'Name',
            value: function value(process) {
              return _path2['default'].basename(process.spawnfile);
            },
            widthPercentage: 15
          }, {
            title: 'In',
            value: function value(process) {
              return process.stdin && process.stdin.bytesWritten;
            },
            widthPercentage: 5
          }, {
            title: 'Out',
            value: function value(process) {
              return process.stdout && process.stdout.bytesRead;
            },
            widthPercentage: 5
          }, {
            title: 'Err',
            value: function value(process) {
              return process.stderr && process.stderr.bytesRead;
            },
            widthPercentage: 5
          }, {
            title: 'Args',
            value: function value(process) {
              if (process.spawnargs && process.spawnargs.length > 1) {
                return process.spawnargs.slice(1).join(' ');
              }
            },
            widthPercentage: 60
          }]
        }),
        _reactForAtom.React.createElement(_HandlesTableComponent2['default'], {
          key: 2,
          title: 'TLS Sockets',
          handles: handlesByType['tlssocket'],
          keyed: function (socket) {
            return socket.localPort;
          },
          columns: [{
            title: 'Host',
            value: function value(socket) {
              return socket._host || socket.remoteAddress;
            },
            widthPercentage: 70
          }, {
            title: 'Read',
            value: function value(socket) {
              return socket.bytesRead;
            },
            widthPercentage: 10
          }, {
            title: 'Written',
            value: function value(socket) {
              return socket.bytesWritten;
            },
            widthPercentage: 10
          }]
        }),
        _reactForAtom.React.createElement(_HandlesTableComponent2['default'], {
          key: 3,
          title: 'Other handles',
          handles: handlesByType['other'],
          keyed: function (handle, h) {
            return h;
          },
          columns: [{
            title: 'Type',
            value: function value(handle) {
              return handle.constructor.name;
            },
            widthPercentage: 90
          }]
        })
      );
    }
  }], [{
    key: 'getTopLevelHandles',

    // Returns a list of handles which are not children of others (i.e. sockets as process pipes).
    value: function getTopLevelHandles(handles) {
      var topLevelHandles = new Set();
      var seen = new Set();
      handles.forEach(function (handle) {
        if (seen.has(handle)) {
          return;
        }
        seen.add(handle);
        topLevelHandles.add(handle);
        if (handle.constructor.name === 'ChildProcess') {
          seen.add(handle);
          ['stdin', 'stdout', 'stderr', '_channel'].forEach(function (pipe) {
            if (handle[pipe]) {
              seen.add(handle[pipe]);
            }
          });
        }
      });
      return topLevelHandles;
    }
  }, {
    key: 'propTypes',
    value: {
      activeHandleObjects: PropTypes.arrayOf(PropTypes.object).isRequired
    },
    enumerable: true
  }]);

  return ActiveHandlesSectionComponent;
})(_reactForAtom.React.Component);

exports['default'] = ActiveHandlesSectionComponent;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkFjdGl2ZUhhbmRsZXNTZWN0aW9uQ29tcG9uZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7b0JBV2lCLE1BQU07Ozs7NEJBQ0gsZ0JBQWdCOztxQ0FDRix5QkFBeUI7Ozs7SUFFcEQsU0FBUyx1QkFBVCxTQUFTOztJQUVLLDZCQUE2QjtZQUE3Qiw2QkFBNkI7O1dBQTdCLDZCQUE2QjswQkFBN0IsNkJBQTZCOzsrQkFBN0IsNkJBQTZCOzs7ZUFBN0IsNkJBQTZCOztXQTRCMUMsa0JBQWlCO0FBQ3JCLFVBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLG1CQUFtQixJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtBQUNsRixlQUFPLDhDQUFPLENBQUM7T0FDaEI7O0FBRUQsVUFBTSxhQUFhLEdBQUcsRUFBRSxDQUFDO0FBQ3pCLG1DQUE2QixDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxPQUFPLENBQ3RGLFVBQUEsTUFBTSxFQUFJO0FBQ1IsWUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7QUFDakQsWUFBSSxJQUFJLEtBQUssY0FBYyxJQUFJLElBQUksS0FBSyxXQUFXLEVBQUU7QUFDbkQsY0FBSSxHQUFHLE9BQU8sQ0FBQztTQUNoQjtBQUNELFlBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEVBQUU7QUFDeEIsdUJBQWEsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7U0FDMUI7QUFDRCxxQkFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztPQUNsQyxDQUNGLENBQUM7OztBQUdGLGFBQ0U7OztRQUNFO0FBQ0UsYUFBRyxFQUFFLENBQUMsQUFBQztBQUNQLGVBQUssRUFBQyxXQUFXO0FBQ2pC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RyxFQUFFLENBQUM7QUFDL0MsVUFBTSxJQUFpQixHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7QUFDcEMsYUFBTyxDQUFDLE9BQU8sQ0FBQyxVQUFBLE1BQU0sRUFBSTtBQUN4QixZQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUU7QUFDcEIsaUJBQU87U0FDUjtBQUNELFlBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDakIsdUJBQWUsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDNUIsWUFBSSxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksS0FBSyxjQUFjLEVBQUU7QUFDOUMsY0FBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNqQixXQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFVBQVUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFBLElBQUksRUFBSTtBQUN4RCxnQkFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUU7QUFDaEIsa0JBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7YUFDeEI7V0FDRixDQUFDLENBQUM7U0FDSjtPQUNGLENBQUMsQ0FBQztBQUNILGFBQU8sZUFBZSxDQUFDO0tBQ3hCOzs7V0F4QmtCO0FBQ2pCLHlCQUFtQixFQUFFLFNBQVMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFVBQVU7S0FDcEU7Ozs7U0FKa0IsNkJBQTZCO0dBQVMsb0JBQU0sU0FBUzs7cUJBQXJELDZCQUE2QiIsImZpbGUiOiJBY3RpdmVIYW5kbGVzU2VjdGlvbkNvbXBvbmVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHtSZWFjdH0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuaW1wb3J0IEhhbmRsZXNUYWJsZUNvbXBvbmVudCBmcm9tICcuL0hhbmRsZXNUYWJsZUNvbXBvbmVudCc7XG5cbmNvbnN0IHtQcm9wVHlwZXN9ID0gUmVhY3Q7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFjdGl2ZUhhbmRsZXNTZWN0aW9uQ29tcG9uZW50IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblxuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgIGFjdGl2ZUhhbmRsZU9iamVjdHM6IFByb3BUeXBlcy5hcnJheU9mKFByb3BUeXBlcy5vYmplY3QpLmlzUmVxdWlyZWQsXG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIGxpc3Qgb2YgaGFuZGxlcyB3aGljaCBhcmUgbm90IGNoaWxkcmVuIG9mIG90aGVycyAoaS5lLiBzb2NrZXRzIGFzIHByb2Nlc3MgcGlwZXMpLlxuICBzdGF0aWMgZ2V0VG9wTGV2ZWxIYW5kbGVzKGhhbmRsZXM6IEFycmF5PE9iamVjdD4pOiBTZXQ8T2JqZWN0PiB7XG4gICAgY29uc3QgdG9wTGV2ZWxIYW5kbGVzOiBTZXQ8T2JqZWN0PiA9IG5ldyBTZXQoKTtcbiAgICBjb25zdCBzZWVuOiBTZXQ8T2JqZWN0PiA9IG5ldyBTZXQoKTtcbiAgICBoYW5kbGVzLmZvckVhY2goaGFuZGxlID0+IHtcbiAgICAgIGlmIChzZWVuLmhhcyhoYW5kbGUpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHNlZW4uYWRkKGhhbmRsZSk7XG4gICAgICB0b3BMZXZlbEhhbmRsZXMuYWRkKGhhbmRsZSk7XG4gICAgICBpZiAoaGFuZGxlLmNvbnN0cnVjdG9yLm5hbWUgPT09ICdDaGlsZFByb2Nlc3MnKSB7XG4gICAgICAgIHNlZW4uYWRkKGhhbmRsZSk7XG4gICAgICAgIFsnc3RkaW4nLCAnc3Rkb3V0JywgJ3N0ZGVycicsICdfY2hhbm5lbCddLmZvckVhY2gocGlwZSA9PiB7XG4gICAgICAgICAgaWYgKGhhbmRsZVtwaXBlXSkge1xuICAgICAgICAgICAgc2Vlbi5hZGQoaGFuZGxlW3BpcGVdKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiB0b3BMZXZlbEhhbmRsZXM7XG4gIH1cblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICBpZiAoIXRoaXMucHJvcHMuYWN0aXZlSGFuZGxlT2JqZWN0cyB8fCB0aGlzLnByb3BzLmFjdGl2ZUhhbmRsZU9iamVjdHMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gPGRpdiAvPjtcbiAgICB9XG5cbiAgICBjb25zdCBoYW5kbGVzQnlUeXBlID0ge307XG4gICAgQWN0aXZlSGFuZGxlc1NlY3Rpb25Db21wb25lbnQuZ2V0VG9wTGV2ZWxIYW5kbGVzKHRoaXMucHJvcHMuYWN0aXZlSGFuZGxlT2JqZWN0cykuZm9yRWFjaChcbiAgICAgIGhhbmRsZSA9PiB7XG4gICAgICAgIGxldCB0eXBlID0gaGFuZGxlLmNvbnN0cnVjdG9yLm5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgaWYgKHR5cGUgIT09ICdjaGlsZHByb2Nlc3MnICYmIHR5cGUgIT09ICd0bHNzb2NrZXQnKSB7XG4gICAgICAgICAgdHlwZSA9ICdvdGhlcic7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFoYW5kbGVzQnlUeXBlW3R5cGVdKSB7XG4gICAgICAgICAgaGFuZGxlc0J5VHlwZVt0eXBlXSA9IFtdO1xuICAgICAgICB9XG4gICAgICAgIGhhbmRsZXNCeVR5cGVbdHlwZV0ucHVzaChoYW5kbGUpO1xuICAgICAgfVxuICAgICk7XG5cbiAgICAvLyBOb3RlIHRoYXQgd2lkdGhQZXJjZW50YWdlIHByb3BlcnRpZXMgc2hvdWxkIGFkZCB1cCB0byA5MCBzaW5jZSB0aGUgSUQgY29sdW1uIGFsd2F5cyBhZGRzIDEwLlxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2PlxuICAgICAgICA8SGFuZGxlc1RhYmxlQ29tcG9uZW50XG4gICAgICAgICAga2V5PXsxfVxuICAgICAgICAgIHRpdGxlPVwiUHJvY2Vzc2VzXCJcbiAgICAgICAgICBoYW5kbGVzPXtoYW5kbGVzQnlUeXBlWydjaGlsZHByb2Nlc3MnXX1cbiAgICAgICAgICBrZXllZD17cHJvY2VzcyA9PiBwcm9jZXNzLnBpZH1cbiAgICAgICAgICBjb2x1bW5zPXtbe1xuICAgICAgICAgICAgdGl0bGU6ICdOYW1lJyxcbiAgICAgICAgICAgIHZhbHVlOiBwcm9jZXNzID0+IHBhdGguYmFzZW5hbWUocHJvY2Vzcy5zcGF3bmZpbGUpLFxuICAgICAgICAgICAgd2lkdGhQZXJjZW50YWdlOiAxNSxcbiAgICAgICAgICB9LCB7XG4gICAgICAgICAgICB0aXRsZTogJ0luJyxcbiAgICAgICAgICAgIHZhbHVlOiBwcm9jZXNzID0+IHByb2Nlc3Muc3RkaW4gJiYgcHJvY2Vzcy5zdGRpbi5ieXRlc1dyaXR0ZW4sXG4gICAgICAgICAgICB3aWR0aFBlcmNlbnRhZ2U6IDUsXG4gICAgICAgICAgfSwge1xuICAgICAgICAgICAgdGl0bGU6ICdPdXQnLFxuICAgICAgICAgICAgdmFsdWU6IHByb2Nlc3MgPT4gcHJvY2Vzcy5zdGRvdXQgJiYgcHJvY2Vzcy5zdGRvdXQuYnl0ZXNSZWFkLFxuICAgICAgICAgICAgd2lkdGhQZXJjZW50YWdlOiA1LFxuICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgIHRpdGxlOiAnRXJyJyxcbiAgICAgICAgICAgIHZhbHVlOiBwcm9jZXNzID0+IHByb2Nlc3Muc3RkZXJyICYmIHByb2Nlc3Muc3RkZXJyLmJ5dGVzUmVhZCxcbiAgICAgICAgICAgIHdpZHRoUGVyY2VudGFnZTogNSxcbiAgICAgICAgICB9LCB7XG4gICAgICAgICAgICB0aXRsZTogJ0FyZ3MnLFxuICAgICAgICAgICAgdmFsdWU6IHByb2Nlc3MgPT4ge1xuICAgICAgICAgICAgICBpZiAocHJvY2Vzcy5zcGF3bmFyZ3MgJiYgcHJvY2Vzcy5zcGF3bmFyZ3MubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBwcm9jZXNzLnNwYXduYXJncy5zbGljZSgxKS5qb2luKCcgJyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB3aWR0aFBlcmNlbnRhZ2U6IDYwLFxuICAgICAgICAgIH1dfVxuICAgICAgICAvPlxuICAgICAgICA8SGFuZGxlc1RhYmxlQ29tcG9uZW50XG4gICAgICAgICAga2V5PXsyfVxuICAgICAgICAgIHRpdGxlPVwiVExTIFNvY2tldHNcIlxuICAgICAgICAgIGhhbmRsZXM9e2hhbmRsZXNCeVR5cGVbJ3Rsc3NvY2tldCddfVxuICAgICAgICAgIGtleWVkPXtzb2NrZXQgPT4gc29ja2V0LmxvY2FsUG9ydH1cbiAgICAgICAgICBjb2x1bW5zPXtbe1xuICAgICAgICAgICAgdGl0bGU6ICdIb3N0JyxcbiAgICAgICAgICAgIHZhbHVlOiBzb2NrZXQgPT4gc29ja2V0Ll9ob3N0IHx8IHNvY2tldC5yZW1vdGVBZGRyZXNzLFxuICAgICAgICAgICAgd2lkdGhQZXJjZW50YWdlOiA3MCxcbiAgICAgICAgICB9LCB7XG4gICAgICAgICAgICB0aXRsZTogJ1JlYWQnLFxuICAgICAgICAgICAgdmFsdWU6IHNvY2tldCA9PiBzb2NrZXQuYnl0ZXNSZWFkLFxuICAgICAgICAgICAgd2lkdGhQZXJjZW50YWdlOiAxMCxcbiAgICAgICAgICB9LCB7XG4gICAgICAgICAgICB0aXRsZTogJ1dyaXR0ZW4nLFxuICAgICAgICAgICAgdmFsdWU6IHNvY2tldCA9PiBzb2NrZXQuYnl0ZXNXcml0dGVuLFxuICAgICAgICAgICAgd2lkdGhQZXJjZW50YWdlOiAxMCxcbiAgICAgICAgICB9XX1cbiAgICAgICAgLz5cbiAgICAgICAgPEhhbmRsZXNUYWJsZUNvbXBvbmVudFxuICAgICAgICAgIGtleT17M31cbiAgICAgICAgICB0aXRsZT1cIk90aGVyIGhhbmRsZXNcIlxuICAgICAgICAgIGhhbmRsZXM9e2hhbmRsZXNCeVR5cGVbJ290aGVyJ119XG4gICAgICAgICAga2V5ZWQ9eyhoYW5kbGUsIGgpID0+IGh9XG4gICAgICAgICAgY29sdW1ucz17W3tcbiAgICAgICAgICAgIHRpdGxlOiAnVHlwZScsXG4gICAgICAgICAgICB2YWx1ZTogaGFuZGxlID0+IGhhbmRsZS5jb25zdHJ1Y3Rvci5uYW1lLFxuICAgICAgICAgICAgd2lkdGhQZXJjZW50YWdlOiA5MCxcbiAgICAgICAgICB9XX1cbiAgICAgICAgLz5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cbn1cbiJdfQ==