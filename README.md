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

And then pack files under `dist`, you can upload `dist.crx` or `dist.xpi` to appropriate extension store.

## Contributors

<!-- readme: collaborators,contributors -start -->
<table>
<tr>
    <td align="center">
        <a href="https://github.com/mubaidr">
            <img src="https://avatars.githubusercontent.com/u/2222702?v=4" width="100;" alt="mubaidr"/>
            <br />
            <sub><b>Muhammad Ubaid Raza</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/ultimateshadsform">
            <img src="https://avatars.githubusercontent.com/u/151234273?v=4" width="100;" alt="ultimateshadsform"/>
            <br />
            <sub><b>Alexander</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/baramofme">
            <img src="https://avatars.githubusercontent.com/u/44565599?v=4" width="100;" alt="baramofme"/>
            <br />
            <sub><b>Jihoon Yi</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/justorez">
            <img src="https://avatars.githubusercontent.com/u/17308328?v=4" width="100;" alt="justorez"/>
            <br />
            <sub><b>Null</b></sub>
        </a>
    </td></tr>
</table>
<!-- readme: collaborators,contributors -end -->

## Credits

This template is heavenly inspired by: https://github.com/antfu/vitesse-webext
# bittap-wallet
