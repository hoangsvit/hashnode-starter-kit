import { Inter, Plus_Jakarta_Sans } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta-sans',
  display: 'swap',
});

export const GlobalFontVariables = () => {
  // Always render the actual font variables to avoid hydration mismatch
  // The fallback fonts are already defined in the font configuration
  const interFamily = inter.style?.fontFamily || 'Inter, sans-serif';
  const jakartaFamily = plusJakartaSans.style?.fontFamily || 'Plus Jakarta Sans, sans-serif';

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
          html {
            --font-inter: ${interFamily};
            --font-plus-jakarta-sans: ${jakartaFamily};
          }

          /* Custom text selection color */
          ::selection {
            background-color: #f6af41;
            color: #ffffff;
          }

          ::-moz-selection {
            background-color: #f6af41;
            color: #ffffff;
          }
        `
      }}
    />
  );
};
