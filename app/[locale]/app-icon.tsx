import type { SVGProps } from 'react';

export type AppIconName =
  | 'home'
  | 'dashboard'
  | 'tasks'
  | 'planner'
  | 'subjects'
  | 'focus'
  | 'habits'
  | 'analytics'
  | 'reminders'
  | 'inbox'
  | 'ai-assistant'
  | 'profile';

type AppIconProps = SVGProps<SVGSVGElement> & {
  name: AppIconName;
};

export function AppIcon({ name, className, ...props }: AppIconProps) {
  const sharedProps = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
    'aria-hidden': true,
    ...props,
  };

  switch (name) {
    case 'home':
      return (
        <svg {...sharedProps}>
          <path d="M4 10.5 12 4l8 6.5" />
          <path d="M6.5 9.5V20h11V9.5" />
          <path d="M10 20v-5.5h4V20" />
        </svg>
      );
    case 'dashboard':
      return (
        <svg {...sharedProps}>
          <rect x="4" y="4" width="7" height="7" rx="1.5" />
          <rect x="13" y="4" width="7" height="11" rx="1.5" />
          <rect x="4" y="13" width="7" height="7" rx="1.5" />
          <rect x="13" y="17" width="7" height="3" rx="1.5" />
        </svg>
      );
    case 'tasks':
      return (
        <svg {...sharedProps}>
          <path d="M9 6h11" />
          <path d="M9 12h11" />
          <path d="M9 18h11" />
          <path d="m4.5 6 1.5 1.5L8.5 5" />
          <path d="m4.5 12 1.5 1.5L8.5 11" />
          <path d="m4.5 18 1.5 1.5L8.5 17" />
        </svg>
      );
    case 'planner':
      return (
        <svg {...sharedProps}>
          <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
          <path d="M7.5 3.5v3" />
          <path d="M16.5 3.5v3" />
          <path d="M3.5 9.5h17" />
          <path d="M8 13h3" />
          <path d="M13 13h3" />
          <path d="M8 16.5h3" />
        </svg>
      );
    case 'subjects':
      return (
        <svg {...sharedProps}>
          <path d="M5 6.5A2.5 2.5 0 0 1 7.5 4H19v14.5A2.5 2.5 0 0 0 16.5 16H5Z" />
          <path d="M5 6.5V18a2 2 0 0 0 2 2h12" />
          <path d="M8 8.5h7" />
          <path d="M8 12h7" />
        </svg>
      );
    case 'focus':
      return (
        <svg {...sharedProps}>
          <circle cx="12" cy="12" r="7" />
          <path d="M12 8v4l2.5 2.5" />
          <path d="M12 2.5v2" />
          <path d="M12 19.5v2" />
        </svg>
      );
    case 'habits':
      return (
        <svg {...sharedProps}>
          <path d="M12 20c4.5-2.2 7-6 7-10.5-3 .2-5.6 1.2-7 3.8C10.6 10.7 8 9.7 5 9.5 5 14 7.5 17.8 12 20Z" />
          <path d="M12 13.5V20" />
        </svg>
      );
    case 'analytics':
      return (
        <svg {...sharedProps}>
          <path d="M4 19.5h16" />
          <path d="M7 16V11" />
          <path d="M12 16V7" />
          <path d="M17 16v-4" />
        </svg>
      );
    case 'reminders':
      return (
        <svg {...sharedProps}>
          <path d="M12 4.5a4.5 4.5 0 0 1 4.5 4.5v2.5c0 1 .3 2 .9 2.8l.8 1.2H5.8l.8-1.2c.6-.8.9-1.8.9-2.8V9A4.5 4.5 0 0 1 12 4.5Z" />
          <path d="M10 18a2 2 0 0 0 4 0" />
        </svg>
      );
    case 'inbox':
      return (
        <svg {...sharedProps}>
          <path d="M4 7.5h16v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" />
          <path d="M4 12.5h4l2 3h4l2-3h4" />
        </svg>
      );
    case 'ai-assistant':
      return (
        <svg {...sharedProps}>
          <rect x="5" y="6" width="14" height="11" rx="3" />
          <path d="M9 17v2.5" />
          <path d="M15 17v2.5" />
          <path d="M8.5 10.5h.01" />
          <path d="M15.5 10.5h.01" />
          <path d="M9 13.5c1 .7 2 .9 3 .9s2-.2 3-.9" />
          <path d="M12 3.5v2" />
        </svg>
      );
    case 'profile':
      return (
        <svg {...sharedProps}>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 19a7 7 0 0 1 14 0" />
        </svg>
      );
    default:
      return null;
  }
}
