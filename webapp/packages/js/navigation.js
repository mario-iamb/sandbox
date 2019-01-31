import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';
import { MOBILE, TABLET, DESKTOP } from './utils/constants';

class Navigation {
    static cssClasses = {
      open: 'header--nav-open',
      showNavigationButtonActive: 'header__show-navigation--active',
      closeNavigationButtonActive: 'header__close-navigation--active',
      activeNavigationItem: 'primary-nav__item--active',
    };
  
    state = {
      mode: MOBILE,
      level: 0,
      open: false,
      activeItems: [],
    };
  
    constructor() {
      this.root = document.querySelector('.js-navigation');
  
      if (this.root) {
        this.showNavigationButton = this.root.querySelector('.js-show-navigation');
        this.closeNavigationButton = this.root.querySelector('.js-close-navigation');
        this.slideArea = this.root.querySelector('.js-navigation-slide-area');
        this.wrapper = this.root.querySelector('.js-navigation-wrapper');
        this.inner = this.root.querySelector('.js-navigation-inner');
  
        this.setupShowNavigationButton();
        this.setupCloseNavigationButton();
        this.setupLevelSwitch();
      }
    }
  
    setupLevelSwitch() {
      this.store = this.getStore();
  
      if (this.store) {
        this.setupParentButtons();
        this.setupLinks();
      }
    }
  
    slideToLevel(level) {
      const slide = level * 100;
  
      this.slideArea.style.transform = `translateX(${-slide}%)`;
      this.state.level = level;
    }
  
    previousLevel() {
      this.slideToLevel(this.state.level - 1);
    }
  
    nextLevel() {
      this.slideToLevel(this.state.level + 1);
    }
  
    resetMobileNavigation() {
      this.slideArea.style.transform = '';
      this.state.level = 0;
      this.resetActiveNavigationItem();
      this.closeNavigation();
    }
  
    resetActiveNavigationItem() {
      this.state.activeItems.forEach(item => {
        item.classList.remove(Navigation.cssClasses.activeNavigationItem);
      });
    }
  
    backToParent() {
      this.previousLevel();
      this.resetActiveNavigationItem();
    }
  
    setupParentButtons() {
      const parentButtons = this.store.map(item => item.parentButton);
  
      parentButtons.forEach(item => {
        item.addEventListener('click', e => {
          this.backToParent();
          e.preventDefault();
        });
      });
    }
  
    openLink(link, item) {
      item.classList.add(Navigation.cssClasses.activeNavigationItem);
      this.nextLevel();
      this.state.activeItems = [...this.state.activeItems, item];
    }
  
    setupLinks() {
      this.store.forEach(({ item, link }) => {
        link.addEventListener('click', e => {
          if (this.state.mode !== DESKTOP) {
            this.openLink(link, item);
            e.preventDefault();
          }
        });
      });
    }
  
    getStore() {
      const itemsWithChldren = this.root.querySelectorAll('.js-item-with-children');
  
      if (itemsWithChldren) {
        return [...itemsWithChldren].map(item => {
          const link = item.querySelector('.js-navigation-link');
          const parentButton = item.querySelector('.js-parent-button');
  
          return {
            item,
            link,
            parentButton,
          };
        });
      }
  
      return false;
    }
  
    openNavigation = () => {
      if (!this.state.open) {
        this.state.open = true;
        this.root.classList.add(Navigation.cssClasses.open);
        this.showNavigationButton.classList.add(Navigation.cssClasses.showNavigationButtonActive);
        this.closeNavigationButton.classList.remove(Navigation.cssClasses.closeNavigationButtonActive);
        document.documentElement.classList.add(Navigation.cssClasses.disableScroll);
        disableBodyScroll(this.state.scrollDiv);
      }
    };
  
    closeNavigation = () => {
      if (this.state.open) {
        this.state.open = false;
        this.root.classList.remove(Navigation.cssClasses.open);
        this.closeNavigationButton.classList.add(Navigation.cssClasses.closeNavigationButtonActive);
        this.showNavigationButton.classList.remove(Navigation.cssClasses.showNavigationButtonActive);
        document.documentElement.classList.remove(Navigation.cssClasses.disableScroll);
        enableBodyScroll(this.state.scrollDiv);
      }
    };
  
    setupShowNavigationButton() {
      this.showNavigationButton.addEventListener('click', () => {
        this.openNavigation();
      });
    }
  
    setupCloseNavigationButton() {
      this.closeNavigationButton.addEventListener('click', () => {
        this.closeNavigation();
      });
    }
  
    setMode(mode) {
      this.state.mode = mode;
    }
  
    updateScrollArea(mode) {
      if (this.state.open) {
        enableBodyScroll(this.state.scrollDiv);
      }
  
      if (mode === TABLET) {
        this.state.scrollDiv = this.inner;
      } else if (mode === MOBILE) {
        this.state.scrollDiv = this.wrapper;
      }
  
      if (this.state.open) {
        disableBodyScroll(this.state.scrollDiv);
      }
    }
  }
  
  export default Navigation;
  