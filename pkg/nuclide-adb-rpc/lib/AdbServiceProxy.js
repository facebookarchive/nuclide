"use strict";

let Observable;

module.exports = _client => {
  const remoteModule = {};

  remoteModule.startServer = function (arg0) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "adbPath",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 24
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("AdbService/startServer", "observable", args);
    })).concatMap(id => id).concatMap(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 25
        },
        kind: "string"
      });
    }).publish();
  };

  remoteModule.getDeviceList = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "adbPath",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 30
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("AdbService/getDeviceList", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 31
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 31
          },
          kind: "named",
          name: "DeviceDescription"
        }
      });
    });
  };

  remoteModule.getDeviceArchitecture = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "adbPath",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 36
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "device",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 37
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("AdbService/getDeviceArchitecture", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 38
        },
        kind: "string"
      });
    });
  };

  remoteModule.getDeviceModel = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "adbPath",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 43
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "device",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 44
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("AdbService/getDeviceModel", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 45
        },
        kind: "string"
      });
    });
  };

  remoteModule.getAPIVersion = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "adbPath",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 50
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "device",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 51
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("AdbService/getAPIVersion", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 52
        },
        kind: "string"
      });
    });
  };

  remoteModule.getPidFromPackageName = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "adbPath",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 57
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "packageName",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 58
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("AdbService/getPidFromPackageName", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 59
        },
        kind: "number"
      });
    });
  };

  remoteModule.forwardJdwpPortToPid = function (arg0, arg1, arg2) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "adbPath",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 64
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "tcpPort",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 65
        },
        kind: "number"
      }
    }, {
      name: "pid",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 66
        },
        kind: "number"
      }
    }]).then(args => {
      return _client.callRemoteFunction("AdbService/forwardJdwpPortToPid", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 67
        },
        kind: "string"
      });
    });
  };

  return remoteModule;
};

Object.defineProperty(module.exports, "inject", {
  value: function () {
    Observable = arguments[0];
  }
});
Object.defineProperty(module.exports, "defs", {
  value: new Map([["Object", {
    kind: "alias",
    name: "Object",
    location: {
      type: "builtin"
    }
  }], ["Date", {
    kind: "alias",
    name: "Date",
    location: {
      type: "builtin"
    }
  }], ["RegExp", {
    kind: "alias",
    name: "RegExp",
    location: {
      type: "builtin"
    }
  }], ["Buffer", {
    kind: "alias",
    name: "Buffer",
    location: {
      type: "builtin"
    }
  }], ["fs.Stats", {
    kind: "alias",
    name: "fs.Stats",
    location: {
      type: "builtin"
    }
  }], ["NuclideUri", {
    kind: "alias",
    name: "NuclideUri",
    location: {
      type: "builtin"
    }
  }], ["atom$Point", {
    kind: "alias",
    name: "atom$Point",
    location: {
      type: "builtin"
    }
  }], ["atom$Range", {
    kind: "alias",
    name: "atom$Range",
    location: {
      type: "builtin"
    }
  }], ["DeviceDescription", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "AdbService.js",
      line: 16
    },
    name: "DeviceDescription",
    definition: {
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 16
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 17
        },
        name: "name",
        type: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 17
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 18
        },
        name: "architecture",
        type: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 18
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 19
        },
        name: "apiVersion",
        type: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 19
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 20
        },
        name: "model",
        type: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 20
          },
          kind: "string"
        },
        optional: false
      }]
    }
  }], ["startServer", {
    kind: "function",
    name: "startServer",
    location: {
      type: "source",
      fileName: "AdbService.js",
      line: 23
    },
    type: {
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 23
      },
      kind: "function",
      argumentTypes: [{
        name: "adbPath",
        type: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 24
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 25
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 25
          },
          kind: "string"
        }
      }
    }
  }], ["getDeviceList", {
    kind: "function",
    name: "getDeviceList",
    location: {
      type: "source",
      fileName: "AdbService.js",
      line: 29
    },
    type: {
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 29
      },
      kind: "function",
      argumentTypes: [{
        name: "adbPath",
        type: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 30
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 31
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 31
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 31
            },
            kind: "named",
            name: "DeviceDescription"
          }
        }
      }
    }
  }], ["getDeviceArchitecture", {
    kind: "function",
    name: "getDeviceArchitecture",
    location: {
      type: "source",
      fileName: "AdbService.js",
      line: 35
    },
    type: {
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 35
      },
      kind: "function",
      argumentTypes: [{
        name: "adbPath",
        type: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 36
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "device",
        type: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 37
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 38
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 38
          },
          kind: "string"
        }
      }
    }
  }], ["getDeviceModel", {
    kind: "function",
    name: "getDeviceModel",
    location: {
      type: "source",
      fileName: "AdbService.js",
      line: 42
    },
    type: {
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 42
      },
      kind: "function",
      argumentTypes: [{
        name: "adbPath",
        type: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 43
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "device",
        type: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 44
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 45
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 45
          },
          kind: "string"
        }
      }
    }
  }], ["getAPIVersion", {
    kind: "function",
    name: "getAPIVersion",
    location: {
      type: "source",
      fileName: "AdbService.js",
      line: 49
    },
    type: {
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 49
      },
      kind: "function",
      argumentTypes: [{
        name: "adbPath",
        type: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 50
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "device",
        type: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 51
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 52
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 52
          },
          kind: "string"
        }
      }
    }
  }], ["getPidFromPackageName", {
    kind: "function",
    name: "getPidFromPackageName",
    location: {
      type: "source",
      fileName: "AdbService.js",
      line: 56
    },
    type: {
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 56
      },
      kind: "function",
      argumentTypes: [{
        name: "adbPath",
        type: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 57
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "packageName",
        type: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 58
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 59
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 59
          },
          kind: "number"
        }
      }
    }
  }], ["forwardJdwpPortToPid", {
    kind: "function",
    name: "forwardJdwpPortToPid",
    location: {
      type: "source",
      fileName: "AdbService.js",
      line: 63
    },
    type: {
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 63
      },
      kind: "function",
      argumentTypes: [{
        name: "adbPath",
        type: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 64
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "tcpPort",
        type: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 65
          },
          kind: "number"
        }
      }, {
        name: "pid",
        type: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 66
          },
          kind: "number"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 67
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 67
          },
          kind: "string"
        }
      }
    }
  }]])
});