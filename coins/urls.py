from django.urls import path

from .views import CoinIndexView

urlpatterns = [
    path("", CoinIndexView.as_view()),
]
