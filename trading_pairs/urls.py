from django.urls import path

from .views import TradingPair24hrData, TradingPairFavourite, TradingPairIndexView, TradingPairDetailView, TradingPairHistoricalData

urlpatterns = [
    path("", TradingPairIndexView.as_view()),
    path("<str:name>/", TradingPairDetailView.as_view()),
    path("<str:name>/history/", TradingPairHistoricalData.as_view()),
    path("<str:name>/history/day/", TradingPair24hrData.as_view()),
    path("<str:name>/favourite/", TradingPairFavourite.as_view())
]
