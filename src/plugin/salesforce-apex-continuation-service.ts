/**
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { CompileService } from '@webruntime/api';
import plugin from './rollup-plugin-salesforce-apex-continuation';

export class ApexContinuationService implements CompileService {
    getPlugin() {
        return plugin;
    }

    // eslint-disable-next-line no-empty-function
    async initialize() {}

    shutdown() {}
}
