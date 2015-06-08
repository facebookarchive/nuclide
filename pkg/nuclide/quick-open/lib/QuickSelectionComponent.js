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
  FileResult,
  GroupedResult,
} from './types';

var AtomInput = require('nuclide-ui-atom-input');
var {CompositeDisposable, Disposable, Emitter} = require('atom');
var QuickSelectionProvider = require('./QuickSelectionProvider');
var {
  debounce,
  object,
  } = require('nuclide-commons');
var React = require('react-for-atom');

var {
  filterEmptyResults,
  flattenResults,
} = require('./searchResultHelpers');

var {PropTypes} = React;

var assign = Object.assign || require('object-assign');
var cx = require('react-classset');

var QuickSelectionComponent = React.createClass({
  _emitter: undefined,
  _subscriptions: undefined,

  propTypes: {
    provider: PropTypes.instanceOf(QuickSelectionProvider).isRequired,
  },

  componentWillReceiveProps(nextProps: any) {
    if (nextProps.provider !== this.props.provider) {
      this.clear();
      if (nextProps.provider) {
        this.refs.queryInput.getTextEditor().setPlaceholderText(nextProps.provider.getPromptText());
      }
    }
  },

  componentDidUpdate(prevProps: any, prevState: any) {
    if (prevState.resultsByService !== this.state.resultsByService) {
      this.moveSelectionToTop();
      this._emitter.emit('items-changed', this.state.resultsByService);
    }

    if (prevState.selectedIndex !== this.state.selectedIndex) {
      this._updateScrollPosition();
    }
  },

  getInitialState() {
    return {
      // treated as immutable
      resultsByService: {
        /* EXAMPLE:
        providerName: {
          directoryName: {
            items: [Array<FileResult>],
            waiting: true,
            error: null,
          },
        },
        */
      },
      selectedIndex: -1,
    };
  },

  componentDidMount() {
    this._emitter = new Emitter();
    this._subscriptions = new CompositeDisposable();

    var node = this.getDOMNode();
    this._subscriptions.add(
      atom.commands.add(node, 'core:move-up', this.moveSelectionUp),
      atom.commands.add(node, 'core:move-down', this.moveSelectionDown),
      atom.commands.add(node, 'core:move-to-top', this.moveSelectionToTop),
      atom.commands.add(node, 'core:move-to-bottom', this.moveSelectionToBottom),
      atom.commands.add(node, 'core:confirm', this.select),
      atom.commands.add(node, 'core:cancel', this.cancel)
    );

    var inputTextEditor = this.getInputTextEditor();
    inputTextEditor.addEventListener('blur', (event) => {
      if (event.relatedTarget !== null) {
        this.cancel();
      }
    });

    var debounced = debounce(() => this.setQuery(inputTextEditor.model.getText()), 200);

    inputTextEditor.model.onDidChange(debounced);

    this.clear();
  },

  componentWillUnmount() {
    this._emitter.dispose();
    this._subscriptions.dispose();
  },

  onCancellation(callback: () => void): Disposable {
    return this._emitter.on('canceled', callback);
  },

  onSelection(callback: (selection: any) => void): Disposable {
    return this._emitter.on('selected', callback);
  },

  onItemsChanged(callback: (newItems: GroupedResult) => void): Disposable {
    return this._emitter.on('items-changed', callback);
  },

  select() {
    var flatResults = flattenResults(this.state.resultsByService);
    if (flatResults.length === 0) {
      this.cancel();
    } else {
      this._emitter.emit('selected', flatResults[this.state.selectedIndex]);
    }
  },

  cancel() {
    this._emitter.emit('canceled');
  },

  moveSelectionDown() {
    var flatResults = flattenResults(this.state.resultsByService);
    if (this.state.selectedIndex < flatResults.length - 1) {
      this.setState({selectedIndex: this.state.selectedIndex + 1});
    } else {
      this.moveSelectionToTop();
    }
  },

  moveSelectionUp() {
    if (this.state.selectedIndex > 0) {
      this.setState({selectedIndex: this.state.selectedIndex - 1});
    } else {
      this.moveSelectionToBottom();
    }
  },

  // Update the scroll position of the list view to ensure the selected item is visible.
  _updateScrollPosition() {
    if (!(this.refs && this.refs.selectionList)) {
      return;
    }
    var listNode =  this.refs.selectionList.getDOMNode();
    var selectedNode = listNode.getElementsByClassName('selected')[0];
    // false is passed for @centerIfNeeded parameter, which defaults to true.
    // Passing false causes the minimum necessary scroll to occur, so the selection sticks to the top/bottom
    if (selectedNode) {
      selectedNode.scrollIntoViewIfNeeded(false);
    }
  },

  moveSelectionToBottom() {
    var flatResults = flattenResults(this.state.resultsByService);
    this.setState({selectedIndex: Math.max(flatResults.length - 1, 0)});
  },

  moveSelectionToTop() {
    this.setState({selectedIndex: 0});
  },

  componentForItem(item: any): ReactElement {
    return this.getProvider().getComponentForItem(item);
  },

  getSelectedIndex(): number {
    return this.state.selectedIndex;
  },

  setSelectedIndex(index: number) {
    this.setState({
      selectedIndex: index,
    });
  },

  _setResult(serviceName, dirName, results) {
    var updatedResultsByDirectory = assign(
      {},
      this.state.resultsByService[serviceName],
      {
        [dirName]: results
      }
    );
    var updatedResultsByService = assign(
      {},
      this.state.resultsByService,
      {
        [serviceName]: updatedResultsByDirectory,
      }
    );
    this.setState({
      resultsByService: updatedResultsByService,
    }, () => {
      this._emitter.emit('items-changed', updatedResultsByService);
    });
  },

  _subscribeToResult(serviceName: string, directory:string, resultPromise: Promise<mixed>) {
    resultPromise.then((items) => {
      var updatedItems = {
        waiting: false,
        error: null,
        items: items.results,
      };
      this._setResult(serviceName, directory, updatedItems);
    }.bind(this)).catch(error => {
      var updatedItems = {
        waiting: false,
        error: 'an error occurred', error,
        items: [],
      };
      this._setResult(serviceName, directory, updatedItems);
    }.bind(this));
  },

  setQuery(query: string) {
    var provider = this.getProvider();
    if (provider) {
      var newItems = provider.executeQuery(query);
      newItems.then((requestsByDirectory) => {
        var groupedByService = {};
        for (var dirName in requestsByDirectory) {
          var servicesForDirectory = requestsByDirectory[dirName];
          for (var serviceName in servicesForDirectory) {
            var promise = servicesForDirectory[serviceName];
            this._subscribeToResult(serviceName, dirName, promise);
            if (groupedByService[serviceName] === undefined) {
              groupedByService[serviceName] = {};
            }
            groupedByService[serviceName][dirName] = {
              items: [],
              waiting: true,
              error: null,
            };
          }
        }
        this.setState({resultsByService: groupedByService});
      });
    }
  },

  getProvider(): QuickSelectionProvider {
    return this.props.provider;
  },

  setProvider(newProvider: QuickSelectionProvider) {
    this.setProps({provider: newProvider});
    this.clear();
  },

  getInputTextEditor(): Element {
    return this.refs.queryInput.getDOMNode();
  },

  clear() {
    this.getInputTextEditor().model.setText('');
  },

  focus() {
    this.getInputTextEditor().focus();
  },

  blur() {
    this.getInputTextEditor().blur();
  },

  _renderEmptyMessage(message: string): ReactElement {
    return (
      <ul className='background-message centered'>
        <li>{message}</li>
      </ul>
    );
  },

  _hasNoResults(): boolean {
    for (var serviceName in this.state.resultsByService) {
      var service = this.state.resultsByService[serviceName];
      for (var dirName in service) {
        var results = service[dirName];
        if (!results.waiting && results.items.length > 0) {
          return false;
        }
      }
    }
    return true;
  },

  render(): ReactElement {
    var itemsRendered = 0;
    var serviceNames = Object.keys(this.state.resultsByService);
    var services = serviceNames.map(serviceName => {
      var directories = this.state.resultsByService[serviceName];
      var directoryNames = Object.keys(directories);
      var directoriesForService = directoryNames.map(dirName => {
        var resultsForDirectory = directories[dirName];
        var message = null;
        if (resultsForDirectory.waiting) {
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
        } else if (resultsForDirectory.items.length === 0) {
          message = (
            <span>
              <span className="icon icon-x" />
              No results
            </span>
          );
        }
        var itemComponents = resultsForDirectory.items.map((item, itemIndex) => {
            var isSelected = itemsRendered === this.state.selectedIndex;
            itemsRendered++;
            return (
              <li
                className={cx({
                  'quick-open-result-item': true,
                  'list-item': true,
                  selected: isSelected,
                })}
                key={serviceName + dirName + itemIndex}
                onMouseDown={this.select}
                onMouseEnter={this.setSelectedIndex.bind(this, itemsRendered - 1)}>
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
            <span className="icon icon-gear">{serviceName}</span>
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
    var promptText = (currentProvider && currentProvider.getPromptText()) || '';
    return (
      <div className="select-list omnisearch-modal" ref="modal">
        <AtomInput ref="queryInput" placeholderText={promptText} />
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
  },
});

module.exports = QuickSelectionComponent;
