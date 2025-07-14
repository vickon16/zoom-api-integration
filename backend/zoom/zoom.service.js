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
        agenda: "My Zoom test Meeting",
        default_password: false,
        start_time: new Date().toLocaleDateString(), // Use current time for instant meeting
        timezone: "Africa/Lagos",
        duration: 60,
        password: "12345",
        type: 1, // 1, Instant meeting, 2, Scheduled meeting
        settings: {
          host_video: true,
          participant_video: true, // Allow participant video
          join_before_host: false, // Don't Allow participants to join before the host
          mute_upon_entry: true, // Mute participants upon entry
          waiting_room: false,
          allow_multiple_devices: true,
          breakout_room: {
            enable: false,
            rooms: [
              {
                name: "Breakout Room 1",
                participants: ["nkachukwuvictor2020@gmail.com", "John"],
              },
            ],
          },
          calendar_type: 1, // 1 for Google Calendar, 2 for Outlook Calendar
          contact_email: "nkachukwuvictor2016@gmail.com",
          contact_name: "Victor Nwachukwu",
          email_notification: true,
          encryption_type: "enhanced_encryption", // Use 'enhanced_encryption' for better security
          auto_recording: "none", // Options: 'none', 'local', 'cloud'
          focus_mode: true, // Focus mode allows participants to focus on the host's video

          meeting_authentication: true,
          meeting_invitees: [
            {
              email: "nkachukwuvictor2020@gmail.com",
            },
          ],

          private_meeting: true, // Make the meeting private
          watermark: false, // Disable watermark
          continuous_meeting_chat: {
            enable: true,
            auto_add_invited_external_users: true,
            auto_add_meeting_participants: true,
          },
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

generateZoomMeeting();
