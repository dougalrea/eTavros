from django.db.models import manager
from jwt_auth.serializers.common import NestedUserSerializer
from ..serializers.common import CoinSerializer

class PopulatedCoinSerializer(CoinSerializer):
    """ Used for all outgoing serialization, includes populated favourited_by """
    
    favourited_by = NestedUserSerializer(many=True)
    