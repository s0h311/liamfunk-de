# Web audio: what's feasible on mobile, what's rare

**Ticket:** [s0h311/liamfunk-de#3](https://github.com/s0h311/liamfunk-de/issues/3)
**Date:** 2026-09-01
**Sources:** primary unless marked `[secondary]`. Primary here means engine source (Blink/WebKit), the W3C/WHATWG specs, the WebKit blog and bug tracker, Chrome's own autoplay documentation, MDN, MDN browser-compat-data, caniuse, and bundle sizes I measured myself from npm tarballs.

This file answers what a sound-central concept for liamfunk.de can actually do on a phone: which browsers will make noise, after which gesture, and what silently swallows the audio anyway (the iOS ringer switch is the big one). It then prices the runtime cost, weighs Tone.js against raw Web Audio with measured bundle sizes, and lands on a degradation shape that survives the map's "weird, but never blocking" screen for a visitor who never turns sound on.

---

## 0. Executive summary

1. **Nothing may make a sound before a gesture.** There is no browser left where an autoplaying `AudioContext` works on a normal page load. Design for that, not around it.
2. **Safari is stricter than Chrome in a way that breaks naive code.** Chrome unlocks on *sticky* activation (any gesture, ever, on this document) — WebKit requires *transient* activation (you must call `resume()` **inside** the gesture handler, before it expires). Code that stores "user has interacted" in React state and resumes later works in Chrome and fails in Safari.
3. **The worst trap is not autoplay, it's the iOS ringer switch.** A Web Audio–only page gets an `"ambient"` audio session by default, which is silenced by the hardware silent switch. Everything reports `running`, `currentTime` advances, your visualiser animates — and the visitor hears nothing and concludes the site is broken. This is the single highest-priority thing to handle.
4. **Tone.js costs ~60 KB gzip minimum** even when you import three symbols (measured below); raw Web Audio costs 0 KB and covers everything a personal site needs. Recommendation: raw Web Audio.
5. **The mute-office problem forces the concept's shape.** Sound must be an *amplifier of a complete silent experience*, never the carrier of it. Recommended shape in §6.

---

## 1. Autoplay and gesture policy

### 1.1 The rule, from the specs and engines

**Spec status, precisely** (matters, because engines have shipped ahead of it): [Web Audio API 1.0](https://www.w3.org/TR/webaudio-1.0/) is a **W3C Recommendation dated 17 June 2021**; [Web Audio API 1.1](https://www.w3.org/TR/webaudio/) is a **First Public Working Draft dated 5 November 2024**. Both publish `AudioContextState` as exactly `"suspended" | "running" | "closed"` — **neither published version contains `"interrupted"`** (verified on w3.org, 2026-09-01). `"interrupted"` exists only in the [Editor's Draft](https://github.com/WebAudio/web-audio-api/blob/main/index.bs), in MDN, and in shipping WebKit and Blink. caniuse puts Web Audio API global support at **96.41%** (Safari 6+, Safari iOS 6+, Firefox 25+, Samsung Internet 4+; no IE, no Opera Mini) — [caniuse.com/audio-api](https://caniuse.com/audio-api), primary, checked 2026-09-01.

The spec leaves autoplay to the UA but names the hook:

> An `AudioContext` is said to be **allowed to start** if the user agent allows the context state to transition from "suspended" to "running". A user agent may disallow this initial transition, and to allow it only when the `AudioContext`'s relevant global object has **sticky activation**.
> — [W3C Web Audio API 1.1 FPWD](https://www.w3.org/TR/webaudio/) / [Editor's Draft `index.bs`](https://github.com/WebAudio/web-audio-api/blob/main/index.bs) (primary)

MDN's autoplay guide states the general availability rule: media is allowed to autoplay only if it is muted/zero-volume, **or** the user has interacted with the site, **or** the site is allowlisted by the browser (engagement heuristics or user preference), **or** the `autoplay` Permissions Policy grants it to an iframe. ([MDN, Autoplay guide for media and Web Audio APIs](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay), primary). The same page confirms Web Audio is in scope: starting a source node "outside the context of handling a user input event is subject to autoplay rules".

**What counts as a qualifying gesture** — the activation-triggering input events, per MDN's glossary entries for [transient](https://developer.mozilla.org/en-US/docs/Glossary/Transient_activation) and [sticky](https://developer.mozilla.org/en-US/docs/Glossary/Sticky_activation) activation (primary):

- `mousedown` / `pointerdown` (mouse)
- `pointerup` (any other pointer — i.e. touch, pen)
- `touchend`
- `keydown`, except Escape and browser shortcut keys

Explicitly **not** activation: `mousemove`, `wheel`, `scroll`, and — notably — **`touchstart` is not on the list**. Bind unlock to `pointerup` / `click` / `touchend` / `keydown`, not to `touchstart` or scroll.

### 1.2 Chromium (Chrome, Edge, Opera, Samsung Internet, Android WebView)

Chrome's own [autoplay policy documentation](https://developer.chrome.com/blog/autoplay) states the rules directly (primary; note the page carries a stale "last updated 2017-09-13" stamp but is Chrome's current canonical doc):

> - "Muted autoplay is always allowed."
> - Autoplay with sound is allowed when "the user has interacted with the domain (click, tap, etc.)", or on **desktop only** when "the user's Media Engagement Index threshold has been crossed", or when **"the user has added the site to their home screen on mobile or installed the PWA on desktop"**.
> - "Top frames can delegate autoplay permission to their iframes" via Permissions Policy.
>
> MEI criteria: media consumption > **7 seconds**, "audio must be present and unmuted", tab active, video dimensions > **200×140 px**.
>
> Web Audio has been covered by the policy since **Chrome 71** (media elements since Chrome 66): "If an AudioContext is created before the document receives a user gesture, it will be created in the 'suspended' state" and requires `resume()` after interaction.

The engine source agrees and adds the detail. From `third_party/blink/renderer/modules/webaudio/audio_context.cc` and `core/html/media/autoplay_policy.cc` (primary, Blink source):

- `AudioContext::AreAutoplayRequirementsFulfilled()` switches on the document's autoplay policy:
  - `kNoUserGestureRequired` → always allowed
  - `kUserGestureRequired` → requires `LocalFrame::HasTransientUserActivation()`
  - `kDocumentUserActivationRequired` → requires `AutoplayPolicy::IsDocumentAllowedToPlay()`
- `IsDocumentAllowedToPlay()` returns true if any ancestor frame `HasStickyUserActivation()` **or** `HadStickyUserActivationBeforeNavigation()`, or if the outermost main frame has high Media Engagement (MEI) and the `MediaEngagementBypassAutoplayPolicies` feature is on.
- **Once unlocked, it stays unlocked.** `MaybeAllowAutoplayWithUnlockType()` sets `user_gesture_required_ = false` permanently for that context, and `IsAllowedToStart()` short-circuits to `true` thereafter.
- **Installed PWA / standalone gets a free pass.** `AutoplayPolicy::GetAutoplayPolicyForDocument()` returns `kNoUserGestureRequired` when `document.IsInWebAppScope()` is true — matching Chrome's documented rule that autoplay with sound is allowed once "the user has added the site to their home screen on mobile or installed the PWA on desktop". Confirmed independently in Blink source and Chrome's docs. (No WebKit equivalent established — see §8.)
- **Prerender blocks it.** A context created while the document is prerendering sets `blocked_by_prerendering_` and does not start; it resumes on activation.
- **Hidden-frame interruption is real but scoped.** `should_interrupt_when_frame_is_hidden_` is `!CanPlayWhileHidden()`, and `CanPlayWhileHidden()` tests the `media-playback-while-not-visible` Permissions Policy. When active, `OnFrameHidden()` calls `StartContextInterruption()` → state becomes `"interrupted"`. This targets iframes an embedder has hidden (`display:none`, `visibility:hidden`, zero area), not a top-level page you own. Still: **if any audio ever lives inside an iframe, it can be silently interrupted.**
- The console warning text Chrome emits is literally *"The AudioContext was not allowed to start. It must be resumed (or created) from a user gesture event handler."*

`docs/media/autoplay.md` in [chromium/chromium](https://github.com/chromium/chromium/blob/main/docs/media/autoplay.md) (primary) describes the parallel per-element "user gesture lock" for `<audio>`/`<video>`: muted video bypasses it entirely; calling `play()` or `load()` from a gesture unlocks it.

### 1.3 WebKit (Safari macOS and iOS, and every iOS browser)

**First, a stale-lore warning.** The two WebKit blog posts everyone cites for "iOS autoplay rules" do not actually cover Web Audio:

- [New `<video>` Policies for iOS](https://webkit.org/blog/6784/new-video-policies-for-ios/) (**2016-07-25**) — I read it: it is entirely about `<video>` (silent/muted autoplay, `playsinline`, `play()` promises). It makes **no mention of the Web Audio API, of `<audio>` autoplay, or of the silent switch.** Ten-year-old, and not about our case.
- [Auto-Play Policy Changes for macOS](https://webkit.org/blog/7734/auto-play-policy-changes-for-macos/) (**2017-06-08**) — I read it: Safari 11 blocks "media elements with sound from auto-playing by default on most websites" via "an automatic inference engine", and gives users per-site control through the Websites preference pane / "Settings for This Website…". It also **does not mention Web Audio or `AudioContext`**, and it does not name the individual per-site options.

So: for Web Audio on WebKit, the blog is not a source. The source is the engine. From `Source/WebCore/Modules/webaudio/AudioContext.cpp` (primary, WebKit source, read 2026-09-01):

```cpp
static bool shouldDocumentAllowWebAudioToAutoPlay(const Document& document)
{
    if (document.isCapturing())
        return true;
    RefPtr mainDocument = document.mainFrameDocument();
    if (document.quirks().shouldAutoplayWebAudioForArbitraryUserGesture() && mainDocument && mainDocument->hasHadUserInteraction())
        return true;
    RefPtr window = document.window();
    return window && window->hasTransientActivation();
}
```

Three things follow, and they are the difference between working and not working on iPhone:

1. **WebKit requires `hasTransientActivation()`, not sticky activation.** `LocalDOMWindow::hasTransientActivation()` is `now < lastActivationTimestamp + transientActivationDuration()`. So the resume must happen *while the gesture is still fresh* — synchronously in the handler is the only safe thing. An `await` before `resume()` can lose the activation.
2. **The "any gesture, any time" behaviour exists only as a per-site quirk.** `Quirks::shouldAutoplayWebAudioForArbitraryUserGesture()` is a site-specific quirk list Apple maintains (`Source/WebCore/page/Quirks.cpp`). You are not on it.
3. **After the first successful start it is sticky for that context.** `willBeginPlayback()` calls `removeBehaviorRestriction(BehaviorRestrictionFlags::RequireUserGestureForAudioStartRestriction)` once it succeeds. So only the *first* unlock is gesture-bound.

The restriction is installed at construction: `if (!page || page->requiresUserGestureForAudioPlayback()) addBehaviorRestriction(RequireUserGestureForAudioStartRestriction);`

`AudioContext.cpp` also shows Web Audio is wired into `PlatformMediaSession`, receives `beginInterruption` / `endInterruption`, and responds to remote control commands (lock-screen play/pause). That is the mechanism behind the `"interrupted"` state below.

### 1.4 Firefox

MDN's autoplay guide documents the prefs (primary):

- `media.autoplay.block-webaudio` — default `true`. "If `true`, audio contexts are only able to play on pages once there has been **sticky activation**."
- `media.autoplay.default` — `0` allowed / `1` blocked / `2` prompt, default `0`.
- `media.block-autoplay-until-in-foreground` — default `true`; a background tab won't start audio until foregrounded.

Firefox is the only engine that ships `navigator.getAutoplayPolicy()`: **Firefox 112+, not in Chrome, not in Safari** ([mdn/browser-compat-data `api/Navigator.json`](https://github.com/mdn/browser-compat-data/blob/main/api/Navigator.json), primary, checked 2026-09-01). Treat it as a nice-to-have hint, never as the mechanism.

### 1.5 The table

| Environment | May make sound with no gesture? | What unlocks it | Gotchas |
|---|---|---|---|
| **Safari iOS 26.x / all iOS browsers** (all use WebKit) | No | `resume()` (or first `start()`) called **synchronously inside** a `click`/`pointerup`/`touchend`/`keydown` handler, while transient activation holds | **Ringer/silent switch mutes Web Audio** (§2). Backgrounding → state `"interrupted"`, needs re-`resume()`. Transient — not sticky — activation. `touchstart` is not an activation event. |
| **Safari macOS 26.x** | No (default) | Same transient-activation rule | Safari has a per-site Auto-Play preference (Websites pane / "Settings for This Website…", since Safari 11 — [WebKit blog 2017-06-08](https://webkit.org/blog/7734/auto-play-policy-changes-for-macos/), primary). **That post covers media elements only and never mentions Web Audio**, so whether the per-site setting also gates `AudioContext` is *not established* — assume it might. |
| **Chrome / Edge desktop** | No (default `kDocumentUserActivationRequired`) | Any sticky activation on the document, **or** high Media Engagement Index, **or** `HadStickyUserActivationBeforeNavigation` from the previous same-origin page | Prerendered pages blocked until activation. MEI means *your* dev machine may autoplay while visitors' don't — always test in a fresh profile. |
| **Chrome Android / Samsung Internet** | No (`kUserGestureRequired`) | Transient user activation (stricter than desktop Chrome) | Same as desktop otherwise |
| **Firefox desktop/Android** | No (`media.autoplay.block-webaudio=true`) | Sticky activation | Background tab won't start audio until foregrounded. Only engine with `getAutoplayPolicy()`. |
| **Installed PWA / home-screen (Chromium)** | **Yes** — `IsInWebAppScope()` ⇒ `kNoUserGestureRequired`; Chrome's docs say the same | n/a | Confirmed twice (Blink source + developer.chrome.com). Do not rely on it; and do not *use* it — autoplaying in standalone would violate the "opt-in sound" preference anyway. |
| **iOS standalone (Add to Home Screen)** | Unverified | — | Could not establish from WebKit source; assume the normal gesture rule. |
| **In-app webviews (Instagram, LinkedIn, X, Facebook)** | No | Gesture, same as the underlying engine | On iOS these are `WKWebView` → identical WebKit rules **plus** the ringer-switch problem, and these visitors are overwhelmingly on phones with the ringer off. On Android they are Chrome Custom Tabs or WebView, whose autoplay policy Chrome documents as differing from Chrome proper. **This is the single most likely first-visit environment for a personal site shared as a link, and it is the worst-case audio environment.** |

### 1.6 Lifecycle: the states you must handle

`BaseAudioContext.state` has four values in shipping browsers, per [MDN `BaseAudioContext.state`](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/state) (primary). **Note the standardisation gap flagged in §1.1: `"interrupted"` is in the Editor's Draft and in shipping WebKit/Blink, but in neither published W3C version.** Write code that tolerates an unknown fourth state either way.

- `suspended` — paused by *your* code (or never started). You fix it with `resume()`.
- `running` — normal.
- `interrupted` — paused by something **outside your control**; the browser decides when to resume. Causes listed: another app taking exclusive audio (a phone call), the user closing the laptop lid, Audio Session interruptions.
- `closed`.

MDN documents the iOS case explicitly, with this exact remedy:

> In iOS Safari, when a user leaves the page (e.g., switches tabs, minimizes the browser, or turns off the screen) the audio context's state changes to `"interrupted"` and needs to be resumed.

Transition subtleties that matter (same page, primary): `suspend()` during an interruption → immediately `suspended`; `resume()` on a suspended context during an interruption → immediately `interrupted`; an interruption arriving while already `suspended` does **not** transition to `interrupted` (deliberate, to avoid leaking "the user closed their laptop" to the page). Blink's `StartContextInterruption()` has the same privacy carve-out in the source.

**Practical consequence:** you cannot treat `state === "running"` as "the user is hearing this", and you cannot assume a context that worked once still works after a tab switch. Subscribe to `statechange` and re-arm.

### 1.7 Exactly what the code must do

```js
// One module-scope context, created lazily — never at import time.
let ctx = null;

function unlock() {                    // MUST be called synchronously from the handler
  if (!ctx) ctx = new AudioContext();  // creating inside the gesture is the safest form
  if (ctx.state !== "running") ctx.resume();   // no await before this line
  // iOS ringer-switch fix — see §2
  if ("audioSession" in navigator) navigator.audioSession.type = "playback"; // ONLY if you mean it
}

button.addEventListener("click", unlock);          // pointerup/touchend/keydown also fine
// NOT touchstart, NOT scroll, NOT mousemove.

// Re-arm after interruptions (iOS backgrounding, phone calls, lid close):
ctx?.addEventListener("statechange", () => {
  if (ctx.state === "interrupted" || ctx.state === "suspended") {
    // do not auto-resume blindly; surface the "sound is paused" affordance again
  }
});
```

Hard rules distilled:

1. **Never construct `AudioContext` at module load / in a React `useEffect` on mount.** Chrome logs a warning; Safari leaves you with a dead context and no error. Construct or resume inside the gesture.
2. **No `await` between the gesture and `resume()`.** Fetching and decoding samples first will lose WebKit's transient activation. Decode after, or decode ahead of time and resume first.
3. **Bind to `click` / `pointerup` / `touchend` / `keydown`.** Not `touchstart`, not `scroll`, not `mousemove`, not hover.
4. **`resume()` returns a promise — but resolution ≠ audible.** Check `ctx.state` after, and handle `interrupted`.
5. **Listen for `statechange` for the life of the page** and re-show the enable affordance when the context leaves `running`.
6. **Only one `AudioContext` for the whole app.** MDN: "It's recommended to create one AudioContext and reuse it"; Blink counts `hardware_context_count` and WebKit throws `QuotaExceededError` past a platform max.
7. **Assume the first paint has no audio, always.** SSR'd HTML must be complete and meaningful without it (this is also the map's SEO/GEO screen).

---

## 2. The iOS silent-switch trap (highest-priority hazard)

**The mechanism, from primary docs.** MDN's Audio Session API page states the `"auto"` type-selection rule (primary, [MDN Audio Session API](https://developer.mozilla.org/en-US/docs/Web/API/Audio_Session_API)):

> - an `AudioContext` defaults to `"ambient"`
> - an `HTMLMediaElement` (such as `<audio>` or `<video>`) defaults to `"playback"`
> - a microphone `MediaStreamTrack` … defaults to `"play-and-record"`

And the type semantics ([MDN `AudioSession.type`](https://developer.mozilla.org/en-US/docs/Web/API/AudioSession/type), primary): `"ambient"` is "audio that can mix with other types of audio"; `"playback"` is "an exclusive type that will pause other playback audio on the device".

On iOS, `ambient` maps to a session category that **respects the hardware ringer/silent switch**. So:

> **A page whose only sound source is Web Audio is silent on an iPhone with the ringer switch off — while reporting `state === "running"` and advancing `currentTime`.** A page using an `<audio>` element is not.

**Confirmed by Apple's own engineer.** [WebKit bug 237322, "webaudio api is muted when the iOS ringer is muted"](https://bugs.webkit.org/show_bug.cgi?id=237322) (primary, read 2026-09-01) — reported 2022-03-01, **RESOLVED / CONFIGURATION CHANGED on 2024-09-25**, closed by WebKit media engineer Jean-Yves Avenard with:

> "Since iOS 17, you can set the audio session type to 'playback'. Add in your code something like `navigator.audioSession.type = 'playback'` and audio will not be suspended."

i.e. WebKit's position is that this is *not a bug to fix in the engine* — it is the documented default, and the Audio Session API is the sanctioned control. Also corroborated by [feross/unmute-ios-audio](https://github.com/feross/unmute-ios-audio) (primary, README + source read): "On Safari for iOS, audio is allowed to play when the device's mute switch is enabled, but only for HTML5 audio tags, and not for Web Audio."

### The two fixes

**(a) Modern — Audio Session API.** `navigator.audioSession.type = "playback"`.

- API present since **Safari 16.4** (2023-03-27), whose release notes list "Support for a **subset** of the AudioSession Web API" — [WebKit blog, Safari 16.4](https://webkit.org/blog/13966/webkit-features-in-safari-16-4/) (primary). BCD agrees: safari 16.4, safari_ios mirrors it; **not in Chrome**; Firefox preview ([mdn/browser-compat-data `api/AudioSession.json`](https://github.com/mdn/browser-compat-data/blob/main/api/AudioSession.json), primary, checked 2026-09-01).
- The *ringer-bypass behaviour specifically* is attested by Avenard as working **"since iOS 17"** (bug 237322). Safari 17.0's release notes do not mention it. **Treat iOS 17 as the floor for this fix**, and keep fallback (b) for anything older.
- Since the problem exists only on WebKit, WebKit-only support is full coverage of the problem.

**(b) Legacy fallback — the silent `<audio>` loop.** `unmute-ios-audio`'s technique, read from source: on the first activation event, create an `<audio>` element with `x-webkit-airplay="deny"`, `loop`, `preload="auto"`, `src` set to a ~7-sample silent WAV as a `data:` URI, and `.play()` it; simultaneously create the `AudioContext` and start a 1-frame silent buffer. The live `<audio>` element promotes the page's session from `ambient` to `playback`. Same idea in [swevans/unmute](https://github.com/swevans/unmute) (primary repo, verified to exist).

### The design decision this forces — and it is not obvious

`"playback"` is **exclusive**: it pauses whatever the visitor is already listening to. For a personal site whose audio is decorative, hijacking someone's podcast is a far worse offence than being silent. Given the standing preference "sound is opt-in, never autoplay-hostile":

> **Recommendation: do not set `"playback"` unconditionally.** Keep the default `"ambient"` session (mixes politely, respects the silent switch). Instead, **detect the inaudible case and say so**: after the user opts in, if the context is `running` but an `AnalyserNode` reads silence for ~500 ms while you know you're driving signal, show *"Your phone is on silent — flip the ringer switch"* rather than forcing the audio through. If you ever do want `"playback"`, set it only in direct response to the user's explicit "sound on" gesture, never on load.

That inaudibility probe is itself a differentiator — almost no site tells you why it's quiet.

---

## 3. Capability and cost on a phone

### 3.1 The real-time budget

The spec fixes the render quantum: "The number of sample-frames in a block is called **render quantum size** … Its default value is 128" ([`index.bs`](https://github.com/WebAudio/web-audio-api/blob/main/index.bs), primary; `renderSizeHint` can change it). At a typical 48 kHz phone sample rate, 128 frames = **2.67 ms of audio must be produced in under 2.67 ms of wall clock**, every time, forever. Paul Adenot (Firefox Web Audio implementer, Web Audio spec editor) puts it plainly in [Web Audio API performance and debugging notes](https://padenot.github.io/web-audio-perf/) (primary source authored by an implementer; last substantive update 2018, one typo fix 2020 — **date-flag: parts are stale**, e.g. it says WebAssembly is "soon"):

> "Under-runs usually occur when the audio rendering thread did not make its deadline. For example, it took more than 5 milliseconds of processing to process 5 milliseconds of audio."

Missing it produces clicks/dropouts, which read as "broken", not "lo-fi".

### 3.2 Node-by-node cost (all from `web-audio-perf`, primary)

| Node | Cost | Notes |
|---|---|---|
| `GainNode` | Essentially free (Gecko folds fixed gain lazily); cheap elsewhere. **Automating it costs more** — automation forces per-sample application in all browsers. | Stateless, no memory |
| `OscillatorNode` | Cheap in steady state (linear interpolation between wavetables). **Initial cost when changing waveform**, and "when the frequency changes, new tables have to be computed" | The workhorse for procedural audio |
| `BiquadFilterNode` | "Relatively cheap — five multiplications and four additions per sample" | 2 frames latency; variable tail with resonance |
| `IIRFilterNode` | Cheap; scales with coefficient count | 1 frame latency per coefficient |
| `StereoPannerNode` | Cheap, stateless | **Use this for stereo movement** |
| `PannerNode` `equalpower` | "Rather cheap" — vector math + gain | |
| `PannerNode` `HRTF` | **"Very expensive."** Continuous convolution against HRTF impulses; while moving, "there can be four convolvers processing at once" for a stereo source. Loads an HRTF database (unconditionally in Blink/WebKit). | **Do not ship HRTF spatial audio to phones.** |
| `ConvolverNode` (reverb) | **"Very expensive"**, scaling with impulse length; copies the whole impulse buffer | Adenot's explicit mobile advice: build reverb from "delay lines, all-pass and low-pass filters" instead — cheaper *and* parameterisable |
| `DynamicsCompressorNode` | "Not too expensive" | Fixed **6 ms look-ahead latency** |
| `AnalyserNode` | FFT per call — "expensive to compute", cost grows with `fftSize`. `getByteFrequencyData` is **not** cheaper than the float version; it's the float result quantised. | Budget carefully if driving visuals |
| `AudioBufferSourceNode` | Resamples to the context rate: linear (cheap, low quality) in Blink/WebKit; higher-quality + latency in Gecko | Pre-resample your assets to avoid it |
| `ScriptProcessorNode` | Deprecated; Gecko uses a main-thread message queue, Blink buffer ping-pong: "the former is more reliable against dropouts but can have higher latency … the latter drops out more easily" | **Never use.** |

**`AudioParam` scheduling is a real cost centre.** Adenot: non-Gecko engines do a *linear scan* of the event list to find the right event, so an app that schedules a lot of automation events develops performance problems over time. His mitigation: since `GainNode` is cheap to create, **periodically swap in a fresh node with an empty event list** rather than accumulating thousands of events on one param. Also: "it is even more efficient to not use `AudioParam` if not necessary" — setting `.value` directly lets engines take a constant-for-this-block fast path.

**k-rate vs a-rate:** a-rate params are computed per sample, k-rate once per 128-frame block. Prefer k-rate where the spec allows it.

### 3.3 AudioWorklet vs ScriptProcessor, and React contention

- `AudioWorklet` support: **Chrome 66, Firefox 76, Safari 14.1** ([BCD `api/AudioWorklet.json`](https://github.com/mdn/browser-compat-data/blob/main/api/AudioWorklet.json), primary). Universally available in 2026.
- The decisive property: worklet code runs **on the audio rendering thread**, not the main thread. Your React 19 renders, hydration, Tailwind layout thrash, and long tasks **cannot** cause audio dropouts from a worklet graph — whereas `ScriptProcessorNode` ran on the main thread and was hostage to exactly that. Chrome's [Audio Worklet announcement](https://developer.chrome.com/blog/audio-worklet) (primary, published 2017-12-14; shipped Chrome 64, on by default in Chrome 66) states it directly: "Audio Worklet keeps the user-supplied JavaScript code all within the audio processing thread", whereas with `ScriptProcessorNode` "the event handling is asynchronous by design, and the code execution happens on the main thread. The former induces the latency, and the latter pressures the main thread."
- **But the main thread still matters in two places:** (a) anything that *schedules* audio from JS — a `setTimeout`/`requestAnimationFrame` note scheduler — is subject to main-thread jank, so schedule ahead using `ctx.currentTime` + `AudioParam` events rather than firing notes "now"; (b) anything that *reads* audio to drive visuals (`AnalyserNode` in a rAF loop) competes with React. Keep the audio→visual link one-directional and cheap.
- Worklet JS rules from `web-audio-perf` (primary): typed arrays (`Float32Array`) only and reuse them; keep the working set small; **no DOM access or prototype mutation inside `process()`** (invalidates JIT); stay monomorphic. WASM in a worklet is the fastest option if you ever need it.

### 3.4 Latency

- `latencyHint` options and their meaning, from the spec (primary): `"interactive"` = "lowest audio output latency possible without glitching. **This is the default**"; `"balanced"` = balance latency and power; `"playback"` = "prioritize sustained playback without interruption over audio output latency. **Lowest power consumption**."
- `baseLatency` = processing latency from the destination node into the OS audio subsystem. MDN's illustrative values: `0.00` for the default interactive context, `0.15` for `latencyHint: "playback"` ([MDN `AudioContext.baseLatency`](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/baseLatency), primary). Support: Chrome 58, Firefox 70, **Safari 14.1**.
- `outputLatency` = additional OS→speaker latency. Support: Chrome 102, Firefox 70, **Safari 18.4** (BCD, primary) — so it's only now broadly readable on iOS. Read it, don't assume it.
- **Design implication:** if a gesture triggers a sound *and* a visual, the visual will land first on a phone. If tight audio-visual sync matters, drive the visual from `ctx.currentTime` (with `outputLatency` compensation), not from the event.
- **I could not find a credible primary source for concrete end-to-end latency numbers on specific mid-range Android phones.** Android output latency is device- and OEM-dependent and historically much worse than iOS. Measure `baseLatency + outputLatency` on the target device rather than trusting a figure. (§8)

### 3.5 Battery, CPU, thermal

No primary source gives per-device battery figures for Web Audio, and I will not invent any. What is established:

- The audio rendering thread is **"often very high priority (usually the highest priority on the system)"** (`web-audio-perf`, primary). A permanently-running generative graph therefore keeps a high-priority thread and the audio hardware awake continuously — this is a real, sustained drain, unlike a one-shot sample.
- `AudioContext.suspend()` "suspends the progression of time in the audio context, **temporarily halting audio hardware access and reducing CPU/battery usage in the process**" ([MDN `AudioContext`](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext), primary). This is the documented battery lever: **suspend when nothing should be audible; don't leave a silent graph running.**
- Cost is roughly proportional to number of active nodes × automation events × any FFT/convolution. The expensive things (HRTF, convolution reverb, large `AnalyserNode` FFT) are exactly the "impressive" things, so they are the first to cut on mobile.
- Backgrounding: iOS gives you `"interrupted"` and stops the work for you. Chrome only interrupts hidden *frames* under the `media-playback-while-not-visible` policy — a top-level page you own keeps rendering audio while hidden. **Handle `visibilitychange` yourself and `suspend()`.** This is both a battery fix and a courtesy fix (nobody wants a background tab humming).

### 3.6 What procedural/generative audio can comfortably do on a mid-range phone

Comfortable, on the evidence above: a handful of `OscillatorNode`s with envelopes, a couple of `BiquadFilterNode`s, `StereoPannerNode`, a delay-line reverb, one modest `AnalyserNode`, event-driven note scheduling. That is a full synthesiser voice architecture and is plenty for a signature interaction.

Uncomfortable: HRTF spatialisation, long convolution reverb, dozens of simultaneous voices, thousands of queued `AudioParam` events, per-sample JS DSP without a worklet.

---

## 4. Libraries vs raw Web Audio — measured

All sizes below I measured myself in this session by downloading tarballs from `registry.npmjs.org` and running `gzip -9` / bundling with esbuild (`--bundle --minify --format=esm`). **Primary measurements.**

| Option | Size | What it buys |
|---|---|---|
| **Raw Web Audio API** | **0 KB** | Everything below is built on it. Oscillators, filters, envelopes via `AudioParam`, delay, panning, analysis, `AudioWorklet`. |
| **Tone.js** `15.1.22` (dist-tag `latest`, published **2025-04-27**) | Prebuilt UMD `build/Tone.js`: **345,500 B raw / 79,213 B gzip**.<br>esbuild, `import * as Tone`: 348,864 B / **82,617 B gzip**.<br>esbuild, `{Synth, PolySynth, getDestination, start, getTransport}`: 241,463 B / **61,904 B gzip**.<br>esbuild, `{Oscillator, Gain, getContext}`: 237,075 B / **60,849 B gzip**. | Musical time (`Transport`, `"8n"` notation), sample-accurate look-ahead scheduling, prebuilt synths (FM/AM/Noise/Mono/Poly), effects, envelopes — as advertised on [tonejs.github.io](https://tonejs.github.io/) (primary, fetched 2026-09-01), which also states plainly that "Browsers will not play any audio until a user clicks something" and that `Tone.start()` must be called from a user-gesture listener. **Tone does not solve the gesture problem for you.** **Tree-shaking barely helps** — importing three symbols still costs ~60 KB gzip, because `standardized-audio-context` (a declared dependency, `^25.3.70`) comes along wholesale. |
| **howler.js** `2.2.4` (published 2023-09-19) | `howler.core.min.js`: 26,924 B raw / **7,951 B gzip**. Full `howler.min.js`: 36,173 B / **9,709 B gzip**. | Sample playback, sprites, fades, cross-browser unlock handling, pooling. **No synthesis at all.** |
| **standardized-audio-context** | (pulled in by Tone; not measured standalone) | Spec-conformance shim across engines. MDN recommends it for cross-browser gaps. |
| **@elemaudio/web-renderer** `4.0.3` (published 2024-12-21) | 988,413 B unpacked, 6 files | Functional/declarative DSP graph compiled to a worklet. Powerful; heavy; overkill here. [elemaudio/elementary](https://github.com/elemaudio/elementary) is alive (512★, pushed 2026-01-19). |
| `mohayonao/pico.js` | — | **Dead.** Last push **2015-12-29**. Do not cite it as a current option. |

**Tone.js release-health note (primary, npm dist-tags):** `latest` is `15.1.22` from 2025-04-27, while `next` is at `15.5.36` (2026-08-07). Stable Tone.js has not moved in ~16 months as of today. Not disqualifying, but worth knowing before adopting.

### Recommendation: **raw Web Audio.**

One-line reason: **Tone.js costs ~60 KB gzip that you cannot tree-shake away, and buys musical-time scheduling and prebuilt synth presets that a signature interaction on a personal site does not need — while raw Web Audio costs nothing, and the ~150 lines of oscillator/envelope/filter code you'd write instead *is* the signature interaction, not boilerplate around it.**

Supporting reasons:
- The site is a TanStack Start app whose whole value proposition includes being fast and server-rendered. 60–80 KB of gzip for decoration is a bad trade against the "never blocking" screen.
- Every hard part of this project — gesture unlocking, the iOS ringer switch, `interrupted` handling, suspend-on-hide — is something you must implement and reason about **yourself regardless of library**. Tone.js does not solve any of them for you.
- Adenot's optimisation advice (swap gain nodes to keep event lists short, avoid `AudioParam` when a constant will do, delay-line reverb over convolution) requires direct control of the graph. A framework in the way makes those harder.

**When to revisit:** if the concept turns out to need musical sequencing — a real transport, tempo, quantised notes, multiple synchronised parts — Tone.js's `Transport` and look-ahead scheduler genuinely are worth the 60 KB, and rewriting them is a trap. Decide that *before* prototyping, not during.

**Do not use howler.js** for this project: it is excellent at sample playback and does nothing generative — and if the concept is just sample playback, the concept isn't rare (§5).

---

## 5. What's actually out there, and what would be rare

### The common baseline (what "sound on a portfolio site" means today)

Grounded in what I can verify rather than in trend-piece prose:

1. **A speaker icon in a corner toggling a background loop.** This is the *documented default*: MDN's own Web Audio best-practices page tells you to give users play/stop and volume/mute controls ([primary](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices)). It is the pattern the platform steers everyone into.
2. **Hover/click UI blips** — a small sample library, played via howler.js or an `AudioBufferSourceNode` pool. That howler's non-synthesis feature set (sprites, pooling, fades) is the *entire* API of the most popular web-audio library is itself evidence of what the median sound-bearing site does.
3. **A scored intro/loader** — music under a scroll-driven or WebGL intro sequence, cut on a mute button.
4. **`AnalyserNode` → bars/blob visualiser** on top of a track.
5. Awwwards maintains a dedicated [Sound-Audio](https://www.awwwards.com/websites/sound-audio/) category — i.e. sound as a site-design *genre* is established and judged. I fetched it (2026-09-01): it is a mixed bag of brand and campaign sites (Spotify Wrapped Party, Santioni Spirits, Mad Dogs Design Concept, No Art…), not a concentration of personal portfolios, and the listing does not expose implementation detail. **Treat this as evidence the genre exists, not as evidence about technique.**

**All five are "audio playback attached to a site."** None is generative, none responds to what the visitor specifically does, and all degrade to "the site with the annoying music off".

### What reads as genuinely rare

The rare axis is not fidelity or production value — it's **whether the sound is computed from the visitor's own behaviour in real time**. The landmark browser sound toys did exactly that.

[Patatap](https://patatap.com/) (fetched 2026-09-01, primary) describes itself as "a portable animation and sound kit" where you "create melodies charged with moving shapes" — by jonobr1 (Jono Brandel) and Lullatone, built on Two.js. Two things in it are directly instructive for this project:

- **Audio and visuals are generated together from the same trigger** — every keypress/touch produces a paired sound *and* shape. That is exactly shape B in §6.
- **There is no start screen or "enable sound" prompt.** The first keypress is simultaneously the interaction *and* the gesture that unlocks audio. The unlock is invisible because it is fused with the thing the visitor came to do — the best available answer to "how do you ask permission without a nagging modal".

Also in this lineage: [Typatone](https://typatone.com/) (same authors — your typing composes a melody), Chrome Music Lab, Ableton *Learning Synths* `[secondary — named from search; not inspected]`. What they all share: **the audio is an output of the interaction, not an accompaniment to it.**

Concretely, on a personal site in 2026, these would read as rare:

- **Synthesis, not samples.** Nothing to download; the timbre is generated. Instantly distinguishable — synthesised sound has no loop point and never repeats identically.
- **The visitor's input is the score.** Cursor position, typing, scroll velocity, dwell time, the order they read sections — mapped to pitch/filter/rhythm. Everyone's visit sounds different; nobody's is a soundtrack.
- **Sound as an information channel, not decoration.** Different content types sound different, so the page has an audible *shape*. (This one also survives the mute test best — see §6.)
- **Honest handling of the silent phone.** Telling an iPhone visitor "your ringer switch is off" is something I found essentially no site doing, and it is the difference between "clever" and "broken" for a large fraction of mobile visitors.
- **A shareable artefact.** If a visit generates something audible you can capture (`MediaStreamAudioDestinationNode` / `OfflineAudioContext` render), the concept has a distribution mechanism. This raises build cost significantly; flag as stretch.

Not rare, despite feeling fancy: background ambient loop with a mute button; hover blips; a waveform visualiser over a track; HRTF "spatial audio" (also a bad mobile idea, §3.2).

Sibling ticket #2 covers the general common/rare landscape; the sound-lane summary is: **playback is common, synthesis-from-interaction is rare.**

---

## 6. The mute-office problem

The constraint stack: sound is opt-in; the hard screen says weird but **never blocking**; a server-rendered semantic document must exist underneath; touch is first-class. And empirically, the *majority* of visitors will never enable audio — a personal site is most often opened from a social in-app browser, on a phone, with the ringer off, in a room with other people. **Design for the muted visitor as the default case, not the fallback.**

### The options

| Shape | What it is | Trade-off | Verdict |
|---|---|---|---|
| **A. Amplifier** — the silent experience is complete; sound adds a layer | Every interaction is fully legible visually/textually; audio is a parallel channel that makes it richer | You can never put information *only* in the sound, which caps how central sound can be | **Recommended.** Only shape that passes "never blocking" unconditionally. |
| **B. Synaesthetic substitute** — the same generative system drives visuals and audio from one signal source | The muted visitor sees the composition; the unmuted visitor hears and sees it | Highest build cost; the visual must stand alone artistically, which is a second design problem | **Recommended as the *form* A takes.** This is the strong version of A. |
| **C. Reward for opt-in** — silent path is complete and ordinary; sound unlocks a distinct extra | Clean separation; passes the screen easily | The site's "signature interaction" is then invisible to most visitors — you built the swing-hard thing for a minority. Directly at odds with the ambition. | Rejected as the primary shape; fine for a small bonus. |
| **D. Sound-first with a transcript/caption fallback** | Audio carries meaning; a text equivalent is provided | The fallback is an accessibility patch, not an experience. Reads as apologetic. | Rejected. |
| **E. Sound-gated** — you must enable audio to proceed | — | Fails "never blocking" outright. Also fails for deaf visitors and for anyone whose phone is on silent. | **Disqualified by the map.** |

### Recommendation

**Build shape B — one generative system, two rendering targets.** A single stream of parameters, derived from what the visitor does (pointer/scroll/typing/dwell/section), is rendered simultaneously as (1) a visual that is complete and satisfying on its own, and (2) synthesised audio for whoever opts in. Sound is never the only renderer of anything.

Why this survives every screen:

- **Never blocking:** the muted visitor gets 100% of the information and a complete aesthetic experience. Email and work links are plain, server-rendered, always-visible links, unaffected by any of it.
- **SEO/GEO:** the parameter stream is derived from a document that already exists in the HTML. The audio layer is progressive enhancement on top of semantic markup — nothing about the concept requires JS to convey content.
- **Touch first-class:** touch produces the same parameter stream as pointer. In fact touch is the *better* input here — `pointerup`/`touchend` is a qualifying gesture, so the first tap can both interact and unlock audio in one motion.
- **Opt-in, never autoplay-hostile:** the audio layer starts only on an explicit gesture. A muted visit is a first-class visit, not a degraded one.
- **Still rare:** the rareness lives in *"my behaviour is being turned into a composition"* — which is visible even when it is inaudible.

**The opt-in affordance should be honest about what it offers.** Not a speaker icon (which promises "background music you'll want to turn off"). Something closer to *"listen to this page"* — a promise that the sound is *of* the page, not *over* it. And when it's enabled on a silenced iPhone, say so (§2).

**Better still, fuse the unlock into the first interaction** — the Patatap move (§5). Because `pointerup`/`touchend`/`click`/`keydown` all qualify as activation, the visitor's *first natural interaction with the piece* can be the gesture that unlocks audio. That removes the permission modal entirely, which is both less blocking and rarer. The honest version needs a visible, persistent, reversible sound control as well (so the visitor knows sound came on and can kill it in one tap) — but it should be a *status/undo* control, not a gate.

---

## 7. Design constraints for the prototype

**Must:**

1. Ship a complete, server-rendered, semantic document that conveys everything without audio and without client JS. Email and work links reachable in one obvious action, always.
2. Create/resume the single `AudioContext` **synchronously inside** a `click`/`pointerup`/`touchend`/`keydown` handler. No `await` before `resume()`.
3. Keep exactly one `AudioContext` for the app's lifetime; never construct at import or on mount.
4. Subscribe to `statechange`; handle `interrupted` (iOS backgrounding, calls, lid close) by re-showing the enable affordance.
5. `suspend()` on `visibilitychange` → hidden, and whenever nothing should be audible. Resume on return.
6. Detect the iOS-silent case (context `running` but `AnalyserNode` reads silence while you're driving signal) and tell the visitor about the ringer switch.
7. Synthesise (oscillators + envelopes + biquad + stereo panner + delay-line reverb). Zero audio asset downloads.
8. Drive audio-visual sync from `ctx.currentTime` (+ `outputLatency` when available), not from DOM event time.
9. Schedule ahead with `AudioParam` events; swap in fresh `GainNode`s periodically to keep event lists short.
10. Test on: real iPhone with ringer OFF, real iPhone with ringer ON, Instagram in-app browser on iOS, Chrome Android, and a fresh (zero-MEI) desktop Chrome profile.

**Must not:**

11. Autoplay anything, in any browser, in any install mode — including where Chromium's `IsInWebAppScope()` would technically permit it.
12. Bind unlock to `touchstart`, `scroll`, `mousemove`, or hover.
13. Use `ScriptProcessorNode`, HRTF `PannerNode`, or `ConvolverNode` reverb on mobile.
14. Put audio inside an iframe (invites `media-playback-while-not-visible` interruption).
15. Set `navigator.audioSession.type = "playback"` on load — it pauses the visitor's own music. Only in direct response to an explicit opt-in, if at all.
16. Put any information, navigation, or content **only** in the audio channel.
17. Ship Tone.js unless the concept genuinely needs a musical transport (decide before building; ~60 KB gzip minimum, not tree-shakeable).
18. Leave a graph running while the tab is hidden.

**Build-effort estimate for a sound-central signature interaction** (raw Web Audio, shape B):

| Piece | Estimate |
|---|---|
| Unlock/lifecycle module (gesture, `statechange`, interrupted, suspend-on-hide, iOS silence probe) | 0.5–1 day — *do this first, it is where all the platform pain lives* |
| Synth voice architecture (osc + ADSR + filter + panner + delay reverb, polyphonic, node recycling) | 1 day |
| Parameter stream: interaction → musical/visual parameters (the actual design work; expect several iterations) | 1–2 days |
| Visual renderer that stands alone | 1–2 days |
| SSR/semantic layer + always-visible contact path | 0.5 day |
| Real-device testing and mobile perf tuning | 0.5–1 day |
| **Total** | **~4.5–7.5 days** — a weekend gets a convincing prototype of the interaction; the polished, device-tested version is a week. |

Add ~1–2 days if a shareable/recordable artefact (`OfflineAudioContext` render + download/share) is in scope.

---

## 8. Open questions and gaps

**Possible future tickets:**

- **Does iOS standalone (Add to Home Screen) relax the gesture requirement?** Chromium explicitly does (`IsInWebAppScope()` ⇒ `kNoUserGestureRequired`); I could not find the WebKit equivalent. Only matters if a PWA path is ever considered.
- **What are real `baseLatency + outputLatency` figures on target devices?** Needs measurement on hardware, not research. Note `outputLatency` only landed in Safari 18.4, so older iOS gives you nothing to read.
- **Accessibility of a synaesthetic concept.** `prefers-reduced-motion` has an obvious mapping to the visual layer; there is no `prefers-reduced-sound`. What does the concept do for a visitor who wants neither the motion nor the sound? Worth its own ticket.
- **Does the parameter stream need a backend?** If a "shareable artefact" is in scope, that's the first thing on this site that might *earn* a backend. Currently out of scope.
- **Does the concept need musical time?** This is the go/no-go on Tone.js and should be settled before the prototype starts.

**Genuinely not established (not a network problem — the sources don't say):**

- **Does Safari's per-site Auto-Play preference gate `AudioContext`, or only media elements?** The WebKit post announcing it covers media elements only and never mentions Web Audio. A macOS Safari user who set "Never Auto-Play" for the domain may or may not be able to hear a gesture-unlocked `AudioContext`. Needs a device test.
- **Does iOS standalone (Add to Home Screen) relax the gesture requirement,** the way Chromium's `IsInWebAppScope()` does? No WebKit equivalent found in source or docs. Assume not.
- **Concrete end-to-end latency on specific mid-range Android devices.** Device- and OEM-dependent; no source gives trustworthy figures. Measure `baseLatency + outputLatency` on hardware. (`outputLatency` only reached Safari in 18.4, so older iOS gives you nothing to read.)
- **Battery and thermal cost of a sustained Web Audio graph on a phone.** No source I found — including Chrome's, WebKit's, and Adenot's — publishes measurements. §3.5 is structural reasoning plus MDN's documented statement that `suspend()` reduces CPU/battery usage. **Treat any specific mAh or °C figure you encounter elsewhere as unfounded.** If this becomes decision-relevant, it needs a measurement session on a real device, not more reading.
- **`web-audio-perf` is dated.** Last substantive update 2018 (typo fix 2020). The node-cost *rankings* (HRTF and convolution expensive; gain/biquad/panner cheap) are structural and still hold; specific engine implementation claims may not.
- **§5's characterisation of "the common baseline" is inference, not a survey.** I verified Patatap and the Awwwards category directly and read MDN/howler as evidence of what the platform and the most-used library steer people toward. I did **not** audit a sample of personal portfolio sites. If the common/rare split is load-bearing for the concept decision, sibling ticket #2 should do that survey properly.

**Possible follow-up tickets** are listed above under "Possible future tickets".
