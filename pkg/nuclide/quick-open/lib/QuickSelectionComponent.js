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

var AtomInput = require('../../ui/atom-input');

var _require = require('atom');

var CompositeDisposable = _require.CompositeDisposable;
var Disposable = _require.Disposable;
var Emitter = _require.Emitter;

var _require2 = require('../../commons');

var debounce = _require2.debounce;
var object = _require2.object;

var _require3 = require('react-for-atom');

var React = _require3.React;

var searchResultManager = _SearchResultManager2['default'].getInstance();
var NuclideTabs = require('../../ui/tabs');
var PropTypes = React.PropTypes;

var classnames = require('classnames');

var _require4 = require('./searchResultHelpers');

var filterEmptyResults = _require4.filterEmptyResults;

/**
 * Determine what the applicable shortcut for a given action is within this component's context.
 * For example, this will return different keybindings on windows vs linux.
 */
function _findKeybindingForAction(action, target) {
  var _require5 = require('../../keystroke-label');

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
    this.handleProvidersChangeBound = this.handleProvidersChange.bind(this);
    this.handleResultsChangeBound = this.handleResultsChange.bind(this);
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

      this._modalNode = React.findDOMNode(this);
      this._subscriptions.add(atom.commands.add(this._modalNode, 'core:move-to-bottom', this.handleMoveToBottom.bind(this)), atom.commands.add(this._modalNode, 'core:move-to-top', this.handleMoveToTop.bind(this)), atom.commands.add(this._modalNode, 'core:move-down', this.handleMoveDown.bind(this)), atom.commands.add(this._modalNode, 'core:move-up', this.handleMoveUp.bind(this)), atom.commands.add(this._modalNode, 'core:confirm', this.select.bind(this)));

      var inputTextEditor = this.getInputTextEditor();
      this._subscriptions.add(searchResultManager.on(searchResultManager.PROVIDERS_CHANGED, this.handleProvidersChangeBound), searchResultManager.on(searchResultManager.RESULTS_CHANGED, this.handleResultsChangeBound));

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
      }, this.getProvider().debounceDelay, false);
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
      var listNode = React.findDOMNode(this.refs['selectionList']);
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
      return React.findDOMNode(this.refs['queryInput']);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlF1aWNrU2VsZWN0aW9uQ29tcG9uZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzttQ0E2Q2dDLHVCQUF1Qjs7OztBQVJ2RCxJQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMscUJBQXFCLENBQUMsQ0FBQzs7ZUFDRSxPQUFPLENBQUMsTUFBTSxDQUFDOztJQUEzRCxtQkFBbUIsWUFBbkIsbUJBQW1CO0lBQUUsVUFBVSxZQUFWLFVBQVU7SUFBRSxPQUFPLFlBQVAsT0FBTzs7Z0JBSTNDLE9BQU8sQ0FBQyxlQUFlLENBQUM7O0lBRjFCLFFBQVEsYUFBUixRQUFRO0lBQ1IsTUFBTSxhQUFOLE1BQU07O2dCQUVRLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQzs7SUFBbEMsS0FBSyxhQUFMLEtBQUs7O0FBR1osSUFBTSxtQkFBbUIsR0FBRyxpQ0FBb0IsV0FBVyxFQUFFLENBQUM7QUFDOUQsSUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQ3RDLFNBQVMsR0FBSSxLQUFLLENBQWxCLFNBQVM7O0FBQ2hCLElBQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQzs7Z0JBSXJDLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQzs7SUFEbEMsa0JBQWtCLGFBQWxCLGtCQUFrQjs7Ozs7O0FBT3BCLFNBQVMsd0JBQXdCLENBQUMsTUFBYyxFQUFFLE1BQW1CLEVBQVU7a0JBQ2pELE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQzs7TUFBckQsaUJBQWlCLGFBQWpCLGlCQUFpQjs7QUFDeEIsTUFBTSxtQkFBbUIsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQztBQUN2RCxXQUFPLEVBQUUsTUFBTTtBQUNmLFVBQU0sRUFBTixNQUFNO0dBQ1AsQ0FBQyxDQUFDO0FBQ0gsTUFBTSxTQUFTLEdBQUcsQUFBQyxtQkFBbUIsQ0FBQyxNQUFNLElBQUksbUJBQW1CLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFB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QixFQUFDLEdBQUcsRUFBQyxPQUFPO1FBQ3ZELG9CQUFDLFNBQVMsSUFBQyxHQUFHLEVBQUMsWUFBWSxFQUFDLGVBQWUsRUFBRSxVQUFVLEFBQUMsR0FBRztRQUMxRCxJQUFJLENBQUMsV0FBVyxFQUFFO1FBQ25COztZQUFLLFNBQVMsRUFBQyxvQkFBb0IsRUFBQyxLQUFLLEVBQUUsRUFBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyx1QkFBdUIsRUFBQyxBQUFDO1VBQ3hGLGdCQUFnQjtVQUNqQjs7Y0FBSyxTQUFTLEVBQUMsaUJBQWlCO1lBQzlCOztnQkFBSSxTQUFTLEVBQUMsV0FBVyxFQUFDLEdBQUcsRUFBQyxlQUFlO2NBQzFDLFFBQVE7Y0FDUixnQkFBZ0I7YUFDZDtXQUNEO1NBQ0Y7T0FDRixDQUNOO0tBQ0g7OztTQW5wQmtCLHVCQUF1QjtHQUFTLEtBQUssQ0FBQyxTQUFTOztxQkFBL0MsdUJBQXVCOztBQXNwQjVDLHVCQUF1QixDQUFDLFNBQVMsR0FBRztBQUNsQyxnQkFBYyxFQUFFLFNBQVMsQ0FBQyxLQUFLLENBQUM7QUFDOUIsVUFBTSxFQUFFLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVTtBQUNuQyxpQkFBYSxFQUFFLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVTtBQUMxQyxRQUFJLEVBQUUsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVO0FBQ2pDLFVBQU0sRUFBRSxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVU7QUFDbkMsU0FBSyxFQUFFLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVTtHQUNuQyxDQUFDLENBQUMsVUFBVTtBQUNiLGtCQUFnQixFQUFFLFNBQVMsQ0FBQyxJQUFJO0FBQ2hDLHlCQUF1QixFQUFFLFNBQVMsQ0FBQyxNQUFNO0NBQzFDLENBQUMiLCJmaWxlIjoiUXVpY2tTZWxlY3Rpb25Db21wb25lbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7XG4gIFByb3ZpZGVyU3BlYyxcbn0gZnJvbSAnLi90eXBlcyc7XG5cbmltcG9ydCB0eXBlIHtcbiAgRGlyZWN0b3J5TmFtZSxcbiAgR3JvdXBlZFJlc3VsdCxcbiAgU2VydmljZU5hbWUsXG59IGZyb20gJy4uLy4uL3F1aWNrLW9wZW4taW50ZXJmYWNlcyc7XG5cbnR5cGUgUmVzdWx0Q29udGV4dCA9IHtcbiAgbm9uRW1wdHlSZXN1bHRzOiBHcm91cGVkUmVzdWx0O1xuICBzZXJ2aWNlTmFtZXM6IEFycmF5PFNlcnZpY2VOYW1lPjtcbiAgY3VycmVudFNlcnZpY2VJbmRleDogbnVtYmVyO1xuICBjdXJyZW50U2VydmljZTogT2JqZWN0O1xuICBkaXJlY3RvcnlOYW1lczogQXJyYXk8RGlyZWN0b3J5TmFtZT47XG4gIGN1cnJlbnREaXJlY3RvcnlJbmRleDogbnVtYmVyO1xuICBjdXJyZW50RGlyZWN0b3J5OiBPYmplY3Q7XG59O1xuXG50eXBlIFNlbGVjdGlvbiA9IHtcbiAgc2VsZWN0ZWREaXJlY3Rvcnk6IHN0cmluZztcbiAgc2VsZWN0ZWRTZXJ2aWNlOiBzdHJpbmc7XG4gIHNlbGVjdGVkSXRlbUluZGV4OiBudW1iZXI7XG59O1xuXG5jb25zdCBBdG9tSW5wdXQgPSByZXF1aXJlKCcuLi8uLi91aS9hdG9tLWlucHV0Jyk7XG5jb25zdCB7Q29tcG9zaXRlRGlzcG9zYWJsZSwgRGlzcG9zYWJsZSwgRW1pdHRlcn0gPSByZXF1aXJlKCdhdG9tJyk7XG5jb25zdCB7XG4gIGRlYm91bmNlLFxuICBvYmplY3QsXG59ID0gcmVxdWlyZSgnLi4vLi4vY29tbW9ucycpO1xuY29uc3Qge1JlYWN0fSA9IHJlcXVpcmUoJ3JlYWN0LWZvci1hdG9tJyk7XG5cbmltcG9ydCBTZWFyY2hSZXN1bHRNYW5hZ2VyIGZyb20gJy4vU2VhcmNoUmVzdWx0TWFuYWdlcic7XG5jb25zdCBzZWFyY2hSZXN1bHRNYW5hZ2VyID0gU2VhcmNoUmVzdWx0TWFuYWdlci5nZXRJbnN0YW5jZSgpO1xuY29uc3QgTnVjbGlkZVRhYnMgPSByZXF1aXJlKCcuLi8uLi91aS90YWJzJyk7XG5jb25zdCB7UHJvcFR5cGVzfSA9IFJlYWN0O1xuY29uc3QgY2xhc3NuYW1lcyA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxuY29uc3Qge1xuICBmaWx0ZXJFbXB0eVJlc3VsdHMsXG59ID0gcmVxdWlyZSgnLi9zZWFyY2hSZXN1bHRIZWxwZXJzJyk7XG5cbi8qKlxuICogRGV0ZXJtaW5lIHdoYXQgdGhlIGFwcGxpY2FibGUgc2hvcnRjdXQgZm9yIGEgZ2l2ZW4gYWN0aW9uIGlzIHdpdGhpbiB0aGlzIGNvbXBvbmVudCdzIGNvbnRleHQuXG4gKiBGb3IgZXhhbXBsZSwgdGhpcyB3aWxsIHJldHVybiBkaWZmZXJlbnQga2V5YmluZGluZ3Mgb24gd2luZG93cyB2cyBsaW51eC5cbiAqL1xuZnVuY3Rpb24gX2ZpbmRLZXliaW5kaW5nRm9yQWN0aW9uKGFjdGlvbjogc3RyaW5nLCB0YXJnZXQ6IEhUTUxFbGVtZW50KTogc3RyaW5nIHtcbiAgY29uc3Qge2h1bWFuaXplS2V5c3Ryb2tlfSA9IHJlcXVpcmUoJy4uLy4uL2tleXN0cm9rZS1sYWJlbCcpO1xuICBjb25zdCBtYXRjaGluZ0tleUJpbmRpbmdzID0gYXRvbS5rZXltYXBzLmZpbmRLZXlCaW5kaW5ncyh7XG4gICAgY29tbWFuZDogYWN0aW9uLFxuICAgIHRhcmdldCxcbiAgfSk7XG4gIGNvbnN0IGtleXN0cm9rZSA9IChtYXRjaGluZ0tleUJpbmRpbmdzLmxlbmd0aCAmJiBtYXRjaGluZ0tleUJpbmRpbmdzWzBdLmtleXN0cm9rZXMpIHx8ICcnO1xuICByZXR1cm4gaHVtYW5pemVLZXlzdHJva2Uoa2V5c3Ryb2tlKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUXVpY2tTZWxlY3Rpb25Db21wb25lbnQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBfZW1pdHRlcjogRW1pdHRlcjtcbiAgX3N1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9tb2RhbE5vZGU6IEhUTUxFbGVtZW50O1xuICBfZGVib3VuY2VkUXVlcnlIYW5kbGVyOiAoKSA9PiB2b2lkO1xuICBfYm91bmRTZWxlY3Q6ICgpID0+IHZvaWQ7XG4gIF9ib3VuZEhhbmRsZVRhYkNoYW5nZTogKHRhYjogUHJvdmlkZXJTcGVjKSA9PiB2b2lkO1xuICBfc3RhdGU6IHtcbiAgICBhY3RpdmVUYWI6IFByb3ZpZGVyU3BlYyxcbiAgICByZXN1bHRzQnlTZXJ2aWNlOiBHcm91cGVkUmVzdWx0LFxuICAgIHJlbmRlcmFibGVQcm92aWRlcnM6IEFycmF5PFByb3ZpZGVyU3BlYz4sXG4gIH07XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IE9iamVjdCkge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICB0aGlzLl9lbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLl9ib3VuZFNlbGVjdCA9ICgpID0+IHRoaXMuc2VsZWN0KCk7XG4gICAgdGhpcy5fYm91bmRIYW5kbGVUYWJDaGFuZ2UgPSAodGFiOiBQcm92aWRlclNwZWMpID0+IHRoaXMuX2hhbmRsZVRhYkNoYW5nZSh0YWIpO1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBhY3RpdmVUYWI6IHNlYXJjaFJlc3VsdE1hbmFnZXIuZ2V0UHJvdmlkZXJCeU5hbWUoc2VhcmNoUmVzdWx0TWFuYWdlci5nZXRBY3RpdmVQcm92aWRlck5hbWUoKSksXG4gICAgICAvLyB0cmVhdGVkIGFzIGltbXV0YWJsZVxuICAgICAgcmVzdWx0c0J5U2VydmljZToge30sXG4gICAgICByZW5kZXJhYmxlUHJvdmlkZXJzOiBzZWFyY2hSZXN1bHRNYW5hZ2VyLmdldFJlbmRlcmFibGVQcm92aWRlcnMoKSxcbiAgICAgIHNlbGVjdGVkU2VydmljZTogJycsXG4gICAgICBzZWxlY3RlZERpcmVjdG9yeTogJycsXG4gICAgICBzZWxlY3RlZEl0ZW1JbmRleDogLTEsXG4gICAgICBoYXNVc2VyU2VsZWN0aW9uOiBmYWxzZSxcbiAgICB9O1xuICAgIHRoaXMuaGFuZGxlUHJvdmlkZXJzQ2hhbmdlQm91bmQgPSB0aGlzLmhhbmRsZVByb3ZpZGVyc0NoYW5nZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuaGFuZGxlUmVzdWx0c0NoYW5nZUJvdW5kID0gdGhpcy5oYW5kbGVSZXN1bHRzQ2hhbmdlLmJpbmQodGhpcyk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5leHRQcm9wczogYW55KSB7XG4gICAgaWYgKG5leHRQcm9wcy5hY3RpdmVQcm92aWRlciAhPT0gdGhpcy5wcm9wcy5hY3RpdmVQcm92aWRlcikge1xuICAgICAgaWYgKG5leHRQcm9wcy5hY3RpdmVQcm92aWRlcikge1xuICAgICAgICB0aGlzLl9nZXRUZXh0RWRpdG9yKCkuc2V0UGxhY2Vob2xkZXJUZXh0KG5leHRQcm9wcy5hY3RpdmVQcm92aWRlci5wcm9tcHQpO1xuICAgICAgICBjb25zdCBuZXdSZXN1bHRzID0ge307XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoXG4gICAgICAgICAge1xuICAgICAgICAgICAgYWN0aXZlVGFiOiBuZXh0UHJvcHMuYWN0aXZlUHJvdmlkZXIgfHwgdGhpcy5zdGF0ZS5hY3RpdmVUYWIsXG4gICAgICAgICAgICByZXN1bHRzQnlTZXJ2aWNlOiBuZXdSZXN1bHRzLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgc2V0SW1tZWRpYXRlKCgpID0+IHRoaXMuc2V0UXVlcnkodGhpcy5yZWZzWydxdWVyeUlucHV0J10uZ2V0VGV4dCgpKSk7XG4gICAgICAgICAgICB0aGlzLl91cGRhdGVRdWVyeUhhbmRsZXIoKTtcbiAgICAgICAgICAgIHRoaXMuX2VtaXR0ZXIuZW1pdCgnaXRlbXMtY2hhbmdlZCcsIG5ld1Jlc3VsdHMpO1xuICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBjb21wb25lbnREaWRVcGRhdGUocHJldlByb3BzOiBhbnksIHByZXZTdGF0ZTogYW55KSB7XG4gICAgaWYgKHByZXZTdGF0ZS5yZXN1bHRzQnlTZXJ2aWNlICE9PSB0aGlzLnN0YXRlLnJlc3VsdHNCeVNlcnZpY2UpIHtcbiAgICAgIHRoaXMuX2VtaXR0ZXIuZW1pdCgnaXRlbXMtY2hhbmdlZCcsIHRoaXMuc3RhdGUucmVzdWx0c0J5U2VydmljZSk7XG4gICAgfVxuXG4gICAgaWYgKFxuICAgICAgcHJldlN0YXRlLnNlbGVjdGVkSXRlbUluZGV4ICE9PSB0aGlzLnN0YXRlLnNlbGVjdGVkSXRlbUluZGV4IHx8XG4gICAgICBwcmV2U3RhdGUuc2VsZWN0ZWRTZXJ2aWNlICE9PSB0aGlzLnN0YXRlLnNlbGVjdGVkU2VydmljZSB8fFxuICAgICAgcHJldlN0YXRlLnNlbGVjdGVkRGlyZWN0b3J5ICE9PSB0aGlzLnN0YXRlLnNlbGVjdGVkRGlyZWN0b3J5XG4gICAgKSB7XG4gICAgICB0aGlzLl91cGRhdGVTY3JvbGxQb3NpdGlvbigpO1xuICAgIH1cbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCk6IHZvaWQge1xuICAgIHRoaXMuX21vZGFsTm9kZSA9IFJlYWN0LmZpbmRET01Ob2RlKHRoaXMpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoXG4gICAgICAgIHRoaXMuX21vZGFsTm9kZSxcbiAgICAgICAgJ2NvcmU6bW92ZS10by1ib3R0b20nLFxuICAgICAgICB0aGlzLmhhbmRsZU1vdmVUb0JvdHRvbS5iaW5kKHRoaXMpXG4gICAgICApLFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQodGhpcy5fbW9kYWxOb2RlLCAnY29yZTptb3ZlLXRvLXRvcCcsIHRoaXMuaGFuZGxlTW92ZVRvVG9wLmJpbmQodGhpcykpLFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQodGhpcy5fbW9kYWxOb2RlLCAnY29yZTptb3ZlLWRvd24nLCB0aGlzLmhhbmRsZU1vdmVEb3duLmJpbmQodGhpcykpLFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQodGhpcy5fbW9kYWxOb2RlLCAnY29yZTptb3ZlLXVwJywgdGhpcy5oYW5kbGVNb3ZlVXAuYmluZCh0aGlzKSksXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZCh0aGlzLl9tb2RhbE5vZGUsICdjb3JlOmNvbmZpcm0nLCB0aGlzLnNlbGVjdC5iaW5kKHRoaXMpKSxcbiAgICApO1xuXG4gICAgY29uc3QgaW5wdXRUZXh0RWRpdG9yID0gdGhpcy5nZXRJbnB1dFRleHRFZGl0b3IoKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIHNlYXJjaFJlc3VsdE1hbmFnZXIub24oXG4gICAgICAgIHNlYXJjaFJlc3VsdE1hbmFnZXIuUFJPVklERVJTX0NIQU5HRUQsXG4gICAgICAgIHRoaXMuaGFuZGxlUHJvdmlkZXJzQ2hhbmdlQm91bmRcbiAgICAgICksXG4gICAgICBzZWFyY2hSZXN1bHRNYW5hZ2VyLm9uKFxuICAgICAgICBzZWFyY2hSZXN1bHRNYW5hZ2VyLlJFU1VMVFNfQ0hBTkdFRCxcbiAgICAgICAgdGhpcy5oYW5kbGVSZXN1bHRzQ2hhbmdlQm91bmRcbiAgICAgICksXG4gICAgKTtcblxuICAgIHRoaXMuX3VwZGF0ZVF1ZXJ5SGFuZGxlcigpO1xuICAgIGlucHV0VGV4dEVkaXRvci5nZXRNb2RlbCgpLm9uRGlkQ2hhbmdlKCgpID0+IHRoaXMuX2hhbmRsZVRleHRJbnB1dENoYW5nZSgpKTtcbiAgICB0aGlzLmNsZWFyKCk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpOiB2b2lkIHtcbiAgICB0aGlzLl9lbWl0dGVyLmRpc3Bvc2UoKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIGhhbmRsZU1vdmVUb0JvdHRvbSgpOiB2b2lkIHtcbiAgICB0aGlzLm1vdmVTZWxlY3Rpb25Ub0JvdHRvbSgpO1xuICAgIHRoaXMub25Vc2VyRGlkQ2hhbmdlU2VsZWN0aW9uKCk7XG4gIH1cblxuICBoYW5kbGVNb3ZlVG9Ub3AoKTogdm9pZCB7XG4gICAgdGhpcy5tb3ZlU2VsZWN0aW9uVG9Ub3AoKTtcbiAgICB0aGlzLm9uVXNlckRpZENoYW5nZVNlbGVjdGlvbigpO1xuICB9XG5cbiAgaGFuZGxlTW92ZURvd24oKTogdm9pZCB7XG4gICAgdGhpcy5tb3ZlU2VsZWN0aW9uRG93bigpO1xuICAgIHRoaXMub25Vc2VyRGlkQ2hhbmdlU2VsZWN0aW9uKCk7XG4gIH1cblxuICBoYW5kbGVNb3ZlVXAoKTogdm9pZCB7XG4gICAgdGhpcy5tb3ZlU2VsZWN0aW9uVXAoKTtcbiAgICB0aGlzLm9uVXNlckRpZENoYW5nZVNlbGVjdGlvbigpO1xuICB9XG5cbiAgb25DYW5jZWxsYXRpb24oY2FsbGJhY2s6ICgpID0+IHZvaWQpOiBEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fZW1pdHRlci5vbignY2FuY2VsZWQnLCBjYWxsYmFjayk7XG4gIH1cblxuICBvblNlbGVjdGlvbihjYWxsYmFjazogKHNlbGVjdGlvbjogYW55KSA9PiB2b2lkKTogRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX2VtaXR0ZXIub24oJ3NlbGVjdGVkJywgY2FsbGJhY2spO1xuICB9XG5cbiAgb25TZWxlY3Rpb25DaGFuZ2VkKGNhbGxiYWNrOiAoc2VsZWN0aW9uSW5kZXg6IGFueSkgPT4gdm9pZCk6IERpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9lbWl0dGVyLm9uKCdzZWxlY3Rpb24tY2hhbmdlZCcsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIG9uSXRlbXNDaGFuZ2VkKGNhbGxiYWNrOiAobmV3SXRlbXM6IEdyb3VwZWRSZXN1bHQpID0+IHZvaWQpOiBEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fZW1pdHRlci5vbignaXRlbXMtY2hhbmdlZCcsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIF91cGRhdGVRdWVyeUhhbmRsZXIoKTogdm9pZCB7XG4gICAgdGhpcy5fZGVib3VuY2VkUXVlcnlIYW5kbGVyID0gZGVib3VuY2UoXG4gICAgICAoKSA9PiB0aGlzLnNldEtleWJvYXJkUXVlcnkodGhpcy5nZXRJbnB1dFRleHRFZGl0b3IoKS5nZXRNb2RlbCgpLmdldFRleHQoKSksXG4gICAgICB0aGlzLmdldFByb3ZpZGVyKCkuZGVib3VuY2VEZWxheSxcbiAgICAgIGZhbHNlXG4gICAgKTtcbiAgfVxuXG4gIF9oYW5kbGVUZXh0SW5wdXRDaGFuZ2UoKTogdm9pZCB7XG4gICAgdGhpcy5fZGVib3VuY2VkUXVlcnlIYW5kbGVyKCk7XG4gIH1cblxuICBoYW5kbGVSZXN1bHRzQ2hhbmdlKCk6IHZvaWQge1xuICAgIHRoaXMuX3VwZGF0ZVJlc3VsdHModGhpcy5wcm9wcy5hY3RpdmVQcm92aWRlci5uYW1lKTtcbiAgfVxuXG4gIF91cGRhdGVSZXN1bHRzKGFjdGl2ZVByb3ZpZGVyTmFtZTogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3QgdXBkYXRlZFJlc3VsdHMgPSBzZWFyY2hSZXN1bHRNYW5hZ2VyLmdldFJlc3VsdHMoXG4gICAgICB0aGlzLnJlZnNbJ3F1ZXJ5SW5wdXQnXS5nZXRUZXh0KCksXG4gICAgICBhY3RpdmVQcm92aWRlck5hbWVcbiAgICApO1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgcmVzdWx0c0J5U2VydmljZTogdXBkYXRlZFJlc3VsdHMsXG4gICAgfSwgKCkgPT4ge1xuICAgICAgaWYgKCF0aGlzLnN0YXRlLmhhc1VzZXJTZWxlY3Rpb24pIHtcbiAgICAgICAgdGhpcy5tb3ZlU2VsZWN0aW9uVG9Ub3AoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGhhbmRsZVByb3ZpZGVyc0NoYW5nZSgpOiB2b2lkIHtcbiAgICBjb25zdCByZW5kZXJhYmxlUHJvdmlkZXJzID0gc2VhcmNoUmVzdWx0TWFuYWdlci5nZXRSZW5kZXJhYmxlUHJvdmlkZXJzKCk7XG4gICAgY29uc3QgYWN0aXZlUHJvdmlkZXJOYW1lID0gc2VhcmNoUmVzdWx0TWFuYWdlci5nZXRBY3RpdmVQcm92aWRlck5hbWUoKTtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHJlbmRlcmFibGVQcm92aWRlcnMsXG4gICAgICBhY3RpdmVQcm92aWRlck5hbWUsXG4gICAgfSk7XG4gICAgdGhpcy5fdXBkYXRlUmVzdWx0cyhhY3RpdmVQcm92aWRlck5hbWUpO1xuICB9XG5cbiAgc2VsZWN0KCk6IHZvaWQge1xuICAgIGNvbnN0IHNlbGVjdGVkSXRlbSA9IHRoaXMuZ2V0U2VsZWN0ZWRJdGVtKCk7XG4gICAgaWYgKCFzZWxlY3RlZEl0ZW0pIHtcbiAgICAgIHRoaXMuY2FuY2VsKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2VtaXR0ZXIuZW1pdCgnc2VsZWN0ZWQnLCBzZWxlY3RlZEl0ZW0pO1xuICAgIH1cbiAgfVxuXG4gIG9uVXNlckRpZENoYW5nZVNlbGVjdGlvbigpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGhhc1VzZXJTZWxlY3Rpb246IHRydWUsXG4gICAgfSk7XG4gIH1cblxuICBjYW5jZWwoKTogdm9pZCB7XG4gICAgdGhpcy5fZW1pdHRlci5lbWl0KCdjYW5jZWxlZCcpO1xuICB9XG5cbiAgY2xlYXJTZWxlY3Rpb24oKTogdm9pZCB7XG4gICAgdGhpcy5zZXRTZWxlY3RlZEluZGV4KCcnLCAnJywgLTEpO1xuICB9XG5cbiAgX2dldEN1cnJlbnRSZXN1bHRDb250ZXh0KCk6ID9SZXN1bHRDb250ZXh0IHtcbiAgICBjb25zdCBub25FbXB0eVJlc3VsdHMgPSBmaWx0ZXJFbXB0eVJlc3VsdHModGhpcy5zdGF0ZS5yZXN1bHRzQnlTZXJ2aWNlKTtcbiAgICBjb25zdCBzZXJ2aWNlTmFtZXMgPSBPYmplY3Qua2V5cyhub25FbXB0eVJlc3VsdHMpO1xuICAgIGNvbnN0IGN1cnJlbnRTZXJ2aWNlSW5kZXggPSBzZXJ2aWNlTmFtZXMuaW5kZXhPZih0aGlzLnN0YXRlLnNlbGVjdGVkU2VydmljZSk7XG4gICAgY29uc3QgY3VycmVudFNlcnZpY2UgPSBub25FbXB0eVJlc3VsdHNbdGhpcy5zdGF0ZS5zZWxlY3RlZFNlcnZpY2VdO1xuXG4gICAgaWYgKCFjdXJyZW50U2VydmljZSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgZGlyZWN0b3J5TmFtZXMgPSBPYmplY3Qua2V5cyhjdXJyZW50U2VydmljZS5yZXN1bHRzKTtcbiAgICBjb25zdCBjdXJyZW50RGlyZWN0b3J5SW5kZXggPSBkaXJlY3RvcnlOYW1lcy5pbmRleE9mKHRoaXMuc3RhdGUuc2VsZWN0ZWREaXJlY3RvcnkpO1xuICAgIGNvbnN0IGN1cnJlbnREaXJlY3RvcnkgPSBjdXJyZW50U2VydmljZS5yZXN1bHRzW3RoaXMuc3RhdGUuc2VsZWN0ZWREaXJlY3RvcnldO1xuXG4gICAgaWYgKCFjdXJyZW50RGlyZWN0b3J5IHx8ICFjdXJyZW50RGlyZWN0b3J5LnJlc3VsdHMpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBub25FbXB0eVJlc3VsdHMsXG4gICAgICBzZXJ2aWNlTmFtZXMsXG4gICAgICBjdXJyZW50U2VydmljZUluZGV4LFxuICAgICAgY3VycmVudFNlcnZpY2UsXG4gICAgICBkaXJlY3RvcnlOYW1lcyxcbiAgICAgIGN1cnJlbnREaXJlY3RvcnlJbmRleCxcbiAgICAgIGN1cnJlbnREaXJlY3RvcnksXG4gICAgfTtcbiAgfVxuXG4gIG1vdmVTZWxlY3Rpb25Eb3duKCk6IHZvaWQge1xuICAgIGNvbnN0IGNvbnRleHQgPSB0aGlzLl9nZXRDdXJyZW50UmVzdWx0Q29udGV4dCgpO1xuICAgIGlmICghY29udGV4dCkge1xuICAgICAgdGhpcy5tb3ZlU2VsZWN0aW9uVG9Ub3AoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5zdGF0ZS5zZWxlY3RlZEl0ZW1JbmRleCA8IGNvbnRleHQuY3VycmVudERpcmVjdG9yeS5yZXN1bHRzLmxlbmd0aCAtIDEpIHtcbiAgICAgIC8vIG9ubHkgYnVtcCB0aGUgaW5kZXggaWYgcmVtYWluaW5nIGluIGN1cnJlbnQgZGlyZWN0b3J5XG4gICAgICB0aGlzLnNldFNlbGVjdGVkSW5kZXgoXG4gICAgICAgIHRoaXMuc3RhdGUuc2VsZWN0ZWRTZXJ2aWNlLFxuICAgICAgICB0aGlzLnN0YXRlLnNlbGVjdGVkRGlyZWN0b3J5LFxuICAgICAgICB0aGlzLnN0YXRlLnNlbGVjdGVkSXRlbUluZGV4ICsgMVxuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gb3RoZXJ3aXNlIGdvIHRvIG5leHQgZGlyZWN0b3J5Li4uXG4gICAgICBpZiAoY29udGV4dC5jdXJyZW50RGlyZWN0b3J5SW5kZXggPCBjb250ZXh0LmRpcmVjdG9yeU5hbWVzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgdGhpcy5zZXRTZWxlY3RlZEluZGV4KFxuICAgICAgICAgIHRoaXMuc3RhdGUuc2VsZWN0ZWRTZXJ2aWNlLFxuICAgICAgICAgIGNvbnRleHQuZGlyZWN0b3J5TmFtZXNbY29udGV4dC5jdXJyZW50RGlyZWN0b3J5SW5kZXggKyAxXSxcbiAgICAgICAgICAwXG4gICAgICAgICk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyAuLi5vciB0aGUgbmV4dCBzZXJ2aWNlLi4uXG4gICAgICAgIGlmIChjb250ZXh0LmN1cnJlbnRTZXJ2aWNlSW5kZXggPCBjb250ZXh0LnNlcnZpY2VOYW1lcy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgY29uc3QgbmV3U2VydmljZU5hbWUgPSBjb250ZXh0LnNlcnZpY2VOYW1lc1tjb250ZXh0LmN1cnJlbnRTZXJ2aWNlSW5kZXggKyAxXTtcbiAgICAgICAgICBjb25zdCBuZXdEaXJlY3RvcnlOYW1lID1cbiAgICAgICAgICAgIE9iamVjdC5rZXlzKGNvbnRleHQubm9uRW1wdHlSZXN1bHRzW25ld1NlcnZpY2VOYW1lXS5yZXN1bHRzKS5zaGlmdCgpO1xuICAgICAgICAgIHRoaXMuc2V0U2VsZWN0ZWRJbmRleChuZXdTZXJ2aWNlTmFtZSwgbmV3RGlyZWN0b3J5TmFtZSwgMCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gLi4ub3Igd3JhcCBhcm91bmQgdG8gdGhlIHZlcnkgdG9wXG4gICAgICAgICAgdGhpcy5tb3ZlU2VsZWN0aW9uVG9Ub3AoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIG1vdmVTZWxlY3Rpb25VcCgpOiB2b2lkIHtcbiAgICBjb25zdCBjb250ZXh0ID0gdGhpcy5fZ2V0Q3VycmVudFJlc3VsdENvbnRleHQoKTtcbiAgICBpZiAoIWNvbnRleHQpIHtcbiAgICAgIHRoaXMubW92ZVNlbGVjdGlvblRvQm90dG9tKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuc3RhdGUuc2VsZWN0ZWRJdGVtSW5kZXggPiAwKSB7XG4gICAgICAvLyBvbmx5IGRlY3JlYXNlIHRoZSBpbmRleCBpZiByZW1haW5pbmcgaW4gY3VycmVudCBkaXJlY3RvcnlcbiAgICAgIHRoaXMuc2V0U2VsZWN0ZWRJbmRleChcbiAgICAgICAgdGhpcy5zdGF0ZS5zZWxlY3RlZFNlcnZpY2UsXG4gICAgICAgIHRoaXMuc3RhdGUuc2VsZWN0ZWREaXJlY3RvcnksXG4gICAgICAgIHRoaXMuc3RhdGUuc2VsZWN0ZWRJdGVtSW5kZXggLSAxXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBvdGhlcndpc2UsIGdvIHRvIHRoZSBwcmV2aW91cyBkaXJlY3RvcnkuLi5cbiAgICAgIGlmIChjb250ZXh0LmN1cnJlbnREaXJlY3RvcnlJbmRleCA+IDApIHtcbiAgICAgICAgdGhpcy5zZXRTZWxlY3RlZEluZGV4KFxuICAgICAgICAgIHRoaXMuc3RhdGUuc2VsZWN0ZWRTZXJ2aWNlLFxuICAgICAgICAgIGNvbnRleHQuZGlyZWN0b3J5TmFtZXNbY29udGV4dC5jdXJyZW50RGlyZWN0b3J5SW5kZXggLSAxXSxcbiAgICAgICAgICBjb250ZXh0LmN1cnJlbnRTZXJ2aWNlXG4gICAgICAgICAgICAucmVzdWx0c1tjb250ZXh0LmRpcmVjdG9yeU5hbWVzW2NvbnRleHQuY3VycmVudERpcmVjdG9yeUluZGV4IC0gMV1dLnJlc3VsdHMubGVuZ3RoIC0gMVxuICAgICAgICApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gLi4ub3IgdGhlIHByZXZpb3VzIHNlcnZpY2UuLi5cbiAgICAgICAgaWYgKGNvbnRleHQuY3VycmVudFNlcnZpY2VJbmRleCA+IDApIHtcbiAgICAgICAgICBjb25zdCBuZXdTZXJ2aWNlTmFtZSA9IGNvbnRleHQuc2VydmljZU5hbWVzW2NvbnRleHQuY3VycmVudFNlcnZpY2VJbmRleCAtIDFdO1xuICAgICAgICAgIGNvbnN0IG5ld0RpcmVjdG9yeU5hbWUgPVxuICAgICAgICAgICAgT2JqZWN0LmtleXMoY29udGV4dC5ub25FbXB0eVJlc3VsdHNbbmV3U2VydmljZU5hbWVdLnJlc3VsdHMpLnBvcCgpO1xuICAgICAgICAgIGlmIChuZXdEaXJlY3RvcnlOYW1lID09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgcmVzdWx0c0ZvckRpcmVjdG9yeSA9XG4gICAgICAgICAgICBjb250ZXh0Lm5vbkVtcHR5UmVzdWx0c1tuZXdTZXJ2aWNlTmFtZV0ucmVzdWx0c1tuZXdEaXJlY3RvcnlOYW1lXTtcbiAgICAgICAgICBpZiAocmVzdWx0c0ZvckRpcmVjdG9yeSA9PSBudWxsIHx8IHJlc3VsdHNGb3JEaXJlY3RvcnkucmVzdWx0cyA9PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuc2V0U2VsZWN0ZWRJbmRleChcbiAgICAgICAgICAgIG5ld1NlcnZpY2VOYW1lLFxuICAgICAgICAgICAgbmV3RGlyZWN0b3J5TmFtZSxcbiAgICAgICAgICAgIHJlc3VsdHNGb3JEaXJlY3RvcnkucmVzdWx0cy5sZW5ndGggLSAxXG4gICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyAuLi5vciB3cmFwIGFyb3VuZCB0byB0aGUgdmVyeSBib3R0b21cbiAgICAgICAgICB0aGlzLm1vdmVTZWxlY3Rpb25Ub0JvdHRvbSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gVXBkYXRlIHRoZSBzY3JvbGwgcG9zaXRpb24gb2YgdGhlIGxpc3QgdmlldyB0byBlbnN1cmUgdGhlIHNlbGVjdGVkIGl0ZW0gaXMgdmlzaWJsZS5cbiAgX3VwZGF0ZVNjcm9sbFBvc2l0aW9uKCk6IHZvaWQge1xuICAgIGlmICghKHRoaXMucmVmcyAmJiB0aGlzLnJlZnNbJ3NlbGVjdGlvbkxpc3QnXSkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgbGlzdE5vZGUgPSAgUmVhY3QuZmluZERPTU5vZGUodGhpcy5yZWZzWydzZWxlY3Rpb25MaXN0J10pO1xuICAgIGNvbnN0IHNlbGVjdGVkTm9kZSA9IGxpc3ROb2RlLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3NlbGVjdGVkJylbMF07XG4gICAgLy8gZmFsc2UgaXMgcGFzc2VkIGZvciBAY2VudGVySWZOZWVkZWQgcGFyYW1ldGVyLCB3aGljaCBkZWZhdWx0cyB0byB0cnVlLlxuICAgIC8vIFBhc3NpbmcgZmFsc2UgY2F1c2VzIHRoZSBtaW5pbXVtIG5lY2Vzc2FyeSBzY3JvbGwgdG8gb2NjdXIsIHNvIHRoZSBzZWxlY3Rpb24gc3RpY2tzIHRvIHRoZVxuICAgIC8vIHRvcC9ib3R0b20uXG4gICAgaWYgKHNlbGVjdGVkTm9kZSkge1xuICAgICAgc2VsZWN0ZWROb2RlLnNjcm9sbEludG9WaWV3SWZOZWVkZWQoZmFsc2UpO1xuICAgIH1cbiAgfVxuXG4gIG1vdmVTZWxlY3Rpb25Ub0JvdHRvbSgpOiB2b2lkIHtcbiAgICBjb25zdCBib3R0b20gPSB0aGlzLl9nZXRPdXRlclJlc3VsdHMoQXJyYXkucHJvdG90eXBlLnBvcCk7XG4gICAgaWYgKCFib3R0b20pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5zZXRTZWxlY3RlZEluZGV4KGJvdHRvbS5zZXJ2aWNlTmFtZSwgYm90dG9tLmRpcmVjdG9yeU5hbWUsIGJvdHRvbS5yZXN1bHRzLmxlbmd0aCAtIDEpO1xuICB9XG5cbiAgbW92ZVNlbGVjdGlvblRvVG9wKCk6IHZvaWQge1xuICAgIGNvbnN0IHRvcCA9IHRoaXMuX2dldE91dGVyUmVzdWx0cyhBcnJheS5wcm90b3R5cGUuc2hpZnQpO1xuICAgIGlmICghdG9wKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuc2V0U2VsZWN0ZWRJbmRleCh0b3Auc2VydmljZU5hbWUsIHRvcC5kaXJlY3RvcnlOYW1lLCAwKTtcbiAgfVxuXG4gIF9nZXRPdXRlclJlc3VsdHMoYXJyYXlPcGVyYXRpb246IEZ1bmN0aW9uKTpcbiAgICA/e3NlcnZpY2VOYW1lOiBzdHJpbmc7IGRpcmVjdG9yeU5hbWU6IHN0cmluZzsgcmVzdWx0czogQXJyYXk8bWl4ZWQ+fSB7XG4gICAgY29uc3Qgbm9uRW1wdHlSZXN1bHRzID0gZmlsdGVyRW1wdHlSZXN1bHRzKHRoaXMuc3RhdGUucmVzdWx0c0J5U2VydmljZSk7XG4gICAgY29uc3Qgc2VydmljZU5hbWUgPSBhcnJheU9wZXJhdGlvbi5jYWxsKE9iamVjdC5rZXlzKG5vbkVtcHR5UmVzdWx0cykpO1xuICAgIGlmICghc2VydmljZU5hbWUpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCBzZXJ2aWNlID0gbm9uRW1wdHlSZXN1bHRzW3NlcnZpY2VOYW1lXTtcbiAgICBjb25zdCBkaXJlY3RvcnlOYW1lID0gYXJyYXlPcGVyYXRpb24uY2FsbChPYmplY3Qua2V5cyhzZXJ2aWNlLnJlc3VsdHMpKTtcbiAgICByZXR1cm4ge1xuICAgICAgc2VydmljZU5hbWUsXG4gICAgICBkaXJlY3RvcnlOYW1lLFxuICAgICAgcmVzdWx0czogbm9uRW1wdHlSZXN1bHRzW3NlcnZpY2VOYW1lXS5yZXN1bHRzW2RpcmVjdG9yeU5hbWVdLnJlc3VsdHMsXG4gICAgfTtcbiAgfVxuXG4gIGdldFNlbGVjdGVkSXRlbSgpOiA/T2JqZWN0IHtcbiAgICByZXR1cm4gdGhpcy5nZXRJdGVtQXRJbmRleChcbiAgICAgIHRoaXMuc3RhdGUuc2VsZWN0ZWRTZXJ2aWNlLFxuICAgICAgdGhpcy5zdGF0ZS5zZWxlY3RlZERpcmVjdG9yeSxcbiAgICAgIHRoaXMuc3RhdGUuc2VsZWN0ZWRJdGVtSW5kZXhcbiAgICApO1xuICB9XG5cbiAgZ2V0SXRlbUF0SW5kZXgoc2VydmljZU5hbWU6IHN0cmluZywgZGlyZWN0b3J5OiBzdHJpbmcsIGl0ZW1JbmRleDogbnVtYmVyKTogP09iamVjdCB7XG4gICAgaWYgKFxuICAgICAgaXRlbUluZGV4ID09PSAtMSB8fFxuICAgICAgIXRoaXMuc3RhdGUucmVzdWx0c0J5U2VydmljZVtzZXJ2aWNlTmFtZV0gfHxcbiAgICAgICF0aGlzLnN0YXRlLnJlc3VsdHNCeVNlcnZpY2Vbc2VydmljZU5hbWVdLnJlc3VsdHNbZGlyZWN0b3J5XSB8fFxuICAgICAgIXRoaXMuc3RhdGUucmVzdWx0c0J5U2VydmljZVtzZXJ2aWNlTmFtZV0ucmVzdWx0c1tkaXJlY3RvcnldLnJlc3VsdHNbaXRlbUluZGV4XVxuICAgICkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnN0YXRlLnJlc3VsdHNCeVNlcnZpY2Vbc2VydmljZU5hbWVdLnJlc3VsdHNbZGlyZWN0b3J5XS5yZXN1bHRzW2l0ZW1JbmRleF07XG4gIH1cblxuICBjb21wb25lbnRGb3JJdGVtKGl0ZW06IGFueSwgc2VydmljZU5hbWU6IHN0cmluZywgZGlyTmFtZTogc3RyaW5nKTogUmVhY3RFbGVtZW50IHtcbiAgICByZXR1cm4gc2VhcmNoUmVzdWx0TWFuYWdlci5nZXRSZW5kZXJlckZvclByb3ZpZGVyKHNlcnZpY2VOYW1lKShcbiAgICAgIGl0ZW0sXG4gICAgICBzZXJ2aWNlTmFtZSxcbiAgICAgIGRpck5hbWUsXG4gICAgKTtcbiAgfVxuXG4gIGdldFNlbGVjdGVkSW5kZXgoKTogU2VsZWN0aW9uIHtcbiAgICByZXR1cm4ge1xuICAgICAgc2VsZWN0ZWREaXJlY3Rvcnk6IHRoaXMuc3RhdGUuc2VsZWN0ZWREaXJlY3RvcnksXG4gICAgICBzZWxlY3RlZFNlcnZpY2U6IHRoaXMuc3RhdGUuc2VsZWN0ZWRTZXJ2aWNlLFxuICAgICAgc2VsZWN0ZWRJdGVtSW5kZXg6IHRoaXMuc3RhdGUuc2VsZWN0ZWRJdGVtSW5kZXgsXG4gICAgfTtcbiAgfVxuXG4gIHNldFNlbGVjdGVkSW5kZXgoc2VydmljZTogc3RyaW5nLCBkaXJlY3Rvcnk6IHN0cmluZywgaXRlbUluZGV4OiBudW1iZXIpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHNlbGVjdGVkU2VydmljZTogc2VydmljZSxcbiAgICAgIHNlbGVjdGVkRGlyZWN0b3J5OiBkaXJlY3RvcnksXG4gICAgICBzZWxlY3RlZEl0ZW1JbmRleDogaXRlbUluZGV4LFxuICAgIH0sICgpID0+IHtcbiAgICAgIHRoaXMuX2VtaXR0ZXIuZW1pdCgnc2VsZWN0aW9uLWNoYW5nZWQnLCB0aGlzLmdldFNlbGVjdGVkSW5kZXgoKSk7XG4gICAgICB0aGlzLm9uVXNlckRpZENoYW5nZVNlbGVjdGlvbigpO1xuICAgIH0pO1xuICB9XG5cbiAgcmVzZXRTZWxlY3Rpb24oKTogdm9pZCB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBzZWxlY3RlZFNlcnZpY2U6ICcnLFxuICAgICAgc2VsZWN0ZWREaXJlY3Rvcnk6ICcnLFxuICAgICAgc2VsZWN0ZWRJdGVtSW5kZXg6IC0xLFxuICAgICAgaGFzVXNlclNlbGVjdGlvbjogZmFsc2UsXG4gICAgfSk7XG4gIH1cblxuICBzZXRLZXlib2FyZFF1ZXJ5KHF1ZXJ5OiBzdHJpbmcpIHtcbiAgICB0aGlzLnJlc2V0U2VsZWN0aW9uKCk7XG4gICAgdGhpcy5zZXRRdWVyeShxdWVyeSk7XG4gIH1cblxuICBzZXRRdWVyeShxdWVyeTogc3RyaW5nKSB7XG4gICAgcmVxdWlyZSgnLi9RdWlja1NlbGVjdGlvbkFjdGlvbnMnKS5xdWVyeShxdWVyeSk7XG4gIH1cblxuICBnZXRQcm92aWRlcigpOiBQcm92aWRlclNwZWMge1xuICAgIHJldHVybiB0aGlzLnByb3BzLmFjdGl2ZVByb3ZpZGVyO1xuICB9XG5cbiAgZ2V0SW5wdXRUZXh0RWRpdG9yKCk6IGF0b20kVGV4dEVkaXRvckVsZW1lbnQge1xuICAgIHJldHVybiBSZWFjdC5maW5kRE9NTm9kZSh0aGlzLnJlZnNbJ3F1ZXJ5SW5wdXQnXSk7XG4gIH1cblxuICBjbGVhcigpOiB2b2lkIHtcbiAgICB0aGlzLmdldElucHV0VGV4dEVkaXRvcigpLmdldE1vZGVsKCkuc2V0VGV4dCgnJyk7XG4gICAgdGhpcy5jbGVhclNlbGVjdGlvbigpO1xuICB9XG5cbiAgZm9jdXMoKTogdm9pZCB7XG4gICAgdGhpcy5nZXRJbnB1dFRleHRFZGl0b3IoKS5mb2N1cygpO1xuICB9XG5cbiAgYmx1cigpOiB2b2lkIHtcbiAgICB0aGlzLmdldElucHV0VGV4dEVkaXRvcigpLmJsdXIoKTtcbiAgfVxuXG4gIHNldElucHV0VmFsdWUodmFsdWU6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuX2dldFRleHRFZGl0b3IoKS5zZXRUZXh0KHZhbHVlKTtcbiAgfVxuXG4gIHNlbGVjdElucHV0KCk6IHZvaWQge1xuICAgIHRoaXMuX2dldFRleHRFZGl0b3IoKS5zZWxlY3RBbGwoKTtcbiAgfVxuXG4gIF9nZXRUZXh0RWRpdG9yKCk6IFRleHRFZGl0b3Ige1xuICAgIHJldHVybiB0aGlzLnJlZnNbJ3F1ZXJ5SW5wdXQnXS5nZXRUZXh0RWRpdG9yKCk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIG5ld1RhYiBpcyBhY3R1YWxseSBhIFByb3ZpZGVyU3BlYyBwbHVzIHRoZSBgbmFtZWAgYW5kIGB0YWJDb250ZW50YCBwcm9wZXJ0aWVzIGFkZGVkIGJ5XG4gICAqICAgICBfcmVuZGVyVGFicygpLCB3aGljaCBjcmVhdGVkIHRoZSB0YWIgb2JqZWN0IGluIHRoZSBmaXJzdCBwbGFjZS5cbiAgICovXG4gIF9oYW5kbGVUYWJDaGFuZ2UobmV3VGFiOiBQcm92aWRlclNwZWMpOiB2b2lkIHtcbiAgICBjb25zdCBwcm92aWRlck5hbWUgPSBuZXdUYWIubmFtZTtcbiAgICBpZiAocHJvdmlkZXJOYW1lICE9PSB0aGlzLnByb3BzLmFjdGl2ZVByb3ZpZGVyLm5hbWUpIHtcbiAgICAgIGlmICh0aGlzLnByb3BzLm9uUHJvdmlkZXJDaGFuZ2UpIHtcbiAgICAgICAgdGhpcy5wcm9wcy5vblByb3ZpZGVyQ2hhbmdlKHByb3ZpZGVyTmFtZSk7XG4gICAgICB9XG4gICAgICB0aGlzLl9lbWl0dGVyLmVtaXQoJ2FjdGl2ZS1wcm92aWRlci1jaGFuZ2VkJywgcHJvdmlkZXJOYW1lKTtcbiAgICB9XG4gICAgdGhpcy5yZWZzWydxdWVyeUlucHV0J10uZm9jdXMoKTtcbiAgfVxuXG4gIF9yZW5kZXJUYWJzKCk6IFJlYWN0RWxlbWVudCB7XG4gICAgY29uc3QgdGFicyA9IHRoaXMuc3RhdGUucmVuZGVyYWJsZVByb3ZpZGVycy5tYXAodGFiID0+IHtcbiAgICAgIGxldCBrZXlCaW5kaW5nID0gbnVsbDsvL1RPRE9cbiAgICAgIGNvbnN0IGh1bWFuaXplZEtleWJpbmRpbmcgPSBfZmluZEtleWJpbmRpbmdGb3JBY3Rpb24odGFiLmFjdGlvbiB8fCAnJywgdGhpcy5fbW9kYWxOb2RlKTtcbiAgICAgIGlmIChodW1hbml6ZWRLZXliaW5kaW5nICE9PSAnJykge1xuICAgICAgICBrZXlCaW5kaW5nID0gKFxuICAgICAgICAgIDxrYmQgY2xhc3NOYW1lPVwia2V5LWJpbmRpbmdcIj5cbiAgICAgICAgICAgIHtodW1hbml6ZWRLZXliaW5kaW5nfVxuICAgICAgICAgIDwva2JkPlxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4udGFiLFxuICAgICAgICBuYW1lOiB0YWIubmFtZSxcbiAgICAgICAgdGFiQ29udGVudDogPHNwYW4+e3RhYi50aXRsZX17a2V5QmluZGluZ308L3NwYW4+LFxuICAgICAgfTtcbiAgICB9KTtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJvbW5pc2VhcmNoLXRhYnNcIj5cbiAgICAgICAgPE51Y2xpZGVUYWJzXG4gICAgICAgICAgdGFicz17dGFic31cbiAgICAgICAgICBhY3RpdmVUYWJOYW1lPXt0aGlzLnN0YXRlLmFjdGl2ZVRhYi5uYW1lfVxuICAgICAgICAgIG9uQWN0aXZlVGFiQ2hhbmdlPXt0aGlzLl9ib3VuZEhhbmRsZVRhYkNoYW5nZX1cbiAgICAgICAgLz5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICBfcmVuZGVyRW1wdHlNZXNzYWdlKG1lc3NhZ2U6IHN0cmluZyk6IFJlYWN0RWxlbWVudCB7XG4gICAgcmV0dXJuIChcbiAgICAgIDx1bCBjbGFzc05hbWU9XCJiYWNrZ3JvdW5kLW1lc3NhZ2UgY2VudGVyZWRcIj5cbiAgICAgICAgPGxpPnttZXNzYWdlfTwvbGk+XG4gICAgICA8L3VsPlxuICAgICk7XG4gIH1cblxuICBfaGFzTm9SZXN1bHRzKCk6IGJvb2xlYW4ge1xuICAgIGZvciAoY29uc3Qgc2VydmljZU5hbWUgaW4gdGhpcy5zdGF0ZS5yZXN1bHRzQnlTZXJ2aWNlKSB7XG4gICAgICBjb25zdCBzZXJ2aWNlID0gdGhpcy5zdGF0ZS5yZXN1bHRzQnlTZXJ2aWNlW3NlcnZpY2VOYW1lXTtcbiAgICAgIGZvciAoY29uc3QgZGlyTmFtZSBpbiBzZXJ2aWNlKSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdHMgPSBzZXJ2aWNlW2Rpck5hbWVdO1xuICAgICAgICBpZiAoIXJlc3VsdHMubG9hZGluZyAmJiByZXN1bHRzLnJlc3VsdHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIGxldCBudW1Ub3RhbFJlc3VsdHNSZW5kZXJlZCA9IDA7XG4gICAgY29uc3QgaXNPbW5pU2VhcmNoQWN0aXZlID0gdGhpcy5zdGF0ZS5hY3RpdmVUYWIubmFtZSA9PT0gJ09tbmlTZWFyY2hSZXN1bHRQcm92aWRlcic7XG4gICAgbGV0IG51bVF1ZXJpZXNPdXRzdGFuZGluZyA9IDA7XG4gICAgY29uc3Qgc2VydmljZU5hbWVzID0gT2JqZWN0LmtleXModGhpcy5zdGF0ZS5yZXN1bHRzQnlTZXJ2aWNlKTtcbiAgICBjb25zdCBzZXJ2aWNlcyA9IHNlcnZpY2VOYW1lcy5tYXAoc2VydmljZU5hbWUgPT4ge1xuICAgICAgbGV0IG51bVJlc3VsdHNGb3JTZXJ2aWNlID0gMDtcbiAgICAgIGNvbnN0IGRpcmVjdG9yaWVzID0gdGhpcy5zdGF0ZS5yZXN1bHRzQnlTZXJ2aWNlW3NlcnZpY2VOYW1lXS5yZXN1bHRzO1xuICAgICAgY29uc3Qgc2VydmljZVRpdGxlID0gdGhpcy5zdGF0ZS5yZXN1bHRzQnlTZXJ2aWNlW3NlcnZpY2VOYW1lXS50aXRsZTtcbiAgICAgIGNvbnN0IGRpcmVjdG9yeU5hbWVzID0gT2JqZWN0LmtleXMoZGlyZWN0b3JpZXMpO1xuICAgICAgY29uc3QgZGlyZWN0b3JpZXNGb3JTZXJ2aWNlID0gZGlyZWN0b3J5TmFtZXMubWFwKGRpck5hbWUgPT4ge1xuICAgICAgICBjb25zdCByZXN1bHRzRm9yRGlyZWN0b3J5ID0gZGlyZWN0b3JpZXNbZGlyTmFtZV07XG4gICAgICAgIGxldCBtZXNzYWdlID0gbnVsbDtcbiAgICAgICAgaWYgKHJlc3VsdHNGb3JEaXJlY3RvcnkubG9hZGluZykge1xuICAgICAgICAgIG51bVF1ZXJpZXNPdXRzdGFuZGluZysrO1xuICAgICAgICAgIGlmICghaXNPbW5pU2VhcmNoQWN0aXZlKSB7XG4gICAgICAgICAgICBudW1Ub3RhbFJlc3VsdHNSZW5kZXJlZCsrO1xuICAgICAgICAgICAgbWVzc2FnZSA9IChcbiAgICAgICAgICAgICAgPHNwYW4+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibG9hZGluZyBsb2FkaW5nLXNwaW5uZXItdGlueSBpbmxpbmUtYmxvY2tcIiAvPlxuICAgICAgICAgICAgICAgIExvYWRpbmcuLi5cbiAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAocmVzdWx0c0ZvckRpcmVjdG9yeS5lcnJvciAmJiAhaXNPbW5pU2VhcmNoQWN0aXZlKSB7XG4gICAgICAgICAgbWVzc2FnZSA9IChcbiAgICAgICAgICAgIDxzcGFuPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJpY29uIGljb24tY2lyY2xlLXNsYXNoXCIgLz5cbiAgICAgICAgICAgICAgRXJyb3I6IDxwcmU+e3Jlc3VsdHNGb3JEaXJlY3RvcnkuZXJyb3J9PC9wcmU+XG4gICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIGlmIChyZXN1bHRzRm9yRGlyZWN0b3J5LnJlc3VsdHMubGVuZ3RoID09PSAwICYmICFpc09tbmlTZWFyY2hBY3RpdmUpIHtcbiAgICAgICAgICBtZXNzYWdlID0gKFxuICAgICAgICAgICAgPHNwYW4+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImljb24gaWNvbi14XCIgLz5cbiAgICAgICAgICAgICAgTm8gcmVzdWx0c1xuICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaXRlbUNvbXBvbmVudHMgPSByZXN1bHRzRm9yRGlyZWN0b3J5LnJlc3VsdHMubWFwKChpdGVtLCBpdGVtSW5kZXgpID0+IHtcbiAgICAgICAgICBudW1SZXN1bHRzRm9yU2VydmljZSsrO1xuICAgICAgICAgIG51bVRvdGFsUmVzdWx0c1JlbmRlcmVkKys7XG4gICAgICAgICAgY29uc3QgaXNTZWxlY3RlZCA9IChcbiAgICAgICAgICAgIHNlcnZpY2VOYW1lID09PSB0aGlzLnN0YXRlLnNlbGVjdGVkU2VydmljZSAmJlxuICAgICAgICAgICAgZGlyTmFtZSA9PT0gdGhpcy5zdGF0ZS5zZWxlY3RlZERpcmVjdG9yeSAmJlxuICAgICAgICAgICAgaXRlbUluZGV4ID09PSB0aGlzLnN0YXRlLnNlbGVjdGVkSXRlbUluZGV4XG4gICAgICAgICAgKTtcbiAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGxpXG4gICAgICAgICAgICAgIGNsYXNzTmFtZT17Y2xhc3NuYW1lcyh7XG4gICAgICAgICAgICAgICAgJ3F1aWNrLW9wZW4tcmVzdWx0LWl0ZW0nOiB0cnVlLFxuICAgICAgICAgICAgICAgICdsaXN0LWl0ZW0nOiB0cnVlLFxuICAgICAgICAgICAgICAgIHNlbGVjdGVkOiBpc1NlbGVjdGVkLFxuICAgICAgICAgICAgICB9KX1cbiAgICAgICAgICAgICAga2V5PXtzZXJ2aWNlTmFtZSArIGRpck5hbWUgKyBpdGVtSW5kZXh9XG4gICAgICAgICAgICAgIG9uTW91c2VEb3duPXt0aGlzLl9ib3VuZFNlbGVjdH1cbiAgICAgICAgICAgICAgb25Nb3VzZUVudGVyPXt0aGlzLnNldFNlbGVjdGVkSW5kZXguYmluZCh0aGlzLCBzZXJ2aWNlTmFtZSwgZGlyTmFtZSwgaXRlbUluZGV4KX0+XG4gICAgICAgICAgICAgIHt0aGlzLmNvbXBvbmVudEZvckl0ZW0oaXRlbSwgc2VydmljZU5hbWUsIGRpck5hbWUpfVxuICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICApO1xuICAgICAgICB9KTtcbiAgICAgICAgbGV0IGRpcmVjdG9yeUxhYmVsID0gbnVsbDtcbiAgICAgICAgLy9oaWRlIGZvbGRlcnMgaWYgb25seSAxIGxldmVsIHdvdWxkIGJlIHNob3duLCBvciBpZiBubyByZXN1bHRzIHdlcmUgZm91bmRcbiAgICAgICAgY29uc3Qgc2hvd0RpcmVjdG9yaWVzID0gZGlyZWN0b3J5TmFtZXMubGVuZ3RoID4gMSAmJlxuICAgICAgICAgICghaXNPbW5pU2VhcmNoQWN0aXZlIHx8IHJlc3VsdHNGb3JEaXJlY3RvcnkucmVzdWx0cy5sZW5ndGggPiAwKTtcbiAgICAgICAgaWYgKHNob3dEaXJlY3Rvcmllcykge1xuICAgICAgICAgIGRpcmVjdG9yeUxhYmVsID0gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJsaXN0LWl0ZW1cIj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiaWNvbiBpY29uLWZpbGUtZGlyZWN0b3J5XCI+e2Rpck5hbWV9PC9zcGFuPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIDxsaSBjbGFzc05hbWU9e2NsYXNzbmFtZXMoeydsaXN0LW5lc3RlZC1pdGVtJzogc2hvd0RpcmVjdG9yaWVzfSl9IGtleT17ZGlyTmFtZX0+XG4gICAgICAgICAgICB7ZGlyZWN0b3J5TGFiZWx9XG4gICAgICAgICAgICB7bWVzc2FnZX1cbiAgICAgICAgICAgIDx1bCBjbGFzc05hbWU9XCJsaXN0LXRyZWVcIj5cbiAgICAgICAgICAgICAge2l0ZW1Db21wb25lbnRzfVxuICAgICAgICAgICAgPC91bD5cbiAgICAgICAgICA8L2xpPlxuICAgICAgICApO1xuICAgICAgfSk7XG4gICAgICBsZXQgc2VydmljZUxhYmVsID0gbnVsbDtcbiAgICAgIGlmIChpc09tbmlTZWFyY2hBY3RpdmUgJiYgbnVtUmVzdWx0c0ZvclNlcnZpY2UgPiAwKSB7XG4gICAgICAgIHNlcnZpY2VMYWJlbCA9IChcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImxpc3QtaXRlbVwiPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiaWNvbiBpY29uLWdlYXJcIj57c2VydmljZVRpdGxlfTwvc3Bhbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICA8bGkgY2xhc3NOYW1lPVwibGlzdC1uZXN0ZWQtaXRlbVwiIGtleT17c2VydmljZU5hbWV9PlxuICAgICAgICAgICAge3NlcnZpY2VMYWJlbH1cbiAgICAgICAgICAgIDx1bCBjbGFzc05hbWU9XCJsaXN0LXRyZWVcIj5cbiAgICAgICAgICAgICAge2RpcmVjdG9yaWVzRm9yU2VydmljZX1cbiAgICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgPC9saT5cbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBkaXJlY3Rvcmllc0ZvclNlcnZpY2U7XG4gICAgfSk7XG4gICAgbGV0IG5vUmVzdWx0c01lc3NhZ2UgPSBudWxsO1xuICAgIGlmIChvYmplY3QuaXNFbXB0eSh0aGlzLnN0YXRlLnJlc3VsdHNCeVNlcnZpY2UpKSB7XG4gICAgICBub1Jlc3VsdHNNZXNzYWdlID0gdGhpcy5fcmVuZGVyRW1wdHlNZXNzYWdlKCdTZWFyY2ggYXdheSEnKTtcbiAgICB9IGVsc2UgaWYgKG51bVRvdGFsUmVzdWx0c1JlbmRlcmVkID09PSAwKSB7XG4gICAgICBub1Jlc3VsdHNNZXNzYWdlID0gdGhpcy5fcmVuZGVyRW1wdHlNZXNzYWdlKDxzcGFuPsKvXFxfKOODhClfL8KvPGJyLz5ObyByZXN1bHRzPC9zcGFuPik7XG4gICAgfVxuICAgIGNvbnN0IGN1cnJlbnRQcm92aWRlciA9IHRoaXMuZ2V0UHJvdmlkZXIoKTtcbiAgICBjb25zdCBwcm9tcHRUZXh0ID0gKGN1cnJlbnRQcm92aWRlciAmJiBjdXJyZW50UHJvdmlkZXIucHJvbXB0KSB8fCAnJztcbiAgICBsZXQgb21uaVNlYXJjaFN0YXR1cyA9IG51bGw7XG4gICAgaWYgKGlzT21uaVNlYXJjaEFjdGl2ZSAmJiBudW1RdWVyaWVzT3V0c3RhbmRpbmcgPiAwKSB7XG4gICAgICBvbW5pU2VhcmNoU3RhdHVzID0gKFxuICAgICAgICA8c3Bhbj5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJsb2FkaW5nIGxvYWRpbmctc3Bpbm5lci10aW55IGlubGluZS1ibG9ja1wiIC8+XG4gICAgICAgICAge2BMb2FkaW5nLi4uYH1cbiAgICAgICAgPC9zcGFuPlxuICAgICAgKTtcbiAgICB9XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwic2VsZWN0LWxpc3Qgb21uaXNlYXJjaC1tb2RhbFwiIHJlZj1cIm1vZGFsXCI+XG4gICAgICAgIDxBdG9tSW5wdXQgcmVmPVwicXVlcnlJbnB1dFwiIHBsYWNlaG9sZGVyVGV4dD17cHJvbXB0VGV4dH0gLz5cbiAgICAgICAge3RoaXMuX3JlbmRlclRhYnMoKX1cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJvbW5pc2VhcmNoLXJlc3VsdHNcIiBzdHlsZT17e21heEhlaWdodDogdGhpcy5wcm9wcy5tYXhTY3JvbGxhYmxlQXJlYUhlaWdodH19PlxuICAgICAgICAgIHtub1Jlc3VsdHNNZXNzYWdlfVxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwib21uaXNlYXJjaC1wYW5lXCI+XG4gICAgICAgICAgICA8dWwgY2xhc3NOYW1lPVwibGlzdC10cmVlXCIgcmVmPVwic2VsZWN0aW9uTGlzdFwiPlxuICAgICAgICAgICAgICB7c2VydmljZXN9XG4gICAgICAgICAgICAgIHtvbW5pU2VhcmNoU3RhdHVzfVxuICAgICAgICAgICAgPC91bD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG59XG5cblF1aWNrU2VsZWN0aW9uQ29tcG9uZW50LnByb3BUeXBlcyA9IHtcbiAgYWN0aXZlUHJvdmlkZXI6IFByb3BUeXBlcy5zaGFwZSh7XG4gICAgYWN0aW9uOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgZGVib3VuY2VEZWxheTogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICAgIG5hbWU6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICBwcm9tcHQ6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICB0aXRsZTogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICB9KS5pc1JlcXVpcmVkLFxuICBvblByb3ZpZGVyQ2hhbmdlOiBQcm9wVHlwZXMuZnVuYyxcbiAgbWF4U2Nyb2xsYWJsZUFyZWFIZWlnaHQ6IFByb3BUeXBlcy5udW1iZXIsXG59O1xuIl19