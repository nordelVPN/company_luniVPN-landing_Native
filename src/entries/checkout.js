import '../styles/base.scss';
import '../styles/pages/checkout.scss';
import { initNavigation } from '../modules/navigation';
import { initCheckout } from '../modules/checkout';
document.documentElement.classList.add('js');
initNavigation();
initCheckout();
