import * as auth from './auth.svelte.ts';
import * as flags from './flags.ts';
import { brands, categories, items, tags, units, vendors } from './service-stores.ts';

export const store = { flags, auth, brands, categories, items, tags, units, vendors };
