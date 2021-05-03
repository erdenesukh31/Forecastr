exports.config = {
  framework: 'jasmine',
  seleniumAddress: 'http://localhost:4444/wd/hub',
  specs: ['./e2e_testing/login.js'],
  capabilities: {
    chromeOptions: {
      args: ["--headless"]
    },
    'browserName': 'chrome'
  }
}