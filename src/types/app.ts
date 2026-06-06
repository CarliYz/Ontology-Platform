export interface CanvasComponent {
  id: string;
  type: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  icon: any;
  dataSource: string | null;
  action: string | null;
}

export interface InterfaceApp {
  id: string;
  name: string;
  description?: string;
  components: CanvasComponent[];
}
