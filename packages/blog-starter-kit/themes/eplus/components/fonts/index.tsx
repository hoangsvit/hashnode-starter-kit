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
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
          html {
            --font-inter: ${inter.style.fontFamily};
            --font-plus-jakarta-sans: ${plusJakartaSans.style.fontFamily};
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
