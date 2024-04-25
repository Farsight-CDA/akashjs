import { Message } from "../stargate/index";

// dynamically determine max gas
const fee = {
  amount: [
    {
      denom: "uakt",
      amount: "1000"
    }
  ],
  gas: "100000"
};

export function createAminoMessage(message: Message, messageBody: any) {
  return {
    typeUrl: message,
    value: messageBody
  };
}

export function createStarGateMessage(message: Message, messageBody: any) {
  return {
    message: {
      typeUrl: message,
      value: messageBody
    },
    fee: fee
  };
}
