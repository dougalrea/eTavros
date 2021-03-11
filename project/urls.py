from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('jwt_auth.urls')),
    path('api/markets/', include('trading_pairs.urls')),
    path('api/comments/', include('comments.urls')),
    path('api/tradeposts/', include('trade_posts.urls'))
]
