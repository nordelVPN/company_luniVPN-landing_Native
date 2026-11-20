const { plans } = require('../../data/plans');
const { profile, subscription } = require('../../data/fixtures/account');
const copy = (value) => JSON.parse(JSON.stringify(value));
module.exports = { getPlans: () => copy(plans), getProfile: () => copy(profile), getSubscription: () => copy(subscription), createCheckout: async () => ({ status: 'unavailable', message: 'Online payments are not open yet.' }), getCheckoutStatus: async () => ({ status: 'unavailable' }) };
