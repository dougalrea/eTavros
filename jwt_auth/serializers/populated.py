from coins.serializers.common import CoinSerializer
from ..serializers.common import UserSerializer

class PopulatedUserSerializer(UserSerializer):
    favourited_coins = CoinSerializer(many=True)
    