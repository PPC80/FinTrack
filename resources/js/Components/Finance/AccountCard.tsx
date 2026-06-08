import { Banknote, CreditCard, Landmark, MoreVertical, Pencil, Trash2 } from 'lucide-react';

import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';
import { type Account } from '@/types';

interface AccountCardProps {
    account: Account;
    onEdit: (account: Account) => void;
    onAdjustBalance: (account: Account) => void;
    onDelete: (account: Account) => void;
}

function getAccountIcon(type: Account['type']) {
    switch (type) {
        case 'bank':
            return Landmark;
        case 'cash':
            return Banknote;
        case 'metro_card':
            return CreditCard;
    }
}

function getAccountLabel(type: Account['type']) {
    switch (type) {
        case 'bank':
            return 'Bank';
        case 'cash':
            return 'Cash';
        case 'metro_card':
            return 'Metro Card';
    }
}

export function AccountCard({ account, onEdit, onAdjustBalance, onDelete }: AccountCardProps) {
    const Icon = getAccountIcon(account.type);

    return (
        <Card className={cn(account.is_default && 'border-primary/50')}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="size-5 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-base">{account.name}</CardTitle>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                                {getAccountLabel(account.type)}
                            </span>
                            {account.is_default && (
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                    Default
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Account actions">
                            <MoreVertical className="size-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onAdjustBalance(account)}>
                            <Banknote className="size-4" />
                            Adjust Balance
                        </DropdownMenuItem>
                        {account.type !== 'metro_card' && (
                            <DropdownMenuItem onClick={() => onEdit(account)}>
                                <Pencil className="size-4" />
                                Edit
                            </DropdownMenuItem>
                        )}
                        {account.is_deletable && (
                            <DropdownMenuItem
                                onClick={() => onDelete(account)}
                                className="text-destructive focus:text-destructive"
                            >
                                <Trash2 className="size-4" />
                                Delete
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>

            <CardContent>
                <p className="text-2xl font-bold">{formatCurrency(account.balance)}</p>
            </CardContent>
        </Card>
    );
}
