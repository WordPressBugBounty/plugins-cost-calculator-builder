declare global {
  interface Window {
    $ccbSticky?: {
      destroy: () => void;
      initialize: () => void;
    };
    $ccbStickyRendered?: boolean;
    StickySidebar?: any;
    ccb_nonces?: {
      [key: string]: string;
    };
    ccb_frontend_nonces?: {
      [key: string]: string;
    };
    wpcf7?: {
      init: (form: HTMLElement) => void;
    };
    ccb_rep_files?: Record<string, any>;
  }
}

export {};
