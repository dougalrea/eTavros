from django.urls import path

from .views import TradingPairIndexView, TradingPairDetailView

urlpatterns = [
    path("", TradingPairIndexView.as_view()),
    path("<str:name>/", TradingPairDetailView.as_view()),
    # path("<int:pk>/like/", TradingPairLikedView.as_view())
]
