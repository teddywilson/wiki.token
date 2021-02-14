import { useState, useEffect } from "react";
import { useContractReader } from ".";

import axios from "axios";
import { BigNumber } from "@ethersproject/bignumber";

function useTokensProvider(contracts, address) {
  const [tokens, setTokens] = useState([]);
  // Pagination if available if needed, but we won't worry about using it for now.
  const tokensResult = useContractReader(contracts, "Token", "tokensOf", [
    address,
    /*cursor=*/ 0,
    /*howMany=*/ 10000,
    /*ascending=*/ true,
  ]);

  useEffect(() => {
    tokensResult &&
      tokensResult.length == 3 &&
      Promise.all(
        tokensResult[0].map(token => {
          return axios
            .get(
              `${process.env.REACT_APP_METADATA_API_BASE_URL}/token?id=${BigNumber.from(
                token,
              ).toNumber(token)}`,
            )
            .then(res => res.data);
        }),
      ).then(tokens => {
        setTokens(tokens);
      });
  }, [tokensResult]);

  return tokens;
}

export default useTokensProvider;