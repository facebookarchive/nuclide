"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ResizableFlexItem = exports.ResizableFlexContainer = exports.FlexDirections = void 0;

function _collection() {
  const data = require("../../modules/nuclide-commons/collection");

  _collection = function () {
    return data;
  };

  return data;
}

function _classnames() {
  const data = _interopRequireDefault(require("classnames"));

  _classnames = function () {
    return data;
  };

  return data;
}

function _createPaneContainer() {
  const data = _interopRequireDefault(require("../../modules/nuclide-commons-atom/create-pane-container"));

  _createPaneContainer = function () {
    return data;
  };

  return data;
}

function _nullthrows() {
  const data = _interopRequireDefault(require("nullthrows"));

  _nullthrows = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */
const FlexDirections = Object.freeze({
  HORIZONTAL: 'HORIZONTAL',
  VERTICAL: 'VERTICAL'
});
exports.FlexDirections = FlexDirections;

function getChildrenFlexScales(children) {
  return (0, _collection().arrayCompact)(React.Children.map(children, child => {
    if (child == null) {
      return null;
    } else if (!(child.type === ResizableFlexItem)) {
      throw new Error('ResizableFlexContainer may only have ResizableFlexItem children!');
    } else {
      return child.props.initialFlexScale;
    }
  }) || []);
}

class ResizableFlexContainer extends React.Component {
  componentDidMount() {
    this._setupPanes(this.props);

    this._renderPanes();
  }

  UNSAFE_componentWillReceiveProps(newProps) {
    if (!(0, _collection().arrayEqual)(getChildrenFlexScales(this.props.children), getChildrenFlexScales(newProps.children))) {
      this._destroyPanes();

      this._setupPanes(newProps);
    }
  }

  componentDidUpdate(prevProps) {
    this._renderPanes();
  }

  _setupPanes(props) {
    const flexScales = getChildrenFlexScales(props.children);
    const {
      direction
    } = props;
    this._paneContainer = (0, _createPaneContainer().default)();
    const containerNode = (0, _nullthrows().default)(this._flexContainer);
    containerNode.innerHTML = '';
    containerNode.appendChild(atom.views.getView(this._paneContainer));

    const startingPane = this._paneContainer.getActivePane();

    let lastPane = startingPane;
    this._panes = [startingPane];

    for (let i = 1; i < flexScales.length; i++) {
      const flexScale = flexScales[i];

      if (direction === FlexDirections.HORIZONTAL) {
        lastPane = lastPane.splitRight({
          flexScale
        });
      } else {
        /* direction === SplitDirections.VERTICAL */
        lastPane = lastPane.splitDown({
          flexScale
        });
      }

      this._panes.push(lastPane);
    }

    startingPane.setFlexScale(flexScales[0]);
  }

  _renderPanes() {
    const {
      children
    } = this.props;
    let i = 0;
    React.Children.forEach(children, child => {
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
    const {
      className
    } = this.props;
    const containerClassName = (0, _classnames().default)('nuclide-ui-resizable-flex-container', className);
    return React.createElement("div", {
      className: containerClassName,
      ref: el => {
        this._flexContainer = el;
      }
    });
  }

}

exports.ResizableFlexContainer = ResizableFlexContainer;

class ResizableFlexItem extends React.Component {
  render() {
    return React.createElement("div", {
      className: "nuclide-ui-resizable-flex-item"
    }, this.props.children);
  }

}

exports.ResizableFlexItem = ResizableFlexItem;