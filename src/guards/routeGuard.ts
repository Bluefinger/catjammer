import type { RoutedCommand } from "../router";

export const routeGuard = (command: RoutedCommand | undefined): command is RoutedCommand =>
  command !== undefined;
