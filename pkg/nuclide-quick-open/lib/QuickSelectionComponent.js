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

var _require = require('../../nuclide-ui/lib/AtomInput');

var AtomInput = _require.AtomInput;

var _require2 = require('../../nuclide-ui/lib/NuclideTabs');

var NuclideTabs = _require2.NuclideTabs;

var _require3 = require('atom');

var CompositeDisposable = _require3.CompositeDisposable;
var Emitter = _require3.Emitter;

var _require4 = require('../../nuclide-commons');

var debounce = _require4.debounce;
var object = _require4.object;

var _require5 = require('react-for-atom');

var React = _require5.React;
var ReactDOM = _require5.ReactDOM;

var searchResultManager = _SearchResultManager2['default'].getInstance();
var PropTypes = React.PropTypes;

var classnames = require('classnames');

var _require6 = require('./searchResultHelpers');

var filterEmptyResults = _require6.filterEmptyResults;

var _require7 = require('../../nuclide-remote-uri');

var nuclideUriToDisplayString = _require7.nuclideUriToDisplayString;

/**
 * Determine what the applicable shortcut for a given action is within this component's context.
 * For example, this will return different keybindings on windows vs linux.
 */
function _findKeybindingForAction(action, target) {
  var _require8 = require('../../nuclide-keystroke-label');

  var humanizeKeystroke = _require8.humanizeKeystroke;

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
                nuclideUriToDisplayString(dirName)
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlF1aWNrU2VsZWN0aW9uQ29tcG9uZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzttQ0FpRGdDLHVCQUF1Qjs7OztlQVpuQyxPQUFPLENBQUMsZ0NBQWdDLENBQUM7O0lBQXRELFNBQVMsWUFBVCxTQUFTOztnQkFDTSxPQUFPLENBQUMsa0NBQWtDLENBQUM7O0lBQTFELFdBQVcsYUFBWCxXQUFXOztnQkFDcUIsT0FBTyxDQUFDLE1BQU0sQ0FBQzs7SUFBL0MsbUJBQW1CLGFBQW5CLG1CQUFtQjtJQUFFLE9BQU8sYUFBUCxPQUFPOztnQkFJL0IsT0FBTyxDQUFDLHVCQUF1QixDQUFDOztJQUZsQyxRQUFRLGFBQVIsUUFBUTtJQUNSLE1BQU0sYUFBTixNQUFNOztnQkFLSixPQUFPLENBQUMsZ0JBQWdCLENBQUM7O0lBRjNCLEtBQUssYUFBTCxLQUFLO0lBQ0wsUUFBUSxhQUFSLFFBQVE7O0FBSVYsSUFBTSxtQkFBbUIsR0FBRyxpQ0FBb0IsV0FBVyxFQUFFLENBQUM7SUFDdkQsU0FBUyxHQUFJLEtBQUssQ0FBbEIsU0FBUzs7QUFDaEIsSUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDOztnQkFJckMsT0FBTyxDQUFDLHVCQUF1QixDQUFDOztJQURsQyxrQkFBa0IsYUFBbEIsa0JBQWtCOztnQkFFZ0IsT0FBTyxDQUFDLDBCQUEwQixDQUFDOztJQUFoRSx5QkFBeUIsYUFBekIseUJBQXlCOzs7Ozs7QUFNaEMsU0FBUyx3QkFBd0IsQ0FBQyxNQUFjLEVBQUUsTUFBbUIsRUFBVTtrQkFDakQsT0FBTyxDQUFDLCtCQUErQixDQUFDOztNQUE3RCxpQkFBaUIsYUFBakIsaUJBQWlCOztBQUN4QixNQUFNLG1CQUFtQixHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDO0FBQ3ZELFdBQU8sRUFBRSxNQUFNO0FBQ2YsVUFBTSxFQUFOLE1BQU07R0FDUCxDQUFDLENBQUM7QUFDSCxNQUFN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dWlja1NlbGVjdGlvbkNvbXBvbmVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtcbiAgUHJvdmlkZXJTcGVjLFxufSBmcm9tICcuL3R5cGVzJztcblxuaW1wb3J0IHR5cGUge1xuICBEaXJlY3RvcnlOYW1lLFxuICBHcm91cGVkUmVzdWx0LFxuICBTZXJ2aWNlTmFtZSxcbn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1xdWljay1vcGVuLWludGVyZmFjZXMnO1xuXG50eXBlIFJlc3VsdENvbnRleHQgPSB7XG4gIG5vbkVtcHR5UmVzdWx0czogR3JvdXBlZFJlc3VsdDtcbiAgc2VydmljZU5hbWVzOiBBcnJheTxTZXJ2aWNlTmFtZT47XG4gIGN1cnJlbnRTZXJ2aWNlSW5kZXg6IG51bWJlcjtcbiAgY3VycmVudFNlcnZpY2U6IE9iamVjdDtcbiAgZGlyZWN0b3J5TmFtZXM6IEFycmF5PERpcmVjdG9yeU5hbWU+O1xuICBjdXJyZW50RGlyZWN0b3J5SW5kZXg6IG51bWJlcjtcbiAgY3VycmVudERpcmVjdG9yeTogT2JqZWN0O1xufTtcblxudHlwZSBTZWxlY3Rpb24gPSB7XG4gIHNlbGVjdGVkRGlyZWN0b3J5OiBzdHJpbmc7XG4gIHNlbGVjdGVkU2VydmljZTogc3RyaW5nO1xuICBzZWxlY3RlZEl0ZW1JbmRleDogbnVtYmVyO1xufTtcblxuY29uc3Qge0F0b21JbnB1dH0gPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLXVpL2xpYi9BdG9tSW5wdXQnKTtcbmNvbnN0IHtOdWNsaWRlVGFic30gPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLXVpL2xpYi9OdWNsaWRlVGFicycpO1xuY29uc3Qge0NvbXBvc2l0ZURpc3Bvc2FibGUsIEVtaXR0ZXJ9ID0gcmVxdWlyZSgnYXRvbScpO1xuY29uc3Qge1xuICBkZWJvdW5jZSxcbiAgb2JqZWN0LFxufSA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtY29tbW9ucycpO1xuY29uc3Qge1xuICBSZWFjdCxcbiAgUmVhY3RET00sXG59ID0gcmVxdWlyZSgncmVhY3QtZm9yLWF0b20nKTtcblxuaW1wb3J0IFNlYXJjaFJlc3VsdE1hbmFnZXIgZnJvbSAnLi9TZWFyY2hSZXN1bHRNYW5hZ2VyJztcbmNvbnN0IHNlYXJjaFJlc3VsdE1hbmFnZXIgPSBTZWFyY2hSZXN1bHRNYW5hZ2VyLmdldEluc3RhbmNlKCk7XG5jb25zdCB7UHJvcFR5cGVzfSA9IFJlYWN0O1xuY29uc3QgY2xhc3NuYW1lcyA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxuY29uc3Qge1xuICBmaWx0ZXJFbXB0eVJlc3VsdHMsXG59ID0gcmVxdWlyZSgnLi9zZWFyY2hSZXN1bHRIZWxwZXJzJyk7XG5jb25zdCB7bnVjbGlkZVVyaVRvRGlzcGxheVN0cmluZ30gPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLXJlbW90ZS11cmknKTtcblxuLyoqXG4gKiBEZXRlcm1pbmUgd2hhdCB0aGUgYXBwbGljYWJsZSBzaG9ydGN1dCBmb3IgYSBnaXZlbiBhY3Rpb24gaXMgd2l0aGluIHRoaXMgY29tcG9uZW50J3MgY29udGV4dC5cbiAqIEZvciBleGFtcGxlLCB0aGlzIHdpbGwgcmV0dXJuIGRpZmZlcmVudCBrZXliaW5kaW5ncyBvbiB3aW5kb3dzIHZzIGxpbnV4LlxuICovXG5mdW5jdGlvbiBfZmluZEtleWJpbmRpbmdGb3JBY3Rpb24oYWN0aW9uOiBzdHJpbmcsIHRhcmdldDogSFRNTEVsZW1lbnQpOiBzdHJpbmcge1xuICBjb25zdCB7aHVtYW5pemVLZXlzdHJva2V9ID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1rZXlzdHJva2UtbGFiZWwnKTtcbiAgY29uc3QgbWF0Y2hpbmdLZXlCaW5kaW5ncyA9IGF0b20ua2V5bWFwcy5maW5kS2V5QmluZGluZ3Moe1xuICAgIGNvbW1hbmQ6IGFjdGlvbixcbiAgICB0YXJnZXQsXG4gIH0pO1xuICBjb25zdCBrZXlzdHJva2UgPSAobWF0Y2hpbmdLZXlCaW5kaW5ncy5sZW5ndGggJiYgbWF0Y2hpbmdLZXlCaW5kaW5nc1swXS5rZXlzdHJva2VzKSB8fCAnJztcbiAgcmV0dXJuIGh1bWFuaXplS2V5c3Ryb2tlKGtleXN0cm9rZSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFF1aWNrU2VsZWN0aW9uQ29tcG9uZW50IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgX2VtaXR0ZXI6IEVtaXR0ZXI7XG4gIF9zdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBfbW9kYWxOb2RlOiBIVE1MRWxlbWVudDtcbiAgX2RlYm91bmNlZFF1ZXJ5SGFuZGxlcjogKCkgPT4gdm9pZDtcbiAgX2JvdW5kU2VsZWN0OiAoKSA9PiB2b2lkO1xuICBfYm91bmRIYW5kbGVUYWJDaGFuZ2U6ICh0YWI6IFByb3ZpZGVyU3BlYykgPT4gdm9pZDtcbiAgc3RhdGU6IHtcbiAgICBhY3RpdmVQcm92aWRlck5hbWU/OiBzdHJpbmc7XG4gICAgYWN0aXZlVGFiOiBQcm92aWRlclNwZWM7XG4gICAgaGFzVXNlclNlbGVjdGlvbjogYm9vbGVhbjtcbiAgICByZXN1bHRzQnlTZXJ2aWNlOiBHcm91cGVkUmVzdWx0O1xuICAgIHJlbmRlcmFibGVQcm92aWRlcnM6IEFycmF5PFByb3ZpZGVyU3BlYz47XG4gICAgc2VsZWN0ZWRTZXJ2aWNlOiBzdHJpbmc7XG4gICAgc2VsZWN0ZWREaXJlY3Rvcnk6IHN0cmluZztcbiAgICBzZWxlY3RlZEl0ZW1JbmRleDogbnVtYmVyO1xuICB9O1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBPYmplY3QpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgdGhpcy5fZW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5fYm91bmRTZWxlY3QgPSAoKSA9PiB0aGlzLnNlbGVjdCgpO1xuICAgIHRoaXMuX2JvdW5kSGFuZGxlVGFiQ2hhbmdlID0gKHRhYjogUHJvdmlkZXJTcGVjKSA9PiB0aGlzLl9oYW5kbGVUYWJDaGFuZ2UodGFiKTtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgYWN0aXZlVGFiOiBzZWFyY2hSZXN1bHRNYW5hZ2VyLmdldFByb3ZpZGVyQnlOYW1lKHNlYXJjaFJlc3VsdE1hbmFnZXIuZ2V0QWN0aXZlUHJvdmlkZXJOYW1lKCkpLFxuICAgICAgLy8gdHJlYXRlZCBhcyBpbW11dGFibGVcbiAgICAgIHJlc3VsdHNCeVNlcnZpY2U6IHt9LFxuICAgICAgcmVuZGVyYWJsZVByb3ZpZGVyczogc2VhcmNoUmVzdWx0TWFuYWdlci5nZXRSZW5kZXJhYmxlUHJvdmlkZXJzKCksXG4gICAgICBzZWxlY3RlZFNlcnZpY2U6ICcnLFxuICAgICAgc2VsZWN0ZWREaXJlY3Rvcnk6ICcnLFxuICAgICAgc2VsZWN0ZWRJdGVtSW5kZXg6IC0xLFxuICAgICAgaGFzVXNlclNlbGVjdGlvbjogZmFsc2UsXG4gICAgfTtcbiAgICAodGhpczogYW55KS5oYW5kbGVQcm92aWRlcnNDaGFuZ2UgPSB0aGlzLmhhbmRsZVByb3ZpZGVyc0NoYW5nZS5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLmhhbmRsZVJlc3VsdHNDaGFuZ2UgPSB0aGlzLmhhbmRsZVJlc3VsdHNDaGFuZ2UuYmluZCh0aGlzKTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV4dFByb3BzOiBhbnkpIHtcbiAgICBpZiAobmV4dFByb3BzLmFjdGl2ZVByb3ZpZGVyICE9PSB0aGlzLnByb3BzLmFjdGl2ZVByb3ZpZGVyKSB7XG4gICAgICBpZiAobmV4dFByb3BzLmFjdGl2ZVByb3ZpZGVyKSB7XG4gICAgICAgIHRoaXMuX2dldFRleHRFZGl0b3IoKS5zZXRQbGFjZWhvbGRlclRleHQobmV4dFByb3BzLmFjdGl2ZVByb3ZpZGVyLnByb21wdCk7XG4gICAgICAgIGNvbnN0IG5ld1Jlc3VsdHMgPSB7fTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZShcbiAgICAgICAgICB7XG4gICAgICAgICAgICBhY3RpdmVUYWI6IG5leHRQcm9wcy5hY3RpdmVQcm92aWRlciB8fCB0aGlzLnN0YXRlLmFjdGl2ZVRhYixcbiAgICAgICAgICAgIHJlc3VsdHNCeVNlcnZpY2U6IG5ld1Jlc3VsdHMsXG4gICAgICAgICAgfSxcbiAgICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICBzZXRJbW1lZGlhdGUoKCkgPT4gdGhpcy5zZXRRdWVyeSh0aGlzLnJlZnNbJ3F1ZXJ5SW5wdXQnXS5nZXRUZXh0KCkpKTtcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVF1ZXJ5SGFuZGxlcigpO1xuICAgICAgICAgICAgdGhpcy5fZW1pdHRlci5lbWl0KCdpdGVtcy1jaGFuZ2VkJywgbmV3UmVzdWx0cyk7XG4gICAgICAgICAgfVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGNvbXBvbmVudERpZFVwZGF0ZShwcmV2UHJvcHM6IGFueSwgcHJldlN0YXRlOiBhbnkpIHtcbiAgICBpZiAocHJldlN0YXRlLnJlc3VsdHNCeVNlcnZpY2UgIT09IHRoaXMuc3RhdGUucmVzdWx0c0J5U2VydmljZSkge1xuICAgICAgdGhpcy5fZW1pdHRlci5lbWl0KCdpdGVtcy1jaGFuZ2VkJywgdGhpcy5zdGF0ZS5yZXN1bHRzQnlTZXJ2aWNlKTtcbiAgICB9XG5cbiAgICBpZiAoXG4gICAgICBwcmV2U3RhdGUuc2VsZWN0ZWRJdGVtSW5kZXggIT09IHRoaXMuc3RhdGUuc2VsZWN0ZWRJdGVtSW5kZXggfHxcbiAgICAgIHByZXZTdGF0ZS5zZWxlY3RlZFNlcnZpY2UgIT09IHRoaXMuc3RhdGUuc2VsZWN0ZWRTZXJ2aWNlIHx8XG4gICAgICBwcmV2U3RhdGUuc2VsZWN0ZWREaXJlY3RvcnkgIT09IHRoaXMuc3RhdGUuc2VsZWN0ZWREaXJlY3RvcnlcbiAgICApIHtcbiAgICAgIHRoaXMuX3VwZGF0ZVNjcm9sbFBvc2l0aW9uKCk7XG4gICAgfVxuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKTogdm9pZCB7XG4gICAgdGhpcy5fbW9kYWxOb2RlID0gUmVhY3RET00uZmluZERPTU5vZGUodGhpcyk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZChcbiAgICAgICAgdGhpcy5fbW9kYWxOb2RlLFxuICAgICAgICAnY29yZTptb3ZlLXRvLWJvdHRvbScsXG4gICAgICAgIHRoaXMuaGFuZGxlTW92ZVRvQm90dG9tLmJpbmQodGhpcylcbiAgICAgICksXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZCh0aGlzLl9tb2RhbE5vZGUsICdjb3JlOm1vdmUtdG8tdG9wJywgdGhpcy5oYW5kbGVNb3ZlVG9Ub3AuYmluZCh0aGlzKSksXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZCh0aGlzLl9tb2RhbE5vZGUsICdjb3JlOm1vdmUtZG93bicsIHRoaXMuaGFuZGxlTW92ZURvd24uYmluZCh0aGlzKSksXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZCh0aGlzLl9tb2RhbE5vZGUsICdjb3JlOm1vdmUtdXAnLCB0aGlzLmhhbmRsZU1vdmVVcC5iaW5kKHRoaXMpKSxcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKHRoaXMuX21vZGFsTm9kZSwgJ2NvcmU6Y29uZmlybScsIHRoaXMuc2VsZWN0LmJpbmQodGhpcykpLFxuICAgICk7XG5cbiAgICBjb25zdCBpbnB1dFRleHRFZGl0b3IgPSB0aGlzLmdldElucHV0VGV4dEVkaXRvcigpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgc2VhcmNoUmVzdWx0TWFuYWdlci5vbihcbiAgICAgICAgc2VhcmNoUmVzdWx0TWFuYWdlci5QUk9WSURFUlNfQ0hBTkdFRCxcbiAgICAgICAgdGhpcy5oYW5kbGVQcm92aWRlcnNDaGFuZ2VcbiAgICAgICksXG4gICAgICBzZWFyY2hSZXN1bHRNYW5hZ2VyLm9uKFxuICAgICAgICBzZWFyY2hSZXN1bHRNYW5hZ2VyLlJFU1VMVFNfQ0hBTkdFRCxcbiAgICAgICAgdGhpcy5oYW5kbGVSZXN1bHRzQ2hhbmdlXG4gICAgICApLFxuICAgICk7XG5cbiAgICB0aGlzLl91cGRhdGVRdWVyeUhhbmRsZXIoKTtcbiAgICBpbnB1dFRleHRFZGl0b3IuZ2V0TW9kZWwoKS5vbkRpZENoYW5nZSgoKSA9PiB0aGlzLl9oYW5kbGVUZXh0SW5wdXRDaGFuZ2UoKSk7XG4gICAgdGhpcy5jbGVhcigpO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKTogdm9pZCB7XG4gICAgdGhpcy5fZW1pdHRlci5kaXNwb3NlKCk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gIH1cblxuICBoYW5kbGVNb3ZlVG9Cb3R0b20oKTogdm9pZCB7XG4gICAgdGhpcy5tb3ZlU2VsZWN0aW9uVG9Cb3R0b20oKTtcbiAgICB0aGlzLm9uVXNlckRpZENoYW5nZVNlbGVjdGlvbigpO1xuICB9XG5cbiAgaGFuZGxlTW92ZVRvVG9wKCk6IHZvaWQge1xuICAgIHRoaXMubW92ZVNlbGVjdGlvblRvVG9wKCk7XG4gICAgdGhpcy5vblVzZXJEaWRDaGFuZ2VTZWxlY3Rpb24oKTtcbiAgfVxuXG4gIGhhbmRsZU1vdmVEb3duKCk6IHZvaWQge1xuICAgIHRoaXMubW92ZVNlbGVjdGlvbkRvd24oKTtcbiAgICB0aGlzLm9uVXNlckRpZENoYW5nZVNlbGVjdGlvbigpO1xuICB9XG5cbiAgaGFuZGxlTW92ZVVwKCk6IHZvaWQge1xuICAgIHRoaXMubW92ZVNlbGVjdGlvblVwKCk7XG4gICAgdGhpcy5vblVzZXJEaWRDaGFuZ2VTZWxlY3Rpb24oKTtcbiAgfVxuXG4gIG9uQ2FuY2VsbGF0aW9uKGNhbGxiYWNrOiAoKSA9PiB2b2lkKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9lbWl0dGVyLm9uKCdjYW5jZWxlZCcsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIG9uU2VsZWN0aW9uKGNhbGxiYWNrOiAoc2VsZWN0aW9uOiBhbnkpID0+IHZvaWQpOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX2VtaXR0ZXIub24oJ3NlbGVjdGVkJywgY2FsbGJhY2spO1xuICB9XG5cbiAgb25TZWxlY3Rpb25DaGFuZ2VkKGNhbGxiYWNrOiAoc2VsZWN0aW9uSW5kZXg6IGFueSkgPT4gdm9pZCk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fZW1pdHRlci5vbignc2VsZWN0aW9uLWNoYW5nZWQnLCBjYWxsYmFjayk7XG4gIH1cblxuICBvbkl0ZW1zQ2hhbmdlZChjYWxsYmFjazogKG5ld0l0ZW1zOiBHcm91cGVkUmVzdWx0KSA9PiB2b2lkKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9lbWl0dGVyLm9uKCdpdGVtcy1jaGFuZ2VkJywgY2FsbGJhY2spO1xuICB9XG5cbiAgX3VwZGF0ZVF1ZXJ5SGFuZGxlcigpOiB2b2lkIHtcbiAgICB0aGlzLl9kZWJvdW5jZWRRdWVyeUhhbmRsZXIgPSBkZWJvdW5jZShcbiAgICAgICgpID0+IHRoaXMuc2V0S2V5Ym9hcmRRdWVyeSh0aGlzLmdldElucHV0VGV4dEVkaXRvcigpLmdldE1vZGVsKCkuZ2V0VGV4dCgpKSxcbiAgICAgIHRoaXMuZ2V0UHJvdmlkZXIoKS5kZWJvdW5jZURlbGF5IHx8IDAsXG4gICAgICBmYWxzZVxuICAgICk7XG4gIH1cblxuICBfaGFuZGxlVGV4dElucHV0Q2hhbmdlKCk6IHZvaWQge1xuICAgIHRoaXMuX2RlYm91bmNlZFF1ZXJ5SGFuZGxlcigpO1xuICB9XG5cbiAgaGFuZGxlUmVzdWx0c0NoYW5nZSgpOiB2b2lkIHtcbiAgICB0aGlzLl91cGRhdGVSZXN1bHRzKHRoaXMucHJvcHMuYWN0aXZlUHJvdmlkZXIubmFtZSk7XG4gIH1cblxuICBfdXBkYXRlUmVzdWx0cyhhY3RpdmVQcm92aWRlck5hbWU6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IHVwZGF0ZWRSZXN1bHRzID0gc2VhcmNoUmVzdWx0TWFuYWdlci5nZXRSZXN1bHRzKFxuICAgICAgdGhpcy5yZWZzWydxdWVyeUlucHV0J10uZ2V0VGV4dCgpLFxuICAgICAgYWN0aXZlUHJvdmlkZXJOYW1lXG4gICAgKTtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHJlc3VsdHNCeVNlcnZpY2U6IHVwZGF0ZWRSZXN1bHRzLFxuICAgIH0sICgpID0+IHtcbiAgICAgIGlmICghdGhpcy5zdGF0ZS5oYXNVc2VyU2VsZWN0aW9uKSB7XG4gICAgICAgIHRoaXMubW92ZVNlbGVjdGlvblRvVG9wKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBoYW5kbGVQcm92aWRlcnNDaGFuZ2UoKTogdm9pZCB7XG4gICAgY29uc3QgcmVuZGVyYWJsZVByb3ZpZGVycyA9IHNlYXJjaFJlc3VsdE1hbmFnZXIuZ2V0UmVuZGVyYWJsZVByb3ZpZGVycygpO1xuICAgIGNvbnN0IGFjdGl2ZVByb3ZpZGVyTmFtZSA9IHNlYXJjaFJlc3VsdE1hbmFnZXIuZ2V0QWN0aXZlUHJvdmlkZXJOYW1lKCk7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICByZW5kZXJhYmxlUHJvdmlkZXJzLFxuICAgICAgYWN0aXZlUHJvdmlkZXJOYW1lLFxuICAgIH0pO1xuICAgIHRoaXMuX3VwZGF0ZVJlc3VsdHMoYWN0aXZlUHJvdmlkZXJOYW1lKTtcbiAgfVxuXG4gIHNlbGVjdCgpOiB2b2lkIHtcbiAgICBjb25zdCBzZWxlY3RlZEl0ZW0gPSB0aGlzLmdldFNlbGVjdGVkSXRlbSgpO1xuICAgIGlmICghc2VsZWN0ZWRJdGVtKSB7XG4gICAgICB0aGlzLmNhbmNlbCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9lbWl0dGVyLmVtaXQoJ3NlbGVjdGVkJywgc2VsZWN0ZWRJdGVtKTtcbiAgICB9XG4gIH1cblxuICBvblVzZXJEaWRDaGFuZ2VTZWxlY3Rpb24oKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBoYXNVc2VyU2VsZWN0aW9uOiB0cnVlLFxuICAgIH0pO1xuICB9XG5cbiAgY2FuY2VsKCk6IHZvaWQge1xuICAgIHRoaXMuX2VtaXR0ZXIuZW1pdCgnY2FuY2VsZWQnKTtcbiAgfVxuXG4gIGNsZWFyU2VsZWN0aW9uKCk6IHZvaWQge1xuICAgIHRoaXMuc2V0U2VsZWN0ZWRJbmRleCgnJywgJycsIC0xKTtcbiAgfVxuXG4gIF9nZXRDdXJyZW50UmVzdWx0Q29udGV4dCgpOiA/UmVzdWx0Q29udGV4dCB7XG4gICAgY29uc3Qgbm9uRW1wdHlSZXN1bHRzID0gZmlsdGVyRW1wdHlSZXN1bHRzKHRoaXMuc3RhdGUucmVzdWx0c0J5U2VydmljZSk7XG4gICAgY29uc3Qgc2VydmljZU5hbWVzID0gT2JqZWN0LmtleXMobm9uRW1wdHlSZXN1bHRzKTtcbiAgICBjb25zdCBjdXJyZW50U2VydmljZUluZGV4ID0gc2VydmljZU5hbWVzLmluZGV4T2YodGhpcy5zdGF0ZS5zZWxlY3RlZFNlcnZpY2UpO1xuICAgIGNvbnN0IGN1cnJlbnRTZXJ2aWNlID0gbm9uRW1wdHlSZXN1bHRzW3RoaXMuc3RhdGUuc2VsZWN0ZWRTZXJ2aWNlXTtcblxuICAgIGlmICghY3VycmVudFNlcnZpY2UpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IGRpcmVjdG9yeU5hbWVzID0gT2JqZWN0LmtleXMoY3VycmVudFNlcnZpY2UucmVzdWx0cyk7XG4gICAgY29uc3QgY3VycmVudERpcmVjdG9yeUluZGV4ID0gZGlyZWN0b3J5TmFtZXMuaW5kZXhPZih0aGlzLnN0YXRlLnNlbGVjdGVkRGlyZWN0b3J5KTtcbiAgICBjb25zdCBjdXJyZW50RGlyZWN0b3J5ID0gY3VycmVudFNlcnZpY2UucmVzdWx0c1t0aGlzLnN0YXRlLnNlbGVjdGVkRGlyZWN0b3J5XTtcblxuICAgIGlmICghY3VycmVudERpcmVjdG9yeSB8fCAhY3VycmVudERpcmVjdG9yeS5yZXN1bHRzKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgbm9uRW1wdHlSZXN1bHRzLFxuICAgICAgc2VydmljZU5hbWVzLFxuICAgICAgY3VycmVudFNlcnZpY2VJbmRleCxcbiAgICAgIGN1cnJlbnRTZXJ2aWNlLFxuICAgICAgZGlyZWN0b3J5TmFtZXMsXG4gICAgICBjdXJyZW50RGlyZWN0b3J5SW5kZXgsXG4gICAgICBjdXJyZW50RGlyZWN0b3J5LFxuICAgIH07XG4gIH1cblxuICBtb3ZlU2VsZWN0aW9uRG93bigpOiB2b2lkIHtcbiAgICBjb25zdCBjb250ZXh0ID0gdGhpcy5fZ2V0Q3VycmVudFJlc3VsdENvbnRleHQoKTtcbiAgICBpZiAoIWNvbnRleHQpIHtcbiAgICAgIHRoaXMubW92ZVNlbGVjdGlvblRvVG9wKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuc3RhdGUuc2VsZWN0ZWRJdGVtSW5kZXggPCBjb250ZXh0LmN1cnJlbnREaXJlY3RvcnkucmVzdWx0cy5sZW5ndGggLSAxKSB7XG4gICAgICAvLyBvbmx5IGJ1bXAgdGhlIGluZGV4IGlmIHJlbWFpbmluZyBpbiBjdXJyZW50IGRpcmVjdG9yeVxuICAgICAgdGhpcy5zZXRTZWxlY3RlZEluZGV4KFxuICAgICAgICB0aGlzLnN0YXRlLnNlbGVjdGVkU2VydmljZSxcbiAgICAgICAgdGhpcy5zdGF0ZS5zZWxlY3RlZERpcmVjdG9yeSxcbiAgICAgICAgdGhpcy5zdGF0ZS5zZWxlY3RlZEl0ZW1JbmRleCArIDFcbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIG90aGVyd2lzZSBnbyB0byBuZXh0IGRpcmVjdG9yeS4uLlxuICAgICAgaWYgKGNvbnRleHQuY3VycmVudERpcmVjdG9yeUluZGV4IDwgY29udGV4dC5kaXJlY3RvcnlOYW1lcy5sZW5ndGggLSAxKSB7XG4gICAgICAgIHRoaXMuc2V0U2VsZWN0ZWRJbmRleChcbiAgICAgICAgICB0aGlzLnN0YXRlLnNlbGVjdGVkU2VydmljZSxcbiAgICAgICAgICBjb250ZXh0LmRpcmVjdG9yeU5hbWVzW2NvbnRleHQuY3VycmVudERpcmVjdG9yeUluZGV4ICsgMV0sXG4gICAgICAgICAgMFxuICAgICAgICApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gLi4ub3IgdGhlIG5leHQgc2VydmljZS4uLlxuICAgICAgICBpZiAoY29udGV4dC5jdXJyZW50U2VydmljZUluZGV4IDwgY29udGV4dC5zZXJ2aWNlTmFtZXMubGVuZ3RoIC0gMSkge1xuICAgICAgICAgIGNvbnN0IG5ld1NlcnZpY2VOYW1lID0gY29udGV4dC5zZXJ2aWNlTmFtZXNbY29udGV4dC5jdXJyZW50U2VydmljZUluZGV4ICsgMV07XG4gICAgICAgICAgY29uc3QgbmV3RGlyZWN0b3J5TmFtZSA9XG4gICAgICAgICAgICBPYmplY3Qua2V5cyhjb250ZXh0Lm5vbkVtcHR5UmVzdWx0c1tuZXdTZXJ2aWNlTmFtZV0ucmVzdWx0cykuc2hpZnQoKTtcbiAgICAgICAgICB0aGlzLnNldFNlbGVjdGVkSW5kZXgobmV3U2VydmljZU5hbWUsIG5ld0RpcmVjdG9yeU5hbWUsIDApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIC4uLm9yIHdyYXAgYXJvdW5kIHRvIHRoZSB2ZXJ5IHRvcFxuICAgICAgICAgIHRoaXMubW92ZVNlbGVjdGlvblRvVG9wKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBtb3ZlU2VsZWN0aW9uVXAoKTogdm9pZCB7XG4gICAgY29uc3QgY29udGV4dCA9IHRoaXMuX2dldEN1cnJlbnRSZXN1bHRDb250ZXh0KCk7XG4gICAgaWYgKCFjb250ZXh0KSB7XG4gICAgICB0aGlzLm1vdmVTZWxlY3Rpb25Ub0JvdHRvbSgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnN0YXRlLnNlbGVjdGVkSXRlbUluZGV4ID4gMCkge1xuICAgICAgLy8gb25seSBkZWNyZWFzZSB0aGUgaW5kZXggaWYgcmVtYWluaW5nIGluIGN1cnJlbnQgZGlyZWN0b3J5XG4gICAgICB0aGlzLnNldFNlbGVjdGVkSW5kZXgoXG4gICAgICAgIHRoaXMuc3RhdGUuc2VsZWN0ZWRTZXJ2aWNlLFxuICAgICAgICB0aGlzLnN0YXRlLnNlbGVjdGVkRGlyZWN0b3J5LFxuICAgICAgICB0aGlzLnN0YXRlLnNlbGVjdGVkSXRlbUluZGV4IC0gMVxuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gb3RoZXJ3aXNlLCBnbyB0byB0aGUgcHJldmlvdXMgZGlyZWN0b3J5Li4uXG4gICAgICBpZiAoY29udGV4dC5jdXJyZW50RGlyZWN0b3J5SW5kZXggPiAwKSB7XG4gICAgICAgIHRoaXMuc2V0U2VsZWN0ZWRJbmRleChcbiAgICAgICAgICB0aGlzLnN0YXRlLnNlbGVjdGVkU2VydmljZSxcbiAgICAgICAgICBjb250ZXh0LmRpcmVjdG9yeU5hbWVzW2NvbnRleHQuY3VycmVudERpcmVjdG9yeUluZGV4IC0gMV0sXG4gICAgICAgICAgY29udGV4dC5jdXJyZW50U2VydmljZVxuICAgICAgICAgICAgLnJlc3VsdHNbY29udGV4dC5kaXJlY3RvcnlOYW1lc1tjb250ZXh0LmN1cnJlbnREaXJlY3RvcnlJbmRleCAtIDFdXS5yZXN1bHRzLmxlbmd0aCAtIDFcbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIC4uLm9yIHRoZSBwcmV2aW91cyBzZXJ2aWNlLi4uXG4gICAgICAgIGlmIChjb250ZXh0LmN1cnJlbnRTZXJ2aWNlSW5kZXggPiAwKSB7XG4gICAgICAgICAgY29uc3QgbmV3U2VydmljZU5hbWUgPSBjb250ZXh0LnNlcnZpY2VOYW1lc1tjb250ZXh0LmN1cnJlbnRTZXJ2aWNlSW5kZXggLSAxXTtcbiAgICAgICAgICBjb25zdCBuZXdEaXJlY3RvcnlOYW1lID1cbiAgICAgICAgICAgIE9iamVjdC5rZXlzKGNvbnRleHQubm9uRW1wdHlSZXN1bHRzW25ld1NlcnZpY2VOYW1lXS5yZXN1bHRzKS5wb3AoKTtcbiAgICAgICAgICBpZiAobmV3RGlyZWN0b3J5TmFtZSA9PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IHJlc3VsdHNGb3JEaXJlY3RvcnkgPVxuICAgICAgICAgICAgY29udGV4dC5ub25FbXB0eVJlc3VsdHNbbmV3U2VydmljZU5hbWVdLnJlc3VsdHNbbmV3RGlyZWN0b3J5TmFtZV07XG4gICAgICAgICAgaWYgKHJlc3VsdHNGb3JEaXJlY3RvcnkgPT0gbnVsbCB8fCByZXN1bHRzRm9yRGlyZWN0b3J5LnJlc3VsdHMgPT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLnNldFNlbGVjdGVkSW5kZXgoXG4gICAgICAgICAgICBuZXdTZXJ2aWNlTmFtZSxcbiAgICAgICAgICAgIG5ld0RpcmVjdG9yeU5hbWUsXG4gICAgICAgICAgICByZXN1bHRzRm9yRGlyZWN0b3J5LnJlc3VsdHMubGVuZ3RoIC0gMVxuICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gLi4ub3Igd3JhcCBhcm91bmQgdG8gdGhlIHZlcnkgYm90dG9tXG4gICAgICAgICAgdGhpcy5tb3ZlU2VsZWN0aW9uVG9Cb3R0b20oKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIFVwZGF0ZSB0aGUgc2Nyb2xsIHBvc2l0aW9uIG9mIHRoZSBsaXN0IHZpZXcgdG8gZW5zdXJlIHRoZSBzZWxlY3RlZCBpdGVtIGlzIHZpc2libGUuXG4gIF91cGRhdGVTY3JvbGxQb3NpdGlvbigpOiB2b2lkIHtcbiAgICBpZiAoISh0aGlzLnJlZnMgJiYgdGhpcy5yZWZzWydzZWxlY3Rpb25MaXN0J10pKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGxpc3ROb2RlID0gIFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMucmVmc1snc2VsZWN0aW9uTGlzdCddKTtcbiAgICBjb25zdCBzZWxlY3RlZE5vZGUgPSBsaXN0Tm9kZS5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdzZWxlY3RlZCcpWzBdO1xuICAgIC8vIGZhbHNlIGlzIHBhc3NlZCBmb3IgQGNlbnRlcklmTmVlZGVkIHBhcmFtZXRlciwgd2hpY2ggZGVmYXVsdHMgdG8gdHJ1ZS5cbiAgICAvLyBQYXNzaW5nIGZhbHNlIGNhdXNlcyB0aGUgbWluaW11bSBuZWNlc3Nhcnkgc2Nyb2xsIHRvIG9jY3VyLCBzbyB0aGUgc2VsZWN0aW9uIHN0aWNrcyB0byB0aGVcbiAgICAvLyB0b3AvYm90dG9tLlxuICAgIGlmIChzZWxlY3RlZE5vZGUpIHtcbiAgICAgIHNlbGVjdGVkTm9kZS5zY3JvbGxJbnRvVmlld0lmTmVlZGVkKGZhbHNlKTtcbiAgICB9XG4gIH1cblxuICBtb3ZlU2VsZWN0aW9uVG9Cb3R0b20oKTogdm9pZCB7XG4gICAgY29uc3QgYm90dG9tID0gdGhpcy5fZ2V0T3V0ZXJSZXN1bHRzKEFycmF5LnByb3RvdHlwZS5wb3ApO1xuICAgIGlmICghYm90dG9tKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuc2V0U2VsZWN0ZWRJbmRleChib3R0b20uc2VydmljZU5hbWUsIGJvdHRvbS5kaXJlY3RvcnlOYW1lLCBib3R0b20ucmVzdWx0cy5sZW5ndGggLSAxKTtcbiAgfVxuXG4gIG1vdmVTZWxlY3Rpb25Ub1RvcCgpOiB2b2lkIHtcbiAgICBjb25zdCB0b3AgPSB0aGlzLl9nZXRPdXRlclJlc3VsdHMoQXJyYXkucHJvdG90eXBlLnNoaWZ0KTtcbiAgICBpZiAoIXRvcCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLnNldFNlbGVjdGVkSW5kZXgodG9wLnNlcnZpY2VOYW1lLCB0b3AuZGlyZWN0b3J5TmFtZSwgMCk7XG4gIH1cblxuICBfZ2V0T3V0ZXJSZXN1bHRzKGFycmF5T3BlcmF0aW9uOiBGdW5jdGlvbik6XG4gICAgP3tzZXJ2aWNlTmFtZTogc3RyaW5nOyBkaXJlY3RvcnlOYW1lOiBzdHJpbmc7IHJlc3VsdHM6IEFycmF5PG1peGVkPn0ge1xuICAgIGNvbnN0IG5vbkVtcHR5UmVzdWx0cyA9IGZpbHRlckVtcHR5UmVzdWx0cyh0aGlzLnN0YXRlLnJlc3VsdHNCeVNlcnZpY2UpO1xuICAgIGNvbnN0IHNlcnZpY2VOYW1lID0gYXJyYXlPcGVyYXRpb24uY2FsbChPYmplY3Qua2V5cyhub25FbXB0eVJlc3VsdHMpKTtcbiAgICBpZiAoIXNlcnZpY2VOYW1lKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3Qgc2VydmljZSA9IG5vbkVtcHR5UmVzdWx0c1tzZXJ2aWNlTmFtZV07XG4gICAgY29uc3QgZGlyZWN0b3J5TmFtZSA9IGFycmF5T3BlcmF0aW9uLmNhbGwoT2JqZWN0LmtleXMoc2VydmljZS5yZXN1bHRzKSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHNlcnZpY2VOYW1lLFxuICAgICAgZGlyZWN0b3J5TmFtZSxcbiAgICAgIHJlc3VsdHM6IG5vbkVtcHR5UmVzdWx0c1tzZXJ2aWNlTmFtZV0ucmVzdWx0c1tkaXJlY3RvcnlOYW1lXS5yZXN1bHRzLFxuICAgIH07XG4gIH1cblxuICBnZXRTZWxlY3RlZEl0ZW0oKTogP09iamVjdCB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0SXRlbUF0SW5kZXgoXG4gICAgICB0aGlzLnN0YXRlLnNlbGVjdGVkU2VydmljZSxcbiAgICAgIHRoaXMuc3RhdGUuc2VsZWN0ZWREaXJlY3RvcnksXG4gICAgICB0aGlzLnN0YXRlLnNlbGVjdGVkSXRlbUluZGV4XG4gICAgKTtcbiAgfVxuXG4gIGdldEl0ZW1BdEluZGV4KHNlcnZpY2VOYW1lOiBzdHJpbmcsIGRpcmVjdG9yeTogc3RyaW5nLCBpdGVtSW5kZXg6IG51bWJlcik6ID9PYmplY3Qge1xuICAgIGlmIChcbiAgICAgIGl0ZW1JbmRleCA9PT0gLTEgfHxcbiAgICAgICF0aGlzLnN0YXRlLnJlc3VsdHNCeVNlcnZpY2Vbc2VydmljZU5hbWVdIHx8XG4gICAgICAhdGhpcy5zdGF0ZS5yZXN1bHRzQnlTZXJ2aWNlW3NlcnZpY2VOYW1lXS5yZXN1bHRzW2RpcmVjdG9yeV0gfHxcbiAgICAgICF0aGlzLnN0YXRlLnJlc3VsdHNCeVNlcnZpY2Vbc2VydmljZU5hbWVdLnJlc3VsdHNbZGlyZWN0b3J5XS5yZXN1bHRzW2l0ZW1JbmRleF1cbiAgICApIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5zdGF0ZS5yZXN1bHRzQnlTZXJ2aWNlW3NlcnZpY2VOYW1lXS5yZXN1bHRzW2RpcmVjdG9yeV0ucmVzdWx0c1tpdGVtSW5kZXhdO1xuICB9XG5cbiAgY29tcG9uZW50Rm9ySXRlbShpdGVtOiBhbnksIHNlcnZpY2VOYW1lOiBzdHJpbmcsIGRpck5hbWU6IHN0cmluZyk6IFJlYWN0RWxlbWVudCB7XG4gICAgcmV0dXJuIHNlYXJjaFJlc3VsdE1hbmFnZXIuZ2V0UmVuZGVyZXJGb3JQcm92aWRlcihzZXJ2aWNlTmFtZSkoXG4gICAgICBpdGVtLFxuICAgICAgc2VydmljZU5hbWUsXG4gICAgICBkaXJOYW1lLFxuICAgICk7XG4gIH1cblxuICBnZXRTZWxlY3RlZEluZGV4KCk6IFNlbGVjdGlvbiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHNlbGVjdGVkRGlyZWN0b3J5OiB0aGlzLnN0YXRlLnNlbGVjdGVkRGlyZWN0b3J5LFxuICAgICAgc2VsZWN0ZWRTZXJ2aWNlOiB0aGlzLnN0YXRlLnNlbGVjdGVkU2VydmljZSxcbiAgICAgIHNlbGVjdGVkSXRlbUluZGV4OiB0aGlzLnN0YXRlLnNlbGVjdGVkSXRlbUluZGV4LFxuICAgIH07XG4gIH1cblxuICBzZXRTZWxlY3RlZEluZGV4KHNlcnZpY2U6IHN0cmluZywgZGlyZWN0b3J5OiBzdHJpbmcsIGl0ZW1JbmRleDogbnVtYmVyKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBzZWxlY3RlZFNlcnZpY2U6IHNlcnZpY2UsXG4gICAgICBzZWxlY3RlZERpcmVjdG9yeTogZGlyZWN0b3J5LFxuICAgICAgc2VsZWN0ZWRJdGVtSW5kZXg6IGl0ZW1JbmRleCxcbiAgICB9LCAoKSA9PiB7XG4gICAgICB0aGlzLl9lbWl0dGVyLmVtaXQoJ3NlbGVjdGlvbi1jaGFuZ2VkJywgdGhpcy5nZXRTZWxlY3RlZEluZGV4KCkpO1xuICAgICAgdGhpcy5vblVzZXJEaWRDaGFuZ2VTZWxlY3Rpb24oKTtcbiAgICB9KTtcbiAgfVxuXG4gIHJlc2V0U2VsZWN0aW9uKCk6IHZvaWQge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgc2VsZWN0ZWRTZXJ2aWNlOiAnJyxcbiAgICAgIHNlbGVjdGVkRGlyZWN0b3J5OiAnJyxcbiAgICAgIHNlbGVjdGVkSXRlbUluZGV4OiAtMSxcbiAgICAgIGhhc1VzZXJTZWxlY3Rpb246IGZhbHNlLFxuICAgIH0pO1xuICB9XG5cbiAgc2V0S2V5Ym9hcmRRdWVyeShxdWVyeTogc3RyaW5nKSB7XG4gICAgdGhpcy5yZXNldFNlbGVjdGlvbigpO1xuICAgIHRoaXMuc2V0UXVlcnkocXVlcnkpO1xuICB9XG5cbiAgc2V0UXVlcnkocXVlcnk6IHN0cmluZykge1xuICAgIHJlcXVpcmUoJy4vUXVpY2tTZWxlY3Rpb25BY3Rpb25zJykucXVlcnkocXVlcnkpO1xuICB9XG5cbiAgZ2V0UHJvdmlkZXIoKTogUHJvdmlkZXJTcGVjIHtcbiAgICByZXR1cm4gdGhpcy5wcm9wcy5hY3RpdmVQcm92aWRlcjtcbiAgfVxuXG4gIGdldElucHV0VGV4dEVkaXRvcigpOiBhdG9tJFRleHRFZGl0b3JFbGVtZW50IHtcbiAgICByZXR1cm4gUmVhY3RET00uZmluZERPTU5vZGUodGhpcy5yZWZzWydxdWVyeUlucHV0J10pO1xuICB9XG5cbiAgY2xlYXIoKTogdm9pZCB7XG4gICAgdGhpcy5nZXRJbnB1dFRleHRFZGl0b3IoKS5nZXRNb2RlbCgpLnNldFRleHQoJycpO1xuICAgIHRoaXMuY2xlYXJTZWxlY3Rpb24oKTtcbiAgfVxuXG4gIGZvY3VzKCk6IHZvaWQge1xuICAgIHRoaXMuZ2V0SW5wdXRUZXh0RWRpdG9yKCkuZm9jdXMoKTtcbiAgfVxuXG4gIGJsdXIoKTogdm9pZCB7XG4gICAgdGhpcy5nZXRJbnB1dFRleHRFZGl0b3IoKS5ibHVyKCk7XG4gIH1cblxuICBzZXRJbnB1dFZhbHVlKHZhbHVlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLl9nZXRUZXh0RWRpdG9yKCkuc2V0VGV4dCh2YWx1ZSk7XG4gIH1cblxuICBzZWxlY3RJbnB1dCgpOiB2b2lkIHtcbiAgICB0aGlzLl9nZXRUZXh0RWRpdG9yKCkuc2VsZWN0QWxsKCk7XG4gIH1cblxuICBfZ2V0VGV4dEVkaXRvcigpOiBUZXh0RWRpdG9yIHtcbiAgICByZXR1cm4gdGhpcy5yZWZzWydxdWVyeUlucHV0J10uZ2V0VGV4dEVkaXRvcigpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBuZXdUYWIgaXMgYWN0dWFsbHkgYSBQcm92aWRlclNwZWMgcGx1cyB0aGUgYG5hbWVgIGFuZCBgdGFiQ29udGVudGAgcHJvcGVydGllcyBhZGRlZCBieVxuICAgKiAgICAgX3JlbmRlclRhYnMoKSwgd2hpY2ggY3JlYXRlZCB0aGUgdGFiIG9iamVjdCBpbiB0aGUgZmlyc3QgcGxhY2UuXG4gICAqL1xuICBfaGFuZGxlVGFiQ2hhbmdlKG5ld1RhYjogUHJvdmlkZXJTcGVjKTogdm9pZCB7XG4gICAgY29uc3QgcHJvdmlkZXJOYW1lID0gbmV3VGFiLm5hbWU7XG4gICAgaWYgKHByb3ZpZGVyTmFtZSAhPT0gdGhpcy5wcm9wcy5hY3RpdmVQcm92aWRlci5uYW1lKSB7XG4gICAgICBpZiAodGhpcy5wcm9wcy5vblByb3ZpZGVyQ2hhbmdlKSB7XG4gICAgICAgIHRoaXMucHJvcHMub25Qcm92aWRlckNoYW5nZShwcm92aWRlck5hbWUpO1xuICAgICAgfVxuICAgICAgdGhpcy5fZW1pdHRlci5lbWl0KCdhY3RpdmUtcHJvdmlkZXItY2hhbmdlZCcsIHByb3ZpZGVyTmFtZSk7XG4gICAgfVxuICAgIHRoaXMucmVmc1sncXVlcnlJbnB1dCddLmZvY3VzKCk7XG4gIH1cblxuICBfcmVuZGVyVGFicygpOiBSZWFjdEVsZW1lbnQge1xuICAgIGNvbnN0IHRhYnMgPSB0aGlzLnN0YXRlLnJlbmRlcmFibGVQcm92aWRlcnMubWFwKHRhYiA9PiB7XG4gICAgICBsZXQga2V5QmluZGluZyA9IG51bGw7Ly9UT0RPXG4gICAgICBjb25zdCBodW1hbml6ZWRLZXliaW5kaW5nID0gX2ZpbmRLZXliaW5kaW5nRm9yQWN0aW9uKHRhYi5hY3Rpb24gfHwgJycsIHRoaXMuX21vZGFsTm9kZSk7XG4gICAgICBpZiAoaHVtYW5pemVkS2V5YmluZGluZyAhPT0gJycpIHtcbiAgICAgICAga2V5QmluZGluZyA9IChcbiAgICAgICAgICA8a2JkIGNsYXNzTmFtZT1cImtleS1iaW5kaW5nXCI+XG4gICAgICAgICAgICB7aHVtYW5pemVkS2V5YmluZGluZ31cbiAgICAgICAgICA8L2tiZD5cbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLnRhYixcbiAgICAgICAgbmFtZTogdGFiLm5hbWUsXG4gICAgICAgIHRhYkNvbnRlbnQ6IDxzcGFuPnt0YWIudGl0bGV9e2tleUJpbmRpbmd9PC9zcGFuPixcbiAgICAgIH07XG4gICAgfSk7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwib21uaXNlYXJjaC10YWJzXCI+XG4gICAgICAgIDxOdWNsaWRlVGFic1xuICAgICAgICAgIHRhYnM9e3RhYnN9XG4gICAgICAgICAgYWN0aXZlVGFiTmFtZT17dGhpcy5zdGF0ZS5hY3RpdmVUYWIubmFtZX1cbiAgICAgICAgICBvbkFjdGl2ZVRhYkNoYW5nZT17dGhpcy5fYm91bmRIYW5kbGVUYWJDaGFuZ2V9XG4gICAgICAgIC8+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbiAgX3JlbmRlckVtcHR5TWVzc2FnZShtZXNzYWdlOiBzdHJpbmcgfCBSZWFjdEVsZW1lbnQpOiBSZWFjdEVsZW1lbnQge1xuICAgIHJldHVybiAoXG4gICAgICA8dWwgY2xhc3NOYW1lPVwiYmFja2dyb3VuZC1tZXNzYWdlIGNlbnRlcmVkXCI+XG4gICAgICAgIDxsaT57bWVzc2FnZX08L2xpPlxuICAgICAgPC91bD5cbiAgICApO1xuICB9XG5cbiAgX2hhc05vUmVzdWx0cygpOiBib29sZWFuIHtcbiAgICBmb3IgKGNvbnN0IHNlcnZpY2VOYW1lIGluIHRoaXMuc3RhdGUucmVzdWx0c0J5U2VydmljZSkge1xuICAgICAgY29uc3Qgc2VydmljZSA9IHRoaXMuc3RhdGUucmVzdWx0c0J5U2VydmljZVtzZXJ2aWNlTmFtZV07XG4gICAgICBmb3IgKGNvbnN0IGRpck5hbWUgaW4gc2VydmljZSkge1xuICAgICAgICBjb25zdCByZXN1bHRzID0gc2VydmljZVtkaXJOYW1lXTtcbiAgICAgICAgaWYgKCFyZXN1bHRzLmxvYWRpbmcgJiYgcmVzdWx0cy5yZXN1bHRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICBsZXQgbnVtVG90YWxSZXN1bHRzUmVuZGVyZWQgPSAwO1xuICAgIGNvbnN0IGlzT21uaVNlYXJjaEFjdGl2ZSA9IHRoaXMuc3RhdGUuYWN0aXZlVGFiLm5hbWUgPT09ICdPbW5pU2VhcmNoUmVzdWx0UHJvdmlkZXInO1xuICAgIGxldCBudW1RdWVyaWVzT3V0c3RhbmRpbmcgPSAwO1xuICAgIGNvbnN0IHNlcnZpY2VOYW1lcyA9IE9iamVjdC5rZXlzKHRoaXMuc3RhdGUucmVzdWx0c0J5U2VydmljZSk7XG4gICAgY29uc3Qgc2VydmljZXMgPSBzZXJ2aWNlTmFtZXMubWFwKHNlcnZpY2VOYW1lID0+IHtcbiAgICAgIGxldCBudW1SZXN1bHRzRm9yU2VydmljZSA9IDA7XG4gICAgICBjb25zdCBkaXJlY3RvcmllcyA9IHRoaXMuc3RhdGUucmVzdWx0c0J5U2VydmljZVtzZXJ2aWNlTmFtZV0ucmVzdWx0cztcbiAgICAgIGNvbnN0IHNlcnZpY2VUaXRsZSA9IHRoaXMuc3RhdGUucmVzdWx0c0J5U2VydmljZVtzZXJ2aWNlTmFtZV0udGl0bGU7XG4gICAgICBjb25zdCBkaXJlY3RvcnlOYW1lcyA9IE9iamVjdC5rZXlzKGRpcmVjdG9yaWVzKTtcbiAgICAgIGNvbnN0IGRpcmVjdG9yaWVzRm9yU2VydmljZSA9IGRpcmVjdG9yeU5hbWVzLm1hcChkaXJOYW1lID0+IHtcbiAgICAgICAgY29uc3QgcmVzdWx0c0ZvckRpcmVjdG9yeSA9IGRpcmVjdG9yaWVzW2Rpck5hbWVdO1xuICAgICAgICBsZXQgbWVzc2FnZSA9IG51bGw7XG4gICAgICAgIGlmIChyZXN1bHRzRm9yRGlyZWN0b3J5LmxvYWRpbmcpIHtcbiAgICAgICAgICBudW1RdWVyaWVzT3V0c3RhbmRpbmcrKztcbiAgICAgICAgICBpZiAoIWlzT21uaVNlYXJjaEFjdGl2ZSkge1xuICAgICAgICAgICAgbnVtVG90YWxSZXN1bHRzUmVuZGVyZWQrKztcbiAgICAgICAgICAgIG1lc3NhZ2UgPSAoXG4gICAgICAgICAgICAgIDxzcGFuPlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImxvYWRpbmcgbG9hZGluZy1zcGlubmVyLXRpbnkgaW5saW5lLWJsb2NrXCIgLz5cbiAgICAgICAgICAgICAgICBMb2FkaW5nLi4uXG4gICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHJlc3VsdHNGb3JEaXJlY3RvcnkuZXJyb3IgJiYgIWlzT21uaVNlYXJjaEFjdGl2ZSkge1xuICAgICAgICAgIG1lc3NhZ2UgPSAoXG4gICAgICAgICAgICA8c3Bhbj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiaWNvbiBpY29uLWNpcmNsZS1zbGFzaFwiIC8+XG4gICAgICAgICAgICAgIEVycm9yOiA8cHJlPntyZXN1bHRzRm9yRGlyZWN0b3J5LmVycm9yfTwvcHJlPlxuICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSBpZiAocmVzdWx0c0ZvckRpcmVjdG9yeS5yZXN1bHRzLmxlbmd0aCA9PT0gMCAmJiAhaXNPbW5pU2VhcmNoQWN0aXZlKSB7XG4gICAgICAgICAgbWVzc2FnZSA9IChcbiAgICAgICAgICAgIDxzcGFuPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJpY29uIGljb24teFwiIC8+XG4gICAgICAgICAgICAgIE5vIHJlc3VsdHNcbiAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGl0ZW1Db21wb25lbnRzID0gcmVzdWx0c0ZvckRpcmVjdG9yeS5yZXN1bHRzLm1hcCgoaXRlbSwgaXRlbUluZGV4KSA9PiB7XG4gICAgICAgICAgbnVtUmVzdWx0c0ZvclNlcnZpY2UrKztcbiAgICAgICAgICBudW1Ub3RhbFJlc3VsdHNSZW5kZXJlZCsrO1xuICAgICAgICAgIGNvbnN0IGlzU2VsZWN0ZWQgPSAoXG4gICAgICAgICAgICBzZXJ2aWNlTmFtZSA9PT0gdGhpcy5zdGF0ZS5zZWxlY3RlZFNlcnZpY2UgJiZcbiAgICAgICAgICAgIGRpck5hbWUgPT09IHRoaXMuc3RhdGUuc2VsZWN0ZWREaXJlY3RvcnkgJiZcbiAgICAgICAgICAgIGl0ZW1JbmRleCA9PT0gdGhpcy5zdGF0ZS5zZWxlY3RlZEl0ZW1JbmRleFxuICAgICAgICAgICk7XG4gICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxsaVxuICAgICAgICAgICAgICBjbGFzc05hbWU9e2NsYXNzbmFtZXMoe1xuICAgICAgICAgICAgICAgICdxdWljay1vcGVuLXJlc3VsdC1pdGVtJzogdHJ1ZSxcbiAgICAgICAgICAgICAgICAnbGlzdC1pdGVtJzogdHJ1ZSxcbiAgICAgICAgICAgICAgICBzZWxlY3RlZDogaXNTZWxlY3RlZCxcbiAgICAgICAgICAgICAgfSl9XG4gICAgICAgICAgICAgIGtleT17c2VydmljZU5hbWUgKyBkaXJOYW1lICsgaXRlbUluZGV4fVxuICAgICAgICAgICAgICBvbk1vdXNlRG93bj17dGhpcy5fYm91bmRTZWxlY3R9XG4gICAgICAgICAgICAgIG9uTW91c2VFbnRlcj17dGhpcy5zZXRTZWxlY3RlZEluZGV4LmJpbmQodGhpcywgc2VydmljZU5hbWUsIGRpck5hbWUsIGl0ZW1JbmRleCl9PlxuICAgICAgICAgICAgICB7dGhpcy5jb21wb25lbnRGb3JJdGVtKGl0ZW0sIHNlcnZpY2VOYW1lLCBkaXJOYW1lKX1cbiAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCBkaXJlY3RvcnlMYWJlbCA9IG51bGw7XG4gICAgICAgIC8vaGlkZSBmb2xkZXJzIGlmIG9ubHkgMSBsZXZlbCB3b3VsZCBiZSBzaG93biwgb3IgaWYgbm8gcmVzdWx0cyB3ZXJlIGZvdW5kXG4gICAgICAgIGNvbnN0IHNob3dEaXJlY3RvcmllcyA9IGRpcmVjdG9yeU5hbWVzLmxlbmd0aCA+IDEgJiZcbiAgICAgICAgICAoIWlzT21uaVNlYXJjaEFjdGl2ZSB8fCByZXN1bHRzRm9yRGlyZWN0b3J5LnJlc3VsdHMubGVuZ3RoID4gMCk7XG4gICAgICAgIGlmIChzaG93RGlyZWN0b3JpZXMpIHtcbiAgICAgICAgICBkaXJlY3RvcnlMYWJlbCA9IChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibGlzdC1pdGVtXCI+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImljb24gaWNvbi1maWxlLWRpcmVjdG9yeVwiPntudWNsaWRlVXJpVG9EaXNwbGF5U3RyaW5nKGRpck5hbWUpfTwvc3Bhbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICA8bGkgY2xhc3NOYW1lPXtjbGFzc25hbWVzKHsnbGlzdC1uZXN0ZWQtaXRlbSc6IHNob3dEaXJlY3Rvcmllc30pfSBrZXk9e2Rpck5hbWV9PlxuICAgICAgICAgICAge2RpcmVjdG9yeUxhYmVsfVxuICAgICAgICAgICAge21lc3NhZ2V9XG4gICAgICAgICAgICA8dWwgY2xhc3NOYW1lPVwibGlzdC10cmVlXCI+XG4gICAgICAgICAgICAgIHtpdGVtQ29tcG9uZW50c31cbiAgICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgPC9saT5cbiAgICAgICAgKTtcbiAgICAgIH0pO1xuICAgICAgbGV0IHNlcnZpY2VMYWJlbCA9IG51bGw7XG4gICAgICBpZiAoaXNPbW5pU2VhcmNoQWN0aXZlICYmIG51bVJlc3VsdHNGb3JTZXJ2aWNlID4gMCkge1xuICAgICAgICBzZXJ2aWNlTGFiZWwgPSAoXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJsaXN0LWl0ZW1cIj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImljb24gaWNvbi1nZWFyXCI+e3NlcnZpY2VUaXRsZX08L3NwYW4+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgPGxpIGNsYXNzTmFtZT1cImxpc3QtbmVzdGVkLWl0ZW1cIiBrZXk9e3NlcnZpY2VOYW1lfT5cbiAgICAgICAgICAgIHtzZXJ2aWNlTGFiZWx9XG4gICAgICAgICAgICA8dWwgY2xhc3NOYW1lPVwibGlzdC10cmVlXCI+XG4gICAgICAgICAgICAgIHtkaXJlY3Rvcmllc0ZvclNlcnZpY2V9XG4gICAgICAgICAgICA8L3VsPlxuICAgICAgICAgIDwvbGk+XG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICByZXR1cm4gZGlyZWN0b3JpZXNGb3JTZXJ2aWNlO1xuICAgIH0pO1xuICAgIGxldCBub1Jlc3VsdHNNZXNzYWdlID0gbnVsbDtcbiAgICBpZiAob2JqZWN0LmlzRW1wdHkodGhpcy5zdGF0ZS5yZXN1bHRzQnlTZXJ2aWNlKSkge1xuICAgICAgbm9SZXN1bHRzTWVzc2FnZSA9IHRoaXMuX3JlbmRlckVtcHR5TWVzc2FnZSgnU2VhcmNoIGF3YXkhJyk7XG4gICAgfSBlbHNlIGlmIChudW1Ub3RhbFJlc3VsdHNSZW5kZXJlZCA9PT0gMCkge1xuICAgICAgbm9SZXN1bHRzTWVzc2FnZSA9IHRoaXMuX3JlbmRlckVtcHR5TWVzc2FnZSg8c3Bhbj7Cr1xcXyjjg4QpXy/CrzxiciAvPk5vIHJlc3VsdHM8L3NwYW4+KTtcbiAgICB9XG4gICAgY29uc3QgY3VycmVudFByb3ZpZGVyID0gdGhpcy5nZXRQcm92aWRlcigpO1xuICAgIGNvbnN0IHByb21wdFRleHQgPSAoY3VycmVudFByb3ZpZGVyICYmIGN1cnJlbnRQcm92aWRlci5wcm9tcHQpIHx8ICcnO1xuICAgIGxldCBvbW5pU2VhcmNoU3RhdHVzID0gbnVsbDtcbiAgICBpZiAoaXNPbW5pU2VhcmNoQWN0aXZlICYmIG51bVF1ZXJpZXNPdXRzdGFuZGluZyA+IDApIHtcbiAgICAgIG9tbmlTZWFyY2hTdGF0dXMgPSAoXG4gICAgICAgIDxzcGFuPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImxvYWRpbmcgbG9hZGluZy1zcGlubmVyLXRpbnkgaW5saW5lLWJsb2NrXCIgLz5cbiAgICAgICAgICB7YExvYWRpbmcuLi5gfVxuICAgICAgICA8L3NwYW4+XG4gICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJzZWxlY3QtbGlzdCBvbW5pc2VhcmNoLW1vZGFsXCIgcmVmPVwibW9kYWxcIj5cbiAgICAgICAgPEF0b21JbnB1dCByZWY9XCJxdWVyeUlucHV0XCIgcGxhY2Vob2xkZXJUZXh0PXtwcm9tcHRUZXh0fSAvPlxuICAgICAgICB7dGhpcy5fcmVuZGVyVGFicygpfVxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm9tbmlzZWFyY2gtcmVzdWx0c1wiIHN0eWxlPXt7bWF4SGVpZ2h0OiB0aGlzLnByb3BzLm1heFNjcm9sbGFibGVBcmVhSGVpZ2h0fX0+XG4gICAgICAgICAge25vUmVzdWx0c01lc3NhZ2V9XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJvbW5pc2VhcmNoLXBhbmVcIj5cbiAgICAgICAgICAgIDx1bCBjbGFzc05hbWU9XCJsaXN0LXRyZWVcIiByZWY9XCJzZWxlY3Rpb25MaXN0XCI+XG4gICAgICAgICAgICAgIHtzZXJ2aWNlc31cbiAgICAgICAgICAgICAge29tbmlTZWFyY2hTdGF0dXN9XG4gICAgICAgICAgICA8L3VsPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cbn1cblxuUXVpY2tTZWxlY3Rpb25Db21wb25lbnQucHJvcFR5cGVzID0ge1xuICBhY3RpdmVQcm92aWRlcjogUHJvcFR5cGVzLnNoYXBlKHtcbiAgICBhY3Rpb246IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICBkZWJvdW5jZURlbGF5OiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gICAgbmFtZTogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgIHByb21wdDogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgIHRpdGxlOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gIH0pLmlzUmVxdWlyZWQsXG4gIG9uUHJvdmlkZXJDaGFuZ2U6IFByb3BUeXBlcy5mdW5jLFxuICBtYXhTY3JvbGxhYmxlQXJlYUhlaWdodDogUHJvcFR5cGVzLm51bWJlcixcbn07XG4iXX0=