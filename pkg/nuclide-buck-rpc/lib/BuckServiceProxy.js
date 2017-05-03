"use strict";

let Observable;

module.exports = _client => {
  const remoteModule = {};

  remoteModule.getRootForPath = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "file",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 188
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/getRootForPath", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 188
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 188
          },
          kind: "named",
          name: "NuclideUri"
        }
      });
    });
  };

  remoteModule.getBuildFile = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 196
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "targetName",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 197
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/getBuildFile", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 198
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 198
          },
          kind: "string"
        }
      });
    });
  };

  remoteModule.getOwners = function (arg0, arg1, arg2) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 271
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "filePath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 272
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "kindFilter",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 273
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 273
          },
          kind: "string"
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/getOwners", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 274
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 274
          },
          kind: "string"
        }
      });
    });
  };

  remoteModule.getBuckConfig = function (arg0, arg1, arg2) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 291
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "section",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 292
        },
        kind: "string"
      }
    }, {
      name: "property",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 293
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/getBuckConfig", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 294
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 294
          },
          kind: "string"
        }
      });
    });
  };

  remoteModule.build = function (arg0, arg1, arg2) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 329
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "buildTargets",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 330
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 330
          },
          kind: "string"
        }
      }
    }, {
      name: "options",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 331
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 331
          },
          kind: "named",
          name: "BaseBuckBuildOptions"
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/build", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 332
        },
        kind: "any"
      });
    });
  };

  remoteModule.install = function (arg0, arg1, arg2, arg3, arg4) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 348
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "buildTargets",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 349
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 349
          },
          kind: "string"
        }
      }
    }, {
      name: "simulator",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 350
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 350
          },
          kind: "string"
        }
      }
    }, {
      name: "run",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 351
        },
        kind: "boolean"
      }
    }, {
      name: "debug",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 352
        },
        kind: "boolean"
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/install", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 353
        },
        kind: "any"
      });
    });
  };

  remoteModule.buildWithOutput = function (arg0, arg1, arg2) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 411
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "buildTargets",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 412
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 412
          },
          kind: "string"
        }
      }
    }, {
      name: "extraArguments",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 413
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 413
          },
          kind: "string"
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/buildWithOutput", "observable", args);
    })).concatMap(id => id).concatMap(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 414
        },
        kind: "named",
        name: "LegacyProcessMessage"
      });
    }).publish();
  };

  remoteModule.testWithOutput = function (arg0, arg1, arg2, arg3) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 431
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "buildTargets",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 432
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 432
          },
          kind: "string"
        }
      }
    }, {
      name: "extraArguments",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 433
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 433
          },
          kind: "string"
        }
      }
    }, {
      name: "debug",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 434
        },
        kind: "boolean"
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/testWithOutput", "observable", args);
    })).concatMap(id => id).concatMap(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 435
        },
        kind: "named",
        name: "LegacyProcessMessage"
      });
    }).publish();
  };

  remoteModule.installWithOutput = function (arg0, arg1, arg2, arg3, arg4, arg5) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 456
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "buildTargets",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 457
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 457
          },
          kind: "string"
        }
      }
    }, {
      name: "extraArguments",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 458
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 458
          },
          kind: "string"
        }
      }
    }, {
      name: "simulator",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 459
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 459
          },
          kind: "string"
        }
      }
    }, {
      name: "run",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 460
        },
        kind: "boolean"
      }
    }, {
      name: "debug",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 461
        },
        kind: "boolean"
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/installWithOutput", "observable", args);
    })).concatMap(id => id).concatMap(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 462
        },
        kind: "named",
        name: "LegacyProcessMessage"
      });
    }).publish();
  };

  remoteModule.runWithOutput = function (arg0, arg1, arg2, arg3) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 474
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "buildTargets",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 475
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 475
          },
          kind: "string"
        }
      }
    }, {
      name: "extraArguments",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 476
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 476
          },
          kind: "string"
        }
      }
    }, {
      name: "simulator",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 477
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 477
          },
          kind: "string"
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/runWithOutput", "observable", args);
    })).concatMap(id => id).concatMap(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 478
        },
        kind: "named",
        name: "LegacyProcessMessage"
      });
    }).publish();
  };

  remoteModule.listAliases = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 575
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/listAliases", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 576
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 576
          },
          kind: "string"
        }
      });
    });
  };

  remoteModule.listFlavors = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 584
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "targets",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 585
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 585
          },
          kind: "string"
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/listFlavors", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 586
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 586
          },
          kind: "named",
          name: "Object"
        }
      });
    });
  };

  remoteModule.resolveAlias = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 600
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "aliasOrTarget",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 601
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/resolveAlias", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 602
        },
        kind: "string"
      });
    });
  };

  remoteModule.showOutput = function (arg0, arg1, arg2) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 616
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "aliasOrTarget",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 617
        },
        kind: "string"
      }
    }, {
      name: "extraArguments",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 618
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 618
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 618
            },
            kind: "string"
          }
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/showOutput", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 619
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 619
          },
          kind: "named",
          name: "Object"
        }
      });
    });
  };

  remoteModule.buildRuleTypeFor = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 628
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "aliasesOrTargets",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 629
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/buildRuleTypeFor", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 630
        },
        kind: "named",
        name: "ResolvedRuleType"
      });
    });
  };

  remoteModule.getHTTPServerPort = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 718
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/getHTTPServerPort", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 718
        },
        kind: "number"
      });
    });
  };

  remoteModule.query = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 747
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "queryString",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 748
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/query", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 749
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 749
          },
          kind: "string"
        }
      });
    });
  };

  remoteModule.queryWithArgs = function (arg0, arg1, arg2) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 766
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "queryString",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 767
        },
        kind: "string"
      }
    }, {
      name: "args",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 768
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 768
          },
          kind: "string"
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/queryWithArgs", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 769
        },
        kind: "object",
        fields: []
      });
    });
  };

  remoteModule.getWebSocketStream = function (arg0, arg1) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 787
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "httpPort",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 788
        },
        kind: "number"
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/getWebSocketStream", "observable", args);
    })).concatMap(id => id).concatMap(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 789
        },
        kind: "named",
        name: "Object"
      });
    }).publish();
  };

  remoteModule.getLastCommandInfo = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 801
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "maxArgs",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 802
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 802
          },
          kind: "number"
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/getLastCommandInfo", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 803
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 803
          },
          kind: "named",
          name: "CommandInfo"
        }
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
    BuckWebSocketMessage: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 39
      },
      name: "BuckWebSocketMessage",
      definition: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 40
        },
        kind: "union",
        types: [{
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 40
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 42
            },
            name: "type",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 42
              },
              kind: "string-literal",
              value: "SocketConnected"
            },
            optional: false
          }]
        }, {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 44
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 45
            },
            name: "type",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 45
              },
              kind: "string-literal",
              value: "BuildProgressUpdated"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 46
            },
            name: "progressValue",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 46
              },
              kind: "number"
            },
            optional: false
          }]
        }, {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 48
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 49
            },
            name: "type",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 49
              },
              kind: "string-literal",
              value: "BuildFinished"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 50
            },
            name: "exitCode",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 50
              },
              kind: "number"
            },
            optional: false
          }]
        }, {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 52
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 53
            },
            name: "type",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 53
              },
              kind: "string-literal",
              value: "BuildStarted"
            },
            optional: false
          }]
        }, {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 55
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 56
            },
            name: "type",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 56
              },
              kind: "string-literal",
              value: "ConsoleEvent"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 57
            },
            name: "message",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 57
              },
              kind: "string"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 58
            },
            name: "level",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 58
              },
              kind: "object",
              fields: [{
                location: {
                  type: "source",
                  fileName: "BuckService.js",
                  line: 59
                },
                name: "name",
                type: {
                  location: {
                    type: "source",
                    fileName: "BuckService.js",
                    line: 60
                  },
                  kind: "union",
                  types: [{
                    location: {
                      type: "source",
                      fileName: "BuckService.js",
                      line: 60
                    },
                    kind: "string-literal",
                    value: "OFF"
                  }, {
                    location: {
                      type: "source",
                      fileName: "BuckService.js",
                      line: 61
                    },
                    kind: "string-literal",
                    value: "SEVERE"
                  }, {
                    location: {
                      type: "source",
                      fileName: "BuckService.js",
                      line: 62
                    },
                    kind: "string-literal",
                    value: "WARNING"
                  }, {
                    location: {
                      type: "source",
                      fileName: "BuckService.js",
                      line: 63
                    },
                    kind: "string-literal",
                    value: "INFO"
                  }, {
                    location: {
                      type: "source",
                      fileName: "BuckService.js",
                      line: 64
                    },
                    kind: "string-literal",
                    value: "CONFIG"
                  }, {
                    location: {
                      type: "source",
                      fileName: "BuckService.js",
                      line: 65
                    },
                    kind: "string-literal",
                    value: "FINE"
                  }, {
                    location: {
                      type: "source",
                      fileName: "BuckService.js",
                      line: 66
                    },
                    kind: "string-literal",
                    value: "FINER"
                  }, {
                    location: {
                      type: "source",
                      fileName: "BuckService.js",
                      line: 67
                    },
                    kind: "string-literal",
                    value: "FINEST"
                  }, {
                    location: {
                      type: "source",
                      fileName: "BuckService.js",
                      line: 68
                    },
                    kind: "string-literal",
                    value: "ALL"
                  }]
                },
                optional: false
              }]
            },
            optional: false
          }]
        }, {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 71
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 72
            },
            name: "type",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 72
              },
              kind: "string-literal",
              value: "ParseStarted"
            },
            optional: false
          }]
        }, {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 74
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 75
            },
            name: "type",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 75
              },
              kind: "string-literal",
              value: "ParseFinished"
            },
            optional: false
          }]
        }, {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 77
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 78
            },
            name: "type",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 78
              },
              kind: "string-literal",
              value: "InstallFinished"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 79
            },
            name: "success",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 79
              },
              kind: "boolean"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 80
            },
            name: "pid",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 80
              },
              kind: "number"
            },
            optional: true
          }]
        }, {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 82
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 83
            },
            name: "type",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 83
              },
              kind: "string-literal",
              value: "RunStarted"
            },
            optional: false
          }]
        }, {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 85
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 86
            },
            name: "type",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 86
              },
              kind: "string-literal",
              value: "RunComplete"
            },
            optional: false
          }]
        }, {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 88
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 89
            },
            name: "type",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 89
              },
              kind: "string-literal",
              value: "ResultsAvailable"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 90
            },
            name: "results",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 90
              },
              kind: "object",
              fields: [{
                location: {
                  type: "source",
                  fileName: "BuckService.js",
                  line: 91
                },
                name: "buildTarget",
                type: {
                  location: {
                    type: "source",
                    fileName: "BuckService.js",
                    line: 91
                  },
                  kind: "object",
                  fields: [{
                    location: {
                      type: "source",
                      fileName: "BuckService.js",
                      line: 92
                    },
                    name: "shortName",
                    type: {
                      location: {
                        type: "source",
                        fileName: "BuckService.js",
                        line: 92
                      },
                      kind: "string"
                    },
                    optional: false
                  }, {
                    location: {
                      type: "source",
                      fileName: "BuckService.js",
                      line: 93
                    },
                    name: "baseName",
                    type: {
                      location: {
                        type: "source",
                        fileName: "BuckService.js",
                        line: 93
                      },
                      kind: "string"
                    },
                    optional: false
                  }]
                },
                optional: false
              }, {
                location: {
                  type: "source",
                  fileName: "BuckService.js",
                  line: 95
                },
                name: "success",
                type: {
                  location: {
                    type: "source",
                    fileName: "BuckService.js",
                    line: 95
                  },
                  kind: "boolean"
                },
                optional: false
              }, {
                location: {
                  type: "source",
                  fileName: "BuckService.js",
                  line: 96
                },
                name: "failureCount",
                type: {
                  location: {
                    type: "source",
                    fileName: "BuckService.js",
                    line: 96
                  },
                  kind: "number"
                },
                optional: false
              }, {
                location: {
                  type: "source",
                  fileName: "BuckService.js",
                  line: 97
                },
                name: "totalNumberOfTests",
                type: {
                  location: {
                    type: "source",
                    fileName: "BuckService.js",
                    line: 97
                  },
                  kind: "number"
                },
                optional: false
              }, {
                location: {
                  type: "source",
                  fileName: "BuckService.js",
                  line: 98
                },
                name: "testCases",
                type: {
                  location: {
                    type: "source",
                    fileName: "BuckService.js",
                    line: 98
                  },
                  kind: "array",
                  type: {
                    location: {
                      type: "source",
                      fileName: "BuckService.js",
                      line: 98
                    },
                    kind: "object",
                    fields: [{
                      location: {
                        type: "source",
                        fileName: "BuckService.js",
                        line: 99
                      },
                      name: "success",
                      type: {
                        location: {
                          type: "source",
                          fileName: "BuckService.js",
                          line: 99
                        },
                        kind: "boolean"
                      },
                      optional: false
                    }, {
                      location: {
                        type: "source",
                        fileName: "BuckService.js",
                        line: 100
                      },
                      name: "failureCount",
                      type: {
                        location: {
                          type: "source",
                          fileName: "BuckService.js",
                          line: 100
                        },
                        kind: "number"
                      },
                      optional: false
                    }, {
                      location: {
                        type: "source",
                        fileName: "BuckService.js",
                        line: 101
                      },
                      name: "skippedCount",
                      type: {
                        location: {
                          type: "source",
                          fileName: "BuckService.js",
                          line: 101
                        },
                        kind: "number"
                      },
                      optional: false
                    }, {
                      location: {
                        type: "source",
                        fileName: "BuckService.js",
                        line: 102
                      },
                      name: "testCaseName",
                      type: {
                        location: {
                          type: "source",
                          fileName: "BuckService.js",
                          line: 102
                        },
                        kind: "string"
                      },
                      optional: false
                    }, {
                      location: {
                        type: "source",
                        fileName: "BuckService.js",
                        line: 103
                      },
                      name: "testResults",
                      type: {
                        location: {
                          type: "source",
                          fileName: "BuckService.js",
                          line: 103
                        },
                        kind: "array",
                        type: {
                          location: {
                            type: "source",
                            fileName: "BuckService.js",
                            line: 103
                          },
                          kind: "object",
                          fields: [{
                            location: {
                              type: "source",
                              fileName: "BuckService.js",
                              line: 104
                            },
                            name: "testCaseName",
                            type: {
                              location: {
                                type: "source",
                                fileName: "BuckService.js",
                                line: 104
                              },
                              kind: "string"
                            },
                            optional: false
                          }, {
                            location: {
                              type: "source",
                              fileName: "BuckService.js",
                              line: 105
                            },
                            name: "testName",
                            type: {
                              location: {
                                type: "source",
                                fileName: "BuckService.js",
                                line: 105
                              },
                              kind: "string"
                            },
                            optional: false
                          }, {
                            location: {
                              type: "source",
                              fileName: "BuckService.js",
                              line: 106
                            },
                            name: "type",
                            type: {
                              location: {
                                type: "source",
                                fileName: "BuckService.js",
                                line: 106
                              },
                              kind: "string"
                            },
                            optional: false
                          }, {
                            location: {
                              type: "source",
                              fileName: "BuckService.js",
                              line: 107
                            },
                            name: "time",
                            type: {
                              location: {
                                type: "source",
                                fileName: "BuckService.js",
                                line: 107
                              },
                              kind: "number"
                            },
                            optional: false
                          }, {
                            location: {
                              type: "source",
                              fileName: "BuckService.js",
                              line: 108
                            },
                            name: "message",
                            type: {
                              location: {
                                type: "source",
                                fileName: "BuckService.js",
                                line: 108
                              },
                              kind: "string"
                            },
                            optional: false
                          }, {
                            location: {
                              type: "source",
                              fileName: "BuckService.js",
                              line: 109
                            },
                            name: "stacktrace",
                            type: {
                              location: {
                                type: "source",
                                fileName: "BuckService.js",
                                line: 109
                              },
                              kind: "nullable",
                              type: {
                                location: {
                                  type: "source",
                                  fileName: "BuckService.js",
                                  line: 109
                                },
                                kind: "string"
                              }
                            },
                            optional: false
                          }, {
                            location: {
                              type: "source",
                              fileName: "BuckService.js",
                              line: 110
                            },
                            name: "stdOut",
                            type: {
                              location: {
                                type: "source",
                                fileName: "BuckService.js",
                                line: 110
                              },
                              kind: "string"
                            },
                            optional: false
                          }, {
                            location: {
                              type: "source",
                              fileName: "BuckService.js",
                              line: 111
                            },
                            name: "stdErr",
                            type: {
                              location: {
                                type: "source",
                                fileName: "BuckService.js",
                                line: 111
                              },
                              kind: "string"
                            },
                            optional: false
                          }]
                        }
                      },
                      optional: false
                    }]
                  }
                },
                optional: false
              }]
            },
            optional: false
          }]
        }, {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 116
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 117
            },
            name: "type",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 117
              },
              kind: "string-literal",
              value: "CompilerErrorEvent"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 118
            },
            name: "error",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 118
              },
              kind: "string"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 119
            },
            name: "suggestions",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 119
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "BuckService.js",
                  line: 119
                },
                kind: "mixed"
              }
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 120
            },
            name: "compilerType",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 120
              },
              kind: "string"
            },
            optional: false
          }]
        }],
        discriminantField: "type"
      }
    },
    BaseBuckBuildOptions: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 124
      },
      name: "BaseBuckBuildOptions",
      definition: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 124
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 125
          },
          name: "install",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 125
            },
            kind: "boolean"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 126
          },
          name: "run",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 126
            },
            kind: "boolean"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 127
          },
          name: "test",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 127
            },
            kind: "boolean"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 128
          },
          name: "debug",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 128
            },
            kind: "boolean"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 129
          },
          name: "simulator",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 129
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 129
              },
              kind: "string"
            }
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 131
          },
          name: "commandOptions",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 131
            },
            kind: "named",
            name: "Object"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 132
          },
          name: "extraArguments",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 132
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 132
              },
              kind: "string"
            }
          },
          optional: true
        }]
      }
    },
    CommandInfo: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 144
      },
      name: "CommandInfo",
      definition: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 144
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 145
          },
          name: "timestamp",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 145
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 146
          },
          name: "command",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 146
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 147
          },
          name: "args",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 147
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 147
              },
              kind: "string"
            }
          },
          optional: false
        }]
      }
    },
    ResolvedBuildTarget: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 150
      },
      name: "ResolvedBuildTarget",
      definition: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 150
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 151
          },
          name: "qualifiedName",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 151
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 152
          },
          name: "flavors",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 152
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 152
              },
              kind: "string"
            }
          },
          optional: false
        }]
      }
    },
    ResolvedRuleType: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 155
      },
      name: "ResolvedRuleType",
      definition: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 155
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 156
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 156
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 157
          },
          name: "buildTarget",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 157
            },
            kind: "named",
            name: "ResolvedBuildTarget"
          },
          optional: false
        }]
      }
    },
    getRootForPath: {
      kind: "function",
      name: "getRootForPath",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 188
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 188
        },
        kind: "function",
        argumentTypes: [{
          name: "file",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 188
            },
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 188
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 188
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 188
              },
              kind: "named",
              name: "NuclideUri"
            }
          }
        }
      }
    },
    getBuildFile: {
      kind: "function",
      name: "getBuildFile",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 195
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 195
        },
        kind: "function",
        argumentTypes: [{
          name: "rootPath",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 196
            },
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "targetName",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 197
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 198
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 198
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 198
              },
              kind: "string"
            }
          }
        }
      }
    },
    getOwners: {
      kind: "function",
      name: "getOwners",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 270
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 270
        },
        kind: "function",
        argumentTypes: [{
          name: "rootPath",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 271
            },
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "filePath",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 272
            },
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "kindFilter",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 273
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 273
              },
              kind: "string"
            }
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 274
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 274
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 274
              },
              kind: "string"
            }
          }
        }
      }
    },
    getBuckConfig: {
      kind: "function",
      name: "getBuckConfig",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 290
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 290
        },
        kind: "function",
        argumentTypes: [{
          name: "rootPath",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 291
            },
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "section",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 292
            },
            kind: "string"
          }
        }, {
          name: "property",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 293
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 294
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 294
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 294
              },
              kind: "string"
            }
          }
        }
      }
    },
    build: {
      kind: "function",
      name: "build",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 328
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 328
        },
        kind: "function",
        argumentTypes: [{
          name: "rootPath",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 329
            },
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "buildTargets",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 330
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 330
              },
              kind: "string"
            }
          }
        }, {
          name: "options",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 331
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 331
              },
              kind: "named",
              name: "BaseBuckBuildOptions"
            }
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 332
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 332
            },
            kind: "any"
          }
        }
      }
    },
    install: {
      kind: "function",
      name: "install",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 347
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 347
        },
        kind: "function",
        argumentTypes: [{
          name: "rootPath",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 348
            },
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "buildTargets",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 349
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 349
              },
              kind: "string"
            }
          }
        }, {
          name: "simulator",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 350
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 350
              },
              kind: "string"
            }
          }
        }, {
          name: "run",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 351
            },
            kind: "boolean"
          }
        }, {
          name: "debug",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 352
            },
            kind: "boolean"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 353
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 353
            },
            kind: "any"
          }
        }
      }
    },
    buildWithOutput: {
      kind: "function",
      name: "buildWithOutput",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 410
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 410
        },
        kind: "function",
        argumentTypes: [{
          name: "rootPath",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 411
            },
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "buildTargets",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 412
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 412
              },
              kind: "string"
            }
          }
        }, {
          name: "extraArguments",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 413
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 413
              },
              kind: "string"
            }
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 414
          },
          kind: "observable",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 414
            },
            kind: "named",
            name: "LegacyProcessMessage"
          }
        }
      }
    },
    testWithOutput: {
      kind: "function",
      name: "testWithOutput",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 430
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 430
        },
        kind: "function",
        argumentTypes: [{
          name: "rootPath",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 431
            },
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "buildTargets",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 432
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 432
              },
              kind: "string"
            }
          }
        }, {
          name: "extraArguments",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 433
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 433
              },
              kind: "string"
            }
          }
        }, {
          name: "debug",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 434
            },
            kind: "boolean"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 435
          },
          kind: "observable",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 435
            },
            kind: "named",
            name: "LegacyProcessMessage"
          }
        }
      }
    },
    installWithOutput: {
      kind: "function",
      name: "installWithOutput",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 455
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 455
        },
        kind: "function",
        argumentTypes: [{
          name: "rootPath",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 456
            },
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "buildTargets",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 457
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 457
              },
              kind: "string"
            }
          }
        }, {
          name: "extraArguments",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 458
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 458
              },
              kind: "string"
            }
          }
        }, {
          name: "simulator",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 459
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 459
              },
              kind: "string"
            }
          }
        }, {
          name: "run",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 460
            },
            kind: "boolean"
          }
        }, {
          name: "debug",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 461
            },
            kind: "boolean"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 462
          },
          kind: "observable",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 462
            },
            kind: "named",
            name: "LegacyProcessMessage"
          }
        }
      }
    },
    runWithOutput: {
      kind: "function",
      name: "runWithOutput",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 473
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 473
        },
        kind: "function",
        argumentTypes: [{
          name: "rootPath",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 474
            },
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "buildTargets",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 475
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 475
              },
              kind: "string"
            }
          }
        }, {
          name: "extraArguments",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 476
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 476
              },
              kind: "string"
            }
          }
        }, {
          name: "simulator",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 477
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 477
              },
              kind: "string"
            }
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 478
          },
          kind: "observable",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 478
            },
            kind: "named",
            name: "LegacyProcessMessage"
          }
        }
      }
    },
    listAliases: {
      kind: "function",
      name: "listAliases",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 574
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 574
        },
        kind: "function",
        argumentTypes: [{
          name: "rootPath",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 575
            },
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 576
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 576
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 576
              },
              kind: "string"
            }
          }
        }
      }
    },
    listFlavors: {
      kind: "function",
      name: "listFlavors",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 583
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 583
        },
        kind: "function",
        argumentTypes: [{
          name: "rootPath",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 584
            },
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "targets",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 585
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 585
              },
              kind: "string"
            }
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 586
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 586
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 586
              },
              kind: "named",
              name: "Object"
            }
          }
        }
      }
    },
    resolveAlias: {
      kind: "function",
      name: "resolveAlias",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 599
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 599
        },
        kind: "function",
        argumentTypes: [{
          name: "rootPath",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 600
            },
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "aliasOrTarget",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 601
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 602
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 602
            },
            kind: "string"
          }
        }
      }
    },
    showOutput: {
      kind: "function",
      name: "showOutput",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 615
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 615
        },
        kind: "function",
        argumentTypes: [{
          name: "rootPath",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 616
            },
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "aliasOrTarget",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 617
            },
            kind: "string"
          }
        }, {
          name: "extraArguments",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 618
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 618
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "BuckService.js",
                  line: 618
                },
                kind: "string"
              }
            }
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 619
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 619
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 619
              },
              kind: "named",
              name: "Object"
            }
          }
        }
      }
    },
    buildRuleTypeFor: {
      kind: "function",
      name: "buildRuleTypeFor",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 627
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 627
        },
        kind: "function",
        argumentTypes: [{
          name: "rootPath",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 628
            },
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "aliasesOrTargets",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 629
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 630
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 630
            },
            kind: "named",
            name: "ResolvedRuleType"
          }
        }
      }
    },
    getHTTPServerPort: {
      kind: "function",
      name: "getHTTPServerPort",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 718
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 718
        },
        kind: "function",
        argumentTypes: [{
          name: "rootPath",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 718
            },
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 718
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 718
            },
            kind: "number"
          }
        }
      }
    },
    query: {
      kind: "function",
      name: "query",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 746
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 746
        },
        kind: "function",
        argumentTypes: [{
          name: "rootPath",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 747
            },
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "queryString",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 748
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 749
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 749
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 749
              },
              kind: "string"
            }
          }
        }
      }
    },
    queryWithArgs: {
      kind: "function",
      name: "queryWithArgs",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 765
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 765
        },
        kind: "function",
        argumentTypes: [{
          name: "rootPath",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 766
            },
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "queryString",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 767
            },
            kind: "string"
          }
        }, {
          name: "args",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 768
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 768
              },
              kind: "string"
            }
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 769
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 769
            },
            kind: "object",
            fields: []
          }
        }
      }
    },
    getWebSocketStream: {
      kind: "function",
      name: "getWebSocketStream",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 786
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 786
        },
        kind: "function",
        argumentTypes: [{
          name: "rootPath",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 787
            },
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "httpPort",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 788
            },
            kind: "number"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 789
          },
          kind: "observable",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 789
            },
            kind: "named",
            name: "Object"
          }
        }
      }
    },
    getLastCommandInfo: {
      kind: "function",
      name: "getLastCommandInfo",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 800
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 800
        },
        kind: "function",
        argumentTypes: [{
          name: "rootPath",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 801
            },
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "maxArgs",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 802
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 802
              },
              kind: "number"
            }
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 803
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 803
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 803
              },
              kind: "named",
              name: "CommandInfo"
            }
          }
        }
      }
    },
    ProcessExitMessage: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "process-rpc-types.js",
        line: 14
      },
      name: "ProcessExitMessage",
      definition: {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 14
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 15
          },
          name: "kind",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 15
            },
            kind: "string-literal",
            value: "exit"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 16
          },
          name: "exitCode",
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
              kind: "number"
            }
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 17
          },
          name: "signal",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 17
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 17
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
        line: 21
      },
      name: "ProcessMessage",
      definition: {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 22
        },
        kind: "union",
        types: [{
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 22
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 23
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 23
              },
              kind: "string-literal",
              value: "stdout"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 24
            },
            name: "data",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 24
              },
              kind: "string"
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
              value: "stderr"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 28
            },
            name: "data",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 28
              },
              kind: "string"
            },
            optional: false
          }]
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 14
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 15
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 15
              },
              kind: "string-literal",
              value: "exit"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 16
            },
            name: "exitCode",
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
                kind: "number"
              }
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 17
            },
            name: "signal",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 17
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "process-rpc-types.js",
                  line: 17
                },
                kind: "string"
              }
            },
            optional: false
          }]
        }],
        discriminantField: "kind"
      }
    },
    LegacyProcessMessage: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "process-rpc-types.js",
        line: 34
      },
      name: "LegacyProcessMessage",
      definition: {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 35
        },
        kind: "union",
        types: [{
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 22
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 23
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 23
              },
              kind: "string-literal",
              value: "stdout"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 24
            },
            name: "data",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 24
              },
              kind: "string"
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
              value: "stderr"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 28
            },
            name: "data",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 28
              },
              kind: "string"
            },
            optional: false
          }]
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 14
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 15
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 15
              },
              kind: "string-literal",
              value: "exit"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 16
            },
            name: "exitCode",
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
                kind: "number"
              }
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 17
            },
            name: "signal",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 17
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "process-rpc-types.js",
                  line: 17
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
            line: 36
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 36
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 36
              },
              kind: "string-literal",
              value: "error"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 36
            },
            name: "error",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 36
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
        line: 38
      },
      name: "ProcessInfo",
      definition: {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 38
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 39
          },
          name: "parentPid",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 39
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 40
          },
          name: "pid",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 40
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 41
          },
          name: "command",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 41
            },
            kind: "string"
          },
          optional: false
        }]
      }
    }
  }
});