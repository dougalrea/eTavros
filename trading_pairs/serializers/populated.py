from trade_posts.serializers.populated import PopulatedTradePostSerializer
from comments.serializers.populated import PopulatedCommentSerializer
from jwt_auth.serializers.common import NestedUserSerializer
from ..serializers.common import TradingPairSerializer

class PopulatedTradingPairSerializer(TradingPairSerializer):
    
    comments = PopulatedCommentSerializer(many=True)
    favourited_by = NestedUserSerializer(many=True)
    trade_posts = PopulatedTradePostSerializer(many=True)
    