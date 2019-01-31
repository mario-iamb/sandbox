import enquire from 'enquire.js';
import Navigation from './navigation';
import { MOBILE, TABLET, DESKTOP } from './utils/constants';

class App {
    static breakpoints = {
        lg: 'screen and (min-width: 992px)',
        md: 'screen and (min-width: 768px) and (max-width: 991px)',
        sm: 'screen and (max-width: 767px)',
    };

    constructor() {
        this.navigation = new Navigation();
    
        enquire.register(App.breakpoints.lg, {
          match: () => {
            this.navigation.resetMobileNavigation();
            this.navigation.setMode(DESKTOP);
          },
        });
    
        enquire.register(App.breakpoints.md, {
          match: () => {
            this.navigation.setMode(TABLET);
            this.navigation.updateScrollArea(TABLET);
          },
        });
    
        enquire.register(App.breakpoints.sm, {
          match: () => {
            this.navigation.setMode(MOBILE);
            this.navigation.updateScrollArea(MOBILE);
          },
        });
    }
}

document.addEventListener('DOMContentLoaded', () => new App());