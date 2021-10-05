import { NextPage } from "next";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { useAlert } from "react-alert";
import { IntlShape, useIntl } from "react-intl";


import { Loader } from "@components/atoms";
import { demoMode } from "@temp/constants";
import { paths } from "@paths";

import { TypeAccountConfirmOtpMutation } from "./mutations";

import "./scss/index.scss";
import { Button, Form, TextField } from "@temp/components";
import { commonMessages } from "@temp/intl";
import { maybe } from "@temp/core/utils";

export const AccountConfirmOtpView: NextPage = () => {
  const [loading, setLoading] = React.useState(false);
  const [userId, setUserId] = React.useState(null)


  const { push } = useRouter();
  const alert = useAlert();
  const intl = useIntl();


  const displayConfirmationVerify = (data: any, intl: IntlShape) => {
    alert.show(
      {
        title: false
          ? intl.formatMessage({
              defaultMessage:
                "Please check your e-mail for further instructions",
            })
          : intl.formatMessage({ defaultMessage: "New user has been created" }),
      },
      { type: "success", timeout: 5000 }
    );
  };

  useEffect(() => {
    const registeredUserId = localStorage.getItem("registeredUserId");
    setUserId(registeredUserId)
  }, []);

  const formData = demoMode
    ? {
        otp: "1234",
      }
    : {};

  const showSuccessNotification = (
    data: any,
  ) => {
    setLoading(false)
    // const successful = maybe(() => !data.confirmAccount.errors.length);
  
    if (data.optVerification === null) {
      displayConfirmationVerify(data, intl)
      push(paths.home);
    }else{
      // setErrors(errors);
    }
  };

  return (
    <div>
      <TypeAccountConfirmOtpMutation onCompleted={data => showSuccessNotification(data)}> 
      {(mobileOtp, { loading, data }) => {
          return (
      <div className="login-form">
        <Form data={formData} 
        errors={maybe(() => data.confirmAccount.errors, [])} 
        onSubmit={(event, { otp }) => {
                event.preventDefault();
                setLoading(true)
                mobileOtp({
                  variables: {
                    otp,
                    userId
                  },
                });
              }}>
          <TextField
            name="otp"
            // autoComplete="email"
            label={intl.formatMessage({ defaultMessage: "Enter Otp" })}
            type="number"
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
                : intl.formatMessage({ defaultMessage: "Verify" })}
            </Button>
          </div>
        </Form>
      </div>
        );
      }}
      </TypeAccountConfirmOtpMutation>
      {loading && <Loader />}
    </div>
  );
};
