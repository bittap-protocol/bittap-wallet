import { defineManifest } from '@crxjs/vite-plugin'
import packageJson from './package.json'

const { version, name, description, displayName } = packageJson
// Convert from Semver (example: 0.1.0-beta6)
const [major, minor, patch, label = '0'] = version
  // can only contain digits, dots, or dash
  .replace(/[^\d.-]+/g, '')
  // split into version parts
  .split(/[.-]/)
// const csp =
//   process.env.NODE_ENV === 'production'
//     ? "script-src 'self' 'wasm-unsafe-eval'; object-src 'self';"
//     : "script-src 'self' 'wasm-unsafe-eval' http://localhost http://127.0.0.1; object-src 'self';";

export default defineManifest(async (env) => ({
  name: env.mode === 'staging' ? `[INTERNAL] ${name}` : displayName || name,
  short_name: env.mode === 'staging' ? `[INTERNAL] ${name}` : displayName || name,
  description: description,
  // up to four numbers separated by dots
  version: `${major}.${minor}.${patch}.${label}`,
  // semver is OK in "version_name"
  version_name: version,
  manifest_version: 3,
  icons: {
    "16": "icon_16X16.png",
    "32": "icon_32X32.png",
    "48": "icon_48X48.png",
    "128": "icon_128X128.png",
    "256": "icon_256X256.png",
  },
  action: {
    default_popup: 'src/popup/index.html',
  },
  background: {
    service_worker: 'src/background/index.ts',
  },
  
  content_scripts: [
    {
      all_frames: true,
      js: ['src/content-script/index.ts'],
      matches: ['<all_urls>'],
      run_at: 'document_start',
    },
  ],
  // cross_origin_embedder_policy: {
  //     "value": "require-corp"
  // },
  // cross_origin_opener_policy: {
  //     "value": "same-origin"
  // },
  content_security_policy: {
    // "script-src 'self' 'wasm-unsafe-eval' 'inline-speculation-rules'
    // extension_pages: "script-src 'self' 'wasm-eval'; object-src 'self';",
    // extension_pages: "script-src 'self' 'wasm-unsafe-eval' http://localhost:* http://127.0.0.1:*; object-src 'self'; script-src-elem 'self' http://localhost:* http://127.0.0.1:*;",
    extension_pages: "script-src 'self' 'wasm-unsafe-eval'; object-src 'self'; script-src-elem 'self'  http://localhost:* http://127.0.0.1:* chrome-extension://*;",
    // // extension_pages: "script-src 'self'; object-src 'self';",
    // sandbox: "sandbox allow-scripts allow-forms allow-popups allow-modals; script-src 'self' 'wasm-eval' 'unsafe-eval' http://localhost:* http://127.0.0.1:* https://vite.dev/*; child-src 'self'; script-src-elem 'self' 'unsafe-inline' http://localhost:* http://127.0.0.1:* https://vite.dev/*;"
    // "extension_pages": "script-src 'self' 'wasm-unsafe-eval'; script-src 'self' 'wasm-unsafe-eval' 'inline-speculation-rules'",
    // "sandbox": "sandbox allow-scripts allow-forms allow-popups allow-modals; script-src 'self' 'wasm-eval' 'unsafe-eval'; child-src 'self';"
    // extension_pages: `script-src 'self' 'wasm-unsafe-eval' http://localhost http://127.0.0.1; object-src 'self';script-src-elem 'self' http://localhost http://127.0.0.1;`,
    // sandbox: `sandbox allow-scripts allow-forms allow-popups allow-modals; script-src 'self' 'wasm-unsafe-eval' 'unsafe-eval' chrome-extension://* http://localhost http://127.0.0.1 https://vite.dev; child-src 'self'; script-src-elem 'self' 'unsafe-inline' http://localhost http://127.0.0.1 https://vite.dev;`
    // extension_pages: `script-src 'self' 'wasm-unsafe-eval'; object-src 'self';`,
  },
  externally_connectable: {
    "matches": ["<all_urls>"],
    "ids": ["*"]
  },
  homepage_url: 'https://www.bittap.org',
  author: 'https://www.bittap.org',
  minimum_chrome_version: "88",
  // host_permissions: ['<all_urls>'],
  host_permissions: ['*://*/*'],
  // options_page: 'src/options/index.html',
  permissions: ['storage','clipboardWrite','unlimitedStorage','scripting',"activeTab",'tabs'],
  web_accessible_resources: [
    {
      "resources": ["injected.js"],
      matches: ['<all_urls>'],
      "all_frames": true,
      "match_about_blank": false,
      use_dynamic_url: false,
    },
    {
      "resources": ["assets/*"],  // Adjust the path as needed
      "matches": ["<all_urls>"]     // Or a more specific URL pattern
    }
  ],
}))
