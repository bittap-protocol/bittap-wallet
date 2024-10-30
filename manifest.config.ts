import { defineManifest } from '@crxjs/vite-plugin'
import packageJson from './package.json'

const { version, name, description, displayName } = packageJson
// Convert from Semver (example: 0.1.0-beta6)
const [major, minor, patch, label = '0'] = version
  // can only contain digits, dots, or dash
  .replace(/[^\d.-]+/g, '')
  // split into version parts
  .split(/[.-]/)

export default defineManifest(async (env) => ({
  name: env.mode === 'staging' ? `[INTERNAL] ${name}` : displayName || name,
  description,
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
    // "256": "icon_256X256.png",
  },
  key: 'ekgmcbpgglflmgcfajnglpbcbdccnnge',
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
  cross_origin_embedder_policy: {
      "value": "require-corp"
  },
  "cross_origin_opener_policy": {
      "value": "same-origin"
    },
  content_security_policy: {
    // extension_pages: "script-src 'self' 'wasm-eval'; object-src 'self';",
    extension_pages: "script-src 'self' 'wasm-unsafe-eval' http://localhost:* http://127.0.0.1:*; object-src 'self'; script-src-elem 'self' http://localhost:* http://127.0.0.1:*;",
    // extension_pages: "script-src 'self'; object-src 'self';",
    sandbox: "sandbox allow-scripts allow-forms allow-popups allow-modals; script-src 'self' 'wasm-eval' 'unsafe-eval' http://localhost:* http://127.0.0.1:*; child-src 'self'; script-src-elem 'self' 'unsafe-inline' http://localhost:* http://127.0.0.1:*;"
  },
  externally_connectable: {
    "matches": ["https://*/*"],
    "ids": ["*"]
  },
  minimum_chrome_version: "88",
  host_permissions: ['*://*/*'],
  // options_page: 'src/options/index.html',
  permissions: ['storage','clipboardWrite',"scripting","activeTab",'tabs'],
  web_accessible_resources: [
    {
      "resources": ["injected.js"],
      matches: ['<all_urls>'],
    },
  ],
}))
