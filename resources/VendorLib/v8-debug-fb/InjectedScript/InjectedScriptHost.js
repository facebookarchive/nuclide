"use strict";

(function (binding, DebuggerScript) {
  function InjectedScriptHost() {}
  
  InjectedScriptHost.prototype = binding.InjectedScriptHost;

  InjectedScriptHost.prototype.isHTMLAllCollection = function(object) {
    //We don't have `all` collection in NodeJS
    return false;
  };

  InjectedScriptHost.prototype.suppressWarningsAndCallFunction = function(func, receiver, args) {
    return this.callFunction(func, receiver, args);
  };

  InjectedScriptHost.prototype.functionDetails = function(fun) {
    var details = this.functionDetailsWithoutScopes(fun);
    var scopes = DebuggerScript.getFunctionScopes(fun);
    
    if (scopes && scopes.length) {
      details.rawScopes = scopes;
    }
    
    return details;
  };

  InjectedScriptHost.prototype.getInternalProperties = function(value) {
    return DebuggerScript.getInternalProperties(value);
  };
  
  return new InjectedScriptHost();
});
