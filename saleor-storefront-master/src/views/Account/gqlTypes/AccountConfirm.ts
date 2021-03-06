/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: AccountConfirm
// ====================================================

export interface AccountConfirm_confirmAccount_errors {
  __typename: "AccountError";
  /**
   * Name of a field that caused the error. A value of `null` indicates that the
   * error isn't associated with a particular field.
   */
  field: string | null;
  /**
   * The error message.
   */
  message: string | null;
}

export interface AccountConfirm_confirmAccount {
  __typename: "ConfirmAccount";
  errors: AccountConfirm_confirmAccount_errors[];
}
export interface AccountConfirmOtp_confirmAccount {
  __typename: "MobileOtp";
  errors: AccountConfirm_confirmAccount_errors[];
}

export interface AccountConfirm {
  /**
   * Confirm user account with token sent by email during registration.
   */
  confirmAccount: AccountConfirm_confirmAccount | null;
}

export interface AccountConfirmOtp {
  /**
   * Confirm user account with token sent by email during registration.
   */
  confirmAccount: AccountConfirmOtp_confirmAccount | null;
}

export interface AccountConfirmVariables {
  email: string;
  token: string;
}
export interface AccountConfirmOtpVariables {
  otp: string;
  userId: string | null;
}
