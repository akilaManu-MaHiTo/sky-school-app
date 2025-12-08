import { useQuery } from "@tanstack/react-query";
import { getOrganization, Organization } from "../api/OrganizationSettings/organizationSettingsApi";

interface UseCurrentOrganizationResult {
  organization: Organization | undefined;
  status: "idle" | "loading" | "error" | "success" | "pending";
}

function useCurrentOrganization(): UseCurrentOrganizationResult {
  const { data, status } = useQuery<Organization>({
    queryKey: ["organization"],
    queryFn: getOrganization,
  });

  return { organization: data, status };
}

export default useCurrentOrganization;
