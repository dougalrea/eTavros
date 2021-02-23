from datetime import datetime, timedelta

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from rest_framework import status
from django.contrib.auth import get_user_model
from django.conf import settings
import jwt

from .serializers.common import UserSerializer

User = get_user_model()

class RegisterView(APIView):
    """Controller for post request to /auth/register"""
    
    def post(self, request):
        user_to_create = UserSerializer(data=request.data)
        if user_to_create.is_valid():
            user_to_create.save()
            return Response({'message': 'Registration successful'}, status=status.HTTP_201_CREATED)
        return Response(user_to_create.errors, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
      
class LoginView(APIView):
    """Controller for post request to /auth/login"""
    
        
    def post(self, request):
        credential = request.data.get('credential')
        password = request.data.get('password')
        try:
            user_to_login = User.objects.get(email=credential)
        except User.DoesNotExist:
            try:
                user_to_login = User.objects.get(username=credential)
            except User.DoesNotExist:
                raise PermissionDenied(detail='Invalid credentials')
            if not user_to_login.check_password(password):
                raise PermissionDenied(detail='Invalid credentials')
            expiry_time = datetime.now() + timedelta(days=7)
            token = jwt.encode(
              {'sub': user_to_login.id, 'exp': int(expiry_time.strftime('%s'))},
              settings.SECRET_KEY,
              algorithm='HS256',
            )
            return Response(
              {'token': token, 'message': f'Welcome back, {user_to_login.username}'}
            )
        if not user_to_login.check_password(password):
            raise PermissionDenied(detail='Invalid credentials')
        expiry_time = datetime.now() + timedelta(days=7)
        token = jwt.encode(
          {'sub': user_to_login.id, 'exp': int(expiry_time.strftime('%s'))},
          settings.SECRET_KEY,
          algorithm='HS256',
        )
        return Response(
          {'token': token, 'message': f'Welcome back, {user_to_login.username}'}
        )
        