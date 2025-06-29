import { useEffect } from 'react';

const useCopyCodeButton = (containerRef: React.RefObject<HTMLElement>) => {
  useEffect(() => {
    if (!containerRef.current) return;

    const createCopyIcon = () => {
      return `
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 6.5A1.5 1.5 0 0 1 7.5 5h5A1.5 1.5 0 0 1 14 6.5v5a1.5 1.5 0 0 1-1.5 1.5h-5A1.5 1.5 0 0 1 6 11.5v-5Z" stroke="currentColor" stroke-width="1.2" fill="none"/>
          <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h.5" stroke="currentColor" stroke-width="1.2" fill="none"/>
          <path d="M4 14.5A1.5 1.5 0 0 0 5.5 16h5a1.5 1.5 0 0 0 1.5-1.5v-.5" stroke="currentColor" stroke-width="1.2" fill="none"/>
        </svg>
      `;
    };

    const createCheckIcon = () => {
      return `
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 6L8 13L5 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        </svg>
      `;
    };

    const createCopyButton = () => {
      const copyButton = document.createElement('button');
      copyButton.className = 'copy-button absolute top-3 right-3 bg-slate-700 hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-500 text-white font-medium p-2 rounded-md transition-all duration-200 opacity-70 hover:opacity-100 focus:opacity-100 z-10 flex items-center justify-center';
      copyButton.innerHTML = createCopyIcon();
      copyButton.setAttribute('data-copied', 'false');
      copyButton.setAttribute('aria-label', 'Copy code to clipboard');
      copyButton.setAttribute('title', 'Copy code');
      return copyButton;
    };

    const fallbackCopy = (text: string, button: HTMLElement) => {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        button.innerHTML = createCheckIcon();
        button.setAttribute('title', 'Copied!');
        setTimeout(() => {
          button.innerHTML = createCopyIcon();
          button.setAttribute('title', 'Copy code');
        }, 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy failed: ', fallbackErr);
      }
      document.body.removeChild(textArea);
    };

    const handleCopyClick = async (codeBlock: Element, button: HTMLElement) => {
      try {
        const code = codeBlock.textContent || '';
        await navigator.clipboard.writeText(code);

        // Visual feedback with icon change
        button.innerHTML = createCheckIcon();
        button.setAttribute('data-copied', 'true');
        button.setAttribute('title', 'Copied!');
        button.className = 'copy-button absolute top-3 right-3 bg-green-600 hover:bg-green-500 text-white font-medium p-2 rounded-md transition-all duration-200 opacity-100 z-10 flex items-center justify-center';

        // Reset after 2 seconds
        setTimeout(() => {
          button.innerHTML = createCopyIcon();
          button.setAttribute('data-copied', 'false');
          button.setAttribute('title', 'Copy code');
          button.className = 'copy-button absolute top-3 right-3 bg-slate-700 hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-500 text-white font-medium p-2 rounded-md transition-all duration-200 opacity-70 hover:opacity-100 focus:opacity-100 z-10 flex items-center justify-center';
        }, 2000);
      } catch (err) {
        console.error('Failed to copy code: ', err);
        fallbackCopy(codeBlock.textContent || '', button);
      }
    };

    const handleMouseEnter = (button: HTMLElement) => {
      button.style.opacity = '1';
    };

    const handleMouseLeave = (button: HTMLElement) => {
      if (button.getAttribute('data-copied') === 'false') {
        button.style.opacity = '0.7';
      }
    };

    const addCopyButtonToCodeBlock = (codeBlock: Element) => {
      const pre = codeBlock.parentElement;
      if (!pre || pre.querySelector('.copy-button')) return;

      const copyButton = createCopyButton();

      // Add event listeners
      copyButton.addEventListener('click', () => handleCopyClick(codeBlock, copyButton));
      pre.addEventListener('mouseenter', () => handleMouseEnter(copyButton));
      pre.addEventListener('mouseleave', () => handleMouseLeave(copyButton));

      // Style the pre element and append button
      pre.style.position = 'relative';
      pre.appendChild(copyButton);
    };

    const addCopyButtons = () => {
      const codeBlocks = containerRef.current?.querySelectorAll('pre code') || [];
      codeBlocks.forEach(addCopyButtonToCodeBlock);
    };

    // Add buttons after a short delay to ensure content is rendered
    const timer = setTimeout(addCopyButtons, 100);

    // Observer to handle dynamically added content
    const observer = new MutationObserver(() => {
      setTimeout(addCopyButtons, 50);
    });

    observer.observe(containerRef.current, {
      childList: true,
      subtree: true,
    });

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [containerRef]);
};

export default useCopyCodeButton;
