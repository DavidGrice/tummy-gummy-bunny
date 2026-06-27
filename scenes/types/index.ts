export interface SceneDefinition {
  id: string;
  label: string;
  path: string;
}

export interface SceneTransition {
  from: string;
  to: string;
  trigger: string;
}
