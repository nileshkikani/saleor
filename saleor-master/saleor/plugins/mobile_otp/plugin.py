from functools import cache
from threading import active_count
from django.apps import config
from ..base_plugin import BasePlugin
from saleor.plugins.base_plugin import BasePlugin, ConfigurationTypeField
from django.core.exceptions import ValidationError
from ...plugins.models import PluginConfiguration
import random   
import requests
from django.conf import settings

from typing import Optional

from . import MobileOtpConfigration

# # my_change


# if TYPE_CHECKING:
#     from ...account.models import Address, User
#     from ...order.models import Order


def get_plugin_configuration() -> Optional[PluginConfiguration]:
    configuration = PluginConfiguration.objects.filter(identifier="plugin.MobileOtp")
    return configuration


class MobileOtpPlugin(BasePlugin):
    """Anonymize all user data in the checkout, user profile and its orders."""

    PLUGIN_NAME = "Mobile Otp"
    PLUGIN_ID = "plugin.MobileOtp"
    DEFAULT_ACTIVE = False
    PLUGIN_DESCRIPTION = (
        "This is Mobile otp plugin "
    )
    CONFIG_STRUCTURE = {
        "api_id": {
            "type": ConfigurationTypeField.STRING,
            "help_text": "Provide your API Id",
            "label": "Api Id",
        },
        "api_password": {
            "type": ConfigurationTypeField.STRING,
            "help_text": "Provide your API password Key",
            "label": "Api Password",
        },
         "sender_id": {
            "type": ConfigurationTypeField.STRING,
            "help_text": "Provide your Sender Id",
            "label": "Sender Id",
        },
         "pe_id": {
            "type": ConfigurationTypeField.STRING,
            "help_text": "Provide your PE Id",
            "label": "PE Id",
        },
        "template_id": {
            "type": ConfigurationTypeField.STRING,
            "help_text": "Provide your Template Id",
            "label": "Template Id",
        }
    }
    DEFAULT_CONFIGURATION = [
        {"name": "api_id", "value": None},
        {"name": "api_password", "value": None},
        {"name": "sender_id", "value": None},
        {"name": "pe_id", "value": None},
        {"name": "template_id", "value": None},
    ]
    CONFIGURATION_PER_CHANNEL = True

    # new function

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # # Convert to dict to easier take config elements
        configuration = {item["name"]: item["value"] for item in self.configuration}
        self.config = MobileOtpConfigration(**configuration)

        self.config = MobileOtpConfigration(
            api_id=configuration["api_id"],
            api_password=configuration["api_password"],
            sender_id=configuration["sender_id"],
            pe_id=configuration["pe_id"],
            template_id=configuration["template_id"],
        )

    def otp_notification_configuration():
        config = PluginConfiguration.objects.filter(identifier="plugin.MobileOtp")
        configId = None
        for check_active in config:
            if check_active.active == True:
                channel = PluginConfiguration.objects.values(
                    "channel_id").filter(identifier="plugin.MobileOtp", active=True)
                for i in channel:
                    channel_id = i["channel_id"]

                configuration = PluginConfiguration.objects.values(
                    "configuration").filter(identifier="plugin.MobileOtp", active=True, channel_id=channel_id)
                for configuration in configuration:
                    configuration = {item["name"]: item["value"]
                                     for item in configuration["configuration"]}

                    return configuration


    def send_mobile_otp(user, phone_number):
        configuration = MobileOtpPlugin.otp_notification_configuration()
        random_otp = random.randrange(100, 10000)
        textMessage = "Hello! Your OTP is+"+ str(random_otp) +" to login on LI apps. It will be valid for 10 minute"
        if configuration is not None:
            print("configuration",configuration["api_id"],configuration["api_password"])
            url = "https://api.smsala.com/api/SendSMS?api_id="+configuration["api_id"]+"&api_password="+configuration["api_password"]+"&sms_type=T&encoding=T&sender_id="+configuration["sender_id"]+"&pe_id="+configuration["pe_id"]+"&template_id="+configuration["template_id"]+"&phonenumber="+str(phone_number)+"&textmessage="+textMessage
            r = requests.get(url)
            print(r.url)
            response = r.json()
            if response["status"] == "S":
                return random_otp


   
    @classmethod
    def validate_plugin_configuration(cls, plugin_configuration: "PluginConfiguration"):
        """Validate if provided configuration is correct."""
        missing_fields = []
        configuration = plugin_configuration.configuration
        configuration = {item["name"]: item["value"] for item in configuration}
        if not configuration["api_id"]:
            missing_fields.append("API Id")
        if not configuration["api_password"]:
            missing_fields.append("API Password")
        if not configuration["sender_id"]:
            missing_fields.append("Sender Id")
        if not configuration["pe_id"]:
            missing_fields.append("PE id")
        if not configuration["template_id"]:
            missing_fields.append("Template Id")

        if plugin_configuration.active and missing_fields:
            error_msg = (
                "To enable a plugin, you need to provide values for the "
                "following fields: "
            )
            raise ValidationError(error_msg + ", ".join(missing_fields))


