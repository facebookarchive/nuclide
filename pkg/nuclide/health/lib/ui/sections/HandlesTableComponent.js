'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var React = require('react-for-atom');

class HandlesTableComponent extends React.Component {

  previousHandleSummaries: Object;

  constructor(props: Object) {
    super(props);
    this.previousHandleSummaries = {};
  }

  getHandleSummaries(handles: Array<Object>): Object {
    var handleSummaries = {};
    handles.forEach((handle, h) => {
      var summarizedHandle = {};
      this.props.columns.forEach((column, c) => {
        summarizedHandle[c] = column.value(handle, h);
      });
      handleSummaries[this.props.keyed(handle, h)] = summarizedHandle;
    });
    return handleSummaries;
  }

  render(): ReactElement {
    if (!this.props.handles || Object.keys(this.props.handles).length === 0) {
      return <div />;
    }

    var handleSummaries = this.getHandleSummaries(this.props.handles);
    var component = (
      <div>
        <h3>{this.props.title}</h3>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              {this.props.columns.map((column, c) => <th key={c}>{column.title}</th>)}
            </tr>
          </thead>
          <tbody>
            {Object.keys(handleSummaries).map(key => {
              var handleSummary = handleSummaries[key];
              var previousHandle = this.previousHandleSummaries[key];
              return (
                <tr key={key} className={previousHandle ? '' : 'nuclide-health-handle-new'}>
                  <th>{key}</th>
                  {this.props.columns.map((column, c) => {
                    var className = '';
                    if (previousHandle && previousHandle[c] !== handleSummary[c]) {
                      className = 'nuclide-health-handle-updated';
                    }
                    return <td key={c} className={className}>{handleSummary[c]}</td>;
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
    this.previousHandleSummaries = handleSummaries;
    return component;
  }

}

HandlesTableComponent.propTypes = {
  title: React.PropTypes.string,
  handles: React.PropTypes.arrayOf(React.PropTypes.object),
  keyed: React.PropTypes.func.isRequired,
  columns: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
};

module.exports = HandlesTableComponent;
