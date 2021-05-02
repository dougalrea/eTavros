from django.contrib import admin
from django.urls import path, include, re_path # <-- added this new import re_path
from .views import index # <-- also new

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('jwt_auth.urls')),
    path('api/markets/', include('trading_pairs.urls')),
    path('api/comments/', include('comments.urls')),
    path('api/tradeposts/', include('trade_posts.urls')),
    re_path(r'^.*$', index) # <-- have this come last using re path.
]
