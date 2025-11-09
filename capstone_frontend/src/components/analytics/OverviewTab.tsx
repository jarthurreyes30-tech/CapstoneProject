import React from 'react';
import { motion } from 'framer-motion';
import { 
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  Target, TrendingUp, Users, Award, DollarSign, 
  Calendar, Sparkles, Trophy, ArrowUpRight 
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import ChartInsight from './ChartInsight';
import { CustomChartTooltip } from '@/components/ui/enhanced-tooltip';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658'];

interface OverviewTabProps {
  campaignTypes: any[];
  overviewData: any;
  beneficiaryData: any[];
  temporalTrends: any[];
}

const OverviewTab: React.FC<OverviewTabProps> = ({
  campaignTypes,
  overviewData,
  beneficiaryData,
  temporalTrends,
}) => {
  // Calculate insights
  const totalCampaigns = campaignTypes.reduce((sum, t) => sum + t.count, 0);
  const topType = campaignTypes.length > 0 ? campaignTypes[0] : null;
  const topTypePercentage = topType ? ((topType.count / totalCampaigns) * 100).toFixed(0) : 0;
  
  const topBeneficiary = beneficiaryData.length > 0 ? beneficiaryData[0] : null;
  const secondBeneficiary = beneficiaryData.length > 1 ? beneficiaryData[1] : null;

  // Calculate donation growth trend
  const donationTrend = temporalTrends.length > 0 
    ? temporalTrends[temporalTrends.length - 1]?.total_amount > temporalTrends[0]?.total_amount
      ? 'increasing' 
      : 'decreasing'
    : 'stable';

  // Generate overall insight
  const generateOverallInsight = () => {
    if (totalCampaigns === 0) return "No campaign data available yet. Create your first campaign to start tracking insights!";
    
    const parts = [];
    
    if (topType) {
      parts.push(`${topType.label} campaigns lead with ${topType.count} campaigns (${topTypePercentage}% of total)`);
    }
    
    
    if (donationTrend === 'increasing') {
      parts.push('donations are trending upward');
    }
    
    return parts.join(', ') + '.';
  };

  return (
    <div className="space-y-6">
      {/* Top Campaign Highlight */}
      {overviewData?.top_campaign && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-500/30 rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-amber-500/20">
              <Trophy className="h-6 w-6 text-amber-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">🏆 TOP PERFORMING CAMPAIGN</p>
              <h3 className="text-xl font-bold text-foreground mb-3">{overviewData.top_campaign.title}</h3>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    ₱{overviewData.top_campaign.raised_amount?.toLocaleString()} raised of ₱{overviewData.top_campaign.goal_amount?.toLocaleString()}
                  </span>
                  <span className="text-amber-600 dark:text-amber-400 font-bold text-base">{overviewData.top_campaign.progress}%</span>
                </div>
                <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(overviewData.top_campaign.progress, 100)}%` }}
                    transition={{ delay: 0.3, duration: 1 }}
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Row 1: Campaign Distribution & Top Campaigns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campaign Distribution by Type */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="h-full"
        >
          <Card className="bg-card border-border shadow-lg hover:shadow-xl transition-all h-full flex flex-col">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <Target className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Campaign Distribution by Type</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Breakdown of campaign categories</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              {campaignTypes.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={campaignTypes}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.label}: ${entry.count}`}
                        outerRadius={90}
                        innerRadius={50}
                        fill="#8884d8"
                        dataKey="count"
                        paddingAngle={3}
                        animationDuration={1000}
                      >
                        {campaignTypes.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        content={<CustomChartTooltip type="campaigns" valueSuffix=" campaigns" />}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  <ChartInsight
                    variant="default"
                    text={topType 
                      ? `${topType.label} campaigns dominate with ${topType.count} campaigns (${topTypePercentage}% of total).`
                      : "Campaign distribution is balanced across types."
                    }
                  />
                </>
              ) : (
                <div className="text-center py-16 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No campaign data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Campaigns Performance */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="h-full"
        >
          <Card className="bg-card border-border shadow-lg hover:shadow-xl transition-all h-full flex flex-col">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <Award className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Top Campaigns</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Highest performing campaigns</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="text-center py-16 text-muted-foreground">
                <Award className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No campaign performance data yet</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Row 2: Donation Growth & Beneficiary Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donation Growth Over Time */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="h-full"
        >
          <Card className="bg-card border-border shadow-lg hover:shadow-xl transition-all h-full flex flex-col">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                  <TrendingUp className="h-5 w-5 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Donation Growth Over Time</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Trends in total donations</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              {temporalTrends.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={temporalTrends}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="period" 
                        className="fill-muted-foreground"
                        style={{ fontSize: '12px' }}
                      />
                      <YAxis 
                        className="fill-muted-foreground"
                        style={{ fontSize: '12px' }}
                        tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}K`}
                      />
                      <Tooltip 
                        content={<CustomChartTooltip type="donations" valuePrefix="₱" />}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="total_amount" 
                        stroke="#06b6d4" 
                        strokeWidth={3}
                        dot={{ fill: '#06b6d4', r: 5 }}
                        activeDot={{ r: 7 }}
                        animationDuration={1500}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  
                  <ChartInsight
                    variant="info"
                    text={
                      donationTrend === 'increasing'
                        ? "Donations are trending upward over recent periods — great momentum!"
                        : donationTrend === 'decreasing'
                        ? "Donations have declined recently. Consider launching new campaigns to re-engage donors."
                        : "Donations remain stable. Maintain consistency with regular campaign updates."
                    }
                  />
                </>
              ) : (
                <div className="text-center py-16 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No donation trend data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Beneficiary Breakdown */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="h-full"
        >
          <Card className="bg-card border-border shadow-lg hover:shadow-xl transition-all h-full flex flex-col">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/20">
                  <Users className="h-5 w-5 text-violet-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Beneficiary Breakdown</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Groups benefiting most</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              {beneficiaryData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart 
                      data={beneficiaryData.slice(0, 6)} 
                      layout="vertical"
                      margin={{ left: 20, right: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" className="fill-muted-foreground" style={{ fontSize: '12px' }} />
                      <YAxis 
                        dataKey="label" 
                        type="category" 
                        className="fill-muted-foreground"
                        width={100}
                        style={{ fontSize: '11px' }}
                      />
                      <Tooltip 
                        content={<CustomChartTooltip type="beneficiary" valueSuffix=" campaigns" />}
                      />
                      <Bar 
                        dataKey="count" 
                        fill="#8b5cf6" 
                        radius={[0, 8, 8, 0]}
                        animationDuration={1200}
                      >
                        {beneficiaryData.slice(0, 6).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  
                  <ChartInsight
                    variant="default"
                    text={
                      topBeneficiary && secondBeneficiary
                        ? `${topBeneficiary.label} and ${secondBeneficiary.label} are the most supported groups, with ${topBeneficiary.count} and ${secondBeneficiary.count} campaigns respectively.`
                        : topBeneficiary
                        ? `${topBeneficiary.label} are the primary beneficiaries with ${topBeneficiary.count} campaigns.`
                        : "Your campaigns support diverse beneficiary groups."
                    }
                  />
                </>
              ) : (
                <div className="text-center py-16 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No beneficiary data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Summary Insight Block */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border border-primary/30 rounded-2xl p-6 shadow-lg"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-primary/20">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-foreground mb-2 flex items-center gap-2">
              📊 Overall Campaign Summary
            </h3>
            <p className="text-base text-muted-foreground leading-relaxed">
              {generateOverallInsight()}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OverviewTab;
