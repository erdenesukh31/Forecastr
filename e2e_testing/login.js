
const { element, browser } = require("protractor");

describe('basic tests', function () {

    it('logs in', function () {
        browser.waitForAngularEnabled(false);
        browser.get('http://localhost:4200');

        element(by.id("mat-input-0")).sendKeys("michael.danninger@capgemini.com");
        element(by.id("mat-input-1")).sendKeys("Password1!");
        element(by.css(".login-button")).click();

        browser.sleep(10000)
        expect(browser.getTitle()).toEqual("Capgemini Forecastr")
        browser.sleep(5000)

    });


}
);

