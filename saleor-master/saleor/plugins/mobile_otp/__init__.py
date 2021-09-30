from dataclasses import dataclass
from typing import Optional


@dataclass
class MobileOtpConfigration:
    api_id: Optional[str]
    api_password: Optional[str]
    sender_id: Optional[str]
    pe_id: Optional[str]
    template_id: Optional[str]

