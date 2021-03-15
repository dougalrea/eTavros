from datetime import datetime, timedelta
from decimal import Decimal
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.contrib.auth import get_user_model
from django.conf import settings
import jwt

from .serializers.common import UserSerializer, UserSerializerForTrading
from .serializers.populated import PopulatedUserSerializer

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
        
class ProfileView(APIView):
    """Controller for post request to /auth/profile"""

    permission_classes = (IsAuthenticated, )
    
    def get(self, request):
        user = User.objects.get(pk=request.user.id)
        serialized_user = PopulatedUserSerializer(user)
        return Response(serialized_user.data, status=status.HTTP_200_OK)
    
    def put(self, request):       
        user_to_update = User.objects.get(pk=request.user.id)
        asset_to_update = str(f'{request.data["tradingPairName"]}_balance')

        essential_data = {
            'username': user_to_update.username, 
            'password': user_to_update.password, 
            'email': user_to_update.email
            }

        new_balance_buy = getattr(user_to_update, asset_to_update) + Decimal(f"{request.data['amount']}")
        new_balance_sell = getattr(user_to_update, asset_to_update) - Decimal(f"{request.data['amount']}")

          
        
        if request.data['buy']:
            if user_to_update.cash_balance - Decimal(request.data['total']) < 0:
                return Response('Insufficient balance in account', status=status.HTTP_422_UNPROCESSABLE_ENTITY)
            user_to_update.cash_balance -= Decimal(request.data['total'])
            setattr(user_to_update, asset_to_update, new_balance_buy)
        else:
            if new_balance_sell < 0:
                return Response('Insufficient balance in account', status=status.HTTP_422_UNPROCESSABLE_ENTITY)
            user_to_update.cash_balance += Decimal(request.data['total'])
            setattr(user_to_update, asset_to_update, new_balance_sell)
            
        updated_user = UserSerializerForTrading(user_to_update, data=essential_data)
        
        if updated_user.is_valid():
            updated_user.save()
            return Response(updated_user.data, status=status.HTTP_202_ACCEPTED)
        return Response(updated_user.errors, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
      