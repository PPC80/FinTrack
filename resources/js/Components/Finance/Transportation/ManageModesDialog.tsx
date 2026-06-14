import { router, useForm } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { type FormEvent, useState } from 'react';

import { Button } from '@/Components/ui/button';
import { Checkbox } from '@/Components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { formatCurrency } from '@/lib/format';
import { type Account, type TransportMode } from '@/types';

interface ManageModesDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    modes: TransportMode[];
    accounts: Account[];
}

export function ManageModesDialog({ open, onOpenChange, modes, accounts }: ManageModesDialogProps) {
    const [editingMode, setEditingMode] = useState<TransportMode | null>(null);
    const [showForm, setShowForm] = useState(false);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        fare: '',
        deducts_from_metro: false,
        default_account_id: '',
    });

    function handleStartCreate() {
        reset();
        setEditingMode(null);
        setShowForm(true);
    }

    function handleStartEdit(mode: TransportMode) {
        setData({
            name: mode.name,
            fare: String(mode.fare),
            deducts_from_metro: mode.deducts_from_metro,
            default_account_id: mode.default_account_id ? String(mode.default_account_id) : '',
        });
        setEditingMode(mode);
        setShowForm(true);
    }

    function handleSubmit(event: FormEvent) {
        event.preventDefault();

        if (editingMode) {
            put(route('transportation.modes.update', editingMode.id), {
                onSuccess: () => {
                    setShowForm(false);
                    setEditingMode(null);
                    reset();
                },
            });
        } else {
            post(route('transportation.modes.store'), {
                onSuccess: () => {
                    setShowForm(false);
                    reset();
                },
            });
        }
    }

    function handleDelete(mode: TransportMode) {
        if (confirm(`Remove "${mode.name}"? It will be deactivated.`)) {
            router.delete(route('transportation.modes.destroy', mode.id), {
                preserveScroll: true,
            });
        }
    }

    function handleClose(isOpen: boolean) {
        if (!isOpen) {
            setShowForm(false);
            setEditingMode(null);
            reset();
        }
        onOpenChange(isOpen);
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Manage Transport Modes</DialogTitle>
                    <DialogDescription>
                        Add, edit, or remove your transport modes.
                    </DialogDescription>
                </DialogHeader>

                {!showForm ? (
                    <div className="flex flex-col gap-3">
                        {modes.length === 0 ? (
                            <p className="py-4 text-center text-sm text-muted-foreground">
                                No transport modes yet. Add one to get started.
                            </p>
                        ) : (
                            <div className="flex max-h-64 flex-col gap-2 overflow-y-auto">
                                {modes.map((mode) => (
                                    <div
                                        key={mode.id}
                                        className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
                                    >
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-sm font-medium">{mode.name}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {formatCurrency(mode.fare)}
                                                {mode.deducts_from_metro && ' · Metro card'}
                                                {mode.default_account && ` · ${mode.default_account.name}`}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-8"
                                                onClick={() => handleStartEdit(mode)}
                                                aria-label={`Edit ${mode.name}`}
                                            >
                                                <Pencil className="size-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-8 text-muted-foreground hover:text-destructive"
                                                onClick={() => handleDelete(mode)}
                                                aria-label={`Remove ${mode.name}`}
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <DialogFooter>
                            <Button variant="outline" onClick={() => handleClose(false)}>
                                Close
                            </Button>
                            <Button onClick={handleStartCreate}>
                                <Plus data-icon="inline-start" />
                                Add Mode
                            </Button>
                        </DialogFooter>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="mode-name">Name</Label>
                            <Input
                                id="mode-name"
                                value={data.name}
                                onChange={(event) => setData('name', event.target.value)}
                                placeholder="e.g., Metro, Bus, Taxi"
                                aria-invalid={!!errors.name}
                            />
                            {errors.name && (
                                <p className="text-sm text-destructive">{errors.name}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="mode-fare">Fare per Trip</Label>
                            <Input
                                id="mode-fare"
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={data.fare}
                                onChange={(event) => setData('fare', event.target.value)}
                                placeholder="0.00"
                                aria-invalid={!!errors.fare}
                            />
                            {errors.fare && (
                                <p className="text-sm text-destructive">{errors.fare}</p>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="mode-metro"
                                checked={data.deducts_from_metro}
                                onCheckedChange={(checked) =>
                                    setData('deducts_from_metro', checked === true)
                                }
                            />
                            <Label htmlFor="mode-metro" className="text-sm font-normal">
                                Deducts from metro card
                            </Label>
                        </div>

                        {!data.deducts_from_metro && (
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="mode-account">Default Payment Source</Label>
                                <Select
                                    value={data.default_account_id}
                                    onValueChange={(value) => setData('default_account_id', value)}
                                >
                                    <SelectTrigger id="mode-account">
                                        <SelectValue placeholder="Use default account" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {accounts.map((account) => (
                                            <SelectItem key={account.id} value={String(account.id)}>
                                                {account.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.default_account_id && (
                                    <p className="text-sm text-destructive">{errors.default_account_id}</p>
                                )}
                            </div>
                        )}

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setShowForm(false);
                                    setEditingMode(null);
                                    reset();
                                }}
                            >
                                Back
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing
                                    ? 'Saving...'
                                    : editingMode
                                      ? 'Update Mode'
                                      : 'Create Mode'}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
