import {
	DownloadIcon,
	EditIcon,
	ExternalLink,
	FileIcon,
	FilesIcon,
	KeyIcon,
	LucideIcon,
	RotateCwIcon,
	SearchIcon,
	TableIcon,
	TrashIcon,
} from "lucide-react";
import { $path } from "safe-routes";

import { Agent } from "~/lib/model/agents";
import { runStateToBadgeColor } from "~/lib/model/runs";
import { Thread } from "~/lib/model/threads";
import { Workflow } from "~/lib/model/workflows";
import { ThreadsService } from "~/lib/service/api/threadsService";
import { PaginationInfo } from "~/lib/service/pagination";
import { cn, noop } from "~/lib/utils";

import {
	useThreadCredentials,
	useThreadFiles,
	useThreadKnowledge,
	useThreadTables,
} from "~/components/chat/shared/thread-helpers";
import { ConfirmationDialog } from "~/components/composed/ConfirmationDialog";
import { PaginationActions } from "~/components/composed/PaginationActions";
import { Truncate } from "~/components/composed/typography";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "~/components/ui/accordion";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { ClickableDiv } from "~/components/ui/clickable-div";
import { Input } from "~/components/ui/input";
import { Link } from "~/components/ui/link";
import { Skeleton } from "~/components/ui/skeleton";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "~/components/ui/tooltip";
import { useConfirmationDialog } from "~/hooks/component-helpers/useConfirmationDialog";
import { usePagination } from "~/hooks/pagination/usePagination";

interface ThreadMetaProps {
	entity: Agent | Workflow;
	thread: Thread;
	className?: string;
}

const pageSize = 10;

