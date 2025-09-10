import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { KG, RU, US } from 'country-flag-icons/react/3x2';
import { useTranslation } from '@/hooks/useTranslation';
import { Language } from '@/types';

const languageOptions = [
  { code: Language.KG, name: 'Кыргызча', FlagComponent: KG },
  { code: Language.RU, name: 'Русский', FlagComponent: RU },
  { code: Language.EN, name: 'English', FlagComponent: US },
];

interface LanguageSwitcherProps {
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg';
  showText?: boolean;
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'ghost',
  size = 'default',
  showText = false,
  className,
}) => {
  const { currentLanguage, changeLanguage } = useTranslation();

  const currentLangOption =
    languageOptions.find(option => option.code === currentLanguage) ||
    languageOptions[1]; // Default to Russian

  const handleLanguageChange = (language: Language) => {
    changeLanguage(language);
  };

  const CurrentFlagComponent = currentLangOption.FlagComponent;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <CurrentFlagComponent className="h-4 w-4 rounded-sm" />
          {showText && (
            <span className="ml-2">
              {currentLangOption.name}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
        {languageOptions.map(option => {
          const FlagComponent = option.FlagComponent;
          return (
            <DropdownMenuItem
              key={option.code}
              onClick={() => handleLanguageChange(option.code)}
              className={`cursor-pointer text-gray-200 focus:bg-gray-700 focus:text-white ${
                currentLanguage === option.code
                  ? 'bg-gray-700 text-white'
                  : ''
              }`}
            >
              <FlagComponent className="h-4 w-4 rounded-sm mr-2" />
              {option.name}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
