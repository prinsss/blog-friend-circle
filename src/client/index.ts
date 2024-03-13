// This script is intended to be executed in client-side only for loading iframe.
(function () {
  const script = document.currentScript as HTMLScriptElement;
  const origin = new URL(script.src).origin;
  const attributes = script.dataset;

  // Inline styles.
  const defaultIFrameStyle = 'width: 100%; border: none; min-height: 150px';
  const defaultLoadingStyle =
    'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%)';

  // Set up iframe element.
  const iframeElement = document.createElement('iframe');
  iframeElement.setAttribute('src', `${origin}/${attributes.page ?? 'blogs'}`);
  iframeElement.setAttribute('class', attributes.class ?? 'bfc-frame');
  iframeElement.setAttribute('loading', attributes.loading ?? 'lazy');
  iframeElement.setAttribute('scrolling', attributes.scrolling ?? 'no');
  iframeElement.setAttribute('style', attributes.style ?? defaultIFrameStyle);

  // Set up loading indicator.
  const loadingIndicator = document.createElement('div');
  loadingIndicator.innerHTML = 'Loading...';
  loadingIndicator.setAttribute('class', 'bfc-loading');
  loadingIndicator.setAttribute('style', attributes.loadingStyle ?? defaultLoadingStyle);

  // Prepare iframe container.
  let iframeContainer = document.querySelector('.blog-friend-circle');
  if (!iframeContainer) {
    iframeContainer = document.createElement('div');
    iframeContainer.setAttribute('class', 'blog-friend-circle');
    script.insertAdjacentElement('afterend', iframeContainer);
  }

  // Insert iframe element.
  iframeContainer.setAttribute('style', 'position: relative');
  iframeContainer.appendChild(iframeElement);
  iframeContainer.appendChild(loadingIndicator);

  // Prevent white flash on load.
  iframeElement.style.opacity = '0';
  iframeElement.addEventListener('load', () => {
    iframeElement.style.removeProperty('opacity');
    loadingIndicator.parentElement?.removeChild(loadingIndicator);
  });

  // Resize iframe to content height.
  if (attributes.noResize !== 'true') {
    window.addEventListener(
      'message',
      (event) => {
        if (event.data.type === 'resize') {
          const iframe = document.querySelector<HTMLIFrameElement>('.bfc-frame');
          if (iframe) {
            iframe.height = event.data.value + 'px';
          }
        }
      },
      false
    );
  }
})();
