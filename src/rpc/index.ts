import { Tendermint37Client } from "@cosmjs/tendermint-rpc";
import { createProtobufRpcClient, GasPrice, QueryClient, SigningStargateClient, SigningStargateClientOptions } from "@cosmjs/stargate";
import { getAkashTypeRegistry } from "../stargate";
import { OfflineSigner, Registry, } from "@cosmjs/proto-signing";
import { Decimal } from "cosmwasm";

export async function getRpc(endpoint: string) {
  return getQueryClient(endpoint);
}

export async function getQueryClient(endpoint: string) {
  const tmClient: any = await Tendermint37Client.connect(endpoint);
  const queryClient = new QueryClient(tmClient);
  return createProtobufRpcClient(queryClient);
}

export async function getMsgClient(endpoint: string, signer: OfflineSigner) {
  const msgRegistry = new Registry(getAkashTypeRegistry());
  const options: SigningStargateClientOptions = {
    registry: msgRegistry,
    gasPrice: GasPrice.fromString("0.025uakt")
  };

  return SigningStargateClient.connectWithSigner(endpoint, signer, options);
}