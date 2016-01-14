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

var _remoteConnection = require('../../remote-connection');

function notifySshHandshakeError(errorType, error, config) {
  var message = '';
  var detail = '';
  var originalErrorDetail = 'Original error message:\n ' + error.message;
  switch (errorType) {
    case _remoteConnection.SshHandshake.ErrorType.HOST_NOT_FOUND:
      message = 'Can\'t resolve IP address for host ' + config.host + '.';
      detail = 'Trouble shooting:\n' + '  1. Check your network connection.\n' + ('  2. Make sure the hostname ' + config.host + ' is valid.\n');
      break;
    case _remoteConnection.SshHandshake.ErrorType.CANT_READ_PRIVATE_KEY:
      message = 'Can\'t read content of private key path ' + config.pathToPrivateKey + '.';
      detail = 'Make sure the private key path is properly configured.';
      break;
    case _remoteConnection.SshHandshake.ErrorType.SSH_CONNECT_TIMEOUT:
      message = 'Timeout while connecting to ' + config.host + '.';
      detail = 'Trouble shooting:\n' + '  1. Check your network connection.\n' + '  2. Input correct 2Fac passcode when prompted.';
      break;
    case _remoteConnection.SshHandshake.ErrorType.SSH_CONNECT_FAILED:
      message = 'Failed to connect to ' + config.host + ':' + config.sshPort + '.';
      detail = 'Trouble shooting:\n' + '  1. Check your network connection.\n' + ('  2. Make sure the host ' + config.host + ' is running and has') + (' ssh server running on ' + config.sshPort + '.\n\n') + originalErrorDetail;
      break;
    case _remoteConnection.SshHandshake.ErrorType.SSH_AUTHENTICATION:
      message = 'Authentication failed';
      detail = 'Make sure your password or private key is properly configured.';
      break;
    case _remoteConnection.SshHandshake.ErrorType.DIRECTORY_NOT_FOUND:
      message = 'There is no such directory ' + config.cwd + ' on ' + config.host + '.';
      detail = 'Make sure ' + config.cwd + ' exists on ' + config.host + '.';
      break;
    case _remoteConnection.SshHandshake.ErrorType.SERVER_START_FAILED:
      message = 'Failed to start nuclide-server on ' + config.host + ' using  ' + ('' + config.remoteServerCommand);
      detail = 'Trouble shooting: \n' + ('  1. Make sure the command "' + config.remoteServerCommand + '" is correct.\n') + '  2. The server might take longer to start up than expected, try to connect again.\n' + ('  3. If none of above works, ssh to ' + config.host + ' and kill existing nuclide-server') + ' by running "killall node", and reconnect.';
      break;
    case _remoteConnection.SshHandshake.ErrorType.SERVER_VERSION_MISMATCH:
      message = 'Server version is different than client version';
      detail = originalErrorDetail;
      break;
    default:
      message = 'Unexpected error happend: ' + error.message + '.';
      detail = originalErrorDetail;
  }
  atom.notifications.addError(message, { detail: detail, dismissable: true });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vdGlmaWNhdGlvbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztnQ0FnQjJCLHlCQUF5Qjs7QUFFN0MsU0FBUyx1QkFBdUIsQ0FDckMsU0FBZ0MsRUFDaEMsS0FBWSxFQUNaLE1BQWtDLEVBQzVCO0FBQ04sTUFBSSxPQUFPLEdBQUcsRUFBRSxDQUFDO0FBQ2pCLE1BQUksTUFBTSxHQUFHLEVBQUUsQ0FBQztBQUNoQixNQUFNLG1CQUFtQixrQ0FBZ0MsS0FBSyxDQUFDLE9BQU8sQUFBRSxDQUFDO0FBQ3pFLFVBQVEsU0FBUztBQUNmLFNBQUssK0JBQWEsU0FBUyxDQUFDLGNBQWM7QUFDeEMsYUFBTywyQ0FBd0MsTUFBTSxDQUFDLElBQUksTUFBRyxDQUFDO0FBQzlELFlBQU0sR0FBRyxxQkFBcUIsR0FDNUIsdUNBQXVDLHFDQUNSLE1BQU0sQ0FBQyxJQUFJLGtCQUFjLENBQUM7QUFDM0QsWUFBTTtBQUFBLEFBQ1IsU0FBSywrQkFBYSxTQUFTLENBQUMscUJBQXFCO0FBQy9DLGFBQU8sZ0RBQTZDLE1BQU0sQ0FBQyxnQkFBZ0IsTUFBRyxDQUFDO0FBQy9FLFlBQU0sR0FBRyx3REFBd0QsQ0FBQztBQUNsRSxZQUFNO0FBQUEsQUFDUixTQUFLLCtCQUFhLFNBQVMsQ0FBQyxtQkFBbUI7QUFDN0MsYUFBTyxvQ0FBa0MsTUFBTSxDQUFDLElBQUksTUFBRyxDQUFDO0FBQ3hELFlBQU0sR0FBRyxxQkFBcUIsR0FDNUIsdUNBQXVDLEdBQ3ZDLGlEQUFpRCxDQUFDO0FBQ3BELFlBQU07QUFBQSxBQUNSLFNBQUssK0JBQWEsU0FBUyxDQUFDLGtCQUFrQjtBQUM1QyxhQUFPLDZCQUEyQixNQUFNLENBQUMsSUFBSSxTQUFJLE1BQU0sQ0FBQyxPQUFPLE1BQUcsQ0FBQztBQUNuRSxZQUFNLEdBQUcscUJBQXFCLEdBQzVCLHVDQUF1QyxpQ0FDWixNQUFNLENBQUMsSUFBSSx5QkFBcUIsZ0NBQy9CLE1BQU0sQ0FBQyxPQUFPLFdBQU8sR0FDakQsbUJBQW1CLENBQUM7QUFDdEIsWUFBTTtBQUFBLEFBQ1IsU0FBSywrQkFBYSxTQUFTLENBQUMsa0JBQWtCO0FBQzVDLGFBQU8sMEJBQTBCLENBQUM7QUFDbEMsWUFBTSxHQUFHLGdFQUFnRSxDQUFDO0FBQzFFLFlBQU07QUFBQSxBQUNSLFNBQUssK0JBQWEsU0FBUyxDQUFDLG1CQUFtQjtBQUM3QyxhQUFPLG1DQUFpQyxNQUFNLENBQUMsR0FBRyxZQUFPLE1BQU0sQ0FBQyxJQUFJLE1BQUcsQ0FBQztBQUN4RSxZQUFNLGtCQUFnQixNQUFNLENBQUMsR0FBRyxtQkFBYyxNQUFNLENBQUMsSUFBSSxNQUFHLENBQUM7QUFDN0QsWUFBTTtBQUFBLEFBQ1IsU0FBSywrQkFBYSxTQUFTLENBQUMsbUJBQW1CO0FBQzdDLGFBQU8sR0FBRyx1Q0FBcUMsTUFBTSxDQUFDLElBQUksc0JBQ3JELE1BQU0sQ0FBQyxtQkFBbUIsQ0FBRSxDQUFDO0FBQ2xDLFlBQU0sR0FBRyxzQkFBc0IscUNBQ0UsTUFBTSxDQUFDLG1CQUFtQixxQkFBaUIseUZBQ1ksNkNBQy9DLE1BQU0sQ0FBQyxJQUFJLHVDQUFtQywrQ0FDekMsQ0FBQztBQUMvQyxZQUFNO0FBQUEsQUFDUixTQUFLLCtCQUFhLFNBQVMsQ0FBQyx1QkFBdUI7QUFDakQsYUFBTyxHQUFHLGlEQUFpRCxDQUFDO0FBQzVELFlBQU0sR0FBRyxtQkFBbUIsQ0FBQztBQUM3QixZQUFNO0FBQUEsQUFDUjtBQUNFLGFBQU8sa0NBQWdDLEtBQUssQ0FBQyxPQUFPLE1BQUcsQ0FBQztBQUN4RCxZQUFNLEdBQUcsbUJBQW1CLENBQUM7QUFBQSxHQUNoQztBQUNELE1BQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxFQUFDLE1BQU0sRUFBTixNQUFNLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7Q0FDbkUiLCJmaWxlIjoibm90aWZpY2F0aW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge1xuICBTc2hDb25uZWN0aW9uQ29uZmlndXJhdGlvbixcbiAgU3NoSGFuZHNoYWtlRXJyb3JUeXBlLFxufSBmcm9tICcuLi8uLi9yZW1vdGUtY29ubmVjdGlvbi9saWIvU3NoSGFuZHNoYWtlJztcblxuaW1wb3J0IHtTc2hIYW5kc2hha2V9IGZyb20gJy4uLy4uL3JlbW90ZS1jb25uZWN0aW9uJztcblxuZXhwb3J0IGZ1bmN0aW9uIG5vdGlmeVNzaEhhbmRzaGFrZUVycm9yKFxuICBlcnJvclR5cGU6IFNzaEhhbmRzaGFrZUVycm9yVHlwZSxcbiAgZXJyb3I6IEVycm9yLFxuICBjb25maWc6IFNzaENvbm5lY3Rpb25Db25maWd1cmF0aW9uLFxuKTogdm9pZCB7XG4gIGxldCBtZXNzYWdlID0gJyc7XG4gIGxldCBkZXRhaWwgPSAnJztcbiAgY29uc3Qgb3JpZ2luYWxFcnJvckRldGFpbCA9IGBPcmlnaW5hbCBlcnJvciBtZXNzYWdlOlxcbiAke2Vycm9yLm1lc3NhZ2V9YDtcbiAgc3dpdGNoIChlcnJvclR5cGUpIHtcbiAgICBjYXNlIFNzaEhhbmRzaGFrZS5FcnJvclR5cGUuSE9TVF9OT1RfRk9VTkQ6XG4gICAgICBtZXNzYWdlID0gYENhbid0IHJlc29sdmUgSVAgYWRkcmVzcyBmb3IgaG9zdCAke2NvbmZpZy5ob3N0fS5gO1xuICAgICAgZGV0YWlsID0gJ1Ryb3VibGUgc2hvb3Rpbmc6XFxuJyArXG4gICAgICAgICcgIDEuIENoZWNrIHlvdXIgbmV0d29yayBjb25uZWN0aW9uLlxcbicgK1xuICAgICAgICBgICAyLiBNYWtlIHN1cmUgdGhlIGhvc3RuYW1lICR7Y29uZmlnLmhvc3R9IGlzIHZhbGlkLlxcbmA7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFNzaEhhbmRzaGFrZS5FcnJvclR5cGUuQ0FOVF9SRUFEX1BSSVZBVEVfS0VZOlxuICAgICAgbWVzc2FnZSA9IGBDYW4ndCByZWFkIGNvbnRlbnQgb2YgcHJpdmF0ZSBrZXkgcGF0aCAke2NvbmZpZy5wYXRoVG9Qcml2YXRlS2V5fS5gO1xuICAgICAgZGV0YWlsID0gJ01ha2Ugc3VyZSB0aGUgcHJpdmF0ZSBrZXkgcGF0aCBpcyBwcm9wZXJseSBjb25maWd1cmVkLic7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFNzaEhhbmRzaGFrZS5FcnJvclR5cGUuU1NIX0NPTk5FQ1RfVElNRU9VVDpcbiAgICAgIG1lc3NhZ2UgPSBgVGltZW91dCB3aGlsZSBjb25uZWN0aW5nIHRvICR7Y29uZmlnLmhvc3R9LmA7XG4gICAgICBkZXRhaWwgPSAnVHJvdWJsZSBzaG9vdGluZzpcXG4nICtcbiAgICAgICAgJyAgMS4gQ2hlY2sgeW91ciBuZXR3b3JrIGNvbm5lY3Rpb24uXFxuJyArXG4gICAgICAgICcgIDIuIElucHV0IGNvcnJlY3QgMkZhYyBwYXNzY29kZSB3aGVuIHByb21wdGVkLic7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFNzaEhhbmRzaGFrZS5FcnJvclR5cGUuU1NIX0NPTk5FQ1RfRkFJTEVEOlxuICAgICAgbWVzc2FnZSA9IGBGYWlsZWQgdG8gY29ubmVjdCB0byAke2NvbmZpZy5ob3N0fToke2NvbmZpZy5zc2hQb3J0fS5gO1xuICAgICAgZGV0YWlsID0gJ1Ryb3VibGUgc2hvb3Rpbmc6XFxuJyArXG4gICAgICAgICcgIDEuIENoZWNrIHlvdXIgbmV0d29yayBjb25uZWN0aW9uLlxcbicgK1xuICAgICAgICBgICAyLiBNYWtlIHN1cmUgdGhlIGhvc3QgJHtjb25maWcuaG9zdH0gaXMgcnVubmluZyBhbmQgaGFzYCArXG4gICAgICAgICAgYCBzc2ggc2VydmVyIHJ1bm5pbmcgb24gJHtjb25maWcuc3NoUG9ydH0uXFxuXFxuYCArXG4gICAgICAgIG9yaWdpbmFsRXJyb3JEZXRhaWw7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFNzaEhhbmRzaGFrZS5FcnJvclR5cGUuU1NIX0FVVEhFTlRJQ0FUSU9OOlxuICAgICAgbWVzc2FnZSA9IGBBdXRoZW50aWNhdGlvbiBmYWlsZWRgO1xuICAgICAgZGV0YWlsID0gJ01ha2Ugc3VyZSB5b3VyIHBhc3N3b3JkIG9yIHByaXZhdGUga2V5IGlzIHByb3Blcmx5IGNvbmZpZ3VyZWQuJztcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgU3NoSGFuZHNoYWtlLkVycm9yVHlwZS5ESVJFQ1RPUllfTk9UX0ZPVU5EOlxuICAgICAgbWVzc2FnZSA9IGBUaGVyZSBpcyBubyBzdWNoIGRpcmVjdG9yeSAke2NvbmZpZy5jd2R9IG9uICR7Y29uZmlnLmhvc3R9LmA7XG4gICAgICBkZXRhaWwgPSBgTWFrZSBzdXJlICR7Y29uZmlnLmN3ZH0gZXhpc3RzIG9uICR7Y29uZmlnLmhvc3R9LmA7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFNzaEhhbmRzaGFrZS5FcnJvclR5cGUuU0VSVkVSX1NUQVJUX0ZBSUxFRDpcbiAgICAgIG1lc3NhZ2UgPSBgRmFpbGVkIHRvIHN0YXJ0IG51Y2xpZGUtc2VydmVyIG9uICR7Y29uZmlnLmhvc3R9IHVzaW5nICBgICtcbiAgICAgICAgYCR7Y29uZmlnLnJlbW90ZVNlcnZlckNvbW1hbmR9YDtcbiAgICAgIGRldGFpbCA9ICdUcm91YmxlIHNob290aW5nOiBcXG4nICtcbiAgICAgICAgYCAgMS4gTWFrZSBzdXJlIHRoZSBjb21tYW5kIFwiJHtjb25maWcucmVtb3RlU2VydmVyQ29tbWFuZH1cIiBpcyBjb3JyZWN0LlxcbmAgK1xuICAgICAgICBgICAyLiBUaGUgc2VydmVyIG1pZ2h0IHRha2UgbG9uZ2VyIHRvIHN0YXJ0IHVwIHRoYW4gZXhwZWN0ZWQsIHRyeSB0byBjb25uZWN0IGFnYWluLlxcbmAgK1xuICAgICAgICBgICAzLiBJZiBub25lIG9mIGFib3ZlIHdvcmtzLCBzc2ggdG8gJHtjb25maWcuaG9zdH0gYW5kIGtpbGwgZXhpc3RpbmcgbnVjbGlkZS1zZXJ2ZXJgICtcbiAgICAgICAgYCBieSBydW5uaW5nIFwia2lsbGFsbCBub2RlXCIsIGFuZCByZWNvbm5lY3QuYDtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgU3NoSGFuZHNoYWtlLkVycm9yVHlwZS5TRVJWRVJfVkVSU0lPTl9NSVNNQVRDSDpcbiAgICAgIG1lc3NhZ2UgPSAnU2VydmVyIHZlcnNpb24gaXMgZGlmZmVyZW50IHRoYW4gY2xpZW50IHZlcnNpb24nO1xuICAgICAgZGV0YWlsID0gb3JpZ2luYWxFcnJvckRldGFpbDtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICBtZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3IgaGFwcGVuZDogJHtlcnJvci5tZXNzYWdlfS5gO1xuICAgICAgZGV0YWlsID0gb3JpZ2luYWxFcnJvckRldGFpbDtcbiAgfVxuICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IobWVzc2FnZSwge2RldGFpbCwgZGlzbWlzc2FibGU6IHRydWV9KTtcbn1cbiJdfQ==