from functools import cache
from threading import active_count
from django.apps import config
from ..base_plugin import BasePlugin
from saleor.plugins.base_plugin import BasePlugin, ConfigurationTypeField
from django.core.exceptions import ValidationError
from ...plugins.models import PluginConfiguration
from . import PusherIdConfiguration

from typing import Optional


# # my_change

from pusher_push_notifications import PushNotifications

# if TYPE_CHECKING:
#     from ...account.models import Address, User
#     from ...order.models import Order


def get_plugin_configuration() -> Optional[PluginConfiguration]:
    configuration = PluginConfiguration.objects.filter(identifier="plugin.Pusher")
    return configuration


class PusherPlugin(BasePlugin):
    """Anonymize all user data in the checkout, user profile and its orders."""

    PLUGIN_NAME = "Pusher"
    PLUGIN_ID = "plugin.Pusher"
    DEFAULT_ACTIVE = False
    PLUGIN_DESCRIPTION = (
        "This is Pusher push notification plugin "
    )
    CONFIG_STRUCTURE = {
        "instance_id": {
            "type": ConfigurationTypeField.STRING,
            "help_text": "Provide your Instance Id",
            "label": "Instance Id",
        },
        "secret_key": {
            "type": ConfigurationTypeField.STRING,
            "help_text": "Provide your Secret Key",
            "label": "Secret Key",
        }
    }
    DEFAULT_CONFIGURATION = [
        {"name": "instance_id", "value": None},
        {"name": "secret_key", "value": None},
    ]
    CONFIGURATION_PER_CHANNEL = True

    # new function

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Convert to dict to easier take config elements
        configuration = {item["name"]: item["value"] for item in self.configuration}
        self.config = PusherIdConfiguration(**configuration)

        self.config = PusherIdConfiguration(
            instance_id=configuration["instance_id"],
            secret_key=configuration["secret_key"]
        )

    # @classmethod
    def push_notification_configuration():
        config = PluginConfiguration.objects.filter(identifier="plugin.Pusher")
        configId = None
        for check_active in config:
            if check_active.active == True:
                channel = PluginConfiguration.objects.values(
                    "channel_id").filter(identifier="plugin.Pusher", active=True)
                for i in channel:
                    channel_id = i["channel_id"]

                configuration = PluginConfiguration.objects.values(
                    "configuration").filter(identifier="plugin.Pusher", active=True, channel_id=channel_id)
                for configuration in configuration:
                    configuration = {item["name"]: item["value"]
                                     for item in configuration["configuration"]}

                    print("COnfigration--------", configuration)

                    # while channel_id:

                    # for i in range(len(configuration)):
                    #     configId = PusherIdConfiguration(
                    #         instance_id=configuration["instance_id"],
                    #         secret_key=configuration["secret_key"]
                    #     )

                    return configuration

        # return configId

    @classmethod
    def push_notify(plugin_configuration: "PluginConfiguration"):

        configuration = PusherPlugin.push_notification_configuration()

        # print("LEN=========================", len(configuration))

        if configuration is not None:

            for i in range(len(configuration)):
                config = PusherIdConfiguration(
                    instance_id=configuration["instance_id"],
                    secret_key=configuration["secret_key"]
                )

                if config is None:
                    print("internalserver error")
                else:
                    if config.instance_id and config.secret_key:
                        beams_client = PushNotifications(
                            instance_id=config.instance_id,
                            secret_key=config.secret_key,
                        )

                        response = beams_client.publish_to_interests(
                            interests=['hello'],
                            publish_body={
                                'web': {
                                    'notification': {
                                        'title': 'SALEOR',
                                        'body': 'sucess???',
                                        # 'deep_link': 'http://localhost:3000/',
                                    },
                                },
                            },
                        )

                        print("PublushId", response["publishId"])

    @classmethod
    def validate_plugin_configuration(cls, plugin_configuration: "PluginConfiguration"):
        """Validate if provided configuration is correct."""
        missing_fields = []
        configuration = plugin_configuration.configuration
        configuration = {item["name"]: item["value"] for item in configuration}
        if not configuration["instance_id"]:
            missing_fields.append("Instance Id")
        if not configuration["secret_key"]:
            missing_fields.append("Secret Key")

        if plugin_configuration.active and missing_fields:
            error_msg = (
                "To enable a plugin, you need to provide values for the "
                "following fields: "
            )
            raise ValidationError(error_msg + ", ".join(missing_fields))


PusherPlugin.push_notify()
