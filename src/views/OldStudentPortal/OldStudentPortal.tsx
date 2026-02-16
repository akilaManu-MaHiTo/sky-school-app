import React, { useState } from "react";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Stack,
  Alert,
  Typography,
} from "@mui/material";
import { LocationOn as LocationIcon } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import SearchInput from "../../components/SearchBar";
import { useDebounce } from "../../util/useDebounce";
import { fetchOldStudents, OldStudent } from "../../api/oldStudentsApi";
import ProfileDialog from "./ProfileDialog";
import PageTitle from "../../components/PageTitle";
import Breadcrumb from "../../components/BreadCrumb";
import theme from "../../theme";
import useIsMobile from "../../customHooks/useIsMobile";

const getInitials = (student: OldStudent) => {
  if (student.nameWithInitials) {
    const parts = student.nameWithInitials.trim().split(/\s+/);
    return parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : parts[0][0].toUpperCase();
  }
  return student.name.charAt(0).toUpperCase();
};

const OldStudentPortal: React.FC = () => {
  const breadcrumbItems = [
    { title: "Home", href: "/home" },
    { title: `Old Student's Portal` },
    { title: `Old Students` },
  ];
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<OldStudent | null>(
    null,
  );
  const { isMobile, isTablet } = useIsMobile();
  const debouncedSearch = useDebounce(search, 800);

  const {
    data: students = [],
    isFetching,
    isError,
  } = useQuery<OldStudent[]>({
    queryKey: ["old-students", debouncedSearch],
    queryFn: () => fetchOldStudents(debouncedSearch),
  });

  return (
    <Stack spacing={2.5}>
      <Box
        sx={{
          p: 2,
          boxShadow: 1,
          borderRadius: 1.5,
          overflowX: "hidden",
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <PageTitle title="Old Student's Portal" />
        <Breadcrumb breadcrumbs={breadcrumbItems} />
      </Box>
      <Box
        sx={{
          bgcolor: "background.paper",
          borderRadius: 1.5,
          boxShadow: 1,
          py: 2.5,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box px={2} sx={{ borderRadius: 2 }}>
          <Alert  severity="info">
            Search and connect with alumni by name, city, company, or
            university.
          </Alert>
          <Box sx={{ mt: 2 }}>
            <SearchInput
              placeholder="Search alumni..."
              value={search}
              onChange={setSearch}
              onSearch={() => {}}
              maxWidth={isMobile ? "100%" : "50%"}
              isSearching={isFetching}
            />
          </Box>
        </Box>
      </Box>

      <Box>
        {!isError && !isFetching && students.length > 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {debouncedSearch
              ? `Showing results for "${debouncedSearch}"`
              : "Showing all alumni"}
          </Typography>
        )}

        {isError && (
          <Box
            sx={{
              textAlign: "center",
              py: 6,
              bgcolor: "#fff",
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography color="error">
              Failed to load alumni. Please try again.
            </Typography>
          </Box>
        )}

        {!isError && students.length === 0 && !isFetching && (
          <Box
            sx={{
              textAlign: "center",
              py: 8,
              bgcolor: "#fff",
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography variant="h6" color="text.secondary" sx={{ mb: 0.5 }}>
              No results found
            </Typography>
            <Typography variant="body2" color="text.disabled">
              Try adjusting your search.
            </Typography>
          </Box>
        )}

        <Stack direction="row" flexWrap="wrap" sx={{ gap: 2 }}>
          {students.map((student) => {
            const occ = student.old_occupations[0];
            const uni = student.old_universities[0];

            return (
              <Box
                key={student.id}
                sx={{
                  width: {
                    xs: "100%",
                    sm: "calc(50% - 8px)",
                    md: "calc(33.333% - 11px)",
                    lg: "calc(25% - 12px)",
                  },
                }}
              >
                <Card
                  onClick={() => setSelectedStudent(student)}
                  sx={{
                    height: "100%",
                    borderRadius: 1.5,
                    cursor: "pointer",
                    boxShadow: 1,
                    border: "1px solid",
                    borderColor: "divider",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                  }}
                >
                  <Box sx={{ height: 56, bgcolor: "action.hover" }} />

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      mt: "-28px",
                    }}
                  >
                    <Avatar
                      src={student.profileImage ?? undefined}
                      sx={{
                        width: 56,
                        height: 56,
                        fontSize: 20,
                        fontWeight: 600,
                        bgcolor: "primary.main",
                        color: "primary.contrastText",
                        border: "2px solid",
                        borderColor: "background.paper",
                      }}
                    >
                      {getInitials(student)}
                    </Avatar>
                  </Box>

                  <CardContent
                    sx={{
                      textAlign: "center",
                      pt: 1,
                      pb: 2,
                      flexGrow: 1,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight={600} noWrap>
                      {student.nameWithInitials || student.name}
                    </Typography>

                    {occ && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        noWrap
                      >
                        {occ.occupation} at {occ.companyName}
                      </Typography>
                    )}

                    {occ && (
                      <Stack
                        direction="row"
                        spacing={0.5}
                        justifyContent="center"
                        alignItems="center"
                        sx={{ mt: 0.5 }}
                      >
                        <LocationIcon
                          sx={{ fontSize: 13, color: "text.disabled" }}
                        />
                        <Typography
                          variant="caption"
                          color="text.disabled"
                          noWrap
                        >
                          {occ.city}, {occ.country}
                        </Typography>
                      </Stack>
                    )}

                    <Box sx={{ flexGrow: 1 }} />

                    {uni && (
                      <Typography
                        variant="caption"
                        color="text.disabled"
                        noWrap
                        sx={{ mt: 1 }}
                      >
                        {uni.universityName}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Box>
            );
          })}
        </Stack>
      </Box>
      <ProfileDialog
        student={selectedStudent}
        open={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
      />
    </Stack>
  );
};

export default OldStudentPortal;
