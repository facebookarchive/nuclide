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

var _atom = require('atom');

var _libFileTreeStore = require('../lib/FileTreeStore');

var _libFileTreeStore2 = _interopRequireDefault(_libFileTreeStore);

var _reactForAtom = require('react-for-atom');

var _RootNodeComponent = require('./RootNodeComponent');

var _RootNodeComponent2 = _interopRequireDefault(_RootNodeComponent);

var _EmptyComponent = require('./EmptyComponent');

var _EmptyComponent2 = _interopRequireDefault(_EmptyComponent);

var _analytics = require('../../analytics');

var _commons = require('../../commons');

var PropTypes = _reactForAtom.React.PropTypes;

var FileTree = (function (_React$Component) {
  _inherits(FileTree, _React$Component);

  _createClass(FileTree, null, [{
    key: 'trackFirstRender',
    value: (0, _commons.once)(function (instance) {
      var rootKeysLength = instance.props.store.getRootKeys().length;
      // Wait using `setTimeout` and not `process.nextTick` or `setImmediate`
      // because those queue tasks in the current and next turn of the event loop
      // respectively. Since `setTimeout` gets preempted by them, it works great
      // for a more realistic "first render". Note: The scheduler for promises
      // (`Promise.resolve().then`) runs on the same queue as `process.nextTick`
      // but with a higher priority.
      setTimeout(function () {
        (0, _analytics.track)('filetree-first-render', {
          'time-to-render': String(process.uptime() * 1000),
          'root-keys': String(rootKeysLength)
        });
      });
    }),
    enumerable: true
  }, {
    key: 'propTypes',
    value: {
      store: PropTypes.instanceOf(_libFileTreeStore2['default']).isRequired
    },
    enumerable: true
  }]);

  function FileTree(props) {
    _classCallCheck(this, FileTree);

    _get(Object.getPrototypeOf(FileTree.prototype), 'constructor', this).call(this, props);
    this._subscriptions = new _atom.CompositeDisposable();
    this.state = {
      nodeToKeepInView: null
    };
  }

  _createClass(FileTree, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this = this;

      this._subscriptions.add(this.props.store.subscribe(function () {
        var nodeToKeepInView = _this.props.store.getTrackedNode();
        if (nodeToKeepInView !== _this.state.nodeToKeepInView) {
          /*
           * Store a copy of `nodeToKeepInView` so the Store can update during this component's
           * rendering without wiping out the state of the node that needs to scroll into view.
           * Store events are fired synchronously, which means `getNodeToKeepInView` will return its
           * value for at least one `change` event.
           */
          _this.setState({ nodeToKeepInView: nodeToKeepInView });
        } else {
          // Note: It's safe to call forceUpdate here because the change events are de-bounced.
          _this.forceUpdate();
        }
      }));
      FileTree.trackFirstRender(this);
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps, prevState) {
      if (prevState.nodeToKeepInView != null) {
        /*
         * Scroll the node into view one final time after being reset to ensure final render is
         * complete before scrolling. Because the node is in `prevState`, check for its existence
         * before scrolling it.
         */
        var refNode = this.refs[prevState.nodeToKeepInView.rootKey];
        if (refNode != null) {
          refNode.scrollNodeIntoViewIfNeeded(prevState.nodeToKeepInView.nodeKey);
        }
      }
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this._subscriptions.dispose();
    }
  }, {
    key: 'focus',
    value: function focus() {
      _reactForAtom.ReactDOM.findDOMNode(this).focus();
    }
  }, {
    key: 'hasFocus',
    value: function hasFocus() {
      return document.activeElement === _reactForAtom.ReactDOM.findDOMNode(this);
    }
  }, {
    key: 'render',
    value: function render() {
      return _reactForAtom.React.createElement(
        'div',
        { className: 'nuclide-file-tree focusable-panel tree-view', tabIndex: 0 },
        this._renderChildren()
      );
    }
  }, {
    key: '_renderChildren',
    value: function _renderChildren() {
      var _this2 = this;

      var rootKeys = this.props.store.getRootKeys();
      if (rootKeys.length === 0) {
        return _reactForAtom.React.createElement(_EmptyComponent2['default'], null);
      }
      return rootKeys.map(function (rootKey) {
        return _reactForAtom.React.createElement(_RootNodeComponent2['default'], {
          key: rootKey,
          ref: rootKey,
          rootNode: _this2.props.store.getRootNode(rootKey),
          rootKey: rootKey
        });
      });
    }
  }]);

  return FileTree;
})(_reactForAtom.React.Component);

