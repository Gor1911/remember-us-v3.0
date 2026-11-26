/**
 * Dashboard / memorial-form icons — thin wrappers over the shared duotone set
 * (`components/ui/icons.tsx`) that keep the original names and small default sizes.
 */
import {
  ArrowIcon,
  CameraIcon as UiCamera,
  CloseIcon as UiClose,
  PersonIcon as UiPerson,
  PlusIcon as UiPlus,
  StarIcon as UiStar,
  TickIcon,
} from '@/components/ui/icons';

interface IconProps {
  className?: string;
}

export const PersonIcon = ({ className = 'w-4 h-4' }: IconProps) => <UiPerson className={className} />;
export const StarIcon = ({ className = 'w-4 h-4' }: IconProps) => <UiStar className={className} />;
export const CheckIcon = ({ className = 'w-4 h-4' }: IconProps) => <TickIcon className={className} />;
export const CameraIcon = ({ className = 'w-5 h-5' }: IconProps) => <UiCamera className={className} />;
export const CloseIcon = ({ className = 'w-4 h-4' }: IconProps) => <UiClose className={className} />;
export const PlusIcon = ({ className = 'w-4 h-4' }: IconProps) => <UiPlus className={className} />;
export const ArrowRightIcon = ({ className = 'w-4 h-4' }: IconProps) => <ArrowIcon className={className} />;
export const ArrowLeftIcon = ({ className = 'w-4 h-4' }: IconProps) => <ArrowIcon direction="left" className={className} />;

interface TypeIconProps extends IconProps {
  type: 'civilian' | 'military';
}

export const TypeIcon = ({ type, className }: TypeIconProps) =>
  type === 'military' ? <StarIcon className={className} /> : <PersonIcon className={className} />;
