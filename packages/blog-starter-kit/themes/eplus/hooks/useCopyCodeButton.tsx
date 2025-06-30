import { useEffect } from 'react';

const useCopyCodeButton = (containerRef: React.RefObject<HTMLElement>) => {
  useEffect(() => {
    if (!containerRef.current) return;

    const createCopyText = () => {
      return `Copy`;
    };

    const createCopiedText = () => {
      return `Copied!`;
    };

    const createCopyButton = () => {
      const copyButton = document.createElement('button');
      copyButton.className = 'copy-button absolute top-3 right-3 bg-slate-700 hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-500 text-white font-medium px-3 py-1.5 rounded-md transition-all duration-200 opacity-70 hover:opacity-100 focus:opacity-100 z-10 flex items-center justify-center text-xs';
      copyButton.innerHTML = createCopyText();
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
        button.innerHTML = createCopiedText();
        button.setAttribute('title', 'Copied!');
        setTimeout(() => {
          button.innerHTML = createCopyText();
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

        // Visual feedback with text change
        button.innerHTML = createCopiedText();
        button.setAttribute('data-copied', 'true');
        button.setAttribute('title', 'Copied!');
        button.className = 'copy-button absolute top-3 right-3 bg-green-600 hover:bg-green-500 text-white font-medium px-3 py-1.5 rounded-md transition-all duration-200 opacity-100 z-10 flex items-center justify-center text-xs';

        // Reset after 2 seconds
        setTimeout(() => {
          button.innerHTML = createCopyText();
          button.setAttribute('data-copied', 'false');
          button.setAttribute('title', 'Copy code');
          button.className = 'copy-button absolute top-3 right-3 bg-slate-700 hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-500 text-white font-medium px-3 py-1.5 rounded-md transition-all duration-200 opacity-70 hover:opacity-100 focus:opacity-100 z-10 flex items-center justify-center text-xs';
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
