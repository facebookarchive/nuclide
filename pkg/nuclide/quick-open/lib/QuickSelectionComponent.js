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
  ProviderSpec,
} from './types';

import type {
  DirectoryName,
  GroupedResult,
  ServiceName
} from 'nuclide-quick-open-interfaces';

type ResultContext = {
  nonEmptyResults: GroupedResult;
  serviceNames: Array<ServiceName>;
  currentServiceIndex: number;
  currentService: Object;
  directoryNames: Array<DirectoryName>;
  currentDirectoryIndex: number;
  currentDirectory: Object;
};

const AtomInput = require('nuclide-ui-atom-input');
const {CompositeDisposable, Disposable, Emitter} = require('atom');
const {
  debounce,
  object,
} = require('nuclide-commons');
const React = require('react-for-atom');

import SearchResultManager from './SearchResultManager';
const searchResultManager = SearchResultManager.getInstance();
const NuclideTabs = require('nuclide-ui-tabs');
const {PropTypes} = React;
const classnames = require('classnames');

const {
  filterEmptyResults,
} = require('./searchResultHelpers');

/**
 * Determine what the applicable shortcut for a given action is within this component's context.
 * For example, this will return different keybindings on windows vs linux.
 */
function _findKeybindingForAction(action: string, target: HTMLElement): string {
  const {humanizeKeystroke} = require('nuclide-keystroke-label');
  const matchingKeyBindings = atom.keymaps.findKeyBindings({
    command: action,
    target,
  });
  const keystroke = (matchingKeyBindings.length && matchingKeyBindings[0].keystrokes) || '';
  return humanizeKeystroke(keystroke);
}

export default class QuickSelectionComponent extends React.Component {
  _emitter: Emitter;
  _subscriptions: CompositeDisposable;
  _modalNode: HTMLElement;
  _debouncedQueryHandler: () => void;
  _boundSelect: () => void;
  _boundHandleTabChange: (tab: ProviderSpec) => void;
  _state: {
    activeTab: ProviderSpec,
    resultsByService: GroupedResult,
    renderableProviders: Array<ProviderSpec>,
  };

  constructor(props: Object) {
    super(props);
    this._emitter = new Emitter();
    this._subscriptions = new CompositeDisposable();
    this._boundSelect = () => this.select();
    this._boundHandleTabChange = (tab: ProviderSpec) => this._handleTabChange(tab);
    this.state = {
      activeTab: searchResultManager.getProviderByName(searchResultManager.getActiveProviderName()),
      // treated as immutable
      resultsByService: {},
      renderableProviders: searchResultManager.getRenderableProviders(),
    };
    this.resetSelection();
    this.handleProvidersChangeBound = this.handleProvidersChange.bind(this);
    this.handleResultsChangeBound = this.handleResultsChange.bind(this);
  }

