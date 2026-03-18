import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "@/lib/clients/axios-client";

interface GeoData {
  country: string | null;
  city: string | null;
  region: string | null;
  isIndia: boolean;
}

interface GeoResponse {
  success: boolean;
  message: string;
  data: GeoData;
}

const geoKeys = {
  all: ["geo"] as const,
  location: () => [...geoKeys.all, "location"] as const,
};

export const useGeo = () => {
  const query = useQuery({
    queryKey: geoKeys.location(),
    queryFn: async () => {
      const { data } = await axiosClient.get<GeoResponse>("/api/geo");
      return data.data;
    },
    staleTime: Infinity, // Geo data won't change during session
    retry: 1,
  });

  return {
    ...query,
    isIndia: query.data?.isIndia ?? false,
    country: query.data?.country ?? null,
    city: query.data?.city ?? null,
    region: query.data?.region ?? null,
  };
};
