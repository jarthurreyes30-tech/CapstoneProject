import React from 'react';

interface EnhancedTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  title?: string;
  description?: string;
  valueFormatter?: (value: any) => string;
  labelFormatter?: (label: string) => string;
  additionalInfo?: string;
}

export const EnhancedTooltip: React.FC<EnhancedTooltipProps> = ({
  active,
  payload,
  label,
  title,
  description,
  valueFormatter,
  labelFormatter,
  additionalInfo,
}) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const formatValue = (value: any) => {
    if (valueFormatter) return valueFormatter(value);
    if (typeof value === 'number') return value.toLocaleString();
    return value;
  };

  const formatLabel = (lbl: string) => {
    if (labelFormatter) return labelFormatter(lbl);
    return lbl;
  };

  return (
    <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg p-4 shadow-xl min-w-[220px]">
      {/* Title Section */}
      {title && (
        <div className="mb-2 pb-2 border-b border-border">
          <p className="font-bold text-sm text-foreground">{title}</p>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
      )}

      {/* Period/Label */}
      {label && (
        <div className="mb-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Period</p>
          <p className="text-sm font-bold text-foreground">{formatLabel(label)}</p>
        </div>
      )}

      {/* Values */}
      <div className="space-y-2">
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: entry.color || entry.fill || '#8884d8' }}
              />
              <span className="text-xs text-muted-foreground capitalize">
                {entry.name || entry.dataKey}
              </span>
            </div>
            <span className="text-sm font-bold text-foreground">
              {formatValue(entry.value)}
            </span>
          </div>
        ))}
      </div>

      {/* Additional Info */}
      {additionalInfo && (
        <div className="mt-3 pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground italic">{additionalInfo}</p>
        </div>
      )}
    </div>
  );
};

interface CustomChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  type: 'campaigns' | 'donations' | 'users' | 'charities' | 'geographic' | 'trends' | 'beneficiary' | 'funds';
  valuePrefix?: string;
  valueSuffix?: string;
}

export const CustomChartTooltip: React.FC<CustomChartTooltipProps> = ({
  active,
  payload,
  label,
  type,
  valuePrefix = '',
  valueSuffix = '',
}) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const getTooltipConfig = () => {
    switch (type) {
      case 'campaigns':
        return {
          title: 'Campaign Activity',
          description: 'Number of campaigns created',
          additionalInfo: 'Track campaign creation patterns',
        };
      case 'donations':
        return {
          title: 'Donation Activity',
          description: 'Total donations received',
          additionalInfo: 'Monetary contributions from donors',
        };
      case 'users':
        return {
          title: 'User Activity',
          description: 'User registrations and activity',
          additionalInfo: 'Platform user growth metrics',
        };
      case 'charities':
        return {
          title: 'Charity Metrics',
          description: 'Charity organization statistics',
          additionalInfo: 'Track charity performance',
        };
      case 'geographic':
        return {
          title: 'Geographic Distribution',
          description: 'Campaign locations',
          additionalInfo: 'Regional campaign coverage',
        };
      case 'trends':
        return {
          title: 'Temporal Trends',
          description: 'Time-based patterns',
          additionalInfo: 'Historical data analysis',
        };
      case 'beneficiary':
        return {
          title: 'Beneficiary Groups',
          description: 'Who benefits from campaigns',
          additionalInfo: 'Impact distribution by group',
        };
      case 'funds':
        return {
          title: 'Fund Flow',
          description: 'Financial transactions',
          additionalInfo: 'Money in and out tracking',
        };
      default:
        return {
          title: 'Data Point',
          description: 'Chart information',
          additionalInfo: '',
        };
    }
  };

  const config = getTooltipConfig();

  const valueFormatter = (value: any) => {
    if (typeof value === 'number') {
      return `${valuePrefix}${value.toLocaleString()}${valueSuffix}`;
    }
    return value;
  };

  return (
    <EnhancedTooltip
      active={active}
      payload={payload}
      label={label}
      title={config.title}
      description={config.description}
      valueFormatter={valueFormatter}
      additionalInfo={config.additionalInfo}
    />
  );
};
