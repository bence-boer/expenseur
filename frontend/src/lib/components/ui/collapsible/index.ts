import { Collapsible as CollapsiblePrimitive } from 'bits-ui';

const Root: typeof CollapsiblePrimitive.Root = CollapsiblePrimitive.Root;
const Trigger: typeof CollapsiblePrimitive.Trigger = CollapsiblePrimitive.Trigger;
const Content: typeof CollapsiblePrimitive.Content = CollapsiblePrimitive.Content;

export {
    Content,
    Content as CollapsibleContent,
    Root,
    //
    Root as Collapsible,
    Trigger,
    Trigger as CollapsibleTrigger,
};
