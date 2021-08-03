import { browser, by, element } from "protractor";

class LoginPage {
    private credentials = {
        username: "michael.danninger@capgemini.com",
        password: "Password1!"
    }

    navigateTo() {
        return browser.get("http://localhost:4200/forecast")
    }
    fillCredentials(credentials: any = this.credentials) {
        element(by.id("mat-input-0")).sendKeys(credentials.username);
        element(by.id("mat-input-1")).sendKeys(credentials.password);
        element(by.css("login-button")).click();
    }
    getPageTitleText() {
        return element(by.css("user")).getText();
    }
    getErrorMessage() {
        return element(by.id("mat-error-0")).getText();
    }
}

export { LoginPage }