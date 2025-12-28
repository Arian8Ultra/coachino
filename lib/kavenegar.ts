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
        // if name has space just send first part
        token: name.split(" ")[0]?.split("‌")[0] || name,
        token2: userName,
        token3: password,
      },
      (e) => {
        console.log("SMS sent successfully", e);
      },
    );
    console.log("SignUp SMS response:", response);
    
    return response;
  } catch (error) {
    console.error("Error sending SMS:", error);
    throw error;
  }
};
