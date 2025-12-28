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
        sender: "2000300248",
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
export const sendOTP = (receptor: string, OTP: string) => {
  try {
    const response = kavenegarApi.VerifyLookup(
      {
        receptor,
        template: "Verify2",
        token: OTP,
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

export const sendSignUpNotification = (
  receptor: string,
  name: string,
  password: string,
  userName: string,
) => {
  try {
    const response = kavenegarApi.VerifyLookup(
      {
        receptor,
        template: "coachinosignup",
        token: name,
        token2: userName,
        token3: password,
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
