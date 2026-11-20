import '../styles/base.scss';
import '../styles/pages/account.scss';
import { initI18n } from '../modules/i18n';
import { initNavigation } from '../modules/navigation';
import { initWishlist } from '../modules/wishlist';
import { initAccountPortal } from '../modules/account';
import { initHomeWave } from '../modules/home-wave';

document.documentElement.classList.add('js');
initI18n();
initNavigation();
initWishlist();
initAccountPortal();
initHomeWave();
