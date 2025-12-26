import React, { useMemo } from "react";
import { Box, Divider, Typography } from "@mui/material";
import ClassReportTable from "./ClassReportTable";

interface AllClassReportTableProps {
	/**
	 * Expected shape:
	 * {
	 *   success: boolean;
	 *   data: {
	 *     term1?: TermReport;
	 *     term2?: TermReport;
	 *     term3?: TermReport;
	 *   }
	 * }
	 */
	reportData?: any;
	isLoading: boolean;
	isMobile: boolean;
    isTablet?: boolean;
}

function AllClassReportTable({ reportData, isLoading, isMobile, isTablet }: AllClassReportTableProps) {
	const termReports = useMemo(() => {
		if (!reportData || !reportData.data) return [] as any[];

		const { term1, term2, term3 } = reportData.data;

		const result: Array<{ key: string; termData: any }> = [];

		if (term1) result.push({ key: "term1", termData: term1 });
		if (term2) result.push({ key: "term2", termData: term2 });
		if (term3) result.push({ key: "term3", termData: term3 });

		return result;
	}, [reportData]);

	if (!termReports.length) {
		return (
			<Box>
				<Typography variant="body2" align="center">
					No term-wise class report data available.
				</Typography>
			</Box>
		);
	}

	return (
		<Box display="flex" flexDirection="column" gap={4}>
			{termReports.map(({ key, termData }, index) => {
				const hasRequiredFields = termData?.grade && termData?.className && termData?.term;
				const title = hasRequiredFields
					? `Grade ${termData.grade} ${termData.className} Class Overall Report - ${termData.term}`
					: `Term ${index + 1}`;

				return (
					<Box key={key}>
						{index > 0 && <Divider sx={{ mb: 3 }} />}
						<ClassReportTable
							reportData={{ data: termData }}
							isLoading={isLoading}
							isMobile={isMobile}
                            isTablet={isTablet}
							title={title}
						/>
					</Box>
				);
			})}
		</Box>
	);
}

export default AllClassReportTable;

