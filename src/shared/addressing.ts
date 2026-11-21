// Checks of who a runtime message is for, so each context picks out its own.
import { isFields, type Fields } from "./fields";

// Every runtime message reaches every context, so each one picks out its own.
export function isMessageFor(
  message: unknown,
  target: string,
): message is Fields & { target: string } {
  return isFields(message) && message.target === target;
}

// Whether a message is addressed to the target and is of the type, so a
// command can read the fields its type carries.
export function isAddressed<Target extends string, Type extends string>(
  message: unknown,
  target: Target,
  type: Type,
): message is Fields & { target: Target; type: Type } {
  return isMessageFor(message, target) && message.type === type;
}
