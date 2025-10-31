import { NextRequest, NextResponse } from "next/server";

interface GA4Analytics {
  views: number;
  sessions: number;
  users: number;
  sessionDuration: number; // average in seconds
  bounceRate: number; // percentage
  conversionRate: number; // percentage
  events: Array<{
    name: string;
    count: number;
  }>;
  topPages: Array<{
    pagePath: string;
    views: number;
    avgDuration: number;
  }>;
  deviceBreakdown: Array<{
    deviceCategory: string;
    sessions: number;
    percentage: number;
  }>;
  dates: Array<{
    date: string;
    views: number;
    sessions: number;
    users: number;
  }>;
}

/**
 * POST /api/analytics/ga4
 * Fetches GA4 analytics data using Google Analytics 4 Reporting API
 *
 * Requires environment variables:
 * - GA4_PROPERTY_ID: GA4 Property ID
 * - GOOGLE_ANALYTICS_PRIVATE_KEY: Service account private key
 * - GOOGLE_ANALYTICS_EMAIL: Service account email
 *
 * Query params:
 * - days: Number of days to look back (default: 30)
 */
export async function POST(request: NextRequest) {
  try {
    const { days = 30 } = await request.json();

    // Check required env variables
    const propertyId = process.env.GA4_PROPERTY_ID;
    const privateKey = process.env.GOOGLE_ANALYTICS_PRIVATE_KEY;
    const email = process.env.GOOGLE_ANALYTICS_EMAIL;

    if (!propertyId || !privateKey || !email) {
      console.warn("[GA4 Analytics] Missing GA4 credentials in environment");
      return NextResponse.json(
        {
          error: "GA4 credentials not configured",
          views: 0,
          sessions: 0,
          users: 0,
          sessionDuration: 0,
          bounceRate: 0,
          conversionRate: 0,
          events: [],
          topPages: [],
          deviceBreakdown: [],
          dates: [],
        } as GA4Analytics,
        { status: 200 }
      );
    }

    // Get access token from Google
    console.log("[GA4 Analytics] Attempting to get access token with email:", email);
    const accessToken = await getGoogleAccessToken(email, privateKey);
    console.log("[GA4 Analytics] Successfully obtained access token");

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const dateString = (date: Date) => date.toISOString().split("T")[0];

    // Fetch GA4 data using Google Analytics API v1
    const analyticsData = await fetchGA4Data(
      accessToken,
      propertyId,
      dateString(startDate),
      dateString(endDate)
    );

    console.log(`[GA4 Analytics] Retrieved data for property ${propertyId}`);

    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error("[GA4 Analytics] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch GA4 data",
        views: 0,
        sessions: 0,
        users: 0,
        sessionDuration: 0,
        bounceRate: 0,
        conversionRate: 0,
        events: [],
        topPages: [],
        deviceBreakdown: [],
        dates: [],
      } as GA4Analytics,
      { status: 200 }
    );
  }
}

/**
 * Get Google OAuth2 access token using service account
 */
async function getGoogleAccessToken(
  email: string,
  privateKey: string
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const expiresIn = 3600;

  // Create JWT
  const header = {
    alg: "RS256",
    typ: "JWT",
  };

  const payload = {
    iss: email,
    scope: "https://www.googleapis.com/auth/analytics.readonly",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + expiresIn,
    iat: now,
  };

  // Note: In production, use a proper JWT library like 'jsonwebtoken'
  // This is a simplified version - you'll need to sign with the private key
  // For now, we'll return a placeholder that should be replaced with proper implementation

  try {
    // Import crypto for JWT signing (Node.js built-in)
    const { createSign } = await import("crypto");

    const headerEncoded = Buffer.from(JSON.stringify(header)).toString("base64url");
    const payloadEncoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
    const signatureInput = `${headerEncoded}.${payloadEncoded}`;

    const sign = createSign("RSA-SHA256");
    sign.update(signatureInput);
    const signature = sign.sign(privateKey, "base64url");

    const jwt = `${signatureInput}.${signature}`;

    // Exchange JWT for access token
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt,
      }).toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[GA4] Failed to get access token:", data);
      throw new Error(`Failed to get Google access token: ${data.error} - ${data.error_description}`);
    }

    const accessData = data as { access_token: string };
    return accessData.access_token;
  } catch (error) {
    console.error("[GA4] Error getting access token:", error);
    throw error;
  }
}

