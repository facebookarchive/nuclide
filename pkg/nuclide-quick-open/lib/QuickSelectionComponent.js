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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _SearchResultManager = require('./SearchResultManager');

var _SearchResultManager2 = _interopRequireDefault(_SearchResultManager);

var AtomInput = require('../../nuclide-ui-atom-input');

var _require = require('atom');

var CompositeDisposable = _require.CompositeDisposable;
var Emitter = _require.Emitter;

var _require2 = require('../../nuclide-commons');

var debounce = _require2.debounce;
var object = _require2.object;

var _require3 = require('react-for-atom');

var React = _require3.React;
var ReactDOM = _require3.ReactDOM;

var searchResultManager = _SearchResultManager2['default'].getInstance();
var NuclideTabs = require('../../nuclide-ui-tabs');
var PropTypes = React.PropTypes;

var classnames = require('classnames');

var _require4 = require('./searchResultHelpers');

var filterEmptyResults = _require4.filterEmptyResults;

/**
 * Determine what the applicable shortcut for a given action is within this component's context.
 * For example, this will return different keybindings on windows vs linux.
 */
function _findKeybindingForAction(action, target) {
  var _require5 = require('../../nuclide-keystroke-label');

  var humanizeKeystroke = _require5.humanizeKeystroke;

  var matchingKeyBindings = atom.keymaps.findKeyBindings({
    command: action,
    target: target
  });
  var keystroke = matchingKeyBindings.length && matchingKeyBindings[0].keystrokes || '';
  return humanizeKeystroke(keystroke);
}

