"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { cn, isValidEthereumAddress } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
	type HypercertMetadata,
	formatHypercertData,
} from "@hypercerts-org/sdk";
import { Badge } from "../ui/badge";

const HypercertMintSchema = z.object({
	title: z
		.string()
		.min(1, { message: "Hypercert Name is required" })
		.max(50, { message: "Hypercert Name must be less than 50 characters" }),
	description: z
		.string()
		.min(10, {
			message: "Description is required and must be at least 10 characters",
		})
		.max(500, { message: "Description must be less than 500 characters" }),
	link: z.string().url({ message: "Link must be a valid URL" }),
	cardImage: z.string().url("Card image not generated"),
	logo: z.string().url({ message: "Logo Image must be a valid URL" }),
	banner: z
		.string()
		.url({ message: "Background Banner Image must be a valid URL" }),
	tags: z
		.string()
		.refine((val) => val.split(",").every((tag) => tag.trim() !== ""), {
			message:
				"Tags must must not be empty, Multiple tags must be separated by commas",
		}),
	projectDates: z
		.object(
			{
				from: z.date(),
				to: z.date(),
			},
			{
				required_error: "Please select a date range",
			},
		)
		.refine((data) => data.from <= data.to, {
			path: ["projectDates"],
			message: "From date must be before to date",
		}),
	workStartDate: z.date().default(new Date("2024-06-02")),
	workEndDate: z.date().default(new Date("2024-06-30")),
	contributors: z
		.string()
		.refine(
			(value) => {
				// Split the string by ', ' to get individual addresses
				const addresses = value.split(", ").map((addr) => addr.trim());

				// Check if each address matches the Ethereum address pattern
				return addresses.every((address) => isValidEthereumAddress(address));
			},
			{
				message:
					"Each value must be a valid Ethereum address separated by a comma and a space.",
			},
		)
		.transform((value) => value.split(",").map((addr) => addr.trim())),
	acceptTerms: z.boolean(),
	confirmContributorsPermission: z.boolean(),
});

type MintingFormValues = z.infer<typeof HypercertMintSchema>;

