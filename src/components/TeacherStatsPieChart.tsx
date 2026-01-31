import * as React from "react";
import {
  Typography,
  Box,
  Paper,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CustomPieChart from "./CustomPieChart";

interface GradeCounts {
  A: number;
  B: number;
  C: number;
  S: number;
  W: number;
}

interface TermStats {
  total: number;
  gradeCounts: GradeCounts;
}

interface TeacherStatsItem {
  year: string;
  gradeId: number;
  gradeName: string;
  classId: number;
  className: string;
  subjectId: number;
  subjectName: string;
  subjectColorCode: string;
  isClassTeacher: boolean;
  classTeacherId: number | null;
  classTeacherData: any;
  totalMarks: number;
  gradeCounts: GradeCounts;
  termStats: {
    [key: string]: TermStats;
  };
}

interface TeacherStatsPieChartProps {
  data: TeacherStatsItem[];
}

// Grade colors for pie chart
const GRADE_COLORS: { [key: string]: string } = {
  A: "#4CAF50", // Green
  B: "#2196F3", // Blue
  C: "#FF9800", // Orange
  S: "#9C27B0", // Purple
  W: "#F44336", // Red
};

// Single Term Pie Chart Component
const TermPieChart = ({
  termName,
  termData,
}: {
  termName: string;
  termData: TermStats;
}) => {
  const chartData = Object.entries(termData.gradeCounts)
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({
      name,
      value,
    }));

  // If no data, show placeholder
  if (chartData.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          p: 2,
        }}
      >
        <Typography variant="subtitle2" fontWeight="bold" mb={1}>
          {termName}
        </Typography>
        <Box
          sx={{
            width: 150,
            height: 150,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f5f5f5",
            borderRadius: "50%",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            No Data
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary" mt={1}>
          Total: {termData.total}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        p: 1,
      }}
    >
      <CustomPieChart
        data={chartData}
        title={termName}
        width={220}
        height={220}
        colors={chartData.map((entry) => GRADE_COLORS[entry.name] || "#999")}
        centerLabel={`Total ${termData.total}`}
        innerRadius={70}
        outerRadius={90}
      />
      <Typography variant="caption" color="text.secondary">
        Total: {termData.total}
      </Typography>
    </Box>
  );
};

// Subject Card with 3 Term Pie Charts
const SubjectCard = ({ subject }: { subject: TeacherStatsItem }) => {
  const termEntries = Object.entries(subject.termStats);

  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        mb: 2,
        borderLeft: `8px solid ${subject.subjectColorCode}`,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1} mb={2}>
        <Typography variant="h6" fontWeight="bold">
          {subject.subjectName}
        </Typography>

        {subject.isClassTeacher && (
          <Chip label="Class Teacher" size="small" color="primary" />
        )}
      </Stack>

      {/* Term-wise Pie Charts */}
      <Typography variant="subtitle2" color="text.secondary" mb={1}>
        Term-wise Grade Distribution:
      </Typography>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        justifyContent="space-around"
        alignItems="center"
        flexWrap="wrap"
      >
        {termEntries.map(([termName, termData]) => (
          <TermPieChart
            key={termName}
            termName={termName}
            termData={termData}
          />
        ))}
      </Stack>
    </Paper>
  );
};

// Group data by Year -> Grade -> Class
const groupData = (data: TeacherStatsItem[]) => {
  const grouped: {
    [year: string]: {
      [gradeKey: string]: {
        gradeName: string;
        gradeId: number;
        classes: {
          [classKey: string]: {
            className: string;
            classId: number;
            subjects: TeacherStatsItem[];
          };
        };
      };
    };
  } = {};

  data.forEach((item) => {
    const year = item.year;
    const gradeKey = `${item.gradeId}`;
    const classKey = `${item.classId}`;

    if (!grouped[year]) {
      grouped[year] = {};
    }
    if (!grouped[year][gradeKey]) {
      grouped[year][gradeKey] = {
        gradeName: item.gradeName,
        gradeId: item.gradeId,
        classes: {},
      };
    }
    if (!grouped[year][gradeKey].classes[classKey]) {
      grouped[year][gradeKey].classes[classKey] = {
        className: item.className,
        classId: item.classId,
        subjects: [],
      };
    }
    grouped[year][gradeKey].classes[classKey].subjects.push(item);
  });

  return grouped;
};

const TeacherStatsPieChart: React.FC<TeacherStatsPieChartProps> = ({
  data,
}) => {
  if (!data || data.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="body1" color="text.secondary">
          No data available. Please select a year to view statistics.
        </Typography>
      </Box>
    );
  }

  const groupedData = groupData(data);

  return (
    <Box sx={{ mt: 2 }}>
      {Object.entries(groupedData).map(([year, grades]) => (
        <Accordion key={year} defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Year: {year}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {Object.entries(grades).map(([gradeKey, gradeData]) => (
              <Accordion key={gradeKey} defaultExpanded sx={{ mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1">
                    Grade: {gradeData.gradeName}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {Object.entries(gradeData.classes).map(
                    ([classKey, classData]) => (
                      <Accordion key={classKey} defaultExpanded sx={{ mb: 1 }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography variant="subtitle1">
                            Class: {classData.className}
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          {classData.subjects.map((subject) => (
                            <SubjectCard
                              key={subject.subjectId}
                              subject={subject}
                            />
                          ))}
                        </AccordionDetails>
                      </Accordion>
                    ),
                  )}
                </AccordionDetails>
              </Accordion>
            ))}
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default TeacherStatsPieChart;
