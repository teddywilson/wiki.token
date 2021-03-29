import React, { useState } from "react";

import { Alert, Image, Menu, Dropdown } from "antd";
import { BigNumber } from "@ethersproject/bignumber";

import {
  AcceptBidModal,
  ListTokenModal,
  PlaceBidModal,
  PurchaseTokenModal,
  TxHistoryModal,
  UnlistTokenModal,
  WithdrawBidModal,
} from "./modals";
import { FormatAddress } from "../helpers";
import { useContractReader, useEventListener } from "../hooks";
import { NULL_ADDRESS } from "../constants";

import web3 from "web3";
import { findAllByTestId } from "@testing-library/dom";

const KEY_LIST_FOR_SALE = "1";
const KEY_UNLIST_FROM_MARKETPLACE = "2";
const KEY_PURCHASE_FULL_PRICE = "3";
const KEY_PLACE_BID = "4";
const KEY_VIEW_TX_HISTORY = "5";
const KEY_ACCEPT_BID = "6";
const KEY_WITHDRAW_BID = "7";

const TOKEN_POLL_TIME = 3000;

// TODO(bingbongle) validation, loading spinner, etc.s
// TODO(bingbongle) donation amount
export default class Token extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // Modal State
      acceptBidModalVisible: false,
      listTokenModalVisible: false,
      purchaseFullPriceModalVisible: false,
      placeBidModalVisible: false,
      txHistoryModalVisible: false,
      unlistTokenModalVisible: false,
      withdrawBidModalVisible: false,
      // Form state
      listTokenPriceInEth: "1",
      bidPriceInEth: "1",
      // Tx History
      txHistoryEvents: [],
    };
  }

  fetchTokenData = async () => {
    if (!this.props.pageId) {
      return;
    }
    const owner = await this.props.contracts["Token"]["pageIdToAddress"](this.props.pageId);
    const offer = await this.props.contracts["Token"]["pagesOfferedForSale"](this.props.pageId);
    const bid = await this.props.contracts["Token"]["pageBids"](this.props.pageId);
    const offerDonationAmount = await this.props.contracts["Token"]["calculateDonationFromValue"](
      web3.utils.toWei(offer && offer.price ? offer.price.toString() : "0", "ether"),
    );
    const bidDonationAmountWei = await this.props.contracts["Token"]["calculateDonationFromValue"](
      web3.utils.toWei(bid && bid.value ? bid.value.toString() : "0", "ether"),
    );
    console.log("owner: ", owner);
    console.log("offer: ", offer);
    console.log("bid: ", bid);
    console.log("offerDonationAmount: ", offerDonationAmount);
    console.log("bidDonationAmount: ", bidDonationAmountWei);
  };

  componentDidUpdate(prevProps) {
    if (this.props.id !== prevProps.id) {
      console.log("boobs");
      this.fetchTokenData();
    }
  }

  // Creates a Menu.Item for token action menu.
  menuItem(key, emoji, emojiText, label) {
    return (
      <Menu.Item key={key}>
        <span role="img" aria-label={emojiText}>
          {emoji}
        </span>{" "}
        {label}
      </Menu.Item>
    );
  }

  // Builds the right-click menu with user options to interact with token. Varies depending on user
  // and token state.
  menu() {
    return <Menu onClick={this.handleMenuClick}></Menu>;
    // if (!offer || !owner || !address || !bid) {
    //   return <Menu />;
    // }
    // let items = [];
    // if (owner === address) {
    //   if (offer.isForSale) {
    //     items.push(menuItem(KEY_UNLIST_FROM_MARKETPLACE, "🛌", "bed", "Unlist from marketplace"));
    //   } else {
    //     items.push(menuItem(KEY_LIST_FOR_SALE, "🎉", "party", "List for sale"));
    //   }
    //   if (bid.hasBid) {
    //     items.push(menuItem(KEY_ACCEPT_BID, "❤️", "love", "Accept bid"));
    //   }
    // } else {
    //   if (offer.isForSale) {
    //     items.push(menuItem(KEY_PURCHASE_FULL_PRICE, "🔥", "fire", "Purchase for full price"));
    //   }
    //   if (owner !== NULL_ADDRESS) {
    //     if (bid.hasBid && bid.bidder === address) {
    //       items.push(menuItem(KEY_WITHDRAW_BID, "🥺", "pleading-face", "Withdraw bid"));
    //     } else {
    //       items.push(menuItem(KEY_PLACE_BID, "🤠", "cowboy", "Bid on page"));
    //     }
    //   }
    // }
    // items.push(menuItem(KEY_VIEW_TX_HISTORY, "🌐", "globe", "View history"));
    // return <Menu onClick={handleMenuClick}>{items}</Menu>;
  }

  /**
   * Fetches and sorts transaction history (by block number and transaction hash) for this page.
  //  */
  // fetchAndSortTxHistoryEvents() aysnc {
  //   const mintEvents = await contracts["Token"].queryFilter(
  //     contracts["Token"].filters.Mint(address),
  //   );
  //   const pageOfferedEvents = await contracts["Token"].queryFilter(
  //     contracts["Token"].filters.PageOffered(BigNumber.from(pageId)),
  //   );

  //   // TODO(bingbongle) add remaining events
  //   const results = mintEvents.concat(pageOfferedEvents);
  //   results.sort((a, b) => {
  //     return a.blockNumber === b.blockNumber
  //       ? a.transactionIndex - b.transactionIndex
  //       : a.blockNumber - b.blockNumber;
  //   });

  //   setTxHistoryEvents(results);
  // };

  /**
   * Opens the tokens corresponding Wikipedia. Inteded to be triggered when the
   * image is (left) clicked.
   */
  openWikipediaPage() {
    //window.open(`https://en.wikipedia.org/?curid=${pageId}`);
  }

  /**
   * Acceps the outstanding token bid.
   */
  acceptBid = async () => {
    // await transactor(
    //   contracts["Token"]
    //     .connect(signer)
    //     ["acceptBidForPage"](pageId, web3.utils.toWei(bid.value, "ether")),
    // );
  };

  /**
   * Lists the token for sale on the marketplace.
   */
  listToken = async () => {
    // await transactor(
    //   contracts["Token"]
    //     .connect(signer)
    //     ["offerPageForSale"](pageId, web3.utils.toWei(listTokenPriceInEth, "ether")),
    // );
  };

  /**
   * Unlists token from marketplace.
   */
  unlistToken = async () => {
    // await transactor(contracts["Token"].connect(signer)["pageNoLongerForSale"](pageId));
  };

  /**
   * Purchase token for full price.
   */
  purchaseForFullPrice = async () => {
    // await transactor(
    //   contracts["Token"].connect(signer)["buyPage"](pageId, {
    //     // TODO(bingbongle): this doesn't work
    //     value: web3.utils
    //       .toBN(web3.utils.toWei(offer.price, "ether"))
    //       .add(web3.utils.toBN(offerDonationAmount.toString()))
    //       .toString(),
    //   }),
    // );
  };

  /**
   * Places a bid against the token.
   */
  placeBid = async () => {
    // await transactor(
    //   contracts["Token"].connect(signer)["enterBidForPage"](pageId, {
    //     value: web3.utils.toBN(web3.utils.toWei(bidPriceInEth, "ether")).toString(),
    //   }),
    // );
  };

  /**
   * Withdraws the current address's bid against this token, assuming the open bid
   * belongs to them.
   */
  withdrawBid = async () => {
    // await transactor(contracts["Token"].connect(signer)["withdrawBidForPage"](pageId));
  };

  /**
   * Triggered when a right-click menu item is selected.
   * @param {*} event On click event.
   */
  handleMenuClick(event) {
    // switch (event.key) {
    //   case KEY_ACCEPT_BID:
    //     setAcceptBidModalVisible(true);
    //     break;
    //   case KEY_LIST_FOR_SALE:
    //     setListTokenModalVisible(true);
    //     break;
    //   case KEY_PURCHASE_FULL_PRICE:
    //     setPurchaseFullPriceModalVisible(true);
    //     break;
    //   case KEY_PLACE_BID:
    //     setPlaceBidModalVisible(true);
    //     break;
    //   case KEY_VIEW_TX_HISTORY:
    //     setTxHistoryModalVisible(true);
    //     break;
    //   case KEY_UNLIST_FROM_MARKETPLACE:
    //     setUnlistTokenModalVisible(true);
    //     break;
    //   case KEY_WITHDRAW_BID:
    //     setWithdrawBidModalVisible(true);
    //     break;
    //   default:
    //     console.log(`Event not handled!`, event);
    // }
  }

  // Asynchronously fetch and sort transaction history associated with this token.
  // fetchAndSortTxHistoryEvents();
  render() {
    return (
      <Dropdown overlay={this.menu()} trigger={["contextMenu"]}>
        <div className="token">
          {this.state.offer && this.state.offer.isForSale && (
            <Alert message={"💸  " + this.state.offer.price + " ETH"} type={"success"} />
          )}
          {this.state.bid && this.state.bid.hasBid && (
            <Alert message={"Open bid for " + this.state.bid.value + " ETH"} type="success" />
          )}
          <div className="token-wrapper">
            <div className="token-image">
              <Image
                width={196}
                src={this.props.imageUrl}
                preview={false}
                onClick={() => {
                  this.openWikipediaPage();
                }}
              />
            </div>
            <div className="token-text-box">
              <div className="token-page-title">{`"${this.props.pageTitle}"`}</div>
              <div className="token-page-id">{this.props.pageId}</div>
            </div>
          </div>
          {this.state.owner && this.props.address && this.state.owner !== NULL_ADDRESS && (
            <div className="token-owner">
              {this.state.owner === this.props.address
                ? `😎 You own this token`
                : FormatAddress(this.state.owner)}
            </div>
          )}
          {/* Token action modals */}
          {/* This should be wrapped in some isModalReady property, probably */}
          {this.state.bid &&
            this.state.bidDonationAmountWei &&
            this.state.offerDonationAmount &&
            this.state.offer && (
              <div>
                {/* <AcceptBidModal
                  value={this.state.bid.value}
                  donationAmountWei={this.state.bidDonationAmountWei}
                  pageTitle={this.state.pageTitle}
                  visible={this.state.acceptBidModalVisible}
                  onOk={() => {
                    // this.stasetAcceptBidModalVisible(false);
                    // acceptBid();
                  }}
                  onCancel={() => {
                    // setAcceptBidModalVisible(false);
                  }}
                />
                <ListTokenModal
                  pageTitle={this.props.pageTitle}
                  visible={this.state.listTokenModalVisible}
                  onOk={() => {
                    // setListTokenModalVisible(false);
                    // listToken();
                  }}
                  onCancel={() => {
                    // setListTokenModalVisible(false);
                  }}
                  onListPriceChange={e => {
                    setListTokenPriceInEth(e.toString());
                  }}
                />
                <PurchaseTokenModal
                  pageTitle={pageTitle}
                  offer={offer}
                  donationAmount={offerDonationAmount}
                  visible={purchaseFullPriceModalVisible}
                  onOk={() => {
                    setPurchaseFullPriceModalVisible(false);
                    purchaseForFullPrice();
                  }}
                  onCancel={() => {
                    setPurchaseFullPriceModalVisible(false);
                  }}
                />
                <PlaceBidModal
                  pageTitle={pageTitle}
                  donationAmount={offerDonationAmount}
                  visible={placeBidModalVisible}
                  bid={bid}
                  onOk={() => {
                    placeBid();
                    setPlaceBidModalVisible(false);
                  }}
                  onCancel={() => {
                    setPlaceBidModalVisible(false);
                  }}
                  onBidAmountChanged={e => {
                    setBidPriceInEth(e.toString());
                  }}
                />
                <TxHistoryModal
                  pageTitle={pageTitle}
                  visible={txHistoryModalVisible}
                  events={txHistoryEvents}
                  onOk={() => {
                    setTxHistoryModalVisible(false);
                  }}
                  onCancel={() => {
                    setTxHistoryModalVisible(false);
                  }}
                />
                <UnlistTokenModal
                  pageTitle={pageTitle}
                  visible={unlistTokenModalVisible}
                  onOk={() => {
                    setUnlistTokenModalVisible(false);
                    unlistToken();
                  }}
                  onCancel={() => {
                    setListTokenModalVisible(false);
                  }}
                />
                <WithdrawBidModal
                  pageTitle={pageTitle}
                  visible={withdrawBidModalVisible}
                  onOk={() => {
                    setWithdrawBidModalVisible(false);
                    withdrawBid();
                  }}
                  onCancel={() => {
                    setWithdrawBidModalVisible(false);
                  }}
                /> */}
              </div>
            )}
        </div>
      </Dropdown>
    );
  }
}
