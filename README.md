### About Bittap wallet

Decentralized solutions on Taproot Assets and Lightning Network

The BitTap team aims to build a decentralized infrastructure for applications on Taproot Assets protocol and Lightning Network. Our first product is a decentralized wallet based on the Taproot Assets protocol. This wallet is a truly non-custodial Taproot Assets wallet, addressing the issue of asset centralization by trading platforms and providing users with the same security and user experience like what MetaMask wallet does on Ethereum.

### Project Structure

- `src` - main source.
  - `content-script` - scripts and components to be injected as `content_script`
    - `iframe` content script iframe vue3 app which will be injected into page
  - `background` - scripts for background.
  - `popup` - popup vuejs application root
    - `pages` - popup pages
  - `options` - options vuejs application root
    - `pages` - options pages
  - `setup` - Page for Install and Update chrome extension events
    - `pages` - pages for install and update events
  - `offscreen` - Chrome extension offscreen pages, can be used for audio, screen recording
  - `pages` - application pages, common to all views (About, Contact, Authentication etc)
  - `components` - auto-imported Vue components that are shared in popup and options page.
  - `assets` - assets used in Vue components
- `dist` - built files, also serve stub entry for Vite on development.

### Extra info

In [src/background/index.ts](./src/background/index.ts) you can find an example of chrome.runtime.onInstalled.addListener.

We add `?type` to the url to tell if it's update or install event. Then in [src/setup/pages/index.ts](./src/setup/pages/index.ts) we check for the `type` and show the appropriate page.

### Development

```bash
git clone https://github.com/bittap-protocol/bittap-wallet.git
npm i -g pnpm
pnpm i
pnpm dev
```

Then **load extension in browser with the `dist/dev` folder**.

### Build

To build the extension, run

```bash
pnpm build
```

### Build zip file

To build the extension, run

```bash
pnpm buildZip
```


# Links
[Official website](https://bittap.org/)
[Document center](https://doc.bittap.org/)
[Api Docs](https://doc.bittap.org/developer-guides/api-reference)
[JS SDK Docs](https://doc.bittap.org/developer-guides/js-sdk)
[Privacy Policy](https://doc.bittap.org/wallet-product/privacy-policy)

