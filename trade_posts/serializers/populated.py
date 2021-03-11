from jwt_auth.serializers.common import NestedUserSerializer
from trade_posts.serializers.common import TradePostSerializer


class PopulatedTradePostSerializer(TradePostSerializer):
    owner = NestedUserSerializer()
    