var QuickSelectionComponent = (function (_React$Component) {
  _inherits(QuickSelectionComponent, _React$Component);

  function QuickSelectionComponent(props) {
    var _this = this;

    _classCallCheck(this, QuickSelectionComponent);

    _get(Object.getPrototypeOf(QuickSelectionComponent.prototype), 'constructor', this).call(this, props);
    this._emitter = new Emitter();
    this._subscriptions = new CompositeDisposable();
    this._boundSelect = function () {
      return _this.select();
    };
    this._boundHandleTabChange = function (tab) {
      return _this._handleTabChange(tab);
    };
    this.state = {
      activeTab: searchResultManager.getProviderByName(searchResultManager.getActiveProviderName()),
      // treated as immutable
      resultsByService: {},
      renderableProviders: searchResultManager.getRenderableProviders(),
      selectedService: '',
      selectedDirectory: '',
      selectedItemIndex: -1,
      hasUserSelection: false
    };
    this.handleProvidersChange = this.handleProvidersChange.bind(this);
    this.handleResultsChange = this.handleResultsChange.bind(this);
  }

  _createClass(QuickSelectionComponent, [{
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      var _this2 = this;

      if (nextProps.activeProvider !== this.props.activeProvider) {
        if (nextProps.activeProvider) {
          (function () {
            _this2._getTextEditor().setPlaceholderText(nextProps.activeProvider.prompt);
            var newResults = {};
            _this2.setState({
              activeTab: nextProps.activeProvider || _this2.state.activeTab,
              resultsByService: newResults
            }, function () {
              setImmediate(function () {
                return _this2.setQuery(_this2.refs['queryInput'].getText());
              });
              _this2._updateQueryHandler();
              _this2._emitter.emit('items-changed', newResults);
            });
          })();
        }
      }
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps, prevState) {
      if (prevState.resultsByService !== this.state.resultsByService) {
        this._emitter.emit('items-changed', this.state.resultsByService);
      }

      if (prevState.selectedItemIndex !== this.state.selectedItemIndex || prevState.selectedService !== this.state.selectedService || prevState.selectedDirectory !== this.state.selectedDirectory) {
        this._updateScrollPosition();
      }
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this3 = this;

      this._modalNode = ReactDOM.findDOMNode(this);
      this._subscriptions.add(atom.commands.add(this._modalNode, 'core:move-to-bottom', this.handleMoveToBottom.bind(this)), atom.commands.add(this._modalNode, 'core:move-to-top', this.handleMoveToTop.bind(this)), atom.commands.add(this._modalNode, 'core:move-down', this.handleMoveDown.bind(this)), atom.commands.add(this._modalNode, 'core:move-up', this.handleMoveUp.bind(this)), atom.commands.add(this._modalNode, 'core:confirm', this.select.bind(this)));

      var inputTextEditor = this.getInputTextEditor();
      this._subscriptions.add(searchResultManager.on(searchResultManager.PROVIDERS_CHANGED, this.handleProvidersChange), searchResultManager.on(searchResultManager.RESULTS_CHANGED, this.handleResultsChange));

      this._updateQueryHandler();
      inputTextEditor.getModel().onDidChange(function () {
        return _this3._handleTextInputChange();
      });
      this.clear();
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this._emitter.dispose();
      this._subscriptions.dispose();
    }
  }, {
    key: 'handleMoveToBottom',
    value: function handleMoveToBottom() {
      this.moveSelectionToBottom();
      this.onUserDidChangeSelection();
    }
  }, {
    key: 'handleMoveToTop',
    value: function handleMoveToTop() {
      this.moveSelectionToTop();
      this.onUserDidChangeSelection();
    }
  }, {
    key: 'handleMoveDown',
    value: function handleMoveDown() {
      this.moveSelectionDown();
      this.onUserDidChangeSelection();
    }
  }, {
    key: 'handleMoveUp',
    value: function handleMoveUp() {
      this.moveSelectionUp();
      this.onUserDidChangeSelection();
    }
  }, {
    key: 'onCancellation',
    value: function onCancellation(callback) {
      return this._emitter.on('canceled', callback);
    }
  }, {
    key: 'onSelection',
    value: function onSelection(callback) {
      return this._emitter.on('selected', callback);
    }
  }, {
    key: 'onSelectionChanged',
    value: function onSelectionChanged(callback) {
      return this._emitter.on('selection-changed', callback);
    }
  }, {
    key: 'onItemsChanged',
    value: function onItemsChanged(callback) {
      return this._emitter.on('items-changed', callback);
    }
  }, {
    key: '_updateQueryHandler',
    value: function _updateQueryHandler() {
      var _this4 = this;

      this._debouncedQueryHandler = debounce(function () {
        return _this4.setKeyboardQuery(_this4.getInputTextEditor().getModel().getText());
      }, this.getProvider().debounceDelay || 0, false);
    }
  }, {
    key: '_handleTextInputChange',
    value: function _handleTextInputChange() {
      this._debouncedQueryHandler();
    }
  }, {
    key: 'handleResultsChange',
    value: function handleResultsChange() {
      this._updateResults(this.props.activeProvider.name);
    }
  }, {
    key: '_updateResults',
    value: function _updateResults(activeProviderName) {
      var _this5 = this;

      var updatedResults = searchResultManager.getResults(this.refs['queryInput'].getText(), activeProviderName);
      this.setState({
        resultsByService: updatedResults
      }, function () {
        if (!_this5.state.hasUserSelection) {
          _this5.moveSelectionToTop();
        }
      });
    }
  }, {
    key: 'handleProvidersChange',
    value: function handleProvidersChange() {
      var renderableProviders = searchResultManager.getRenderableProviders();
      var activeProviderName = searchResultManager.getActiveProviderName();
      this.setState({
        renderableProviders: renderableProviders,
        activeProviderName: activeProviderName
      });
      this._updateResults(activeProviderName);
    }
  }, {
    key: 'select',
    value: function select() {
      var selectedItem = this.getSelectedItem();
      if (!selectedItem) {
        this.cancel();
      } else {
        this._emitter.emit('selected', selectedItem);
      }
    }
  }, {
    key: 'onUserDidChangeSelection',
    value: function onUserDidChangeSelection() {
      this.setState({
        hasUserSelection: true
      });
    }
  }, {
    key: 'cancel',
    value: function cancel() {
      this._emitter.emit('canceled');
    }
  }, {
    key: 'clearSelection',
    value: function clearSelection() {
      this.setSelectedIndex('', '', -1);
    }
  }, {
    key: '_getCurrentResultContext',
    value: function _getCurrentResultContext() {
      var nonEmptyResults = filterEmptyResults(this.state.resultsByService);
      var serviceNames = Object.keys(nonEmptyResults);
      var currentServiceIndex = serviceNames.indexOf(this.state.selectedService);
      var currentService = nonEmptyResults[this.state.selectedService];

      if (!currentService) {
        return null;
      }

      var directoryNames = Object.keys(currentService.results);
      var currentDirectoryIndex = directoryNames.indexOf(this.state.selectedDirectory);
      var currentDirectory = currentService.results[this.state.selectedDirectory];

      if (!currentDirectory || !currentDirectory.results) {
        return null;
      }

      return {
        nonEmptyResults: nonEmptyResults,
        serviceNames: serviceNames,
        currentServiceIndex: currentServiceIndex,
        currentService: currentService,
        directoryNames: directoryNames,
        currentDirectoryIndex: currentDirectoryIndex,
        currentDirectory: currentDirectory
      };
    }
  }, {
    key: 'moveSelectionDown',
    value: function moveSelectionDown() {
      var context = this._getCurrentResultContext();
      if (!context) {
        this.moveSelectionToTop();
        return;
      }

      if (this.state.selectedItemIndex < context.currentDirectory.results.length - 1) {
        // only bump the index if remaining in current directory
        this.setSelectedIndex(this.state.selectedService, this.state.selectedDirectory, this.state.selectedItemIndex + 1);
      } else {
        // otherwise go to next directory...
        if (context.currentDirectoryIndex < context.directoryNames.length - 1) {
          this.setSelectedIndex(this.state.selectedService, context.directoryNames[context.currentDirectoryIndex + 1], 0);
        } else {
          // ...or the next service...
          if (context.currentServiceIndex < context.serviceNames.length - 1) {
            var newServiceName = context.serviceNames[context.currentServiceIndex + 1];
            var newDirectoryName = Object.keys(context.nonEmptyResults[newServiceName].results).shift();
            this.setSelectedIndex(newServiceName, newDirectoryName, 0);
          } else {
            // ...or wrap around to the very top
            this.moveSelectionToTop();
          }
        }
      }
    }
  }, {
    key: 'moveSelectionUp',
    value: function moveSelectionUp() {
      var context = this._getCurrentResultContext();
      if (!context) {
        this.moveSelectionToBottom();
        return;
      }

      if (this.state.selectedItemIndex > 0) {
        // only decrease the index if remaining in current directory
        this.setSelectedIndex(this.state.selectedService, this.state.selectedDirectory, this.state.selectedItemIndex - 1);
      } else {
        // otherwise, go to the previous directory...
        if (context.currentDirectoryIndex > 0) {
          this.setSelectedIndex(this.state.selectedService, context.directoryNames[context.currentDirectoryIndex - 1], context.currentService.results[context.directoryNames[context.currentDirectoryIndex - 1]].results.length - 1);
        } else {
          // ...or the previous service...
          if (context.currentServiceIndex > 0) {
            var newServiceName = context.serviceNames[context.currentServiceIndex - 1];
            var newDirectoryName = Object.keys(context.nonEmptyResults[newServiceName].results).pop();
            if (newDirectoryName == null) {
              return;
            }
            var resultsForDirectory = context.nonEmptyResults[newServiceName].results[newDirectoryName];
            if (resultsForDirectory == null || resultsForDirectory.results == null) {
              return;
            }
            this.setSelectedIndex(newServiceName, newDirectoryName, resultsForDirectory.results.length - 1);
          } else {
            // ...or wrap around to the very bottom
            this.moveSelectionToBottom();
          }
        }
      }
    }

    // Update the scroll position of the list view to ensure the selected item is visible.
  }, {
    key: '_updateScrollPosition',
    value: function _updateScrollPosition() {
      if (!(this.refs && this.refs['selectionList'])) {
        return;
      }
      var listNode = ReactDOM.findDOMNode(this.refs['selectionList']);
      var selectedNode = listNode.getElementsByClassName('selected')[0];
      // false is passed for @centerIfNeeded parameter, which defaults to true.
      // Passing false causes the minimum necessary scroll to occur, so the selection sticks to the
      // top/bottom.
      if (selectedNode) {
        selectedNode.scrollIntoViewIfNeeded(false);
      }
    }
  }, {
    key: 'moveSelectionToBottom',
    value: function moveSelectionToBottom() {
      var bottom = this._getOuterResults(Array.prototype.pop);
      if (!bottom) {
        return;
      }
      this.setSelectedIndex(bottom.serviceName, bottom.directoryName, bottom.results.length - 1);
    }
  }, {
    key: 'moveSelectionToTop',
    value: function moveSelectionToTop() {
      var top = this._getOuterResults(Array.prototype.shift);
      if (!top) {
        return;
      }
      this.setSelectedIndex(top.serviceName, top.directoryName, 0);
    }
  }, {
    key: '_getOuterResults',
    value: function _getOuterResults(arrayOperation) {
      var nonEmptyResults = filterEmptyResults(this.state.resultsByService);
      var serviceName = arrayOperation.call(Object.keys(nonEmptyResults));
      if (!serviceName) {
        return null;
      }
      var service = nonEmptyResults[serviceName];
      var directoryName = arrayOperation.call(Object.keys(service.results));
      return {
        serviceName: serviceName,
        directoryName: directoryName,
        results: nonEmptyResults[serviceName].results[directoryName].results
      };
    }
  }, {
    key: 'getSelectedItem',
    value: function getSelectedItem() {
      return this.getItemAtIndex(this.state.selectedService, this.state.selectedDirectory, this.state.selectedItemIndex);
    }
  }, {
    key: 'getItemAtIndex',
    value: function getItemAtIndex(serviceName, directory, itemIndex) {
      if (itemIndex === -1 || !this.state.resultsByService[serviceName] || !this.state.resultsByService[serviceName].results[directory] || !this.state.resultsByService[serviceName].results[directory].results[itemIndex]) {
        return null;
      }
      return this.state.resultsByService[serviceName].results[directory].results[itemIndex];
    }
  }, {
    key: 'componentForItem',
    value: function componentForItem(item, serviceName, dirName) {
      return searchResultManager.getRendererForProvider(serviceName)(item, serviceName, dirName);
    }
  }, {
    key: 'getSelectedIndex',
    value: function getSelectedIndex() {
      return {
        selectedDirectory: this.state.selectedDirectory,
        selectedService: this.state.selectedService,
        selectedItemIndex: this.state.selectedItemIndex
      };
    }
  }, {
    key: 'setSelectedIndex',
    value: function setSelectedIndex(service, directory, itemIndex) {
      var _this6 = this;

      this.setState({
        selectedService: service,
        selectedDirectory: directory,
        selectedItemIndex: itemIndex
      }, function () {
        _this6._emitter.emit('selection-changed', _this6.getSelectedIndex());
        _this6.onUserDidChangeSelection();
      });
    }
  }, {
    key: 'resetSelection',
    value: function resetSelection() {
      this.setState({
        selectedService: '',
        selectedDirectory: '',
        selectedItemIndex: -1,
        hasUserSelection: false
      });
    }
  }, {
    key: 'setKeyboardQuery',
    value: function setKeyboardQuery(query) {
      this.resetSelection();
      this.setQuery(query);
    }
  }, {
    key: 'setQuery',
    value: function setQuery(query) {
      require('./QuickSelectionActions').query(query);
    }
  }, {
    key: 'getProvider',
    value: function getProvider() {
      return this.props.activeProvider;
    }
  }, {
    key: 'getInputTextEditor',
    value: function getInputTextEditor() {
      return ReactDOM.findDOMNode(this.refs['queryInput']);
    }
  }, {
    key: 'clear',
    value: function clear() {
      this.getInputTextEditor().getModel().setText('');
      this.clearSelection();
    }
  }, {
    key: 'focus',
    value: function focus() {
      this.getInputTextEditor().focus();
    }
  }, {
    key: 'blur',
    value: function blur() {
      this.getInputTextEditor().blur();
    }
  }, {
    key: 'setInputValue',
    value: function setInputValue(value) {
      this._getTextEditor().setText(value);
    }
  }, {
    key: 'selectInput',
    value: function selectInput() {
      this._getTextEditor().selectAll();
    }
  }, {
    key: '_getTextEditor',
    value: function _getTextEditor() {
      return this.refs['queryInput'].getTextEditor();
    }

    /**
     * @param newTab is actually a ProviderSpec plus the `name` and `tabContent` properties added by
     *     _renderTabs(), which created the tab object in the first place.
     */
  }, {
    key: '_handleTabChange',
    value: function _handleTabChange(newTab) {
      var providerName = newTab.name;
      if (providerName !== this.props.activeProvider.name) {
        if (this.props.onProviderChange) {
          this.props.onProviderChange(providerName);
        }
        this._emitter.emit('active-provider-changed', providerName);
      }
      this.refs['queryInput'].focus();
    }
  }, {
    key: '_renderTabs',
    value: function _renderTabs() {
      var _this7 = this;

      var tabs = this.state.renderableProviders.map(function (tab) {
        var keyBinding = null; //TODO
        var humanizedKeybinding = _findKeybindingForAction(tab.action || '', _this7._modalNode);
        if (humanizedKeybinding !== '') {
          keyBinding = React.createElement(
            'kbd',
            { className: 'key-binding' },
            humanizedKeybinding
          );
        }
        return _extends({}, tab, {
          name: tab.name,
          tabContent: React.createElement(
            'span',
            null,
            tab.title,
            keyBinding
          )
        });
      });
      return React.createElement(
        'div',
        { className: 'omnisearch-tabs' },
        React.createElement(NuclideTabs, {
          tabs: tabs,
          activeTabName: this.state.activeTab.name,
          onActiveTabChange: this._boundHandleTabChange
        })
      );
    }
  }, {
    key: '_renderEmptyMessage',
    value: function _renderEmptyMessage(message) {
      return React.createElement(
        'ul',
        { className: 'background-message centered' },
        React.createElement(
          'li',
          null,
          message
        )
      );
    }
  }, {
    key: '_hasNoResults',
    value: function _hasNoResults() {
      for (var serviceName in this.state.resultsByService) {
        var service = this.state.resultsByService[serviceName];
        for (var dirName in service) {
          var _results = service[dirName];
          if (!_results.loading && _results.results.length > 0) {
            return false;
          }
        }
      }
      return true;
    }
  }, {
    key: 'render',
    value: function render() {
      var _this8 = this;

      var numTotalResultsRendered = 0;
      var isOmniSearchActive = this.state.activeTab.name === 'OmniSearchResultProvider';
      var numQueriesOutstanding = 0;
      var serviceNames = Object.keys(this.state.resultsByService);
      var services = serviceNames.map(function (serviceName) {
        var numResultsForService = 0;
        var directories = _this8.state.resultsByService[serviceName].results;
        var serviceTitle = _this8.state.resultsByService[serviceName].title;
        var directoryNames = Object.keys(directories);
        var directoriesForService = directoryNames.map(function (dirName) {
          var resultsForDirectory = directories[dirName];
          var message = null;
          if (resultsForDirectory.loading) {
            numQueriesOutstanding++;
            if (!isOmniSearchActive) {
              numTotalResultsRendered++;
              message = React.createElement(
                'span',
                null,
                React.createElement('span', { className: 'loading loading-spinner-tiny inline-block' }),
                'Loading...'
              );
            }
          } else if (resultsForDirectory.error && !isOmniSearchActive) {
            message = React.createElement(
              'span',
              null,
              React.createElement('span', { className: 'icon icon-circle-slash' }),
              'Error: ',
              React.createElement(
                'pre',
                null,
                resultsForDirectory.error
              )
            );
          } else if (resultsForDirectory.results.length === 0 && !isOmniSearchActive) {
            message = React.createElement(
              'span',
              null,
              React.createElement('span', { className: 'icon icon-x' }),
              'No results'
            );
          }
          var itemComponents = resultsForDirectory.results.map(function (item, itemIndex) {
            numResultsForService++;
            numTotalResultsRendered++;
            var isSelected = serviceName === _this8.state.selectedService && dirName === _this8.state.selectedDirectory && itemIndex === _this8.state.selectedItemIndex;
            return React.createElement(
              'li',
              {
                className: classnames({
                  'quick-open-result-item': true,
                  'list-item': true,
                  selected: isSelected
                }),
                key: serviceName + dirName + itemIndex,
                onMouseDown: _this8._boundSelect,
                onMouseEnter: _this8.setSelectedIndex.bind(_this8, serviceName, dirName, itemIndex) },
              _this8.componentForItem(item, serviceName, dirName)
            );
          });
          var directoryLabel = null;
          //hide folders if only 1 level would be shown, or if no results were found
          var showDirectories = directoryNames.length > 1 && (!isOmniSearchActive || resultsForDirectory.results.length > 0);
          if (showDirectories) {
            directoryLabel = React.createElement(
              'div',
              { className: 'list-item' },
              React.createElement(
                'span',
                { className: 'icon icon-file-directory' },
                dirName
              )
            );
          }
          return React.createElement(
            'li',
            { className: classnames({ 'list-nested-item': showDirectories }), key: dirName },
            directoryLabel,
            message,
            React.createElement(
              'ul',
              { className: 'list-tree' },
              itemComponents
            )
          );
        });
        var serviceLabel = null;
        if (isOmniSearchActive && numResultsForService > 0) {
          serviceLabel = React.createElement(
            'div',
            { className: 'list-item' },
            React.createElement(
              'span',
              { className: 'icon icon-gear' },
              serviceTitle
            )
          );
          return React.createElement(
            'li',
            { className: 'list-nested-item', key: serviceName },
            serviceLabel,
            React.createElement(
              'ul',
              { className: 'list-tree' },
              directoriesForService
            )
          );
        }
        return directoriesForService;
      });
      var noResultsMessage = null;
      if (object.isEmpty(this.state.resultsByService)) {
        noResultsMessage = this._renderEmptyMessage('Search away!');
      } else if (numTotalResultsRendered === 0) {
        noResultsMessage = this._renderEmptyMessage(React.createElement(
          'span',
          null,
          '¯\\_(ツ)_/¯',
          React.createElement('br', null),
          'No results'
        ));
      }
      var currentProvider = this.getProvider();
      var promptText = currentProvider && currentProvider.prompt || '';
      var omniSearchStatus = null;
      if (isOmniSearchActive && numQueriesOutstanding > 0) {
        omniSearchStatus = React.createElement(
          'span',
          null,
          React.createElement('span', { className: 'loading loading-spinner-tiny inline-block' }),
          'Loading...'
        );
      }
      return React.createElement(
        'div',
        { className: 'select-list omnisearch-modal', ref: 'modal' },
        React.createElement(AtomInput, { ref: 'queryInput', placeholderText: promptText }),
        this._renderTabs(),
        React.createElement(
          'div',
          { className: 'omnisearch-results', style: { maxHeight: this.props.maxScrollableAreaHeight } },
          noResultsMessage,
          React.createElement(
            'div',
            { className: 'omnisearch-pane' },
            React.createElement(
              'ul',
              { className: 'list-tree', ref: 'selectionList' },
              services,
              omniSearchStatus
            )
          )
        )
      );
    }
  }]);

  return QuickSelectionComponent;
})(React.Component);

