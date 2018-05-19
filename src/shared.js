import ESM from "./constant/esm.js"

import encodeId from "./util/encode-id.js"
import setDeferred from "./util/set-deferred.js"

const {
  PKG_PREFIX
} = ESM

const SHARED_SYMBOL = Symbol.for(PKG_PREFIX + ":shared")

function getShared() {
  if (__shared__) {
    __shared__.inited = true
    __shared__.reloaded = false
    return __shared__
  }

  try {
    const shared = __non_webpack_require__(SHARED_SYMBOL)

    shared.reloaded = true

    /* eslint-disable no-global-assign */
    return __shared__ = shared
  } catch (e) {}

  return init()
}

function init() {
  const dummyProxy = new Proxy(class P {}, {
    [PKG_PREFIX]: 1
  })

  const funcToString = Function.prototype.toString
  const { toString } = Object.prototype

  const fastPath = {}
  const utilBinding = {}

  const support = {
    wasm: typeof WebAssembly === "object" && WebAssembly !== null
  }

  const symbol = {
    _compile: Symbol.for(PKG_PREFIX + ":module._compile"),
    mjs: Symbol.for(PKG_PREFIX + ':Module._extensions[".mjs"]'),
    namespace: Symbol.for(PKG_PREFIX + ":namespace"),
    package: Symbol.for(PKG_PREFIX + ":package"),
    realGetProxyDetails: Symbol.for(PKG_PREFIX + ":realGetProxyDetails"),
    realRequire: Symbol.for(PKG_PREFIX + ":realRequire"),
    shared: SHARED_SYMBOL,
    wrapper: Symbol.for(PKG_PREFIX + ":wrapper")
  }

  const shared = {
    entry: {
      cache: new WeakMap,
      skipExports: { __proto__: null }
    },
    env: {},
    external: __external__,
    fastPath,
    inited: false,
    memoize: {
      builtinEntries: { __proto__: null },
      moduleCJSResolveFilename: { __proto__: null },
      moduleESMResolveFilename: { __proto__: null },
      moduleFindPath: { __proto__: null },
      moduleReadPackage: { __proto__: null },
      shimFunctionPrototypeToString: new WeakMap,
      shimProcessBindingUtilGetProxyDetails: new WeakMap,
      utilGetProxyDetails: new WeakMap,
      utilIsMJS: { __proto__: null },
      utilMaskFunction: new WeakMap,
      utilMaxSatisfying: { __proto__: null },
      utilParseURL: { __proto__: null },
      utilProxyExports: new WeakMap,
      utilSatisfies: { __proto__: null },
      utilUnwrapProxy: new WeakMap
    },
    module: {},
    moduleState: {
      parseOnly: false,
      parsing: false,
      requireDepth: 0,
      stat: null
    },
    package: {
      default: null,
      dir: { __proto__: null },
      root: { __proto__: null },
      state: { __proto__: null }
    },
    pendingMetas: { __proto__: null },
    pendingWrites: { __proto__: null },
    reloaded: false,
    safeContext: Function("return this")(),
    support,
    symbol,
    unsafeContext: global,
    utilBinding
  }

  setDeferred(shared, "customInspectKey", () => {
    const customInspectSymbol = shared.module.safeUtil.inspect.custom

    return typeof customInspectSymbol === "symbol"
      ? customInspectSymbol
      : "inspect"
  })

  setDeferred(shared, "nycCacheNames", () => {
    const { fsReaddir, safePath, safeProcess, utilIsFile } = shared.module
    const { dirname, sep } = safePath

    let dirPath = safeProcess.cwd()

    while (true) {
      if (utilIsFile(dirPath + sep +  "package.json")) {
        return fsReaddir(dirPath + sep + "node_modules" + sep + ".cache" + sep + "nyc")
      }

      const parentPath = dirname(dirPath)

      if (dirPath === parentPath) {
        return null
      }

      dirPath = parentPath
    }
  })

  setDeferred(shared, "proxyNativeSourceText", () => {
    try {
      return funcToString.call(dummyProxy)
    } catch (e) {}

    return ""
  })

  setDeferred(shared, "runtimeName", () =>
    encodeId(
      "_" +
      shared.module.safeCrypto.createHash("md5")
        .update(Date.now().toString())
        .digest("hex")
        .slice(0, 3)
    )
  )

  setDeferred(fastPath, "readFile", () =>
    support.internalModuleReadFile
  )

  setDeferred(fastPath, "readFileFast", () =>
    support.internalModuleReadJSON ||
      support.internalModuleReadFile
  )

  setDeferred(fastPath, "stat", () =>
    typeof shared.module.binding.fs.internalModuleStat === "function"
  )

  setDeferred(support, "await", () => {
    try {
      Function("async()=>await 1")()
      return true
    } catch (e) {}

    return false
  })

  setDeferred(support, "getProxyDetails", () =>
    typeof shared.module.binding.util.getProxyDetails === "function"
  )

  setDeferred(support, "inspectProxies", () => {
    const inspected = shared.module.safeUtil.inspect(dummyProxy, {
      depth: 1,
      showProxy: true
    })

    return inspected.startsWith("Proxy") &&
      inspected.indexOf(PKG_PREFIX) !== -1
  })

  setDeferred(support, "internalModuleReadFile", () =>
    typeof shared.module.binding.fs.internalModuleReadFile === "function"
  )

  setDeferred(support, "internalModuleReadJSON", () =>
    typeof shared.module.binding.fs.internalModuleReadJSON === "function"
  )

  setDeferred(support, "lookupShadowed", () => {
    // Node < 8 will lookup accessors in the prototype chain despite being
    // shadowed by data properties.
    // https://node.green/#ES2017-annex-b
    const o = {
      __proto__: {
        get a() {},
        set a(v) {}
      },
      a: 1
    }

    return ! o.__lookupGetter__("a") &&
      ! o.__lookupSetter__("a")
  })

  setDeferred(support, "nativeProxyReceiver", () => {
    // Detect support for invoking native functions with a proxy receiver.
    // https://bugs.chromium.org/p/v8/issues/detail?id=5773
    try {
      return new Proxy(shared.module.SafeBuffer.alloc(0), {
        get: (target, name) => target[name]
      }).toString() === ""
    } catch (e) {
      return ! /Illegal/.test(e)
    }
  })

  setDeferred(support, "proxiedClasses", () => {
    class C extends dummyProxy {
      c() {}
    }

    return new C().c !== void 0
  })

  setDeferred(support, "proxiedFunctionToStringTag", () =>
    toString.call(dummyProxy) === "[object Function]"
  )

  setDeferred(support, "replShowProxy", () => {
    const { safeProcess, utilSatisfies } = shared.module

    return utilSatisfies(safeProcess.version, ">=10")
  })

  setDeferred(support, "safeGetEnv", () =>
    typeof shared.module.binding.util.safeGetenv === "function"
  )

  setDeferred(support, "setHiddenValue", () =>
    typeof shared.module.binding.util.setHiddenValue === "function"
  )

  setDeferred(utilBinding, "errorDecoratedSymbol", () => {
    const { binding, safeProcess, utilSatisfies } = shared.module

    return utilSatisfies(safeProcess.version, "<7")
      ? "node:decorated"
      : binding.util.decorated_private_symbol
  })

  setDeferred(utilBinding, "hiddenKeyType", () => {
    const { safeProcess, utilSatisfies } = shared.module

    return utilSatisfies(safeProcess.version, "<7")
      ? "string"
      : typeof utilBinding.errorDecoratedSymbol
  })

  /* eslint-disable no-global-assign */
  return __shared__ = shared
}

export default getShared()
