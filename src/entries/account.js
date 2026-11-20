import '../styles/base.scss';
import '../styles/pages/account.scss';
import { initNavigation } from '../modules/navigation';
import { initWishlist } from '../modules/wishlist';
import { initAccountPortal } from '../modules/account';
import { initHomeWave } from '../modules/home-wave';

document.documentElement.classList.add('js');
initNavigation();
initWishlist();
initAccountPortal();
initHomeWave();
