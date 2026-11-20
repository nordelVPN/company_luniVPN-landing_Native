const demo = require('./demo');
function createServices(mode = 'demo') { if (mode !== 'demo') throw new Error(`Unsupported DATA_MODE: ${mode}`); return demo; }
module.exports = { createServices };
