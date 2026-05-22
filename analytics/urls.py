from django.urls import path
from .views import DashboardStatsView, TrackAcessoView

urlpatterns = [
    path('dashboard-stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('track/', TrackAcessoView.as_view(), name='track-acesso'),
]
