import { useEffect } from 'react';

const useCopyCodeButton = (containerRef: React.RefObject<HTMLElement>) => {
  useEffect(() => {
    if (!containerRef.current) return;

    // Constants
    const COPY_TEXT = 'Copy';
    const COPIED_TEXT = 'Copied!';
    const COPY_DELAY = 2000;
    const RENDER_DELAY = 100;
    const OBSERVER_DELAY = 50;

    // CSS classes
    const DEFAULT_CLASSES = 'copy-button absolute top-3 right-3 text-white font-medium px-3 py-1.5 rounded-md transition-opacity duration-200 z-10 flex items-center justify-center text-xs bg-slate-700 hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-500 opacity-70 hover:opacity-100';
    const SUCCESS_CLASSES = 'copy-button absolute top-3 right-3 text-white font-medium px-3 py-1.5 rounded-md z-10 flex items-center justify-center text-xs bg-green-600 opacity-100';

    const createCopyButton = () => {
      const copyButton = document.createElement('button');
      copyButton.className = DEFAULT_CLASSES;
      copyButton.textContent = COPY_TEXT;
      copyButton.setAttribute('data-copied', 'false');
      copyButton.setAttribute('aria-label', 'Copy code to clipboard');
      copyButton.setAttribute('title', 'Copy code');
      return copyButton;
    };

    const updateButtonState = (button: HTMLElement, isCopied: boolean) => {
      button.textContent = isCopied ? COPIED_TEXT : COPY_TEXT;
      button.setAttribute('data-copied', isCopied.toString());
      button.setAttribute('title', isCopied ? 'Copied!' : 'Copy code');
      button.className = isCopied ? SUCCESS_CLASSES : DEFAULT_CLASSES;
    };

    const fallbackCopy = async (text: string, button: HTMLElement) => {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        const success = document.execCommand('copy');
        if (success) {
          updateButtonState(button, true);
          setTimeout(() => updateButtonState(button, false), COPY_DELAY);
        }
      } catch (err) {
        console.error('Fallback copy failed: ', err);
      } finally {
        document.body.removeChild(textArea);
      }
    };

    const handleCopyClick = async (codeBlock: Element, button: HTMLElement) => {
      try {
        const code = codeBlock.textContent || '';
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(code);
          updateButtonState(button, true);
          setTimeout(() => updateButtonState(button, false), COPY_DELAY);
        } else {
          await fallbackCopy(code, button);
        }
      } catch (err) {
        console.error('Failed to copy code: ', err);
        await fallbackCopy(codeBlock.textContent || '', button);
      }
    };

    const handleMouseInteraction = (button: HTMLElement, isEnter: boolean) => {
      if (button.getAttribute('data-copied') === 'false') {
        button.classList.toggle('opacity-70', !isEnter);
        button.classList.toggle('opacity-100', isEnter);
      }
    };

    const addCopyButtonToCodeBlock = (codeBlock: Element) => {
      const pre = codeBlock.parentElement;
      if (!pre || pre.querySelector('.copy-button')) return;

      const copyButton = createCopyButton();

      // Add event listeners
      copyButton.addEventListener('click', () => handleCopyClick(codeBlock, copyButton));
      pre.addEventListener('mouseenter', () => handleMouseInteraction(copyButton, true));
      pre.addEventListener('mouseleave', () => handleMouseInteraction(copyButton, false));

      // Style the pre element and append button
      pre.style.position = 'relative';
      pre.appendChild(copyButton);
    };

    const addCopyButtons = () => {
      const codeBlocks = containerRef.current?.querySelectorAll('pre code') || [];
      codeBlocks.forEach(addCopyButtonToCodeBlock);
    };

    // Initial setup with debounced execution
    const timer = setTimeout(addCopyButtons, RENDER_DELAY);

    // Observer for dynamic content with debounced callback
    let observerTimer: NodeJS.Timeout;
    const observer = new MutationObserver(() => {
      clearTimeout(observerTimer);
      observerTimer = setTimeout(addCopyButtons, OBSERVER_DELAY);
    });

    observer.observe(containerRef.current, {
      childList: true,
      subtree: true,
    });

    return () => {
      clearTimeout(timer);
      clearTimeout(observerTimer);
      observer.disconnect();
    };
  }, [containerRef]);
};

export default useCopyCodeButton;