export function ThreadMeta({ entity, thread, className }: ThreadMetaProps) {
	const from = $path("/threads/:id", { id: thread.id });
	const isAgent = entity.id.startsWith("a");

	const assistantLink = isAgent
		? $path("/agents/:agent", { agent: entity.id }, { from })
		: $path("/workflows/:workflow", { workflow: entity.id });

	const fileStore = usePagination({ pageSize });

	const getFiles = useThreadFiles(
		thread.id,
		fileStore.paginationParams,
		fileStore.search
	);
	const { items: files } = getFiles.data ?? {};

	if (getFiles.data) fileStore.updateTotal(getFiles.data.total);

	const getKnowledge = useThreadKnowledge(thread.id);
	const { data: knowledge = [] } = getKnowledge;

	const { getCredentials, deleteCredential } = useThreadCredentials(thread.id);
	const { data: credentials = [] } = getCredentials;

	const { dialogProps, interceptAsync } = useConfirmationDialog();

	const tableStore = usePagination({ pageSize });
	const getTables = useThreadTables(
		thread.id,
		tableStore.paginationParams,
		tableStore.search
	);
	const { items: tables } = getTables.data ?? {};

	if (getTables.data) tableStore.updateTotal(getTables.data.total);

	return (
		<Card className={cn("bg-0 h-full overflow-hidden", className)}>
			<CardContent className="space-y-4 pt-6">
				<div className="overflow-hidden rounded-md bg-muted p-4">
					<table className="w-full">
						<tbody>
							<tr className="border-foreground/25">
								<td className="py-2 pr-4 font-medium">Created</td>
								<td className="text-right">
									{new Date(thread.created).toLocaleString()}
								</td>
							</tr>
							<tr className="border-foreground/25">
								<td className="py-2 pr-4 font-medium">
									{isAgent ? "Agent" : "Workflow"}
								</td>
								<td className="text-right">
									<div className="flex items-center justify-end gap-2">
										<span>{entity.name}</span>

										<Link
											to={assistantLink}
											as="button"
											variant="ghost"
											size="icon"
										>
											{isAgent ? (
												<EditIcon className="h-4 w-4" />
											) : (
												<ExternalLink className="h-4 w-4" />
											)}
										</Link>
									</div>
								</td>
							</tr>
							<tr className="border-foreground/25">
								<td className="py-2 pr-4 font-medium">State</td>
								<td className="text-right">
									<Badge
										variant="outline"
										className={cn(
											runStateToBadgeColor(thread.state),
											"text-white"
										)}
									>
										{thread.state}
									</Badge>
								</td>
							</tr>
							{thread.currentRunId && (
								<tr className="border-foreground/25">
									<td className="py-2 pr-4 font-medium">Current Run ID</td>
									<td className="text-right">{thread.currentRunId}</td>
								</tr>
							)}
							{thread.parentThreadId && (
								<tr className="border-foreground/25">
									<td className="py-2 pr-4 font-medium">Parent Thread ID</td>
									<td className="text-right">{thread.parentThreadId}</td>
								</tr>
							)}
							{thread.lastRunID && (
								<tr className="border-foreground/25">
									<td className="py-2 pr-4 font-medium">Last Run ID</td>
									<td className="text-right">{thread.lastRunID}</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>

				<Accordion type="multiple" className="mx-2">
					<ThreadMetaAccordionItem
						value="files"
						icon={FilesIcon}
						title="Files"
						isLoading={getFiles.isValidating}
						onRefresh={() => getFiles.mutate()}
						setSearch={fileStore.debouncedSearch}
						items={files ?? []}
						pagination={fileStore}
						setPage={fileStore.setPage}
						renderItem={(file) => (
							<ClickableDiv
								key={file.name}
								onClick={() =>
									ThreadsService.downloadFile(thread.id, file.name)
								}
							>
								<li className="flex items-center gap-2">
									<Tooltip>
										<TooltipTrigger asChild>
											<Button variant="ghost" size="icon-sm">
												<DownloadIcon />
											</Button>
										</TooltipTrigger>

										<TooltipContent>Download</TooltipContent>
									</Tooltip>
									<Truncate
										className="w-fit flex-1"
										tooltipContentProps={{ align: "start" }}
									>
										{file.name}
									</Truncate>
								</li>
							</ClickableDiv>
						)}
						renderSkeleton={(index) => (
							<div key={index} className="flex items-center gap-2">
								<Skeleton className="rounded-full">
									<Button size="icon-sm" variant="ghost">
										<DownloadIcon />
									</Button>
								</Skeleton>

								<Skeleton className="flex-1 rounded-full">
									<p className="text-transparent">.</p>
								</Skeleton>
							</div>
						)}
					/>

					<ThreadMetaAccordionItem
						value="knowledge"
						icon={FilesIcon}
						title="Knowledge Files"
						isLoading={getKnowledge.isValidating}
						onRefresh={() => getKnowledge.mutate()}
						items={knowledge}
						renderItem={(file) => (
							<li key={file.id} className="flex items-center">
								<FileIcon className="mr-2 h-4 w-4" />
								<p>{file.fileName}</p>
							</li>
						)}
					/>

					<ThreadMetaAccordionItem
						value="credentials"
						icon={KeyIcon}
						title="Credentials"
						isLoading={getCredentials.isValidating}
						onRefresh={() => getCredentials.mutate()}
						items={credentials}
						renderItem={(credential) => (
							<li
								key={credential.name}
								className="flex items-center justify-between"
							>
								<p>{credential.name}</p>

								<Button
									size="icon-sm"
									variant="ghost"
									onClick={() =>
										interceptAsync(() =>
											deleteCredential.executeAsync(credential.name)
										)
									}
								>
									<TrashIcon />
								</Button>
							</li>
						)}
					/>

					<ThreadMetaAccordionItem
						value="tables"
						icon={TableIcon}
						title="Tables"
						isLoading={getTables.isValidating}
						onRefresh={() => getTables.mutate()}
						items={tables ?? []}
						pagination={tableStore}
						setPage={tableStore.setPage}
						renderItem={(table) => (
							<li key={table.name}>
								<p>{table.name}</p>
							</li>
						)}
						renderSkeleton={(index) => (
							<li key={index} className="flex items-center">
								<Skeleton className="rounded-full">
									<p className="text-transparent">.</p>
								</Skeleton>
							</li>
						)}
					/>
				</Accordion>

				<ConfirmationDialog
					{...dialogProps}
					title="Delete Credential?"
					description="You will need to re-authenticate to use any tools that require this credential."
					confirmProps={{
						variant: "destructive",
						loading: deleteCredential.isLoading,
						disabled: deleteCredential.isLoading,
					}}
				/>
			</CardContent>
		</Card>
	);
}

type ThreadMetaAccordionItemProps<T> = {
	value: string;
	icon: LucideIcon;
	title: string;
	isLoading?: boolean;
	onRefresh?: (e: React.MouseEvent) => void;
	items: T[];
	renderItem: (item: T) => React.ReactNode;
	renderSkeleton?: (
		index: number,
		renderItem: (item: T) => React.ReactNode
	) => React.ReactNode;
	emptyMessage?: string;
	pagination?: PaginationInfo;
	setPage?: (page: number) => void;
	setSearch?: (search: string) => void;
};

function ThreadMetaAccordionItem<T>(props: ThreadMetaAccordionItemProps<T>) {
	const Icon = props.icon;
	return (
		<AccordionItem value={props.value}>
			<AccordionTrigger>
				<div className="flex w-full items-center justify-between">
					<span className="flex items-center">
						<Icon className="mr-2 h-4 w-4" />
						{props.title}
					</span>

					{props.onRefresh && (
						<Button
							variant="ghost"
							size="icon-sm"
							loading={props.isLoading}
							onClick={(e) => {
								e.stopPropagation();
								props.onRefresh?.(e);
							}}
						>
							<RotateCwIcon />
						</Button>
					)}
				</div>
			</AccordionTrigger>

			<AccordionContent className="mx-4 space-y-2 pt-2">
				{props.setSearch && (
					<Input
						startContent={<SearchIcon />}
						placeholder="Search"
						onChange={(e) => props.setSearch?.(e.target.value)}
					/>
				)}

				<ul className="space-y-2">
					{props.items.length ? (
						props.items.map((item) => props.renderItem(item))
					) : props.isLoading && props.renderSkeleton ? (
						Array.from({ length: props.pagination?.pageSize ?? 10 }).map(
							(_, index) => props.renderSkeleton?.(index, props.renderItem)
						)
					) : (
						<li className="flex items-center">
							<p>{props.emptyMessage || `No ${props.title.toLowerCase()}`}</p>
						</li>
					)}
				</ul>

				{props.pagination && (
					<PaginationActions
						{...props.pagination}
						onPageChange={props.setPage ?? noop}
					/>
				)}
			</AccordionContent>
		</AccordionItem>
	);
}
