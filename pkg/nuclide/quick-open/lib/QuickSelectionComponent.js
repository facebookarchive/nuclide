'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {
  quickopen$DirectoryName,
  quickopen$FileResult,
  quickopen$GroupedResult,
  quickopen$ServiceName,
  quickopen$TabInfo,
} from './types';

var AtomInput = require('nuclide-ui-atom-input');
var {CompositeDisposable, Disposable, Emitter} = require('atom');
var {
  array,
  debounce,
  object,
} = require('nuclide-commons');
var React = require('react-for-atom');
var searchResultManager = require('./SearchResultManager');
var NuclideTabs = require('nuclide-ui-tabs');
var {PropTypes} = React;
var cx = require('react-classset');

var {
  filterEmptyResults,
  flattenResults,
} = require('./searchResultHelpers');

var {PropTypes} = React;

var cx = require('react-classset');

function sanitizeQuery(query: string): string {
  return query.trim();
}

/**
 * Determine what the applicable shortcut for a given action is within this component's context.
 * For example, this will return different keybindings on windows vs linux.
 */
function _findKeybindingForAction(action: string, target: HTMLElement): string {
  var {humanizeKeystroke} = require('nuclide-keystroke-label');
  var matchingKeyBindings = atom.keymaps.findKeyBindings({
    command: action,
    target,
  });
  var keystroke = (matchingKeyBindings.length && matchingKeyBindings[0].keystrokes) || '';
  return humanizeKeystroke(keystroke);
}


type ResultsByService = {
  [key: quickopen$ServiceName]: {
    [key: quickopen$DirectoryName]: {
      items: Array<quickopen$FileResult>,
      waiting: boolean,
      error: ?string,
    }
  }
};

class QuickSelectionComponent extends React.Component {
  _emitter: Emitter;
  _subscriptions: CompositeDisposable;
  _scheduledCancel: number;
  _modalNode: HTMLElement;
  _debouncedQueryHandler: () => void;
  _boundSelect: () => void;
  _boundHandleTabChange: (tab: quickopen$TabInfo) => void;

  constructor(props: Object) {
    super(props);
    this._emitter = new Emitter();
    this._subscriptions = new CompositeDisposable();
    this._boundSelect = () => this.select();
    this._boundHandleTabChange = (tab: quickopen$TabInfo) => this._handleTabChange(tab);
    this.state = {
      activeTab: props.initialActiveTab,
      // treated as immutable
      resultsByService: {
        /* EXAMPLE:
        providerName: {
          directoryName: {
            results: [Array<{path: string}>],
            loading: true,
            error: null,
          },
        },
        */
      },
      selectedDirectory: '',
      selectedService: '',
      selectedItemIndex: -1,
      renderableProviders: searchResultManager.getRenderableProviders(),
    };
    this.handleProvidersChangeBound = this.handleProvidersChange.bind(this);
    this.handleResultsChangeBound = this.handleResultsChange.bind(this);
  }

  componentWillReceiveProps(nextProps: any) {
    if (nextProps.activeProvider !== this.props.activeProvider) {
      if (nextProps.activeProvider) {
        this._getTextEditor().setPlaceholderText(nextProps.activeProvider.prompt);
        var newResults = {};
        this.setState(
          {
            activeTab: nextProps.activeProvider || this.state.activeTab,
            resultsByService: newResults,
          },
          () => {
            setImmediate(() => this.setQuery(this.refs['queryInput'].getText()));
            this._updateQueryHandler();
            this._emitter.emit('items-changed', newResults);
          }
        );
      }
    }
  }

  componentDidUpdate(prevProps: any, prevState: any) {
    if (prevState.resultsByService !== this.state.resultsByService) {
      this._emitter.emit('items-changed', this.state.resultsByService);
    }

    if (
      prevState.selectedItemIndex !== this.state.selectedItemIndex ||
      prevState.selectedService !== this.state.selectedService ||
      prevState.selectedDirectory !== this.state.selectedDirectory
    ) {
      this._updateScrollPosition();
    }
  }

