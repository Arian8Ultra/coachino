export interface ZibalPaymentRequest {
  amount: number;
  callbackUrl: string;
  description?: string;
  orderId?: string;
  mobile?: string;
}

export interface ZibalPaymentResponse {
  trackId: number;
  result: number;
  message: string;
}

export async function createZibalPaymentRequest(
  data: ZibalPaymentRequest,
): Promise<ZibalPaymentResponse> {
  const response = await fetch("https://gateway.zibal.ir/v1/request", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      merchant: process.env.ZIBAL_MERCHANT_ID,
      ...data,
    }),
  });
  const result = await response.json();
  return result as ZibalPaymentResponse;
}

export interface ZibalPaymentVerifyRequest {
  trackId: number;
}
export interface ZibalPaymentVerifyResponse {
  paidAt: string;
  amount: number;
  result: number;
  status: number;
  refNumber: number;
  description: string;
  cardNumber: string;
  orderId: string;
  message: string;
}
export async function verifyZibalPayment(
  data: ZibalPaymentVerifyRequest,
): Promise<ZibalPaymentVerifyResponse> {
  const response = await fetch("https://gateway.zibal.ir/v1/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      merchant: process.env.ZIBAL_MERCHANT_ID,
      ...data,
    }),
  });
  console.log("Zibal payment verify response:", response);
  const result = await response.json();
  console.log("Zibal payment verify response:", result);
  
  return result as ZibalPaymentVerifyResponse;
}
