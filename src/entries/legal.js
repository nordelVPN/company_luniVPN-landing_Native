import '../styles/base.scss';
import '../styles/pages/legal.scss';
import { initNavigation } from '../modules/navigation';
import { initWishlist } from '../modules/wishlist';

document.documentElement.classList.add('js');
initNavigation();
initWishlist();
