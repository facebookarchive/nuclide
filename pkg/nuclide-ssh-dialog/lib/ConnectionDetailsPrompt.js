Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _ConnectionDetailsForm = require('./ConnectionDetailsForm');

var _ConnectionDetailsForm2 = _interopRequireDefault(_ConnectionDetailsForm);

var _nuclideUiLibMutableListSelector = require('../../nuclide-ui/lib/MutableListSelector');

var _reactForAtom = require('react-for-atom');

/**
 * This component contains the entire view in which the user inputs their
 * connection information when connecting to a remote project.
 * This view contains the ConnectionDetailsForm on the left side, and a
 * NuclideListSelector on the right side that displays 0 or more connection
 * 'profiles'. Clicking on a 'profile' in the NuclideListSelector auto-fills
 * the form with the information associated with that profile.
 */

var ConnectionDetailsPrompt = (function (_React$Component) {
  _inherits(ConnectionDetailsPrompt, _React$Component);

  function ConnectionDetailsPrompt(props) {
    _classCallCheck(this, ConnectionDetailsPrompt);

    _get(Object.getPrototypeOf(ConnectionDetailsPrompt.prototype), 'constructor', this).call(this, props);
    this._boundOnProfileClicked = this._onProfileClicked.bind(this);
    this._boundOnDeleteProfileClicked = this._onDeleteProfileClicked.bind(this);
  }

  _createClass(ConnectionDetailsPrompt, [{
    key: 'getFormFields',
    value: function getFormFields() {
      return this.refs['connection-details-form'].getFormFields();
    }
  }, {
    key: 'getPrefilledConnectionParams',
    value: function getPrefilledConnectionParams() {
      // If there are profiles, pre-fill the form with the information from the
      // specified selected profile.
      if (this.props.connectionProfiles && this.props.connectionProfiles.length && this.props.indexOfSelectedConnectionProfile != null) {
        var indexToSelect = this.props.indexOfSelectedConnectionProfile;
        if (indexToSelect >= this.props.connectionProfiles.length) {
          // This logic protects us from incorrect indices passed from above, and
          // allows us to passively account for profiles being deleted.
          indexToSelect = this.props.connectionProfiles.length - 1;
        }
        var selectedProfile = this.props.connectionProfiles[indexToSelect];
        return selectedProfile.params;
      }
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {
      // We have to manually update the contents of an existing ConnectionDetailsForm,
      // because it contains AtomInput components (which don't update their contents
      // when their props change).
      var existingConnectionDetailsForm = this.refs['connection-details-form'];
      if (existingConnectionDetailsForm) {
        existingConnectionDetailsForm.setFormFields(this.getPrefilledConnectionParams());
        existingConnectionDetailsForm.clearPassword();
      }
    }
  }, {
    key: 'render',
    value: function render() {
      // If there are profiles, pre-fill the form with the information from the
      // specified selected profile.
      var prefilledConnectionParams = this.getPrefilledConnectionParams() || {};

      // Create helper data structures.
      var listSelectorItems = undefined;
      if (this.props.connectionProfiles) {
        listSelectorItems = this.props.connectionProfiles.map(function (profile, index) {
          // Use the index of each profile as its id. This is safe because the
          // items are immutable (within this React component).
          return {
            deletable: profile.deletable,
            displayTitle: profile.displayTitle,
            id: String(index)
          };
        });
      } else {
        listSelectorItems = [];
      }

      var idOfSelectedItem = this.props.indexOfSelectedConnectionProfile == null ? null : String(this.props.indexOfSelectedConnectionProfile);

      return _reactForAtom.React.createElement(
        'div',
        { className: 'nuclide-connection-details-prompt container-fluid' },
        _reactForAtom.React.createElement(
          'div',
          { className: 'row', style: { display: 'flex' } },
          _reactForAtom.React.createElement(
            'div',
            { className: 'connection-profiles col-xs-3 inset-panel' },
            _reactForAtom.React.createElement(
              'h6',
              null,
              'Profiles'
            ),
            _reactForAtom.React.createElement(_nuclideUiLibMutableListSelector.MutableListSelector, {
              items: listSelectorItems,
              idOfSelectedItem: idOfSelectedItem,
              onItemClicked: this._boundOnProfileClicked,
              onAddButtonClicked: this.props.onAddProfileClicked,
              onDeleteButtonClicked: this._boundOnDeleteProfileClicked
            })
          ),
          _reactForAtom.React.createElement(
            'div',
            { className: 'connection-details-form col-xs-9' },
            _reactForAtom.React.createElement(_ConnectionDetailsForm2['default'], {
              ref: 'connection-details-form',
              initialUsername: prefilledConnectionParams.username,
              initialServer: prefilledConnectionParams.server,
              initialRemoteServerCommand: prefilledConnectionParams.remoteServerCommand,
              initialCwd: prefilledConnectionParams.cwd,
              initialSshPort: prefilledConnectionParams.sshPort,
              initialPathToPrivateKey: prefilledConnectionParams.pathToPrivateKey,
              initialAuthMethod: prefilledConnectionParams.authMethod,
              onConfirm: this.props.onConfirm,
              onCancel: this.props.onCancel
            })
          )
        )
      );
    }
  }, {
    key: '_onProfileClicked',
    value: function _onProfileClicked(profileId) {
      // The id of a profile is its index in the list of props.
      this.props.onProfileClicked(parseInt(profileId, 10));
    }
  }, {
    key: '_onDeleteProfileClicked',
    value: function _onDeleteProfileClicked(profileId) {
      if (profileId == null) {
        return;
      }
      // The id of a profile is its index in the list of props.
      this.props.onDeleteProfileClicked(parseInt(profileId, 10));
    }
  }]);

  return ConnectionDetailsPrompt;
})(_reactForAtom.React.Component);

exports['default'] = ConnectionDetailsPrompt;
module.exports = exports['default'];

// The initial list of connection profiles that will be displayed.
// Whenever a user add/removes profiles via the child NuclideListSelector,
// these props should be updated from the top-level by calling ReactDOM.render()
// again (with the new props) on the ConnectionDetailsPrompt.

// If there is >= 1 connection profile, this index indicates the profile to use.

// Function to call when 'enter'/'confirm' is selected by the user in this view.

// Function to call when 'cancel' is selected by the user in this view.

// Function that is called when the "+" button on the profiles list is clicked.
// The user's intent is to create a new profile.

// Function that is called when the "-" button on the profiles list is clicked
// ** while a profile is selected **.
// The user's intent is to delete the currently-selected profile.
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNvbm5lY3Rpb25EZXRhaWxzUHJvbXB0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7cUNBV2tDLHlCQUF5Qjs7OzsrQ0FDekIsMENBQTBDOzs0QkFDeEQsZ0JBQWdCOzs7Ozs7Ozs7OztJQXNDZix1QkFBdUI7WUFBdkIsdUJBQXVCOztBQU8vQixXQVBRLHVCQUF1QixDQU85QixLQUFZLEVBQUU7MEJBUFAsdUJBQXVCOztBQVF4QywrQkFSaUIsdUJBQXVCLDZDQVFsQyxLQUFLLEVBQUU7QUFDYixRQUFJLENBQUMsc0JBQXNCLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoRSxRQUFJLENBQUMsNEJBQTRCLEdBQUcsSUFBSSxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUM3RTs7ZUFYa0IsdUJBQXVCOztXQWE3Qix5QkFBOEM7QUFDekQsYUFBTyxJQUFJLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLENBQUMsYUFBYSxFQUFFLENBQUM7S0FDN0Q7OztXQUUyQix3Q0FBbUM7OztBQUc3RCxVQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsa0JBQWtCLElBQzdCLElBQUksQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsTUFBTSxJQUNwQyxJQUFJLENBQUMsS0FBSyxDQUFDLGdDQUFnQyxJQUFJLElBQUksRUFBRTtBQUN2RCxZQUFJLGFBQWEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGdDQUFnQyxDQUFDO0FBQ2hFLFlBQUksYUFBYSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsTUFBTSxFQUFFOzs7QUFHekQsdUJBQWEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7U0FDMUQ7QUFDRCxZQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGtC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Q3JCLGVBQU87T0FDUjs7QUFFRCxVQUFJLENBQUMsS0FBSyxDQUFDLHNCQUFzQixDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztLQUM1RDs7O1NBakhrQix1QkFBdUI7R0FBUyxvQkFBTSxTQUFTOztxQkFBL0MsdUJBQXVCIiwiZmlsZSI6IkNvbm5lY3Rpb25EZXRhaWxzUHJvbXB0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IENvbm5lY3Rpb25EZXRhaWxzRm9ybSBmcm9tICcuL0Nvbm5lY3Rpb25EZXRhaWxzRm9ybSc7XG5pbXBvcnQge011dGFibGVMaXN0U2VsZWN0b3J9IGZyb20gJy4uLy4uL251Y2xpZGUtdWkvbGliL011dGFibGVMaXN0U2VsZWN0b3InO1xuaW1wb3J0IHtSZWFjdH0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuXG5pbXBvcnQgdHlwZSB7XG4gIE51Y2xpZGVSZW1vdGVDb25uZWN0aW9uUGFyYW1zLFxuICBOdWNsaWRlUmVtb3RlQ29ubmVjdGlvblBhcmFtc1dpdGhQYXNzd29yZCxcbiAgTnVjbGlkZVJlbW90ZUNvbm5lY3Rpb25Qcm9maWxlLFxufSBmcm9tICcuL2Nvbm5lY3Rpb24tdHlwZXMnO1xuXG50eXBlIFByb3BzID0ge1xuICAvLyBUaGUgaW5pdGlhbCBsaXN0IG9mIGNvbm5lY3Rpb24gcHJvZmlsZXMgdGhhdCB3aWxsIGJlIGRpc3BsYXllZC5cbiAgLy8gV2hlbmV2ZXIgYSB1c2VyIGFkZC9yZW1vdmVzIHByb2ZpbGVzIHZpYSB0aGUgY2hpbGQgTnVjbGlkZUxpc3RTZWxlY3RvcixcbiAgLy8gdGhlc2UgcHJvcHMgc2hvdWxkIGJlIHVwZGF0ZWQgZnJvbSB0aGUgdG9wLWxldmVsIGJ5IGNhbGxpbmcgUmVhY3RET00ucmVuZGVyKClcbiAgLy8gYWdhaW4gKHdpdGggdGhlIG5ldyBwcm9wcykgb24gdGhlIENvbm5lY3Rpb25EZXRhaWxzUHJvbXB0LlxuICBjb25uZWN0aW9uUHJvZmlsZXM6ID9BcnJheTxOdWNsaWRlUmVtb3RlQ29ubmVjdGlvblByb2ZpbGU+O1xuICAvLyBJZiB0aGVyZSBpcyA+PSAxIGNvbm5lY3Rpb24gcHJvZmlsZSwgdGhpcyBpbmRleCBpbmRpY2F0ZXMgdGhlIHByb2ZpbGUgdG8gdXNlLlxuICBpbmRleE9mU2VsZWN0ZWRDb25uZWN0aW9uUHJvZmlsZTogP251bWJlcjtcbiAgLy8gRnVuY3Rpb24gdG8gY2FsbCB3aGVuICdlbnRlcicvJ2NvbmZpcm0nIGlzIHNlbGVjdGVkIGJ5IHRoZSB1c2VyIGluIHRoaXMgdmlldy5cbiAgb25Db25maXJtOiAoKSA9PiBtaXhlZDtcbiAgLy8gRnVuY3Rpb24gdG8gY2FsbCB3aGVuICdjYW5jZWwnIGlzIHNlbGVjdGVkIGJ5IHRoZSB1c2VyIGluIHRoaXMgdmlldy5cbiAgb25DYW5jZWw6ICgpID0+IG1peGVkO1xuICAvLyBGdW5jdGlvbiB0aGF0IGlzIGNhbGxlZCB3aGVuIHRoZSBcIitcIiBidXR0b24gb24gdGhlIHByb2ZpbGVzIGxpc3QgaXMgY2xpY2tlZC5cbiAgLy8gVGhlIHVzZXIncyBpbnRlbnQgaXMgdG8gY3JlYXRlIGEgbmV3IHByb2ZpbGUuXG4gIG9uQWRkUHJvZmlsZUNsaWNrZWQ6ICgpID0+IG1peGVkO1xuICAvLyBGdW5jdGlvbiB0aGF0IGlzIGNhbGxlZCB3aGVuIHRoZSBcIi1cIiBidXR0b24gb24gdGhlIHByb2ZpbGVzIGxpc3QgaXMgY2xpY2tlZFxuICAvLyAqKiB3aGlsZSBhIHByb2ZpbGUgaXMgc2VsZWN0ZWQgKiouXG4gIC8vIFRoZSB1c2VyJ3MgaW50ZW50IGlzIHRvIGRlbGV0ZSB0aGUgY3VycmVudGx5LXNlbGVjdGVkIHByb2ZpbGUuXG4gIG9uRGVsZXRlUHJvZmlsZUNsaWNrZWQ6IChpbmRleE9mU2VsZWN0ZWRDb25uZWN0aW9uUHJvZmlsZTogbnVtYmVyKSA9PiBtaXhlZDtcbiAgb25Qcm9maWxlQ2xpY2tlZDogKGluZGV4T2ZTZWxlY3RlZENvbm5lY3Rpb25Qcm9maWxlOiBudW1iZXIpID0+IG1peGVkO1xufTtcblxuLyoqXG4gKiBUaGlzIGNvbXBvbmVudCBjb250YWlucyB0aGUgZW50aXJlIHZpZXcgaW4gd2hpY2ggdGhlIHVzZXIgaW5wdXRzIHRoZWlyXG4gKiBjb25uZWN0aW9uIGluZm9ybWF0aW9uIHdoZW4gY29ubmVjdGluZyB0byBhIHJlbW90ZSBwcm9qZWN0LlxuICogVGhpcyB2aWV3IGNvbnRhaW5zIHRoZSBDb25uZWN0aW9uRGV0YWlsc0Zvcm0gb24gdGhlIGxlZnQgc2lkZSwgYW5kIGFcbiAqIE51Y2xpZGVMaXN0U2VsZWN0b3Igb24gdGhlIHJpZ2h0IHNpZGUgdGhhdCBkaXNwbGF5cyAwIG9yIG1vcmUgY29ubmVjdGlvblxuICogJ3Byb2ZpbGVzJy4gQ2xpY2tpbmcgb24gYSAncHJvZmlsZScgaW4gdGhlIE51Y2xpZGVMaXN0U2VsZWN0b3IgYXV0by1maWxsc1xuICogdGhlIGZvcm0gd2l0aCB0aGUgaW5mb3JtYXRpb24gYXNzb2NpYXRlZCB3aXRoIHRoYXQgcHJvZmlsZS5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29ubmVjdGlvbkRldGFpbHNQcm9tcHQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8dm9pZCwgUHJvcHMsIHZvaWQ+IHtcbiAgcHJvcHM6IFByb3BzO1xuXG4gIF9pZFRvQ29ubmVjdGlvblByb2ZpbGU6ID9NYXA8c3RyaW5nLCBOdWNsaWRlUmVtb3RlQ29ubmVjdGlvblByb2ZpbGU+O1xuICBfYm91bmRPblByb2ZpbGVDbGlja2VkOiAocHJvZmlsZUlkOiBzdHJpbmcpID0+IHZvaWQ7XG4gIF9ib3VuZE9uRGVsZXRlUHJvZmlsZUNsaWNrZWQ6IChwcm9maWxlSWQ6ID9zdHJpbmcpID0+IHZvaWQ7XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IFByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIHRoaXMuX2JvdW5kT25Qcm9maWxlQ2xpY2tlZCA9IHRoaXMuX29uUHJvZmlsZUNsaWNrZWQuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9ib3VuZE9uRGVsZXRlUHJvZmlsZUNsaWNrZWQgPSB0aGlzLl9vbkRlbGV0ZVByb2ZpbGVDbGlja2VkLmJpbmQodGhpcyk7XG4gIH1cblxuICBnZXRGb3JtRmllbGRzKCk6IE51Y2xpZGVSZW1vdGVDb25uZWN0aW9uUGFyYW1zV2l0aFBhc3N3b3JkIHtcbiAgICByZXR1cm4gdGhpcy5yZWZzWydjb25uZWN0aW9uLWRldGFpbHMtZm9ybSddLmdldEZvcm1GaWVsZHMoKTtcbiAgfVxuXG4gIGdldFByZWZpbGxlZENvbm5lY3Rpb25QYXJhbXMoKTogP051Y2xpZGVSZW1vdGVDb25uZWN0aW9uUGFyYW1zIHtcbiAgICAvLyBJZiB0aGVyZSBhcmUgcHJvZmlsZXMsIHByZS1maWxsIHRoZSBmb3JtIHdpdGggdGhlIGluZm9ybWF0aW9uIGZyb20gdGhlXG4gICAgLy8gc3BlY2lmaWVkIHNlbGVjdGVkIHByb2ZpbGUuXG4gICAgaWYgKHRoaXMucHJvcHMuY29ubmVjdGlvblByb2ZpbGVzICYmXG4gICAgICAgIHRoaXMucHJvcHMuY29ubmVjdGlvblByb2ZpbGVzLmxlbmd0aCAmJlxuICAgICAgICB0aGlzLnByb3BzLmluZGV4T2ZTZWxlY3RlZENvbm5lY3Rpb25Qcm9maWxlICE9IG51bGwpIHtcbiAgICAgIGxldCBpbmRleFRvU2VsZWN0ID0gdGhpcy5wcm9wcy5pbmRleE9mU2VsZWN0ZWRDb25uZWN0aW9uUHJvZmlsZTtcbiAgICAgIGlmIChpbmRleFRvU2VsZWN0ID49IHRoaXMucHJvcHMuY29ubmVjdGlvblByb2ZpbGVzLmxlbmd0aCkge1xuICAgICAgICAvLyBUaGlzIGxvZ2ljIHByb3RlY3RzIHVzIGZyb20gaW5jb3JyZWN0IGluZGljZXMgcGFzc2VkIGZyb20gYWJvdmUsIGFuZFxuICAgICAgICAvLyBhbGxvd3MgdXMgdG8gcGFzc2l2ZWx5IGFjY291bnQgZm9yIHByb2ZpbGVzIGJlaW5nIGRlbGV0ZWQuXG4gICAgICAgIGluZGV4VG9TZWxlY3QgPSB0aGlzLnByb3BzLmNvbm5lY3Rpb25Qcm9maWxlcy5sZW5ndGggLSAxO1xuICAgICAgfVxuICAgICAgY29uc3Qgc2VsZWN0ZWRQcm9maWxlID0gdGhpcy5wcm9wcy5jb25uZWN0aW9uUHJvZmlsZXNbaW5kZXhUb1NlbGVjdF07XG4gICAgICByZXR1cm4gc2VsZWN0ZWRQcm9maWxlLnBhcmFtcztcbiAgICB9XG4gIH1cblxuICBjb21wb25lbnREaWRVcGRhdGUoKSB7XG4gICAgLy8gV2UgaGF2ZSB0byBtYW51YWxseSB1cGRhdGUgdGhlIGNvbnRlbnRzIG9mIGFuIGV4aXN0aW5nIENvbm5lY3Rpb25EZXRhaWxzRm9ybSxcbiAgICAvLyBiZWNhdXNlIGl0IGNvbnRhaW5zIEF0b21JbnB1dCBjb21wb25lbnRzICh3aGljaCBkb24ndCB1cGRhdGUgdGhlaXIgY29udGVudHNcbiAgICAvLyB3aGVuIHRoZWlyIHByb3BzIGNoYW5nZSkuXG4gICAgY29uc3QgZXhpc3RpbmdDb25uZWN0aW9uRGV0YWlsc0Zvcm0gPSB0aGlzLnJlZnNbJ2Nvbm5lY3Rpb24tZGV0YWlscy1mb3JtJ107XG4gICAgaWYgKGV4aXN0aW5nQ29ubmVjdGlvbkRldGFpbHNGb3JtKSB7XG4gICAgICBleGlzdGluZ0Nvbm5lY3Rpb25EZXRhaWxzRm9ybS5zZXRGb3JtRmllbGRzKHRoaXMuZ2V0UHJlZmlsbGVkQ29ubmVjdGlvblBhcmFtcygpKTtcbiAgICAgIGV4aXN0aW5nQ29ubmVjdGlvbkRldGFpbHNGb3JtLmNsZWFyUGFzc3dvcmQoKTtcbiAgICB9XG4gIH1cblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICAvLyBJZiB0aGVyZSBhcmUgcHJvZmlsZXMsIHByZS1maWxsIHRoZSBmb3JtIHdpdGggdGhlIGluZm9ybWF0aW9uIGZyb20gdGhlXG4gICAgLy8gc3BlY2lmaWVkIHNlbGVjdGVkIHByb2ZpbGUuXG4gICAgY29uc3QgcHJlZmlsbGVkQ29ubmVjdGlvblBhcmFtcyA9IHRoaXMuZ2V0UHJlZmlsbGVkQ29ubmVjdGlvblBhcmFtcygpIHx8IHt9O1xuXG4gICAgLy8gQ3JlYXRlIGhlbHBlciBkYXRhIHN0cnVjdHVyZXMuXG4gICAgbGV0IGxpc3RTZWxlY3Rvckl0ZW1zO1xuICAgIGlmICh0aGlzLnByb3BzLmNvbm5lY3Rpb25Qcm9maWxlcykge1xuICAgICAgbGlzdFNlbGVjdG9ySXRlbXMgPSB0aGlzLnByb3BzLmNvbm5lY3Rpb25Qcm9maWxlcy5tYXAoKHByb2ZpbGUsIGluZGV4KSA9PiB7XG4gICAgICAgIC8vIFVzZSB0aGUgaW5kZXggb2YgZWFjaCBwcm9maWxlIGFzIGl0cyBpZC4gVGhpcyBpcyBzYWZlIGJlY2F1c2UgdGhlXG4gICAgICAgIC8vIGl0ZW1zIGFyZSBpbW11dGFibGUgKHdpdGhpbiB0aGlzIFJlYWN0IGNvbXBvbmVudCkuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgZGVsZXRhYmxlOiBwcm9maWxlLmRlbGV0YWJsZSxcbiAgICAgICAgICBkaXNwbGF5VGl0bGU6IHByb2ZpbGUuZGlzcGxheVRpdGxlLFxuICAgICAgICAgIGlkOiBTdHJpbmcoaW5kZXgpLFxuICAgICAgICB9O1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxpc3RTZWxlY3Rvckl0ZW1zID0gW107XG4gICAgfVxuXG4gICAgY29uc3QgaWRPZlNlbGVjdGVkSXRlbSA9ICh0aGlzLnByb3BzLmluZGV4T2ZTZWxlY3RlZENvbm5lY3Rpb25Qcm9maWxlID09IG51bGwpXG4gICAgICA/IG51bGxcbiAgICAgIDogU3RyaW5nKHRoaXMucHJvcHMuaW5kZXhPZlNlbGVjdGVkQ29ubmVjdGlvblByb2ZpbGUpO1xuXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS1jb25uZWN0aW9uLWRldGFpbHMtcHJvbXB0IGNvbnRhaW5lci1mbHVpZFwiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInJvd1wiIHN0eWxlPXt7ZGlzcGxheTogJ2ZsZXgnfX0+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjb25uZWN0aW9uLXByb2ZpbGVzIGNvbC14cy0zIGluc2V0LXBhbmVsXCI+XG4gICAgICAgICAgICA8aDY+UHJvZmlsZXM8L2g2PlxuICAgICAgICAgICAgPE11dGFibGVMaXN0U2VsZWN0b3JcbiAgICAgICAgICAgICAgaXRlbXM9e2xpc3RTZWxlY3Rvckl0ZW1zfVxuICAgICAgICAgICAgICBpZE9mU2VsZWN0ZWRJdGVtPXtpZE9mU2VsZWN0ZWRJdGVtfVxuICAgICAgICAgICAgICBvbkl0ZW1DbGlja2VkPXt0aGlzLl9ib3VuZE9uUHJvZmlsZUNsaWNrZWR9XG4gICAgICAgICAgICAgIG9uQWRkQnV0dG9uQ2xpY2tlZD17dGhpcy5wcm9wcy5vbkFkZFByb2ZpbGVDbGlja2VkfVxuICAgICAgICAgICAgICBvbkRlbGV0ZUJ1dHRvbkNsaWNrZWQ9e3RoaXMuX2JvdW5kT25EZWxldGVQcm9maWxlQ2xpY2tlZH1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjb25uZWN0aW9uLWRldGFpbHMtZm9ybSBjb2wteHMtOVwiPlxuICAgICAgICAgICAgPENvbm5lY3Rpb25EZXRhaWxzRm9ybVxuICAgICAgICAgICAgICByZWY9XCJjb25uZWN0aW9uLWRldGFpbHMtZm9ybVwiXG4gICAgICAgICAgICAgIGluaXRpYWxVc2VybmFtZT17cHJlZmlsbGVkQ29ubmVjdGlvblBhcmFtcy51c2VybmFtZX1cbiAgICAgICAgICAgICAgaW5pdGlhbFNlcnZlcj17cHJlZmlsbGVkQ29ubmVjdGlvblBhcmFtcy5zZXJ2ZXJ9XG4gICAgICAgICAgICAgIGluaXRpYWxSZW1vdGVTZXJ2ZXJDb21tYW5kPXtwcmVmaWxsZWRDb25uZWN0aW9uUGFyYW1zLnJlbW90ZVNlcnZlckNvbW1hbmR9XG4gICAgICAgICAgICAgIGluaXRpYWxDd2Q9e3ByZWZpbGxlZENvbm5lY3Rpb25QYXJhbXMuY3dkfVxuICAgICAgICAgICAgICBpbml0aWFsU3NoUG9ydD17cHJlZmlsbGVkQ29ubmVjdGlvblBhcmFtcy5zc2hQb3J0fVxuICAgICAgICAgICAgICBpbml0aWFsUGF0aFRvUHJpdmF0ZUtleT17cHJlZmlsbGVkQ29ubmVjdGlvblBhcmFtcy5wYXRoVG9Qcml2YXRlS2V5fVxuICAgICAgICAgICAgICBpbml0aWFsQXV0aE1ldGhvZD17cHJlZmlsbGVkQ29ubmVjdGlvblBhcmFtcy5hdXRoTWV0aG9kfVxuICAgICAgICAgICAgICBvbkNvbmZpcm09e3RoaXMucHJvcHMub25Db25maXJtfVxuICAgICAgICAgICAgICBvbkNhbmNlbD17dGhpcy5wcm9wcy5vbkNhbmNlbH1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIF9vblByb2ZpbGVDbGlja2VkKHByb2ZpbGVJZDogc3RyaW5nKTogdm9pZCB7XG4gICAgLy8gVGhlIGlkIG9mIGEgcHJvZmlsZSBpcyBpdHMgaW5kZXggaW4gdGhlIGxpc3Qgb2YgcHJvcHMuXG4gICAgdGhpcy5wcm9wcy5vblByb2ZpbGVDbGlja2VkKHBhcnNlSW50KHByb2ZpbGVJZCwgMTApKTtcbiAgfVxuXG4gIF9vbkRlbGV0ZVByb2ZpbGVDbGlja2VkKHByb2ZpbGVJZDogP3N0cmluZyk6IHZvaWQge1xuICAgIGlmIChwcm9maWxlSWQgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvLyBUaGUgaWQgb2YgYSBwcm9maWxlIGlzIGl0cyBpbmRleCBpbiB0aGUgbGlzdCBvZiBwcm9wcy5cbiAgICB0aGlzLnByb3BzLm9uRGVsZXRlUHJvZmlsZUNsaWNrZWQocGFyc2VJbnQocHJvZmlsZUlkLCAxMCkpO1xuICB9XG59XG4iXX0=