from django.urls import path

from .views import TradingPairIndexView, TradingPairDetailView, TradingPairHistoricalData

urlpatterns = [
    path("", TradingPairIndexView.as_view()),
    path("<str:name>/", TradingPairDetailView.as_view()),
    path("<str:name>/history/", TradingPairHistoricalData.as_view())
]
