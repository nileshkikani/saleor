import { TypedMutation } from "@temp/core/mutations";
import gql from "graphql-tag";
import { useMutation } from "react-apollo";

import {
  AccountConfirm,
  AccountConfirmOtp,
  AccountConfirmOtpVariables,
  AccountConfirmVariables,
} from "./gqlTypes/AccountConfirm";

const accountConfirmMutation = gql`
  mutation AccountConfirm($email: String!, $token: String!) {
    confirmAccount(email: $email, token: $token) {
      errors {
        field
        message
      }
    }
  }
`;

const accountConfirmOtpMutation = gql`
  mutation mobileOtp($otp: String! ,$userId: ID!)  {
    optVerification(otp: $otp, userId: $userId){
      user{
        id
      }
    }
}
`;

export const useAccountConfirmMutation = (variables: AccountConfirmVariables) =>
  useMutation<AccountConfirm, AccountConfirmVariables>(accountConfirmMutation, {
    variables,
  });

// export const useAccountConfirmOtpMutation = (variables: AccountConfirmOtpVariables) =>
//   useMutation<AccountConfirm, AccountConfirmOtpVariables>(accountConfirmOtpMutation, {
//     variables,
//   });

export const TypeAccountConfirmOtpMutation = TypedMutation<
  AccountConfirmOtp,
  AccountConfirmOtpVariables
>(accountConfirmOtpMutation);
