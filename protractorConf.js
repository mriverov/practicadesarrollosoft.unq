exports.config = {
  seleniumAddress: 'http://localhost:4444/wd/hub',
  specs: ['spec/trips.integral.spec.js'],
  capabilities: {
    browserName: 'chrome'
  }

};