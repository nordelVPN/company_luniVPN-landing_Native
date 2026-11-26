import '../styles/base.scss';
import '../styles/pages/account.scss';
import { initI18n } from '../modules/i18n';
import { initNavigation } from '../modules/navigation';
import { initWishlist } from '../modules/wishlist';
import { initAccountPortal } from '../modules/account';
import { initPortalSdkBridge } from '../modules/portal-sdk-bridge';
import { initHomeWave } from '../modules/home-wave';
import supportWidget from '../modules/support-widget';

document.documentElement.classList.add('js');
initI18n();
initNavigation();
initWishlist();
initAccountPortal();
initPortalSdkBridge();
initHomeWave();
supportWidget.initSupportWidget({ brandSlug: 'luni' });
