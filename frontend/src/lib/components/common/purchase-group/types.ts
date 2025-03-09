import { ServiceTypes } from '$lib/service/index.ts';

export type PurchaseGroup = {
    date: string;
    total: number;
    purchases: ServiceTypes.Purchase[];
};
