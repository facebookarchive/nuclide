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

var React = require('react-for-atom');

var searchResultManager = _SearchResultManager2['default'].getInstance();
var NuclideTabs = require('../../ui/tabs');
var PropTypes = React.PropTypes;

var classnames = require('classnames');

var _require3 = require('./searchResultHelpers');

var filterEmptyResults = _require3.filterEmptyResults;

/**
 * Determine what the applicable shortcut for a given action is within this component's context.
 * For example, this will return different keybindings on windows vs linux.
 */
function _findKeybindingForAction(action, target) {
  var _require4 = require('../../keystroke-label');

  var humanizeKeystroke = _require4.humanizeKeystroke;

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlF1aWNrU2VsZWN0aW9uQ29tcG9uZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzttQ0E2Q2dDLHVCQUF1Qjs7OztBQVJ2RCxJQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMscUJBQXFCLENBQUMsQ0FBQzs7ZUFDRSxPQUFPLENBQUMsTUFBTSxDQUFDOztJQUEzRCxtQkFBbUIsWUFBbkIsbUJBQW1CO0lBQUUsVUFBVSxZQUFWLFVBQVU7SUFBRSxPQUFPLFlBQVAsT0FBTzs7Z0JBSTNDLE9BQU8sQ0FBQyxlQUFlLENBQUM7O0lBRjFCLFFBQVEsYUFBUixRQUFRO0lBQ1IsTUFBTSxhQUFOLE1BQU07O0FBRVIsSUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUM7O0FBR3hDLElBQU0sbUJBQW1CLEdBQUcsaUNBQW9CLFdBQVcsRUFBRSxDQUFDO0FBQzlELElBQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUN0QyxTQUFTLEdBQUksS0FBSyxDQUFsQixTQUFTOztBQUNoQixJQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7O2dCQUlyQyxPQUFPLENBQUMsdUJBQXVCLENBQUM7O0lBRGxDLGtCQUFrQixhQUFsQixrQkFBa0I7Ozs7OztBQU9wQixTQUFTLHdCQUF3QixDQUFDLE1BQWMsRUFBRSxNQUFtQixFQUFVO2tCQUNqRCxPQUFPLENBQUMsdUJBQXVCLENBQUM7O01BQXJELGlCQUFpQixhQUFqQixpQkFBaUI7O0FBQ3hCLE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUM7QUFDdkQsV0FBTyxFQUFFLE1BQU07QUFDZixVQUFNLEVBQU4sTUFBTTtHQUNQLENBQUMsQ0FBQztBQUNILE1BQU0sU0FBUyxHQUFHLEFBQUMsbUJBQW1CLENBQUMsTUFBTSxJQUFJLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUs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RUFBQyxHQUFHLEVBQUMsT0FBTztRQUN2RCxvQkFBQyxTQUFTLElBQUMsR0FBRyxFQUFDLFlBQVksRUFBQyxlQUFlLEVBQUUsVUFBVSxBQUFDLEdBQUc7UUFDMUQsSUFBSSxDQUFDLFdBQVcsRUFBRTtRQUNuQjs7WUFBSyxTQUFTLEVBQUMsb0JBQW9CLEVBQUMsS0FBSyxFQUFFLEVBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsdUJBQXVCLEVBQUMsQUFBQztVQUN4RixnQkFBZ0I7VUFDakI7O2NBQUssU0FBUyxFQUFDLGlCQUFpQjtZQUM5Qjs7Z0JBQUksU0FBUyxFQUFDLFdBQVcsRUFBQyxHQUFHLEVBQUMsZUFBZTtjQUMxQyxRQUFRO2NBQ1IsZ0JBQWdCO2FBQ2Q7V0FDRDtTQUNGO09BQ0YsQ0FDTjtLQUNIOzs7U0FucEJrQix1QkFBdUI7R0FBUyxLQUFLLENBQUMsU0FBUzs7cUJBQS9DLHVCQUF1Qjs7QUFzcEI1Qyx1QkFBdUIsQ0FBQyxTQUFTLEdBQUc7QUFDbEMsZ0JBQWMsRUFBRSxTQUFTLENBQUMsS0FBSyxDQUFDO0FBQzlCLFVBQU0sRUFBRSxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVU7QUFDbkMsaUJBQWEsRUFBRSxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVU7QUFDMUMsUUFBSSxFQUFFLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVTtBQUNqQyxVQUFNLEVBQUUsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVO0FBQ25DLFNBQUssRUFBRSxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVU7R0FDbkMsQ0FBQyxDQUFDLFVBQVU7QUFDYixrQkFBZ0IsRUFBRSxTQUFTLENBQUMsSUFBSTtBQUNoQyx5QkFBdUIsRUFBRSxTQUFTLENBQUMsTUFBTTtDQUMxQyxDQUFDIiwiZmlsZSI6IlF1aWNrU2VsZWN0aW9uQ29tcG9uZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge1xuICBQcm92aWRlclNwZWMsXG59IGZyb20gJy4vdHlwZXMnO1xuXG5pbXBvcnQgdHlwZSB7XG4gIERpcmVjdG9yeU5hbWUsXG4gIEdyb3VwZWRSZXN1bHQsXG4gIFNlcnZpY2VOYW1lLFxufSBmcm9tICcuLi8uLi9xdWljay1vcGVuLWludGVyZmFjZXMnO1xuXG50eXBlIFJlc3VsdENvbnRleHQgPSB7XG4gIG5vbkVtcHR5UmVzdWx0czogR3JvdXBlZFJlc3VsdDtcbiAgc2VydmljZU5hbWVzOiBBcnJheTxTZXJ2aWNlTmFtZT47XG4gIGN1cnJlbnRTZXJ2aWNlSW5kZXg6IG51bWJlcjtcbiAgY3VycmVudFNlcnZpY2U6IE9iamVjdDtcbiAgZGlyZWN0b3J5TmFtZXM6IEFycmF5PERpcmVjdG9yeU5hbWU+O1xuICBjdXJyZW50RGlyZWN0b3J5SW5kZXg6IG51bWJlcjtcbiAgY3VycmVudERpcmVjdG9yeTogT2JqZWN0O1xufTtcblxudHlwZSBTZWxlY3Rpb24gPSB7XG4gIHNlbGVjdGVkRGlyZWN0b3J5OiBzdHJpbmc7XG4gIHNlbGVjdGVkU2VydmljZTogc3RyaW5nO1xuICBzZWxlY3RlZEl0ZW1JbmRleDogbnVtYmVyO1xufTtcblxuY29uc3QgQXRvbUlucHV0ID0gcmVxdWlyZSgnLi4vLi4vdWkvYXRvbS1pbnB1dCcpO1xuY29uc3Qge0NvbXBvc2l0ZURpc3Bvc2FibGUsIERpc3Bvc2FibGUsIEVtaXR0ZXJ9ID0gcmVxdWlyZSgnYXRvbScpO1xuY29uc3Qge1xuICBkZWJvdW5jZSxcbiAgb2JqZWN0LFxufSA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbnMnKTtcbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QtZm9yLWF0b20nKTtcblxuaW1wb3J0IFNlYXJjaFJlc3VsdE1hbmFnZXIgZnJvbSAnLi9TZWFyY2hSZXN1bHRNYW5hZ2VyJztcbmNvbnN0IHNlYXJjaFJlc3VsdE1hbmFnZXIgPSBTZWFyY2hSZXN1bHRNYW5hZ2VyLmdldEluc3RhbmNlKCk7XG5jb25zdCBOdWNsaWRlVGFicyA9IHJlcXVpcmUoJy4uLy4uL3VpL3RhYnMnKTtcbmNvbnN0IHtQcm9wVHlwZXN9ID0gUmVhY3Q7XG5jb25zdCBjbGFzc25hbWVzID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG5jb25zdCB7XG4gIGZpbHRlckVtcHR5UmVzdWx0cyxcbn0gPSByZXF1aXJlKCcuL3NlYXJjaFJlc3VsdEhlbHBlcnMnKTtcblxuLyoqXG4gKiBEZXRlcm1pbmUgd2hhdCB0aGUgYXBwbGljYWJsZSBzaG9ydGN1dCBmb3IgYSBnaXZlbiBhY3Rpb24gaXMgd2l0aGluIHRoaXMgY29tcG9uZW50J3MgY29udGV4dC5cbiAqIEZvciBleGFtcGxlLCB0aGlzIHdpbGwgcmV0dXJuIGRpZmZlcmVudCBrZXliaW5kaW5ncyBvbiB3aW5kb3dzIHZzIGxpbnV4LlxuICovXG5mdW5jdGlvbiBfZmluZEtleWJpbmRpbmdGb3JBY3Rpb24oYWN0aW9uOiBzdHJpbmcsIHRhcmdldDogSFRNTEVsZW1lbnQpOiBzdHJpbmcge1xuICBjb25zdCB7aHVtYW5pemVLZXlzdHJva2V9ID0gcmVxdWlyZSgnLi4vLi4va2V5c3Ryb2tlLWxhYmVsJyk7XG4gIGNvbnN0IG1hdGNoaW5nS2V5QmluZGluZ3MgPSBhdG9tLmtleW1hcHMuZmluZEtleUJpbmRpbmdzKHtcbiAgICBjb21tYW5kOiBhY3Rpb24sXG4gICAgdGFyZ2V0LFxuICB9KTtcbiAgY29uc3Qga2V5c3Ryb2tlID0gKG1hdGNoaW5nS2V5QmluZGluZ3MubGVuZ3RoICYmIG1hdGNoaW5nS2V5QmluZGluZ3NbMF0ua2V5c3Ryb2tlcykgfHwgJyc7XG4gIHJldHVybiBodW1hbml6ZUtleXN0cm9rZShrZXlzdHJva2UpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBRdWlja1NlbGVjdGlvbkNvbXBvbmVudCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIF9lbWl0dGVyOiBFbWl0dGVyO1xuICBfc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX21vZGFsTm9kZTogSFRNTEVsZW1lbnQ7XG4gIF9kZWJvdW5jZWRRdWVyeUhhbmRsZXI6ICgpID0+IHZvaWQ7XG4gIF9ib3VuZFNlbGVjdDogKCkgPT4gdm9pZDtcbiAgX2JvdW5kSGFuZGxlVGFiQ2hhbmdlOiAodGFiOiBQcm92aWRlclNwZWMpID0+IHZvaWQ7XG4gIF9zdGF0ZToge1xuICAgIGFjdGl2ZVRhYjogUHJvdmlkZXJTcGVjLFxuICAgIHJlc3VsdHNCeVNlcnZpY2U6IEdyb3VwZWRSZXN1bHQsXG4gICAgcmVuZGVyYWJsZVByb3ZpZGVyczogQXJyYXk8UHJvdmlkZXJTcGVjPixcbiAgfTtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogT2JqZWN0KSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIHRoaXMuX2VtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHRoaXMuX2JvdW5kU2VsZWN0ID0gKCkgPT4gdGhpcy5zZWxlY3QoKTtcbiAgICB0aGlzLl9ib3VuZEhhbmRsZVRhYkNoYW5nZSA9ICh0YWI6IFByb3ZpZGVyU3BlYykgPT4gdGhpcy5faGFuZGxlVGFiQ2hhbmdlKHRhYik7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIGFjdGl2ZVRhYjogc2VhcmNoUmVzdWx0TWFuYWdlci5nZXRQcm92aWRlckJ5TmFtZShzZWFyY2hSZXN1bHRNYW5hZ2VyLmdldEFjdGl2ZVByb3ZpZGVyTmFtZSgpKSxcbiAgICAgIC8vIHRyZWF0ZWQgYXMgaW1tdXRhYmxlXG4gICAgICByZXN1bHRzQnlTZXJ2aWNlOiB7fSxcbiAgICAgIHJlbmRlcmFibGVQcm92aWRlcnM6IHNlYXJjaFJlc3VsdE1hbmFnZXIuZ2V0UmVuZGVyYWJsZVByb3ZpZGVycygpLFxuICAgICAgc2VsZWN0ZWRTZXJ2aWNlOiAnJyxcbiAgICAgIHNlbGVjdGVkRGlyZWN0b3J5OiAnJyxcbiAgICAgIHNlbGVjdGVkSXRlbUluZGV4OiAtMSxcbiAgICAgIGhhc1VzZXJTZWxlY3Rpb246IGZhbHNlLFxuICAgIH07XG4gICAgdGhpcy5oYW5kbGVQcm92aWRlcnNDaGFuZ2VCb3VuZCA9IHRoaXMuaGFuZGxlUHJvdmlkZXJzQ2hhbmdlLmJpbmQodGhpcyk7XG4gICAgdGhpcy5oYW5kbGVSZXN1bHRzQ2hhbmdlQm91bmQgPSB0aGlzLmhhbmRsZVJlc3VsdHNDaGFuZ2UuYmluZCh0aGlzKTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV4dFByb3BzOiBhbnkpIHtcbiAgICBpZiAobmV4dFByb3BzLmFjdGl2ZVByb3ZpZGVyICE9PSB0aGlzLnByb3BzLmFjdGl2ZVByb3ZpZGVyKSB7XG4gICAgICBpZiAobmV4dFByb3BzLmFjdGl2ZVByb3ZpZGVyKSB7XG4gICAgICAgIHRoaXMuX2dldFRleHRFZGl0b3IoKS5zZXRQbGFjZWhvbGRlclRleHQobmV4dFByb3BzLmFjdGl2ZVByb3ZpZGVyLnByb21wdCk7XG4gICAgICAgIGNvbnN0IG5ld1Jlc3VsdHMgPSB7fTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZShcbiAgICAgICAgICB7XG4gICAgICAgICAgICBhY3RpdmVUYWI6IG5leHRQcm9wcy5hY3RpdmVQcm92aWRlciB8fCB0aGlzLnN0YXRlLmFjdGl2ZVRhYixcbiAgICAgICAgICAgIHJlc3VsdHNCeVNlcnZpY2U6IG5ld1Jlc3VsdHMsXG4gICAgICAgICAgfSxcbiAgICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICBzZXRJbW1lZGlhdGUoKCkgPT4gdGhpcy5zZXRRdWVyeSh0aGlzLnJlZnNbJ3F1ZXJ5SW5wdXQnXS5nZXRUZXh0KCkpKTtcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVF1ZXJ5SGFuZGxlcigpO1xuICAgICAgICAgICAgdGhpcy5fZW1pdHRlci5lbWl0KCdpdGVtcy1jaGFuZ2VkJywgbmV3UmVzdWx0cyk7XG4gICAgICAgICAgfVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGNvbXBvbmVudERpZFVwZGF0ZShwcmV2UHJvcHM6IGFueSwgcHJldlN0YXRlOiBhbnkpIHtcbiAgICBpZiAocHJldlN0YXRlLnJlc3VsdHNCeVNlcnZpY2UgIT09IHRoaXMuc3RhdGUucmVzdWx0c0J5U2VydmljZSkge1xuICAgICAgdGhpcy5fZW1pdHRlci5lbWl0KCdpdGVtcy1jaGFuZ2VkJywgdGhpcy5zdGF0ZS5yZXN1bHRzQnlTZXJ2aWNlKTtcbiAgICB9XG5cbiAgICBpZiAoXG4gICAgICBwcmV2U3RhdGUuc2VsZWN0ZWRJdGVtSW5kZXggIT09IHRoaXMuc3RhdGUuc2VsZWN0ZWRJdGVtSW5kZXggfHxcbiAgICAgIHByZXZTdGF0ZS5zZWxlY3RlZFNlcnZpY2UgIT09IHRoaXMuc3RhdGUuc2VsZWN0ZWRTZXJ2aWNlIHx8XG4gICAgICBwcmV2U3RhdGUuc2VsZWN0ZWREaXJlY3RvcnkgIT09IHRoaXMuc3RhdGUuc2VsZWN0ZWREaXJlY3RvcnlcbiAgICApIHtcbiAgICAgIHRoaXMuX3VwZGF0ZVNjcm9sbFBvc2l0aW9uKCk7XG4gICAgfVxuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKTogdm9pZCB7XG4gICAgdGhpcy5fbW9kYWxOb2RlID0gUmVhY3QuZmluZERPTU5vZGUodGhpcyk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZChcbiAgICAgICAgdGhpcy5fbW9kYWxOb2RlLFxuICAgICAgICAnY29yZTptb3ZlLXRvLWJvdHRvbScsXG4gICAgICAgIHRoaXMuaGFuZGxlTW92ZVRvQm90dG9tLmJpbmQodGhpcylcbiAgICAgICksXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZCh0aGlzLl9tb2RhbE5vZGUsICdjb3JlOm1vdmUtdG8tdG9wJywgdGhpcy5oYW5kbGVNb3ZlVG9Ub3AuYmluZCh0aGlzKSksXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZCh0aGlzLl9tb2RhbE5vZGUsICdjb3JlOm1vdmUtZG93bicsIHRoaXMuaGFuZGxlTW92ZURvd24uYmluZCh0aGlzKSksXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZCh0aGlzLl9tb2RhbE5vZGUsICdjb3JlOm1vdmUtdXAnLCB0aGlzLmhhbmRsZU1vdmVVcC5iaW5kKHRoaXMpKSxcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKHRoaXMuX21vZGFsTm9kZSwgJ2NvcmU6Y29uZmlybScsIHRoaXMuc2VsZWN0LmJpbmQodGhpcykpLFxuICAgICk7XG5cbiAgICBjb25zdCBpbnB1dFRleHRFZGl0b3IgPSB0aGlzLmdldElucHV0VGV4dEVkaXRvcigpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgc2VhcmNoUmVzdWx0TWFuYWdlci5vbihcbiAgICAgICAgc2VhcmNoUmVzdWx0TWFuYWdlci5QUk9WSURFUlNfQ0hBTkdFRCxcbiAgICAgICAgdGhpcy5oYW5kbGVQcm92aWRlcnNDaGFuZ2VCb3VuZFxuICAgICAgKSxcbiAgICAgIHNlYXJjaFJlc3VsdE1hbmFnZXIub24oXG4gICAgICAgIHNlYXJjaFJlc3VsdE1hbmFnZXIuUkVTVUxUU19DSEFOR0VELFxuICAgICAgICB0aGlzLmhhbmRsZVJlc3VsdHNDaGFuZ2VCb3VuZFxuICAgICAgKSxcbiAgICApO1xuXG4gICAgdGhpcy5fdXBkYXRlUXVlcnlIYW5kbGVyKCk7XG4gICAgaW5wdXRUZXh0RWRpdG9yLmdldE1vZGVsKCkub25EaWRDaGFuZ2UoKCkgPT4gdGhpcy5faGFuZGxlVGV4dElucHV0Q2hhbmdlKCkpO1xuICAgIHRoaXMuY2xlYXIoKTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCk6IHZvaWQge1xuICAgIHRoaXMuX2VtaXR0ZXIuZGlzcG9zZSgpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICB9XG5cbiAgaGFuZGxlTW92ZVRvQm90dG9tKCk6IHZvaWQge1xuICAgIHRoaXMubW92ZVNlbGVjdGlvblRvQm90dG9tKCk7XG4gICAgdGhpcy5vblVzZXJEaWRDaGFuZ2VTZWxlY3Rpb24oKTtcbiAgfVxuXG4gIGhhbmRsZU1vdmVUb1RvcCgpOiB2b2lkIHtcbiAgICB0aGlzLm1vdmVTZWxlY3Rpb25Ub1RvcCgpO1xuICAgIHRoaXMub25Vc2VyRGlkQ2hhbmdlU2VsZWN0aW9uKCk7XG4gIH1cblxuICBoYW5kbGVNb3ZlRG93bigpOiB2b2lkIHtcbiAgICB0aGlzLm1vdmVTZWxlY3Rpb25Eb3duKCk7XG4gICAgdGhpcy5vblVzZXJEaWRDaGFuZ2VTZWxlY3Rpb24oKTtcbiAgfVxuXG4gIGhhbmRsZU1vdmVVcCgpOiB2b2lkIHtcbiAgICB0aGlzLm1vdmVTZWxlY3Rpb25VcCgpO1xuICAgIHRoaXMub25Vc2VyRGlkQ2hhbmdlU2VsZWN0aW9uKCk7XG4gIH1cblxuICBvbkNhbmNlbGxhdGlvbihjYWxsYmFjazogKCkgPT4gdm9pZCk6IERpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9lbWl0dGVyLm9uKCdjYW5jZWxlZCcsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIG9uU2VsZWN0aW9uKGNhbGxiYWNrOiAoc2VsZWN0aW9uOiBhbnkpID0+IHZvaWQpOiBEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fZW1pdHRlci5vbignc2VsZWN0ZWQnLCBjYWxsYmFjayk7XG4gIH1cblxuICBvblNlbGVjdGlvbkNoYW5nZWQoY2FsbGJhY2s6IChzZWxlY3Rpb25JbmRleDogYW55KSA9PiB2b2lkKTogRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX2VtaXR0ZXIub24oJ3NlbGVjdGlvbi1jaGFuZ2VkJywgY2FsbGJhY2spO1xuICB9XG5cbiAgb25JdGVtc0NoYW5nZWQoY2FsbGJhY2s6IChuZXdJdGVtczogR3JvdXBlZFJlc3VsdCkgPT4gdm9pZCk6IERpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9lbWl0dGVyLm9uKCdpdGVtcy1jaGFuZ2VkJywgY2FsbGJhY2spO1xuICB9XG5cbiAgX3VwZGF0ZVF1ZXJ5SGFuZGxlcigpOiB2b2lkIHtcbiAgICB0aGlzLl9kZWJvdW5jZWRRdWVyeUhhbmRsZXIgPSBkZWJvdW5jZShcbiAgICAgICgpID0+IHRoaXMuc2V0S2V5Ym9hcmRRdWVyeSh0aGlzLmdldElucHV0VGV4dEVkaXRvcigpLmdldE1vZGVsKCkuZ2V0VGV4dCgpKSxcbiAgICAgIHRoaXMuZ2V0UHJvdmlkZXIoKS5kZWJvdW5jZURlbGF5LFxuICAgICAgZmFsc2VcbiAgICApO1xuICB9XG5cbiAgX2hhbmRsZVRleHRJbnB1dENoYW5nZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9kZWJvdW5jZWRRdWVyeUhhbmRsZXIoKTtcbiAgfVxuXG4gIGhhbmRsZVJlc3VsdHNDaGFuZ2UoKTogdm9pZCB7XG4gICAgdGhpcy5fdXBkYXRlUmVzdWx0cyh0aGlzLnByb3BzLmFjdGl2ZVByb3ZpZGVyLm5hbWUpO1xuICB9XG5cbiAgX3VwZGF0ZVJlc3VsdHMoYWN0aXZlUHJvdmlkZXJOYW1lOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCB1cGRhdGVkUmVzdWx0cyA9IHNlYXJjaFJlc3VsdE1hbmFnZXIuZ2V0UmVzdWx0cyhcbiAgICAgIHRoaXMucmVmc1sncXVlcnlJbnB1dCddLmdldFRleHQoKSxcbiAgICAgIGFjdGl2ZVByb3ZpZGVyTmFtZVxuICAgICk7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICByZXN1bHRzQnlTZXJ2aWNlOiB1cGRhdGVkUmVzdWx0cyxcbiAgICB9LCAoKSA9PiB7XG4gICAgICBpZiAoIXRoaXMuc3RhdGUuaGFzVXNlclNlbGVjdGlvbikge1xuICAgICAgICB0aGlzLm1vdmVTZWxlY3Rpb25Ub1RvcCgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgaGFuZGxlUHJvdmlkZXJzQ2hhbmdlKCk6IHZvaWQge1xuICAgIGNvbnN0IHJlbmRlcmFibGVQcm92aWRlcnMgPSBzZWFyY2hSZXN1bHRNYW5hZ2VyLmdldFJlbmRlcmFibGVQcm92aWRlcnMoKTtcbiAgICBjb25zdCBhY3RpdmVQcm92aWRlck5hbWUgPSBzZWFyY2hSZXN1bHRNYW5hZ2VyLmdldEFjdGl2ZVByb3ZpZGVyTmFtZSgpO1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgcmVuZGVyYWJsZVByb3ZpZGVycyxcbiAgICAgIGFjdGl2ZVByb3ZpZGVyTmFtZSxcbiAgICB9KTtcbiAgICB0aGlzLl91cGRhdGVSZXN1bHRzKGFjdGl2ZVByb3ZpZGVyTmFtZSk7XG4gIH1cblxuICBzZWxlY3QoKTogdm9pZCB7XG4gICAgY29uc3Qgc2VsZWN0ZWRJdGVtID0gdGhpcy5nZXRTZWxlY3RlZEl0ZW0oKTtcbiAgICBpZiAoIXNlbGVjdGVkSXRlbSkge1xuICAgICAgdGhpcy5jYW5jZWwoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fZW1pdHRlci5lbWl0KCdzZWxlY3RlZCcsIHNlbGVjdGVkSXRlbSk7XG4gICAgfVxuICB9XG5cbiAgb25Vc2VyRGlkQ2hhbmdlU2VsZWN0aW9uKCkge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgaGFzVXNlclNlbGVjdGlvbjogdHJ1ZSxcbiAgICB9KTtcbiAgfVxuXG4gIGNhbmNlbCgpOiB2b2lkIHtcbiAgICB0aGlzLl9lbWl0dGVyLmVtaXQoJ2NhbmNlbGVkJyk7XG4gIH1cblxuICBjbGVhclNlbGVjdGlvbigpOiB2b2lkIHtcbiAgICB0aGlzLnNldFNlbGVjdGVkSW5kZXgoJycsICcnLCAtMSk7XG4gIH1cblxuICBfZ2V0Q3VycmVudFJlc3VsdENvbnRleHQoKTogP1Jlc3VsdENvbnRleHQge1xuICAgIGNvbnN0IG5vbkVtcHR5UmVzdWx0cyA9IGZpbHRlckVtcHR5UmVzdWx0cyh0aGlzLnN0YXRlLnJlc3VsdHNCeVNlcnZpY2UpO1xuICAgIGNvbnN0IHNlcnZpY2VOYW1lcyA9IE9iamVjdC5rZXlzKG5vbkVtcHR5UmVzdWx0cyk7XG4gICAgY29uc3QgY3VycmVudFNlcnZpY2VJbmRleCA9IHNlcnZpY2VOYW1lcy5pbmRleE9mKHRoaXMuc3RhdGUuc2VsZWN0ZWRTZXJ2aWNlKTtcbiAgICBjb25zdCBjdXJyZW50U2VydmljZSA9IG5vbkVtcHR5UmVzdWx0c1t0aGlzLnN0YXRlLnNlbGVjdGVkU2VydmljZV07XG5cbiAgICBpZiAoIWN1cnJlbnRTZXJ2aWNlKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBkaXJlY3RvcnlOYW1lcyA9IE9iamVjdC5rZXlzKGN1cnJlbnRTZXJ2aWNlLnJlc3VsdHMpO1xuICAgIGNvbnN0IGN1cnJlbnREaXJlY3RvcnlJbmRleCA9IGRpcmVjdG9yeU5hbWVzLmluZGV4T2YodGhpcy5zdGF0ZS5zZWxlY3RlZERpcmVjdG9yeSk7XG4gICAgY29uc3QgY3VycmVudERpcmVjdG9yeSA9IGN1cnJlbnRTZXJ2aWNlLnJlc3VsdHNbdGhpcy5zdGF0ZS5zZWxlY3RlZERpcmVjdG9yeV07XG5cbiAgICBpZiAoIWN1cnJlbnREaXJlY3RvcnkgfHwgIWN1cnJlbnREaXJlY3RvcnkucmVzdWx0cykge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIG5vbkVtcHR5UmVzdWx0cyxcbiAgICAgIHNlcnZpY2VOYW1lcyxcbiAgICAgIGN1cnJlbnRTZXJ2aWNlSW5kZXgsXG4gICAgICBjdXJyZW50U2VydmljZSxcbiAgICAgIGRpcmVjdG9yeU5hbWVzLFxuICAgICAgY3VycmVudERpcmVjdG9yeUluZGV4LFxuICAgICAgY3VycmVudERpcmVjdG9yeSxcbiAgICB9O1xuICB9XG5cbiAgbW92ZVNlbGVjdGlvbkRvd24oKTogdm9pZCB7XG4gICAgY29uc3QgY29udGV4dCA9IHRoaXMuX2dldEN1cnJlbnRSZXN1bHRDb250ZXh0KCk7XG4gICAgaWYgKCFjb250ZXh0KSB7XG4gICAgICB0aGlzLm1vdmVTZWxlY3Rpb25Ub1RvcCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnN0YXRlLnNlbGVjdGVkSXRlbUluZGV4IDwgY29udGV4dC5jdXJyZW50RGlyZWN0b3J5LnJlc3VsdHMubGVuZ3RoIC0gMSkge1xuICAgICAgLy8gb25seSBidW1wIHRoZSBpbmRleCBpZiByZW1haW5pbmcgaW4gY3VycmVudCBkaXJlY3RvcnlcbiAgICAgIHRoaXMuc2V0U2VsZWN0ZWRJbmRleChcbiAgICAgICAgdGhpcy5zdGF0ZS5zZWxlY3RlZFNlcnZpY2UsXG4gICAgICAgIHRoaXMuc3RhdGUuc2VsZWN0ZWREaXJlY3RvcnksXG4gICAgICAgIHRoaXMuc3RhdGUuc2VsZWN0ZWRJdGVtSW5kZXggKyAxXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBvdGhlcndpc2UgZ28gdG8gbmV4dCBkaXJlY3RvcnkuLi5cbiAgICAgIGlmIChjb250ZXh0LmN1cnJlbnREaXJlY3RvcnlJbmRleCA8IGNvbnRleHQuZGlyZWN0b3J5TmFtZXMubGVuZ3RoIC0gMSkge1xuICAgICAgICB0aGlzLnNldFNlbGVjdGVkSW5kZXgoXG4gICAgICAgICAgdGhpcy5zdGF0ZS5zZWxlY3RlZFNlcnZpY2UsXG4gICAgICAgICAgY29udGV4dC5kaXJlY3RvcnlOYW1lc1tjb250ZXh0LmN1cnJlbnREaXJlY3RvcnlJbmRleCArIDFdLFxuICAgICAgICAgIDBcbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIC4uLm9yIHRoZSBuZXh0IHNlcnZpY2UuLi5cbiAgICAgICAgaWYgKGNvbnRleHQuY3VycmVudFNlcnZpY2VJbmRleCA8IGNvbnRleHQuc2VydmljZU5hbWVzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICBjb25zdCBuZXdTZXJ2aWNlTmFtZSA9IGNvbnRleHQuc2VydmljZU5hbWVzW2NvbnRleHQuY3VycmVudFNlcnZpY2VJbmRleCArIDFdO1xuICAgICAgICAgIGNvbnN0IG5ld0RpcmVjdG9yeU5hbWUgPVxuICAgICAgICAgICAgT2JqZWN0LmtleXMoY29udGV4dC5ub25FbXB0eVJlc3VsdHNbbmV3U2VydmljZU5hbWVdLnJlc3VsdHMpLnNoaWZ0KCk7XG4gICAgICAgICAgdGhpcy5zZXRTZWxlY3RlZEluZGV4KG5ld1NlcnZpY2VOYW1lLCBuZXdEaXJlY3RvcnlOYW1lLCAwKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyAuLi5vciB3cmFwIGFyb3VuZCB0byB0aGUgdmVyeSB0b3BcbiAgICAgICAgICB0aGlzLm1vdmVTZWxlY3Rpb25Ub1RvcCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgbW92ZVNlbGVjdGlvblVwKCk6IHZvaWQge1xuICAgIGNvbnN0IGNvbnRleHQgPSB0aGlzLl9nZXRDdXJyZW50UmVzdWx0Q29udGV4dCgpO1xuICAgIGlmICghY29udGV4dCkge1xuICAgICAgdGhpcy5tb3ZlU2VsZWN0aW9uVG9Cb3R0b20oKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5zdGF0ZS5zZWxlY3RlZEl0ZW1JbmRleCA+IDApIHtcbiAgICAgIC8vIG9ubHkgZGVjcmVhc2UgdGhlIGluZGV4IGlmIHJlbWFpbmluZyBpbiBjdXJyZW50IGRpcmVjdG9yeVxuICAgICAgdGhpcy5zZXRTZWxlY3RlZEluZGV4KFxuICAgICAgICB0aGlzLnN0YXRlLnNlbGVjdGVkU2VydmljZSxcbiAgICAgICAgdGhpcy5zdGF0ZS5zZWxlY3RlZERpcmVjdG9yeSxcbiAgICAgICAgdGhpcy5zdGF0ZS5zZWxlY3RlZEl0ZW1JbmRleCAtIDFcbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIG90aGVyd2lzZSwgZ28gdG8gdGhlIHByZXZpb3VzIGRpcmVjdG9yeS4uLlxuICAgICAgaWYgKGNvbnRleHQuY3VycmVudERpcmVjdG9yeUluZGV4ID4gMCkge1xuICAgICAgICB0aGlzLnNldFNlbGVjdGVkSW5kZXgoXG4gICAgICAgICAgdGhpcy5zdGF0ZS5zZWxlY3RlZFNlcnZpY2UsXG4gICAgICAgICAgY29udGV4dC5kaXJlY3RvcnlOYW1lc1tjb250ZXh0LmN1cnJlbnREaXJlY3RvcnlJbmRleCAtIDFdLFxuICAgICAgICAgIGNvbnRleHQuY3VycmVudFNlcnZpY2VcbiAgICAgICAgICAgIC5yZXN1bHRzW2NvbnRleHQuZGlyZWN0b3J5TmFtZXNbY29udGV4dC5jdXJyZW50RGlyZWN0b3J5SW5kZXggLSAxXV0ucmVzdWx0cy5sZW5ndGggLSAxXG4gICAgICAgICk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyAuLi5vciB0aGUgcHJldmlvdXMgc2VydmljZS4uLlxuICAgICAgICBpZiAoY29udGV4dC5jdXJyZW50U2VydmljZUluZGV4ID4gMCkge1xuICAgICAgICAgIGNvbnN0IG5ld1NlcnZpY2VOYW1lID0gY29udGV4dC5zZXJ2aWNlTmFtZXNbY29udGV4dC5jdXJyZW50U2VydmljZUluZGV4IC0gMV07XG4gICAgICAgICAgY29uc3QgbmV3RGlyZWN0b3J5TmFtZSA9XG4gICAgICAgICAgICBPYmplY3Qua2V5cyhjb250ZXh0Lm5vbkVtcHR5UmVzdWx0c1tuZXdTZXJ2aWNlTmFtZV0ucmVzdWx0cykucG9wKCk7XG4gICAgICAgICAgaWYgKG5ld0RpcmVjdG9yeU5hbWUgPT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCByZXN1bHRzRm9yRGlyZWN0b3J5ID1cbiAgICAgICAgICAgIGNvbnRleHQubm9uRW1wdHlSZXN1bHRzW25ld1NlcnZpY2VOYW1lXS5yZXN1bHRzW25ld0RpcmVjdG9yeU5hbWVdO1xuICAgICAgICAgIGlmIChyZXN1bHRzRm9yRGlyZWN0b3J5ID09IG51bGwgfHwgcmVzdWx0c0ZvckRpcmVjdG9yeS5yZXN1bHRzID09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5zZXRTZWxlY3RlZEluZGV4KFxuICAgICAgICAgICAgbmV3U2VydmljZU5hbWUsXG4gICAgICAgICAgICBuZXdEaXJlY3RvcnlOYW1lLFxuICAgICAgICAgICAgcmVzdWx0c0ZvckRpcmVjdG9yeS5yZXN1bHRzLmxlbmd0aCAtIDFcbiAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIC4uLm9yIHdyYXAgYXJvdW5kIHRvIHRoZSB2ZXJ5IGJvdHRvbVxuICAgICAgICAgIHRoaXMubW92ZVNlbGVjdGlvblRvQm90dG9tKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBVcGRhdGUgdGhlIHNjcm9sbCBwb3NpdGlvbiBvZiB0aGUgbGlzdCB2aWV3IHRvIGVuc3VyZSB0aGUgc2VsZWN0ZWQgaXRlbSBpcyB2aXNpYmxlLlxuICBfdXBkYXRlU2Nyb2xsUG9zaXRpb24oKTogdm9pZCB7XG4gICAgaWYgKCEodGhpcy5yZWZzICYmIHRoaXMucmVmc1snc2VsZWN0aW9uTGlzdCddKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBsaXN0Tm9kZSA9ICBSZWFjdC5maW5kRE9NTm9kZSh0aGlzLnJlZnNbJ3NlbGVjdGlvbkxpc3QnXSk7XG4gICAgY29uc3Qgc2VsZWN0ZWROb2RlID0gbGlzdE5vZGUuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnc2VsZWN0ZWQnKVswXTtcbiAgICAvLyBmYWxzZSBpcyBwYXNzZWQgZm9yIEBjZW50ZXJJZk5lZWRlZCBwYXJhbWV0ZXIsIHdoaWNoIGRlZmF1bHRzIHRvIHRydWUuXG4gICAgLy8gUGFzc2luZyBmYWxzZSBjYXVzZXMgdGhlIG1pbmltdW0gbmVjZXNzYXJ5IHNjcm9sbCB0byBvY2N1ciwgc28gdGhlIHNlbGVjdGlvbiBzdGlja3MgdG8gdGhlXG4gICAgLy8gdG9wL2JvdHRvbS5cbiAgICBpZiAoc2VsZWN0ZWROb2RlKSB7XG4gICAgICBzZWxlY3RlZE5vZGUuc2Nyb2xsSW50b1ZpZXdJZk5lZWRlZChmYWxzZSk7XG4gICAgfVxuICB9XG5cbiAgbW92ZVNlbGVjdGlvblRvQm90dG9tKCk6IHZvaWQge1xuICAgIGNvbnN0IGJvdHRvbSA9IHRoaXMuX2dldE91dGVyUmVzdWx0cyhBcnJheS5wcm90b3R5cGUucG9wKTtcbiAgICBpZiAoIWJvdHRvbSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLnNldFNlbGVjdGVkSW5kZXgoYm90dG9tLnNlcnZpY2VOYW1lLCBib3R0b20uZGlyZWN0b3J5TmFtZSwgYm90dG9tLnJlc3VsdHMubGVuZ3RoIC0gMSk7XG4gIH1cblxuICBtb3ZlU2VsZWN0aW9uVG9Ub3AoKTogdm9pZCB7XG4gICAgY29uc3QgdG9wID0gdGhpcy5fZ2V0T3V0ZXJSZXN1bHRzKEFycmF5LnByb3RvdHlwZS5zaGlmdCk7XG4gICAgaWYgKCF0b3ApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5zZXRTZWxlY3RlZEluZGV4KHRvcC5zZXJ2aWNlTmFtZSwgdG9wLmRpcmVjdG9yeU5hbWUsIDApO1xuICB9XG5cbiAgX2dldE91dGVyUmVzdWx0cyhhcnJheU9wZXJhdGlvbjogRnVuY3Rpb24pOlxuICAgID97c2VydmljZU5hbWU6IHN0cmluZzsgZGlyZWN0b3J5TmFtZTogc3RyaW5nOyByZXN1bHRzOiBBcnJheTxtaXhlZD59IHtcbiAgICBjb25zdCBub25FbXB0eVJlc3VsdHMgPSBmaWx0ZXJFbXB0eVJlc3VsdHModGhpcy5zdGF0ZS5yZXN1bHRzQnlTZXJ2aWNlKTtcbiAgICBjb25zdCBzZXJ2aWNlTmFtZSA9IGFycmF5T3BlcmF0aW9uLmNhbGwoT2JqZWN0LmtleXMobm9uRW1wdHlSZXN1bHRzKSk7XG4gICAgaWYgKCFzZXJ2aWNlTmFtZSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IHNlcnZpY2UgPSBub25FbXB0eVJlc3VsdHNbc2VydmljZU5hbWVdO1xuICAgIGNvbnN0IGRpcmVjdG9yeU5hbWUgPSBhcnJheU9wZXJhdGlvbi5jYWxsKE9iamVjdC5rZXlzKHNlcnZpY2UucmVzdWx0cykpO1xuICAgIHJldHVybiB7XG4gICAgICBzZXJ2aWNlTmFtZSxcbiAgICAgIGRpcmVjdG9yeU5hbWUsXG4gICAgICByZXN1bHRzOiBub25FbXB0eVJlc3VsdHNbc2VydmljZU5hbWVdLnJlc3VsdHNbZGlyZWN0b3J5TmFtZV0ucmVzdWx0cyxcbiAgICB9O1xuICB9XG5cbiAgZ2V0U2VsZWN0ZWRJdGVtKCk6ID9PYmplY3Qge1xuICAgIHJldHVybiB0aGlzLmdldEl0ZW1BdEluZGV4KFxuICAgICAgdGhpcy5zdGF0ZS5zZWxlY3RlZFNlcnZpY2UsXG4gICAgICB0aGlzLnN0YXRlLnNlbGVjdGVkRGlyZWN0b3J5LFxuICAgICAgdGhpcy5zdGF0ZS5zZWxlY3RlZEl0ZW1JbmRleFxuICAgICk7XG4gIH1cblxuICBnZXRJdGVtQXRJbmRleChzZXJ2aWNlTmFtZTogc3RyaW5nLCBkaXJlY3Rvcnk6IHN0cmluZywgaXRlbUluZGV4OiBudW1iZXIpOiA/T2JqZWN0IHtcbiAgICBpZiAoXG4gICAgICBpdGVtSW5kZXggPT09IC0xIHx8XG4gICAgICAhdGhpcy5zdGF0ZS5yZXN1bHRzQnlTZXJ2aWNlW3NlcnZpY2VOYW1lXSB8fFxuICAgICAgIXRoaXMuc3RhdGUucmVzdWx0c0J5U2VydmljZVtzZXJ2aWNlTmFtZV0ucmVzdWx0c1tkaXJlY3RvcnldIHx8XG4gICAgICAhdGhpcy5zdGF0ZS5yZXN1bHRzQnlTZXJ2aWNlW3NlcnZpY2VOYW1lXS5yZXN1bHRzW2RpcmVjdG9yeV0ucmVzdWx0c1tpdGVtSW5kZXhdXG4gICAgKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuc3RhdGUucmVzdWx0c0J5U2VydmljZVtzZXJ2aWNlTmFtZV0ucmVzdWx0c1tkaXJlY3RvcnldLnJlc3VsdHNbaXRlbUluZGV4XTtcbiAgfVxuXG4gIGNvbXBvbmVudEZvckl0ZW0oaXRlbTogYW55LCBzZXJ2aWNlTmFtZTogc3RyaW5nLCBkaXJOYW1lOiBzdHJpbmcpOiBSZWFjdEVsZW1lbnQge1xuICAgIHJldHVybiBzZWFyY2hSZXN1bHRNYW5hZ2VyLmdldFJlbmRlcmVyRm9yUHJvdmlkZXIoc2VydmljZU5hbWUpKFxuICAgICAgaXRlbSxcbiAgICAgIHNlcnZpY2VOYW1lLFxuICAgICAgZGlyTmFtZSxcbiAgICApO1xuICB9XG5cbiAgZ2V0U2VsZWN0ZWRJbmRleCgpOiBTZWxlY3Rpb24ge1xuICAgIHJldHVybiB7XG4gICAgICBzZWxlY3RlZERpcmVjdG9yeTogdGhpcy5zdGF0ZS5zZWxlY3RlZERpcmVjdG9yeSxcbiAgICAgIHNlbGVjdGVkU2VydmljZTogdGhpcy5zdGF0ZS5zZWxlY3RlZFNlcnZpY2UsXG4gICAgICBzZWxlY3RlZEl0ZW1JbmRleDogdGhpcy5zdGF0ZS5zZWxlY3RlZEl0ZW1JbmRleCxcbiAgICB9O1xuICB9XG5cbiAgc2V0U2VsZWN0ZWRJbmRleChzZXJ2aWNlOiBzdHJpbmcsIGRpcmVjdG9yeTogc3RyaW5nLCBpdGVtSW5kZXg6IG51bWJlcikge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgc2VsZWN0ZWRTZXJ2aWNlOiBzZXJ2aWNlLFxuICAgICAgc2VsZWN0ZWREaXJlY3Rvcnk6IGRpcmVjdG9yeSxcbiAgICAgIHNlbGVjdGVkSXRlbUluZGV4OiBpdGVtSW5kZXgsXG4gICAgfSwgKCkgPT4ge1xuICAgICAgdGhpcy5fZW1pdHRlci5lbWl0KCdzZWxlY3Rpb24tY2hhbmdlZCcsIHRoaXMuZ2V0U2VsZWN0ZWRJbmRleCgpKTtcbiAgICAgIHRoaXMub25Vc2VyRGlkQ2hhbmdlU2VsZWN0aW9uKCk7XG4gICAgfSk7XG4gIH1cblxuICByZXNldFNlbGVjdGlvbigpOiB2b2lkIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHNlbGVjdGVkU2VydmljZTogJycsXG4gICAgICBzZWxlY3RlZERpcmVjdG9yeTogJycsXG4gICAgICBzZWxlY3RlZEl0ZW1JbmRleDogLTEsXG4gICAgICBoYXNVc2VyU2VsZWN0aW9uOiBmYWxzZSxcbiAgICB9KTtcbiAgfVxuXG4gIHNldEtleWJvYXJkUXVlcnkocXVlcnk6IHN0cmluZykge1xuICAgIHRoaXMucmVzZXRTZWxlY3Rpb24oKTtcbiAgICB0aGlzLnNldFF1ZXJ5KHF1ZXJ5KTtcbiAgfVxuXG4gIHNldFF1ZXJ5KHF1ZXJ5OiBzdHJpbmcpIHtcbiAgICByZXF1aXJlKCcuL1F1aWNrU2VsZWN0aW9uQWN0aW9ucycpLnF1ZXJ5KHF1ZXJ5KTtcbiAgfVxuXG4gIGdldFByb3ZpZGVyKCk6IFByb3ZpZGVyU3BlYyB7XG4gICAgcmV0dXJuIHRoaXMucHJvcHMuYWN0aXZlUHJvdmlkZXI7XG4gIH1cblxuICBnZXRJbnB1dFRleHRFZGl0b3IoKTogYXRvbSRUZXh0RWRpdG9yRWxlbWVudCB7XG4gICAgcmV0dXJuIFJlYWN0LmZpbmRET01Ob2RlKHRoaXMucmVmc1sncXVlcnlJbnB1dCddKTtcbiAgfVxuXG4gIGNsZWFyKCk6IHZvaWQge1xuICAgIHRoaXMuZ2V0SW5wdXRUZXh0RWRpdG9yKCkuZ2V0TW9kZWwoKS5zZXRUZXh0KCcnKTtcbiAgICB0aGlzLmNsZWFyU2VsZWN0aW9uKCk7XG4gIH1cblxuICBmb2N1cygpOiB2b2lkIHtcbiAgICB0aGlzLmdldElucHV0VGV4dEVkaXRvcigpLmZvY3VzKCk7XG4gIH1cblxuICBibHVyKCk6IHZvaWQge1xuICAgIHRoaXMuZ2V0SW5wdXRUZXh0RWRpdG9yKCkuYmx1cigpO1xuICB9XG5cbiAgc2V0SW5wdXRWYWx1ZSh2YWx1ZTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fZ2V0VGV4dEVkaXRvcigpLnNldFRleHQodmFsdWUpO1xuICB9XG5cbiAgc2VsZWN0SW5wdXQoKTogdm9pZCB7XG4gICAgdGhpcy5fZ2V0VGV4dEVkaXRvcigpLnNlbGVjdEFsbCgpO1xuICB9XG5cbiAgX2dldFRleHRFZGl0b3IoKTogVGV4dEVkaXRvciB7XG4gICAgcmV0dXJuIHRoaXMucmVmc1sncXVlcnlJbnB1dCddLmdldFRleHRFZGl0b3IoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0gbmV3VGFiIGlzIGFjdHVhbGx5IGEgUHJvdmlkZXJTcGVjIHBsdXMgdGhlIGBuYW1lYCBhbmQgYHRhYkNvbnRlbnRgIHByb3BlcnRpZXMgYWRkZWQgYnlcbiAgICogICAgIF9yZW5kZXJUYWJzKCksIHdoaWNoIGNyZWF0ZWQgdGhlIHRhYiBvYmplY3QgaW4gdGhlIGZpcnN0IHBsYWNlLlxuICAgKi9cbiAgX2hhbmRsZVRhYkNoYW5nZShuZXdUYWI6IFByb3ZpZGVyU3BlYyk6IHZvaWQge1xuICAgIGNvbnN0IHByb3ZpZGVyTmFtZSA9IG5ld1RhYi5uYW1lO1xuICAgIGlmIChwcm92aWRlck5hbWUgIT09IHRoaXMucHJvcHMuYWN0aXZlUHJvdmlkZXIubmFtZSkge1xuICAgICAgaWYgKHRoaXMucHJvcHMub25Qcm92aWRlckNoYW5nZSkge1xuICAgICAgICB0aGlzLnByb3BzLm9uUHJvdmlkZXJDaGFuZ2UocHJvdmlkZXJOYW1lKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2VtaXR0ZXIuZW1pdCgnYWN0aXZlLXByb3ZpZGVyLWNoYW5nZWQnLCBwcm92aWRlck5hbWUpO1xuICAgIH1cbiAgICB0aGlzLnJlZnNbJ3F1ZXJ5SW5wdXQnXS5mb2N1cygpO1xuICB9XG5cbiAgX3JlbmRlclRhYnMoKTogUmVhY3RFbGVtZW50IHtcbiAgICBjb25zdCB0YWJzID0gdGhpcy5zdGF0ZS5yZW5kZXJhYmxlUHJvdmlkZXJzLm1hcCh0YWIgPT4ge1xuICAgICAgbGV0IGtleUJpbmRpbmcgPSBudWxsOy8vVE9ET1xuICAgICAgY29uc3QgaHVtYW5pemVkS2V5YmluZGluZyA9IF9maW5kS2V5YmluZGluZ0ZvckFjdGlvbih0YWIuYWN0aW9uIHx8ICcnLCB0aGlzLl9tb2RhbE5vZGUpO1xuICAgICAgaWYgKGh1bWFuaXplZEtleWJpbmRpbmcgIT09ICcnKSB7XG4gICAgICAgIGtleUJpbmRpbmcgPSAoXG4gICAgICAgICAgPGtiZCBjbGFzc05hbWU9XCJrZXktYmluZGluZ1wiPlxuICAgICAgICAgICAge2h1bWFuaXplZEtleWJpbmRpbmd9XG4gICAgICAgICAgPC9rYmQ+XG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi50YWIsXG4gICAgICAgIG5hbWU6IHRhYi5uYW1lLFxuICAgICAgICB0YWJDb250ZW50OiA8c3Bhbj57dGFiLnRpdGxlfXtrZXlCaW5kaW5nfTwvc3Bhbj4sXG4gICAgICB9O1xuICAgIH0pO1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cIm9tbmlzZWFyY2gtdGFic1wiPlxuICAgICAgICA8TnVjbGlkZVRhYnNcbiAgICAgICAgICB0YWJzPXt0YWJzfVxuICAgICAgICAgIGFjdGl2ZVRhYk5hbWU9e3RoaXMuc3RhdGUuYWN0aXZlVGFiLm5hbWV9XG4gICAgICAgICAgb25BY3RpdmVUYWJDaGFuZ2U9e3RoaXMuX2JvdW5kSGFuZGxlVGFiQ2hhbmdlfVxuICAgICAgICAvPlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIF9yZW5kZXJFbXB0eU1lc3NhZ2UobWVzc2FnZTogc3RyaW5nKTogUmVhY3RFbGVtZW50IHtcbiAgICByZXR1cm4gKFxuICAgICAgPHVsIGNsYXNzTmFtZT1cImJhY2tncm91bmQtbWVzc2FnZSBjZW50ZXJlZFwiPlxuICAgICAgICA8bGk+e21lc3NhZ2V9PC9saT5cbiAgICAgIDwvdWw+XG4gICAgKTtcbiAgfVxuXG4gIF9oYXNOb1Jlc3VsdHMoKTogYm9vbGVhbiB7XG4gICAgZm9yIChjb25zdCBzZXJ2aWNlTmFtZSBpbiB0aGlzLnN0YXRlLnJlc3VsdHNCeVNlcnZpY2UpIHtcbiAgICAgIGNvbnN0IHNlcnZpY2UgPSB0aGlzLnN0YXRlLnJlc3VsdHNCeVNlcnZpY2Vbc2VydmljZU5hbWVdO1xuICAgICAgZm9yIChjb25zdCBkaXJOYW1lIGluIHNlcnZpY2UpIHtcbiAgICAgICAgY29uc3QgcmVzdWx0cyA9IHNlcnZpY2VbZGlyTmFtZV07XG4gICAgICAgIGlmICghcmVzdWx0cy5sb2FkaW5nICYmIHJlc3VsdHMucmVzdWx0cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcmVuZGVyKCk6IFJlYWN0RWxlbWVudCB7XG4gICAgbGV0IG51bVRvdGFsUmVzdWx0c1JlbmRlcmVkID0gMDtcbiAgICBjb25zdCBpc09tbmlTZWFyY2hBY3RpdmUgPSB0aGlzLnN0YXRlLmFjdGl2ZVRhYi5uYW1lID09PSAnT21uaVNlYXJjaFJlc3VsdFByb3ZpZGVyJztcbiAgICBsZXQgbnVtUXVlcmllc091dHN0YW5kaW5nID0gMDtcbiAgICBjb25zdCBzZXJ2aWNlTmFtZXMgPSBPYmplY3Qua2V5cyh0aGlzLnN0YXRlLnJlc3VsdHNCeVNlcnZpY2UpO1xuICAgIGNvbnN0IHNlcnZpY2VzID0gc2VydmljZU5hbWVzLm1hcChzZXJ2aWNlTmFtZSA9PiB7XG4gICAgICBsZXQgbnVtUmVzdWx0c0ZvclNlcnZpY2UgPSAwO1xuICAgICAgY29uc3QgZGlyZWN0b3JpZXMgPSB0aGlzLnN0YXRlLnJlc3VsdHNCeVNlcnZpY2Vbc2VydmljZU5hbWVdLnJlc3VsdHM7XG4gICAgICBjb25zdCBzZXJ2aWNlVGl0bGUgPSB0aGlzLnN0YXRlLnJlc3VsdHNCeVNlcnZpY2Vbc2VydmljZU5hbWVdLnRpdGxlO1xuICAgICAgY29uc3QgZGlyZWN0b3J5TmFtZXMgPSBPYmplY3Qua2V5cyhkaXJlY3Rvcmllcyk7XG4gICAgICBjb25zdCBkaXJlY3Rvcmllc0ZvclNlcnZpY2UgPSBkaXJlY3RvcnlOYW1lcy5tYXAoZGlyTmFtZSA9PiB7XG4gICAgICAgIGNvbnN0IHJlc3VsdHNGb3JEaXJlY3RvcnkgPSBkaXJlY3Rvcmllc1tkaXJOYW1lXTtcbiAgICAgICAgbGV0IG1lc3NhZ2UgPSBudWxsO1xuICAgICAgICBpZiAocmVzdWx0c0ZvckRpcmVjdG9yeS5sb2FkaW5nKSB7XG4gICAgICAgICAgbnVtUXVlcmllc091dHN0YW5kaW5nKys7XG4gICAgICAgICAgaWYgKCFpc09tbmlTZWFyY2hBY3RpdmUpIHtcbiAgICAgICAgICAgIG51bVRvdGFsUmVzdWx0c1JlbmRlcmVkKys7XG4gICAgICAgICAgICBtZXNzYWdlID0gKFxuICAgICAgICAgICAgICA8c3Bhbj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJsb2FkaW5nIGxvYWRpbmctc3Bpbm5lci10aW55IGlubGluZS1ibG9ja1wiIC8+XG4gICAgICAgICAgICAgICAgTG9hZGluZy4uLlxuICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChyZXN1bHRzRm9yRGlyZWN0b3J5LmVycm9yICYmICFpc09tbmlTZWFyY2hBY3RpdmUpIHtcbiAgICAgICAgICBtZXNzYWdlID0gKFxuICAgICAgICAgICAgPHNwYW4+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImljb24gaWNvbi1jaXJjbGUtc2xhc2hcIiAvPlxuICAgICAgICAgICAgICBFcnJvcjogPHByZT57cmVzdWx0c0ZvckRpcmVjdG9yeS5lcnJvcn08L3ByZT5cbiAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICApO1xuICAgICAgICB9IGVsc2UgaWYgKHJlc3VsdHNGb3JEaXJlY3RvcnkucmVzdWx0cy5sZW5ndGggPT09IDAgJiYgIWlzT21uaVNlYXJjaEFjdGl2ZSkge1xuICAgICAgICAgIG1lc3NhZ2UgPSAoXG4gICAgICAgICAgICA8c3Bhbj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiaWNvbiBpY29uLXhcIiAvPlxuICAgICAgICAgICAgICBObyByZXN1bHRzXG4gICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBpdGVtQ29tcG9uZW50cyA9IHJlc3VsdHNGb3JEaXJlY3RvcnkucmVzdWx0cy5tYXAoKGl0ZW0sIGl0ZW1JbmRleCkgPT4ge1xuICAgICAgICAgIG51bVJlc3VsdHNGb3JTZXJ2aWNlKys7XG4gICAgICAgICAgbnVtVG90YWxSZXN1bHRzUmVuZGVyZWQrKztcbiAgICAgICAgICBjb25zdCBpc1NlbGVjdGVkID0gKFxuICAgICAgICAgICAgc2VydmljZU5hbWUgPT09IHRoaXMuc3RhdGUuc2VsZWN0ZWRTZXJ2aWNlICYmXG4gICAgICAgICAgICBkaXJOYW1lID09PSB0aGlzLnN0YXRlLnNlbGVjdGVkRGlyZWN0b3J5ICYmXG4gICAgICAgICAgICBpdGVtSW5kZXggPT09IHRoaXMuc3RhdGUuc2VsZWN0ZWRJdGVtSW5kZXhcbiAgICAgICAgICApO1xuICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8bGlcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPXtjbGFzc25hbWVzKHtcbiAgICAgICAgICAgICAgICAncXVpY2stb3Blbi1yZXN1bHQtaXRlbSc6IHRydWUsXG4gICAgICAgICAgICAgICAgJ2xpc3QtaXRlbSc6IHRydWUsXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWQ6IGlzU2VsZWN0ZWQsXG4gICAgICAgICAgICAgIH0pfVxuICAgICAgICAgICAgICBrZXk9e3NlcnZpY2VOYW1lICsgZGlyTmFtZSArIGl0ZW1JbmRleH1cbiAgICAgICAgICAgICAgb25Nb3VzZURvd249e3RoaXMuX2JvdW5kU2VsZWN0fVxuICAgICAgICAgICAgICBvbk1vdXNlRW50ZXI9e3RoaXMuc2V0U2VsZWN0ZWRJbmRleC5iaW5kKHRoaXMsIHNlcnZpY2VOYW1lLCBkaXJOYW1lLCBpdGVtSW5kZXgpfT5cbiAgICAgICAgICAgICAge3RoaXMuY29tcG9uZW50Rm9ySXRlbShpdGVtLCBzZXJ2aWNlTmFtZSwgZGlyTmFtZSl9XG4gICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgZGlyZWN0b3J5TGFiZWwgPSBudWxsO1xuICAgICAgICAvL2hpZGUgZm9sZGVycyBpZiBvbmx5IDEgbGV2ZWwgd291bGQgYmUgc2hvd24sIG9yIGlmIG5vIHJlc3VsdHMgd2VyZSBmb3VuZFxuICAgICAgICBjb25zdCBzaG93RGlyZWN0b3JpZXMgPSBkaXJlY3RvcnlOYW1lcy5sZW5ndGggPiAxICYmXG4gICAgICAgICAgKCFpc09tbmlTZWFyY2hBY3RpdmUgfHwgcmVzdWx0c0ZvckRpcmVjdG9yeS5yZXN1bHRzLmxlbmd0aCA+IDApO1xuICAgICAgICBpZiAoc2hvd0RpcmVjdG9yaWVzKSB7XG4gICAgICAgICAgZGlyZWN0b3J5TGFiZWwgPSAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImxpc3QtaXRlbVwiPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJpY29uIGljb24tZmlsZS1kaXJlY3RvcnlcIj57ZGlyTmFtZX08L3NwYW4+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgPGxpIGNsYXNzTmFtZT17Y2xhc3NuYW1lcyh7J2xpc3QtbmVzdGVkLWl0ZW0nOiBzaG93RGlyZWN0b3JpZXN9KX0ga2V5PXtkaXJOYW1lfT5cbiAgICAgICAgICAgIHtkaXJlY3RvcnlMYWJlbH1cbiAgICAgICAgICAgIHttZXNzYWdlfVxuICAgICAgICAgICAgPHVsIGNsYXNzTmFtZT1cImxpc3QtdHJlZVwiPlxuICAgICAgICAgICAgICB7aXRlbUNvbXBvbmVudHN9XG4gICAgICAgICAgICA8L3VsPlxuICAgICAgICAgIDwvbGk+XG4gICAgICAgICk7XG4gICAgICB9KTtcbiAgICAgIGxldCBzZXJ2aWNlTGFiZWwgPSBudWxsO1xuICAgICAgaWYgKGlzT21uaVNlYXJjaEFjdGl2ZSAmJiBudW1SZXN1bHRzRm9yU2VydmljZSA+IDApIHtcbiAgICAgICAgc2VydmljZUxhYmVsID0gKFxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibGlzdC1pdGVtXCI+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJpY29uIGljb24tZ2VhclwiPntzZXJ2aWNlVGl0bGV9PC9zcGFuPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIDxsaSBjbGFzc05hbWU9XCJsaXN0LW5lc3RlZC1pdGVtXCIga2V5PXtzZXJ2aWNlTmFtZX0+XG4gICAgICAgICAgICB7c2VydmljZUxhYmVsfVxuICAgICAgICAgICAgPHVsIGNsYXNzTmFtZT1cImxpc3QtdHJlZVwiPlxuICAgICAgICAgICAgICB7ZGlyZWN0b3JpZXNGb3JTZXJ2aWNlfVxuICAgICAgICAgICAgPC91bD5cbiAgICAgICAgICA8L2xpPlxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGRpcmVjdG9yaWVzRm9yU2VydmljZTtcbiAgICB9KTtcbiAgICBsZXQgbm9SZXN1bHRzTWVzc2FnZSA9IG51bGw7XG4gICAgaWYgKG9iamVjdC5pc0VtcHR5KHRoaXMuc3RhdGUucmVzdWx0c0J5U2VydmljZSkpIHtcbiAgICAgIG5vUmVzdWx0c01lc3NhZ2UgPSB0aGlzLl9yZW5kZXJFbXB0eU1lc3NhZ2UoJ1NlYXJjaCBhd2F5IScpO1xuICAgIH0gZWxzZSBpZiAobnVtVG90YWxSZXN1bHRzUmVuZGVyZWQgPT09IDApIHtcbiAgICAgIG5vUmVzdWx0c01lc3NhZ2UgPSB0aGlzLl9yZW5kZXJFbXB0eU1lc3NhZ2UoPHNwYW4+wq9cXF8o44OEKV8vwq88YnIvPk5vIHJlc3VsdHM8L3NwYW4+KTtcbiAgICB9XG4gICAgY29uc3QgY3VycmVudFByb3ZpZGVyID0gdGhpcy5nZXRQcm92aWRlcigpO1xuICAgIGNvbnN0IHByb21wdFRleHQgPSAoY3VycmVudFByb3ZpZGVyICYmIGN1cnJlbnRQcm92aWRlci5wcm9tcHQpIHx8ICcnO1xuICAgIGxldCBvbW5pU2VhcmNoU3RhdHVzID0gbnVsbDtcbiAgICBpZiAoaXNPbW5pU2VhcmNoQWN0aXZlICYmIG51bVF1ZXJpZXNPdXRzdGFuZGluZyA+IDApIHtcbiAgICAgIG9tbmlTZWFyY2hTdGF0dXMgPSAoXG4gICAgICAgIDxzcGFuPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImxvYWRpbmcgbG9hZGluZy1zcGlubmVyLXRpbnkgaW5saW5lLWJsb2NrXCIgLz5cbiAgICAgICAgICB7YExvYWRpbmcuLi5gfVxuICAgICAgICA8L3NwYW4+XG4gICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJzZWxlY3QtbGlzdCBvbW5pc2VhcmNoLW1vZGFsXCIgcmVmPVwibW9kYWxcIj5cbiAgICAgICAgPEF0b21JbnB1dCByZWY9XCJxdWVyeUlucHV0XCIgcGxhY2Vob2xkZXJUZXh0PXtwcm9tcHRUZXh0fSAvPlxuICAgICAgICB7dGhpcy5fcmVuZGVyVGFicygpfVxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm9tbmlzZWFyY2gtcmVzdWx0c1wiIHN0eWxlPXt7bWF4SGVpZ2h0OiB0aGlzLnByb3BzLm1heFNjcm9sbGFibGVBcmVhSGVpZ2h0fX0+XG4gICAgICAgICAge25vUmVzdWx0c01lc3NhZ2V9XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJvbW5pc2VhcmNoLXBhbmVcIj5cbiAgICAgICAgICAgIDx1bCBjbGFzc05hbWU9XCJsaXN0LXRyZWVcIiByZWY9XCJzZWxlY3Rpb25MaXN0XCI+XG4gICAgICAgICAgICAgIHtzZXJ2aWNlc31cbiAgICAgICAgICAgICAge29tbmlTZWFyY2hTdGF0dXN9XG4gICAgICAgICAgICA8L3VsPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cbn1cblxuUXVpY2tTZWxlY3Rpb25Db21wb25lbnQucHJvcFR5cGVzID0ge1xuICBhY3RpdmVQcm92aWRlcjogUHJvcFR5cGVzLnNoYXBlKHtcbiAgICBhY3Rpb246IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICBkZWJvdW5jZURlbGF5OiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gICAgbmFtZTogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgIHByb21wdDogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgIHRpdGxlOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gIH0pLmlzUmVxdWlyZWQsXG4gIG9uUHJvdmlkZXJDaGFuZ2U6IFByb3BUeXBlcy5mdW5jLFxuICBtYXhTY3JvbGxhYmxlQXJlYUhlaWdodDogUHJvcFR5cGVzLm51bWJlcixcbn07XG4iXX0=