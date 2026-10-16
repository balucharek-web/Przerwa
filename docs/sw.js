/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-7e5eb42b'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "index.html",
    "revision": "1e6442c453020d39e7f3cad0c4057f3d"
  }, {
    "url": "icon-512.png",
    "revision": "d753b9af0c0abd740ea539bed4b2ea1d"
  }, {
    "url": "icon-192.png",
    "revision": "72fe89656e95b201dd9b0ab6ee987717"
  }, {
    "url": "favicon.png",
    "revision": "72fe89656e95b201dd9b0ab6ee987717"
  }, {
    "url": "apple-touch-icon.png",
    "revision": "72fe89656e95b201dd9b0ab6ee987717"
  }, {
    "url": "icons/icon-512.png",
    "revision": "d753b9af0c0abd740ea539bed4b2ea1d"
  }, {
    "url": "icons/icon-192.png",
    "revision": "72fe89656e95b201dd9b0ab6ee987717"
  }, {
    "url": "assets/workbox-window.prod.es5-Bd17z0YL.js",
    "revision": null
  }, {
    "url": "assets/index-FCgUV5f_.js",
    "revision": null
  }, {
    "url": "assets/index-DP09k6N1.css",
    "revision": null
  }, {
    "url": "apple-touch-icon.png",
    "revision": "72fe89656e95b201dd9b0ab6ee987717"
  }, {
    "url": "favicon.png",
    "revision": "72fe89656e95b201dd9b0ab6ee987717"
  }, {
    "url": "icon-192.png",
    "revision": "72fe89656e95b201dd9b0ab6ee987717"
  }, {
    "url": "icon-512.png",
    "revision": "d753b9af0c0abd740ea539bed4b2ea1d"
  }, {
    "url": "manifest.webmanifest",
    "revision": "c4e40d6b8516d1bf3d945dd1c155be59"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html")));

}));