module.exports = FileTree;
//# sourceMappingURL=data:application/json;base64,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O0FBQ3BELFVBQU0sUUFBdUIsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUMvRCxVQUFJLFFBQVEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO0FBQ3pCLGVBQU8sb0VBQWtCLENBQUM7T0FDM0I7QUFDRCxhQUFPLFFBQVEsQ0FBQyxHQUFHLENBQUMsVUFBQyxPQUFPLEVBQUs7QUFDL0IsZUFDRTtBQUNFLGFBQUcsRUFBRSxPQUFPLEFBQUM7QUFDYixhQUFHLEVBQUUsT0FBTyxBQUFDO0FBQ2Isa0JBQVEsRUFBRSxPQUFLLEtBQUssQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxBQUFDO0FBQ2hELGlCQUFPLEVBQUUsT0FBTyxBQUFDO1VBQ2pCLENBQ0Y7T0FDSCxDQUFDLENBQUM7S0FDSjs7O1NBckdHLFFBQVE7R0FBUyxvQkFBTSxTQUFTOztBQXdHdEMsTUFBTSxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUMiLCJmaWxlIjoiRmlsZVRyZWUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IEZpbGVUcmVlU3RvcmUgZnJvbSAnLi4vbGliL0ZpbGVUcmVlU3RvcmUnO1xuaW1wb3J0IHtcbiAgUmVhY3QsXG4gIFJlYWN0RE9NLFxufSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQgUm9vdE5vZGVDb21wb25lbnQgZnJvbSAnLi9Sb290Tm9kZUNvbXBvbmVudCc7XG5pbXBvcnQgRW1wdHlDb21wb25lbnQgZnJvbSAnLi9FbXB0eUNvbXBvbmVudCc7XG5pbXBvcnQge3RyYWNrfSBmcm9tICcuLi8uLi9hbmFseXRpY3MnO1xuaW1wb3J0IHtvbmNlfSBmcm9tICcuLi8uLi9jb21tb25zJztcblxuY29uc3Qge1Byb3BUeXBlc30gPSBSZWFjdDtcblxuY2xhc3MgRmlsZVRyZWUgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBfc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcblxuICBzdGF0aWMgdHJhY2tGaXJzdFJlbmRlciA9IG9uY2UoaW5zdGFuY2UgPT4ge1xuICAgIGNvbnN0IHJvb3RLZXlzTGVuZ3RoID0gaW5zdGFuY2UucHJvcHMuc3RvcmUuZ2V0Um9vdEtleXMoKS5sZW5ndGg7XG4gICAgLy8gV2FpdCB1c2luZyBgc2V0VGltZW91dGAgYW5kIG5vdCBgcHJvY2Vzcy5uZXh0VGlja2Agb3IgYHNldEltbWVkaWF0ZWBcbiAgICAvLyBiZWNhdXNlIHRob3NlIHF1ZXVlIHRhc2tzIGluIHRoZSBjdXJyZW50IGFuZCBuZXh0IHR1cm4gb2YgdGhlIGV2ZW50IGxvb3BcbiAgICAvLyByZXNwZWN0aXZlbHkuIFNpbmNlIGBzZXRUaW1lb3V0YCBnZXRzIHByZWVtcHRlZCBieSB0aGVtLCBpdCB3b3JrcyBncmVhdFxuICAgIC8vIGZvciBhIG1vcmUgcmVhbGlzdGljIFwiZmlyc3QgcmVuZGVyXCIuIE5vdGU6IFRoZSBzY2hlZHVsZXIgZm9yIHByb21pc2VzXG4gICAgLy8gKGBQcm9taXNlLnJlc29sdmUoKS50aGVuYCkgcnVucyBvbiB0aGUgc2FtZSBxdWV1ZSBhcyBgcHJvY2Vzcy5uZXh0VGlja2BcbiAgICAvLyBidXQgd2l0aCBhIGhpZ2hlciBwcmlvcml0eS5cbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHRyYWNrKCdmaWxldHJlZS1maXJzdC1yZW5kZXInLCB7XG4gICAgICAgICd0aW1lLXRvLXJlbmRlcic6IFN0cmluZyhwcm9jZXNzLnVwdGltZSgpICogMTAwMCksXG4gICAgICAgICdyb290LWtleXMnOiBTdHJpbmcocm9vdEtleXNMZW5ndGgpLFxuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgc3RvcmU6IFByb3BUeXBlcy5pbnN0YW5jZU9mKEZpbGVUcmVlU3RvcmUpLmlzUmVxdWlyZWQsXG4gIH07XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IE9iamVjdCkge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgbm9kZVRvS2VlcEluVmlldzogbnVsbCxcbiAgICB9O1xuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKTogdm9pZCB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICB0aGlzLnByb3BzLnN0b3JlLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgIGNvbnN0IG5vZGVUb0tlZXBJblZpZXcgPSB0aGlzLnByb3BzLnN0b3JlLmdldFRyYWNrZWROb2RlKCk7XG4gICAgICAgIGlmIChub2RlVG9LZWVwSW5WaWV3ICE9PSB0aGlzLnN0YXRlLm5vZGVUb0tlZXBJblZpZXcpIHtcbiAgICAgICAgICAvKlxuICAgICAgICAgICAqIFN0b3JlIGEgY29weSBvZiBgbm9kZVRvS2VlcEluVmlld2Agc28gdGhlIFN0b3JlIGNhbiB1cGRhdGUgZHVyaW5nIHRoaXMgY29tcG9uZW50J3NcbiAgICAgICAgICAgKiByZW5kZXJpbmcgd2l0aG91dCB3aXBpbmcgb3V0IHRoZSBzdGF0ZSBvZiB0aGUgbm9kZSB0aGF0IG5lZWRzIHRvIHNjcm9sbCBpbnRvIHZpZXcuXG4gICAgICAgICAgICogU3RvcmUgZXZlbnRzIGFyZSBmaXJlZCBzeW5jaHJvbm91c2x5LCB3aGljaCBtZWFucyBgZ2V0Tm9kZVRvS2VlcEluVmlld2Agd2lsbCByZXR1cm4gaXRzXG4gICAgICAgICAgICogdmFsdWUgZm9yIGF0IGxlYXN0IG9uZSBgY2hhbmdlYCBldmVudC5cbiAgICAgICAgICAgKi9cbiAgICAgICAgICB0aGlzLnNldFN0YXRlKHtub2RlVG9LZWVwSW5WaWV3fSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gTm90ZTogSXQncyBzYWZlIHRvIGNhbGwgZm9yY2VVcGRhdGUgaGVyZSBiZWNhdXNlIHRoZSBjaGFuZ2UgZXZlbnRzIGFyZSBkZS1ib3VuY2VkLlxuICAgICAgICAgIHRoaXMuZm9yY2VVcGRhdGUoKTtcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICApO1xuICAgIEZpbGVUcmVlLnRyYWNrRmlyc3RSZW5kZXIodGhpcyk7XG4gIH1cblxuICBjb21wb25lbnREaWRVcGRhdGUocHJldlByb3BzOiBPYmplY3QsIHByZXZTdGF0ZTogT2JqZWN0KTogdm9pZCB7XG4gICAgaWYgKHByZXZTdGF0ZS5ub2RlVG9LZWVwSW5WaWV3ICE9IG51bGwpIHtcbiAgICAgIC8qXG4gICAgICAgKiBTY3JvbGwgdGhlIG5vZGUgaW50byB2aWV3IG9uZSBmaW5hbCB0aW1lIGFmdGVyIGJlaW5nIHJlc2V0IHRvIGVuc3VyZSBmaW5hbCByZW5kZXIgaXNcbiAgICAgICAqIGNvbXBsZXRlIGJlZm9yZSBzY3JvbGxpbmcuIEJlY2F1c2UgdGhlIG5vZGUgaXMgaW4gYHByZXZTdGF0ZWAsIGNoZWNrIGZvciBpdHMgZXhpc3RlbmNlXG4gICAgICAgKiBiZWZvcmUgc2Nyb2xsaW5nIGl0LlxuICAgICAgICovXG4gICAgICBjb25zdCByZWZOb2RlID0gdGhpcy5yZWZzW3ByZXZTdGF0ZS5ub2RlVG9LZWVwSW5WaWV3LnJvb3RLZXldO1xuICAgICAgaWYgKHJlZk5vZGUgIT0gbnVsbCkge1xuICAgICAgICByZWZOb2RlLnNjcm9sbE5vZGVJbnRvVmlld0lmTmVlZGVkKHByZXZTdGF0ZS5ub2RlVG9LZWVwSW5WaWV3Lm5vZGVLZXkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCk6IHZvaWQge1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICB9XG5cbiAgZm9jdXMoKTogdm9pZCB7XG4gICAgUmVhY3RET00uZmluZERPTU5vZGUodGhpcykuZm9jdXMoKTtcbiAgfVxuXG4gIGhhc0ZvY3VzKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBkb2N1bWVudC5hY3RpdmVFbGVtZW50ID09PSBSZWFjdERPTS5maW5kRE9NTm9kZSh0aGlzKTtcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cIm51Y2xpZGUtZmlsZS10cmVlIGZvY3VzYWJsZS1wYW5lbCB0cmVlLXZpZXdcIiB0YWJJbmRleD17MH0+XG4gICAgICAgIHt0aGlzLl9yZW5kZXJDaGlsZHJlbigpfVxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIF9yZW5kZXJDaGlsZHJlbigpOiBSZWFjdEVsZW1lbnQgfCBBcnJheTxSZWFjdEVsZW1lbnQ+IHtcbiAgICBjb25zdCByb290S2V5czogQXJyYXk8c3RyaW5nPiA9IHRoaXMucHJvcHMuc3RvcmUuZ2V0Um9vdEtleXMoKTtcbiAgICBpZiAocm9vdEtleXMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gPEVtcHR5Q29tcG9uZW50IC8+O1xuICAgIH1cbiAgICByZXR1cm4gcm9vdEtleXMubWFwKChyb290S2V5KSA9PiB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8Um9vdE5vZGVDb21wb25lbnRcbiAgICAgICAgICBrZXk9e3Jvb3RLZXl9XG4gICAgICAgICAgcmVmPXtyb290S2V5fVxuICAgICAgICAgIHJvb3ROb2RlPXt0aGlzLnByb3BzLnN0b3JlLmdldFJvb3ROb2RlKHJvb3RLZXkpfVxuICAgICAgICAgIHJvb3RLZXk9e3Jvb3RLZXl9XG4gICAgICAgIC8+XG4gICAgICApO1xuICAgIH0pO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRmlsZVRyZWU7XG4iXX0=