  componentDidMount() {
    this._modalNode = React.findDOMNode(this);
    this._subscriptions.add(
      atom.commands.add(this._modalNode, 'core:move-up', this.moveSelectionUp.bind(this)),
      atom.commands.add(this._modalNode, 'core:move-down', this.moveSelectionDown.bind(this)),
      atom.commands.add(this._modalNode, 'core:move-to-top', this.moveSelectionToTop.bind(this)),
      atom.commands.add(this._modalNode, 'core:move-to-bottom', this.moveSelectionToBottom.bind(this)),
      atom.commands.add(this._modalNode, 'core:confirm', this.select.bind(this)),
      atom.commands.add(this._modalNode, 'core:cancel', this.cancel.bind(this))
    );

    var inputTextEditor = this.getInputTextEditor();
    inputTextEditor.addEventListener('blur', (event) => {
      if (event.relatedTarget !== null) {
        // cancel can be interrupted by user interaction with the modal
        this._scheduledCancel = setTimeout(this.cancel.bind(this), 100);
      }
    });

    searchResultManager.on(searchResultManager.PROVIDERS_CHANGED, this.handleProvidersChangeBound);
    searchResultManager.on(searchResultManager.RESULTS_CHANGED, this.handleResultsChangeBound);

    this._updateQueryHandler();
    inputTextEditor.model.onDidChange(() => this._handleTextInputChange());
    this.clear();
  }

  componentWillUnmount() {
    this._emitter.dispose();
    searchResultManager.off(searchResultManager.PROVIDERS_CHANGED, this.handleProvidersChangeBound);
    searchResultManager.off(searchResultManager.RESULTS_CHANGED, this.handleResultsChangeBound);
    this._subscriptions.dispose();
  }

  onCancellation(callback: () => void): Disposable {
    return this._emitter.on('canceled', callback);
  }

  onSelection(callback: (selection: any) => void): Disposable {
    return this._emitter.on('selected', callback);
  }

  onSelectionChanged(callback: (selectionIndex: any) => void): Disposable {
    return this._emitter.on('selection-changed', callback);
  }

  onItemsChanged(callback: (newItems: quickopen$GroupedResult) => void): Disposable {
    return this._emitter.on('items-changed', callback);
  }

  _updateQueryHandler(): void {
    this._debouncedQueryHandler = debounce(
      () => this.setQuery(this.getInputTextEditor().model.getText()),
      this.getProvider().debounceDelay
    );
  }

  _handleTextInputChange(): void {
    this._debouncedQueryHandler();
  }

  handleResultsChange() {
    var updatedResults = searchResultManager.getResults(
      this.refs.queryInput.getText(),
      this.props.activeProvider.name
    );
    this.setState({
      resultsByService: updatedResults,
    });
  }

  handleProvidersChange() {
    var renderableProviders = searchResultManager.getRenderableProviders();
    var activeProviderName = searchResultManager.getActiveProviderName();
    this.setState({
      renderableProviders,
      activeProviderName,
    });
  }

  select() {
    var selectedItem = this.getSelectedItem();
    if (!selectedItem) {
      this.cancel();
    } else {
      this._emitter.emit('selected', selectedItem);
    }
  }

  cancel() {
    this._emitter.emit('canceled');
  }

  clearSelection() {
    this.setSelectedIndex('', '', -1);
  }

