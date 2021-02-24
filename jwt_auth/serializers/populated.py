from trading_pairs.serializers.common import TradingPairSerializer
from ..serializers.common import UserSerializer

class PopulatedUserSerializer(UserSerializer):

    favourited_coins = TradingPairSerializer(many=True)
    