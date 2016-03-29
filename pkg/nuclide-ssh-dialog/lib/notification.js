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

exports.notifySshHandshakeError = notifySshHandshakeError;

var _nuclideRemoteConnection = require('../../nuclide-remote-connection');

function notifySshHandshakeError(errorType, error, config) {
  var message = '';
  var detail = '';
  var originalErrorDetail = 'Original error message:\n ' + error.message;
  switch (errorType) {
    case _nuclideRemoteConnection.SshHandshake.ErrorType.HOST_NOT_FOUND:
      message = 'Can\'t resolve IP address for host ' + config.host + '.';
      detail = 'Trouble shooting:\n' + '  1. Check your network connection.\n' + ('  2. Make sure the hostname ' + config.host + ' is valid.\n');
      break;
    case _nuclideRemoteConnection.SshHandshake.ErrorType.CANT_READ_PRIVATE_KEY:
      message = 'Can\'t read content of private key path ' + config.pathToPrivateKey + '.';
      detail = 'Make sure the private key path is properly configured.';
      break;
    case _nuclideRemoteConnection.SshHandshake.ErrorType.SSH_CONNECT_TIMEOUT:
      message = 'Timeout while connecting to ' + config.host + '.';
      detail = 'Trouble shooting:\n' + '  1. Check your network connection.\n' + '  2. Input correct 2Fac passcode when prompted.';
      break;
    case _nuclideRemoteConnection.SshHandshake.ErrorType.SSH_CONNECT_FAILED:
      message = 'Failed to connect to ' + config.host + ':' + config.sshPort + '.';
      detail = 'Trouble shooting:\n' + '  1. Check your network connection.\n' + ('  2. Make sure the host ' + config.host + ' is running and has') + (' ssh server running on ' + config.sshPort + '.\n\n') + originalErrorDetail;
      break;
    case _nuclideRemoteConnection.SshHandshake.ErrorType.SSH_AUTHENTICATION:
      message = 'Authentication failed';
      detail = 'Make sure your password or private key is properly configured.';
      break;
    case _nuclideRemoteConnection.SshHandshake.ErrorType.DIRECTORY_NOT_FOUND:
      message = 'There is no such directory ' + config.cwd + ' on ' + config.host + '.';
      detail = 'Make sure ' + config.cwd + ' exists on ' + config.host + '.';
      break;
    case _nuclideRemoteConnection.SshHandshake.ErrorType.SERVER_START_FAILED:
      message = 'Failed to start nuclide-server on ' + config.host + ' using  ' + ('' + config.remoteServerCommand);
      detail = 'Trouble shooting: \n' + ('  1. Make sure the command "' + config.remoteServerCommand + '" is correct.\n') + '  2. The server might take longer to start up than expected, try to connect again.\n' + ('  3. If none of above works, ssh to ' + config.host + ' and kill existing nuclide-server') + ' by running "killall node", and reconnect.';
      break;
    case _nuclideRemoteConnection.SshHandshake.ErrorType.SERVER_VERSION_MISMATCH:
      message = 'Server version is different than client version';
      detail = originalErrorDetail;
      break;
    default:
      message = 'Unexpected error occurred: ' + error.message + '.';
      detail = originalErrorDetail;
  }
  atom.notifications.addError(message, { detail: detail, dismissable: true });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vdGlmaWNhdGlvbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozt1Q0FnQjJCLGlDQUFpQzs7QUFFckQsU0FBUyx1QkFBdUIsQ0FDckMsU0FBZ0MsRUFDaEMsS0FBWSxFQUNaLE1BQWtDLEVBQzVCO0FBQ04sTUFBSSxPQUFPLEdBQUcsRUFBRSxDQUFDO0FBQ2pCLE1BQUksTUFBTSxHQUFHLEVBQUUsQ0FBQztBQUNoQixNQUFNLG1CQUFtQixrQ0FBZ0MsS0FBSyxDQUFDLE9BQU8sQUFBRSxDQUFDO0FBQ3pFLFVBQVEsU0FBUztBQUNmLFNBQUssc0NBQWEsU0FBUyxDQUFDLGNBQWM7QUFDeEMsYUFBTywyQ0FBd0MsTUFBTSxDQUFDLElBQUksTUFBRyxDQUFDO0FBQzlELFlBQU0sR0FBRyxxQkFBcUIsR0FDNUIsdUNBQXVDLHFDQUNSLE1BQU0sQ0FBQyxJQUFJLGtCQUFjLENBQUM7QUFDM0QsWUFBTTtBQUFBLEFBQ1IsU0FBSyxzQ0FBYSxTQUFTLENBQUMscUJBQXFCO0FBQy9DLGFBQU8sZ0RBQTZDLE1BQU0sQ0FBQyxnQkFBZ0IsTUFBRyxDQUFDO0FBQy9FLFlBQU0sR0FBRyx3REFBd0QsQ0FBQztBQUNsRSxZQUFNO0FBQUEsQUFDUixTQUFLLHNDQUFhLFNBQVMsQ0FBQyxtQkFBbUI7QUFDN0MsYUFBTyxvQ0FBa0MsTUFBTSxDQUFDLElBQUksTUFBRyxDQUFDO0FBQ3hELFlBQU0sR0FBRyxxQkFBcUIsR0FDNUIsdUNBQXVDLEdBQ3ZDLGlEQUFpRCxDQUFDO0FBQ3BELFlBQU07QUFBQSxBQUNSLFNBQUssc0NBQWEsU0FBUyxDQUFDLGtCQUFrQjtBQUM1QyxhQUFPLDZCQUEyQixNQUFNLENBQUMsSUFBSSxTQUFJLE1BQU0sQ0FBQyxPQUFPLE1BQUcsQ0FBQztBQUNuRSxZQUFNLEdBQUcscUJBQXFCLEdBQzVCLHVDQUF1QyxpQ0FDWixNQUFNLENBQUMsSUFBSSx5QkFBcUIsZ0NBQy9CLE1BQU0sQ0FBQyxPQUFPLFdBQU8sR0FDakQsbUJBQW1CLENBQUM7QUFDdEIsWUFBTTtBQUFBLEFBQ1IsU0FBSyxzQ0FBYSxTQUFTLENBQUMsa0JBQWtCO0FBQzVDLGFBQU8sMEJBQTBCLENBQUM7QUFDbEMsWUFBTSxHQUFHLGdFQUFnRSxDQUFDO0FBQzFFLFlBQU07QUFBQSxBQUNSLFNBQUssc0NBQWEsU0FBUyxDQUFDLG1CQUFtQjtBQUM3QyxhQUFPLG1DQUFpQyxNQUFNLENBQUMsR0FBRyxZQUFPLE1BQU0sQ0FBQyxJQUFJLE1BQUcsQ0FBQztBQUN4RSxZQUFNLGtCQUFnQixNQUFNLENBQUMsR0FBRyxtQkFBYyxNQUFNLENBQUMsSUFBSSxNQUFHLENBQUM7QUFDN0QsWUFBTTtBQUFBLEFBQ1IsU0FBSyxzQ0FBYSxTQUFTLENBQUMsbUJBQW1CO0FBQzdDLGFBQU8sR0FBRyx1Q0FBcUMsTUFBTSxDQUFDLElBQUksc0JBQ3JELE1BQU0sQ0FBQyxtQkFBbUIsQ0FBRSxDQUFDO0FBQ2xDLFlBQU0sR0FBRyxzQkFBc0IscUNBQ0UsTUFBTSxDQUFDLG1CQUFtQixxQkFBaUIseUZBQ1ksNkNBQy9DLE1BQU0sQ0FBQyxJQUFJLHVDQUFtQywrQ0FDekMsQ0FBQztBQUMvQyxZQUFNO0FBQUEsQUFDUixTQUFLLHNDQUFhLFNBQVMsQ0FBQyx1QkFBdUI7QUFDakQsYUFBTyxHQUFHLGlEQUFpRCxDQUFDO0FBQzVELFlBQU0sR0FBRyxtQkFBbUIsQ0FBQztBQUM3QixZQUFNO0FBQUEsQUFDUjtBQUNFLGFBQU8sbUNBQWlDLEtBQUssQ0FBQyxPQUFPLE1BQUcsQ0FBQztBQUN6RCxZQUFNLEdBQUcsbUJBQW1CLENBQUM7QUFBQSxHQUNoQztBQUNELE1BQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxFQUFDLE1BQU0sRUFBTixNQUFNLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7Q0FDbkUiLCJmaWxlIjoibm90aWZpY2F0aW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge1xuICBTc2hDb25uZWN0aW9uQ29uZmlndXJhdGlvbixcbiAgU3NoSGFuZHNoYWtlRXJyb3JUeXBlLFxufSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS1jb25uZWN0aW9uL2xpYi9Tc2hIYW5kc2hha2UnO1xuXG5pbXBvcnQge1NzaEhhbmRzaGFrZX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1yZW1vdGUtY29ubmVjdGlvbic7XG5cbmV4cG9ydCBmdW5jdGlvbiBub3RpZnlTc2hIYW5kc2hha2VFcnJvcihcbiAgZXJyb3JUeXBlOiBTc2hIYW5kc2hha2VFcnJvclR5cGUsXG4gIGVycm9yOiBFcnJvcixcbiAgY29uZmlnOiBTc2hDb25uZWN0aW9uQ29uZmlndXJhdGlvbixcbik6IHZvaWQge1xuICBsZXQgbWVzc2FnZSA9ICcnO1xuICBsZXQgZGV0YWlsID0gJyc7XG4gIGNvbnN0IG9yaWdpbmFsRXJyb3JEZXRhaWwgPSBgT3JpZ2luYWwgZXJyb3IgbWVzc2FnZTpcXG4gJHtlcnJvci5tZXNzYWdlfWA7XG4gIHN3aXRjaCAoZXJyb3JUeXBlKSB7XG4gICAgY2FzZSBTc2hIYW5kc2hha2UuRXJyb3JUeXBlLkhPU1RfTk9UX0ZPVU5EOlxuICAgICAgbWVzc2FnZSA9IGBDYW4ndCByZXNvbHZlIElQIGFkZHJlc3MgZm9yIGhvc3QgJHtjb25maWcuaG9zdH0uYDtcbiAgICAgIGRldGFpbCA9ICdUcm91YmxlIHNob290aW5nOlxcbicgK1xuICAgICAgICAnICAxLiBDaGVjayB5b3VyIG5ldHdvcmsgY29ubmVjdGlvbi5cXG4nICtcbiAgICAgICAgYCAgMi4gTWFrZSBzdXJlIHRoZSBob3N0bmFtZSAke2NvbmZpZy5ob3N0fSBpcyB2YWxpZC5cXG5gO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBTc2hIYW5kc2hha2UuRXJyb3JUeXBlLkNBTlRfUkVBRF9QUklWQVRFX0tFWTpcbiAgICAgIG1lc3NhZ2UgPSBgQ2FuJ3QgcmVhZCBjb250ZW50IG9mIHByaXZhdGUga2V5IHBhdGggJHtjb25maWcucGF0aFRvUHJpdmF0ZUtleX0uYDtcbiAgICAgIGRldGFpbCA9ICdNYWtlIHN1cmUgdGhlIHByaXZhdGUga2V5IHBhdGggaXMgcHJvcGVybHkgY29uZmlndXJlZC4nO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBTc2hIYW5kc2hha2UuRXJyb3JUeXBlLlNTSF9DT05ORUNUX1RJTUVPVVQ6XG4gICAgICBtZXNzYWdlID0gYFRpbWVvdXQgd2hpbGUgY29ubmVjdGluZyB0byAke2NvbmZpZy5ob3N0fS5gO1xuICAgICAgZGV0YWlsID0gJ1Ryb3VibGUgc2hvb3Rpbmc6XFxuJyArXG4gICAgICAgICcgIDEuIENoZWNrIHlvdXIgbmV0d29yayBjb25uZWN0aW9uLlxcbicgK1xuICAgICAgICAnICAyLiBJbnB1dCBjb3JyZWN0IDJGYWMgcGFzc2NvZGUgd2hlbiBwcm9tcHRlZC4nO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBTc2hIYW5kc2hha2UuRXJyb3JUeXBlLlNTSF9DT05ORUNUX0ZBSUxFRDpcbiAgICAgIG1lc3NhZ2UgPSBgRmFpbGVkIHRvIGNvbm5lY3QgdG8gJHtjb25maWcuaG9zdH06JHtjb25maWcuc3NoUG9ydH0uYDtcbiAgICAgIGRldGFpbCA9ICdUcm91YmxlIHNob290aW5nOlxcbicgK1xuICAgICAgICAnICAxLiBDaGVjayB5b3VyIG5ldHdvcmsgY29ubmVjdGlvbi5cXG4nICtcbiAgICAgICAgYCAgMi4gTWFrZSBzdXJlIHRoZSBob3N0ICR7Y29uZmlnLmhvc3R9IGlzIHJ1bm5pbmcgYW5kIGhhc2AgK1xuICAgICAgICAgIGAgc3NoIHNlcnZlciBydW5uaW5nIG9uICR7Y29uZmlnLnNzaFBvcnR9LlxcblxcbmAgK1xuICAgICAgICBvcmlnaW5hbEVycm9yRGV0YWlsO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBTc2hIYW5kc2hha2UuRXJyb3JUeXBlLlNTSF9BVVRIRU5USUNBVElPTjpcbiAgICAgIG1lc3NhZ2UgPSBgQXV0aGVudGljYXRpb24gZmFpbGVkYDtcbiAgICAgIGRldGFpbCA9ICdNYWtlIHN1cmUgeW91ciBwYXNzd29yZCBvciBwcml2YXRlIGtleSBpcyBwcm9wZXJseSBjb25maWd1cmVkLic7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFNzaEhhbmRzaGFrZS5FcnJvclR5cGUuRElSRUNUT1JZX05PVF9GT1VORDpcbiAgICAgIG1lc3NhZ2UgPSBgVGhlcmUgaXMgbm8gc3VjaCBkaXJlY3RvcnkgJHtjb25maWcuY3dkfSBvbiAke2NvbmZpZy5ob3N0fS5gO1xuICAgICAgZGV0YWlsID0gYE1ha2Ugc3VyZSAke2NvbmZpZy5jd2R9IGV4aXN0cyBvbiAke2NvbmZpZy5ob3N0fS5gO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBTc2hIYW5kc2hha2UuRXJyb3JUeXBlLlNFUlZFUl9TVEFSVF9GQUlMRUQ6XG4gICAgICBtZXNzYWdlID0gYEZhaWxlZCB0byBzdGFydCBudWNsaWRlLXNlcnZlciBvbiAke2NvbmZpZy5ob3N0fSB1c2luZyAgYCArXG4gICAgICAgIGAke2NvbmZpZy5yZW1vdGVTZXJ2ZXJDb21tYW5kfWA7XG4gICAgICBkZXRhaWwgPSAnVHJvdWJsZSBzaG9vdGluZzogXFxuJyArXG4gICAgICAgIGAgIDEuIE1ha2Ugc3VyZSB0aGUgY29tbWFuZCBcIiR7Y29uZmlnLnJlbW90ZVNlcnZlckNvbW1hbmR9XCIgaXMgY29ycmVjdC5cXG5gICtcbiAgICAgICAgYCAgMi4gVGhlIHNlcnZlciBtaWdodCB0YWtlIGxvbmdlciB0byBzdGFydCB1cCB0aGFuIGV4cGVjdGVkLCB0cnkgdG8gY29ubmVjdCBhZ2Fpbi5cXG5gICtcbiAgICAgICAgYCAgMy4gSWYgbm9uZSBvZiBhYm92ZSB3b3Jrcywgc3NoIHRvICR7Y29uZmlnLmhvc3R9IGFuZCBraWxsIGV4aXN0aW5nIG51Y2xpZGUtc2VydmVyYCArXG4gICAgICAgIGAgYnkgcnVubmluZyBcImtpbGxhbGwgbm9kZVwiLCBhbmQgcmVjb25uZWN0LmA7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFNzaEhhbmRzaGFrZS5FcnJvclR5cGUuU0VSVkVSX1ZFUlNJT05fTUlTTUFUQ0g6XG4gICAgICBtZXNzYWdlID0gJ1NlcnZlciB2ZXJzaW9uIGlzIGRpZmZlcmVudCB0aGFuIGNsaWVudCB2ZXJzaW9uJztcbiAgICAgIGRldGFpbCA9IG9yaWdpbmFsRXJyb3JEZXRhaWw7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgbWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIG9jY3VycmVkOiAke2Vycm9yLm1lc3NhZ2V9LmA7XG4gICAgICBkZXRhaWwgPSBvcmlnaW5hbEVycm9yRGV0YWlsO1xuICB9XG4gIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihtZXNzYWdlLCB7ZGV0YWlsLCBkaXNtaXNzYWJsZTogdHJ1ZX0pO1xufVxuIl19