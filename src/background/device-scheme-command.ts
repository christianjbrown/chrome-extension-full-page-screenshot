import { isColourScheme } from "../shared/colour-scheme";
import type { Command } from "../shared/command";
import type { Fields } from "../shared/fields";
import type { BackgroundMessage } from "../shared/messages";
import { SCHEME, type SchemeMessage } from "../shared/scheme-message";
import type { DeviceSchemeSink } from "./scheme-ports";

// The offscreen document saw the device's colour scheme.
export class DeviceSchemeCommand implements Command<
  BackgroundMessage,
  typeof SCHEME
> {
  readonly type = SCHEME;

  constructor(private readonly sink: DeviceSchemeSink) {}

  accepts(message: unknown): message is SchemeMessage {
    return isColourScheme((message as Fields).scheme);
  }

  handle(message: SchemeMessage): Promise<void> {
    return this.sink.deviceIs(message.scheme);
  }
}
