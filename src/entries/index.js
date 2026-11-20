import '../styles/base.scss';
import '../styles/pages/index.scss';
import { initI18n } from '../modules/i18n';
import { initNavigation } from '../modules/navigation';
import { initCheckout } from '../modules/checkout';
import { initWishlist } from '../modules/wishlist';
import { initHomeWave } from '../modules/home-wave';

document.documentElement.classList.add('js');
initI18n();
initNavigation();
initCheckout();
initWishlist();
initHomeWave();
