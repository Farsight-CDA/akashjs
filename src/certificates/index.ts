import { create as create509, pems } from "./generate509";
import { SigningStargateClient } from "@cosmjs/stargate";
import { Message as stargateMessages } from "../stargate";
import { createStarGateMessage } from "../pbclient/pbclient";

import { QueryCertificatesRequest, QueryCertificatesResponse, CertificateFilter } from "@akashnetwork/akash-api/akash/cert/v1beta3";

import { JSONRPCClient } from "json-rpc-2.0";

import { toBase64 } from "pvutils";

const client:JSONRPCClient = new JSONRPCClient((jsonRPCRequest) =>
  fetch("https://bridge.testnet.akash.network/akashnetwork", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(jsonRPCRequest),
  }).then((response) => {
    if (response.status === 200) {
      // Use client.receive when you received a JSON-RPC response.
      return response
        .json()
        .then((jsonRPCResponse) => client.receive(jsonRPCResponse));
    } else if (jsonRPCRequest.id !== undefined) {
      return Promise.reject(new Error(response.statusText));
    }
  })
);


export async function broadcastCertificate(
  { csr, publicKey }: pems,
  owner: string,
  client: SigningStargateClient
) {
  const encodedCsr = base64ToUInt(toBase64(csr));
  const encdodedPublicKey = base64ToUInt(toBase64(publicKey));
  const message = createStarGateMessage(stargateMessages.MsgCreateCertificate, {
    owner: owner,
    cert: encodedCsr,
    pubkey: encdodedPublicKey
  });

  return await client.signAndBroadcast(owner, [message.message], message.fee);
}

export async function createCertificate(bech32Address: string) {
  const certificate = create509(bech32Address);
  return certificate;
}

export async function revokeCertificate(owner: string, serial: string, client: SigningStargateClient) {
  const message = createStarGateMessage(stargateMessages.MsgRevokeCertificate, {
    id: {
      owner,
      serial
    }
  });

  return await client.signAndBroadcast(owner, [message.message], message.fee);
}

export async function queryCertificates(filter: CertificateFilter) {
  const txBodyBytes = QueryCertificatesRequest.encode(
    QueryCertificatesRequest.fromJSON({
      filter
    })
  ).finish();

  return QueryCertificatesResponse.decode(
    base64ToUInt(
      (
        await client.request("abci_query", {
          height: "0",
          path: "/akash.cert.v1beta1.Query/Certificates",
          prove: false,
          data: bufferToHex(txBodyBytes)
        })
      ).response.value
    )
  );
}

function base64ToUInt(base64: string) {
  if (typeof window !== "undefined") {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes;
  }

  return Buffer.from(base64, "base64");
}

function bufferToHex(buffer: Uint8Array) {
  return [...new Uint8Array(buffer)].map(b => b.toString(16).padStart(2, "0")).join("");
}
