import { NextRequest, NextResponse } from "next/server";

interface MetaAnalytics {
  impressions: number;
  clicks: number;
  spend: number; // in cents
  cpc: number; // cost per click
  cpm: number; // cost per mille (per 1000 impressions)
  ctr: number; // click-through rate percentage
  conversions: number;
  conversionRate: number; // percentage
  roas: number; // return on ad spend
  campaigns: Array<{
    campaignId: string;
    campaignName: string;
    impressions: number;
    clicks: number;
    spend: number;
    conversions: number;
  }>;
  deviceBreakdown: Array<{
    deviceType: string;
    impressions: number;
    clicks: number;
    spend: number;
    percentage: number;
  }>;
  dates: Array<{
    date: string;
    impressions: number;
    clicks: number;
    spend: number;
    conversions: number;
  }>;
}

/**
 * POST /api/analytics/meta
 * Fetches Meta/Facebook ads analytics data using Meta Marketing API
 *
 * Requires environment variables:
 * - META_BUSINESS_ACCOUNT_ID: Business account ID
 * - META_ACCESS_TOKEN: Long-lived access token
 *
 * Query params:
 * - days: Number of days to look back (default: 30)
 */
export async function POST(request: NextRequest) {
  try {
    const { days = 30 } = await request.json();

    // Check required env variables
    const businessAccountId = process.env.META_BUSINESS_ACCOUNT_ID;
    const accessToken = process.env.META_ACCESS_TOKEN;

    if (!businessAccountId || !accessToken) {
      console.warn("[Meta Analytics] Missing Meta credentials in environment");
      return NextResponse.json(
        {
          error: "Meta credentials not configured",
          impressions: 0,
          clicks: 0,
          spend: 0,
          cpc: 0,
          cpm: 0,
          ctr: 0,
          conversions: 0,
          conversionRate: 0,
          roas: 0,
          campaigns: [],
          deviceBreakdown: [],
          dates: [],
        } as MetaAnalytics,
        { status: 200 }
      );
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const dateString = (date: Date) => date.toISOString().split("T")[0];

    // Fetch Meta analytics data
    const analyticsData = await fetchMetaAnalytics(
      businessAccountId,
      accessToken,
      dateString(startDate),
      dateString(endDate)
    );

    console.log(`[Meta Analytics] Retrieved data for account ${businessAccountId}`);

    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error("[Meta Analytics] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch Meta analytics",
        impressions: 0,
        clicks: 0,
        spend: 0,
        cpc: 0,
        cpm: 0,
        ctr: 0,
        conversions: 0,
        conversionRate: 0,
        roas: 0,
        campaigns: [],
        deviceBreakdown: [],
        dates: [],
      } as MetaAnalytics,
      { status: 200 }
    );
  }
}

/**
 * Fetch analytics data from Meta Marketing API
 */
async function fetchMetaAnalytics(
  businessAccountId: string,
  accessToken: string,
  startDate: string,
  endDate: string
): Promise<MetaAnalytics> {
  try {
    // Fetch account insights (aggregate metrics)
    const insightsResponse = await fetch(
      `https://graph.facebook.com/v18.0/act_${businessAccountId}/insights?` +
        new URLSearchParams({
          fields:
            "impressions,clicks,spend,cpc,cpm,ctr,actions,action_values",
          time_range: JSON.stringify({
            since: startDate,
            until: endDate,
          }),
          access_token: accessToken,
        }).toString(),
      {
        method: "GET",
      }
    );

    if (!insightsResponse.ok) {
      const errorData = await insightsResponse.json();
      console.error(`[Meta] API returned status ${insightsResponse.status}:`, errorData);
      throw new Error(`Meta API error: ${insightsResponse.statusText} - ${errorData.error?.message || JSON.stringify(errorData)}`);
    }

    const insightsData = await insightsResponse.json();

    // Fetch campaigns breakdown
    const campaignsResponse = await fetch(
      `https://graph.facebook.com/v18.0/act_${businessAccountId}/campaigns?` +
        new URLSearchParams({
          fields: "id,name,insights.fields(impressions,clicks,spend,actions)",
          access_token: accessToken,
        }).toString(),
      {
        method: "GET",
      }
    );

    if (!campaignsResponse.ok) {
      throw new Error(`Meta Campaigns API error: ${campaignsResponse.statusText}`);
    }

    const campaignsData = await campaignsResponse.json();

    // Parse insights data
    let totalImpressions = 0;
    let totalClicks = 0;
    let totalSpend = 0;
    let totalConversions = 0;

    if (insightsData.data && insightsData.data.length > 0) {
      const row = insightsData.data[0];
      totalImpressions = parseInt(row.impressions || "0");
      totalClicks = parseInt(row.clicks || "0");
      totalSpend = Math.round(parseFloat(row.spend || "0") * 100); // Convert to cents
      // Parse actions array for conversions (typically the first action is purchase)
      if (row.actions && Array.isArray(row.actions)) {
        totalConversions = row.actions.reduce(
          (sum: number, action: any) =>
            sum + (action.action_type === "offsite_conversion.fb_pixel_purchase" ? parseInt(action.value || "0") : 0),
          0
        );
      }
    }

    // Process campaigns
    const campaigns: MetaAnalytics["campaigns"] = [];
    const deviceBreakdown: MetaAnalytics["deviceBreakdown"] = [];

    if (campaignsData.data) {
      for (const campaign of campaignsData.data) {
        const campaignInsights = campaign.insights?.data?.[0] || {};
        campaigns.push({
          campaignId: campaign.id,
          campaignName: campaign.name,
          impressions: parseInt(campaignInsights.impressions || "0"),
          clicks: parseInt(campaignInsights.clicks || "0"),
          spend: Math.round(parseFloat(campaignInsights.spend || "0") * 100),
          conversions: campaignInsights.actions?.reduce(
            (sum: number, action: any) =>
              sum + (action.action_type === "offsite_conversion.fb_pixel_purchase" ? parseInt(action.value || "0") : 0),
            0
          ) || 0,
        });
      }
    }

    // Calculate derived metrics
    const cpc = totalClicks > 0 ? (totalSpend / totalClicks) / 100 : 0; // cents to dollars
    const cpm = totalImpressions > 0 ? ((totalSpend / totalImpressions) * 1000) / 100 : 0;
    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
    const roas = totalSpend > 0 ? (totalConversions * 100) / totalSpend : 0; // Assuming $1 per conversion

    // Return aggregated data
    return {
      impressions: totalImpressions,
      clicks: totalClicks,
      spend: totalSpend,
      cpc,
      cpm,
      ctr,
      conversions: totalConversions,
      conversionRate,
      roas,
      campaigns: campaigns.slice(0, 10), // Top 10 campaigns
      deviceBreakdown, // TODO: Implement device breakdown
      dates: [], // TODO: Implement daily breakdown
    };
  } catch (error) {
    console.error("[Meta] Error fetching data:", error);
    throw error;
  }
}
