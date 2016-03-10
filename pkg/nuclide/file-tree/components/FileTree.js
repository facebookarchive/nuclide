var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _libFileTreeStore = require('../lib/FileTreeStore');

var _libFileTreeStore2 = _interopRequireDefault(_libFileTreeStore);

var _reactForAtom = require('react-for-atom');

var _RootNodeComponent = require('./RootNodeComponent');

var _RootNodeComponent2 = _interopRequireDefault(_RootNodeComponent);

var _EmptyComponent = require('./EmptyComponent');

var _EmptyComponent2 = _interopRequireDefault(_EmptyComponent);

var _analytics = require('../../analytics');

var _commons = require('../../commons');

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var FileTree = (function (_React$Component) {
  _inherits(FileTree, _React$Component);

  _createClass(FileTree, null, [{
    key: 'trackFirstRender',
    value: (0, _commons.once)(function () {
      var rootKeysLength = _libFileTreeStore2['default'].getInstance().getRootKeys().length;
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
  }]);

  function FileTree(props) {
    _classCallCheck(this, FileTree);

    _get(Object.getPrototypeOf(FileTree.prototype), 'constructor', this).call(this, props);
    this._store = _libFileTreeStore2['default'].getInstance();
  }

  _createClass(FileTree, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      FileTree.trackFirstRender(this);
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps, prevState) {
      if (prevProps.nodeToKeepInView != null) {
        /*
         * Scroll the node into view one final time after being reset to ensure final render is
         * complete before scrolling. Because the node is in `prevProps`, check for its existence
         * before scrolling it.
         */
        var refNode = this.refs[prevProps.nodeToKeepInView.rootKey];
        if (refNode != null) {
          refNode.scrollNodeIntoViewIfNeeded(prevProps.nodeToKeepInView.nodeKey);
        }
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var classes = {
        'nuclide-file-tree': true,
        'focusable-panel': true,
        'tree-view': true,
        'nuclide-file-tree-editing-working-set': this._store.isEditingWorkingSet()
      };

      return _reactForAtom.React.createElement(
        'div',
        { className: (0, _classnames2['default'])(classes), tabIndex: 0 },
        this._renderChildren()
      );
    }
  }, {
    key: '_renderChildren',
    value: function _renderChildren() {
      var workingSet = this._store.getWorkingSet();
      var isEditingWorkingSet = this._store.isEditingWorkingSet();

      var rootKeys = _libFileTreeStore2['default'].getInstance().getRootKeys().filter(function (rK) {
        if (workingSet == null || isEditingWorkingSet) {
          return true;
        }

        return workingSet.containsDir(rK);
      });
      if (rootKeys.length === 0) {
        return _reactForAtom.React.createElement(_EmptyComponent2['default'], null);
      }
      return rootKeys.map(function (rootKey, index) {
        return _reactForAtom.React.createElement(_RootNodeComponent2['default'], {
          key: index.toString(),
          ref: rootKey,
          rootNode: _libFileTreeStore2['default'].getInstance().getRootNode(rootKey),
          rootKey: rootKey
        });
      });
    }
  }]);

  return FileTree;
})(_reactForAtom.React.Component);

