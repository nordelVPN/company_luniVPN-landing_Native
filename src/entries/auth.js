import '../styles/base.scss';
import '../styles/pages/legal.scss';
import { initI18n } from '../modules/i18n';
import { initNavigation } from '../modules/navigation';
import { initWishlist } from '../modules/wishlist';
import { initPortalSdkBridge } from '../modules/portal-sdk-bridge';

document.documentElement.classList.add('js');
initI18n();
initNavigation();
initWishlist();
initPortalSdkBridge();
