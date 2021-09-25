import gql from "graphql-tag";
import React, { useEffect, useState } from "react";
import { useQuery } from "react-apollo";

// const favoriteList = gql`
//   query {
//   me{
//     wishlist{
//       id
//       wishlist{
//         id
//       }
//     }
//   }
// }
// `;

const favoriteList = gql`
  query {
    me {
      wishlist {
        id
        wishlist {
          id
        }
        product {
          name
        }
      }
    }
  }
`;

const FavoriteList = () => {
  const { data } = useQuery(favoriteList);

  return <div>Favorite List</div>;
};

export default FavoriteList;