  _getCurrentResultContext(): mixed {
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
      nonEmptyResults,
      serviceNames,
      currentServiceIndex,
      currentService,
      directoryNames,
      currentDirectoryIndex,
      currentDirectory,
    };
  }

  moveSelectionDown() {
    var context = this._getCurrentResultContext();
    if (!context) {
      this.moveSelectionToTop();
      return;
    }

    if (this.state.selectedItemIndex < context.currentDirectory.results.length - 1) {
      // only bump the index if remaining in current directory
      this.setSelectedIndex(
        this.state.selectedService,
        this.state.selectedDirectory,
        this.state.selectedItemIndex + 1
      );
    } else {
      // otherwise go to next directory...
      if (context.currentDirectoryIndex < context.directoryNames.length - 1) {
        this.setSelectedIndex(
          this.state.selectedService,
          context.directoryNames[context.currentDirectoryIndex + 1],
          0
        );
      } else {
        // ...or the next service...
        if (context.currentServiceIndex < context.serviceNames.length - 1) {
          var newServiceName = context.serviceNames[context.currentServiceIndex + 1];
          var newDirectoryName =
            Object.keys(context.nonEmptyResults[newServiceName].results).shift();
          this.setSelectedIndex(newServiceName, newDirectoryName, 0);
        } else {
          // ...or wrap around to the very top
          this.moveSelectionToTop();
        }
      }
    }
  }

  moveSelectionUp() {
    var context = this._getCurrentResultContext();
    if (!context) {
      this.moveSelectionToBottom();
      return;
    }

    if (this.state.selectedItemIndex > 0) {
      // only decrease the index if remaining in current directory
      this.setSelectedIndex(
        this.state.selectedService,
        this.state.selectedDirectory,
        this.state.selectedItemIndex - 1
      );
    } else {
      // otherwise, go to the previous directory...
      if (context.currentDirectoryIndex > 0) {
        this.setSelectedIndex(
          this.state.selectedService,
          context.directoryNames[context.currentDirectoryIndex - 1],
          context.currentService.results[context.directoryNames[context.currentDirectoryIndex - 1]].results.length - 1
        );
      } else {
        // ...or the previous service...
        if (context.currentServiceIndex > 0) {
          var newServiceName = context.serviceNames[context.currentServiceIndex - 1];
          var newDirectoryName = Object.keys(context.nonEmptyResults[newServiceName].results).pop();
          this.setSelectedIndex(
            newServiceName,
            newDirectoryName,
            context.nonEmptyResults[newServiceName].results[newDirectoryName].results.length - 1
          );
        } else {
          // ...or wrap around to the very bottom
          this.moveSelectionToBottom();
        }
      }
    }
  }

  // Update the scroll position of the list view to ensure the selected item is visible.
  _updateScrollPosition() {
    if (!(this.refs && this.refs.selectionList)) {
      return;
    }
    var listNode =  React.findDOMNode(this.refs.selectionList);
    var selectedNode = listNode.getElementsByClassName('selected')[0];
    // false is passed for @centerIfNeeded parameter, which defaults to true.
    // Passing false causes the minimum necessary scroll to occur, so the selection sticks to the top/bottom
    if (selectedNode) {
      selectedNode.scrollIntoViewIfNeeded(false);
    }
  }

  moveSelectionToBottom(): void {
    var bottom = this._getOuterResults(Array.prototype.pop);
    if (!bottom) {
      return;
    }
    this.setSelectedIndex(bottom.serviceName, bottom.directoryName, bottom.results.length - 1);
  }

  moveSelectionToTop(): void {
    var top = this._getOuterResults(Array.prototype.shift);
    if (!top) {
      return;
    }
    this.setSelectedIndex(top.serviceName, top.directoryName, 0);
  }

  _getOuterResults(arrayOperation: Function): ?{serviceName: string; directoryName: string; results: Array<mixed>} {
    var nonEmptyResults = filterEmptyResults(this.state.resultsByService);
    var serviceName = arrayOperation.call(Object.keys(nonEmptyResults));
    if (!serviceName) {
      return null;
    }
    var service = nonEmptyResults[serviceName];
    var directoryName = arrayOperation.call(Object.keys(service.results));
    return {
      serviceName,
      directoryName,
      results: nonEmptyResults[serviceName].results[directoryName].results,
    };
  }

  getSelectedItem(): ?Object {
    return this.getItemAtIndex(
      this.state.selectedService,
      this.state.selectedDirectory,
      this.state.selectedItemIndex
    );
  }

  getItemAtIndex(serviceName: string, directory: string, itemIndex: number): ?Object {
    if (
      itemIndex === -1 ||
      !this.state.resultsByService[serviceName] ||
      !this.state.resultsByService[serviceName].results[directory] ||
      !this.state.resultsByService[serviceName].results[directory].results[itemIndex]
    ) {
      return null;
    }
    return this.state.resultsByService[serviceName].results[directory].results[itemIndex];
  }

  componentForItem(item: any, serviceName: string): ReactElement {
    return searchResultManager.getRendererForProvider(serviceName)(item, serviceName);
  }

  getSelectedIndex(): any {
    return {
      selectedDirectory: this.state.selectedDirectory,
      selectedService: this.state.selectedService,
      selectedItemIndex: this.state.selectedItemIndex,
    };
  }

  setSelectedIndex(service: string, directory: string, itemIndex: number) {
    this.setState({
      selectedService: service,
      selectedDirectory: directory,
      selectedItemIndex: itemIndex,
    }, () => this._emitter.emit('selection-changed', this.getSelectedIndex()));
  }

  setQuery(query: string) {
    require('./QuickSelectionActions').query(query);
  }

  getProvider(): QuickSelectionProvider {
    return this.props.activeProvider;
  }

  // TODO: We need a type that corresponds to <atom-text-editor> that is more specific than
  // HTMLElement, which would eliminate a number of Flow type errors in this file.
  getInputTextEditor(): HTMLElement {
    return React.findDOMNode(this.refs['queryInput']);
  }

  clear() {
    this.getInputTextEditor().model.setText('');
    this.clearSelection();
  }

  focus() {
    this.getInputTextEditor().focus();
  }

  blur() {
    this.getInputTextEditor().blur();
  }

  setInputValue(value: string) {
    this._getTextEditor().setText(value);
  }

  selectInput() {
    this._getTextEditor().selectAll();
  }

  _getTextEditor(): TextEditor {
    return this.refs['queryInput'].getTextEditor();
  }

  /**
   * @param newTab is actually a TabInfo plus the `name` and `tabContent` properties added by
   *     _renderTabs(), which created the tab object in the first place.
   */
  _handleTabChange(newTab: quickopen$TabInfo) {
    clearTimeout(this._scheduledCancel);
    var providerName = newTab.name;
    if (providerName !== this.props.activeProvider.name) {
      if (this.props.onProviderChange) {
        this.props.onProviderChange(providerName);
      }
      this._emitter.emit('active-provider-changed', providerName);
    }
  }

  _renderTabs(): ReactElement {
    var tabs = this.state.renderableProviders.map(tab => {
      var keyBinding = null;
      if (tab.action) {
        keyBinding = (
          <kbd className="key-binding">
            {_findKeybindingForAction(tab.action, this._modalNode)}
          </kbd>
        );
      }
      return {
        ...tab,
        name: tab.name,
        tabContent: <span>{tab.title}{keyBinding}</span>
      };
    });
    return (
      <div className="omnisearch-tabs">
        <NuclideTabs
          tabs={tabs}
          activeTabName={this.state.activeTab.name}
          onActiveTabChange={this._boundHandleTabChange}
          triggeringEvent="onMouseEnter"
        />
      </div>
    );
  }

  _renderEmptyMessage(message: string): ReactElement {
    return (
      <ul className="background-message centered">
        <li>{message}</li>
      </ul>
    );
  }

  _hasNoResults(): boolean {
    for (var serviceName in this.state.resultsByService) {
      var service = this.state.resultsByService[serviceName];
      for (var dirName in service) {
        var results = service[dirName];
        if (!results.loading && results.results.length > 0) {
          return false;
        }
      }
    }
    return true;
  }

  render(): ReactElement {
    var itemsRendered = 0;
    var serviceNames = Object.keys(this.state.resultsByService);
    var services = serviceNames.map(serviceName => {
      var directories = this.state.resultsByService[serviceName].results;
      var serviceTitle = this.state.resultsByService[serviceName].title;
      var directoryNames = Object.keys(directories);
      var directoriesForService = directoryNames.map(dirName => {
        var resultsForDirectory = directories[dirName];
        var message = null;
        if (resultsForDirectory.loading) {
          itemsRendered++;
          message = (
            <span>
              <span className="loading loading-spinner-tiny inline-block" />
              Loading...
            </span>
          );
        } else if (resultsForDirectory.error) {
          message = (
            <span>
              <span className="icon icon-circle-slash" />
              Error: <pre>{resultsForDirectory.error}</pre>
            </span>
          );
        } else if (resultsForDirectory.results.length === 0) {
          message = (
            <span>
              <span className="icon icon-x" />
              No results
            </span>
          );
        }
        var itemComponents = resultsForDirectory.results.map((item, itemIndex) => {
            var isSelected = (
              serviceName === this.state.selectedService &&
              dirName === this.state.selectedDirectory &&
              itemIndex === this.state.selectedItemIndex
            );
            itemsRendered++;
            return (
              <li
                className={cx({
                  'quick-open-result-item': true,
                  'list-item': true,
                  selected: isSelected,
                })}
                key={serviceName + dirName + itemIndex}
                onMouseDown={this._boundSelect}
                onMouseEnter={this.setSelectedIndex.bind(this, serviceName, dirName, itemIndex)}>
                {this.componentForItem(item, serviceName)}
              </li>
            );
        });
        //hide folders if only 1 level would be shown
        var showDirectories = directoryNames.length > 1;
        var directoryLabel = showDirectories
          ? (
            <div className="list-item">
              <span className="icon icon-file-directory">{dirName}</span>
            </div>
          )
          : null;
        return (
          <li className={cx({'list-nested-item': showDirectories})} key={dirName}>
            {directoryLabel}
            {message}
            <ul className="list-tree">
              {itemComponents}
            </ul>
          </li>
        );
      });
      return (
        <li className="list-nested-item" key={serviceName}>
          <div className="list-item">
            <span className="icon icon-gear">{serviceTitle}</span>
          </div>
          <ul className="list-tree" ref="selectionList">
            {directoriesForService}
          </ul>
        </li>
      );
    });
    var noResultsMessage = null;
    if (object.isEmpty(this.state.resultsByService)) {
      noResultsMessage = this._renderEmptyMessage('Search away!');
    } else if (itemsRendered === 0) {
      noResultsMessage = this._renderEmptyMessage(<span>¯\_(ツ)_/¯<br/>No results</span>);
    }
    var currentProvider = this.getProvider();
    var promptText = (currentProvider && currentProvider.prompt) || '';
    return (
      <div className="select-list omnisearch-modal" ref="modal">
        <AtomInput ref="queryInput" placeholderText={promptText} />
        {this._renderTabs()}
        <div className="omnisearch-results">
          {noResultsMessage}
          <div className="omnisearch-pane">
            <ul className="list-tree">
              {services}
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

var TabInfoPropType = PropTypes.shape({
  providerName: React.PropTypes.string,
  path: React.PropTypes.string,
  score: React.PropTypes.number,
});

QuickSelectionComponent.propTypes = {
  // TODO jxg: check which ones are actually needed anymore
  // old
  initialActiveTab: PropTypes.shape(TabInfoPropType).isRequired,
  // new
  activeProvider: PropTypes.shape({
    action: PropTypes.string.isRequired,
    debounceDelay: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    prompt: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  }).isRequired,
  onProviderChange: PropTypes.func,
};

module.exports = QuickSelectionComponent;
