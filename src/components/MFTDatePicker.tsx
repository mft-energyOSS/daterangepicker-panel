import React, { useState, useEffect } from 'react';
import { PanelProps } from '@grafana/data';
import { SimpleOptions } from 'types';
import { CustomProvider, DateRangePicker, Button } from 'rsuite';
import { PanelDataErrorView, locationService } from '@grafana/runtime';
import moment from 'moment-timezone';
import { addDays } from 'date-fns';
import 'rsuite/DateRangePicker/styles/index.css';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

interface Props extends PanelProps<SimpleOptions> { }

const darkTheme = createTheme({
  palette: { mode: 'dark' },
});

export const MFTDatePicker: React.FC<Props> = ({
  data,
  fieldConfig,
  id,
  timeRange,
  timeZone,
  options,
  onChangeTimeRange
}) => {
  
  // Local state for date range and timezone
  const [range, setRange] = useState<[Date, Date]>([
    timeRange.from.toDate(),
    timeRange.to.toDate(),
  ]);
  const [tz, setTz] = useState<string>(timeZone);

  // Sync local tz when dashboard tz changes externally
  useEffect(() => {
    setTz(timeZone);
  }, [timeZone]);

  // Helper to send dashboard update
  const updateDash = (
    [fromDate, toDate]: [Date, Date],
    timezone: string
  ) => {
    onChangeTimeRange({
      from: moment(fromDate).tz(timezone).startOf('day').valueOf(),
      to: moment(toDate).tz(timezone).endOf('day').valueOf(),
    });
  };

  // Handle date range change
  const handleRangeChange = (value: [Date, Date] | null) => {
    if (value) {
      setRange(value);
      updateDash(value, tz);
    }
  };

  // Handle timezone picker change
  const handleTzChange = async (newTz: string) => {
    setTz(newTz);
    await locationService.partial({ timezone: newTz });
    updateDash(range, newTz);
  };

  // Shift the current range by days
  const shiftDays = (days: number) => {
    const [from, to] = range;
    handleRangeChange([
      addDays(from, days),
      addDays(to, days),
    ]);
  };

  if (data.series.length === 0) {
    return (
      <PanelDataErrorView
        fieldConfig={fieldConfig}
        panelId={id}
        data={data}
        needsStringField
      />
    );
  }

  const Ranges = [
    { label: 'yesterday', value: () => [addDays(new Date(), -1), addDays(new Date(), -1)] as [Date, Date], placement: 'left' as const },
    { label: 'today', value: () => [new Date(), new Date()] as [Date, Date], placement: 'left' as const },
    { label: 'Tomorrow', value: () => [addDays(new Date(), 1), addDays(new Date(), 1)] as [Date, Date], placement: 'left' as const },
    { label: 'last7Days', value: () => [addDays(new Date(), -6), new Date()] as [Date, Date], placement: 'left' as const },
  ];

  const TimeZones = [
    { label: 'UTC', value: 'utc' },
    { label: 'EDT', value: 'America/Puerto_Rico' },
    { label: 'EST / CDT', value: 'America/Panama' },
    { label: 'CST / MDT', value: 'America/Monterrey' },
    { label: 'MST / PDT', value: 'America/Phoenix' },
    { label: 'PST', value: 'Pacific/Pitcairn' },
  ];

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

        <Button onClick={() => locationService.reload()}>⟲</Button>

        <CustomProvider theme="dark">
          <DateRangePicker
            value={range}
            onChange={handleRangeChange}
            character=" - "
            showOneCalendar
            ranges={Ranges}
          />
        </CustomProvider>

        {options.showTimezoneSelect && (
          <FormControl variant="outlined" size="small" style={{ width: 120 }}>
            <InputLabel id={`${id}-timezone-label`}>Timezone</InputLabel>
            <Select
              labelId={`${id}-timezone-label`}
              id={`${id}-timezone-select`}
              value={tz}
              label="Timezone"
              onChange={(e) => handleTzChange(e.target.value as string)}
              MenuProps={{ style: { textAlign: 'center', padding: 0 } }}
              renderValue={(selected) => {
                const found = TimeZones.find((opt) => opt.value === selected);
                return found ? found.label : selected;
              }}
              sx={{ color: '#fff', '.MuiSelect-icon': { color: '#fff' } }}
            >
              {TimeZones.map((option) => (
                <MenuItem
                  key={option.value}
                  value={option.value}
                  sx={{ textAlign: 'center', color: '#fff' }}
                >
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        <Button onClick={() => shiftDays(-1)}>{'<'}</Button>
        <Button onClick={() => shiftDays(1)}>{'>'}</Button>
      </div>
    </ThemeProvider>
  );
};
