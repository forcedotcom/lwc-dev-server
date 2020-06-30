/**
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

const APEX_REGEX_CONTINUATION = /^(@salesforce\/apexContinuation)(?:\/([\w-]+\.[\w-]+(?:\.[\w-]+)?))?$/;

function matchesApexScopedModule(id: string) {
    return id && id.match(APEX_REGEX_CONTINUATION);
}

export default function plugin() {
    return {
        name: 'rollup-plugin-apex-continuation',
        resolvedId(id: string) {
            return matchesApexScopedModule(id) ? id : null;
        },
        loadId(id: string) {
            if (matchesApexScopedModule(id)) {
                throw 'Not supported';
            }
        }
    };
}
