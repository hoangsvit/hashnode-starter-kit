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

const variableConstant = 'variable';
const fontInterVar = inter.variable?.replace(variableConstant, 'Inter') || '--font-inter';
const fontPlusJakartaSansVar = plusJakartaSans.variable?.replace(variableConstant, 'Plus_Jakarta_Sans') || '--font-plus-jakarta-sans';

export const GlobalFontVariables = () => {
  // Check if fonts are loaded properly
  if (typeof window === 'undefined') {
    // Server-side: return minimal styles
    return (
      <style
        dangerouslySetInnerHTML={{
          __html: `
            html {
              --font-inter: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
              --font-plus-jakarta-sans: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
            }
          `
        }}
      />
    );
  }
  
  // Client-side: use the font variables
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
          html {
            --font-inter: ${fontInterVar};
            --font-plus-jakarta-sans: ${fontPlusJakartaSansVar};
          }
        `
      }}
    />
  );
};
