import{d as s}from"./vendor-pinia-DFakqZPc.js";const i=s("callback_store",{state:()=>({callbacks:{}}),actions:{add(a,c){this.callbacks[a]||(this.callbacks[a]=[]),this.callbacks[a].push(c)},remove(a){delete this.callbacks[a]},runCallback(a,...c){this.callbacks[a]&&this.callbacks[a].forEach(l=>l(...c))}}});export{i as u};
//# sourceMappingURL=callbackStore-BdNlBZpp.js.map
