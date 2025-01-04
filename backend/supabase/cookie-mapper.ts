import type { CookieOptions } from '@supabase/ssr';
import type { setCookie } from 'hono/cookie';


type SourceCookieOptionsType = CookieOptions;
type TargetCookieOptionsType = Parameters<typeof setCookie>[3];

type SourceCookieSameSiteType = SourceCookieOptionsType['sameSite'];
type TargetCookieSameSiteType = Exclude<TargetCookieOptionsType, undefined>['sameSite'];

type SourceCookiePriorityType = SourceCookieOptionsType['priority'];
type TargetCookiePriorityType = Exclude<TargetCookieOptionsType, undefined>['priority'];

const map_cookie_same_site = (same_site?: SourceCookieSameSiteType): TargetCookieSameSiteType => {
    if (same_site === undefined) return undefined;
    switch (same_site) {
        case true: return "strict";
        case false: return undefined;
        default: return same_site;
    }
}

const map_cookie_priority = (priority?: SourceCookiePriorityType): TargetCookiePriorityType => {
    if (priority === undefined) return undefined;
    switch (priority) {
        case "low": return "Low";
        case "medium": return "Medium";
        case "high": return "High";
        default: return priority;
    }
}

export const cookie_options_mapper = (cookie_options?: SourceCookieOptionsType): TargetCookieOptionsType => {
    if (cookie_options === undefined) return undefined;
    return {
        ...cookie_options,
        sameSite: map_cookie_same_site(cookie_options?.sameSite),
        priority: map_cookie_priority(cookie_options?.priority)
    }
}