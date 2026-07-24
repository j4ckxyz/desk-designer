// Plain (non-reactive) holder so the toolbar can call imperative engine
// methods (camera framing, PNG export) without prop drilling.
export const engineRef = { current: null };
