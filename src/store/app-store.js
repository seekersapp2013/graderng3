import Logger from "../utils/log/log";
import { writable } from "svelte/store";

// Vendors
import Storage from "../modules/storage/storage";
import whatsNew from "../config/whatsNew";

// Stores

const console = new Logger("🗺 $AppStore");
// Nomie API Store

class AppStoreState {
  constructor() {
    this.whatsNew = null;
  }
}

const AppStoreInit = () => {
  const { update, subscribe, set } = writable(new AppStoreState());

  const checkForUpdate = () => {
    // TODO remove this eventually
    let _oldLastVersion = localStorage.getItem("nomie/last-version");
    let lastVersion = Storage.local.get("last-version") || _oldLastVersion;

    if (lastVersion !== whatsNew.version) {
      Storage.local.put("last-version", whatsNew.version);
    }
    // If they're not a brand new user - meaning they have a last Version already stored.
    if (lastVersion && lastVersion !== whatsNew.version) {
      update((state) => {
        state.whatsNew = whatsNew;
        return state;
      });
    }
  };

  const reveal = () => {
    update((state) => {
      state.whatsNew = whatsNew;
      return state;
    });
  };

  const closeUpdate = () => {
    update((state) => {
      state.whatsNew = null;
      return state;
    });
  };

  return {
    checkForUpdate,
    closeUpdate,
    update,
    subscribe,
    set,
    reveal,
  };
};

export const AppStore = AppStoreInit();
