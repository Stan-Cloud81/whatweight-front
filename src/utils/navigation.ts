export function setupBackButtonHandler(onBack: () => void): () => void {
  const handlePopState = (event: PopStateEvent) => {
    event.preventDefault();
    onBack();
  };

  window.addEventListener('popstate', handlePopState);

  return () => {
    window.removeEventListener('popstate', handlePopState);
  };
}

export function pushNavigationState(stateName: string) {
  window.history.pushState({ page: stateName }, '', '');
}