/**
 * Fetch analytics data from Google Analytics 4 API
 */
async function fetchGA4Data(
  accessToken: string,
  propertyId: string,
  startDate: string,
  endDate: string
): Promise<GA4Analytics> {
  const requestBody = {
    dateRanges: [
      {
        startDate,
        endDate,
      },
    ],
    metrics: [
      { name: "screenPageViews" }, // Views
      { name: "sessions" }, // Sessions
      { name: "activeUsers" }, // Users
      { name: "averageSessionDuration" }, // Avg session duration
      { name: "bounceRate" }, // Bounce rate
    ],
    dimensions: [{ name: "date" }, { name: "deviceCategory" }],
  };

  try {
    const response = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      console.error(`[GA4] API returned status ${response.status}`);
      throw new Error(`GA4 API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Parse response and calculate metrics
    let totalViews = 0;
    let totalSessions = 0;
    let totalUsers = 0;
    let totalSessionDuration = 0;
    let totalBounceRate = 0;
    const deviceBreakdown: GA4Analytics["deviceBreakdown"] = [];
    const dates: GA4Analytics["dates"] = [];

    // Process rows - GA4 API v1beta uses dimensionValues not dimensions
    if (data.rows && data.rows.length > 0) {
      for (const row of data.rows) {
        // Get dimension values (date and device)
        const dimensionValues = row.dimensionValues || [];
        if (dimensionValues.length === 0) continue;

        const dateStr = dimensionValues[0]?.value || "unknown";
        const deviceCategory = dimensionValues[1]?.value || "unknown";

        if (!row.metricValues || row.metricValues.length === 0) continue;

        // Parse metric values [views, sessions, users, duration, bounceRate]
        const [views, sessions, users, duration, bounceRate] = row.metricValues.map(
          (m: { value: string }) => parseFloat(m.value)
        );

        totalViews += views;
        totalSessions += sessions;
        totalUsers += users;
        totalSessionDuration += duration;
        totalBounceRate += bounceRate;

        // Track by device
        const device = deviceBreakdown.find((d) => d.deviceCategory === deviceCategory);
        if (device) {
          device.sessions += sessions;
        } else {
          deviceBreakdown.push({
            deviceCategory,
            sessions,
            percentage: 0,
          });
        }

        // Track by date
        dates.push({
          date: dateStr,
          views,
          sessions,
          users,
        });
      }

      // Calculate percentages for device breakdown
      const totalDeviceSessions = deviceBreakdown.reduce((sum, d) => sum + d.sessions, 0);
      deviceBreakdown.forEach((d) => {
        d.percentage = totalDeviceSessions > 0 ? (d.sessions / totalDeviceSessions) * 100 : 0;
      });

      // Calculate averages
      const rowCount = data.rows.length;
      totalSessionDuration = rowCount > 0 ? totalSessionDuration / rowCount : 0;
      totalBounceRate = rowCount > 0 ? totalBounceRate / rowCount : 0;
    }

    const rowCount = data.rows?.length || 1;

    return {
      views: totalViews,
      sessions: totalSessions,
      users: totalUsers,
      sessionDuration: totalSessionDuration / rowCount,
      bounceRate: totalBounceRate / rowCount,
      conversionRate: 0, // TODO: Add conversion tracking
      events: [], // TODO: Add event tracking
      topPages: [], // TODO: Add top pages tracking
      deviceBreakdown,
      dates,
    };
  } catch (error) {
    console.error("[GA4] Error fetching data:", error);
    throw error;
  }
}
