// This script is intended to be executed in client-side only for loading iframe.
(function () {
  const script = document.currentScript as HTMLScriptElement;
  const origin = new URL(script.src).origin;

  // Parse config from script attributes.
  const config = Object.assign(
    {
      page: 'blogs',
      categoryId: '0',
      class: 'bfc-frame',
      loading: 'lazy',
      scrolling: 'no',
      noResize: 'false',
      style: 'width: 100%; border: none; min-height: 150px',
      loadingStyle: 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%)',
    },
    script.dataset
  );

  // Set up iframe element.
  const iframeElement = document.createElement('iframe');
  iframeElement.setAttribute('class', config.class);
  iframeElement.setAttribute('loading', config.loading);
  iframeElement.setAttribute('scrolling', config.scrolling);
  iframeElement.setAttribute('style', config.style);

  // Set up iframe source.
  const routes = {
    blogs: `/category/${config.categoryId}/feeds`,
    posts: `/category/${config.categoryId}/entries`,
  };
  iframeElement.setAttribute('src', `${origin}${routes[config.page as keyof typeof routes]}`);

  // Set up loading indicator.
  const loadingIndicator = document.createElement('div');
  loadingIndicator.innerHTML = 'Loading...';
  loadingIndicator.setAttribute('class', 'bfc-loading');
  loadingIndicator.setAttribute('style', config.loadingStyle);

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
  if (config.noResize !== 'true') {
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
