import React, { useCallback, useEffect, useState } from "react";
import { BrowserRouter, Switch, Route, Link } from "react-router-dom";
import { Menu } from "antd";
import {
  GlobalOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import "antd/dist/antd.css";
import { JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import "./styles/App.scss";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { useUserAddress } from "eth-hooks";
import {
  useContractReader,
  useGasPrice,
  useUserProvider,
  useContractLoader,
  useTokensProvider,
} from "./hooks";
import { Layout } from "./components";
import { INFURA_ID, NETWORKS } from "./constants";
import { Transactor } from "./helpers";
import { About, Claim, Discover, MyTokens } from "./views";

const web3Modal = new Web3Modal({
  // network: "mainnet", // optional
  cacheProvider: true, // optional
  providerOptions: {
    walletconnect: {
      package: WalletConnectProvider, // required
      options: {
        infuraId: INFURA_ID,
      },
    },
  },
});

const logoutOfWeb3Modal = async () => {
  await web3Modal.clearCachedProvider();
  setTimeout(() => {
    window.location.reload();
  }, 1);
};

const targetNetwork = NETWORKS["localhost"];

const localProviderUrl = targetNetwork.rpcUrl;
const localProviderUrlFromEnv = process.env.REACT_APP_PROVIDER
  ? process.env.REACT_APP_PROVIDER
  : localProviderUrl;
const localProvider = new JsonRpcProvider(localProviderUrlFromEnv);

function App() {
  const [injectedProvider, setInjectedProvider] = useState();

  const gasPrice = useGasPrice(targetNetwork, "fast");

  const userProvider = useUserProvider(injectedProvider, localProvider);
  const address = useUserAddress(userProvider);

  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect();
    setInjectedProvider(new Web3Provider(provider));
  }, [setInjectedProvider]);

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      loadWeb3Modal();
    }
  }, [loadWeb3Modal]);

  const contracts = useContractLoader(localProvider);
  const transactor = Transactor(userProvider, gasPrice);

  const [route, setRoute] = useState();
  useEffect(() => {
    setRoute(window.location.pathname);
  }, [setRoute]);

  // Fetch my tokens
  const myTokensResult = useContractReader(contracts, "Token", "tokensOf", [
    address,
    /*cursor=*/ 0,
    /*howMany=*/ 10000,
    /*ascending=*/ true,
  ]);
  const myTokens = useTokensProvider(myTokensResult);

  // Fetch discovery tokens
  const discoveryTokensResult = useContractReader(contracts, "Token", "discover", [
    /*cursor=*/ 0,
    /*howMany=*/ 10000,
    /*ascending=*/ true,
  ]);
  const discoveryTokens = useTokensProvider(discoveryTokensResult);

  return (
    <div className="App">
      <Layout address={address} onConnectWallet={loadWeb3Modal}>
        <BrowserRouter>
          <Menu style={{ marginBottom: 24 }} selectedKeys={[route]} mode="horizontal">
            <Menu.Item key="/claim" icon={<SearchOutlined />}>
              <Link
                onClick={() => {
                  setRoute("/claim");
                }}
                to="/claim"
              >
                Claim
              </Link>
            </Menu.Item>
            <Menu.Item key="/tokens" icon={<TrophyOutlined />}>
              <Link
                onClick={() => {
                  setRoute("/tokens");
                }}
                to="/tokens"
              >
                My Tokens
              </Link>
            </Menu.Item>
            <Menu.Item key="/discover" icon={<GlobalOutlined />}>
              <Link
                onClick={() => {
                  setRoute("/discover");
                }}
                to="/discover"
              >
                Discover
              </Link>
            </Menu.Item>
            <Menu.Item key="/about" icon={<QuestionCircleOutlined />}>
              <Link
                onClick={() => {
                  setRoute("/about");
                }}
                to="/about"
              />
              About
            </Menu.Item>
          </Menu>
          <Switch>
            <Route exact path={["/about", "/"]}>
              <About />
            </Route>
            <Route exact path="/claim">
              <Claim
                contracts={contracts}
                signer={userProvider.getSigner()}
                transactor={transactor}
              />
            </Route>
            <Route path="/tokens">
              <MyTokens tokens={myTokens} />
            </Route>
            <Route path="/discover">
              <Discover tokens={discoveryTokens} />
            </Route>
          </Switch>
        </BrowserRouter>
      </Layout>
    </div>
  );
}

export default App;
