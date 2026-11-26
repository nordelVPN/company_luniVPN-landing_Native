import '../styles/base.scss';
import '../styles/pages/index.scss';
import { initI18n } from '../modules/i18n';
import { initNavigation } from '../modules/navigation';
import { initCheckout } from '../modules/checkout';
import { initWishlist } from '../modules/wishlist';
import { initPortalSdkBridge } from '../modules/portal-sdk-bridge';
import { initHomeWave } from '../modules/home-wave';
import supportWidget from '../modules/support-widget';

document.documentElement.classList.add('js');
initI18n();
initNavigation();
initCheckout();
initWishlist();
initPortalSdkBridge();
initHomeWave();
supportWidget.initSupportWidget({ brandSlug: 'luni' });