exports['default'] = QuickSelectionComponent;

QuickSelectionComponent.propTypes = {
  activeProvider: PropTypes.shape({
    action: PropTypes.string.isRequired,
    debounceDelay: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    prompt: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired
  }).isRequired,
  onProviderChange: PropTypes.func,
  maxScrollableAreaHeight: PropTypes.number
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlF1aWNrU2VsZWN0aW9uQ29tcG9uZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzttQ0FnRGdDLHVCQUF1Qjs7OztBQVh2RCxJQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsNkJBQTZCLENBQUMsQ0FBQzs7ZUFDbEIsT0FBTyxDQUFDLE1BQU0sQ0FBQzs7SUFBL0MsbUJBQW1CLFlBQW5CLG1CQUFtQjtJQUFFLE9BQU8sWUFBUCxPQUFPOztnQkFJL0IsT0FBTyxDQUFDLHVCQUF1QixDQUFDOztJQUZsQyxRQUFRLGFBQVIsUUFBUTtJQUNSLE1BQU0sYUFBTixNQUFNOztnQkFLSixPQUFPLENBQUMsZ0JBQWdCLENBQUM7O0lBRjNCLEtBQUssYUFBTCxLQUFLO0lBQ0wsUUFBUSxhQUFSLFFBQVE7O0FBSVYsSUFBTSxtQkFBbUIsR0FBRyxpQ0FBb0IsV0FBVyxFQUFFLENBQUM7QUFDOUQsSUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLHVCQUF1QixDQUFDLENBQUM7SUFDOUMsU0FBUyxHQUFJLEtBQUssQ0FBbEIsU0FBUzs7QUFDaEIsSUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDOztnQkFJckMsT0FBTyxDQUFDLHVCQUF1QixDQUFDOztJQURsQyxrQkFBa0IsYUFBbEIsa0JBQWtCOzs7Ozs7QUFPcEIsU0FBUyx3QkFBd0IsQ0FBQyxNQUFjLEVBQUUsTUFBbUIsRUFBVTtrQkFDakQsT0FBTyxDQUFDLCtCQUErQixDQUFDOztNQUE3RCxpQkFBaUIsYUFBakIsaUJBQWlCOztBQUN4QixNQUFNLG1CQUFtQixHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDO0FBQ3ZELFdBQU8sRUFBRSxNQUFNO0FBQ2YsVUFBTSxFQUFOLE1BQU07R0FDUCxDQUFDLENBQUM7QUFDSCxNQUFNLFNBQVMsR0FBRyxBQUFDLG1CQUFtQixDQUFDLE1BQU0sSUFBSSxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsQ0FB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SDtBQUNELGFBQ0U7O1VBQUssU0FBUyxFQUFDLDhCQUE4QixFQUFDLEdBQUcsRUFBQyxPQUFPO1FBQ3ZELG9CQUFDLFNBQVMsSUFBQyxHQUFHLEVBQUMsWUFBWSxFQUFDLGVBQWUsRUFBRSxVQUFVLEFBQUMsR0FBRztRQUMxRCxJQUFJLENBQUMsV0FBVyxFQUFFO1FBQ25COztZQUFLLFNBQVMsRUFBQyxvQkFBb0IsRUFBQyxLQUFLLEVBQUUsRUFBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyx1QkFBdUIsRUFBQyxBQUFDO1VBQ3hGLGdCQUFnQjtVQUNqQjs7Y0FBSyxTQUFTLEVBQUMsaUJBQWlCO1lBQzlCOztnQkFBSSxTQUFTLEVBQUMsV0FBVyxFQUFDLEdBQUcsRUFBQyxlQUFlO2NBQzFDLFFBQVE7Y0FDUixnQkFBZ0I7YUFDZDtXQUNEO1NBQ0Y7T0FDRixDQUNOO0tBQ0g7OztTQXhwQmtCLHVCQUF1QjtHQUFTLEtBQUssQ0FBQyxTQUFTOztxQkFBL0MsdUJBQXVCOztBQTJwQjVDLHVCQUF1QixDQUFDLFNBQVMsR0FBRztBQUNsQyxnQkFBYyxFQUFFLFNBQVMsQ0FBQyxLQUFLLENBQUM7QUFDOUIsVUFBTSxFQUFFLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVTtBQUNuQyxpQkFBYSxFQUFFLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVTtBQUMxQyxRQUFJLEVBQUUsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVO0FBQ2pDLFVBQU0sRUFBRSxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVU7QUFDbkMsU0FBSyxFQUFFLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVTtHQUNuQyxDQUFDLENBQUMsVUFBVTtBQUNiLGtCQUFnQixFQUFFLFNBQVMsQ0FBQyxJQUFJO0FBQ2hDLHlCQUF1QixFQUFFLFNBQVMsQ0FBQyxNQUFNO0NBQzFDLENBQUMiLCJmaWxlIjoiUXVpY2tTZWxlY3Rpb25Db21wb25lbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7XG4gIFByb3ZpZGVyU3BlYyxcbn0gZnJvbSAnLi90eXBlcyc7XG5cbmltcG9ydCB0eXBlIHtcbiAgRGlyZWN0b3J5TmFtZSxcbiAgR3JvdXBlZFJlc3VsdCxcbiAgU2VydmljZU5hbWUsXG59IGZyb20gJy4uLy4uL251Y2xpZGUtcXVpY2stb3Blbi1pbnRlcmZhY2VzJztcblxudHlwZSBSZXN1bHRDb250ZXh0ID0ge1xuICBub25FbXB0eVJlc3VsdHM6IEdyb3VwZWRSZXN1bHQ7XG4gIHNlcnZpY2VOYW1lczogQXJyYXk8U2VydmljZU5hbWU+O1xuICBjdXJyZW50U2VydmljZUluZGV4OiBudW1iZXI7XG4gIGN1cnJlbnRTZXJ2aWNlOiBPYmplY3Q7XG4gIGRpcmVjdG9yeU5hbWVzOiBBcnJheTxEaXJlY3RvcnlOYW1lPjtcbiAgY3VycmVudERpcmVjdG9yeUluZGV4OiBudW1iZXI7XG4gIGN1cnJlbnREaXJlY3Rvcnk6IE9iamVjdDtcbn07XG5cbnR5cGUgU2VsZWN0aW9uID0ge1xuICBzZWxlY3RlZERpcmVjdG9yeTogc3RyaW5nO1xuICBzZWxlY3RlZFNlcnZpY2U6IHN0cmluZztcbiAgc2VsZWN0ZWRJdGVtSW5kZXg6IG51bWJlcjtcbn07XG5cbmNvbnN0IEF0b21JbnB1dCA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtdWktYXRvbS1pbnB1dCcpO1xuY29uc3Qge0NvbXBvc2l0ZURpc3Bvc2FibGUsIEVtaXR0ZXJ9ID0gcmVxdWlyZSgnYXRvbScpO1xuY29uc3Qge1xuICBkZWJvdW5jZSxcbiAgb2JqZWN0LFxufSA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtY29tbW9ucycpO1xuY29uc3Qge1xuICBSZWFjdCxcbiAgUmVhY3RET00sXG59ID0gcmVxdWlyZSgncmVhY3QtZm9yLWF0b20nKTtcblxuaW1wb3J0IFNlYXJjaFJlc3VsdE1hbmFnZXIgZnJvbSAnLi9TZWFyY2hSZXN1bHRNYW5hZ2VyJztcbmNvbnN0IHNlYXJjaFJlc3VsdE1hbmFnZXIgPSBTZWFyY2hSZXN1bHRNYW5hZ2VyLmdldEluc3RhbmNlKCk7XG5jb25zdCBOdWNsaWRlVGFicyA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtdWktdGFicycpO1xuY29uc3Qge1Byb3BUeXBlc30gPSBSZWFjdDtcbmNvbnN0IGNsYXNzbmFtZXMgPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbmNvbnN0IHtcbiAgZmlsdGVyRW1wdHlSZXN1bHRzLFxufSA9IHJlcXVpcmUoJy4vc2VhcmNoUmVzdWx0SGVscGVycycpO1xuXG4vKipcbiAqIERldGVybWluZSB3aGF0IHRoZSBhcHBsaWNhYmxlIHNob3J0Y3V0IGZvciBhIGdpdmVuIGFjdGlvbiBpcyB3aXRoaW4gdGhpcyBjb21wb25lbnQncyBjb250ZXh0LlxuICogRm9yIGV4YW1wbGUsIHRoaXMgd2lsbCByZXR1cm4gZGlmZmVyZW50IGtleWJpbmRpbmdzIG9uIHdpbmRvd3MgdnMgbGludXguXG4gKi9cbmZ1bmN0aW9uIF9maW5kS2V5YmluZGluZ0ZvckFjdGlvbihhY3Rpb246IHN0cmluZywgdGFyZ2V0OiBIVE1MRWxlbWVudCk6IHN0cmluZyB7XG4gIGNvbnN0IHtodW1hbml6ZUtleXN0cm9rZX0gPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLWtleXN0cm9rZS1sYWJlbCcpO1xuICBjb25zdCBtYXRjaGluZ0tleUJpbmRpbmdzID0gYXRvbS5rZXltYXBzLmZpbmRLZXlCaW5kaW5ncyh7XG4gICAgY29tbWFuZDogYWN0aW9uLFxuICAgIHRhcmdldCxcbiAgfSk7XG4gIGNvbnN0IGtleXN0cm9rZSA9IChtYXRjaGluZ0tleUJpbmRpbmdzLmxlbmd0aCAmJiBtYXRjaGluZ0tleUJpbmRpbmdzWzBdLmtleXN0cm9rZXMpIHx8ICcnO1xuICByZXR1cm4gaHVtYW5pemVLZXlzdHJva2Uoa2V5c3Ryb2tlKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUXVpY2tTZWxlY3Rpb25Db21wb25lbnQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBfZW1pdHRlcjogRW1pdHRlcjtcbiAgX3N1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9tb2RhbE5vZGU6IEhUTUxFbGVtZW50O1xuICBfZGVib3VuY2VkUXVlcnlIYW5kbGVyOiAoKSA9PiB2b2lkO1xuICBfYm91bmRTZWxlY3Q6ICgpID0+IHZvaWQ7XG4gIF9ib3VuZEhhbmRsZVRhYkNoYW5nZTogKHRhYjogUHJvdmlkZXJTcGVjKSA9PiB2b2lkO1xuICBzdGF0ZToge1xuICAgIGFjdGl2ZVByb3ZpZGVyTmFtZT86IHN0cmluZztcbiAgICBhY3RpdmVUYWI6IFByb3ZpZGVyU3BlYztcbiAgICBoYXNVc2VyU2VsZWN0aW9uOiBib29sZWFuO1xuICAgIHJlc3VsdHNCeVNlcnZpY2U6IEdyb3VwZWRSZXN1bHQ7XG4gICAgcmVuZGVyYWJsZVByb3ZpZGVyczogQXJyYXk8UHJvdmlkZXJTcGVjPjtcbiAgICBzZWxlY3RlZFNlcnZpY2U6IHN0cmluZztcbiAgICBzZWxlY3RlZERpcmVjdG9yeTogc3RyaW5nO1xuICAgIHNlbGVjdGVkSXRlbUluZGV4OiBudW1iZXI7XG4gIH07XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IE9iamVjdCkge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICB0aGlzLl9lbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLl9ib3VuZFNlbGVjdCA9ICgpID0+IHRoaXMuc2VsZWN0KCk7XG4gICAgdGhpcy5fYm91bmRIYW5kbGVUYWJDaGFuZ2UgPSAodGFiOiBQcm92aWRlclNwZWMpID0+IHRoaXMuX2hhbmRsZVRhYkNoYW5nZSh0YWIpO1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBhY3RpdmVUYWI6IHNlYXJjaFJlc3VsdE1hbmFnZXIuZ2V0UHJvdmlkZXJCeU5hbWUoc2VhcmNoUmVzdWx0TWFuYWdlci5nZXRBY3RpdmVQcm92aWRlck5hbWUoKSksXG4gICAgICAvLyB0cmVhdGVkIGFzIGltbXV0YWJsZVxuICAgICAgcmVzdWx0c0J5U2VydmljZToge30sXG4gICAgICByZW5kZXJhYmxlUHJvdmlkZXJzOiBzZWFyY2hSZXN1bHRNYW5hZ2VyLmdldFJlbmRlcmFibGVQcm92aWRlcnMoKSxcbiAgICAgIHNlbGVjdGVkU2VydmljZTogJycsXG4gICAgICBzZWxlY3RlZERpcmVjdG9yeTogJycsXG4gICAgICBzZWxlY3RlZEl0ZW1JbmRleDogLTEsXG4gICAgICBoYXNVc2VyU2VsZWN0aW9uOiBmYWxzZSxcbiAgICB9O1xuICAgICh0aGlzOiBhbnkpLmhhbmRsZVByb3ZpZGVyc0NoYW5nZSA9IHRoaXMuaGFuZGxlUHJvdmlkZXJzQ2hhbmdlLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuaGFuZGxlUmVzdWx0c0NoYW5nZSA9IHRoaXMuaGFuZGxlUmVzdWx0c0NoYW5nZS5iaW5kKHRoaXMpO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXh0UHJvcHM6IGFueSkge1xuICAgIGlmIChuZXh0UHJvcHMuYWN0aXZlUHJvdmlkZXIgIT09IHRoaXMucHJvcHMuYWN0aXZlUHJvdmlkZXIpIHtcbiAgICAgIGlmIChuZXh0UHJvcHMuYWN0aXZlUHJvdmlkZXIpIHtcbiAgICAgICAgdGhpcy5fZ2V0VGV4dEVkaXRvcigpLnNldFBsYWNlaG9sZGVyVGV4dChuZXh0UHJvcHMuYWN0aXZlUHJvdmlkZXIucHJvbXB0KTtcbiAgICAgICAgY29uc3QgbmV3UmVzdWx0cyA9IHt9O1xuICAgICAgICB0aGlzLnNldFN0YXRlKFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIGFjdGl2ZVRhYjogbmV4dFByb3BzLmFjdGl2ZVByb3ZpZGVyIHx8IHRoaXMuc3RhdGUuYWN0aXZlVGFiLFxuICAgICAgICAgICAgcmVzdWx0c0J5U2VydmljZTogbmV3UmVzdWx0cyxcbiAgICAgICAgICB9LFxuICAgICAgICAgICgpID0+IHtcbiAgICAgICAgICAgIHNldEltbWVkaWF0ZSgoKSA9PiB0aGlzLnNldFF1ZXJ5KHRoaXMucmVmc1sncXVlcnlJbnB1dCddLmdldFRleHQoKSkpO1xuICAgICAgICAgICAgdGhpcy5fdXBkYXRlUXVlcnlIYW5kbGVyKCk7XG4gICAgICAgICAgICB0aGlzLl9lbWl0dGVyLmVtaXQoJ2l0ZW1zLWNoYW5nZWQnLCBuZXdSZXN1bHRzKTtcbiAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgY29tcG9uZW50RGlkVXBkYXRlKHByZXZQcm9wczogYW55LCBwcmV2U3RhdGU6IGFueSkge1xuICAgIGlmIChwcmV2U3RhdGUucmVzdWx0c0J5U2VydmljZSAhPT0gdGhpcy5zdGF0ZS5yZXN1bHRzQnlTZXJ2aWNlKSB7XG4gICAgICB0aGlzLl9lbWl0dGVyLmVtaXQoJ2l0ZW1zLWNoYW5nZWQnLCB0aGlzLnN0YXRlLnJlc3VsdHNCeVNlcnZpY2UpO1xuICAgIH1cblxuICAgIGlmIChcbiAgICAgIHByZXZTdGF0ZS5zZWxlY3RlZEl0ZW1JbmRleCAhPT0gdGhpcy5zdGF0ZS5zZWxlY3RlZEl0ZW1JbmRleCB8fFxuICAgICAgcHJldlN0YXRlLnNlbGVjdGVkU2VydmljZSAhPT0gdGhpcy5zdGF0ZS5zZWxlY3RlZFNlcnZpY2UgfHxcbiAgICAgIHByZXZTdGF0ZS5zZWxlY3RlZERpcmVjdG9yeSAhPT0gdGhpcy5zdGF0ZS5zZWxlY3RlZERpcmVjdG9yeVxuICAgICkge1xuICAgICAgdGhpcy5fdXBkYXRlU2Nyb2xsUG9zaXRpb24oKTtcbiAgICB9XG4gIH1cblxuICBjb21wb25lbnREaWRNb3VudCgpOiB2b2lkIHtcbiAgICB0aGlzLl9tb2RhbE5vZGUgPSBSZWFjdERPTS5maW5kRE9NTm9kZSh0aGlzKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKFxuICAgICAgICB0aGlzLl9tb2RhbE5vZGUsXG4gICAgICAgICdjb3JlOm1vdmUtdG8tYm90dG9tJyxcbiAgICAgICAgdGhpcy5oYW5kbGVNb3ZlVG9Cb3R0b20uYmluZCh0aGlzKVxuICAgICAgKSxcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKHRoaXMuX21vZGFsTm9kZSwgJ2NvcmU6bW92ZS10by10b3AnLCB0aGlzLmhhbmRsZU1vdmVUb1RvcC5iaW5kKHRoaXMpKSxcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKHRoaXMuX21vZGFsTm9kZSwgJ2NvcmU6bW92ZS1kb3duJywgdGhpcy5oYW5kbGVNb3ZlRG93bi5iaW5kKHRoaXMpKSxcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKHRoaXMuX21vZGFsTm9kZSwgJ2NvcmU6bW92ZS11cCcsIHRoaXMuaGFuZGxlTW92ZVVwLmJpbmQodGhpcykpLFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQodGhpcy5fbW9kYWxOb2RlLCAnY29yZTpjb25maXJtJywgdGhpcy5zZWxlY3QuYmluZCh0aGlzKSksXG4gICAgKTtcblxuICAgIGNvbnN0IGlucHV0VGV4dEVkaXRvciA9IHRoaXMuZ2V0SW5wdXRUZXh0RWRpdG9yKCk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBzZWFyY2hSZXN1bHRNYW5hZ2VyLm9uKFxuICAgICAgICBzZWFyY2hSZXN1bHRNYW5hZ2VyLlBST1ZJREVSU19DSEFOR0VELFxuICAgICAgICB0aGlzLmhhbmRsZVByb3ZpZGVyc0NoYW5nZVxuICAgICAgKSxcbiAgICAgIHNlYXJjaFJlc3VsdE1hbmFnZXIub24oXG4gICAgICAgIHNlYXJjaFJlc3VsdE1hbmFnZXIuUkVTVUxUU19DSEFOR0VELFxuICAgICAgICB0aGlzLmhhbmRsZVJlc3VsdHNDaGFuZ2VcbiAgICAgICksXG4gICAgKTtcblxuICAgIHRoaXMuX3VwZGF0ZVF1ZXJ5SGFuZGxlcigpO1xuICAgIGlucHV0VGV4dEVkaXRvci5nZXRNb2RlbCgpLm9uRGlkQ2hhbmdlKCgpID0+IHRoaXMuX2hhbmRsZVRleHRJbnB1dENoYW5nZSgpKTtcbiAgICB0aGlzLmNsZWFyKCk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpOiB2b2lkIHtcbiAgICB0aGlzLl9lbWl0dGVyLmRpc3Bvc2UoKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIGhhbmRsZU1vdmVUb0JvdHRvbSgpOiB2b2lkIHtcbiAgICB0aGlzLm1vdmVTZWxlY3Rpb25Ub0JvdHRvbSgpO1xuICAgIHRoaXMub25Vc2VyRGlkQ2hhbmdlU2VsZWN0aW9uKCk7XG4gIH1cblxuICBoYW5kbGVNb3ZlVG9Ub3AoKTogdm9pZCB7XG4gICAgdGhpcy5tb3ZlU2VsZWN0aW9uVG9Ub3AoKTtcbiAgICB0aGlzLm9uVXNlckRpZENoYW5nZVNlbGVjdGlvbigpO1xuICB9XG5cbiAgaGFuZGxlTW92ZURvd24oKTogdm9pZCB7XG4gICAgdGhpcy5tb3ZlU2VsZWN0aW9uRG93bigpO1xuICAgIHRoaXMub25Vc2VyRGlkQ2hhbmdlU2VsZWN0aW9uKCk7XG4gIH1cblxuICBoYW5kbGVNb3ZlVXAoKTogdm9pZCB7XG4gICAgdGhpcy5tb3ZlU2VsZWN0aW9uVXAoKTtcbiAgICB0aGlzLm9uVXNlckRpZENoYW5nZVNlbGVjdGlvbigpO1xuICB9XG5cbiAgb25DYW5jZWxsYXRpb24oY2FsbGJhY2s6ICgpID0+IHZvaWQpOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX2VtaXR0ZXIub24oJ2NhbmNlbGVkJywgY2FsbGJhY2spO1xuICB9XG5cbiAgb25TZWxlY3Rpb24oY2FsbGJhY2s6IChzZWxlY3Rpb246IGFueSkgPT4gdm9pZCk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fZW1pdHRlci5vbignc2VsZWN0ZWQnLCBjYWxsYmFjayk7XG4gIH1cblxuICBvblNlbGVjdGlvbkNoYW5nZWQoY2FsbGJhY2s6IChzZWxlY3Rpb25JbmRleDogYW55KSA9PiB2b2lkKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9lbWl0dGVyLm9uKCdzZWxlY3Rpb24tY2hhbmdlZCcsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIG9uSXRlbXNDaGFuZ2VkKGNhbGxiYWNrOiAobmV3SXRlbXM6IEdyb3VwZWRSZXN1bHQpID0+IHZvaWQpOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX2VtaXR0ZXIub24oJ2l0ZW1zLWNoYW5nZWQnLCBjYWxsYmFjayk7XG4gIH1cblxuICBfdXBkYXRlUXVlcnlIYW5kbGVyKCk6IHZvaWQge1xuICAgIHRoaXMuX2RlYm91bmNlZFF1ZXJ5SGFuZGxlciA9IGRlYm91bmNlKFxuICAgICAgKCkgPT4gdGhpcy5zZXRLZXlib2FyZFF1ZXJ5KHRoaXMuZ2V0SW5wdXRUZXh0RWRpdG9yKCkuZ2V0TW9kZWwoKS5nZXRUZXh0KCkpLFxuICAgICAgdGhpcy5nZXRQcm92aWRlcigpLmRlYm91bmNlRGVsYXkgfHwgMCxcbiAgICAgIGZhbHNlXG4gICAgKTtcbiAgfVxuXG4gIF9oYW5kbGVUZXh0SW5wdXRDaGFuZ2UoKTogdm9pZCB7XG4gICAgdGhpcy5fZGVib3VuY2VkUXVlcnlIYW5kbGVyKCk7XG4gIH1cblxuICBoYW5kbGVSZXN1bHRzQ2hhbmdlKCk6IHZvaWQge1xuICAgIHRoaXMuX3VwZGF0ZVJlc3VsdHModGhpcy5wcm9wcy5hY3RpdmVQcm92aWRlci5uYW1lKTtcbiAgfVxuXG4gIF91cGRhdGVSZXN1bHRzKGFjdGl2ZVByb3ZpZGVyTmFtZTogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3QgdXBkYXRlZFJlc3VsdHMgPSBzZWFyY2hSZXN1bHRNYW5hZ2VyLmdldFJlc3VsdHMoXG4gICAgICB0aGlzLnJlZnNbJ3F1ZXJ5SW5wdXQnXS5nZXRUZXh0KCksXG4gICAgICBhY3RpdmVQcm92aWRlck5hbWVcbiAgICApO1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgcmVzdWx0c0J5U2VydmljZTogdXBkYXRlZFJlc3VsdHMsXG4gICAgfSwgKCkgPT4ge1xuICAgICAgaWYgKCF0aGlzLnN0YXRlLmhhc1VzZXJTZWxlY3Rpb24pIHtcbiAgICAgICAgdGhpcy5tb3ZlU2VsZWN0aW9uVG9Ub3AoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGhhbmRsZVByb3ZpZGVyc0NoYW5nZSgpOiB2b2lkIHtcbiAgICBjb25zdCByZW5kZXJhYmxlUHJvdmlkZXJzID0gc2VhcmNoUmVzdWx0TWFuYWdlci5nZXRSZW5kZXJhYmxlUHJvdmlkZXJzKCk7XG4gICAgY29uc3QgYWN0aXZlUHJvdmlkZXJOYW1lID0gc2VhcmNoUmVzdWx0TWFuYWdlci5nZXRBY3RpdmVQcm92aWRlck5hbWUoKTtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHJlbmRlcmFibGVQcm92aWRlcnMsXG4gICAgICBhY3RpdmVQcm92aWRlck5hbWUsXG4gICAgfSk7XG4gICAgdGhpcy5fdXBkYXRlUmVzdWx0cyhhY3RpdmVQcm92aWRlck5hbWUpO1xuICB9XG5cbiAgc2VsZWN0KCk6IHZvaWQge1xuICAgIGNvbnN0IHNlbGVjdGVkSXRlbSA9IHRoaXMuZ2V0U2VsZWN0ZWRJdGVtKCk7XG4gICAgaWYgKCFzZWxlY3RlZEl0ZW0pIHtcbiAgICAgIHRoaXMuY2FuY2VsKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2VtaXR0ZXIuZW1pdCgnc2VsZWN0ZWQnLCBzZWxlY3RlZEl0ZW0pO1xuICAgIH1cbiAgfVxuXG4gIG9uVXNlckRpZENoYW5nZVNlbGVjdGlvbigpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGhhc1VzZXJTZWxlY3Rpb246IHRydWUsXG4gICAgfSk7XG4gIH1cblxuICBjYW5jZWwoKTogdm9pZCB7XG4gICAgdGhpcy5fZW1pdHRlci5lbWl0KCdjYW5jZWxlZCcpO1xuICB9XG5cbiAgY2xlYXJTZWxlY3Rpb24oKTogdm9pZCB7XG4gICAgdGhpcy5zZXRTZWxlY3RlZEluZGV4KCcnLCAnJywgLTEpO1xuICB9XG5cbiAgX2dldEN1cnJlbnRSZXN1bHRDb250ZXh0KCk6ID9SZXN1bHRDb250ZXh0IHtcbiAgICBjb25zdCBub25FbXB0eVJlc3VsdHMgPSBmaWx0ZXJFbXB0eVJlc3VsdHModGhpcy5zdGF0ZS5yZXN1bHRzQnlTZXJ2aWNlKTtcbiAgICBjb25zdCBzZXJ2aWNlTmFtZXMgPSBPYmplY3Qua2V5cyhub25FbXB0eVJlc3VsdHMpO1xuICAgIGNvbnN0IGN1cnJlbnRTZXJ2aWNlSW5kZXggPSBzZXJ2aWNlTmFtZXMuaW5kZXhPZih0aGlzLnN0YXRlLnNlbGVjdGVkU2VydmljZSk7XG4gICAgY29uc3QgY3VycmVudFNlcnZpY2UgPSBub25FbXB0eVJlc3VsdHNbdGhpcy5zdGF0ZS5zZWxlY3RlZFNlcnZpY2VdO1xuXG4gICAgaWYgKCFjdXJyZW50U2VydmljZSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgZGlyZWN0b3J5TmFtZXMgPSBPYmplY3Qua2V5cyhjdXJyZW50U2VydmljZS5yZXN1bHRzKTtcbiAgICBjb25zdCBjdXJyZW50RGlyZWN0b3J5SW5kZXggPSBkaXJlY3RvcnlOYW1lcy5pbmRleE9mKHRoaXMuc3RhdGUuc2VsZWN0ZWREaXJlY3RvcnkpO1xuICAgIGNvbnN0IGN1cnJlbnREaXJlY3RvcnkgPSBjdXJyZW50U2VydmljZS5yZXN1bHRzW3RoaXMuc3RhdGUuc2VsZWN0ZWREaXJlY3RvcnldO1xuXG4gICAgaWYgKCFjdXJyZW50RGlyZWN0b3J5IHx8ICFjdXJyZW50RGlyZWN0b3J5LnJlc3VsdHMpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBub25FbXB0eVJlc3VsdHMsXG4gICAgICBzZXJ2aWNlTmFtZXMsXG4gICAgICBjdXJyZW50U2VydmljZUluZGV4LFxuICAgICAgY3VycmVudFNlcnZpY2UsXG4gICAgICBkaXJlY3RvcnlOYW1lcyxcbiAgICAgIGN1cnJlbnREaXJlY3RvcnlJbmRleCxcbiAgICAgIGN1cnJlbnREaXJlY3RvcnksXG4gICAgfTtcbiAgfVxuXG4gIG1vdmVTZWxlY3Rpb25Eb3duKCk6IHZvaWQge1xuICAgIGNvbnN0IGNvbnRleHQgPSB0aGlzLl9nZXRDdXJyZW50UmVzdWx0Q29udGV4dCgpO1xuICAgIGlmICghY29udGV4dCkge1xuICAgICAgdGhpcy5tb3ZlU2VsZWN0aW9uVG9Ub3AoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5zdGF0ZS5zZWxlY3RlZEl0ZW1JbmRleCA8IGNvbnRleHQuY3VycmVudERpcmVjdG9yeS5yZXN1bHRzLmxlbmd0aCAtIDEpIHtcbiAgICAgIC8vIG9ubHkgYnVtcCB0aGUgaW5kZXggaWYgcmVtYWluaW5nIGluIGN1cnJlbnQgZGlyZWN0b3J5XG4gICAgICB0aGlzLnNldFNlbGVjdGVkSW5kZXgoXG4gICAgICAgIHRoaXMuc3RhdGUuc2VsZWN0ZWRTZXJ2aWNlLFxuICAgICAgICB0aGlzLnN0YXRlLnNlbGVjdGVkRGlyZWN0b3J5LFxuICAgICAgICB0aGlzLnN0YXRlLnNlbGVjdGVkSXRlbUluZGV4ICsgMVxuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gb3RoZXJ3aXNlIGdvIHRvIG5leHQgZGlyZWN0b3J5Li4uXG4gICAgICBpZiAoY29udGV4dC5jdXJyZW50RGlyZWN0b3J5SW5kZXggPCBjb250ZXh0LmRpcmVjdG9yeU5hbWVzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgdGhpcy5zZXRTZWxlY3RlZEluZGV4KFxuICAgICAgICAgIHRoaXMuc3RhdGUuc2VsZWN0ZWRTZXJ2aWNlLFxuICAgICAgICAgIGNvbnRleHQuZGlyZWN0b3J5TmFtZXNbY29udGV4dC5jdXJyZW50RGlyZWN0b3J5SW5kZXggKyAxXSxcbiAgICAgICAgICAwXG4gICAgICAgICk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyAuLi5vciB0aGUgbmV4dCBzZXJ2aWNlLi4uXG4gICAgICAgIGlmIChjb250ZXh0LmN1cnJlbnRTZXJ2aWNlSW5kZXggPCBjb250ZXh0LnNlcnZpY2VOYW1lcy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgY29uc3QgbmV3U2VydmljZU5hbWUgPSBjb250ZXh0LnNlcnZpY2VOYW1lc1tjb250ZXh0LmN1cnJlbnRTZXJ2aWNlSW5kZXggKyAxXTtcbiAgICAgICAgICBjb25zdCBuZXdEaXJlY3RvcnlOYW1lID1cbiAgICAgICAgICAgIE9iamVjdC5rZXlzKGNvbnRleHQubm9uRW1wdHlSZXN1bHRzW25ld1NlcnZpY2VOYW1lXS5yZXN1bHRzKS5zaGlmdCgpO1xuICAgICAgICAgIHRoaXMuc2V0U2VsZWN0ZWRJbmRleChuZXdTZXJ2aWNlTmFtZSwgbmV3RGlyZWN0b3J5TmFtZSwgMCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gLi4ub3Igd3JhcCBhcm91bmQgdG8gdGhlIHZlcnkgdG9wXG4gICAgICAgICAgdGhpcy5tb3ZlU2VsZWN0aW9uVG9Ub3AoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIG1vdmVTZWxlY3Rpb25VcCgpOiB2b2lkIHtcbiAgICBjb25zdCBjb250ZXh0ID0gdGhpcy5fZ2V0Q3VycmVudFJlc3VsdENvbnRleHQoKTtcbiAgICBpZiAoIWNvbnRleHQpIHtcbiAgICAgIHRoaXMubW92ZVNlbGVjdGlvblRvQm90dG9tKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuc3RhdGUuc2VsZWN0ZWRJdGVtSW5kZXggPiAwKSB7XG4gICAgICAvLyBvbmx5IGRlY3JlYXNlIHRoZSBpbmRleCBpZiByZW1haW5pbmcgaW4gY3VycmVudCBkaXJlY3RvcnlcbiAgICAgIHRoaXMuc2V0U2VsZWN0ZWRJbmRleChcbiAgICAgICAgdGhpcy5zdGF0ZS5zZWxlY3RlZFNlcnZpY2UsXG4gICAgICAgIHRoaXMuc3RhdGUuc2VsZWN0ZWREaXJlY3RvcnksXG4gICAgICAgIHRoaXMuc3RhdGUuc2VsZWN0ZWRJdGVtSW5kZXggLSAxXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBvdGhlcndpc2UsIGdvIHRvIHRoZSBwcmV2aW91cyBkaXJlY3RvcnkuLi5cbiAgICAgIGlmIChjb250ZXh0LmN1cnJlbnREaXJlY3RvcnlJbmRleCA+IDApIHtcbiAgICAgICAgdGhpcy5zZXRTZWxlY3RlZEluZGV4KFxuICAgICAgICAgIHRoaXMuc3RhdGUuc2VsZWN0ZWRTZXJ2aWNlLFxuICAgICAgICAgIGNvbnRleHQuZGlyZWN0b3J5TmFtZXNbY29udGV4dC5jdXJyZW50RGlyZWN0b3J5SW5kZXggLSAxXSxcbiAgICAgICAgICBjb250ZXh0LmN1cnJlbnRTZXJ2aWNlXG4gICAgICAgICAgICAucmVzdWx0c1tjb250ZXh0LmRpcmVjdG9yeU5hbWVzW2NvbnRleHQuY3VycmVudERpcmVjdG9yeUluZGV4IC0gMV1dLnJlc3VsdHMubGVuZ3RoIC0gMVxuICAgICAgICApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gLi4ub3IgdGhlIHByZXZpb3VzIHNlcnZpY2UuLi5cbiAgICAgICAgaWYgKGNvbnRleHQuY3VycmVudFNlcnZpY2VJbmRleCA+IDApIHtcbiAgICAgICAgICBjb25zdCBuZXdTZXJ2aWNlTmFtZSA9IGNvbnRleHQuc2VydmljZU5hbWVzW2NvbnRleHQuY3VycmVudFNlcnZpY2VJbmRleCAtIDFdO1xuICAgICAgICAgIGNvbnN0IG5ld0RpcmVjdG9yeU5hbWUgPVxuICAgICAgICAgICAgT2JqZWN0LmtleXMoY29udGV4dC5ub25FbXB0eVJlc3VsdHNbbmV3U2VydmljZU5hbWVdLnJlc3VsdHMpLnBvcCgpO1xuICAgICAgICAgIGlmIChuZXdEaXJlY3RvcnlOYW1lID09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgcmVzdWx0c0ZvckRpcmVjdG9yeSA9XG4gICAgICAgICAgICBjb250ZXh0Lm5vbkVtcHR5UmVzdWx0c1tuZXdTZXJ2aWNlTmFtZV0ucmVzdWx0c1tuZXdEaXJlY3RvcnlOYW1lXTtcbiAgICAgICAgICBpZiAocmVzdWx0c0ZvckRpcmVjdG9yeSA9PSBudWxsIHx8IHJlc3VsdHNGb3JEaXJlY3RvcnkucmVzdWx0cyA9PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuc2V0U2VsZWN0ZWRJbmRleChcbiAgICAgICAgICAgIG5ld1NlcnZpY2VOYW1lLFxuICAgICAgICAgICAgbmV3RGlyZWN0b3J5TmFtZSxcbiAgICAgICAgICAgIHJlc3VsdHNGb3JEaXJlY3RvcnkucmVzdWx0cy5sZW5ndGggLSAxXG4gICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyAuLi5vciB3cmFwIGFyb3VuZCB0byB0aGUgdmVyeSBib3R0b21cbiAgICAgICAgICB0aGlzLm1vdmVTZWxlY3Rpb25Ub0JvdHRvbSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gVXBkYXRlIHRoZSBzY3JvbGwgcG9zaXRpb24gb2YgdGhlIGxpc3QgdmlldyB0byBlbnN1cmUgdGhlIHNlbGVjdGVkIGl0ZW0gaXMgdmlzaWJsZS5cbiAgX3VwZGF0ZVNjcm9sbFBvc2l0aW9uKCk6IHZvaWQge1xuICAgIGlmICghKHRoaXMucmVmcyAmJiB0aGlzLnJlZnNbJ3NlbGVjdGlvbkxpc3QnXSkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgbGlzdE5vZGUgPSAgUmVhY3RET00uZmluZERPTU5vZGUodGhpcy5yZWZzWydzZWxlY3Rpb25MaXN0J10pO1xuICAgIGNvbnN0IHNlbGVjdGVkTm9kZSA9IGxpc3ROb2RlLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3NlbGVjdGVkJylbMF07XG4gICAgLy8gZmFsc2UgaXMgcGFzc2VkIGZvciBAY2VudGVySWZOZWVkZWQgcGFyYW1ldGVyLCB3aGljaCBkZWZhdWx0cyB0byB0cnVlLlxuICAgIC8vIFBhc3NpbmcgZmFsc2UgY2F1c2VzIHRoZSBtaW5pbXVtIG5lY2Vzc2FyeSBzY3JvbGwgdG8gb2NjdXIsIHNvIHRoZSBzZWxlY3Rpb24gc3RpY2tzIHRvIHRoZVxuICAgIC8vIHRvcC9ib3R0b20uXG4gICAgaWYgKHNlbGVjdGVkTm9kZSkge1xuICAgICAgc2VsZWN0ZWROb2RlLnNjcm9sbEludG9WaWV3SWZOZWVkZWQoZmFsc2UpO1xuICAgIH1cbiAgfVxuXG4gIG1vdmVTZWxlY3Rpb25Ub0JvdHRvbSgpOiB2b2lkIHtcbiAgICBjb25zdCBib3R0b20gPSB0aGlzLl9nZXRPdXRlclJlc3VsdHMoQXJyYXkucHJvdG90eXBlLnBvcCk7XG4gICAgaWYgKCFib3R0b20pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5zZXRTZWxlY3RlZEluZGV4KGJvdHRvbS5zZXJ2aWNlTmFtZSwgYm90dG9tLmRpcmVjdG9yeU5hbWUsIGJvdHRvbS5yZXN1bHRzLmxlbmd0aCAtIDEpO1xuICB9XG5cbiAgbW92ZVNlbGVjdGlvblRvVG9wKCk6IHZvaWQge1xuICAgIGNvbnN0IHRvcCA9IHRoaXMuX2dldE91dGVyUmVzdWx0cyhBcnJheS5wcm90b3R5cGUuc2hpZnQpO1xuICAgIGlmICghdG9wKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuc2V0U2VsZWN0ZWRJbmRleCh0b3Auc2VydmljZU5hbWUsIHRvcC5kaXJlY3RvcnlOYW1lLCAwKTtcbiAgfVxuXG4gIF9nZXRPdXRlclJlc3VsdHMoYXJyYXlPcGVyYXRpb246IEZ1bmN0aW9uKTpcbiAgICA/e3NlcnZpY2VOYW1lOiBzdHJpbmc7IGRpcmVjdG9yeU5hbWU6IHN0cmluZzsgcmVzdWx0czogQXJyYXk8bWl4ZWQ+fSB7XG4gICAgY29uc3Qgbm9uRW1wdHlSZXN1bHRzID0gZmlsdGVyRW1wdHlSZXN1bHRzKHRoaXMuc3RhdGUucmVzdWx0c0J5U2VydmljZSk7XG4gICAgY29uc3Qgc2VydmljZU5hbWUgPSBhcnJheU9wZXJhdGlvbi5jYWxsKE9iamVjdC5rZXlzKG5vbkVtcHR5UmVzdWx0cykpO1xuICAgIGlmICghc2VydmljZU5hbWUpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCBzZXJ2aWNlID0gbm9uRW1wdHlSZXN1bHRzW3NlcnZpY2VOYW1lXTtcbiAgICBjb25zdCBkaXJlY3RvcnlOYW1lID0gYXJyYXlPcGVyYXRpb24uY2FsbChPYmplY3Qua2V5cyhzZXJ2aWNlLnJlc3VsdHMpKTtcbiAgICByZXR1cm4ge1xuICAgICAgc2VydmljZU5hbWUsXG4gICAgICBkaXJlY3RvcnlOYW1lLFxuICAgICAgcmVzdWx0czogbm9uRW1wdHlSZXN1bHRzW3NlcnZpY2VOYW1lXS5yZXN1bHRzW2RpcmVjdG9yeU5hbWVdLnJlc3VsdHMsXG4gICAgfTtcbiAgfVxuXG4gIGdldFNlbGVjdGVkSXRlbSgpOiA/T2JqZWN0IHtcbiAgICByZXR1cm4gdGhpcy5nZXRJdGVtQXRJbmRleChcbiAgICAgIHRoaXMuc3RhdGUuc2VsZWN0ZWRTZXJ2aWNlLFxuICAgICAgdGhpcy5zdGF0ZS5zZWxlY3RlZERpcmVjdG9yeSxcbiAgICAgIHRoaXMuc3RhdGUuc2VsZWN0ZWRJdGVtSW5kZXhcbiAgICApO1xuICB9XG5cbiAgZ2V0SXRlbUF0SW5kZXgoc2VydmljZU5hbWU6IHN0cmluZywgZGlyZWN0b3J5OiBzdHJpbmcsIGl0ZW1JbmRleDogbnVtYmVyKTogP09iamVjdCB7XG4gICAgaWYgKFxuICAgICAgaXRlbUluZGV4ID09PSAtMSB8fFxuICAgICAgIXRoaXMuc3RhdGUucmVzdWx0c0J5U2VydmljZVtzZXJ2aWNlTmFtZV0gfHxcbiAgICAgICF0aGlzLnN0YXRlLnJlc3VsdHNCeVNlcnZpY2Vbc2VydmljZU5hbWVdLnJlc3VsdHNbZGlyZWN0b3J5XSB8fFxuICAgICAgIXRoaXMuc3RhdGUucmVzdWx0c0J5U2VydmljZVtzZXJ2aWNlTmFtZV0ucmVzdWx0c1tkaXJlY3RvcnldLnJlc3VsdHNbaXRlbUluZGV4XVxuICAgICkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnN0YXRlLnJlc3VsdHNCeVNlcnZpY2Vbc2VydmljZU5hbWVdLnJlc3VsdHNbZGlyZWN0b3J5XS5yZXN1bHRzW2l0ZW1JbmRleF07XG4gIH1cblxuICBjb21wb25lbnRGb3JJdGVtKGl0ZW06IGFueSwgc2VydmljZU5hbWU6IHN0cmluZywgZGlyTmFtZTogc3RyaW5nKTogUmVhY3RFbGVtZW50IHtcbiAgICByZXR1cm4gc2VhcmNoUmVzdWx0TWFuYWdlci5nZXRSZW5kZXJlckZvclByb3ZpZGVyKHNlcnZpY2VOYW1lKShcbiAgICAgIGl0ZW0sXG4gICAgICBzZXJ2aWNlTmFtZSxcbiAgICAgIGRpck5hbWUsXG4gICAgKTtcbiAgfVxuXG4gIGdldFNlbGVjdGVkSW5kZXgoKTogU2VsZWN0aW9uIHtcbiAgICByZXR1cm4ge1xuICAgICAgc2VsZWN0ZWREaXJlY3Rvcnk6IHRoaXMuc3RhdGUuc2VsZWN0ZWREaXJlY3RvcnksXG4gICAgICBzZWxlY3RlZFNlcnZpY2U6IHRoaXMuc3RhdGUuc2VsZWN0ZWRTZXJ2aWNlLFxuICAgICAgc2VsZWN0ZWRJdGVtSW5kZXg6IHRoaXMuc3RhdGUuc2VsZWN0ZWRJdGVtSW5kZXgsXG4gICAgfTtcbiAgfVxuXG4gIHNldFNlbGVjdGVkSW5kZXgoc2VydmljZTogc3RyaW5nLCBkaXJlY3Rvcnk6IHN0cmluZywgaXRlbUluZGV4OiBudW1iZXIpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHNlbGVjdGVkU2VydmljZTogc2VydmljZSxcbiAgICAgIHNlbGVjdGVkRGlyZWN0b3J5OiBkaXJlY3RvcnksXG4gICAgICBzZWxlY3RlZEl0ZW1JbmRleDogaXRlbUluZGV4LFxuICAgIH0sICgpID0+IHtcbiAgICAgIHRoaXMuX2VtaXR0ZXIuZW1pdCgnc2VsZWN0aW9uLWNoYW5nZWQnLCB0aGlzLmdldFNlbGVjdGVkSW5kZXgoKSk7XG4gICAgICB0aGlzLm9uVXNlckRpZENoYW5nZVNlbGVjdGlvbigpO1xuICAgIH0pO1xuICB9XG5cbiAgcmVzZXRTZWxlY3Rpb24oKTogdm9pZCB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBzZWxlY3RlZFNlcnZpY2U6ICcnLFxuICAgICAgc2VsZWN0ZWREaXJlY3Rvcnk6ICcnLFxuICAgICAgc2VsZWN0ZWRJdGVtSW5kZXg6IC0xLFxuICAgICAgaGFzVXNlclNlbGVjdGlvbjogZmFsc2UsXG4gICAgfSk7XG4gIH1cblxuICBzZXRLZXlib2FyZFF1ZXJ5KHF1ZXJ5OiBzdHJpbmcpIHtcbiAgICB0aGlzLnJlc2V0U2VsZWN0aW9uKCk7XG4gICAgdGhpcy5zZXRRdWVyeShxdWVyeSk7XG4gIH1cblxuICBzZXRRdWVyeShxdWVyeTogc3RyaW5nKSB7XG4gICAgcmVxdWlyZSgnLi9RdWlja1NlbGVjdGlvbkFjdGlvbnMnKS5xdWVyeShxdWVyeSk7XG4gIH1cblxuICBnZXRQcm92aWRlcigpOiBQcm92aWRlclNwZWMge1xuICAgIHJldHVybiB0aGlzLnByb3BzLmFjdGl2ZVByb3ZpZGVyO1xuICB9XG5cbiAgZ2V0SW5wdXRUZXh0RWRpdG9yKCk6IGF0b20kVGV4dEVkaXRvckVsZW1lbnQge1xuICAgIHJldHVybiBSZWFjdERPTS5maW5kRE9NTm9kZSh0aGlzLnJlZnNbJ3F1ZXJ5SW5wdXQnXSk7XG4gIH1cblxuICBjbGVhcigpOiB2b2lkIHtcbiAgICB0aGlzLmdldElucHV0VGV4dEVkaXRvcigpLmdldE1vZGVsKCkuc2V0VGV4dCgnJyk7XG4gICAgdGhpcy5jbGVhclNlbGVjdGlvbigpO1xuICB9XG5cbiAgZm9jdXMoKTogdm9pZCB7XG4gICAgdGhpcy5nZXRJbnB1dFRleHRFZGl0b3IoKS5mb2N1cygpO1xuICB9XG5cbiAgYmx1cigpOiB2b2lkIHtcbiAgICB0aGlzLmdldElucHV0VGV4dEVkaXRvcigpLmJsdXIoKTtcbiAgfVxuXG4gIHNldElucHV0VmFsdWUodmFsdWU6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuX2dldFRleHRFZGl0b3IoKS5zZXRUZXh0KHZhbHVlKTtcbiAgfVxuXG4gIHNlbGVjdElucHV0KCk6IHZvaWQge1xuICAgIHRoaXMuX2dldFRleHRFZGl0b3IoKS5zZWxlY3RBbGwoKTtcbiAgfVxuXG4gIF9nZXRUZXh0RWRpdG9yKCk6IFRleHRFZGl0b3Ige1xuICAgIHJldHVybiB0aGlzLnJlZnNbJ3F1ZXJ5SW5wdXQnXS5nZXRUZXh0RWRpdG9yKCk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIG5ld1RhYiBpcyBhY3R1YWxseSBhIFByb3ZpZGVyU3BlYyBwbHVzIHRoZSBgbmFtZWAgYW5kIGB0YWJDb250ZW50YCBwcm9wZXJ0aWVzIGFkZGVkIGJ5XG4gICAqICAgICBfcmVuZGVyVGFicygpLCB3aGljaCBjcmVhdGVkIHRoZSB0YWIgb2JqZWN0IGluIHRoZSBmaXJzdCBwbGFjZS5cbiAgICovXG4gIF9oYW5kbGVUYWJDaGFuZ2UobmV3VGFiOiBQcm92aWRlclNwZWMpOiB2b2lkIHtcbiAgICBjb25zdCBwcm92aWRlck5hbWUgPSBuZXdUYWIubmFtZTtcbiAgICBpZiAocHJvdmlkZXJOYW1lICE9PSB0aGlzLnByb3BzLmFjdGl2ZVByb3ZpZGVyLm5hbWUpIHtcbiAgICAgIGlmICh0aGlzLnByb3BzLm9uUHJvdmlkZXJDaGFuZ2UpIHtcbiAgICAgICAgdGhpcy5wcm9wcy5vblByb3ZpZGVyQ2hhbmdlKHByb3ZpZGVyTmFtZSk7XG4gICAgICB9XG4gICAgICB0aGlzLl9lbWl0dGVyLmVtaXQoJ2FjdGl2ZS1wcm92aWRlci1jaGFuZ2VkJywgcHJvdmlkZXJOYW1lKTtcbiAgICB9XG4gICAgdGhpcy5yZWZzWydxdWVyeUlucHV0J10uZm9jdXMoKTtcbiAgfVxuXG4gIF9yZW5kZXJUYWJzKCk6IFJlYWN0RWxlbWVudCB7XG4gICAgY29uc3QgdGFicyA9IHRoaXMuc3RhdGUucmVuZGVyYWJsZVByb3ZpZGVycy5tYXAodGFiID0+IHtcbiAgICAgIGxldCBrZXlCaW5kaW5nID0gbnVsbDsvL1RPRE9cbiAgICAgIGNvbnN0IGh1bWFuaXplZEtleWJpbmRpbmcgPSBfZmluZEtleWJpbmRpbmdGb3JBY3Rpb24odGFiLmFjdGlvbiB8fCAnJywgdGhpcy5fbW9kYWxOb2RlKTtcbiAgICAgIGlmIChodW1hbml6ZWRLZXliaW5kaW5nICE9PSAnJykge1xuICAgICAgICBrZXlCaW5kaW5nID0gKFxuICAgICAgICAgIDxrYmQgY2xhc3NOYW1lPVwia2V5LWJpbmRpbmdcIj5cbiAgICAgICAgICAgIHtodW1hbml6ZWRLZXliaW5kaW5nfVxuICAgICAgICAgIDwva2JkPlxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4udGFiLFxuICAgICAgICBuYW1lOiB0YWIubmFtZSxcbiAgICAgICAgdGFiQ29udGVudDogPHNwYW4+e3RhYi50aXRsZX17a2V5QmluZGluZ308L3NwYW4+LFxuICAgICAgfTtcbiAgICB9KTtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJvbW5pc2VhcmNoLXRhYnNcIj5cbiAgICAgICAgPE51Y2xpZGVUYWJzXG4gICAgICAgICAgdGFicz17dGFic31cbiAgICAgICAgICBhY3RpdmVUYWJOYW1lPXt0aGlzLnN0YXRlLmFjdGl2ZVRhYi5uYW1lfVxuICAgICAgICAgIG9uQWN0aXZlVGFiQ2hhbmdlPXt0aGlzLl9ib3VuZEhhbmRsZVRhYkNoYW5nZX1cbiAgICAgICAgLz5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICBfcmVuZGVyRW1wdHlNZXNzYWdlKG1lc3NhZ2U6IHN0cmluZyB8IFJlYWN0RWxlbWVudCk6IFJlYWN0RWxlbWVudCB7XG4gICAgcmV0dXJuIChcbiAgICAgIDx1bCBjbGFzc05hbWU9XCJiYWNrZ3JvdW5kLW1lc3NhZ2UgY2VudGVyZWRcIj5cbiAgICAgICAgPGxpPnttZXNzYWdlfTwvbGk+XG4gICAgICA8L3VsPlxuICAgICk7XG4gIH1cblxuICBfaGFzTm9SZXN1bHRzKCk6IGJvb2xlYW4ge1xuICAgIGZvciAoY29uc3Qgc2VydmljZU5hbWUgaW4gdGhpcy5zdGF0ZS5yZXN1bHRzQnlTZXJ2aWNlKSB7XG4gICAgICBjb25zdCBzZXJ2aWNlID0gdGhpcy5zdGF0ZS5yZXN1bHRzQnlTZXJ2aWNlW3NlcnZpY2VOYW1lXTtcbiAgICAgIGZvciAoY29uc3QgZGlyTmFtZSBpbiBzZXJ2aWNlKSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdHMgPSBzZXJ2aWNlW2Rpck5hbWVdO1xuICAgICAgICBpZiAoIXJlc3VsdHMubG9hZGluZyAmJiByZXN1bHRzLnJlc3VsdHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIGxldCBudW1Ub3RhbFJlc3VsdHNSZW5kZXJlZCA9IDA7XG4gICAgY29uc3QgaXNPbW5pU2VhcmNoQWN0aXZlID0gdGhpcy5zdGF0ZS5hY3RpdmVUYWIubmFtZSA9PT0gJ09tbmlTZWFyY2hSZXN1bHRQcm92aWRlcic7XG4gICAgbGV0IG51bVF1ZXJpZXNPdXRzdGFuZGluZyA9IDA7XG4gICAgY29uc3Qgc2VydmljZU5hbWVzID0gT2JqZWN0LmtleXModGhpcy5zdGF0ZS5yZXN1bHRzQnlTZXJ2aWNlKTtcbiAgICBjb25zdCBzZXJ2aWNlcyA9IHNlcnZpY2VOYW1lcy5tYXAoc2VydmljZU5hbWUgPT4ge1xuICAgICAgbGV0IG51bVJlc3VsdHNGb3JTZXJ2aWNlID0gMDtcbiAgICAgIGNvbnN0IGRpcmVjdG9yaWVzID0gdGhpcy5zdGF0ZS5yZXN1bHRzQnlTZXJ2aWNlW3NlcnZpY2VOYW1lXS5yZXN1bHRzO1xuICAgICAgY29uc3Qgc2VydmljZVRpdGxlID0gdGhpcy5zdGF0ZS5yZXN1bHRzQnlTZXJ2aWNlW3NlcnZpY2VOYW1lXS50aXRsZTtcbiAgICAgIGNvbnN0IGRpcmVjdG9yeU5hbWVzID0gT2JqZWN0LmtleXMoZGlyZWN0b3JpZXMpO1xuICAgICAgY29uc3QgZGlyZWN0b3JpZXNGb3JTZXJ2aWNlID0gZGlyZWN0b3J5TmFtZXMubWFwKGRpck5hbWUgPT4ge1xuICAgICAgICBjb25zdCByZXN1bHRzRm9yRGlyZWN0b3J5ID0gZGlyZWN0b3JpZXNbZGlyTmFtZV07XG4gICAgICAgIGxldCBtZXNzYWdlID0gbnVsbDtcbiAgICAgICAgaWYgKHJlc3VsdHNGb3JEaXJlY3RvcnkubG9hZGluZykge1xuICAgICAgICAgIG51bVF1ZXJpZXNPdXRzdGFuZGluZysrO1xuICAgICAgICAgIGlmICghaXNPbW5pU2VhcmNoQWN0aXZlKSB7XG4gICAgICAgICAgICBudW1Ub3RhbFJlc3VsdHNSZW5kZXJlZCsrO1xuICAgICAgICAgICAgbWVzc2FnZSA9IChcbiAgICAgICAgICAgICAgPHNwYW4+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibG9hZGluZyBsb2FkaW5nLXNwaW5uZXItdGlueSBpbmxpbmUtYmxvY2tcIiAvPlxuICAgICAgICAgICAgICAgIExvYWRpbmcuLi5cbiAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAocmVzdWx0c0ZvckRpcmVjdG9yeS5lcnJvciAmJiAhaXNPbW5pU2VhcmNoQWN0aXZlKSB7XG4gICAgICAgICAgbWVzc2FnZSA9IChcbiAgICAgICAgICAgIDxzcGFuPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJpY29uIGljb24tY2lyY2xlLXNsYXNoXCIgLz5cbiAgICAgICAgICAgICAgRXJyb3I6IDxwcmU+e3Jlc3VsdHNGb3JEaXJlY3RvcnkuZXJyb3J9PC9wcmU+XG4gICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIGlmIChyZXN1bHRzRm9yRGlyZWN0b3J5LnJlc3VsdHMubGVuZ3RoID09PSAwICYmICFpc09tbmlTZWFyY2hBY3RpdmUpIHtcbiAgICAgICAgICBtZXNzYWdlID0gKFxuICAgICAgICAgICAgPHNwYW4+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImljb24gaWNvbi14XCIgLz5cbiAgICAgICAgICAgICAgTm8gcmVzdWx0c1xuICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaXRlbUNvbXBvbmVudHMgPSByZXN1bHRzRm9yRGlyZWN0b3J5LnJlc3VsdHMubWFwKChpdGVtLCBpdGVtSW5kZXgpID0+IHtcbiAgICAgICAgICBudW1SZXN1bHRzRm9yU2VydmljZSsrO1xuICAgICAgICAgIG51bVRvdGFsUmVzdWx0c1JlbmRlcmVkKys7XG4gICAgICAgICAgY29uc3QgaXNTZWxlY3RlZCA9IChcbiAgICAgICAgICAgIHNlcnZpY2VOYW1lID09PSB0aGlzLnN0YXRlLnNlbGVjdGVkU2VydmljZSAmJlxuICAgICAgICAgICAgZGlyTmFtZSA9PT0gdGhpcy5zdGF0ZS5zZWxlY3RlZERpcmVjdG9yeSAmJlxuICAgICAgICAgICAgaXRlbUluZGV4ID09PSB0aGlzLnN0YXRlLnNlbGVjdGVkSXRlbUluZGV4XG4gICAgICAgICAgKTtcbiAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGxpXG4gICAgICAgICAgICAgIGNsYXNzTmFtZT17Y2xhc3NuYW1lcyh7XG4gICAgICAgICAgICAgICAgJ3F1aWNrLW9wZW4tcmVzdWx0LWl0ZW0nOiB0cnVlLFxuICAgICAgICAgICAgICAgICdsaXN0LWl0ZW0nOiB0cnVlLFxuICAgICAgICAgICAgICAgIHNlbGVjdGVkOiBpc1NlbGVjdGVkLFxuICAgICAgICAgICAgICB9KX1cbiAgICAgICAgICAgICAga2V5PXtzZXJ2aWNlTmFtZSArIGRpck5hbWUgKyBpdGVtSW5kZXh9XG4gICAgICAgICAgICAgIG9uTW91c2VEb3duPXt0aGlzLl9ib3VuZFNlbGVjdH1cbiAgICAgICAgICAgICAgb25Nb3VzZUVudGVyPXt0aGlzLnNldFNlbGVjdGVkSW5kZXguYmluZCh0aGlzLCBzZXJ2aWNlTmFtZSwgZGlyTmFtZSwgaXRlbUluZGV4KX0+XG4gICAgICAgICAgICAgIHt0aGlzLmNvbXBvbmVudEZvckl0ZW0oaXRlbSwgc2VydmljZU5hbWUsIGRpck5hbWUpfVxuICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICApO1xuICAgICAgICB9KTtcbiAgICAgICAgbGV0IGRpcmVjdG9yeUxhYmVsID0gbnVsbDtcbiAgICAgICAgLy9oaWRlIGZvbGRlcnMgaWYgb25seSAxIGxldmVsIHdvdWxkIGJlIHNob3duLCBvciBpZiBubyByZXN1bHRzIHdlcmUgZm91bmRcbiAgICAgICAgY29uc3Qgc2hvd0RpcmVjdG9yaWVzID0gZGlyZWN0b3J5TmFtZXMubGVuZ3RoID4gMSAmJlxuICAgICAgICAgICghaXNPbW5pU2VhcmNoQWN0aXZlIHx8IHJlc3VsdHNGb3JEaXJlY3RvcnkucmVzdWx0cy5sZW5ndGggPiAwKTtcbiAgICAgICAgaWYgKHNob3dEaXJlY3Rvcmllcykge1xuICAgICAgICAgIGRpcmVjdG9yeUxhYmVsID0gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJsaXN0LWl0ZW1cIj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiaWNvbiBpY29uLWZpbGUtZGlyZWN0b3J5XCI+e2Rpck5hbWV9PC9zcGFuPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIDxsaSBjbGFzc05hbWU9e2NsYXNzbmFtZXMoeydsaXN0LW5lc3RlZC1pdGVtJzogc2hvd0RpcmVjdG9yaWVzfSl9IGtleT17ZGlyTmFtZX0+XG4gICAgICAgICAgICB7ZGlyZWN0b3J5TGFiZWx9XG4gICAgICAgICAgICB7bWVzc2FnZX1cbiAgICAgICAgICAgIDx1bCBjbGFzc05hbWU9XCJsaXN0LXRyZWVcIj5cbiAgICAgICAgICAgICAge2l0ZW1Db21wb25lbnRzfVxuICAgICAgICAgICAgPC91bD5cbiAgICAgICAgICA8L2xpPlxuICAgICAgICApO1xuICAgICAgfSk7XG4gICAgICBsZXQgc2VydmljZUxhYmVsID0gbnVsbDtcbiAgICAgIGlmIChpc09tbmlTZWFyY2hBY3RpdmUgJiYgbnVtUmVzdWx0c0ZvclNlcnZpY2UgPiAwKSB7XG4gICAgICAgIHNlcnZpY2VMYWJlbCA9IChcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImxpc3QtaXRlbVwiPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiaWNvbiBpY29uLWdlYXJcIj57c2VydmljZVRpdGxlfTwvc3Bhbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICA8bGkgY2xhc3NOYW1lPVwibGlzdC1uZXN0ZWQtaXRlbVwiIGtleT17c2VydmljZU5hbWV9PlxuICAgICAgICAgICAge3NlcnZpY2VMYWJlbH1cbiAgICAgICAgICAgIDx1bCBjbGFzc05hbWU9XCJsaXN0LXRyZWVcIj5cbiAgICAgICAgICAgICAge2RpcmVjdG9yaWVzRm9yU2VydmljZX1cbiAgICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgPC9saT5cbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBkaXJlY3Rvcmllc0ZvclNlcnZpY2U7XG4gICAgfSk7XG4gICAgbGV0IG5vUmVzdWx0c01lc3NhZ2UgPSBudWxsO1xuICAgIGlmIChvYmplY3QuaXNFbXB0eSh0aGlzLnN0YXRlLnJlc3VsdHNCeVNlcnZpY2UpKSB7XG4gICAgICBub1Jlc3VsdHNNZXNzYWdlID0gdGhpcy5fcmVuZGVyRW1wdHlNZXNzYWdlKCdTZWFyY2ggYXdheSEnKTtcbiAgICB9IGVsc2UgaWYgKG51bVRvdGFsUmVzdWx0c1JlbmRlcmVkID09PSAwKSB7XG4gICAgICBub1Jlc3VsdHNNZXNzYWdlID0gdGhpcy5fcmVuZGVyRW1wdHlNZXNzYWdlKDxzcGFuPsKvXFxfKOODhClfL8KvPGJyIC8+Tm8gcmVzdWx0czwvc3Bhbj4pO1xuICAgIH1cbiAgICBjb25zdCBjdXJyZW50UHJvdmlkZXIgPSB0aGlzLmdldFByb3ZpZGVyKCk7XG4gICAgY29uc3QgcHJvbXB0VGV4dCA9IChjdXJyZW50UHJvdmlkZXIgJiYgY3VycmVudFByb3ZpZGVyLnByb21wdCkgfHwgJyc7XG4gICAgbGV0IG9tbmlTZWFyY2hTdGF0dXMgPSBudWxsO1xuICAgIGlmIChpc09tbmlTZWFyY2hBY3RpdmUgJiYgbnVtUXVlcmllc091dHN0YW5kaW5nID4gMCkge1xuICAgICAgb21uaVNlYXJjaFN0YXR1cyA9IChcbiAgICAgICAgPHNwYW4+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibG9hZGluZyBsb2FkaW5nLXNwaW5uZXItdGlueSBpbmxpbmUtYmxvY2tcIiAvPlxuICAgICAgICAgIHtgTG9hZGluZy4uLmB9XG4gICAgICAgIDwvc3Bhbj5cbiAgICAgICk7XG4gICAgfVxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cInNlbGVjdC1saXN0IG9tbmlzZWFyY2gtbW9kYWxcIiByZWY9XCJtb2RhbFwiPlxuICAgICAgICA8QXRvbUlucHV0IHJlZj1cInF1ZXJ5SW5wdXRcIiBwbGFjZWhvbGRlclRleHQ9e3Byb21wdFRleHR9IC8+XG4gICAgICAgIHt0aGlzLl9yZW5kZXJUYWJzKCl9XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwib21uaXNlYXJjaC1yZXN1bHRzXCIgc3R5bGU9e3ttYXhIZWlnaHQ6IHRoaXMucHJvcHMubWF4U2Nyb2xsYWJsZUFyZWFIZWlnaHR9fT5cbiAgICAgICAgICB7bm9SZXN1bHRzTWVzc2FnZX1cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm9tbmlzZWFyY2gtcGFuZVwiPlxuICAgICAgICAgICAgPHVsIGNsYXNzTmFtZT1cImxpc3QtdHJlZVwiIHJlZj1cInNlbGVjdGlvbkxpc3RcIj5cbiAgICAgICAgICAgICAge3NlcnZpY2VzfVxuICAgICAgICAgICAgICB7b21uaVNlYXJjaFN0YXR1c31cbiAgICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxufVxuXG5RdWlja1NlbGVjdGlvbkNvbXBvbmVudC5wcm9wVHlwZXMgPSB7XG4gIGFjdGl2ZVByb3ZpZGVyOiBQcm9wVHlwZXMuc2hhcGUoe1xuICAgIGFjdGlvbjogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgIGRlYm91bmNlRGVsYXk6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbiAgICBuYW1lOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgcHJvbXB0OiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgdGl0bGU6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgfSkuaXNSZXF1aXJlZCxcbiAgb25Qcm92aWRlckNoYW5nZTogUHJvcFR5cGVzLmZ1bmMsXG4gIG1heFNjcm9sbGFibGVBcmVhSGVpZ2h0OiBQcm9wVHlwZXMubnVtYmVyLFxufTtcbiJdfQ==