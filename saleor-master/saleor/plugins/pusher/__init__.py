from dataclasses import dataclass
from typing import Optional


@dataclass
class PusherIdConfiguration:
    instance_id: Optional[str]
    secret_key: Optional[str]
