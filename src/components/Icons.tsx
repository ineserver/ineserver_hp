// SVGアイコンコンポーネント
import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

export const BullhornIcon = ({ className, size = 24 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2C13.1 2 14 2.9 14 4V8L22 10V14L14 16V20C14 21.1 13.1 22 12 22H10C8.9 22 8 21.1 8 20V18L3 17C2.4 16.9 2 16.4 2 15.8V8.2C2 7.6 2.4 7.1 3 7L8 6V4C8 2.9 8.9 2 10 2H12M10 4V6.5L4 7.5V14.5L10 15.5V20H12V15L20 13V11L12 9V4H10Z"/>
  </svg>
);

export const CoinsIcon = ({ className, size = 24 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M5,8.5A1.5,1.5 0 0,0 6.5,10A1.5,1.5 0 0,0 8,8.5A1.5,1.5 0 0,0 6.5,7A1.5,1.5 0 0,0 5,8.5M6.5,5C8.59,5 10.25,6.66 10.25,8.75C10.25,10.84 8.59,12.5 6.5,12.5C4.41,12.5 2.75,10.84 2.75,8.75C2.75,6.66 4.41,5 6.5,5M16.5,12.5A1.5,1.5 0 0,0 18,14A1.5,1.5 0 0,0 19.5,12.5A1.5,1.5 0 0,0 18,11A1.5,1.5 0 0,0 16.5,12.5M18,9C20.09,9 21.75,10.66 21.75,12.75C21.75,14.84 20.09,16.5 18,16.5C15.91,16.5 14.25,14.84 14.25,12.75C14.25,10.66 15.91,9 18,9Z"/>
  </svg>
);

export const TrendingUpIcon = ({ className, size = 24 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M16,6L18.29,8.29L13.41,13.17L9.41,9.17L2,16.59L3.41,18L9.41,12L13.41,16L19.71,9.71L22,12V6H16Z"/>
  </svg>
);

export const TrendingDownIcon = ({ className, size = 24 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M16,18L18.29,15.71L13.41,10.83L9.41,14.83L2,7.41L3.41,6L9.41,12L13.41,8L19.71,14.29L22,12V18H16Z"/>
  </svg>
);

export const CashIcon = ({ className, size = 24 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M5,6H23V18H5V6M14,9A3,3 0 0,1 17,12A3,3 0 0,1 14,15A3,3 0 0,1 11,12A3,3 0 0,1 14,9M9,8A2,2 0 0,1 7,10V14A2,2 0 0,1 9,16H19A2,2 0 0,1 21,14V10A2,2 0 0,1 19,8H9Z"/>
  </svg>
);

export const GamepadIcon = ({ className, size = 24 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M7,6H17A6,6 0 0,1 23,12A6,6 0 0,1 17,18C15.22,18 13.63,17.23 12.53,16H11.47C10.37,17.23 8.78,18 7,18A6,6 0 0,1 1,12A6,6 0 0,1 7,6M6,9V11H4V13H6V15H8V13H10V11H8V9H6M15.5,12A1.5,1.5 0 0,0 17,10.5A1.5,1.5 0 0,0 15.5,9A1.5,1.5 0 0,0 14,10.5A1.5,1.5 0 0,0 15.5,12M18.5,15A1.5,1.5 0 0,0 20,13.5A1.5,1.5 0 0,0 18.5,12A1.5,1.5 0 0,0 17,13.5A1.5,1.5 0 0,0 18.5,15Z"/>
  </svg>
);

export const HomeIcon = ({ className, size = 24 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z"/>
  </svg>
);

export const MapIcon = ({ className, size = 24 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M15,19L9,16.89V5L15,7.11M20.5,3C20.44,3 20.39,3 20.34,3L15,5.1L9,3L3.36,4.9C3.15,4.97 3,5.15 3,5.38V20.5A0.5,0.5 0 0,0 3.5,21C3.55,21 3.61,21 3.66,21L9,18.9L15,21L20.64,19.1C20.85,19.03 21,18.85 21,18.62V3.5A0.5,0.5 0 0,0 20.5,3Z"/>
  </svg>
);

export const SubwayIcon = ({ className, size = 24 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.5,2.5H5.5C4.12,2.5 3,3.62 3,5V16.5C3,17.88 4.12,19 5.5,19L2.29,22.21L3.71,23.62L7.08,20.25H16.92L20.29,23.62L21.71,22.21L18.5,19C19.88,19 21,17.88 21,16.5V5C21,3.62 19.88,2.5 18.5,2.5M5,6.5H19V12H5V6.5M8,15.5A1.5,1.5 0 0,1 9.5,17A1.5,1.5 0 0,1 8,18.5A1.5,1.5 0 0,1 6.5,17A1.5,1.5 0 0,1 8,15.5M16,15.5A1.5,1.5 0 0,1 17.5,17A1.5,1.5 0 0,1 16,18.5A1.5,1.5 0 0,1 14.5,17A1.5,1.5 0 0,1 16,15.5Z"/>
  </svg>
);

export const FileTextIcon = ({ className, size = 24 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
  </svg>
);

export const ChevronRightIcon = ({ className, size = 24 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"/>
  </svg>
);

export const ShieldIcon = ({ className, size = 24 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V10.5L16,10.5V16.5L8,16.5V10.5L9.2,10.5V10C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.5,8.7 10.5,9.5V10.5L13.5,10.5V9.5C13.5,8.7 12.8,8.2 12,8.2Z"/>
  </svg>
);

export const PlusIcon = ({ className, size = 24 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
  </svg>
);

export const MinusIcon = ({ className, size = 24 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19,13H5V11H19V13Z"/>
  </svg>
);

export const ChevronDownIcon = ({ className, size = 24 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"/>
  </svg>
);

// アイコンマッピング
export const iconMap = {
  bullhorn: BullhornIcon,
  coins: CoinsIcon,
  trendingUp: TrendingUpIcon,
  trendingDown: TrendingDownIcon,
  cash: CashIcon,
  gamepad: GamepadIcon,
  home: HomeIcon,
  map: MapIcon,
  subway: SubwayIcon,
  fileText: FileTextIcon,
  chevronRight: ChevronRightIcon,
  shield: ShieldIcon,
  plus: PlusIcon,
  minus: MinusIcon,
  chevronDown: ChevronDownIcon,
} as const;

export type IconName = keyof typeof iconMap;
