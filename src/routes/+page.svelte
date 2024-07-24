<script lang="ts">
	import { goto } from '$app/navigation';
	import { Separator } from '$lib/components/ui/separator';
	import * as Table from '$lib/components/ui/table';
	import type { FunctionReturns } from '$lib/types';
	import { supabase } from '../supabase-client';
	import { currency_formatter } from './../lib/consts';

	export let data: {
		spendings_by_category: FunctionReturns['spendings_by_category'];
	};

	let authenticated = false;
	supabase.auth.onAuthStateChange((_, session) => {
		authenticated = session !== null;
	});

	const logout = () => {
		supabase.auth.signOut().then(() => {
			goto('/');
		});
	};
</script>

{#if authenticated}
	<h1 class="text-2xl font-bold sm:text-4xl">Dashboard</h1>
	<Separator class="mb-4 sm:mb-8" />

	{#if data.spendings_by_category}
		<Table.Root>
			<Table.Caption>Spread of spendings by category</Table.Caption>
			<Table.Header>
				<Table.Row>
					<Table.Head>Category</Table.Head>
					<Table.Head class="text-right">Amount</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each data.spendings_by_category as { category, total }}
					<Table.Row>
						<Table.Cell>{category}</Table.Cell>
						<Table.Cell class="text-right">{currency_formatter.format(total)}</Table.Cell>
					</Table.Row>
				{/each}

				<Table.Row>
					<Table.Cell class="font-bold">Total</Table.Cell>
					<Table.Cell class="text-right font-bold">
						{currency_formatter.format(
							data.spendings_by_category.reduce((acc, { total }) => acc + total, 0)
						)}
					</Table.Cell>
				</Table.Row>
			</Table.Body>
		</Table.Root>
	{/if}
{:else}
	<p>You need to login to access this page</p>
{/if}
