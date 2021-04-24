// describe('angularjs homepage todo list', function () {
//     it('should add a todo', function () {
//         browser.get('https://localhost:4200/login');
//         expect(1).toEqual(1)

const { element, browser } = require("protractor");

//         // element(by.model('todoList.todoText')).sendKeys('write first protractor test');
//         // element(by.css('[value="add"]')).click();

//         // var todoList = element.all(by.repeater('todo in todoList.todos'));
//         // expect(todoList.count()).toEqual(3);
//         // expect(todoList.get(2).getText()).toEqual('write first protractor test');

//         // // You wrote your first test, cross it off the list
//         // todoList.get(2).element(by.css('input')).click();
//         // var completedAmount = element.all(by.css('.done-true'));
//         // expect(completedAmount.count()).toEqual(2);
//     });
// });

describe('basic tests', function () {
    it('Says hello world', function () {
        browser.get('https://angularjs.org');

        var welcomeMessage = element.all(by.css('.text-display-1'));
        expect(welcomeMessage.get(0).getText()).toEqual('Why AngularJS?');
    });
    // it('Say hello world', function () {
    //     browser.get('http://localhost:4200/forecast');
    //     // var loginCard = element.all(by.tagName('mat-crad'));
    //     element(by.id("mat-input-0")).sendKeys("michael.danninger@capgemini.com");
    //     element(by.id("mat-input-1")).sendKeys("Password1!");
    //     element(by.css("login-button")).click();
    //     // browser.waitForAngularEnabled(true);
    //     browser.get('http://localhost:4200/forecast', 10000);
    //     expect(element(by.css("user"))).toEqual("Michael Danninger ")
    // });
    // it('Say hello world', function () {
    //     browser.get('https://angularjs.org');
    //     element(by.model('yourName')).sendKeys('World');
    //     var welcomeMessage = element.all(by.tagName('h1'));
    //     expect(welcomeMessage.get(1).getText()).toEqual('Hello World!');
    // });

});