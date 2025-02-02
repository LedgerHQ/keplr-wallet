import { AmountConfig, IFeeConfig } from "../tx";
import { ChainGetter, IQueriesStore } from "@keplr-wallet/stores";
import { AppCurrency } from "@keplr-wallet/types";
import { computed, makeObservable } from "mobx";
import { DenomHelper } from "@keplr-wallet/common";
import { useState } from "react";

export class IBCAmountConfig extends AmountConfig {
  constructor(
    chainGetter: ChainGetter,
    protected readonly queriesStore: IQueriesStore,
    protected readonly initialChainId: string,
    sender: string,
    feeConfig: IFeeConfig | undefined
  ) {
    super(chainGetter, queriesStore, initialChainId, sender, feeConfig);

    makeObservable(this);
  }

  @computed
  get sendableCurrencies(): AppCurrency[] {
    // Only native currencies and Evmos ERC-20's can be sent by IBC transfer.
    return super.sendableCurrencies.filter((cur) => {
      const type = new DenomHelper(cur.coinMinimalDenom).type;
      const isEvmosERC20 = this.chainGetter
        .getChain(this.initialChainId)
        .features?.includes("evmos-erc20");

      return type === "native" || isEvmosERC20;
    });
  }
}

export const useIBCAmountConfig = (
  chainGetter: ChainGetter,
  queriesStore: IQueriesStore,
  chainId: string,
  sender: string
) => {
  const [txConfig] = useState(
    () =>
      new IBCAmountConfig(chainGetter, queriesStore, chainId, sender, undefined)
  );
  txConfig.setChain(chainId);
  txConfig.setSender(sender);

  return txConfig;
};
