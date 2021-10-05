import gql from "graphql-tag";

export const SocialCreateToken = gql`
  mutation socialCreateToken($email: String!, $socialId: String!) {
    socialCreateToken(email: $email, socialId: $socialId) {
      errors {
        field
        message
      }
      csrfToken
      token
      user {
        email
      }
    }
  }
`;

export const SocialTokenVerifyMutation = gql`
  mutation tokenVerify($token: String!) {
    tokenVerify(token: $token) {
      payload
      user {
        email
      }
    }
  }
`;

export const OneSignalPersonIdRegister = gql`
  mutation addUserPlayerId($playerId: String, $userId: ID!) {
    oneSignalUser(playerId: $playerId, userId: $userId) {
      errors {
        message
      }
      user {
        email
      }
    }
  }
`;