const HypercertForm = () => {
	const form = useForm<MintingFormValues>({
		resolver: zodResolver(HypercertMintSchema),
		defaultValues: {
			title: "",
			banner: "",
			description: "",
			logo: "",
			link: "",
			tags: "",
			projectDates: {
				from: new Date("2024-06-02"),
				to: new Date("2024-06-30"),
			},
			workStartDate: new Date("2024-06-02"),
			workEndDate: new Date("2024-06-30"),
			acceptTerms: false,
			confirmContributorsPermission: false,
		},
		mode: "onChange",
	});

	const [badges, setBadges] = useState(["Edge Esmeralda", "Edge City"]);

	const tags = form.watch("tags") || "";

	useEffect(() => {
		if (tags) {
			const tagArray = tags
				.split(",")
				.map((tag) => tag.trim())
				.filter((tag) => tag !== "");
			setBadges(["Edge Esmeralda", "Edge City", ...tagArray]);
		} else {
			setBadges(["Edge Esmeralda", "Edge City"]);
		}
	}, [tags]);

	const onSubmit = (values: MintingFormValues) => {
		const metadata: HypercertMetadata = {
			name: values.title,
			description: values.description,
			image: values.cardImage,
			external_url: values.link,
		};

		const formattedMetadata = formatHypercertData({
			...metadata,
			version: "2.0",
			properties: [],
			impactScope: ["all"],
			excludedImpactScope: [],
			workScope: badges,
			excludedWorkScope: [],
			rights: ["Public Display"],
			excludedRights: [],
			workTimeframeStart: values.projectDates.from.getTime() / 1000,
			workTimeframeEnd: values.projectDates.to.getTime() / 1000,
			impactTimeframeStart: values.projectDates.from.getTime() / 1000,
			impactTimeframeEnd: values.projectDates.to.getTime() / 1000,
			contributors: values.contributors,
		});
		console.log({ formattedMetadata });
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="flex flex-col gap-4"
			>
				<h3 className="text-2xl">General Fields</h3>
				<FormField
					control={form.control}
					name="title"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Hypercert Name</FormLabel>
							<FormControl>
								<Input placeholder="Edge Esmeralda Hypercert" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="logo"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Logo Image</FormLabel>
							<FormControl>
								<Input
									placeholder="https://i.imgur.com/hypercert-logo.png"
									{...field}
								/>
							</FormControl>

							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="banner"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Background Banner Image</FormLabel>
							<FormControl>
								<Input
									placeholder="https://i.imgur.com/hypercert-banner.png"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="description"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Description</FormLabel>
							<FormControl>
								<Textarea
									className="bg-inherit"
									placeholder="Hypercert description"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="link"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Link</FormLabel>
							<FormControl>
								<Input placeholder="https://hypercerts.org" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Separator />
				<h3 className="text-2xl">Hypercert Fields</h3>
				<FormField
					control={form.control}
					name="tags"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Work Scope</FormLabel>
							<FormControl>
								<Textarea
									className="bg-inherit"
									placeholder="Hypercerts, Impact, ..."
									{...field}
								/>
							</FormControl>
							{/* <FormMessage />
					</FormItem>
						<FormItem>
							<FormLabel>Work Scope</FormLabel>
							<Select onValueChange={field.onChange} defaultValue={field.value}>
								<FormControl>
									<SelectTrigger className="border-input">
										<SelectValue />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									<SelectItem value="Edge Esmeralda">Edge Esmeralda</SelectItem>
									<SelectItem value="Edge City">Edge City</SelectItem>
								</SelectContent>
							</Select> */}
							<FormMessage />
							<div className="flex flex-wrap gap-0.5">
								{badges.map((tag) => (
									<Badge key={tag} variant="secondary">
										{tag}
									</Badge>
								))}
							</div>
							{/* {field.value &&
								field.value.filter((tag: string) => tag !== "").length > 0 && (
									<div className="flex flex-wrap gap-0.5">
										{field?.value?.map((tag: string) => (
											<Badge key={tag} variant="secondary">
												{tag}
											</Badge>
										))}
									</div>
								)} */}
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="projectDates"
					render={({ field }) => (
						<FormItem className="flex flex-col">
							<FormLabel>Project start and end date</FormLabel>
							<Popover>
								<PopoverTrigger asChild>
									<FormControl>
										<Button
											variant={"outline"}
											className={cn(
												"w-full max-w-[280px] pl-3 text-left font-normal",
												!field.value && "text-muted-foreground",
											)}
										>
											{field.value.from ? (
												field.value.to ? (
													<>
														{format(field.value.from, "LLL dd, y")} &mdash;{" "}
														{format(field.value.to, "LLL dd, y")}
													</>
												) : (
													format(field.value.from, "LLL dd, y")
												)
											) : (
												<span>Pick a date</span>
											)}
											<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
										</Button>
									</FormControl>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0" align="start">
									<Calendar
										mode="range"
										selected={{
											// biome-ignore lint/style/noNonNullAssertion: <explanation>
											from: field.value.from!,
											to: field.value.to,
										}}
										defaultMonth={field.value.from}
										onSelect={(selectedDates) => {
											field.onChange(selectedDates);
											field.onBlur();
										}}
										disabled={(date) => date < new Date("1900-01-01")}
										initialFocus
									/>
								</PopoverContent>
							</Popover>
							<FormDescription>
								The start and end date of the work considered in the hypercert
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<div className="flex flex-col gap-2 md:flex-row md:justify-between">
					<FormField
						control={form.control}
						name="workStartDate"
						render={({ field }) => (
							<FormItem className="flex flex-col">
								<FormLabel>Work Start Data</FormLabel>
								<Popover>
									<PopoverTrigger asChild>
										<FormControl>
											<Button
												variant={"outline"}
												className={cn(
													"w-[260px] rounded-md border-input pl-3 text-left font-normal",
													!field.value && "text-muted-foreground",
												)}
											>
												{field.value ? (
													format(field.value, "PPP")
												) : (
													<span>Pick a date</span>
												)}
												<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
											</Button>
										</FormControl>
									</PopoverTrigger>
									<PopoverContent className="w-auto p-0" align="start">
										<Calendar
											mode="single"
											selected={field.value}
											onSelect={field.onChange}
											disabled={(date) =>
												date > new Date() || date < new Date("1900-01-01")
											}
											initialFocus
										/>
									</PopoverContent>
								</Popover>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="workEndDate"
						render={({ field }) => (
							<FormItem className="flex flex-col">
								<FormLabel>Work End Data</FormLabel>
								<Popover>
									<PopoverTrigger asChild>
										<FormControl>
											<Button
												variant={"outline"}
												className={cn(
													"w-[260px] rounded-md border-input pl-3 text-left font-normal",
													!field.value && "text-muted-foreground",
												)}
											>
												{field.value ? (
													format(field.value, "PPP")
												) : (
													<span>Pick a date</span>
												)}
												<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
											</Button>
										</FormControl>
									</PopoverTrigger>
									<PopoverContent className="w-auto p-0" align="start">
										<Calendar
											mode="single"
											selected={field.value}
											onSelect={field.onChange}
											disabled={(date) =>
												date > new Date() || date < new Date("1900-01-01")
											}
											initialFocus
										/>
									</PopoverContent>
								</Popover>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
				<FormField
					control={form.control}
					name="contributors"
					render={({ field }) => (
						<FormItem>
							<FormLabel>List of Contributors to the Work</FormLabel>
							<FormControl>
								<Textarea
									className="bg-inherit"
									placeholder="0xWalletAddress1, 0xWalletAddress2, ..."
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="confirmContributorsPermission"
					render={({ field }) => (
						<FormItem className="flex flex-row items-center space-x-3 space-y-0 p-4">
							<FormControl>
								<Checkbox
									checked={field.value}
									onCheckedChange={field.onChange}
								/>
							</FormControl>
							<div className="space-y-1 leading-none">
								<FormLabel>
									I confirm that all listed contributors gave their permission
									to include their work in this hypercert.
								</FormLabel>
							</div>
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="acceptTerms"
					render={({ field }) => (
						<FormItem className="flex flex-row items-center space-x-3 space-y-0 p-4">
							<FormControl>
								<Checkbox
									checked={field.value}
									onCheckedChange={field.onChange}
								/>
							</FormControl>
							<div className="space-y-1 leading-none">
								<FormLabel>
									I agree to the{" "}
									<a
										href="https://hypercerts.org/terms/"
										target="_blank"
										rel="noopener noreferrer"
										className="text-blue-600"
									>
										Terms & Conditions
									</a>
								</FormLabel>
							</div>
						</FormItem>
					)}
				/>
				<Button type="submit" className="flex w-full gap-2 rounded-md py-6">
					Submit
				</Button>
			</form>
		</Form>
	);
};

export { HypercertForm };