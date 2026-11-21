import { isColourScheme } from "../shared/colour-scheme";
import type { Command, MessageOf } from "../shared/command";
import type { Fields } from "../shared/message-fields";
import { BACKGROUND_TYPES, type BackgroundMessage } from "../shared/messages";
import type { DeviceSchemeSink } from "./scheme-ports";

type Scheme = typeof BACKGROUND_TYPES.scheme;
type SchemeMessage = MessageOf<BackgroundMessage, Scheme>;

// The offscreen document saw the device's colour scheme.
export class DeviceSchemeCommand implements Command<BackgroundMessage, Scheme> {
  readonly type = BACKGROUND_TYPES.scheme;

  constructor(private readonly sink: DeviceSchemeSink) {}

  accepts(message: unknown): message is SchemeMessage {
    return isColourScheme((message as Fields).scheme);
  }

  handle(message: SchemeMessage): Promise<void> {
    return this.sink.deviceIs(message.scheme);
  }
}
