import { create as create509, pems } from "./generate509";
import { SigningStargateClient } from "@cosmjs/stargate";
import { messages as stargateMessages } from "../stargate/index";
import { createStarGateMessage } from "../pbclient/index";
import { toBase64 } from "pvutils";

export { pems };

export async function broadcastCertificate(csr: string, publicKey: string, owner: string, client: SigningStargateClient) {
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
      owner: owner,
      serial
    }
  });

  return await client.signAndBroadcast(owner, [message.message], message.fee);
}

function base64ToUInt(base64: string) {
  const binary_string = window.atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes;
}
