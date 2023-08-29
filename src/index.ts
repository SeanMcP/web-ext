type StoredData = Record<string, any>;

type Storage = {
  get(keys: string | string[], callback: (next: StoredData) => void): void;
  set(next: StoredData, callback: () => void): void;
};

type Shim = {
  downloads: {
    download(options: { filename: string; url: string }): void;
  };
  runtime: {
    onInstalled: {
      addListener(callback: (e: Event) => void): void;
    };
  };
  storage: {
    local: Storage;
    sync: Storage;
  };
  windows: {
    create(options: any): void;
  };
};

declare var chrome: Shim;

(() => {
  if (typeof chrome !== "undefined" && chrome.hasOwnProperty("runtime")) return;

  console.log("Using a shimmed version of `chrome`; here be dragons 🐉");

  function storageFactory(type: "local" | "sync"): Storage {
    const key = `chrome.storage.${type}`;
    return {
      get(keys, callback) {
        const data = JSON.parse(localStorage.getItem(key) || "{}");
        const arg: StoredData = {};
        const iterableKeys = typeof keys === "string" ? [keys] : keys;
        for (const key of iterableKeys) {
          if (data.hasOwnProperty(key)) {
            arg[key] = data[key];
          }
        }
        callback(arg);
      },
      set(next, callback) {
        const data = JSON.parse(localStorage.getItem(key) || "{}");
        localStorage.setItem(key, JSON.stringify({ ...data, ...next }));
        if (callback) callback();
      },
    };
  }

  const chromeShim: Shim = {
    downloads: {
      download(options) {
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = options.url;
        a.download = options.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      },
    },
    runtime: {
      onInstalled: {
        addListener(callback) {
          window.addEventListener("load", callback);
        },
      },
    },
    storage: {
      local: storageFactory("local"),
      sync: storageFactory("sync"),
    },
    windows: {
      create(options) {
        window.open(options.url, "_blank");
      },
    },
  };

  window.chrome = chromeShim;
})();

export {};
