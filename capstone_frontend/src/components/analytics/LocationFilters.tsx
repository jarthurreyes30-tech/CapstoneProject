import { motion } from 'framer-motion';
import { Filter, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface LocationFiltersProps {
  regions: string[];
  provinces: string[];
  cities: string[];
  selectedRegion: string;
  selectedProvince: string;
  selectedCity: string;
  onRegionChange: (value: string) => void;
  onProvinceChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onClearFilters: () => void;
}

export default function LocationFilters({
  regions,
  provinces,
  cities,
  selectedRegion,
  selectedProvince,
  selectedCity,
  onRegionChange,
  onProvinceChange,
  onCityChange,
  onClearFilters,
}: LocationFiltersProps) {
  const hasActiveFilters = selectedRegion || selectedProvince || selectedCity;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col lg:flex-row gap-4 p-6 bg-slate-800/40 rounded-xl border border-slate-700/50"
    >
      <div className="flex items-center gap-2 text-slate-300">
        <Filter className="h-5 w-5 text-blue-400" />
        <span className="font-medium text-sm">Filter by Location:</span>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 flex-1">
        {/* Region Filter */}
        <Select value={selectedRegion || undefined} onValueChange={(val) => onRegionChange(val || '')}>
          <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-200 shrink-0 w-full sm:w-[200px]">
            <SelectValue placeholder="All Regions" />
          </SelectTrigger>
          <SelectContent 
            position="popper" 
            side="bottom" 
            align="start" 
            className="max-w-[95vw] w-[220px] z-[60]"
          >
            {regions.map((region) => (
              <SelectItem key={region} value={region}>
                {region}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Province Filter */}
        <Select 
          value={selectedProvince || undefined} 
          onValueChange={(val) => onProvinceChange(val || '')}
          disabled={!selectedRegion && provinces.length === 0}
        >
          <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-200 shrink-0 w-full sm:w-[200px]">
            <SelectValue placeholder="All Provinces" />
          </SelectTrigger>
          <SelectContent 
            position="popper" 
            side="bottom" 
            align="start" 
            className="max-w-[95vw] w-[220px] z-[60]"
          >
            {provinces.map((province) => (
              <SelectItem key={province} value={province}>
                {province}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* City Filter */}
        <Select 
          value={selectedCity || undefined} 
          onValueChange={(val) => onCityChange(val || '')}
          disabled={!selectedProvince && cities.length === 0}
        >
          <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-200 shrink-0 w-full sm:w-[200px]">
            <SelectValue placeholder="All Cities" />
          </SelectTrigger>
          <SelectContent 
            position="popper" 
            side="bottom" 
            align="start" 
            className="max-w-[95vw] w-[220px] z-[60]"
          >
            {cities.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={onClearFilters}
          className="border-slate-700 text-slate-300 hover:bg-slate-700"
        >
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </motion.div>
  );
}