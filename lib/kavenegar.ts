import { KavenegarApi } from "kavenegar";

export const kavenegarApi = KavenegarApi({
  apikey: process.env.KAVENEGAR_API_KEY || "",
});

export const sendSms = (receptor: string, message: string) => {
  try {
    const response = kavenegarApi.Send(
      {
        receptor,
        message,
        sender:"2000660110",
      },
      (e) => {
        console.log("SMS sent successfully", e);
      },
    );
    return response;
  } catch (error) {
    console.error("Error sending SMS:", error);
    throw error;
  }
};
