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

export const PackageIcon = ({ className, size = 24 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M21,16.5C21,16.88 20.79,17.21 20.47,17.38L12.57,21.82C12.41,21.94 12.21,22 12,22C11.79,22 11.59,21.94 11.43,21.82L3.53,17.38C3.21,17.21 3,16.88 3,16.5V7.5C3,7.12 3.21,6.79 3.53,6.62L11.43,2.18C11.59,2.06 11.79,2 12,2C12.21,2 12.41,2.06 12.57,2.18L20.47,6.62C20.79,6.79 21,7.12 21,7.5V16.5M12,4.15L6.04,7.5L12,10.85L17.96,7.5L12,4.15M5,15.91L11,19.29V12.58L5,9.21V15.91M19,15.91V9.21L13,12.58V19.29L19,15.91Z"/>
  </svg>
);

export const LandmarkIcon = ({ className, size = 24 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12,2L2,7V9H22V7M3,10V19H2V21H22V19H21V10M18,10H15V19H18M10,10H7V19H10M13,10V19H14V10"/>
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

export const ToolsIcon = ({ className, size = 24 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M23.7,4.647c-0.082-0.412-0.197-0.622-0.197-0.622c-0.035-0.111-0.131-0.193-0.245-0.212
		c-0.116-0.018-0.232,0.03-0.3,0.125l-0.306,0.429l-1.73,2.429c-0.334,0.467-1.016,0.552-1.524,0.19l-2.913-2.084
		c-0.507-0.363-0.648-1.036-0.313-1.503l1.772-2.488l0.291-0.406c0.067-0.095,0.076-0.22,0.023-0.322
		c-0.054-0.103-0.161-0.167-0.278-0.166c0,0-0.275-0.047-0.714,0.009c-1.106,0.141-2.183,0.602-3.083,1.391
		c-1.271,1.113-1.939,2.66-1.976,4.225c-0.012,0.472,0.415,2.523-0.7,3.639S0.938,19.821,0.938,19.821
		c-0.956,0.957-0.956,2.507,0,3.463c0.957,0.956,2.507,0.956,3.463,0c0,0,9.655-9.655,10.54-10.54
		s3.337-1.147,3.825-1.213c1.09-0.147,2.149-0.606,3.038-1.385C23.419,8.735,24.066,6.613,23.7,4.647z
		 M1.876,22.347c-0.458-0.458-0.458-1.201,0-1.659c0.458-0.458,1.201-0.458,1.659,0c0.458,0.458,0.458,1.201,0,1.659
		C3.077,22.805,2.334,22.805,1.876,22.347z"/>
  </svg>
);

export const FlagIcon = ({ className, size = 24 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M6.656,0.75c6.266,1.158,6.072,4.242,11.277,3.856c1.735,0,3.515-0.919,3.855-0.578
		c0.289,0.289-1.927,5.975-5.783,7.614c-3.143,1.336-7.325,1.446-9.349,0.097V0.75z"/>
    <path d="M3.672,24c-0.828,0-1.5-0.672-1.5-1.5V1.5c0-0.828,0.672-1.5,1.5-1.5s1.5,0.672,1.5,1.5v21
		C5.172,23.328,4.5,24,3.672,24z"/>
  </svg>
);

export const DiscordIcon = ({ className, size = 24 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

export const GitHubIcon = ({ className, size = 24 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
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
  package: PackageIcon,
  landmark: LandmarkIcon,
} as const;

export type IconName = keyof typeof iconMap;
