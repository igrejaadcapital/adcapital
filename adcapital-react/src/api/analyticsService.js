import api from './config';

const analyticsService = {
  getDashboardStats: async () => {
    const response = await api.get('/analytics/dashboard-stats/');
    return response.data;
  }
};

export default analyticsService;
