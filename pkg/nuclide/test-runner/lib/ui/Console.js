var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var AtomTextEditor = require('../../../ui/atom-text-editor');
var React = require('react-for-atom');

var PropTypes = React.PropTypes;

var Console = (function (_React$Component) {
  _inherits(Console, _React$Component);

  function Console() {
    _classCallCheck(this, Console);

    _get(Object.getPrototypeOf(Console.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(Console, [{
    key: 'render',
    value: function render() {
      return React.createElement(AtomTextEditor, {
        gutterHidden: true,
        path: '.ansi',
        readOnly: true,
        textBuffer: this.props.textBuffer
      });
    }
  }]);

  return Console;
})(React.Component);

Console.propTypes = {
  textBuffer: PropTypes.object.isRequired
};

module.exports = Console;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNvbnNvbGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztBQVdBLElBQU0sY0FBYyxHQUFHLE9BQU8sQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO0FBQy9ELElBQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDOztJQUVqQyxTQUFTLEdBQUksS0FBSyxDQUFsQixTQUFTOztJQUVWLE9BQU87WUFBUCxPQUFPOztXQUFQLE9BQU87MEJBQVAsT0FBTzs7K0JBQVAsT0FBTzs7O2VBQVAsT0FBTzs7V0FFTCxrQkFBRztBQUNQLGFBQ0Usb0JBQUMsY0FBYztBQUNiLG9CQUFZLEVBQUUsSUFBSSxBQUFDO0FBQ25CLFlBQUksRUFBQyxPQUFPO0FBQ1osZ0JBQVEsRUFBRSxJQUFJLEFBQUM7QUFDZixrQkFBVSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxBQUFDO1FBQ2xDLENBQ0Y7S0FDSDs7O1NBWEcsT0FBTztHQUFTLEtBQUssQ0FBQyxTQUFTOztBQWVyQyxPQUFPLENBQUMsU0FBUyxHQUFHO0FBQ2xCLFlBQVUsRUFBRSxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVU7Q0FDeEMsQ0FBQzs7QUFFRixNQUFNLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyIsImZpbGUiOiJDb25zb2xlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3QgQXRvbVRleHRFZGl0b3IgPSByZXF1aXJlKCcuLi8uLi8uLi91aS9hdG9tLXRleHQtZWRpdG9yJyk7XG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0LWZvci1hdG9tJyk7XG5cbmNvbnN0IHtQcm9wVHlwZXN9ID0gUmVhY3Q7XG5cbmNsYXNzIENvbnNvbGUgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPEF0b21UZXh0RWRpdG9yXG4gICAgICAgIGd1dHRlckhpZGRlbj17dHJ1ZX1cbiAgICAgICAgcGF0aD1cIi5hbnNpXCJcbiAgICAgICAgcmVhZE9ubHk9e3RydWV9XG4gICAgICAgIHRleHRCdWZmZXI9e3RoaXMucHJvcHMudGV4dEJ1ZmZlcn1cbiAgICAgIC8+XG4gICAgKTtcbiAgfVxuXG59XG5cbkNvbnNvbGUucHJvcFR5cGVzID0ge1xuICB0ZXh0QnVmZmVyOiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IENvbnNvbGU7XG4iXX0=