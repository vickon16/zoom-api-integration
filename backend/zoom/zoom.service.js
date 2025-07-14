import "dotenv/config";
import base64 from "base-64";

const zoomAccountId = process.env.ZOOM_ACCOUNT_ID;
const zoomClientId = process.env.ZOOM_CLIENT_ID;
const zoomClientSecret = process.env.ZOOM_CLIENT_SECRET;

const getAuthHeaders = () => {
  return {
    Host: "zoom.us",
    Authorization: `Basic ${base64.encode(
      `${zoomClientId}:${zoomClientSecret}`
    )}`,
    "Content-Type": "application/x-www-form-urlencoded",
  };
};

const generateZoomAccessToken = async () => {
  try {
    if (!zoomClientId || !zoomClientSecret) {
      throw new Error(
        "Zoom client ID and secret must be set in environment variables"
      );
    }

    const response = await fetch("https://zoom.us/oauth/token", {
      method: "POST",
      headers: getAuthHeaders(),
      body: new URLSearchParams({
        grant_type: "account_credentials",
        account_id: zoomAccountId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Zoom API error: ${response.statusText}`);
    }

    const jsonResponse = await response.json();
    console.log("Zoom access token response:", jsonResponse);

    return jsonResponse?.access_token;
  } catch (error) {
    console.error("Error generating Zoom access token:", error);
    throw new Error("Failed to generate Zoom access token");
  }
};

const generateZoomMeeting = async () => {
  try {
    const accessToken = await generateZoomAccessToken();

    if (!accessToken) {
      throw new Error("Failed to retrieve Zoom access token");
    }

    const response = await fetch("https://api.zoom.us/v2/users/me/meetings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        topic: "Test Meeting",
        type: 1, // Instant meeting
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: true,
          mute_upon_entry: false,
          waiting_room: false,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Zoom API error: ${response.statusText}`);
    }
    const meetingResponse = await response.json();
    console.log("Zoom meeting created successfully:", meetingResponse);
    return meetingResponse;
  } catch (error) {
    console.error("Error creating Zoom meeting:", error);
    throw new Error("Failed to create Zoom meeting");
  }
};

generateZoomAccessToken();
