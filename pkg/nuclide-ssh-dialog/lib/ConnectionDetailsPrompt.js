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

var _nuclideUiLibNuclideMutableListSelector = require('../../nuclide-ui/lib/NuclideMutableListSelector');

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
            _reactForAtom.React.createElement(_nuclideUiLibNuclideMutableListSelector.NuclideMutableListSelector, {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNvbm5lY3Rpb25EZXRhaWxzUHJvbXB0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7cUNBV2tDLHlCQUF5Qjs7OztzREFDbEIsaURBQWlEOzs0QkFDdEUsZ0JBQWdCOzs7Ozs7Ozs7OztJQXNDZix1QkFBdUI7WUFBdkIsdUJBQXVCOztBQU8vQixXQVBRLHVCQUF1QixDQU85QixLQUFZLEVBQUU7MEJBUFAsdUJBQXVCOztBQVF4QywrQkFSaUIsdUJBQXVCLDZDQVFsQyxLQUFLLEVBQUU7QUFDYixRQUFJLENBQUMsc0JBQXNCLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoRSxRQUFJLENBQUMsNEJBQTRCLEdBQUcsSUFBSSxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUM3RTs7ZUFYa0IsdUJBQXVCOztXQWE3Qix5QkFBOEM7QUFDekQsYUFBTyxJQUFJLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLENBQUMsYUFBYSxFQUFFLENBQUM7S0FDN0Q7OztXQUUyQix3Q0FBbUM7OztBQUc3RCxVQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsa0JBQWtCLElBQzdCLElBQUksQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsTUFBTSxJQUNwQyxJQUFJLENBQUMsS0FBSyxDQUFDLGdDQUFnQyxJQUFJLElBQUksRUFBRTtBQUN2RCxZQUFJLGFBQWEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGdDQUFnQyxDQUFDO0FBQ2hFLFlBQUksYUFBYSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsTUFBTSxFQUFFOzs7QUFHekQsdUJBQWEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7U0FDMUQ7QUFDRCxZQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGtC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Q3JCLGVBQU87T0FDUjs7QUFFRCxVQUFJLENBQUMsS0FBSyxDQUFDLHNCQUFzQixDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztLQUM1RDs7O1NBakhrQix1QkFBdUI7R0FBUyxvQkFBTSxTQUFTOztxQkFBL0MsdUJBQXVCIiwiZmlsZSI6IkNvbm5lY3Rpb25EZXRhaWxzUHJvbXB0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IENvbm5lY3Rpb25EZXRhaWxzRm9ybSBmcm9tICcuL0Nvbm5lY3Rpb25EZXRhaWxzRm9ybSc7XG5pbXBvcnQge051Y2xpZGVNdXRhYmxlTGlzdFNlbGVjdG9yfSBmcm9tICcuLi8uLi9udWNsaWRlLXVpL2xpYi9OdWNsaWRlTXV0YWJsZUxpc3RTZWxlY3Rvcic7XG5pbXBvcnQge1JlYWN0fSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5cbmltcG9ydCB0eXBlIHtcbiAgTnVjbGlkZVJlbW90ZUNvbm5lY3Rpb25QYXJhbXMsXG4gIE51Y2xpZGVSZW1vdGVDb25uZWN0aW9uUGFyYW1zV2l0aFBhc3N3b3JkLFxuICBOdWNsaWRlUmVtb3RlQ29ubmVjdGlvblByb2ZpbGUsXG59IGZyb20gJy4vY29ubmVjdGlvbi10eXBlcyc7XG5cbnR5cGUgUHJvcHMgPSB7XG4gIC8vIFRoZSBpbml0aWFsIGxpc3Qgb2YgY29ubmVjdGlvbiBwcm9maWxlcyB0aGF0IHdpbGwgYmUgZGlzcGxheWVkLlxuICAvLyBXaGVuZXZlciBhIHVzZXIgYWRkL3JlbW92ZXMgcHJvZmlsZXMgdmlhIHRoZSBjaGlsZCBOdWNsaWRlTGlzdFNlbGVjdG9yLFxuICAvLyB0aGVzZSBwcm9wcyBzaG91bGQgYmUgdXBkYXRlZCBmcm9tIHRoZSB0b3AtbGV2ZWwgYnkgY2FsbGluZyBSZWFjdERPTS5yZW5kZXIoKVxuICAvLyBhZ2FpbiAod2l0aCB0aGUgbmV3IHByb3BzKSBvbiB0aGUgQ29ubmVjdGlvbkRldGFpbHNQcm9tcHQuXG4gIGNvbm5lY3Rpb25Qcm9maWxlczogP0FycmF5PE51Y2xpZGVSZW1vdGVDb25uZWN0aW9uUHJvZmlsZT47XG4gIC8vIElmIHRoZXJlIGlzID49IDEgY29ubmVjdGlvbiBwcm9maWxlLCB0aGlzIGluZGV4IGluZGljYXRlcyB0aGUgcHJvZmlsZSB0byB1c2UuXG4gIGluZGV4T2ZTZWxlY3RlZENvbm5lY3Rpb25Qcm9maWxlOiA/bnVtYmVyO1xuICAvLyBGdW5jdGlvbiB0byBjYWxsIHdoZW4gJ2VudGVyJy8nY29uZmlybScgaXMgc2VsZWN0ZWQgYnkgdGhlIHVzZXIgaW4gdGhpcyB2aWV3LlxuICBvbkNvbmZpcm06ICgpID0+IG1peGVkO1xuICAvLyBGdW5jdGlvbiB0byBjYWxsIHdoZW4gJ2NhbmNlbCcgaXMgc2VsZWN0ZWQgYnkgdGhlIHVzZXIgaW4gdGhpcyB2aWV3LlxuICBvbkNhbmNlbDogKCkgPT4gbWl4ZWQ7XG4gIC8vIEZ1bmN0aW9uIHRoYXQgaXMgY2FsbGVkIHdoZW4gdGhlIFwiK1wiIGJ1dHRvbiBvbiB0aGUgcHJvZmlsZXMgbGlzdCBpcyBjbGlja2VkLlxuICAvLyBUaGUgdXNlcidzIGludGVudCBpcyB0byBjcmVhdGUgYSBuZXcgcHJvZmlsZS5cbiAgb25BZGRQcm9maWxlQ2xpY2tlZDogKCkgPT4gbWl4ZWQ7XG4gIC8vIEZ1bmN0aW9uIHRoYXQgaXMgY2FsbGVkIHdoZW4gdGhlIFwiLVwiIGJ1dHRvbiBvbiB0aGUgcHJvZmlsZXMgbGlzdCBpcyBjbGlja2VkXG4gIC8vICoqIHdoaWxlIGEgcHJvZmlsZSBpcyBzZWxlY3RlZCAqKi5cbiAgLy8gVGhlIHVzZXIncyBpbnRlbnQgaXMgdG8gZGVsZXRlIHRoZSBjdXJyZW50bHktc2VsZWN0ZWQgcHJvZmlsZS5cbiAgb25EZWxldGVQcm9maWxlQ2xpY2tlZDogKGluZGV4T2ZTZWxlY3RlZENvbm5lY3Rpb25Qcm9maWxlOiBudW1iZXIpID0+IG1peGVkO1xuICBvblByb2ZpbGVDbGlja2VkOiAoaW5kZXhPZlNlbGVjdGVkQ29ubmVjdGlvblByb2ZpbGU6IG51bWJlcikgPT4gbWl4ZWQ7XG59O1xuXG4vKipcbiAqIFRoaXMgY29tcG9uZW50IGNvbnRhaW5zIHRoZSBlbnRpcmUgdmlldyBpbiB3aGljaCB0aGUgdXNlciBpbnB1dHMgdGhlaXJcbiAqIGNvbm5lY3Rpb24gaW5mb3JtYXRpb24gd2hlbiBjb25uZWN0aW5nIHRvIGEgcmVtb3RlIHByb2plY3QuXG4gKiBUaGlzIHZpZXcgY29udGFpbnMgdGhlIENvbm5lY3Rpb25EZXRhaWxzRm9ybSBvbiB0aGUgbGVmdCBzaWRlLCBhbmQgYVxuICogTnVjbGlkZUxpc3RTZWxlY3RvciBvbiB0aGUgcmlnaHQgc2lkZSB0aGF0IGRpc3BsYXlzIDAgb3IgbW9yZSBjb25uZWN0aW9uXG4gKiAncHJvZmlsZXMnLiBDbGlja2luZyBvbiBhICdwcm9maWxlJyBpbiB0aGUgTnVjbGlkZUxpc3RTZWxlY3RvciBhdXRvLWZpbGxzXG4gKiB0aGUgZm9ybSB3aXRoIHRoZSBpbmZvcm1hdGlvbiBhc3NvY2lhdGVkIHdpdGggdGhhdCBwcm9maWxlLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb25uZWN0aW9uRGV0YWlsc1Byb21wdCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDx2b2lkLCBQcm9wcywgdm9pZD4ge1xuICBwcm9wczogUHJvcHM7XG5cbiAgX2lkVG9Db25uZWN0aW9uUHJvZmlsZTogP01hcDxzdHJpbmcsIE51Y2xpZGVSZW1vdGVDb25uZWN0aW9uUHJvZmlsZT47XG4gIF9ib3VuZE9uUHJvZmlsZUNsaWNrZWQ6IChwcm9maWxlSWQ6IHN0cmluZykgPT4gdm9pZDtcbiAgX2JvdW5kT25EZWxldGVQcm9maWxlQ2xpY2tlZDogKHByb2ZpbGVJZDogP3N0cmluZykgPT4gdm9pZDtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogUHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgdGhpcy5fYm91bmRPblByb2ZpbGVDbGlja2VkID0gdGhpcy5fb25Qcm9maWxlQ2xpY2tlZC5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX2JvdW5kT25EZWxldGVQcm9maWxlQ2xpY2tlZCA9IHRoaXMuX29uRGVsZXRlUHJvZmlsZUNsaWNrZWQuYmluZCh0aGlzKTtcbiAgfVxuXG4gIGdldEZvcm1GaWVsZHMoKTogTnVjbGlkZVJlbW90ZUNvbm5lY3Rpb25QYXJhbXNXaXRoUGFzc3dvcmQge1xuICAgIHJldHVybiB0aGlzLnJlZnNbJ2Nvbm5lY3Rpb24tZGV0YWlscy1mb3JtJ10uZ2V0Rm9ybUZpZWxkcygpO1xuICB9XG5cbiAgZ2V0UHJlZmlsbGVkQ29ubmVjdGlvblBhcmFtcygpOiA/TnVjbGlkZVJlbW90ZUNvbm5lY3Rpb25QYXJhbXMge1xuICAgIC8vIElmIHRoZXJlIGFyZSBwcm9maWxlcywgcHJlLWZpbGwgdGhlIGZvcm0gd2l0aCB0aGUgaW5mb3JtYXRpb24gZnJvbSB0aGVcbiAgICAvLyBzcGVjaWZpZWQgc2VsZWN0ZWQgcHJvZmlsZS5cbiAgICBpZiAodGhpcy5wcm9wcy5jb25uZWN0aW9uUHJvZmlsZXMgJiZcbiAgICAgICAgdGhpcy5wcm9wcy5jb25uZWN0aW9uUHJvZmlsZXMubGVuZ3RoICYmXG4gICAgICAgIHRoaXMucHJvcHMuaW5kZXhPZlNlbGVjdGVkQ29ubmVjdGlvblByb2ZpbGUgIT0gbnVsbCkge1xuICAgICAgbGV0IGluZGV4VG9TZWxlY3QgPSB0aGlzLnByb3BzLmluZGV4T2ZTZWxlY3RlZENvbm5lY3Rpb25Qcm9maWxlO1xuICAgICAgaWYgKGluZGV4VG9TZWxlY3QgPj0gdGhpcy5wcm9wcy5jb25uZWN0aW9uUHJvZmlsZXMubGVuZ3RoKSB7XG4gICAgICAgIC8vIFRoaXMgbG9naWMgcHJvdGVjdHMgdXMgZnJvbSBpbmNvcnJlY3QgaW5kaWNlcyBwYXNzZWQgZnJvbSBhYm92ZSwgYW5kXG4gICAgICAgIC8vIGFsbG93cyB1cyB0byBwYXNzaXZlbHkgYWNjb3VudCBmb3IgcHJvZmlsZXMgYmVpbmcgZGVsZXRlZC5cbiAgICAgICAgaW5kZXhUb1NlbGVjdCA9IHRoaXMucHJvcHMuY29ubmVjdGlvblByb2ZpbGVzLmxlbmd0aCAtIDE7XG4gICAgICB9XG4gICAgICBjb25zdCBzZWxlY3RlZFByb2ZpbGUgPSB0aGlzLnByb3BzLmNvbm5lY3Rpb25Qcm9maWxlc1tpbmRleFRvU2VsZWN0XTtcbiAgICAgIHJldHVybiBzZWxlY3RlZFByb2ZpbGUucGFyYW1zO1xuICAgIH1cbiAgfVxuXG4gIGNvbXBvbmVudERpZFVwZGF0ZSgpIHtcbiAgICAvLyBXZSBoYXZlIHRvIG1hbnVhbGx5IHVwZGF0ZSB0aGUgY29udGVudHMgb2YgYW4gZXhpc3RpbmcgQ29ubmVjdGlvbkRldGFpbHNGb3JtLFxuICAgIC8vIGJlY2F1c2UgaXQgY29udGFpbnMgQXRvbUlucHV0IGNvbXBvbmVudHMgKHdoaWNoIGRvbid0IHVwZGF0ZSB0aGVpciBjb250ZW50c1xuICAgIC8vIHdoZW4gdGhlaXIgcHJvcHMgY2hhbmdlKS5cbiAgICBjb25zdCBleGlzdGluZ0Nvbm5lY3Rpb25EZXRhaWxzRm9ybSA9IHRoaXMucmVmc1snY29ubmVjdGlvbi1kZXRhaWxzLWZvcm0nXTtcbiAgICBpZiAoZXhpc3RpbmdDb25uZWN0aW9uRGV0YWlsc0Zvcm0pIHtcbiAgICAgIGV4aXN0aW5nQ29ubmVjdGlvbkRldGFpbHNGb3JtLnNldEZvcm1GaWVsZHModGhpcy5nZXRQcmVmaWxsZWRDb25uZWN0aW9uUGFyYW1zKCkpO1xuICAgICAgZXhpc3RpbmdDb25uZWN0aW9uRGV0YWlsc0Zvcm0uY2xlYXJQYXNzd29yZCgpO1xuICAgIH1cbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIC8vIElmIHRoZXJlIGFyZSBwcm9maWxlcywgcHJlLWZpbGwgdGhlIGZvcm0gd2l0aCB0aGUgaW5mb3JtYXRpb24gZnJvbSB0aGVcbiAgICAvLyBzcGVjaWZpZWQgc2VsZWN0ZWQgcHJvZmlsZS5cbiAgICBjb25zdCBwcmVmaWxsZWRDb25uZWN0aW9uUGFyYW1zID0gdGhpcy5nZXRQcmVmaWxsZWRDb25uZWN0aW9uUGFyYW1zKCkgfHwge307XG5cbiAgICAvLyBDcmVhdGUgaGVscGVyIGRhdGEgc3RydWN0dXJlcy5cbiAgICBsZXQgbGlzdFNlbGVjdG9ySXRlbXM7XG4gICAgaWYgKHRoaXMucHJvcHMuY29ubmVjdGlvblByb2ZpbGVzKSB7XG4gICAgICBsaXN0U2VsZWN0b3JJdGVtcyA9IHRoaXMucHJvcHMuY29ubmVjdGlvblByb2ZpbGVzLm1hcCgocHJvZmlsZSwgaW5kZXgpID0+IHtcbiAgICAgICAgLy8gVXNlIHRoZSBpbmRleCBvZiBlYWNoIHByb2ZpbGUgYXMgaXRzIGlkLiBUaGlzIGlzIHNhZmUgYmVjYXVzZSB0aGVcbiAgICAgICAgLy8gaXRlbXMgYXJlIGltbXV0YWJsZSAod2l0aGluIHRoaXMgUmVhY3QgY29tcG9uZW50KS5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBkZWxldGFibGU6IHByb2ZpbGUuZGVsZXRhYmxlLFxuICAgICAgICAgIGRpc3BsYXlUaXRsZTogcHJvZmlsZS5kaXNwbGF5VGl0bGUsXG4gICAgICAgICAgaWQ6IFN0cmluZyhpbmRleCksXG4gICAgICAgIH07XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGlzdFNlbGVjdG9ySXRlbXMgPSBbXTtcbiAgICB9XG5cbiAgICBjb25zdCBpZE9mU2VsZWN0ZWRJdGVtID0gKHRoaXMucHJvcHMuaW5kZXhPZlNlbGVjdGVkQ29ubmVjdGlvblByb2ZpbGUgPT0gbnVsbClcbiAgICAgID8gbnVsbFxuICAgICAgOiBTdHJpbmcodGhpcy5wcm9wcy5pbmRleE9mU2VsZWN0ZWRDb25uZWN0aW9uUHJvZmlsZSk7XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLWNvbm5lY3Rpb24tZGV0YWlscy1wcm9tcHQgY29udGFpbmVyLWZsdWlkXCI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicm93XCIgc3R5bGU9e3tkaXNwbGF5OiAnZmxleCd9fT5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImNvbm5lY3Rpb24tcHJvZmlsZXMgY29sLXhzLTMgaW5zZXQtcGFuZWxcIj5cbiAgICAgICAgICAgIDxoNj5Qcm9maWxlczwvaDY+XG4gICAgICAgICAgICA8TnVjbGlkZU11dGFibGVMaXN0U2VsZWN0b3JcbiAgICAgICAgICAgICAgaXRlbXM9e2xpc3RTZWxlY3Rvckl0ZW1zfVxuICAgICAgICAgICAgICBpZE9mU2VsZWN0ZWRJdGVtPXtpZE9mU2VsZWN0ZWRJdGVtfVxuICAgICAgICAgICAgICBvbkl0ZW1DbGlja2VkPXt0aGlzLl9ib3VuZE9uUHJvZmlsZUNsaWNrZWR9XG4gICAgICAgICAgICAgIG9uQWRkQnV0dG9uQ2xpY2tlZD17dGhpcy5wcm9wcy5vbkFkZFByb2ZpbGVDbGlja2VkfVxuICAgICAgICAgICAgICBvbkRlbGV0ZUJ1dHRvbkNsaWNrZWQ9e3RoaXMuX2JvdW5kT25EZWxldGVQcm9maWxlQ2xpY2tlZH1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjb25uZWN0aW9uLWRldGFpbHMtZm9ybSBjb2wteHMtOVwiPlxuICAgICAgICAgICAgPENvbm5lY3Rpb25EZXRhaWxzRm9ybVxuICAgICAgICAgICAgICByZWY9XCJjb25uZWN0aW9uLWRldGFpbHMtZm9ybVwiXG4gICAgICAgICAgICAgIGluaXRpYWxVc2VybmFtZT17cHJlZmlsbGVkQ29ubmVjdGlvblBhcmFtcy51c2VybmFtZX1cbiAgICAgICAgICAgICAgaW5pdGlhbFNlcnZlcj17cHJlZmlsbGVkQ29ubmVjdGlvblBhcmFtcy5zZXJ2ZXJ9XG4gICAgICAgICAgICAgIGluaXRpYWxSZW1vdGVTZXJ2ZXJDb21tYW5kPXtwcmVmaWxsZWRDb25uZWN0aW9uUGFyYW1zLnJlbW90ZVNlcnZlckNvbW1hbmR9XG4gICAgICAgICAgICAgIGluaXRpYWxDd2Q9e3ByZWZpbGxlZENvbm5lY3Rpb25QYXJhbXMuY3dkfVxuICAgICAgICAgICAgICBpbml0aWFsU3NoUG9ydD17cHJlZmlsbGVkQ29ubmVjdGlvblBhcmFtcy5zc2hQb3J0fVxuICAgICAgICAgICAgICBpbml0aWFsUGF0aFRvUHJpdmF0ZUtleT17cHJlZmlsbGVkQ29ubmVjdGlvblBhcmFtcy5wYXRoVG9Qcml2YXRlS2V5fVxuICAgICAgICAgICAgICBpbml0aWFsQXV0aE1ldGhvZD17cHJlZmlsbGVkQ29ubmVjdGlvblBhcmFtcy5hdXRoTWV0aG9kfVxuICAgICAgICAgICAgICBvbkNvbmZpcm09e3RoaXMucHJvcHMub25Db25maXJtfVxuICAgICAgICAgICAgICBvbkNhbmNlbD17dGhpcy5wcm9wcy5vbkNhbmNlbH1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIF9vblByb2ZpbGVDbGlja2VkKHByb2ZpbGVJZDogc3RyaW5nKTogdm9pZCB7XG4gICAgLy8gVGhlIGlkIG9mIGEgcHJvZmlsZSBpcyBpdHMgaW5kZXggaW4gdGhlIGxpc3Qgb2YgcHJvcHMuXG4gICAgdGhpcy5wcm9wcy5vblByb2ZpbGVDbGlja2VkKHBhcnNlSW50KHByb2ZpbGVJZCwgMTApKTtcbiAgfVxuXG4gIF9vbkRlbGV0ZVByb2ZpbGVDbGlja2VkKHByb2ZpbGVJZDogP3N0cmluZyk6IHZvaWQge1xuICAgIGlmIChwcm9maWxlSWQgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvLyBUaGUgaWQgb2YgYSBwcm9maWxlIGlzIGl0cyBpbmRleCBpbiB0aGUgbGlzdCBvZiBwcm9wcy5cbiAgICB0aGlzLnByb3BzLm9uRGVsZXRlUHJvZmlsZUNsaWNrZWQocGFyc2VJbnQocHJvZmlsZUlkLCAxMCkpO1xuICB9XG59XG4iXX0=