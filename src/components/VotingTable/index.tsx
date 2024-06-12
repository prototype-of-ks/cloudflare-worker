import * as React from 'react';
import {
  CaretSortIcon,
  ChevronDownIcon,
  DotsHorizontalIcon,
} from '@radix-ui/react-icons';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Input } from '../ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
// import { CopyIcon } from '@radix-ui/react-icons';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import classNames from 'classnames';

export function NotificationDialog({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>AI Companion Invitation</DialogTitle>
          <DialogDescription>
            The host of meeting invites you to join AI Companion.
          </DialogDescription>
        </DialogHeader>
        {/* <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Input
              id="link"
              defaultValue="https://ui.shadcn.com/docs/installation"
              readOnly
            />
          </div>
          <Button type="submit" size="sm" className="px-3">
            <span className="sr-only">Copy</span>
            <CopyIcon className="h-4 w-4" />
          </Button>
        </div> */}
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button
              type="button"
              variant="default"
              onClick={() => setOpen(false)}
            >
              Accept
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const data: ZoomParticipant[] = [
  {
    id: 'm5gr84i9',
    amount: 316,
    status: 'success',
    email: 'ken99@yahoo.com',
    username: 'Sijia Zhu',
    joinedAICompanion: true,
    allowedCaption: true,
    idea: 'Open Zoom App',
  },
  {
    id: '3u1reuv4',
    amount: 242,
    status: 'success',
    email: 'Abe45@gmail.com',
    username: 'Koyu Yu',
    joinedAICompanion: false,
    allowedCaption: false,
    idea: 'Open camera',
  },
  {
    id: 'derv1ws0',
    amount: 837,
    status: 'processing',
    email: 'Monserrat44@gmail.com',
    username: 'Carlos Zhang',
    joinedAICompanion: false,
    allowedCaption: false,
    idea: 'Show Notification in Video',
  },
  {
    id: '5kma53ae',
    amount: 874,
    status: 'success',
    email: 'Silas22@gmail.com',
    username: 'Darren Zhang',
    joinedAICompanion: true,
    allowedCaption: false,
    idea: 'Text box to video',
  },
  //   {
  //     id: 'bhqecj4p',
  //     amount: 721,
  //     status: 'failed',
  //     email: 'carmella@hotmail.com',
  //     username: 'Jack Yang',
  //     joinedAICompanion: true,
  //     allowedCaption: false,
  //     idea: 'Idea 5',
  //   },
  //   {
  //     id: 'bhqecj4a',
  //     amount: 721,
  //     status: 'failed',
  //     email: 'carmella@hotmail.com',
  //     username: 'Mark Ke',
  //     joinedAICompanion: true,
  //     allowedCaption: false,
  //     idea: 'Idea 6',
  //   },
];

export type ZoomParticipant = {
  id: string;
  amount: number;
  status: 'pending' | 'processing' | 'success' | 'failed';
  email: string;
  username: string;
  joinedAICompanion?: boolean;
  allowedCaption?: boolean;
  idea: string;
};

interface VotingTableProps {
  drawImage: (options: {
    title?: string;
    text?: string;
    success?: boolean;
  }) => void;
}

const VotingTable: React.FC<VotingTableProps> = ({ drawImage }) => {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [, update] = React.useState({});

  const columns: ColumnDef<ZoomParticipant>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'idea',
      header: 'Idea',
      cell: ({ row }) => {
        const idea = row.getValue('idea') as string;
        return (
          <div className="flex flex-row items-center gap-2">
            <span className="whitespace-nowrap">{idea}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'username',
      header: 'Author',
      cell: ({ row }) => {
        const username = row.getValue('username') as string;
        return (
          <div className="flex flex-row items-center gap-2">
            <Avatar>
              <AvatarImage alt="@shadcn" width="20" height="20" />
              <AvatarFallback>{`${username
                .split(/\s/)[0][0]
                .toUpperCase()}${username
                .split(/\s/)[1][0]
                .toUpperCase()}`}</AvatarFallback>
            </Avatar>
            <span className="whitespace-nowrap">{username}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'joinedAICompanion',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Vote
            <CaretSortIcon className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const original = row.original;
        return (
          <div className="flex items-center">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                const idea = original.idea;
                original.joinedAICompanion = !original.joinedAICompanion;
                update({});
                drawImage({
                  title: idea,
                  text: original.joinedAICompanion
                    ? 'You have voted for this idea'
                    : 'You have removed your vote',
                  success: original.joinedAICompanion,
                });
              }}
              className={classNames(
                'px-4 rounded-2xl',
                original.joinedAICompanion
                  ? 'border-green-500 bg-green-200 hover:bg-green-300 hover:border-green-500'
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              👍
            </Button>
          </div>
        );
      },
    },
    {
      accessorKey: 'allowedCaption',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Downvote
            <CaretSortIcon className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const original = row.original;
        return (
          <div className="flex items-center">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                original.allowedCaption = !original.allowedCaption;
                update({});
              }}
              className={classNames(
                'px-4 rounded-2xl',
                original.allowedCaption
                  ? 'border-red-500 bg-red-200 hover:bg-red-300 hover:border-red-500'
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              👎
            </Button>
          </div>
        );
      },
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const payment = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <DotsHorizontalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(payment.id)}
              >
                Copy username ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => {}}>
                Open Zoom Dialog
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setOpen(true)}>
                Open App Dialog
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {}}>
                Open Webview Dialog
              </DropdownMenuItem>
              <DropdownMenuItem>View Participant details</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const [open, setOpen] = React.useState(false);

  return (
    <div className="w-[360px] overflow-auto">
      <NotificationDialog open={open} setOpen={setOpen} />
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter Participant..."
          value={
            (table.getColumn('username')?.getFilterValue() as string) ?? ''
          }
          onChange={(event) =>
            table.getColumn('username')?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDownIcon className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{' '}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VotingTable;
