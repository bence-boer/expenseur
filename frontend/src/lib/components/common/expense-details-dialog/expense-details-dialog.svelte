<script lang="ts">
    import { ExpenseMaintainDialog, type ExpenseView } from '$lib/components/common/expense-maintain-dialog';
    import { Tag } from '$lib/components/common/tag';
    import { Button } from '$lib/components/ui/button';
    import * as Dialog from '$lib/components/ui/dialog';
    import Separator from '$lib/components/ui/separator/separator.svelte';
    import { number_formatter } from '$lib/consts';
    import { service, ServiceTypes } from '$lib/service';
    import { format_currency } from '$lib/utils';
    import { Edit, X } from '@lucide/svelte';
    import { toast } from 'svelte-sonner';

    type Props = {
        open: boolean;
        expense?: ServiceTypes.Expense;
        on_expense_updated?: () => void;
    };

    let { open = $bindable(), expense, on_expense_updated = () => {} }: Props = $props();

    const format = $derived((value: number) => `${number_formatter.format(value)} ${expense.unit}`);

    let maintain_dialog_open = $state(false);
    let maintain_dialog_mode: 'CREATE' | 'UPDATE' = $state('UPDATE');

    const open_edit_dialog = () => {
        if (expense) {
            maintain_dialog_mode = 'UPDATE';
            maintain_dialog_open = true;
        } else {
            console.error('Cannot edit expense: Expense data is missing.');
            toast.error('Cannot edit expense: Expense data is missing.');
        }
    };

    const handle_expense_updated = async (updated_expense_data: ExpenseView) => {
        if (!expense) {
            toast.error('Original expense data not found for update.');
            return Promise.reject('Original expense data not found');
        }
        return service
            .update_expense(expense.id, {
                item_id: updated_expense_data.item_id,
                brand_id: updated_expense_data.brand_id,
                quantity: updated_expense_data.quantity,
                price: updated_expense_data.price,
                details: updated_expense_data.details
                    .split(', ')
                    .map((detail) => detail.trim())
                    .filter(Boolean),
                tag_ids: updated_expense_data.tag_ids
            })
            .then(() => {
                toast.success('Expense updated successfully!');
                maintain_dialog_open = false;
                open = false;
                on_expense_updated();
            });
    };
</script>

{#snippet dotted(key: string, value?: string)}
    {#if value}
        <div class="flex items-center gap-2">
            <span>{key}</span>
            <span class="dots text-muted-foreground"></span>
            <span class="text-nowrap text-muted-foreground">{value}</span>
        </div>
    {/if}
{/snippet}

<Dialog.Root bind:open>
    <Dialog.Content class="sm:max-w-[425px]" escapeKeydownBehavior="close" interactOutsideBehavior="close">
        <Dialog.Header>
            <Dialog.Title class="text-left">
                <div class="flex justify-between items-center">Expense Details</div>
            </Dialog.Title>
        </Dialog.Header>

        <Separator />
        <div class="flex flex-col overflow-hidden gap-2 py-2">
            {@render dotted('Item', expense.item)}
            {@render dotted('Brand', expense.brand)}
            {@render dotted('Quantity', format(expense.quantity))}
            {@render dotted('Price', format_currency(expense.price))}
            {@render dotted('Details', expense.details)}
        </div>
        <Separator />
        {#if expense.tags?.length}
            <div class="flex w-full flex-wrap justify-start gap-2">
                {#each expense.tags as tag}
                    <Tag {tag} />
                {/each}
            </div>
        {/if}

        <Dialog.Footer class="flex flex-row justify-stretch gap-2">
            <Button variant="outline" onclick={open_edit_dialog} class="w-full">
                <Edit />
                Edit
            </Button>
            <Button variant="outline" onclick={() => (open = false)} class="w-full">
                <X />
                Close
            </Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>

<ExpenseMaintainDialog bind:open={maintain_dialog_open} {expense} mode={maintain_dialog_mode} submit={handle_expense_updated} />
