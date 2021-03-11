from django.urls import path

from .views import TradePostListView

urlpatterns = [
  path("", TradePostListView.as_view())
]