  componentWillReceiveProps(nextProps: any) {
    if (nextProps.activeProvider !== this.props.activeProvider) {
      if (nextProps.activeProvider) {
        this._getTextEditor().setPlaceholderText(nextProps.activeProvider.prompt);
        const newResults = {};
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
      atom.commands.add(
        this._modalNode,
        'core:move-to-bottom',
        this.handleMoveToBottom.bind(this)
      ),
      atom.commands.add(this._modalNode, 'core:move-to-top', this.handleMoveToTop.bind(this)),
      atom.commands.add(this._modalNode, 'core:move-down', this.handleMoveDown.bind(this)),
      atom.commands.add(this._modalNode, 'core:move-up', this.handleMoveUp.bind(this)),
      atom.commands.add(this._modalNode, 'core:confirm', this.select.bind(this)),
    );

    const inputTextEditor = this.getInputTextEditor();
    this._subscriptions.add(
      searchResultManager.on(
        searchResultManager.PROVIDERS_CHANGED,
        this.handleProvidersChangeBound
      ),
      searchResultManager.on(
        searchResultManager.RESULTS_CHANGED,
        this.handleResultsChangeBound
      ),
    );

    this._updateQueryHandler();
    inputTextEditor.model.onDidChange(() => this._handleTextInputChange());
    this.clear();
  }

  componentWillUnmount() {
    this._emitter.dispose();
    this._subscriptions.dispose();
  }

  handleMoveToBottom(): void {
    this.moveSelectionToBottom();
    this.onUserDidChangeSelection();
  }

  handleMoveToTop(): void {
    this.moveSelectionToTop();
    this.onUserDidChangeSelection();
  }

  handleMoveDown(): void {
    this.moveSelectionDown();
    this.onUserDidChangeSelection();
  }

  handleMoveUp(): void {
    this.moveSelectionUp();
    this.onUserDidChangeSelection();
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

  onItemsChanged(callback: (newItems: GroupedResult) => void): Disposable {
    return this._emitter.on('items-changed', callback);
  }

  _updateQueryHandler(): void {
    this._debouncedQueryHandler = debounce(
      () => this.setKeyboardQuery(this.getInputTextEditor().model.getText()),
      this.getProvider().debounceDelay,
      false
    );
  }

  _handleTextInputChange(): void {
    this._debouncedQueryHandler();
  }

  handleResultsChange(): void {
    this._updateResults(this.props.activeProvider.name);
  }

  _updateResults(activeProviderName: string): void {
    const updatedResults = searchResultManager.getResults(
      this.refs['queryInput'].getText(),
      activeProviderName
    );
    this.setState({
      resultsByService: updatedResults,
    }, () => {
      if (!this.state.hasUserSelection) {
        this.moveSelectionToTop();
      }
    });
  }

  handleProvidersChange(): void {
    const renderableProviders = searchResultManager.getRenderableProviders();
    const activeProviderName = searchResultManager.getActiveProviderName();
    this.setState({
      renderableProviders,
      activeProviderName,
    });
    this._updateResults(activeProviderName);
  }

  select(): void {
    const selectedItem = this.getSelectedItem();
    if (!selectedItem) {
      this.cancel();
    } else {
      this._emitter.emit('selected', selectedItem);
    }
  }

  onUserDidChangeSelection() {
    this.setState({
      hasUserSelection: true,
    });
  }

  cancel(): void {
    this._emitter.emit('canceled');
  }

  clearSelection(): void {
    this.setSelectedIndex('', '', -1);
  }

  _getCurrentResultContext(): ?ResultContext {
    const nonEmptyResults = filterEmptyResults(this.state.resultsByService);
    const serviceNames = Object.keys(nonEmptyResults);
    const currentServiceIndex = serviceNames.indexOf(this.state.selectedService);
    const currentService = nonEmptyResults[this.state.selectedService];

    if (!currentService) {
      return null;
    }

    const directoryNames = Object.keys(currentService.results);
    const currentDirectoryIndex = directoryNames.indexOf(this.state.selectedDirectory);
    const currentDirectory = currentService.results[this.state.selectedDirectory];

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

  moveSelectionDown(): void {
    const context = this._getCurrentResultContext();
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
          const newServiceName = context.serviceNames[context.currentServiceIndex + 1];
          const newDirectoryName =
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
    const context = this._getCurrentResultContext();
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
          context.currentService
            .results[context.directoryNames[context.currentDirectoryIndex - 1]].results.length - 1
        );
      } else {
        // ...or the previous service...
        if (context.currentServiceIndex > 0) {
          const newServiceName = context.serviceNames[context.currentServiceIndex - 1];
          const newDirectoryName =
            Object.keys(context.nonEmptyResults[newServiceName].results).pop();
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
    if (!(this.refs && this.refs['selectionList'])) {
      return;
    }
    const listNode =  React.findDOMNode(this.refs['selectionList']);
    const selectedNode = listNode.getElementsByClassName('selected')[0];
    // false is passed for @centerIfNeeded parameter, which defaults to true.
    // Passing false causes the minimum necessary scroll to occur, so the selection sticks to the
    // top/bottom.
    if (selectedNode) {
      selectedNode.scrollIntoViewIfNeeded(false);
    }
  }

  moveSelectionToBottom(): void {
    const bottom = this._getOuterResults(Array.prototype.pop);
    if (!bottom) {
      return;
    }
    this.setSelectedIndex(bottom.serviceName, bottom.directoryName, bottom.results.length - 1);
  }

  moveSelectionToTop(): void {
    const top = this._getOuterResults(Array.prototype.shift);
    if (!top) {
      return;
    }
    this.setSelectedIndex(top.serviceName, top.directoryName, 0);
  }

  _getOuterResults(arrayOperation: Function):
    ?{serviceName: string; directoryName: string; results: Array<mixed>} {
    const nonEmptyResults = filterEmptyResults(this.state.resultsByService);
    const serviceName = arrayOperation.call(Object.keys(nonEmptyResults));
    if (!serviceName) {
      return null;
    }
    const service = nonEmptyResults[serviceName];
    const directoryName = arrayOperation.call(Object.keys(service.results));
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

  componentForItem(item: any, serviceName: string, dirName: string): ReactElement {
    return searchResultManager.getRendererForProvider(serviceName)(
      item,
      serviceName,
      dirName,
    );
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
    }, () => {
      this._emitter.emit('selection-changed', this.getSelectedIndex());
      this.onUserDidChangeSelection();
    });
  }

  resetSelection() {
    this.setState({
      selectedService: '',
      selectedDirectory: '',
      selectedItemIndex: -1,
      hasUserSelection: false,
    });
  }

  setKeyboardQuery(query: string) {
    this.resetSelection();
    this.setQuery(query);
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
   * @param newTab is actually a ProviderSpec plus the `name` and `tabContent` properties added by
   *     _renderTabs(), which created the tab object in the first place.
   */
  _handleTabChange(newTab: ProviderSpec): void {
    const providerName = newTab.name;
    if (providerName !== this.props.activeProvider.name) {
      if (this.props.onProviderChange) {
        this.props.onProviderChange(providerName);
      }
      this._emitter.emit('active-provider-changed', providerName);
    }
    this.refs['queryInput'].focus();
  }

  _renderTabs(): ReactElement {
    const tabs = this.state.renderableProviders.map(tab => {
      let keyBinding = null;//TODO
      const humanizedKeybinding = _findKeybindingForAction(tab.action || '', this._modalNode);
      if (humanizedKeybinding !== '') {
        keyBinding = (
          <kbd className="key-binding">
            {humanizedKeybinding}
          </kbd>
        );
      }
      return {
        ...tab,
        name: tab.name,
        tabContent: <span>{tab.title}{keyBinding}</span>,
      };
    });
    return (
      <div className="omnisearch-tabs">
        <NuclideTabs
          tabs={tabs}
          activeTabName={this.state.activeTab.name}
          onActiveTabChange={this._boundHandleTabChange}
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
    for (const serviceName in this.state.resultsByService) {
      const service = this.state.resultsByService[serviceName];
      for (const dirName in service) {
        const results = service[dirName];
        if (!results.loading && results.results.length > 0) {
          return false;
        }
      }
    }
    return true;
  }

  render(): ReactElement {
    let numTotalResultsRendered = 0;
    const isOmniSearchActive = this.state.activeTab.name === 'OmniSearchResultProvider';
    let numQueriesOutstanding = 0;
    const serviceNames = Object.keys(this.state.resultsByService);
    const services = serviceNames.map(serviceName => {
      let numResultsForService = 0;
      const directories = this.state.resultsByService[serviceName].results;
      const serviceTitle = this.state.resultsByService[serviceName].title;
      const directoryNames = Object.keys(directories);
      const directoriesForService = directoryNames.map(dirName => {
        const resultsForDirectory = directories[dirName];
        let message = null;
        if (resultsForDirectory.loading) {
          numQueriesOutstanding++;
          if (!isOmniSearchActive) {
            numTotalResultsRendered++;
            message = (
              <span>
                <span className="loading loading-spinner-tiny inline-block" />
                Loading...
              </span>
            );
          }
        } else if (resultsForDirectory.error && !isOmniSearchActive) {
          message = (
            <span>
              <span className="icon icon-circle-slash" />
              Error: <pre>{resultsForDirectory.error}</pre>
            </span>
          );
        } else if (resultsForDirectory.results.length === 0 && !isOmniSearchActive) {
          message = (
            <span>
              <span className="icon icon-x" />
              No results
            </span>
          );
        }
        const itemComponents = resultsForDirectory.results.map((item, itemIndex) => {
          numResultsForService++;
          numTotalResultsRendered++;
          const isSelected = (
            serviceName === this.state.selectedService &&
            dirName === this.state.selectedDirectory &&
            itemIndex === this.state.selectedItemIndex
          );
          return (
            <li
              className={classnames({
                'quick-open-result-item': true,
                'list-item': true,
                selected: isSelected,
              })}
              key={serviceName + dirName + itemIndex}
              onMouseDown={this._boundSelect}
              onMouseEnter={this.setSelectedIndex.bind(this, serviceName, dirName, itemIndex)}>
              {this.componentForItem(item, serviceName, dirName)}
            </li>
          );
        });
        let directoryLabel = null;
        //hide folders if only 1 level would be shown, or if no results were found
        const showDirectories = directoryNames.length > 1 &&
          (!isOmniSearchActive || resultsForDirectory.results.length > 0);
        if (showDirectories) {
          directoryLabel = (
            <div className="list-item">
              <span className="icon icon-file-directory">{dirName}</span>
            </div>
          );
        }
        return (
          <li className={classnames({'list-nested-item': showDirectories})} key={dirName}>
            {directoryLabel}
            {message}
            <ul className="list-tree">
              {itemComponents}
            </ul>
          </li>
        );
      });
      let serviceLabel = null;
      if (isOmniSearchActive && numResultsForService > 0) {
        serviceLabel = (
          <div className="list-item">
            <span className="icon icon-gear">{serviceTitle}</span>
          </div>
        );
        return (
          <li className="list-nested-item" key={serviceName}>
            {serviceLabel}
            <ul className="list-tree">
              {directoriesForService}
            </ul>
          </li>
        );
      }
      return directoriesForService;
    });
    let noResultsMessage = null;
    if (object.isEmpty(this.state.resultsByService)) {
      noResultsMessage = this._renderEmptyMessage('Search away!');
    } else if (numTotalResultsRendered === 0) {
      noResultsMessage = this._renderEmptyMessage(<span>¯\_(ツ)_/¯<br/>No results</span>);
    }
    const currentProvider = this.getProvider();
    const promptText = (currentProvider && currentProvider.prompt) || '';
    let omniSearchStatus = null;
    if (isOmniSearchActive && numQueriesOutstanding > 0) {
      omniSearchStatus = (
        <span>
          <span className="loading loading-spinner-tiny inline-block" />
          {`Loading...`}
        </span>
      );
    }
    return (
      <div className="select-list omnisearch-modal" ref="modal">
        <AtomInput ref="queryInput" placeholderText={promptText} />
        {this._renderTabs()}
        <div className="omnisearch-results" style={{maxHeight: this.props.maxScrollableAreaHeight}}>
          {noResultsMessage}
          <div className="omnisearch-pane">
            <ul className="list-tree" ref="selectionList">
              {services}
              {omniSearchStatus}
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

QuickSelectionComponent.propTypes = {
  activeProvider: PropTypes.shape({
    action: PropTypes.string.isRequired,
    debounceDelay: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    prompt: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  }).isRequired,
  onProviderChange: PropTypes.func,
  maxScrollableAreaHeight: PropTypes.number,
};
