import { PanelPlugin } from '@grafana/data';
import { SimpleOptions } from './types';
import { MFTDatePicker } from './components/MFTDatePicker'

export const plugin = new PanelPlugin<SimpleOptions>(MFTDatePicker).setPanelOptions((builder) => {
  return builder
  .addBooleanSwitch({
      path: 'showTimezoneSelect',
      name: 'Show timezone selector',
      defaultValue: true,
  });
});
