import { defineStore } from 'pinia';

export const useCallbackStore = defineStore('callbackStore', {
  state: () => ({
    callbacks: {} as Record<string, (...args: any[]) => void>,
  }),

  actions: {
    add(key: string, callback: (...args: any[]) => void) {
      this.callbacks[key] = callback;
    },

    remove(key: string) {
      delete this.callbacks[key];
    },

    runCallback(key: string, ...args: any[]) {
      if (this.callbacks[key]) {
        this.callbacks[key](...args);
      }
    },
  },
});
