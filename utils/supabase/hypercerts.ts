import { HYPERCERTS_GRAPHQL_ENDPOINT } from "@/config/graphql";
import {
	getHyperboardsByIdQuery,
	getHypercertsByHypercertIdQuery,
} from "@/graphql/queries";
import request from "graphql-request";
import { hyperboardId } from "@/config/hypercert";

export const fetchHypercerts = async () => {
	try {
        const res = await request(HYPERCERTS_GRAPHQL_ENDPOINT, getHyperboardsByIdQuery, {
            id: hyperboardId,
        });
		// const hypercertIds = await getHypercertIds();
		const hypercertIds =
			res.hyperboards?.data?.[0]?.sections?.data?.[0]?.entries.map(
				(entry) => entry.id,
			);
		if (!hypercertIds) {
			const errorMessage = "No hypercert IDs found (status code: 404)";
			throw new Error(errorMessage);
		}
		console.log("Hypercert IDs", hypercertIds);

		const hypercertPromises = hypercertIds.map((hypercertId) =>
			request(HYPERCERTS_GRAPHQL_ENDPOINT, getHypercertsByHypercertIdQuery, {
				hypercert_id: hypercertId,
			}),
		);
		const hypercertsData = await Promise.all(hypercertPromises);
		// Extract data from the first index of each hypercerts.data
		const hypercerts = hypercertsData.map(
			(hypercert) => hypercert?.hypercerts?.data?.[0] || null,
		);

		return {
			data: hypercerts.filter((hypercert) => hypercert != null),
		};
	} catch (error) {
		return {
			error: error as Error,
		};
	}
};
