'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ResizableFlexItem = exports.ResizableFlexContainer = exports.FlexDirections = undefined;

var _collection;

function _load_collection() {
  return _collection = require('nuclide-commons/collection');
}

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _createPaneContainer;

function _load_createPaneContainer() {
  return _createPaneContainer = _interopRequireDefault(require('../commons-atom/create-pane-container'));
}

var _react = _interopRequireWildcard(require('react'));

var _reactDom = _interopRequireDefault(require('react-dom'));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const FlexDirections = exports.FlexDirections = Object.freeze({
  HORIZONTAL: 'HORIZONTAL',
  VERTICAL: 'VERTICAL'
}); /**
     * Copyright (c) 2015-present, Facebook, Inc.
     * All rights reserved.
     *
     * This source code is licensed under the license found in the LICENSE file in
     * the root directory of this source tree.
     *
     * 
     * @format
     */

function getChildrenFlexScales(children) {
  return (0, (_collection || _load_collection()).arrayCompact)(_react.Children.map(children, child => {
    if (child == null) {
      return null;
    } else if (!(child.type === ResizableFlexItem)) {
      throw new Error('ResizableFlexContainer may only have ResizableFlexItem children!');
    } else {
      return child.props.initialFlexScale;
    }
  }) || []);
}

class ResizableFlexContainer extends _react.Component {

  componentDidMount() {
    this._setupPanes(this.props);
    this._renderPanes();
  }

  componentWillReceiveProps(newProps) {
    if (!(0, (_collection || _load_collection()).arrayEqual)(getChildrenFlexScales(this.props.children), getChildrenFlexScales(newProps.children))) {
      this._destroyPanes();
      this._setupPanes(newProps);
    }
  }

  componentDidUpdate(prevProps) {
    this._renderPanes();
  }

  _setupPanes(props) {
    const flexScales = getChildrenFlexScales(props.children);
    const { direction } = props;
    this._paneContainer = (0, (_createPaneContainer || _load_createPaneContainer()).default)();
    const containerNode = _reactDom.default.findDOMNode(this.refs.flexContainer);
    // $FlowFixMe
    containerNode.innerHTML = '';
    // $FlowFixMe
    containerNode.appendChild(atom.views.getView(this._paneContainer));
    const startingPane = this._paneContainer.getActivePane();
    let lastPane = startingPane;
    this._panes = [startingPane];
    for (let i = 1; i < flexScales.length; i++) {
      const flexScale = flexScales[i];
      if (direction === FlexDirections.HORIZONTAL) {
        lastPane = lastPane.splitRight({ flexScale });
      } else {
        /* direction === SplitDirections.VERTICAL */lastPane = lastPane.splitDown({ flexScale });
      }
      this._panes.push(lastPane);
    }
    startingPane.setFlexScale(flexScales[0]);
  }

  _renderPanes() {
    const { children } = this.props;
    let i = 0;
    _react.Children.forEach(children, child => {
      if (child == null) {
        return;
      }
      _reactDom.default.render(child, this._getPaneElement(this._panes[i++]));
    });
  }

  componentWillUnmount() {
    this._destroyPanes();
  }

  _destroyPanes() {
    this._panes.forEach(pane => {
      _reactDom.default.unmountComponentAtNode(_reactDom.default.findDOMNode(this._getPaneElement(pane)));
      pane.destroy();
    });
    this._panes = [];
  }

  _getPaneElement(pane) {
    // $FlowFixMe querySelector returns ?HTMLElement
    return atom.views.getView(pane).querySelector('.item-views');
  }

  render() {
    const { className } = this.props;
    const containerClassName = (0, (_classnames || _load_classnames()).default)('nuclide-ui-resizable-flex-container', className);
    return _react.createElement('div', { className: containerClassName, ref: 'flexContainer' });
  }
}

exports.ResizableFlexContainer = ResizableFlexContainer;
class ResizableFlexItem extends _react.Component {
  render() {
    return _react.createElement(
      'div',
      { className: 'nuclide-ui-resizable-flex-item' },
      this.props.children
    );
  }
}
exports.ResizableFlexItem = ResizableFlexItem;