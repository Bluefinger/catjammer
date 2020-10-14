import { RoutedCommand } from "../router";

export type PermissionGuard = (command: RoutedCommand) => boolean;
