export enum WeatherType {
  SUNNY = 'Sunny',
  RAINY = 'Rainy',
  SNOWY = 'Snowy',
  WINDY = 'Windy'
}

export interface WeatherData {
  id: string;
  city: string;
  type: WeatherType;
  temp: number;
  high: number;
  low: number;
  label: string;
}

export type Language = 'zh' | 'en';