module.exports = FileTree;
//# sourceMappingURL=data:application/json;base64,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QUFBQztBQUNiLGtCQUFRLEVBQUUsOEJBQWMsV0FBVyxFQUFFLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxBQUFDO0FBQzNELGlCQUFPLEVBQUUsT0FBTyxBQUFDO1VBQ2pCLENBQ0Y7T0FDSCxDQUFDLENBQUM7S0FDSjs7O1NBcEZHLFFBQVE7R0FBUyxvQkFBTSxTQUFTOztBQXVGdEMsTUFBTSxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUMiLCJmaWxlIjoiRmlsZVRyZWUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7RmlsZVRyZWVOb2RlRGF0YX0gZnJvbSAnLi4vbGliL0ZpbGVUcmVlU3RvcmUnO1xuXG5pbXBvcnQgRmlsZVRyZWVTdG9yZSBmcm9tICcuLi9saWIvRmlsZVRyZWVTdG9yZSc7XG5pbXBvcnQge1JlYWN0fSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQgUm9vdE5vZGVDb21wb25lbnQgZnJvbSAnLi9Sb290Tm9kZUNvbXBvbmVudCc7XG5pbXBvcnQgRW1wdHlDb21wb25lbnQgZnJvbSAnLi9FbXB0eUNvbXBvbmVudCc7XG5pbXBvcnQge3RyYWNrfSBmcm9tICcuLi8uLi9hbmFseXRpY3MnO1xuaW1wb3J0IHtvbmNlfSBmcm9tICcuLi8uLi9jb21tb25zJztcbmltcG9ydCBjbGFzc25hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuXG50eXBlIFByb3BzID0ge1xuICBub2RlVG9LZWVwSW5WaWV3OiA/RmlsZVRyZWVOb2RlRGF0YTtcbn07XG5cbmNsYXNzIEZpbGVUcmVlIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgcHJvcHM6IFByb3BzO1xuICBzdGF0ZTogT2JqZWN0O1xuICBfc3RvcmU6IEZpbGVUcmVlU3RvcmU7XG5cbiAgc3RhdGljIHRyYWNrRmlyc3RSZW5kZXIgPSBvbmNlKCgpID0+IHtcbiAgICBjb25zdCByb290S2V5c0xlbmd0aCA9IEZpbGVUcmVlU3RvcmUuZ2V0SW5zdGFuY2UoKS5nZXRSb290S2V5cygpLmxlbmd0aDtcbiAgICAvLyBXYWl0IHVzaW5nIGBzZXRUaW1lb3V0YCBhbmQgbm90IGBwcm9jZXNzLm5leHRUaWNrYCBvciBgc2V0SW1tZWRpYXRlYFxuICAgIC8vIGJlY2F1c2UgdGhvc2UgcXVldWUgdGFza3MgaW4gdGhlIGN1cnJlbnQgYW5kIG5leHQgdHVybiBvZiB0aGUgZXZlbnQgbG9vcFxuICAgIC8vIHJlc3BlY3RpdmVseS4gU2luY2UgYHNldFRpbWVvdXRgIGdldHMgcHJlZW1wdGVkIGJ5IHRoZW0sIGl0IHdvcmtzIGdyZWF0XG4gICAgLy8gZm9yIGEgbW9yZSByZWFsaXN0aWMgXCJmaXJzdCByZW5kZXJcIi4gTm90ZTogVGhlIHNjaGVkdWxlciBmb3IgcHJvbWlzZXNcbiAgICAvLyAoYFByb21pc2UucmVzb2x2ZSgpLnRoZW5gKSBydW5zIG9uIHRoZSBzYW1lIHF1ZXVlIGFzIGBwcm9jZXNzLm5leHRUaWNrYFxuICAgIC8vIGJ1dCB3aXRoIGEgaGlnaGVyIHByaW9yaXR5LlxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgdHJhY2soJ2ZpbGV0cmVlLWZpcnN0LXJlbmRlcicsIHtcbiAgICAgICAgJ3RpbWUtdG8tcmVuZGVyJzogU3RyaW5nKHByb2Nlc3MudXB0aW1lKCkgKiAxMDAwKSxcbiAgICAgICAgJ3Jvb3Qta2V5cyc6IFN0cmluZyhyb290S2V5c0xlbmd0aCksXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IHZvaWQpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgdGhpcy5fc3RvcmUgPSBGaWxlVHJlZVN0b3JlLmdldEluc3RhbmNlKCk7XG4gIH1cblxuICBjb21wb25lbnREaWRNb3VudCgpOiB2b2lkIHtcbiAgICBGaWxlVHJlZS50cmFja0ZpcnN0UmVuZGVyKHRoaXMpO1xuICB9XG5cbiAgY29tcG9uZW50RGlkVXBkYXRlKHByZXZQcm9wczogUHJvcHMsIHByZXZTdGF0ZTogT2JqZWN0KTogdm9pZCB7XG4gICAgaWYgKHByZXZQcm9wcy5ub2RlVG9LZWVwSW5WaWV3ICE9IG51bGwpIHtcbiAgICAgIC8qXG4gICAgICAgKiBTY3JvbGwgdGhlIG5vZGUgaW50byB2aWV3IG9uZSBmaW5hbCB0aW1lIGFmdGVyIGJlaW5nIHJlc2V0IHRvIGVuc3VyZSBmaW5hbCByZW5kZXIgaXNcbiAgICAgICAqIGNvbXBsZXRlIGJlZm9yZSBzY3JvbGxpbmcuIEJlY2F1c2UgdGhlIG5vZGUgaXMgaW4gYHByZXZQcm9wc2AsIGNoZWNrIGZvciBpdHMgZXhpc3RlbmNlXG4gICAgICAgKiBiZWZvcmUgc2Nyb2xsaW5nIGl0LlxuICAgICAgICovXG4gICAgICBjb25zdCByZWZOb2RlID0gdGhpcy5yZWZzW3ByZXZQcm9wcy5ub2RlVG9LZWVwSW5WaWV3LnJvb3RLZXldO1xuICAgICAgaWYgKHJlZk5vZGUgIT0gbnVsbCkge1xuICAgICAgICByZWZOb2RlLnNjcm9sbE5vZGVJbnRvVmlld0lmTmVlZGVkKHByZXZQcm9wcy5ub2RlVG9LZWVwSW5WaWV3Lm5vZGVLZXkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIGNvbnN0IGNsYXNzZXMgPSB7XG4gICAgICAnbnVjbGlkZS1maWxlLXRyZWUnOiB0cnVlLFxuICAgICAgJ2ZvY3VzYWJsZS1wYW5lbCc6IHRydWUsXG4gICAgICAndHJlZS12aWV3JzogdHJ1ZSxcbiAgICAgICdudWNsaWRlLWZpbGUtdHJlZS1lZGl0aW5nLXdvcmtpbmctc2V0JzogdGhpcy5fc3RvcmUuaXNFZGl0aW5nV29ya2luZ1NldCgpLFxuICAgIH07XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9e2NsYXNzbmFtZXMoY2xhc3Nlcyl9IHRhYkluZGV4PXswfT5cbiAgICAgICAge3RoaXMuX3JlbmRlckNoaWxkcmVuKCl9XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbiAgX3JlbmRlckNoaWxkcmVuKCk6IFJlYWN0RWxlbWVudCB8IEFycmF5PFJlYWN0RWxlbWVudD4ge1xuICAgIGNvbnN0IHdvcmtpbmdTZXQgPSB0aGlzLl9zdG9yZS5nZXRXb3JraW5nU2V0KCk7XG4gICAgY29uc3QgaXNFZGl0aW5nV29ya2luZ1NldCA9IHRoaXMuX3N0b3JlLmlzRWRpdGluZ1dvcmtpbmdTZXQoKTtcblxuICAgIGNvbnN0IHJvb3RLZXlzOiBBcnJheTxzdHJpbmc+ID0gRmlsZVRyZWVTdG9yZS5nZXRJbnN0YW5jZSgpLmdldFJvb3RLZXlzKClcbiAgICAgIC5maWx0ZXIocksgPT4gIHtcbiAgICAgICAgaWYgKHdvcmtpbmdTZXQgPT0gbnVsbCB8fCBpc0VkaXRpbmdXb3JraW5nU2V0KSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gd29ya2luZ1NldC5jb250YWluc0RpcihySyk7XG4gICAgICB9KTtcbiAgICBpZiAocm9vdEtleXMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gPEVtcHR5Q29tcG9uZW50IC8+O1xuICAgIH1cbiAgICByZXR1cm4gcm9vdEtleXMubWFwKChyb290S2V5LCBpbmRleCkgPT4ge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPFJvb3ROb2RlQ29tcG9uZW50XG4gICAgICAgICAga2V5PXtpbmRleC50b1N0cmluZygpfVxuICAgICAgICAgIHJlZj17cm9vdEtleX1cbiAgICAgICAgICByb290Tm9kZT17RmlsZVRyZWVTdG9yZS5nZXRJbnN0YW5jZSgpLmdldFJvb3ROb2RlKHJvb3RLZXkpfVxuICAgICAgICAgIHJvb3RLZXk9e3Jvb3RLZXl9XG4gICAgICAgIC8+XG4gICAgICApO1xuICAgIH0pO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRmlsZVRyZWU7XG4iXX0=