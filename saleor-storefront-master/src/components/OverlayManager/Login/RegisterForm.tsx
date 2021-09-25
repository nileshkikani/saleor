import * as React from "react";
import { AlertManager, useAlert } from "react-alert";
import { useMutation } from "react-apollo";
import FacebookLogin from "react-facebook-login";
import GoogleLogin from "react-google-login";
import { IntlShape, useIntl } from "react-intl";

import { paths } from "@paths";
import { channelSlug } from "@temp/constants";
import { commonMessages } from "@temp/intl";

import { maybe } from "../../../core/utils";
import { Button, Form, TextField } from "../..";
import { RegisterAccount } from "./gqlTypes/RegisterAccount";
import {
  socialRegisterMutation,
  TypedAccountRegisterMutation,
} from "./queries";

import "./scss/index.scss";

const showSuccessNotification = (
  data: RegisterAccount,
  hide: () => void,
  alert: AlertManager,
  intl: IntlShape
) => {
  const successful = maybe(() => !data.accountRegister.errors.length);

  if (successful) {
    hide();
    alert.show(
      {
        title: data.accountRegister.requiresConfirmation
          ? intl.formatMessage({
              defaultMessage:
                "Please check your e-mail for further instructions",
            })
          : intl.formatMessage({ defaultMessage: "New user has been created" }),
      },
      { type: "success", timeout: 5000 }
    );
  }
};

const RegisterForm: React.FC<{ hide: () => void }> = ({ hide }) => {
  const alert = useAlert();
  const intl = useIntl();

  const [socialRegister] = useMutation(socialRegisterMutation);

  const responseGoogle = async res => {
    const { email } = res?.profileObj;
    const { googleId } = res;
    const socialType = "Google";
    handleSocialRegister(email, googleId, socialType);
  };

  const responseFacebook = async response => {
    const { email } = response;
    const { id } = response;
    const socialType = "Facebook";
    handleSocialRegister(email, id, socialType);
  };

  const handleSocialRegister = async (
    email: string,
    socialId: any,
    socialType: string
  ) => {
    try {
      if (email && socialId && socialType) {
        const redirectUrl = `${location.origin}${paths.accountConfirm}`;
        const { data } = await socialRegister({
          variables: {
            email,
            password: socialId,
            socialId,
            socialType,
            redirectUrl,
            channel: channelSlug,
          },
        });
        if (data) {
          socialNotificationsSend(data);
        }
      }
    } catch (error) {
      alert.show(error);
    }
  };

  const socialNotificationsSend = (data: any) => {
    const successful = maybe(
      () => !data?.accountSocialRegister?.errors?.length
    );
    if (successful) {
      hide();
      alert.show(
        {
          title: data?.accountSocialRegister.requiresConfirmation
            ? intl.formatMessage({
                defaultMessage:
                  "Please check your e-mail for further instructions",
              })
            : intl.formatMessage({
                defaultMessage: "New user has been created",
              }),
        },
        { type: "success", timeout: 5000 }
      );
    } else {
      hide();
      alert.show(
        {
          title: data?.accountSocialRegister?.errors[0].message
            ? intl.formatMessage({
                defaultMessage: "You are already registered",
              })
            : intl.formatMessage({
                defaultMessage: "Something went wrong",
              }),
        },
        { type: "error", timeout: 5000 }
      );
    }
  };

  return (
    <>
      <TypedAccountRegisterMutation
        onCompleted={data => showSuccessNotification(data, hide, alert, intl)}
      >
        {(registerCustomer, { loading, data }) => {
          return (
            <Form
              errors={maybe(() => data.accountRegister.errors, [])}
              onSubmit={(event, { email, password }) => {
                event.preventDefault();
                const redirectUrl = `${location.origin}${paths.accountConfirm}`;
                registerCustomer({
                  variables: {
                    email,
                    password,
                    redirectUrl,
                    channel: channelSlug,
                  },
                });
              }}
            >
              <TextField
                name="email"
                autoComplete="email"
                label={intl.formatMessage(commonMessages.eMail)}
                type="email"
                required
              />
              <TextField
                name="password"
                autoComplete="password"
                label={intl.formatMessage(commonMessages.password)}
                type="password"
                required
              />
              <div className="login__content__button">
                <Button
                  testingContext="submitRegisterFormButton"
                  type="submit"
                  {...(loading && { disabled: true })}
                >
                  {loading
                    ? intl.formatMessage(commonMessages.loading)
                    : intl.formatMessage({ defaultMessage: "Register" })}
                </Button>
              </div>
            </Form>
          );
        }}
      </TypedAccountRegisterMutation>
      <div className="login__social">
        <GoogleLogin
          clientId="557803803294-6o1i6bl7g2srv47ki6llq58ukajvvca8.apps.googleusercontent.com"
          buttonText="Register with Google"
          onSuccess={responseGoogle}
          onFailure={responseGoogle}
          cookiePolicy="single_host_origin"
        />

        <FacebookLogin
          appId="270993168210136"
          // autoLoad={true}
          fields="name,email,picture"
          // onClick={componentClicked}
          callback={responseFacebook}
          // cssClass="my-facebook-button-class"
          textButton="Register with Facebook"
          icon="fa-facebook"
        />
      </div>
    </>
  );
};

export default RegisterForm;
