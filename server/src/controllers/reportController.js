import reportService from '../services/ReportService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const getReport = asyncHandler(async (req, res) => {
  const { reportType } = req.params;
  const { projectId, sprintId, startDate, endDate, format } = req.query;

  const reportData = await reportService.generateReport(reportType, {
    organizationId: req.params.orgId,
    workspaceId: req.params.workspaceId,
    projectId,
    sprintId,
    startDate,
    endDate,
  });

  if (format === 'csv') {
    const csv = reportService.generateCsv(reportType, reportData);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${reportType}_${Date.now()}.csv"`);
    return res.status(200).send(csv);
  }

  res.status(200).json(new ApiResponse(200, 'Report generated.', { report: reportData }));
});
