// @ts-ignore
window.BittapWalletInjected = {
    sayHello: function(b) {
        console.log('Hello from the injected object!', b);
    },
    myProperty: 'This is a property from the injected object'
};

console.log('Injected object has been added to the window!');