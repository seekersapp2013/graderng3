/**
 * Svelte is throwing errors when importing pouch
 * instead i've moved those packages into the build_tools/move-resources
 * it will move the needed files into a vendor folder
 * and can be imported with script calls..
 * Not idea, but I can get svelte to compile with them.
 */
// import pouchdb from "pouchdb";
import Storage from "../storage/storage";
import Remote from "../../modules/remote/remote";
import Logger from "../../utils/log/log";
import { Interact } from "../../store/interact";

import { Lang } from "../../store/lang";

const console = new Logger("👨‍💻 engine.pouchdb");

let listeners = [];
let changeListeners = {};
let syncer;
let dbKey = "nomie4-v01";

export default {
  name: "PouchDB",
  syncValid: false,
  description: "Stored locally, with CouchDB Syncing support",
  authRequired: false,
  remote: null, // object to store username, password, host
  sync: false, // if we should sync
  dbKey: dbKey, // database key
  syncing: false, // is syncing
  syncer: null, // the sync object
  db: new PouchDB(dbKey, {
    auto_compaction: true,
    ajax: { cache: false },
  }),
  onReady(func) {
    func(this);
    // No need to setup just call the function
    // if (listeners.indexOf(func) == -1) {
    //   listeners.push(func);
    // }
  },
  fireReady() {
    listeners.forEach((func) => {
      func();
    });
    listeners = [];
  },
  // Convert a remote object to CouchURL
  remoteToUrl() {
    let remote = this.getRemote();
    if (remote.isValid()) {
      let parsed = remote.url;
      // parsed.username = remote.username ? remote.username || "".length : null;
      // parsed.password = remote.password ? remote.password || "".length : null;
      parsed.pathname = `/${remote.database}`;
      return parsed.toString();
    } else {
      return null;
    }
  },
  // If something has changed
  onChange(change) {
    this.syncing = true;
    if (change.direction == "pull") {
      // It's an update
      let docs = change.change.docs.forEach((doc) => {
        if (changeListeners.hasOwnProperty(doc._id)) {
          changeListeners[doc._id].forEach((func) => {
            func(doc.data);
          });
        }
      });
    }
  },
  onPaused(change) {
    this.syncing = false;
  },
  onError(error) {
    Interact.alert(Lang.t("sync.error", "Sync Error"), error.message);
    console.error("Sync Error", error);
    this.syncing = false;
  },
  stopSync() {
    if (this.syncer) {
      this.syncer.cancel();
      this.syncing = false;
      let remote = this.getRemote();
      remote.syncEnabled = false;
      this.saveRemote(remote);
    }
  },
  startSync() {
    let remote = this.getRemote();
    let errorCount = 0;
    let syncURL = this.remoteToUrl();
    let self = this;
    if (syncURL) {
      this.syncer = PouchDB.sync(dbKey, syncURL, {
        live: true,
        retry: true,
        ajax: { cache: false },
        batch_size: 10,
        auth: {
          username: remote.username,
          password: remote.password,
        },
      });

      this.syncer
        .catch((e) => {
          console.error("Catch error in syncer", e.message);
          this.syncing = false;
        })
        .then((res) => {
          self.syncing = true;
          self.syncValid = true;
        });

      this.syncer
        .on("complete", this.onChange)
        .on("change", this.onChange)
        .on("paused", this.onPaused)
        .on("error", (e) => {
          this.onError(e);
          errorCount++;
          if (errorCount > 10) {
            alert("Something bad is going on");
          }
        });
    }
  },
  getRemote() {
    this.remote = new Remote(Storage.local.get("pouchdb-remote"));
    return this.remote;
  },
  saveRemote(remote) {
    this.remote = remote;
    Storage.local.put("pouchdb-remote", remote);
  },
  init() {
    // Get Remote from Storage
    this.getRemote();
    // Determine if we should be syncing
    this.sync = this.remote.sync;
    if (this.remote.syncEnabled) {
      setTimeout(() => {
        this.startSync();
      }, 500);
    }
    this.fireReady();
  },
  info() {
    return {
      sync: syncer,
    };
  },
  getProfile() {
    return {
      username: "Local User",
    };
  },
  async put(path, content) {
    let payload = {
      _id: path,
      data: content,
    };
    // check if it exists
    let exists = await this.getFullDoc(path);
    if (exists) {
      return this.db.put({ ...exists, ...payload });
    } else {
      return this.db.put(payload);
    }
  },
  async getFullDoc(path) {
    let doc = null;
    try {
      doc = await this.db.get(path);
    } catch (e) {}
    return doc;
  },
  async get(path, onChange) {
    if (onChange && (changeListeners[path] || []).indexOf(onChange) == -1) {
      changeListeners[path] = changeListeners[path] || [];
      changeListeners[path].push(onChange);
    }
    let doc = null;
    try {
      let fullDoc = await this.getFullDoc(path);
      doc = fullDoc ? fullDoc.data : null;
    } catch (e) {}
    return doc;
  },
  async list() {
    let docs = await this.db.allDocs();
    let rows = docs ? docs.rows : [];
    return rows.map((doc) => doc.id);
  },
  async delete(path) {
    let doc = await this.getFullDoc(path);
    if (doc) {
      return await this.db.remove(doc);
    }
    return null;
  },
};
