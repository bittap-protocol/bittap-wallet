// @ts-ignore
window.myInjectedObject = {
    sayHello: function(b:string) {
        console.log('Hello from the injected object!', b);
    },
    myProperty: 'This is a property from the injected object'
};

console.log('Injected object has been added to the window!');