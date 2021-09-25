import gql from "graphql-tag";

import { TypedMutation } from "../../../core/mutations";
import {
  RegisterAccount,
  RegisterAccountVariables,
} from "./gqlTypes/RegisterAccount";

const accountRegisterMutation = gql`
  mutation RegisterAccount(
    $email: String!
    $password: String!
    $redirectUrl: String
    $channel: String
  ) {
    accountRegister(
      input: {
        email: $email
        password: $password
        redirectUrl: $redirectUrl
        channel: $channel
      }
    ) {
      errors {
        field
        message
      }
      requiresConfirmation
    }
  }
`;

export const socialRegisterMutation = gql`
  mutation accountSocialRegister(
    $email: String!
    $socialId: String!
    $socialType: String
    $password: String
    $redirectUrl: String
    $channel: String
  ) {
    accountSocialRegister(
      input: {
        email: $email
        socialId: $socialId
        socialType: $socialType
        password: $password
        redirectUrl: $redirectUrl
        channel: $channel
      }
    ) {
      errors {
        field
        message
      }
      requiresConfirmation
    }
  }
`;

// export const socialRegisterMutation = gql`
//   mutation RegisterAccount(
//     $email: String!
//     $password: String!
//     $redirectUrl: String
//     $channel: String
//   ) {
//     accountRegister(
//       input: {
//         email: $email
//         password: $password
//         redirectUrl: $redirectUrl
//         channel: $channel
//       }
//     ) {
//       errors {
//         field
//         message
//       }
//       requiresConfirmation
//     }
//   }
// `;

export const TypedAccountRegisterMutation = TypedMutation<
  RegisterAccount,
  RegisterAccountVariables
>(accountRegisterMutation);

// export const TypedSocialRegisterMutation = TypedMutation<
//   RegisterAccount,
//   RegisterSocialAccountVariables
// >(socialRegisterMutation);
