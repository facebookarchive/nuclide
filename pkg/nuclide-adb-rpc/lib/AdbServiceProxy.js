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
          line: 25
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
          line: 26
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
          line: 31
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
          line: 32
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 32
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
          line: 37
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
          line: 38
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
          line: 39
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
          line: 44
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
          line: 45
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
          line: 46
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
          line: 51
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
          line: 52
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
          line: 53
        },
        kind: "string"
      });
    });
  };

  remoteModule.installPackage = function (arg0, arg1, arg2) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "adbPath",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 58
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
          line: 59
        },
        kind: "string"
      }
    }, {
      name: "packagePath",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 60
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("AdbService/installPackage", "observable", args);
    })).concatMap(id => id).concatMap(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 61
        },
        kind: "named",
        name: "ProcessMessage"
      });
    }).publish();
  };

  remoteModule.uninstallPackage = function (arg0, arg1, arg2) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "adbPath",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 66
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
          line: 67
        },
        kind: "string"
      }
    }, {
      name: "packageName",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 68
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("AdbService/uninstallPackage", "observable", args);
    })).concatMap(id => id).concatMap(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 69
        },
        kind: "named",
        name: "ProcessMessage"
      });
    }).publish();
  };

  remoteModule.getPidFromPackageName = function (arg0, arg1, arg2) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "adbPath",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 74
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
          line: 75
        },
        kind: "string"
      }
    }, {
      name: "packageName",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 76
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
          line: 77
        },
        kind: "number"
      });
    });
  };

  remoteModule.forwardJdwpPortToPid = function (arg0, arg1, arg2, arg3) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "adbPath",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 82
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
          line: 83
        },
        kind: "string"
      }
    }, {
      name: "tcpPort",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 84
        },
        kind: "number"
      }
    }, {
      name: "pid",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 85
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
          line: 86
        },
        kind: "string"
      });
    });
  };

  remoteModule.launchActivity = function (arg0, arg1, arg2, arg3, arg4) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "adbPath",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 91
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
          line: 92
        },
        kind: "string"
      }
    }, {
      name: "packageName",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 93
        },
        kind: "string"
      }
    }, {
      name: "activity",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 94
        },
        kind: "string"
      }
    }, {
      name: "action",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 95
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("AdbService/launchActivity", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 96
        },
        kind: "string"
      });
    });
  };

  remoteModule.activityExists = function (arg0, arg1, arg2, arg3) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "adbPath",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 101
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
          line: 102
        },
        kind: "string"
      }
    }, {
      name: "packageName",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 103
        },
        kind: "string"
      }
    }, {
      name: "activity",
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 104
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("AdbService/activityExists", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 105
        },
        kind: "boolean"
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
  value: {
    Object: {
      kind: "alias",
      name: "Object",
      location: {
        type: "builtin"
      }
    },
    Date: {
      kind: "alias",
      name: "Date",
      location: {
        type: "builtin"
      }
    },
    RegExp: {
      kind: "alias",
      name: "RegExp",
      location: {
        type: "builtin"
      }
    },
    Buffer: {
      kind: "alias",
      name: "Buffer",
      location: {
        type: "builtin"
      }
    },
    "fs.Stats": {
      kind: "alias",
      name: "fs.Stats",
      location: {
        type: "builtin"
      }
    },
    NuclideUri: {
      kind: "alias",
      name: "NuclideUri",
      location: {
        type: "builtin"
      }
    },
    atom$Point: {
      kind: "alias",
      name: "atom$Point",
      location: {
        type: "builtin"
      }
    },
    atom$Range: {
      kind: "alias",
      name: "atom$Range",
      location: {
        type: "builtin"
      }
    },
    DeviceDescription: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 17
      },
      name: "DeviceDescription",
      definition: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 17
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 18
          },
          name: "name",
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
          name: "architecture",
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
          name: "apiVersion",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 20
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 21
          },
          name: "model",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 21
            },
            kind: "string"
          },
          optional: false
        }]
      }
    },
    startServer: {
      kind: "function",
      name: "startServer",
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 24
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 24
        },
        kind: "function",
        argumentTypes: [{
          name: "adbPath",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 25
            },
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 26
          },
          kind: "observable",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 26
            },
            kind: "string"
          }
        }
      }
    },
    getDeviceList: {
      kind: "function",
      name: "getDeviceList",
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 30
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 30
        },
        kind: "function",
        argumentTypes: [{
          name: "adbPath",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 31
            },
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 32
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 32
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "AdbService.js",
                line: 32
              },
              kind: "named",
              name: "DeviceDescription"
            }
          }
        }
      }
    },
    getDeviceArchitecture: {
      kind: "function",
      name: "getDeviceArchitecture",
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 36
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 36
        },
        kind: "function",
        argumentTypes: [{
          name: "adbPath",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 37
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
              line: 38
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 39
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 39
            },
            kind: "string"
          }
        }
      }
    },
    getDeviceModel: {
      kind: "function",
      name: "getDeviceModel",
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 43
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 43
        },
        kind: "function",
        argumentTypes: [{
          name: "adbPath",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 44
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
              line: 45
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 46
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 46
            },
            kind: "string"
          }
        }
      }
    },
    getAPIVersion: {
      kind: "function",
      name: "getAPIVersion",
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 50
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 50
        },
        kind: "function",
        argumentTypes: [{
          name: "adbPath",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 51
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
              line: 52
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 53
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 53
            },
            kind: "string"
          }
        }
      }
    },
    installPackage: {
      kind: "function",
      name: "installPackage",
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 57
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 57
        },
        kind: "function",
        argumentTypes: [{
          name: "adbPath",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 58
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
              line: 59
            },
            kind: "string"
          }
        }, {
          name: "packagePath",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 60
            },
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 61
          },
          kind: "observable",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 61
            },
            kind: "named",
            name: "ProcessMessage"
          }
        }
      }
    },
    uninstallPackage: {
      kind: "function",
      name: "uninstallPackage",
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 65
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 65
        },
        kind: "function",
        argumentTypes: [{
          name: "adbPath",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 66
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
              line: 67
            },
            kind: "string"
          }
        }, {
          name: "packageName",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 68
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 69
          },
          kind: "observable",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 69
            },
            kind: "named",
            name: "ProcessMessage"
          }
        }
      }
    },
    getPidFromPackageName: {
      kind: "function",
      name: "getPidFromPackageName",
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 73
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 73
        },
        kind: "function",
        argumentTypes: [{
          name: "adbPath",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 74
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
              line: 75
            },
            kind: "string"
          }
        }, {
          name: "packageName",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 76
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 77
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 77
            },
            kind: "number"
          }
        }
      }
    },
    forwardJdwpPortToPid: {
      kind: "function",
      name: "forwardJdwpPortToPid",
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 81
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 81
        },
        kind: "function",
        argumentTypes: [{
          name: "adbPath",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 82
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
              line: 83
            },
            kind: "string"
          }
        }, {
          name: "tcpPort",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 84
            },
            kind: "number"
          }
        }, {
          name: "pid",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 85
            },
            kind: "number"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 86
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 86
            },
            kind: "string"
          }
        }
      }
    },
    launchActivity: {
      kind: "function",
      name: "launchActivity",
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 90
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 90
        },
        kind: "function",
        argumentTypes: [{
          name: "adbPath",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 91
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
              line: 92
            },
            kind: "string"
          }
        }, {
          name: "packageName",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 93
            },
            kind: "string"
          }
        }, {
          name: "activity",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 94
            },
            kind: "string"
          }
        }, {
          name: "action",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 95
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 96
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 96
            },
            kind: "string"
          }
        }
      }
    },
    activityExists: {
      kind: "function",
      name: "activityExists",
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 100
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 100
        },
        kind: "function",
        argumentTypes: [{
          name: "adbPath",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 101
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
              line: 102
            },
            kind: "string"
          }
        }, {
          name: "packageName",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 103
            },
            kind: "string"
          }
        }, {
          name: "activity",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 104
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "AdbService.js",
            line: 105
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "AdbService.js",
              line: 105
            },
            kind: "boolean"
          }
        }
      }
    },
    ProcessExitMessage: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "process-rpc-types.js",
        line: 13
      },
      name: "ProcessExitMessage",
      definition: {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 13
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 14
          },
          name: "kind",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 14
            },
            kind: "string-literal",
            value: "exit"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 15
          },
          name: "exitCode",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 15
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 15
              },
              kind: "number"
            }
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 16
          },
          name: "signal",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 16
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 16
              },
              kind: "string"
            }
          },
          optional: false
        }]
      }
    },
    ProcessMessage: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "process-rpc-types.js",
        line: 20
      },
      name: "ProcessMessage",
      definition: {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 20
        },
        kind: "union",
        types: [{
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 20
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 21
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 21
              },
              kind: "string-literal",
              value: "stdout"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 22
            },
            name: "data",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 22
              },
              kind: "string"
            },
            optional: false
          }]
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 23
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 24
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 24
              },
              kind: "string-literal",
              value: "stderr"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 25
            },
            name: "data",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 25
              },
              kind: "string"
            },
            optional: false
          }]
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 13
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 14
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 14
              },
              kind: "string-literal",
              value: "exit"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 15
            },
            name: "exitCode",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 15
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "process-rpc-types.js",
                  line: 15
                },
                kind: "number"
              }
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 16
            },
            name: "signal",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 16
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "process-rpc-types.js",
                  line: 16
                },
                kind: "string"
              }
            },
            optional: false
          }]
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 26
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 27
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 27
              },
              kind: "string-literal",
              value: "error"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 28
            },
            name: "error",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 28
              },
              kind: "named",
              name: "Object"
            },
            optional: false
          }]
        }],
        discriminantField: "kind"
      }
    },
    ProcessInfo: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "process-rpc-types.js",
        line: 31
      },
      name: "ProcessInfo",
      definition: {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 31
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 32
          },
          name: "parentPid",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 32
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 33
          },
          name: "pid",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 33
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 34
          },
          name: "command",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 34
            },
            kind: "string"
          },
          optional: false
        }]
      }
    }
  }
});