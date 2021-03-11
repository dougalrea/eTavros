from trade_posts.serializers.common import TradePostSerializer
from trade_posts.models import Trade_post
from comments.serializers.common import CommentSerializer
from trading_pairs.serializers.common import TradingPairSerializer
from ..serializers.common import UserSerializer

class PopulatedUserSerializer(UserSerializer):

    favourited_coins = TradingPairSerializer(many=True)
    posted_comments = CommentSerializer(many=True)
    posted_trades = TradePostSerializer(many=True)
    