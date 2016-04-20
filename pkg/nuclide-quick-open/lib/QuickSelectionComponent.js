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

var _require2 = require('../../nuclide-ui/lib/Tabs');

var Tabs = _require2.Tabs;

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
        React.createElement(Tabs, {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlF1aWNrU2VsZWN0aW9uQ29tcG9uZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzttQ0FpRGdDLHVCQUF1Qjs7OztlQVpuQyxPQUFPLENBQUMsZ0NBQWdDLENBQUM7O0lBQXRELFNBQVMsWUFBVCxTQUFTOztnQkFDRCxPQUFPLENBQUMsMkJBQTJCLENBQUM7O0lBQTVDLElBQUksYUFBSixJQUFJOztnQkFDNEIsT0FBTyxDQUFDLE1BQU0sQ0FBQzs7SUFBL0MsbUJBQW1CLGFBQW5CLG1CQUFtQjtJQUFFLE9BQU8sYUFBUCxPQUFPOztnQkFJL0IsT0FBTyxDQUFDLHVCQUF1QixDQUFDOztJQUZsQyxRQUFRLGFBQVIsUUFBUTtJQUNSLE1BQU0sYUFBTixNQUFNOztnQkFLSixPQUFPLENBQUMsZ0JBQWdCLENBQUM7O0lBRjNCLEtBQUssYUFBTCxLQUFLO0lBQ0wsUUFBUSxhQUFSLFFBQVE7O0FBSVYsSUFBTSxtQkFBbUIsR0FBRyxpQ0FBb0IsV0FBVyxFQUFFLENBQUM7SUFDdkQsU0FBUyxHQUFJLEtBQUssQ0FBbEIsU0FBUzs7QUFDaEIsSUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDOztnQkFJckMsT0FBTyxDQUFDLHVCQUF1QixDQUFDOztJQURsQyxrQkFBa0IsYUFBbEIsa0JBQWtCOztnQkFFZ0IsT0FBTyxDQUFDLDBCQUEwQixDQUFDOztJQUFoRSx5QkFBeUIsYUFBekIseUJBQXlCOzs7Ozs7QUFNaEMsU0FBUyx3QkFBd0IsQ0FBQyxNQUFjLEVBQUUsTUFBbUIsRUFBVTtrQkFDakQsT0FBTyxDQUFDLCtCQUErQixDQUFDOztNQUE3RCxpQkFBaUIsYUFBakIsaUJBQWlCOztBQUN4QixNQUFNLG1CQUFtQixHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDO0FBQ3ZELFdBQU8sRUFBRSxNQUFNO0FBQ2YsVUFBTSxFQUFOLE1BQU07R0FDUCxDQUFDLENBQUM7QUFDSCxNQUFN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dWlja1NlbGVjdGlvbkNvbXBvbmVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtcbiAgUHJvdmlkZXJTcGVjLFxufSBmcm9tICcuL3R5cGVzJztcblxuaW1wb3J0IHR5cGUge1xuICBEaXJlY3RvcnlOYW1lLFxuICBHcm91cGVkUmVzdWx0LFxuICBTZXJ2aWNlTmFtZSxcbn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1xdWljay1vcGVuLWludGVyZmFjZXMnO1xuXG50eXBlIFJlc3VsdENvbnRleHQgPSB7XG4gIG5vbkVtcHR5UmVzdWx0czogR3JvdXBlZFJlc3VsdDtcbiAgc2VydmljZU5hbWVzOiBBcnJheTxTZXJ2aWNlTmFtZT47XG4gIGN1cnJlbnRTZXJ2aWNlSW5kZXg6IG51bWJlcjtcbiAgY3VycmVudFNlcnZpY2U6IE9iamVjdDtcbiAgZGlyZWN0b3J5TmFtZXM6IEFycmF5PERpcmVjdG9yeU5hbWU+O1xuICBjdXJyZW50RGlyZWN0b3J5SW5kZXg6IG51bWJlcjtcbiAgY3VycmVudERpcmVjdG9yeTogT2JqZWN0O1xufTtcblxudHlwZSBTZWxlY3Rpb24gPSB7XG4gIHNlbGVjdGVkRGlyZWN0b3J5OiBzdHJpbmc7XG4gIHNlbGVjdGVkU2VydmljZTogc3RyaW5nO1xuICBzZWxlY3RlZEl0ZW1JbmRleDogbnVtYmVyO1xufTtcblxuY29uc3Qge0F0b21JbnB1dH0gPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLXVpL2xpYi9BdG9tSW5wdXQnKTtcbmNvbnN0IHtUYWJzfSA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtdWkvbGliL1RhYnMnKTtcbmNvbnN0IHtDb21wb3NpdGVEaXNwb3NhYmxlLCBFbWl0dGVyfSA9IHJlcXVpcmUoJ2F0b20nKTtcbmNvbnN0IHtcbiAgZGVib3VuY2UsXG4gIG9iamVjdCxcbn0gPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLWNvbW1vbnMnKTtcbmNvbnN0IHtcbiAgUmVhY3QsXG4gIFJlYWN0RE9NLFxufSA9IHJlcXVpcmUoJ3JlYWN0LWZvci1hdG9tJyk7XG5cbmltcG9ydCBTZWFyY2hSZXN1bHRNYW5hZ2VyIGZyb20gJy4vU2VhcmNoUmVzdWx0TWFuYWdlcic7XG5jb25zdCBzZWFyY2hSZXN1bHRNYW5hZ2VyID0gU2VhcmNoUmVzdWx0TWFuYWdlci5nZXRJbnN0YW5jZSgpO1xuY29uc3Qge1Byb3BUeXBlc30gPSBSZWFjdDtcbmNvbnN0IGNsYXNzbmFtZXMgPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbmNvbnN0IHtcbiAgZmlsdGVyRW1wdHlSZXN1bHRzLFxufSA9IHJlcXVpcmUoJy4vc2VhcmNoUmVzdWx0SGVscGVycycpO1xuY29uc3Qge251Y2xpZGVVcmlUb0Rpc3BsYXlTdHJpbmd9ID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1yZW1vdGUtdXJpJyk7XG5cbi8qKlxuICogRGV0ZXJtaW5lIHdoYXQgdGhlIGFwcGxpY2FibGUgc2hvcnRjdXQgZm9yIGEgZ2l2ZW4gYWN0aW9uIGlzIHdpdGhpbiB0aGlzIGNvbXBvbmVudCdzIGNvbnRleHQuXG4gKiBGb3IgZXhhbXBsZSwgdGhpcyB3aWxsIHJldHVybiBkaWZmZXJlbnQga2V5YmluZGluZ3Mgb24gd2luZG93cyB2cyBsaW51eC5cbiAqL1xuZnVuY3Rpb24gX2ZpbmRLZXliaW5kaW5nRm9yQWN0aW9uKGFjdGlvbjogc3RyaW5nLCB0YXJnZXQ6IEhUTUxFbGVtZW50KTogc3RyaW5nIHtcbiAgY29uc3Qge2h1bWFuaXplS2V5c3Ryb2tlfSA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUta2V5c3Ryb2tlLWxhYmVsJyk7XG4gIGNvbnN0IG1hdGNoaW5nS2V5QmluZGluZ3MgPSBhdG9tLmtleW1hcHMuZmluZEtleUJpbmRpbmdzKHtcbiAgICBjb21tYW5kOiBhY3Rpb24sXG4gICAgdGFyZ2V0LFxuICB9KTtcbiAgY29uc3Qga2V5c3Ryb2tlID0gKG1hdGNoaW5nS2V5QmluZGluZ3MubGVuZ3RoICYmIG1hdGNoaW5nS2V5QmluZGluZ3NbMF0ua2V5c3Ryb2tlcykgfHwgJyc7XG4gIHJldHVybiBodW1hbml6ZUtleXN0cm9rZShrZXlzdHJva2UpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBRdWlja1NlbGVjdGlvbkNvbXBvbmVudCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIF9lbWl0dGVyOiBFbWl0dGVyO1xuICBfc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX21vZGFsTm9kZTogSFRNTEVsZW1lbnQ7XG4gIF9kZWJvdW5jZWRRdWVyeUhhbmRsZXI6ICgpID0+IHZvaWQ7XG4gIF9ib3VuZFNlbGVjdDogKCkgPT4gdm9pZDtcbiAgX2JvdW5kSGFuZGxlVGFiQ2hhbmdlOiAodGFiOiBQcm92aWRlclNwZWMpID0+IHZvaWQ7XG4gIHN0YXRlOiB7XG4gICAgYWN0aXZlUHJvdmlkZXJOYW1lPzogc3RyaW5nO1xuICAgIGFjdGl2ZVRhYjogUHJvdmlkZXJTcGVjO1xuICAgIGhhc1VzZXJTZWxlY3Rpb246IGJvb2xlYW47XG4gICAgcmVzdWx0c0J5U2VydmljZTogR3JvdXBlZFJlc3VsdDtcbiAgICByZW5kZXJhYmxlUHJvdmlkZXJzOiBBcnJheTxQcm92aWRlclNwZWM+O1xuICAgIHNlbGVjdGVkU2VydmljZTogc3RyaW5nO1xuICAgIHNlbGVjdGVkRGlyZWN0b3J5OiBzdHJpbmc7XG4gICAgc2VsZWN0ZWRJdGVtSW5kZXg6IG51bWJlcjtcbiAgfTtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogT2JqZWN0KSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIHRoaXMuX2VtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHRoaXMuX2JvdW5kU2VsZWN0ID0gKCkgPT4gdGhpcy5zZWxlY3QoKTtcbiAgICB0aGlzLl9ib3VuZEhhbmRsZVRhYkNoYW5nZSA9ICh0YWI6IFByb3ZpZGVyU3BlYykgPT4gdGhpcy5faGFuZGxlVGFiQ2hhbmdlKHRhYik7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIGFjdGl2ZVRhYjogc2VhcmNoUmVzdWx0TWFuYWdlci5nZXRQcm92aWRlckJ5TmFtZShzZWFyY2hSZXN1bHRNYW5hZ2VyLmdldEFjdGl2ZVByb3ZpZGVyTmFtZSgpKSxcbiAgICAgIC8vIHRyZWF0ZWQgYXMgaW1tdXRhYmxlXG4gICAgICByZXN1bHRzQnlTZXJ2aWNlOiB7fSxcbiAgICAgIHJlbmRlcmFibGVQcm92aWRlcnM6IHNlYXJjaFJlc3VsdE1hbmFnZXIuZ2V0UmVuZGVyYWJsZVByb3ZpZGVycygpLFxuICAgICAgc2VsZWN0ZWRTZXJ2aWNlOiAnJyxcbiAgICAgIHNlbGVjdGVkRGlyZWN0b3J5OiAnJyxcbiAgICAgIHNlbGVjdGVkSXRlbUluZGV4OiAtMSxcbiAgICAgIGhhc1VzZXJTZWxlY3Rpb246IGZhbHNlLFxuICAgIH07XG4gICAgKHRoaXM6IGFueSkuaGFuZGxlUHJvdmlkZXJzQ2hhbmdlID0gdGhpcy5oYW5kbGVQcm92aWRlcnNDaGFuZ2UuYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5oYW5kbGVSZXN1bHRzQ2hhbmdlID0gdGhpcy5oYW5kbGVSZXN1bHRzQ2hhbmdlLmJpbmQodGhpcyk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5leHRQcm9wczogYW55KSB7XG4gICAgaWYgKG5leHRQcm9wcy5hY3RpdmVQcm92aWRlciAhPT0gdGhpcy5wcm9wcy5hY3RpdmVQcm92aWRlcikge1xuICAgICAgaWYgKG5leHRQcm9wcy5hY3RpdmVQcm92aWRlcikge1xuICAgICAgICB0aGlzLl9nZXRUZXh0RWRpdG9yKCkuc2V0UGxhY2Vob2xkZXJUZXh0KG5leHRQcm9wcy5hY3RpdmVQcm92aWRlci5wcm9tcHQpO1xuICAgICAgICBjb25zdCBuZXdSZXN1bHRzID0ge307XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoXG4gICAgICAgICAge1xuICAgICAgICAgICAgYWN0aXZlVGFiOiBuZXh0UHJvcHMuYWN0aXZlUHJvdmlkZXIgfHwgdGhpcy5zdGF0ZS5hY3RpdmVUYWIsXG4gICAgICAgICAgICByZXN1bHRzQnlTZXJ2aWNlOiBuZXdSZXN1bHRzLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgc2V0SW1tZWRpYXRlKCgpID0+IHRoaXMuc2V0UXVlcnkodGhpcy5yZWZzWydxdWVyeUlucHV0J10uZ2V0VGV4dCgpKSk7XG4gICAgICAgICAgICB0aGlzLl91cGRhdGVRdWVyeUhhbmRsZXIoKTtcbiAgICAgICAgICAgIHRoaXMuX2VtaXR0ZXIuZW1pdCgnaXRlbXMtY2hhbmdlZCcsIG5ld1Jlc3VsdHMpO1xuICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBjb21wb25lbnREaWRVcGRhdGUocHJldlByb3BzOiBhbnksIHByZXZTdGF0ZTogYW55KSB7XG4gICAgaWYgKHByZXZTdGF0ZS5yZXN1bHRzQnlTZXJ2aWNlICE9PSB0aGlzLnN0YXRlLnJlc3VsdHNCeVNlcnZpY2UpIHtcbiAgICAgIHRoaXMuX2VtaXR0ZXIuZW1pdCgnaXRlbXMtY2hhbmdlZCcsIHRoaXMuc3RhdGUucmVzdWx0c0J5U2VydmljZSk7XG4gICAgfVxuXG4gICAgaWYgKFxuICAgICAgcHJldlN0YXRlLnNlbGVjdGVkSXRlbUluZGV4ICE9PSB0aGlzLnN0YXRlLnNlbGVjdGVkSXRlbUluZGV4IHx8XG4gICAgICBwcmV2U3RhdGUuc2VsZWN0ZWRTZXJ2aWNlICE9PSB0aGlzLnN0YXRlLnNlbGVjdGVkU2VydmljZSB8fFxuICAgICAgcHJldlN0YXRlLnNlbGVjdGVkRGlyZWN0b3J5ICE9PSB0aGlzLnN0YXRlLnNlbGVjdGVkRGlyZWN0b3J5XG4gICAgKSB7XG4gICAgICB0aGlzLl91cGRhdGVTY3JvbGxQb3NpdGlvbigpO1xuICAgIH1cbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCk6IHZvaWQge1xuICAgIHRoaXMuX21vZGFsTm9kZSA9IFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoXG4gICAgICAgIHRoaXMuX21vZGFsTm9kZSxcbiAgICAgICAgJ2NvcmU6bW92ZS10by1ib3R0b20nLFxuICAgICAgICB0aGlzLmhhbmRsZU1vdmVUb0JvdHRvbS5iaW5kKHRoaXMpXG4gICAgICApLFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQodGhpcy5fbW9kYWxOb2RlLCAnY29yZTptb3ZlLXRvLXRvcCcsIHRoaXMuaGFuZGxlTW92ZVRvVG9wLmJpbmQodGhpcykpLFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQodGhpcy5fbW9kYWxOb2RlLCAnY29yZTptb3ZlLWRvd24nLCB0aGlzLmhhbmRsZU1vdmVEb3duLmJpbmQodGhpcykpLFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQodGhpcy5fbW9kYWxOb2RlLCAnY29yZTptb3ZlLXVwJywgdGhpcy5oYW5kbGVNb3ZlVXAuYmluZCh0aGlzKSksXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZCh0aGlzLl9tb2RhbE5vZGUsICdjb3JlOmNvbmZpcm0nLCB0aGlzLnNlbGVjdC5iaW5kKHRoaXMpKSxcbiAgICApO1xuXG4gICAgY29uc3QgaW5wdXRUZXh0RWRpdG9yID0gdGhpcy5nZXRJbnB1dFRleHRFZGl0b3IoKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIHNlYXJjaFJlc3VsdE1hbmFnZXIub24oXG4gICAgICAgIHNlYXJjaFJlc3VsdE1hbmFnZXIuUFJPVklERVJTX0NIQU5HRUQsXG4gICAgICAgIHRoaXMuaGFuZGxlUHJvdmlkZXJzQ2hhbmdlXG4gICAgICApLFxuICAgICAgc2VhcmNoUmVzdWx0TWFuYWdlci5vbihcbiAgICAgICAgc2VhcmNoUmVzdWx0TWFuYWdlci5SRVNVTFRTX0NIQU5HRUQsXG4gICAgICAgIHRoaXMuaGFuZGxlUmVzdWx0c0NoYW5nZVxuICAgICAgKSxcbiAgICApO1xuXG4gICAgdGhpcy5fdXBkYXRlUXVlcnlIYW5kbGVyKCk7XG4gICAgaW5wdXRUZXh0RWRpdG9yLmdldE1vZGVsKCkub25EaWRDaGFuZ2UoKCkgPT4gdGhpcy5faGFuZGxlVGV4dElucHV0Q2hhbmdlKCkpO1xuICAgIHRoaXMuY2xlYXIoKTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCk6IHZvaWQge1xuICAgIHRoaXMuX2VtaXR0ZXIuZGlzcG9zZSgpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICB9XG5cbiAgaGFuZGxlTW92ZVRvQm90dG9tKCk6IHZvaWQge1xuICAgIHRoaXMubW92ZVNlbGVjdGlvblRvQm90dG9tKCk7XG4gICAgdGhpcy5vblVzZXJEaWRDaGFuZ2VTZWxlY3Rpb24oKTtcbiAgfVxuXG4gIGhhbmRsZU1vdmVUb1RvcCgpOiB2b2lkIHtcbiAgICB0aGlzLm1vdmVTZWxlY3Rpb25Ub1RvcCgpO1xuICAgIHRoaXMub25Vc2VyRGlkQ2hhbmdlU2VsZWN0aW9uKCk7XG4gIH1cblxuICBoYW5kbGVNb3ZlRG93bigpOiB2b2lkIHtcbiAgICB0aGlzLm1vdmVTZWxlY3Rpb25Eb3duKCk7XG4gICAgdGhpcy5vblVzZXJEaWRDaGFuZ2VTZWxlY3Rpb24oKTtcbiAgfVxuXG4gIGhhbmRsZU1vdmVVcCgpOiB2b2lkIHtcbiAgICB0aGlzLm1vdmVTZWxlY3Rpb25VcCgpO1xuICAgIHRoaXMub25Vc2VyRGlkQ2hhbmdlU2VsZWN0aW9uKCk7XG4gIH1cblxuICBvbkNhbmNlbGxhdGlvbihjYWxsYmFjazogKCkgPT4gdm9pZCk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fZW1pdHRlci5vbignY2FuY2VsZWQnLCBjYWxsYmFjayk7XG4gIH1cblxuICBvblNlbGVjdGlvbihjYWxsYmFjazogKHNlbGVjdGlvbjogYW55KSA9PiB2b2lkKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9lbWl0dGVyLm9uKCdzZWxlY3RlZCcsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIG9uU2VsZWN0aW9uQ2hhbmdlZChjYWxsYmFjazogKHNlbGVjdGlvbkluZGV4OiBhbnkpID0+IHZvaWQpOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX2VtaXR0ZXIub24oJ3NlbGVjdGlvbi1jaGFuZ2VkJywgY2FsbGJhY2spO1xuICB9XG5cbiAgb25JdGVtc0NoYW5nZWQoY2FsbGJhY2s6IChuZXdJdGVtczogR3JvdXBlZFJlc3VsdCkgPT4gdm9pZCk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fZW1pdHRlci5vbignaXRlbXMtY2hhbmdlZCcsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIF91cGRhdGVRdWVyeUhhbmRsZXIoKTogdm9pZCB7XG4gICAgdGhpcy5fZGVib3VuY2VkUXVlcnlIYW5kbGVyID0gZGVib3VuY2UoXG4gICAgICAoKSA9PiB0aGlzLnNldEtleWJvYXJkUXVlcnkodGhpcy5nZXRJbnB1dFRleHRFZGl0b3IoKS5nZXRNb2RlbCgpLmdldFRleHQoKSksXG4gICAgICB0aGlzLmdldFByb3ZpZGVyKCkuZGVib3VuY2VEZWxheSB8fCAwLFxuICAgICAgZmFsc2VcbiAgICApO1xuICB9XG5cbiAgX2hhbmRsZVRleHRJbnB1dENoYW5nZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9kZWJvdW5jZWRRdWVyeUhhbmRsZXIoKTtcbiAgfVxuXG4gIGhhbmRsZVJlc3VsdHNDaGFuZ2UoKTogdm9pZCB7XG4gICAgdGhpcy5fdXBkYXRlUmVzdWx0cyh0aGlzLnByb3BzLmFjdGl2ZVByb3ZpZGVyLm5hbWUpO1xuICB9XG5cbiAgX3VwZGF0ZVJlc3VsdHMoYWN0aXZlUHJvdmlkZXJOYW1lOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCB1cGRhdGVkUmVzdWx0cyA9IHNlYXJjaFJlc3VsdE1hbmFnZXIuZ2V0UmVzdWx0cyhcbiAgICAgIHRoaXMucmVmc1sncXVlcnlJbnB1dCddLmdldFRleHQoKSxcbiAgICAgIGFjdGl2ZVByb3ZpZGVyTmFtZVxuICAgICk7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICByZXN1bHRzQnlTZXJ2aWNlOiB1cGRhdGVkUmVzdWx0cyxcbiAgICB9LCAoKSA9PiB7XG4gICAgICBpZiAoIXRoaXMuc3RhdGUuaGFzVXNlclNlbGVjdGlvbikge1xuICAgICAgICB0aGlzLm1vdmVTZWxlY3Rpb25Ub1RvcCgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgaGFuZGxlUHJvdmlkZXJzQ2hhbmdlKCk6IHZvaWQge1xuICAgIGNvbnN0IHJlbmRlcmFibGVQcm92aWRlcnMgPSBzZWFyY2hSZXN1bHRNYW5hZ2VyLmdldFJlbmRlcmFibGVQcm92aWRlcnMoKTtcbiAgICBjb25zdCBhY3RpdmVQcm92aWRlck5hbWUgPSBzZWFyY2hSZXN1bHRNYW5hZ2VyLmdldEFjdGl2ZVByb3ZpZGVyTmFtZSgpO1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgcmVuZGVyYWJsZVByb3ZpZGVycyxcbiAgICAgIGFjdGl2ZVByb3ZpZGVyTmFtZSxcbiAgICB9KTtcbiAgICB0aGlzLl91cGRhdGVSZXN1bHRzKGFjdGl2ZVByb3ZpZGVyTmFtZSk7XG4gIH1cblxuICBzZWxlY3QoKTogdm9pZCB7XG4gICAgY29uc3Qgc2VsZWN0ZWRJdGVtID0gdGhpcy5nZXRTZWxlY3RlZEl0ZW0oKTtcbiAgICBpZiAoIXNlbGVjdGVkSXRlbSkge1xuICAgICAgdGhpcy5jYW5jZWwoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fZW1pdHRlci5lbWl0KCdzZWxlY3RlZCcsIHNlbGVjdGVkSXRlbSk7XG4gICAgfVxuICB9XG5cbiAgb25Vc2VyRGlkQ2hhbmdlU2VsZWN0aW9uKCkge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgaGFzVXNlclNlbGVjdGlvbjogdHJ1ZSxcbiAgICB9KTtcbiAgfVxuXG4gIGNhbmNlbCgpOiB2b2lkIHtcbiAgICB0aGlzLl9lbWl0dGVyLmVtaXQoJ2NhbmNlbGVkJyk7XG4gIH1cblxuICBjbGVhclNlbGVjdGlvbigpOiB2b2lkIHtcbiAgICB0aGlzLnNldFNlbGVjdGVkSW5kZXgoJycsICcnLCAtMSk7XG4gIH1cblxuICBfZ2V0Q3VycmVudFJlc3VsdENvbnRleHQoKTogP1Jlc3VsdENvbnRleHQge1xuICAgIGNvbnN0IG5vbkVtcHR5UmVzdWx0cyA9IGZpbHRlckVtcHR5UmVzdWx0cyh0aGlzLnN0YXRlLnJlc3VsdHNCeVNlcnZpY2UpO1xuICAgIGNvbnN0IHNlcnZpY2VOYW1lcyA9IE9iamVjdC5rZXlzKG5vbkVtcHR5UmVzdWx0cyk7XG4gICAgY29uc3QgY3VycmVudFNlcnZpY2VJbmRleCA9IHNlcnZpY2VOYW1lcy5pbmRleE9mKHRoaXMuc3RhdGUuc2VsZWN0ZWRTZXJ2aWNlKTtcbiAgICBjb25zdCBjdXJyZW50U2VydmljZSA9IG5vbkVtcHR5UmVzdWx0c1t0aGlzLnN0YXRlLnNlbGVjdGVkU2VydmljZV07XG5cbiAgICBpZiAoIWN1cnJlbnRTZXJ2aWNlKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBkaXJlY3RvcnlOYW1lcyA9IE9iamVjdC5rZXlzKGN1cnJlbnRTZXJ2aWNlLnJlc3VsdHMpO1xuICAgIGNvbnN0IGN1cnJlbnREaXJlY3RvcnlJbmRleCA9IGRpcmVjdG9yeU5hbWVzLmluZGV4T2YodGhpcy5zdGF0ZS5zZWxlY3RlZERpcmVjdG9yeSk7XG4gICAgY29uc3QgY3VycmVudERpcmVjdG9yeSA9IGN1cnJlbnRTZXJ2aWNlLnJlc3VsdHNbdGhpcy5zdGF0ZS5zZWxlY3RlZERpcmVjdG9yeV07XG5cbiAgICBpZiAoIWN1cnJlbnREaXJlY3RvcnkgfHwgIWN1cnJlbnREaXJlY3RvcnkucmVzdWx0cykge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIG5vbkVtcHR5UmVzdWx0cyxcbiAgICAgIHNlcnZpY2VOYW1lcyxcbiAgICAgIGN1cnJlbnRTZXJ2aWNlSW5kZXgsXG4gICAgICBjdXJyZW50U2VydmljZSxcbiAgICAgIGRpcmVjdG9yeU5hbWVzLFxuICAgICAgY3VycmVudERpcmVjdG9yeUluZGV4LFxuICAgICAgY3VycmVudERpcmVjdG9yeSxcbiAgICB9O1xuICB9XG5cbiAgbW92ZVNlbGVjdGlvbkRvd24oKTogdm9pZCB7XG4gICAgY29uc3QgY29udGV4dCA9IHRoaXMuX2dldEN1cnJlbnRSZXN1bHRDb250ZXh0KCk7XG4gICAgaWYgKCFjb250ZXh0KSB7XG4gICAgICB0aGlzLm1vdmVTZWxlY3Rpb25Ub1RvcCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnN0YXRlLnNlbGVjdGVkSXRlbUluZGV4IDwgY29udGV4dC5jdXJyZW50RGlyZWN0b3J5LnJlc3VsdHMubGVuZ3RoIC0gMSkge1xuICAgICAgLy8gb25seSBidW1wIHRoZSBpbmRleCBpZiByZW1haW5pbmcgaW4gY3VycmVudCBkaXJlY3RvcnlcbiAgICAgIHRoaXMuc2V0U2VsZWN0ZWRJbmRleChcbiAgICAgICAgdGhpcy5zdGF0ZS5zZWxlY3RlZFNlcnZpY2UsXG4gICAgICAgIHRoaXMuc3RhdGUuc2VsZWN0ZWREaXJlY3RvcnksXG4gICAgICAgIHRoaXMuc3RhdGUuc2VsZWN0ZWRJdGVtSW5kZXggKyAxXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBvdGhlcndpc2UgZ28gdG8gbmV4dCBkaXJlY3RvcnkuLi5cbiAgICAgIGlmIChjb250ZXh0LmN1cnJlbnREaXJlY3RvcnlJbmRleCA8IGNvbnRleHQuZGlyZWN0b3J5TmFtZXMubGVuZ3RoIC0gMSkge1xuICAgICAgICB0aGlzLnNldFNlbGVjdGVkSW5kZXgoXG4gICAgICAgICAgdGhpcy5zdGF0ZS5zZWxlY3RlZFNlcnZpY2UsXG4gICAgICAgICAgY29udGV4dC5kaXJlY3RvcnlOYW1lc1tjb250ZXh0LmN1cnJlbnREaXJlY3RvcnlJbmRleCArIDFdLFxuICAgICAgICAgIDBcbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIC4uLm9yIHRoZSBuZXh0IHNlcnZpY2UuLi5cbiAgICAgICAgaWYgKGNvbnRleHQuY3VycmVudFNlcnZpY2VJbmRleCA8IGNvbnRleHQuc2VydmljZU5hbWVzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICBjb25zdCBuZXdTZXJ2aWNlTmFtZSA9IGNvbnRleHQuc2VydmljZU5hbWVzW2NvbnRleHQuY3VycmVudFNlcnZpY2VJbmRleCArIDFdO1xuICAgICAgICAgIGNvbnN0IG5ld0RpcmVjdG9yeU5hbWUgPVxuICAgICAgICAgICAgT2JqZWN0LmtleXMoY29udGV4dC5ub25FbXB0eVJlc3VsdHNbbmV3U2VydmljZU5hbWVdLnJlc3VsdHMpLnNoaWZ0KCk7XG4gICAgICAgICAgdGhpcy5zZXRTZWxlY3RlZEluZGV4KG5ld1NlcnZpY2VOYW1lLCBuZXdEaXJlY3RvcnlOYW1lLCAwKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyAuLi5vciB3cmFwIGFyb3VuZCB0byB0aGUgdmVyeSB0b3BcbiAgICAgICAgICB0aGlzLm1vdmVTZWxlY3Rpb25Ub1RvcCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgbW92ZVNlbGVjdGlvblVwKCk6IHZvaWQge1xuICAgIGNvbnN0IGNvbnRleHQgPSB0aGlzLl9nZXRDdXJyZW50UmVzdWx0Q29udGV4dCgpO1xuICAgIGlmICghY29udGV4dCkge1xuICAgICAgdGhpcy5tb3ZlU2VsZWN0aW9uVG9Cb3R0b20oKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5zdGF0ZS5zZWxlY3RlZEl0ZW1JbmRleCA+IDApIHtcbiAgICAgIC8vIG9ubHkgZGVjcmVhc2UgdGhlIGluZGV4IGlmIHJlbWFpbmluZyBpbiBjdXJyZW50IGRpcmVjdG9yeVxuICAgICAgdGhpcy5zZXRTZWxlY3RlZEluZGV4KFxuICAgICAgICB0aGlzLnN0YXRlLnNlbGVjdGVkU2VydmljZSxcbiAgICAgICAgdGhpcy5zdGF0ZS5zZWxlY3RlZERpcmVjdG9yeSxcbiAgICAgICAgdGhpcy5zdGF0ZS5zZWxlY3RlZEl0ZW1JbmRleCAtIDFcbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIG90aGVyd2lzZSwgZ28gdG8gdGhlIHByZXZpb3VzIGRpcmVjdG9yeS4uLlxuICAgICAgaWYgKGNvbnRleHQuY3VycmVudERpcmVjdG9yeUluZGV4ID4gMCkge1xuICAgICAgICB0aGlzLnNldFNlbGVjdGVkSW5kZXgoXG4gICAgICAgICAgdGhpcy5zdGF0ZS5zZWxlY3RlZFNlcnZpY2UsXG4gICAgICAgICAgY29udGV4dC5kaXJlY3RvcnlOYW1lc1tjb250ZXh0LmN1cnJlbnREaXJlY3RvcnlJbmRleCAtIDFdLFxuICAgICAgICAgIGNvbnRleHQuY3VycmVudFNlcnZpY2VcbiAgICAgICAgICAgIC5yZXN1bHRzW2NvbnRleHQuZGlyZWN0b3J5TmFtZXNbY29udGV4dC5jdXJyZW50RGlyZWN0b3J5SW5kZXggLSAxXV0ucmVzdWx0cy5sZW5ndGggLSAxXG4gICAgICAgICk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyAuLi5vciB0aGUgcHJldmlvdXMgc2VydmljZS4uLlxuICAgICAgICBpZiAoY29udGV4dC5jdXJyZW50U2VydmljZUluZGV4ID4gMCkge1xuICAgICAgICAgIGNvbnN0IG5ld1NlcnZpY2VOYW1lID0gY29udGV4dC5zZXJ2aWNlTmFtZXNbY29udGV4dC5jdXJyZW50U2VydmljZUluZGV4IC0gMV07XG4gICAgICAgICAgY29uc3QgbmV3RGlyZWN0b3J5TmFtZSA9XG4gICAgICAgICAgICBPYmplY3Qua2V5cyhjb250ZXh0Lm5vbkVtcHR5UmVzdWx0c1tuZXdTZXJ2aWNlTmFtZV0ucmVzdWx0cykucG9wKCk7XG4gICAgICAgICAgaWYgKG5ld0RpcmVjdG9yeU5hbWUgPT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCByZXN1bHRzRm9yRGlyZWN0b3J5ID1cbiAgICAgICAgICAgIGNvbnRleHQubm9uRW1wdHlSZXN1bHRzW25ld1NlcnZpY2VOYW1lXS5yZXN1bHRzW25ld0RpcmVjdG9yeU5hbWVdO1xuICAgICAgICAgIGlmIChyZXN1bHRzRm9yRGlyZWN0b3J5ID09IG51bGwgfHwgcmVzdWx0c0ZvckRpcmVjdG9yeS5yZXN1bHRzID09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5zZXRTZWxlY3RlZEluZGV4KFxuICAgICAgICAgICAgbmV3U2VydmljZU5hbWUsXG4gICAgICAgICAgICBuZXdEaXJlY3RvcnlOYW1lLFxuICAgICAgICAgICAgcmVzdWx0c0ZvckRpcmVjdG9yeS5yZXN1bHRzLmxlbmd0aCAtIDFcbiAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIC4uLm9yIHdyYXAgYXJvdW5kIHRvIHRoZSB2ZXJ5IGJvdHRvbVxuICAgICAgICAgIHRoaXMubW92ZVNlbGVjdGlvblRvQm90dG9tKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBVcGRhdGUgdGhlIHNjcm9sbCBwb3NpdGlvbiBvZiB0aGUgbGlzdCB2aWV3IHRvIGVuc3VyZSB0aGUgc2VsZWN0ZWQgaXRlbSBpcyB2aXNpYmxlLlxuICBfdXBkYXRlU2Nyb2xsUG9zaXRpb24oKTogdm9pZCB7XG4gICAgaWYgKCEodGhpcy5yZWZzICYmIHRoaXMucmVmc1snc2VsZWN0aW9uTGlzdCddKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBsaXN0Tm9kZSA9ICBSZWFjdERPTS5maW5kRE9NTm9kZSh0aGlzLnJlZnNbJ3NlbGVjdGlvbkxpc3QnXSk7XG4gICAgY29uc3Qgc2VsZWN0ZWROb2RlID0gbGlzdE5vZGUuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnc2VsZWN0ZWQnKVswXTtcbiAgICAvLyBmYWxzZSBpcyBwYXNzZWQgZm9yIEBjZW50ZXJJZk5lZWRlZCBwYXJhbWV0ZXIsIHdoaWNoIGRlZmF1bHRzIHRvIHRydWUuXG4gICAgLy8gUGFzc2luZyBmYWxzZSBjYXVzZXMgdGhlIG1pbmltdW0gbmVjZXNzYXJ5IHNjcm9sbCB0byBvY2N1ciwgc28gdGhlIHNlbGVjdGlvbiBzdGlja3MgdG8gdGhlXG4gICAgLy8gdG9wL2JvdHRvbS5cbiAgICBpZiAoc2VsZWN0ZWROb2RlKSB7XG4gICAgICBzZWxlY3RlZE5vZGUuc2Nyb2xsSW50b1ZpZXdJZk5lZWRlZChmYWxzZSk7XG4gICAgfVxuICB9XG5cbiAgbW92ZVNlbGVjdGlvblRvQm90dG9tKCk6IHZvaWQge1xuICAgIGNvbnN0IGJvdHRvbSA9IHRoaXMuX2dldE91dGVyUmVzdWx0cyhBcnJheS5wcm90b3R5cGUucG9wKTtcbiAgICBpZiAoIWJvdHRvbSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLnNldFNlbGVjdGVkSW5kZXgoYm90dG9tLnNlcnZpY2VOYW1lLCBib3R0b20uZGlyZWN0b3J5TmFtZSwgYm90dG9tLnJlc3VsdHMubGVuZ3RoIC0gMSk7XG4gIH1cblxuICBtb3ZlU2VsZWN0aW9uVG9Ub3AoKTogdm9pZCB7XG4gICAgY29uc3QgdG9wID0gdGhpcy5fZ2V0T3V0ZXJSZXN1bHRzKEFycmF5LnByb3RvdHlwZS5zaGlmdCk7XG4gICAgaWYgKCF0b3ApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5zZXRTZWxlY3RlZEluZGV4KHRvcC5zZXJ2aWNlTmFtZSwgdG9wLmRpcmVjdG9yeU5hbWUsIDApO1xuICB9XG5cbiAgX2dldE91dGVyUmVzdWx0cyhhcnJheU9wZXJhdGlvbjogRnVuY3Rpb24pOlxuICAgID97c2VydmljZU5hbWU6IHN0cmluZzsgZGlyZWN0b3J5TmFtZTogc3RyaW5nOyByZXN1bHRzOiBBcnJheTxtaXhlZD59IHtcbiAgICBjb25zdCBub25FbXB0eVJlc3VsdHMgPSBmaWx0ZXJFbXB0eVJlc3VsdHModGhpcy5zdGF0ZS5yZXN1bHRzQnlTZXJ2aWNlKTtcbiAgICBjb25zdCBzZXJ2aWNlTmFtZSA9IGFycmF5T3BlcmF0aW9uLmNhbGwoT2JqZWN0LmtleXMobm9uRW1wdHlSZXN1bHRzKSk7XG4gICAgaWYgKCFzZXJ2aWNlTmFtZSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IHNlcnZpY2UgPSBub25FbXB0eVJlc3VsdHNbc2VydmljZU5hbWVdO1xuICAgIGNvbnN0IGRpcmVjdG9yeU5hbWUgPSBhcnJheU9wZXJhdGlvbi5jYWxsKE9iamVjdC5rZXlzKHNlcnZpY2UucmVzdWx0cykpO1xuICAgIHJldHVybiB7XG4gICAgICBzZXJ2aWNlTmFtZSxcbiAgICAgIGRpcmVjdG9yeU5hbWUsXG4gICAgICByZXN1bHRzOiBub25FbXB0eVJlc3VsdHNbc2VydmljZU5hbWVdLnJlc3VsdHNbZGlyZWN0b3J5TmFtZV0ucmVzdWx0cyxcbiAgICB9O1xuICB9XG5cbiAgZ2V0U2VsZWN0ZWRJdGVtKCk6ID9PYmplY3Qge1xuICAgIHJldHVybiB0aGlzLmdldEl0ZW1BdEluZGV4KFxuICAgICAgdGhpcy5zdGF0ZS5zZWxlY3RlZFNlcnZpY2UsXG4gICAgICB0aGlzLnN0YXRlLnNlbGVjdGVkRGlyZWN0b3J5LFxuICAgICAgdGhpcy5zdGF0ZS5zZWxlY3RlZEl0ZW1JbmRleFxuICAgICk7XG4gIH1cblxuICBnZXRJdGVtQXRJbmRleChzZXJ2aWNlTmFtZTogc3RyaW5nLCBkaXJlY3Rvcnk6IHN0cmluZywgaXRlbUluZGV4OiBudW1iZXIpOiA/T2JqZWN0IHtcbiAgICBpZiAoXG4gICAgICBpdGVtSW5kZXggPT09IC0xIHx8XG4gICAgICAhdGhpcy5zdGF0ZS5yZXN1bHRzQnlTZXJ2aWNlW3NlcnZpY2VOYW1lXSB8fFxuICAgICAgIXRoaXMuc3RhdGUucmVzdWx0c0J5U2VydmljZVtzZXJ2aWNlTmFtZV0ucmVzdWx0c1tkaXJlY3RvcnldIHx8XG4gICAgICAhdGhpcy5zdGF0ZS5yZXN1bHRzQnlTZXJ2aWNlW3NlcnZpY2VOYW1lXS5yZXN1bHRzW2RpcmVjdG9yeV0ucmVzdWx0c1tpdGVtSW5kZXhdXG4gICAgKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuc3RhdGUucmVzdWx0c0J5U2VydmljZVtzZXJ2aWNlTmFtZV0ucmVzdWx0c1tkaXJlY3RvcnldLnJlc3VsdHNbaXRlbUluZGV4XTtcbiAgfVxuXG4gIGNvbXBvbmVudEZvckl0ZW0oaXRlbTogYW55LCBzZXJ2aWNlTmFtZTogc3RyaW5nLCBkaXJOYW1lOiBzdHJpbmcpOiBSZWFjdC5FbGVtZW50IHtcbiAgICByZXR1cm4gc2VhcmNoUmVzdWx0TWFuYWdlci5nZXRSZW5kZXJlckZvclByb3ZpZGVyKHNlcnZpY2VOYW1lKShcbiAgICAgIGl0ZW0sXG4gICAgICBzZXJ2aWNlTmFtZSxcbiAgICAgIGRpck5hbWUsXG4gICAgKTtcbiAgfVxuXG4gIGdldFNlbGVjdGVkSW5kZXgoKTogU2VsZWN0aW9uIHtcbiAgICByZXR1cm4ge1xuICAgICAgc2VsZWN0ZWREaXJlY3Rvcnk6IHRoaXMuc3RhdGUuc2VsZWN0ZWREaXJlY3RvcnksXG4gICAgICBzZWxlY3RlZFNlcnZpY2U6IHRoaXMuc3RhdGUuc2VsZWN0ZWRTZXJ2aWNlLFxuICAgICAgc2VsZWN0ZWRJdGVtSW5kZXg6IHRoaXMuc3RhdGUuc2VsZWN0ZWRJdGVtSW5kZXgsXG4gICAgfTtcbiAgfVxuXG4gIHNldFNlbGVjdGVkSW5kZXgoc2VydmljZTogc3RyaW5nLCBkaXJlY3Rvcnk6IHN0cmluZywgaXRlbUluZGV4OiBudW1iZXIpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHNlbGVjdGVkU2VydmljZTogc2VydmljZSxcbiAgICAgIHNlbGVjdGVkRGlyZWN0b3J5OiBkaXJlY3RvcnksXG4gICAgICBzZWxlY3RlZEl0ZW1JbmRleDogaXRlbUluZGV4LFxuICAgIH0sICgpID0+IHtcbiAgICAgIHRoaXMuX2VtaXR0ZXIuZW1pdCgnc2VsZWN0aW9uLWNoYW5nZWQnLCB0aGlzLmdldFNlbGVjdGVkSW5kZXgoKSk7XG4gICAgICB0aGlzLm9uVXNlckRpZENoYW5nZVNlbGVjdGlvbigpO1xuICAgIH0pO1xuICB9XG5cbiAgcmVzZXRTZWxlY3Rpb24oKTogdm9pZCB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBzZWxlY3RlZFNlcnZpY2U6ICcnLFxuICAgICAgc2VsZWN0ZWREaXJlY3Rvcnk6ICcnLFxuICAgICAgc2VsZWN0ZWRJdGVtSW5kZXg6IC0xLFxuICAgICAgaGFzVXNlclNlbGVjdGlvbjogZmFsc2UsXG4gICAgfSk7XG4gIH1cblxuICBzZXRLZXlib2FyZFF1ZXJ5KHF1ZXJ5OiBzdHJpbmcpIHtcbiAgICB0aGlzLnJlc2V0U2VsZWN0aW9uKCk7XG4gICAgdGhpcy5zZXRRdWVyeShxdWVyeSk7XG4gIH1cblxuICBzZXRRdWVyeShxdWVyeTogc3RyaW5nKSB7XG4gICAgcmVxdWlyZSgnLi9RdWlja1NlbGVjdGlvbkFjdGlvbnMnKS5xdWVyeShxdWVyeSk7XG4gIH1cblxuICBnZXRQcm92aWRlcigpOiBQcm92aWRlclNwZWMge1xuICAgIHJldHVybiB0aGlzLnByb3BzLmFjdGl2ZVByb3ZpZGVyO1xuICB9XG5cbiAgZ2V0SW5wdXRUZXh0RWRpdG9yKCk6IGF0b20kVGV4dEVkaXRvckVsZW1lbnQge1xuICAgIHJldHVybiBSZWFjdERPTS5maW5kRE9NTm9kZSh0aGlzLnJlZnNbJ3F1ZXJ5SW5wdXQnXSk7XG4gIH1cblxuICBjbGVhcigpOiB2b2lkIHtcbiAgICB0aGlzLmdldElucHV0VGV4dEVkaXRvcigpLmdldE1vZGVsKCkuc2V0VGV4dCgnJyk7XG4gICAgdGhpcy5jbGVhclNlbGVjdGlvbigpO1xuICB9XG5cbiAgZm9jdXMoKTogdm9pZCB7XG4gICAgdGhpcy5nZXRJbnB1dFRleHRFZGl0b3IoKS5mb2N1cygpO1xuICB9XG5cbiAgYmx1cigpOiB2b2lkIHtcbiAgICB0aGlzLmdldElucHV0VGV4dEVkaXRvcigpLmJsdXIoKTtcbiAgfVxuXG4gIHNldElucHV0VmFsdWUodmFsdWU6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuX2dldFRleHRFZGl0b3IoKS5zZXRUZXh0KHZhbHVlKTtcbiAgfVxuXG4gIHNlbGVjdElucHV0KCk6IHZvaWQge1xuICAgIHRoaXMuX2dldFRleHRFZGl0b3IoKS5zZWxlY3RBbGwoKTtcbiAgfVxuXG4gIF9nZXRUZXh0RWRpdG9yKCk6IFRleHRFZGl0b3Ige1xuICAgIHJldHVybiB0aGlzLnJlZnNbJ3F1ZXJ5SW5wdXQnXS5nZXRUZXh0RWRpdG9yKCk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIG5ld1RhYiBpcyBhY3R1YWxseSBhIFByb3ZpZGVyU3BlYyBwbHVzIHRoZSBgbmFtZWAgYW5kIGB0YWJDb250ZW50YCBwcm9wZXJ0aWVzIGFkZGVkIGJ5XG4gICAqICAgICBfcmVuZGVyVGFicygpLCB3aGljaCBjcmVhdGVkIHRoZSB0YWIgb2JqZWN0IGluIHRoZSBmaXJzdCBwbGFjZS5cbiAgICovXG4gIF9oYW5kbGVUYWJDaGFuZ2UobmV3VGFiOiBQcm92aWRlclNwZWMpOiB2b2lkIHtcbiAgICBjb25zdCBwcm92aWRlck5hbWUgPSBuZXdUYWIubmFtZTtcbiAgICBpZiAocHJvdmlkZXJOYW1lICE9PSB0aGlzLnByb3BzLmFjdGl2ZVByb3ZpZGVyLm5hbWUpIHtcbiAgICAgIGlmICh0aGlzLnByb3BzLm9uUHJvdmlkZXJDaGFuZ2UpIHtcbiAgICAgICAgdGhpcy5wcm9wcy5vblByb3ZpZGVyQ2hhbmdlKHByb3ZpZGVyTmFtZSk7XG4gICAgICB9XG4gICAgICB0aGlzLl9lbWl0dGVyLmVtaXQoJ2FjdGl2ZS1wcm92aWRlci1jaGFuZ2VkJywgcHJvdmlkZXJOYW1lKTtcbiAgICB9XG4gICAgdGhpcy5yZWZzWydxdWVyeUlucHV0J10uZm9jdXMoKTtcbiAgfVxuXG4gIF9yZW5kZXJUYWJzKCk6IFJlYWN0LkVsZW1lbnQge1xuICAgIGNvbnN0IHRhYnMgPSB0aGlzLnN0YXRlLnJlbmRlcmFibGVQcm92aWRlcnMubWFwKHRhYiA9PiB7XG4gICAgICBsZXQga2V5QmluZGluZyA9IG51bGw7Ly9UT0RPXG4gICAgICBjb25zdCBodW1hbml6ZWRLZXliaW5kaW5nID0gX2ZpbmRLZXliaW5kaW5nRm9yQWN0aW9uKHRhYi5hY3Rpb24gfHwgJycsIHRoaXMuX21vZGFsTm9kZSk7XG4gICAgICBpZiAoaHVtYW5pemVkS2V5YmluZGluZyAhPT0gJycpIHtcbiAgICAgICAga2V5QmluZGluZyA9IChcbiAgICAgICAgICA8a2JkIGNsYXNzTmFtZT1cImtleS1iaW5kaW5nXCI+XG4gICAgICAgICAgICB7aHVtYW5pemVkS2V5YmluZGluZ31cbiAgICAgICAgICA8L2tiZD5cbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLnRhYixcbiAgICAgICAgbmFtZTogdGFiLm5hbWUsXG4gICAgICAgIHRhYkNvbnRlbnQ6IDxzcGFuPnt0YWIudGl0bGV9e2tleUJpbmRpbmd9PC9zcGFuPixcbiAgICAgIH07XG4gICAgfSk7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwib21uaXNlYXJjaC10YWJzXCI+XG4gICAgICAgIDxUYWJzXG4gICAgICAgICAgdGFicz17dGFic31cbiAgICAgICAgICBhY3RpdmVUYWJOYW1lPXt0aGlzLnN0YXRlLmFjdGl2ZVRhYi5uYW1lfVxuICAgICAgICAgIG9uQWN0aXZlVGFiQ2hhbmdlPXt0aGlzLl9ib3VuZEhhbmRsZVRhYkNoYW5nZX1cbiAgICAgICAgLz5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICBfcmVuZGVyRW1wdHlNZXNzYWdlKG1lc3NhZ2U6IHN0cmluZyB8IFJlYWN0LkVsZW1lbnQpOiBSZWFjdC5FbGVtZW50IHtcbiAgICByZXR1cm4gKFxuICAgICAgPHVsIGNsYXNzTmFtZT1cImJhY2tncm91bmQtbWVzc2FnZSBjZW50ZXJlZFwiPlxuICAgICAgICA8bGk+e21lc3NhZ2V9PC9saT5cbiAgICAgIDwvdWw+XG4gICAgKTtcbiAgfVxuXG4gIF9oYXNOb1Jlc3VsdHMoKTogYm9vbGVhbiB7XG4gICAgZm9yIChjb25zdCBzZXJ2aWNlTmFtZSBpbiB0aGlzLnN0YXRlLnJlc3VsdHNCeVNlcnZpY2UpIHtcbiAgICAgIGNvbnN0IHNlcnZpY2UgPSB0aGlzLnN0YXRlLnJlc3VsdHNCeVNlcnZpY2Vbc2VydmljZU5hbWVdO1xuICAgICAgZm9yIChjb25zdCBkaXJOYW1lIGluIHNlcnZpY2UpIHtcbiAgICAgICAgY29uc3QgcmVzdWx0cyA9IHNlcnZpY2VbZGlyTmFtZV07XG4gICAgICAgIGlmICghcmVzdWx0cy5sb2FkaW5nICYmIHJlc3VsdHMucmVzdWx0cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcmVuZGVyKCk6IFJlYWN0LkVsZW1lbnQge1xuICAgIGxldCBudW1Ub3RhbFJlc3VsdHNSZW5kZXJlZCA9IDA7XG4gICAgY29uc3QgaXNPbW5pU2VhcmNoQWN0aXZlID0gdGhpcy5zdGF0ZS5hY3RpdmVUYWIubmFtZSA9PT0gJ09tbmlTZWFyY2hSZXN1bHRQcm92aWRlcic7XG4gICAgbGV0IG51bVF1ZXJpZXNPdXRzdGFuZGluZyA9IDA7XG4gICAgY29uc3Qgc2VydmljZU5hbWVzID0gT2JqZWN0LmtleXModGhpcy5zdGF0ZS5yZXN1bHRzQnlTZXJ2aWNlKTtcbiAgICBjb25zdCBzZXJ2aWNlcyA9IHNlcnZpY2VOYW1lcy5tYXAoc2VydmljZU5hbWUgPT4ge1xuICAgICAgbGV0IG51bVJlc3VsdHNGb3JTZXJ2aWNlID0gMDtcbiAgICAgIGNvbnN0IGRpcmVjdG9yaWVzID0gdGhpcy5zdGF0ZS5yZXN1bHRzQnlTZXJ2aWNlW3NlcnZpY2VOYW1lXS5yZXN1bHRzO1xuICAgICAgY29uc3Qgc2VydmljZVRpdGxlID0gdGhpcy5zdGF0ZS5yZXN1bHRzQnlTZXJ2aWNlW3NlcnZpY2VOYW1lXS50aXRsZTtcbiAgICAgIGNvbnN0IGRpcmVjdG9yeU5hbWVzID0gT2JqZWN0LmtleXMoZGlyZWN0b3JpZXMpO1xuICAgICAgY29uc3QgZGlyZWN0b3JpZXNGb3JTZXJ2aWNlID0gZGlyZWN0b3J5TmFtZXMubWFwKGRpck5hbWUgPT4ge1xuICAgICAgICBjb25zdCByZXN1bHRzRm9yRGlyZWN0b3J5ID0gZGlyZWN0b3JpZXNbZGlyTmFtZV07XG4gICAgICAgIGxldCBtZXNzYWdlID0gbnVsbDtcbiAgICAgICAgaWYgKHJlc3VsdHNGb3JEaXJlY3RvcnkubG9hZGluZykge1xuICAgICAgICAgIG51bVF1ZXJpZXNPdXRzdGFuZGluZysrO1xuICAgICAgICAgIGlmICghaXNPbW5pU2VhcmNoQWN0aXZlKSB7XG4gICAgICAgICAgICBudW1Ub3RhbFJlc3VsdHNSZW5kZXJlZCsrO1xuICAgICAgICAgICAgbWVzc2FnZSA9IChcbiAgICAgICAgICAgICAgPHNwYW4+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibG9hZGluZyBsb2FkaW5nLXNwaW5uZXItdGlueSBpbmxpbmUtYmxvY2tcIiAvPlxuICAgICAgICAgICAgICAgIExvYWRpbmcuLi5cbiAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAocmVzdWx0c0ZvckRpcmVjdG9yeS5lcnJvciAmJiAhaXNPbW5pU2VhcmNoQWN0aXZlKSB7XG4gICAgICAgICAgbWVzc2FnZSA9IChcbiAgICAgICAgICAgIDxzcGFuPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJpY29uIGljb24tY2lyY2xlLXNsYXNoXCIgLz5cbiAgICAgICAgICAgICAgRXJyb3I6IDxwcmU+e3Jlc3VsdHNGb3JEaXJlY3RvcnkuZXJyb3J9PC9wcmU+XG4gICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIGlmIChyZXN1bHRzRm9yRGlyZWN0b3J5LnJlc3VsdHMubGVuZ3RoID09PSAwICYmICFpc09tbmlTZWFyY2hBY3RpdmUpIHtcbiAgICAgICAgICBtZXNzYWdlID0gKFxuICAgICAgICAgICAgPHNwYW4+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImljb24gaWNvbi14XCIgLz5cbiAgICAgICAgICAgICAgTm8gcmVzdWx0c1xuICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaXRlbUNvbXBvbmVudHMgPSByZXN1bHRzRm9yRGlyZWN0b3J5LnJlc3VsdHMubWFwKChpdGVtLCBpdGVtSW5kZXgpID0+IHtcbiAgICAgICAgICBudW1SZXN1bHRzRm9yU2VydmljZSsrO1xuICAgICAgICAgIG51bVRvdGFsUmVzdWx0c1JlbmRlcmVkKys7XG4gICAgICAgICAgY29uc3QgaXNTZWxlY3RlZCA9IChcbiAgICAgICAgICAgIHNlcnZpY2VOYW1lID09PSB0aGlzLnN0YXRlLnNlbGVjdGVkU2VydmljZSAmJlxuICAgICAgICAgICAgZGlyTmFtZSA9PT0gdGhpcy5zdGF0ZS5zZWxlY3RlZERpcmVjdG9yeSAmJlxuICAgICAgICAgICAgaXRlbUluZGV4ID09PSB0aGlzLnN0YXRlLnNlbGVjdGVkSXRlbUluZGV4XG4gICAgICAgICAgKTtcbiAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGxpXG4gICAgICAgICAgICAgIGNsYXNzTmFtZT17Y2xhc3NuYW1lcyh7XG4gICAgICAgICAgICAgICAgJ3F1aWNrLW9wZW4tcmVzdWx0LWl0ZW0nOiB0cnVlLFxuICAgICAgICAgICAgICAgICdsaXN0LWl0ZW0nOiB0cnVlLFxuICAgICAgICAgICAgICAgIHNlbGVjdGVkOiBpc1NlbGVjdGVkLFxuICAgICAgICAgICAgICB9KX1cbiAgICAgICAgICAgICAga2V5PXtzZXJ2aWNlTmFtZSArIGRpck5hbWUgKyBpdGVtSW5kZXh9XG4gICAgICAgICAgICAgIG9uTW91c2VEb3duPXt0aGlzLl9ib3VuZFNlbGVjdH1cbiAgICAgICAgICAgICAgb25Nb3VzZUVudGVyPXt0aGlzLnNldFNlbGVjdGVkSW5kZXguYmluZCh0aGlzLCBzZXJ2aWNlTmFtZSwgZGlyTmFtZSwgaXRlbUluZGV4KX0+XG4gICAgICAgICAgICAgIHt0aGlzLmNvbXBvbmVudEZvckl0ZW0oaXRlbSwgc2VydmljZU5hbWUsIGRpck5hbWUpfVxuICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICApO1xuICAgICAgICB9KTtcbiAgICAgICAgbGV0IGRpcmVjdG9yeUxhYmVsID0gbnVsbDtcbiAgICAgICAgLy9oaWRlIGZvbGRlcnMgaWYgb25seSAxIGxldmVsIHdvdWxkIGJlIHNob3duLCBvciBpZiBubyByZXN1bHRzIHdlcmUgZm91bmRcbiAgICAgICAgY29uc3Qgc2hvd0RpcmVjdG9yaWVzID0gZGlyZWN0b3J5TmFtZXMubGVuZ3RoID4gMSAmJlxuICAgICAgICAgICghaXNPbW5pU2VhcmNoQWN0aXZlIHx8IHJlc3VsdHNGb3JEaXJlY3RvcnkucmVzdWx0cy5sZW5ndGggPiAwKTtcbiAgICAgICAgaWYgKHNob3dEaXJlY3Rvcmllcykge1xuICAgICAgICAgIGRpcmVjdG9yeUxhYmVsID0gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJsaXN0LWl0ZW1cIj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiaWNvbiBpY29uLWZpbGUtZGlyZWN0b3J5XCI+e251Y2xpZGVVcmlUb0Rpc3BsYXlTdHJpbmcoZGlyTmFtZSl9PC9zcGFuPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIDxsaSBjbGFzc05hbWU9e2NsYXNzbmFtZXMoeydsaXN0LW5lc3RlZC1pdGVtJzogc2hvd0RpcmVjdG9yaWVzfSl9IGtleT17ZGlyTmFtZX0+XG4gICAgICAgICAgICB7ZGlyZWN0b3J5TGFiZWx9XG4gICAgICAgICAgICB7bWVzc2FnZX1cbiAgICAgICAgICAgIDx1bCBjbGFzc05hbWU9XCJsaXN0LXRyZWVcIj5cbiAgICAgICAgICAgICAge2l0ZW1Db21wb25lbnRzfVxuICAgICAgICAgICAgPC91bD5cbiAgICAgICAgICA8L2xpPlxuICAgICAgICApO1xuICAgICAgfSk7XG4gICAgICBsZXQgc2VydmljZUxhYmVsID0gbnVsbDtcbiAgICAgIGlmIChpc09tbmlTZWFyY2hBY3RpdmUgJiYgbnVtUmVzdWx0c0ZvclNlcnZpY2UgPiAwKSB7XG4gICAgICAgIHNlcnZpY2VMYWJlbCA9IChcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImxpc3QtaXRlbVwiPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiaWNvbiBpY29uLWdlYXJcIj57c2VydmljZVRpdGxlfTwvc3Bhbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICA8bGkgY2xhc3NOYW1lPVwibGlzdC1uZXN0ZWQtaXRlbVwiIGtleT17c2VydmljZU5hbWV9PlxuICAgICAgICAgICAge3NlcnZpY2VMYWJlbH1cbiAgICAgICAgICAgIDx1bCBjbGFzc05hbWU9XCJsaXN0LXRyZWVcIj5cbiAgICAgICAgICAgICAge2RpcmVjdG9yaWVzRm9yU2VydmljZX1cbiAgICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgPC9saT5cbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBkaXJlY3Rvcmllc0ZvclNlcnZpY2U7XG4gICAgfSk7XG4gICAgbGV0IG5vUmVzdWx0c01lc3NhZ2UgPSBudWxsO1xuICAgIGlmIChvYmplY3QuaXNFbXB0eSh0aGlzLnN0YXRlLnJlc3VsdHNCeVNlcnZpY2UpKSB7XG4gICAgICBub1Jlc3VsdHNNZXNzYWdlID0gdGhpcy5fcmVuZGVyRW1wdHlNZXNzYWdlKCdTZWFyY2ggYXdheSEnKTtcbiAgICB9IGVsc2UgaWYgKG51bVRvdGFsUmVzdWx0c1JlbmRlcmVkID09PSAwKSB7XG4gICAgICBub1Jlc3VsdHNNZXNzYWdlID0gdGhpcy5fcmVuZGVyRW1wdHlNZXNzYWdlKDxzcGFuPsKvXFxfKOODhClfL8KvPGJyIC8+Tm8gcmVzdWx0czwvc3Bhbj4pO1xuICAgIH1cbiAgICBjb25zdCBjdXJyZW50UHJvdmlkZXIgPSB0aGlzLmdldFByb3ZpZGVyKCk7XG4gICAgY29uc3QgcHJvbXB0VGV4dCA9IChjdXJyZW50UHJvdmlkZXIgJiYgY3VycmVudFByb3ZpZGVyLnByb21wdCkgfHwgJyc7XG4gICAgbGV0IG9tbmlTZWFyY2hTdGF0dXMgPSBudWxsO1xuICAgIGlmIChpc09tbmlTZWFyY2hBY3RpdmUgJiYgbnVtUXVlcmllc091dHN0YW5kaW5nID4gMCkge1xuICAgICAgb21uaVNlYXJjaFN0YXR1cyA9IChcbiAgICAgICAgPHNwYW4+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibG9hZGluZyBsb2FkaW5nLXNwaW5uZXItdGlueSBpbmxpbmUtYmxvY2tcIiAvPlxuICAgICAgICAgIHtgTG9hZGluZy4uLmB9XG4gICAgICAgIDwvc3Bhbj5cbiAgICAgICk7XG4gICAgfVxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cInNlbGVjdC1saXN0IG9tbmlzZWFyY2gtbW9kYWxcIiByZWY9XCJtb2RhbFwiPlxuICAgICAgICA8QXRvbUlucHV0IHJlZj1cInF1ZXJ5SW5wdXRcIiBwbGFjZWhvbGRlclRleHQ9e3Byb21wdFRleHR9IC8+XG4gICAgICAgIHt0aGlzLl9yZW5kZXJUYWJzKCl9XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwib21uaXNlYXJjaC1yZXN1bHRzXCIgc3R5bGU9e3ttYXhIZWlnaHQ6IHRoaXMucHJvcHMubWF4U2Nyb2xsYWJsZUFyZWFIZWlnaHR9fT5cbiAgICAgICAgICB7bm9SZXN1bHRzTWVzc2FnZX1cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm9tbmlzZWFyY2gtcGFuZVwiPlxuICAgICAgICAgICAgPHVsIGNsYXNzTmFtZT1cImxpc3QtdHJlZVwiIHJlZj1cInNlbGVjdGlvbkxpc3RcIj5cbiAgICAgICAgICAgICAge3NlcnZpY2VzfVxuICAgICAgICAgICAgICB7b21uaVNlYXJjaFN0YXR1c31cbiAgICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxufVxuXG5RdWlja1NlbGVjdGlvbkNvbXBvbmVudC5wcm9wVHlwZXMgPSB7XG4gIGFjdGl2ZVByb3ZpZGVyOiBQcm9wVHlwZXMuc2hhcGUoe1xuICAgIGFjdGlvbjogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgIGRlYm91bmNlRGVsYXk6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbiAgICBuYW1lOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgcHJvbXB0OiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgdGl0bGU6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgfSkuaXNSZXF1aXJlZCxcbiAgb25Qcm92aWRlckNoYW5nZTogUHJvcFR5cGVzLmZ1bmMsXG4gIG1heFNjcm9sbGFibGVBcmVhSGVpZ2h0OiBQcm9wVHlwZXMubnVtYmVyLFxufTtcbiJdfQ==