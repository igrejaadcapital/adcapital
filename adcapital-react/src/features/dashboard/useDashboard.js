import { useQuery } from '@tanstack/react-query';
import api from '../../api/config';
import { dashboardKeys } from '../../api/queryClient';

async function fetchDashboardResumo() {
  const res = await api.get('/dashboard/resumo/');
  return res.data;
}

export function useDashboard() {
  const query = useQuery({
    queryKey: dashboardKeys.resumo,
    queryFn: fetchDashboardResumo,
  });

  const data = query.data ?? null;

  return {
    data,
    homeData: data?.home || {},
    analyticsData: data?.analytics || {},
    loading: query.isPending || query.isFetching,
    error: query.isError,
    retry: () => query.refetch(),
  };
}
