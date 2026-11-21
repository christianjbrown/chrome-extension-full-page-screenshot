// The two halves of a Chrome event that this needs, which
// chrome.downloads.onDeterminingFilename satisfies.
export interface ListenerEvent<Listener> {
  addListener(listener: Listener): void;
  removeListener(listener: Listener): void;
}

// Keeps a listener registered for as long as anything is holding it.
export interface Listening {
  hold(): void;
  release(): void;
}

const NOT_HELD = 0;

// Chrome asks every extension listening to onDeterminingFilename to name every
// download in the browser, and an empty answer can clash with, or override,
// the name another extension chose. So the listener is only there while this
// extension has a download of its own waiting for a name. Holds are counted,
// so overlapping downloads keep it registered until the last one is named.
export class FilenameListening<Listener> implements Listening {
  private holds = NOT_HELD;

  constructor(
    private readonly event: ListenerEvent<Listener>,
    private readonly listener: Listener,
  ) {}

  hold(): void {
    if (this.holds === NOT_HELD) {
      this.event.addListener(this.listener);
    }
    this.holds += 1;
  }

  release(): void {
    if (this.holds === NOT_HELD) {
      return;
    }
    this.holds -= 1;
    if (this.holds === NOT_HELD) {
      this.event.removeListener(this.listener);
    }
  }
}
