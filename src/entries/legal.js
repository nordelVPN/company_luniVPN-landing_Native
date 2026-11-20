import '../styles/base.scss';
import '../styles/pages/legal.scss';
import { initI18n } from '../modules/i18n';
import { initNavigation } from '../modules/navigation';
import { initWishlist } from '../modules/wishlist';

document.documentElement.classList.add('js');
initI18n();
initNavigation();
initWishlist();
