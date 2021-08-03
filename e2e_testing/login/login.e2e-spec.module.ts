import { LoginPage } from './login.po';

describe('protractor-tutorial - Login page', () => {
    let page: LoginPage;

    const wrongCredentias = {
        username: 'wrongname',
        password: 'wrongpasswd'
    };

    beforeEach(() => {
        page = new LoginPage();
    });

    it('when user trying to login with wrong credentials he should stay on “login” page and see error notification', () => {
        page.navigateTo();
        page.fillCredentials(wrongCredentias);
        expect(page.getPageTitleText()).toEqual('Login');
        expect(page.getErrorMessage()).toEqual('Problem occured with login process. Please try again later.');
    });

    it('when login is successful — he should redirect to default “public” page', () => {
        page.navigateTo();
        page.fillCredentials();

    });
});