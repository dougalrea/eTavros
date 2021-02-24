from django.urls import path

from .views import TradingPairIndexView

urlpatterns = [
    path("", TradingPairIndexView.as_view()),
]
