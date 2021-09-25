import { useAuth } from "@saleor/sdk";
import * as React from "react";
import { useAlert } from "react-alert";
import { useMutation } from "react-apollo";
import FacebookLogin from "react-facebook-login";
import GoogleLogin from "react-google-login";
import { useIntl } from "react-intl";

import { demoMode } from "@temp/constants";
import { commonMessages } from "@temp/intl";

import { Button, Form, TextField } from "..";
import { SocialCreateToken, SocialTokenVerifyMutation } from "./queries";

import "./scss/index.scss";

interface ILoginForm {
  hide?: () => void;
}

const LoginForm: React.FC<ILoginForm> = ({ hide }) => {
  const { signIn } = useAuth();
  const alert = useAlert();

  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState(null);
  const [socialTokenForUserVerification] = useMutation(SocialCreateToken);
  const [verifyTokenOfUser] = useMutation(SocialTokenVerifyMutation);

  const handleOnSubmit = async (evt, { email, password }) => {
    evt.preventDefault();
    setLoading(true);
    const { data, dataError } = await signIn(email, password);
    setLoading(false);
    if (dataError?.error) {
      setErrors(dataError.error);
    } else if (data && hide) {
      setErrors(null);
      hide();
    }
  };

  const responseGoogle = async res => {
    const email = res?.profileObj?.email;
    const socialId = res?.googleId;
    const password = res?.googleId;
    verifySocialUser(email, socialId, password);
  };

  const responseFacebook = async response => {
    const { email } = response;
    const { id } = response;
    const password = response.id;
    verifySocialUser(email, id, password);
  };

  const verifySocialUser = async (
    email: string,
    socialId: string,
    password: string
  ) => {
    const { data } = await socialTokenForUserVerification({
      variables: {
        email,
        socialId,
      },
    });
    const token = data?.socialCreateToken?.token;
    verifySocialToken(token, email, password);
  };

  const verifySocialToken = async (
    token: string,
    email: string,
    password: string
  ) => {
    if (token) {
      const { data } = await verifyTokenOfUser({
        variables: {
          token,
        },
      });

      if (data?.tokenVerify?.payload?.type === "access") {
        signInWithSocial(email, password);
      }
    } else {
      hide();
      alert.show(
        {
          title: !token
            ? intl.formatMessage({
                defaultMessage:
                  "Please, enter valid credentials or check your email",
              })
            : intl.formatMessage({
                defaultMessage: "Something went wrong. Please try again",
              }),
        },
        {
          type: "success",
          timeout: 5000,
        }
      );
    }
  };

  const signInWithSocial = async (email, password) => {
    const { data, dataError } = await signIn(email, password);
    setLoading(false);
    if (dataError?.error) {
      setErrors(dataError.error);
    } else if (data && hide) {
      setErrors(null);
      hide();
    }
  };

  const formData = demoMode
    ? {
        email: "admin@example.com",
        password: "admin",
      }
    : {};

  const intl = useIntl();

  return (
    <div className="login-form">
      <Form data={formData} errors={errors || []} onSubmit={handleOnSubmit}>
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
        <div className="login-form__button">
          <Button
            testingContext="submit"
            type="submit"
            {...(loading && { disabled: true })}
          >
            {loading
              ? intl.formatMessage(commonMessages.loading)
              : intl.formatMessage({ defaultMessage: "Sign in" })}
          </Button>
        </div>
      </Form>
      <div className="login-form__social">
        <GoogleLogin
          clientId="557803803294-6o1i6bl7g2srv47ki6llq58ukajvvca8.apps.googleusercontent.com"
          buttonText="Login With Google"
          onSuccess={responseGoogle}
          onFailure={responseGoogle}
          cookiePolicy="single_host_origin"
        />

        <FacebookLogin
          appId="270993168210136"
          fields="name,email,picture"
          callback={responseFacebook}
          textButton="Login with Facebook"
          icon="fa-facebook"
        />
      </div>
    </div>
  );
};

export default LoginForm;
